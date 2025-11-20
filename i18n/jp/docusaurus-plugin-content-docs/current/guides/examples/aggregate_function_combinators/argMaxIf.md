---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'argMaxIf コンビネーターの使用例'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---



# argMaxIf {#argmaxif}


## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータを[`argMax`](/sql-reference/aggregate-functions/reference/argmax)関数に適用することで、条件が真である行において`val`の最大値に対応する`arg`の値を求めることができます。これには`argMaxIf`集約コンビネータ関数を使用します。

`argMaxIf`関数は、データセット内で最大値に関連付けられた値を求める必要があるものの、特定の条件を満たす行のみを対象としたい場合に有用です。


## 使用例 {#example-usage}

この例では、製品売上のサンプルデータセットを使用して `argMaxIf` の動作を実演します。最高価格の製品名を検索しますが、対象は少なくとも10回販売された製品のみとします。

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
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 関数は、少なくとも10回販売された全製品（sales_count >= 10）の中で最高価格の製品名を返します。この場合、人気製品の中で最高価格（999.99）であるため、'Laptop' が返されます。

```response title="レスポンス"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```


## 関連項目 {#see-also}

- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
