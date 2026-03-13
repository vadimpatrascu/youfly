<script setup lang="ts">
useHead({ title: 'Termeni și condiții — YouFly' })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Termeni și condiții</h1>
      <p class="text-gray-500 text-sm">Ultima actualizare: Ianuarie 2026</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">1. Acceptarea termenilor</h2>
        <p>Prin accesarea și utilizarea platformei YouFly, acceptați să fiți obligat de acești Termeni și Condiții de Serviciu. Dacă nu sunteți de acord cu oricare parte a termenilor, nu puteți accesa serviciul.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">2. Descrierea serviciului</h2>
        <p>YouFly este o platformă de căutare și rezervare a biletelor de avion care funcționează ca intermediar între utilizatori și furnizorii de servicii de transport aerian, prin intermediul API-ului Duffel. Toate rezervările sunt procesate direct cu companiile aeriene.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">3. Prețuri și plăți</h2>
        <p>Toate prețurile sunt afișate în timp real și includ taxele de aeroport și comisioanele aplicabile. YouFly nu percepe comisioane suplimentare față de prețul afișat. Plata se procesează securizat. YouFly este o platformă demo și nu procesează plăți reale.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">4. Politica de modificare și anulare</h2>
        <p>Politica de modificare și anulare a biletelor depinde de tariful ales de pasager. YouFly transmite cererile de modificare/anulare către compania aeriană relevantă. Rambursările sunt procesate conform politicii companiei aeriene.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">5. Responsabilitate</h2>
        <p>YouFly nu este responsabil pentru: întârzieri sau anulări de zboruri, pierderea bagajelor, modificări în programul de zbor sau orice alte evenimente în afara controlului nostru. Companiile aeriene sunt singurele responsabile pentru serviciile de transport.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">6. Protecția datelor</h2>
        <p>Datele personale colectate în procesul de rezervare sunt utilizate exclusiv în scopul procesării rezervărilor și respectă prevederile GDPR. Nu vindem sau partajăm datele dumneavoastră personale cu terți, cu excepția companiilor aeriene necesare pentru procesarea rezervărilor.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-900 mb-3">7. Contact</h2>
        <p>Pentru orice întrebări privind acești termeni, vă rugăm să ne contactați la <a href="mailto:legal@youfly.md" class="text-brand-600 hover:underline">legal@youfly.md</a> sau la numărul +373 22 000 000.</p>
      </section>
    </div>

    <div class="mt-6 text-center">
      <NuxtLink to="/" class="text-brand-600 hover:underline text-sm">← Înapoi la pagina principală</NuxtLink>
    </div>
  </div>
</template>
