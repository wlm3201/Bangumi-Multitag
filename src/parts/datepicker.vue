<script setup>
import singleselect from './singleselect.vue'
import { reactive, useTemplateRef, watch } from 'vue'

let model = defineModel()
let inits = ['00', '00', '00']
let dates = reactive([...inits])
let pad = (n) => n.toString().padStart(2, '0')
let o
watch(model, (n) => {
  if (n == o) return
  if (!n) return dates.splice(0, 3, ...inits)
  let date = new Date(n * 1000)
  let [y, m, d] = [date.getFullYear() % 100, date.getMonth() + 1, date.getDate()]
  dates.splice(0, 3, pad(y), pad(m), pad(d))
})
watch(dates, (n) => {
  if (dates[0] == '00') return (o = model.value = undefined)
  o = model.value = `20${dates.join('-')}`
})
let dateRefs = useTemplateRef('dateRefs')
let years = [...Array(19)].map((_, i) => `${26 - i}`.padStart(2, '0'))
let months = [...Array(12)].map((_, i) => `${1 + i}`.padStart(2, '0'))
let days = [...Array(31)].map((_, i) => `${1 + i}`.padStart(2, '0'))
let sec = 0
function keydown(e, i) {
  if (e.key == 'ArrowRight') dateRefs.value[i + 1]?.focus()
  else if (e.key == 'ArrowLeft') dateRefs.value[i - 1]?.focus()
  if (isNaN(e.key)) return
  if (!sec) {
    dates[i] = e.key + dates[i][1]
    sec = 1
  } else {
    dates[i] = dates[i][0] + e.key
    dateRefs.value[i].blur()
    dateRefs.value[i + 1]?.focus()
  }
}
</script>

<template>
  <span class="datepicker hint">
    <template v-for="(d, i) in dates">
      <span
        tabindex="0"
        class="input"
        @keydown="(e) => keydown(e, i)"
        @blur="sec = 0"
        ref="dateRefs"
        >{{ d }}</span
      >{{ i < 2 ? '-' : '' }}
    </template>
    <div class="picker tips">
      <singleselect v-model="dates[0]" :options="years" />
      <singleselect v-model="dates[1]" :options="months" />
      <singleselect v-model="dates[2]" :options="days" />
    </div>
    <button @click="dates.splice(0, 3, ...inits)" class="clr">⌫</button>
  </span>
</template>

<style scoped lang="scss">
@use '@/assets/base.scss' as *;
.datepicker {
  position: relative;
  border: var(--border);
  width: max-content;
  .input {
    cursor: text;
    border-radius: 0;
    &:focus {
      background: var(--font);
      color: var(--bg);
    }
  }
  .clr {
    border: none;
    padding: 0;
    background: none;
    @include interactive;
  }
  .picker {
    flex-direction: row;
    height: 10em;
    .select {
      overflow: scroll;
      scrollbar-width: none;
      :deep() .option {
        border-radius: 0;
        padding: 0;
        background: none;
        @include interactive;
      }
    }
  }
}
</style>
