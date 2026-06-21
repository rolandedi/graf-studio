<script lang="ts" setup>
definePageMeta({
  layout: "default",
});

// Redirect to composer by default
await navigateTo("/composer", { replace: true });
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <p class="text-muted-foreground">Chargement...</p>
  </div>
</template>
