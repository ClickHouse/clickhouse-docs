---
'alias': []
'description': 'PrettyMonoBlock 格式的文档'
'input_format': false
'keywords':
- 'PrettyMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettyMonoBlock'
'title': 'PrettyMonoBlock'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`Pretty`](/interfaces/formats/Pretty) 格式不同的是，最多可以缓存 `10,000` 行，
然后作为单个表输出，而不是通过 [块](/development/architecture#block) 输出。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
