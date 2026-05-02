export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const name = req.query.name || '';
  if (!name) return res.json({ code: 400, msg: '请输入歌曲名' });

  const cookie = 'MUSIC_U=00D92B30EDD3BFA4EE2066AE56FCACE5E18E774C2E13A5743DC556E00161B16CD20FC5A4CF00D11E3906CDBED708BAF111F34C1AE7FECD7D938088C4CA07A4040CCB1D6E65CE2796AA31BB3D80853664F140BDC7E81D54BA86560AD1E6BE248C5141F145464EA2B80CB17B85846C27F7EF8743914C49651E01B6F1B8F463C3CEF6CC951319F0CA6E2ADB0747BEB441F85B4C59A6B4526215DC3CF48E32BCE7C38996B5268D8D5058B0B57D5BCF93B1D369CAC6FDC66D9AB1B9FBDBFD8B516E4963020E0F581E3B300BD9EF1EF0DFBEF2CE45A231687465990BC16FE447EC914C85833F54A92B808B2AD6F95F6D20D1A0A7B038AD58DFC73D7D9B78E40E7592A5E9C0790116964ECF70C960D3E4255B5948A750A1E9892B6AFB5B3136996811A9D8752A34F7220259EF3A1988A84DAA6980CBE90AFEB5D2B13AD2A494CA1D8CF212C4E33CF09C1617B671D62F45940890D5CE01C34DEF089B385AE90BD3EF18A67838B9D3721E08F85B221BC5EA12F024856E4F3053FB2066B1DF5970B9619E4A0C9203737E1A695F3C4DE7856BA8C2153157C666BC0F4B92ADC771EAA6EE937B9B';

  try {
    const searchRes = await fetch(
      `https://music.163.com/api/search/get/web?s=${encodeURIComponent(name)}&type=1&offset=0&limit=1`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/' } }
    );
    const searchData = await searchRes.json();
    const song = searchData?.result?.songs?.[0];
    if (!song) return res.json({ code: 404, msg: '未找到歌曲' });

    const songId = song.id;
    const title = song.name;
    const singer = song.artists.map(a => a.name).join('/');
    const albumId = song.album.id;

    const albumRes = await fetch(
      `https://music.163.com/api/album/${albumId}`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/' } }
    );
    const albumData = await albumRes.json();
    const cover = albumData?.album?.picUrl || '';

    const urlRes = await fetch(
      `https://music.163.com/api/song/enhance/player/url?ids=[${songId}]&br=320000`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/' } }
    );
    const urlData = await urlRes.json();
    const music_url = urlData?.data?.[0]?.url ||
      `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;

    const lyricRes = await fetch(
      `https://music.163.com/api/song/lyric?id=${songId}&lv=1&tv=1`,
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/' } }
    );
    const lyricData = await lyricRes.json();
    const lyric = (lyricData?.lrc?.lyric || '')
      .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
      .split('\n').filter(l => l.trim()).join('\n');

    res.json({
      code: 200,
      title,
      singer,
      cover,
      link: `https://music.163.com/#/song?id=${songId}`,
      music_url,
      lyric
    });
  } catch (e) {
    res.json({ code: 500, msg: '服务器错误' });
  }
}
