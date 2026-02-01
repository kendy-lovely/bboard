import type { PageServerLoad } from './$types';
import type { User, Post } from '$lib/types';

export const load = (async ({ locals: { supabase, safeGetSession }, depends }) => {
    depends('supabase:posts', 'supabase:users');
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
    const userMap = new Map(users.map(user => [user.userID, user]));
    const sessionUser = userMap.get(session?.user.id as string)

    const postMap = new Map<string, Post>();
    for (const post of postData.data) {
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

    return { 
        users,
        posts: roots.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        sessionUser: sessionUser
    };
}) satisfies PageServerLoad;