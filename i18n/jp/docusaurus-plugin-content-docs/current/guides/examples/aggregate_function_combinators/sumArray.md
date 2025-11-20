---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'sumArray コンビネーターの使用例'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
doc_type: 'reference'
---



# sumArray {#sumarray}


## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array)コンビネータを[`sum`](/sql-reference/aggregate-functions/reference/sum)関数に適用することで、`sumArray`集約コンビネータ関数を使用して配列内のすべての要素の合計を計算できます。

`sumArray`関数は、データセット内の複数の配列に含まれるすべての要素の合計を計算する必要がある場合に便利です。


## 使用例 {#example-usage}

この例では、異なる製品カテゴリごとの日次売上のサンプルデータセットを使用して、`sumArray`の動作を説明します。各日のすべてのカテゴリの合計売上を計算します。

```sql title="クエリ"
CREATE TABLE daily_category_sales
(
    date Date,
    category_sales Array(UInt32)
) ENGINE = Memory;

INSERT INTO daily_category_sales VALUES
    ('2024-01-01', [100, 200, 150]),
    ('2024-01-02', [120, 180, 160]),
    ('2024-01-03', [90, 220, 140]);

SELECT
    date,
    category_sales,
    sumArray(category_sales) AS total_sales_sumArray,
    sum(arraySum(category_sales)) AS total_sales_arraySum
FROM daily_category_sales
GROUP BY date, category_sales;
```

`sumArray`関数は、各`category_sales`配列内のすべての要素を合計します。
例えば、`2024-01-01`では、`100 + 200 + 150 = 450`を合計します。これは`arraySum`と同じ結果になります。


## 関連項目 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
