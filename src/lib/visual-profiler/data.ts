import { ImagePair } from './types';

export const PAIRS: ImagePair[] = [
  {
    "id": "L1_Openness_01",
    "layer": 1,
    "theme": "Adventurous Exploration vs Comfortable Routine",
    "imageA": {
      "src": "/images/visual-profiler/l1_openness_01_a.png",
      "alt": "Adventurous Exploration",
      "prompt": "A lone traveler hiking through a lush, mysterious rainforest path, vibrant greenery, dappled sunlight, sense of discovery, 8k",
      "inference": {
        "traits": {
          "Openness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_openness_01_b.png",
      "alt": "Comfortable Routine",
      "prompt": "A cozy living room with a person curled up under a blanket, warm lamplight, reading a familiar book, safe and comfortable, 8k",
      "inference": {
        "traits": {
          "Openness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Openness_02",
    "layer": 1,
    "theme": "Imaginative (Abstract) vs Conventional (Traditional)",
    "imageA": {
      "src": "/images/visual-profiler/l1_openness_02_a.png",
      "alt": "Imaginative (Abstract)",
      "prompt": "An art gallery displaying a large abstract painting with bold colors and unconventional shapes, creative chaos, moody lighting, ultra-detailed, 8k",
      "inference": {
        "traits": {
          "Openness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_openness_02_b.png",
      "alt": "Conventional (Traditional)",
      "prompt": "An art gallery displaying a classic landscape painting in realistic style, muted colors, symmetrical composition, soft museum lighting, 8k",
      "inference": {
        "traits": {
          "Openness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Conscientiousness_01",
    "layer": 1,
    "theme": "Organized & Orderly vs Casual & Carefree",
    "imageA": {
      "src": "/images/visual-profiler/l1_conscientiousness_01_a.png",
      "alt": "Organized & Orderly",
      "prompt": "An impeccably organized, minimalist white desk with neatly arranged Apple computer, notebook and pens, clean lines, soft white lighting, ultra-high detail",
      "inference": {
        "traits": {
          "Conscientiousness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_conscientiousness_01_b.png",
      "alt": "Casual & Carefree",
      "prompt": "A cluttered artist's studio filled with vibrant paint splatters, canvases piled, messy stacks of paper, warm yellow lighting, creative chaos energy, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Conscientiousness_02",
    "layer": 1,
    "theme": "Planned & Structured vs Spontaneous & Unplanned",
    "imageA": {
      "src": "/images/visual-profiler/l1_conscientiousness_02_a.png",
      "alt": "Planned & Structured",
      "prompt": "A neatly laid-out daily planner with color-coded schedules beside an early morning runner on a sunrise-lit road, crisp clear lighting, organized vibe, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_conscientiousness_02_b.png",
      "alt": "Spontaneous & Unplanned",
      "prompt": "A spontaneous road trip scene with a convertible car on an open road at sunset, a map flying out, golden hour lighting, carefree adventurous mood, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Extraversion_01",
    "layer": 1,
    "theme": "Sociable & Outgoing vs Solitary & Reserved",
    "imageA": {
      "src": "/images/visual-profiler/l1_extraversion_01_a.png",
      "alt": "Sociable & Outgoing",
      "prompt": "A lively house party with people dancing and laughing under colorful string lights, packed room, energetic atmosphere, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_extraversion_01_b.png",
      "alt": "Solitary & Reserved",
      "prompt": "A lone individual reading a book in a cozy armchair by a dimly lit window, a cat sleeping nearby, quiet and peaceful scene, 8k",
      "inference": {
        "traits": {
          "Extraversion": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Extraversion_02",
    "layer": 1,
    "theme": "Thrill-Seeking & Energetic vs Calm & Low-Key",
    "imageA": {
      "src": "/images/visual-profiler/l1_extraversion_02_a.png",
      "alt": "Thrill-Seeking & Energetic",
      "prompt": "A crowd of excited fans at an outdoor concert, hands in the air, bright stage lights and lasers, high energy, night festival atmosphere, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_extraversion_02_b.png",
      "alt": "Calm & Low-Key",
      "prompt": "A solitary figure meditating by a calm lake at dawn, light fog on water, gentle sunrise colors, serene and tranquil ambiance, 8k",
      "inference": {
        "traits": {
          "Extraversion": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Agreeableness_01",
    "layer": 1,
    "theme": "Cooperative & Trusting vs Competitive & Skeptical",
    "imageA": {
      "src": "/images/visual-profiler/l1_agreeableness_01_a.png",
      "alt": "Cooperative & Trusting",
      "prompt": "A diverse team of people huddled around a table, smiling and collaborating on a project, bright natural lighting, supportive atmosphere, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_agreeableness_01_b.png",
      "alt": "Competitive & Skeptical",
      "prompt": "Two businesspeople in a tense face-to-face negotiation across a table, serious expressions, dramatic low-key lighting, competitive tension, 8k",
      "inference": {
        "traits": {
          "Agreeableness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Agreeableness_02",
    "layer": 1,
    "theme": "Compassionate & Altruistic vs Critical & Uncompromising",
    "imageA": {
      "src": "/images/visual-profiler/l1_agreeableness_02_a.png",
      "alt": "Compassionate & Altruistic",
      "prompt": "A volunteer warmly comforting a sad stranger at a charity drive, offering food and a blanket, soft golden light, compassionate mood, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_agreeableness_02_b.png",
      "alt": "Critical & Uncompromising",
      "prompt": "A person standing apart with arms crossed during a group discussion, frowning skeptically while others agree, cooler lighting, tense atmosphere, 8k",
      "inference": {
        "traits": {
          "Agreeableness": -0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Neuroticism_01",
    "layer": 1,
    "theme": "Calm & Even-Tempered vs Anxious & Stress-Prone",
    "imageA": {
      "src": "/images/visual-profiler/l1_neuroticism_01_a.png",
      "alt": "Calm & Even-Tempered",
      "prompt": "A tranquil zen garden with a gentle waterfall, green bamboo and smooth stones, soft morning light, perfectly calm atmosphere, 8k",
      "inference": {
        "traits": {
          "Neuroticism": -0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_neuroticism_01_b.png",
      "alt": "Anxious & Stress-Prone",
      "prompt": "An office desk scattered with crumpled papers and a spilled coffee, person gripping their head in frustration, harsh overhead lighting, stressful scene, 8k",
      "inference": {
        "traits": {
          "Neuroticism": 0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L1_Neuroticism_02",
    "layer": 1,
    "theme": "Fearless & Unworried vs Cautious & Security-Seeking",
    "imageA": {
      "src": "/images/visual-profiler/l1_neuroticism_02_a.png",
      "alt": "Fearless & Unworried",
      "prompt": "A person skydiving from an airplane against a broad blue sky, exhilarating free fall, sunlit clouds, fearless thrill, 8k",
      "inference": {
        "traits": {
          "Neuroticism": -0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l1_neuroticism_02_b.png",
      "alt": "Cautious & Security-Seeking",
      "prompt": "A person double-checking the multiple locks on their front door at night, porch light on, nervous posture, tense atmosphere, 8k",
      "inference": {
        "traits": {
          "Neuroticism": 0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_TradModern_01",
    "layer": 2,
    "theme": "Traditional & Rustic vs Modern & Futuristic",
    "imageA": {
      "src": "/images/visual-profiler/l2_tradmodern_01_a.png",
      "alt": "Traditional & Rustic",
      "prompt": "A quaint rural farmhouse with a wrap-around porch and old pickup truck, golden sunset over fields, nostalgic Americana atmosphere, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.5,
          "Openness": -0.5
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_tradmodern_01_b.png",
      "alt": "Modern & Futuristic",
      "prompt": "A neon-lit futuristic city skyline with flying vehicles between glass skyscrapers, cyberpunk aesthetic, night scene, 8k",
      "inference": {
        "traits": {
          "Openness": 0.5,
          "Conscientiousness": -0.5
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_NatureIndustry_01",
    "layer": 2,
    "theme": "Nature & Environment vs Urban & Industrial",
    "imageA": {
      "src": "/images/visual-profiler/l2_natureindustry_01_a.png",
      "alt": "Nature & Environment",
      "prompt": "A dense, green forest with sunbeams illuminating a clear stream, untouched wilderness, peaceful natural beauty, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.5
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_natureindustry_01_b.png",
      "alt": "Urban & Industrial",
      "prompt": "A sprawling industrial complex with smokestacks releasing smoke into the sky, steel structures dominating the landscape, gritty atmosphere, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.5
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_OrderChaos_01",
    "layer": 2,
    "theme": "Order & Symmetry vs Complexity & Chaos",
    "imageA": {
      "src": "/images/visual-profiler/l2_orderchaos_01_a.png",
      "alt": "Order & Symmetry",
      "prompt": "An impeccably symmetrical formal garden with geometric hedge patterns and a central fountain, midday sun, perfect order, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_orderchaos_01_b.png",
      "alt": "Complexity & Chaos",
      "prompt": "A provocative abstract art installation of tangled wires and broken mirrors, asymmetrical shapes and vibrant colors, dramatic shadow lighting, chaotic energy, 8k",
      "inference": {
        "traits": {
          "Openness": 0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_IndividualCommunity_01",
    "layer": 2,
    "theme": "Independence & Individualism vs Community & Belonging",
    "imageA": {
      "src": "/images/visual-profiler/l2_individualcommunity_01_a.png",
      "alt": "Independence & Individualism",
      "prompt": "A lone hiker standing on a mountain summit with arms raised, vast landscape below, sunrise light, self-reliant triumph, 8k",
      "inference": {
        "traits": {
          "Extraversion": -0.5
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_individualcommunity_01_b.png",
      "alt": "Community & Belonging",
      "prompt": "A lively community farmers' market with neighbors chatting and children playing, colorful stalls under daylight, strong communal vibe, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.5,
          "Agreeableness": 0.5
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_FamilyCareer_01",
    "layer": 2,
    "theme": "Family-Oriented vs Career-Focused",
    "imageA": {
      "src": "/images/visual-profiler/l2_familycareer_01_a.png",
      "alt": "Family-Oriented",
      "prompt": "A multi-generational family gathered around a dinner table, smiling and holding hands during a meal, warm interior lighting, feeling of togetherness, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.6
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_familycareer_01_b.png",
      "alt": "Career-Focused",
      "prompt": "A lone executive in a high-rise corner office at night, city skyline through the window, working late with papers and laptop, cool blue lighting, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.6,
          "Agreeableness": -0.3
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_LuxurySimple_01",
    "layer": 2,
    "theme": "Extravagant & Materialistic vs Humble & Frugal",
    "imageA": {
      "src": "/images/visual-profiler/l2_luxurysimple_01_a.png",
      "alt": "Extravagant & Materialistic",
      "prompt": "A wealthy scene: a sleek Lamborghini parked before a mansion's grand entrance, marble statues and fountains, sunset glow, opulence on display, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.6
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_luxurysimple_01_b.png",
      "alt": "Humble & Frugal",
      "prompt": "A simple off-grid tiny house cabin in the woods, a single old truck outside, solar panels on the roof, dusk light, modest and content atmosphere, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.5,
          "Openness": -0.3
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_SpiritualScience_01",
    "layer": 2,
    "theme": "Spiritual & Mystical vs Rational & Scientific",
    "imageA": {
      "src": "/images/visual-profiler/l2_spiritualscience_01_a.png",
      "alt": "Spiritual & Mystical",
      "prompt": "A tranquil candlelit room with incense, crystals, and a person meditating beneath a wall of spiritual symbols, ethereal glow, mystic ambiance, 8k",
      "inference": {
        "traits": {
          "Openness": 0.6
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_spiritualscience_01_b.png",
      "alt": "Rational & Scientific",
      "prompt": "A modern laboratory with a scientist peering into a microscope, bright white lighting, clean equipment, atmosphere of precision and logic, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.6,
          "Openness": 0.3
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_AdventureSecurity_01",
    "layer": 2,
    "theme": "Risk-Taking Adventure vs Safety & Security",
    "imageA": {
      "src": "/images/visual-profiler/l2_adventuresecurity_01_a.png",
      "alt": "Risk-Taking Adventure",
      "prompt": "A person paragliding over a coastal cliff at sunset, bold colorful parachute, expansive ocean view, thrilling freedom, 8k",
      "inference": {
        "traits": {
          "Openness": 0.7,
          "Neuroticism": -0.5
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_adventuresecurity_01_b.png",
      "alt": "Safety & Security",
      "prompt": "A cozy suburban home at dusk with warm lights on, a tall fence and security cameras visible, safe and settled atmosphere, 8k",
      "inference": {
        "traits": {
          "Neuroticism": 0.7,
          "Conscientiousness": 0.5
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_CreativePractical_01",
    "layer": 2,
    "theme": "Creative Free-Spirit vs Pragmatic & Conventional",
    "imageA": {
      "src": "/images/visual-profiler/l2_creativepractical_01_a.png",
      "alt": "Creative Free-Spirit",
      "prompt": "A bohemian artist loft with colorful wall murals, hanging plants and fabrics, sunlight flooding through big windows onto art in progress, whimsical atmosphere, 8k",
      "inference": {
        "traits": {
          "Openness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_creativepractical_01_b.png",
      "alt": "Pragmatic & Conventional",
      "prompt": "A neat suburban living room with beige walls, a comfortable sofa and a television, family photos on the mantle, bright even lighting, conventional feel, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.8
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_ExcitementPeace_01",
    "layer": 2,
    "theme": "High Energy Life vs Calm & Peaceful Life",
    "imageA": {
      "src": "/images/visual-profiler/l2_excitementpeace_01_a.png",
      "alt": "High Energy Life",
      "prompt": "A busy city street at night with bright marquee lights and people rushing, light trails from cars, vibrant and fast-paced atmosphere, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_excitementpeace_01_b.png",
      "alt": "Calm & Peaceful Life",
      "prompt": "A quiet rural field at dusk with fireflies floating above grass, a small cottage in the distance, slow and peaceful ambiance, 8k",
      "inference": {
        "traits": {
          "Extraversion": -0.8,
          "Neuroticism": -0.4
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_MinimalistMaximalist_01",
    "layer": 2,
    "theme": "Minimalism vs Maximalism",
    "imageA": {
      "src": "/images/visual-profiler/l2_minimalistmaximalist_01_a.png",
      "alt": "Minimalism",
      "prompt": "A completely empty white room with a single chair, clean lines, negative space, zen minimalism, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.7
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_minimalistmaximalist_01_b.png",
      "alt": "Maximalism",
      "prompt": "A room filled with eclectic decor, patterned wallpapers, colorful rugs, and art covering every wall, bohemian maximalism, 8k",
      "inference": {
        "traits": {
          "Openness": 0.7
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_ConformityRebellion_01",
    "layer": 2,
    "theme": "Conformity vs Rebellion",
    "imageA": {
      "src": "/images/visual-profiler/l2_conformityrebellion_01_a.png",
      "alt": "Conformity",
      "prompt": "A row of identical houses in a suburb, perfectly manicured lawns, uniform and orderly, sense of belonging, 8k",
      "inference": {
        "traits": {
          "Agreeableness": 0.6,
          "Conscientiousness": 0.4
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_conformityrebellion_01_b.png",
      "alt": "Rebellion",
      "prompt": "A punk rock concert with a moshing crowd, mohawks, leather jackets, chaotic energy, anti-establishment vibe, 8k",
      "inference": {
        "traits": {
          "Openness": 0.6,
          "Agreeableness": -0.4
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_TechOffGrid_01",
    "layer": 2,
    "theme": "High-Tech vs Off-Grid",
    "imageA": {
      "src": "/images/visual-profiler/l2_techoffgrid_01_a.png",
      "alt": "High-Tech",
      "prompt": "A futuristic smart home interior with voice-activated controls, holographic displays, sleek glass surfaces, connected lifestyle, 8k",
      "inference": {
        "traits": {
          "Openness": 0.6
        },
        "iab": [
          "IAB19"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_techoffgrid_01_b.png",
      "alt": "Off-Grid",
      "prompt": "A rustic cabin in the mountains with a wood stove, no electronics visible, candlelight, simple living, connection to nature, 8k",
      "inference": {
        "traits": {
          "Openness": -0.4,
          "Neuroticism": -0.3
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_DisciplineSpontaneity_01",
    "layer": 2,
    "theme": "Discipline vs Spontaneity",
    "imageA": {
      "src": "/images/visual-profiler/l2_disciplinespontaneity_01_a.png",
      "alt": "Discipline",
      "prompt": "A martial arts dojo with students in perfect rows practicing a kata, focus and precision, clean white uniforms, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.8
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_disciplinespontaneity_01_b.png",
      "alt": "Spontaneity",
      "prompt": "A group of friends jumping into a lake with clothes on, splashing water, laughter, unplanned fun, summer vibes, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": -0.6,
          "Extraversion": 0.5
        },
        "iab": []
      }
    }
  },
  {
    "id": "L2_AmbitionContentment_01",
    "layer": 2,
    "theme": "Ambition vs Contentment",
    "imageA": {
      "src": "/images/visual-profiler/l2_ambitioncontentment_01_a.png",
      "alt": "Ambition",
      "prompt": "A person giving a keynote speech on a large stage, spotlight, confident posture, audience listening, success and drive, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.7,
          "Conscientiousness": 0.6
        },
        "iab": []
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l2_ambitioncontentment_01_b.png",
      "alt": "Contentment",
      "prompt": "A person gardening in a backyard, hands in soil, peaceful smile, simple pleasure, connection to earth, 8k",
      "inference": {
        "traits": {
          "Neuroticism": -0.5,
          "Agreeableness": 0.4
        },
        "iab": []
      }
    }
  },
  {
    "id": "L3_GolfVsBasketball_01",
    "layer": 3,
    "theme": "Golf vs Basketball",
    "imageA": {
      "src": "/images/visual-profiler/l3_golfvsbasketball_01_a.png",
      "alt": "Golf",
      "prompt": "A serene golf course green at sunrise with a golfer lining up a putt, neat flag in the hole, dew on the grass, calm focused atmosphere, 8k",
      "inference": {
        "traits": {
          "Extraversion": -0.5,
          "Conscientiousness": 0.5
        },
        "iab": [
          "IAB17"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l3_golfvsbasketball_01_b.png",
      "alt": "Basketball",
      "prompt": "An outdoor basketball court in the city with players leaping for a dunk, urban graffiti backdrop, sunset lighting, dynamic action, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.7
        },
        "iab": [
          "IAB17"
        ]
      }
    }
  },
  {
    "id": "L3_StrategyVsFPS_01",
    "layer": 3,
    "theme": "Strategy Games vs FPS Games",
    "imageA": {
      "src": "/images/visual-profiler/l3_strategyvsfps_01_a.png",
      "alt": "Strategy Games",
      "prompt": "An intense top-down view of a player planning moves on a detailed strategy board game or RTS video game map on screen, cool focused lighting, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.6,
          "Openness": 0.5
        },
        "iab": [
          "IAB9"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l3_strategyvsfps_01_b.png",
      "alt": "FPS Games",
      "prompt": "A first-person view of a video game character in a fast-paced shooter battle, gun in hand, explosions in a war-torn arena, high-adrenaline energy, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.6
        },
        "iab": [
          "IAB9"
        ]
      }
    }
  },
  {
    "id": "L3_ClassicalVsEDM_01",
    "layer": 3,
    "theme": "Classical Music vs EDM (Electronic Dance Music)",
    "imageA": {
      "src": "/images/visual-profiler/l3_classicalvsedm_01_a.png",
      "alt": "Classical Music",
      "prompt": "A grand orchestra performing on stage, violinists and cellists in focus, elegant concert hall with warm lighting, sheet music on stands, 8k",
      "inference": {
        "traits": {
          "Openness": 0.6,
          "Conscientiousness": 0.4
        },
        "iab": [
          "IAB1"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l3_classicalvsedm_01_b.png",
      "alt": "EDM (Electronic Dance Music)",
      "prompt": "A packed EDM festival at night, DJ on a futuristic neon-lit stage, crowd dancing with glow sticks, laser lights and bass drop energy, 8k",
      "inference": {
        "traits": {
          "Extraversion": 0.7,
          "Openness": 0.5
        },
        "iab": [
          "IAB1"
        ]
      }
    }
  },
  {
    "id": "L3_SciFiVsHistorical_01",
    "layer": 3,
    "theme": "Sci-Fi Movies vs Historical Drama",
    "imageA": {
      "src": "/images/visual-profiler/l3_scifivshistorical_01_a.png",
      "alt": "Sci-Fi Movies",
      "prompt": "A futuristic space battle scene with starships firing lasers against a planet backdrop, intense cosmic colors, epic scale, 8k",
      "inference": {
        "traits": {
          "Openness": 0.8
        },
        "iab": [
          "IAB1",
          "IAB15"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l3_scifivshistorical_01_b.png",
      "alt": "Historical Drama",
      "prompt": "A lavish historical drama scene in a Victorian ballroom with aristocrats dancing, ornate chandeliers, period costumes, cinematic warm lighting, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.5,
          "Openness": 0.3
        },
        "iab": [
          "IAB1"
        ]
      }
    }
  },
  {
    "id": "L3_FineDiningVsStreetFood_01",
    "layer": 3,
    "theme": "Fine Dining vs Street Food",
    "imageA": {
      "src": "/images/visual-profiler/l3_finediningvsstreetfood_01_a.png",
      "alt": "Fine Dining",
      "prompt": "A Michelin-star gourmet dish plated artfully on a white plate in a fancy restaurant, garnish tweezed perfectly, soft romantic lighting, 8k",
      "inference": {
        "traits": {
          "Conscientiousness": 0.6,
          "Openness": 0.4
        },
        "iab": [
          "IAB8"
        ]
      }
    },
    "imageB": {
      "src": "/images/visual-profiler/l3_finediningvsstreetfood_01_b.png",
      "alt": "Street Food",
      "prompt": "A vibrant street market stall serving tacos, with a hand holding a rustic paper-wrapped taco, colorful street scene, bright natural light, 8k",
      "inference": {
        "traits": {
          "Openness": 0.7
        },
        "iab": [
          "IAB8"
        ]
      }
    }
  },
];

export const IAB_LABELS: Record<string, string> = {
  'IAB1': 'Arts & Entertainment',
  'IAB2': 'Automotive',
  'IAB3': 'Business',
  'IAB4': 'Careers',
  'IAB5': 'Education',
  'IAB6': 'Family & Parenting',
  'IAB7': 'Health & Fitness',
  'IAB8': 'Food & Drink',
  'IAB9': 'Hobbies & Interests',
  'IAB10': 'Home & Garden',
  'IAB11': 'Law, Gov, & Politics',
  'IAB12': 'News',
  'IAB13': 'Personal Finance',
  'IAB14': 'Society',
  'IAB15': 'Science',
  'IAB16': 'Pets',
  'IAB17': 'Sports',
  'IAB18': 'Style & Fashion',
  'IAB19': 'Technology & Computing',
  'IAB20': 'Travel',
  'IAB21': 'Real Estate',
  'IAB22': 'Shopping',
  'IAB23': 'Religion & Spirituality',
};
