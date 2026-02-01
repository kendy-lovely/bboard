<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types';
    import Post from "$lib/Post.svelte";
	import { enhance } from "$app/forms";
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";

    const { data, form }: PageProps = $props();
    let validation = $state('');
    // svelte-ignore state_referenced_locally
    let posts = $state(data.posts);
    $effect(() => {
        posts = data.posts;
    });
    onMount(() => {
        validation = '';
    })
</script>

<div class="main">
    <h1>welcome to bboard</h1>
    {#if !data.sessionUser}<p><a href="/login">click</a> to login/register</p>{/if}
    <p>we have <strong>{data.users.length}</strong> beautiful {data.users.length > 1 ? "users" : "user"}</p>
</div>
<div class="main">
    {#if validation}<span class="validation">{validation}</span>{/if}
    <form class="input-post" method="POST" enctype="multipart/form-data" use:enhance={({ formElement, formData }) => {
        return async ({ result }) => {
            if (result.type === 'success') {
                validation = 'posting..';
                formElement.reset();
            } else if (result.type === 'failure') {
                validation = `${result.status}`;
            }
            await Promise.all([
                invalidate('supabase:posts'),
                invalidate('supabase:users')
            ]);
        }
    }}>
        <textarea rows=4 name="text"></textarea>
        <label>
            image:
            <input type="file" name="img"/>
        </label>
        <button formaction="/post?/post">post</button>
    </form>
    <div style="width:100%;height:fit-content">
    {#each posts as post (post.id)}
        <Post 
            post={post} 
            replies={true}
            onDelete={async () => {
                await new Promise(r => setTimeout(r, 2000));
                posts = posts.filter(p => p.id !== post.id);
            }}/>
    {/each}
    </div>
</div>