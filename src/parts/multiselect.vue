<script setup>
import { reg } from '@/utils'
let props = defineProps(['options', 'colors'])
let opts =
  props.options instanceof Array
    ? Object.fromEntries(props.options.map((item) => [item, item]))
    : props.options
let selected = defineModel()
let add = (k) => selected.value.includes(k) || selected.value.push(k)
let del = (k) => selected.value.includes(k) && selected.value.splice(selected.value.indexOf(k), 1)
let click = 0
let op = 1
function mousedown(k, e) {
  if (e.button == 1) for (let v of Object.keys(opts)) add(v)
  if (e.button == 2) selected.value.length = 0
  click = 1
  op = selected.value.includes(k)
  handle(k)
}
reg('mouseup', () => (click = 0))
function handle(k) {
  op ? del(k) : add(k)
}
</script>

<template>
  <div class="select">
    <button
      v-for="(v, k) in opts"
      class="option"
      :style="{ background: colors?.[k] }"
      :class="{ active: selected.includes(k) }"
      @contextmenu.prevent=""
      @mousedown="(e) => mousedown(k, e)"
      @mouseenter="click && handle(k)">
      {{ v }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.select {
  gap: 0;
  overflow: hidden;
  .option {
    text-align: center;
    border: none;
    border-radius: 0;
    &.active {
      background: var(--font);
      color: var(--bg);
    }
    &:hover {
      background: var(--light);
    }
  }
}
</style>
