<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
</script>

<div class="main">
    <div class="logreg">
        {#if form?.error || form?.success}<p class="validation">{form?.message}</p>{/if}
        <form class="login" method="POST" use:enhance>
            <label>
                email:
                <input name="email" type="email" value={form?.email ?? ''}>
            </label>
            <label>
                password:
                <input name="password" type="password">
            </label>
            <button formaction="?/login">log in</button>
        </form>
        <form class="register" method="POST" use:enhance>
            <label>
                username:
                <input name="username" type="username">
            </label>
            <label>
                email:
                <input name="email" type="email">
            </label>
            <label>
                password:
                <input name="password" type="password">
            </label>
            <button formaction="?/register">register</button>
        </form>
    </div>
</div>