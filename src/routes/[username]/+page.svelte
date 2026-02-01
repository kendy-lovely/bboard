<script lang="ts">
    import type { PageProps } from './$types';
    import { setMarked, setRender } from '$lib/marked';
    import Post from '$lib/Post.svelte';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';

    let validation = $state('');
    let { data, form }: PageProps = $props();
    let editProfile = $state(false);
</script>

<div class="main">
    {#if validation}<p class="validation">{validation}</p>{/if}
    {#if form?.error || form?.success}<p>{form.message}</p>{/if}
    <p>this is the page of {data.pageUser?.username} !!</p>
    {#if data.pageUser?.pfp}
    <div class="pfp" style="width:150px;background-image:url({data.pageUser?.pfp})"></div>
    {/if}
    {#if data.pageUser?.bio}{@html setMarked.parse(data.pageUser?.bio, { renderer: setRender })}{/if}
    <strong>karma: {data.pageUser?.karma}</strong>
    {#if data.ownPage}
        <button class="link-style-button" style="margin-top:16px;" onclick={() => (editProfile = !editProfile)}>edit profile</button>
        {#if editProfile}
            <form method="POST" enctype=multipart/form-data use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        validation = "successfully updated !";
                        invalidate('supabase:users');
                    }
                }
            }}>
                <input type="hidden" name="id" value={data.pageUser?.userID} />
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
</div>
<div class="main">
    <p>the beautiful posts by {data.pageUser?.username}:</p>
    {#each data.posts as post}
        <Post post={post} replies={true}/>
    {/each}
</div>