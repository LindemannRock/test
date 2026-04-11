/**
 * Shared input validators used across prompt modules.
 */

// Matches the standard Craft/RFC-ish email pattern: local@domain.tld with
// optional sub-labels. Rejects things like `hello@foo` (no TLD).
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(value) {
	return EMAIL_REGEX.test(String(value || '').trim());
}
