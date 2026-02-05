<script lang="ts">
    import type { PageProps } from './$types';
    import { setMarked, setRender } from '$lib/marked';
    import Post from '$lib/Post.svelte';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

    let validation = $state('');
    let { data, form }: PageProps = $props();
    let { pageUser, ownPage, session } = $derived(data);
    // svelte-ignore state_referenced_locally
    let { posts, pagePosts } = $state(data);
    let editProfile = $state(false);
    $effect(() => {
        posts = data.posts;
        pagePosts = data.pagePosts;
    })
</script>

<div class="main">
    {#if validation}<p class="validation">{validation}</p>{/if}
    {#if form?.error || form?.success}<p>{form.message}</p>{/if}
    <p>this is the page of {pageUser?.username} !!</p>
    {#if pageUser?.pfp}
    <div class="pfp" style="width:150px;background-image:url({pageUser?.pfp})"></div>
    {/if}
    {#if pageUser?.bio}
    <div class="bio">
        {@html setMarked.parse(pageUser?.bio, { renderer: setRender })}
    </div>
    {/if}
    <strong>karma: {pageUser?.karma}</strong>
    {#if ownPage}
        <button class="link-style-button" style="margin-top:16px;" onclick={() => (editProfile = !editProfile)}>edit profile</button>
        {#if editProfile}
            <form method="POST" enctype=multipart/form-data use:enhance={({ formElement}) => {
                document.body.classList.add('waiting');
                return async ({ result }) => {
                    document.body.classList.remove('waiting');
                    if (result.type === 'success') {
                        validation = "successfully updated !";
                        formElement.reset()
                        editProfile = !editProfile
                        await invalidate('supabase:users');
                    } else if (result.type === 'failure') {
                        validation = `${result.data?.message}`
                    }
                }
            }}>
                <input type="hidden" name="id" value={pageUser?.userID} />
                <label>
                    bio:
                    <textarea style="width:100%" value={pageUser?.bio} rows=4 name="bio"></textarea>
                </label>
                <label>
                    pfp:
                    <input style="width:100%" type="file" name="pfp"/>
                </label>
                <button class="link-style-button" formaction="?/edit">apply changes</button>
            </form>
        {/if}
    {/if}
</div>
<div class="main">
    <div style="display:grid;grid-template-columns:1fr+0.67fr; grid-template-rows: 150px+1fr;column-gap:10px;">
        <div style="width:100%;height:fit-content;grid-area:1/1/3/2">
            <p>the beautiful posts by {pageUser?.username}:</p>
            {#each posts as post (post.id)}
                <div animate:flip transition:fade>
                    <Post post={post} 
                        replies={true} 
                        voteCard={!!session}
                        showSubspace={true}/>
                </div>
            {/each}
        </div>
        <div style="grid-area:1/2/2/3;">
            <p>give a message to {pageUser?.username}!</p>
            {#if session}
                <form class="input-post" method="POST" enctype="multipart/form-data" use:enhance={({ formElement, formData }) => {
                    document.body.classList.add('waiting');
                    return async ({ result }) => {
                        document.body.classList.remove('waiting');
                        validation = 'posting..';
                        if (result.type === 'success') {
                            validation = `posted '${formData.get('text')?.slice(0, 32)}...'!`;
                            formElement.reset();
                        } else if (result.type === 'failure') {
                            validation = `${result.data?.message}`;
                        }
                        await Promise.all([
                            invalidate('supabase:posts'),
                            invalidate('supabase:users')
                        ]);
                    }
                }}>
                    <input type=hidden name="subspace" value={pageUser?.username}>
                    <textarea rows=4 name="text"></textarea>
                    <label>
                        image:
                        <input type="file" name="img"/>
                    </label>
                    <button formaction="/post?/post">post</button>
                </form>
            {:else}
                <h1>log in first dumbass</h1>
            {/if}
        </div>
        <div style="width:100%;height:fit-content;grid-area:2/2/3/3">
            {#each pagePosts as post (post.id)}
                <div animate:flip transition:fade>
                    <Post post={post} 
                          replies={true} 
                          voteCard={false}/>
                </div>
            {/each}
        </div>
    </div>
</div>