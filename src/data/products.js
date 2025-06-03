 const products = [ 
  {
    id: "1",
    name: "Brățară personalizată",
    price: 89,
    images: {
      roz: "/images/bratara1.jpg",
      alb: "/images/bratara2.jpg",
    },
    description: `Brățară handmade personalizată pentru orice ocazie. 
Poți alege numele, mărimea, culoarea.
Toate charm-urile sunt din rhinestone.`,
    colors: ["roz", "alb"],
    sizes: ["Bebeluș", "Copil", "Adult"],
    canBeEngraved: true,
    hasGiftWrap: true,
    variantLabel: "Culoare",
  },

  {
    id: "2",
    name: "Lumânare parfumată cu cristale",
    price: 75.99,
    images: {
      orhidee: [
        "/images/lumanare-freesia.jpg",
        "/images/lumanare-freesia-marime.jpg",
      ],
      lavandă: [
        "/images/lumanare-lavender.jpg",
        "/images/lumanare-lavender-marime.jpg",
      ],
    },
    descriptionByColor: {
      orhidee:
        "Lumânare de lux cu parfum de orhidee, cristale roz naturale și note florale fine. Ideală pentru relaxare și echilibru emoțional.",
      lavandă:
        "Lumânare handmade cu ulei esențial de lavandă, perfectă pentru calmare, aromaterapie și decor elegant cu pietre semiprețioase.",
    },
    colors: ["orhidee", "lavandă"],
    sizes: [],
    canBeEngraved: false,
    hasGiftWrap: true,
    variantLabel: "Parfum",
  },

  {
    id: "3",
    name: "Copăcel cu cristale naturale",
    price: 129.99,
    images: {
      "Clear Quartz": [
        "/images/copacel-clear-1.jpg",
        "/images/copacel-clear-2.jpg",
        "/images/copacel-clear-3.jpg",
        "/images/copacel-clear-4.jpg",
      ],
      "Rose Quartz": [
        "/images/copacel-rose-1.jpg",
        "/images/copacel-rose-2.jpg",
        "/images/copacel-rose-3.jpg",
        "/images/copacel-rose-4.jpg",
      ],
      "Amethyst & Turquoise": [
        "/images/copacel-amethyst-1.jpg",
        "/images/copacel-amethyst-2.jpg",
        "/images/copacel-amethyst-3.jpg",
        "/images/copacel-amethyst-4.jpg",
      ],
      "Seven Chakra": [
        "/images/copacel-chakra-1.jpg",
        "/images/copacel-chakra-2.jpg",
        "/images/copacel-chakra-3.jpg",
        "/images/copacel-chakra-4.jpg",
      ],
    },
    descriptionByColor: {
      "Clear Quartz":
        "Clear Quartz este considerat cel mai puternic cristal pentru vindecare și purificare. Sprijină claritatea mentală, echilibrul emoțional și crește nivelul de conștientizare.",
      "Rose Quartz":
        "Cristalul iubirii necondiționate și al armoniei emoționale. Rose Quartz susține vindecarea rănilor afective, atrage relații echilibrate și promovează compasiunea.",
      "Amethyst & Turquoise":
        "Ametistul stimulează intuiția și protejează energetic, iar Turcoazul calmează și întărește comunicarea sinceră.",
      "Seven Chakra":
        "Reunește pietrele esențiale pentru armonizarea energetică. Fiecare cristal activează și echilibrează câte o chakră.",
    },
    colors: [
      "Clear Quartz",
      "Rose Quartz",
      "Amethyst & Turquoise",
      "Seven Chakra",
    ],
    sizes: [],
    canBeEngraved: false,
    hasGiftWrap: true,
    variantLabel: "Cristal",
  },

 {
  id: "4",
  name: "Colier cu medalion personalizat",
  price: 159.99,
  images: {
    silver: [
      "/images/colier-locket-silver1.jpg",
      "/images/colier-locket-silver2.jpg",
      "/images/colier-locket-silver3.jpg",
      "/images/colier-locket-silver4.jpg",
    ],
    gold: [
      "/images/colier-locket-gold1.jpg",
      "/images/colier-locket-gold2.jpg",
      "/images/colier-locket-gold3.jpg",
      "/images/colier-locket-gold4.jpg",
    ],
    rose: [
      "/images/colier-locket-rose1.jpg",
      "/images/colier-locket-rose2.jpg",
      "/images/colier-locket-rose3.jpg",
      "/images/colier-locket-rose4.jpg",
    ],
  },
  descriptionByColor: {
    silver:
      "Colier cu medalion argintiu, cu deschidere clasică, perfect pentru a adăuga 1-2 fotografii și un mesaj gravat. Un cadou elegant, cu semnificație personală.",
    gold:
      "Colier cu medalion auriu, rafinat și strălucitor. Poți include o fotografie dragă și un text gravat – ideal pentru aniversări, ziua mamei sau cadouri romantice.",
    rose:
      "Colier cu medalion rose gold – modern, romantic și subtil. Include spațiu pentru o poză și o gravură emoționantă. Un dar unic pentru cineva special.",
  },
  colors: ["silver", "gold", "rose"],
  sizes: [],
  canBeEngraved: true,
  canUploadImage: true,
  hasGiftWrap: true,
  variantLabel: "Culoare",
},


  {
    id: "5",
    name: "Set lumânări bubble parfumate",
    price: 74.99,
    images: {
      "Alb & Albastru": [
        "/images/lumanari-bubble-alb1.jpg",
        "/images/lumanari-bubble-alb2.jpg",
        "/images/lumanari-bubble-alb3.jpg",
        "/images/lumanari-bubble-alb4.jpg",
      ],
      Mov: [
        "/images/lumanari-bubble-mov1.jpg",
        "/images/lumanari-bubble-mov2.jpg",
        "/images/lumanari-bubble-mov3.jpg",
        "/images/lumanari-bubble-mov4.jpg",
      ],
    },
    descriptionByColor: {
      "Alb & Albastru": `Descoperă frumusețea designului minimalist cu setul de 2 lumânări bubble, realizate manual în nuanțe alb și albastru. Aceste cuburi estetice sunt create din ceară naturală, parfumate cu flori Canglan – o aromă fină, liniștitoare, provenită din China. Perfecte pentru dormitor, baie sau living, adaugă un accent decorativ elegant și o atmosferă relaxantă. Fiecare lumânare are dimensiuni de 5.5 x 5.5 cm și arde aproximativ 3 ore.`,
      Mov: `Setul conține 2 lumânări handmade mov în formă de cub bubble, cu parfum delicat de frezie și Canglan. Acestea creează un ambient modern și rafinat în orice cameră. Designul geometric se potrivește în decoruri scandinave sau moderne, iar parfumul subtil aduce calm și bună dispoziție. Ideale ca decor pentru baie, dormitor, birou sau pentru un cadou elegant.`,
    },
    colors: ["Alb & Albastru", "Mov"],
    sizes: [],
    canBeEngraved: false,
    hasGiftWrap: true,
    variantLabel: "Culoare",
  },

  {
    id: "6",
    name: "Set lumânări floare handmade Hana Blossom",
    price: 89.99,
    images: {
      Multicolor: [
        "/images/lumanari-florale1.jpg",
        "/images/lumanari-florale2.jpg",
        "/images/lumanari-florale3.jpg",
        "/images/lumanari-florale4.jpg",
      ],
    },
    description: `Un set de 8 lumânări handmade în formă de flori – trandafir, floarea-soarelui, frangipani, orhidee și iasomie – turnate manual și parfumate cu esență de iasomie indiană. Fiecare lumânare arde aproximativ 3 ore. Setul este ambalat într-o cutie elegantă cu model botanic, perfect pentru un cadou rafinat, natural și memorabil.`,
    colors: ["Multicolor"],
    sizes: [],
    canBeEngraved: false,
    hasGiftWrap: true,
    variantLabel: "Model",
  },
];

export default products;
