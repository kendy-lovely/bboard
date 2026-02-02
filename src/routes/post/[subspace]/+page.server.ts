import type { PageServerLoad } from './$types';
import type { Post, User } from '$lib/types';

export const load = (async ({ depends, params, locals: { supabase, safeGetSession } }) => {
    depends('supabase:posts', 'supabase:users');
    const { session } = await safeGetSession();

    const getPosts = await supabase
        .from('posts')
        .select()
        .eq('channel', params.subspace);
    if (getPosts.error) return { 
        error: true, 
        message: getPosts.error.message 
    };

    const getSubspace = await supabase
        .from('subspaces')
        .select()
        .eq('name', params.subspace)
        .single();
    if (getSubspace.error) return {
        error: true,
        message: getSubspace.error.message
    }
    const subspace = { 
        ...getSubspace.data,
        postCount: getPosts.data.length
    }

    const getUsers = await supabase
        .from("users")
        .select<'users', User>();
    if (getUsers.error) {
        console.log(getUsers.error.message);
        return { users: [], posts: []};
    }
    const users = getUsers.data
        .toSorted((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((user) => {
            const karma = getPosts.data
                .filter(post => post.author === user?.userID)
                .map(post => post.votes)
                .reduce((acc, vote) => acc + vote, 0);
            return { ...user, karma };
        });
    const userMap = new Map(users.map(user => [user.userID, user]));
    const sessionUser = userMap.get(session?.user.id as string)

    const postMap = new Map<string, Post>();
    for (const post of getPosts.data) {
        const user = userMap.get(post.author);

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
    roots
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((root) => ({
            ...root,
            children: root.children.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }))
    return {
        posts: roots,
        subspace: subspace
    }
}) satisfies PageServerLoad;