import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();

        const sessionUser = await supabase
            .from('users')
            .select('userID, username')
            .eq('userID', session?.user.id)
            .single();
        if (sessionUser.error) return { 
            error: true, 
            message: sessionUser.error.message 
        }

        const signOut = await supabase
            .auth
            .signOut();
        if (signOut.error) return { 
            error: true, 
            message: signOut.error.message 
        };

        return { 
            success: true, 
            message: "successful logout" 
        }
    }
};