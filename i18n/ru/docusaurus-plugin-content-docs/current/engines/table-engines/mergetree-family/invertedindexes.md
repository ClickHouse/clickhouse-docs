---
description: 'Быстрый поиск терминов в тексте.'
keywords: ['полнотекстовый поиск', 'текстовый индекс', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовый поиск с помощью текстовых индексов'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'Полнотекстовый поиск с помощью текстовых индексов'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# Полнотекстовый поиск с использованием текстовых индексов

<PrivatePreviewBadge/>

Текстовые индексы в ClickHouse (также называемые ["обратными индексами"](https://en.wikipedia.org/wiki/Inverted_index)) обеспечивают быстрый полнотекстовый поиск по строковым данным.
Индекс сопоставляет каждый токен в столбце со строками, которые содержат этот токен.
Токены генерируются в процессе, называемом токенизацией.
Например, ClickHouse по умолчанию токенизирует английское предложение "All cat like mice." как ["All", "cat", "like", "mice"] (обратите внимание, что завершающая точка игнорируется).
Доступны более продвинутые токенизаторы, например для логов.



## Создание текстового индекса {#creating-a-text-index}

Для создания текстового индекса сначала необходимо включить соответствующую экспериментальную настройку:

```sql
SET allow_experimental_full_text_index = true;
```

Текстовый индекс может быть определён для столбца типа [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md) и [Map](/sql-reference/data-types/map.md) (через функции [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)) с использованием следующего синтаксиса:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Обязательные параметры:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Необязательные параметры:
                                [, preprocessor = expression(str)]
                                -- Необязательные расширенные параметры:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**Аргумент tokenizer (обязательный)**. Аргумент `tokenizer` задаёт токенизатор:

- `splitByNonAlpha` разделяет строки по неалфавитно-цифровым символам ASCII (см. также функцию [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)).
- `splitByString(S)` разделяет строки по заданным пользователем строкам-разделителям `S` (см. также функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)).
  Разделители можно указать с помощью необязательного параметра, например: `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (`', '` в примере).
  Список разделителей по умолчанию, если не указан явно (например, `tokenizer = splitByString`), состоит из одного пробела `[' ']`.
- `ngrams(N)` разделяет строки на N-граммы одинакового размера (см. также функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длина N-граммы может быть указана с помощью необязательного целочисленного параметра от 2 до 8, например: `tokenizer = ngrams(3)`.
  Размер N-граммы по умолчанию, если не указан явно (например, `tokenizer = ngrams`), равен 3.
- `sparseGrams(min_length, max_length, min_cutoff_length)` разделяет строки на N-граммы переменной длины, содержащие как минимум `min_length` и максимум `max_length` (включительно) символов (см. также функцию [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)).
  Если не указано явно, значения `min_length` и `max_length` по умолчанию равны 3 и 100.
  Если указан параметр `min_cutoff_length`, в индексе сохраняются только N-граммы длиной больше или равной `min_cutoff_length`.
  По сравнению с `ngrams(N)`, токенизатор `sparseGrams` создаёт N-граммы переменной длины, что обеспечивает более гибкое представление исходного текста.
  Например, `tokenizer = sparseGrams(3, 5, 4)` внутренне генерирует 3-, 4-, 5-граммы из входной строки, но в индексе сохраняются только 4- и 5-граммы.
- `array` не выполняет токенизацию, т. е. каждое значение строки является токеном (см. также функцию [array](/sql-reference/functions/array-functions.md/#array)).

:::note
Токенизатор `splitByString` применяет разделители слева направо.
Это может приводить к неоднозначностям.
Например, строки-разделители `['%21', '%']` приведут к тому, что `%21abc` будет токенизирована как `['abc']`, тогда как перестановка обеих строк-разделителей `['%', '%21']` выдаст `['21abc']`.
В большинстве случаев желательно, чтобы при сопоставлении сначала использовались более длинные разделители.
Обычно это достигается передачей строк-разделителей в порядке убывания длины.
Если строки-разделители образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::


:::warning
В настоящее время не рекомендуется создавать текстовые индексы для текста на незападных языках, например китайском.
Поддерживаемые в данный момент токенизаторы могут привести к значительному увеличению размера индексов и времени выполнения запросов.
В будущем планируется добавить специализированные языково-специфичные токенизаторы, которые будут лучше справляться с такими случаями.
:::

Чтобы проверить, как токенизаторы разбивают входную строку, можно использовать функцию ClickHouse [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens):

Пример:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

Результат:

```result
['abc','bc ','c d',' de','def']
```

**Аргумент препроцессора (необязательный)**. Аргумент `preprocessor` представляет собой выражение, которое применяется к входной строке перед токенизацией.

Типичные варианты использования аргумента препроцессора включают:

1. Приведение к нижнему или верхнему регистру для обеспечения регистронезависимого сопоставления, например [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8) — см. первый пример ниже.
2. Нормализация UTF-8, например [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8).
3. Удаление или преобразование нежелательных символов или подстрок, например [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode).

Выражение препроцессора должно преобразовывать входное значение типа [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md) в значение того же типа.

Примеры:

- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

Кроме того, выражение препроцессора должно ссылаться только на столбец, для которого определен текстовый индекс.
Использование недетерминированных функций не допускается.

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) и [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) используют препроцессор для предварительного преобразования поискового термина перед его токенизацией.

Например:

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, 'Foo');
```

эквивалентно:

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, lower('Foo'));
```

**Другие аргументы (необязательные)**. Текстовые индексы в ClickHouse реализованы как [вторичные индексы](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types).
Однако, в отличие от других индексов с пропуском, текстовые индексы имеют значение GRANULARITY по умолчанию, равное 64.
Это значение выбрано эмпирически и обеспечивает хороший баланс между скоростью и размером индекса для большинства случаев использования.
Опытные пользователи могут указать другую гранулярность индекса (мы не рекомендуем этого делать).

<details markdown="1">

<summary>Необязательные расширенные параметры</summary>

Значения по умолчанию следующих расширенных параметров будут хорошо работать практически во всех ситуациях.
Мы не рекомендуем их изменять.

Необязательный параметр `dictionary_block_size` (по умолчанию: 128) задает размер блоков словаря в строках.

Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) указывает, используют ли блоки словаря фронтальное кодирование в качестве сжатия.

Необязательный параметр `max_cardinality_for_embedded_postings` (по умолчанию: 16) задает пороговое значение кардинальности, ниже которого списки постингов должны быть встроены в блоки словаря.


Необязательный параметр `bloom_filter_false_positive_rate` (по умолчанию: 0.1) задаёт долю ложноположительных срабатываний фильтра Блума словаря.

</details>

Текстовые индексы можно добавлять к столбцу или удалять из него после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## Использование текстового индекса {#using-a-text-index}

Использование текстового индекса в запросах SELECT не представляет сложности, поскольку стандартные функции поиска по строкам автоматически используют индекс.
Если индекс отсутствует, указанные ниже функции поиска по строкам будут выполнять медленное полное сканирование.

### Поддерживаемые функции {#functions-support}

Текстовый индекс может использоваться, если текстовые функции применяются в условии `WHERE` запроса SELECT:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` и `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) и `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) сопоставляют весь заданный поисковый термин целиком.

