---
'alias': []
'description': 'PrettyCompactNoEscapesMonoBlock 格式的文档'
'input_format': false
'keywords':
- 'PrettyCompactNoEscapesMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettyCompactNoEscapesMonoBlock'
'title': 'PrettyCompactNoEscapesMonoBlock'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与[`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md)格式不同的是，最多可以缓冲`10,000`行，
然后作为一个单一表格输出，而不是通过[块](/development/architecture#block)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
