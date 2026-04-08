<script setup>
let props = defineProps(['options'])
let a = props.options instanceof Array
let selected = defineModel()
function wheel(e) {
  let el = e.target.closest('.select')
  if (e.deltaY < 0) el.scrollBy({ top: -el.clientHeight, behavior: 'smooth' })
  else el.scrollBy({ top: el.clientHeight, behavior: 'smooth' })
}
</script>
<template>
  <div class="select" @wheel.prevent="wheel">
    <button
      v-for="(v, k, i) in options"
      class="option"
      :class="{ active: selected == (a ? v : k) }"
      @click="selected = a ? v : k">
      {{ v }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.select {
  gap: 0;
  .option {
    text-align: center;
    border: none;
  }
}
</style>
