---
title: 'Производительность запросов - Временные ряды'
sidebar_label: 'Производительность запросов'
description: 'Улучшение производительности запросов временных рядов'
slug: /use-cases/time-series/query-performance
keywords: ['временные ряды']
---


# Производительность запросов временных рядов

После оптимизации хранения следующим шагом является повышение производительности запросов. 
В этом разделе рассматриваются две ключевые техники: оптимизация ключей `ORDER BY` и использование материализованных представлений. 
Мы увидим, как эти подходы могут сократить время выполнения запросов с секунд до миллисекунд.

## Оптимизация ключей ORDER BY {#time-series-optimize-order-by}

Перед тем как пытаться применить другие оптимизации, вы должны оптимизировать их ключ сортировки, чтобы гарантировать, что ClickHouse выдает максимально быстрые результаты. 
Правильный выбор ключа во многом зависит от запросов, которые вы собираетесь выполнять. Предположим, большинство наших запросов фильтрует по столбцам `project` и `subproject`. 
В этом случае будет хорошей идеей добавить их в ключ сортировки — так же как и временной столбец, поскольку мы также выполняем запросы по времени:

Давайте создадим другую версию таблицы, которая имеет те же типы столбцов, что и `wikistat`, но отсортирована по `(project, subproject, time)`.

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

Теперь давайте сравним несколько запросов, чтобы получить представление о том, насколько важно выражение нашего ключа сортировки для производительности. Обратите внимание, что мы не применяли наши предыдущие оптимизации типа данных и кодеков, поэтому любые различия в производительности запросов основаны только на порядке сортировки.

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
            <td style={{ textAlign: 'right' }}>2.381 сек</td>
            <td style={{ textAlign: 'right' }}>1.660 сек</td>
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
            <td style={{ textAlign: 'right' }}>2.148 сек</td>
            <td style={{ textAlign: 'right' }}>0.058 сек</td>
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
            <td style={{ textAlign: 'right' }}>2.192 сек</td>
            <td style={{ textAlign: 'right' }}>0.012 сек</td>
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
            <td style={{ textAlign: 'right' }}>2.968 сек</td>
            <td style={{ textAlign: 'right' }}>0.010 сек</td>
        </tr>
      

    </tbody>
</table>

## Materialized views {#time-series-materialized-views}

Другой вариант — использовать материализованные представления для агрегации и хранения результатов популярных запросов. Эти результаты могут быть запрашиваемыми вместо оригинальной таблицы. Предположим, что следующий запрос выполняется довольно часто в нашем случае:


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

10 строк в наборе. Время выполнения: 2.285 сек. Обработано 231.41 миллионов строк, 9.22 ГБ (101.26 миллионов строк/с., 4.03 ГБ/с.)
Пиковое использование памяти: 1.50 GiB.
```

### Создание материализованного представления  {#time-series-create-materialized-view}

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

Эта целевая таблица будет заполняться только при добавлении новых записей в таблицу `wikistat`, поэтому нам нужно сделать немного [фоновской подкачки](/docs/data-modeling/backfilling).

Самый простой способ сделать это — использовать оператор [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) для вставки прямо в целевую таблицу материализованного представления [с помощью](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) запроса SELECT представления (трансформации):

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

В зависимости от кардинальности исходного набора данных (у нас 1 миллиард строк!), этот подход может потреблять много памяти. В качестве альтернативы вы можете использовать вариант, который требует минимальных затрат памяти:

* Создание временной таблицы с движком Null
* Подключение копии обычно используемого материализованного представления к этой временной таблице
* Использование запроса INSERT INTO SELECT, копируя все данные из исходного набора данных во временную таблицу
* Удаление временной таблицы и временного материализованного представления.

С помощью этого подхода строки из исходного набора данных копируются блоками во временную таблицу (которая не хранит ни одной из этих строк), и для каждого блока строк вычисляется частичное состояние, которое записывается в целевую таблицу, где эти состояния постепенно объединяются в фоновом режиме.


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

Далее мы создадим материализованное представление для чтения из `wikistat_backfill` и записи в `wikistat_top`


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

И наконец, мы заполним `wikistat_backfill` из начальной таблицы `wikistat`:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

После завершения этого запроса мы можем удалить таблицу подкачки и материализованное представление:

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

Теперь мы можем выполнять запрос к материализованному представлению вместо оригинальной таблицы:


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

10 строк в наборе. Время выполнения: 0.004 сек.
```


Улучшение производительности здесьdramatic. 
Раньше на расчет ответа на этот запрос уходило чуть более 2 секунд, теперь это занимает всего 4 миллисекунды.
