---
description: '将多个数组聚合成一个由这些数组构成的更大数组。'
keywords: ['groupArrayArray', 'array_concat_agg']
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/grouparrayarray
title: 'groupArrayArray'
doc_type: 'reference'
---

# groupArrayArray

将多个数组聚合为一个由这些数组组成的更大数组。
将 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 函数与 [Array](/sql-reference/aggregate-functions/combinators#-array) 组合器结合使用。

别名：`array_concat_agg`

**示例**

我们有一份用于记录用户浏览会话的数据。每个会话记录了某个特定用户访问页面的顺序。
我们可以使用 `groupArrayArray` 函数来分析每个用户的页面访问模式。

```sql title="Setup"
CREATE TABLE 网站访问 (
    用户ID UInt32,
    会话ID UInt32,
    页面访问 Array(String)
) ENGINE = Memory;

INSERT INTO 网站访问 VALUES
(101, 1, ['首页', '产品', '结账']),
(101, 2, ['搜索', '产品详情', '联系我们']),
(102, 1, ['首页', '关于我们']),
(101, 3, ['博客', '首页']),
(102, 2, ['产品', '产品详情', '添加到购物车', '结账']);
```

```sql title="Query"
SELECT
    user_id,
    groupArrayArray(page_visits) AS user_session_page_sequences
FROM website_visits
GROUP BY user_id;
```

```sql title="Response"
   ┌─user_id─┬─user_session_page_sequences───────────────────────────────────────────────────────────────┐
1. │     101 │ ['homepage','products','checkout','search','product_details','contact','blog','homepage'] │
2. │     102 │ ['homepage','about_us','products','product_details','add_to_cart','checkout']             │
   └─────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
```
