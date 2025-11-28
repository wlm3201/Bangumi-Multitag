let db = await new Promise((res, rej) => {
  let r = indexedDB.open('idb', 1)
  r.onsuccess = (e) => {
    let db = e.target.result
    if (db.objectStoreNames.contains('os')) res(db)
  }
  r.onupgradeneeded = (e) => {
    let db = e.target.result
    e.target.transaction.oncomplete = () => res(db)
    db.createObjectStore('os', { keyPath: 'k' })
  }
  r.onerror = (e) => rej(e)
  r.onblocked = (e) => rej(e)
})
function exec(f, o) {
  return new Promise((res, rej) => {
    let t = db.transaction(['os'], 'readwrite')
    let s = t.objectStore('os')
    let r = s[f](o)
    r.onsuccess = (e) => res(e.target.result?.v)
    r.onerror = (e) => rej(e.target.error)
  })
}
export let idb = {
  set(k, v) {
    return exec('put', { k, v })
  },
  get(k) {
    return exec('get', k)
  },
  rmv(k) {
    return exec('delete', k)
  },
  clr() {
    return exec('clear')
  },
}
