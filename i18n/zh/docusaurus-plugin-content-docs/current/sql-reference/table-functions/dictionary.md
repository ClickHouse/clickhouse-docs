---
slug: /sql-reference/table-functions/dictionary
sidebar_position: 47
sidebar_label: dictionary
title: '字典'
description: '将字典数据作为 ClickHouse 表展示。与 Dictionary 引擎的工作方式相同。'
---


# 字典 表函数

将[字典](../../sql-reference/dictionaries/index.md)数据作为 ClickHouse 表展示。与[Dictionary](../../engines/table-engines/special/dictionary.md)引擎的工作方式相同。

**语法**

``` sql
dictionary('dict')
```

**参数**

- `dict` — 字典名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

一个 ClickHouse 表。

**示例**

输入表 `dictionary_source_table`：

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

创建一个字典：

``` sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

查询：

``` sql
SELECT * FROM dictionary('new_dictionary');
```

结果：

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

**另请参阅**

- [Dictionary engine](/engines/table-engines/special/dictionary)
