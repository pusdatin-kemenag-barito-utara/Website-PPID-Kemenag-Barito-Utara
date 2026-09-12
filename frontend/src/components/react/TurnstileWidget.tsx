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
		let pollTimer: ReturnType<typeof setInterval> | null = null;
		let attempts = 0;

		const tryRender = (): boolean => {
			if (disposed || widgetIdRef.current || !containerRef.current || !window.turnstile?.render) {
				return false;
			}
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
					callback: (token) => {
						if (!disposed) {
							onTokenRef.current?.(token);
						}
					},
					'expired-callback': () => {
						if (!disposed) {
							onTokenRef.current?.('');
						}
					},
					'error-callback': (err) => {
						console.warn('[Cloudflare Turnstile] Challenge error:', err);
						onTokenRef.current?.('');
					},
				});
				return true;
			} catch (err) {
				console.warn('[Cloudflare Turnstile] Render exception:', err);
				return false;
			}
		};

		const startPolling = () => {
			if (tryRender()) return;
			pollTimer = setInterval(() => {
				attempts++;
				if (tryRender() || attempts > 60) {
					if (pollTimer) clearInterval(pollTimer);
				}
			}, 100);
		};

		// Ensure the script tag is added
		const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]');
		if (!existingScript) {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = () => {
				startPolling();
			};
			document.head.appendChild(script);
		} else {
			startPolling();
		}

		return () => {
			disposed = true;
			if (pollTimer) clearInterval(pollTimer);
			if (widgetIdRef.current && window.turnstile?.remove) {
				try {
					window.turnstile.remove(widgetIdRef.current);
				} catch {}
				widgetIdRef.current = null;
			}
		};
	}, [siteKey, theme, size]);

	if (!siteKey) return null;

	const isFlexible = size === 'flexible';

	return (
		<div
			ref={containerRef}
			className={`min-h-[65px] w-full flex items-center ${
				isFlexible
					? 'justify-stretch [&>div]:w-full! [&>iframe]:w-full! [&>div]:max-w-full [&>iframe]:max-w-full'
					: 'justify-center [&>iframe]:mx-auto [&>div]:mx-auto'
			} ${className}`}
		/>
	);
}