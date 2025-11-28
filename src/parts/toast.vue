<script setup>
import { ref } from 'vue'
import { bus } from '@/utils'
let msg = ref('')
let show = ref(false)
let timeout
bus.on('toast', (m) => {
  clearTimeout(timeout)
  msg.value = m
  show.value = true
  timeout = setTimeout(() => {
    show.value = false
  }, 2000)
})
</script>

<template>
  <div v-if="show" class="toast">{{ msg }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  z-index: 1;
  left: 50%;
  translate: -50% 0;
  bottom: 10%;
  padding: var(--pad);
  background: var(--dark);
  backdrop-filter: blur(var(--blur));
  font-size: xx-large;
}
</style>
