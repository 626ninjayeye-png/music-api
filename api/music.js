export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const name = req.query.name || '';
  if (!name) return res.json({ code: 400, msg: '请输入歌曲名' });

  const cookie = 'MUSIC_U=你的MUSIC_U值';

  try {
    const searchRes = await fetch(
      `https://music.163.com/api/search/get/web?s=${encodeURIComponent(name)}&type=1&offset=0&limit=1`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }
    );
    const searchData = await searchRes.json();
    const song = searchData?.result?.songs?.[0];
    if (!song) return res.json({ code: 404, msg: '未找到歌曲' });

    const songId = song.id;
    const title = song.name;
    const singer = song.artists.map(a => a.name).join('/');
    const cover = song.album?.picUrl || `https://p1.music.126.net/UeTuwE7pvjBpypWLudqukA==/${song.album?.picId}.jpg`;
    const link = `https://music.163.com/#/song?id=${songId}`;
    const music_url = `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;

    const lyricRes = await fetch(
      `https://music.163.com/api/song/lyric?id=${songId}&lv=1&tv=1`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0' } }
    );
    const lyricData = await lyricRes.json();
    const lyric = (lyricData?.lrc?.lyric || '')
      .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
      .split('\n').filter(l => l.trim()).join('\n');

    res.json({ code: 200, title, singer, cover, link, music_url, lyric });
  } catch (e) {
    res.json({ code: 500, msg: e.message });
  }
}
