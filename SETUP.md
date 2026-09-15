# Publish this GitHub profile

This package belongs in the public repository `rockstar5656/rockstar5656`. GitHub displays its root README on the matching account's profile.

## One-time publication

From this folder, run `gh auth login`, authenticate as `rockstar5656`, then run `powershell -ExecutionPolicy Bypass -File .\PUBLISH.ps1`. The script checks the signed-in account and stops if an existing profile repository needs integration. It creates only the dedicated profile repository.

Publication uses the authenticated GitHub CLI. The source is maintained in the dedicated profile repository, independently of application projects.

## Account presentation

- Display name: `Vidit Shah`
- Suggested bio: `Building Python systems and automation. Public code, architecture, engineering decisions, and reproducible checks.`
- Pin `binance-futures-trading-bot` as the first project. Pin additional repositories when they have public source and a useful reviewer entry point.
- Add a professional website or contact method only when you choose what to make public.

## Growing the profile

Keep new projects in their own repositories. Give each an actual demo, a small architecture map, setup commands, meaningful verification, and limitations. The profile should summarize that evidence and link to it.

The weekly workflow updates the public index. It uses the workflow token to read public metadata and commit the generated section. Private repository metadata and source are excluded.

The engineering notebook already contains two source analyses. For future experiments, copy its template and fill results only after measurement. Replace moving `main` source links with immutable commit links when recording a finalized experiment.

Interactive JavaScript and live dashboards do not execute inside a GitHub profile README. If you later want an interactive lab, build a separate site and link it from the profile. Robotics demos, AI Q&A, benchmarks, and deployment claims should be added when working implementations and public evidence exist.
