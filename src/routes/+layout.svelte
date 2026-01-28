<script lang="ts">
	import '../style.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { data, children } = $props();
	let { supabase, session, username } = $derived(data);
	let cantLogOut = $state(false);
	
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
		{#if username !== "PLACEHOLDER"}
		<form method="POST" use:enhance={() => {
				invalidate("supabase:auth");
				return;
			}}><p>hi {username} ! <button class="link-style-button" formaction="/logout">logout</button></p>
		</form>
		{/if}
	</nav>
	{@render children()}
	{#if cantLogOut}<p>whoops sorry cant log out : p</p>{/if}
</div>