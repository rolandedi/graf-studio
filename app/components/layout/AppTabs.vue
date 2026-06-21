<script lang="ts" setup>
import { PenTool, Play } from "@lucide/vue";

const route = useRoute();

const tabs = [
  { label: "Composer", to: "/composer", icon: PenTool },
  { label: "Controller", to: "/controller", icon: Play },
];

const isActive = (to: string) => {
  if (to === "/composer") {
    return route.path === "/" || route.path === "/composer";
  }
  return route.path === to;
};
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center border-t border-border bg-sidebar/95 backdrop-blur-sm"
  >
    <div class="flex items-center gap-1 px-4 py-2">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-colors"
        :class="
          isActive(tab.to)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        "
      >
        <component :is="tab.icon" class="size-4" />
        {{ tab.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
