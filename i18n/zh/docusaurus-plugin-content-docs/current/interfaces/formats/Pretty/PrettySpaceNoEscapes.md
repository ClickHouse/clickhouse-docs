---
alias: []
description: 'PrettySpaceNoEscapes 格式文档'
input_format: false
keywords: ['PrettySpaceNoEscapes']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapes
title: 'PrettySpaceNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 \{#description\}

与 [`PrettySpace`](./PrettySpace.md) 格式的不同之处在于，它不使用 [ANSI 转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。  
这对于在浏览器中显示此格式，以及配合 `watch` 命令行工具使用是必需的。



## 使用示例 \{#example-usage\}



## 格式设置 \{#format-settings\}

<PrettyFormatSettings/>