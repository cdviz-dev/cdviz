<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "text",
    validator: (value) => ["text", "avatar", "card", "button"].includes(value),
  },
  width: String,
  height: String,
  count: {
    type: Number,
    default: 1,
  },
});

const getSkeletonClasses = () => {
  const base = "skeleton rounded animate-pulse-soft";

  switch (props.type) {
    case "avatar":
      return `${base} rounded-full w-12 h-12`;
    case "card":
      return `${base} w-full h-32`;
    case "button":
      return `${base} w-24 h-10`;
    case "text":
    default:
      return `${base} h-4 ${props.width || "w-full"}`;
  }
};
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="i in count"
      :key="i"
      :class="getSkeletonClasses()"
      :style="{
        width: width,
        height: height,
        animationDelay: `${(i - 1) * 0.1}s`,
      }"
    />
  </div>
</template>
