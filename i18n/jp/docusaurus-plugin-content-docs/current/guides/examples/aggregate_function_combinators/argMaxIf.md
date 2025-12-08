---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'argMaxIf コンビネータの使用例'
keywords: ['argMax', 'if', 'コンビネータ', '例', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---

# argMaxIf {#argmaxif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、[`argMax`](/sql-reference/aggregate-functions/reference/argmax)
関数に適用して、条件が真である行のうち `val` の値が最大となる行に対応する `arg` の値を、
`argMaxIf` 集約コンビネータ関数を使って求めることができます。

`argMaxIf` 関数は、データセット内で最大値に対応する値を見つける必要があるが、
特定の条件を満たす行のみを対象にしたい場合に便利です。

## 使用例 {#example-usage}

この例では、製品売上のサンプルデータセットを使用して `argMaxIf` の動作を示します。少なくとも 10 回販売された製品のみを対象に、その中で最も価格の高い製品名を求めます。

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

`argMaxIf` 関数は、少なくとも 10 回販売されたすべての商品（sales&#95;count &gt;= 10）の中から、価格が最も高い商品の名前を返します。
この場合、人気のある商品の中で最も価格が高い（999.99）ため、&#39;Laptop&#39; が返されます。

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 関連項目 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If コンビネータ`](/sql-reference/aggregate-functions/combinators#-if)
