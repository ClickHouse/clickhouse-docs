---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'avgIf コンビネータの使用例'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---



# avgIf {#avgif}



## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することで、`avgIf` 集約コンビネータ関数を使い、条件が真である行の値の算術平均を計算できます。



## 使用例

この例では、成功フラグを含む売上データを格納するテーブルを作成し、
`avgIf` を使用して、成功したトランザクションの平均売上額を計算します。

```sql title="Query"
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

`avgIf` 関数は、`is_successful = 1` の行に対してのみ平均値を計算します。
この場合、100.50、200.75、300.00、175.25 の金額の平均を算出します。

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```


## 関連項目 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
