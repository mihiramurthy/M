/**
 * About photography.
 * Files live under `apps/web/public/about/`.
 */
export type AboutPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

/** Primary portrait in the About frame stack. */
export const aboutHeadshot: AboutPhoto = {
  id: "headshot",
  src: "/about/headshot.jpg",
  alt: "Portrait of Mihira Murthy",
  caption: "Headshot",
};

/** Short carousel: leadership and shipping context beyond the resume list. */
export const aboutCarousel: AboutPhoto[] = [
  {
    id: "carousel-01",
    src: "/about/carousel-01.jpg",
    alt: "Mihira receiving a California DECA placement award on stage",
    caption: "California DECA placement",
  },
  {
    id: "carousel-02",
    src: "/about/carousel-02.jpg",
    alt: "Maryland Mayuri team in formal attire on campus steps",
    caption: "Maryland Mayuri, PR team",
  },
  {
    id: "carousel-03",
    src: "/about/carousel-03.jpg",
    alt: "App Dev Club final demo for the Exiger supplier-risk portal",
    caption: "Exiger portal, App Dev final demo",
  },
  {
    id: "carousel-04",
    src: "/about/carousel-04.jpg",
    alt: "CASL state board leadership group photo",
    caption: "CASL state board",
  },
];
