---
description: '对给定的查询字符串进行随机扰动。'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---



# fuzzQuery 表函数

对给定的查询字符串施加随机扰动。



## 语法 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```


## 参数 {#arguments}

| 参数               | 描述                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `query`            | (String) - 执行模糊测试的源查询语句。                                      |
| `max_query_length` | (UInt64) - 模糊测试过程中查询语句可达到的最大长度。                        |
| `random_seed`      | (UInt64) - 用于生成稳定结果的随机数种子。                                  |


## 返回值 {#returned_value}

返回一个包含单列的表对象,该列存储经过扰动处理的查询字符串。


## 使用示例 {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
