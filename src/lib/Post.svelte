<script lang="ts">
    import { enhance } from "$app/forms";
    import { setMarked, setRender } from "./marked";
    import Post from "./Post.svelte";
    import dfault from '$lib/assets/default.png';
    let vote = $state("");
    let { post, replies } = $props();
</script>

<div class="post">
    <div class="post-content">
        <div class="post-top-bar" >
            <form class="vote" method="POST" action="?/vote" use:enhance={() => {
                if (vote === "upvote") {
                    if (!post.voted[0]) {
                        post.voted[0] = true;
                        post.votes++;
                        post.karma++;
                    } else {
                        post.voted[0] = false;
                        post.votes--;
                        post.karma--;
                    }
                    if (post.voted[1]) {
                        post.voted[1] = false;
                        post.votes++;
                        post.karma++;
                    }
                } else {
                    if (!post.voted[1]) {
                        post.voted[1] = true;
                        post.votes--;
                        post.karma--;
                    } else {
                        post.voted[1] =false;
                        post.votes++;
                        post.karma++;
                    }
                    if (post.voted[0]) {
                        post.voted[0] = false;
                        post.votes--;
                        post.karma--;
                    }
                }
            }}>
                <input type="hidden" name="vote" value={vote}/>
                <input type="hidden" name="id" value={post.id} />
                <button style={post.voted[0] ? "color:red" : ""} onclick={() => vote = "upvote"}>🡅</button>
                <span>{post.votes}</span>
                <button style={post.voted[1] ? "color:red" : ""} onclick={() => vote = "downvote"}>🡇</button>
            </form>
            <div class="profile-card">
                <a class="pfplink" title={post.authorUsername} href="/{post.authorUsername}">
                    <div class="pfpbox">
                        {#if post.pfp}
                        <div class="pfp" style="background-image:url({post.pfp});"></div>
                        {:else}
                        <div class="pfp" style="background-image:url({dfault});"></div>
                        {/if}
                        <span class="username">{post.authorUsername}</span>
                        <span class="karma">karma<br><strong>{post.karma}</strong></span>
                    </div>
                </a>
            </div>
        </div>
        {#if post.img}
        <img class="img" alt={post.authorUsername} src={post.img}/>
        {/if}
        {@html post.expanded ? 
            setMarked.parse(post.readMore, { renderer: setRender }) : 
            setMarked.parse(post.text, { renderer: setRender })}
        {#if post.readMore}
            <button class="link-style-button" 
                    onclick={() => post.expanded = !post.expanded}
            >{post.expanded ? "read less" : "read more"}</button>
        {/if}
        <form method="POST">
            <input type="hidden" name="id" value={post.id} />
            <p>
                {new Date(post.createdAt)
                    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    .toLowerCase()}, 
                {new Date(post.createdAt)
                    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                {#if post.deletable}
                    <button style="margin-left:.5em;"
                            class="link-style-button" 
                            formaction="?/delete"
                    >delete</button>
                {/if}
                {#if replies}
                <button style="margin-left:.5em;"
                        class="link-style-button" 
                        type="button"
                        onclick={() => post.replying = !post.replying}
                >reply</button>
                {/if}
                {#if post.replying}
                    <textarea style="width:100%" rows=4 name="text"></textarea>
                    <button formaction="?/reply">post</button>
                {/if}
            </p>
        </form>
    </div>
    {#each post.children as reply}
        <Post post={reply} replies={replies}/>
    {/each}
</div>