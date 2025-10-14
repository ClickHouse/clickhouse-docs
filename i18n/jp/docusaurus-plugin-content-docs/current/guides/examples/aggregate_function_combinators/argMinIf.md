---
'slug': '/examples/aggregate-function-combinators/argMinIf'
'title': 'argMinIf'
'description': 'argMinIfコンビネータを使用した例'
'keywords':
- 'argMin'
- 'if'
- 'combinator'
- 'examples'
- 'argMinIf'
'sidebar_label': 'argMinIf'
'doc_type': 'reference'
---


# argMinIf {#argminif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`argMin`](/sql-reference/aggregate-functions/reference/argmin) 関数に適用して、条件が真である行に対して、`val` の最小値に対応する `arg` の値を見つけるために、`argMinIf` 集約コンビネータ関数を使用します。

`argMinIf` 関数は、特定の条件を満たす行のみについて、データセット内の最小値に関連する値を見つける必要があるときに便利です。

## 使用例 {#example-usage}

この例では、製品の価格とそのタイムスタンプを保存するテーブルを作成し、`argMinIf` を使用して在庫がある場合の各製品の最安価格を見つけます。

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

`argMinIf` 関数は、`in_stock = 1` の行のみを考慮した場合の各製品の最も早いタイムスタンプに対応する価格を見つけます。例えば：
- 製品 1: 在庫のある行の中で、10.99 が最も早いタイムスタンプ (10:00:00) を持っています。
- 製品 2: 在庫のある行の中で、20.99 が最も早いタイムスタンプ (11:00:00) を持っています。

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## その他参照 {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
