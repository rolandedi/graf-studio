<script lang="ts" setup>
useHead({ title: "Controller" });
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <header
      class="flex items-center justify-between border-b border-border px-4 py-2"
    >
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-foreground">Controller</h1>
        <Badge variant="secondary" class="text-xs">Preview / Program</Badge>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm">Charger un projet</Button>
      </div>
    </header>

    <!-- Main area placeholder -->
    <div class="flex flex-1 items-center justify-center">
      <p class="text-muted-foreground text-sm">
        L'interface Controller sera implémentée en Phase 5.
      </p>
    </div>
  </div>
</template>
