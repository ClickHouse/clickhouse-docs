---
slug: /optimize/skipping-indexes/examples
sidebar_label: 'Примеры индексов пропуска данных'
sidebar_position: 2
description: 'Сводные примеры индексов пропуска данных'
title: 'Примеры индексов пропуска данных'
doc_type: 'guide'
keywords: ['skipping indexes', 'data skipping', 'performance', 'indexing', 'best practices']
---



# Примеры индексов с пропуском данных {#data-skipping-index-examples}

На этой странице собраны примеры индексов с пропуском данных ClickHouse, показывающие, как объявлять каждый тип, когда их использовать и как проверять их применение. Все возможности работают с [таблицами семейства MergeTree](/engines/table-engines/mergetree-family/mergetree).

**Синтаксис индекса:**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse поддерживает пять типов индексов с пропуском:

| Тип индекса                             | Описание                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| **minmax**                              | Отслеживает минимальное и максимальное значения в каждой грануле |
| **set(N)**                              | Хранит до N различных значений на гранулу                     |
| **bloom_filter([false_positive_rate])** | Вероятностный фильтр для проверки существования               |
| **ngrambf_v1**                          | N-граммный фильтр Блума для поиска подстрок                   |
| **tokenbf_v1**                          | Токенизированный фильтр Блума для полнотекстового поиска      |

Каждый раздел содержит примеры с демонстрационными данными и показывает, как проверить использование индекса при выполнении запросов.


## Индекс MinMax {#minmax-index}

Индекс `minmax` наиболее эффективен для диапазонных предикатов на слабо упорядоченных данных или столбцах, коррелирующих с `ORDER BY`.

