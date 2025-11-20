---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'anyIf コンビネーターの使用例'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
doc_type: 'reference'
---



# anyIf {#avgif}


## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータを[`any`](/sql-reference/aggregate-functions/reference/any)集約関数に適用することで、指定された条件に一致する指定カラムから最初に検出された要素を選択できます。


## 使用例 {#example-usage}

この例では、成功フラグを持つ売上データを格納するテーブルを作成し、
`anyIf` を使用して金額が200より大きい場合と小さい場合の最初の `transaction_id` を選択します。

まず、テーブルを作成してデータを挿入します:

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
    anyIf(transaction_id, amount < 200) AS tid_lt_200,
    anyIf(transaction_id, amount > 200) AS tid_gt_200
FROM sales;
```

```response title="レスポンス"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```


## 関連項目 {#see-also}

- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
