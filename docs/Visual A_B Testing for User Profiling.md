# **Visual Psychometrics & The Architecture of Implicit Interest: A Technical Report on Next-Generation User Profiling**

## **Executive Summary**

The digital attention economy has historically relied on two primary methods of user profiling: explicit declaration (surveys, profile fields) and behavioral tracking (clickstream analysis). Both paradigms are currently facing existential threats. Explicit declaration suffers from extreme user fatigue and social desirability bias—users lie to look better, or simply disengage due to friction. Behavioral tracking is increasingly obfuscated by privacy regulations (GDPR, CCPA) and the "cookie-less" future.  
This report proposes a third way: **Implicit Visual Psychometrics**. By presenting users with a "Visual A/B Testing" interface—a rapid-fire, low-friction selection mechanism between binary image pairs—we can infer deep psychological traits, value systems, and commercial interests without ever asking a text-based question.  
This document serves as the comprehensive architectural specification for this system. It functions as a bridge between high-level personality psychology and granular data science. We employ a funnel strategy:

1. **Layer 1 (The Psychometric Baseline):** Inferring the Big Five (OCEAN) personality traits via abstract visual preferences (e.g., Entropy vs. Order).  
2. **Layer 2 (Lifestyle & Values):** Decoding sociological signaling through aesthetic choices (e.g., "Old Money" vs. "New Money," "Solarpunk" vs. "Industrial").  
3. **Layer 3 (Commercial Taxonomy):** Mapping these psychographic clusters directly to the IAB (Interactive Advertising Bureau) Content Taxonomy v3.0 for actionable ad targeting.

The deliverable includes a theoretical defense of visual proxies, a detailed algorithmic methodology for the inference engine, and a structured dataset of 50 Visual Image Pairs (with Midjourney prompts) designed to segment the user base with high-dimensional accuracy.

## **1\. Introduction: The Crisis of Explicit Data and the Visual Turn**

The foundational premise of this profiling system is that *images are data*. In the contemporary digital landscape, the user's interaction with visual stimuli is often more honest and revealing than their interaction with text. Text requires "System 2" thinking—slow, deliberative, and prone to filtering. Visual preference is often "System 1"—fast, instinctual, and deeply connected to the limbic system.

### **1.1 The Limitations of Traditional Psychographics**

Traditional psychometric profiling relies on lexical hypothesis—the idea that individual differences are encoded in language. Tools like the NEO-PI-R or the Big Five Inventory (BFI) ask users to rate statements like "I am the life of the party" or "I get stressed easily". While scientifically robust, these methods fail in a social networking context for several reasons:

* **Cognitive Load**: Text-based surveys interrupt the "flow" of social media usage.  
* **Self-Presentation Bias**: Users consciously curate their text responses to project an idealized self.  
* **Cultural Linguistic Barriers**: Nuances of words like "anxious" or "artistic" vary across cultures.

### **1.2 The Visual Proxy Hypothesis**

Visual Psychometrics posits that aesthetic choices are not random; they are downstream manifestations of upstream personality traits. A preference for symmetry is not just a taste for balance; it is a reliable proxy for **Conscientiousness** and a biological signal for health and order. A preference for high-complexity, abstract imagery is a robust correlate of **Openness to Experience**.  
By leveraging these correlations, we can construct a "Visual A/B" engine that feels like a game or a mood board creator to the user, but functions as a sophisticated diagnostic tool for the platform. This approach aligns with the "gamification" of data collection, ensuring high engagement rates while populating the backend with rich, multi-dimensional user profiles.

## **2\. Layer 1 Analysis: The Psychometric Foundation (OCEAN)**

The first layer of our funnel is the **Five-Factor Model (Big Five)**. This provides the stable "operating system" of the user's personality. We do not need to ask users who they are; we show them images, and they tell us through their gaze and their clicks.

### **2.1 Openness to Experience (The Aesthetic Dimension)**

**Definition:** Openness (O) measures creativity, curiosity, and a preference for novelty over routine. It is the single strongest predictor of aesthetic preference and interest in the arts.  
**Visual Correlates:**

* **Complexity vs. Simplicity:** High-O individuals have a high tolerance for ambiguity and visual entropy. They prefer complex, asymmetrical, and abstract images. Low-O individuals (Traditionalists) prefer simple, representational, and hyper-realistic images.  
* **Novelty vs. Familiarity:** High-O users are drawn to the "weird"—surrealism, glitch art, and non-Euclidean geometry. Low-O users prefer the "classic"—landscapes, portraits, and clear subjects.

