---
alias: []
description: 'PrettyCompactMonoBlock 格式文档'
input_format: false
keywords: ['PrettyCompactMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactMonoBlock
title: 'PrettyCompactMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 \\{#description\\}

与 [`PrettyCompact`](./PrettyCompact.md) 格式不同之处在于，它会先最多缓冲 `10,000` 行数据，
然后作为单个表输出，而不是按[块](/development/architecture#block)输出。



## 使用示例 \\{#example-usage\\}



## 格式化设置 \\{#format-settings\\}

<PrettyFormatSettings/>