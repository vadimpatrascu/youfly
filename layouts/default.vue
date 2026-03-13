<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-brand-600">✈ YouFly</span>
        </NuxtLink>
        <nav class="flex items-center gap-6">
          <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Search</NuxtLink>
          <NuxtLink to="/my-booking" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">My Booking</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="bg-white border-t border-gray-200 py-8 mt-auto">
      <div class="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
        © {{ new Date().getFullYear() }} YouFly. All rights reserved.
      </div>
    </footer>
  </div>
</template>
