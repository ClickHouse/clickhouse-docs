---
sidebar_label: 'Code interpreter'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/builder/code-interpreter
title: 'Code interpreter'
description: 'Sandboxed code execution in ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'code interpreter', 'sandbox', 'python']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

The code interpreter lets an agent execute code in a managed sandbox. Use it for computation, data transformation, format conversion, plotting, and anything else better done in code than in natural language.

## Enable it {#enable-it}

Toggle **Code interpreter** in the Agent Builder's capabilities section, then save. The agent decides when to run code based on the user's request and the agent's instructions.

## Supported languages {#supported-languages}

The sandbox is a Unix environment with two general-purpose runtimes and a few shell utilities:

- **Python 3** — the default for data tasks.
- **Node.js (JavaScript)** — when an agent prefers JS for the job.
- **Bash** and **sh** — shell scripting for chaining commands and quick I/O.
- **AWK** and **sed** — line-oriented text processing.
- **bc** — arbitrary-precision math.

Agents reach for Python first for anything involving data parsing, transformation, or computation. Reserve the shell tools for tasks that genuinely benefit from a one-liner.

## Files {#files}

Users can upload files into a conversation; the code interpreter has access to them in the sandbox working directory. Code can also write output files (CSVs, plots, archives) which appear in the conversation as downloadable attachments.

## Sandbox isolation {#sandbox-isolation}

Each execution runs in an ephemeral sandbox with no network access and no persistent storage. Sessions don't share state — variables and files from one run don't carry into the next unless the agent explicitly re-loads them.

Plan-specific resource limits (memory, files per run, monthly request quotas) apply. Errors and stderr are surfaced in the conversation alongside stdout.

## When to use it {#when-to-use-it}

- Parse a CSV or JSON the user uploaded.
- Compute summary statistics or run a quick simulation.
- Convert between formats (Parquet, JSON, CSV).
- Generate a plot from query results.
- Anything where deterministic computation beats LLM reasoning.

Avoid it for tasks the model can answer directly. Code execution adds latency and consumes quota.