Пример:

```sql
SELECT * from tab WHERE str = 'Hello';
```

Текстовый индекс поддерживает `=` и `!=`, однако поиск по равенству и неравенству имеет смысл только с токенизатором `array` (он обеспечивает хранение в индексе полных значений строк).

#### `IN` и `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) и `NOT IN` ([notIn](/sql-reference/functions/in-functions)) аналогичны функциям `equals` и `notEquals`, но они сопоставляют все (`IN`) или ни один (`NOT IN`) из поисковых терминов.

Пример:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

Применяются те же ограничения, что и для `=` и `!=`, то есть `IN` и `NOT IN` имеют смысл только в сочетании с токенизатором `array`.

#### `LIKE`, `NOT LIKE` и `match` {#functions-example-like-notlike-match}

:::note
Эти функции в настоящее время используют текстовый индекс для фильтрации только в том случае, если токенизатор индекса является `splitByNonAlpha` или `ngrams`.
:::

Для использования `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)) и функции [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами ClickHouse должен иметь возможность извлекать полные токены из поискового термина.

Пример:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

`support` в примере может соответствовать `support`, `supports`, `supporting` и т.д.
Такой тип запроса является запросом подстроки и не может быть ускорен текстовым индексом.

Чтобы использовать текстовый индекс для запросов LIKE, шаблон LIKE должен быть переписан следующим образом:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

Пробелы слева и справа от `support` гарантируют, что термин может быть извлечен как токен.

#### `startsWith` и `endsWith` {#functions-example-startswith-endswith}

Аналогично `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startsWith) и [endsWith](/sql-reference/functions/string-functions.md/#endsWith) могут использовать текстовый индекс только в том случае, если из поискового термина можно извлечь полные токены.

Пример:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

В примере только `clickhouse` считается токеном.
`support` не является токеном, поскольку может соответствовать `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, начинающиеся с `clickhouse supports`, завершите поисковый шаблон завершающим пробелом:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, `endsWith` следует использовать с начальным пробелом:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` и `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) выполняют сопоставление с одним заданным токеном.

В отличие от ранее упомянутых функций, они не токенизируют поисковый термин (они предполагают, что входные данные являются одним токеном).

Пример:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

Функции `hasToken` и `hasTokenOrNull` являются наиболее производительными функциями для использования с индексом `text`.

#### `hasAnyTokens` and `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}


Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) выполняют поиск по одному или всем указанным токенам.

