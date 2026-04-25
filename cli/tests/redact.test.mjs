import { describe, it, expect } from 'vitest';
import { redactSecrets } from '../utils/run.mjs';

describe('redactSecrets', () => {
	it('redacts --password=value', () => {
		expect(redactSecrets('cmd --password=hunter2')).toBe('cmd --password=***');
	});

	it('redacts --password=\'quoted\'', () => {
		expect(redactSecrets("cmd --password='hunter2'")).toBe('cmd --password=***');
	});

	it('redacts --password="double-quoted"', () => {
		expect(redactSecrets('cmd --password="hunter2"')).toBe('cmd --password=***');
	});

	it('redacts --password value (space-separated)', () => {
		expect(redactSecrets('cmd --password hunter2')).toBe('cmd --password ***');
	});

	it('redacts --token', () => {
		expect(redactSecrets('cmd --token=abc123')).toBe('cmd --token=***');
	});

	it('redacts --api-key', () => {
		expect(redactSecrets('cmd --api-key=sk_live_xyz')).toBe('cmd --api-key=***');
	});

	it('redacts --secret', () => {
		expect(redactSecrets('cmd --secret=s3cr3t')).toBe('cmd --secret=***');
	});

	it('redacts --key', () => {
		expect(redactSecrets('cmd --key=mykey123')).toBe('cmd --key=***');
	});

	it('preserves non-secret flags', () => {
		expect(redactSecrets('cmd --email=admin@x.com --name=test')).toBe('cmd --email=admin@x.com --name=test');
	});

	it('redacts multiple secrets in one string', () => {
		const input = 'cmd --password=secret --token=abc --email=ok@x.com';
		const result = redactSecrets(input);
		expect(result).toBe('cmd --password=*** --token=*** --email=ok@x.com');
	});

	it('handles empty string', () => {
		expect(redactSecrets('')).toBe('');
	});

	it('is case-insensitive', () => {
		expect(redactSecrets('cmd --Password=hunter2')).toBe('cmd --Password=***');
	});
});