**IAB Mapping Implications:**

* *High O*: IAB1 (Arts & Entertainment), IAB19 (Technology), IAB20 (Travel \- Adventure).  
* *Low O*: IAB4 (Family & Relationships), IAB13 (Personal Finance), IAB11 (Law, Gov, Politics \- Conservative).

### **2.2 Conscientiousness (The Order Dimension)**

**Definition:** Conscientiousness (C) reflects self-discipline, dutifulness, and a preference for planned rather than spontaneous behavior.  
**Visual Correlates:**

* **Symmetry & Structure:** High-C is strongly correlated with a preference for symmetry and balance. The cognitive mechanism here is the "Need for Closure"; symmetrical images are processed more efficiently and signal order. Visuals featuring "knolling" (objects arranged at 90-degree angles) or clean, minimalist architecture appeal to High-C users.  
* **Chaos Aversion:** High-C users react negatively to visual clutter, "messy" textures (like splatter art), or disorganization.

**IAB Mapping Implications:**

* *High C*: IAB13 (Personal Finance), IAB3 (Business), IAB8-8 (Home Improvement/Organization).  
* *Low C*: IAB1 (Arts \- Experimental), IAB9 (Hobbies \- Improv/Gaming).

### **2.3 Extraversion (The Stimulation Dimension)**

**Definition:** Extraversion (E) is characterized by energy, positive emotions, surgency, and the tendency to seek stimulation in the company of others.  
**Visual Correlates:**

* **Social Density:** The most direct proxy is the presence of people. Extraverts prefer images of crowds, parties, and team sports. Introverts show a distinct preference for nature scenes devoid of humans, or "cozy" solitary environments (nooks, cabins).  
* **Color & Saturation:** Extraverts tend to prefer "warm" and high-arousal colors (reds, oranges, high saturation). Introverts often prefer "cool" and low-arousal colors (blues, greens, pastels) to avoid overstimulation.

**IAB Mapping Implications:**

* *High E*: IAB3 (Events), IAB9 (Food & Drink \- Nightlife), IAB2 (Automotive \- Sports Cars).  
* *Low E (Introversion)*: IAB1 (Books & Literature), IAB10 (Gaming), IAB20 (Travel \- Solo/Nature).

### **2.4 Agreeableness (The Empathy Dimension)**

**Definition:** Agreeableness (A) is a tendency to be compassionate and cooperative rather than suspicious and antagonistic.  
**Visual Correlates:**

* **The Bouba/Kiki Effect:** This sound-symbolism effect extends to visual personality proxies. High-A individuals align with "Bouba" aesthetics—round, soft, organic shapes, and pastel tones. Low-A individuals (who may be more competitive or analytical) are more likely to tolerate or prefer "Kiki" aesthetics—sharp angles, high contrast, and aggressive geometry.  
* **Subject Matter:** High-A users prefer altruistic or connecting imagery (families, pets, community). Low-A users may prefer imagery of power, competition, or solitude.

**IAB Mapping Implications:**

* *High A*: IAB4 (Family), IAB11-4 (Charity/Philanthropy), IAB8-7 (Gardening).  
* *Low A*: IAB2 (Competition Sports), IAB13 (Aggressive Investing), IAB11 (Politics \- Debate).

### **2.5 Neuroticism (The Emotional Stability Dimension)**

**Definition:** Neuroticism (N) is the tendency to experience negative emotions easily, such as anger, anxiety, depression, or vulnerability.  
**Visual Correlates:**

* **Mood & Tone:** High-N can manifest in two divergent visual preferences. One is a "resonance" preference for moody, dark, or melancholic imagery (e.g., rain, fog, noir aesthetics). The other is a "regulation" preference for "safe" imagery (e.g., extremely calm, non-threatening pastoral scenes) to soothe anxiety.  
* **Threat Detection:** High-N individuals have a heightened vigilance for threat. They may avoid high-risk imagery (e.g., vertigo-inducing heights) which High-E/Low-N types (Sensation Seekers) might enjoy.

**IAB Mapping Implications:**

