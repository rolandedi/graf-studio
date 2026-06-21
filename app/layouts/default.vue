<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background">
    <main class="flex-1 overflow-hidden pb-14">
      <slot />
    </main>
    <LayoutAppTabs />
  </div>
</template>

<script lang="ts" setup></script>