Эти функции принимают токены для поиска либо в виде строки, которая будет токенизирована с использованием того же токенизатора, что и для индексируемого столбца, либо в виде массива уже обработанных токенов, к которым токенизация перед поиском применяться не будет.
Подробнее см. в документации по функциям.

Пример:

```sql
-- Токены поиска переданы в виде строкового аргумента
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Токены поиска переданы в виде Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

Функция для массивов [has](/sql-reference/functions/array-functions#has) выполняет поиск одного токена в массиве строк.

Пример:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) (псевдоним `mapContainsKey`) выполняет поиск одного токена в ключах отображения.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- ИЛИ
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

Оператор доступа [operator[]](/sql-reference/operators#access-operators) может использоваться с текстовым индексом для фильтрации ключей и значений.

Пример:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

См. следующие примеры использования столбцов типа `Array(T)` и `Map(K, V)` с текстовым индексом.

### Примеры для столбцов `Array` и `Map` с текстовыми индексами {#text-index-array-and-map-examples}

#### Индексирование столбцов Array(String) {#text-index-example-array}

Представьте платформу для ведения блогов, где авторы категоризируют свои записи с помощью ключевых слов.
Мы хотим, чтобы пользователи находили связанный контент, выполняя поиск или переходя по темам.

Рассмотрим следующее определение таблицы:

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

Без текстового индекса поиск записей с определенным ключевым словом (например, `clickhouse`) требует сканирования всех записей:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- медленное полное сканирование таблицы - проверяет каждое ключевое слово в каждой записи
```

