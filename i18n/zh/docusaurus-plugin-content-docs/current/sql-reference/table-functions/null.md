---
description: '使用 Null 表引擎创建具有指定结构的临时表。该函数用于便于编写测试和进行演示。'
sidebar_label: 'null 函数'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---



# null 表函数 {#null-table-function}

使用 [Null](../../engines/table-engines/special/null.md) 表引擎创建具有指定结构的临时表。根据 `Null` 引擎的特性，表数据会被忽略，并且该表会在查询执行完成后立即被删除。该函数用于方便编写测试和进行演示。



## 语法 {#syntax}

```sql
null('structure')
```


## 参数 {#argument}

- `structure` — 列及其类型的列表。[String](../../sql-reference/data-types/string.md)。



## 返回值 {#returned_value}

具有指定结构的临时 `Null` 引擎表。



## 示例 {#example}

使用 `null` 函数的查询：

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```

可以替代以下三个查询：

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```


## 相关 {#related}

- [Null 表引擎](../../engines/table-engines/special/null.md)
