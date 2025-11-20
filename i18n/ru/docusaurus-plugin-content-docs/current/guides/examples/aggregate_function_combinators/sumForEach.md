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
можно применить к агрегатной функции [`sum`](/sql-reference/aggregate-functions/reference/sum), чтобы преобразовать её из агрегатной
функции, которая работает со значениями строк, в агрегатную функцию, которая работает со
столбцами массивов, применяя агрегацию к каждому элементу массива во всех строках.


## Пример использования {#example-usage}

В этом примере мы используем набор данных `hits`, доступный в нашей [SQL-песочнице](https://sql.clickhouse.com/).

Таблица `hits` содержит столбец `isMobile` типа UInt8, который может принимать значение
`0` для десктопа или `1` для мобильных устройств:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

Мы используем агрегатную функцию-комбинатор `sumForEach` для анализа того, как
трафик с десктопа и мобильных устройств изменяется в зависимости от часа суток. Нажмите кнопку воспроизведения
ниже, чтобы выполнить запрос в интерактивном режиме:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Используем sumForEach для подсчета посещений с десктопа и мобильных устройств за один проход
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
- [Комбинатор `ForEach`](/sql-reference/aggregate-functions/combinators#-foreach)
