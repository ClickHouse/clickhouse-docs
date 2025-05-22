---
'description': '当写入 `Null` 表时，数据将被忽略。当从 `Null` 表读取时，响应为空。'
'sidebar_label': '空'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': '空表引擎'
---


# Null 表引擎

当写入 `Null` 表时，数据将被忽略。当从 `Null` 表读取时，响应为空。

:::note
如果您想知道这为什么有用，请注意，您可以在 `Null` 表上创建物化视图。因此，写入表中的数据最终将影响视图，但原始原始数据仍将被丢弃。
:::
