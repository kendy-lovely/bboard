<script lang="ts">
    import { enhance } from "$app/forms";
    import { setMarked, setRender } from "$lib/marked";
    import Post from "./Post.svelte";
    import dfault from '$lib/assets/default.png';
    import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";

    let validation = $state('');
    let vote = $state("");
    let replying = $state(false);
    let expanded = $state(false);
    
    let props = $props();
    let post = $state(props.post);
    let children = $state(props.post.children);
    $effect(() => {
        post = props.post;
        children = props.post.children;
    });
    onMount(() => {
        validation = '';
    })

    let deleted = $state(false);
</script>

<div class="post {deleted ? "post-deleted" : ""}">
    <div class="post-content">
        <div class="post-top-bar" >
            <form class="vote" method="POST" action="/post?/vote" use:enhance={({ formData }) => {
                let cancel = false;
                if (vote === "upvote") {
                    if (!post.voted[0]) {
                        post.voted[0] = true;
                        post.votes++;
                        post.karma++;
                    } else {
                        post.voted[0] = false;
                        post.votes--;
                        post.karma--;
                        cancel = true;
                    }
                    if (post.voted[1]) {
                        post.voted[1] = false;
                        post.votes++;
                        post.karma++;
                    }
                } else {
                    if (!post.voted[1]) {
                        post.voted[1] = true;
                        post.votes--;
                        post.karma--;
                    } else {
                        post.voted[1] =false;
                        post.votes++;
                        post.karma++;
                        cancel = true;
                    }
                    if (post.voted[0]) {
                        post.voted[0] = false;
                        post.votes--;
                        post.karma--;
                    }
                }
                return async ({ result }) => {
                    if (result.type === 'success') {
                        const vote = formData.get('vote') as string;
                        validation = cancel ? `you have cancelled your ${vote} on this post` :`you have ${vote}d this post`
                        await Promise.all([
                            invalidate('supabase:posts'),
                            invalidate('supabase:users')
                        ]);
                    }
                }
            }}>
                <input type="hidden" name="vote" value={vote}/>
                <input type="hidden" name="id" value={post.id} />
                <button style={post.voted[0] ? "color:red" : ""} onclick={() => vote = "upvote"}>&#9650;</button>
                <span>{post.votes}</span>
                <button style={post.voted[1] ? "color:red" : ""} onclick={() => vote = "downvote"}>&#9660;</button>
            </form>
            <div class="profile-card">
                <a class="pfplink" title={post.authorUsername} href="/{post.authorUsername}">
                    <div class="pfpbox">
                        {#if post.pfp}
                        <div class="pfp" style="background-image:url({post.pfp});"></div>
                        {:else}
                        <div class="pfp" style="background-image:url({dfault});"></div>
                        {/if}
                        <span class="username">{post.authorUsername}</span>
                        <span class="karma">karma<br><strong>{post.karma}</strong></span>
                    </div>
                </a>
            </div>
        </div>
        {#if validation}<div class="validation">{validation}</div>{/if}
        {#if post.img}
        <img class="img" alt={post.authorUsername} src={post.img}/>
        {/if}
        {@html expanded ? 
            setMarked.parse(post.readMore, { renderer: setRender }) : 
            setMarked.parse(post.text, { renderer: setRender })}
        {#if post.readMore}
            <button class="link-style-button" 
                    onclick={() => expanded = !expanded}
            >{expanded ? "read less" : "read more"}</button>
            <br><br>
        {/if}
        <span>
            {new Date(post.createdAt)
                .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                .toLowerCase()}, 
            {new Date(post.createdAt)
                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <form style="display:inline;" method="POST" use:enhance={() => {
            return async ({ result }) => { 
                if (result.type === 'success') {
                    validation = 'you have deleted this post';
                    deleted = true;
                    props.onDelete();
                } else if (result.type === 'failure') {
                    validation = `failed with status ${result.status}`;
                }
                await Promise.all([
                    invalidate('supabase:posts'),
                    invalidate('supabase:users')
                ]);
            }
        }}>
            <input type="hidden" name="id" value={post.id} />
            {#if post.deletable}
                <button style="margin-left:.5em;"
                        class="link-style-button" 
                        formaction="/post?/delete"
                >delete</button>
            {/if}
        </form>
        <form style="display:inline;" method=POST use:enhance={({ formElement }) => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    validation = 'replied !';
                    formElement.reset();
                    replying = !replying;
                    await Promise.all([
                        invalidate('supabase:posts'),
                        invalidate('supabase:users')
                    ]);
                }
            }
        }}>
            <input type="hidden" name="id" value={post.id} />
            {#if props.replies}
            <button style="margin-left:.5em;"
                    class="link-style-button" 
                    type="button"
                    onclick={() => replying = !replying}
            >reply</button>
            {/if}
            {#if replying}
                <textarea style="width:100%" rows=4 name="text"></textarea>
                <button formaction="/post?/reply">post</button>
            {/if}
        </form>
        <br><br>
    </div>
    {#each children as reply (reply.id)}
        <Post 
            post={reply} 
            replies={props.replies} 
            onDelete={async () => {
                await new Promise(r => setTimeout(r, 2000));
                children = children.filter((child: any) => child.id !== reply.id);
            }}/>
    {/each}
</div>