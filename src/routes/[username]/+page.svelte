<script lang="ts">
    import type { PageProps } from './$types';
    import { setMarked, setRender } from '$lib/marked';
    import PostElement from '$lib/PostElement.svelte';

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

{#if data?.error}{data?.message}{/if}
<div class="main">
    {#if form?.error || form?.success}{form.message}{/if}
    <p>this is the page of {data.pageUser.username} !!</p>
    {#if data.pageUser.pfp}
    <div style="width:200px;
                aspect-ratio:1;
                background-image:url({data.pageUser.pfp});
                background-repeat:no-repeat;
                background-position:center;
                background-size:cover;
                border-radius: 50%"></div>
    {/if}
    {#if data.ownPage}<button class="link-style-button" onclick={() => (editProfile = !editProfile)}>edit profile</button>{/if}
    {#if data.ownPage && editProfile}
    <form method="POST">
        <input type="hidden" name="id" value={data.pageUser.userID} />
        <label>
            bio:
            <textarea style="width:100%" rows=4 name="bio"></textarea>
        </label>
        <label>
            pfp:
            <input style="width:100%" type="pfp" name="pfp"/>
        </label>
        <button class="link-style-button" formaction="?/edit">apply changes</button>
    </form>
    {/if}
    {#if data.pageUser.bio}{@html setMarked.parse(data.pageUser.bio, { renderer: setRender })}{/if}
</div>
<div class="main">
    <p>the beautiful posts by {data.pageUser.username}:</p>
    {#each posts as post}
        <PostElement post={post}/>
    {/each}
</div>