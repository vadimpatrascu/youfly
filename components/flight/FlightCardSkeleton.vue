<template>
  <div aria-hidden="true" class="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 animate-pulse">
    <div class="flex items-center gap-3 md:gap-6">
      <!-- Logo skeleton -->
      <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
      <!-- Info skeleton -->
      <div class="flex-1 grid grid-cols-3 gap-4 items-center">
        <div class="space-y-2">
          <div class="h-7 bg-gray-200 rounded w-16"></div>
          <div class="h-3 bg-gray-200 rounded w-8"></div>
          <div class="h-3 bg-gray-100 rounded w-12"></div>
        </div>
        <div class="space-y-2 flex flex-col items-center">
          <div class="h-3 bg-gray-200 rounded w-10"></div>
          <div class="h-px bg-gray-200 w-full"></div>
          <div class="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        <div class="space-y-2 flex flex-col items-end">
          <div class="h-7 bg-gray-200 rounded w-16"></div>
          <div class="h-3 bg-gray-200 rounded w-8"></div>
          <div class="h-3 bg-gray-100 rounded w-12"></div>
        </div>
      </div>
    </div>
    <!-- Carrier row -->
    <div class="mt-2 ml-[52px] flex gap-2">
      <div class="h-3 bg-gray-100 rounded w-24"></div>
      <div class="h-3 bg-gray-100 rounded w-16"></div>
    </div>
    <!-- Price row -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
      <div class="space-y-2">
        <div class="h-8 bg-gray-200 rounded w-24"></div>
        <div class="h-3 bg-gray-100 rounded w-32"></div>
      </div>
      <div class="h-12 w-32 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
</template>
