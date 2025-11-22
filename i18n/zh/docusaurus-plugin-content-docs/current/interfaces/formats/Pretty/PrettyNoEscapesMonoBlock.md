---
alias: []
description: 'PrettyNoEscapesMonoBlock 格式文档'
input_format: false
keywords: ['PrettyNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyNoEscapesMonoBlock
title: 'PrettyNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 {#description}

与 [`PrettyNoEscapes`](./PrettyNoEscapes.md) 格式不同的是,该格式会缓冲最多 `10,000` 行数据,
然后将其作为单个表输出,而不是按块输出。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<PrettyFormatSettings />
