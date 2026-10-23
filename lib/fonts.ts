import localFont from 'next/font/local';

/**
 * Display face for names, section titles and the wheel: Bricolage Grotesque, variable in
 * weight and optical size, from the @fontsource-variable package. Bundled at build time,
 * so neither the build nor the browser ever contacts Google. Body text uses the system face.
 */
export const display = localFont({
  src: '../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-bricolage',
});
