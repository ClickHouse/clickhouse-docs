---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'Пример использования комбинатора sumArray'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
---


# sumArray {#sumforeach}

## Описание {#description}

Комбинатор [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) может быть применен к агрегатной функции [`sum`](/sql-reference/aggregate-functions/reference/sum), чтобы преобразовать ее из агрегатной функции, которая работает с значениями строк, в агрегатную функцию, которая работает с колонками массивов, применяя агрегирование к каждому элементу массива по строкам.

## Пример использования {#example-usage}

Для этого примера мы воспользуемся набором данных `hits`, доступным в нашем [SQL playground](https://sql.clickhouse.com/).

Таблица `hits` содержит колонку с названием `isMobile` типа UInt8, которая может быть `0` для настольных устройств или `1` для мобильных:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

Мы используем агрегатную функцию комбинатора `sumForEach`, чтобы проанализировать, как трафик с настольных и мобильных устройств варьируется по часам дня. Нажмите кнопку воспроизведения ниже, чтобы выполнить запрос интерактивно:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Используйте sumForEach, чтобы подсчитать визиты с настольных и мобильных устройств за один проход
    sumForEach([
        IsMobile = 0, -- Визиты с настольных устройств (IsMobile = 0)
        IsMobile = 1  -- Визиты с мобильных устройств (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## Смотрите также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
