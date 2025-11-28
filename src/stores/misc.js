import { sreactive } from '@/utils'
import { ref, watch, reactive } from 'vue'

export let stype = ref(2)

export let allTags = ref([])
export let nsfwTags = ref([])
export let infokeys = ref([])
watch(
  stype,
  async (v) => {
    allTags.value = await fetch(`${v}/tags.json`).then((r) => r.json())
    nsfwTags.value = await fetch(`${v}/nsfwtags.json`).then((r) => r.json())
    infokeys.value = await fetch(`${v}/infokeys.json`)
      .then((r) => r.json())
      .then((j) => j.map(([k]) => k))
  },
  { immediate: true },
)

let _config = { username: '', accessToken: '' }
export let config = sreactive('config', _config)
export let matchedTags = reactive(new Set())
export let sbjs = ref([])
