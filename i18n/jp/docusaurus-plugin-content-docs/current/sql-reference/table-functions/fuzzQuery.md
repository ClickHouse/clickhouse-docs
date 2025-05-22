---
'description': 'Perturbs the given query string with random variations.'
'sidebar_label': 'fuzzQuery'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzQuery'
'title': 'fuzzQuery'
---




# fuzzQuery テーブル関数

与えられたクエリ文字列をランダムなバリエーションで perturb（揺らす）します。

## 構文 {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## 引数 {#arguments}

| 引数               | 説明                                                                         |
|--------------------|------------------------------------------------------------------------------|
| `query`            | (String) - ファジングを実行する元のクエリ。                                    |
| `max_query_length` | (UInt64) - ファジングプロセス中にクエリが取得できる最大長。                  |
| `random_seed`      | (UInt64) - 安定した結果を生成するためのランダムシード。                     |

## 戻り値 {#returned_value}

Perturbed（揺らした）クエリ文字列を含む単一のカラムを持つテーブルオブジェクト。

## 使用例 {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘

