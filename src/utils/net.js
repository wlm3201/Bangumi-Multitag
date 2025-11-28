import { config } from '@/stores/misc'
import { watch } from 'vue'

let headers = {}
watch(
  config,
  () => (headers.Authorization = config.accessToken ? `Bearer ${config.accessToken}` : ''),
  { immediate: true },
)
export let net = {
  _fetch(u, o) {
    return fetch(u, { ...o, headers: { ...headers, ...o?.headers } })
  },
  get(u, p, o) {
    return this._fetch(`${u}?${new URLSearchParams(p)}`, o)
  },
  getSize(p) {
    return this._fetch(p, { method: 'HEAD' }).then((r) => +r.headers.get('content-length'))
  },
  post(u, o) {
    return this._fetch(u, {
      ...o,
      method: 'POST',
    })
  },
  postJson(u, d, o) {
    return this.post(u, {
      ...o,
      body: JSON.stringify(d),
      headers: { 'Content-Type': 'application/json' },
    })
  },
  postForm(u, d, o) {
    return this.post(u, {
      ...o,
      body: new URLSearchParams(d).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
}
