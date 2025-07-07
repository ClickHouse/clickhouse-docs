---
'alias': []
'description': 'PrettySpaceMonoBlock 格式的 文档'
'input_format': false
'keywords':
- 'PrettySpaceMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettySpaceMonoBlock'
'title': 'PrettySpaceMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettySpace`](./PrettySpace.md) 格式不同，最多会缓冲 `10,000` 行，然后作为单个表输出，而不是按 [块](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
