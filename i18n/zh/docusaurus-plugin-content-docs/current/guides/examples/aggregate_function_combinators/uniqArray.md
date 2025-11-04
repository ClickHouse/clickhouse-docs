---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': '使用 uniqArray 组合器的示例'
'keywords':
- 'uniq'
- 'array'
- 'combinator'
- 'examples'
- 'uniqArray'
'sidebar_label': 'uniqArray'
'doc_type': 'reference'
---


# uniqArray {#uniqarray}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器 
可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
函数，以计算所有数组中唯一元素的近似数量，使用 `uniqArray` 聚合组合器函数。

当你需要在数据集中计算多个数组中的唯一元素时，`uniqArray` 函数非常有用。它相当于使用 `uniq(arrayJoin())`，其中 `arrayJoin` 首先将数组扁平化，然后 `uniq` 计算唯一元素的数量。

## 示例用法 {#example-usage}

在这个例子中，我们将使用一个关于用户在不同类别中兴趣的示例数据集来演示 `uniqArray` 的工作原理。我们将其与 `uniq(arrayJoin())` 进行比较，以显示在计算唯一元素时的区别。

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

`uniqArray` 函数计算所有合并数组中的唯一元素数量，类似于 `uniq(arrayJoin())`。 
在这个例子中：
- `uniqArray` 返回 5，因为在所有用户中有 5 个独特的兴趣：'reading'（阅读）、'gaming'（游戏）、'music'（音乐）、'sports'（运动）、'cooking'（烹饪）
- `uniq(arrayJoin())` 也返回 5，显示两个函数都计算了所有数组中的唯一元素

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 另请参见 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
