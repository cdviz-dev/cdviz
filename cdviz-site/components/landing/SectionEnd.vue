<template>
  <section class="space-section w-full" aria-labelledby="end-heading">
    <a id="end"></a>
    <div class="w-full max-w-6xl mx-auto text-center">
      <h2 id="end-heading" class="text-2xl sm:text-3xl font-bold mb-4">
        Ready to See Your Pipeline?
      </h2>
      <p class="text-base sm:text-lg text-text/80 mb-lg leading-relaxed">
        Self-host free — Pro features included during beta.<br />
        Open-source, no lock-in, actively developed.
      </p>

      <!-- Primary CTA row -->
      <div class="flex flex-wrap justify-center gap-4 mb-lg">
        <a
          href="https://github.com/cdviz-dev/cdviz"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-text font-semibold hover:bg-secondary/80 hover:scale-105 transition-all duration-200"
          aria-label="Star CDviz on GitHub"
        >
          <span
            class="icon-[simple-icons--github] h-5 w-5"
            aria-hidden="true"
          ></span>
          Star on GitHub
        </a>
        <a
          href="https://demo.cdviz.dev/grafana"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-background font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
          aria-label="Open CDviz live demo"
        >
          <span class="icon-[lucide--eye] h-5 w-5" aria-hidden="true"></span>
          Try Live Demo
        </a>
        <a
          href="https://github.com/cdviz-dev/cdviz/discussions"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-text font-semibold hover:bg-secondary/80 hover:scale-105 transition-all duration-200"
          aria-label="Send feedback on GitHub Discussions"
        >
          <span
            class="icon-[lucide--message-circle] h-5 w-5"
            aria-hidden="true"
          ></span>
          Send Feedback
        </a>
      </div>

      <!-- Secondary contact line -->
      <p class="text-sm text-text/60">
        Have a use case, questions, or ideas? →
        <a href="mailto:contact@cdviz.dev" class="text-primary hover:underline"
          >contact@cdviz.dev</a
        >
      </p>

      <!-- Social links -->
      <div
        class="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-secondary/20"
      >
        <a
          href="https://github.com/cdviz-dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on GitHub"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--github] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="https://www.youtube.com/@CDviz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on YouTube"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--youtube] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="https://dev.to/davidb31"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on dev.to"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--devdotto] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="mailto:contact@cdviz.dev"
          aria-label="Email CDviz"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[lucide--mail] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
      </div>
    </div>
  </section>
</template>
