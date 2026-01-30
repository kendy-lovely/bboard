<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types'
    import { setMarked, setRender } from '$lib/marked';
    import type { Post } from "$lib/types";
	import PostElement from "$lib/PostElement.svelte";
    const { data, form }: PageProps = $props();
    
    let posts = $state(
        // svelte-ignore state_referenced_locally
        data.posts.map(post => ({
            ...post,
            expanded: false,
            replying: false,
        }))
    )
</script>

<div class="main">
    <h1>welcome to bboard</h1>
    <p><a href="/login">click</a> to login/register</p>
    <p>our beautiful users:</p>
    <ul>
        {#each data.users as user}
            <li style="list-style-type:none;">
                {@html user.admin ? 
                `<span style="color:navy">${user.username}</span>` : 
                `<span>${user.username}</span>`}, made on {user.createdAt.split('T')[0]}
            </li>
        {/each}
    </ul>
</div>
<div class="main">
    {#if form?.error || form?.success}<p>{form?.message}</p>{/if}
    <form method="POST">
        <label>
            text:
            <textarea style="width:100%" rows=4 name="text"></textarea>
        </label>
        <button formaction="?/post">post</button>
    </form>
    <div>
    {#each posts as post}
        <PostElement post={post}/>
    {/each}
    </div>
</div>