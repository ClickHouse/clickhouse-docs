---
'slug': '/examples/aggregate-function-combinators/sumForEach'
'title': 'sumForEach'
'description': 'Пример использования агрегатной функции sumForEach'
'keywords':
- 'sum'
- 'ForEach'
- 'combinator'
- 'examples'
- 'sumForEach'
'sidebar_label': 'sumForEach'
'doc_type': 'reference'
---


# sumForEach {#sumforeach}

## Описание {#description}

Комбинатор [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 
можно применить к агрегатной функции [`sum`](/sql-reference/aggregate-functions/reference/sum), чтобы превратить её из агрегатной 
функции, которая работает с значениями строк, в агрегатную функцию, которая работает с 
колонками массивов, применяя агрегат к каждому элементу массива по строкам.

## Пример использования {#example-usage}

В этом примере мы воспользуемся набором данных `hits`, доступным в нашем [SQL playground](https://sql.clickhouse.com/).

Таблица `hits` содержит колонку `isMobile` типа UInt8, которая может быть 
`0` для настольных ПК или `1` для мобильных устройств:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

Мы используем агрегатор `sumForEach`, чтобы проанализировать, как 
трафик с настольных ПК и мобильных устройств варьируется по часам дня. Нажмите кнопку воспроизведения 
ниже, чтобы выполнить запрос интерактивно:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Use sumForEach to count desktop and mobile visits in one pass
    sumForEach([
        IsMobile = 0, -- Desktop visits (IsMobile = 0)
        IsMobile = 1  -- Mobile visits (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## См. также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Комбинатор ForEach`](/sql-reference/aggregate-functions/combinators#-foreach)
