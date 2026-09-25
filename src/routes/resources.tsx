import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import {
  Code2,
  Brain,
  Terminal,
  BarChart3,
  Palette,
  ArrowRight,
  BookOpen,
  Layers,
  Database,
  Shield,
  Server,
  Cpu,
  Paintbrush,
  GitBranch,
  Globe,
  Workflow,
  Search,
  Users,
  Smartphone,
  Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: `Technology Resources & Engineering Knowledge Hub | ${COMPANY.name}` },
      {
        name: "description",
        content: `Technical articles, architecture guides, and engineering knowledge from ${COMPANY.name}. Learn about full-stack development, AI, Python, data analytics, and UI/UX design.`,
      },
      { property: "og:title", content: `Technology Resources — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Engineering knowledge hub: full-stack, AI, Python, and design guides from ${COMPANY.name}.`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "YR NOVATECH Technology Resources",
          description: "Technical articles, architecture guides, and engineering knowledge from YR NOVATECH.",
          publisher: { "@type": "Organization", name: "YR NOVATECH" },
        }),
      },
    ],
  }),
  component: Resources,
});

/* ─── Article data ─── */
interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
  icon: typeof Code2;
}

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: BookOpen },
  { id: "fullstack", label: "Full Stack", icon: Code2 },
  { id: "ai", label: "Artificial Intelligence", icon: Brain },
  { id: "python", label: "Python", icon: Terminal },
  { id: "data", label: "Data Analytics", icon: BarChart3 },
  { id: "design", label: "UI/UX Design", icon: Palette },
];

