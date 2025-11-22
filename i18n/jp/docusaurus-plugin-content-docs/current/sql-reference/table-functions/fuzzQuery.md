---
description: '指定されたクエリ文字列にランダムな変化を加えます。'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---



# fuzzQuery テーブル関数

指定されたクエリ文字列にランダムな変化を加えます。



## 構文 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```


## 引数 {#arguments}

| 引数           | 説明                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `query`            | (String) - ファジングを実行する対象のクエリ。                    |
| `max_query_length` | (UInt64) - ファジング処理中にクエリが取り得る最大長。 |
| `random_seed`      | (UInt64) - 安定した結果を生成するためのランダムシード。                    |


## 戻り値 {#returned_value}

摂動を加えたクエリ文字列を含む単一列のテーブルオブジェクト。


## 使用例 {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
