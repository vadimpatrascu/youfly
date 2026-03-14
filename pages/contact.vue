<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('contact.title'), description: t('contact.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('contact.title'), url: '/contact' },
])

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitted = ref(false)
const isSubmitting = ref(false)
const { success } = useToast()

async function submitForm() {
  if (!form.name || !form.email || !form.message) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000)) // Simulate submission
  submitted.value = true
  isSubmitting.value = false
  success(t('contact.successMsg'))
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div aria-hidden="true" class="text-5xl mb-4">📬</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('contact.title') }}</h1>
      <p class="text-gray-500">{{ t('contact.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Contact info -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div aria-hidden="true" class="text-2xl mb-3">📞</div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.phoneLabel') }}</h3>
          <a href="tel:+37322000000" class="text-brand-600 hover:underline">+373 22 000 000</a>
          <p class="text-xs text-gray-400 mt-1">{{ t('contact.phoneHours') }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div aria-hidden="true" class="text-2xl mb-3">✉️</div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.emailLabel') }}</h3>
          <a href="mailto:support@youfly.md" class="text-brand-600 hover:underline text-sm">support@youfly.md</a>
          <p class="text-xs text-gray-400 mt-1">{{ t('contact.emailNote') }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div aria-hidden="true" class="text-2xl mb-3">📍</div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.addressLabel') }}</h3>
          <p class="text-sm text-gray-600">{{ t('contact.addressText') }}</p>
        </div>
      </div>

      <!-- Contact form -->
      <div class="md:col-span-2">
        <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div aria-hidden="true" class="text-5xl mb-4">✅</div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('contact.successTitle') }}</h2>
          <p class="text-gray-600 mb-4">{{ t('contact.successText') }}</p>
          <button @click="submitted = false; form.message = ''; form.name = ''; form.email = ''"
            class="px-6 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {{ t('contact.sendAnother') }}
          </button>
        </div>
        <form v-else @submit.prevent="submitForm" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-1">{{ t('contact.formName') }}</label>
              <input id="contact-name" v-model="form.name" type="text" required :placeholder="t('contact.formNamePlaceholder')"
                autocomplete="name"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-1">{{ t('contact.formEmail') }}</label>
              <input id="contact-email" v-model="form.email" type="email" required :placeholder="t('contact.formEmailPlaceholder')"
                autocomplete="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label for="contact-subject" class="block text-sm font-medium text-gray-700 mb-1">{{ t('contact.formSubject') }}</label>
            <select id="contact-subject" v-model="form.subject"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">{{ t('contact.formSubjectDefault') }}</option>
              <option value="booking">{{ t('contact.subjectBooking') }}</option>
              <option value="payment">{{ t('contact.subjectPayment') }}</option>
              <option value="cancel">{{ t('contact.subjectCancel') }}</option>
              <option value="technical">{{ t('contact.subjectTechnical') }}</option>
              <option value="other">{{ t('contact.subjectOther') }}</option>
            </select>
          </div>
          <div>
            <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-1">{{ t('contact.formMessage') }}</label>
            <textarea id="contact-message" v-model="form.message" required rows="5" :placeholder="t('contact.formMessagePlaceholder')"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting || !form.name || !form.email || !form.message"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <div role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ t('contact.sending') }}
            </span>
            <span v-else>{{ t('contact.send') }} <span aria-hidden="true">→</span></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
