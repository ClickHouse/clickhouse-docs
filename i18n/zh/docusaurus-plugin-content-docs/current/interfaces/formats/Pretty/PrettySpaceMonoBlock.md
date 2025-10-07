---
'alias': []
'description': 'PrettySpaceMonoBlock 格式的文档'
'input_format': false
'keywords':
- 'PrettySpaceMonoBlock'
'output_format': true
'slug': '/interfaces/formats/PrettySpaceMonoBlock'
'title': 'PrettySpaceMonoBlock'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [`PrettySpace`](./PrettySpace.md) 格式不同的是，该格式最多缓存 `10,000` 行，
然后作为一个单一的表输出，而不是通过 [blocks](/development/architecture#block)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
