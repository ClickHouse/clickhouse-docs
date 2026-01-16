---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinct 聚合函数组合子使用示例'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---

# groupArrayDistinct \\{#sumdistinct\\}

## 描述 \\{#description\\}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器
可以应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，以创建一个由唯一参数值组成的数组。

## 示例用法 \\{#example-usage\\}

在本示例中，我们将使用在我们的 [SQL playground](https://sql.clickhouse.com/) 中提供的 `hits` 数据集。

假设你想要了解：对于你网站上每一个不同的着陆页域名（`URLDomain`），访问该域名的访客记录到的所有唯一 User Agent 操作系统代码（`OS`）分别有哪些。这可以帮助你了解有哪些不同的操作系统在访问你站点的各个部分。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- 仅考虑记录了域名的点击
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## 另请参阅 \\{#see-also\\}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct 组合器`](/sql-reference/aggregate-functions/combinators#-distinct)