* *High N*: IAB7 (Health \- Mental Health), IAB1 (Arts \- Drama/Gothic), IAB23 (Wellness).  
* *Low N (Stable)*: IAB2 (Extreme Sports), IAB19 (High-Stress Careers), IAB20 (Adventure Travel).

## **3\. Layer 2 Analysis: Lifestyle, Values, and The Aesthetics of Ideology**

Once the psychometric baseline is established, we move to **Layer 2**. This layer uses "Aesthetic Tribes" and visual codes to infer deeper sociological values, political leanings, and lifestyle clusters. This is where "Visual A/B Testing" excels over text, as users often lack the vocabulary to describe their aesthetic tribe but can recognize it instantly.

### **3.1 The Aesthetics of Politics: Structure vs. Fluidity**

Political ideology is downstream of psychology. Research indicates a robust correlation between political conservatism and a preference for order, closure, and traditional aesthetic forms. Liberalism correlates with a preference for complexity, novelty, and ambiguity.

* **The Conservative Aesthetic (High C, Low O):**  
  * *Visuals*: Neoclassical architecture (columns, symmetry), realism in art, clear boundaries, pastoral landscapes, uniforms. The "Look of Power" is often rigid and vertical.  
  * *Values*: Tradition, Authority, Sanctity, Order.  
* **The Liberal Aesthetic (High O, Low C):**  
  * *Visuals*: Modernist or Deconstructivist architecture (Frank Gehry), abstract art, urban grit, multicultural crowds, organic/fluid shapes.  
  * *Values*: Fairness, Care, Liberty, Novelty.

By testing "Brutalist Government Building" vs. "Colorful Street Mural," we effectively test for "Authority" vs. "Subversion" without asking a political question.

### **3.2 Wealth Signaling: Old Money vs. New Money**

In the context of a social network, advertising targeting relies heavily on estimated income and spending habits. Visual proxies provide a nuanced view of *how* a user spends money, distinguishing between "Status" and "Class."

* **Old Money (Quiet Luxury):**  
  * *Visual Codes*: Beige, navy, linen, wool, equestrian themes, vintage cars, weathered textures, matte finishes. The focus is on *heritage* and *understatement*.  
  * *Inference*: High disposable income, but low susceptibility to trend-based advertising. Interest in *Investment Services (IAB13)* and *High-End Real Estate (IAB21)*.  
* **New Money (Loud Luxury):**  
  * *Visual Codes*: Logos, high-contrast colors (black/gold), shiny surfaces (patent leather, chrome), supercars, streetwear hype. The focus is on *visibility* and *status assertion*.  
  * *Inference*: High susceptibility to luxury goods advertising, trend-following behavior. Interest in *Luxury Auto (IAB2)* and *Designer Fashion (IAB18)*.

### **3.3 Internet Aesthetics as Value Clusters**

Modern users, particularly Gen Z and Millennials, self-segregate into "Internet Aesthetics." These are not just visual styles but coherent value systems.

* **Solarpunk:**  
  * *Visuals*: Futuristic cities with greenery, art nouveau influences, solar panels, bright optimistic lighting.  
  * *Values*: Optimism, Environmentalism, Community, High-Tech/High-Nature integration.  
  * *IAB Mapping*: *Green Living (IAB8-16)*, *Technology (IAB19)*.  
* **Dark Academia:**  
  * *Visuals*: Gothic libraries, tweed, rain, candlelight, old books.  
  * *Values*: Intellectualism, Melancholy (High N), Appreciation for History, Introversion.  
  * *IAB Mapping*: *Literature (IAB1)*, *Education (IAB5)*.  
* **Cottagecore:**  
  * *Visuals*: Rural cottages, baking, flowers, soft lighting, low-tech.  
  * *Values*: Traditionalism (aesthetic), Anti-Capitalism (retreat from work), Sustainability, Softness (High A).  
  * *IAB Mapping*: *Home & Garden (IAB8)*, *Crafts (IAB9)*.

## **4\. Layer 3 Analysis: The IAB Taxonomy Integration**

The ultimate output of this system must be actionable data. We utilize the **IAB Tech Lab Content Taxonomy v3.0** as the standard schema. The IAB taxonomy provides a standardized language for describing content, which we repurpose to describe *user interest*.

### **4.1 The Mechanism of Mapping**

We do not map 1:1. We map *clusters* of visual choices to IAB probabilities.

