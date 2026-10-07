<a class="skip-link" href="#main">Skip to content</a>
<nav class="site-nav grey-underline" aria-label="Main navigation">
	<a class="brand" href="/">Sveltick.</a>
	<div class="nav-links">
		<a href="/introduction">Introduction</a>
		<a href="/documentation">Documentation</a>
		<a href="/blog">Blog</a>
		<a href="/showcase">Showcase</a>
	</div>
</nav>

<style>
	.site-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		padding: 1rem;
	}
	.brand {
		font-size: 2rem;
	}
	.nav-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.5rem;
	}
	.nav-links a {
		text-decoration: underline;
		text-underline-offset: 0.25rem;
	}
	.skip-link {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.skip-link:focus {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
		width: auto;
		height: auto;
		padding: 0.75rem;
		clip-path: none;
		z-index: 20;
	}
	@media (min-width: 768px) {
		.site-nav {
			padding: 1.5rem 2rem;
		}
	}
</style>
