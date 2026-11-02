// Takes one screenshot of the lab: node tools/shot.mjs "light=candle&view=three&still=1" out.png [WxH]
// Also prints draw calls, triangles and lights (the phone budget numbers) and any page errors.
import { serveRepo, openBrowser, openLab, labStats } from './lib/browser.mjs';

const [query = '', out = 'shot.png', size = '1280x720'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const server = await serveRepo(), browser = await openBrowser();
try {
  const page = await openLab(browser.context, server.url, query, { width, height });
  await page.screenshot({ path: out, timeout: 120000 });
  console.log(JSON.stringify({ out, query, ...(await labStats(page)), problems: page.problems }));
} finally { await browser.close(); await server.close(); }
