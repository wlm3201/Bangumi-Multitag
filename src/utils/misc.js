import { idb } from './idb'

import mitt from 'mitt'
export let bus = mitt()

import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'
export function reg(ev, cb, o, el) {
  onMounted(() => (el || document).addEventListener(ev, cb, o))
  onActivated(() => (el || document).addEventListener(ev, cb, o))
  onDeactivated(() => (el || document).removeEventListener(ev, cb))
  onUnmounted(() => (el || document).removeEventListener(ev, cb))
}

let storage
try {
  storage = (await import('./opfs')).opfs
} catch {
  storage = idb
}
export { storage }

export class Counter {
  m = new Map()
  add(k) {
    this.m.set(k, this.m.get(k) + 1 || 1)
  }
  count(a) {
    for (let k of a) this.add(k)
  }
  list() {
    return [...this.m.entries()].sort((a, b) => b[1] - a[1])
  }
}

import { Archive } from 'libarchive.js'
import workerUrl from 'libarchive.js/dist/worker-bundle.js?url'
import wasmUrl from 'libarchive.js/dist/libarchive.wasm?url'
Archive.init({ workerUrl })
export async function unzip(b) {
  let a = await Archive.open(b)
  return await a.extractFiles()
}

import initSqlJs from 'sql.js'
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url'
let SQL = await initSqlJs({ locateFile: () => sqlWasm })
export let sqlite3 = async (b) => {
  let ab = await b.arrayBuffer()
  let u8 = new Uint8Array(ab)
  return new SQL.Database(u8)
}
