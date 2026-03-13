<script setup lang="ts">
useHead({ title: 'Întrebări frecvente — YouFly' })

const openFaq = ref<number | null>(null)

function toggle(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

const faqs = [
  {
    q: 'Ce este YouFly?',
    a: 'YouFly este o platformă de rezervare a biletelor de avion care îți permite să cauți și să compare zboruri de la sute de companii aeriene în timp real, la cele mai bune prețuri.'
  },
  {
    q: 'Sunt prețurile afișate finale?',
    a: 'Da! Prețurile afișate includ toate taxele și comisioanele. Nu există taxe ascunse. Prețul pe care îl vedeți este prețul final pe care îl veți plăti.'
  },
  {
    q: 'Cât timp este valabilă o ofertă?',
    a: 'Ofertele sunt valabile de obicei între 15 și 60 de minute de la momentul căutării. Un cronometru de expirare este afișat pe pagina de completare a datelor pasagerilor. Dacă oferta expiră, va trebui să căutați din nou.'
  },
  {
    q: 'Cum pot să-mi găsesc rezervarea?',
    a: 'Puteți accesa rezervarea dvs. oricând din pagina "Rezervarea mea" introducând codul de rezervare primit la confirmare. Codul este format din 6 litere majuscule.'
  },
  {
    q: 'Este sigur să plătesc pe YouFly?',
    a: 'YouFly este o platformă demo — plata este simulată și nu se procesează tranzacții reale. Datele cardului nu sunt stocate sau transmise nicăieri.'
  },
  {
    q: 'Pot rezerva pentru mai mulți pasageri?',
    a: 'Da! Puteți rezerva pentru adulți, copii (2-11 ani) și bebeluși (sub 2 ani). Selectați numărul de pasageri în formularul de căutare de pe pagina principală.'
  },
  {
    q: 'Ce clase de călătorie sunt disponibile?',
    a: 'YouFly oferă toate cele 4 clase standard: Economy (Economică), Premium Economy, Business și First Class (Întâi). Disponibilitatea depinde de zborul ales.'
  },
  {
    q: 'Cum pot contacta suportul?',
    a: 'Ne puteți contacta la numărul +373 22 000 000 sau prin email la support@youfly.md. Suntem disponibili 24/7 pentru a vă ajuta.'
  },
  {
    q: 'Ce se întâmplă dacă zborul meu este anulat?',
    a: 'În caz de anulare sau modificare a zborului, veți fi notificat de compania aeriană direct la adresa de email furnizată la rezervare. Politica de rambursare depinde de tariful ales.'
  },
  {
    q: 'Pot schimba sau anula rezervarea?',
    a: 'Modificările și anulările depind de tariful ales la rezervare. Unele bilete sunt nerambursabile, altele permit modificări cu o taxă. Contactați-ne pentru asistență.'
  }
]

useFAQStructuredData(faqs.map(f => ({ question: f.q, answer: f.a })))
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div class="text-5xl mb-4">❓</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Întrebări frecvente</h1>
      <p class="text-gray-500">Răspunsuri la cele mai comune întrebări despre YouFly</p>
    </div>

    <div class="space-y-3">
      <div v-for="(faq, i) in faqs" :key="i"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all">
        <button @click="toggle(i)"
          class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
          <span class="font-semibold text-gray-900">{{ faq.q }}</span>
          <span class="text-brand-600 shrink-0 text-xl transition-transform duration-200"
            :class="openFaq === i ? 'rotate-45' : ''">+</span>
        </button>
        <div v-if="openFaq === i" class="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {{ faq.a }}
        </div>
      </div>
    </div>

    <div class="mt-10 bg-brand-50 rounded-2xl p-6 text-center">
      <p class="text-gray-700 mb-4">Nu ai găsit răspunsul la întrebarea ta?</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <a href="tel:+37322000000"
          class="px-5 py-2.5 border border-brand-300 text-brand-700 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors">
          📞 +373 22 000 000
        </a>
        <a href="mailto:support@youfly.md"
          class="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
          ✉️ Trimite email
        </a>
      </div>
    </div>
  </div>
</template>
