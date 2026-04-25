import { describe, it, expect } from 'vitest';
import { isValidEmail, shellEscape } from '../utils/validate.mjs';

describe('isValidEmail', () => {
	it('accepts standard emails', () => {
		expect(isValidEmail('hello@example.com')).toBe(true);
		expect(isValidEmail('user+tag@sub.domain.co.uk')).toBe(true);
		expect(isValidEmail('test.name@company.org')).toBe(true);
	});

	it('rejects emails without TLD', () => {
		expect(isValidEmail('hello@foo')).toBe(false);
	});

	it('rejects empty / nonsense', () => {
		expect(isValidEmail('')).toBe(false);
		expect(isValidEmail(null)).toBe(false);
		expect(isValidEmail(undefined)).toBe(false);
		expect(isValidEmail('not-an-email')).toBe(false);
		expect(isValidEmail('@missing-local.com')).toBe(false);
	});

	it('trims whitespace', () => {
		expect(isValidEmail('  hello@example.com  ')).toBe(true);
	});
});

describe('shellEscape', () => {
	it('wraps in single quotes', () => {
		expect(shellEscape('hello')).toBe("'hello'");
	});

	it('escapes internal single quotes', () => {
		expect(shellEscape("it's")).toBe("'it'\\''s'");
	});

	it('handles empty string', () => {
		expect(shellEscape('')).toBe("''");
	});

	it('handles strings with spaces and special chars', () => {
		expect(shellEscape('hello world $foo')).toBe("'hello world $foo'");
	});

	it('handles double quotes (no escaping needed inside single quotes)', () => {
		expect(shellEscape('say "hello"')).toBe("'say \"hello\"'");
	});
});
