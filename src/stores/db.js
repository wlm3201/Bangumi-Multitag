import { dreactive, net, sqlite3, storage, unzip } from '@/utils'
import { sbjs, stype } from './misc'

let p
let cdb
let stmt
let finalized
let loading
let transaction
async function reload() {
  p = `${stype.value}/bgm_7z`
  cdb = await load()
  await merge()
}
async function load() {
  let os = localStorage.getItem(p)
  console.log('os', os)
  if (!os) return await loadNew()
  let s = await net.getSize(p)
  console.log('s', s)
  if (+os == s) return await loadOld()
  let ndb = await loadNew()
  let odb = await loadOld()
  migrate(odb, ndb)
  return ndb
}
async function loadNew() {
  let r = await fetch(p)
  let b = await r.blob()
  let o = await unzip(b)
  let f = Object.values(o)[0]
  let ndb = await sqlite3(f)
  console.log('b', b.size)
  localStorage.setItem(p, b.size)
  init(ndb)
  save(ndb)
  return ndb
}
function init(db) {
  db.exec(`alter table bgm add column rating default 0`)
  db.exec(`alter table bgm add column ctype default 0`)
  db.exec(`alter table bgm add column updated default ''`)
}
async function loadOld() {
  let b = await storage.get(p)
  return sqlite3(b)
}
function migrate(odb, ndb) {
  ndb.exec(`attach database ${odb.filename} as old`)
  ndb.exec(`update bgm set rating=o.rating,ctype=o.ctype from old.bgm o where bgm.id=o.id`)
  save(ndb)
}
function save(db = cdb) {
  storage.set(p, new Blob([db.export()]))
}
async function merge() {
  transaction = await dreactive(`transaction${stype.value}`, [])
  if (!transaction.length) return
  cdb.exec(transaction.join(';'))
  commit()
}
function commit() {
  transaction.length = 0
  save()
}
function query(sql) {
  stmt = cdb.prepare(sql)
  finalized = 0
  sbjs.value = getNext(25)
}
function getNext(n) {
  let sbjs = []
  if (finalized) return sbjs
  for (let _ of Array(n)) {
    if (!stmt.step()) {
      finalized = 1
      stmt.free()
      break
    }
    let sbj = stmt.getAsObject()
    sbj.tags = JSON.parse(sbj.tags)
    sbjs.push(sbj)
  }
  return sbjs
}
function loadnext() {
  if (loading) return console.log('loading')
  loading = 1
  sbjs.value.push(...getNext(25))
  loading = 0
}
function exec(sql, db = cdb) {
  transaction.push(sql)
  return db.exec(sql)
}
export let db = {
  reload,
  query,
  loadnext,
  exec,
  commit,
}
await db.reload()

window.db = db
