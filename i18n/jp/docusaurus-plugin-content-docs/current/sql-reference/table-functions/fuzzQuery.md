---
'description': '与给定的查询字符串进行随机变化。'
'sidebar_label': 'fuzzQuery'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzQuery'
'title': 'fuzzQuery'
'doc_type': 'reference'
---


# fuzzQuery テーブル関数

指定されたクエリ文字列をランダムな変化で変動させます。

## 構文 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 引数 {#arguments}

| 引数                | 説明                                                                         |
|---------------------|------------------------------------------------------------------------------|
| `query`             | (文字列) - ファジングを行う元のクエリ。                                           |
| `max_query_length`  | (UInt64) - ファジングプロセス中にクエリが取得できる最大長。                   |
| `random_seed`       | (UInt64) - 安定した結果を生成するためのランダムシード。                        |

## 戻り値 {#returned_value}

変動したクエリ文字列を含む単一カラムのテーブルオブジェクト。

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
