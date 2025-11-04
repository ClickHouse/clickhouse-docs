---
'description': '写入 `Null` 表时，数据会被忽略。从 `Null` 表中读取时，响应为空。'
'sidebar_label': 'Null'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': 'Null 表引擎'
'doc_type': 'reference'
---


# `Null` 表引擎

写入 `Null` 表时，数据会被忽略。从 `Null` 表读取时，响应为空。

:::note
如果您想知道这有什么用，请注意您可以在 `Null` 表上创建一个物化视图。因此，写入表中的数据将最终影响该视图，但原始的原始数据将仍然被丢弃。
:::
