---
description: 'Быстрый поиск терминов в тексте.'
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
Токены формируются процессом, называемым токенизацией.
Например, ClickHouse по умолчанию токенизирует английское предложение "All cat like mice." как ["All", "cat", "like", "mice"] (обратите внимание, что завершающая точка игнорируется).
Доступны более совершенные токенизаторы, например для данных логов.

## Создание текстового индекса \{#creating-a-text-index\}

Чтобы создать текстовый индекс, сначала включите соответствующую экспериментальную настройку:

```sql
SET enable_full_text_index = true;
```

Текстовый индекс можно определить для столбца типа [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md) и [Map](/sql-reference/data-types/map.md) (с помощью функций работы с типом Map [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues)) с использованием следующего синтаксиса:

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
* `splitByString(S)` разбивает строки по заданным пользователем строкам‑разделителям `S` (см. также функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)).
  Разделители можно задать с помощью необязательного параметра, например `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (`, '` в примере).
  Список разделителей по умолчанию, если он не задан явно (например, `tokenizer = splitByString`), — это один пробел `[' ']`.
* `ngrams(N)` разбивает строки на `N`‑граммы одинакового размера (см. также функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длину n‑грамм можно задать с помощью необязательного целочисленного параметра от 1 до 8, например `tokenizer = ngrams(3)`.
  Размер n‑граммы по умолчанию, если он не задан явно (например, `tokenizer = ngrams`), равен 3.
* `sparseGrams(min_length, max_length, min_cutoff_length)` разбивает строки на n‑граммы переменной длины как минимум `min_length` и не более `max_length` (включительно) символов (см. также функцию [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)).
  Если явно не указано иное, значения `min_length` и `max_length` по умолчанию равны 3 и 100.
  Если задан параметр `min_cutoff_length`, возвращаются только n‑граммы с длиной не меньше `min_cutoff_length`.
  По сравнению с `ngrams(N)` токенизатор `sparseGrams` создаёт N‑граммы переменной длины, что позволяет более гибко представлять исходный текст.
  Например, `tokenizer = sparseGrams(3, 5, 4)` внутри генерирует 3‑, 4‑, 5‑граммы из входной строки, но возвращаются только 4‑ и 5‑граммы.
* `array` не выполняет токенизацию, то есть каждое значение строки является токеном (см. также функцию [array](/sql-reference/functions/array-functions.md/#array)).

:::note
Токенизатор `splitByString` применяет разделители слева направо.
Это может приводить к неоднозначностям.
Например, строки‑разделители `['%21', '%']` приведут к тому, что `%21abc` будет разбито на токены как `['abc']`, тогда как при перестановке строк‑разделителей `['%', '%21']` результатом будет `['21abc']`.
В большинстве случаев требуется, чтобы при сопоставлении предпочтение отдавалось более длинным разделителям.
Этого обычно можно добиться, передавая строки‑разделители в порядке убывания длины.
Если строки‑разделители образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::

:::warning
В настоящий момент не рекомендуется строить текстовые индексы поверх текста на незападных языках, например китайском.
Поддерживаемые сейчас токенизаторы могут приводить к огромному размеру индекса и большому времени выполнения запросов.
Мы планируем в будущем добавить специализированные токенизаторы для конкретных языков, которые будут лучше обрабатывать такие случаи.
:::


Чтобы проверить, как токенизаторы разбивают входную строку на токены, вы можете использовать функцию [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) в ClickHouse:

Пример:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

Результат:

```result
['abc','bc ','c d',' de','def']
```

**Аргумент препроцессора (необязательно)**. Аргумент `preprocessor` — это выражение, которое применяется к входной строке перед токенизацией.

Типичные варианты использования аргумента препроцессора включают:

1. Преобразование в нижний или верхний регистр для обеспечения регистронезависимого сопоставления, например [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8), см. первый пример ниже.
2. Нормализацию UTF-8, например [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8).
3. Удаление или преобразование нежелательных символов или подстрок, например [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode).

Выражение препроцессора должно преобразовывать входное значение типа [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md) в значение того же типа.

Примеры:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

Также выражение препроцессора должно ссылаться только на столбец, для которого определён текстовый индекс.
Использование недетерминированных функций не допускается.

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) и [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) используют препроцессор для предварительного преобразования поискового термина перед его токенизацией.

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

эквивалентно следующему:

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

**Другие аргументы (необязательно)**. Текстовые индексы в ClickHouse реализованы как [вторичные индексы](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types).
Однако, в отличие от других пропускающих индексов, текстовые индексы имеют «бесконечно мелкую» гранулярность, т.е. текстовый индекс создаётся для всей части данных, а явно заданная гранулярность индекса игнорируется.
Это значение было выбрано эмпирически и обеспечивает хороший баланс между скоростью и размером индекса для большинства сценариев использования.
Опытные пользователи могут указать другую гранулярность индекса (мы этого не рекомендуем).

<details markdown="1">
  <summary>Необязательные расширенные параметры</summary>

  Значения по умолчанию для следующих расширенных параметров будут хорошо работать практически во всех ситуациях.
  Мы не рекомендуем их менять.

  Необязательный параметр `dictionary_block_size` (по умолчанию: 512) указывает размер блоков словаря в строках.

  Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) указывает, используют ли блоки словаря front coding для сжатия.

  Необязательный параметр `posting_list_block_size` (по умолчанию: 1048576) указывает размер блоков списка вхождений в строках.
</details>

Текстовые индексы могут быть добавлены к столбцу или удалены из него после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## Использование текстового индекса \{#using-a-text-index\}

Использование текстового индекса в запросах SELECT просто, так как распространённые строковые функции поиска автоматически используют индекс.
Если индекс отсутствует, перечисленные ниже строковые функции поиска будут выполнять медленное сканирование по принципу полного перебора.

### Поддерживаемые функции \{#functions-support\}

Текстовый индекс можно использовать, если в предложениях `WHERE` или `PREWHERE` используются текстовые функции:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` и `!=` \{#functions-example-equals-notequals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) и `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) сопоставляют весь указанный поисковый термин целиком.

