<script lang="ts">
	import '../style.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { Snippet } from 'svelte';
	import type { ActionData, PageData } from './$types'
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { children, data, form }: { children: Snippet, data: PageData, form: ActionData } = $props();
	let { supabase, session, userData } = $derived(data);
	
	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="outer">
	<nav>
		<a href="/">home</a>
		{#if userData?.username}
		<form method="POST" use:enhance={() => {
				invalidate("supabase:auth");
				return;
			}}><p>hi <a href="/{userData?.username}">{userData?.username}</a> ! <button class="link-style-button" formaction="/logout">logout</button></p>
		</form>
		{#if form?.error}<p>{form?.message}</p>{/if}
		{/if}
	</nav>
	{@render children()}
</div>