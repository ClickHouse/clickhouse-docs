---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'Пример использования комбинатора groupArrayDistinct'
keywords: ['groupArray', 'Distinct', 'комбинатор', 'примеры', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---



# groupArrayDistinct {#sumdistinct}


## Описание {#description}

Комбинатор [`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach)
может применяться к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum) для создания массива
из уникальных значений аргументов.


## Пример использования {#example-usage}

В этом примере мы будем использовать набор данных `hits`, доступный в нашей [SQL-песочнице](https://sql.clickhouse.com/).

Предположим, вы хотите узнать для каждого уникального домена посадочной страницы (`URLDomain`)
на вашем сайте, какие уникальные коды операционных систем из User Agent (`OS`) были зафиксированы для
посетителей, попавших на этот домен. Это может помочь вам понять разнообразие
операционных систем, взаимодействующих с различными частями вашего сайта.

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Учитываются только обращения с записанным доменом
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```


## См. также {#see-also}

- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [Комбинатор `Distinct`](/sql-reference/aggregate-functions/combinators#-distinct)
