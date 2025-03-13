---
title: 'PrettySpaceMonoBlock'
slug: '/interfaces/formats/PrettySpaceMonoBlock'
keywords: ['PrettySpaceMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettySpace`](./PrettySpace.md) 格式不同的是，这种格式最多缓冲 `10,000` 行，然后作为一个整体表格输出，而不是按 [blocks](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
