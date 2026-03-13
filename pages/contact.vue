<script setup lang="ts">
useHead({ title: 'Contact — YouFly' })

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
  success('Mesajul a fost trimis cu succes!')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div class="text-5xl mb-4">📬</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Contactează-ne</h1>
      <p class="text-gray-500">Suntem aici să te ajutăm. Scrie-ne și îți răspundem în 24 de ore.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Contact info -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="text-2xl mb-3">📞</div>
          <h3 class="font-semibold text-gray-900 mb-1">Telefon</h3>
          <a href="tel:+37322000000" class="text-brand-600 hover:underline">+373 22 000 000</a>
          <p class="text-xs text-gray-400 mt-1">Luni–Vineri, 9:00–18:00</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="text-2xl mb-3">✉️</div>
          <h3 class="font-semibold text-gray-900 mb-1">Email</h3>
          <a href="mailto:support@youfly.md" class="text-brand-600 hover:underline text-sm">support@youfly.md</a>
          <p class="text-xs text-gray-400 mt-1">Răspuns în maxim 24h</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="text-2xl mb-3">📍</div>
          <h3 class="font-semibold text-gray-900 mb-1">Adresă</h3>
          <p class="text-sm text-gray-600">Str. Ștefan cel Mare 1<br/>Chișinău, Moldova</p>
        </div>
      </div>

      <!-- Contact form -->
      <div class="md:col-span-2">
        <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div class="text-5xl mb-4">✅</div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Mesaj trimis!</h2>
          <p class="text-gray-600 mb-4">Mulțumim pentru mesaj. Vă vom contacta în cel mai scurt timp.</p>
          <button @click="submitted = false; form.message = ''; form.name = ''; form.email = ''"
            class="px-6 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Trimite alt mesaj
          </button>
        </div>
        <form v-else @submit.prevent="submitForm" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nume *</label>
              <input v-model="form.name" type="text" required placeholder="Numele dvs."
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input v-model="form.email" type="email" required placeholder="email@exemplu.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subiect</label>
            <select v-model="form.subject"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Selectați subiectul...</option>
              <option value="booking">Problemă cu rezervarea</option>
              <option value="payment">Problemă cu plata</option>
              <option value="cancel">Anulare / Modificare zbor</option>
              <option value="technical">Problemă tehnică</option>
              <option value="other">Altele</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mesaj *</label>
            <textarea v-model="form.message" required rows="5" placeholder="Descrieți problema sau întrebarea dvs..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting || !form.name || !form.email || !form.message"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Se trimite...
            </span>
            <span v-else>Trimite mesajul →</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
