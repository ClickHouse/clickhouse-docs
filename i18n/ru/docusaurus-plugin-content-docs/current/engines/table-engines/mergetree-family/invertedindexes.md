---
description: 'Быстро находите нужные термины в тексте.'
keywords: ['полнотекстовый поиск', 'текстовый индекс', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовый поиск с использованием текстовых индексов'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'Полнотекстовый поиск с использованием текстовых индексов'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Полнотекстовый поиск с использованием текстовых индексов {#full-text-search-using-text-indexes}

<PrivatePreviewBadge/>

Текстовые индексы в ClickHouse (также известные как ["обратные индексы"](https://en.wikipedia.org/wiki/Inverted_index)) обеспечивают быстрый полнотекстовый поиск по строковым данным.
Индекс сопоставляет каждый токен в столбце со строками, которые содержат этот токен.
Токены генерируются процессом, называемым токенизацией.
Например, ClickHouse по умолчанию токенизирует английское предложение "All cat like mice." как ["All", "cat", "like", "mice"] (обратите внимание, что завершающая точка игнорируется).
Доступны более продвинутые токенизаторы, например для данных журналов (логов).

## Создание текстового индекса {#creating-a-text-index}

Чтобы создать текстовый индекс, сначала включите соответствующий экспериментальный параметр:

```sql
SET allow_experimental_full_text_index = true;
```

Текстовый индекс может быть определён для столбцов типов [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md) и [Map](/sql-reference/data-types/map.md) (через функции работы с map [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)) с использованием следующего синтаксиса:

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
                                -- Дополнительные необязательные параметры:
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

* `splitByNonAlpha` разбивает строки по небуквенно-цифровым ASCII-символам (см. также функцию [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)).
* `splitByString(S)` разбивает строки по определённым пользовательским строкам-разделителям `S` (см. также функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)).
  Разделители можно задать с помощью необязательного параметра, например, `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (в примере — `', '`).
  Список разделителей по умолчанию, если он не указан явно (например, `tokenizer = splitByString`), содержит один пробел `[' ']`.
* `ngrams(N)` разбивает строки на `N`-граммы одинакового размера (см. также функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длину n-граммы можно задать с помощью необязательного целочисленного параметра от 2 до 8, например, `tokenizer = ngrams(3)`.
  Размер n-граммы по умолчанию, если он не указан явно (например, `tokenizer = ngrams`), равен 3.
* `sparseGrams(min_length, max_length, min_cutoff_length)` разбивает строки на n-граммы переменной длины как минимум из `min_length` и не более чем из `max_length` (включительно) символов (см. также функцию [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)).
  Если не указано явно, значения `min_length` и `max_length` по умолчанию равны 3 и 100.
  Если задан параметр `min_cutoff_length`, в индекс сохраняются только n-граммы с длиной не меньше `min_cutoff_length`.
  По сравнению с `ngrams(N)` токенизатор `sparseGrams` генерирует n-граммы переменной длины, что позволяет более гибко представлять исходный текст.
  Например, `tokenizer = sparseGrams(3, 5, 4)` генерирует из входной строки 3-, 4- и 5-граммы, но в индекс сохраняются только 4- и 5-граммы.
* `array` не выполняет токенизацию, т. е. каждое значение в строке является токеном (см. также функцию [array](/sql-reference/functions/array-functions.md/#array)).

:::note
Токенизатор `splitByString` применяет строки-разделители слева направо.
Это может приводить к неоднозначной токенизации.
Например, строки-разделители `['%21', '%']` приведут к тому, что `%21abc` будет токенизировано как `['abc']`, тогда как при перестановке строк-разделителей `['%', '%21']` результатом будет `['21abc']`.
В большинстве случаев нужно, чтобы при сопоставлении более длинные разделители имели приоритет.
Обычно это можно обеспечить, передавая строки-разделители в порядке убывания длины.
Если строки-разделители образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::

:::warning
В настоящее время не рекомендуется создавать текстовые индексы для текста на незападных языках, например китайском.
Поддерживаемые в данный момент токенизаторы могут привести к чрезмерно большим размерам индексов и длительному времени выполнения запросов.
В будущем планируется добавить специализированные языково-специфичные токенизаторы, которые будут лучше обрабатывать такие случаи.
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

Кроме того, выражение препроцессора должно ссылаться только на столбец, для которого определён текстовый индекс.
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

Необязательный параметр `dictionary_block_size` (по умолчанию: 128) задаёт размер блоков словаря в строках.

Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) указывает, используют ли блоки словаря фронтальное кодирование в качестве сжатия.

Необязательный параметр `max_cardinality_for_embedded_postings` (по умолчанию: 16) задаёт порог кардинальности, ниже которого списки постингов должны быть встроены в блоки словаря.

Необязательный параметр `bloom_filter_false_positive_rate` (по умолчанию: 0.1) задаёт вероятность ложноположительных срабатываний фильтра Блума словаря.

</details>

Текстовые индексы можно добавлять в столбец или удалять из него после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```

## Использование текстового индекса {#using-a-text-index}

Использовать текстовый индекс в запросах SELECT просто, так как стандартные функции строкового поиска автоматически используют индекс.
Если индекс отсутствует, приведённые ниже функции строкового поиска будут выполнять медленный полный перебор по всем данным.

### Поддерживаемые функции {#functions-support}

Текстовый индекс может быть использован, если текстовые функции применяются в условии `WHERE` запроса SELECT:

```sql
SELECT [...]
FROM [...]
WHERE функция_поиска_по_строке(столбец_с_текстовым_индексом)
```

#### `=` и `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) и `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) совпадают с заданным поисковым выражением целиком.

Пример:

```sql
SELECT * from tab WHERE str = 'Привет';
```

Индекс по тексту поддерживает операторы `=` и `!=`, однако поиск по равенству и неравенству имеет смысл только с токенизатором `array` (он приводит к тому, что индекс хранит значения целых строк).

#### `IN` и `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) и `NOT IN` ([notIn](/sql-reference/functions/in-functions)) похожи на функции `equals` и `notEquals`, но они выбирают все (`IN`) или ни одного (`NOT IN`) из искомых значений.

Пример:

```sql
SELECT * from tab WHERE str IN ('Привет', 'Мир');
```

Те же ограничения, что и для `=` и `!=`, действуют и здесь: `IN` и `NOT IN` имеют смысл только в сочетании с токенизатором `array`.

#### `LIKE`, `NOT LIKE` и `match` {#functions-example-like-notlike-match}

:::note
В настоящее время эти функции используют текстовый индекс для фильтрации только в том случае, если токенизатор индекса — `splitByNonAlpha` или `ngrams`.
:::

Чтобы использовать `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)) и функцию [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами, ClickHouse должен иметь возможность извлечь полные токены из поискового термина.

Пример:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

`support` в примере может соответствовать `support`, `supports`, `supporting` и т. д.
Такой запрос является запросом по подстроке, и его нельзя ускорить с помощью текстового индекса.

Чтобы использовать текстовый индекс для запросов с LIKE, шаблон LIKE нужно изменить следующим образом:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- или `% support %`
```

Пробелы слева и справа от `support` гарантируют, что термин может быть извлечён как токен.

#### `startsWith` и `endsWith` {#functions-example-startswith-endswith}

Аналогично оператору `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startsWith) и [endsWith](/sql-reference/functions/string-functions.md/#endsWith) могут использовать текстовый индекс только в том случае, если из поискового выражения могут быть извлечены полные токены.

Пример:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'поддержка clickhouse');
```

В этом примере только `clickhouse` считается токеном.
`support` не является токеном, так как он может соответствовать `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, которые начинаются с `clickhouse supports`, завершите шаблон поиска пробелом в конце:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, `endsWith` следует использовать с пробелом в начале строки:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` и `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) сопоставляют значение с одним заданным токеном.

В отличие от упомянутых выше функций, они не токенизируют искомое значение (предполагается, что на вход подаётся один токен).

Пример:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

Функции `hasToken` и `hasTokenOrNull` являются наиболее эффективными при использовании с индексом `text`.

#### `hasAnyTokens` и `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) сопоставляют строку соответственно с одним или со всеми указанными токенами.

Обе функции принимают поисковые токены либо в виде строки, которая будет разбита на токены с использованием того же токенизатора, что и для столбца, по которому построен индекс, либо в виде массива уже подготовленных токенов, к которым перед поиском токенизация применяться не будет.
См. документацию по функциям для получения дополнительной информации.

Пример:

```sql
-- Поисковые токены передаются как строковый аргумент
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Поисковые токены передаются как Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

Функция для работы с массивами [`has`](/sql-reference/functions/array-functions#has) проверяет наличие отдельного токена в массиве строк.

Пример:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) (псевдоним `mapContainsKey`) проверяет, содержится ли заданный токен среди ключей отображения.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

Оператор доступа [`operator[]`](/sql-reference/operators#access-operators) можно использовать с текстовым индексом для фильтрации по ключам и значениям.

Пример:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

Рассмотрим следующие примеры использования столбцов типов `Array(T)` и `Map(K, V)` с текстовым индексом.

### Примеры для столбцов `Array` и `Map` с текстовыми индексами {#text-index-array-and-map-examples}

#### Индексирование столбцов `Array(String)` {#text-index-example-array}

Представьте платформу для ведения блогов, где авторы классифицируют свои записи с помощью ключевых слов.
Мы хотим, чтобы пользователи могли находить похожие материалы, выполняя поиск или переходя по темам.

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

Без текстового индекса поиск постов с определённым ключевым словом (например, `clickhouse`) требует сканирования всех постов:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- медленное полное сканирование таблицы - проверяет каждое ключевое слово в каждой записи
```

По мере роста платформы выполнение запроса становится всё более медленным, поскольку ему приходится просматривать каждый массив `keywords` в каждой строке.
Чтобы решить эту проблему с производительностью, мы создаём текстовый индекс для столбца `keywords`:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Не забудьте материализовать индекс для существующих данных
```

#### Индексация столбцов типа Map {#text-index-example-map}

Во многих сценариях систем наблюдаемости сообщения логов разбиваются на отдельные «компоненты» и сохраняются в виде соответствующих типов данных, например тип `DateTime` для временной метки, `Enum` для уровня логирования и т. д.
Поля метрик оптимально хранить в виде пар «ключ–значение».
Операционным командам нужно эффективно искать по логам для отладки, расследования инцидентов информационной безопасности и мониторинга.

Рассмотрим следующую таблицу логов:

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

Без текстового индекса поиск по данным типа [Map](/sql-reference/data-types/map.md) требует полного сканирования таблицы:

```sql
-- Находит все логи с данными об ограничении скорости:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- медленное полное сканирование таблицы

-- Находит все логи с конкретного IP-адреса:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- медленное полное сканирование таблицы
```

По мере роста объёма логов эти запросы начинают работать медленнее.

Решение — создать текстовый индекс для ключей и значений типа [Map](/sql-reference/data-types/map.md).
Используйте [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) для создания текстового индекса, когда нужно находить логи по именам полей или типам атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

Используйте [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues), чтобы создать текстовый индекс, когда вам нужно выполнять поиск по самому содержимому атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

Примеры запросов:

```sql
-- Найти все запросы с ограничением скорости:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- быстро

-- Найти все логи с конкретного IP-адреса:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- быстро
```

## Оптимизация производительности {#performance-tuning}

### Прямое чтение {#direct-read}

Некоторые типы текстовых запросов можно значительно ускорить с помощью оптимизации, называемой «прямое чтение».
Более точно, эту оптимизацию можно применить, если в запросе SELECT текстовый столбец *не* выбирается.

Пример:

```sql
SELECT column_a, column_b, ... -- не: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

Оптимизация прямого чтения в ClickHouse обрабатывает запрос, используя исключительно текстовый индекс (т. е. обращения к текстовому индексу) без доступа к исходному текстовому столбцу.
Обращения к текстовому индексу читают относительно небольшой объём данных и поэтому значительно быстрее, чем обычные skip-индексы в ClickHouse (которые выполняют поиск по skip-индексу, а затем загружают и фильтруют отобранные гранулы).

Прямое чтение управляется двумя настройками:

* Настройка [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index), которая определяет, включено ли прямое чтение в целом.
* Настройка [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read), которая является ещё одним обязательным условием для прямого чтения. Обратите внимание, что в базах данных ClickHouse с [compatibility](../../../operations/settings/settings#compatibility) &lt; 25.10 `use_skip_indexes_on_data_read` отключена, поэтому вам нужно либо повысить значение настройки compatibility, либо явно выполнить `SET use_skip_indexes_on_data_read = 1`.

Кроме того, текстовый индекс должен быть полностью материализован, чтобы использовать прямое чтение (для этого используйте `ALTER TABLE ... MATERIALIZE INDEX`).

**Поддерживаемые функции**
Оптимизация прямого чтения поддерживает функции `hasToken`, `hasAllTokens` и `hasAnyTokens`.
Эти функции также могут комбинироваться операторами AND, OR и NOT.
Условие WHERE также может содержать дополнительные фильтры, не являющиеся функциями полнотекстового поиска (как для текстовых, так и для других столбцов) — в этом случае оптимизация прямого чтения всё равно будет использоваться, но менее эффективно (она применяется только к поддерживаемым функциям текстового поиска).

Чтобы убедиться, что запрос использует прямое чтение, выполните его с `EXPLAIN PLAN actions = 1`.
В качестве примера — запрос с отключённым прямым чтением

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

тогда как тот же запрос, выполненный при `query_plan_direct_read_from_text_index = 1`

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
Expression (перед GROUP BY)
Позиции:
  Фильтр
  Столбец фильтра: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (удалён)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

Вывод второго EXPLAIN PLAN содержит виртуальный столбец `__text_index_<index_name>_<function_name>_<id>`.
Если этот столбец присутствует, используется прямое чтение.

### Кэширование {#caching}

Доступны различные кэши для буферизации частей текстового индекса в памяти (см. раздел [Сведения о реализации](#implementation)):
В настоящее время доступны кэши для десериализованных блоков словаря, заголовков и списков постингов текстового индекса для снижения объема операций ввода-вывода (I/O).
Их можно включить с помощью настроек [use&#95;text&#95;index&#95;dictionary&#95;cache](/operations/settings/settings#use_text_index_dictionary_cache), [use&#95;text&#95;index&#95;header&#95;cache](/operations/settings/settings#use_text_index_header_cache) и [use&#95;text&#95;index&#95;postings&#95;cache](/operations/settings/settings#use_text_index_postings_cache).
По умолчанию все кэши отключены.

Для настройки кэшей используйте следующие параметры сервера.

#### Настройки кэша блоков словаря {#caching-dictionary}

| Параметр                                                                                                                                                  | Описание                                                                                                      |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | Название политики кэша блоков словаря текстового индекса.                                                    |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | Максимальный размер кэша в байтах.                                                                           |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | Максимальное количество десериализованных блоков словаря в кэше.                                             |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | Размер защищённой очереди в кэше блоков словаря текстового индекса относительно общего размера кэша.        |

#### Настройки кэша заголовков {#caching-header}

| Параметр                                                                                                                              | Описание                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | Название политики кэша заголовков текстового индекса.                                              |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | Максимальный размер кэша в байтах.                                                                 |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | Максимальное количество десериализованных заголовков в кэше.                                       |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | Размер защищённой очереди в кэше заголовков текстового индекса относительно общего размера кэша.  |

#### Настройки кэша списков вхождений {#caching-posting-lists}

| Параметр                                                                                                                               | Описание                                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | Название политики кэша списков вхождений текстового индекса.                                          |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | Максимальный размер кэша в байтах.                                                                    |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | Максимальное количество десериализованных списков вхождений в кэше.                                   |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | Размер защищённой очереди в кэше списков вхождений текстового индекса относительно общего размера кэша. |

## Детали реализации {#implementation}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:
- словаря, который отображает каждый токен на список вхождений, и
- набора списков вхождений, каждый из которых представляет собой набор номеров строк.

Поскольку текстовый индекс является skip-индексом, эти структуры данных логически существуют для каждой гранулы индекса.

Во время создания индекса создаются три файла (на каждую part):

**Файл блоков словаря (.dct)**

Токены в грануле индекса сортируются и сохраняются в блоках словаря по 128 токенов в каждом (размер блока настраивается параметром `dictionary_block_size`).
Файл блоков словаря (.dct) содержит все блоки словаря всех гранул индекса в одной part.

**Файл гранул индекса (.idx)**

Файл гранул индекса содержит для каждого блока словаря первый токен блока, его относительное смещение в файле блоков словаря и фильтр Блума для всех токенов в блоке.
Эта разреженная структура индекса аналогична [разреженному индексу первичного ключа](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes) в ClickHouse.
Фильтр Блума позволяет заранее отбрасывать блоки словаря, если разыскиваемый токен не содержится в блоке словаря.

**Файл списков вхождений (.pst)**

Списки вхождений для всех токенов располагаются последовательно в файле списков вхождений.
Чтобы экономить место и при этом обеспечивать быстрые операции пересечения и объединения, списки вхождений хранятся в виде [roaring bitmaps](https://roaringbitmap.org/).
Если кардинальность списка вхождений меньше 16 (настраивается параметром `max_cardinality_for_embedded_postings`), он встраивается в словарь.

## Пример: датасет Hacker News {#hacker-news-dataset}

Рассмотрим, как текстовые индексы улучшают производительность на большом текстовом наборе данных.
Мы будем использовать 28,7 млн строк комментариев с популярного сайта Hacker News.
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

28,7 млн строк хранятся в Parquet-файле в S3 — давайте загрузим их в таблицу `hackernews`:

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

Используем `ALTER TABLE`, создадим текстовый индекс по столбцу comment, затем материализуем его:

```sql
-- Добавить индекс
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Материализовать индекс для существующих данных
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

Теперь давайте выполним запросы с использованием функций `hasToken`, `hasAnyTokens` и `hasAllTokens`.
Следующие примеры покажут существенную разницу в производительности между стандартным сканированием индекса и оптимизацией прямого чтения.

### 1. Использование `hasToken` {#using-hasToken}

`hasToken` проверяет, содержит ли текст указанный одиночный токен.
Мы будем искать регистрозависимый токен `ClickHouse`.

**Прямое чтение отключено (стандартное сканирование)**
По умолчанию ClickHouse использует skip-индекс для фильтрации гранул, а затем читает данные столбца для этих гранул.
Мы можем смоделировать это поведение, отключив прямое чтение.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 строка в наборе. Прошло: 0,362 сек. Обработано 24,90 млн строк, 9,51 ГБ
```

**Включено прямое чтение (Fast index read)**
Теперь запустим тот же запрос с включённым режимом прямого чтения (это значение по умолчанию).

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

Обработана 1 строка. Затрачено: 0.008 сек. Обработано 3.15 млн строк, 3.15 МБ
```

Запрос прямого чтения более чем в 45 раз быстрее (0,362 с против 0,008 с) и обрабатывает значительно меньше данных (9,51 ГБ против 3,15 МБ), поскольку читает только из индекса.

### 2. Использование `hasAnyTokens` {#using-hasAnyTokens}

`hasAnyTokens` проверяет, содержит ли текст хотя бы один из заданных токенов.
Мы будем искать комментарии, содержащие либо «love», либо «ClickHouse».

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 1.329 sec. Processed 28.74 million rows, 9.72 GB
```

**Включено прямое чтение (быстрое чтение индекса)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘
```

1 строка в наборе. Прошло: 0.015 сек. Обработано 27.99 млн строк, 27.99 МБ

````
Ускорение ещё более впечатляющее для этого распространённого поиска с условием "ИЛИ".
Запрос выполняется почти в 89 раз быстрее (1.329 с против 0.015 с) благодаря отсутствию полного сканирования столбца.

### 3. Использование `hasAllTokens`                       {#using-hasAllTokens}

`hasAllTokens` проверяет, содержит ли текст все указанные токены.
Выполним поиск комментариев, содержащих одновременно 'love' и 'ClickHouse'.

**Прямое чтение отключено (стандартное сканирование)**
Даже при отключённом прямом чтении стандартный skip-индекс остаётся эффективным.
Он сокращает 28,7 млн строк до 147,46 тыс. строк, но всё равно должен прочитать 57,03 МБ из столбца.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.184 sec. Processed 147.46 thousand rows, 57.03 MB
````

**Прямое чтение (Fast index read) включено**
Прямое чтение обрабатывает запрос, работая только с данными индекса и считывая всего 147,46 КБ.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1 строка в наборе. Затрачено: 0.007 сек. Обработано 147.46 тыс. строк, 147.46 КБ
```

Для этого поиска с оператором &quot;AND&quot; оптимизация прямого чтения более чем в 26 раз быстрее (0.184 s против 0.007 s), чем стандартное сканирование с использованием skip-индекса.

### 4. Составной поиск: OR, AND, NOT, ... {#compound-search}

Оптимизация прямого чтения также применима к составным булевым выражениям.
Здесь мы выполним поиск без учета регистра для &#39;ClickHouse&#39; OR &#39;clickhouse&#39;.

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1 строка в результате. Время выполнения: 0.450 сек. Обработано 25.87 млн строк, 9.58 ГБ
```

**Прямое чтение включено (быстрый доступ к индексу)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

Обработана 1 строка. Затрачено: 0.013 сек. Обработано 25.87 млн строк, 51.73 МБ
```

Благодаря объединению результатов из индекса прямой запрос на чтение выполняется в 34 раза быстрее (0,450 s против 0,013 s) и позволяет избежать чтения 9,58 GB данных столбцов.
В этом конкретном случае предпочтительнее использовать более эффективный синтаксис `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`.

## Связанные материалы {#related-content}

- Статья в блоге: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Статья в блоге: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)
