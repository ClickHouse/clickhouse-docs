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
'doc_type': 'reference'
---


# groupArrayDistinct {#sumdistinct}

## Description {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，以创建一个包含不同参数值的数组。

## Example usage {#example-usage}

在这个例子中，我们将利用我们 [SQL playground](https://sql.clickhouse.com/) 中可用的 `hits` 数据集。

想象一下，你想要找出你的网站上每个不同的着陆页域名 (`URLDomain`)，对于访问该域名的访客记录的所有独特用户代理操作系统代码 (`OS`)。这将帮助你理解与网站不同部分互动的操作系统的多样性。

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

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
