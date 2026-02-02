<script lang="ts">
	import Post from "$lib/Post.svelte";
    import "$lib/style.css";
	import type { User } from "$lib/types.js";

    const { data } = $props();
    const users = $derived(data.users);
    const subspaces = $derived(data.subspaces);
    let { session } = $derived(data);
    let validation = $state('');
</script>

<div class="main">
    <h1>welcome to b-space !</h1>
    {#if !session}<p><a href="/login">click</a> to login/register</p>{/if}
    <p>we have <strong>{users?.length ?? 0}</strong> beautiful {users?.length ?? 0 > 1 ? "users" : "user"}</p>
</div>
<div class="main">
    <div style="width:100%;height:fit-content;grid-auto-rows:minmax(300px, fit-content);">
    {#each subspaces as subspace (subspace.id)}
        <div style="display:grid;height:fit-content;width:80%;grid-template-columns:0.3fr+1fr;margin:auto;gap:5px;padding:5px;background-color:rgb(180, 180, 243)">
            <div style="display:grid;width:100%;height:100%;grid-columns:1/2;background-color:aliceblue;place-self:center;text-align:center;">
                <a style="place-self:center;" href="/post/{subspace.name}">
                    <h1>#{subspace.name}</h1>
                    <small>{subspace.description}</small>
                </a>
            </div>  
            <div style="width:100%;grid-columns:2/3;background-color:aliceblue;place-self:center;">
                <h2>{subspace.postCount == 0 ? 
                    "there are no posts !" : 
                    `there ${subspace.postCount > 1 ? `are ${subspace.postCount} posts` : 'is one post'} ! the most recent one is:`}</h2>
                {#if subspace?.lastPost}
                <Post post={subspace.lastPost} replying={false} card={false}/>
                {:else}
                <h1>be the first one to post !</h1>
                {/if}
            </div>
        </div>
    {/each}
    </div>
</div>