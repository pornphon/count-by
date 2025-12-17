<template>
  <div id="app">
    <div class="correctness-header" v-if="runstate.correctnessLog.length">
      <i
        v-for="(val, i) in runstate.correctnessLog"
        :key="`icon-for-item-${i}`"
        class="fas"
        :class="{
          'fa-question-circle': val === undefined,
          'fa-circle-check': val === true,
          'fa-minus-circle': val === false,
          'active-question-icon': val === undefined && i === runstate.currentQuestionIndex
        }"
      />
    </div>

    <h1>Count By {{ step }}</h1>

    <div class="problem-line">
      <template v-for="(item, index) in runstate.activeQuestion.numberBoxes" :key="index">
        <NumberInput
          v-model="item.userInput"
          :locked="runstate.questionLocked || !item.missing"
          width="120px"
          :status="runstate.questionLocked && item.missing
                    ? (Number(item.userInput) === item.value ? 'correct-input' : 'incorrect-input')
                    : ''"
        />
        <span v-if="index !== runstate.activeQuestion.numberBoxes.length - 1" class="comma">,</span>
      </template>
    </div>

    <button
      :class="buttonClass"
      @click="handleButtonClick"
    >
      {{ buttonLabel }}
    </button>

    <div v-if="showStateButton" class="state-toggle" @click="showState = !showState">State</div>
    <pre v-if="showState" class="state-display">
parameters:
  step: {{ step }}
  min: {{ min }}
  max: {{ max }}
  sequenceLength: {{ sequenceLength }}
  missingCount: {{ missingCount }}
  numQuestions: {{ numQuestions }}

user run state: {{ runstate }}
    </pre>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed, reactive } from 'vue'
import NumberInput from './components/NumberInput.vue'
import randomQuestion from './randomQuestion.js'

const step = ref()
const min = ref()
const max = ref()
const sequenceLength = ref()
const missingCount = ref()
const numQuestions = ref()
const showStateButton = ref(false)

const runstate = reactive({})

const DEFAULTS = {
  step: 4,
  min: 1,
  max: 100,
  sequenceLength: 5,
  missingCount: 2,
  numQuestions: 3
}

const showState = ref(false)

const buttonLabel = computed(() => {
  if (!runstate.questionLocked) return 'Submit'
  if (runstate.questionLocked && !runstate.isCompleted) return 'Next'
  return 'Reset'
})

const buttonClass = computed(() => {
  if (!runstate.questionLocked) return 'submit-btn'
  if (runstate.questionLocked && !runstate.isCompleted) return 'next-btn'
  return 'reset-btn'
})

function parseParam(params, key, defaultValue, minAllowed) {
  const val = params.get(key)
  if (val !== null) {
    const n = Number(val)
    if (Number.isFinite(n) && (minAllowed === undefined || n >= minAllowed)) return n
  }
  return defaultValue
}

function generateQuestion() {
  return randomQuestion(
    step.value,
    min.value,
    max.value,
    sequenceLength.value,
    missingCount.value
  )
}

function initialize() {
  runstate.correctnessLog = new Array(numQuestions.value).fill(undefined)
  runstate.currentQuestionIndex = 0
  runstate.activeQuestion = generateQuestion()
  runstate.questionLocked = false
  runstate.isCompleted = false
}

function nextQuestion() {
  runstate.currentQuestionIndex++
  if (runstate.currentQuestionIndex < numQuestions.value) {
    runstate.activeQuestion = generateQuestion()
    runstate.questionLocked = false
  } else {
    runstate.isCompleted = true
  }
}

function handleButtonClick() {
  if (!runstate.questionLocked) {
    runstate.questionLocked = true
    const allCorrect = runstate.activeQuestion.numberBoxes.every(item => !item.missing || Number(item.userInput) === item.value)
    runstate.correctnessLog[runstate.currentQuestionIndex] = allCorrect
    if (allCorrect) playCorrectSound()
    else playIncorrectSound()
  } else if (!runstate.isCompleted) {
    nextQuestion()
  } else {
    initialize()
  }
}

function playCorrectSound() {
  const audio = new Audio('/correct.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {})
}

function playIncorrectSound() {
  const audio = new Audio('/incorrect.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {})
}

onBeforeMount(() => {
  const params = new URLSearchParams(window.location.search)
  step.value = parseParam(params, 'countBy', DEFAULTS.step, 1)
  min.value = parseParam(params, 'min', DEFAULTS.min)
  max.value = parseParam(params, 'max', DEFAULTS.max, min.value)
  sequenceLength.value = parseParam(params, 'sequenceLength', DEFAULTS.sequenceLength)
  missingCount.value = parseParam(params, 'missingCount', DEFAULTS.missingCount)
  numQuestions.value = parseParam(params, 'numQuestions', DEFAULTS.numQuestions)
  showStateButton.value = parseParam(params, 'showState', 0) === 1
  initialize()
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.problem-line {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.correctness-header i {
  margin: 0 3px;
  font-size: 1.5rem;
}

.comma {
  padding: 0 10px 0 2px;
  font-size: 2rem;
}

.fa-circle-check { color: limegreen; }
.fa-minus-circle { color: orangered; }
.fa-question-circle { color: grey; }

button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;
}

.submit-btn { background-color: #3498db; color: white; }
.submit-btn:hover { background-color: #2980b9; }

.next-btn { background-color: #f39c12; color: white; }
.next-btn:hover { background-color: #d35400; }

.reset-btn { background-color: #2ecc71; color: white; }
.reset-btn:hover { background-color: #27ae60; }

@keyframes pulse { 0%{transform:scale(1);}50%{transform:scale(1.2);}100%{transform:scale(1);} }
.active-question-icon { font-size:1.8rem; color:#1abc9c; animation:pulse 1.2s infinite ease-in-out; }

.state-toggle {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: #34495e;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  user-select: none;
}

.state-display {
  position: fixed;
  bottom: 50px;
  right: 10px;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 18px;
  width: 500px;
  height: calc(100vh - 140px);
  overflow: auto;
  white-space: pre-wrap;
  text-align: left;
}
</style>