const articles: Article[] = [
  /* ─── FULL STACK ─── */
  {
    id: "fullstack-architecture",
    category: "fullstack",
    icon: Layers,
    title: "How a Modern Full-Stack Application Works",
    summary: "Understand the complete architecture of a modern web application, from the browser to the database and back.",
    content: [
      "A modern full-stack web application consists of several interconnected layers that work together to deliver a seamless user experience. Understanding how these layers communicate is fundamental for any developer building production software.",
      "The frontend layer — what users see and interact with in their browser — is typically built using a JavaScript framework like React, Vue, or Angular. At YR NOVATECH, we primarily use React with TypeScript. The frontend handles rendering the user interface, managing user interactions, form validation, and state management. It communicates with the backend through HTTP requests (typically REST APIs or GraphQL queries).",
      "The backend layer runs on a server (or serverless functions) and handles business logic, authentication, authorization, and data processing. When the frontend sends a request — for example, 'show me this user's internship details' — the backend validates the request, checks permissions, queries the database, and returns the appropriate data.",
      "The database layer stores all persistent data: user profiles, internship records, task submissions, certificates, and more. We use PostgreSQL (through Supabase) for its reliability, advanced querying capabilities, and Row Level Security — which ensures that database queries automatically enforce user-level access controls.",
      "The deployment layer brings everything together. The frontend is built into static files and served through a CDN (Content Delivery Network) for fast loading worldwide. The backend runs on cloud infrastructure that can scale automatically. The database runs on managed infrastructure with automatic backups.",
      "Authentication ties all these layers together. When a user logs in, the system generates a secure token (JWT) that the frontend includes with every subsequent request. The backend validates this token before processing any request. Row Level Security policies in the database use this token to ensure users can only access data they're authorized to see. This multi-layer security approach means that even if one layer is compromised, user data remains protected.",
    ],
  },
  {
    id: "rest-api-design",
    category: "fullstack",
    icon: Server,
    title: "REST API Design: Principles and Practical Patterns",
    summary: "Learn how to design clean, consistent REST APIs that are easy to maintain and integrate.",
    content: [
      "A REST (Representational State Transfer) API is the communication protocol between a frontend application and a backend server. Well-designed APIs make applications easier to build, maintain, and scale. Poorly designed APIs create technical debt that compounds over time.",
      "Resource-oriented design is the foundation of good REST APIs. Every endpoint should represent a resource (a noun, not a verb). For example, '/api/internships' retrieves a list of internships, '/api/internships/123' retrieves a specific internship, and 'POST /api/internships' creates a new one. The HTTP method (GET, POST, PUT, DELETE) defines the action. This consistency makes APIs predictable — a developer using your API can guess the endpoint for a new resource without reading documentation.",
      "Status codes communicate outcomes clearly. Use 200 for success, 201 for resource creation, 400 for client errors (invalid input), 401 for authentication failures, 403 for authorization failures, 404 for missing resources, and 500 for server errors. Returning the wrong status code (e.g., 200 with an error message in the body) makes APIs confusing to consume and harder to debug.",
      "Pagination is essential for any endpoint that returns lists. Without pagination, a query like 'get all internships' could return thousands of records, slowing down both the server and the client. Common approaches include offset-based pagination (page=2&limit=20) and cursor-based pagination (after=abc123&limit=20). Cursor-based pagination performs better on large datasets because the database doesn't need to count and skip rows.",
      "Input validation must happen on the server, even if the frontend also validates. Frontend validation can be bypassed — anyone can send a direct HTTP request to your API. At YR NOVATECH, we use Zod for schema validation on both the frontend (for immediate user feedback) and the backend (for security). Every field should have explicit type constraints, length limits, and format requirements.",
      "Error responses should be structured and actionable. Instead of returning 'Something went wrong', return a JSON object with an error code, a human-readable message, and the specific field that caused the error when applicable. This helps both developers debugging the issue and frontend code displaying appropriate error messages to users.",
    ],
  },
  {
    id: "database-design",
    category: "fullstack",
    icon: Database,
    title: "Database Design Fundamentals for Web Applications",
    summary: "Learn the core principles of relational database design that keep applications reliable and performant.",
    content: [
      "Database design is one of the most consequential decisions in building a web application. A well-designed schema makes the application fast, reliable, and easy to extend. A poorly designed schema leads to data inconsistencies, slow queries, and painful migrations.",
      "Normalization is the process of organizing data to reduce redundancy. In a normalized database, each piece of information is stored in exactly one place. For example, in the YR NOVATECH platform, an intern's domain (like 'Full Stack Development') is stored in a 'domains' table, and the internship record references it via a foreign key. If the domain name changes, we update it in one place and all internship records automatically reflect the change.",
      "Primary keys uniquely identify each row. We use UUIDs (Universally Unique Identifiers) rather than auto-incrementing integers. UUIDs can be generated anywhere without coordination, which is essential for distributed systems and prevents enumeration attacks (where someone guesses IDs like /users/1, /users/2, etc.).",
      "Foreign keys enforce relationships between tables. When an internship record references a student_id, the foreign key constraint ensures that student actually exists in the profiles table. Without foreign keys, you risk 'orphaned' records — an internship pointing to a user who was deleted. These inconsistencies are extremely difficult to fix after the fact.",
      "Indexes dramatically improve query performance. Without an index, the database must scan every row to find matching records (a 'full table scan'). With a proper index, it can jump directly to the relevant rows. However, indexes have a cost — they slow down INSERT and UPDATE operations and consume storage. The key is indexing columns that are frequently used in WHERE clauses, JOIN conditions, and ORDER BY clauses.",
      "Row Level Security (RLS) is a PostgreSQL feature we use extensively at YR NOVATECH. RLS policies define rules about which rows each user can read, insert, update, or delete. For example, an intern can only see their own internship record, while an admin can see all records. These policies are enforced at the database level, which means even if there's a bug in the application code, users still can't access data they shouldn't see.",
    ],
  },
  {
    id: "authentication-architecture",
    category: "fullstack",
    icon: Shield,
    title: "Authentication Architecture: From Login to Secure Sessions",
    summary: "How modern web applications handle user identity, from password hashing to JWT-based sessions.",
    content: [
      "Authentication — verifying who a user is — is a critical component of any web application that handles user data. Getting authentication wrong can lead to data breaches, unauthorized access, and regulatory violations. Understanding how it works end-to-end helps engineers build secure systems.",
      "Password handling is the first layer. When a user creates an account, their password is never stored directly. Instead, it's processed through a one-way hash function (like bcrypt or Argon2) that produces a fixed-length string called a hash. This hash is what's stored in the database. When the user logs in, the submitted password is hashed and compared to the stored hash. Even if the database is compromised, attackers cannot reverse the hash to recover the original password.",
      "Session management begins after successful authentication. The server generates a JSON Web Token (JWT) — a signed, encoded token containing the user's ID and metadata. This token is sent to the client and included with every subsequent API request. The server validates the token's signature to confirm it wasn't tampered with and checks the expiration timestamp to ensure it's still valid.",
      "Token refresh is essential for security. Access tokens should have short lifetimes (15–60 minutes). When an access token expires, the client uses a refresh token to obtain a new one without requiring the user to log in again. Refresh tokens are stored securely (typically in an HTTP-only cookie) and have longer lifetimes. This architecture limits the damage if an access token is leaked.",
      "Authorization is distinct from authentication. Authentication answers 'who is this user?' Authorization answers 'what can this user do?' In the YR NOVATECH platform, we use role-based access control — users are assigned roles (intern, admin) that determine their permissions. An intern can view their own tasks and submit work. An admin can view all internships, assign tasks, approve submissions, and issue certificates.",
      "Multi-layer security means implementing checks at every level: the frontend prevents unauthorized UI access, the API validates permissions before processing requests, and database RLS policies enforce access rules even if the API layer has bugs. This defense-in-depth approach ensures that no single point of failure can compromise user data.",
    ],
  },

  /* ─── AI ─── */
  {
    id: "ai-application-lifecycle",
    category: "ai",
    icon: Brain,
    title: "How an AI Application Works: From Data to Deployment",
    summary: "The complete lifecycle of building an AI-powered application, from problem definition through model deployment.",
    content: [
      "Building an AI application is fundamentally different from building a traditional software application. Traditional software follows deterministic rules: given the same input, you always get the same output. AI applications use probabilistic models that learn patterns from data and make predictions — the same input might produce slightly different outputs depending on the model's training.",
      "The process begins with problem definition. Not every problem needs AI. Before writing any code, we evaluate whether the problem is better solved with traditional logic, rule-based systems, or machine learning. AI is appropriate when the rules are too complex to define manually (like image recognition), when the data has patterns that aren't obvious to humans (like fraud detection), or when the task requires understanding natural language.",
      "Data preparation typically consumes 60–80% of the project time. Raw data is rarely in a usable format. It needs to be collected from various sources, cleaned (removing duplicates, handling missing values, fixing inconsistencies), and transformed into a format the model can process. Data quality directly determines model quality — the saying 'garbage in, garbage out' is literally true in machine learning.",
      "Model selection and training involves choosing an appropriate algorithm (or pre-trained model) and training it on your prepared data. For many modern applications, fine-tuning a pre-trained large language model (LLM) is more practical than training from scratch. We evaluate models using metrics appropriate to the problem: accuracy, precision, recall, F1 score, or domain-specific measures.",
      "Integration into a production application requires wrapping the model in an API that the rest of the application can call. This involves handling input preprocessing, model inference, output post-processing, error handling, and caching. The model API needs to be fast enough for real-time use (typically under 500ms for user-facing features) and reliable enough to handle production traffic.",
      "Monitoring and maintenance is an ongoing requirement. Unlike traditional software, AI models can degrade over time as the real-world data they encounter drifts from their training data. We implement monitoring to track model performance, detect degradation, and trigger retraining when necessary. This lifecycle — deploy, monitor, retrain, redeploy — is what makes AI projects fundamentally different from 'build and forget' software.",
    ],
  },
  {
    id: "rag-architecture",
    category: "ai",
    icon: Search,
    title: "RAG Architecture Explained: Building Knowledge-Aware AI Applications",
    summary: "How Retrieval-Augmented Generation (RAG) enables AI applications to answer questions using your own data.",
    content: [
      "Retrieval-Augmented Generation (RAG) is an architecture pattern that combines the language capabilities of Large Language Models (LLMs) with the ability to search and reference specific documents or data sources. Instead of relying solely on what the model learned during training, RAG allows AI applications to answer questions using current, domain-specific information.",
      "The problem RAG solves is straightforward: LLMs are trained on static datasets and have a knowledge cutoff date. They don't know about your company's internal documentation, your product specifications, or events that happened after their training. Fine-tuning the model on your data is expensive and needs to be repeated whenever the data changes. RAG provides a more flexible alternative.",
      "The RAG pipeline works in three stages. First, your documents are preprocessed and converted into vector embeddings — numerical representations that capture semantic meaning. These embeddings are stored in a vector database. Second, when a user asks a question, the question itself is converted into an embedding and compared against the stored document embeddings to find the most relevant passages. Third, these relevant passages are included in the prompt sent to the LLM, giving it the context needed to generate an accurate, grounded answer.",
      "Document chunking is a critical design decision. If chunks are too large, the retrieval may include irrelevant information that confuses the model. If chunks are too small, important context may be lost. Practical chunking strategies include splitting by paragraphs, using overlapping windows (so context isn't lost at chunk boundaries), and preserving document structure (headings, sections).",
      "Embedding quality determines retrieval quality. We use embedding models that produce dense vector representations capturing semantic meaning — so a query about 'database performance optimization' will match a document about 'improving PostgreSQL query speed' even though the exact words differ. This semantic matching is what makes RAG more powerful than traditional keyword search.",
      "In production RAG applications, we implement several refinements: re-ranking retrieved results for relevance, filtering by metadata (date, source, category), handling multi-turn conversations (remembering context from previous questions), and implementing fallback behavior when no relevant documents are found. These details separate a demo RAG system from a production-quality one.",
    ],
  },

  /* ─── PYTHON ─── */
  {
    id: "python-project-architecture",
    category: "python",
    icon: Terminal,
    title: "Python Project Architecture: Organizing Code for Maintainability",
    summary: "How to structure a Python project that scales from a small script to a production application.",
    content: [
      "Python's flexibility is both its greatest strength and its biggest architectural risk. Without deliberate structure, Python projects quickly become tangled collections of scripts that are hard to test, debug, and extend. A well-organized project structure makes the difference between code that lasts and code that gets rewritten.",
      "The package structure should reflect the application's domain, not its technology. Instead of organizing by type (all models in one folder, all utilities in another), organize by feature or domain. A project management application might have packages like 'users', 'projects', 'tasks', and 'notifications'. Each package contains everything related to that feature: data models, business logic, API endpoints, and tests.",
      "Dependency management is critical for reproducibility. We use virtual environments (venv or conda) to isolate project dependencies from the system Python. Dependencies are pinned to specific versions in requirements.txt or pyproject.toml, ensuring that the same code runs identically on every developer's machine, in CI/CD, and in production. Unpinned dependencies are a common source of 'it works on my machine' bugs.",
      "Configuration management separates environment-specific values (database URLs, API keys, feature flags) from application code. We use environment variables loaded through .env files for local development and proper secrets management in production. Configuration is validated at startup — if a required environment variable is missing, the application fails immediately with a clear error message rather than failing mysteriously at runtime.",
      "Error handling in Python projects follows a layered approach. Domain-specific exceptions (like InternshipNotFoundError or TaskAlreadySubmittedError) are defined for each module. Business logic raises these specific exceptions. API endpoints catch them and return appropriate HTTP responses. This pattern keeps business logic clean and makes error behavior predictable.",
      "Testing is organized alongside the code it tests. Each feature package has a corresponding test directory with unit tests (testing individual functions), integration tests (testing components working together), and end-to-end tests (testing complete user workflows). We use pytest with fixtures for test data setup and parametrize for testing multiple inputs. A comprehensive test suite is the foundation that makes refactoring safe.",
    ],
  },
  {
    id: "python-api-development",
    category: "python",
    icon: Globe,
    title: "Building Production APIs with Python",
    summary: "From framework selection to deployment — practical patterns for building reliable Python APIs.",
    content: [
      "Python is one of the most popular languages for building backend APIs, with frameworks ranging from minimal (Flask, FastAPI) to full-featured (Django). The choice of framework depends on the project's requirements, team familiarity, and performance needs.",
      "FastAPI has become our preferred framework for new Python API projects at YR NOVATECH. It offers automatic request validation using Python type hints and Pydantic models, built-in OpenAPI documentation generation, asynchronous request handling for better performance under load, and dependency injection for clean code organization. The type hint-based validation means many bugs are caught before the code runs.",
      "Request validation is the first line of defense. Every incoming request should be validated against a schema that defines expected types, required fields, value ranges, and format constraints. With FastAPI and Pydantic, this validation is declarative — you define a model class with typed fields, and the framework automatically validates incoming data, returning structured error messages when validation fails.",
      "Database interaction in Python APIs typically uses an ORM (Object-Relational Mapper) like SQLAlchemy or direct database drivers like asyncpg. ORMs provide a Python-native interface to database tables and handle query building, connection pooling, and transaction management. However, for complex queries or performance-critical operations, raw SQL is sometimes more appropriate. We use a pragmatic mix of both.",
      "Background task processing is necessary for operations that are too slow for a synchronous API response — like generating PDF certificates, sending emails, or processing large datasets. We use task queues (Celery, or simpler approaches like FastAPI's BackgroundTasks) to offload these operations. The API immediately returns a response to the user, and the heavy work happens asynchronously.",
      "Deployment involves containerizing the application (typically with Docker), setting up a reverse proxy (like Nginx), configuring HTTPS, implementing health checks, and setting up logging and monitoring. In production, the API runs behind a process manager (like Uvicorn with multiple workers) that handles graceful restarts, load distribution across CPU cores, and automatic recovery from crashes.",
    ],
  },

  /* ─── DATA ─── */
  {
    id: "data-cleaning-workflow",
    category: "data",
    icon: Workflow,
    title: "Data Cleaning Workflow: Turning Raw Data into Reliable Insights",
    summary: "A systematic approach to cleaning messy real-world data before analysis or visualization.",
    content: [
      "Real-world data is messy. Spreadsheets have inconsistent formatting, databases have missing values, APIs return unexpected formats, and manual data entry introduces typos. Data cleaning — the process of detecting and correcting errors and inconsistencies — is the unglamorous but essential foundation of any data analytics project.",
      "The first step is data profiling: understanding what you have before trying to fix it. This means examining each column's data type, counting unique values, identifying missing values, checking value distributions, and looking for outliers. Tools like pandas' .describe(), .info(), and .value_counts() methods provide a quick overview. Profiling often reveals issues you didn't expect — dates stored as strings, numbers with embedded commas, or category names with inconsistent capitalization.",
      "Missing data requires careful handling. The appropriate strategy depends on why data is missing. If values are missing randomly, statistical imputation (filling with mean, median, or a predicted value) may be appropriate. If values are missing systematically (e.g., a survey question that only appears for certain users), imputation could introduce bias. Sometimes the best approach is to flag missing values and handle them explicitly in analysis rather than filling them with assumptions.",
      "Duplicate detection goes beyond exact matches. Two records might represent the same entity with slightly different data — 'Y R NOVATECH' and 'YR NOVATECH', or 'fizal.mohamed@gmail.com' and 'Fizal.Mohamed@Gmail.com'. String normalization (lowercasing, trimming whitespace, standardizing formats) and fuzzy matching help identify these near-duplicates.",
      "Data type standardization ensures consistency. Dates should be in a single format (ISO 8601 is ideal). Phone numbers should follow a consistent pattern. Currency values should use the same decimal precision. Categorical values should use a controlled vocabulary. Each of these normalizations seems trivial individually, but together they prevent a large class of analysis errors.",
      "Validation rules catch domain-specific errors that generic cleaning won't find. An intern's year of study should be between 1 and 5. An email address should contain an @ symbol. A completion date should be after the start date. These business rules are specific to your domain and should be codified as explicit checks that run automatically during data processing.",
    ],
  },
  {
    id: "dashboard-architecture",
    category: "data",
    icon: BarChart3,
    title: "Dashboard Architecture: From Data to Visual Decisions",
    summary: "How to design and build analytics dashboards that actually drive decisions, not just display numbers.",
    content: [
      "An effective analytics dashboard is not a collection of charts — it's a tool designed to help specific people make specific decisions. The most common mistake in dashboard design is starting with 'what metrics do we have?' instead of 'what decisions do people need to make?' This distinction shapes everything from data modeling to visual design.",
      "The data pipeline behind a dashboard typically involves extraction (pulling data from source systems), transformation (cleaning, aggregating, and reshaping data), and loading (storing processed data in a format optimized for querying). For real-time dashboards, this pipeline runs continuously. For daily reporting, it runs on a schedule. At YR NOVATECH, our admin dashboard queries Supabase directly for real-time metrics like active interns, pending applications, and task completion rates.",
      "Aggregation is where raw data becomes insight. Instead of showing every individual transaction, dashboards show totals, averages, trends, and comparisons. The key is choosing the right level of aggregation. Too granular and the dashboard is overwhelming. Too aggregated and it hides important patterns. Providing drill-down capability — letting users click a high-level number to see the underlying detail — bridges this gap.",
      "Visualization choice should match the data type and the question being answered. Line charts show trends over time. Bar charts compare categories. Tables work best for precise values that users need to look up. Progress bars show completion status. Each chart type has strengths and weaknesses — using the wrong chart makes data harder to understand, not easier.",
      "Performance is critical for dashboard usability. A dashboard that takes 10 seconds to load will be abandoned. Strategies for fast dashboards include pre-computing aggregations (so the dashboard queries summarized data, not raw records), implementing appropriate database indexes, using caching for data that doesn't change frequently, and loading dashboard sections progressively rather than waiting for all data before rendering anything.",
      "Accessibility matters in dashboard design. Color-coded status indicators should also have text labels (for colorblind users). Charts should include data tables as alternatives (for screen reader users). Interactive elements should be keyboard navigable. These considerations aren't just ethical — they ensure the dashboard is usable by everyone who needs it.",
    ],
  },

  /* ─── DESIGN ─── */
  {
    id: "ux-research-process",
    category: "design",
    icon: Users,
    title: "UX Research: Understanding Users Before Designing Solutions",
    summary: "Research methods and processes that lead to designs based on real user needs, not assumptions.",
    content: [
      "User Experience (UX) research is the systematic study of how people interact with products and services. Its purpose is to replace assumptions about user behavior with evidence. Designing without research means building for an imagined user — designs based on assumptions regularly fail when real users encounter them.",
      "Research methods fall into two categories: qualitative (understanding why users behave a certain way) and quantitative (measuring how many users exhibit a behavior). User interviews, usability tests, and contextual observations are qualitative. Surveys, analytics data, and A/B tests are quantitative. Most projects benefit from both — qualitative research generates hypotheses, quantitative research validates them.",
      "User interviews are structured conversations with real or potential users. The goal is to understand their goals, frustrations, workflows, and mental models. Good interview questions are open-ended ('Tell me about how you currently manage your internship tasks') rather than leading ('Don't you think our task dashboard is easy to use?'). Five to eight interviews typically reveal the major patterns in user behavior.",
      "Usability testing involves observing real users as they attempt to complete specific tasks on your product. Test tasks should reflect real scenarios — 'Find your internship certificate and download it' rather than 'Click the certificate button'. The most valuable finding in usability testing is usually something the design team didn't anticipate — a navigation path that seems obvious to developers but confuses users.",
      "Personas are fictional characters based on research data that represent key user types. For example, a YR NOVATECH persona might be 'Priya, a 3rd-year Computer Science student in Chennai who wants a project-based internship that builds practical skills, not just a certificate to put on her resume.' Personas keep the team aligned on who they're designing for and prevent the common trap of designing for 'everyone.'",
      "Research findings must be actionable to be valuable. A 100-page research report that no one reads is wasted effort. We synthesize findings into clear recommendations: specific design changes, prioritized by impact and feasibility. Each recommendation is backed by evidence from the research, not opinions. This evidence-based approach reduces design debates and speeds up decision-making.",
    ],
  },
  {
    id: "responsive-design",
    category: "design",
    icon: Smartphone,
    title: "Responsive Design: Building Interfaces That Work Everywhere",
    summary: "Practical techniques for designing and building interfaces that adapt seamlessly across devices.",
    content: [
      "Responsive design is the practice of building interfaces that adapt to different screen sizes, orientations, and input methods. With mobile devices accounting for over 60% of web traffic, responsive design is not optional — it's a fundamental requirement for any public-facing website.",
      "The mobile-first approach starts by designing for the smallest screen and then progressively enhancing the layout for larger screens. This approach is more effective than designing for desktop and then trying to squeeze everything onto mobile. Mobile-first forces you to prioritize content and simplify navigation — constraints that ultimately improve the experience on all devices.",
      "CSS flexbox and grid are the modern tools for responsive layouts. Flexbox handles one-dimensional layouts (rows or columns) and is perfect for navigation bars, card lists, and centering content. CSS Grid handles two-dimensional layouts (rows and columns simultaneously) and is ideal for page layouts, dashboards, and complex card grids. At YR NOVATECH, we use both extensively — Tailwind CSS's responsive prefixes (sm:, md:, lg:) make it straightforward to define different layouts at different breakpoints.",
      "Typography scaling ensures text is readable on all devices. On mobile, body text should be at least 16px (smaller text forces users to zoom). Headings should scale proportionally — a heading that works at 48px on desktop may need to be 28px on mobile. CSS clamp() allows fluid typography that scales smoothly between minimum and maximum sizes without jump-between-breakpoints behavior.",
      "Touch targets are a critical mobile consideration. Interactive elements (buttons, links, form inputs) need to be large enough to tap accurately — at least 44x44 pixels according to WCAG guidelines. Spacing between touch targets prevents accidental taps on the wrong element. These requirements often mean mobile interfaces need more vertical space than desktop interfaces.",
      "Testing responsive design requires checking on actual devices, not just browser developer tools. Device emulators don't perfectly replicate touch behavior, scrolling physics, or rendering quirks. We test on a range of real devices representing common screen sizes, operating systems, and browsers. Performance testing on mid-range mobile devices (not just the latest flagship phones) reveals issues that affect the majority of real users.",
    ],
  },
  {
    id: "accessibility-fundamentals",
    category: "design",
    icon: Lightbulb,
    title: "Web Accessibility: Building Interfaces Everyone Can Use",
    summary: "Essential accessibility practices that ensure your web application is usable by people of all abilities.",
    content: [
      "Web accessibility means designing and building web applications that can be used by everyone, including people with visual, auditory, motor, or cognitive disabilities. Approximately 15% of the world's population lives with some form of disability. Beyond ethics and legal requirements, accessible design improves usability for all users — curb cuts help wheelchair users, parents with strollers, and delivery workers equally.",
      "Semantic HTML is the foundation of accessibility. Using the correct HTML elements — <nav> for navigation, <main> for primary content, <button> for interactive actions, <h1>-<h6> for headings in order — provides structure that assistive technologies (like screen readers) rely on to help users navigate. A page built entirely with <div> elements may look identical visually, but it's invisible to screen readers.",
      "Keyboard navigation must work for all interactive functionality. Every button, link, form input, and interactive element must be reachable and operable using only a keyboard. The Tab key should move focus through elements in a logical order. Enter and Space should activate buttons. Escape should close modals and dropdowns. Custom interactive components (like date pickers or dropdown menus) need explicit keyboard event handling.",
      "Color must not be the only way to convey information. Status indicators that use only red/green are invisible to people with color blindness (approximately 8% of men). Add text labels, icons, or patterns alongside color. Ensure sufficient contrast between text and background — WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.",
      "Alternative text for images serves users who cannot see them. Every meaningful image needs a concise, descriptive alt attribute that conveys the image's purpose — not its appearance. A team photo's alt text should describe the context ('YR NOVATECH engineering team'), not the visual details ('group of people standing in front of a building'). Decorative images that don't convey information should have empty alt attributes (alt='').",
      "Form accessibility requires visible labels associated with inputs (using the <label> element with htmlFor), clear error messages that identify which field has an error and what's wrong, and proper input types (type='email' triggers appropriate mobile keyboards). Screen reader users navigate forms by listening to labels, so a form that relies on placeholder text instead of labels is unusable for them.",
    ],
  },
];

