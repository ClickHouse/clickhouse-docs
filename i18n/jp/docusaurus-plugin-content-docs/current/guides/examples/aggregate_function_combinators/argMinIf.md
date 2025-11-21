---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'argMinIf コンビネータの使用例'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---



# argMinIf {#argminif}


## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータを[`argMin`](/sql-reference/aggregate-functions/reference/argmin)関数に適用することで、条件が真である行において、`val`の最小値に対応する`arg`の値を求めることができます。これには`argMinIf`集約コンビネータ関数を使用します。

`argMinIf`関数は、データセット内の最小値に関連付けられた値を求める必要があるものの、特定の条件を満たす行のみを対象としたい場合に有用です。


## 使用例 {#example-usage}

この例では、商品価格とそのタイムスタンプを格納するテーブルを作成し、
`argMinIf`を使用して各商品が在庫ありの場合の最低価格を見つけます。

```sql title="クエリ"
CREATE TABLE product_prices(
    product_id UInt32,
    price Decimal(10,2),
    timestamp DateTime,
    in_stock UInt8
) ENGINE = Log;

INSERT INTO product_prices VALUES
    (1, 10.99, '2024-01-01 10:00:00', 1),
    (1, 9.99, '2024-01-01 10:05:00', 1),
    (1, 11.99, '2024-01-01 10:10:00', 0),
    (2, 20.99, '2024-01-01 11:00:00', 1),
    (2, 19.99, '2024-01-01 11:05:00', 1),
    (2, 21.99, '2024-01-01 11:10:00', 1);

SELECT
    product_id,
    argMinIf(price, timestamp, in_stock = 1) AS lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

`argMinIf`関数は、各商品について最も早いタイムスタンプに対応する価格を見つけますが、
`in_stock = 1`の行のみを考慮します。例:

- 商品1: 在庫ありの行の中で、10.99が最も早いタイムスタンプ(10:00:00)を持つ
- 商品2: 在庫ありの行の中で、20.99が最も早いタイムスタンプ(11:00:00)を持つ

```response title="レスポンス"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```


## 関連項目 {#see-also}

- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