Пример:

```sql
SELECT * from tab WHERE str = 'Hello';
```

Текстовый индекс поддерживает `=` и `!=`, однако поиск по равенству и неравенству имеет смысл только с токенизатором `array` (он приводит к тому, что индекс хранит значения всей строки целиком).


#### `IN` и `NOT IN` \{#functions-example-in-notin\}

`IN` ([in](/sql-reference/functions/in-functions)) и `NOT IN` ([notIn](/sql-reference/functions/in-functions)) аналогичны функциям `equals` и `notEquals`, но они совпадают либо со всеми (`IN`), либо ни с одним (`NOT IN`) из указанных поисковых терминов.

Пример:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

Действуют те же ограничения, что и для `=` и `!=`, то есть использовать `IN` и `NOT IN` имеет смысл только в сочетании с токенизатором `array`.


#### `LIKE`, `NOT LIKE` и `match` \{#functions-example-like-notlike-match\}

:::note
В настоящее время эти функции используют текстовый индекс для фильтрации только в том случае, если токенизатор индекса — `splitByNonAlpha`, `ngrams` или `sparseGrams`.
:::

Чтобы использовать `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)) и функцию [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами, ClickHouse должен иметь возможность извлекать полные токены из поискового шаблона.
Для индекса с токенизатором `ngrams` это возможно, если длина искомых подстрок между символами подстановки не меньше длины n-граммы.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

`support` в примере может соответствовать `support`, `supports`, `supporting` и т. д.
Такой запрос является запросом по подстроке, и его нельзя ускорить с помощью текстового индекса.

Чтобы использовать текстовый индекс для запросов с LIKE, шаблон LIKE должен быть переформулирован следующим образом:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

Пробелы слева и справа от `support` гарантируют, что термин корректно распознаётся как отдельный токен.


#### `startsWith` и `endsWith` \{#functions-example-startswith-endswith\}

Аналогично `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startsWith) и [endsWith](/sql-reference/functions/string-functions.md/#endsWith) могут использовать текстовый индекс только в том случае, если из поискового термина можно извлечь полные токены.
Для индекса с токенизатором `ngrams` это возможно, если длина искомых строк между подстановочными символами не меньше длины ngram.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

В этом примере токеном считается только `clickhouse`.
`support` не является токеном, поскольку он может совпадать со строками `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, которые начинаются с `clickhouse supports`, завершите шаблон поиска пробелом в конце:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, функцию `endsWith` следует использовать с пробелом в начале:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` и `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) выполняют поиск по одному указанному токену.

В отличие от ранее упомянутых функций, они не разбивают поисковый термин на токены (предполагается, что на вход подается один токен).

Пример:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

Функции `hasToken` и `hasTokenOrNull` являются наиболее производительными при работе с индексом `text`.


#### `hasAnyTokens` и `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) выполняют поиск по одному или всем указанным токенам.

