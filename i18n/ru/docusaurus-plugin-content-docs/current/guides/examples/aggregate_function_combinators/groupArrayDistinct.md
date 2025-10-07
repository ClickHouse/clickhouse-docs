---
'slug': '/examples/aggregate-function-combinators/groupArrayDistinct'
'title': 'groupArrayDistinct'
'description': 'Пример использования комбинатора groupArrayDistinct'
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

## Описание {#description}

Комбинатор [`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) может быть применен к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum) для создания массива уникальных значений аргументов.

## Пример использования {#example-usage}

В этом примере мы воспользуемся набором данных `hits`, доступным в нашем [SQL playground](https://sql.clickhouse.com/).

Предположим, вы хотите узнать, для каждого уникального домена целевой страницы (`URLDomain`) на вашем сайте, какие все уникальные коды операционных систем User Agent (`OS`) были зарегистрированы для посетителей, попадающих на этот домен. Это может помочь вам понять разнообразие операционных систем, взаимодействующих с различными частями вашего сайта.

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

## См. также {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
