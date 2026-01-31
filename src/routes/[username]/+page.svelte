<script lang="ts">
    import type { PageProps } from './$types';
    import { setMarked, setRender } from '$lib/marked';
    import Post from '$lib/Post.svelte';

    let { data, form }: PageProps = $props();
    let editProfile = $state(false);
    let posts = $state(
        // svelte-ignore state_referenced_locally
        data.posts?.map((post: any) => ({
            ...post,
            expanded: false,
            replying: false
        }))
    );
</script>

<div class="main">
    {#if data?.error}<p>{data?.message}</p>{/if}
    {#if form?.error || form?.success}<p>{form.message}</p>{/if}
    <p>this is the page of {data.pageUser.username} !!</p>
    {#if data.pageUser.pfp}
    <div class="pfp" style="width:150px;background-image:url({data.pageUser.pfp})"></div>
    {/if}
    {#if data.ownPage}
        <button class="link-style-button" onclick={() => (editProfile = !editProfile)}>edit profile</button>
        {#if editProfile}
            <form method="POST" enctype=multipart/form-data>
                <input type="hidden" name="id" value={data.pageUser.userID} />
                <label>
                    bio:
                    <textarea style="width:100%" rows=4 name="bio"></textarea>
                </label>
                <label>
                    pfp:
                    <input style="width:100%" type="file" name="pfp"/>
                </label>
                <button class="link-style-button" formaction="?/edit">apply changes</button>
            </form>
        {/if}
    {/if}
    {#if data.pageUser.bio}{@html setMarked.parse(data.pageUser.bio, { renderer: setRender })}{/if}
</div>
<div class="main">
    <p>the beautiful posts by {data.pageUser.username}:</p>
    {#each posts as post}
        <Post post={post} replies={false}/>
    {/each}
</div>