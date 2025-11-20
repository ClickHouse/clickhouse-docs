---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray 组合器使用示例'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---



# uniqArray {#uniqarray}


## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器可应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数,通过 `uniqArray` 聚合组合器函数计算所有数组中不重复元素的近似数量。

当需要统计数据集中多个数组的不重复元素时,`uniqArray` 函数非常实用。它等同于使用 `uniq(arrayJoin())`,其中 `arrayJoin` 先将数组展平,然后 `uniq` 对不重复元素进行计数。


## 使用示例 {#example-usage}

在本示例中,我们将使用一个包含不同类别用户兴趣的样本数据集来演示 `uniqArray` 的工作原理。我们会将它与 `uniq(arrayJoin())` 进行比较,以展示在统计唯一元素时的差异。

```sql title="查询"
CREATE TABLE user_interests
(
    user_id UInt32,
    interests Array(String)
) ENGINE = Memory;

INSERT INTO user_interests VALUES
    (1, ['reading', 'gaming', 'music']),
    (2, ['gaming', 'sports', 'music']),
    (3, ['reading', 'cooking']);

SELECT
    uniqArray(interests) AS unique_interests_total,
    uniq(arrayJoin(interests)) AS unique_interests_arrayJoin
FROM user_interests;
```

`uniqArray` 函数统计所有数组合并后的唯一元素数量,类似于 `uniq(arrayJoin())`。
在本示例中:

- `uniqArray` 返回 5,因为所有用户的兴趣中共有 5 个唯一值:'reading'、'gaming'、'music'、'sports'、'cooking'
- `uniq(arrayJoin())` 同样返回 5,说明两个函数都能统计所有数组中的唯一元素

```response title="响应"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```


## 另请参阅 {#see-also}

- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