По мере роста платформы это становится все медленнее, поскольку запрос должен проверять каждый массив ключевых слов в каждой строке.
Чтобы решить эту проблему производительности, мы определяем текстовый индекс для столбца `keywords`:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Не забудьте перестроить индекс для существующих данных
```

#### Индексирование столбцов Map {#text-index-example-map}

Во многих сценариях наблюдаемости сообщения журналов разделяются на «компоненты» и сохраняются в соответствующих типах данных, например, дата и время для временной метки, перечисление для уровня журнала и т. д.
Поля метрик лучше всего хранить в виде пар ключ-значение.
Операционным командам необходимо эффективно выполнять поиск по журналам для отладки, расследования инцидентов безопасности и мониторинга.

Рассмотрим следующую таблицу журналов:

```sql
CREATE TABLE logs (
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

Без текстового индекса поиск по данным [Map](/sql-reference/data-types/map.md) требует полного сканирования таблицы:

```sql
-- Находит все журналы с данными об ограничении скорости:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- медленное полное сканирование таблицы

-- Находит все журналы с определенного IP-адреса:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- медленное полное сканирование таблицы
```

По мере роста объема журналов эти запросы становятся медленными.

Решением является создание текстового индекса для ключей и значений [Map](/sql-reference/data-types/map.md).
Используйте [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) для создания текстового индекса, когда необходимо находить журналы по именам полей или типам атрибутов:


```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

Используйте [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) для создания текстового индекса, когда вам нужно выполнять поиск по непосредственному содержимому атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

Примеры запросов:

```sql
-- Найти все запросы с ограничением частоты:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Найти все логи с конкретного IP-адреса:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```


## Настройка производительности {#performance-tuning}

### Прямое чтение {#direct-read}

Определенные типы текстовых запросов могут быть значительно ускорены с помощью оптимизации под названием «прямое чтение».
Точнее говоря, оптимизация может быть применена, если запрос SELECT _не_ выбирает данные из текстового столбца.

Пример:

```sql
SELECT column_a, column_b, ... -- не: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

Оптимизация прямого чтения в ClickHouse обрабатывает запрос исключительно с использованием текстового индекса (т. е. поиска по текстовому индексу) без обращения к базовому текстовому столбцу.
Поиск по текстовому индексу читает относительно небольшой объем данных и поэтому выполняется намного быстрее, чем обычные индексы пропуска в ClickHouse (которые выполняют поиск по индексу пропуска с последующей загрузкой и фильтрацией оставшихся гранул).

Прямое чтение управляется двумя настройками:

- Настройка [query_plan_direct_read_from_text_index](../../../operations/settings/settings#query_plan_direct_read_from_text_index), которая определяет, включено ли прямое чтение в целом.
- Настройка [use_skip_indexes_on_data_read](../../../operations/settings/settings#use_skip_indexes_on_data_read), которая является еще одним предварительным условием для прямого чтения. Обратите внимание, что в базах данных ClickHouse с [compatibility](../../../operations/settings/settings#compatibility) < 25.10 параметр `use_skip_indexes_on_data_read` отключен, поэтому вам необходимо либо повысить значение настройки совместимости, либо явно выполнить `SET use_skip_indexes_on_data_read = 1`.

Кроме того, текстовый индекс должен быть полностью материализован для использования прямого чтения (используйте для этого `ALTER TABLE ... MATERIALIZE INDEX`).

**Поддерживаемые функции**
Оптимизация прямого чтения поддерживает функции `hasToken`, `hasAllTokens` и `hasAnyTokens`.
Эти функции также могут быть объединены операторами AND, OR и NOT.
Предложение WHERE также может содержать дополнительные фильтры, не являющиеся функциями текстового поиска (для текстовых столбцов или других столбцов) — в этом случае оптимизация прямого чтения все равно будет использоваться, но менее эффективно (она применяется только к поддерживаемым функциям текстового поиска).

Чтобы проверить, использует ли запрос прямое чтение, выполните запрос с `EXPLAIN PLAN actions = 1`.
В качестве примера запрос с отключенным прямым чтением

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- отключить прямое чтение
         use_skip_indexes_on_data_read = 1;
```

возвращает

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

тогда как тот же запрос, выполненный с `query_plan_direct_read_from_text_index = 1`

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- включить прямое чтение
         use_skip_indexes_on_data_read = 1;
```

возвращает

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

Второй вывод EXPLAIN PLAN содержит виртуальный столбец `__text_index_<index_name>_<function_name>_<id>`.
Если этот столбец присутствует, значит используется прямое чтение.

### Кэширование {#caching}

Доступны различные кэши для буферизации частей текстового индекса в памяти (см. раздел [Детали реализации](#implementation)):
В настоящее время существуют кэши для десериализованных блоков словаря, заголовков и списков постингов текстового индекса для сокращения операций ввода-вывода.
Они могут быть включены через настройки [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache), [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) и [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache).
По умолчанию все кэши отключены.

Обратитесь к следующим настройкам сервера для конфигурации кэшей.

#### Настройки кэша блоков словаря {#caching-dictionary}


| Настройка                                                                                                                                             | Описание                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)           | Название политики кэширования блоков словаря текстового индекса.                                                                |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)               | Максимальный размер кэша в байтах.                                                                                  |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries) | Максимальное количество десериализованных блоков словаря в кэше.                                                    |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)   | Размер защищённой очереди в кэше блоков словаря текстового индекса относительно общего размера кэша. |

#### Настройки кэша заголовков {#caching-header}

| Настройка                                                                                                                         | Описание                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)           | Название политики кэширования заголовков текстового индекса.                                                                |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)               | Максимальный размер кэша в байтах.                                                                        |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries) | Максимальное количество десериализованных заголовков в кэше.                                                    |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)   | Размер защищённой очереди в кэше заголовков текстового индекса относительно общего размера кэша. |

