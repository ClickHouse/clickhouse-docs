---
slug: /use-cases/observability/clickstack/dashboards/sql-visualizations
title: 'SQL-визуализации'
sidebar_label: 'SQL-визуализации'
pagination_prev: null
pagination_next: null
description: 'Создание SQL-визуализаций в ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'панель мониторинга', 'визуализация', 'SQL', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import sql_editor_button from '@site/static/images/use-cases/observability/sql-editor-button.png';

ClickStack поддерживает визуализации на основе SQL-запросов. Это дает полный контроль над логикой запроса, сохраняя при этом интеграцию с временными диапазонами на уровне панели мониторинга, фильтрами и отображением диаграмм.

Визуализации на основе SQL полезны, когда нужно выйти за рамки встроенного Chart Explorer — например, чтобы объединять таблицы или строить сложные агрегации, которые не поддерживает конструктор диаграмм.


## Создание SQL-визуализации \{#creating-a-raw-sql-chart\}

Чтобы создать SQL-визуализацию, откройте редактор плитки панели мониторинга и выберите вкладку **SQL**. 

<Image img={sql_editor_button} alt="SQL Editor Button" size="lg"/>

Далее:

1. Выберите **подключение ClickHouse**, для которого будет выполняться запрос.
2. При необходимости выберите **источник** — это позволит применять к вашей диаграмме фильтры уровня панели мониторинга через макрос `$__filters`.
3. Напишите SQL-запрос в редакторе, используя параметры запроса и макросы, чтобы связать его с временным диапазоном и фильтрами панели мониторинга.
4. Нажмите кнопку **play**, чтобы просмотреть результаты, затем нажмите **Save**.

## Параметры запроса \{#query-parameters\}

[Параметры запроса](/sql-reference/syntax#defining-and-using-query-parameters) позволяют ссылаться в SQL на текущий временной диапазон и детализацию панели мониторинга. Они используют синтаксис параметризованных запросов ClickHouse: `{paramName:Type}`.

### Доступные параметры \{#available-parameters\}

Доступные параметры зависят от типа диаграммы:

**Линейные диаграммы и столбчатые диаграммы с накоплением:**

| Параметр                        | Тип   | Описание                                                                  |
| ------------------------------- | ----- | ------------------------------------------------------------------------- |
| `{startDateMilliseconds:Int64}` | Int64 | Начало диапазона дат панели мониторинга (миллисекунды с начала эпохи)     |
| `{endDateMilliseconds:Int64}`   | Int64 | Конец диапазона дат панели мониторинга (миллисекунды с начала эпохи)      |
| `{intervalSeconds:Int64}`       | Int64 | Размер временного бакета в секундах (в зависимости от гранулярности)      |
| `{intervalMilliseconds:Int64}`  | Int64 | Размер временного бакета в миллисекундах (в зависимости от гранулярности) |

**Таблицы, круговые и числовые диаграммы:**

| Параметр                        | Тип   | Описание                                                              |
| ------------------------------- | ----- | --------------------------------------------------------------------- |
| `{startDateMilliseconds:Int64}` | Int64 | Начало диапазона дат панели мониторинга (миллисекунды с начала эпохи) |
| `{endDateMilliseconds:Int64}`   | Int64 | Конец диапазона дат панели мониторинга (миллисекунды с начала эпохи)  |

## Макросы \{#macros\}

Макросы — это сокращённые конструкции, которые разворачиваются в часто используемые SQL-выражения ClickHouse. Они имеют префикс `$__` и подставляются до отправки запроса в ClickHouse.

### Макросы границ времени \{#time-boundary-macros\}

Эти макросы возвращают выражение ClickHouse, соответствующее времени начала или окончания панели мониторинга. Они не принимают аргументов.

| Макрос           | Разворачивается в                                                     | Тип столбца |
| ---------------- | --------------------------------------------------------------------- | ----------- |
| `$__fromTime`    | `toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))` | DateTime    |
| `$__toTime`      | `toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))`   | DateTime    |
| `$__fromTime_ms` | `fromUnixTimestamp64Milli({startDateMilliseconds:Int64})`             | DateTime64  |
| `$__toTime_ms`   | `fromUnixTimestamp64Milli({endDateMilliseconds:Int64})`               | DateTime64  |
| `$__interval_s`  | `{intervalSeconds:Int64}`                                             | Int64       |

### Макросы фильтра времени \{#time-filter-macros\}

Эти макросы генерируют фрагмент предложения `WHERE`, который фильтрует столбец по временному диапазону панели мониторинга.

| Макрос                                | Описание                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `$__timeFilter(column)`               | Фильтрует столбец `DateTime` по временному диапазону панели мониторинга                  |
| `$__timeFilter_ms(column)`            | Фильтрует столбец `DateTime64` (миллисекунды) по временному диапазону панели мониторинга |
| `$__dateFilter(column)`               | Фильтрует столбец `Date` по временному диапазону панели мониторинга                      |
| `$__dateTimeFilter(dateCol, timeCol)` | Фильтрует с использованием отдельных столбцов `Date` и `DateTime`                        |
| `$__dt(dateCol, timeCol)`             | Псевдоним для `$__dateTimeFilter`                                                        |

**Пример развёртывания** `$__timeFilter(TimestampTime)`:

```sql
TimestampTime >= toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
AND TimestampTime <= toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
```


### Макросы временных интервалов \{#time-interval-macros\}

Эти макросы разбивают столбец с временной меткой на интервалы, соответствующие гранулярности панели мониторинга. Обычно они используются в предложениях `SELECT` и `GROUP BY` для диаграмм временных рядов. Они доступны только для визуализаций Line и столбчатая диаграмма с накоплением.

| Macro                        | Description                                                            |
|------------------------------|------------------------------------------------------------------------|
| `$__timeInterval(column)`    | Разбивает столбец `DateTime` на интервалы по `intervalSeconds`        |
| `$__timeInterval_ms(column)` | Разбивает столбец `DateTime64` на интервалы по `intervalMilliseconds` |

**пример развёртывания** `$__timeInterval(TimestampTime)`:

```sql
toStartOfInterval(toDateTime(TimestampTime), INTERVAL {intervalSeconds:Int64} second)
```

### Макрос фильтра панели мониторинга \{#dashboard-filter-macro\}

| Macro         | Description                                                                            |
|---------------|----------------------------------------------------------------------------------------|
| `$__filters`  | Заменяется условиями фильтрации на уровне панели мониторинга (требуется выбрать источник) |

Когда на диаграмме выбран **источник** и фильтры панели мониторинга активны, `$__filters` разворачивается в соответствующие условия SQL `WHERE`. Если источник не выбран или фильтры не применены, он разворачивается в `(1=1)`, поэтому его всегда безопасно включать в предложение `WHERE`.

## Как строятся результаты запроса \{#how-results-are-plotted\}

ClickStack автоматически сопоставляет столбцы результатов с элементами диаграммы на основе типов столбцов. Правила сопоставления различаются в зависимости от типа диаграммы.

### Линейные и столбчатые диаграммы с накоплением \{#line-and-stacked-bar-charts\}

| роль               | Column type                        | Description                                                                                 |
|--------------------|------------------------------------|---------------------------------------------------------------------------------------------|
| **Timestamp**      | Первый столбец типа `Date` или `DateTime`  | Используется в качестве оси X.                                                                         |
| **Series Value**   | Все числовые столбцы                | Каждый числовой столбец отображается как отдельная серия. Обычно это агрегированные значения.   |
| **Group Names**    | Столбцы String, Map или Array      | Необязательно. Строки с разными значениями групп отображаются как отдельные серии.                   |

### Круговая диаграмма \{#pie-chart\}

| Роль                 | Тип столбца                   | Описание                                                             |
| -------------------- | ----------------------------- | -------------------------------------------------------------------- |
| **Значение сектора** | Первый числовой столбец       | Определяет размер каждого сектора.                                   |
| **Метка сектора**    | Столбцы String, map или Array | Необязательно. Каждое уникальное значение становится меткой сектора. |

### Числовая диаграмма \{#number-chart\}

| Роль      | Тип столбца             | Описание                                                          |
| --------- | ----------------------- | ----------------------------------------------------------------- |
| **Число** | Первый числовой столбец | Отображается значение из первой строки первого числового столбца. |

### Таблица \{#table-chart\}

Все столбцы результата отображаются непосредственно в виде столбцов таблицы.

## Примеры \{#examples\}

:::note Требуется доступ к системной таблице
Если вы запускаете следующие примеры на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com), необходимо указать `otel_v2.otel_logs` или `otel_v2.otel_traces`.
:::

