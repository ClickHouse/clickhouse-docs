---
title: 'Работа с массивами в ClickHouse'
description: 'Вводное руководство по использованию массивов в ClickHouse'
keywords: ['Arrays']
sidebar_label: 'Работа с массивами в ClickHouse'
slug: /guides/working-with-arrays
doc_type: 'guide'
---

> В этом руководстве вы узнаете, как использовать массивы в ClickHouse, а также познакомитесь с некоторыми из наиболее часто применяемых [функций для работы с массивами](/sql-reference/functions/array-functions).



## Введение в массивы {#array-basics}

Массив — это структура данных в памяти, которая объединяет значения в группу.
Мы называем их _элементами_ массива, и к каждому элементу можно обратиться по индексу, который указывает позицию элемента в этой группе.

Массивы в ClickHouse можно создавать с помощью функции [`array`](/sql-reference/data-types/array):

```sql
array(T)
```

Или, альтернативно, используя квадратные скобки:

```sql
[]
```

Например, можно создать массив чисел:

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

Или массив вложенных типов, таких как [кортежи](/sql-reference/data-types/tuple):

```sql
SELECT array(tuple(1, 2), tuple(3, 4))

┌─[(1, 2), (3, 4)]─┐
│ [(1,2),(3,4)]    │
└──────────────────┘
```

Может возникнуть соблазн создать массив из элементов разных типов следующим образом:

```sql
SELECT array('Hello', 'world', 1, 2, 3)
```

Однако элементы массива всегда должны иметь общий супертип — наименьший тип данных, который может представлять значения из двух или более различных типов без потерь, позволяя использовать их вместе.
Если общего супертипа не существует, при попытке создать массив вы получите исключение:

```sql
Received exception:
Code: 386. DB::Exception: There is no supertype for types String, String, UInt8, UInt8, UInt8 because some of them are String/FixedString/Enum and some of them are not: In scope SELECT ['Hello', 'world', 1, 2, 3]. (NO_COMMON_TYPE)
```

При создании массивов «на лету» ClickHouse выбирает наиболее узкий тип, который подходит для всех элементов.
Например, если создать массив из целых чисел и чисел с плавающей точкой, будет выбран супертип с плавающей точкой:

```sql
SELECT [1::UInt8, 2.5::Float32, 3::UInt8] AS mixed_array, toTypeName([1, 2.5, 3]) AS array_type;

┌─mixed_array─┬─array_type─────┐
│ [1,2.5,3]   │ Array(Float64) │
└─────────────┴────────────────┘
```

<details>
<summary>Создание массивов из разных типов</summary>

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

Затем можно также читать типы из массива по имени типа:

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

Использование индекса с квадратными скобками предоставляет удобный способ доступа к элементам массива.
В ClickHouse важно знать, что индекс массива всегда начинается с **1**.
Это может отличаться от других языков программирования, к которым вы привыкли, где массивы индексируются с нуля.


Например, для массива вы можете выбрать его первый элемент, написав:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[1];

┌─arrayElement⋯g_array, 1)─┐
│ hello                    │
└──────────────────────────┘
```

Также можно использовать отрицательные индексы.
С их помощью можно выбирать элементы относительно последнего элемента:

```sql
WITH array('hello', 'world') AS string_array
SELECT string_array[-1];

┌─arrayElement⋯g_array, -1)─┐
│ world                     │
└───────────────────────────┘
```

Несмотря на то, что индексация в массивах начинается с 1, вы всё равно можете обращаться к элементам с индексом 0.
Возвращаемым значением будет *значение по умолчанию* для типа элементов массива.
В примере ниже возвращается пустая строка, так как это значение по умолчанию для строкового типа данных:

```sql
WITH ['привет', 'мир', 'массивы — это здорово, правда?'] AS string_array
SELECT string_array[0]

