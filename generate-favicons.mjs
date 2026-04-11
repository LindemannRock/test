/**
 * Favicon Generator
 *
 * Generates favicons for both EN and AR sites from a single source SVG/PNG.
 * Uses Sharp for image processing.
 *
 * Usage: node generate-favicons.mjs
 *
 * Source: src/img/favicon.svg (or .png)
 * Output: src/brand/favicons/{en,ar}/
 *
 * @author    LindemannRock
 * @link      https://lindemannrock.com
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE = './src/img/favicon.svg';
const LANGUAGES = ['en', 'ar'];
const APP_NAME_EN = process.env.npm_package_description || 'Site Name';
const APP_NAME_AR = 'اسم الموقع';
const THEME_COLOR = '#1a1a1a';
const BG_COLOR = '#ffffff';

const SIZES = {
	'favicon-16x16.png': 16,
	'favicon-32x32.png': 32,
	'favicon-48x48.png': 48,
	'apple-touch-icon.png': 180,
	'android-chrome-192x192.png': 192,
	'android-chrome-512x512.png': 512,
	'mstile-150x150.png': 150,
};

async function generateFavicons() {
	if (!fs.existsSync(SOURCE)) {
		console.error(`Source file not found: ${SOURCE}`);
		console.log('Create a favicon source at src/img/favicon.svg or favicon.png');
		process.exit(1);
	}

	for (const lang of LANGUAGES) {
		const outputDir = `./src/brand/favicons/${lang}`;
		fs.mkdirSync(outputDir, { recursive: true });

		const appName = lang === 'ar' ? APP_NAME_AR : APP_NAME_EN;
		const dir = lang === 'ar' ? 'rtl' : 'ltr';

		// Generate PNG favicons
		for (const [filename, size] of Object.entries(SIZES)) {
			await sharp(SOURCE).resize(size, size).png().toFile(path.join(outputDir, filename));
			console.log(`  ${lang}/${filename}`);
		}

		// Generate ICO (use 48x48 as source)
		await sharp(SOURCE).resize(48, 48).png().toFile(path.join(outputDir, 'favicon.ico'));

		// Generate SVG copy
		if (SOURCE.endsWith('.svg')) {
			fs.copyFileSync(SOURCE, path.join(outputDir, 'favicon.svg'));
		}

		// Generate web manifest
		const manifest = {
			name: appName,
			short_name: appName,
			dir: dir,
			lang: lang,
			icons: [
				{ src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
				{ src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
			],
			theme_color: THEME_COLOR,
			background_color: BG_COLOR,
			display: 'standalone',
		};

		fs.writeFileSync(path.join(outputDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

		// Generate webapp.html (included by head-meta.twig)
		const webappHtml = `<link rel="icon" type="image/svg+xml" href="/dist/assets/brand/favicons/${lang}/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/dist/assets/brand/favicons/${lang}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/dist/assets/brand/favicons/${lang}/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/dist/assets/brand/favicons/${lang}/apple-touch-icon.png">
<link rel="manifest" href="/dist/assets/brand/favicons/${lang}/site.webmanifest">
<meta name="theme-color" content="${THEME_COLOR}">`;

		fs.writeFileSync(path.join(outputDir, 'webapp.html'), webappHtml);

		console.log(`  ${lang}/site.webmanifest`);
		console.log(`  ${lang}/webapp.html`);
	}

	console.log('\nFavicons generated successfully.');
}

generateFavicons().catch(console.error);
