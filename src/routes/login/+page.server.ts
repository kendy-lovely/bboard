import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
        const form = await request.formData();
        const email = form.get('email') as string;
        const password = form.get('password') as string;
        
        const { error } = await supabase
            .auth
            .signInWithPassword({
                email: email,
                password: password
            })
        if (error) return { 
            error: true, 
            message: error.message, 
            email 
        };

        return { 
            success: true, 
            message: "sucessfully logged in !"
        }
	},
    register: async ({ request, locals: { supabase } }) => {
        const form = await request.formData();
        const username = form.get('username') as string;
        const email = form.get('email') as string;
        const password = form.get('password') as string;

        const signUp = await supabase
            .auth
            .signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            })
        if (signUp.error) return fail(500, { 
            error: true, 
            message: signUp.error.message 
        });

        const userID = signUp.data.user?.id;
        const registerUser = await supabase
            .from('users')
            .insert([{ 
                userID,
                username
            }]);
        if (registerUser.error) return fail(500, { 
            error: true, 
            message: registerUser.error?.message 
        });

        return { success: true, message: "successfully registered" };
    }
} satisfies Actions;