#### Настройки кэша списков вхождений {#caching-posting-lists}

| Настройка                                                                                                                             | Описание                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)           | Название политики кэширования списков вхождений текстового индекса.                                                                |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)               | Максимальный размер кэша в байтах.                                                                          |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries) | Максимальное количество десериализованных списков вхождений в кэше.                                                     |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)   | Размер защищённой очереди в кэше списков вхождений текстового индекса относительно общего размера кэша. |


## Детали реализации {#implementation}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:

- словаря, который сопоставляет каждый токен со списком позиций, и
- набора списков позиций, каждый из которых представляет набор номеров строк.

Поскольку текстовый индекс является skip-индексом, эти структуры данных логически существуют для каждой гранулы индекса.

При создании индекса создаются три файла (на каждую часть):

**Файл блоков словаря (.dct)**

Токены в грануле индекса сортируются и сохраняются в блоках словаря по 128 токенов в каждом (размер блока настраивается параметром `dictionary_block_size`).
Файл блоков словаря (.dct) содержит все блоки словаря всех гранул индекса в части.

**Файл гранул индекса (.idx)**

Файл гранул индекса содержит для каждого блока словаря первый токен блока, его относительное смещение в файле блоков словаря и фильтр Блума для всех токенов в блоке.
Эта разреженная структура индекса аналогична [разреженному индексу первичного ключа](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)) ClickHouse.
Фильтр Блума позволяет пропускать блоки словаря на ранней стадии, если искомый токен не содержится в блоке словаря.

**Файл списков позиций (.pst)**

