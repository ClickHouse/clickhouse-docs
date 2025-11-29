---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'Пример использования агрегатной функции sumForEach'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---



# sumForEach {#sumforeach}



## Описание {#description}

Комбинатор [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach)
может быть применён к агрегатной функции [`sum`](/sql-reference/aggregate-functions/reference/sum), чтобы преобразовать её из агрегатной
функции, работающей со значениями строк, в агрегатную функцию, работающую со
столбцами-массивами и применяющую агрегирование к каждому элементу массива по всем строкам.



## Пример использования {#example-usage}

В этом примере мы воспользуемся набором данных `hits`, доступным в нашем [SQL playground](https://sql.clickhouse.com/).

Таблица `hits` содержит столбец `isMobile` типа UInt8, который может быть
`0` для настольных устройств или `1` для мобильных:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

Мы воспользуемся агрегатным комбинатором `sumForEach`, чтобы проанализировать, как по часам суток отличается трафик с десктопных и мобильных устройств. Нажмите кнопку воспроизведения ниже, чтобы интерактивно выполнить запрос:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Используем sumForEach для подсчёта посещений с десктопа и мобильных устройств за один проход
    sumForEach([
        IsMobile = 0, -- Посещения с десктопа (IsMobile = 0)
        IsMobile = 1  -- Посещения с мобильных устройств (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```


## См. также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [комбинатор `ForEach`](/sql-reference/aggregate-functions/combinators#-foreach)
