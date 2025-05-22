---
'alias': []
'description': 'PrettyCompactNoEscapesMonoBlock格式的文档'
'input_format': false
'keywords':
- 'PrettyCompactNoEscapesMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettyCompactNoEscapesMonoBlock'
'title': 'PrettyCompactNoEscapesMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Description {#description}

与 [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) 格式不同的是，最多可以缓冲 `10,000` 行，然后作为一个单独的表输出，而不是按 [块](/development/architecture#block)。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

<PrettyFormatSettings/>
