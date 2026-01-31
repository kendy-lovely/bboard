<script lang="ts">
    import { setMarked, setRender } from "./marked";
    import Post from "./Post.svelte";
    export let post;
    export let replies;
</script>

<div class="post">
    <div class="post-content">
        <div class="pfpbox">
            {#if post.pfp}
            <a title={post.authorUsername} href="/{post.authorUsername}>"><div class="pfp" style="background-image:url({post.pfp});"></div></a>
            {/if}
            <a href="/{post.authorUsername}">{post.authorUsername}</a>
        </div>
        {#if post.img}
        <img class="img" src={post.img}/>
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