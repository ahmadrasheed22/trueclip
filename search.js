const axios = require('axios');
const cheerio = require('cheerio');

axios.post('https://html.duckduckgo.com/html/', 'q=tiktok open api video upload FILE_UPLOAD chunk_size', {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}).then(r => {
  require('fs').writeFileSync('out.html', r.data);
  const $ = cheerio.load(r.data);
  $('.result__snippet').each((i, el) => console.log($(el).text()));
}).catch(e => console.error(e));