### Линейная диаграмма — количество логов во времени по сервисам \{#example-line-chart\}

Этот запрос подсчитывает количество событий логов для каждого сервиса, группируя их по временным интервалам, соответствующим гранулярности панели мониторинга.

```sql
SELECT
  toStartOfInterval(TimestampTime, INTERVAL {intervalSeconds:Int64} second) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

- `ts` (DateTime) используется как метка времени на оси x.
- `count` (числовое значение) отображается как значение серии.
- `ServiceName` (строковое значение) создаёт отдельную линию для каждого сервиса.

### Линейная диаграмма — с использованием макросов \{#example-line-chart-macros\}

Тот же запрос, записанный с использованием макросов для краткости:

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

### Столбчатая диаграмма с накоплением — количество ошибок по уровню серьезности \{#example-stacked-bar\}

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  lower(SeverityText),
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND lower(SeverityText) IN ('error', 'warn')
  AND $__filters
GROUP BY SeverityText, ts
ORDER BY ts ASC
```


### Таблица — 10 самых медленных конечных точек \{#example-table\}

```sql
SELECT
  SpanName AS endpoint,
  avg(Duration) / 1000 AS avg_duration_ms,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY SpanName
ORDER BY avg_duration_ms DESC
LIMIT 10
```


### Круговая диаграмма — распределение запросов по сервисам \{#example-pie\}

```sql
SELECT
  ServiceName,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY ServiceName
```

* `request_count` (числовое значение) определяет размер каждого сегмента.
* `ServiceName` (string) задаёт подпись для каждого сегмента.


### Числовая диаграмма — общее количество ошибок \{#example-number\}

```sql
SELECT
  count() AS total_errors
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND SeverityText = 'error'
  AND $__filters
```

Отображается единственное числовое значение `total_errors` из первой строки.


## Примечания \{#notes\}

- SQL-визуализации выполняются при включённом режиме `readonly` — разрешены только запросы `SELECT`.
- SQL-визуализации должны содержать ровно один SQL-запрос — несколько запросов не поддерживаются.
- Редактор SQL предлагает автодополнение как для параметров запроса, так и для макросов.
- Чтобы применять фильтры панели мониторинга к SQL-визуализациям, необходимо выбрать источник. Для точной фильтрации источник должен соответствовать таблице, к которой выполняется запрос.