import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ locals: { supabase } }) => {
        const { error } = await supabase.auth.signOut();
        if (error) return { error: true, message: error.message };
        throw redirect(303, '/');
    }
};