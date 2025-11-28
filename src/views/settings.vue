<script setup>
import { config } from '@/stores'
import { crawler } from '@/scripts/crawler'
</script>

<template>
  <div class="settings">
    <span
      >用户名：
      <input v-model.lazy="config.username" />
      用于抓取收藏
    </span>
    <span>
      Access Token：
      <input v-model.lazy="config.accessToken" size="50" />
      从<a href="https://next.bgm.tv/demo/access-token" target="_blank">这里</a>获取，用于管理收藏
    </span>
    <span>
      抓取收藏条目：
      <button v-if="crawler.stats.stage == crawler.enums.init" @click="crawler.start">开始</button>
      <button v-else-if="crawler.stats.stage == crawler.enums.loading" @click="crawler.stop">
        停止
      </button>
      <button v-else-if="crawler.stats.stage == crawler.enums.done" @click="crawler.reset">
        清除
      </button>
      <progress :value="crawler.stats.pg" :max="crawler.stats.max"></progress>
      <span> {{ crawler.stats.pg }} / {{ crawler.stats.max }} </span>
    </span>
    <a href="https://github.com/wlm3201/Bangumi-Multitag" target="_blank">项目主页</a>
  </div>
</template>

<style scoped lang="scss"></style>
