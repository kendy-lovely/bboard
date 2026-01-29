<script lang="ts">
    import "../style.css";
    import type { PageProps } from './$types'
    import { setMarked, setRender } from '$lib/marked';
    const { data, form }: PageProps = $props();

    let posts = $state(
        // svelte-ignore state_referenced_locally
        data.posts.map((post: any) => { 
            const pfp = data.users.find(user => user.userID === post.author)?.pfp;
            return {
                ...post,
                pfp,
                expanded: false,
                replying: false,
            }
        })
    );

    let rootPosts = $derived(posts.filter(p => !p.parent));
    let repliesByParent = $derived(Object.groupBy(posts, p => p.parent));
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
    {#each rootPosts as post}
        <div class="post">
            <a href="/{post.authorUsername}">
                {#if post.pfp}
                <div style="width:35px;
                            display:inline-block;
                            aspect-ratio:1;
                            background-image:url({post.pfp});
                            background-repeat:no-repeat;
                            background-position:center;
                            background-size:cover;"></div>
                {/if}
                {post.authorUsername}
            </a>: 
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
            {#each repliesByParent[post.id] ?? [] as reply}
                <div class="reply">
                    <a href="/{reply.authorUsername}">
                        {#if reply.pfp}
                        <div style="width:35px;
                                    display:inline-block;
                                    aspect-ratio:1;
                                    background-image:url({reply.pfp});
                                    background-repeat:no-repeat;
                                    background-position:center;
                                    background-size:cover;"></div>
                        {/if}
                        {reply.authorUsername}
                    </a>: 
                    {@html reply.expanded ? 
                        setMarked.parse(reply.readMore, { renderer: setRender }) : 
                        setMarked.parse(reply.text, { renderer: setRender })}
                    {#if reply.readMore}
                        <button class="link-style-button" 
                                onclick={() => reply.expanded = !reply.expanded}
                        >{reply.expanded ? "read less" : "read more"}</button>
                    {/if}
                    <form method="POST">
                        <input type="hidden" name="id" value={reply.id} />
                        <p>
                            {new Date(reply.createdAt)
                                .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                .toLowerCase()}, 
                            {new Date(reply.createdAt)
                                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            {#if reply.deletable}
                                <button style="margin-left:.5em;"
                                        class="link-style-button" 
                                        formaction="?/delete"
                                >delete</button>
                            {/if}
                        </p>
                    </form>
                </div>
            {/each}
        </div>
    {/each}
    </div>
</div>