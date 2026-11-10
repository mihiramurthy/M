/**
 * About photography slots.
 * Drop files under `apps/web/public/about/` using the paths below.
 * Until files exist, the UI renders labeled placeholders.
 */
export type AboutPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

/** Primary portrait shown in the About frame stack. */
export const aboutHeadshot: AboutPhoto = {
  id: "headshot",
  src: "/about/headshot.jpg",
  alt: "Portrait of Mihira Murthy",
  caption: "Headshot",
};

/** Short carousel (3–4 frames). Keep captions concrete, not resume bullets. */
export const aboutCarousel: AboutPhoto[] = [
  {
    id: "carousel-01",
    src: "/about/carousel-01.jpg",
    alt: "Mihira at a campus or lab setting",
    caption: "Campus / lab",
  },
  {
    id: "carousel-02",
    src: "/about/carousel-02.jpg",
    alt: "Mihira presenting or collaborating",
    caption: "Talk / collab",
  },
  {
    id: "carousel-03",
    src: "/about/carousel-03.jpg",
    alt: "Field or project context photo",
    caption: "In the field",
  },
  {
    id: "carousel-04",
    src: "/about/carousel-04.jpg",
    alt: "Personal interest or community context",
    caption: "Beyond resume",
  },
];