┌─arrayElement⋯g_array, 0)─┐
│                          │
└──────────────────────────┘
```


## Функции для работы с массивами {#array-functions}

ClickHouse предлагает множество полезных функций для работы с массивами.
В этом разделе мы рассмотрим наиболее полезные из них, начиная с самых простых и постепенно переходя к более сложным.

### Функции length, arrayEnumerate, indexOf, has\* {#length-arrayEnumerate-indexOf-has-functions}

Функция `length` возвращает количество элементов в массиве:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT length(string_array);

┌─length(string_array)─┐
│                    3 │
└──────────────────────┘
```

Также можно использовать функцию [`arrayEnumerate`](/sql-reference/functions/array-functions#arrayEnumerate) для получения массива индексов элементов:

```sql
WITH array('learning', 'ClickHouse', 'arrays') AS string_array
SELECT arrayEnumerate(string_array);

┌─arrayEnumerate(string_array)─┐
│ [1,2,3]                      │
└──────────────────────────────┘
```

Если необходимо найти индекс конкретного значения, используйте функцию `indexOf`:

```sql
SELECT indexOf([4, 2, 8, 8, 9], 8);

┌─indexOf([4, 2, 8, 8, 9], 8)─┐
│                           3 │
└─────────────────────────────┘
```

Обратите внимание, что эта функция возвращает первый найденный индекс, если в массиве есть несколько одинаковых значений.
Если элементы массива отсортированы по возрастанию, можно использовать функцию [`indexOfAssumeSorted`](/sql-reference/functions/array-functions#indexOfAssumeSorted).

Функции `has`, `hasAll` и `hasAny` полезны для проверки наличия заданного значения в массиве.
Рассмотрим следующий пример:

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


## Исследование данных о рейсах с помощью функций для работы с массивами {#exploring-flight-data-with-array-functions}

До сих пор примеры были довольно простыми.
Полезность массивов по-настоящему проявляется при работе с реальными наборами данных.

Мы будем использовать [набор данных ontime](/getting-started/example-datasets/ontime), который содержит данные о рейсах из Бюро транспортной статистики.
Этот набор данных доступен в [SQL playground](https://sql.clickhouse.com/?query_id=M4FSVBVMSHY98NKCQP8N4K).

Мы выбрали этот набор данных, поскольку массивы часто хорошо подходят для работы с временными рядами и могут помочь упростить
сложные запросы.

:::tip
Нажмите кнопку «play» ниже, чтобы выполнить запросы непосредственно в документации и увидеть результат в реальном времени.
:::

### groupArray {#grouparray}

В этом наборе данных много столбцов, но мы сосредоточимся на подмножестве из них.
Выполните запрос ниже, чтобы увидеть, как выглядят наши данные:

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

Давайте посмотрим на 10 самых загруженных аэропортов США в произвольно выбранный день, например, '2024-01-01'.
Нас интересует, сколько рейсов отправляется из каждого аэропорта.
Наши данные содержат одну строку на рейс, но было бы удобно сгруппировать данные по аэропорту отправления и объединить пункты назначения в массив.

Для этого мы можем использовать агрегатную функцию [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray), которая берет значения указанного столбца из каждой строки и группирует их в массив.

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

Функция [`toStringCutToZero`](/sql-reference/functions/type-conversion-functions#tostringcuttozero) в запросе выше используется для удаления нулевых символов, которые появляются после трехбуквенного кода некоторых аэропортов.

Имея данные в таком формате, мы можем легко определить порядок самых загруженных аэропортов, найдя длину объединенных массивов "Destinations":

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

### arrayMap и arrayZip {#arraymap}

Мы увидели в предыдущем запросе, что международный аэропорт Денвера был аэропортом с наибольшим количеством исходящих рейсов в выбранный нами день.
Давайте посмотрим, сколько из этих рейсов вылетели вовремя, задержались на 15-30 минут или задержались более чем на 30 минут.

Многие функции для работы с массивами в ClickHouse являются так называемыми [«функциями высшего порядка»](/sql-reference/functions/overview#higher-order-functions) и принимают лямбда-функцию в качестве первого параметра.
Функция [`arrayMap`](/sql-reference/functions/array-functions#arrayMap) является примером такой функции высшего порядка и возвращает новый массив из предоставленного массива, применяя лямбда-функцию к каждому элементу исходного массива.

Выполните запрос ниже, который использует функцию `arrayMap`, чтобы увидеть, какие рейсы были задержаны или вылетели вовремя.
Для пар отправление/назначение он показывает бортовой номер и статус для каждого рейса:

```sql runnable
WITH arrayMap(
              d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME')),
              groupArray(DepDelayMinutes)
    ) AS statuses

```


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

````

В приведенном выше запросе функция `arrayMap` принимает одноэлементный массив `[DepDelayMinutes]` и применяет к нему лямбда-функцию `d -> if(d >= 30, 'DELAYED', if(d >= 15, 'WARNING', 'ON-TIME'` для категоризации.
Затем первый элемент полученного массива извлекается с помощью `[DepDelayMinutes][1]`.
Функция [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) объединяет массивы `Tail_Number` и `statuses` в один массив.

### arrayFilter {#arrayfilter}

Далее рассмотрим только количество рейсов, задержанных на 30 минут или более, для аэропортов `DEN`, `ATL` и `DFW`:

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
````

В приведенном выше запросе мы передаем лямбда-функцию в качестве первого аргумента функции [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter).
Эта лямбда-функция принимает задержку в минутах (d) и возвращает `1`, если условие выполнено, иначе `0`.

```sql
d -> d >= 30
```

### arraySort и arrayIntersect {#arraysort-and-arrayintersect}

Далее определим, какие пары крупных аэропортов США обслуживают наибольшее количество общих направлений, используя функции [`arraySort`](/sql-reference/functions/array-functions#arraySort) и [`arrayIntersect`](/sql-reference/functions/array-functions#arrayIntersect).
Функция `arraySort` принимает массив и по умолчанию сортирует элементы в порядке возрастания, хотя вы также можете передать ей лямбда-функцию для определения порядка сортировки.
Функция `arrayIntersect` принимает несколько массивов и возвращает массив, содержащий элементы, присутствующие во всех массивах.

Выполните приведенный ниже запрос, чтобы увидеть эти две функции для работы с массивами в действии:

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

Запрос работает в два основных этапа.
Сначала он создает временный набор данных `airport_routes` с использованием обобщенного табличного выражения (CTE), которое анализирует все рейсы на 1 января 2024 года и для каждого аэропорта отправления формирует отсортированный список всех уникальных направлений, которые обслуживает данный аэропорт.
В результирующем наборе `airport_routes`, например, для аэропорта DEN может быть массив, содержащий все города, в которые он выполняет рейсы, например `['ATL', 'BOS', 'LAX', 'MIA', ...]` и так далее.

На втором этапе запрос берет пять крупных узловых аэропортов США (`DEN`, `ATL`, `DFW`, `ORD` и `LAS`) и сравнивает каждую возможную пару из них.
Это выполняется с помощью перекрестного соединения, которое создает все комбинации этих аэропортов.
Затем для каждой пары используется функция `arrayIntersect`, чтобы определить, какие направления присутствуют в списках обоих аэропортов.
Функция length подсчитывает количество общих направлений.


Условие `a1.Origin < a2.Origin` гарантирует, что каждая пара появляется только один раз.
Без этого условия вы получили бы и JFK-LAX, и LAX-JFK как отдельные результаты, что было бы избыточным, поскольку они представляют одно и то же сравнение.
Наконец, запрос сортирует результаты, чтобы показать, какие пары аэропортов имеют наибольшее количество общих направлений, и возвращает только топ-10.
Это показывает, какие крупные хабы имеют наиболее пересекающиеся маршрутные сети, что может указывать на конкурентные рынки, где несколько авиакомпаний обслуживают одни и те же пары городов, или на хабы, обслуживающие схожие географические регионы и потенциально используемые в качестве альтернативных пунктов пересадки для путешественников.

### arrayReduce {#arrayReduce}

Пока мы рассматриваем задержки, давайте используем еще одну функцию высшего порядка для работы с массивами — `arrayReduce`, чтобы найти среднюю и максимальную задержку для каждого маршрута из международного аэропорта Денвера:

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

В приведенном выше примере мы использовали `arrayReduce` для нахождения средней и максимальной задержки для различных исходящих рейсов из `DEN`.
`arrayReduce` применяет агрегатную функцию, указанную в первом параметре, к элементам переданного массива, указанного во втором параметре.

### arrayJoin {#arrayJoin}

Обычные функции в ClickHouse обладают свойством возвращать то же количество строк, которое они получают.
Однако существует одна интересная и уникальная функция, которая нарушает это правило и о которой стоит узнать — функция `arrayJoin`.

`arrayJoin` «разворачивает» массив, создавая отдельную строку для каждого элемента.
Это аналогично SQL-функциям `UNNEST` или `EXPLODE` в других базах данных.

В отличие от большинства функций для работы с массивами, которые возвращают массивы или скалярные значения, `arrayJoin` принципиально изменяет результирующий набор, умножая количество строк.

Рассмотрим приведенный ниже запрос, который возвращает массив значений от 0 до 100 с шагом 10.
Мы можем рассматривать массив как различные времена задержки: 0 минут, 10 минут, 20 минут и так далее.

```sql runnable
WITH range(0, 100, 10) AS delay
SELECT delay
```

Мы можем написать запрос с использованием `arrayJoin`, чтобы определить, сколько задержек было продолжительностью до указанного количества минут между двумя аэропортами.
Приведенный ниже запрос создает гистограмму, показывающую распределение задержек рейсов из Денвера (DEN) в Майами (MIA) 1 января 2024 года, используя кумулятивные интервалы задержек:

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

В приведенном выше запросе мы возвращаем массив задержек, используя CTE (предложение `WITH`).
`Destination` преобразует код пункта назначения в строку.

Мы используем `arrayJoin` для разворачивания массива задержек в отдельные строки.
Каждое значение из массива `delay` становится отдельной строкой с псевдонимом `del`,
и мы получаем 10 строк: одну для `del=0`, одну для `del=10`, одну для `del=20` и т. д.
Для каждого порога задержки (`del`) запрос подсчитывает, сколько рейсов имели задержки больше или равные этому порогу,
используя `countIf(DepDelayMinutes >= del)`.

У `arrayJoin` также есть эквивалентная SQL-команда `ARRAY JOIN`.
Приведенный выше запрос воспроизведен ниже с эквивалентной SQL-командой для сравнения:

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


## Следующие шаги {#next-steps}

Поздравляем! Вы научились работать с массивами в ClickHouse — от базового создания массивов и индексации до мощных функций, таких как `groupArray`, `arrayFilter`, `arrayMap`, `arrayReduce` и `arrayJoin`.
Чтобы продолжить обучение, изучите полный справочник функций для работы с массивами, чтобы узнать о дополнительных функциях, таких как `arrayFlatten`, `arrayReverse` и `arrayDistinct`.
Возможно, вам также будет полезно узнать о связанных структурах данных, таких как типы [`tuples`](/sql-reference/data-types/tuple#creating-tuples), [JSON](/sql-reference/data-types/newjson) и [Map](/sql-reference/data-types/map), которые хорошо работают вместе с массивами.
Практикуйтесь в применении этих концепций на своих собственных наборах данных и экспериментируйте с различными запросами в SQL-песочнице или на других примерах наборов данных.

Массивы являются фундаментальной возможностью ClickHouse, которая обеспечивает эффективные аналитические запросы — по мере того как вы будете осваивать функции для работы с массивами, вы обнаружите, что они могут значительно упростить сложные агрегации и анализ временных рядов.
Для более глубокого погружения в работу с массивами рекомендуем посмотреть видео на YouTube от Марка, нашего штатного эксперта по данным:

<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/7jaw3J6U_h8?si=6NiEJ7S1odU-VVqX'
  title='Видеоплеер YouTube'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>
