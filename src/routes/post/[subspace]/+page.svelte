<script lang="ts">
    import type { PageProps } from './$types';
    import Post from "$lib/Post.svelte";
	import { enhance } from "$app/forms";
	import { invalidate } from "$app/navigation";
	import { fade } from "svelte/transition";
	import { flip } from "svelte/animate";

    const { data }: PageProps = $props();
    let { session, subspace } = $derived(data);
    let validation = $state('');
    // svelte-ignore state_referenced_locally
    let posts: any = $state(data.posts);
    $effect(() => {
        posts = data.posts;
        validation = '';
    });
</script>

<div class="main">
    <h1>#{subspace?.name}</h1>
    <small>created by {subspace?.creator}</small>
    <p></p>
    <p>it has {subspace?.postCount == 0 ? "no posts" : (subspace?.postCount as number) > 1 ? `${subspace?.postCount} posts` : `${subspace?.postCount} post`} !</p>
</div>
<div class="main">
    {#if validation}<span class="validation">{validation}</span>{/if}
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
            <input type=hidden name="subspace" value={subspace?.name}>
            <textarea rows=4 name="text"></textarea>
            <label>
                image:
                <input type="file" name="img"/>
            </label>
            <button formaction="/post?/post">post</button>
        </form>
    {/if}
    <div style="width:100%;height:fit-content">
    {#each posts as post (post.id)}
        <div animate:flip transition:fade>
            <Post 
                post={post} 
                replies={true}
                onDelete={async () => {
                    await new Promise(r => setTimeout(r, 500));
                    posts = posts.filter((p: any) => p.id !== post.id);
                }}/>
        </div>
    {/each}
    </div>
</div>