```sql
-- Определение в CREATE TABLE
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- Или добавление позже с материализацией
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- Запрос, который использует индекс
SELECT count() FROM events WHERE ts >= now() - 3600;

-- Проверка использования
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

См. [подробный пример](/best-practices/use-data-skipping-indices-where-appropriate#example) с `EXPLAIN` и отсечением данных.


## Индекс set {#set-index}

Используйте индекс `set`, когда локальная (на уровне блока) кардинальность низкая; он неэффективен, если каждый блок содержит много уникальных значений.

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

Процесс создания и материализации, а также эффект до и после применения индекса показаны в [руководстве по базовым операциям](/optimize/skipping-indexes#basic-operation).


## Общий фильтр Блума (скалярный) {#generic-bloom-filter-scalar}

Индекс `bloom_filter` хорошо подходит для проверки равенства и принадлежности IN при поиске «иголки в стоге сена». Он принимает необязательный параметр — частоту ложноположительных срабатываний (по умолчанию 0.025).

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## N-gram фильтр Блума (ngrambf_v1) для поиска подстрок {#n-gram-bloom-filter-ngrambf-v1-for-substring-search}

Индекс `ngrambf_v1` разбивает строки на n-граммы. Он эффективен для запросов вида `LIKE '%...%'`. Поддерживает типы String/FixedString/Map (через mapKeys/mapValues), а также настраиваемые размер, количество хеш-функций и seed. Подробнее см. в документации по [N-gram фильтру Блума](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter).

```sql
-- Создание индекса для поиска подстрок
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- Поиск подстроки
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[Это руководство](/use-cases/observability/schema-design#bloom-filters-for-text-search) содержит практические примеры и рекомендации по выбору между token и ngram индексами.

**Вспомогательные функции для оптимизации параметров:**

Четыре параметра ngrambf_v1 (размер n-граммы, размер битовой карты, количество хеш-функций, seed) существенно влияют на производительность и потребление памяти. Используйте эти функции для расчета оптимального размера битовой карты и количества хеш-функций на основе ожидаемого объема n-грамм и желаемой вероятности ложноположительных срабатываний:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- Пример расчета для 4300 n-грамм, p_false = 0.0001
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

Полное руководство по настройке параметров см. в [документации](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter).


## Токеновый фильтр Блума (tokenbf_v1) для поиска по словам {#token-bloom-filter-tokenbf-v1-for-word-based-search}

`tokenbf_v1` индексирует токены, разделённые неалфавитно-цифровыми символами. Его следует использовать с функцией [`hasToken`](/sql-reference/functions/string-search-functions#hasToken), шаблонами слов `LIKE` или операторами equals/IN. Поддерживает типы `String`/`FixedString`/`Map`.

Подробнее см. страницы [Токеновый фильтр Блума](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) и [Типы фильтров Блума](/optimize/skipping-indexes#skip-index-types).

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- Поиск по словам (без учёта регистра через lower)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

См. примеры для мониторинга и рекомендации по выбору между токеновыми и n-граммными индексами [здесь](/use-cases/observability/schema-design#bloom-filters-for-text-search).


## Добавление индексов при CREATE TABLE (несколько примеров) {#add-indexes-during-create-table-multiple-examples}

Индексы с пропуском также поддерживают составные выражения и типы `Map`/`Tuple`/`Nested`. Это показано в примере ниже:

```sql
CREATE TABLE t
(
  u64 UInt64,
  s String,
  m Map(String, String),

  INDEX idx_bf u64 TYPE bloom_filter(0.01) GRANULARITY 3,
  INDEX idx_minmax u64 TYPE minmax GRANULARITY 1,
  INDEX idx_set u64 * length(s) TYPE set(1000) GRANULARITY 4,
  INDEX idx_ngram s TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1,
  INDEX idx_token mapKeys(m) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY u64;
```


## Материализация индексов на существующих данных и проверка {#materializing-on-existing-data-and-verifying}

Вы можете добавить индекс к существующим частям данных с помощью `MATERIALIZE` и проверить отсечение гранул с помощью `EXPLAIN` или журналов трассировки, как показано ниже:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- Опционально: подробная информация об отсечении
SET send_logs_level = 'trace';
```

Этот [рабочий пример с minmax](/best-practices/use-data-skipping-indices-where-appropriate#example) демонстрирует структуру вывода EXPLAIN и количество отсеченных гранул.


## Когда использовать и когда избегать индексы пропуска {#when-use-and-when-to-avoid}

**Используйте индексы пропуска, когда:**

- Значения фильтра распределены разреженно внутри блоков данных
- Существует сильная корреляция со столбцами `ORDER BY` или шаблоны загрузки данных группируют похожие значения вместе
- Выполняется текстовый поиск по большим наборам данных логов (типы `ngrambf_v1`/`tokenbf_v1`)

**Избегайте индексов пропуска, когда:**

- Большинство блоков, вероятно, содержат хотя бы одно совпадающее значение (блоки будут прочитаны в любом случае)
- Выполняется фильтрация по столбцам с высокой кардинальностью без корреляции с порядком данных

:::note Важные замечания
Если значение встречается хотя бы один раз в блоке данных, ClickHouse должен прочитать весь блок. Тестируйте индексы на реалистичных наборах данных и настраивайте гранулярность и параметры, специфичные для типа индекса, на основе фактических измерений производительности.
:::


## Временное игнорирование или принудительное использование индексов {#temporarily-ignore-or-force-indexes}

Отключайте определённые индексы по имени для отдельных запросов при тестировании и устранении неполадок. Также существуют настройки для принудительного использования индексов при необходимости. См. [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices).

```sql
-- Игнорировать индекс по имени
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## Примечания и ограничения {#notes-and-caveats}

- Индексы пропуска данных поддерживаются только для [таблиц семейства MergeTree](/engines/table-engines/mergetree-family/mergetree); отсечение происходит на уровне гранул/блоков.
- Индексы на основе фильтров Блума являются вероятностными (ложноположительные срабатывания приводят к дополнительным чтениям, но не пропускают корректные данные).
- Фильтры Блума и другие индексы пропуска следует проверять с помощью `EXPLAIN` и трассировки; настраивайте гранулярность для баланса между эффективностью отсечения и размером индекса.


## Связанные документы {#related-docs}

- [Руководство по индексам пропуска данных](/optimize/skipping-indexes)
- [Руководство по рекомендациям](/best-practices/use-data-skipping-indices-where-appropriate)
- [Управление индексами пропуска данных](/sql-reference/statements/alter/skipping-index)
- [Информация в системных таблицах](/operations/system-tables/data_skipping_indices)
