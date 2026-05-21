PRIMARY_THEMES = [
    {
        "id": "entrepreneurship",
        "name": "Entrepreneurship",
        "curation": "Saïd Business School, University of Oxford",
        "description": "Entrepreneurship and venture lifecycle systems.",
    },
    {
        "id": "social-justice",
        "name": "Social Justice",
        "curation": "Minority Rights Group International",
        "description": "Equity, rights, inclusion, and justice systems.",
    },
    {
        "id": "sustainable-development",
        "name": "Sustainable Development",
        "curation": "Southern Voice",
        "description": "Sustainability goals, climate resilience, and inclusive growth.",
    },
    {
        "id": "global-governance",
        "name": "Global Governance",
        "curation": "Lee Kuan Yew School of Public Policy, National University of Singapore",
        "description": "Institutions, rules, and cross-border coordination.",
    },
    {
        "id": "civic-participation",
        "name": "Civic Participation",
        "curation": "Missions Publiques",
        "description": "Participatory governance and citizen voice.",
    },
    {
        "id": "social-protection",
        "name": "Social Protection",
        "curation": "University of York",
        "description": "Welfare, safety nets, and social protection systems.",
    },
    {
        "id": "youth-perspectives",
        "name": "Youth Perspectives",
        "curation": "Global Shapers Community",
        "description": "Youth-led priorities, intergenerational equity, and innovation.",
    },
    {
        "id": "future-of-work",
        "name": "Future of Work",
        "curation": "Technical University of Munich",
        "description": "Workforce transitions, skills, and technology shifts.",
    },
]

# Optional starter links between themes. Adjust freely with client input.
PRIMARY_THEME_RELATIONSHIPS = [
    ("entrepreneurship", "future-of-work"),
    ("entrepreneurship", "sustainable-development"),
    ("social-justice", "social-protection"),
    ("social-justice", "civic-participation"),
    ("sustainable-development", "global-governance"),
    ("youth-perspectives", "future-of-work"),
    ("youth-perspectives", "civic-participation"),
]

