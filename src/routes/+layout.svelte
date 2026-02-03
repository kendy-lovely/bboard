<script lang="ts">
	import '$lib/style.css';
	import favicon from '$lib/assets/favicon.svg';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { children, data } = $props();
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
		{#if session && data.validation !== 'logout'}
		<form method="POST" use:enhance={() => {
			document.body.classList.add('waiting');
				return async ({ result }) => {
					document.body.classList.remove('waiting');
					if (result.type === 'success') {
						goto(`${page.url.href}?validation=logout&user=${userData?.username}`, { invalidate: ['supabase:auth'] });
					}
				};
			}}><p>hi <a href="/{userData?.username}">{userData?.username}</a> ! <button class="link-style-button" formaction="/logout">logout</button></p>
		</form>
		{/if}
		{#if data.validation === 'logout' && data.username}<p class="validation">you have successfully logged out of {data.username}</p>{/if}
	</nav>
	<hr>
	{@render children()}
</div>