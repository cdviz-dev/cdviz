<script setup>
import { ref } from "vue";
import H2 from "./H2.vue";

const VIDEO_ID = "YgWLUMKqQ3k";
const VIDEO_TITLE = "See Which Pipelines Break — And Keep Breaking — CDviz Cloud";

defineProps({
  subhead: {
    type: String,
    default: "Forty seconds, from an empty org to ranked pipeline reliability.",
  },
  // On the shared landing page, this block is the only in-page entry point to /cloud.
  cloudLink: Boolean,
});

// ponytail: click-to-load facade instead of a lite-youtube-embed dependency —
// no request to youtube until the visitor actually asks for the video.
const playing = ref(false);
</script>

<template>
  <section id="video" class="space-section text-center" aria-labelledby="video-title">
    <div class="max-w-[48ch] mx-auto mb-2xl">
      <H2 id="video-title">See it in action.</H2>
      <p class="text-text/60 mt-md">{{ subhead }}</p>
    </div>

    <div class="max-w-[920px] mx-auto border border-secondary/20 rounded-2xl bg-[var(--vp-c-bg-soft)] shadow-[0_30px_80px_-30px_color-mix(in_oklch,var(--primary)_18%,transparent)] overflow-hidden">
      <button
        v-if="!playing"
        type="button"
        class="group relative block w-full cursor-pointer"
        :aria-label="`Play video: ${VIDEO_TITLE}`"
        @click="(playing = true)"
      >
        <img
          src="/screenshots/cloud_launch_video_poster.jpg"
          alt=""
          width="1280"
          height="720"
          loading="lazy"
          class="w-full aspect-video object-cover"
        />
        <span
          class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors duration-300"
        >
          <span
            class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 group-hover:bg-primary group-focus-visible:bg-primary transition-colors duration-300 shadow-lg"
          >
            <span
              class="icon-[lucide--play] h-7 w-7 sm:h-8 sm:w-8 text-white translate-x-0.5"
            ></span>
          </span>
        </span>
      </button>
      <iframe
        v-else
        :src="`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`"
        :title="VIDEO_TITLE"
        class="w-full aspect-video block"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <p class="cdviz-mono text-text/40 text-xs mt-md flex flex-wrap gap-x-lg gap-y-xs justify-center">
      <a
        v-if="cloudLink"
        href="/cloud"
        class="text-primary hover:text-primary/80 transition-colors"
      >See CDviz Cloud →</a>
      <a
        :href="`https://www.youtube.com/watch?v=${VIDEO_ID}`"
        class="hover:text-text/70 transition-colors"
      >Watch on YouTube →</a>
    </p>
  </section>
</template>
