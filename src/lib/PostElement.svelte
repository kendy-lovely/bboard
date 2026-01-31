<script lang="ts">
    import { setMarked, setRender } from "./marked";
    import PostElement from "./PostElement.svelte";
    export let post;
</script>

<div class="post">
    <div class="post-content">
        <a href="/{post.authorUsername}">
            {#if post.pfp}
            <div style="width:40px;
                        display:inline-block;
                        aspect-ratio:1;
                        background-image:url({post.pfp});
                        background-repeat:no-repeat;
                        background-position:center;
                        background-size:cover;
                        border-radius:50%"></div>
            {/if}
            {post.authorUsername}
        </a>
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
                <button style="margin-left:.5em;"
                        class="link-style-button" 
                        type="button"
                        onclick={() => post.replying = !post.replying}
                >reply</button>
                {#if post.replying}
                    <textarea style="width:100%" rows=4 name="text"></textarea>
                    <button formaction="?/reply">post</button>
                {/if}
            </p>
        </form>
    </div>
    {#each post.children as reply}
        <PostElement post={reply}/>
    {/each}
</div>