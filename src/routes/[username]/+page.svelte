<script lang="ts">
    import type { PageProps } from './$types';
    import { setMarked, setRender } from '$lib/marked';

    let { data, form }: PageProps = $props();
    let editBio = $state(false);
    let posts = $state(
        // svelte-ignore state_referenced_locally
        data.posts?.map((post: any) => ({
            ...post,
            expanded: false
        }))
    );
</script>

{#if data?.error}{data?.message}{/if}
<div class="main">
    {#if form?.error || form?.success}{form.message}{/if}
    <p>this is the page of {data.pageUser.username} !!</p>
    <div style="width:200px;
                aspect-ratio:1;
                background-image:url({data.pageUser.pfp});
                background-repeat:no-repeat;
                background-position:center;
                background-size:cover;"></div>
    {#if data.ownPage}<button class="link-style-button" onclick={() => (editBio = !editBio)}>edit bio</button>{/if}
    {#if data.ownPage && editBio}
    <form method="POST">
        <input type="hidden" name="id" value={data.pageUser.userID} />
        <label>
            bio:
            <textarea style="width:100%" rows=4 name="bio"></textarea>
        </label>
        <button class="link-style-button" formaction="?/edit">apply changes</button>
    </form>
    {/if}
    {#if data.pageUser.bio}{@html setMarked.parse(data.pageUser.bio, { renderer: setRender })}{/if}
</div>
<div class="main">
    {#each posts as post}
        <div class="post">
            <a href="/{post.authorUsername}">{post.authorUsername}</a>: 
            {@html post.expanded ? 
            setMarked.parse(post.readMore, { renderer: setRender }) : 
            setMarked.parse(post.text, { renderer: setRender })}
            {#if post.readMore}
                <button class="link-style-button" 
                        onclick={() => (post.expanded = !post.expanded)}
                >{post.expanded ? "read less" : "read more"}</button>
            {/if}
            <form method="POST">
                <input type="hidden" name="id" value={post.id} />
                <p>
                    {new Date(post.createdAt)
                        .toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric' })
                        .toLowerCase()}, 
                    {new Date(post.createdAt)
                        .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {#if post.deletable}
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