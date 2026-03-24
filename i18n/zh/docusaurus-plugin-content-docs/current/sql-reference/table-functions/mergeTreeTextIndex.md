---
description: '表示 MergeTree 表中文本索引的字典。
  可用于内省。'
sidebar_label: 'mergeTreeTextIndex'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeTextIndex
title: 'mergeTreeTextIndex'
doc_type: 'reference'
---

# mergeTreeTextIndex 表函数 \{#mergetreetextindex-table-function\}

表示 MergeTree 表中文本索引的字典。
返回词元及其倒排列表（posting list）元数据。
可用于内部检查与分析。

## 语法 \{#syntax\}

```sql
mergeTreeTextIndex(database, table, index_name)
```


## 参数 \{#arguments\}

| 参数         | 描述                                         |
|--------------|----------------------------------------------|
| `database`   | 要读取文本索引的数据库名称。                 |
| `table`      | 要读取文本索引的表名。                       |
| `index_name` | 要读取的文本索引名称。                       |

## 返回值 \{#returned_value\}

一个包含 token 及其倒排列表（posting list）元数据的表对象。

## 用法示例 \{#usage-example\}

```sql
CREATE TABLE tab
(
    id UInt64,
    s String,
    INDEX idx_s (s) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO tab SELECT number, concatWithSeparator(' ', 'apple', 'banana') FROM numbers(500);
INSERT INTO tab SELECT 500 + number, concatWithSeparator(' ', 'cherry', 'date') FROM numbers(500);

SELECT * FROM mergeTreeTextIndex(currentDatabase(), tab, idx_s);
```

结果：

```text
   ┌─part_name─┬─token──┬─dictionary_compression─┬─cardinality─┬─num_posting_blocks─┬─has_embedded_postings─┬─has_raw_postings─┬─has_compressed_postings─┐
1. │ all_1_1_0 │ apple  │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
2. │ all_1_1_0 │ banana │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
3. │ all_2_2_0 │ cherry │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
4. │ all_2_2_0 │ date   │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
   └───────────┴────────┴────────────────────────┴─────────────┴────────────────────┴───────────────────────┴──────────────────┴─────────────────────────┘
```
