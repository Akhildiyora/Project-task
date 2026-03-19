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
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const jwtSecret = process.env.JWT_SECRET!;
const API = process.env.FRONTEND_API;
const app = new Hono();
const userSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  googleId: z.string().min(6).optional(),
});
const ProjectSchema = z.object({
  images: z.array(z.string().url()).optional(),
  project_name: z.string().min(1).optional(),
  status: z.string().optional(),
  due_date: z.string().optional(),
  description: z.string().optional(),
  members: z.array(z.string().email()).optional(),
  logo: z.string().url().nullable().optional(),
  userId: z.number().optional(),
});
const FeatureSchema = z.object({
  feature_name: z.string().min(1).optional(),
  desc: z.string().optional(),
  due_date: z.string().optional(),
  status: z.string().optional(),
  project_id: z.number().optional(),
  assign: z.string().email().optional(),
});
const createImageSchema = (maxSize: number) =>
  z
    .custom<File>((val) => val instanceof File)
    .refine((file) => file.size > 0, "File is empty")
    .refine(
      (file) => file.size <= maxSize,
      `Max size ${maxSize / 1024 / 1024}MB`,
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(
          file.type,
        ),
      "Invalid image type",
    );

app.use(
  "*",
  cors({
    // for local

    // origin: [`${API}`],
    // credentials: true,
  
  // for vercel {all four}

    origin: "https://project-task-manage.vercel.app",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/", (c) => c.text("working"));

app.post("/register", async (c) => {
  const { name, email, password } = await c.req.json();
  const result = userSchema.safeParse({ name, email, password });
  if (!result.success) {
    return c.json(
      { error: "Invalid input data", details: result.error.issues },
      400,
    );
  }
  const user = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (user.error) {
    console.error("Error fetching user:", user.error);
    return c.json({ message: "Database error" }, 500);
  }
  if (user.data) {
    return c.json({ message: "User already exists" }, 400);
  }

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ name, email, password: hash, role: "user" });
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
  const body = await c.req.json();
  const parsed = userSchema.safeParse(body);
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
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
    },
    jwtSecret,
  );

  setCookie(c, "token", token, {
    httpOnly: true,

    // for vercel

    secure: true,
    sameSite: "none",

    // for local

    // secure: false,
    // sameSite: "strict",

    maxAge: 60 * 60 * 10,
    path: "/",
  });

  return c.json({
    message: "Login successful",
    token: token,
    user: user,
  });
});

app.post("/google-login", async (c) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({ message: "Token is required" }, 400);
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return c.json({ message: "Invalid google token payload" }, 401);
    }
    const { email, name, sub: googleId, email_verified } = payload;

    const result = userSchema.safeParse({ name, email, googleId });
    if (!result.success) {
      return c.json(
        { error: "Invalid input data", details: result.error.issues },
        400,
      );
    }

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
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
      },
      jwtSecret,
    );

    setCookie(c, "token", appToken, {
      httpOnly: true,

      // for vercel

      secure: true,
      sameSite: "none",

      // for local

      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",

      maxAge: 60 * 60 * 10,
      path: "/",
    });

    return c.json({
      message: "Google authentication successful",
      user: user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return c.json({ message: "Google authentication failed" }, 500);
  }
});

const authMiddleware = async (c: any, next: any) => {
  const token =
    getCookie(c, "token") ||
    c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }
  try {
    const payload = await verify(token, jwtSecret, "HS256" as any);
    c.set("jwtPayload", payload);
    await next();
  } catch (err) {
    return c.json({ error: "invalid token" }, 401);
  }
};

const adminMiddleware = async (c: any, next: any) => {
  const payload = c.get("jwtPayload");

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", payload.sub)
    .single();

  if (error || !data) {
    return c.json({ error: "User not found" }, 404);
  }

  if (data.role !== "admin") {
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
  deleteCookie(c, "token");
  return c.json({ message: "Logged out successfully" });
});

