---
'alias': []
'description': 'PrettyCompactNoEscapes格式的文档'
'input_format': false
'keywords':
- 'PrettyCompactNoEscapes'
'output_format': true
'slug': '/interfaces/formats/PrettyCompactNoEscapes'
'title': 'PrettyCompactNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettyCompact`](./PrettyCompact.md) 格式不同的是，不使用 [ANSI 转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。 
这在浏览器中显示格式时是必要的，同时也适用于使用 'watch' 命令行实用工具。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