* *Input*: User selects **Image A** (High-Tech Minimalist Desk) in Pair 12\.  
* *Direct Inference*: Interest in **IAB19 (Technology & Computing)**.  
* *Nuanced Inference*: Specifically **IAB19-6 (Consumer Electronics)** and potentially **IAB3-11 (Remote Work/Business)**.

### **4.2 Handling Ambiguity via Triangulation**

A single choice is noisy. A user might choose the "Cottage" image because they like nature, or because they like architecture.

* *Triangulation*: We look at the choice in Pair 12 (Cottage vs. Skyscraper) AND Pair 25 (Gardening vs. Coding).  
* *Result*: If they choose Cottage \+ Gardening \-\> **IAB8 (Home & Garden)**. If they choose Cottage \+ Coding \-\> **IAB19 (Tech)** (The user might be a remote worker living rurally).

## **5\. Algorithmic Architecture: The Visual A/B Engine**

The backend of this system is not a simple decision tree; it is a **Bayesian Inference Engine**.

### **5.1 The Probability Model**

We model each user u as a vector of traits \\Theta\_u \= \\{O, C, E, A, N, Pol, Risk,...\\}. Initially, for a new user, each trait is a standard normal distribution: \\Theta\_{u,i} \\sim N(0, 1).  
Each image pair P\_j has a "Discriminator Function" D\_j(\\Theta) which predicts the probability of choosing Image A over Image B based on the traits.  
Where \\beta represent the "loadings" of the image pair (e.g., how strongly Image A appeals to Openness).

### **5.2 The Adaptive Funnel (Branching Logic)**

To maximize information gain (entropy reduction), the system uses branching logic.

* **Step 1 (Calibration)**: The first 10 pairs are fixed for all users to establish the broad baseline (Big 5).  
* **Step 2 (Branching)**:  
  * If the user scores High-Openness (O \> 0.5), the system serves pairs from the "Avant-Garde/Niche" bucket (e.g., Cyberpunk vs. Solarpunk).  
  * If the user scores Low-Openness (O \< \-0.5), the system serves pairs from the "Traditional/Family" bucket (e.g., Classic Car vs. SUV). This ensures we don't waste questions asking a "Traditionalist" about nuances of "Glitch Art."

### **5.3 The "Oddball" Validity Check**

To filter out bots and random clickers, we insert "Oddball" pairs (Pairs 4 and 45 in our set). These are pairs where the visual quality discrepancy is massive (e.g., a high-fidelity image vs. a low-res blur) or where the semantic meaning is universal. Inconsistent behavior here flags the user profile as low\_confidence.

## **6\. Dataset Specification: The "Calibrator" Phase (Pairs 1-10)**

The following table details the first 10 pairs. These are the "heavy lifters" designed to split the population along the primary OCEAN axes.

