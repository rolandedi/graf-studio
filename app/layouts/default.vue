<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background">
    <main class="flex-1 overflow-hidden pb-14">
      <slot />
    </main>
    <LayoutAppTabs />
    <UiSonnerToaster
      position="top-right"
      :toast-options="{
        style: {
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { Toaster } from "vue-sonner";
</script>
