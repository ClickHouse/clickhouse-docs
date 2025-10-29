---
'slug': '/examples/aggregate-function-combinators/argMaxIf'
'title': 'argMaxIf'
'description': 'argMaxIf コンビネータを使用した例'
'keywords':
- 'argMax'
- 'if'
- 'combinator'
- 'examples'
- 'argMaxIf'
'sidebar_label': 'argMaxIf'
'doc_type': 'reference'
---


# argMaxIf {#argmaxif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`argMax`](/sql-reference/aggregate-functions/reference/argmax) 関数に適用して、条件が真である行に対する `val` の最大値に対応する `arg` の値を見つけるために、`argMaxIf` 集約コンビネータ関数を使用します。

`argMaxIf` 関数は、特定の条件を満たす行のみのデータセット内で最大値に関連する値を見つける必要がある場合に便利です。

## 使用例 {#example-usage}

この例では、製品の販売に関するサンプルデータセットを使用して、`argMaxIf` の動作を示します。販売回数が少なくとも10回の製品に対して、最も高い価格を持つ製品名を見つけます。

```sql title="Query"
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
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 関数は、販売回数が少なくとも10回 (sales_count >= 10) のすべての製品の中で、最も高い価格を持つ製品名を返します。この場合、人気のある製品の中で最も高い価格 (999.99) を持つ 'Laptop' を返します。

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 参照 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
