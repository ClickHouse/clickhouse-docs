---
'slug': '/examples/aggregate-function-combinators/argMaxIf'
'title': 'argMaxIf'
'description': 'argMaxIf combinatorの使用例'
'keywords':
- 'argMax'
- 'if'
- 'combinator'
- 'examples'
- 'argMaxIf'
'sidebar_label': 'argMaxIf'
---




# argMaxIf {#argmaxif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネーターは、[`argMax`](/sql-reference/aggregate-functions/reference/argmax) 関数に適用して、条件が真である行の `val` の最大値に対応する `arg` の値を見つけるために、`argMaxIf` 集約コンビネータ関数を使用できます。

`argMaxIf` 関数は、特定の条件を満たす行のみのデータセット内の最大値に関連付けられた値を見つける必要があるときに便利です。

## 使用例 {#example-usage}

この例では、製品販売のサンプルデータセットを使用して、`argMaxIf` の動作を説明します。販売数が10回以上の製品の中で、最も高い価格の製品名を見つけます。

```sql title="クエリ"
CREATE TABLE product_sales
(
    product_name String,
    price Decimal32(2),
    sales_count UInt32
) ENGINE = Memory;

INSERT INTO product_sales VALUES
    ('Laptop', 999.99, 10),
    ('Phone', 499.99, 15),
    ('Tablet', 299.99, 0),
    ('Watch', 199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) as most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 関数は、販売数が10回以上のすべての製品の中で最も高い価格の製品名を返します（sales_count >= 10）。この場合、人気のある製品の中で最高価格（999.99）のため 'Laptop' を返します。

```response title="レスポンス"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 参照 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
