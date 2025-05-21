---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'anyIf コマンビネーターの使用例'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
---


# anyIf {#avgif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コマンビネーターは、与えられたカラムから条件に一致する最初の要素を選択するために、[`any`](/sql-reference/aggregate-functions/reference/any) 集約関数に適用することができます。

## 使用例 {#example-usage}

この例では、成功フラグを含む売上データを格納するテーブルを作成し、`anyIf` を使用して、金額が 200 を超えるおよび 200 未満の最初の `transaction_id` を選択します。

まず、テーブルを作成し、データを挿入します：

```sql title="クエリ"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) 
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO sales VALUES
    (1, 100.00, 1),
    (2, 150.00, 1),
    (3, 155.00, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);
```

```sql
SELECT
    anyIf(transaction_id, amount < 200) as tid_lt_200,
    anyIf(transaction_id, amount > 200) as tid_gt_200
FROM sales;
```

```response title="レスポンス"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```

## その他の情報 {#see-also}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If コマンビネーター`](/sql-reference/aggregate-functions/combinators#-if)
