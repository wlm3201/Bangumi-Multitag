<script setup>
import detail from '@/views/detail.vue'
import search from '@/views/search.vue'
import shelf from '@/views/shelf.vue'
</script>

<template>
  <div class="bgm">
    <search />
    <shelf />
    <detail />
  </div>
</template>

<style scoped lang="scss">
.bgm {
  gap: 0;
  height: 100vh;
}
</style>
