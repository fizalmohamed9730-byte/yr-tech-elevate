import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import {
  type LucideIcon,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  GraduationCap,
  Headphones,
  Layers,
  Palette,
  Rocket,
  Settings,
  Smartphone,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

type SiteLink =
  | "/about"
  | "/internship"
  | "/projects"
  | "/contact"
  | "/faq"
  | "/resources"
  | "/careers";

interface ServiceDetail {
  id: string;
  icon: LucideIcon;
  tagline: string;
  title: string;
  summary: string;
  intro: string[];
  problems: { title: string; body: string }[];
  builds: string[];
  approach: { title: string; body: string }[];
  techCategories: { label: string; items: string }[];
  deliverables: string[];
  suitable: { title: string; body: string }[];
  chips: string[];
  related: { to: SiteLink; label: string }[];
}

const services: ServiceDetail[] = [
  {
    id: "web-development",
    icon: Code2,
    tagline: "Sites, Portals & Web Apps",
    title: "Web Development",
    summary:
      "Websites, customer portals and browser-based applications built with React and TypeScript, backed by documented REST APIs and a relational database.",
    intro: [
      "Web development covers everything people reach through a browser: the public website that explains what a business sells, the logged-in portal where customers manage their own account, and the internal dashboards staff use to do daily work. These share one structure — a front-end interface, server-side logic exposed as REST APIs, and a database that keeps records consistent — so decisions made about one layer shape how the others can change later.",
      "The web is usually the first place a customer meets a company, so load speed on a phone, readable content, working forms and pages search engines can parse all affect whether a visitor stays. We build with React and Next.js on the front end, Node.js or Python behind the REST APIs, and PostgreSQL (often through Supabase) for storage: a combination we document, hand over and can maintain afterwards.",
    ],
    problems: [
      {
        title: "The current site produces no enquiries",
        body: "Visitors cannot find what they need, the contact path is buried several clicks deep, or the site has drifted out of date because only a developer can change it.",
      },
      {
        title: "It breaks on phones",
        body: "The site was designed for a desktop monitor while most traffic now arrives on small screens, where forms overflow and navigation is awkward.",
      },
      {
        title: "Work that should be self-service arrives by phone or email",
        body: "Staff re-key the same details into a spreadsheet or another system because customers and colleagues have no portal to use.",
      },
      {
        title: "The old stack blocks new features",
        body: "A legacy site with no tests or documentation makes every small change risky, so improvements get postponed indefinitely.",
      },
    ],
    builds: [
      "Public marketing and service websites with clear page structure, enquiry forms and content you can update",
      "Authenticated customer portals: accounts, profiles, order or booking history, document downloads",
      "Internal dashboards and admin panels for the data your team works with daily",
      "REST APIs that connect a new front end to an existing database or third-party system",
      "Checkout, subscription and booking flows integrated with the payment provider you choose",
      "Server-side rendered pages structured for search engines and usable with a keyboard and screen reader",
    ],
    approach: [
      {
        title: "Scope pages and data",
        body: "We list the screens, the user roles and the data each one needs, agree the URL structure, and identify what already exists that can be reused.",
      },
      {
        title: "Model schema and API contracts",
        body: "The database schema and REST API contract are written down before interface work begins, so front end and back end build against an agreed shape.",
      },
      {
        title: "Build in reviewable stages",
        body: "Work is delivered as stages you can click through rather than one large handover, so direction can be corrected while it is still cheap to change.",
      },
      {
        title: "Test, launch, hand over",
        body: "Release includes checking the build against the agreed scope, setting up deployment through CI/CD, and documenting how to run and extend the system.",
      },
    ],
    techCategories: [
      { label: "Languages", items: "TypeScript, JavaScript, SQL" },
      { label: "Front end", items: "React, Next.js, Tailwind CSS" },
      { label: "Back end", items: "Node.js, Python, REST APIs" },
      { label: "Data", items: "PostgreSQL, Supabase" },
      { label: "Platform", items: "Cloud hosting, CI/CD, version control and code review" },
    ],
    deliverables: [
      "A deployed web application on hosting you control",
      "Source code in a version-controlled repository",
      "Database schema and REST API documentation",
      "A CI/CD pipeline so releases are repeatable",
      "Handover notes covering how the system is structured and extended",
    ],
    suitable: [
      {
        title: "Businesses whose website under-sells them",
        body: "The work is good, but the site is old, slow or impossible to update without hiring a developer.",
      },
      {
        title: "Teams moving a process into the browser",
        body: "Spreadsheets and email threads become a tool with roles, validation and a record of what happened.",
      },
      {
        title: "Startups shipping a first version",
        body: "A working product real users can sign up to, built so it can be extended rather than rewritten.",
      },
      {
        title: "Companies that need a portal or dashboard",
        body: "Customers, partners or staff need a logged-in view of data that already exists somewhere else.",
      },
    ],
    chips: ["React", "Next.js", "Node.js", "PostgreSQL", "REST APIs"],
    related: [
      { to: "/projects", label: "How we publish project work" },
      { to: "/resources", label: "Read web development guides" },
      { to: "/contact", label: "Discuss a web project" },
    ],
  },
  {
    id: "mobile-app-development",
    icon: Smartphone,
    tagline: "iOS & Android from One Codebase",
    title: "Mobile App Development",
    summary:
      "Cross-platform mobile applications for iOS and Android built from a single codebase, with offline-aware data handling and a predictable release process.",
    intro: [
      "Mobile app development means building software that installs on a phone and behaves well under the constraints of a real device: intermittent connectivity, small screens, limited battery, and app stores that review every release. For most products one codebase covering iOS and Android is the sensible trade-off, because it keeps behaviour consistent across platforms and means a fix ships to both at once.",
      "The decisions that matter are less about the framework and more about the data: what must keep working without a connection, how conflicting edits are reconciled when a device comes back online, how users are notified without the notifications becoming noise, and how each release is checked on real devices before it reaches the stores.",
    ],
    problems: [
      {
        title: "Two platforms on one budget",
        body: "Maintaining separate iOS and Android codebases duplicates every feature and doubles the testing and release work.",
      },
      {
        title: "Work happens without signal",
        body: "Field, retail or travel staff lose data or cannot work at all when the network drops, because the app assumes it is always connected.",
      },
      {
        title: "Users forget to come back",
        body: "There is no reliable way to tell someone a job is done or a booking is due, so engagement depends on them reopening the app unprompted.",
      },
      {
        title: "Releases are stressful",
        body: "Builds are produced by hand, testing is informal, and each store submission turns into a guessing game about what reviewers will require.",
      },
    ],
    builds: [
      "Cross-platform consumer apps for iOS and Android from a shared codebase",
      "Internal field-service and operations apps with offline-first data capture",
      "Push-notification flows for reminders, status changes and messages",
      "Apps that talk to existing REST APIs and databases behind a single login",
      "Store-ready builds with versioning, screenshots and release notes prepared for submission",
      "Role-based screens so staff, customers and admins only see what applies to them",
    ],
    approach: [
      {
        title: "Define device behaviour first",
        body: "We agree what works offline, what needs a connection, and how sync conflicts are resolved before a single screen is built.",
      },
      {
        title: "Prototype the navigation",
        body: "Screen states, gestures and navigation are reviewed as a prototype, because mobile navigation mistakes are expensive to correct in code.",
      },
      {
        title: "Build and test on devices",
        body: "Features are developed in stages and checked on real phones across screen sizes, not only inside a simulator.",
      },
      {
        title: "Release with a checklist",
        body: "Store assets, versioning, staged rollout and a rollback plan are part of every release, so an update is never improvised.",
      },
    ],
    techCategories: [
      { label: "Languages", items: "TypeScript, JavaScript" },
      { label: "Cross-platform UI", items: "React Native with Expo tooling" },
      { label: "Data on device", items: "SQLite, local caching and sync strategy" },
      { label: "Back end", items: "REST APIs, PostgreSQL, Supabase" },
      { label: "Platform", items: "Cloud build services, CI/CD, store submission" },
    ],
    deliverables: [
      "Installable builds for iOS and Android from one codebase",
      "Source code, build configuration and environment setup",
      "A documented data and sync design, including offline behaviour",
      "A release checklist covering store assets, versioning and rollback",
      "Handover documentation so your team can cut and submit a release",
    ],
    suitable: [
      {
        title: "Businesses whose service belongs on a phone",
        body: "Booking, membership, field work or content consumption where people expect an app rather than a mobile website.",
      },
      {
        title: "Operations teams working on site",
        body: "Data has to be captured where the work happens, including places where connectivity is unreliable.",
      },
      {
        title: "Companies reducing maintenance cost",
        body: "One codebase and one release process instead of two teams shipping the same feature twice.",
      },
      {
        title: "Products with an existing back end",
        body: "The REST APIs and database already exist; the app is the front end that is missing.",
      },
    ],
    chips: ["React Native", "Expo", "SQLite", "REST APIs", "Supabase"],
    related: [
      { to: "/projects", label: "How we publish project work" },
      { to: "/faq", label: "General questions answered" },
      { to: "/contact", label: "Discuss a mobile project" },
    ],
  },
  {
    id: "ai-ml",
    icon: Brain,
    tagline: "LLM, RAG & Predictive Models",
    title: "AI & Machine Learning",
    summary:
      "Practical AI features — document search with retrieval-augmented generation, extraction, classification and forecasting — measured against real examples before they ship.",
    intro: [
      "Artificial intelligence and machine learning cover systems that learn patterns from data instead of following rules written by hand. Two families matter for most businesses. The first is classical machine learning: models that classify, group or forecast from structured historical data. The second is large language models used for language tasks — summarising, extracting fields from documents, answering questions — usually combined with retrieval-augmented generation (RAG), which supplies the model with your own documents at query time so answers are grounded in your content rather than in the model's memory.",
      "The discipline that matters is knowing when AI is not the right tool. If a decision can be expressed as clear rules, plain code is cheaper, deterministic and easier to test. We reach for models where the rules are genuinely too difficult to write down — reading messy documents, finding meaning in free text, spotting patterns in history — and we measure the result against agreed examples before anything reaches a user.",
    ],
    problems: [
      {
        title: "The same questions are answered repeatedly",
        body: "Support and sales staff search documents and old replies for information that already exists somewhere inside the company.",
      },
      {
        title: "Documents are read one at a time",
        body: "Invoices, forms or applications are opened manually to copy a handful of fields into another system.",
      },
      {
        title: "Decisions are made on instinct",
        body: "Historical data sits in a database, but nobody has had the time to look for the patterns in it.",
      },
      {
        title: "A demo AI that fails on real use",
        body: "A generic chatbot answers confidently about things it was never given, which is a retrieval problem rather than a model problem.",
      },
    ],
    builds: [
      "Question-answering assistants grounded in your own documents using RAG",
      "Extraction pipelines that pull structured fields from documents into your database",
      "Classification of requests, tickets, applications or messages into your own categories",
      "Forecasting and trend analysis on historical data using Python and scikit-learn",
      "AI features embedded behind REST APIs in an existing product",
      "Evaluation sets and a repeatable way to check quality before and after each change",
    ],
    approach: [
      {
        title: "Decide whether AI fits",
        body: "We test the task against a simple baseline first. If clear rules or a database query solve it, we say so and stop there.",
      },
      {
        title: "Prepare the data",
        body: "Documents are cleaned, chunked and indexed; historical data is profiled. Data quality sets the ceiling on model quality.",
      },
      {
        title: "Evaluate before shipping",
        body: "A test set of real questions or examples is agreed up front, and the system has to perform on it before any user sees it.",
      },
      {
        title: "Integrate and monitor",
        body: "The model sits behind an API with logging, so failures stay visible and evaluation can be re-run as the data changes.",
      },
    ],
    techCategories: [
      { label: "Languages", items: "Python, TypeScript" },
      { label: "Classical machine learning", items: "scikit-learn, pandas" },
      { label: "Language models", items: "LLM APIs, retrieval-augmented generation" },
      { label: "Data", items: "SQL, PostgreSQL for structured storage" },
      { label: "Integration", items: "REST APIs, cloud hosting" },
    ],
    deliverables: [
      "A working feature running in a staging environment, not a slide deck",
      "Evaluation results against the agreed test examples, including the failures",
      "The data preparation and indexing pipeline as repeatable code",
      "Integration code plus documentation of inputs, outputs and known limits",
      "A plan for refreshing data and re-running evaluation over time",
    ],
    suitable: [
      {
        title: "Organisations with a body of documentation",
        body: "Policies, product material or procedures that staff and customers keep asking about.",
      },
      {
        title: "Teams with history and a decision to make",
        body: "A recurring question about demand, risk or categorisation that the data already collected can inform.",
      },
      {
        title: "Products wanting one AI feature",
        body: "An existing application needs summarisation, extraction or search, delivered through its existing APIs.",
      },
      {
        title: "Anyone evaluating whether AI is worth it",
        body: "We start with the smallest version that can be measured, so the decision is based on evidence rather than a demo.",
      },
    ],
    chips: ["Python", "scikit-learn", "LLM / RAG", "pandas", "REST APIs"],
    related: [
      { to: "/resources", label: "Read AI and ML guides" },
      { to: "/projects", label: "How we publish project work" },
      { to: "/contact", label: "Discuss an AI use case" },
    ],
  },
  {
    id: "data-analytics",
    icon: BarChart3,
    tagline: "Pipelines, Reports & Dashboards",
    title: "Data Analytics",
    summary:
      "Cleaning, modelling and reporting on operational data so recurring decisions rest on one documented version of the numbers.",
    intro: [
      "Data analytics is the work of turning raw records — orders, bookings, usage logs, exports from several systems — into numbers people can act on. It starts with a question from the business rather than a tool: what decision has to be made, how often, and what evidence would make it defensible. Only after that do we decide what to collect, how to clean it and how to present it.",
      "Most organisations already have the data; what they lack is a repeatable path from source to answer. Spreadsheets are re-typed every month, departments use different definitions for the same metric, and nobody can say where a figure came from. We build that path as code: extraction from existing sources into a relational store, cleaning steps that run identically every time, and reports or dashboards with the metric definitions written down beside them.",
    ],
    problems: [
      {
        title: "The monthly report is a manual ritual",
        body: "Several files are exported, fixed by hand in a spreadsheet, and checked against formulas nobody wants to touch in case they break.",
      },
      {
        title: "Two departments quote different numbers",
        body: "Each keeps its own definition of the same metric, so meetings start by arguing about whose figure is correct.",
      },
      {
        title: "The database holds everything and explains nothing",
        body: "Raw tables exist, but without a documented model nobody outside the original developer can safely query them.",
      },
      {
        title: "Changes are noticed too late",
        body: "By the time a trend appears in a monthly summary, several weeks of the relevant period have already passed.",
      },
    ],
    builds: [
      "Pipelines that pull from existing exports, databases and APIs into one queryable store",
      "Cleaning and validation steps covering missing values, duplicates and inconsistent formats",
      "Recurring reports generated the same way each period, with the definitions attached",
      "Dashboards built into a web application, with drill-down from summary to underlying detail",
      "Exploratory analyses that answer one specific question using the data actually available",
      "Reporting schemas and metric definitions your team can extend without starting over",
    ],
    approach: [
      {
        title: "Profile before promising",
        body: "We examine what the data really contains — missing values, mismatched keys, format drift — and report what it can and cannot support.",
      },
      {
        title: "Agree decisions and definitions",
        body: "Each metric gets one written definition, so the same number means the same thing in every report.",
      },
      {
        title: "Build the pipeline as code",
        body: "Cleaning and transformation are repeatable scripts rather than manual edits, so this month is produced by the same steps as last month.",
      },
      {
        title: "Ship, then maintain",
        body: "Reports and dashboards are deployed with documentation of sources, refresh schedule and known data-quality caveats.",
      },
    ],
    techCategories: [
      { label: "Languages", items: "Python, SQL" },
      { label: "Analysis", items: "pandas for cleaning and transformation" },
      { label: "Storage", items: "PostgreSQL, Supabase" },
      { label: "Lightweight prediction", items: "scikit-learn where a trend or segment is useful" },
      { label: "Delivery", items: "Dashboards inside web apps, scheduled jobs, cloud hosting" },
    ],
    deliverables: [
      "A documented data model covering sources, joins and metric definitions",
      "Repeatable extraction and cleaning scripts instead of manual spreadsheet edits",
      "A report or dashboard interface for the people who make the decision",
      "A record of source systems, refresh schedule and data-quality caveats",
      "Handover so your team can add metrics without rebuilding the pipeline",
    ],
    suitable: [
      {
        title: "Businesses reporting from spreadsheets",
        body: "The process works, but it consumes days each month and depends on one person's formulas.",
      },
      {
        title: "Teams that do not trust their figures",
        body: "Numbers get disputed regularly because definitions and sources were never written down.",
      },
      {
        title: "Operations needing visibility between reports",
        body: "A view that reflects current data instead of a summary produced after the period closes.",
      },
      {
        title: "Organisations considering machine learning",
        body: "Clean, documented data is the prerequisite, and analytics work is where that foundation gets built.",
      },
    ],
    chips: ["Python", "pandas", "SQL", "PostgreSQL", "Dashboards"],
    related: [
      { to: "/resources", label: "Read data analytics guides" },
      { to: "/projects", label: "How we publish project work" },
      { to: "/contact", label: "Discuss a data project" },
    ],
  },
  {
    id: "ui-ux-design",
    icon: Palette,
    tagline: "Flows, Prototypes & Design Systems",
    title: "UI/UX Design",
    summary:
      "Interface and experience design — user flows, wireframes, interactive prototypes and component systems — settled before build so changes happen on paper.",
    intro: [
      "UI/UX design is the work of deciding what a product should do and how it should behave before anyone writes production code. UX covers the structure: which tasks exist, what order screens appear in, and what a person must do to finish a job. UI covers the surface: layout, type, colour, component states, and the consistency that makes a product feel like one thing rather than several.",
      "Designing first is cheaper than fixing later. A prototype costs a conversation to change; the same change after release costs a developer, a test cycle and a new deploy. We work in Figma, produce flows and interactive prototypes you can click through, and turn what proves correct into a component system that keeps every future screen consistent with the first one.",
    ],
    problems: [
      {
        title: "People abandon halfway through",
        body: "Forms, sign-ups or checkout ask for more than the task requires, and there is no visibility of where users drop off.",
      },
      {
        title: "Every screen looks like a different product",
        body: "Buttons, spacing and behaviour differ page to page, which slows development and confuses the people using it.",
      },
      {
        title: "Engineering is guessing at the design",
        body: "Developers reconstruct layouts from a rough description, then rebuild them when someone disagrees later.",
      },
      {
        title: "New features keep breaking the interface",
        body: "There is no shared component library or token set, so every addition is styled from scratch and drifts further from the rest.",
      },
    ],
    builds: [
      "User journey maps and page structure for the tasks that matter most",
      "Wireframes that settle layout and content order while it is still cheap",
      "Interactive Figma prototypes for review and user testing before build",
      "Component libraries and design tokens shared with the React implementation",
      "Responsive layouts specified for phone, tablet and desktop breakpoints",
      "Accessibility review covering contrast, keyboard paths, labels and focus states",
    ],
    approach: [
      {
        title: "Understand the tasks",
        body: "We start with what users are trying to finish and what the business needs from that, not with a visual style.",
      },
      {
        title: "Structure, then surface",
        body: "Information architecture and wireframes are settled before colour and typography, because structure is what people actually navigate.",
      },
      {
        title: "Prototype and test the flow",
        body: "Interactive prototypes are walked through with the people who will use them, and findings change the design while it is still cheap.",
      },
      {
        title: "Systematise and hand off",
        body: "Approved screens become components with documented states and spacing, so the build matches the design and stays consistent.",
      },
    ],
    techCategories: [
      { label: "Design tooling", items: "Figma for screens, prototypes and handoff" },
      { label: "System", items: "Design tokens, component libraries, variants" },
      { label: "Responsive rules", items: "Breakpoints, fluid type, touch target sizing" },
      { label: "Accessibility", items: "WCAG contrast, keyboard navigation, form labels" },
      { label: "Implementation", items: "React, TypeScript, Tailwind CSS" },
    ],
    deliverables: [
      "A Figma file containing flows, screens and component states",
      "A clickable prototype for review and testing",
      "A component library with tokens your engineers can implement",
      "Responsive specifications for the breakpoints you support",
      "An accessibility checklist with issues found and how they were addressed",
      "Design QA during the build, so what ships matches what was approved",
    ],
    suitable: [
      {
        title: "Teams about to build a first version",
        body: "Settling the flows on paper first means engineering time goes into an agreed design instead of an argument.",
      },
      {
        title: "Products with inconsistent interfaces",
        body: "Existing screens are consolidated into one system so new features stop introducing new patterns.",
      },
      {
        title: "Founders who need to test before committing",
        body: "A prototype put in front of users answers questions that another month of building cannot.",
      },
      {
        title: "Projects with accessibility obligations",
        body: "Contrast, keyboard and labelling problems are fixed in design rather than discovered in an audit afterwards.",
      },
    ],
    chips: ["Figma", "Design systems", "Prototyping", "Accessibility", "React"],
    related: [
      { to: "/projects", label: "How we publish project work" },
      { to: "/resources", label: "Read UX and accessibility guides" },
      { to: "/contact", label: "Discuss a design project" },
    ],
  },
  {
    id: "custom-software-development",
    icon: Settings,
    tagline: "Internal Tools & Automation",
    title: "Custom Software Development",
    summary:
      "Software built around how your organisation actually works — internal tools, workflow automation and integrations between the systems you already run.",
    intro: [
      "Custom software development means building a system for one organisation's process, rather than adopting a general-purpose product and reshaping the process to fit it. It is the right choice when the workflow is genuinely yours — the rules, approvals and exceptions are what differentiate the business — and no off-the-shelf tool matches without contortions and workarounds.",
      "The work usually starts somewhere unglamorous: a spreadsheet with macros, a shared inbox, or a database export copied between two systems every week. We map that process with the people who run it, write the rules and edge cases down, and build a system with validation, role-based access and an audit trail — then connect it to the tools that stay in place through their REST APIs.",
    ],
    problems: [
      {
        title: "The process lives in spreadsheets and chat",
        body: "Nobody can say who changed what, two people edit the same file, and that file has quietly become business-critical.",
      },
      {
        title: "The same data is typed twice",
        body: "Staff copy details from one system into another by hand because the two do not talk to each other.",
      },
      {
        title: "The subscription product almost fits",
        body: "A SaaS tool covers most requirements but leaves the core workflow unsupported, so workarounds accumulate around it.",
      },
      {
        title: "No permissions and no history",
        body: "Everyone can see everything, and when something goes wrong there is no record of who did what.",
      },
    ],
    builds: [
      "Internal tools and admin panels for the workflow your team actually runs",
      "Automation of repetitive steps: validation, approvals, notifications, scheduled jobs",
      "Integrations between existing systems through their REST APIs",
      "Migration of spreadsheet or legacy data into a structured, queryable database",
      "Applications with role-based access and an audit trail of changes",
      "Replacement of a legacy system in stages, so the business keeps running during the change",
    ],
    approach: [
      {
        title: "Map the real process",
        body: "We sit with the people who do the work and record the exceptions, not only the happy path, because exceptions are what custom software must handle.",
      },
      {
        title: "Write the rules down",
        body: "Business rules, permissions and edge cases are agreed as a written spec before development, so correct becomes testable.",
      },
      {
        title: "Build in reviewable increments",
        body: "Each stage is a usable piece you can try with real data, which surfaces wrong assumptions while they are still cheap to change.",
      },
      {
        title: "Deploy and hand over",
        body: "Release includes deployment through CI/CD, data migration steps, documentation, and a walkthrough for the people who will operate it.",
      },
    ],
    techCategories: [
      { label: "Languages", items: "TypeScript, JavaScript, Python, SQL" },
      { label: "Application layer", items: "React, Node.js, REST APIs" },
      { label: "Data", items: "PostgreSQL, Supabase" },
      { label: "Interfaces", items: "Tailwind CSS, component-based UI" },
      { label: "Platform", items: "Cloud hosting, CI/CD, version control and code review" },
    ],
    deliverables: [
      "A deployed system running on infrastructure you control",
      "Source code, with history, in your repository",
      "Data migration steps from the current spreadsheets or legacy system",
      "API documentation and a map of the integrations",
      "A permissions model and an operations runbook",
      "A handover session for the team that will use and maintain it",
    ],
    suitable: [
      {
        title: "Businesses whose core process no product matches",
        body: "The workflow is specific enough that configuring a general tool costs more than building the right one.",
      },
      {
        title: "Teams outgrowing spreadsheets",
        body: "Data volume, concurrent users or the cost of a single error has made the spreadsheet unsafe to rely on.",
      },
      {
        title: "Organisations connecting two systems",
        body: "A dependable link with validation and logging, instead of a weekly manual copy between tools.",
      },
      {
        title: "Companies needing permissions and history",
        body: "Access has to be limited by role, and changes have to be attributable to a person and a time.",
      },
    ],
    chips: ["React", "Node.js", "Python", "PostgreSQL", "REST APIs"],
    related: [
      { to: "/about", label: "How YR NOVATECH works" },
      { to: "/projects", label: "How we publish project work" },
      { to: "/contact", label: "Describe your process" },
    ],
  },
];

const serviceFaqs: { service: string; q: string; a: string }[] = [
  {
    service: "All services",
    q: "How does a project start?",
    a: "With a scoping conversation about the problem rather than a fixed package: who uses the thing, what happens today, what constraints apply, and what a good outcome looks like. You receive an outline of scope, stages and an estimate before any build work begins.",
  },
  {
    service: "All services",
    q: "Do you publish case studies of past work?",
    a: "The projects page explains what we are able to publish and why. Where a client cannot be named or numbers cannot be shared, we say so instead of presenting an invented result.",
  },
  {
    service: "Web Development",
    q: "How long does a website take?",
    a: "It depends on the number of pages, how ready the content is, and how much of an existing system has to be connected. We estimate after scoping, and deliver in stages so a first version can go live before everything is finished.",
  },
  {
    service: "Web Development",
    q: "Will we be able to change the content ourselves?",
    a: "The handover documents how the site is structured, where content lives and how a release is made. If you would rather not operate it yourself, ongoing maintenance can be arranged as a separate agreement.",
  },
  {
    service: "Mobile App Development",
    q: "Do we need separate apps for iOS and Android?",
    a: "In most cases one cross-platform codebase covers both, which keeps behaviour and release cycles in sync. We explain the trade-offs during scoping if part of the product needs platform-specific work.",
  },
  {
    service: "Mobile App Development",
    q: "What happens if a store rejects a release?",
    a: "Store review is outside anyone's control, so store requirements such as assets, privacy disclosures and permissions are treated as checklist items before submission. If a submission is rejected, the required change is made and resubmitted.",
  },
  {
    service: "AI & Machine Learning",
    q: "Will an AI feature invent answers?",
    a: "It can, which is why retrieval-augmented generation grounds responses in your own documents and why we evaluate against real questions before release. Topics the system should not answer are covered by explicit fallback behaviour.",
  },
  {
    service: "AI & Machine Learning",
    q: "Do we need to train our own model?",
    a: "Usually not. Most needs are met by existing language models combined with your data, or classical models trained on your own history. Training from scratch is only worth discussing when the task and the volume of data justify it.",
  },
  {
    service: "Data Analytics",
    q: "Our data is messy — is it still usable?",
    a: "Almost all operational data arrives messy. We profile it first and tell you what it can support; cleaning is built as repeatable code, not manual fixes. If quality blocks a reliable answer, you hear that before a report ships.",
  },
  {
    service: "Data Analytics",
    q: "Do we need a new BI platform?",
    a: "Not necessarily. We start from the decisions you need to make. Sometimes the right answer is a scheduled report inside tooling you already have; sometimes it is a small dashboard inside your own application.",
  },
  {
    service: "UI/UX Design",
    q: "Do we get designs before development starts?",
    a: "Yes. Structure and flows are settled in wireframes and a clickable prototype first, so changes happen in Figma rather than after code is written.",
  },
  {
    service: "UI/UX Design",
    q: "Can you work with the design we already have?",
    a: "Yes. We review what exists, identify inconsistencies and accessibility problems, and extend it into a component system that the implementation can follow.",
  },
  {
    service: "Custom Software Development",
    q: "Can you work with the systems we already run?",
    a: "Usually. Existing tools are connected through their REST APIs where available, and a legacy replacement can happen in stages so day-to-day work continues throughout the change.",
  },
  {
    service: "Custom Software Development",
    q: "What do we receive at handover?",
    a: "Source code, the database schema, API documentation, the deployment pipeline, a permissions map, an operations runbook, and a walkthrough for the team operating the system.",
  },
];

const lifecycleSteps = [
  {
    step: "01",
    title: "Discovery & Scope",
    desc: "We analyze technical goals, business objectives, edge cases, and define clear deliverables with accurate timeline estimations.",
    icon: Workflow,
  },
  {
    step: "02",
    title: "Architecture & UX",
    desc: "We engineer resilient database schemas, API contracts, interactive component prototypes, and security boundaries.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Iterative Build & QA",
    desc: "Sprint-driven development with frequent code reviews, end-to-end automated testing, and transparent milestone progress demos.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Deploy & Scale",
    desc: "Zero-downtime CI/CD deployment pipelines, automated telemetry monitoring, performance optimization, and proactive maintenance.",
    icon: Rocket,
  },
];

const pillars = [
  {
    title: "Production-Grade Standards",
    desc: "We write clean, strictly-typed code with comprehensive error boundaries and automated checks. No untested shortcuts.",
  },
  {
    title: "Full Transparency",
    desc: "Direct communication with engineers, version-controlled deliverable milestones, and no hidden retainer surprises.",
  },
  {
    title: "Security & Privacy First",
    desc: "Data encryption in transit and at rest, role-based access controls, and strict compliance with modern privacy requirements.",
  },
  {
    title: "Continuous Support",
    desc: "Post-launch observability, timely dependency updates, and SLA-backed maintenance to keep your software performing at its peak.",
  },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      {
        title: "Services: Web, Mobile, AI, Data Analytics, UI/UX & Custom Software | YR NOVATECH",
      },
      {
        name: "description",
        content:
          "Web, mobile, AI, data analytics, UI/UX and custom software services from YR NOVATECH — what each service solves, how we build it, deliverables, technology categories and FAQs.",
      },
      {
        property: "og:title",
        content: "YR NOVATECH Services: Web, Mobile, AI, Data, UI/UX & Custom Software",
      },
      {
        property: "og:description",
        content:
          "Detailed service breakdowns from YR NOVATECH: the problems each service solves, our development approach, expected deliverables, technology categories and FAQs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.yrnovatech.in/services" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "YR NOVATECH Services",
          url: "https://www.yrnovatech.in/services",
          description:
            "Service information for YR NOVATECH: web development, mobile app development, AI and machine learning, data analytics, UI/UX design and custom software development.",
          publisher: {
            "@type": "Organization",
            name: "YR NOVATECH",
            url: "https://www.yrnovatech.in",
          },
          hasPart: services.map((s) => ({
            "@type": "WebPage",
            name: s.title,
            url: `https://www.yrnovatech.in/services#${s.id}`,
            description: s.summary,
          })),
        }),
      },
    ],
  }),
  component: Services,
});

