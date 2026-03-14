<script setup lang="ts">
const props = defineProps<{ current: 1 | 2 | 3 | 4 }>()
const { t } = useI18n()

const steps = computed(() => [
  { n: 1, label: t('steps.passengers') },
  { n: 2, label: t('steps.seats') },
  { n: 3, label: t('steps.payment') },
  { n: 4, label: t('steps.confirm') },
])
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 pt-6 pb-2">
    <div role="list" :aria-label="t('steps.progressLabel')" class="flex items-center justify-center gap-0">
      <template v-for="(step, i) in steps" :key="step.n">
        <div role="listitem" class="flex items-center gap-2"
          :aria-current="step.n === current ? 'step' : undefined">
          <div class="flex flex-col items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
              :class="{
                'bg-brand-600 text-white': step.n <= current,
                'bg-gray-200 text-gray-500': step.n > current,
              }"
              :aria-label="step.n < current ? t('steps.stepDone', { n: step.n, label: step.label }) : step.n === current ? t('steps.stepCurrent', { n: step.n, label: step.label }) : t('steps.stepPending', { n: step.n, label: step.label })"
            >
              <span v-if="step.n < current" aria-hidden="true">✓</span>
              <span v-else aria-hidden="true">{{ step.n }}</span>
            </div>
            <span class="text-xs mt-1 font-medium hidden sm:block"
              :class="step.n <= current ? 'text-brand-600' : 'text-gray-400'"
              aria-hidden="true">
              {{ step.label }}
            </span>
          </div>
        </div>
        <div v-if="i < steps.length - 1"
          class="flex-1 h-0.5 mx-2 max-w-[60px]"
          :class="step.n < current ? 'bg-brand-600' : 'bg-gray-200'"
        />
      </template>
    </div>
  </div>
</template>
