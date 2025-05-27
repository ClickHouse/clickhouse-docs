---
'slug': '/examples/aggregate-function-combinators/avgIf'
'title': 'avgIf'
'description': 'avgIfコンビネータの使用例'
'keywords':
- 'avg'
- 'if'
- 'combinator'
- 'examples'
- 'avgIf'
'sidebar_label': 'avgIf'
---




# avgIf {#avgif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用することで、条件が真である行の値の算術平均を計算するために `avgIf` 集約コンビネータ関数を使用できます。

## 例の使用法 {#example-usage}

この例では、成功フラグを持つ販売データを格納するテーブルを作成し、`avgIf` を使用して成功したトランザクションの平均販売額を計算します。

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

`avgIf` 関数は、`is_successful = 1` の行についてのみ平均額を計算します。
この場合、金額は 100.50, 200.75, 300.00, 175.25 の平均を取ります。

```response title="応答"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## 参照 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