Списки позиций для всех токенов размещаются последовательно в файле списков позиций.
Для экономии места при сохранении возможности быстрых операций пересечения и объединения списки позиций хранятся в виде [roaring bitmaps](https://roaringbitmap.org/).
Если мощность списка позиций меньше 16 (настраивается параметром `max_cardinality_for_embedded_postings`), он встраивается в словарь.


## Пример: набор данных Hackernews {#hacker-news-dataset}

Рассмотрим улучшения производительности текстовых индексов на большом наборе данных с большим количеством текста.
Мы будем использовать 28,7 млн строк комментариев с популярного веб-сайта Hacker News.
Вот таблица без текстового индекса:

```sql
CREATE TABLE hackernews (
    id UInt64,
    deleted UInt8,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    children Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);
```

28,7 млн строк находятся в файле Parquet в S3 — вставим их в таблицу `hackernews`:

```sql
INSERT INTO hackernews
    SELECT * FROM s3Cluster(
        'default',
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        '
    id UInt64,
    deleted UInt8,
    type String,
    by String,
    time DateTime,
    text String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    kids Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32');
```

Используем `ALTER TABLE` и добавим текстовый индекс для столбца comment, затем материализуем его:

```sql
-- Добавить индекс
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Материализовать индекс для существующих данных
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

Теперь выполним запросы с использованием функций `hasToken`, `hasAnyTokens` и `hasAllTokens`.
Следующие примеры продемонстрируют значительную разницу в производительности между стандартным сканированием индекса и оптимизацией прямого чтения.

### 1. Использование `hasToken` {#using-hasToken}

`hasToken` проверяет, содержит ли текст определенный токен.
Выполним поиск токена 'ClickHouse' с учетом регистра.

**Прямое чтение отключено (стандартное сканирование)**
По умолчанию ClickHouse использует skip-индекс для фильтрации гранул, а затем читает данные столбца для этих гранул.
Можно имитировать это поведение, отключив прямое чтение.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 строка в наборе. Затрачено: 0,362 сек. Обработано 24,90 млн строк, 9,51 ГБ
```

**Прямое чтение включено (быстрое чтение индекса)**
Теперь выполним тот же запрос с включенным прямым чтением (по умолчанию).

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1 строка в наборе. Затрачено: 0,008 сек. Обработано 3,15 млн строк, 3,15 МБ
```

Запрос с прямым чтением более чем в 45 раз быстрее (0,362 с против 0,008 с) и обрабатывает значительно меньше данных (9,51 ГБ против 3,15 МБ), читая только из индекса.

### 2. Использование `hasAnyTokens` {#using-hasAnyTokens}

`hasAnyTokens` проверяет, содержит ли текст хотя бы один из указанных токенов.
Выполним поиск комментариев, содержащих либо 'love', либо 'ClickHouse'.

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1 строка в наборе. Затрачено: 1,329 сек. Обработано 28,74 млн строк, 9,72 ГБ
```

**Прямое чтение включено (быстрое чтение индекса)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

```


Получена 1 строка. Затрачено: 0.015 сек. Обработано 27.99 млн строк, 27.99 МБ

````
Ускорение ещё более впечатляющее для этого распространённого поиска с "ИЛИ".
Запрос выполняется почти в 89 раз быстрее (1.329 сек против 0.015 сек) благодаря отсутствию полного сканирования столбца.

### 3. Использование `hasAllTokens` {#using-hasAllTokens}

`hasAllTokens` проверяет, содержит ли текст все указанные токены.
Выполним поиск комментариев, содержащих одновременно 'love' и 'ClickHouse'.

**Прямое чтение отключено (стандартное сканирование)**
Даже при отключённом прямом чтении стандартный skip-индекс остаётся эффективным.
Он фильтрует 28.7 млн строк до 147.46 тыс. строк, но всё равно должен прочитать 57.03 МБ из столбца.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

Получена 1 строка. Затрачено: 0.184 сек. Обработано 147.46 тыс. строк, 57.03 МБ
````

**Прямое чтение включено (быстрое чтение индекса)**
Прямое чтение обрабатывает запрос, работая с данными индекса и считывая всего 147.46 КБ.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

Получена 1 строка. Затрачено: 0.007 сек. Обработано 147.46 тыс. строк, 147.46 КБ
```

Для этого поиска с "И" оптимизация прямого чтения работает более чем в 26 раз быстрее (0.184 сек против 0.007 сек), чем стандартное сканирование с использованием skip-индекса.

### 4. Составной поиск: ИЛИ, И, НЕ, ... {#compound-search}

Оптимизация прямого чтения также применяется к составным булевым выражениям.
Здесь выполним поиск без учёта регистра для 'ClickHouse' ИЛИ 'clickhouse'.

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

Получена 1 строка. Затрачено: 0.450 сек. Обработано 25.87 млн строк, 9.58 ГБ
```

**Прямое чтение включено (быстрое чтение индекса)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

Получена 1 строка. Затрачено: 0.013 сек. Обработано 25.87 млн строк, 51.73 МБ
```

Объединяя результаты из индекса, запрос с прямым чтением выполняется в 34 раза быстрее (0.450 сек против 0.013 сек) и не требует чтения 9.58 ГБ данных столбца.
Для данного конкретного случая предпочтительным, более эффективным синтаксисом является `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`.


## Связанные материалы {#related-content}

- Блог: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Блог: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)
