---
description: 'MergeTree テーブル内のテキスト索引用 Dictionary を表します。
  インスペクションに使用できます。'
sidebar_label: 'mergeTreeTextIndex'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeTextIndex
title: 'mergeTreeTextIndex'
doc_type: 'reference'
---

# mergeTreeTextIndex テーブル関数 \{#mergetreetextindex-table-function\}

MergeTree テーブル内のテキスト索引を表す Dictionary です。
トークンとそれぞれのポスティングリストに関するメタデータを返します。
インデックスのインスペクションに利用できます。

## 構文 \{#syntax\}

```sql
mergeTreeTextIndex(database, table, index_name)
```


## 引数 \{#arguments\}

| 引数         | 説明                                         |
|--------------|----------------------------------------------|
| `database`   | テキスト索引を読み込むデータベース名。       |
| `table`      | テキスト索引を読み込むテーブル名。           |
| `index_name` | 読み込むテキスト索引名。                     |

## 返り値 \{#returned_value\}

トークンとそのポスティングリストメタデータを含むテーブルオブジェクト。

## 使用例 \{#usage-example\}

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

結果：

```text
   ┌─part_name─┬─token──┬─dictionary_compression─┬─cardinality─┬─num_posting_blocks─┬─has_embedded_postings─┬─has_raw_postings─┬─has_compressed_postings─┐
1. │ all_1_1_0 │ apple  │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
2. │ all_1_1_0 │ banana │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
3. │ all_2_2_0 │ cherry │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
4. │ all_2_2_0 │ date   │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
   └───────────┴────────┴────────────────────────┴─────────────┴────────────────────┴───────────────────────┴──────────────────┴─────────────────────────┘
```
