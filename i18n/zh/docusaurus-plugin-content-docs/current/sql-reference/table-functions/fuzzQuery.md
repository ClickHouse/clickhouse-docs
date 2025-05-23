---
'description': '对给定的查询字符串进行随机变动。'
'sidebar_label': 'fuzzQuery'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzQuery'
'title': 'fuzzQuery'
---


# fuzzQuery 表函数

对给定的查询字符串进行随机变化。

## 语法 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 参数 {#arguments}

| 参数               | 描述                                                                       |
|--------------------|-----------------------------------------------------------------------------|
| `query`            | (String) - 要进行模糊处理的源查询。                                         |
| `max_query_length` | (UInt64) - 在模糊处理过程中查询所能达到的最大长度。                       |
| `random_seed`      | (UInt64) - 用于生成稳定结果的随机种子。                                   |

## 返回值 {#returned_value}

一个包含扰动查询字符串的单列表对象。

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
