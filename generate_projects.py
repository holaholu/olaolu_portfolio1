import json
import urllib.request
import re
import os
import time

import title_overrides

GITHUB_USER = "holaholu"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PROJECTS = os.path.join(DATA_DIR, "projects.js")
OUTPUT_LANGUAGES = os.path.join(DATA_DIR, "languages.js")

IGNORE = {
    "2025_001",
    "AliveInsideFoundation",
    "Angular2.js-playground",
    "devin-cloudtest",
    "github-final-project",
    "ibm_learn_react",
    "LogisticsShippingRates",
    "MEAN-STACK-BOILER-PLATE",
    "patchwork",
    "gkpbt-css-circle",
    "jbbmo-Introduction-to-Git-and-GitHub",
    "Hello_world_Phonegap",
    "testonly",
    "Intro",
    "Intro_via_Yomify.com",
    "open-source",
    "watchlistgen",
    "webmain",
}

CATEGORY_RULES = [
    ("AI / LLM / Agents", ["llm", "genai", "agent", "chatbot", "emotion", "sentiment", "langchain", "terminator"]),
    ("ML / Data", ["machine_learning", "machinelearning", "deeplearning", "detection", "watchlist", "stock", "stocks", "trading", "trabot", "macro", "data"]),
    ("DevOps / Cloud", ["aws", "serverless", "terraform", "snowflake", "openshift", "docker", "kubernetes", "llmops", "ml_ops", "cloud"]),
    ("Full-Stack", ["ecommerce", "e-plant", "plant", "shop", "store", "project_manager", "voting", "nightlife", "pinterest", "stackoverflow", "bookstore", "book", "event", "basecamper", "fullstack", "trivia", "job"]),
    ("Backend", ["node", "express", "django", "flask", "microservice", "service", "api", "parser", "timestamp", "url", "metadata", "server"]),
    ("Frontend", ["react", "angular", "ionic", "jquery", "mobile", "dashboard", "weather", "playground", "playbook", "ui", "html", "css"]),
    ("Tools", ["scraper", "calculator", "generator", "game", "app"]),
]

COLOR_PALETTE = [
    "#38bdf8", "#818cf8", "#f472b6", "#34d399", "#fbbf24",
    "#f87171", "#a78bfa", "#22d3ee", "#fb923c", "#c084fc",
    "#2dd4bf", "#e879f9", "#84cc16", "#f43f5e", "#06b6d4",
]

KNOWN_COLORS = {
    "Python": "#3572A5",
    "JavaScript": "#f1e05a",
    "TypeScript": "#3178c6",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Jupyter Notebook": "#da5b0b",
    "Shell": "#89e051",
    "Java": "#b07219",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "C++": "#f34b7d",
    "C": "#555555",
    "C#": "#178600",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Swift": "#ffac45",
    "Kotlin": "#A97BFF",
    "Objective-C": "#438eff",
    "Vue": "#41b883",
    "Svelte": "#ff3e00",
    "SCSS": "#c6538c",
    "SQL": "#e38c00",
    "Dockerfile": "#384d54",
    "TeX": "#3D6117",
    "Dart": "#00B4AB",
}


def title_case(name: str) -> str:
    name = re.sub(r"([a-z])([A-Z])", r"\1 \2", name)
    name = re.sub(r"[_\-]", " ", name)
    return name.title()


def categorize(name: str, description: str) -> str:
    text = f"{name} {description or ''}".lower()
    for category, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw.lower() in text:
                return category
    return "Other"


