
# groupArrayDistinct {#sumdistinct}

## 描述 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，以创建一个包含不同参数值的数组。

## 示例用法 {#example-usage}

在这个例子中，我们将利用我们 [SQL playground](https://sql.clickhouse.com/) 中可用的 `hits` 数据集。

想象一下，您想了解，在您的网站上，每个不同的登录页面域名 (`URLDomain`) 上记录的所有唯一用户代理操作系统代码 (`OS`)。这可以帮助您理解与您网站不同部分互动的操作系统的多样性。

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

## 另请参阅 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
