---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: '使用 groupArrayDistinct 组合器的示例'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---



# groupArrayDistinct {#sumdistinct}


## 描述 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数,用于创建包含去重参数值的数组。


## 使用示例 {#example-usage}

在此示例中,我们将使用 [SQL playground](https://sql.clickhouse.com/) 中提供的 `hits` 数据集。

假设您想要查询网站上每个不同着陆页域名(`URLDomain`)下,访问该域名的访客所记录的所有唯一用户代理操作系统代码(`OS`)。这可以帮助您了解与网站不同部分交互的操作系统的多样性。

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


## 另请参阅 {#see-also}

- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct 组合器`](/sql-reference/aggregate-functions/combinators#-distinct)
