---
description: '指定されたクエリ文字列にランダムな変化を加えます。'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---

# fuzzQuery テーブル関数 \{#fuzzquery-table-function\}

指定されたクエリ文字列にランダムなゆらぎを与えます。

## 構文 \{#syntax\}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 引数 \{#arguments\}

| 引数               | 説明                                                                          |
|--------------------|-------------------------------------------------------------------------------|
| `query`            | (String) - ファジングの対象となるソースクエリ。                               |
| `max_query_length` | (UInt64) - ファジング処理中にクエリが取り得る最大長。                         |
| `random_seed`      | (UInt64) - 安定した結果を得るために使用する乱数シード。                       |

## 返される値 \{#returned_value\}

摂動が加えられたクエリ文字列を 1 列だけ含むテーブルオブジェクト。

## 使用例 \{#usage-example\}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
