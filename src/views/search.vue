<script setup>
import checkbox from '@/parts/checkbox.vue'
import datepicker from '@/parts/datepicker.vue'
import multiselect from '@/parts/multiselect.vue'
import prompt from '@/parts/prompter.vue'
import singleselect from '@/parts/singleselect.vue'
import { order, parse, platforms, queries, reset, tips, ctypes } from '@/scripts/search'
import { db, stype } from '@/stores'
import { reg } from '@/utils'
import cloud from '@/views/cloud.vue'
import settings from '@/views/settings.vue'
import { watch, shallowReactive } from 'vue'

let orderby = {
  desc: '降序',
  asc: '升序',
}
let panel = shallowReactive({
  curr: undefined,
  toggle(comp) {
    this.curr = this.curr == comp ? undefined : comp
  },
})
reg('keydown', (e) => {
  let pd = 1
  if (e.ctrlKey && e.key == 'q') panel.toggle(settings)
  else if (e.ctrlKey && e.key == 'e') panel.toggle(cloud)
  else if (e.key == 'Escape') panel.toggle(null)
  else pd = 0
  if (pd) e.preventDefault()
})
let search = () => db.query(parse())
watch(stype, async () => {
  await db.reload()
  reset()
  search()
})
search()
</script>

<template>
  <div class="search">
    <button @click="panel.toggle(settings)" class="hint">
      设置
      <div class="tips">ctrl+q</div>
    </button>
    <button @click="panel.toggle(cloud)" class="hint">
      标签
      <div class="tips">ctrl+e</div>
    </button>
    <div class="hint">
      类别▽
      <singleselect class="tips" :options="{ 1: '书籍', 2: '动画', 4: '游戏' }" v-model="stype" />
    </div>
    <div class="hint">
      提示▽
      <div class="tips">{{ tips }}</div>
    </div>
    <prompt v-model="queries.search" @keydown.enter="search" />
    <div class="hint">
      平台▽
      <multiselect class="tips" :options="platforms" v-model="queries.platform" />
    </div>
    <div class="hint">
      状态▽
      <multiselect class="tips" :options="ctypes" v-model="queries.ctype" />
    </div>
    <datepicker v-model="queries.start" />
    <datepicker v-model="queries.end" />
    <div class="hint">
      {{ order[queries.order] }}▽
      <singleselect class="tips" :options="order" v-model="queries.order" />
    </div>
    <div class="hint">
      {{ orderby[queries.orderby] }}▽
      <singleselect class="tips" :options="orderby" v-model="queries.orderby" />
    </div>
    <label><checkbox v-model="queries.nsfw" />NSFW</label>
    <button @click="reset">重置</button>
    <button @click="search">搜索</button>
    <keep-alive>
      <component class="panel" :is="panel.curr" />
    </keep-alive>
  </div>
</template>

<style scoped lang="scss">
.search {
  flex-direction: row;
  place-items: center;
  border-bottom: var(--border);
  white-space: nowrap;
}
.panel {
  position: fixed;
  z-index: 1;
  top: 10vh;
  left: 10vw;
  height: 80vh;
  width: 80vw;
  border: var(--border);
  background: var(--dark);
  backdrop-filter: blur(100px);
  padding: 2em;
  flex-direction: column;
}
</style>
