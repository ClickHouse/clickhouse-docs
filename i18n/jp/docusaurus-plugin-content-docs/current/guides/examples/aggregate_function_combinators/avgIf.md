---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'avgIf コルビネータを使用した例'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
---


# avgIf {#avgif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コルビネータは、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することができ、条件が真である行の値の算術平均を計算します。これを使用して `avgIf` 集約コルビネータ関数を使用します。

## 例の使用法 {#example-usage}

この例では、成功フラグを持つ販売データを格納するテーブルを作成し、成功したトランザクションの平均販売額を計算するために `avgIf` を使用します。

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
    avgIf(amount, is_successful = 1) as avg_successful_sale
FROM sales;
```

`avgIf` 関数は、`is_successful = 1` である行のみに対して平均額を計算します。この場合、平均額は次の値になります：100.50, 200.75, 300.00, および 175.25。

```response title="レスポンス"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If コルビネータ`](/sql-reference/aggregate-functions/combinators#-if)
