<script setup>
import bgm from './pages/bgm.vue'
import toast from './parts/toast.vue'
</script>

<template>
  <Suspense>
    <bgm />
  </Suspense>
  <toast />
</template>

<style scoped lang="scss"></style>
