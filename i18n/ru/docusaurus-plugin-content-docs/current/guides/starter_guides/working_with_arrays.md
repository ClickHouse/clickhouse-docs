---
title: 'Работа с массивами в ClickHouse'
description: 'Вводное руководство по работе с массивами в ClickHouse'
keywords: ['Массивы']
sidebar_label: 'Работа с массивами в ClickHouse'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> В этом руководстве вы узнаете, как использовать массивы в ClickHouse, а также познакомитесь с некоторыми наиболее часто используемыми [функциями работы с массивами](/sql-reference/functions/array-functions).

## Введение в массивы \{#array-basics\}

Массив — это хранящаяся в памяти структура данных, которая группирует значения.
Мы называем эти значения *элементами* массива, и к каждому элементу можно обратиться по индексу, который указывает положение элемента в этой группе.

Массивы в ClickHouse могут быть созданы с помощью функции [`array`](/sql-reference/data-types/array):

```sql
array(T)
```

Либо с использованием квадратных скобок:

```sql
[]
```

Например, вы можете создать массив чисел:

```sql
SELECT array(1, 2, 3) AS numeric_array

┌─numeric_array─┐
│ [1,2,3]       │
└───────────────┘
```

Или массив строк:

```sql
SELECT array('hello', 'world') AS string_array

┌─string_array──────┐
│ ['hello','world'] │
└───────────────────┘
```

Или массив вложенных типов, например [кортежей](/sql-reference/data-types/tuple):

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

Может возникнуть соблазн создать массив значений разных типов, например так:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

Однако элементы массива всегда должны иметь общий супертип — наименьший тип данных, способный без потерь представлять значения из двух или более различных типов и тем самым позволяющий использовать их совместно.
Если общего супертипа нет, вы получите исключение при попытке сформировать массив:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

При создании массивов на лету ClickHouse выбирает самый узкий тип, который подходит для всех элементов.
Например, если вы создаёте массив из целых и вещественных чисел, выбирается супертип вещественного числа:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
  <summary>Создание массивов с элементами разных типов</summary>

  Вы можете использовать настройку `use_variant_as_common_type`, чтобы изменить описанное выше поведение по умолчанию.
  Это позволяет использовать тип [Variant](/sql-reference/data-types/variant) в качестве результирующего типа для функций `if`/`multiIf`/`array`/`map`, когда для типов аргументов нет общего типа.

  Например:

  ```sql
  SELECT
      [1, 'ClickHouse', ['Another', 'Array']] AS array,
      toTypeName(array)
  SETTINGS use_variant_as_common_type = 1;
  ```

  ```response
  ┌─array────────────────────────────────┬─toTypeName(array)────────────────────────────┐
  │ [1,'ClickHouse',['Another','Array']] │ Array(Variant(Array(String), String, UInt8)) │
  └──────────────────────────────────────┴──────────────────────────────────────────────┘
  ```

  Затем вы также можете извлекать значения из массива по имени типа:

  ```sql
  SELECT
      [1, 'ClickHouse', ['Another', 'Array']] AS array,
      array.UInt8,
      array.String,
      array.`Array(String)`
  SETTINGS use_variant_as_common_type = 1;
  ```

  ```response
  ┌─array────────────────────────────────┬─array.UInt8───┬─array.String─────────────┬─array.Array(String)─────────┐
  │ [1,'ClickHouse',['Another','Array']] │ [1,NULL,NULL] │ [NULL,'ClickHouse',NULL] │ [[],[],['Another','Array']] │
  └──────────────────────────────────────┴───────────────┴──────────────────────────┴─────────────────────────────┘
  ```
</details>

Использование индекса в квадратных скобках — удобный способ обращаться к элементам массива.
В ClickHouse важно учитывать, что индексация массивов всегда начинается с **1**.
Это может отличаться от других языков программирования, к которым вы привыкли, где массивы индексируются с нуля.

Например, имея массив, вы можете выбрать первый элемент массива следующим образом:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

Можно также использовать отрицательные индексы.
Таким образом, можно выбирать элементы относительно последнего элемента:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

