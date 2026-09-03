/**
 * Enterprise Google Analytics 4 (GA4) & Google Tag Manager (GTM) Telemetry
 * Kantor Kementerian Agama Kabupaten Barito Utara - Portal PPID
 */

declare global {
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
	}
}

/**
 * Universal safe event dispatcher to GA4 and GTM dataLayer
 */
export function sendEvent(eventName: string, params: Record<string, any> = {}): void {
	if (typeof window === 'undefined') return;

	try {
		window.dataLayer = window.dataLayer || [];

		// Enhance params with timestamp and route context
		const enhancedParams = {
			page_location: window.location.href,
			page_path: window.location.pathname,
			timestamp: new Date().toISOString(),
			...params,
		};

		if (typeof window.gtag === 'function') {
			window.gtag('event', eventName, enhancedParams);
		} else {
			window.dataLayer.push({ event: eventName, ...enhancedParams });
		}
	} catch (err) {
		// Silent catch in production to prevent analytics errors from affecting UX
		if (import.meta.env.DEV) {
			console.warn('[Analytics Error]', eventName, err);
		}
	}
}

/**
 * Track user navigation across menus and dropdowns
 */
export function trackNavigation(title: string, href: string, section = 'main_nav'): void {
	sendEvent('nav_click', {
		event_category: 'navigation',
		event_label: title,
		menu_title: title,
		link_url: href,
		nav_section: section,
	});
}

/**
 * Track Call-to-Action (CTA) clicks
 */
export function trackCTA(buttonName: string, destination: string, section = 'hero'): void {
	sendEvent('cta_click', {
		event_category: 'engagement',
		event_label: buttonName,
		cta_name: buttonName,
		destination_url: destination,
		section: section,
	});
}

/**
 * Track form interactions (Permohonan, Keberatan, Pengaduan)
 */
export function trackFormStart(formName: string, serviceType = 'PERMOHONAN'): void {
	sendEvent('form_start', {
		event_category: 'form',
		event_label: formName,
		form_name: formName,
		service_type: serviceType,
	});
}

export function trackFormSubmit(formName: string, serviceType: string, ticketNo: string): void {
	sendEvent('form_submit', {
		event_category: 'form',
		event_label: `${formName} - ${ticketNo}`,
		form_name: formName,
		service_type: serviceType,
		ticket_no: ticketNo,
		value: 1, // Conversion signal
	});

	// GA4 Standard conversion event
	sendEvent('generate_lead', {
		currency: 'IDR',
		value: 0,
		service_type: serviceType,
		ticket_no: ticketNo,
	});
}

export function trackFormError(formName: string, errorMsg: string): void {
	sendEvent('form_error', {
		event_category: 'error',
		event_label: `${formName}: ${errorMsg}`,
		form_name: formName,
		error_message: errorMsg,
	});
}

/**
 * Track Ticket Search & Tracking actions
 */
export function trackTicketLookup(ticketNo: string, found: boolean, status?: string): void {
	sendEvent('track_ticket', {
		event_category: 'public_service',
		event_label: `Lookup: ${ticketNo}`,
		ticket_no: ticketNo,
		lookup_result: found ? 'found' : 'not_found',
		ticket_status: status ?? 'unknown',
	});
}

/**
 * Track copying ticket numbers
 */
export function trackCopyTicket(ticketNo: string, location = 'table'): void {
	sendEvent('copy_ticket', {
		event_category: 'engagement',
		event_label: `Copy Ticket ${ticketNo}`,
		ticket_no: ticketNo,
		action_location: location,
	});
}

/**
 * Track Document actions (viewing, downloading)
 */
export function trackDocumentAction(
	action: 'view' | 'download',
	title: string,
	category = 'Informasi Publik',
	fileUrl?: string
): void {
	sendEvent(action === 'download' ? 'file_download' : 'document_view', {
		event_category: 'document',
		event_label: title,
		document_title: title,
		document_category: category,
		file_url: fileUrl ?? '',
		file_extension: fileUrl?.split('.').pop() ?? 'pdf',
	});
}

/**
 * Track internal searches (Global Search, Table search)
 */
export function trackSearch(query: string, resultCount: number, location = 'global_search'): void {
	if (!query || query.trim().length === 0) return;
	sendEvent('search', {
		event_category: 'search',
		event_label: query,
		search_term: query,
		results_count: resultCount,
		search_location: location,
	});
}

/**
 * Track user contact and live support actions
 */
export function trackSupportContact(channel: 'whatsapp' | 'phone' | 'email', destination: string): void {
	sendEvent('contact_support', {
		event_category: 'support',
		event_label: `${channel}: ${destination}`,
		support_channel: channel,
		contact_target: destination,
	});
}

/**
 * Track UI Accessibility adjustments
 */
export function trackAccessibility(feature: string, value: string | number | boolean): void {
	sendEvent('accessibility_action', {
		event_category: 'accessibility',
		event_label: `${feature}: ${String(value)}`,
		feature_name: feature,
		feature_value: String(value),
	});
}

/**
 * Track theme change (dark / light)
 */
export function trackThemeChange(theme: 'light' | 'dark'): void {
	sendEvent('theme_change', {
		event_category: 'preference',
		event_label: `Theme: ${theme}`,
		selected_theme: theme,
	});
}
