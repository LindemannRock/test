/**
 * Main Application Entry Point
 *
 * @author    LindemannRock
 * @link      https://lindemannrock.com
 * @copyright Copyright (c) 2026 LindemannRock
 */

import '../css/global.css';
import Alpine from 'alpinejs';

declare global {
	interface Window {
		Alpine: typeof Alpine;
	}
}

// Initialize Alpine.js
window.Alpine = Alpine;

// Session params store — captures URL params/hash and persists in sessionStorage
// Supports: #webview mode, UTM tracking, custom params
Alpine.store('session', {
	_config: {
		mode: ['hideHeader', 'hideFooter'],
		utm: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
		custom: [],
	},

	hideHeader: false,
	hideFooter: false,
	utm_source: null as string | null,
	utm_medium: null as string | null,
	utm_campaign: null as string | null,
	utm_term: null as string | null,
	utm_content: null as string | null,

	init() {
		const urlParams = new URLSearchParams(window.location.search);
		const hash = window.location.hash;
		const isReset = hash.includes('reset') || urlParams.has('resetSession');

		if (isReset) {
			['hideHeader', 'hideFooter'].forEach((param: string) => {
				sessionStorage.removeItem(param);
			});
			this.hideHeader = false;
			this.hideFooter = false;
		} else if (hash.includes('webview')) {
			this.hideHeader = true;
			this.hideFooter = true;
			sessionStorage.setItem('hideHeader', 'true');
			sessionStorage.setItem('hideFooter', 'true');
		}

		const allParams = [...this._config.mode, ...this._config.utm, ...this._config.custom];

		allParams.forEach((param: string) => {
			if (isReset && this._config.mode.includes(param)) return;

			if (urlParams.has(param)) {
				const rawValue = urlParams.get(param);
				if (rawValue === 'false' || rawValue === '0') {
					(this as any)[param] = false;
					sessionStorage.removeItem(param);
				} else {
					const value = rawValue || 'true';
					(this as any)[param] = value === 'true' || value === '1' ? true : value;
					sessionStorage.setItem(param, String((this as any)[param]));
				}
			} else {
				const stored = sessionStorage.getItem(param);
				if (stored !== null) {
					(this as any)[param] =
						stored === 'true' ? true : stored === 'false' ? false : stored;
				}
			}
		});
	},

	getUtmParams() {
		const params: Record<string, string> = {};
		this._config.utm.forEach((key: string) => {
			const value = (this as any)[key];
			if (value) params[key] = String(value);
		});
		return params;
	},

	toQueryString() {
		const params = new URLSearchParams();
		[...this._config.mode, ...this._config.utm, ...this._config.custom].forEach(
			(key: string) => {
				const value = (this as any)[key];
				if (value && value !== false) {
					params.set(key, String(value));
				}
			},
		);
		return params.toString();
	},
});

// Load Alpine collapse plugin only if needed
const hasCollapse = document.querySelector('[x-collapse]');

if (hasCollapse) {
	import('@alpinejs/collapse').then((module) => {
		Alpine.plugin(module.default);
		Alpine.start();
	});
} else {
	Alpine.start();
}

// Lazy load Swiper on pages that use it
if (document.querySelector('.swiper')) {
	import('swiper').then(() => {
		console.log('Swiper loaded');
	});
}

// Lazy load mmenu for mobile navigation
if (document.querySelector('#mmenu-mobile')) {
	import('mmenu-js').then(() => {
		console.log('Mobile menu loaded');
	});
}

// HMR
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('HMR');
	});
}
