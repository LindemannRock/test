/**
 * Translation Manager prompts.
 * Asks for translation category names used in Twig templates.
 */

import * as p from '@clack/prompts';
import { cancel } from '../utils/cancel.mjs';

export async function promptTranslationCategories() {
	p.log.info('Translation Manager uses category names to organize translations.\n' +
		'These map to filenames in translations/{lang}/{category}.php\n' +
		'and are used in Twig: {{ "Hello"|t("site") }}');

	return p.group(
		{
			primary: () =>
				p.text({
					message: 'Primary translation category',
					placeholder: 'site',
					initialValue: 'site',
					validate: (v) => {
						if (!v) return 'Category name is required';
						if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
					},
				}),
			form: () =>
				p.text({
					message: 'Form translation category',
					placeholder: 'formie',
					initialValue: 'formie',
					validate: (v) => {
						if (!v) return 'Category name is required';
						if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
					},
				}),
		},
		{ onCancel: () => cancel() },
	);
}
