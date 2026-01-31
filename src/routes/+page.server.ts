import type { PageServerLoad, Actions } from './$types';
import type { User, Post } from '$lib/types';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals: { supabase, safeGetSession } }) => {
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

export const actions = {
	post: async ({ request, locals: { safeGetSession, supabase }}) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const text = form.get('text') as string;
        const img: File = form.get('img') as File;

        const update: Record<string, string> = {};
        if (text) update.text = text;
        if (img?.size !== 0 && img instanceof File) update.img = "img";
        if (Object.keys(update).length === 0) return fail(500, { 
            error: true, 
            message: 'no data filled' 
        });

        if (img?.size !== 0 && img instanceof File) {
            const uploadImg = await supabase
                .storage
                .from('images')
                .upload(`${session?.user.id}/${img.name.replaceAll(" ", "_")}`, img);
            if (uploadImg.error) return fail(500, { 
                error: true, 
                message: uploadImg.error.message + " IMAGE FAIL"
            });

            const { data: { publicUrl }} = supabase
                .storage
                .from('images')
                .getPublicUrl(`${session?.user.id}/${img.name.replaceAll(" ", "_")}`);
            update.img = publicUrl;
        }

        const { error } = await supabase
            .from('posts')
            .insert([{ author: session?.user.id, ...update }]);
        if (error) return fail(500, { 
            error: true, 
            message: error.message + " POSTING FAIL"
        });

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

        if (error) return fail(500, { 
            error: true, 
            message: error.message
        });

        return { success: true, message: "successfully posted"};
    },
    delete: async ({ request, locals: { safeGetSession, supabase } }) => {
        const { session } = await safeGetSession();
        const sessionUser = await supabase
            .from('users')
            .select()
            .eq('userID', session?.user.id)
            .single();

        const form = await request.formData();

        const post = await supabase
            .from('posts')
            .select()
            .eq('id', form.get('id') as string)
            .single();
        if (post.error) return fail(500, { 
            error: true, 
            message: post.error.message 
        });
        if (post.data.author !== session?.user.id && !sessionUser?.data.admin) return fail(500, { 
            error: true, 
            message: "not authenticated" 
        });

        const deletePost = await supabase
                .from('posts')
                .delete()
                .eq('id', post.data.id);
        if (deletePost.error) return fail(500, { 
            error: true, 
            message: deletePost.error.message
        });

        const imagePath = post.data.img.split('images/')[1];
        const deleteImg = await supabase
            .storage
            .from('images')
            .remove([imagePath])
        if (deleteImg.error) return fail(500, { 
            error: true, 
            message: deleteImg.error.message 
        })

        return { success: true, message: "successfully deleted"};
    },
    vote: async ({ request, locals: { safeGetSession, supabase } }) => {
        const { session } = await safeGetSession();
        const form = await request.formData();
        const id: number = Number(form.get('id') as string);

        const getPost = await supabase
            .from('posts')
            .select('id, votes')
            .eq('id', id)
            .single();
        if (getPost.error) return fail(500, {
            error: true,
            message: getPost.error.message
        })

        const getUser = await supabase
            .from('users')
            .select('userID, upvoted, downvoted')
            .eq('userID', session?.user.id).
            single();
        if (getUser.error) return fail(500, {
            error: true,
            message: getUser.error.message
        })

        const vote = form.get('vote') as string;
        let votes: number = getPost.data.votes;

        const update: Record<string, number[]> = {};
        if (vote === "upvote") {
            if (!(getUser.data.upvoted?.includes(id) ?? false)) {
                update.upvoted = [...getUser.data.upvoted ?? [], id];
                votes++;
            } else {
                update.upvoted = (getUser.data as User).upvoted.filter((post) => post !== id);
                votes--
            }
            if (getUser.data.downvoted?.includes(id) ?? false) {
                update.downvoted = (getUser.data as User).downvoted.filter((post) => post !== id);
                votes++;
            }
        } else {
            if (!(getUser.data.downvoted?.includes(id) ?? false)) {
                update.downvoted = [...getUser.data.downvoted ?? [], id];
                votes--;
            } else {
                update.downvoted = (getUser.data as User).downvoted.filter((post) => post !== id);
                votes++;
            }
            if (getUser.data.upvoted?.includes(id) ?? false) {
                update.upvoted = (getUser.data as User).upvoted.filter((post) => post !== id);
                votes--;
            }
        }

        const changeVotes = await supabase
            .from('posts')
            .update({ votes })
            .eq('id', id);
        if (changeVotes.error) return fail(500, {
            error: true, 
            message: changeVotes.error.message
        });

        const addVoteToUser = await supabase
            .from('users')
            .update(update)
            .eq('userID', session?.user.id)
        if (addVoteToUser.error) return fail(500, {
            error: true,
            message: addVoteToUser.error.message
        })
        return { success: true, message: "vote counted !"}
    }
} satisfies Actions;