---
'slug': '/examples/aggregate-function-combinators/groupArrayDistinct'
'title': 'groupArrayDistinct'
'description': '使用 groupArrayDistinct 组合器的示例'
'keywords':
- 'groupArray'
- 'Distinct'
- 'combinator'
- 'examples'
- 'groupArrayDistinct'
'sidebar_label': 'groupArrayDistinct'
---


# groupArrayDistinct {#sumdistinct}

## 描述 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，以创建一个包含不同参数值的数组。

## 示例用法 {#example-usage}

在这个例子中，我们将使用在我们的 [SQL playground](https://sql.clickhouse.com/) 中可用的 `hits` 数据集。

想象一下，你想要找出你的网站上每个独特的登录页面域名 (`URLDomain`) 对应的所有唯一的用户代理操作系统代码 (`OS`)，这些记录是为了了解访问该域名的访客所使用的操作系统类型。这将帮助你理解与网站不同部分交互的操作系统的多样性。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Consider only hits with a recorded domain
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## 另请参见 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
