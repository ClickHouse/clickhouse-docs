---
title: 'PrettySpaceNoEscapesMonoBlock'
slug: '/interfaces/formats/PrettySpaceNoEscapesMonoBlock'
keywords: ['PrettySpaceNoEscapesMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) 格式不同的是，这种格式最多会缓冲 `10,000` 行，
然后作为一个单独的表输出，而不是通过 [块](/development/architecture#block)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