function Resources() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Knowledge Hub"
          title="Technology Resources"
          description={`Engineering knowledge and technical guides from the ${COMPANY.name} team. Practical explanations of the technologies, architectures, and practices we use to build software.`}
        />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm text-muted-foreground leading-relaxed">
            These resources are written by our engineering team based on real
            experience building production software and training interns. Each article
            explains a concept in depth, with practical context for how it applies to
            real projects. We focus on fundamentals that remain relevant regardless
            of which specific frameworks or libraries are popular today.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedArticle(null);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredArticles.map((article) => {
            const isExpanded = expandedArticle === article.id;
            return (
              <Card
                key={article.id}
                className="border border-border overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedArticle(isExpanded ? null : article.id)
                  }
                  className="w-full text-left p-6 flex items-start gap-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-elegant">
                    <article.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {CATEGORIES.find((c) => c.id === article.category)?.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <ArrowRight
                    className={`h-5 w-5 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <article className="mt-4 space-y-4">
                      {article.content.map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </article>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No articles found in this category yet.
            </p>
          </div>
        )}
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="rounded-3xl bg-gradient-hero p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Learn by Building with {COMPANY.name}
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
            Our internship programs put these concepts into practice. Build real
            projects, get mentor feedback, and earn verifiable certificates.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/internship">
                View Internship Program <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
