---
title: 'Производительность запросов для временных рядов'
sidebar_label: 'Производительность запросов'
description: 'Улучшение производительности запросов для временных рядов'
slug: /use-cases/time-series/query-performance
keywords: ['временные ряды', 'производительность запросов', 'оптимизация', 'индексация', 'партиционирование', 'настройка запросов', 'производительность']
show_related_blogs: true
doc_type: 'guide'
---

# Производительность запросов по временным рядам \{#time-series-query-performance\}

После оптимизации хранилища следующим шагом является улучшение производительности запросов.
В этом разделе мы рассмотрим два ключевых подхода: оптимизацию ключей `ORDER BY` и использование материализованных представлений.
Мы увидим, как эти подходы позволяют сократить время выполнения запросов с секунд до миллисекунд.

## Оптимизация ключей `ORDER BY` \{#time-series-optimize-order-by\}

Прежде чем переходить к другим оптимизациям, следует оптимизировать ключи `ORDER BY`, чтобы ClickHouse выдавал максимально быстрые результаты.
Выбор правильного ключа во многом зависит от запросов, которые вы планируете выполнять. Предположим, что большинство наших запросов фильтруют данные по столбцам `project` и `subproject`.
В этом случае имеет смысл добавить их в ключ сортировки, а также столбец `time`, так как мы также выполняем запросы по времени.

Создадим ещё одну версию таблицы с теми же типами столбцов, что и в `wikistat`, но с сортировкой по `(project, subproject, time)`.

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

Теперь давайте сравним несколько запросов, чтобы оценить, насколько выбранное выражение ключа сортировки влияет на производительность. Обратите внимание, что мы не применяли предыдущие оптимизации типов данных и кодеков, поэтому любые различия в производительности запросов обусловлены только порядком сортировки.

<table>
  <thead>
    <tr>
      <th style={{ width: '36%' }}>Запрос</th>
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

      <td style={{ textAlign: 'right' }}>2.381 с</td>
      <td style={{ textAlign: 'right' }}>1.660 с</td>
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

      <td style={{ textAlign: 'right' }}>2.148 с</td>
      <td style={{ textAlign: 'right' }}>0.058 с</td>
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

      <td style={{ textAlign: 'right' }}>2.192 с</td>
      <td style={{ textAlign: 'right' }}>0.012 с</td>
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

      <td style={{ textAlign: 'right' }}>2.968 с</td>
      <td style={{ textAlign: 'right' }}>0.010 с</td>
    </tr>
  </tbody>
</table>

## Материализованные представления \{#time-series-materialized-views\}

Другой вариант — использовать материализованные представления для агрегирования и хранения результатов популярных запросов. Эти результаты можно запрашивать вместо исходной таблицы. Предположим, что следующий запрос в нашем случае выполняется довольно часто:

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

10 строк в наборе. Затрачено: 2.285 сек. Обработано 231.41 млн строк, 9.22 ГБ (101.26 млн строк/с., 4.03 ГБ/с.)
Пиковое использование памяти: 1.50 ГиБ.
```

### Создание материализованного представления \{#time-series-create-materialized-view\}

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

### Заполнение целевой таблицы задним числом \{#time-series-backfill-destination-table\}

Эта целевая таблица будет заполняться только при вставке новых записей в таблицу `wikistat`, поэтому нам нужно выполнить [заполнение задним числом](/docs/data-modeling/backfilling).

Самый простой способ сделать это — использовать оператор [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) для непосредственной вставки данных в целевую таблицу материализованного представления [с использованием](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) `SELECT`‑запроса (трансформации) этого представления:

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

В зависимости от кардинальности исходного набора данных (у нас 1 миллиард строк!), этот подход может быть очень требовательным к памяти. В качестве альтернативы можно использовать вариант, который требует минимального объёма памяти:

* Создание временной таблицы с движком Null
* Подключение копии обычно используемого материализованного представления к этой временной таблице
* Использование запроса `INSERT INTO SELECT` для копирования всех данных из исходного набора данных во временную таблицу
* Удаление временной таблицы и временного материализованного представления.

При таком подходе строки из исходного набора данных копируются блоками во временную таблицу (которая при этом не сохраняет сами строки), и для каждого блока строк вычисляется промежуточное состояние и записывается в целевую таблицу, где эти состояния постепенно объединяются в фоновом режиме.

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

Далее мы создадим материализованное представление, которое будет читать из `wikistat_backfill` и записывать в `wikistat_top`

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

И наконец, мы заполним `wikistat_backfill` из исходной таблицы `wikistat`:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

Когда запрос завершится, мы можем удалить таблицу бэкфилла и материализованное представление:

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

Теперь вместо исходной таблицы мы можем выполнять запросы к материализованному представлению:

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

Получено 10 строк. Прошло: 0.004 сек.
```

Улучшение производительности здесь колоссальное.
Раньше на вычисление результата этого запроса уходило чуть больше 2 секунд, а теперь требуется всего 4 миллисекунды.
