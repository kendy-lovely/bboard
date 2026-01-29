import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, locals: { supabase, safeGetSession} }) => {
    let ownPage = false;
    const { session } = await safeGetSession();

    const userData = await supabase
        .from('users')
        .select()
    if (userData.error) return { error: true, message: userData.error.message}
    const pageUser = userData.data.find(user => user.username === params.username);
    const sessionUser = userData.data.find(user => user.userID === session?.user.id);

    const postData = await supabase
        .from('posts')
        .select()
        .eq('author', pageUser?.userID);
    if (postData.error) return { error: true, message: postData.error.message}

    const posts = postData.data
        .map((post) => {
            let readMore = "";
            let deletable = false;

            if (post.text.length >= 256) {
                readMore = post.text;
                post.text = post.text.slice(0, 255);
            }
            if (sessionUser?.userID === post.author || sessionUser?.admin) deletable = true;

            return { 
                ...post, 
                readMore,
                authorUsername: pageUser?.username, 
                deletable
            };
        })
        .filter(p => p.authorUsername)
        .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (session?.user.id === pageUser?.userID) ownPage = true;
    return { 
        pageUser, 
        posts,
        ownPage 
    };
}) satisfies PageServerLoad;

export const actions = {
    delete: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const sessionUser = await supabase
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
        if (post.data.author !== session?.user.id && !sessionUser?.data.admin) { 
            return { error: true, message: "not authenticated" } 
        };
        const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.data.id);
        if (error) return { error: true, message: error.message};
        return { success: true, message: "successfully deleted"};
    },
    edit: async ({request, locals: { supabase, safeGetSession}}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const id = form.get('id') as string;
        const bio = form.get('bio') as string;

        if (id !== session?.user.id) return { error: true, message: "not authenticated" }

        const { error } = await supabase
            .from('users')
            .update({ bio })
            .eq('userID', id)
            .select();
        if (error) return { error: true, message: error.message };

        return { success: true, message: "successfully changed !"};
    }
} satisfies Actions;