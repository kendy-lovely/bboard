<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types'
    const { data, form }: PageProps = $props();

    let posts = $state(
        // svelte-ignore state_referenced_locally
        data.posts.map((post: any) => ({
            ...post,
            expanded: false
        }))
    );
</script>

<div class="main">
    <h1>welcome to bboard</h1>
    <p><a href="/login">click</a> to login/register</p>
    <p>our beautiful users:</p>
    <ul>
        {#each data.users as user}
            <li>{user.username}, made on {user.createdAt.split('T')[0]}</li>
        {/each}
    </ul>
</div>
<div class="main">
    {#if form?.error}<p>{form?.message}</p>{/if}
    {#if form?.success}<p>{form?.message}</p>{/if}
    <form method="POST">
        <label>
            text:
            <textarea style="width:100%" rows=4 name="text"></textarea>
        </label>
        <button formaction="?/post">post</button>
    </form>
    <div>
    {#each posts as post}
        <div class="post">
            {post.authorUsername}: {@html post.text}
            {#if post.readMore}
                <p>{@html post.expanded ? post.readMore : ""}</p>
                <button class="link-style-button" onclick={() => post.expanded = !post.expanded}>{post.expanded ? "read less" : "read more"}</button>
            {/if}
            <form method="POST">
                <input type="hidden" name="id" value={post.id} />
                <p>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()}, {new Date(post.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {#if post.deletable}
                    <button class="link-style-button" formaction="?/delete">delete</button>
                    {/if}
                </p>
            </form>
        </div>
    {/each}
    </div>
</div>