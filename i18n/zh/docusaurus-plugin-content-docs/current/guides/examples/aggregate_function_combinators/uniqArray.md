---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray 组合器使用示例'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---

# uniqArray \\{#uniqarray\\}

## 描述 \\{#description\\}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器
可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
函数，从而得到 `uniqArray` 聚合组合器函数，用于计算所有数组中唯一元素个数的近似值。

当你需要在数据集中跨多个数组统计唯一元素时，`uniqArray` 函数非常有用。它等同于使用 `uniq(arrayJoin())`，其中 `arrayJoin` 会先将数组展开，然后 `uniq` 再统计唯一元素的数量。

## 示例用法 \\{#example-usage\\}

在这个示例中，我们将使用一个包含不同类别下用户兴趣的样例数据集来演示 `uniqArray` 的工作方式。我们会将它与 `uniq(arrayJoin())` 进行对比，以展示在统计唯一元素数量时的差异。

```sql title="Query"
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

`uniqArray` 函数会统计所有数组合并后不重复元素的数量，类似于 `uniq(arrayJoin())`。
在此示例中：

* `uniqArray` 返回 5，因为在所有用户中一共有 5 个不重复的兴趣：&#39;reading&#39;、&#39;gaming&#39;、&#39;music&#39;、&#39;sports&#39;、&#39;cooking&#39;
* `uniq(arrayJoin())` 也返回 5，说明这两个函数都会在所有数组中统计不重复元素的数量

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 另请参阅 \\{#see-also\\}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
