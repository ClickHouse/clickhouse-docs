---
slug: /sql-reference/statements/create/dictionary/sources/null
title: 'Null 字典源'
sidebar_position: 14
sidebar_label: 'Null'
description: '在 ClickHouse 中配置 Null（空）字典源以用于测试。'
doc_type: 'reference'
---

一种特殊的字典源，可用于创建虚拟（空）字典。
虚拟字典对于测试场景，或在数据节点与查询节点分离且使用分布式表的部署中非常有用。

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```