def fetch_json(url: str, timeout: int = 30):
    req = urllib.request.Request(url, headers={"User-Agent": "portfolio-generator"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.load(resp)


def fetch_repos():
    repos = []
    page = 1
    while True:
        url = f"https://api.github.com/users/{GITHUB_USER}/repos?per_page=100&page={page}"
        data = fetch_json(url)
        if not data:
            break
        repos.extend(data)
        if len(data) < 100:
            break
        page += 1
    return repos


def fetch_repo_languages(name: str):
    url = f"https://api.github.com/repos/{GITHUB_USER}/{name}/languages"
    try:
        time.sleep(0.12)  # be kind to GitHub's unauthenticated rate limit
        return fetch_json(url)
    except Exception as e:
        print(f"  Could not fetch languages for {name}: {e}")
        return {}


def color_for(name: str, index: int) -> str:
    if name in KNOWN_COLORS:
        return KNOWN_COLORS[name]
    return COLOR_PALETTE[index % len(COLOR_PALETTE)]


def main():
    print("Fetching repos...")
    repos = fetch_repos()
    repos.sort(
        key=lambda r: (r.get("stargazers_count", 0), r.get("forks_count", 0), r.get("pushed_at") or ""),
        reverse=True,
    )

    projects = []
    language_totals = {}

    for repo in repos:
        if repo.get("fork") or repo.get("private"):
            continue
        name = repo["name"]
        if name in IGNORE:
            continue

        title = title_overrides.TITLES.get(name, title_case(name))
        description = (repo.get("description") or "").strip()
        if not description:
            description = f"GitHub repository for {title}."

        language = repo.get("language")
        tags = []
        if language:
            tags.append(language)
        topics = repo.get("topics", [])
        for topic in topics[:3]:
            if topic not in tags:
                tags.append(topic.title() if topic.islower() else topic)

        projects.append({
            "title": title,
            "category": categorize(name, description),
            "tags": tags,
            "description": description,
            "code": repo["html_url"],
        })

        print(f"  {name}: fetching languages...")
        for lang, bytes_count in fetch_repo_languages(name).items():
            # Treat Jupyter Notebook content as Python for the chart
            if lang == "Jupyter Notebook":
                lang = "Python"
            language_totals[lang] = language_totals.get(lang, 0) + bytes_count

    os.makedirs(DATA_DIR, exist_ok=True)

    with open(OUTPUT_PROJECTS, "w", encoding="utf-8") as f:
        f.write("// Generated from github.com/")
        f.write(GITHUB_USER)
        f.write("\nconst projects = ")
        f.write(json.dumps(projects, indent=2, ensure_ascii=False))
        f.write(";\n")

    total = sum(language_totals.values())
    if total:
        sorted_langs = sorted(language_totals.items(), key=lambda x: x[1], reverse=True)
        raw = []
        for lang, bytes_count in sorted_langs:
            raw.append({
                "name": lang,
                "bytes": bytes_count,
                "percent": round((bytes_count / total) * 100, 1),
            })

        # Keep languages >= 1%, up to 15; group the rest as "Other"
        kept = []
        others = []
        for entry in raw:
            if entry["percent"] >= 1 and len(kept) < 15:
                kept.append(entry)
            else:
                others.append(entry)

        languages = []
        for i, entry in enumerate(kept):
            languages.append({
                "name": entry["name"],
                "bytes": entry["bytes"],
                "percent": entry["percent"],
                "color": color_for(entry["name"], i),
            })

        if others:
            other_bytes = sum(e["bytes"] for e in others)
            other_percent = round((other_bytes / total) * 100, 1)
            top_other_names = [e["name"] for e in others[:3]]
            if len(others) > 3:
                other_label = ", ".join(top_other_names) + " & others"
            else:
                if len(top_other_names) == 1:
                    other_label = top_other_names[0]
                else:
                    other_label = ", ".join(top_other_names[:-1]) + " & " + top_other_names[-1]
            languages.append({
                "name": other_label,
                "bytes": other_bytes,
                "percent": other_percent,
                "color": "#94a3b8",
            })
    else:
        languages = []

    with open(OUTPUT_LANGUAGES, "w", encoding="utf-8") as f:
        f.write("// Generated from github.com/")
        f.write(GITHUB_USER)
        f.write("\nconst languages = ")
        f.write(json.dumps(languages, indent=2, ensure_ascii=False))
        f.write(";\n")

    print(f"Wrote {len(projects)} projects to {OUTPUT_PROJECTS}")
    for c in set(p["category"] for p in projects):
        count = sum(1 for p in projects if p["category"] == c)
        print(f"  {c}: {count}")
    print(f"Wrote {len(languages)} language entries to {OUTPUT_LANGUAGES}")


if __name__ == "__main__":
    main()
