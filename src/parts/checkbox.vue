<script setup>
import { useTemplateRef, onMounted } from 'vue'
let checked = defineModel()

let checkbox = useTemplateRef('checkbox')
let self
onMounted(() => {
  self = checkbox.value
  self.indeterminate = true
  self.onclick = (e) => {
    e.preventDefault()
    click()
  }
  let click = () =>
    setTimeout(() => {
      if (self.indeterminate) {
        self.indeterminate = false
        self.checked = true
        checked.value = 1
      } else if (self.checked) {
        self.checked = false
        checked.value = 0
      } else {
        self.indeterminate = true
        checked.value = -1
      }
    })
})
</script>

<template>
  <input type="checkbox" ref="checkbox" />
</template>

<style scoped lang="scss"></style>
