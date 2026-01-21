---
alias: []
description: 'PrettySpaceMonoBlock 格式的文档'
input_format: false
keywords: ['PrettySpaceMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceMonoBlock
title: 'PrettySpaceMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 \{#description\}

与 [`PrettySpace`](./PrettySpace.md) 格式不同，此格式最多缓冲 `10,000` 行，
然后将其作为单个表输出，而不是按[数据块](/development/architecture#block)输出。



## 示例用法 \{#example-usage\}



## 格式设置 \{#format-settings\}

<PrettyFormatSettings/>