app.get("/users", authMiddleware, async (c) => {
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
    const payload = (await verify(token, jwtSecret, "HS256" as any)) as any;
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

app.get("/projects", authMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(`user_id.eq.${user.sub},members.cs.{${user.email.toLowerCase()}}`);

  if (error) {
    console.error("PROJECT FETCH ERROR:", error);
    return c.json({ error: error.message }, 500);
  }
  return c.json(data);
});

app.get("/projects/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("jwtPayload");
  console.log("user.sub", user.sub);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.sub},members.cs.{${user.email}}`)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete("/projects/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const { data: projectData, error: fetchError } = await supabase
    .from("projects")
    .select("logo, images")
    .eq("id", id)
    .single();

  if (fetchError || !projectData) {
    console.log("Fetch logo error");
    return c.json({ error: "Project not found" }, 404);
  }

  console.log("projectData.images", projectData.images);
  const filestoDelete = [];

  if (projectData.logo) {
    const logo = `Logos/${projectData.logo.split("/").pop()?.split("?")[0]}`;
    filestoDelete.push(logo);
  }

  if (projectData.images) {
    let images = projectData.images;
    console.log("images.length", images.length);
    images.forEach((img: string) => {
      const Images = `Gallery/${img.split("/").pop()?.split("?")[0]}`;
      filestoDelete.push(Images);
      console.log("Images", Images);
    });
    if (projectData.images && images.length === 0) {
      return c.json({ error: "Images parsing failed" }, 500);
    }
  }

  if (filestoDelete.length > 0) {
    console.log("filetoDelete", filestoDelete);
    const { error: logoError } = await supabase.storage
      .from("Images")
      .remove(filestoDelete);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

app.get("/public/projects/:id", async (c) => {
  const id = c.req.param("id");
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
  const body = await c.req.json();

  console.log("REQUEST BODY:", body);

  const { project_name, description, due_date, members, logo } = body;

  const result = ProjectSchema.safeParse({
    project_name,
    description,
    due_date,
    members,
    logo,
  });
  if (!result.success) {
    return c.json(
      { error: "Invalid input data", details: result.error.issues },
      400,
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_name: project_name,
      description,
      due_date: due_date,
      user_id: user.sub,
      members: members,
      logo: logo,
    })
    .select("*")
    .single();

  if (error) {
    console.error("INSERT ERROR:", error);
    return c.json({ error: error.message }, 500);
  }
  return c.json(data, 201);
});

app.patch("/update/:id", authMiddleware, adminMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  const id = c.req.param("id");
  const { project_name, description, due_date, members, logo, status } =
    await c.req.json();

  const result = ProjectSchema.safeParse({
    project_name,
    description,
    due_date,
    members,
    logo,
    status,
  });
  if (!result.success) {
    return c.json(
      { error: "Invalid input data", details: result.error.issues },
      400,
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      project_name,
      description,
      due_date: due_date,
      user_id: user.sub,
      members: members,
      logo: logo,
      status,
    })
    .select("*")
    .eq("id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.post("/upload-images", authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    const gallerySchema = z.object({
      file: createImageSchema(10 * 1024 * 1024),
    });
    const result = gallerySchema.safeParse({ file });
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }

    const validFile = result.data.file;
    const fileExt = validFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `Gallery/${fileName}`;

    const { error } = await supabase.storage
      .from("Images")
      .upload(filePath, validFile );

    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ error: "Failed to upload to storage" }, 500);
    }

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

app.post("/upload-logo", authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    const logoSchema = z.object({
      file: createImageSchema(5 * 1024 * 1024),
    });

    const result = logoSchema.safeParse({ file });
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((i) => i.message),
        },
        400,
      );
    }

    const logo = result.data.file;

    const logoExt = logo.name.split(".").pop()?.toLowerCase() || "png";
    const logoName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${logoExt}`;
    const logoPath = `Logos/${logoName}`;

    console.log("logoName", logoName);

    const { error } = await supabase.storage
      .from("Images")
      .upload(logoPath, logo);

    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ error: "Failed to upload to storage" }, 500);
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from("Images")
      .createSignedUrl(logoPath, 31536000);

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

app.post("/delete-image", authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const url = body.url;
    const logo = `Gallery/${url.split("/").pop().split("?")[0]}`;
    console.log(logo);

    const { data: deleteData, error: deleteError } = await supabase.storage
      .from("Images")
      .remove([logo]);

    if (deleteError) {
      console.error("Storage signing error: ", deleteError);
      return c.json({ error: "Failed to Delete image" }, 500);
    }

    return c.json({ url });
  } catch (error) {
    console.log("Delete handler error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

//this is for update images in project
app.patch("/projects/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();

  const result = ProjectSchema.safeParse( updates );
  if (!result.success) {
    return c.json(
      { error: "Invalid input data", details: result.error.issues },
      400,
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .update(result.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/features", authMiddleware, async (c) => {
  const projectId = c.req.query("projectId");

  let query = supabase.from("features").select("*");

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/public/features", async (c) => {
  const projectId = c.req.query("projectId");

  let query = supabase.from("features").select("*");

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
  const {
    feature: feature_name,
    desc,
    due_date,
    status,
    project_id,
    assign,
  } = feature;

  const result = FeatureSchema.safeParse({
    feature_name,
    desc,
    due_date,
    status,
    project_id,
    assign,
  });
  if (!result.success) {
    return c.json({
      error: "Invalid input data",
      details: result.error.issues,
    });
  }

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
  const {
    feature: feature_name,
    desc,
    due_date,
    status,
    project_id,
    assign,
  } = updates;

  const result = FeatureSchema.safeParse({
    feature_name,
    desc,
    due_date,
    status,
    project_id,
    assign,
  });
  if (!result.success) {
    return c.json({
      error: "Invalid input data",
      details: result.error.issues,
    });
  }

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
  const { error } = await supabase.from("features").delete().eq("id", id);

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
