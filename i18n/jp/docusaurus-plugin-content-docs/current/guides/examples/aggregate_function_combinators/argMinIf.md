---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'argMinIf コンビネータの使用例'
keywords: ['argMin', 'if', 'コンビネータ', '例', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---

# argMinIf \\{#argminif\\}

## 説明 \\{#description\\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`argMin`](/sql-reference/aggregate-functions/reference/argmin)
関数に適用することで、条件が真となる行について `val` の最小値に対応する `arg` の値を求めることができます。この処理には `argMinIf` 集約コンビネータ関数を使用します。

`argMinIf` 関数は、データセット内で最小値に対応する値を特定する必要があるものの、
特定の条件を満たす行に限定してそれを行いたい場合に有用です。

## 使用例 \\{#example-usage\\}

この例では、商品価格とそのタイムスタンプを格納するテーブルを作成し、
在庫がある場合に各商品の最安値を求めるために `argMinIf` を使用します。

```sql title="Query"
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

`argMinIf` 関数は、`in_stock = 1` の行のみを対象に、各商品について最も早いタイムスタンプに対応する price を求めます。例えば次のとおりです。

* 商品 1: 在庫ありの行の中では、10.99 のタイムスタンプが最も早い (10:00:00)
* 商品 2: 在庫ありの行の中では、20.99 のタイムスタンプが最も早い (11:00:00)

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## 関連項目 \\{#see-also\\}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If コンビネータ`](/sql-reference/aggregate-functions/combinators#-if)
