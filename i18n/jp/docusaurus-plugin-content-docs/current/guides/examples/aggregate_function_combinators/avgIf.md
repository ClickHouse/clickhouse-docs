---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'avgIf 結合子の使用例'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---



# avgIf {#avgif}


## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータを [`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することで、条件が真となる行の値の算術平均を計算できます。これには `avgIf` 集約コンビネータ関数を使用します。


## 使用例 {#example-usage}

この例では、成功フラグを持つ売上データを格納するテーブルを作成し、
`avgIf`を使用して成功したトランザクションの平均売上額を計算します。

```sql title="クエリ"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

`avgIf`関数は、`is_successful = 1`の行のみを対象に平均額を計算します。
この場合、100.50、200.75、300.00、175.25の金額の平均が計算されます。

```response title="レスポンス"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```


## 関連項目 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
