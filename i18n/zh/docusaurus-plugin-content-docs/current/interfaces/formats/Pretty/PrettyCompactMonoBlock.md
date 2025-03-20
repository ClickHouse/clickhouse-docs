---
title: 'PrettyCompactMonoBlock'
slug: '/interfaces/formats/PrettyCompactMonoBlock'
keywords: ['PrettyCompactMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettyCompact`](./PrettyCompact.md) 格式不同的是，它缓冲最多 `10,000` 行，然后作为一个单一表输出，而不是按 [块](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
