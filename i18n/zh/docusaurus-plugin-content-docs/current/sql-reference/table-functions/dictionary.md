---
'description': '以 ClickHouse 表格的形式显示字典数据。与 Dictionary 引擎的工作方式相同。'
'sidebar_label': '字典'
'sidebar_position': 47
'slug': '/sql-reference/table-functions/dictionary'
'title': '字典'
'doc_type': 'reference'
---


# dictionary 表函数

将 [字典](../../sql-reference/dictionaries/index.md) 数据显示为 ClickHouse 表。其工作方式与 [Dictionary](../../engines/table-engines/special/dictionary.md) 引擎相同。

## 语法 {#syntax}

```sql
dictionary('dict')
```

## 参数 {#arguments}

- `dict` — 字典名称。 [字符串](../../sql-reference/data-types/string.md)。

## 返回值 {#returned_value}

一个 ClickHouse 表。

## 示例 {#examples}

输入表 `dictionary_source_table`：

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

创建字典：

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

## 相关 {#related}

- [字典引擎](/engines/table-engines/special/dictionary)