Несмотря на то, что массивы индексируются с 1, вы всё равно можете обращаться к элементу с индексом 0.
Возвращаемым значением будет *значение по умолчанию* для типа элементов массива.
В примере ниже возвращается пустая строка, так как это значение по умолчанию для строкового типа данных:

```sql
WITH ['hello', 'world', 'arrays are great aren\'t they?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## Функции для работы с массивами \{#array-functions\}

ClickHouse предоставляет множество полезных функций для работы с массивами.
В этом разделе мы рассмотрим некоторые из наиболее полезных, начиная с самых простых и переходя к более сложным.

### length, arrayEnumerate, indexOf, функции has* \{#length-arrayEnumerate-indexOf-has-functions\}

Функция `length` возвращает количество элементов в массиве:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

Вы также можете использовать функцию [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate), чтобы получить массив индексов элементов массива:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

Если вам нужно найти индекс конкретного значения, вы можете использовать функцию `indexOf`:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

Обратите внимание, что эта функция вернет первый индекс, соответствующий этому значению, если в массиве есть несколько одинаковых значений.
Если элементы массива отсортированы по возрастанию, можно использовать функцию [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted).

Функции `has`, `hasAll` и `hasAny` полезны для определения того, содержит ли массив заданное значение.
Рассмотрите следующий пример:

```sql
WITH ['Airbus A380', 'Airbus A350', 'Airbus A220', 'Boeing 737', 'Boeing 747-400'] AS airplanes
SELECT
    has(airplanes, 'Airbus A350') AS has_true,
    has(airplanes, 'Lockheed Martin F-22 Raptor') AS has_false,
    hasAny(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAny_true,
    hasAny(airplanes, ['Lockheed Martin F-22 Raptor', 'Eurofighter Typhoon']) AS hasAny_false,
    hasAll(airplanes, ['Boeing 737', 'Boeing 747-400']) AS hasAll_true,
    hasAll(airplanes, ['Boeing 737', 'Eurofighter Typhoon']) AS hasAll_false
FORMAT Vertical;
```

```response
has_true:     1
has_false:    0
hasAny_true:  1
hasAny_false: 0
hasAll_true:  1
hasAll_false: 0
```


## Исследование данных о перелётах с помощью массивов \{#exploring-flight-data-with-array-functions\}

До сих пор примеры были довольно простыми.
Преимущества массивов особенно заметны при работе с реальным набором данных.

Мы будем использовать [набор данных ontime](/getting-started/example-datasets/ontime), который содержит данные о рейсах из Бюро транспортной статистики.
Этот набор данных можно найти в [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K).

Мы выбрали этот набор данных, поскольку массивы часто хорошо подходят для работы с временными рядами и помогают упростить
в противном случае сложные запросы.

:::tip
Нажмите кнопку «Play» ниже, чтобы выполнить запросы прямо в документации и увидеть результат в реальном времени.
:::

### groupArray \{#grouparray\}

В этом наборе данных много столбцов, но мы сосредоточимся на их подмножестве.
Выполните приведённый ниже запрос, чтобы увидеть, как выглядят наши данные:

```sql runnable
-- SELECT
-- *
-- FROM ontime.ontime LIMIT 100

SELECT
    FlightDate,
    Origin,
    OriginCityName,
    Dest,
    DestCityName,
    DepTime,
    DepDelayMinutes,
    ArrTime,
    ArrDelayMinutes
FROM ontime.ontime LIMIT 5
```

Давайте посмотрим на 10 самых загруженных аэропортов США в случайно выбранный день, например «2024-01-01».
Нас интересует, сколько рейсов вылетает из каждого аэропорта.
Наши данные содержат по одной строке на каждый рейс, но было бы удобнее сгруппировать данные по аэропорту вылета и собрать пункты назначения в массив.

Для этого мы можем использовать агрегатную функцию [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray), которая берёт значения указанного столбца из каждой строки и группирует их в массив.

Выполните запрос ниже, чтобы увидеть, как это работает:

```sql runnable
SELECT
    FlightDate,
    Origin,
    groupArray(toStringCutToZero(Dest)) AS Destinations
FROM ontime.ontime
WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA') AND FlightDate='2024-01-01'
GROUP BY FlightDate, Origin
ORDER BY length(Destinations)
```

Функция [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#toStringCutToZero) в приведённом выше запросе используется для удаления символов null, которые появляются после некоторых трёхбуквенных кодов аэропортов.

Имея данные в таком формате, мы можем легко определить рейтинг самых загруженных аэропортов, посчитав длину массивов «Destinations», в которые они свернуты:

```sql runnable
WITH
    '2024-01-01' AS date,
    busy_airports AS (
    SELECT
    FlightDate,
    Origin,
--highlight-next-line
    groupArray(toStringCutToZero(Dest)) AS Destinations
    FROM ontime.ontime
    WHERE Origin IN ('ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'LAS', 'CLT', 'SFO', 'SEA')
    AND FlightDate = date
    GROUP BY FlightDate, Origin
    ORDER BY length(Destinations)
    )
SELECT
    Origin,
    length(Destinations) AS outward_flights
FROM busy_airports
ORDER BY outward_flights DESC
```


### arrayMap и arrayZip \{#arraymap\}

В предыдущем запросе мы увидели, что международный аэропорт Денвера (Denver International Airport) был аэропортом с наибольшим количеством вылетающих рейсов в выбранный нами день.
Давайте посмотрим, сколько из этих рейсов были вовремя, задержаны на 15–30 минут или задержаны более чем на 30 минут.

Многие функции работы с массивами в ClickHouse являются так называемыми [«функциями высшего порядка»](/sql-reference/functions/overview#higher-order-functions) и принимают лямбда-функцию в качестве первого параметра.
Функция [`arrayMap`](/sql-reference/functions/array-functions#arrayMap) является примером такой функции высшего порядка и возвращает новый массив на основе исходного массива, применяя лямбда-функцию к каждому элементу исходного массива.

Выполните приведённый ниже запрос, который использует функцию `arrayMap`, чтобы увидеть, какие рейсы были задержаны или выполнены вовремя.
Для пар пунктов отправления/прибытия он показывает бортовой номер и статус для каждого рейса:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    arrayZip(groupArray(Tail_Number), statuses) as tailNumberStatuses
FROM ontime.ontime
WHERE Origin = 'DEN'
  AND FlightDate = '2024-01-01'
  AND DepTime IS NOT NULL
  AND DepDelayMinutes IS NOT NULL
GROUP BY ALL
```

В приведённом выше запросе функция `arrayMap` принимает массив из одного элемента `[DepDelayMinutes]` и применяет лямбда-функцию `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` для присвоения ему категории.
Затем первый элемент результирующего массива извлекается с помощью `[DepDelayMinutes][1]`.
Функция [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) объединяет массив `Tail_Number` и массив `statuses` в один массив.


### arrayFilter \{#arrayfilter\}

Далее рассмотрим только количество рейсов, задержанных на 30 минут и более, из аэропортов `DEN`, `ATL` и `DFW`:

```sql runnable
SELECT
    Origin,
    OriginCityName,
--highlight-next-line
    length(arrayFilter(d -> d >= 30, groupArray(ArrDelayMinutes))) AS num_delays_30_min_or_more
FROM ontime.ontime
WHERE Origin IN ('DEN', 'ATL', 'DFW')
    AND FlightDate = '2024-01-01'
GROUP BY Origin, OriginCityName
ORDER BY num_delays_30_min_or_more DESC
```

В приведённом выше запросе мы передаём лямбда-функцию в качестве первого аргумента функции [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter).
Сама лямбда-функция принимает задержку в минутах (d) и возвращает `1`, если условие выполнено, иначе `0`.

```sql
d -> d >= 30
```


### arraySort и arrayIntersect \{#arraysort-and-arrayintersect\}

Далее мы определим, какие пары крупных аэропортов США имеют наибольшее количество общих направлений, с помощью функций [`arraySort`](/sql-reference/functions/array-functions#arraySort) и [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect).
`arraySort` принимает массив и по умолчанию сортирует его элементы по возрастанию, хотя вы также можете передать ей лямбда-функцию, чтобы задать порядок сортировки.
`arrayIntersect` принимает несколько массивов и возвращает массив с элементами, которые присутствуют во всех этих массивах.

Выполните приведённый ниже запрос, чтобы увидеть эти две функции для массивов в действии:

```sql runnable
WITH airport_routes AS (
    SELECT 
        Origin,
--highlight-next-line
        arraySort(groupArray(DISTINCT toStringCutToZero(Dest))) AS destinations
    FROM ontime.ontime
    WHERE FlightDate = '2024-01-01'
    GROUP BY Origin
)
SELECT 
    a1.Origin AS airport1,
    a2.Origin AS airport2,
--highlight-next-line
    length(arrayIntersect(a1.destinations, a2.destinations)) AS common_destinations
FROM airport_routes a1
CROSS JOIN airport_routes a2
WHERE a1.Origin < a2.Origin
    AND a1.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
    AND a2.Origin IN ('DEN', 'ATL', 'DFW', 'ORD', 'LAS')
ORDER BY common_destinations DESC
LIMIT 10
```

Запрос выполняется в два основных этапа.
Сначала он создает временный набор данных под названием `airport_routes`, используя общее табличное выражение (CTE), которое анализирует все рейсы 1 января 2024 года и для каждого аэропорта вылета формирует отсортированный список всех уникальных пунктов назначения, которые обслуживает этот аэропорт.
В результирующем наборе `airport_routes`, например, для DEN может быть массив, содержащий все города, в которые выполняются рейсы, например `['ATL', 'BOS', 'LAX', 'MIA', ...]` и так далее.

На втором этапе запрос берет пять крупных узловых аэропортов США (`DEN`, `ATL`, `DFW`, `ORD` и `LAS`) и сравнивает каждую возможную пару из них.
Это делается с помощью `CROSS JOIN`, который создает все комбинации этих аэропортов.
Затем для каждой пары используется функция `arrayIntersect`, чтобы найти направления, которые присутствуют в списках обоих аэропортов.
Функция `length` подсчитывает, сколько общих направлений у них есть.

Условие `a1.Origin < a2.Origin` гарантирует, что каждая пара появляется только один раз.
Без него вы бы получили и JFK-LAX, и LAX-JFK как отдельные результаты, что избыточно, поскольку они представляют одно и то же сравнение.
Наконец, запрос сортирует результаты, чтобы показать, какие пары аэропортов имеют наибольшее количество общих пунктов назначения, и возвращает только первые 10.
Это показывает, какие крупные узловые аэропорты имеют наиболее пересекающиеся маршрутные сети, что может указывать на конкурентные рынки, где несколько авиакомпаний обслуживают одни и те же пары городов, или на хабы, которые обслуживают схожие географические регионы и потенциально могут использоваться как альтернативные точки пересадки для пассажиров.


### arrayReduce \{#arrayReduce\}

Пока мы анализируем задержки, давайте используем ещё одну функцию высшего порядка для массивов — `arrayReduce`, чтобы найти среднюю и максимальную задержку
для каждого маршрута из Международного аэропорта Денвера:

```sql runnable
SELECT
    Origin,
    toStringCutToZero(Dest) AS Destination,
    groupArray(DepDelayMinutes) AS delays,
--highlight-start
    round(arrayReduce('avg', groupArray(DepDelayMinutes)), 2) AS avg_delay,
    round(arrayReduce('max', groupArray(DepDelayMinutes)), 2) AS worst_delay
--highlight-end
FROM ontime.ontime
WHERE Origin = 'DEN'
    AND FlightDate = '2024-01-01'
    AND DepDelayMinutes IS NOT NULL
GROUP BY Origin, Destination
ORDER BY avg_delay DESC
```

В приведённом выше примере мы использовали `arrayReduce`, чтобы найти средние и максимальные задержки для различных вылетающих из `DEN` рейсов.
`arrayReduce` применяет агрегатную функцию, переданную в первом параметре, к элементам массива, указанного во втором параметре.


### arrayJoin \{#arrayJoin\}

Обычные функции в ClickHouse возвращают столько же строк, сколько получают на вход.
Однако есть одна интересная и уникальная функция, которая нарушает это правило и о которой стоит узнать — функция `arrayJoin`.

`arrayJoin` «разворачивает» массив, создавая отдельную строку для каждого его элемента.
Это похоже на функции SQL `UNNEST` или `EXPLODE` в других базах данных.

В отличие от большинства функций для работы с массивами, которые возвращают массивы или скалярные значения, `arrayJoin` радикально изменяет результирующий набор данных, умножая количество строк.

Рассмотрим запрос ниже, который возвращает массив значений от 0 до 100 с шагом 10.
Мы можем рассматривать этот массив как разные значения времени задержки: 0 минут, 10 минут, 20 минут и так далее.

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

Мы можем написать запрос с использованием `arrayJoin`, чтобы определить, сколько было задержек продолжительностью до соответствующего количества минут между двумя аэропортами.
Приведённый ниже запрос строит гистограмму, показывающую распределение задержек рейсов из Денвера (DEN) в Майами (MIA) 1 января 2024 года с использованием накопительных корзин по задержке:

```sql runnable
WITH range(0, 100, 10) AS delay,
    toStringCutToZero(Dest) AS Destination

SELECT
    'Up to ' || arrayJoin(delay) || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= arrayJoin(delay)) AS flightsDelayed
FROM ontime.ontime
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY delayTime
ORDER BY flightsDelayed DESC
```

В приведённом выше запросе мы возвращаем массив задержек, используя общее табличное выражение (CTE, предложение `WITH`).
`Destination` преобразует код пункта назначения в строку.

Мы используем `arrayJoin`, чтобы развернуть массив задержек в отдельные строки.
Каждое значение из массива `delay` становится отдельной строкой с псевдонимом `del`,
и мы получаем 10 строк: одну для `del=0`, одну для `del=10`, одну для `del=20` и т.д.
Для каждого порога задержки (`del`) запрос подсчитывает, сколько рейсов имели задержку, большую или равную этому порогу,
с помощью `countIf(DepDelayMinutes >= del)`.

У `arrayJoin` также есть эквивалентный SQL-оператор `ARRAY JOIN`.
Приведённый выше запрос показан ниже с эквивалентным SQL-оператором для сравнения:

```sql runnable
WITH range(0, 100, 10) AS delay, 
     toStringCutToZero(Dest) AS Destination

SELECT    
    'Up to ' || del || ' minutes' AS delayTime,
    countIf(DepDelayMinutes >= del) flightsDelayed
FROM ontime.ontime
ARRAY JOIN delay AS del
WHERE Origin = 'DEN' AND Destination = 'MIA' AND FlightDate = '2024-01-01'
GROUP BY ALL
ORDER BY flightsDelayed DESC
```


## Дальнейшие шаги \{#next-steps\}

Поздравляем! Вы узнали, как работать с массивами в ClickHouse — от базового создания и индексирования массивов до использования мощных функций, таких как `groupArray`, `arrayFilter`, `arrayMap`, `arrayReduce` и `arrayJoin`.
Чтобы продолжить обучение, изучите полный справочник по функциям работы с массивами и откройте для себя дополнительные функции, такие как `arrayFlatten`, `arrayReverse` и `arrayDistinct`.
Вам также может быть интересно познакомиться с родственными структурами данных, такими как [`tuples`](/sql-reference/data-types/tuple#creating-tuples), [JSON](/sql-reference/data-types/newjson) и типы [Map](/sql-reference/data-types/map), которые хорошо сочетаются с массивами.
Попробуйте применить эти концепции к собственным наборам данных и поэкспериментируйте с различными запросами в SQL playground или на других примерных наборах данных.

Массивы — это базовая возможность ClickHouse, которая позволяет выполнять эффективные аналитические запросы. По мере того как вы будете лучше осваивать функции для работы с массивами, вы обнаружите, что они могут значительно упростить сложные агрегации и анализ временных рядов.
Для ещё более глубокого погружения в работу с массивами мы рекомендуем YouTube‑видео ниже от Марка, нашего эксперта по данным:

<iframe width="560" height="315" src="https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>