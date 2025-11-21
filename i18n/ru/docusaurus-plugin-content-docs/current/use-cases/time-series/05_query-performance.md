---
title: 'Производительность запросов — временные ряды'
sidebar_label: 'Производительность запросов'
description: 'Повышение производительности запросов к временным рядам'
slug: /use-cases/time-series/query-performance
keywords: ['временные ряды', 'производительность запросов', 'оптимизация', 'индексация', 'партиционирование', 'настройка запросов', 'производительность']
show_related_blogs: true
doc_type: 'guide'
---



# Производительность запросов к временным рядам

После оптимизации хранилища следующим шагом является улучшение производительности запросов.
В этом разделе рассматриваются два ключевых подхода: оптимизация ключей `ORDER BY` и использование материализованных представлений.
Мы покажем, как эти подходы позволяют сократить время выполнения запросов с секунд до миллисекунд.



## Оптимизация ключей `ORDER BY` {#time-series-optimize-order-by}

Перед применением других оптимизаций необходимо оптимизировать ключи сортировки, чтобы обеспечить максимально быструю работу ClickHouse.
Выбор правильного ключа во многом зависит от запросов, которые вы планируете выполнять. Предположим, что большинство наших запросов фильтруют данные по столбцам `project` и `subproject`.
В этом случае рекомендуется добавить их в ключ сортировки, а также столбец `time`, поскольку мы также выполняем запросы по времени.

Создадим другую версию таблицы с теми же типами столбцов, что и `wikistat`, но упорядоченную по `(project, subproject, time)`.

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

Теперь сравним несколько запросов, чтобы понять, насколько важно выражение ключа сортировки для производительности. Обратите внимание, что мы не применяли предыдущие оптимизации типов данных и кодеков, поэтому любые различия в производительности запросов обусловлены только порядком сортировки.

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>Запрос</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```       
            </td>
            <td style={{ textAlign: 'right' }}>2.381 sec</td>
            <td style={{ textAlign: 'right' }}>1.660 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.148 sec</td>
            <td style={{ textAlign: 'right' }}>0.058 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.192 sec</td>
            <td style={{ textAlign: 'right' }}>0.012 sec</td>
        </tr>

        <tr>
            <td>

```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```

            </td>
            <td style={{ textAlign: 'right' }}>2.968 sec</td>
            <td style={{ textAlign: 'right' }}>0.010 sec</td>
        </tr>


    </tbody>

</table>


## Материализованные представления {#time-series-materialized-views}

Другой вариант — использовать материализованные представления для агрегирования и хранения результатов часто выполняемых запросов. Эти результаты можно запрашивать вместо исходной таблицы. Предположим, что в нашем случае следующий запрос выполняется довольно часто:

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 2.285 sec. Processed 231.41 million rows, 9.22 GB (101.26 million rows/s., 4.03 GB/s.)
Peak memory usage: 1.50 GiB.
```

### Создание материализованного представления {#time-series-create-materialized-view}

Мы можем создать следующее материализованное представление:

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### Заполнение целевой таблицы {#time-series-backfill-destination-table}

Эта целевая таблица будет заполняться только при вставке новых записей в таблицу `wikistat`, поэтому необходимо выполнить [обратное заполнение](/docs/data-modeling/backfilling).

Самый простой способ — использовать оператор [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) для вставки непосредственно в целевую таблицу материализованного представления, [используя](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) запрос `SELECT` представления (преобразование):

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

В зависимости от кардинальности исходного набора данных (у нас 1 миллиард строк!), этот подход может потребовать значительных объёмов памяти. В качестве альтернативы можно использовать вариант, требующий минимального объёма памяти:

- Создание временной таблицы с движком Null
- Подключение копии обычно используемого материализованного представления к этой временной таблице
- Использование запроса `INSERT INTO SELECT` для копирования всех данных из исходного набора данных во временную таблицу
- Удаление временной таблицы и временного материализованного представления.

При таком подходе строки из исходного набора данных копируются блоками во временную таблицу (которая не хранит эти строки), и для каждого блока строк вычисляется частичное состояние и записывается в целевую таблицу, где эти состояния инкрементально объединяются в фоновом режиме.

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

Далее создадим материализованное представление для чтения из `wikistat_backfill` и записи в `wikistat_top`:

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

И наконец, заполним `wikistat_backfill` из исходной таблицы `wikistat`:

```sql
INSERT INTO wikistat_backfill
SELECT *
FROM wikistat;
```

После завершения этого запроса можно удалить таблицу обратного заполнения и материализованное представление:


```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

Теперь мы можем выполнять запросы к материализованному представлению вместо исходной таблицы:

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

Получено 10 строк. Затрачено: 0.004 сек.
```

Прирост производительности в данном случае впечатляющий.
Ранее вычисление результата этого запроса занимало чуть более 2 секунд, а теперь — всего 4 миллисекунды.
