// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
    const { session, user } = await safeGetSession()
    const { data } = await supabase
        .from('users')
        .select()
        .eq('userID', session?.user.id)
        .single()

    return {
        session,
        user,
        cookies: cookies.getAll(),
        userData: data
    }
}