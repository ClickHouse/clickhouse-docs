---
'description': '使用 Null 表引擎创建指定结构的临时表。该函数用于方便测试编写和演示。'
'sidebar_label': 'null 函数'
'sidebar_position': 140
'slug': '/sql-reference/table-functions/null'
'title': 'null'
'doc_type': 'reference'
---


# null 表函数

创建一个具有指定结构的临时表，使用 [Null](../../engines/table-engines/special/null.md) 表引擎。根据 `Null` 引擎的特性，表数据将被忽略，并且在查询执行后，表会立即被删除。此函数用于方便测试编写和演示。

## 语法 {#syntax}

```sql
null('structure')
```

## 参数 {#argument}

- `structure` — 列及列类型的列表。 [String](../../sql-reference/data-types/string.md)。

## 返回值 {#returned_value}

具有指定结构的临时 `Null` 引擎表。

## 示例 {#example}

使用 `null` 函数的查询：

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
可以替代三个查询：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

## 相关 {#related}

- [Null 表引擎](../../engines/table-engines/special/null.md)
