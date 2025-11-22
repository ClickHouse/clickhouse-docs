---
alias: []
description: 'PrettyCompactNoEscapesMonoBlock 格式文档'
input_format: false
keywords: ['PrettyCompactNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapesMonoBlock
title: 'PrettyCompactNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 {#description}

与 [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) 格式不同的是,该格式会缓冲最多 `10,000` 行数据,
然后将其作为单个表输出,而不是按[块](/development/architecture#block)输出。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<PrettyFormatSettings />
