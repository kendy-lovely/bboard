<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types'
    const { data, form }: PageProps = $props();

    let posts = $state(
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
        <div style="width:75%;height:fit-content;padding:5px;margin:auto;border:solid+2px;text-align:left;margin-top:5px;margin-bottom:5px;">
            <p>{post.authorUsername}: {post.text}</p>
            {#if post.readMore}
                <p>{post.expanded ? post.readMore : ""}</p>
                <button class="link-style-button" onclick={() => post.expanded = !post.expanded}>{post.expanded ? "read less" : "read more"}</button>
            {/if}
            <form method="POST">
                <input type="hidden" name="id" value={post.id} />
                <p>
                    {#if post.deletable}
                    <button class="link-style-button" formaction="?/delete">delete</button>
                    {/if}
                </p>
            </form>
        </div>
    {/each}
    </div>
</div>