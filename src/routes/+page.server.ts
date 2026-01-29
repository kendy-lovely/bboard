import type { PageServerLoad, Actions } from './$types';
import type { User } from '$lib/types'

export const load = (async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    const userData = await supabase
        .from("users")
        .select<'users', User>();
    if (userData.error) {
        console.log(userData.error.message);
        return { users: [], posts: []};
    }
    const sessionUser = userData.data.find(user => user.userID === session?.user.id);
    
    const postData = await supabase
        .from("posts")
        .select();
    if (postData.error) {
        console.log(postData.error.message);
        return { users: [], posts: []};
    }

    const posts = postData.data
        .map((post) => {
            const user = userData.data.find(user => user.userID === post.author);
            let readMore = "";
            if ((post.text as string).length >= 128) {
                readMore = post.text.slice(128);
                post.text = post.text.slice(0, 127);
            }

            if (sessionUser?.admin) return { 
                ...post,
                readMore,
                authorUsername: user?.username ?? "", 
                deletable: true,
                expanded: false
            };
            if (session?.user.id === post.author) return { 
                ...post, 
                readMore,
                authorUsername: user?.username ?? "NULL", 
                deletable: true,
                expanded: false
            }
            return { 
                ...post, 
                readMore,
                authorUsername: user?.username ?? "NULL", 
                deletable: false,
                expanded: false
            };
        })
        .toSorted((a, b) => b.id - a.id);
        console.log(posts)

    return { 
        users: userData.data, 
        posts,
        sessionUser: sessionUser
    };
}) satisfies PageServerLoad;

export const actions = {
	post: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const text = form.get('text') as string;
        console.log(text);
        const { error } = await supabase
            .from('posts')
            .insert([{ author: session?.user.id, text }]);

        if (error) return { error: true, message: error.message};

        return { success: true, message: "successfully posted"};
    },
    delete: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const currentUser = await supabase
            .from('users')
            .select()
            .eq('userID', session?.user.id)
            .single();
        const post = await supabase
            .from('posts')
            .select()
            .eq('id', form.get('id') as string)
            .single();

        if (post.error) return { error: true, message: post.error.message};
        if (post.data.author !== session?.user.id && !currentUser?.data.admin) { 
            return { error: true, message: "not authenticated" } 
        };
        const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.data.id);
        if (error) return { error: true, message: error.message};
        return { success: true, message: "successfully deleted"};
    },
} satisfies Actions;