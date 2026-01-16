---
description: '对给定的查询字符串进行随机变换。'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---

# fuzzQuery 表函数 \\{#fuzzquery-table-function\\}

对给定的查询字符串进行随机扰动，生成不同的变体。

## 语法 \\{#syntax\\}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 参数 \\{#arguments\\}

| 参数               | 描述                                                                 |
|--------------------|----------------------------------------------------------------------|
| `query`            | (String) - 要执行模糊测试的源查询语句。                              |
| `max_query_length` | (UInt64) - 查询语句在模糊测试过程中可能达到的最大长度。             |
| `random_seed`      | (UInt64) - 用于生成稳定测试结果的随机种子。                         |

## 返回值 \\{#returned_value\\}

一个具有单个列的表对象，该列中包含扰动后的查询字符串。

## 使用示例 \\{#usage-example\\}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
