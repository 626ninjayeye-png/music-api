export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const name = req.query.name || '';
  if (!name) return res.json({ code: 400, msg: '请输入歌曲名' });

  const cookie = 'MUSIC_U=0032968E5BC3D2B90CE47F7251CF3882C756CFF4C971DFB947C2A9E8ECC54FB4A2F62A0E159318A5AFEB554EE0EE2C0938D9080B9E377D31986C67DD9933BCD06F3970005C8722CF3F28F48F6700BDCE2F9113D9C1848D28475BEFE101A3F5BE7CDAED9AD040E54A1360C0A9FD62E835E4743C86BC60AD3CAF1A35456CA9FDE74CD035BA462ED8B0B34A1939B5607D0FFBCD98D3AA0100655615931417F9922418AFA42292E79E438025427C5B99EE65B6BB9308474A535CCB8A5EAE13398651A02E901972F3445FB11AF8F3CB3B869C74E99F59162F182967ADD3622AAA6B545630A2B949F467A1D73C49B9EB077368ACCEB8EC2CC40FF4E49BE55EC8591EB847F2BF0770AD5EA63C23B5F91D84F0847AC1A1439B12AD2CD981E28F79D2CDE8A7273AFE07A55ABA0DE84A0338C91184C58F826B912A1C150B0CC8C5B5008B12EE27F76BD4F6A9605C17F89D3F4748B3B2521FEFB3BC31223D74491B5C45C3135C3D487B5D272D4A94EB7C8AEF149DB11F98F696A145EA5448FB33C3CAA302947A05B4589542BBE0BDA47A6585B067DD3A';

  try {
    const searchRes = await fetch(
      'https://music.163.com/api/search/get/web?s=' + encodeURIComponent(name) + '&type=1&offset=0&limit=1',
      { headers: { Cookie: cookie, Referer: 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }
    );
    const searchData = await searchRes.json();
    const song = searchData?.result?.songs?.[0];
    if (!song) return res.json({ code: 404, msg: '未找到歌曲' });

    const songId = song.id;
    const title = song.name;
    const singer = song.artists.map(a => a.name).join('/');
    const cover = song.album?.picUrl || '';
    const link = 'https://music.163.com/#/song?id=' + songId;
    const music_url = 'https://music.163.com/song/media/outer/url?id=' + songId + '.mp3';

    const lyricRes = await fetch(
      'https://music.163.com/api/song/lyric?id=' + songId + '&lv=1&tv=1',
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
