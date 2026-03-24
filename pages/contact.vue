<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('contact.title'), description: t('contact.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('contact.title'), url: '/contact' },
])

useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'YouFly',
    telephone: '+373 22 000 000',
    email: 'support@youfly.md',
    address: { '@type': 'PostalAddress', streetAddress: 'Str. Ștefan cel Mare 1', addressLocality: 'Chișinău', addressCountry: 'MD' },
  },
})

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitted = ref(false)
const isSubmitting = ref(false)
const { success } = useToast()

const submitError = ref('')

async function submitForm() {
  if (!form.name || !form.email || !form.message) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { name: form.name, email: form.email, subject: form.subject, message: form.message },
    })
    submitted.value = true
    success(t('contact.successMsg'))
  } catch (e: any) {
    submitError.value = e?.data?.message || t('contact.submitError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <DestinationPhoto code="OTP" :width="1200" height-class="relative text-white py-14 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/80"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
        </div>
        <h1 class="text-3xl font-black mb-3">{{ t('contact.title') }}</h1>
        <p class="text-gray-400">{{ t('contact.subtitle') }}</p>
      </div>
    </DestinationPhoto>
  <div class="max-w-4xl mx-auto px-4 py-12">

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Contact info -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-5 card-premium">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.phoneLabel') }}</h3>
          <a href="tel:+37322000000" class="text-brand-600 hover:underline">+373 22 000 000</a>
          <p class="text-xs text-gray-400 mt-1">{{ t('contact.phoneHours') }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5 card-premium">
          <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.emailLabel') }}</h3>
          <a href="mailto:support@youfly.md" class="text-brand-600 hover:underline text-sm">support@youfly.md</a>
          <p class="text-xs text-gray-400 mt-1">{{ t('contact.emailNote') }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5 card-premium">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.addressLabel') }}</h3>
          <p class="text-sm text-gray-600">{{ t('contact.addressText') }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5 card-premium">
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ t('contact.phoneHours') }}</h3>
          <p class="text-xs text-gray-400 mt-1">Weekend: 10:00-16:00</p>
        </div>
      </div>

      <!-- Contact form -->
      <div class="md:col-span-2">
        <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('contact.successTitle') }}</h2>
          <p class="text-gray-600 mb-4">{{ t('contact.successText') }}</p>
          <button @click="submitted = false; form.message = ''; form.name = ''; form.email = ''; form.subject = ''"
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
            <textarea id="contact-message" v-model="form.message" required rows="5" maxlength="5000" :placeholder="t('contact.formMessagePlaceholder')"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
            <div v-if="form.message.length > 0" class="text-xs text-right mt-1" :class="form.message.length > 4500 ? 'text-orange-500' : 'text-gray-400'">
              {{ form.message.length }} / 5000
            </div>
          </div>
          <button type="submit" :disabled="isSubmitting || !form.name || !form.email || !form.message"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <div role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ t('contact.sending') }}
            </span>
            <span v-else>{{ t('contact.send') }} <span aria-hidden="true">→</span></span>
          </button>
          <p v-if="submitError" role="alert" class="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{{ submitError }}</p>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>
