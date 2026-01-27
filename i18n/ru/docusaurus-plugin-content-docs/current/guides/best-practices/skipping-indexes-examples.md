---
slug: /optimize/skipping-indexes/examples
sidebar_label: 'Индексы пропуска данных — примеры'
sidebar_position: 2
description: 'Сводные примеры индексов пропуска данных'
title: 'Примеры индексов пропуска данных'
doc_type: 'guide'
keywords: ['индексы пропуска данных', 'пропуск данных', 'производительность', 'индексирование', 'лучшие практики']
---

# Примеры индексов пропуска данных \{#data-skipping-index-examples\}

На этой странице собраны примеры индексов пропуска данных ClickHouse, показано, как объявить каждый тип, когда их использовать и как проверить, что они используются. Все возможности работают с [таблицами семейства MergeTree](/engines/table-engines/mergetree-family/mergetree).

**Синтаксис индекса:**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse поддерживает пять типов индексов пропуска данных:

| Index Type                                          | Description                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| **minmax**                                          | Отслеживает минимальные и максимальные значения в каждой грануле |
| **set(N)**                                          | Хранит до N различных значений в каждой грануле                  |
| **bloom&#95;filter([false&#95;positive&#95;rate])** | Вероятностный фильтр для проверки наличия значений               |
| **ngrambf&#95;v1**                                  | N-граммовый bloom-фильтр для поиска подстрок                     |
| **tokenbf&#95;v1**                                  | Bloom-фильтр на основе токенов для полнотекстового поиска        |

В каждом разделе приводятся примеры с демонстрационными данными и показывается, как проверить использование индекса при выполнении запроса.

## Индекс MinMax \{#minmax-index\}

Индекс `minmax` лучше всего подходит для диапазонных предикатов по слабо упорядоченным данным или по столбцам, коррелированным с `ORDER BY`.

```sql
-- Define in CREATE TABLE
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- Or add later and materialize
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- Query that benefits from the index
SELECT count() FROM events WHERE ts >= now() - 3600;

-- Verify usage
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

См. [подробный пример](/best-practices/use-data-skipping-indices-where-appropriate#example) с `EXPLAIN` и отсечением данных.

## Индекс set \{#set-index\}

Используйте индекс `set`, когда локальная кардинальность на уровне блока низкая; он неэффективен, если в каждом блоке много различных значений.

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

Процесс создания и материализации, а также эффект до/после показаны в [базовом руководстве по работе](/optimize/skipping-indexes#basic-operation).

## Универсальный Bloom-фильтр (скалярный) \{#generic-bloom-filter-scalar\}

Индекс `bloom_filter` хорошо подходит для поиска «иголки в стоге сена» по условию равенства или проверки принадлежности (оператор IN). Он принимает необязательный параметр — вероятность ложноположительных срабатываний (по умолчанию 0.025).

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```

## N-граммный фильтр Блума (ngrambf&#95;v1) для поиска подстрок \{#n-gram-bloom-filter-ngrambf-v1-for-substring-search\}

Индекс `ngrambf_v1` разбивает строки на n-граммы. Он хорошо подходит для запросов вида `LIKE '%...%'`. Поддерживаются типы String/FixedString/Map (через mapKeys/mapValues), а также настраиваемые размер, количество хэшей и значение seed. Дополнительные сведения см. в документации по [N-граммному фильтру Блума](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter).

