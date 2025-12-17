<template>
  <Suspense>
    <template #default>
      <CountBy
        v-bind="{
          step,
          min,
          max,
          sequenceLength,
          missingCount,
          numQuestions,
          showStateButton
        }"
      />
    </template>

    <template #fallback>
      <div>
        Loading application...
      </div>
    </template>
  </Suspense>
</template>

<script setup>
  import CountBy from './CountBy.vue'

  const DEFAULTS = {
    step: 4,
    min: 1,
    max: 100,
    sequenceLength: 5,
    missingCount: 2,
    numQuestions: 3
  }

  const params = new URLSearchParams(window.location.search)
  const step = parseParam(params, 'countBy', DEFAULTS.step, 1)
  const min = parseParam(params, 'min', DEFAULTS.min)
  const max = parseParam(params, 'max', DEFAULTS.max, min.value)
  const sequenceLength = parseParam(params, 'sequenceLength', DEFAULTS.sequenceLength)
  const missingCount = parseParam(params, 'missingCount', DEFAULTS.missingCount)
  const numQuestions = parseParam(params, 'numQuestions', DEFAULTS.numQuestions)
  const showStateButton = parseParam(params, 'showState', 0) === 1

  function parseParam(params, key, defaultValue, minAllowed) {
    const val = params.get(key)
    if (val !== null) {
      const n = Number(val)
      if (Number.isFinite(n) && (minAllowed === undefined || n >= minAllowed)) return n
    }
    return defaultValue
  }
</script>
