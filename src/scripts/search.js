import { reactive, ref } from 'vue'
export let tips = ref(`空格：与
|：或
!：非
>：大于
=：等于
<：小于

标签
标签：排名
信息：内容

n：名称
y：月份
t：评分数
s：评分
r：排名
e：集数
h：收藏数
w：想看
c：看过
d：在看
o：搁置
dr：抛弃
sr：自评
`)
let cols = {
  y: "CAST(strftime('%m', date) AS INT)",
  t: 'total',
  s: 'score',
  r: 'rank',
  e: 'eps',
  h: 'heat',
  w: 'wish',
  c: 'collect',
  d: 'doing',
  o: 'on_hold',
  dr: 'dropped',
  sr: 'rating',
}
export let order = {
  total: '评分数',
  score: '评分',
  rank: '排名',
  date: '日期',
  eps: '集数',
  heat: '收藏数',
  wish: '想看',
  collect: '看过',
  doing: '在看',
  on_hold: '搁置',
  dropped: '抛弃',
  rating: '自评',
}
export let platforms = ['TV', '剧场版', 'OVA', 'WEB', '其他']
export let ctypes = { 0: '未收藏', 1: '想看', 2: '看过', 3: '在看', 4: '搁置', 5: '抛弃' }
let _queries = {
  search: '',
  nsfw: -1,
  platform: [...platforms],
  start: '',
  end: '',
  order: 'total',
  orderby: 'desc',
  ctype: Object.keys(ctypes).map(String),
  rating: 0,
}
export let queries = reactive(structuredClone(_queries))
export let reset = () => Object.assign(queries, _queries)
import { infokeys, matchedTags } from '@/stores'
function parseTerm(term) {
  term = term
    .replace(/(?<!:)<|(?<!:)>|(?<!:)=/, ':$&')
    .replace('：', ':')
    .replace(/^！/, '!')
  let not = ''
  if (term.startsWith('!')) {
    not = 'not '
    term = term.slice(1)
  }
  let [k, v] = term.split(':')
  if (k == 'n')
    return `${not}name||name_cn||coalesce(json_extract(infobox,'$.别名'),'') like '%${v.replace(
      '=',
      '',
    )}%'`
  let col = cols[k]
  if (!col) {
    if (infokeys.value.includes(k))
      return `${not}json_extract(infobox,'$.${k}') like '%${v.replaceAll('=', '')}%'`
    not == '' && matchedTags.add(k)
    if (v) {
      if (['=', '>', '<'].every((c) => !v.startsWith(c))) v = '<' + v
      return `${not}EXISTS (SELECT 1 FROM json_each(tags) WHERE value = '${k}' AND key ${v})`
    }
    return `${not}tags like '%${k}%'`
  }
  if (['=', '>', '<'].every((c) => !v.startsWith(c))) v = '=' + v
  return `${not}${col}${v}`
}
export function parse() {
  let text = queries.search.trim()
  let terms = text.match(/[^\s"]+|"[^"]*"/g) || []
  terms ||= []
  let ands = []
  matchedTags.clear()
  for (let term of terms) {
    let subterms = term.split('|')
    let ors = []
    for (let subterm of subterms) {
      if (subterm == '') continue
      let clause = parseTerm(subterm)
      clause && ors.push(clause)
    }
    ors.length && ands.push(`(${ors.join(' or ')})`)
  }
  queries.nsfw != -1 && ands.push('nsfw=' + queries.nsfw)
  queries.platform.length != 5 &&
    ands.push(`platform in (${[...queries.platform].map((p) => `'${p}'`).join(',')})`)
  queries.ctype.length != 6 &&
    ands.push(`ctype in (${[...queries.ctype].map((p) => `${p}`).join(',')})`)
  queries.start && ands.push(`date>'${queries.start}'`)
  queries.end && ands.push(`date<'${queries.end}'`)
  let select = 'select * from bgm'
  let where = ands.length ? ' where ' + ands.join(' and ') : ''
  let order = ` order by ${queries.order} ${queries.orderby}`
  let sql = select + where + order
  console.log(sql)
  return sql
}
