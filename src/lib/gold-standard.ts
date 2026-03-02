import { GoldStandardResume } from "@/types/resume";

export const sampleGoldStandard: GoldStandardResume = {
    basics: {
        name: "Bikram Tuladhar",
        label: "Software Engineer / DevOps",
        email: "bikram@example.com",
        phone: "+977-9800000000",
        summary: "Results-driven Software Engineer with extensive experience in full-stack development, DevOps integration, and team leadership. Proven track record of migrating legacy systems, optimizing cloud infrastructure, and leading cross-functional teams to deliver scalable solutions.",
        links: {
            linkedin: "LINK",
            github: "LINK",
        },
    },
    skills: {
        programming: ["PHP", "JavaScript", "Python", "SQL", "Bash"],
        frameworks: [
            "Laravel",
            "Vue.js",
            "Nuxt.js",
            "ReactJS",
            "Django",
            "Flask",
            "FastAPI",
            "Express.js",
            "Hono",
        ],
        devOps: [
            "Git",
            "GitLab",
            "Jenkins",
            "Bitbucket CI/CD",
            "Terraform",
            "Helm",
            "Docker",
            "Kubernetes",
        ],
        testing: [
            "PHPUnit",
            "JMeter",
            "SonarQube",
            "PHPStan",
            "Snyk",
            "ESLint",
            "Pint",
            "Husky",
        ],
        security: ["Tenable Nessus", "Nginx ModSecurity", "pfSense"],
        cloud: [
            "AWS",
            "Google Cloud Platform",
            "Azure",
            "Oracle Cloud",
            "DigitalOcean",
        ],
        databases: ["MySQL", "PostgreSQL", "Redis"],
    },
    experience: [
        {
            role: "Software Engineer / DevOps",
            company: "Jobins Co Jp",
            duration: "October 2022 – Present",
            focusAreas: [
                {
                    heading: "Laravel Mix to Vite Migration & Version Upgrades",
                    bullets: [
                        "Led the migration of Laravel Mix to Vite in Laravel 8, backporting Laravel View class methods for compatibility.",
                        "Spearheaded the upgrade from Laravel 8 to 10 and PHP 8 to 8.1, utilizing tools like Rector for seamless codebase transition.",
                        "Managed the introduction of automated linting using Pint and ESLint in local environments (Husky) and Bitbucket CI/CD pipelines.",
                    ],
                },
                {
                    heading: "Testing, Optimization & Tooling",
                    bullets: [
                        "Directed and streamlined PHPUnit testing, contributing over 300 test cases to ensure stability and boost confidence during upgrades.",
                        "Implemented JMeter load testing to identify system bottlenecks, resolving them via caching and dynamic programming techniques.",
                        "Improved Webpack build times by leveraging caching and optimizing the inclusion of only necessary files and folders.",
                        "Led the implementation of SonarQube for code quality scanning, initiating the resolution of issues identified.",
                    ],
                },
                {
                    heading: "Team Leadership & Feature Implementation",
                    bullets: [
                        "Led a team of 5 developers, assisting with database design, architecture planning, and implementing features like rating systems using moving averages.",
                        "Managed the migration of file-based sessions to Redis via a database intermediary, improving system performance and scalability.",
                        "Introduced PHPStan for static analysis and began refactoring legacy code to reduce technical debt.",
                    ],
                },
                {
                    heading: "Database & Infrastructure Upgrades",
                    bullets: [
                        "Led the database upgrade from MySQL 5.7 to 8, modernizing deprecated SQL functions to ensure compatibility.",
                        "Optimized the overall system through load testing and performance enhancements like caching and database query improvements.",
                    ],
                },
            ],
        },
        {
            role: "Engineering Manager / DevOps Engineer",
            company: "YoungInnovations Pvt. Ltd.",
            duration: "December 2017 – June 2023",
            focusAreas: [
                {
                    heading: "DevOps & Cloud Infrastructure",
                    bullets: [
                        "Automated multi-cloud platform deployments for ASP.NET projects, streamlining processes.",
                        "Managed migration of legacy systems to new cloud providers, minimizing downtime and ensuring operational stability.",
                        "Migrated GitLab to a Docker environment with automated backups, improving data integrity.",
                        "Moved legacy hosting to Kubernetes to save cost more than 50%.",
                    ],
                },
                {
                    heading: "Laravel & VueJS Development",
                    bullets: [
                        "Developed a Laravel module to facilitate the import and export of translation files using Excel.",
                        "Led and delivered a database application using VueJS and Laravel for the Federation of Nepali Journalists.",
                        "Built a dynamic form generator that converts Excel-based table forms into web forms.",
                    ],
                },
            ],
        },
    ],
    openSourceProjects: [
        {
            title: "DNS Record Comparator",
            link: "LINK",
            description:
                "Bash script for comparing DNS configurations across servers to identify discrepancies.",
        },
        {
            title: "MYSQL Clonner",
            link: "LINK",
            description:
                "Automated MySQL cloning using xtrabackup for fast and efficient backups.",
        },
        {
            title: "AWS IP Mover",
            link: "LINK",
            description:
                "Automated tool for migrating IPs between instances in AWS.",
        },
    ],
    education: [
        {
            institution: "AIMS International College",
            location: "Lalitpur, Nepal",
            degree: "Bachelor's Degree in Computer Science",
            duration: "2019 - 2024",
        },
        {
            institution: "Thapathali Campus",
            location: "Kathmandu Nepal",
            degree: "Diploma in Computer Engineering",
            duration: "2009 - 2012",
        },
    ],
    customSections: [],
};
