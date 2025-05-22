---
'description': 'ClickHouse中数据类型的文档'
'sidebar_label': '数据类型列表'
'sidebar_position': 1
'slug': '/sql-reference/data-types/'
'title': 'ClickHouse中的数据类型'
---


# Data Types in ClickHouse

本节描述了 ClickHouse 支持的数据类型，例如 [integers](int-uint.md)、[floats](float.md) 和 [strings](string.md)。

系统表 [system.data_type_families](/operations/system-tables/data_type_families) 提供了所有可用数据类型的概述。
它还显示了某个数据类型是否是另一个数据类型的别名，并且其名称区分大小写（例如 `bool` 与 `BOOL`）。
