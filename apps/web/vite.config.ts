import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ command }) => ({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		// Keep development independent of a regenerated package dist directory.
		alias:
			command === 'serve'
				? [
						{
							find: /^sveltick$/,
							replacement: fileURLToPath(
								new URL('../../packages/sveltick/src/index.ts', import.meta.url)
							)
						}
					]
				: []
	}
}));
