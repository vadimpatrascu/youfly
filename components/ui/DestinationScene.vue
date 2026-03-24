<script setup lang="ts">
const props = defineProps<{
  code: string
  compact?: boolean
}>()

// Each destination has a unique color palette and iconic skyline silhouette
const scenes: Record<string, { sky: string[], landmark: string, accent: string }> = {
  OTP: {
    sky: ['#1a1a2e', '#16213e', '#0f3460'],
    landmark: 'M180,120 L200,40 L220,120 M140,120 L140,80 L180,80 L180,120 M220,120 L220,85 L255,85 L255,120 M100,120 L110,70 L120,120 M260,120 L260,90 L290,90 L290,120',
    accent: '#e94560',
  },
  IST: {
    sky: ['#2d1b69', '#5c2d91', '#b74093'],
    landmark: 'M120,120 L120,60 Q150,20 180,60 L180,120 M185,65 L185,30 L190,30 L190,65 M210,120 Q230,50 250,120 M255,120 L255,40 L260,40 L260,120 M90,120 L90,80 L115,80 L115,120 M270,120 L270,85 L300,85 L300,120',
    accent: '#f39c12',
  },
  LTN: {
    sky: ['#1a1a2e', '#2d3436', '#636e72'],
    landmark: 'M140,120 L140,45 L145,40 L155,40 L165,35 L175,40 L185,40 L190,45 L190,120 M195,120 L195,70 L230,70 L230,120 M100,120 L110,50 L120,120 M240,120 L245,55 L260,55 L265,50 L280,50 L285,55 L290,120',
    accent: '#e74c3c',
  },
  BCN: {
    sky: ['#0c2461', '#1e3799', '#4a69bd'],
    landmark: 'M160,120 L160,30 Q170,10 180,30 Q185,15 190,30 Q195,20 200,30 L200,120 M130,120 L130,75 L155,75 L155,120 M205,120 L205,80 L240,80 L240,120 M100,120 L105,60 L115,65 L120,55 L125,65 L130,60 L135,120',
    accent: '#e67e22',
  },
  CDG: {
    sky: ['#2c2c54', '#474787', '#706fd3'],
    landmark: 'M165,120 L165,100 L170,100 L175,30 L180,100 L185,100 L185,120 M130,120 L130,70 L160,70 L160,120 M190,120 L195,75 L210,60 L225,75 L230,120 M100,120 L100,85 L125,85 L125,120 M235,120 L235,80 L270,80 L270,120',
    accent: '#ffd32a',
  },
  VIE: {
    sky: ['#1B1464', '#2C3A47', '#3B3B98'],
    landmark: 'M155,120 L155,85 L165,85 L170,30 L175,85 L185,85 L185,120 M120,120 L120,65 L150,65 L150,120 M190,120 L190,70 L230,70 L230,120 M100,120 L100,90 L115,90 L115,120 M235,120 L235,80 L260,80 L260,120 M265,120 L270,75 L280,75 L285,120',
    accent: '#d4af37',
  },
  MXP: {
    sky: ['#2d1b69', '#833471', '#c44569'],
    landmark: 'M160,120 L160,60 L170,25 L180,60 L180,120 M125,120 L125,75 Q140,55 155,75 L155,120 M185,120 Q195,50 205,120 M100,120 L100,80 L120,80 L120,120 M210,120 L210,70 L250,70 L250,120 M255,120 L255,90 L280,90 L280,120',
    accent: '#27ae60',
  },
  TLV: {
    sky: ['#0a3d62', '#0c7b93', '#00b894'],
    landmark: 'M150,120 L150,75 L190,75 L190,120 M120,120 L120,80 L145,80 L145,120 M195,120 L195,55 L200,55 L200,120 M205,120 L205,85 L230,85 L230,120 M100,120 L100,95 L115,95 L115,120 M240,120 L240,80 L270,80 L270,120',
    accent: '#00cec9',
  },
  DXB: {
    sky: ['#0c2461', '#e58e26', '#fa8231'],
    landmark: 'M170,120 L172,15 L178,15 L180,120 M145,120 L145,50 L165,50 L165,120 M185,120 L185,60 L210,45 L210,120 M120,120 L120,70 L140,70 L140,120 M215,120 L215,75 L250,75 L250,120 M255,120 L260,65 L275,65 L280,120',
    accent: '#fdcb6e',
  },
  BEG: {
    sky: ['#1a1a2e', '#2C3A47', '#546de5'],
    landmark: 'M140,120 L140,65 L180,65 L180,120 M185,120 L185,80 L220,80 L220,120 M115,120 L115,85 L135,85 L135,120 M225,120 L230,70 L240,70 L245,120 M100,120 L100,95 L110,95 L110,120 M250,120 L250,85 L275,85 L275,120',
    accent: '#686de0',
  },
  WAW: {
    sky: ['#1a1a2e', '#2d3436', '#576574'],
    landmark: 'M160,120 L160,40 L170,30 L180,40 L180,120 M130,120 L130,70 L155,70 L155,120 M185,120 L185,75 L220,75 L220,120 M100,120 L100,90 L125,90 L125,120 M225,120 L225,80 L260,80 L260,120',
    accent: '#c0392b',
  },
  AMS: {
    sky: ['#0a3d62', '#3c6382', '#60a3bc'],
    landmark: 'M140,120 L140,80 L150,55 L160,80 L160,120 M165,120 L165,75 L175,50 L185,75 L185,120 M190,120 L190,85 L200,60 L210,85 L210,120 M115,120 L115,90 L135,90 L135,120 M215,120 L215,80 L245,80 L245,120',
    accent: '#f39c12',
  },
}

