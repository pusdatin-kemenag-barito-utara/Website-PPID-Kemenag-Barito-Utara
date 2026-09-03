import { useEffect, useRef } from 'react';

declare global {
	interface Window {
		turnstile?: {
			render: (
				el: HTMLElement,
				opts: {
					sitekey: string;
					theme?: 'light' | 'dark' | 'auto';
					size?: 'normal' | 'compact' | 'flexible';
					callback: (token: string) => void;
					'expired-callback'?: () => void;
					'error-callback'?: (err: unknown) => void;
				},
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

type Props = {
	siteKey?: string;
	onToken: (token: string) => void;
	theme?: 'light' | 'dark' | 'auto';
	size?: 'normal' | 'compact' | 'flexible';
	className?: string;
};

export default function TurnstileWidget({
	siteKey = '',
	onToken,
	theme = 'auto',
	size = 'normal',
	className = '',
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	const onTokenRef = useRef(onToken);

	// Always keep the latest onToken reference without causing Turnstile re-renders
	useEffect(() => {
		onTokenRef.current = onToken;
	}, [onToken]);

	useEffect(() => {
		if (!siteKey) return;
		let disposed = false;

		const render = () => {
			if (disposed || widgetIdRef.current || !containerRef.current || !window.turnstile) return;
			try {
				if (containerRef.current) {
					containerRef.current.innerHTML = '';
				}

				const isDark = document.documentElement.classList.contains('dark');
				const resolvedTheme = theme === 'auto' ? (isDark ? 'dark' : 'light') : theme;

				widgetIdRef.current = window.turnstile.render(containerRef.current, {
					sitekey: siteKey,
					theme: resolvedTheme,
					size: size,
					callback: (token) => onTokenRef.current?.(token),
					'expired-callback': () => onTokenRef.current?.(''),
					'error-callback': () => {
						if (widgetIdRef.current && window.turnstile) {
							try {
								window.turnstile.reset(widgetIdRef.current);
							} catch {}
						}
						onTokenRef.current?.('');
					},
				});
			} catch (err) {
				console.warn('[Cloudflare Turnstile] Render error:', err);
			}
		};

		const runWhenReady = () => {
			if (window.turnstile) {
				render();
				return;
			}
			const existing = document.querySelector('script[src*="turnstile/v0/api.js"]');
			if (existing) {
				existing.addEventListener('load', render);
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = render;
			document.head.appendChild(script);
		};

		runWhenReady();

		return () => {
			disposed = true;
			if (widgetIdRef.current && window.turnstile) {
				try {
					window.turnstile.remove(widgetIdRef.current);
				} catch {}
				widgetIdRef.current = null;
			}
		};
	}, [siteKey, theme, size]);

	if (!siteKey) return null;

	return (
		<div
			ref={containerRef}
			className={`min-h-[65px] flex items-center justify-center [&>iframe]:mx-auto [&>div]:mx-auto ${className}`}
		/>
	);
}