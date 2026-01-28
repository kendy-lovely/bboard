import type { PageServerLoad } from './$types';
import type { Actions } from './$types';


export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

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

        if (error) return { error: true, message: error.message, email }
        return { success: true, message: "sucessfully logged in !"}
	},
    register: async ({ request, locals: { supabase } }) => {
        const form = await request.formData();
        const username = form.get('username') as string;
        const email = form.get('email') as string;
        const password = form.get('password') as string;

        const { data, error } = await supabase
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
        if (!error) {
            const userID = data.user?.id;
            const { error } = await supabase
                .from('users')
                .insert([{ 
                    userID,
                    username, 
                    email
                }]);
            if (error) return { error: true, message: error?.message };
            return { success: true, message: "successfully registered" };
        }
        return { error: true, message: error?.message }
    }
} satisfies Actions;