const scene = computed(() => scenes[props.code] || scenes.IST)
</script>

<template>
  <svg :viewBox="compact ? '60 40 280 80' : '0 0 400 140'" preserveAspectRatio="xMidYMax slice"
    class="w-full" :class="compact ? 'h-20' : 'h-32'" aria-hidden="true">
    <defs>
      <linearGradient :id="`sky-${code}`" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="scene.sky[0]" />
        <stop offset="50%" :stop-color="scene.sky[1]" />
        <stop offset="100%" :stop-color="scene.sky[2]" />
      </linearGradient>
      <!-- Stars -->
      <radialGradient :id="`glow-${code}`">
        <stop offset="0%" :stop-color="scene.accent" stop-opacity="0.4" />
        <stop offset="100%" :stop-color="scene.accent" stop-opacity="0" />
      </radialGradient>
    </defs>
    <!-- Sky -->
    <rect width="400" height="140" :fill="`url(#sky-${code})`" />
    <!-- Stars -->
    <circle cx="50" cy="20" r="1" fill="white" opacity="0.6" />
    <circle cx="120" cy="15" r="1.2" fill="white" opacity="0.8" />
    <circle cx="200" cy="10" r="0.8" fill="white" opacity="0.5" />
    <circle cx="280" cy="25" r="1" fill="white" opacity="0.7" />
    <circle cx="340" cy="12" r="1.5" fill="white" opacity="0.4" />
    <circle cx="370" cy="30" r="0.8" fill="white" opacity="0.6" />
    <circle cx="80" cy="35" r="0.6" fill="white" opacity="0.3" />
    <!-- Ambient glow -->
    <circle cx="200" cy="130" r="80" :fill="`url(#glow-${code})`" />
    <!-- Skyline -->
    <path :d="scene.landmark" :stroke="scene.accent" stroke-width="1.5" fill="none" opacity="0.3" />
    <path :d="scene.landmark + ' L100,120'" fill="currentColor" class="text-gray-900/80" />
    <!-- Ground line -->
    <line x1="0" y1="120" x2="400" y2="120" :stroke="scene.accent" stroke-width="0.5" opacity="0.5" />
    <!-- Airplane silhouette flying across -->
    <g class="animate-fly" opacity="0.6">
      <path d="M0,0 L-4,-1 L-12,0 L-4,1 Z M-3,-3 L-5,-6 L-6,-6 L-5,-3 Z M-3,3 L-5,6 L-6,6 L-5,3 Z" fill="white" transform="translate(320, 35) scale(1.5)" />
    </g>
  </svg>
</template>

<style scoped>
@keyframes fly {
  0% { transform: translateX(-50px); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateX(450px); opacity: 0; }
}
.animate-fly {
  animation: fly 12s linear infinite;
}
</style>
