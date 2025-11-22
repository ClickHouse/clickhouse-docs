---
alias: []
description: 'PrettyCompactNoEscapes 格式文档'
input_format: false
keywords: ['PrettyCompactNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapes
title: 'PrettyCompactNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 {#description}

与 [`PrettyCompact`](./PrettyCompact.md) 格式的区别在于不使用 [ANSI 转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。
这对于在浏览器中显示该格式以及使用 `watch` 命令行工具是必需的。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<PrettyFormatSettings />