| Pair ID | Theme | Image A (Midjourney Prompt) | Image B (Midjourney Prompt) | Psychometric Inference | IAB Category Implications |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **P01** | **Entropy (O)** | "A chaotic abstract expressionist painting, explosions of color, intricate fractals, non-euclidean shapes, high entropy, 8k" | "A single perfect white egg on a smooth white table, minimalist photography, soft lighting, zen, absolute simplicity" | **A**: High Openness, High Complexity pref. **B**: High Conscientiousness, Low Openness (Need for structure) | **A**: IAB1 (Arts), IAB19 (Tech) **B**: IAB13 (Finance), IAB8 (Home/Org) |
| **P02** | **Structure (C)** | "Perfectly symmetrical Wes Anderson style shot of a library, straight lines, obsessive order, pastel color palette, center frame" | "Wild overgrown forest path, asymmetrical branches, nature taking over, chaotic organic growth, dappled light, mystery" | **A**: High Conscientiousness, High Order **B**: High Openness, Low Conscientiousness (Naturalist) | **A**: IAB11 (Gov/Law), IAB5 (Education) **B**: IAB20 (Travel), IAB8 (Gardening) |
| **P03** | **Stimulation (E)** | "A vibrant crowded dinner party in a warm Italian restaurant, laughing faces, clinking glasses, high energy, motion blur, warm tones" | "A lone figure reading a book in a window seat while it rains outside, cozy, melancholic, cool blue tones, lo-fi aesthetic" | **A**: High Extraversion (Social Seeking) **B**: High Introversion (Solitude Seeking) | **A**: IAB9 (Dining), IAB3 (Events) **B**: IAB1 (Books), IAB23 (Wellness) |
| **P04** | **Empathy (A)** | "Soft rounded marshmallows, pink bubbles, clouds, spheres, fluffy textures, pastel gradients, round edges, gentle (Bouba)" | "Sharp shards of black glass, jagged spikes, acute angles, lightning bolts, metallic textures, aggressive geometry (Kiki)" | **A**: High Agreeableness (Softness/Warmth) **B**: Low Agreeableness (Edgy/Competition) | **A**: IAB4 (Family), IAB23 (Health) **B**: IAB10 (Gaming), IAB2 (Sports) |
| **P05** | **Values (Trad)** | "A classic oil painting of a rural village, realistic style, golden hour, nostalgia, traditional technique, museum quality" | "Cyberpunk glitch art, neon holograms, futuristic cyborg, data mosh, surreal digital landscape, dystopian future" | **A**: Traditional Values, Low Openness **B**: Progressive/Tech Values, High Openness | **A**: IAB1 (History), IAB20 (Cruise Travel) **B**: IAB19 (Crypto/AI), IAB10 (Sci-Fi) |
| **P06** | **Risk (N)** | "POV looking down from a skyscraper ledge, adrenaline, parkour, vertigo, extreme height, dangerous, high contrast" | "A warm fireplace in a cozy cabin, wool blankets, hot cocoa, safety, hygge, soft warm lighting, comfort" | **A**: Low Neuroticism, High Sensation Seeking **B**: High Neuroticism (Safety Seeking), High Introversion | **A**: IAB2 (Extreme Sports), IAB20 (Adventure) **B**: IAB8 (Interior Design), IAB23 (Mental Health) |
| **P07** | **Status (Class)** | "A worn vintage beige trench coat, linen texture, equestrian vibe, matte finish, understated elegance, hamptons style" | "A shiny gold lamborghini, supreme logo style branding, diamond studded watch, high gloss, flashy luxury, vibrant saturation" | **A**: Old Money (Quiet Luxury), High C **B**: New Money (Loud Luxury), High E | **A**: IAB13 (Investments), IAB6 (Luxury Apparel) **B**: IAB2 (Supercars), IAB9 (Nightlife) |
| **P08** | **Authority (Pol)** | "Imposing brutalist government building, concrete, massive scale, rigid structure, rows of uniformed guards, order" | "Vibrant graffiti mural on a brick wall, punk aesthetics, anarchy symbol, colorful protest art, chaotic energy" | **A**: Authoritarian/Conservative, High C **B**: Libertarian/Liberal, High O | **A**: IAB11 (Politics/Gov), IAB12 (News) **B**: IAB1 (Street Art), IAB16 (Activism) |
| **P09** | **Logic (Cog)** | "Complex mechanical watch movement gears, blueprint schematic, technical drawing, precise engineering, cyanotype" | "Abstract watercolor blur, tears, emotional expression, moody atmosphere, bleeding colors, evoking sadness" | **A**: Analytical Processor (Systemizing), Low N **B**: Emotional Processor (Empathizing), High N | **A**: IAB19 (Engineering), IAB18 (Science) **B**: IAB1 (Poetry), IAB23 (Therapy) |
| **P10** | **Future (Opt)** | "Futuristic city integrated with giant trees, solar panels, glass and greenery, bright blue sky, optimistic future, clean air (Solarpunk)" | "Heavy industrial factory, smokestacks, gears, steam, sepia tone, raw power, dieselpunk, mechanical might" | **A**: Optimism, Eco-Conscious **B**: Realism, Industrial/Pragmatic | **A**: IAB8 (Sustainability), IAB19 (Green Tech) **B**: IAB2 (Trucks), IAB13 (Industry) |

## **7\. Dataset Specification: The Full 50-Pair JSON**

The following JSON object represents the complete training dataset for the Visual Profiling System. It utilizes a schema that defines the pair, the prompts for generative creation (Midjourney V6 optimized), the psychometric inference weights, and the branching logic.

### **7.1 Dataset Schema Description**

* id: Unique identifier (P01-P50).  
* layer: Which funnel layer this pair targets (1\_Big5, 2\_Lifestyle, 3\_IAB).  
* prompt\_a/b: Optimized text-to-image prompts.  
* inference: A dictionary of trait adjustments. If openness is 0.8 for choosing A, the user's Openness score increases by 0.8 standard deviations (weighted by the discriminator).  
* branch\_logic: Defines the next node. linear implies the next sequential pair. next\_if\_a allows jumping to specific sub-clusters.

