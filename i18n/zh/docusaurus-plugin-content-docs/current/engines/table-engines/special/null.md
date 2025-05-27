---
'description': '当写入 `Null` 表时，数据会被忽略。当从 `Null` 表读取时，响应为空。'
'sidebar_label': 'Null'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': 'Null 表引擎'
---


# Null 表引擎

在写入 `Null` 表时，数据会被忽略。在从 `Null` 表读取时，返回的响应是空的。

:::note
如果你在想为什么这有用，请注意你可以在 `Null` 表上创建物化视图。因此，写入表中的数据最终会影响视图，但原始的原始数据仍会被丢弃。
:::
