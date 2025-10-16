---
'alias': []
'description': 'PrettySpaceNoEscapes 格式的文档'
'input_format': false
'keywords':
- 'PrettySpaceNoEscapes'
'output_format': true
'slug': '/interfaces/formats/PrettySpaceNoEscapes'
'title': 'PrettySpaceNoEscapes'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

与 [`PrettySpace`](./PrettySpace.md) 格式不同的是，不使用 [ANSI 转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。 
这对于在浏览器中显示此格式以及使用 'watch' 命令行工具是必要的。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