`{`  
  `"dataset_meta": {`  
    `"project": "Visual Psychometrics Interest Taxonomy",`  
    `"version": "2.1",`  
    `"total_pairs": 50,`  
    `"methodology": "Forced-Choice Visual Proxy",`  
    `"author": "Lead Data Scientist"`  
  `},`  
  `"pairs":`  
`}`

## **8\. Conclusion: The Future of Implicit Profiling**

This "Visual A/B" profiling system offers a radical departure from the text-heavy, friction-laden data collection methods of the Web 2.0 era. By tapping into the "fast," intuitive layer of visual cognition, we can infer high-dimensional psychometric data with minimal user effort. The system described herein—with its funnel architecture, Bayesian inference engine, and carefully curated dataset of 50 visual pairs—provides a robust blueprint for building a next-generation "Interest Graph."  
The ethical implications of this technology are profound. We are essentially decoding the user's subconscious value system. This power must be wielded with transparency and a user-centric data governance model. When used correctly, however, it promises a digital experience that feels less like a series of forms and more like a mirror, reflecting the user's true self back to them in the content they see.  
**Future Considerations:**

* **Dynamic Generation**: The next iteration should move beyond static Midjourney pairs to *dynamically* generating pairs based on real-time user engagement data.  
* **Video Psychometrics**: Extending this logic to short-form video loops (e.g., "Calm stream vs. Raging ocean") to test temporal attention span and arousal thresholds.  
* **Cross-Modal Validation**: Correlating visual choices with Spotify listening data to build a unified "Aesthetic-Audio" profile.

This system is ready for prototype development and initial A/B testing against traditional onboarding flows.  
**References & Data Sources:** Big Five Personality Traits & Definitions. Visual Exploration & Extraversion. Openness & Aesthetic Sensitivity. Political Aesthetics & Authoritarianism. IAB Content Taxonomy v3.0. Symmetry & Complexity in Vision. Bouba/Kiki Effect & Agreeableness. Solarpunk vs Cyberpunk Aesthetics. Old Money vs New Money Signaling.

#### **Works cited**

