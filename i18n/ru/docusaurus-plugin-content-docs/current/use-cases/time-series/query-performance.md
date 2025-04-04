---
title: 'Производительность запросов - Временные ряды'
sidebar_label: 'Производительность запросов'
description: 'Улучшение производительности запросов временных рядов'
slug: /use-cases/time-series/query-performance
keywords: ['временные ряды']
---


# Производительность запросов временных рядов

После оптимизации хранения следующим шагом является улучшение производительности запросов. 
В этом разделе рассматриваются две ключевые техники: оптимизация ключей `ORDER BY` и использование материализованных представлений. 
Мы увидим, как эти подходы могут сократить время выполнения запросов с секунд до миллисекунд.

## Оптимизация ключей ORDER BY {#time-series-optimize-order-by}

Перед тем, как пытаться проводить другие оптимизации, вам следует оптимизировать их ключ сортировки, чтобы гарантировать, что ClickHouse будет выдавать максимально быстрые результаты. 
Выбор правильного ключа в значительной степени зависит от запросов, которые вы собираетесь выполнять. Предположим, что большинство наших запросов фильтрует по колонкам `project` и `subproject`. 
В этом случае хорошей идеей будет добавить их в ключ сортировки - наряду с колонкой времени, поскольку мы также запрашиваем по времени:

Создадим другую версию таблицы, которая имеет те же типы колонок, что и `wikistat`, но отсортирована по `(project, subproject, time)`.

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

Теперь давайте сравним несколько запросов, чтобы получить представление о том, насколько важна наша экспрессия ключа сортировки для производительности. Обратите внимание, что мы не применяли предыдущие оптимизации типов данных и кодеков, поэтому любые различия в производительности запросов основаны только на порядке сортировки.

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>Запрос</th>
            <th style={{ textAlign: 'right', width: '32%' }}>(time)</th>
            <th style={{ textAlign: 'right', width: '32%' }}>(project, subproject, time)</th>
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

## Материализованные представления {#time-series-materialized-views}

Другой вариант - использовать материализованные представления для агрегации и хранения результатов популярных запросов. Эти результаты можно запрашивать вместо оригинальной таблицы. Предположим, что следующий запрос выполняется довольно часто в нашем случае:


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

10 строк в наборе. Время: 2.285 сек. Обработано 231.41 миллиона строк, 9.22 ГБ (101.26 миллиона строк/с., 4.03 ГБ/с.)
Пиковое использование памяти: 1.50 ГиБ.
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

Эта целевая таблица будет пополняться только при вставке новых записей в таблицу `wikistat`, поэтому нам нужно сделать немного [дозаполнения](/docs/data-modeling/backfilling).

Самый простой способ сделать это - использовать оператор [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select), чтобы вставить непосредственно в целевую таблицу материализованного представления, используя (https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) запрос SELECT материализованного представления (преобразование):

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

В зависимости от кардинальности исходного набора данных (у нас 1 миллиард строк!), этот подход может потребовать значительных ресурсов памяти. Альтернативно, вы можете использовать вариант, который требует минимального объема памяти:

* Создание временной таблицы с движком Null
* Подключение копии обычно используемого материализованного представления к этой временной таблице
* Использование запроса INSERT INTO SELECT, копируя все данные из исходного набора данных в эту временную таблицу
* Удаление временной таблицы и временного материализованного представления.

При этом строки из исходного набора данных копируются блоками во временную таблицу (которая не хранит ни одной из этих строк), и для каждого блока строк рассчитывается частичное состояние, которое записывается в целевую таблицу, где эти состояния последовательно объединяются в фоновом режиме.


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

Затем мы создадим материализованное представление, которое будет читать из `wikistat_backfill` и записывать в `wikistat_top`


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

И затем, наконец, мы заполним `wikistat_backfill` из начальной таблицы `wikistat`:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

Как только этот запрос завершится, мы можем удалить таблицу дозаполнения и материализованное представление:

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

Теперь мы можем запрашивать материализованное представление вместо оригинальной таблицы:


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

10 строк в наборе. Время: 0.004 сек.
```


Наша производительность здесь существенно улучшилась. 
Ранее для вычисления ответа на этот запрос требовалось чуть больше 2 секунд, а теперь он занимает всего 4 миллисекунды.
