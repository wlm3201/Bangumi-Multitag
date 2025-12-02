let d = await navigator.storage.getDirectory()
let dh = await d.getDirectoryHandle('opfs', { create: true })

let s = (k) => String(k).replaceAll(/[\\/]/g, '')

export let opfs = {
  async set(k, v) {
    let fh = await dh.getFileHandle(s(k), { create: true })
    let w = await fh.createWritable()
    await w.write(v)
    await w.close()
  },
  async get(k) {
    try {
      let fh = await dh.getFileHandle(s(k))
      return await fh.getFile()
    } catch {}
  },
  async rmv(k) {
    try {
      await dh.removeEntry(k)
    } catch {}
  },
  async clr() {
    await dh.remove()
  },
}
