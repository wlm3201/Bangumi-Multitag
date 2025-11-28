<script setup>
import detail from '@/views/detail.vue'
import search from '@/views/search.vue'
import shelf from '@/views/shelf.vue'

import { ref } from 'vue'
let show = ref(true)
</script>

<template>
  <div class="bgm">
    <search v-show="show" />
    <shelf />
    <detail />
    <button @click="show = !show" class="float">{{ show ? '×' : '+' }}</button>
  </div>
</template>

<style scoped lang="scss">
.bgm {
  gap: 0;
}
.float {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  border-radius: 100%;
  width: 3rem;
  height: 3rem;
  font-size: xx-large;
}
@media (min-width: 768px) {
  .float {
    display: none;
  }
}
</style>
