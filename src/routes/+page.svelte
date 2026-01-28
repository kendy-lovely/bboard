<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types'

    const { data, form }: PageProps = $props();
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
    {#each data.posts as post}
        <form method="POST">
            <input type="hidden" name="id" value={post.id} />
            <p style=margin-bottom:-12px>
                {post.authorUsername}: {post.text}
                {#if data.sessionUser?.userID === post.author}
                <button class="link-style-button" formaction="?/delete">delete</button>
                {/if}
            </p>
        </form>
    {/each}
    </div>
</div>