function ServiceBlock({ service, index }: { service: ServiceDetail; index: number }) {
  return (
    <Section id={service.id} className="!pt-0">
      <SectionHeading
        eyebrow={`${String(index + 1).padStart(2, "0")} · ${service.tagline}`}
        title={service.title}
        description={service.summary}
      />

      <div className="max-w-3xl mx-auto text-center mb-10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          What it is
        </h3>
        {service.intro.map((p, i) => (
          <p
            key={i}
            className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 last:mb-0"
          >
            {p}
          </p>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-6">
        <Card className="p-6 border border-border bg-card rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Common business problems it solves
            </h3>
          </div>
          <ul className="space-y-3.5">
            {service.problems.map((p) => (
              <li key={p.title}>
                <span className="block text-sm font-medium text-foreground mb-0.5">
                  {p.title}
                </span>
                <span className="block text-xs text-muted-foreground leading-relaxed">
                  {p.body}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border border-border bg-card rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              What YR NOVATECH can build with it
            </h3>
          </div>
          <ul className="space-y-2.5">
            {service.builds.map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs text-foreground/90">
                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="max-w-5xl mx-auto p-6 md:p-8 border border-border bg-card rounded-2xl mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
            <Workflow className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">Development approach</h3>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {service.approach.map((a, i) => (
            <li key={a.title}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <span className="font-semibold text-sm text-foreground">{a.title}</span>
                <span className="text-lg font-black font-mono text-muted-foreground/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-6">
        <Card className="p-6 border border-border bg-card rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Typical technology categories
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Categories we work in for this service, chosen per project. We do not claim
            certifications or partner status with any platform.
          </p>
          <div className="space-y-2.5">
            {service.techCategories.map((tc) => (
              <div key={tc.label}>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {tc.label}
                </span>
                <span className="block text-xs text-foreground/90 leading-relaxed">
                  {tc.items}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-border bg-card rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Expected deliverables</h3>
          </div>
          <ul className="space-y-2.5">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2 text-xs text-foreground/90">
                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border border-border bg-card rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Who this service is for</h3>
          </div>
          <ul className="space-y-3.5">
            {service.suitable.map((s) => (
              <li key={s.title}>
                <span className="block text-sm font-medium text-foreground mb-0.5">
                  {s.title}
                </span>
                <span className="block text-xs text-muted-foreground leading-relaxed">
                  {s.body}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
        {service.related.map((l) => (
          <Button key={l.to} asChild variant="outline" size="sm">
            <Link to={l.to}>
              {l.label} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        ))}
      </div>
    </Section>
  );
}

function Services() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Engineering Capabilities</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Full-Stack Solutions for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ambitious Digital Products
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Six service lines explained in detail: what each one is, the business problems it
            solves, how we build it, what you receive, and who it suits — so you can decide
            before you ever contact us.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Link to="/contact">
                Start a Conversation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent">
              <Link to="/projects">
                Explore Portfolio
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stat Counter Bar */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="text-center p-2">
            <div className="text-2xl md:text-3xl font-bold text-foreground">6</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Service Areas Detailed Below</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-primary">4</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Phases in Our Delivery Process</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-foreground">MSME</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Registered Enterprise</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-emerald-500">End-to-End</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Design through Maintenance</div>
          </div>
        </div>
      </Section>

      {/* Services Grid */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Specializations"
          title="What We Engineer"
          description="Six service lines, each explained below with the problems it solves, our approach, typical technology categories, deliverables and FAQs."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {services.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col justify-between p-6 border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 rounded-2xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-105 transition-transform">
                    <s.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-border/80 bg-accent/40">
                    {s.tagline}
                  </Badge>
                </div>

                <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {s.summary}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Key Deliverables</span>
                  <ul className="space-y-1.5">
                    {s.builds.slice(0, 4).map((f) => (
                      <li key={f} className="text-xs text-foreground/90 flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="pt-4 border-t border-border/60 flex flex-wrap gap-1.5">
                  {s.chips.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-medium text-muted-foreground border border-border/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={`#${s.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Full breakdown below <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>

        <Card className="max-w-6xl mx-auto mt-8 p-6 md:p-8 border border-border bg-card rounded-2xl flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant shrink-0">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1 text-foreground">
                Internship &amp; learning programs
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alongside client work, YR NOVATECH runs structured, project-based internships
                across six technical domains. Interns work through reviewed tasks rather than
                video lessons, and a certificate is only issued once the required submissions are
                approved. The program page lists the domains, durations, review process and
                certificate requirements in full.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Link to="/internship">
                Internship program <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border hover:bg-accent">
              <Link to="/careers">Careers at YR NOVATECH</Link>
            </Button>
          </div>
        </Card>
      </Section>

      {/* Detailed service sections */}
      {services.map((s, i) => (
        <ServiceBlock key={s.id} service={s} index={i} />
      ))}

      {/* Engineering Process */}
      <Section className="!pt-0">
        <div className="max-w-6xl mx-auto p-8 md:p-12 rounded-3xl bg-secondary/30 border border-border/70">
          <SectionHeading
            eyebrow="Our Process"
            title="How We Turn Ideas into Code"
            description="A disciplined, four-phase development lifecycle that applies to every service above — designed for speed, predictability, and quality."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {lifecycleSteps.map((st) => (
              <div key={st.step} className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <st.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                      {st.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-base mb-1.5 text-foreground">{st.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Services FAQ */}
      <Section id="services-faq" className="!pt-0">
        <SectionHeading
          eyebrow="Services FAQ"
          title="Frequently Asked Questions About Our Services"
          description="Straight answers on how an engagement starts, what is delivered at the end, and where AI, data and design work fits — covering every service above."
        />

        <div className="grid gap-5 md:grid-cols-2 max-w-5xl mx-auto">
          {serviceFaqs.map((f) => (
            <Card key={f.q} className="p-6 border border-border bg-card rounded-2xl">
              <Badge
                variant="outline"
                className="mb-3 text-[11px] font-medium border-border/80 bg-accent/40"
              >
                {f.service}
              </Badge>
              <h3 className="font-semibold text-sm text-foreground mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </Card>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/faq">Read the full FAQ</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/resources">Browse technical resources</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/contact">Ask a question</Link>
          </Button>
        </div>
      </Section>

      {/* Pillars / Why Choose Us */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Quality Commitment"
          title="Why Work with YR NOVATECH"
          description="Every engagement is built around engineering integrity and transparent delivery."
        />

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {pillars.map((p) => (
            <Card key={p.title} className="p-6 border border-border bg-card rounded-2xl flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1 text-foreground">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/about">
              More about the company <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/projects">Projects &amp; publication policy</Link>
          </Button>
        </div>
      </Section>

      <AdSlot slot={AD_SLOTS.contentInline} className="py-2" />

      {/* Call to Action Banner */}
      <Section className="!pt-0">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent/30 p-8 md:p-14 text-center shadow-elegant">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Headphones className="h-3.5 w-3.5" />
              <span>Available for New Projects &amp; Cohorts</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Build Your Next Product?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed">
              Tell us which of the services above matches your problem, or describe the situation
              and we will tell you honestly which one fits — or that you do not need a build yet.
              Students and career switchers can look at the structured technical internship program
              instead.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
                <Link to="/contact">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent text-foreground">
                <Link to="/internship">
                  Explore Internships <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
