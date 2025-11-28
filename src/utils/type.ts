import type { Ref } from 'vue'
import { reactive, ref, toRaw, watch } from 'vue'
import { idb } from './idb'

export function sref<T>(k, v: T): Ref<T> {
  let _ref = ref(JSON.parse(localStorage.getItem(k)) || v)
  watch(_ref, (nv) => localStorage.setItem(k, JSON.stringify(nv)))
  return _ref
}
export function sreactive<T>(k, v: T): T {
  let _ref = reactive(JSON.parse(localStorage.getItem(k)) || v)
  watch(_ref, (nv) => localStorage.setItem(k, JSON.stringify(nv)))
  return _ref
}
export async function dref<T>(k, v: T): Promise<Ref<T>> {
  let _ref = ref((await idb.get(k)) || v)
  watch(_ref, (nv) => idb.set(k, nv))
  return _ref
}
export async function dreactive<T>(k, v: T): Promise<T> {
  let _ref = reactive((await idb.get(k)) || v)
  watch(_ref, (nv) => idb.set(k, toRaw(nv)))
  return _ref
}
