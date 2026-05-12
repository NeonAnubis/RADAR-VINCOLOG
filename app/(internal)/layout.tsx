import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar userEmail={user.email} />
      <main className="flex-1 overflow-auto min-w-0 w-full">
        {children}
      </main>
    </div>
  )
}