```sql
-- Create index for substring search
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- Substring search
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[В этом руководстве](/use-cases/observability/schema-design#bloom-filters-for-text-search) приведены практические примеры и указано, в каких случаях использовать token, а в каких — ngram.

**Вспомогательные инструменты для оптимизации параметров:**

Четыре параметра ngrambf&#95;v1 (размер n-граммы, размер битовой карты, количество хеш-функций, seed) существенно влияют на производительность и потребление памяти. Используйте эти функции, чтобы вычислить оптимальный размер битовой карты и количество хеш-функций исходя из ожидаемого объёма n-грамм и требуемой доли ложноположительных срабатываний:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- Example sizing for 4300 ngrams, p_false = 0.0001
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

См. [документацию по параметрам](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) для получения подробных рекомендаций по настройке.

## Токен-блум-фильтр (tokenbf&#95;v1) для поиска по словам \{#token-bloom-filter-tokenbf-v1-for-word-based-search\}

`tokenbf_v1` индексирует токены, разделённые небуквенно-цифровыми символами. Используйте его с [`hasToken`](/sql-reference/functions/string-search-functions#hasToken), с шаблонами слов `LIKE` или с операторами равенства (`=`) и `IN`. Поддерживает типы `String`/`FixedString`/`Map`.

См. разделы [Token bloom filter](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) и [Bloom filter types](/optimize/skipping-indexes#skip-index-types) для получения дополнительной информации.

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- Word search (case-insensitive via lower)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

См. примеры по наблюдаемости и рекомендации по выбору token vs ngram [здесь](/use-cases/observability/schema-design#bloom-filters-for-text-search).

## Добавление индексов при выполнении CREATE TABLE (несколько примеров) \{#add-indexes-during-create-table-multiple-examples\}

Индексы пропуска данных также поддерживают составные выражения и типы `Map`/`Tuple`/`Nested`. Это показано в примере ниже:

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

## Материализация индекса на существующих данных и проверка \{#materializing-on-existing-data-and-verifying\}

Вы можете добавить индекс к уже существующим частям данных с помощью `MATERIALIZE` и проверить отсечение с помощью `EXPLAIN` или трассировочных журналов, как показано ниже:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- Optional: detailed pruning info
SET send_logs_level = 'trace';
```

Этот [подробный пример с minmax](/best-practices/use-data-skipping-indices-where-appropriate#example) демонстрирует структуру вывода EXPLAIN и счётчики отсечения.

## Когда использовать и когда избегать индексов пропуска данных \{#when-use-and-when-to-avoid\}

**Используйте индексы пропуска данных, когда:**

* Значения фильтра редко встречаются внутри блоков данных  
* Существует сильная корреляция со столбцами `ORDER BY` или шаблоны ингестии данных группируют похожие значения вместе  
* Выполняется текстовый поиск по большим наборам логов (типы `ngrambf_v1`/`tokenbf_v1`)

**Избегайте индексов пропуска данных, когда:**

* Большинство блоков, скорее всего, содержит хотя бы одно совпадающее значение (блоки всё равно будут прочитаны)  
* Фильтрация выполняется по высококардинальным столбцам без корреляции с порядком хранения данных

:::note Важные соображения
Если значение встречается хотя бы один раз в блоке данных, ClickHouse должен прочитать весь блок. Тестируйте индексы на реалистичных наборах данных и корректируйте гранулярность и зависящие от типа параметры на основе фактических показателей производительности.
:::

## Временно игнорировать или принудительно использовать индексы \{#temporarily-ignore-or-force-indexes\}

Отключайте отдельные индексы по имени для конкретных запросов во время тестирования и устранения неполадок. Также доступны настройки для принудительного использования индексов при необходимости. См. [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices).

```sql
-- Ignore an index by name
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```

## Примечания и ограничения \{#notes-and-caveats\}

* Индексы пропуска данных поддерживаются только для [таблиц семейства MergeTree](/engines/table-engines/mergetree-family/mergetree); отсечение данных выполняется на уровне гранулы/блока.  
* Индексы на основе Bloom-фильтра являются вероятностными (ложные срабатывания приводят к дополнительным чтениям, но не приводят к пропуску корректных данных).  
* Bloom-фильтры и другие индексы пропуска данных следует проверять с помощью `EXPLAIN` и трассировки; подбирайте гранулярность, чтобы сбалансировать степень отсечения данных и размер индекса.

## Связанные материалы \{#related-docs\}
- [Руководство по индексам пропуска данных](/optimize/skipping-indexes)
- [Руководство по лучшим практикам](/best-practices/use-data-skipping-indices-where-appropriate)
- [Управление индексами пропуска данных](/sql-reference/statements/alter/skipping-index)
- [Информация о системной таблице](/operations/system-tables/data_skipping_indices)
