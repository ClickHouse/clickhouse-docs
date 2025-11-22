---
description: 'HAVING句に関するドキュメント'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'HAVING句'
doc_type: 'reference'
---



# HAVING 句

[GROUP BY](/sql-reference/statements/select/group-by) によって生成された集約結果をフィルタリングするために使用します。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、`WHERE` は集約の前に実行されるのに対し、`HAVING` は集約の後に実行される点が異なります。

`HAVING` 句では、`SELECT` 句で定義した別名を使って、その集約結果を参照できます。あるいは、クエリ結果としては返さない追加の集約結果を条件にフィルタリングを行うこともできます。



## 例 {#example}

次のような `sales` テーブルがある場合:

```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```


次のようにクエリできます:

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

これにより、地域内の合計売上が10,000を超える営業担当者が一覧表示されます。

## 制限事項 {#limitations}

集計が実行されない場合、`HAVING`は使用できません。代わりに`WHERE`を使用してください。
