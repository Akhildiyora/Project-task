import dotenv from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { supabase } from "./supabase.js";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcrypt";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";

dotenv.config();
const googleCient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const jwtSecret = process.env.JWT_SECRET!;
const app = new Hono();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

app.get("/", (c) => c.text("working"));

app.post("/register", async (c) => {
  const { name, email, password } = await c.req.json();
  const userSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
  });
  const result = userSchema.safeParse({ name, email, password });
  if (!result.success) {
    return c.json({ error: "Invalid input data", details: result.error.issues }, 400);
  }
  const user = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
    if (user.error){
      console.error("Error fetching user:", user.error);
      return c.json({ message: "Database error"}, 500);
    }
  if (user.data) {
    return c.json({ message: "User already exists" }, 400);
  }

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from("users").insert({ name, email, password: hash, role: "user" });
  console.log("INSERT RESULT", data);
  console.log("INSERT ERROR", error);
  if (error) {
    return c.json({ message: "Error registering user", error }, 500);
  }
  return c.json(
    { success: true, message: "User registered successfully" },
    201,
  );
});

app.post("/login", async (c) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues }, 400);
  }
  const { email, password } = parsed.data;
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error || !user || !user.password) {
    return c.json({ message: "Invalid credentials" }, 400);
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return c.json({ message: "Invalid credentials" }, 401);
  }
  const token = await sign(
    { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 7200 },
    jwtSecret,
  );

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7200,
    path: "/",
  });

  return c.json({
    message: "Login successful",
    token: token,
    user: user
  });
});


app.post("/google-login", async (c) => {
  try {
  const { token } = await c.req.json();
  if (!token) {
    return c.json({ message: "Token is required" }, 400);
  }
  const ticket = await googleCient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if(!payload || !payload.email) {
    return c.json({ message: "Invalid google token payload" }, 401);
  }
  const { email, name, sub: googleId, email_verified } = payload;
  if (!email || !email_verified) {
    return c.json({ message: "Email is not verified" }, 401);
  }

  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ name, email, google_id: googleId, role: "user" })
      .select("*")
      .single();
      if (insertError || !newUser) {
        console.error("Error creating user:", insertError);
        return c.json({ message: "Error creating user" }, 500);
      }
    user = newUser;
  }
  const appToken = await sign(
    { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 7200 },
    jwtSecret,
  );

  setCookie(c, "token", appToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
    maxAge: 7200,
    path: "/",
  });
  
  return c.json({
    message: "Google authentication successful",
    user: user
  });

} catch (error) {
  console.error("Google login error:", error);
  return c.json({ message: "Google authentication failed"}, 500);
}
});

const authMiddleware = async (c: any, next: any) => {
  let token = getCookie(c, "token");

  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }
  try {
    const payload = await verify(token, jwtSecret, 'HS256' as any);
    c.set("jwtPayload", payload);
    await next();
  } catch (err) {
    return c.json({ error: "invalid token" }, 401);
  }
};

const adminMiddleware = async (c: any, next: any) => {
  const payload = c.get("jwtPayload");
  if (!payload || payload.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }
  await next();
};

app.get("/dashboard", authMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.sub)
    .maybeSingle();
  if (error || !data) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json({ message: "Welcome to the dashboard", user: data });
});

app.get("/logout", async (c) => {
  deleteCookie(c, "token")
  return c.json({ message: "Logged out successfully" });
});

app.get("/me", async (c) => {
  let token = getCookie(c, "token");
  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return c.json({ user: null });
  }

  try {
    const payload = await verify(token, jwtSecret, 'HS256' as any) as any;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", payload.sub)
      .maybeSingle();

    if (error || !data) {
      return c.json({ user: null });
    }
    return c.json({ user: data });
  } catch (err) {
    return c.json({ user: null });
  }
});

// Projects API
app.get("/projects", authMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    // .eq("user_id", user.sub);
  
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/projects/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("jwtPayload");
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    // .eq("user_id", user.sub)
    .single();
  
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/public/projects/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("jwtPayload");
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.post("/projects", authMiddleware, adminMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const { name, description, dueDate, members, logo } = await c.req.json();
  
  const { data, error } = await supabase
    .from("projects")
    .insert({ 
      project_name: name, 
      description, 
      due_date: dueDate, 
      user_id: user.sub,
      members: members,
      images: logo
    })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.post("/upload-images", authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    
    if (!file || typeof file === "string") {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `Gallery/${fileName}`;

    const { data, error } = await supabase.storage
      .from("Images")
      .upload(filePath, file);

    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ error: "Failed to upload to storage" }, 500);
    }

    // Since the bucket isn't public, generate a signed URL valid for 1 year (31536000 seconds)
    const { data: signedData, error: signError } = await supabase.storage
      .from("Images")
      .createSignedUrl(filePath, 31536000);

    if (signError || !signedData?.signedUrl) {
      console.error("Storage signing error:", signError);
      return c.json({ error: "Failed to generate signed URL" }, 500);
    }

    return c.json({ url: signedData.signedUrl });
  } catch (error) {
    console.error("Upload handler error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.patch("/projects/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();
  
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});


app.get("/features", authMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const projectId = c.req.query("projectId");
  
  let query = supabase
    .from("features")
    .select("*");
    
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/public/features", async (c) => {
  const projectId = c.req.query("projectId");
  
  let query = supabase
    .from("features")
    .select("*");
    
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.post("/features", authMiddleware, adminMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const feature = await c.req.json();
  
  const { data, error } = await supabase
    .from("features")
    .insert({ ...feature })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.patch("/features/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();
  
  const { data, error } = await supabase
    .from("features")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete("/features/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const { error } = await supabase
    .from("features")
    .delete()
    .eq("id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
