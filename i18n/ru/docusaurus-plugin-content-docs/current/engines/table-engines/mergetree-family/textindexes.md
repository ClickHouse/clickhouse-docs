---
description: 'Быстро находите поисковые запросы в тексте.'
keywords: ['полнотекстовый поиск', 'текстовый индекс', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовый поиск с использованием текстовых индексов'
slug: /engines/table-engines/mergetree-family/textindexes
title: 'Полнотекстовый поиск с использованием текстовых индексов'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Полнотекстовый поиск с использованием текстовых индексов \{#full-text-search-using-text-indexes\}

<BetaBadge/>

Текстовые индексы в ClickHouse (также известные как ["обратные индексы"](https://en.wikipedia.org/wiki/Inverted_index)) обеспечивают быстрый полнотекстовый поиск по строковым данным.
Индекс сопоставляет каждый токен в столбце со строками, которые содержат этот токен.
Токены генерируются процессом, называемым токенизацией.
Например, по умолчанию ClickHouse разбивает английское предложение "All cat like mice." на токены ["All", "cat", "like", "mice"] (обратите внимание, что завершающая точка игнорируется).
Также доступны более продвинутые токенизаторы, например для данных журналов (логов).

## Создание текстового индекса \{#creating-a-text-index\}

Чтобы создать текстовый индекс, сначала включите соответствующую экспериментальную настройку:

```sql
SET enable_full_text_index = true;
```

Текстовый индекс можно определить для столбца следующих типов: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md) и [Map](/sql-reference/data-types/map.md) (через функции работы с Map [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues)) с помощью следующего синтаксиса:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, posting_list_block_size = C]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

**Аргумент tokenizer (обязательный)**. Аргумент `tokenizer` задаёт токенизатор:

* `splitByNonAlpha` разбивает строки по неалфавитно-цифровым ASCII-символам (см. также функцию [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)).
* `splitByString(S)` разбивает строки по определённым пользовательским строкам-разделителям `S` (см. также функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)).
  Разделители можно задать с помощью необязательного параметра, например, `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (в примере это `', '`).
  Список разделителей по умолчанию, если он не задан явно (например, `tokenizer = splitByString`), — это один пробел `[' ']`.
* `ngrams(N)` разбивает строки на равные по размеру n-граммы длиной `N` (см. также функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длину n-граммы можно задать с помощью необязательного целочисленного параметра от 1 до 8, например, `tokenizer = ngrams(3)`.
  Размер n-граммы по умолчанию, если он не задан явно (например, `tokenizer = ngrams`), — 3.
* `sparseGrams(min_length, max_length, min_cutoff_length)` разбивает строки на n-граммы переменной длины не короче `min_length` и не длиннее `max_length` (включительно) символов (см. также функцию [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)).
  Если явно не указаны иные значения, `min_length` и `max_length` по умолчанию равны 3 и 100.
  Если параметр `min_cutoff_length` задан, возвращаются только n-граммы длиной не меньше `min_cutoff_length`.
  По сравнению с `ngrams(N)` токенизатор `sparseGrams` создаёт n-граммы переменной длины, что позволяет более гибко представлять исходный текст.
  Например, при `tokenizer = sparseGrams(3, 5, 4)` внутренне создаются 3-, 4- и 5-граммы из входной строки, но возвращаются только 4- и 5-граммы.
* `array` не выполняет токенизацию, т. е. каждое значение строки является токеном (см. также функцию [array](/sql-reference/functions/array-functions.md/#array)).

:::note
Токенизатор `splitByString` применяет разделители слева направо.
Это может создавать неоднозначности.
Например, строки-разделители `['%21', '%']` приведут к тому, что `%21abc` будет токенизировано как `['abc']`, тогда как при перестановке разделителей `['%', '%21']` результатом будет `['21abc']`.
В большинстве случаев требуется, чтобы при сопоставлении преимущество отдавалось более длинным разделителям.
Обычно этого можно добиться, передавая строки-разделители в порядке убывания их длины.
Если строки-разделители образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::

:::warning
На данный момент не рекомендуется строить текстовые индексы поверх текста на не‑западных языках, например китайском.
Поддерживаемые сейчас токенизаторы могут приводить к огромным размерам индекса и длительному выполнению запросов.
В будущем мы планируем добавить специализированные токенизаторы для отдельных языков, которые будут лучше обрабатывать такие случаи.
:::


Чтобы проверить, как токенизаторы разбивают входную строку, можно использовать функцию [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) ClickHouse:

Пример:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

Результат:

```result
['abc','bc ','c d',' de','def']
```

**Аргумент preprocessor (необязательный)**. Аргумент `preprocessor` — это выражение, которое применяется к входной строке перед токенизацией.

Типичные сценарии использования аргумента препроцессора включают

1. Приведение к нижнему или верхнему регистру для обеспечения сопоставления без учета регистра, например [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8), см. первый пример ниже.
2. Нормализация в UTF-8, например [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8).
3. Удаление или преобразование нежелательных символов или подстрок, например [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode).

Выражение препроцессора должно преобразовывать входное значение типа [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md) в значение того же типа.

Примеры:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

Кроме того, выражение препроцессора должно ссылаться только на столбец, на основе которого определён текстовый индекс.
Использование недетерминированных функций не допускается.

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) и [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) используют препроцессор для преобразования поискового термина перед его токенизацией.

Например,

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

**Прочие аргументы (необязательные)**. Текстовые индексы в ClickHouse реализованы как [вторичные индексы](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types).
Однако, в отличие от других индексов с пропуском данных, текстовые индексы имеют бесконечную гранулярность, то есть текстовый индекс создаётся для всей части, а явно заданная гранулярность индекса игнорируется.
Это значение было выбрано эмпирически и обеспечивает хороший баланс между скоростью и размером индекса для большинства случаев использования.
Опытные пользователи могут указать другую гранулярность индекса (мы не рекомендуем этого делать).

<details markdown="1">
  <summary>Необязательные расширенные параметры</summary>

Значения по умолчанию для следующих расширенных параметров подойдут практически во всех случаях.
Мы не рекомендуем их изменять.

Необязательный параметр `dictionary_block_size` (по умолчанию: 512) задаёт размер блоков словаря в строках.

Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) определяет, используют ли блоки словаря front coding в качестве метода сжатия.

Необязательный параметр `posting_list_block_size` (по умолчанию: 1048576) задаёт размер блоков списков постингов в строках.

</details>

Текстовые индексы можно добавить к столбцу или удалить из него после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## Использование текстового индекса \{#using-a-text-index\}

Использовать текстовый индекс в запросах SELECT достаточно просто, так как стандартные строковые функции поиска автоматически задействуют индекс.
Если индекс отсутствует, приведённые ниже строковые функции поиска будут выполнять медленное полное (brute-force) сканирование.

### Поддерживаемые функции \{#functions-support\}

Текстовый индекс можно использовать, если в условиях `WHERE` или `PREWHERE` используются текстовые функции:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` и `!=` \{#functions-example-equals-notequals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) и `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) проверяют полное совпадение с указанным поисковым термином.

Пример:

```sql
SELECT * from tab WHERE str = 'Hello';
```

Текстовый индекс поддерживает `=` и `!=`, однако поиск по условиям равенства и неравенства имеет смысл только с токенизатором `array` (он приводит к тому, что индекс хранит значения целых строк).


#### `IN` и `NOT IN` \{#functions-example-in-notin\}

`IN` ([in](/sql-reference/functions/in-functions)) и `NOT IN` ([notIn](/sql-reference/functions/in-functions)) аналогичны функциям `equals` и `notEquals`, но проверяют соответствие всем (`IN`) или ни одному (`NOT IN`) искомым значениям.

Пример:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

Действуют те же ограничения, что и для `=` и `!=`, то есть `IN` и `NOT IN` имеют смысл только при использовании токенизатора `array`.


#### `LIKE`, `NOT LIKE` и `match` \{#functions-example-like-notlike-match\}

:::note
В настоящее время эти функции используют текстовый индекс для фильтрации только в том случае, если токенизатор индекса — `splitByNonAlpha`, `ngrams` или `sparseGrams`.
:::

Чтобы использовать `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)) и функцию [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами, ClickHouse должен иметь возможность извлечь полные токены из поискового запроса.
Для индекса с токенизатором `ngrams` это условие выполняется, если длина искомых строк между символами подстановки не меньше длины n-граммы.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

`support` в этом примере может соответствовать `support`, `supports`, `supporting` и т. д.
Такой тип запроса является запросом на поиск подстроки, и его нельзя ускорить с помощью текстового индекса.

Чтобы использовать текстовый индекс для запросов с LIKE, шаблон LIKE необходимо переписать следующим образом:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

Пробелы слева и справа от `support` обеспечивают, что этот термин будет распознан как отдельный токен.


#### `startsWith` и `endsWith` \{#functions-example-startswith-endswith\}

По аналогии с `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startsWith) и [endsWith](/sql-reference/functions/string-functions.md/#endsWith) могут использовать текстовый индекс только в том случае, если из поискового термина можно извлечь целые токены.
Для индекса с токенизатором `ngrams` это выполняется, если длина фрагментов искомой строки между подстановочными символами больше либо равна длине n-граммы.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

В этом примере только `clickhouse` считается отдельным токеном.
`support` не считается токеном, потому что ему могут соответствовать `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, которые начинаются с `clickhouse supports`, завершите шаблон поиска пробелом на конце:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, функцию `endsWith` следует использовать с пробелом в начале:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` и `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) выполняют поиск по одному заданному токену.

В отличие от ранее упомянутых функций, они не выполняют токенизацию искомого значения (предполагается, что на вход передаётся один токен).

Пример:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

Функции `hasToken` и `hasTokenOrNull` являются наиболее производительными при использовании с индексом `text`.


#### `hasAnyTokens` и `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) используются для сопоставления с одним или со всеми из указанных токенов.

Эти две функции принимают поисковые токены либо в виде строки, которая будет разбита на токены с использованием того же токенайзера, что и для столбца с индексом, либо в виде массива уже обработанных токенов, к которым перед поиском не будет применяться токенизация.
См. документацию по функциям для получения дополнительной информации.

Пример:

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

Функция работы с массивами [has](/sql-reference/functions/array-functions#has) выполняет сопоставление с отдельным токеном в массиве строк.

Пример:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) (псевдоним `mapContainsKey`) сопоставляет токены, извлечённые из искомой строки, с ключами map.
Поведение аналогично функции `equals` со столбцом типа `String`.
Текстовый индекс используется только если он создан для выражения `mapKeys(map)`.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

Функция [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapcontainsvalue) ищет совпадения между токенами, извлечёнными из искомой строки, и значениями в map. Поведение аналогично работе функции `equals` со столбцом типа `String`. Текстовый индекс используется только в том случае, если он создан на выражении `mapValues(map)`.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` и `mapContainsValueLike` \{#functions-example-mapcontainslike\}

Функции [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) и [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) сопоставляют заданный шаблон со всеми ключами или, соответственно, значениями отображения.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM tab WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

Оператор доступа [operator[]](/sql-reference/operators#access-operators) можно использовать с текстовым индексом для фильтрации по ключам и значениям. Текстовый индекс используется только в том случае, если он создан на основе выражений `mapKeys(map)` или `mapValues(map)`, либо на обоих.

Пример:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

См. следующие примеры использования столбцов типа `Array(T)` и `Map(K, V)` с текстовым индексом.


### Примеры использования столбцов `Array` и `Map` с текстовыми индексами \{#text-index-array-and-map-examples\}

#### Индексация столбцов Array(String) \{#text-index-example-array\}

Представим платформу для блогов, где авторы категоризуют свои записи с помощью ключевых слов.
Мы хотим, чтобы пользователи могли находить связанный контент, выполняя поиск по темам или нажимая на них.

Рассмотрим следующее определение таблицы:

```sql
CREATE TABLE posts
(
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

Без текстового индекса, чтобы найти посты с определённым ключевым словом (например, `clickhouse`), приходится просматривать все записи:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

По мере роста платформы выполнение запроса становится всё более медленным, потому что ему приходится просматривать каждый массив `keywords` в каждой строке.
Чтобы решить эту проблему с производительностью, мы определяем текстовый индекс для столбца `keywords`:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### Индексирование столбцов типа Map \{#text-index-example-map\}

Во многих сценариях обсервабилити сообщения логов разбиваются на «компоненты» и сохраняются с соответствующими типами данных, например дата-время для временной метки, enum для уровня логирования и т. д.
Поля метрик оптимально хранить в виде пар ключ-значение.
Командам, отвечающим за эксплуатацию, необходимо эффективно искать по логам для отладки, расследования инцидентов информационной безопасности и мониторинга.

Рассмотрим следующую таблицу логов:

```sql
CREATE TABLE logs
(
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
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

По мере увеличения объёма логов такие запросы начинают работать медленно.

Решение — создать текстовый индекс для ключей и значений [Map](/sql-reference/data-types/map.md).
Используйте [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys), чтобы создать текстовый индекс, когда нужно находить логи по именам полей или типам атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

Используйте [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues), чтобы создать текстовый индекс, когда нужно выполнять поиск по самим значениям атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

Примеры запросов:

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast

-- Finds all logs where any attribute includes an error:
SELECT * FROM logs WHERE mapContainsValueLike(attributes, '% error %'); -- fast
```


## Настройка производительности \{#performance-tuning\}

### Прямое чтение \{#direct-read\}

Некоторые типы текстовых запросов могут быть значительно ускорены с помощью оптимизации, называемой «прямое чтение».

Пример:

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

Оптимизация прямого чтения в ClickHouse обрабатывает запрос, используя исключительно текстовый индекс (т.е. обращения к текстовому индексу) без доступа к базовому текстовому столбцу.
Обращения к текстовому индексу читают относительно небольшой объём данных и поэтому гораздо быстрее, чем обычные skip-индексы в ClickHouse (которые выполняют обращение к skip-индексу, а затем загружают и фильтруют оставшиеся гранулы).

Прямое чтение управляется двумя настройками:

* Настройка [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index), которая определяет, включено ли прямое чтение в целом.
* Настройка [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read), которая является дополнительным требованием для прямого чтения. Обратите внимание, что в базах данных ClickHouse с [compatibility](../../../operations/settings/settings#compatibility) &lt; 25.10 `use_skip_indexes_on_data_read` отключена, поэтому вам либо нужно повысить значение настройки compatibility, либо явно выполнить `SET use_skip_indexes_on_data_read = 1`.

Также текстовый индекс должен быть полностью материализован, чтобы использовать прямое чтение (для этого используйте `ALTER TABLE ... MATERIALIZE INDEX`).

**Поддерживаемые функции**

Оптимизация прямого чтения поддерживает функции `hasToken`, `hasAllTokens` и `hasAnyTokens`.
Если текстовый индекс определён с токенизатором `array`, прямое чтение также поддерживается для функций `equals`, `has`, `mapContainsKey` и `mapContainsValue`.
Эти функции также могут комбинироваться операторами AND, OR и NOT.
Условия `WHERE` или `PREWHERE` также могут содержать дополнительные фильтры, не связанные с функциями полнотекстового поиска (для текстовых столбцов или других столбцов) — в этом случае оптимизация прямого чтения всё равно будет использоваться, но менее эффективно (она применяется только к поддерживаемым функциям текстового поиска).

Чтобы проверить, использует ли запрос прямое чтение, выполните его с `EXPLAIN PLAN actions = 1`.
В качестве примера, запрос с отключённым прямым чтением

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
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

тогда как тот же запрос при `query_plan_direct_read_from_text_index = 1`

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
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

Второй результат EXPLAIN PLAN содержит виртуальный столбец `__text_index_<index_name>_<function_name>_<id>`.
Если этот столбец присутствует, используется прямое чтение.

Если условие WHERE содержит только функции текстового поиска, запрос может полностью избежать чтения данных столбца и получить наибольший выигрыш в производительности за счёт прямого чтения.
Однако даже если текстовый столбец используется в других частях запроса, прямое чтение всё равно обеспечит прирост производительности.

**Прямое чтение как подсказка**

Прямое чтение как подсказка основано на тех же принципах, что и обычное прямое чтение, но при этом добавляет дополнительный фильтр, построенный на основе данных текстового индекса, не удаляя базовый текстовый столбец.
Оно используется для функций, при которых чтение только из текстового индекса может приводить к ложноположительным срабатываниям.

Поддерживаются следующие функции: `like`, `startsWith`, `endsWith`, `equals`, `has`, `mapContainsKey` и `mapContainsValue`.

Дополнительный фильтр может обеспечить дополнительную избирательность, чтобы ещё больше ограничить результирующий набор в сочетании с другими фильтрами, что помогает сократить объём данных, считываемых из других столбцов.


Режим прямого чтения в качестве подсказки управляется с помощью настройки [query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) (по умолчанию — включена).

Пример запроса без использования подсказки:

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 0
FORMAT TSV
```

возвращает

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

а тот же запрос, выполненный с `query_plan_text_index_add_hint = 1`

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE col LIKE '%some-token%'
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 1
```

возвращает

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

Во втором выводе EXPLAIN PLAN видно, что к условию фильтрации добавлен дополнительный конъюнкт (`__text_index_...`).
Благодаря оптимизации [PREWHERE](docs/sql-reference/statements/select/prewhere) условие фильтрации разбивается на три отдельных конъюнкта, которые применяются в порядке возрастания вычислительной сложности.
Для этого запроса порядок применения таков: `__text_index_...`, затем `greaterOrEquals(...)` и, наконец, `like(...)`.
Такой порядок позволяет пропустить ещё больше гранул данных, чем гранулы, пропущенные текстовым индексом и исходным фильтром, до чтения «тяжёлых» столбцов, используемых в запросе после оператора `WHERE`, что дополнительно уменьшает объём данных для чтения.


### Кэширование \{#caching\}

Для буферизации частей текстового индекса в памяти доступны различные кэши (см. раздел [Implementation Details](#implementation)).
В настоящее время существуют кэши для десериализованных блоков словаря, заголовков и списков вхождений (posting lists) текстового индекса, позволяющие сократить количество операций ввода-вывода (I/O).
Эти кэши включаются с помощью настроек [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache), [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) и [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache).
По умолчанию все кэши отключены.
Для сброса кэшей используйте команду [SYSTEM DROP TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches).

Для их настройки воспользуйтесь следующими параметрами сервера.

#### Настройки кэша блоков словаря \{#caching-dictionary\}

| Параметр                                                                                                                                                 | Описание                                                                                                       |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | Имя политики кэша блоков словаря текстового индекса.                                                           |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | Максимальный размер кэша в байтах.                                                                            |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | Максимальное число десериализованных блоков словаря в кэше.                                                   |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | Размер защищённой очереди в кэше блоков словаря текстового индекса относительно общего размера кэша.          |

#### Настройки кэша заголовков \{#caching-header\}

| Параметр                                                                                                                             | Описание                                                                                             |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | Имя политики кэширования заголовков текстового индекса.                                              |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | Максимальный размер кэша в байтах.                                                                   |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | Максимальное количество десериализованных заголовков в кэше.                                         |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | Размер защищённой очереди в кэше заголовков текстового индекса по отношению к общему размеру кэша.  |

#### Настройки кэша списков вхождений \{#caching-posting-lists\}

| Настройка                                                                                                                             | Описание                                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | Имя политики кэша списков вхождений текстового индекса.                                                 |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | Максимальный размер кэша в байтах.                                                                      |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | Максимальное количество десериализованных списков вхождений в кэше.                                     |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | Размер защищённой очереди в кэше списков вхождений текстового индекса относительно общего размера кэша. |

## Подробности реализации \{#implementation\}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:

- словаря, который отображает каждый токен на список вхождений, и
- набора списков вхождений, каждый из которых представляет набор номеров строк.

Текстовый индекс строится для всей части данных.
В отличие от других пропускающих индексов, текстовый индекс при слиянии частей данных может быть объединён, а не перестроен (см. ниже).

Во время создания индекса создаются три файла (на часть):

**Файл блоков словаря (.dct)**

Токены в текстовом индексе сортируются и хранятся в блоках словаря по 512 токенов в каждом (размер блока настраивается параметром `dictionary_block_size`).
Файл блоков словаря (.dct) содержит все блоки словаря всех гранул индекса в данной части.

**Файл заголовка индекса (.idx)**

Файл заголовка индекса содержит для каждого блока словаря первый токен блока и его относительное смещение в файле блоков словаря.

Эта разреженная структура индекса аналогична [разреженному индексу первичного ключа](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)) в ClickHouse.

**Файл списков вхождений (.pst)**

Списки вхождений для всех токенов размещаются последовательно в файле списков вхождений.
Чтобы экономить место и при этом позволять выполнять операции пересечения и объединения быстро, списки вхождений хранятся как [roaring bitmaps](https://roaringbitmap.org/).
Если список вхождений больше, чем `posting_list_block_size`, он разбивается на несколько блоков, которые последовательно хранятся в файле списков вхождений.

**Слияние текстовых индексов**

При слиянии частей данных текстовый индекс не нужно перестраивать с нуля; вместо этого его можно эффективно объединить на отдельном этапе процесса слияния.
На этом этапе отсортированные словари текстовых индексов каждой входной части считываются и объединяются в новый единый словарь.
Номера строк в списках вхождений также пересчитываются, чтобы отражать их новые позиции в объединённой части данных, с использованием отображения соответствия старых номеров строк новым, которое создаётся на начальной фазе слияния.
Этот метод слияния текстовых индексов аналогичен тому, как сливаются [проекции](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) со столбцом `_part_offset`. Если индекс не материализован в исходной части, он строится, записывается во временный файл, а затем сливается вместе с индексами из других частей и из других временных файлов индексов.

## Пример: датасет Hacker News \{#hacker-news-dataset\}

Рассмотрим, как текстовые индексы повышают производительность на большом наборе данных с большим объёмом текстов.
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

28,7 млн строк хранятся в файле Parquet в S3 — давайте вставим их в таблицу `hackernews`:

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

Мы используем `ALTER TABLE`, добавим текстовый индекс по столбцу comment, а затем материализуем его:

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

Теперь выполним запросы с использованием функций `hasToken`, `hasAnyTokens` и `hasAllTokens`.
Следующие примеры покажут резкую разницу в производительности между стандартным сканированием индекса и оптимизацией прямого чтения.


### 1. Использование `hasToken` \{#using-hasToken\}

`hasToken` проверяет, содержит ли текст конкретный отдельный токен.
Мы будем искать чувствительный к регистру токен «ClickHouse».

**Прямое чтение отключено (стандартное сканирование)**
По умолчанию ClickHouse использует пропускающий индекс для фильтрации гранул, а затем читает данные столбца для этих гранул.
Мы можем эмулировать это поведение, отключив прямое чтение.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**Прямое чтение включено (быстрое чтение индекса)**
Теперь запустим тот же запрос с включённым прямым чтением (это поведение по умолчанию).

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```

Запрос с прямым чтением более чем в 45 раз быстрее (0,362 с против 0,008 с) и обрабатывает значительно меньше данных (9,51 ГБ против 3,15 МБ), считывая данные только из индекса.


### 2. Использование `hasAnyTokens` \{#using-hasAnyTokens\}

`hasAnyTokens` проверяет, содержит ли текст хотя бы один из переданных токенов.
Будем искать комментарии, содержащие «love» или «ClickHouse».

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

**Включено прямое чтение (быстрое чтение по индексу)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 0.015 sec. Processed 27.99 million rows, 27.99 MB
```

Ускорение ещё более заметно для этого распространённого поиска по условию «OR».
Запрос выполняется почти в 89 раз быстрее (1.329s против 0.015s), так как удаётся избежать полного сканирования столбца.


### 3. Использование `hasAllTokens` \{#using-hasAllTokens\}

`hasAllTokens` проверяет, содержит ли текст все заданные токены.
Будем искать комментарии, содержащие и &#39;love&#39;, и &#39;ClickHouse&#39;.

**Прямое чтение отключено (стандартное сканирование)**
Даже при отключённом прямом чтении стандартный пропускающий индекс остаётся эффективным.
Он сокращает выборку с 28.7M строк до всего 147.46K строк, но при этом всё равно должен прочитать 57.03 MB из столбца.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.184 sec. Processed 147.46 thousand rows, 57.03 MB
```

**Прямое чтение включено (быстрое чтение индекса)**
Прямое чтение отвечает на запрос, используя данные индекса и считывая только 147,46 КБ.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.007 sec. Processed 147.46 thousand rows, 147.46 KB
```

Для такого поиска по условию AND оптимизация прямого чтения более чем в 26 раз быстрее (0,184 с против 0,007 с), чем стандартное сканирование индекса-пропуска.


### 4. Составной поиск: OR, AND, NOT, ... \{#compound-search\}

Оптимизация прямого чтения также применяется к составным логическим выражениям.
Здесь мы выполним поиск без учета регистра для &#39;ClickHouse&#39; ИЛИ &#39;clickhouse&#39;.

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.450 sec. Processed 25.87 million rows, 9.58 GB
```

**Включено прямое чтение (быстрое чтение по индексу)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.013 sec. Processed 25.87 million rows, 51.73 MB
```

Комбинируя результаты работы индекса, прямой запрос на чтение выполняется в 34 раза быстрее (0,450 с против 0,013 с) и позволяет избежать чтения 9,58 ГБ данных столбца.
Для этого конкретного случая `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` будет предпочтительным, более эффективным синтаксисом.


## Связанные материалы \{#related-content\}

- Блог: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Блог: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)