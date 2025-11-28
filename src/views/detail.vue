<script setup>
import { bus } from '@/utils'
import { ref } from 'vue'
let sbj = ref(null)
bus.on('detail', (b) => (sbj.value = b))
</script>

<template>
  <div class="mask" v-if="sbj" @click.self="sbj = null">
    <div class="detail">
      <img
        class="cover"
        :src="`https://lain.bgm.tv/pic/cover/l/${sbj.images}`"
        @click="sbj = null"
        loading="lazy" />
      <div class="summary">{{ sbj.summary }}</div>
      <div class="infobox">
        <span v-for="(v, k) in JSON.parse(sbj.infobox)">
          <b>{{ k }}</b
          >：
          {{ v instanceof Array ? v.join('，') : v }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin text {
  background: var(--dark);
  backdrop-filter: blur(var(--blur));
  padding: var(--pad);
  position: absolute;
  bottom: 0;
}
.mask {
  background: var(--dark);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.detail {
  user-select: text;
  position: fixed;
  height: 100vh;
  right: 50%;
  .cover {
    min-width: 33vw;
    height: 100%;
  }
  &:hover .summary {
    opacity: 1;
  }
  .summary {
    @include text;
    opacity: 0;
  }
  .infobox {
    @include text;
    left: 100%;
    width: 100%;
    height: 100%;
    overflow: scroll;
  }
}
</style>
