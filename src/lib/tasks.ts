export type DomainSlug = "full-stack" | "ui-ux" | "python" | "cpp" | "artificial-intelligence" | "cyber-security";

export interface TaskDef {
  no: number;
  title: string;
  description: string;
  requires: { github?: boolean; project?: boolean; drive?: boolean; linkedin?: boolean };
}

const task = (
  no: number,
  title: string,
  description: string,
  requires: { github?: boolean; project?: boolean; drive?: boolean; linkedin?: boolean } = { github: true, project: true, drive: true },
): TaskDef => ({ no, title, description, requires });

const LINKEDIN_TASK: TaskDef = task(
  1,
  "Post Offer Letter on LinkedIn",
  "Download your official YR NOVATECH internship offer letter from the portal. Post it on your LinkedIn profile with a brief message about your internship. Submit the LinkedIn post URL below for admin review.",
  { linkedin: true },
);

export const DOMAIN_TASKS: Record<DomainSlug, TaskDef[]> = {
  "full-stack": [
    LINKEDIN_TASK,
    task(2, "Responsive Multi-Page Landing Website", "Build a responsive, multi-section landing website using HTML, CSS, and JavaScript (or a framework). The site must include a navbar, hero section, features section, testimonials, and a contact form with validation. Deliverables: GitHub repository, live deployment URL, and a brief README explaining your approach."),
    task(3, "User Authentication System", "Implement a complete user authentication system with sign-up, login, logout, password reset, and session management. Use a backend framework (Node.js/Express, Django, or Laravel) with a real database. Include form validation, error handling, and protected routes. Deliverables: GitHub repo, deployment URL, and documentation explaining the auth flow and security measures."),
    task(4, "Full-Stack CRUD Application", "Build a full-stack CRUD application (e.g., inventory manager, blog platform, or task tracker) with create, read, update, and delete operations. Include search/filter functionality, pagination, proper error handling, and loading states. Use a database for persistence. Deliverables: GitHub repo, live URL, and a README with setup instructions and architecture overview."),
    task(5, "API Integration & Data Dashboard", "Integrate with at least one external REST API and build a data visualization dashboard. Implement caching, error boundaries, and responsive layouts. Display data using charts or tables with sorting and filtering. Deliverables: GitHub repo, live URL, and documentation covering API integration and design decisions."),
    task(6, "Deployment, Documentation & Code Review", "Deploy your application from Task 3 or 4 to a production hosting platform (Vercel, Netlify, Railway). Configure environment variables securely, set up error logging, and write comprehensive documentation: setup guide, API docs, architecture overview, and a reflection on lessons learned. Deliverables: GitHub repo with complete docs and production deployment URL."),
  ],
  "ui-ux": [
    LINKEDIN_TASK,
    task(2, "UX Research & Problem Definition", "Conduct UX research for a mobile or web application. Define the problem statement, identify target users, create 2-3 user personas, conduct competitive analysis of 3 existing products, and document user pain points. Deliverables: Research document covering problem definition, personas, and competitive analysis."),
    task(3, "User Flows & Information Architecture", "Design complete user flows and information architecture for the application from Task 2. Create task flows for core user journeys, define the sitemap and navigation structure, and map out the screen hierarchy. Deliverables: User flow diagrams, sitemap, and IA documentation."),
    task(4, "Wireframes & Low-Fidelity Prototypes", "Create wireframes for all core screens (minimum 8 screens). Build low-fidelity clickable prototypes in Figma demonstrating the primary user journey. Include annotations explaining interaction patterns and layout decisions. Deliverables: Figma wireframe file with clickable prototype and annotation notes."),
    task(5, "High-Fidelity Design System & Screens", "Design high-fidelity screens for all core screens using a consistent design system. Define typography, color palette, spacing system, component library (buttons, inputs, cards, navigation), and iconography. Ensure responsive designs for mobile and desktop. Deliverables: Figma file with design system and all high-fidelity screens."),
    task(6, "Interactive Prototype & Usability Report", "Create a fully interactive high-fidelity prototype in Figma with realistic interactions, transitions, and micro-animations. Conduct a heuristic evaluation using Nielsen's heuristics. Document usability considerations, accessibility notes (WCAG), and design handoff specifications. Deliverables: Interactive Figma prototype, heuristic evaluation report, and handoff documentation."),
  ],
  python: [
    LINKEDIN_TASK,
    task(2, "Data Processing Pipeline", "Build a Python data processing pipeline that reads raw data from files (CSV, JSON, or API), cleans and transforms it, and outputs structured results. Handle missing values, type conversions, and edge cases. Implement logging and configuration management. Deliverables: GitHub repo with source code, sample input/output data, and README with setup instructions."),
    task(3, "REST API Development", "Develop a RESTful API using Flask or FastAPI with proper route design, input validation, error handling, and JSON responses. Implement at least 4 CRUD endpoints with database integration (SQLite or PostgreSQL). Include API documentation. Deliverables: GitHub repo, API documentation, and README explaining endpoints and data models."),
    task(4, "Automated Testing & Code Quality", "Write comprehensive unit tests and integration tests for your Python project using pytest. Achieve at least 80% test coverage. Implement code quality tools (flake8, black, mypy). Set up a CI pipeline using GitHub Actions. Deliverables: GitHub repo with test suite, coverage report, and CI configuration."),
    task(5, "Data Analysis & Visualization", "Perform end-to-end data analysis on a real-world dataset (minimum 1000 rows). Clean the data, perform exploratory data analysis with statistical summaries, create at least 5 meaningful visualizations, and document your findings with conclusions. Deliverables: Jupyter notebook, dataset documentation, visualizations, and findings report."),
    task(6, "Deployment & Project Documentation", "Package your best Python project for production deployment. Create a Docker container or deploy to a cloud platform. Write comprehensive documentation including architecture overview, setup guide, API docs, and a code review reflecting on what you learned. Deliverables: GitHub repo, deployment, and complete documentation."),
  ],
  cpp: [
    LINKEDIN_TASK,
    task(2, "Data Structures Implementation", "Implement core data structures from scratch: linked list (singly and doubly), stack, and queue. Each must include insert, delete, search, and traversal operations with proper memory management (no memory leaks). Write unit tests for each structure. Deliverables: GitHub repo with source code, test suite, and documentation explaining time/space complexity."),
    task(3, "File-Based Database System", "Build a file-based database system that supports persistent storage of records with CRUD operations. Implement file I/O, record indexing, search functionality, and data serialization. Handle concurrent access considerations. Deliverables: GitHub repo, source code with header files, and documentation with usage examples."),
    task(4, "OOP Design Patterns Project", "Develop a multi-module C++ project applying at least 3 design patterns (Singleton, Factory, Observer, Strategy, or similar). Implement proper encapsulation, inheritance, polymorphism, and abstract classes. Use header/source separation with a Makefile or CMake build system. Deliverables: GitHub repo, build system files, and documentation explaining the patterns used."),
    task(5, "Algorithm Optimization & Benchmarking", "Implement 3 sorting algorithms and 3 search algorithms. Perform time complexity analysis with real benchmarks. Create a benchmarking framework that compares algorithms on different input sizes and generates performance reports. Deliverables: GitHub repo with benchmarking code, performance graphs/charts, and analysis report."),
    task(6, "Complete Application & Documentation", "Build a complete console or GUI application in C++ (e.g., inventory system, expense tracker, or text editor). Include proper error handling, input validation, file persistence, and a clean user interface. Write comprehensive documentation. Deliverables: GitHub repo with full source code, build instructions, user manual, and code review."),
  ],
  "artificial-intelligence": [
    LINKEDIN_TASK,
    task(2, "Data Collection & Preprocessing", "Collect a real-world dataset (minimum 1000 samples) from a public source (Kaggle, UCI, or API). Clean the data: handle missing values, outliers, duplicates, and type conversions. Perform feature engineering and document the preprocessing pipeline. Deliverables: Clean dataset, preprocessing script/notebook, and data documentation."),
    task(3, "AI Hand Gesture Recognition", "Build a simple AI-based hand gesture recognition system using a webcam. The system should recognize basic hand gestures such as Open Hand, Fist, Thumbs Up, and Victory/Peace and display the detected gesture on the screen. Expected submission: GitHub repository, working demo/video, short explanation of the technology used, and screenshots of the working project."),
    task(4, "AI Hand Gesture Computer Control System", "Build an AI-powered hand gesture system that uses a webcam to control basic computer actions. The system should detect hand movements and use gestures to perform actions such as moving the mouse cursor, clicking, scrolling, or controlling another simple computer function. Expected submission: GitHub repository, working demo/video, short explanation of the AI/computer-vision approach, and screenshots of the working project."),
    task(5, "Advanced AI Hand Gesture Control Application", "Build a complete AI-powered hand gesture control application using a webcam. The application should recognize multiple hand gestures and use them to control different computer or application actions. Include a simple user interface, gesture detection, action mapping, error handling, and a clear demonstration of the complete system. Expected submission: GitHub repository, working deployed/demo application or video demonstration, project documentation, explanation of the AI/computer-vision techniques used, and screenshots/demo of the completed system."),
    task(6, "Documentation & Model Deployment", "Package your ML project for deployment. Create a prediction API or Streamlit demo. Write comprehensive documentation: problem statement, approach, model architecture, training process, results, limitations, and future improvements. Deliverables: GitHub repo, deployed demo, model documentation, and presentation of results."),
  ],
  "cyber-security": [
    task(1, "Cyber Security Fundamentals & Security Assessment", "Learn basic cybersecurity concepts and perform a security assessment of a safe test website or application. Identify common security risks, document the findings, and provide basic recommendations. Submission: Security assessment report, list of identified risks, recommendations, GitHub/documentation link if applicable.", { github: true, drive: true }),
    task(2, "Web Application Security Testing", "Perform basic security testing on a legal test application or locally created application. Identify common vulnerabilities such as weak authentication, insecure input handling, and basic OWASP Top 10 issues. Submission: Vulnerability report, evidence/screenshots, risk level for each finding, recommended fixes.", { github: true, project: true, drive: true }),
    task(3, "Cyber Security Monitoring Dashboard", "Build a simple cybersecurity monitoring dashboard that displays security events and identifies suspicious activities such as repeated failed login attempts, unusual access attempts, or suspicious IP activity using safe sample/test logs. Submission: Working dashboard, GitHub repository, demo video/screenshots, short explanation of detection logic.", { github: true, project: true, drive: true }),
    task(4, "Network Security & Vulnerability Analysis", "Analyze a safe test network or simulated network environment. Identify open services, unnecessary exposure, common security weaknesses, and possible risks. Document how the environment can be secured. Submission: Network/security assessment report, network diagram if applicable, findings and risk levels, security recommendations.", { github: true, project: true, drive: true }),
    task(5, "Cyber Security Monitoring & Threat Detection Dashboard", "Build a complete cybersecurity monitoring dashboard using safe sample/test security logs. The system should import/read security logs, display security events, detect suspicious activities, identify repeated failed login attempts, identify suspicious IP activity, assign basic severity levels, show security statistics, and provide a clear dashboard for monitoring detected threats. Include a simple user interface and documented detection logic. Submission: Working cybersecurity monitoring dashboard, GitHub repository, demo video, project documentation, screenshots, explanation of the security detection methods used.", { github: true, project: true, drive: true }),
  ],
};

export function getTasksForSlug(slug: string | undefined | null): TaskDef[] {
  if (!slug) return [];
  return DOMAIN_TASKS[slug as DomainSlug] ?? [];
}
