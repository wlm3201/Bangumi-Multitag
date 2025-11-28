<script setup>
import { sbjs, allTags, nsfwTags } from '@/stores'
import { Counter, bus } from '@/utils'
import { computed, onDeactivated, reactive, ref, shallowRef, watch } from 'vue'

let tabs = { 全部: null, NSFW: null, 当前: null }
for (let k in tabs) tabs[k] = k
let active = ref('')
let tags = shallowRef([])
let slice = reactive(Object.fromEntries(Object.keys(tabs).map((k) => [k, 300])))
onDeactivated(() => {
  for (let k in slice) slice[k] = 300
})

function alter(tab) {
  active.value = tab
  if (active.value == tabs.全部) tags = computed(() => allTags.value.slice(0, slice[active.value]))
  else if (active.value == tabs.NSFW)
    tags = computed(() => nsfwTags.value.slice(0, slice[active.value]))
  else if (active.value == tabs.当前)
    tags = computed(() => {
      let counter = new Counter()
      for (let sbj of sbjs.value) counter.count(sbj.tags)
      return counter.list()
    })
}
alter(tabs.当前)
function load(e) {
  let t = e.target
  if (t.scrollTop + 2 * t.clientHeight >= t.scrollHeight) slice[active.value] += 300
}
</script>

<template>
  <div class="cloud">
    <div class="tabs">
      <button v-for="tab in tabs" @click="alter(tab)" :class="{ active: active == tab }">
        {{ tab }}
      </button>
    </div>
    <div class="tags" @scroll="load">
      <button
        v-for="[tag, count] in tags"
        class="tag"
        @click="bus.emit('append', tag)"
        @contextmenu.prevent="bus.emit('append', '!' + tag)">
        <b>{{ tag }}</b>
        <small>{{ count }}</small>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  flex-direction: row;
}
.tags {
  flex-direction: row;
  flex-wrap: wrap;
  overflow: scroll;
  .tag {
    border: thin solid var(--light);
  }
}
</style>
