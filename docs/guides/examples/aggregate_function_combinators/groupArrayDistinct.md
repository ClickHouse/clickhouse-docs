---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'Example of using the groupArrayDistinct combinator'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
---

# groupArrayDistinct {#sumdistinct}

## Description {#description}

The [`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) combinator
can be applied to the [`groupArray`](/sql-reference/aggregate-functions/reference/sum) aggregate function to create an array
of distinct argument values.

## Example usage {#example-usage}

For this example we'll make use of the `hits` dataset available in our [SQL playground](https://sql.clickhouse.com/).

Imagine you want to find out, for each distinct landing page domain (`URLDomain`)
on your website, what are all the unique User Agent OS codes (`OS`) recorded for
visitors landing on that domain. This could help you understand the variety of 
operating systems interacting with different parts of your site.

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
