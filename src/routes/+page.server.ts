import type { PageServerLoad, Actions } from './$types';
import type { User, Post } from '$lib/types';

export const load = (async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();

    const userData = await supabase
        .from("users")
        .select<'users', User>();
    if (userData.error) {
        console.log(userData.error.message);
        return { users: [], posts: []};
    }
    const users = userData.data.toSorted((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const sessionUser = users.find(user => user.userID === session?.user.id);
    
    const postData = await supabase
        .from("posts")
        .select();
    if (postData.error) {
        console.log(postData.error.message);
        return { users: [], posts: []};
    }

    const postMap = new Map<string, Post>();

    for (const post of postData.data) {
        const user = users.find(user => user.userID === post.author);

        postMap.set(`${post.id}`, {
            ...post,
            readMore: post.text.length >= 256 ? post.text : "",
            text: post.text.slice(0, 255),
            pfp: user?.pfp,
            authorUsername: user?.username,
            deletable: session?.user.id === user?.userID || sessionUser?.admin,
            children: []
        })
    }

    const roots: Post[] = [];

    for (const post of postMap.values()) {
        if (post.parent) {
            postMap.get(`${post.parent}`)?.children!.push(post)
        }
    }

    for (const post of postMap.values()) {
        if (!post.parent) {
            roots.push(post);
        }
    }

    return { 
        users,
        posts: roots.toReversed(),
        sessionUser: sessionUser
    };
}) satisfies PageServerLoad;

export const actions = {
	post: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const text = form.get('text') as string;

        const { error } = await supabase
            .from('posts')
            .insert([{ author: session?.user.id, text }]);

        if (error) return { error: true, message: error.message};

        return { success: true, message: "successfully posted"};
    },
    reply: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const text = form.get('text') as string;
        const parent = form.get('id') as string;

        const { error } = await supabase
            .from('posts')
            .insert([{ author: session?.user.id, text, parent }]);

        if (error) return { error: true, message: error.message};

        return { success: true, message: "successfully posted"};
    },
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

        if (post.error) return { error: true, message: post.error.message };
        if (post.data.author !== session?.user.id && !sessionUser?.data.admin) { 
            return { error: true, message: "not authenticated" } 
        };
        const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.data.id);
        if (error) return { error: true, message: error.message};
        return { success: true, message: "successfully deleted"};
    }
} satisfies Actions;