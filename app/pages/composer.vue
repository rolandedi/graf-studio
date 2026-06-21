<script lang="ts" setup>
useHead({ title: "Composer" });
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <header
      class="flex items-center justify-between border-b border-border px-4 py-2"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-foreground">Composer</h1>
        <Badge variant="secondary" class="text-xs">Lower Third</Badge>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm">Nouveau</Button>
        <Button variant="ghost" size="sm">Sauvegarder</Button>
        <Button variant="default" size="sm">Exporter</Button>
      </div>
    </header>

    <!-- Main area placeholder -->
    <div class="flex flex-1 items-center justify-center">
      <p class="text-muted-foreground text-sm">
        L'éditeur Composer sera implémenté en Phase 4.
      </p>
    </div>
  </div>
</template>
