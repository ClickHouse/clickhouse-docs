---
'slug': '/examples/aggregate-function-combinators/avgIf'
'title': 'avgIf'
'description': 'avgIf コンビネータを使用する例'
'keywords':
- 'avg'
- 'if'
- 'combinator'
- 'examples'
- 'avgIf'
'sidebar_label': 'avgIf'
'doc_type': 'reference'
---


# avgIf {#avgif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、条件が真である行の値の算術平均を計算するために、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用できます。これを使用して、`avgIf` 集計コンビネータ関数を利用します。

## 使用例 {#example-usage}

この例では、成功フラグを持つ販売データを保存するテーブルを作成し、成功したトランザクションの平均売上金額を計算するために `avgIf` を使用します。

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

`avgIf` 関数は、`is_successful = 1` の行のみの平均金額を計算します。この場合、平均を取る金額は 100.50、200.75、300.00、および 175.25 になります。

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
