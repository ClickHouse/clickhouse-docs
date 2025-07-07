---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'Пример использования комбинатора groupArrayDistinct'
keywords: ['groupArray', 'Distinct', 'комбинатор', 'примеры', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
---


# groupArrayDistinct {#sumdistinct}

## Описание {#description}

Комбинатор [`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 
можно применить к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum) для создания массива 
различных значений аргумента.

## Пример Использования {#example-usage}

Для этого примера мы будем использовать набор данных `hits`, доступный в нашем [SQL playground](https://sql.clickhouse.com/).

Представьте, что вы хотите узнать, для каждого уникального домена целевой страницы (`URLDomain`) 
на вашем сайте, какие все уникальные коды операционных систем User Agent (`OS`) были зафиксированы для 
посетителей, попадающих на этот домен. Это может помочь вам понять разнообразие 
операционных систем, взаимодействующих с различными частями вашего сайта.

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Учитывать только клики с зафиксированным доменом
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## Смотрите также {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
