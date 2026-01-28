<script lang="ts">
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
</script>

<div class="main">
    <div class="logreg">
        <form method="POST">
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
        <form method="POST">
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
        {#if form?.error}<p>{form?.message}</p>{/if}
        {#if form?.success}<p>{form?.message}</p>{/if}
    </div>
</div>