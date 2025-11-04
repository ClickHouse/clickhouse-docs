---
'alias': []
'description': 'PrettySpaceNoEscapesMonoBlock 格式的文档'
'input_format': false
'keywords':
- 'PrettySpaceNoEscapesMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettySpaceNoEscapesMonoBlock'
'title': 'PrettySpaceNoEscapesMonoBlock'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) 格式的不同之处在于，最多可以缓冲 `10,000` 行，并将其作为单个表输出，而不是按 [块](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
