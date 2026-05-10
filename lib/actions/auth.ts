'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email:    formData.get('email') as string,
    password: formData.get('password') as string,
    options:  { data: { name: formData.get('name') as string } },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
