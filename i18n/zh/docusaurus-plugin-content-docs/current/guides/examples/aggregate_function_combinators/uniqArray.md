---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': 'Example of using the uniqArray combinator'
'keywords':
- 'uniq'
- 'array'
- 'combinator'
- 'examples'
- 'uniqArray'
'sidebar_label': 'uniqArray'
---




# uniqArray {#uniqarray}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数，用于计算所有数组中唯一元素的近似数量，使用 `uniqArray` 聚合组合器函数。

`uniqArray` 函数在您需要计算数据集中多个数组中的唯一元素时非常有用。它相当于使用 `uniq(arrayJoin())`，其中 `arrayJoin` 首先将数组扁平化，然后 `uniq` 计算唯一元素的数量。

## 示例用法 {#example-usage}

在这个示例中，我们将使用一个用户兴趣的样本数据集，这些兴趣分布在不同的类别中，以演示 `uniqArray` 的工作原理。我们将其与 `uniq(arrayJoin())` 进行比较，以显示在计数唯一元素时的差异。

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
    uniqArray(interests) as unique_interests_total,
    uniq(arrayJoin(interests)) as unique_interests_arrayJoin
FROM user_interests;
```

`uniqArray` 函数计算所有数组中组合的唯一元素，类似于 `uniq(arrayJoin())`。在这个示例中：
- `uniqArray` 返回 5，因为所有用户中有 5 个独特的兴趣：'reading'、'gaming'、'music'、'sports'、'cooking'
- `uniq(arrayJoin())` 也返回 5，表明这两个函数都计算所有数组中的唯一元素

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
