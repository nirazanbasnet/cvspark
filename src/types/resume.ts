export interface GoldStandardResume {
    basics: {
        name: string;
        label: string;
        location?: string;
        email?: string;
        phone?: string;
        summary?: string;
        links: { github?: string; linkedin?: string; portfolio?: string };
    };
    skills: {
        programming: string[];
        frameworks: string[];
        devOps: string[];
        testing: string[];
        security: string[];
        cloud: string[];
        databases: string[];
    };
    experience: {
        role: string;
        company: string;
        duration: string;
        focusAreas?: {
            heading: string;
            bullets: string[];
        }[];
        bullets?: string[];
    }[];
    openSourceProjects?: {
        title: string;
        link: string;
        description: string;
    }[];
    education: {
        institution: string;
        location: string;
        degree: string;
        duration: string;
    }[];
    customSections?: {
        title: string;
        items: {
            heading?: string;
            subheading?: string;
            date?: string;
            description?: string;
            bullets?: string[];
        }[];
    }[];
}
