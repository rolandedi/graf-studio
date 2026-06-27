<script setup lang="ts">
import { useUiStore } from "~/composables/useUiStore";
import ModuleNav from "./ModuleNav.vue";

const ui = useUiStore();
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col overflow-hidden bg-(--bg-canvas) text-(--text-primary)"
  >
    <div class="flex min-h-0 flex-1">
      <!-- Center: page content fills the whole row.
           Left/right panels are rendered inside each page (Composer/Fairlight)
           so that the shell stays a single source of truth. -->
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <slot />
      </main>
    </div>
    <ModuleNav />
  </div>
</template>
