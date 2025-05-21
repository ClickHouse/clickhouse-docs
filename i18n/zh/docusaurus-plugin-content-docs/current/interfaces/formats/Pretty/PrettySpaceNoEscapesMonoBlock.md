---
'alias': []
'description': 'PrettySpaceNoEscapesMonoBlock 格式的文档'
'input_format': false
'keywords':
- 'PrettySpaceNoEscapesMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettySpaceNoEscapesMonoBlock'
'title': 'PrettySpaceNoEscapesMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|------|-------|------|
| ✗    | ✔     |      |

## 描述 {#description}

与 [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) 格式不同的是，最多可以缓冲 `10,000` 行，然后作为一个单一的表输出，而不是通过 [块](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