Эти две функции принимают поисковые токены либо в виде строки, которая будет разбита на токены с использованием того же токенизатора, что и для столбца с индексом, либо в виде массива уже обработанных токенов, к которым перед поиском токенизация применяться не будет.
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

Функция для работы с массивами [`has`](/sql-reference/functions/array-functions#has) проверяет наличие одного токена в массиве строк.

Пример:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapContains) (псевдоним `mapContainsKey`) сопоставляет токены, извлечённые из искомой строки, с ключами в map.
Поведение аналогично функции `equals` со столбцом типа `String`.
Текстовый индекс используется только в том случае, если он был создан для выражения `mapKeys(map)`.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

Функция [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue) сопоставляет токены, извлечённые из искомой строки, со значениями отображения (map).
Поведение похоже на функцию `equals` со столбцом типа `String`.
Текстовый индекс используется только в том случае, если он был создан на выражении `mapValues(map)`.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` и `mapContainsValueLike` \{#functions-example-mapcontainslike\}

Функции [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) и [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) сопоставляют шаблон со всеми ключами или, соответственно, значениями карты.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM tab WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

Оператор доступа [operator[]](/sql-reference/operators#access-operators) можно использовать с текстовым индексом при фильтрации ключей и значений. Текстовый индекс используется только в том случае, если он создан для выражений `mapKeys(map)` или `mapValues(map)`, или для обоих.

Пример:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

См. следующие примеры использования столбцов типа `Array(T)` и `Map(K, V)` с текстовым индексом.


### Примеры для столбцов типа `Array` и `Map` с текстовыми индексами \{#text-index-array-and-map-examples\}

#### Индексирование столбцов Array(String) \{#text-index-example-array\}

Представьте платформу для блогов, где авторы помечают свои публикации в блоге ключевыми словами.
Мы хотим, чтобы пользователи находили похожий контент, выполняя поиск по темам или нажимая на них.

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

Без текстового индекса поиск постов с определённым ключевым словом (например, `clickhouse`) требует полного сканирования всех записей:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

По мере роста платформы выполнение запроса становится всё более медленным, потому что ему приходится просматривать каждый массив `keywords` в каждой строке.
Чтобы устранить эту проблему с производительностью, мы определяем текстовый индекс для столбца `keywords`:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### Индексация столбцов Map \{#text-index-example-map\}

Во многих сценариях обсервабилити лог-сообщения разбиваются на «компоненты» и сохраняются с использованием соответствующих типов данных, например DateTime для временной метки, Enum для уровня логирования и т. д.
Поля метрик лучше всего хранить в виде пар ключ–значение.
Командам эксплуатации необходимо эффективно искать по логам для отладки, расследования инцидентов безопасности и мониторинга.

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

Без текстового индекса поиск в данных типа [Map](/sql-reference/data-types/map.md) требует полного сканирования таблицы:

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

По мере увеличения объёма логов эти запросы становятся медленными.

Решение — создание текстового индекса для ключей и значений типа [Map](/sql-reference/data-types/map.md).
Используйте [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) для создания текстового индекса, когда вам нужно находить логи по именам полей или типам атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

Используйте [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues), чтобы создать текстовый индекс, когда нужно искать по содержимому самих атрибутов:

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

Некоторые типы текстовых запросов могут быть существенно ускорены благодаря оптимизации, называемой &quot;direct read&quot;.

Пример:

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

Оптимизация прямого чтения в ClickHouse обрабатывает запрос, используя исключительно текстовый индекс (т.е. обращения к текстовому индексу) без доступа к исходному текстовому столбцу.
Обращения к текстовому индексу читают относительно мало данных и поэтому существенно быстрее, чем обычные skip-индексы в ClickHouse (которые выполняют обращение к skip-индексу, а затем загружают и фильтруют оставшиеся гранулы).

Прямое чтение управляется двумя настройками:

* Настройка [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) (по умолчанию true), которая определяет, включено ли прямое чтение в целом.
* Настройка [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read), ещё одно обязательное условие для прямого чтения. В версиях ClickHouse &gt;= 26.1 эта настройка включена по умолчанию. В более ранних версиях вам нужно явно выполнить `SET use_skip_indexes_on_data_read = 1`.

Кроме того, текстовый индекс должен быть полностью материализован для использования прямого чтения (для этого используйте `ALTER TABLE ... MATERIALIZE INDEX`).

**Поддерживаемые функции**

Оптимизация прямого чтения поддерживает функции `hasToken`, `hasAllTokens` и `hasAnyTokens`.
Если текстовый индекс определён с `array` tokenizer, прямое чтение также поддерживается для функций `equals`, `has`, `mapContainsKey` и `mapContainsValue`.
Эти функции также можно комбинировать операторами `AND`, `OR` и `NOT`.
Предикаты `WHERE` или `PREWHERE` также могут содержать дополнительные фильтры, не являющиеся текстовыми функциями поиска (для текстовых столбцов или других столбцов) — в этом случае оптимизация прямого чтения по-прежнему будет использоваться, но менее эффективно (она применяется только к поддерживаемым текстовым функциям поиска).

Чтобы убедиться, что запрос использует прямое чтение, выполните его с `EXPLAIN PLAN actions = 1`.
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

тогда как тот же запрос, выполненный с `query_plan_direct_read_from_text_index = 1`

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

Во втором выводе EXPLAIN PLAN присутствует виртуальный столбец `__text_index_<index_name>_<function_name>_<id>`.
Если этот столбец присутствует, используется прямое чтение.

Если условие WHERE содержит только функции текстового поиска, запрос может полностью избежать чтения данных столбца и получить наибольший выигрыш в производительности за счет прямого чтения.
Однако даже если текстовый столбец используется в другом месте запроса, прямое чтение все равно даст прирост производительности.

**Прямое чтение как подсказка**

Прямое чтение как подсказка основано на тех же принципах, что и обычное прямое чтение, но добавляет дополнительный фильтр, построенный по данным текстового индекса, без удаления исходного текстового столбца.
Оно используется для функций, когда чтение только из текстового индекса привело бы к ложным срабатываниям.

Поддерживаемые функции: `like`, `startsWith`, `endsWith`, `equals`, `has`, `mapContainsKey` и `mapContainsValue`.

Дополнительный фильтр может обеспечить дополнительную селективность для дальнейшего ограничения набора результатов в сочетании с другими фильтрами, помогая уменьшить объем данных, считываемых из других столбцов.

Прямое чтение как подсказка управляется настройкой [query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) (включено по умолчанию).

Пример запроса без подсказки:


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

тогда как тот же запрос при `query_plan_text_index_add_hint = 1`

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

Во втором выводе EXPLAIN PLAN вы можете увидеть, что к условию фильтрации была добавлена дополнительная конъюнкция (`__text_index_...`).
Благодаря оптимизации [PREWHERE](docs/sql-reference/statements/select/prewhere) условие фильтрации разбивается на три отдельные конъюнкции, которые применяются в порядке возрастания вычислительной сложности.
Для этого запроса порядок применения такой: сначала `__text_index_...`, затем `greaterOrEquals(...)` и, наконец, `like(...)`.
Такой порядок позволяет пропускать ещё больше гранул данных по сравнению с теми, которые уже пропускаются текстовым индексом и исходным фильтром, ещё до чтения «тяжёлых» столбцов, используемых в запросе после предложения `WHERE`, что дополнительно уменьшает объём данных для чтения.


### Кэширование \{#caching\}

Доступны различные кэши для буферизации частей текстового индекса в памяти (см. раздел [Implementation Details](#implementation)).
В настоящее время доступны кэши для десериализованных блоков словаря, заголовков и списков вхождений текстового индекса для снижения объёма операций ввода-вывода.
Их можно включить с помощью настроек [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache), [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache) и [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache).
По умолчанию все кэши отключены.
Чтобы сбросить кэши, используйте команду [SYSTEM DROP TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches).

Для настройки кэшей используйте следующие параметры сервера.

#### Настройки кэша блоков словаря \{#caching-dictionary\}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | Имя политики кэширования блоков словаря текстового индекса.                                                   |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | Максимальный размер кэша в байтах.                                                                             |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | Максимальное количество десериализованных блоков словаря в кэше.                                               |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | Размер защищённой очереди в кэше блоков словаря текстового индекса относительно общего размера кэша.          |

#### Настройки кэша заголовков \{#caching-header\}

| Настройка                                                                                                                            | Описание                                                                                             |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | Имя политики кэша заголовков текстового индекса.                                                     |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | Максимальный размер кэша в байтах.                                                                  |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | Максимальное количество десериализованных заголовков в кэше.                                        |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | Размер защищённой очереди в кэше заголовков текстового индекса относительно общего размера кэша.    |

#### Настройки кэша списков вхождений \{#caching-posting-lists\}

| Setting                                                                                                                               | Description                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | Имя политики кэша списков вхождений текстового индекса.                                                |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | Максимальный размер кэша в байтах.                                                                     |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | Максимальное количество десериализованных списков вхождений в кэше.                                    |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | Размер защищённой очереди в кэше списков вхождений текстового индекса относительно общего размера кэша. |

## Подробности реализации \{#implementation\}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:

- словаря, который отображает каждый токен в список вхождений, и
- набора списков вхождений, каждый из которых представляет собой множество номеров строк.

Текстовый индекс строится для всей части.
В отличие от других пропускающих индексов, текстовый индекс при слиянии частей данных может быть объединён, а не перестроен (см. ниже).

Во время создания индекса для каждой части создаются три файла:

**Файл блоков словаря (.dct)**

Токены в текстовом индексе сортируются и сохраняются в блоках словаря по 512 токенов в каждом (размер блока настраивается параметром `dictionary_block_size`).
Файл блоков словаря (.dct) состоит из всех блоков словаря всех гранул индекса в части.

**Файл заголовка индекса (.idx)**

Файл заголовка индекса содержит для каждого блока словаря первый токен блока и его относительное смещение в файле блоков словаря.

Эта разреженная структура индекса аналогична разреженному индексу первичного ключа в ClickHouse ([sparse primary key index](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)).

**Файл списков вхождений (.pst)**

Списки вхождений для всех токенов располагаются последовательно в файле списков вхождений.
Чтобы экономить место и при этом обеспечивать быстрые операции пересечения и объединения, списки вхождений хранятся как [roaring bitmaps](https://roaringbitmap.org/).
Если список вхождений больше, чем `posting_list_block_size`, он разбивается на несколько блоков, которые хранятся последовательно в файле списков вхождений.

**Слияние текстовых индексов**

При слиянии частей данных текстовый индекс не нужно полностью перестраивать; вместо этого его можно эффективно объединить на отдельном этапе процесса слияния.
На этом этапе отсортированные словари текстовых индексов каждой входной части считываются и объединяются в новый единый словарь.
Номера строк в списках вхождений также пересчитываются, чтобы отразить их новые позиции в объединённой части данных, с использованием отображения старых номеров строк в новые, которое создаётся на начальной фазе слияния.
Этот метод слияния текстовых индексов подобен тому, как объединяются [проекции](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) со столбцом `_part_offset`.
Если индекс не материализован в исходной части, он строится, записывается во временный файл и затем объединяется с индексами из других частей и из других временных файлов индексов.

## Пример: набор данных Hacker News \{#hacker-news-dataset\}

Рассмотрим, как текстовые индексы улучшают производительность на большом наборе данных с большим объёмом текста.
Мы будем использовать 28,7 млн строк комментариев с популярного сайта Hacker News.
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

Эти 28,7 млн строк содержатся в файле Parquet в S3 — давайте вставим их в таблицу `hackernews`:

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

Мы воспользуемся `ALTER TABLE`, добавим текстовый индекс для столбца comment, а затем материализуем его:

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

Теперь давайте выполним запросы с использованием функций `hasToken`, `hasAnyTokens` и `hasAllTokens`.
Следующие примеры покажут существенную разницу в производительности между стандартным сканированием индекса и механизмом оптимизации прямого чтения.


### 1. Использование `hasToken` \{#using-hasToken\}

`hasToken` проверяет, содержит ли текст указанный один токен.
Мы будем искать токен «ClickHouse» с учетом регистра.

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

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**Direct read включён (быстрое чтение по индексу)**
Теперь мы запускаем тот же запрос с включённым режимом прямого чтения (это значение по умолчанию).

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

Запрос прямого чтения более чем в 45 раз быстрее (0,362 с против 0,008 с) и обрабатывает значительно меньше данных (9,51 ГБ против 3,15 МБ) за счёт чтения только из индекса.


### 2. Использование `hasAnyTokens` \{#using-hasAnyTokens\}

`hasAnyTokens` проверяет, содержит ли текст по крайней мере один из указанных токенов.
Мы будем искать комментарии, содержащие либо &#39;love&#39;, либо &#39;ClickHouse&#39;.

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

**Прямое чтение включено (быстрое чтение из индекса)**

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

Ускорение становится ещё более заметным для такого распространённого поиска с оператором &quot;OR&quot;.
Запрос выполняется почти в 89 раз быстрее (1.329s против 0.015s) за счёт отказа от полного сканирования столбца.


### 3. Использование `hasAllTokens` \{#using-hasAllTokens\}

`hasAllTokens` проверяет, содержит ли текст все заданные токены.
Мы будем искать комментарии, содержащие и «love», и «ClickHouse».

**Прямое чтение отключено (стандартное сканирование)**
Даже при отключённом прямом чтении стандартный skip-индекс остаётся эффективным.
Он отфильтровывает 28,7 млн строк до всего 147,46 тыс. строк, но при этом всё равно приходится прочитать 57,03 МБ из столбца.

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
Прямое чтение отвечает на запрос, используя данные индекса и читая всего 147,46 КБ.

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

Для этого поиска с оператором &quot;AND&quot; оптимизация прямого чтения более чем в 26 раз быстрее (0,184 с против 0,007 с), чем стандартное сканирование пропускающего индекса.


### 4. Составной поиск: OR, AND, NOT, ... \{#compound-search\}

Оптимизация прямого чтения также применяется к составным логическим выражениям.
Здесь мы выполним регистронезависимый поиск по &#39;ClickHouse&#39; или &#39;clickhouse&#39;.

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

Объединяя результаты из индекса, прямой запрос на чтение выполняется в 34 раза быстрее (0.450s против 0.013s) и не читает 9.58 GB данных столбца.
В этом конкретном случае предпочтительнее использовать более эффективный синтаксис `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`.


## Связанные материалы \{#related-content\}

- Статья в блоге: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Статья в блоге: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)