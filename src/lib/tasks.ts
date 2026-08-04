export type DomainSlug = "full-stack" | "ui-ux" | "python" | "cpp" | "cyber-security" | "artificial-intelligence";

export interface TaskDef {
  no: number;
  title: string;
  description: string;
  requires: { github?: boolean; project?: boolean; drive?: boolean; linkedin?: boolean };
}

const linkedinTask: TaskDef = {
  no: 1,
  title: "LinkedIn Offer Letter Announcement",
  description: "Share your YR NOVATECH internship offer letter on LinkedIn, tagging YR NOVATECH. Submit the post link here.",
  requires: { project: true, linkedin: true },
};

const std = (no: number, title: string, description: string): TaskDef => ({
  no,
  title,
  description,
  requires: { github: true, project: true, drive: true },
});

export const DOMAIN_TASKS: Record<DomainSlug, TaskDef[]> = {
  "full-stack": [
    linkedinTask,
    std(2, "Personal Portfolio Website", "Create a personal portfolio website showcasing your skills and experience."),
    std(3, "Login & Registration Page", "Develop a simple and secure login and registration page with validation."),
    std(4, "To-Do List Application", "Create a To-Do List application with task addition, deletion, and status updates."),
    std(5, "Student Management System", "Build a basic Student Management System to manage student records."),
  ],
  "ui-ux": [
    linkedinTask,
    std(2, "Login Page UI", "Design a clean and modern Login Page UI layout."),
    std(3, "College Website Design", "Create a comprehensive College Website design and architecture."),
    std(4, "Mobile App Interface", "Design a responsive and intuitive Mobile App user interface."),
    std(5, "Interactive Figma Prototypes", "Create interactive, clickable prototypes in Figma demonstrating user flows."),
  ],
  python: [
    linkedinTask,
    std(2, "Calculator Application", "Build a fully functional Calculator application using Python."),
    std(3, "Password Generator", "Create a secure and random Password Generator utility."),
    std(4, "Student Record Management System", "Develop a Student Record Management System with storage and query features."),
    std(5, "Number Guessing Game", "Create an interactive and fun Number Guessing Game."),
  ],
  cpp: [
    linkedinTask,
    std(2, "Calculator in C++", "Build a standard mathematical Calculator using C++."),
    std(3, "Student Record System", "Create a console-based Student Record System to store and view info."),
    std(4, "Library Management System", "Implement a Library Management System to keep track of book issues and returns."),
    std(5, "Bank Management Mini-Project", "Develop a Bank Management mini-project simulating account operations."),
  ],
  "cyber-security": [
    linkedinTask,
    std(2, "Cyber Security Awareness", "Create a detailed Cyber Security Awareness presentation on modern threats."),
    std(3, "Password Strength Analysis", "Perform password strength analysis and design secure authentication guidelines."),
    std(4, "Cyber Attack Study", "Study common cyber attacks, exploit mechanisms, and prevention methods."),
    std(5, "Security Audit Report", "Prepare a basic security audit report for a sample network environment."),
  ],
  "artificial-intelligence": [
    linkedinTask,
    std(2, "Data Analysis Task", "Perform exploratory data analysis (EDA) using a sample dataset."),
    std(3, "House Price Prediction", "Build a regression model to perform House Price Prediction based on features."),
    std(4, "Spam Email Detection", "Create a text classification model to perform Spam Email Detection."),
    std(5, "Simple Chatbot", "Develop a simple rule-based or retrieval-based Chatbot."),
  ],
};

export function getTasksForSlug(slug: string | undefined | null): TaskDef[] {
  if (!slug) return [];
  return DOMAIN_TASKS[slug as DomainSlug] ?? [];
}
