<script setup>
import { ref, useTemplateRef, onMounted, nextTick, computed } from 'vue'
import { reg, bus } from '@/utils'
import { allTags } from '@/stores'

let dict = computed(() => allTags.value.map(([t, c]) => [t, c, t.toLowerCase()]))
let show = ref(false)
let inputRef = useTemplateRef('inputRef')
let input
onMounted(() => (input = inputRef.value))
reg(
  'keydown',
  (e) => e.ctrlKey && e.key.toLowerCase() == 'f' && (input.focus(), e.preventDefault()),
)

let text = defineModel()
let ph = ref('')
let prompts = ref([])
let curr = ref(0)
let promptLimit = 10
function getBound() {
  let start = input.selectionStart
  let end = input.selectionEnd
  let regex = /[ |!]/
  while (start > 0 && !regex.test(input.value[start - 1])) start--
  while (end < input.value.length && !regex.test(input.value[end])) end++
  return [start, end]
}
function select() {
  let [start, end] = getBound()
  input.selectionStart = start
  input.selectionEnd = end
}
async function moveCursor(dir, del) {
  let [start, end] = getBound()
  start == input.selectionStart && start > 0 && start--
  end == input.selectionEnd && end++
  if (del) {
    if (input.selectionStart != input.selectionEnd)
      [start, end] = [input.selectionStart, input.selectionEnd]
    if (dir == -1)
      text.value = text.value.substring(0, start) + text.value.substring(input.selectionEnd)
    if (dir == 1) {
      text.value = text.value.substring(0, input.selectionStart) + text.value.substring(end)
      end = input.selectionStart
    }
  }
  await nextTick()
  input.selectionStart = input.selectionEnd = dir == 1 ? end : start
  updatePrompts()
}
async function updatePrompts() {
  await new Promise((r) => requestAnimationFrame(r))
  ph.value = input.value.slice(0, input.selectionStart)
  let [start] = getBound()
  let prevWord = input.value.substring(start, input.selectionStart)
  prompts.value = getPrompts(prevWord)
  show.value = !!prompts.value.length
  curr.value = 0
}
function turn(b) {
  b == 1 && curr.value < prompts.value.length - 1 && curr.value++
  b == -1 && curr.value > 0 && curr.value--
}
async function pad() {
  if (!prompts.value.length) return
  let { t } = prompts.value[curr.value]
  let [start, end] = getBound()
  text.value = text.value.substring(0, start) + t + text.value.substring(end)
  await nextTick()
  input.selectionStart = input.selectionEnd = start + t.length
  input.focus()
}
function shotcuts(e) {
  let pd = true
  if (e.key == 'Tab') pad()
  else if (e.ctrlKey && e.key == 'd') select()
  else if (e.ctrlKey && e.key == 'ArrowRight') moveCursor(1)
  else if (e.ctrlKey && e.key == 'ArrowLeft') moveCursor(-1)
  else if (e.ctrlKey && e.key == 'Backspace') moveCursor(-1, 1)
  else if (e.ctrlKey && e.key == 'Delete') moveCursor(1, 1)
  else if (e.ctrlKey && e.key == ' ') turn(1)
  else if (e.shiftKey && e.key == ' ') turn(-1)
  else if (e.key == 'ArrowUp') turn(-1)
  else if (e.key == 'ArrowDown') turn(1)
  else if (e.key == 'Escape') input.blur()
  else pd = false
  if (pd) return e.preventDefault()
  if (e.key == 'ArrowRight') updatePrompts()
  else if (e.key == 'ArrowLeft') updatePrompts()
}
function getPrompts(w) {
  w = w.replaceAll(/['"_]/g, '').split('<')[0].toLowerCase()
  if (!w) return []
  let prompts = new Map()
  for (let [t, c, ti] of dict.value) {
    if (prompts.size >= promptLimit) break
    let m = ti.startsWith(w)
    if (!m) continue
    let l = [...Array(w.length).keys()]
    prompts.set(ti, { t, c, l: m ? l : [] })
  }
  for (let [t, c, ti] of dict.value) {
    if (prompts.size >= promptLimit) break
    if (prompts.has(ti)) continue
    if (!ti.startsWith(w[0])) continue
    let l = []
    let m = ti.split('').reduce((i, c, j) => (c == w[i] ? (l.push(j), ++i) : i), 0) == w.length
    if (!m) continue
    prompts.set(ti, { t, c, l: m ? l : [] })
  }
  return [...prompts.values()]
}
let prompter = useTemplateRef('prompter')
let blur = (e) => (show.value = prompter.value.contains(e.relatedTarget))
function append(tag) {
  let s = text.value && !text.value.endsWith(' ') ? ' ' : ''
  text.value += s + tag
  input.focus()
}
bus.on('append', append)
</script>

<template>
  <div class="prompter hint" @focusout="blur" ref="prompter">
    <input
      v-model="text"
      class="input"
      @input="updatePrompts"
      @keydown="shotcuts"
      ref="inputRef"
      @click="updatePrompts"
      @compositionupdate="updatePrompts"
      @focus="show = true" />
    <div class="prompts tips" v-if="show">
      <span class="shadow">{{ ph }}</span>
      <div v-if="prompts.length" class="list">
        <button
          class="prompt"
          v-for="(o, i) in prompts"
          :class="{ active: i == curr }"
          @click="((curr = i), pad())">
          <span>
            <span v-for="(c, i) in o.t" :class="{ h: o.l.includes(i) }">{{ c }}</span>
          </span>
          <div>{{ o.c }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.prompter {
  flex-grow: 1;
  .prompts {
    display: flex;
    flex-direction: row;
    background: none;
    backdrop-filter: none;
    .shadow {
      visibility: hidden;
    }
    .list {
      background: var(--dark);
      backdrop-filter: blur(var(--blur));
      gap: 0;
      .prompt {
        border: none;
        place-content: space-between;
        gap: 1rem;
        .h {
          background: yellow;
          color: var(--bg);
          border-radius: 0;
        }
      }
    }
  }
}
</style>
