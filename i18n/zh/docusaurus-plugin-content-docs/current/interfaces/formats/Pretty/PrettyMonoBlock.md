---
alias: []
description: 'PrettyMonoBlock 格式的文档'
input_format: false
keywords: ['PrettyMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyMonoBlock
title: 'PrettyMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 \\{#description\\}

与 [`Pretty`](/interfaces/formats/Pretty) 格式不同之处在于，它会最多缓冲 `10,000` 行，
然后一次性输出为一个完整的表，而不是按[数据块](/development/architecture#block)输出。



## 示例用法 \\{#example-usage\\}



## 格式设置 \\{#format-settings\\}

<PrettyFormatSettings/>