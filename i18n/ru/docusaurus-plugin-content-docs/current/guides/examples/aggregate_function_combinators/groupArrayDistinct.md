---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'Пример использования комбинатора groupArrayDistinct'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---

# groupArrayDistinct {#sumdistinct}

## Описание {#description}

Комбинатор [`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach)
можно применить к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum), чтобы создать массив
различных значений аргументов.

## Пример использования {#example-usage}

В этом примере мы воспользуемся набором данных `hits`, доступным в нашей [SQL‑песочнице](https://sql.clickhouse.com/).

Представьте, что вы хотите узнать, для каждого уникального домена целевой страницы (`URLDomain`) на вашем сайте, какие уникальные коды операционных систем из User Agent (`OS`) были зафиксированы для посетителей, попавших на этот домен. Это может помочь вам понять разнообразие операционных систем, взаимодействующих с разными частями вашего сайта.

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Учитывать только обращения с указанным доменом
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## См. также {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Комбинатор Distinct`](/sql-reference/aggregate-functions/combinators#-distinct)
