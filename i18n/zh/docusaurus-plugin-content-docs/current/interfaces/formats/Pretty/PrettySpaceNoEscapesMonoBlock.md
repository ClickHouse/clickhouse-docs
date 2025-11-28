---
alias: []
description: 'PrettySpaceNoEscapesMonoBlock 格式文档'
input_format: false
keywords: ['PrettySpaceNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapesMonoBlock
title: 'PrettySpaceNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 {#description}

与 [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) 格式不同之处在于，会先最多缓冲 `10,000` 行数据，
然后将其作为一张完整的表输出，而不是按[数据块](/development/architecture#block)输出。



## 使用示例 {#example-usage}



## 格式设置 {#format-settings}

<PrettyFormatSettings/>