<script setup lang="ts">
const props = defineProps<{ current: 1 | 2 | 3 | 4 }>()
const { t } = useI18n()

const steps = computed(() => [
  { n: 1, label: t('steps.passengers'), svg: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { n: 2, label: t('steps.seats'), svg: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { n: 3, label: t('steps.payment'), svg: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { n: 4, label: t('steps.confirm'), svg: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
])
</script>

<template>
  <div class="bg-gray-950 border-b border-white/10">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div role="list" :aria-label="t('steps.progressLabel')" class="flex items-center justify-center gap-0">
        <template v-for="(step, i) in steps" :key="step.n">
          <div role="listitem" class="flex items-center gap-2"
            :aria-current="step.n === current ? 'step' : undefined">
            <div class="flex flex-col items-center">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                :class="{
                  'bg-brand-600 text-white shadow-lg shadow-brand-600/30': step.n === current,
                  'bg-brand-600/20 text-brand-400': step.n < current,
                  'bg-white/5 text-gray-600': step.n > current,
                }"
                :aria-label="step.n < current ? t('steps.stepDone', { n: step.n, label: step.label }) : step.n === current ? t('steps.stepCurrent', { n: step.n, label: step.label }) : t('steps.stepPending', { n: step.n, label: step.label })"
              >
                <svg v-if="step.n < current" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="step.svg"/></svg>
              </div>
              <span class="text-[10px] mt-1 font-semibold hidden sm:block"
                :class="step.n <= current ? 'text-brand-400' : 'text-gray-600'"
                aria-hidden="true">
                {{ step.label }}
              </span>
            </div>
          </div>
          <div v-if="i < steps.length - 1"
            class="flex-1 h-px mx-2 max-w-[60px] transition-colors"
            :class="step.n < current ? 'bg-brand-600/40' : 'bg-white/5'"
          />
        </template>
      </div>
    </div>
  </div>
</template>