1\. Big Five personality traits \- Wikipedia, https://en.wikipedia.org/wiki/Big\_Five\_personality\_traits 2\. Predicting perceived visual complexity of abstract patterns using computational measures: The influence of mirror symmetry on complexity perception \- PMC \- NIH, https://pmc.ncbi.nlm.nih.gov/articles/PMC5669424/ 3\. Preference for Facial Symmetry Depends on Study Design \- MDPI, https://www.mdpi.com/2073-8994/13/9/1637 4\. Aesthetic Emotions and Aesthetic People: Openness Predicts Sensitivity to Novelty in the Experiences of Interest and Pleasure \- PubMed Central, https://pmc.ncbi.nlm.nih.gov/articles/PMC4673303/ 5\. (PDF) Conservatism and art preferences \- ResearchGate, https://www.researchgate.net/publication/18478235\_Conservatism\_and\_art\_preferences 6\. Big Five Personality Traits: The 5-Factor Model of Personality \- Simply Psychology, https://www.simplypsychology.org/big-five-personality.html 7\. How Collector Personalities Relate to Their Art Preferences \- Psychology Today, https://www.psychologytoday.com/us/blog/the-mind-of-a-collector/202302/how-collector-personalities-relate-to-their-art-preferences 8\. Visual Patterns: Neuroscience Implications \- Research Design Connections, https://researchdesignconnections.com/pub/visual-patterns-neuroscience-implications 9\. Preference for symmetry: Only on Mars? \- PMC \- NIH, https://pmc.ncbi.nlm.nih.gov/articles/PMC3786096/ 10\. Big 5 Extraversion vs. Introversion Learning Styles: Is One Approach Better? \- Brainmanager.io, https://brainmanager.io/blog/cognitive/big-5-extraversion-vs-introversion-learning-style 11\. The way we look at an image or a webpage can reveal personality traits \- PubMed Central, https://pmc.ncbi.nlm.nih.gov/articles/PMC11226433/ 12\. Do extraverts process social stimuli differently from introverts? \- PMC \- PubMed Central, https://pmc.ncbi.nlm.nih.gov/articles/PMC3129862/ 13\. Introvert Vs Extrovert | We'll Send It Over Now. Structural Learning, https://www.structural-learning.com/post/introvert-vs-extrovert 14\. Bouba/kiki effect \- Wikipedia, https://en.wikipedia.org/wiki/Bouba/kiki\_effect 15\. A social Bouba/Kiki effect: A bias for people whose names match their faces \- ResearchGate, https://www.researchgate.net/publication/317501216\_A\_social\_BoubaKiki\_effect\_A\_bias\_for\_people\_whose\_names\_match\_their\_faces 16\. It's a Bouba, Not a Kiki: The Relationship Between Sound, Form, and Meaning, https://behavioralscientist.org/its-a-bouba-not-a-kiki-the-relationship-between-sound-form-and-meaning/ 17\. Using the Big Five Personality Traits (OCEAN) in Practice \- Positive Psychology, https://positivepsychology.com/big-five-personality-theory/ 18\. Individual differences in scientists' aesthetic disposition, aesthetic experiences, and aesthetic sensitivity in scientific work \- Frontiers, https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1197870/full 19\. Red or blue in the face? Study says conservatives show less emotion \- | Nebraska Today, https://news.unl.edu/article/red-or-blue-in-the-face-study-says-conservatives-show-less-emotion 20\. The Look of Power: Exploring Political Aesthetics, https://aestheticsresearch.com/2025/07/02/the-look-of-power-exploring-political-aesthetics/ 21\. Exploring the Intricate Connection Between Politics and Architecture in Shaping Society, https://illustrarch.com/articles/49958-politics-and-architecture.html 22\. Political Visual Literacy | International Political Sociology \- Oxford Academic, https://academic.oup.com/ips/article/17/3/olad010/7218981 23\. Personality and Aesthetic Preferences in Architecture: A Review of the Study Approaches and Assessment Methods \- Basic and Clinical Neuroscience, https://bcn.iums.ac.ir/browse.php?a\_id=2106\&slc\_lang=en\&sid=1\&ftxt=1\&html=1 24\. Fashion Elegance: Navigating Old Money vs. New Money Styles, https://www.masarishop.com/newsroom/lifestyle-events/fashion-elegance-navigating-old-money-vs-new-money-styles.html 25\. Old Money vs. New Money Aesthetic: Unveiling True Elegance \- Vieux Riche, https://thevieuxriche.com/blogs/articles/new-vs-old-money-aesthetic 26\. Old Money Vs New Money Key Stylistic Differences \- The VOU, https://thevou.com/blog/old-money-vs-new-money-style-differences/ 27\. Internet aesthetic \- Wikipedia, https://en.wikipedia.org/wiki/Internet\_aesthetic 28\. Category:Internet aesthetics \- Wikipedia, https://en.wikipedia.org/wiki/Category:Internet\_aesthetics 29\. Well, the split is probably related to how solarpunk isn't really related to the... | Hacker News, https://news.ycombinator.com/item?id=27869551 30\. On the Political Dimensions of Solarpunk | by Andrew Dana Hudson \- Medium, https://medium.com/solarpunks/on-the-political-dimensions-of-solarpunk-c5a7b4bf8df4 31\. Could someone explain the difference between dark academia and light academia? : r/LightAcademia \- Reddit, https://www.reddit.com/r/LightAcademia/comments/l921dj/could\_someone\_explain\_the\_difference\_between\_dark/ 32\. Dark Academia, Light Academia, & Cottagecore: Breaking Down 3 Popular Internet Aesthetics \- Wallflower Journal, https://www.wallflowerjournal.com/lifestyle/dark-academia-light-academia-amp-cottagecore-breaking-down-3-popular-internet-aesthetics 33\. IAB Categories \- Webshrinker, https://docs.webshrinker.com/v3/iab-website-categories.html 34\. Content Taxonomy \- IAB Tech Lab, https://iabtechlab.com/wp-content/uploads/2022/06/Content-Taxonomy-v3.0-FINAL.xlsx 35\. Monuments of Control: How Authoritarian Regimes Use Architecture to Shape Power, https://thesciencesurvey.com/top-stories/2025/07/06/monuments-of-control-how-authoritarian-regimes-use-architecture-to-shape-power/