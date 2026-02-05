import type { Post, User } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async ({ params, depends, locals: { supabase, safeGetSession } }) => {
    depends('supabase:posts', 'supabase:users');
    let ownPage = false;
    const { session } = await safeGetSession();
    
    const userData = await supabase
        .from("users")
        .select<'users', User>();
    if (userData.error) {
        console.log(userData.error.message);
        return { users: [], posts: []};
    }
    
    const postData = await supabase
        .from("posts")
        .select();
    if (postData.error) {
        console.log(postData.error.message);
        return { users: [], posts: []};
    }
    const users = userData.data
        .toSorted((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((user) => {
            const karma = postData.data
                .filter(post => post.author === user?.userID)
                .map(post => post.votes)
                .reduce((acc, vote) => acc + vote, 0);
            return { ...user, karma };
        });
    const sessionUser = users.find(user => user.userID === session?.user.id);
    const pageUser = users.find(user => user.username === params.username);
    if (!pageUser) return {
        error: true,
        message: "user not found"
    };
    if (session?.user.id === pageUser?.userID) ownPage = true;

    const postMap = new Map<string, Post>();

    for (const post of postData.data) {
        const user = users.find(user => user.userID === post.author);

        postMap.set(`${post.id}`, {
            ...post,
            readMore: post.text.length >= 256 ? post.text : "",
            text: post.text.slice(0, 255),
            pfp: user?.pfp,
            authorUsername: user?.username,
            karma: user?.karma,
            deletable: session?.user.id === user?.userID || sessionUser?.admin,
            voted: [sessionUser?.upvoted?.includes(post.id) ?? false, sessionUser?.downvoted?.includes(post.id) ?? false],
            children: []
        })
    }

    let roots: Post[] = [];
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
    const filterPostTree = (tree: Post[], condition: (post: Post) => boolean) => {
        return tree
            .filter(post => {
                if (post.children && !condition(post)) post.children = filterPostTree(post.children, condition);

                return condition(post) || (post.children && post.children.length > 0)
            })
    }
    roots = filterPostTree(roots, (post) => post.author === pageUser.userID)
        .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((root) => ({
            ...root,
            children: root.children.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }))

    return { 
        pageUser,
        posts: roots,
        pagePosts: roots.filter(p => p.channel === pageUser.username),
        sessionUser: sessionUser,
        ownPage,
    };
}) satisfies PageServerLoad;

export const actions = {
    edit: async ({request, locals: { supabase, safeGetSession}}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();

        const id = form.get('id') as string;
        const bio = form.get('bio') as string;
        const pfpFile = form.get('pfp') as File;

        const update: Record<string, string> = {};
        if (bio) update.bio = bio;
        if (pfpFile?.size !== 0 && pfpFile instanceof File) update.pfp = "pfp";
        if (Object.keys(update).length === 0) return fail(500, { 
            error: true, 
            message: 'no data filled' 
        });

        if (pfpFile?.size !== 0 && pfpFile instanceof File) {
            const uploadPfp = await supabase
                .storage
                .from('pfps')
                .upload(`${id}/pfp.png`, pfpFile, {
                    upsert: true
                });
            if (uploadPfp.error) return fail(500, { 
                error: true, 
                message: uploadPfp.error.message 
            });

            const { data: { publicUrl }} = supabase
                .storage
                .from('pfps')
                .getPublicUrl(`${id}/pfp.png`);
            update.pfp = `${publicUrl}?v=${crypto.randomUUID()}`;
        }

        if (id !== session?.user.id) return fail(500, { 
            error: true, 
            message: "not authenticated" 
        });

        const updateProfile = await supabase
            .from('users')
            .update(update)
            .eq('userID', id);
        if (updateProfile.error) return fail(500, { 
            error: true, 
            message: updateProfile.error.message 
        });

        return { success: true, message: "successfully changed !"};
    }
} satisfies Actions;