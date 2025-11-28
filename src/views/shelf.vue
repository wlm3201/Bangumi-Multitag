<script setup>
import { db, sbjs } from '@/stores'
import book from './book.vue'

function scroll(e) {
  let t = e.target
  if (t.scrollTop + 2 * t.clientHeight >= t.scrollHeight) db.loadnext()
}
</script>

<template>
  <div class="shelf" @scroll="scroll">
    <book v-for="sbj in sbjs" :sbj="sbj" :key="sbj.id" />
  </div>
</template>

<style scoped lang="scss">
.shelf {
  height: 100vh;
  overflow: scroll;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  grid-auto-rows: 270px;
  gap: 1rem;
}
@media (max-width: 768px) {
  .shelf {
    grid-template-columns: 1fr;
  }
}
</style>
