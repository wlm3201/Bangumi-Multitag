import 'dotenv/config'
let token = process.env.TOKEN //https://next.bgm.tv/demo/access-token
let chii_auth = '' //cookie

import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import axios from 'axios'
import sqlite3 from 'better-sqlite3'
import cliProgress from 'cli-progress'
import _7z from '7zip-min'
let toParam = (params) => new URLSearchParams(params).toString()
let ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
let md = (...ps) =>
  Promise.allSettled(ps.map((p) => fs.access(p).catch(() => fs.mkdir(p, { recursive: true }))))
fs.exist = (p) =>
  fs
    .access(p)
    .then(() => true)
    .catch(() => false)
function getToken() {
  return axios
    .post(
      'https://next.bgm.tv/demo/access-tokens',
      { name: 'crawl', days: 7 },
      {
        headers: { 'User-Agent': ua, cookie: `chii_auth=${chii_auth}` },
        responseType: 'json',
      },
    )
    .then((r) => r.data)
}
let instance = axios.create({
  headers: {
    Authorization: `Bearer ${token}`,
    'User-Agent': ua,
  },
})
let stype, distDir, cacheDir, jsonDir
async function getData(type) {
  stype = String(type)
  let fp = url.fileURLToPath(import.meta.url)
  let dp = path.dirname(fp)
  distDir = path.join(dp, 'public', stype)
  cacheDir = path.join(dp, 'cache')
  jsonDir = path.join(cacheDir, stype)
  await md(jsonDir, distDir)
  await getSbjs()
  await todb()
  await countInfoKeys()
  await countTags()
  await countTags(1)
}
async function getSbjs() {
  let host = 'https://api.bgm.tv'
  let uri = '/v0/subjects'
  let params = {
    type: stype,
    sort: 'rank',
    limit: 100,
    offset: 0,
  }
  let bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(0, 0)
  while (1) {
    let cachePath = path.join(jsonDir, params.offset + '.json')
    if (await fs.exist(cachePath)) {
      bar.increment(100)
      params.offset += 100
      continue
    }
    try {
      let r = await instance.get(`${host}${uri}?${toParam(params)}`, { responseType: 'json' })
      let j = r.data
      bar.setTotal(j.total)
      await fs.writeFile(cachePath, JSON.stringify(j))
      bar.increment(j.data.length)
      params.offset += 100
      if (params.offset > j.total) break
    } catch (e) {
      if (e.response.data.description.startsWith('offset should be less than or equal to')) break
      console.log(e.message)
      process.exit()
    }
  }
  bar.stop()
}
async function todb() {
  function minify(j) {
    j.images = j.images.large.replace('https://lain.bgm.tv/pic/cover/l/', '')
    j.tags = j.tags
      .map((t) => t.name)
      .filter(
        (tag) =>
          !tag.match(/(?<!\d)(19\d\d|20[012]\d)(?!\d)/) &&
          !['OVA', 'WEB', 'TV', '剧场版', '日本'].includes(tag),
      )
    j.infobox = j.infobox.reduce((box, { key, value }) => {
      if (['中文名', '话数', '放送开始'].includes(key)) return box
      if (value instanceof Array) value = value.map((obj) => obj.v)
      box[key] = value
      return box
    }, {})
    delete j.type
    delete j.locked
    delete j.series
    delete j.meta_tags
    j.count = Object.values(j.rating.count)
    delete j.rating.count
    j = { ...j, ...j.rating, ...j.collection }
    delete j.rating
    delete j.collection
    return j
  }
  function init(j) {
    let cols = Object.keys(j)
    db.exec(`CREATE TABLE IF NOT EXISTS bgm (${cols.join(' INT,')} INT,PRIMARY KEY (id))`)
    return db.prepare(`INSERT OR IGNORE INTO bgm VALUES (${cols.map(() => '?').join(',')})`)
  }
  let dbpath = path.join(cacheDir, `bgm_${stype}.db`)
  if (await fs.exist(dbpath)) await fs.unlink(dbpath)
  let db = sqlite3(dbpath)
  db.pragma('journal_mode = WAL')
  let stmt
  for (let fn of await fs.readdir(jsonDir)) {
    let sbjs = JSON.parse(await fs.readFile(path.join(jsonDir, fn))).data.map(minify)
    if (!stmt) stmt = init(sbjs[0])
    for (let sbj of sbjs) {
      for (let [k, v] of Object.entries(sbj)) {
        if (v instanceof Object) sbj[k] = JSON.stringify(v)
        else if (typeof v === 'boolean') sbj[k] = +v
      }
      stmt.run(Object.values(sbj))
    }
  }
  db.exec(`alter table bgm add column heat`)
  db.exec(`update bgm set heat=wish+collect+doing+on_hold+dropped`)
  db.close()
  let zippath = dbpath.replace('.db', '.7z')
  await _7z.pack(dbpath, zippath)
  await fs.rename(zippath, path.join(distDir, 'bgm_7z'))
}
async function countTags(nsfw = 0) {
  let counter = {}
  for (let fn of await fs.readdir(jsonDir)) {
    let sbjs = JSON.parse(await fs.readFile(path.join(jsonDir, fn))).data
    for (let sbj of sbjs) {
      if (nsfw != sbj.nsfw) continue
      for (let { name, count } of sbj.tags) counter[name] = (counter[name] || 0) + count
    }
  }
  let tags = Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .filter(
      ([tag, count]) =>
        !tag.match(/(?<!\d)(19\d\d|20[012]\d)(?!\d)/) &&
        !['OVA', 'WEB', 'TV', '剧场版', '日本'].includes(tag) &&
        count > 1,
    )
  await fs.writeFile(path.join(distDir, (nsfw ? 'nsfw' : '') + 'tags.json'), JSON.stringify(tags))
}
async function countInfoKeys() {
  let counter = {}
  for (let fn of await fs.readdir(jsonDir)) {
    let sbjs = JSON.parse(await fs.readFile(path.join(jsonDir, fn))).data
    for (let sbj of sbjs) for (let { key } of sbj.infobox) counter[key] = (counter[key] || 0) + 1
  }
  let tags = Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .filter(([key, count]) => !['中文名', '话数', '放送开始'].includes(key) && count > 1)
  await fs.writeFile(path.join(distDir, 'infokeys.json'), JSON.stringify(tags))
}
async function main() {
  await getData(2)
  await getData(1)
  await getData(4)
}
main()
