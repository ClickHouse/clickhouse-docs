---
description: 'HAVING 句に関するドキュメント'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'HAVING 句'
doc_type: 'reference'
---

# HAVING 句 {#having-clause}

[GROUP BY](/sql-reference/statements/select/group-by) によって生成された集約結果をフィルタリングするために使用します。[WHERE](../../../sql-reference/statements/select/where.md) 句と似ていますが、`WHERE` が集約の前に適用されるのに対し、`HAVING` は集約の後に適用される点が異なります。

`HAVING` 句では、`SELECT` 句で定義したエイリアスを使用して集約結果を参照できます。あるいは、クエリ結果としては返されない追加の集約結果を対象にフィルタリングを行うこともできます。

## 例 {#example}

次のような `sales` テーブルがあるとします。

```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```

次のようにクエリを実行できます：

```sql
SELECT
    region,
    salesperson,
    sum(amount) AS total_sales
FROM sales
GROUP BY
    region,
    salesperson
HAVING total_sales > 10000
ORDER BY total_sales DESC;
```

これは、各地域における合計売上額が 10,000 を超える営業担当者を一覧表示します。

## 制限事項 {#limitations}

集計が行われていない場合、`HAVING` は使用できません。代わりに `WHERE` を使用してください。
