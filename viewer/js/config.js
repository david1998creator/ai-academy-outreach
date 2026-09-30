// Waynautic Academy — Brand Knowledge & Default Configurations

const STORAGE_KEY_DB = 'waynautic_campaigns_db';
const STORAGE_KEY_API = 'waynautic_gemini_api_key';
const STORAGE_KEY_GALLERY = 'waynautic_flyer_gallery';
const STORAGE_KEY_LEADS = 'waynautic_leads_pipeline';
const STORAGE_KEY_GOOGLE_API = 'waynautic_google_search_key';
const STORAGE_KEY_GOOGLE_CX = 'waynautic_google_search_cx';
const STORAGE_KEY_APOLLO_API = 'waynautic_apollo_api_key';

const DEFAULT_LEADS = [
  {
    id: 101,
    name: "Prof. Rushikesh Pande",
    headline: "Training and Placement Officer (TPO)",
    college: "PCET's Nutan Maharashtra Institute of Engineering & Technology",
    location: "Pune, Maharashtra",
    phone: "9604356684",
    email: "",
    audience: "tpo",
    linkedinUrl: "https://in.linkedin.com/in/rushikesh-pande-9650a914a",
    pitchGenerated: "",
    status: "Verified Lead"
  },
  {
    id: 102,
    name: "Dr. Sheetalkumar Rawandale",
    headline: "Dean Industry Institute Interaction & Training and Placement Officer",
    college: "Pimpri Chinchwad College of Engineering (PCCOE)",
    location: "Pune, Maharashtra",
    phone: "9158998226",
    email: "",
    audience: "tpo",
    linkedinUrl: "https://in.linkedin.com/in/rawandale",
    pitchGenerated: "",
    status: "High Priority"
  },
  {
    id: 103,
    name: "Aditya Kulkarni",
    headline: "B.Tech Computer Science (2025) | Aspiring AI Engineer",
    college: "COEP Technological University",
    location: "Pune, Maharashtra",
    phone: "",
    email: "",
    audience: "student",
    linkedinUrl: "https://in.linkedin.com/in/aditya-kulkarni-ai",
    pitchGenerated: "",
    status: "Student Candidate"
  },
  {
    id: 104,
    name: "Neha Deshmukh",
    headline: "Final Year MCA (2025) | Python, RAG & Vector Databases",
    college: "MIT World Peace University",
    location: "Pune, Maharashtra",
    phone: "",
    email: "",
    audience: "student",
    linkedinUrl: "https://in.linkedin.com/in/neha-deshmukh-mca",
    pitchGenerated: "",
    status: "Student Candidate"
  }
];

const WAYNAUTIC_BRAND_SYSTEM_PROMPT = `
You are the Chief AI Growth & Curriculum Strategist for Waynautic Academy (academy.waynautic.com), working directly with Founder & Senior AI Architect Pramod Gogadare.

You must strictly ground all generated content in the verified facts and brand pillars below:

1. BRAND IDENTITY & ETHOS:
   - Name: Waynautic Academy (Division of Waynautic Technologies).
   - Core Mission: Bridge the brutal gap between superficial AI tutorials and high-paying enterprise engineering jobs.
   - Core Technologies: Python, Git Version Control, Vector Databases (Pinecone, Chroma, Qdrant), RAG (Retrieval-Augmented Generation), Model Context Protocol (MCP), Local AI Deployment (Ollama, vLLM, open weights), and Autonomous Agentic AI Workflows.
   
2. STRICT NEGATIVE RULES (NEVER VIOLATE):
   - NEVER say "No Coding Required" or "Non-technical AI tools".
   - NEVER mention generic tools like Zapier, ChatGPT prompt whispering, copywriting prompts, or automating emails.
   - Waynautic teaches REAL CODING, system architecture, token economics, and engineering guardrails.

3. CORE VALUE PROPOSITION & OFFERS:
   - Offer 1 (Flagship Masterclass): 4-Week AI Intensive Cohort + 3-MONTH INDUSTRY INTERNSHIP right after training + Dual Certification (Verifiable Internship Certificate + Program Completion) + 1-on-1 Dedicated Senior Mentor + 4–5 Agentic Portfolio Projects. Fee: ₹9,999 (incl. 18% GST, originally ₹20,000).
   - Offer 2 (Tripwire Hook): ₹19 Live AI Masterclass Webinar (90-min hands-on code-along building a RAG agent from scratch + resume/portfolio audit).
   - Offer 3 (Zero-Friction Magnet): 100% Free 1-on-1 AI Career Consultation & Personalized Roadmap (15 mins via Google Meet with Pramod Gogadare).

4. CREDIBILITY & CONTACT:
   - Award: Winner of "Best AI/ML Testing Strategy 2025" at the GenAI and ML Awards (https://lnkd.in/p/dPmtiGUF).
   - Official Contact: Pramod Gogadare — +91 9158998226 | academy.waynautic.com.

5. CREATIVE DIVERSITY MANDATE:
   - Vary your opening hook, sentence length, and vocabulary on every generation.
   - Use punchy, modern formatting with emojis, bolding, and bullet points. Never be generic or robotic.
`;

