'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'

// Direct postgres pool — used for signup only (bypasses Supabase email rate limits)
const pool = new Pool({ connectionString: process.env.DIRECT_URL })

export async function signIn(formData: FormData) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email:    formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const name     = formData.get('name') as string

  const client = await pool.connect()
  try {
    // Insert directly into auth.users with email pre-confirmed — no email sent, no rate limits
    await client.query(
      `INSERT INTO auth.users (
         id,
         instance_id, aud, role,
         email, encrypted_password,
         email_confirmed_at,
         created_at, updated_at,
         confirmation_token, recovery_token,
         email_change_token_new, email_change,
         raw_app_meta_data, raw_user_meta_data,
         is_super_admin
       ) VALUES (
         gen_random_uuid(),
         '00000000-0000-0000-0000-000000000000',
         'authenticated', 'authenticated',
         $1, crypt($2, gen_salt('bf')),
         NOW(), NOW(), NOW(),
         '', '', '', '',
         '{"provider":"email","providers":["email"]}',
         $3::jsonb,
         false
       )`,
      [email, password, JSON.stringify({ name })]
    )
  } catch (err: unknown) {
    const msg = (err as Error).message ?? ''
    if (msg.includes('duplicate key') || msg.includes('unique')) {
      return { error: 'Este e-mail já está cadastrado.' }
    }
    return { error: msg }
  } finally {
    client.release()
  }

  // Sign in immediately after creating the user
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
