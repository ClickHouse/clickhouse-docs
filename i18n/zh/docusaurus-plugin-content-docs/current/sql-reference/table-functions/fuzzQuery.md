
# fuzzQuery 表函数

扰动给定的查询字符串，产生随机变体。

## 语法 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 参数 {#arguments}

| 参数               | 描述                                                                   |
|--------------------|------------------------------------------------------------------------|
| `query`            | (字符串) - 进行扰动的源查询。                                          |
| `max_query_length` | (UInt64) - 查询在扰动过程中可以达到的最大长度。                      |
| `random_seed`      | (UInt64) - 用于生成稳定结果的随机种子。                              |

## 返回值 {#returned_value}

一个表对象，包含一个列，其中包含扰动的查询字符串。

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
