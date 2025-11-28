import { config, db, stype } from '@/stores'
import { net, sreactive } from '@/utils'
import { watch, reactive } from 'vue'

export let enums = {
  init: Symbol(),
  loading: Symbol(),
  done: Symbol(),
}
for (let k in enums) enums[k] = k
let _stats = { pg: 0, max: 0, stage: enums.init }
let stats = _stats

async function start() {
  if (stats.stage != enums.init) return
  stats.stage = enums.loading
  stats.abort = 0
  crawl()
    .then(() => (stats.stage = enums.done))
    .catch(() => (stats.stage = enums.init))
    .finally(() => db.commit())
}

async function crawl() {
  while (1) {
    if (stats.abort) throw ''
    let r = await net.get(`https://api.bgm.tv/v0/users/${config.username}/collections`, {
      subject_type: stype.value,
      limit: 100,
      offset: stats.pg,
    })
    let j = await r.json()
    stats.max = j.total
    stats.pg += j.data.length
    update(j.data)
    if (stats.pg >= j.total) break
  }
}
function update(sbjs) {
  for (let sbj of sbjs) {
    let updated = new Date(sbj.updated_at).toLocaleString('zh-CN').replaceAll('/', '-')
    db.exec(
      `update bgm set ctype=${sbj.type},rating=${sbj.rate},updated='${updated}' where id=${sbj.subject.id}`,
    )
  }
}
function stop() {
  stats.abort = 1
}
function reset() {
  Object.assign(stats, _stats)
  db.exec(`update bgm set ctype=0,rating=0,updated='' where id=${sbj.subject.id}`)
}

export let crawler = reactive({ stats, enums, start, stop, reset })

watch(stype, () => (crawler.stats = stats = sreactive(`stats${stype.value}`, { ..._stats })), {
  immediate: true,
})
