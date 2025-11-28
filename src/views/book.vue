<script setup>
import { matchedTags, db } from '@/stores'
import { bus, net } from '@/utils'
import { ref } from 'vue'
import { ctypes } from '@/scripts/search'
import singleselect from '@/parts/singleselect.vue'

let props = defineProps(['sbj'])
let sbj = props.sbj
let open = (id) => window.open(`https://bgm.tv/subject/${id}`)

let show = ref(false)
let count = JSON.parse(sbj.count)
let max = Math.max(...count)
let _ctypes = { ...ctypes }
delete _ctypes[0]
let api = `https://api.bgm.tv/v0/users/-/collections/${sbj.id}`
function rate(i) {
  if (sbj.rating == i) return
  net.postJson(api, { rate: +i })
  db.exec(`update bgm set rating=${i} where id=${sbj.id}`)
  sbj.rating = i
}
function chType(i) {
  net.postJson(api, { type: +i, rate: +sbj.rating })
  db.exec(`update bgm set ctype=${i} where id=${sbj.id}`)
}
function copy(s) {
  navigator.clipboard.writeText(s)
  bus.emit('toast', '已复制')
}
</script>

<template>
  <div class="sbj" :class="sbj.nsfw ? 'nsfw' : ''">
    <img
      class="thumb"
      loading="lazy"
      :src="`https://lain.bgm.tv/r/200/pic/cover/l/${sbj.images}`"
      @click="open(sbj.id)"
      @contextmenu.prevent="bus.emit('detail', sbj)" />
    <div class="infos">
      <div class="names hint">
        <span class="name_cn" @click="copy(sbj.name_cn || sbj.name)">
          {{ sbj.name_cn || sbj.name }}
        </span>
        <span class="name tips" v-if="sbj.name_cn" @click="copy(sbj.name)">
          {{ sbj.name }}
        </span>
      </div>
      <div class="info hint">
        <span @mouseenter="show = true">
          {{ sbj.platform }} {{ sbj.eps || sbj.volumes || sbj.total_episodes || 1 }}集
          {{ sbj.date?.slice(2).replaceAll('-', '/').replaceAll('/0', '/') }}
          排{{ sbj.rank }}
          <br />
          <span class="score">
            <span class="solid" :style="{ width: sbj.score * 10 + '%' }">★★★★★</span>
            <span>☆☆☆☆☆</span>
          </span>
          {{ sbj.score }}分 {{ sbj.total }}评
        </span>
        <div class="rating tips" v-if="show">
          <div class="chart">
            <div class="bar" v-for="(v, i) in count">
              <div class="val">{{ v }}</div>
              <div class="col" :style="{ height: (v / max) * 100 + '%' }"></div>
              <div class="idx">{{ i }}</div>
            </div>
          </div>
          <div class="other">
            {{ '想看:' + sbj.wish }} | {{ '在看:' + sbj.doing }} | {{ '看过:' + sbj.collect }} |
            {{ '搁置:' + sbj.on_hold }} |
            {{ '抛弃:' + sbj.dropped }}
          </div>
        </div>
      </div>
      <div class="tags">
        <button
          v-for="tag in sbj.tags"
          :class="{ match: matchedTags.has(tag) }"
          @click="bus.emit('append', tag)"
          @contextmenu.prevent="bus.emit('append', '!' + tag)">
          {{ tag }}
        </button>
      </div>
    </div>
    <div class="fav hint">
      <span class="tip">{{ ctypes[sbj.ctype] }}</span>
      <div class="tips">
        <div class="r">
          <singleselect :options="_ctypes" v-model="sbj.ctype" @click="chType(sbj.ctype)" />
        </div>
        <div class="rate" v-if="sbj.ctype">
          <div class="stars r">
            <span class="star">㊀</span>
            <span v-for="i in 10" class="star">☆</span>
          </div>
          <div class="stars gold r">
            <span class="star" @click="rate(0)"> </span>
            <span
              v-for="i in 10"
              class="star hint"
              :class="{ rating: sbj.rating == i }"
              @click="rate(i)">
              ★
              <span class="tips">{{ i }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/base.scss' as *;
.sbj {
  position: relative;
  contain: strict;
  content-visibility: auto;
  &:has(.info:hover) {
    contain: unset;
    content-visibility: unset;
  }
  border: var(--border);
  flex-direction: row;
  &.nsfw {
    border-color: orange;
  }
  .thumb {
    cursor: pointer;
    width: min-content;
    max-width: 50%;
    min-width: 180px;
  }
  .infos {
    position: relative;
    flex-shrink: 114514;
    min-width: 0;
    .names {
      cursor: copy;
      user-select: text;
      position: relative;
      background: black;
      .name_cn {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name {
        padding: var(--pad);
      }
      &:hover {
        min-width: fit-content;
      }
    }
    .info {
      position: static;
      display: block;
      width: fit-content;
      .score {
        position: relative;
        display: inline-flex;
        font-family: 'monospace';
        .solid {
          position: absolute;
          overflow: hidden;
          color: gold;
        }
      }
      .rating {
        top: unset;
        width: 100%;
        border: var(--border);
        padding: var(--pad);
        .chart {
          display: grid;
          grid: auto 1fr auto / auto-flow minmax(0, 1fr);
          aspect-ratio: 1;
          .bar {
            display: grid;
            grid-area: span 3;
            grid: subgrid / subgrid;
            place-items: center;
            .val {
              visibility: hidden;
            }
            .col {
              width: 100%;
              place-self: end;
              border: var(--thin);
            }
            &:hover .val {
              visibility: visible;
            }
            &:hover .col {
              background: var(--light);
            }
          }
        }
      }
    }
    .tags {
      flex-direction: row;
      flex-wrap: wrap;
      overflow: auto;
      &::-webkit-scrollbar {
        display: none;
      }
      button {
        border: var(--thin);
        &.match {
          color: yellow;
          border-color: yellow;
        }
      }
    }
  }
  .fav {
    position: absolute;
    right: 0;
    .r {
      flex-direction: row;
    }
    .tip {
      padding: var(--pad);
      background: var(--dark);
    }
    &:hover .tip {
      display: none;
    }
    > .tips {
      padding: var(--pad);
      left: unset;
      right: 0;
      .select {
        flex-direction: row;
        gap: var(--gap);
        :deep(.option) {
          border: var(--thin);
        }
      }
      .rate {
        position: relative;
        .stars {
          gap: 0;
          font-family: 'monospace';
          width: 100%;
          font-size: x-large;
          .star {
            text-align: center;
            flex: 1;
          }
          &.gold {
            position: absolute;
            color: gold;
            .star {
              opacity: 0;
              &.rating,
              &:hover,
              &:has(~ .rating, ~ :hover) {
                opacity: 1;
              }
              &:hover ~ .star {
                opacity: 0;
              }
            }
            .star {
              @include interactive;
              border-radius: 0;
              .tips {
                place-content: center;
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
