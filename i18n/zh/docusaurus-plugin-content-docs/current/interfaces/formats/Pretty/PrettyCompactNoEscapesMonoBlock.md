---
title: PrettyCompactNoEscapesMonoBlock
slug: /interfaces/formats/PrettyCompactNoEscapesMonoBlock
keywords: ['PrettyCompactNoEscapesMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) 格式不同的是，最多将 `10,000` 行缓冲， 
然后作为一个单独的表输出，而不是通过 [块](/development/architecture#block)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
