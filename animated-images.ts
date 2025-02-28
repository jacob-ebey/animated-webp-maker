function getFrames(element: HTMLElement): HTMLElement[] {
  const elements = element.querySelectorAll(
    "animated-images-frame",
  ) as Iterable<HTMLElement>;
  const frames: HTMLElement[] = [];
  for (const frame of elements) {
    const img = frame.querySelector("img");
    if (img) {
      frames.push(frame);
    } else {
      const src = frame.getAttribute("src");
      if (src) {
        console.log("Creating image element");
        const img = document.createElement("img");
        img.addEventListener(
          "load",
          () => {
            frame.setAttribute("data-state", "loaded");
            frame.dispatchEvent(new CustomEvent("load"));
          },
          { once: true },
        );
        img.addEventListener(
          "error",
          () => {
            frame.setAttribute("data-state", "error");
          },
          { once: true },
        );
        frame.hidden = true;
        img.src = src;
        frame.appendChild(img);
        frames.push(frame);
      }
    }
  }
  return frames;
}

class AnimatedImages extends HTMLElement {
  static observedAttributes = ["progress"];

  private abortController = new AbortController();

  private mutationObserver = new MutationObserver(() => {
    this.mutationObserver.disconnect();
    this.setActiveFrame(
      Number.parseFloat(this.getAttribute("progress") || "0"),
    );
  });

  connectedCallback() {
    if (!this.isConnected) return;

    this.setActiveFrame(
      Number.parseFloat(this.getAttribute("progress") || "0"),
    );
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, _: any, _progress: string | null) {
    const progress = Number.parseFloat(_progress || "0");
    this.setActiveFrame(progress);
  }

  setActiveFrame(progress: number) {
    const controller = this.abortController;
    controller.abort();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const frames = getFrames(this);
    const frameIndex =
      Math.floor((progress / 100) * frames.length) % frames.length;
    const activeFrame = frames[frameIndex];

    if (!activeFrame) {
      this.mutationObserver.observe(this, {
        childList: true,
      });
      return;
    }

    const display = () => {
      if (signal.aborted) return;
      this.hideFallback();
      for (const frame of frames) {
        if (frame === activeFrame) {
          frame.removeAttribute("hidden");
        } else {
          frame.setAttribute("hidden", "");
        }
      }
    };

    if (activeFrame.getAttribute("data-state") === "loaded") {
      display();
    } else {
      activeFrame.addEventListener("load", display);
    }
  }

  hideFallback() {
    const fallback = this.querySelector(
      "animated-images-fallback",
    ) as HTMLElement;
    if (fallback && !fallback.hidden) fallback.hidden = true;
  }
}

customElements.define("animated-images", AnimatedImages);
