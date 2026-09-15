"""Refresh only the generated public inventory. No third-party dependencies."""
from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OWNER = "rockstar5656"
START = "<!-- PUBLIC-INDEX:START -->"
END = "<!-- PUBLIC-INDEX:END -->"


def get(path: str):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "rockstar5656-profile", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request("https://api.github.com/" + path, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def safe(value: str) -> str:
    return re.sub(r"([\\`*_{}\[\]<>()#!|])", r"\\\1", " ".join(value.split()))


def main():
    repos = []
    page = 1
    while True:
        batch = get(f"users/{OWNER}/repos?type=owner&sort=updated&per_page=100&page={page}")
        repos.extend(r for r in batch if not r.get("private") and r["owner"]["login"].lower() == OWNER)
        if len(batch) < 100:
            break
        page += 1
    originals = [r for r in repos if not r["fork"] and r["name"] != OWNER]
    languages = {}
    for repo in originals:
        for language, size in get(f"repos/{OWNER}/{repo['name']}/languages").items():
            languages[language] = languages.get(language, 0) + size
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"**Public snapshot · {now}**", "", f"{len(originals)} original public project repositories · {sum(r['fork'] for r in repos)} public forks", ""]
    for repo in originals:
        status = "Archived" if repo["archived"] else "Public"
        lines.append(f"- [{safe(repo['name'])}]({repo['html_url']}) — {safe(repo.get('description') or 'No description supplied.')} ({status}; last repository update {repo['updated_at'][:10]}).")
    if languages:
        lines += ["", "**Language inventory by GitHub-reported source bytes:** " + "; ".join(f"{safe(k)}: {v:,} bytes" for k, v in sorted(languages.items(), key=lambda item: -item[1])) + "."]
    lines += ["", "Source: public GitHub repository metadata and language endpoints. Repository update timestamps may reflect metadata changes; they are not contribution counts."]
    readme = ROOT / "README.md"
    text = readme.read_text(encoding="utf-8")
    if text.count(START) != 1 or text.count(END) != 1 or text.index(START) >= text.index(END):
        raise ValueError("README must contain one ordered pair of public-index markers")
    prefix, remainder = text.split(START, 1)
    _, suffix = remainder.split(END, 1)
    updated = prefix + START + "\n" + "\n".join(lines) + "\n" + END + suffix
    temporary = readme.with_suffix(".md.tmp")
    temporary.write_text(updated, encoding="utf-8")
    temporary.replace(readme)
    data = ROOT / "data"
    data.mkdir(exist_ok=True)
    (data / "public-snapshot.json").write_text(json.dumps({"owner": OWNER, "fetched_at": now, "repositories": [{"name": r["name"], "url": r["html_url"], "description": r["description"], "fork": r["fork"], "archived": r["archived"], "updated_at": r["updated_at"]} for r in repos], "language_bytes": languages}, indent=2) + "\n", encoding="utf-8")
    print(f"Updated public inventory: {len(originals)} projects; {len(languages)} languages.")


if __name__ == "__main__":
    main()
