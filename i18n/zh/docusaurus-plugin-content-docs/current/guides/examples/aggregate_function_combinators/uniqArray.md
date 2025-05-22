
# uniqArray {#uniqarray}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数，以计算所有数组中唯一元素的大致数量，使用 `uniqArray` 聚合组合器函数。

当您需要在数据集中的多个数组中计算唯一元素时，`uniqArray` 函数非常有用。它等同于使用 `uniq(arrayJoin())`，其中 `arrayJoin` 首先扁平化数组，然后 `uniq` 计算唯一元素。

## 示例用法 {#example-usage}

在这个示例中，我们将使用一个用户兴趣的示例数据集，涵盖不同的类别，以演示 `uniqArray` 的工作原理。我们将其与 `uniq(arrayJoin())` 进行比较，以显示计算唯一元素的差异。

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

`uniqArray` 函数计算所有数组合并后的唯一元素，类似于 `uniq(arrayJoin())`。在这个例子中：
- `uniqArray` 返回 5，因为在所有用户中有 5 个唯一兴趣：'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` 也返回 5，显示两个函数在计算所有数组中的唯一元素时是一致的。

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