const DEFAULT_FLYER_DATA = {
  categoryTag: "MARKET-READY TRAINING",
  headline: "AI skills are no longer optional. They're",
  headlineHighlight: "essential.",
  description: "A practical training program to learn AI the right way, and turn it into a skill employers actually notice. Built for students and professionals, no prior experience needed.",
  features: [
    { icon: "▶", title: "56 topics — video + live sessions", sub: "Every topic covered on video, reinforced through live sessions" },
    { icon: "📅", title: "4 weeks — basics to advanced", sub: "A fast, structured path from fundamentals to advanced AI" },
    { icon: "🛡️", title: "4-5 agentic, market-ready projects", sub: "Build real, portfolio-ready AI projects, not just theory" }
  ],
  takeaways: [
    "<strong>Personalized training with a dedicated mentor</strong>",
    "<strong>Continue with 3-Month Industry Internship</strong> right after AI training.",
    "<strong>Real fundamentals, hands-on practice, and a certification that proves it</strong> — not just another AI trend to chase."
  ],
  closingCta: "Enroll now and start building AI skills that actually matter for your career.",
  ctaHeading: "Enroll in the training program",
  ctaSub: "Scan the code or use the contact details to register.",
  footerNote: "Open to college students & working professionals across all streams."
};

const DEFAULT_CAMPAIGNS = [
  {
    id: 1,
    title: "1. 4-Week Cohort + 3-Month Internship (Flagship)",
    prompt: "4-Week Cohort with 56 topics, 1-on-1 dedicated mentor, 4-5 agentic AI projects, and guaranteed 3-Month Industry Internship with Dual Certification.",
    flyer: "Flagship Visual Flyer: 56 Topics, 4 Weeks, 4-5 Agentic Projects, Dedicated 1-on-1 Mentor, 3-Month Industry Internship & Dual Certificate.",
    flyerImage: "assets/flyer_sample_reference.png",
    wa: `🎓 *Tired of basic YouTube tutorials that don't get you hired?*

Most engineering graduates have "basic Python" or "Titanic dataset" on their resume — and recruiters skip right past them.

To crack modern tech jobs, you need to showcase *production-grade Generative AI, Vector Databases, and Agentic Systems.*

At *Waynautic Academy*, we're opening our next 4-Week AI Intensive Cohort:

🔥 *Why this stands out for students:*
✅ *4 Weeks Structured AI Training*: From zero to production-grade AI.
✅ *4–5 Agentic Portfolio Projects*: Live GitHub repos you can actually demo in interviews.
✅ *3-Month Industry Internship*: Real hands-on experience directly following your 4-week training.
✅ *Dual Certification*: Program Completion + Verifiable 3-Month Industry Internship Certificate.
✅ *1-on-1 Dedicated Mentor*: Real code reviews and weekly doubt clearance.

🏆 *Credibility:* Winner of the *Best AI/ML Testing Strategy 2025* at the GenAI and ML Awards.

👉 *Book your Free 1-on-1 Consultation & AI Career Roadmap:*
https://wa.me/919158998226?text=Hi%20Pramod,%20I%20am%20a%20student%20and%20want%20to%20know%20about%20the%20AI%20Training%20%2B%203-Month%20Internship

📞 Contact: Pramod Gogadare — +91 9158998226
🌐 Website: https://academy.waynautic.com/`,
    li: `"I completed three 20-hour courses on Udemy, but when asked in an interview to architect a basic multi-agent system, I froze."

A student shared this with me during our 1-on-1 onboarding session last week.

Watching someone else write code produces the illusion of competence. You feel like you're learning, but your brain hasn't wrestled with a single cryptic stack trace or rate limit error.

When we designed Waynautic Academy, we made a radical decision:
No passive lectures. No massive 100-person Zoom calls.

Instead:
1. Every student is paired with a dedicated 1-on-1 mentor.
2. You write the code, diagnose real edge cases, and refactor PRs.
3. You build 4–5 agentic AI portfolio projects.
4. Transition straight into a 3-Month Industry Internship.

👉 Book a free 15-minute roadmap call with us: https://wa.me/919158998226?text=Hi%20Pramod,%20I%20want%20to%20break%20out%20of%20tutorial%20hell`,
    pb: `"If you want verifiable job experience: our 4-Week Cohort includes 56 topics, 1-on-1 mentor, 4-5 projects + guaranteed 3-Month Industry Internship with Dual Certificates for ₹9,999 (incl. GST). Regular fee is ₹20,000. Would you like to review the syllabus or jump on a quick 10-minute call?"`
  },
  {
    id: 2,
    title: "2. ₹19 Live AI Masterclass Webinar (Impulse Hook)",
    prompt: "90-minute live interactive masterclass for ₹19. Build an agentic RAG assistant live, resume audit, participation certificate.",
    flyer: "₹19 Flash Offer Badge: 90 Minutes Live Code-Along, RAG Assistant Build, 1-on-1 Career Roadmap credit.",
    flyerImage: "assets/flyer_sample_reference.png",
    wa: `⚡ *FLASH ANNOUNCEMENT: Live Interactive AI Masterclass for just ₹19!*

Tired of generic AI hype? Join our exclusive live hands-on masterclass with the engineering team at *Waynautic Academy*.

🎟️ *Regular Price: ₹499*
🔥 *Introductory Price: ₹19 ONLY* (First 50 registrations)

🕒 *What you will experience in 90 Minutes:*
🔹 Live Code Along: Build a real RAG-powered AI Assistant from scratch
🔹 How top tech firms evaluate AI developer candidates in 2026
🔹 Understand Autonomous Agents, MCP Protocol & Vector Databases
🔹 Live Q&A and Portfolio/Resume tips with senior AI mentors
🔹 *Bonus:* Certificate of Participation + 2026 AI Roadmap PDF included!

👉 *Reserve your seat now for just ₹19:*
https://wa.me/919158998226?text=Hi%20Pramod,%20I%20want%20to%20register%20for%20the%20Live%20AI%20Webinar%20for%20Rs%2019`,
    li: `Most AI webinars are 10 minutes of theory followed by 50 minutes of sales pitches.

We decided to do something completely different.

This weekend, Waynautic Academy is hosting an interactive 90-Minute Live AI Engineering Masterclass:
• Live code-along: Building an Agentic RAG assistant from scratch
• Deconstructing real tech interview questions for AI roles in 2026
• Live 1-on-1 resume and project critique session
• Certificate of Participation + Complete Source Code repo

Original Ticket Price: ₹499.
Introductory Community Pass: Just ₹19.

👉 Comment "WEBINAR" or drop a quick DM, and I'll send you the direct registration link!`,
    pb: `"Hey! The ₹19 webinar gives you 90 mins of live coding where we build an AI agent from scratch. Here is the direct registration link: https://academy.waynautic.com/ or pay ₹19 directly via UPI to 9158998226 to book your slot!"`
  },
  {
    id: 3,
    title: "3. Free 1-on-1 AI Career Consultation (Zero Friction)",
    prompt: "100% Free 15-Minute Strategy Call with Pramod Gogadare. Skill gap analysis, custom curriculum roadmap, resume review.",
    flyer: "100% Free 15-Minute Strategy Session: Personalized AI Learning Roadmap, Resume Review, Career Guidance.",
    flyerImage: "assets/flyer_sample_reference.png",
    wa: `👋 *Want an honest review of your AI career roadmap?*

Navigating the AI landscape can be overwhelming — should you learn PyTorch, LangChain, LlamaIndex, fine-tuning, or RAG? What about agentic workflows?

To help you get clarity, *Waynautic Academy* is offering a limited number of *Free 1-on-1 AI Career Consultation Sessions (15 Mins)* this week.

🎯 *What we do during this session:*
1. Assess your current programming skills (Python, JavaScript, etc.)
2. Map out a personalized 30-day learning curriculum tailored to your goals
3. Review your resume to identify missing AI keywords & projects

👉 *Claim your free slot today:*
https://wa.me/919158998226?text=Hi%20Pramod,%20I'd%20like%20to%20schedule%20my%20Free%201-on-1%20AI%20Roadmap%20Session`,
    li: `The gap between a junior developer and a high-earning AI Engineer comes down to mastering 5 distinct pillars:
1. Token Economics & Provider APIs
2. Hybrid Semantic Retrieval
3. Model Context Protocol (MCP) & Standardized Tool Calling
4. Agentic Control Loops & State Persistence
5. Evaluation & Guardrail Frameworks

We've compiled this into "The Complete 2026 AI Engineering Roadmap". Want a copy? Comment "ROADMAP" below!`,
    pb: `"Hey [Name], thanks for reaching out! I just sent you the 2026 AI Roadmap. We also have 3 free slots open this Thursday for a 15-minute 1-on-1 session to map out your transition plan. Shall I block one for you?"`
  },
  {
    id: 4,
    title: "4. GenAI Award 2025 Winner & Credibility (Authority)",
    prompt: "Winner of Best AI/ML Testing Strategy 2025 at the GenAI & ML Awards. Learn enterprise engineering standards.",
    flyer: "Award Winner Badge: Best AI/ML Testing Strategy 2025. Enterprise rigor, automated evaluation harnesses.",
    flyerImage: "assets/flyer_sample_reference.png",
    wa: `🏆 *Learn AI Engineering from National Award Winners!*

Waynautic Technologies was awarded *Best AI/ML Testing Strategy 2025* at the GenAI & ML Awards (https://lnkd.in/p/dPmtiGUF).

We don't teach surface-level tutorials. We train you on:
• Enterprise vector caching & hybrid semantic retrieval
• Automated regression testing for LLMs & multi-agent loops
• Prompt injection defense & production security guardrails

👉 Book your 1-on-1 AI strategy session with mentor Pramod Gogadare:
https://wa.me/919158998226?text=Hi%20Pramod,%20I%20want%20to%20learn%20about%20enterprise%20AI%20training`,
    li: `Winning the "Best AI/ML Testing Strategy 2025" at the GenAI and ML Awards was an incredible milestone for our team at Waynautic Technologies.

🏆 Announcement: https://lnkd.in/p/dPmtiGUF

More than the trophy, it was a validation of a core philosophy:
"If you can't test, evaluate, and benchmark your AI system, you haven't built software — you've built a gamble."

When companies deploy LLM applications, they face regression drift, token bloat, and hallucinations. Our award-winning framework tackled these head-on.`,
    pb: `"We won the Best AI/ML Testing Strategy 2025 at the GenAI Awards because we emphasize real system reliability over toy demos. When you join our cohort, you build systems to that exact enterprise standard."`
  },
  {
    id: 5,
    title: "5. Production RAG & MCP Engineering (Technical Depth)",
    prompt: "Deep dive into why 90% of RAG implementations break in production. Hybrid search, cross-encoder rerankers, MCP.",
    flyer: "Technical Deep Dive: Vector Databases, Hybrid Search (BM25 + Dense), MCP Tool Calling, Enterprise Guardrails.",
    flyerImage: "assets/flyer_sample_reference.png",
    wa: `💼 *Software Engineering is shifting to AI Engineering. Are you keeping up?*

Calling an OpenAI API is easy. What enterprises are paying top salaries for is:
• Token economics and inferencing optimization
• Vector index sharding & hybrid semantic search
• Enterprise-grade guardrails (Prompt injection defense, PII masking)
• Autonomous agent orchestration with MCP protocols

At *Waynautic Academy*, we train working developers with production-grade curriculum designed by award-winning practitioners.

👉 *Schedule a Free 1-on-1 AI Upskilling Consultation:*
https://wa.me/919158998226?text=Hi%20Pramod,%20I%20am%20a%20working%20developer%20interested%20in%20transitioning%20to%20AI%20Engineering`,
    li: `Most developers build RAG systems like this:
1. Load a PDF -> 2. Split into 500-token chunks -> 3. Cosine similarity.
Then it hallucinates in production.

Here is what enterprise-grade RAG actually looks like:
1️⃣ Semantic & Structure-Aware Chunking
2️⃣ Hybrid Search (Dense + Sparse with Reciprocal Rank Fusion)
3️⃣ Re-ranking Stage (Cross-Encoder)
4️⃣ Evaluation Guardrails (Faithfulness & Relevance)

Stop building demo-grade toys. Build architectures that withstand live traffic.`,
    pb: `"Great question about hybrid search! We actually build an end-to-end hybrid RAG pipeline with Cohere reranking in Week 3 of the cohort. Would you like to see the code structure we teach?"`
  }
];
