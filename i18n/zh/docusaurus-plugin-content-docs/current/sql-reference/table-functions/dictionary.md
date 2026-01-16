---
description: '将字典数据显示为一个 ClickHouse 表。其工作原理与 Dictionary 引擎相同。'
sidebar_label: 'dictionary'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'dictionary'
doc_type: 'reference'
---

# dictionary 表函数 \\{#dictionary-table-function\\}

将 [dictionary](../../sql-reference/dictionaries/index.md) 数据以 ClickHouse 表的形式呈现。其工作方式与 [Dictionary](../../engines/table-engines/special/dictionary.md) 引擎相同。

## 语法 \\{#syntax\\}

```sql
dictionary('dict')
```

## 参数 \\{#arguments\\}

- `dict` — 字典名。[String](../../sql-reference/data-types/string.md)。

## 返回值 \\{#returned_value\\}

一个 ClickHouse 表。

## 示例 \\{#examples\\}

输入表 `dictionary_source_table`：

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

创建一个字典：

```sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

查询：

```sql
SELECT * FROM dictionary('new_dictionary');
```

结果：

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

## 相关内容 \\{#related\\}

- [Dictionary 引擎](/engines/table-engines/special/dictionary)
