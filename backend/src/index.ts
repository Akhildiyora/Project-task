import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { supabase } from './supabase.js'
import dotenv from 'dotenv'
import { googleAuth } from '@hono/oauth-providers/google'

dotenv.config()

const app = new Hono()

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

app.get('/', (c) => {
  return (
  c.html('<a href="/auth/google">Sign in with Google</a>')
  )
})

app.get('/auth/google', googleAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  scope: ['openid', 'email', 'profile']
}),
async (c) => {
  const token = c.get('token');
  const user = c.get('user-google');

  return c.json({
    message: 'Google authentication successful',
    token: token,
    user: user,
  });
}
);


app.post('/register', async (c) => {
  const {name, email, password } = c.req.json()
  await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })

  await supabase.from('users').insert({ name, email, password })
  return c.json({ message: 'User registered successfully' })
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
