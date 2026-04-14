---
description: 'Быстрый поиск терминов в тексте.'
keywords: ['полнотекстовый поиск', 'текстовый индекс', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовый поиск с текстовыми индексами'
slug: /engines/table-engines/mergetree-family/textindexes
title: 'Полнотекстовый поиск с текстовыми индексами'
doc_type: 'reference'
---

# Полнотекстовый поиск с текстовыми индексами \{#full-text-search-with-text-indexes\}

Текстовые индексы (также известные как [обратные индексы](https://en.wikipedia.org/wiki/Inverted_index)) обеспечивают быстрый полнотекстовый поиск по текстовым данным.
Текстовый индекс хранит отображение от токенов к номерам строк, содержащих каждый токен.
Токены создаются процессом, называемым токенизацией.
Например, стандартный токенизатор ClickHouse преобразует английское предложение «The cat likes mice.» в токены [«The», «cat», «likes», «mice»].

В качестве примера предположим, что имеется таблица с одним столбцом и тремя строками

```result
1: The cat likes mice.
2: Mice are afraid of dogs.
3: I have two dogs and a cat.
```

Соответствующие токены:

```result
1: The, cat, likes, mice
2: Mice, are, afraid, of, dogs
3: I, have, two, dogs, and, a, cat
```

Как правило, мы выполняем поиск без учета регистра, поэтому переводим токены в нижний регистр:

```result
1: the, cat, likes, mice
2: mice, are, afraid, of, dogs
3: i, have, two, dogs, and, a, cat
```

Мы также удалим стоп-слова, такие как &quot;I&quot;, &quot;the&quot; и &quot;and&quot;, поскольку они встречаются почти в каждой строке:

```result
1: cat, likes, mice
2: mice, afraid, dogs
3: have, two, dogs, cat
```

Текстовый индекс (с концептуальной точки зрения) содержит следующую информацию:

```result
afraid : [2]
cat    : [1, 3]
dogs   : [2, 3]
have   : [3]
likes  : [1]
mice   : [1]
two    : [3]
```

При заданном поисковом токене эта структура индекса позволяет быстро находить все соответствующие строки.


## Создание текстового индекса \{#creating-a-text-index\}

Текстовые индексы доступны в статусе General Availability (GA) в ClickHouse версии 26.2 и новее.
В этих версиях не требуется настраивать какие-либо специальные параметры для использования текстового индекса.
Мы настоятельно рекомендуем использовать ClickHouse версии &gt;= 26.2 для производственных сценариев.

:::note
Текстовые индексы можно использовать с любой версией ClickHouse &gt;= 26.2 независимо от настройки [compatibility](../../../operations/settings/settings#compatibility).
:::

Чтобы создать текстовый индекс, используйте следующий синтаксис:

```sql
CREATE TABLE table
(
    key UInt64,
    str String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | asciiCJK
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, posting_list_block_size = C]
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

Текстовые индексы можно определять для столбцов следующих типов:

* [String](/sql-reference/data-types/string.md) и [FixedString](/sql-reference/data-types/fixedstring.md),
* [Array(String)](/sql-reference/data-types/array.md) и [Array(FixedString)](/sql-reference/data-types/array.md),
* [Map](/sql-reference/data-types/map.md) (через функции работы с Map [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues)), и
* [JSON](/sql-reference/data-types/newjson.md) (через функции [JSONAllPaths](/sql-reference/functions/json-functions.md/#JSONAllPaths) и [`JSONAllValues`](/sql-reference/functions/json-functions.md#JSONAllValues)).

Также поддерживаются столбцы типа [Nullable(T)](/sql-reference/data-types/nullable.md) и [LowCardinality()](/sql-reference/data-types/lowcardinality.md), включая `Array(Nullable(String or FixedString))`.

Также можно добавить текстовый индекс к существующей таблице:

```sql
ALTER TABLE table
    ADD INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | asciiCJK
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, posting_list_block_size = C]
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )

```

Если вы добавите индекс к существующей таблице, мы рекомендуем материализовать индекс для уже имеющихся частей этой таблицы (иначе поиск по частям без индекса будет сводиться к медленному полному перебору).

```sql
ALTER TABLE table MATERIALIZE INDEX text_idx SETTINGS mutations_sync = 2;
```

Чтобы удалить текстовый индекс, выполните следующую команду

```sql
ALTER TABLE table DROP INDEX text_idx;
```

**Аргумент tokenizer (обязательный)**. Аргумент `tokenizer` определяет используемый токенизатор:


* `splitByNonAlpha` разбивает строки по небуквенно-цифровым ASCII-символам (см. функцию [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)).
* `splitByString(S)` разбивает строки по заданным пользователем строкам-разделителям `S` (см. функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)).
  Разделители можно задать с помощью необязательного параметра, например, `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (в примере — `', '`).
  Если список разделителей явно не указан (например, `tokenizer = splitByString`), по умолчанию используется один пробел `[' ']`.
* `asciiCJK` разбивает строки на токены, используя правила границ слов Unicode (аналогично [Unicode Text Segmentation (UAX #29)](https://unicode.org/reports/tr29/)). ASCII-буквенно-цифровые символы и символы подчёркивания образуют токены с соединителями (ASCII `:` для букв, `.` и `'` для символов одного типа). Символы Unicode вне ASCII, включая символы [CJK](https://en.wikipedia.org/wiki/CJK_characters), становятся односимвольными токенами.
* `ngrams(N)` разбивает строки на одинаковые по размеру `N`-граммы (см. функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длину n-граммы можно указать необязательным целочисленным параметром от 1 до 8, например, `tokenizer = ngrams(3)`.
  Если размер n-граммы явно не указан (например, `tokenizer = ngrams`), по умолчанию используется значение 3.
* `sparseGrams(min_length, max_length, min_cutoff_length)` разбивает строки на n-граммы переменной длины как минимум из `min_length` и максимум из `max_length` (включительно) символов (см. функцию [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)).
  Если явно не указано иное, значения по умолчанию для `min_length` и `max_length` — 3 и 100 соответственно.
  Если указан параметр `min_cutoff_length`, возвращаются только n-граммы длиной не меньше `min_cutoff_length`.
  По сравнению с `ngrams(N)` токенизатор `sparseGrams` генерирует n-граммы переменной длины, обеспечивая более гибкое представление исходного текста.
  Например, `tokenizer = sparseGrams(3, 5, 4)` внутренне генерирует 3-, 4-, 5-граммы из входной строки, но возвращает только 4- и 5-граммы.
* `array` не выполняет токенизацию, т.е. каждое значение строки является токеном (см. функцию [array](/sql-reference/functions/array-functions.md/#array)).

Все доступные токенизаторы перечислены в [system.tokenizers](../../../operations/system-tables/tokenizers.md).

:::note
Токенизатор `splitByString` применяет разделители слева направо.
Это может приводить к неоднозначностям.
Например, строки-разделители `['%21', '%']` приведут к тому, что `%21abc` будет токенизировано как `['abc']`, тогда как при смене порядка разделителей `['%', '%21']` результатом будет `['21abc']`.
В большинстве случаев требуется, чтобы при сопоставлении в первую очередь выбирались более длинные разделители.
Обычно этого можно добиться, передавая строки-разделители в порядке убывания их длины.
Если строки-разделители образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::

Чтобы понять, как токенизатор разбивает входную строку, можно использовать функции [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) и [tokensForLikePattern](/sql-reference/functions/splitting-merging-functions.md/#tokensForLikePattern):

Пример:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

Результат:

```result
['abc','bc ','c d',' de','def']
```

*Работа с не-ASCII входными данными.*
Текстовые индексы можно строить на основе текстовых данных на любом языке и в любой кодировке.
Для текста, содержащего символы вне ASCII, рекомендуется токенизатор `asciiCJK`, так как он корректно обрабатывает границы слов Unicode, включая символы CJK.
:::

**Аргумент препроцессора (необязательный)**. Под препроцессором здесь понимается выражение, которое применяется к входной строке перед токенизацией.

Типичные варианты использования аргумента препроцессора включают следующее:


1. Приведение к нижнему/верхнему регистру или свёртка регистра для обеспечения регистронезависимого сопоставления, например [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8), [caseFoldUTF8](/sql-reference/functions/string-functions.md/#caseFoldUTF8).
2. Нормализация UTF-8, например [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [normalizeUTF8NFKCCasefold](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKCCasefold), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8).
3. Удаление или преобразование нежелательных символов или подстрок, таких как диакритические знаки, например [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode), [translate](/sql-reference/functions/string-replace-functions.md/#translate), [removeDiacriticsUTF8](/sql-reference/functions/string-functions.md/#removeDiacriticsUTF8).

Выражение препроцессора должно преобразовывать входное значение типа [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md) в значение того же типа.
Если текстовый индекс был построен по столбцу типа `Nullable(T)` или `LowCardinality(T)`, то выражение препроцессора должно принимать значения типов Nullable(T) или LowCardinality(T) (то есть не приводить к выбросу исключения).

Примеры:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col)))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = removeDiacriticsUTF8(caseFoldUTF8(col)))`

Кроме того, выражение препроцессора должно ссылаться только на столбец или выражение, на основе которых определён текстовый индекс.

Примеры:

* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = upper(lower(col)))`
* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(lower(col), lower(col)))`
* Не допускается: `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(col, col))`

Использование недетерминированных функций не допускается.

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) и [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) используют препроцессор для предварительного преобразования поискового запроса перед его токенизацией.

Например,

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, 'Foo');
```

эквивалентно следующему:

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, lower('Foo'));
```

В этом случае выражение препроцессора применяется к элементам массива по отдельности.

Пример:

```sql
CREATE TABLE table
(
    arr Array(String),
    INDEX idx arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(arr))

    -- This is not legal:
    INDEX idx_illegal arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = arraySort(arr))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(arr, 'foo');
```

Чтобы задать препроцессор в текстовом индексе по столбцам типа [Map](/sql-reference/data-types/map.md), пользователям необходимо решить, строится ли индекс
по ключам или по значениям Map.

Пример:


```sql
CREATE TABLE table
(
    map Map(String, String),
    INDEX idx mapKeys(map)  TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(mapKeys(map)))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(mapKeys(map), 'foo');
```

**Другие аргументы (необязательно)**.

<details markdown="1">
  <summary>Необязательные расширенные параметры</summary>

  Значения по умолчанию для следующих расширенных параметров будут хорошо работать практически во всех ситуациях.
  Мы не рекомендуем их менять.

  Необязательный параметр `dictionary_block_size` (по умолчанию: 512) указывает размер блоков словаря в строках.

  Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) указывает, используют ли блоки словаря front coding для сжатия.

  Необязательный параметр `posting_list_block_size` (по умолчанию: 1048576) указывает размер блоков списка вхождений в строках.

  Необязательный параметр `posting_list_codec` (по умолчанию: `none`) указывает кодек для списка вхождений:

  * `none` - списки вхождений сохраняются без дополнительного сжатия.
  * `bitpacking` - применяется [дифференциальное (дельта) кодирование](https://en.wikipedia.org/wiki/Delta_encoding), за которым следует [bit-packing](https://dev.to/madhav_baby_giraffe/bit-packing-the-secret-to-optimizing-data-storage-and-transmission-m70) (каждое в пределах блоков фиксированного размера). Замедляет запросы SELECT и в настоящий момент не рекомендуется.
</details>

*Гранулярность индекса.*
Текстовые индексы реализованы в ClickHouse как разновидность [пропускающих индексов](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types).
Однако в отличие от других пропускающих индексов, текстовые индексы используют «бесконечную» гранулярность (100 миллионов).
Это можно увидеть в определении таблицы с текстовым индексом.

Пример:

```sql
CREATE TABLE table(
    k UInt64,
    s String,
    INDEX idx(s) TYPE text(tokenizer = ngrams(2)))
ENGINE = MergeTree()
ORDER BY k;

SHOW CREATE TABLE table;
```

Результат:

```result
┌─statement──────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.table                                            ↴│
│↳(                                                                     ↴│
│↳    `k` UInt64,                                                       ↴│
│↳    `s` String,                                                       ↴│
│↳    INDEX idx s TYPE text(tokenizer = ngrams(2)) GRANULARITY 100000000↴│ <-- here
│↳)                                                                     ↴│
│↳ENGINE = MergeTree                                                    ↴│
│↳ORDER BY k                                                            ↴│
│↳SETTINGS index_granularity = 8192                                      │
└────────────────────────────────────────────────────────────────────────┘
```

Большое значение гранулярности индекса гарантирует, что текстовый индекс создаётся для всей части.
Явно указанная гранулярность индекса игнорируется.


## Использование текстового индекса \{#using-a-text-index\}

Использование текстового индекса в запросах SELECT просто, так как распространённые строковые функции поиска автоматически используют индекс.
Если индекс отсутствует для столбца или части таблицы, строковые функции поиска будут выполнять медленное сканирование по принципу полного перебора.

:::note
Мы рекомендуем использовать функции `hasAnyTokens` и `hasAllTokens` для поиска по текстовому индексу, см. [ниже](#functions-example-hasanytokens-hasalltokens).
Эти функции работают со всеми доступными токенизаторами и со всеми возможными выражениями препроцессора.
Поскольку другие поддерживаемые функции исторически появились раньше текстового индекса, во многих случаях им пришлось сохранить устаревшее поведение (например, отсутствие поддержки препроцессора).
:::

### Поддерживаемые функции \{#functions-support\}

Текстовый индекс можно использовать, если в предложениях `WHERE` или `PREWHERE` используются текстовые функции:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` \{#functions-example-equals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) сопоставляет весь указанный поисковый термин целиком.

Пример:

```sql
SELECT * from table WHERE str = 'Hello';
```


#### `IN` \{#functions-example-in\}

`IN` ([in](/sql-reference/functions/in-functions)) аналогична `equals`, но сопоставляет все поисковые термины.

Пример:

```sql
SELECT * from table WHERE str IN ('Hello', 'World');
```

:::note
`NOT IN` (`notIn`) не поддерживается текстовым индексом.
:::

#### `LIKE` и `match` \{#functions-example-like-match\}

:::note
В настоящее время эти функции используют текстовый индекс для фильтрации только в том случае, если токенизатор индекса — `splitByNonAlpha`, `ngrams` или `sparseGrams`.
:::

:::note
`NOT LIKE` (`notLike`) не поддерживается текстовым индексом.
:::

Чтобы использовать `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)) и функцию [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами, ClickHouse должен иметь возможность извлекать полные токены из поискового шаблона.
Для индекса с токенизатором `ngrams` это возможно, если длина искомых подстрок между символами подстановки не меньше длины n-граммы.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM table WHERE comment LIKE 'support%';
```

`support` в примере может соответствовать `support`, `supports`, `supporting` и т. д.
Такой запрос является запросом по подстроке, и его нельзя ускорить с помощью текстового индекса.

Чтобы использовать текстовый индекс для запросов с LIKE, шаблон LIKE должен быть переформулирован следующим образом:

```sql
SELECT count() FROM table WHERE comment LIKE ' support %'; -- or `% support %`
```

Пробелы слева и справа от `support` гарантируют, что термин корректно распознаётся как отдельный токен.

К счастью, есть особый случай, когда ClickHouse может использовать обратный индекс, чтобы значительно ускорить запросы LIKE.

Подробности см. в [разделе о настройке производительности LIKE/ILIKE](#like-ilike-queries-perf).


#### `startsWith` и `endsWith` \{#functions-example-startswith-endswith\}

Аналогично `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startsWith) и [endsWith](/sql-reference/functions/string-functions.md/#endsWith) могут использовать текстовый индекс только в том случае, если из поискового термина можно извлечь полные токены.
Для индекса с токенизатором `ngrams` это возможно, если длина искомых строк между подстановочными символами не меньше длины ngram.

Пример для текстового индекса с токенизатором `splitByNonAlpha`:

```sql
SELECT count() FROM table WHERE startsWith(comment, 'clickhouse support');
```

В этом примере токеном считается только `clickhouse`.
`support` не является токеном, поскольку он может совпадать со строками `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, которые начинаются с `clickhouse supports`, завершите шаблон поиска пробелом в конце:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, функцию `endsWith` следует использовать с пробелом в начале:

```sql
SELECT count() FROM table WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` и `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

:::note
Функция `hasToken` кажется простой в использовании, но имеет определённые подводные камни при работе с нестандартными токенизаторами и выражениями препроцессора.
Мы рекомендуем вместо неё использовать функции `hasAnyTokens` и `hasAllTokens`.
:::

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) выполняют поиск по одному указанному токену.

В отличие от ранее упомянутых функций, они не разбивают поисковый термин на токены (предполагается, что на вход подается один токен).

Пример:

```sql
SELECT count() FROM table WHERE hasToken(comment, 'clickhouse');
```


#### `hasAnyTokens` и `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) выполняют поиск по одному или всем указанным токенам.

Эти две функции принимают поисковые токены либо в виде строки, которая будет разбита на токены с использованием того же токенизатора, что и для столбца с индексом, либо в виде массива уже обработанных токенов, к которым перед поиском токенизация применяться не будет.
См. документацию по функциям для получения дополнительной информации.

Пример:

```sql
-- Search tokens passed as string argument
SELECT count() FROM table WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM table WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM table WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM table WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

Функция для работы с массивами [`has`](/sql-reference/functions/array-functions#has) проверяет наличие одного токена в массиве строк.

Пример:

```sql
SELECT count() FROM table WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey) (псевдоним `mapContainsKey`) сопоставляет токены, извлечённые из искомой строки, с ключами в map.
Поведение аналогично функции `equals` со столбцом типа `String`.
Текстовый индекс используется только в том случае, если он был создан для выражения `mapKeys(map)`.

Пример:

```sql
SELECT count() FROM table WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM table WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

Функция [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue) сопоставляет токены, извлечённые из искомой строки, со значениями отображения (map).
Поведение похоже на функцию `equals` со столбцом типа `String`.
Текстовый индекс используется только в том случае, если он был создан на выражении `mapValues(map)`.

Пример:

```sql
SELECT count() FROM table WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` и `mapContainsValueLike` \{#functions-example-mapcontainslike\}

Функции [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) и [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) сопоставляют шаблон со всеми ключами или, соответственно, значениями карты.

Пример:

```sql
SELECT count() FROM table WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM table WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

Оператор доступа [operator[]](/sql-reference/operators#access-operators) можно использовать с текстовым индексом при фильтрации ключей и значений. Текстовый индекс используется только в том случае, если он создан для выражений `mapKeys(map)` или `mapValues(map)`, или для обоих.

Пример:

```sql
SELECT count() FROM table WHERE map['engine'] = 'clickhouse';
```

См. следующие примеры использования столбцов типа `Array(T)` и `Map(K, V)` с текстовым индексом.


### Индексирование столбцов Array(String) \{#text-index-example-array\}

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

### Индексация столбцов Map \{#text-index-example-map\}

Во многих сценариях обсервабилити лог-сообщения разбиваются на &quot;компоненты&quot; и сохраняются с использованием соответствующих типов данных, например DateTime для временной метки, Enum для уровня логирования и т. д.
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
SELECT * FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
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

### Индексация JSON-столбцов \{#text-index-example-json\}

Текстовые индексы можно использовать со столбцами `JSON` тремя способами:

1. **Индексы для конкретных подстолбцов** — создайте текстовый индекс для известного пути JSON, как и для обычного столбца. При этом индексируются *значения* по этому пути.
2. **Индексы на основе путей с [JSONAllPaths](/sql-reference/functions/json-functions.md/#JSONAllPaths)** — индексируйте *все пути*, присутствующие в каждой грануле, чтобы пропускать гранулы, которые заведомо не могут содержать запрашиваемый путь. Аналогично столбцам `Map`.
3. **Индексы на основе значений с [JSONAllValues](/sql-reference/functions/json-functions.md#JSONAllValues)** — индексируйте *все значения* по всем путям JSON, чтобы ускорить полнотекстовый поиск по любому подстолбцу JSON с помощью одного индекса.

#### Индексы по определённым подстолбцам \{#json-indexes-on-subcolumns\}

Вы можете создать индекс пропуска данных для любого подстолбца JSON, используя тот же синтаксис, что и для обычных столбцов.

Есть два способа обратиться к подстолбцу JSON в выражении индекса:

* **Типизированный путь**, объявленный в подсказке типа JSON, — прямое обращение по имени: `json.a`.
* **Динамический путь** с явным приведением типа — используйте синтаксис приведения `::`: `json.b::String`.

Пример определения индекса:

```sql
CREATE TABLE sensor_data
(
    data JSON(sensor_id String),
    INDEX idx_sensor data.sensor_id TYPE text(tokenizer = splitByNonAlpha),
    INDEX idx_location data.location::String TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 1;

INSERT INTO sensor_data SELECT toJSONString(map('sensor_id', 'id_' || number , 'location', 'room_' || toString(number))) FROM numbers(4);
INSERT INTO sensor_data SELECT toJSONString(map('sensor_id', 'id_' || number, 'location', 'room_' || toString(number))) FROM numbers(4, 4);
```

Пример запроса:

```sql
EXPLAIN indexes = 1 SELECT * FROM sensor_data WHERE data.sensor_id = 'id_5';
```

Результат:

```text
...
    Indexes:
      Skip
        Name: idx_sensor
        Description: text
        Condition: (mode: All; tokens: ["5", "id"])
        Parts: 1/2
        Granules: 1/8
```

Пример запроса:

```sql
EXPLAIN indexes = 1 SELECT * FROM sensor_data WHERE data.location::String = 'room_5';
```

Результат:

```text
...
    Indexes:
      Skip
        Name: idx_location
        Description: text
        Condition: (mode: All; tokens: ["5", "room"])
        Parts: 1/2
        Granules: 1/8
```

#### Индексы на основе путей с JSONAllPaths \{#json-indexes-jsonallpaths\}

Как и для столбцов `Map`, для столбцов [JSON](/sql-reference/data-types/newjson.md) можно создавать текстовые индексы с помощью [`JSONAllPaths`](/sql-reference/functions/json-functions.md/#JSONAllPaths).
Индекс хранит набор JSON-путей, присутствующих в каждой грануле, и использует их, чтобы пропускать гранулы, в которых отсутствует запрашиваемый путь.

Пример определения индекса:

```sql
CREATE TABLE events
(
    data JSON,
    INDEX idx JSONAllPaths(data) TYPE text(tokenizer = array)
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO events VALUES ('{"user": {"name": "Alice"}, "action": "login"}');
INSERT INTO events VALUES ('{"metric": {"cpu": 0.95}, "host": "srv1"}');
```

Вы можете использовать `EXPLAIN indexes = 1`, чтобы убедиться, что индекс пропуска данных используется.
Когда путь существует только в одной части, индекс пропускает другую часть.

Пример:

```sql
EXPLAIN indexes = 1 SELECT * FROM events WHERE data.user.name = 'Alice';
```

Результат:

```text
...
    Indexes:
      Skip
        Name: idx
        Description: text
        Condition: (mode: All; tokens: ["user.name"])
        Parts: 1/2
        Granules: 1/2
```

Когда путь отсутствует во всех частях, все части и гранулы пропускаются.

Пример:

```sql
EXPLAIN indexes = 1 SELECT * FROM events WHERE data.nonexistent = 1;
```

Результат:

```text title="Response"
...
    Indexes:
      Skip
        Name: idx
        Description: text
        Condition: (mode: All; tokens: ["nonexistent"])
        Parts: 0/2
        Granules: 0/2
```

`IS NOT NULL` также использует индекс — он пропускает 그래뉼ы, в которых этот путь отсутствует (так как значение в этом случае было бы `NULL`):

Пример:

```sql
EXPLAIN indexes = 1 SELECT * FROM events WHERE data.user.name IS NOT NULL;
```

Результат:

```text
...
    Indexes:
      Skip
        Name: idx
        Description: text
        Condition: (mode: All; tokens: ["user.name"])
        Parts: 1/2
        Granules: 1/2
```

#### Индексы по значениям с JSONAllValues \{#json-indexes-jsonallvalues\}

Текстовые индексы можно использовать для ускорения поиска в столбцах типа [JSON](/sql-reference/data-types/newjson.md) с помощью функции [`JSONAllValues`](/sql-reference/functions/json-functions.md#JSONAllValues).

`JSONAllValues` возвращает все значения из JSON-столбца в виде `Array(String)`.
Значения нестроковых типов данных (например, целые числа и массивы) преобразуются в текстовое представление.
Текстовый индекс, построенный с использованием `JSONAllValues`, индексирует эти текстовые представления по всем JSON-путям в каждой строке.
Затем этот индекс может ускорять запросы, которые фильтруют по отдельным JSON-подстолбцам.
Когда запрос фильтрует по конкретному подстолбцу (например, `data.user_name = 'alice'`), текстовый индекс может быстро отсеивать строки (и гранулы), которые не содержат искомых токенов ни в одном из своих JSON-значений.

:::note
Индекс может давать ложноположительные срабатывания, если одинаковые токены встречаются в разных JSON-путях.
Например, если строка 1 содержит `{"a": "hello", "b": "world"}`, а запрос ищет `data.a = 'world'`, текстовый индекс не может определить, что `world` относится к пути `b`, а не `a`.
В таких случаях индекс не отсеет строку, а окончательную проверку выполнит фильтр по фактическим данным столбца.
Это такое же поведение, как и в других сценариях использования текстового индекса, где индекс выступает быстрым предварительным фильтром.
:::

##### Создание индекса \{#json-all-values-creating-the-index\}

Пример определения индекса:

```sql
CREATE TABLE events
(
    id UInt64,
    data JSON,
    INDEX json_idx JSONAllValues(data) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY id;
```

##### Поддерживаемые шаблоны запросов \{#json-all-values-supported-query-patterns\}

После создания индекс может ускорять выполнение запросов к подстолбцам JSON с использованием тех же функций, что и для столбцов `String`, а также функции `equals` для всех столбцов.

Доступ к подстолбцам:

```sql
SELECT * FROM events WHERE data.user_name = 'alice';
SELECT * FROM events WHERE data.message LIKE '% error %';
SELECT * FROM events WHERE startsWith(data.status, 'fail');
SELECT * FROM events WHERE hasToken(data.title, 'clickhouse');
```

Доступ к подстолбцу с явным `CAST`:

```sql
SELECT * FROM events WHERE hasAllTokens(data.message::String, 'connection timeout');
SELECT * FROM events WHERE data.status_code::UInt64 = 404;
SELECT * FROM events WHERE has(data.tags::Array(String), 'bug')
```

Оператор `IN`:

```sql
SELECT * FROM events WHERE data.level IN ('error', 'critical');
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

Оптимизация прямого чтения обрабатывает запрос, используя исключительно текстовый индекс (т.е. обращения к текстовому индексу) без доступа к исходному текстовому столбцу.
Обращения к текстовому индексу читают относительно мало данных и поэтому существенно быстрее, чем обычные индексы пропуска данных в ClickHouse (которые выполняют обращение к индексу пропуска данных, а затем загружают и фильтруют оставшиеся гранулы).

Прямое чтение управляется двумя настройками:

* Настройка [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) (по умолчанию true), которая определяет, включено ли прямое чтение в целом.
* Настройка [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read) была обязательным условием для прямого чтения в версиях ClickHouse &lt; 26.4.

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
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
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
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
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
FROM table
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS query_plan_text_index_add_hint = 0
FORMAT TSV
```

возвращает

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

тогда как тот же запрос с `query_plan_text_index_add_hint = 1`

```sql
EXPLAIN actions = 1
SELECT count()
FROM table
WHERE col LIKE '%some-token%'
SETTINGS query_plan_text_index_add_hint = 1
```

возвращает

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

Во втором выводе EXPLAIN PLAN вы можете увидеть, что к условию фильтрации была добавлена дополнительная конъюнкция (`__text_index_...`).
Благодаря оптимизации [PREWHERE](/sql-reference/statements/select/prewhere) условие фильтрации разбивается на три отдельные конъюнкции, которые применяются в порядке возрастания вычислительной сложности.
Для этого запроса порядок применения такой: сначала `__text_index_...`, затем `greaterOrEquals(...)` и, наконец, `like(...)`.
Такой порядок позволяет пропускать ещё больше гранул данных по сравнению с теми, которые уже пропускаются текстовым индексом и исходным фильтром, ещё до чтения «тяжёлых» столбцов, используемых в запросе после предложения `WHERE`, что дополнительно уменьшает объём данных для чтения.

### Запросы LIKE/ILIKE \{#like-ilike-queries-perf\}

Когда шаблон запроса LIKE/ILIKE имеет вид `%<alpha-numeric-characters-without-spaces>%`, а токенизатор текстового индекса — `splitByNonAlpha`, ClickHouse использует инвертированный индекс, чтобы существенно ускорить запросы LIKE/ILIKE. Для этого ClickHouse сканирует словарь инвертированного индекса вместо полного сканирования таблицы в поисках совпадающего шаблона.

Когда эта оптимизация включена, запросы LIKE/ILIKE должны выполняться значительно быстрее, чем при полном сканировании таблицы. Однако если шаблон совпадает с большинством токенов в словаре, производительность может оказаться ниже, чем при полном сканировании таблицы. К счастью, чтобы этого избежать, предусмотрен механизм возврата к полному сканированию.

Эта оптимизация управляется настройкой:

* [use&#95;text&#95;index&#95;like&#95;evaluation&#95;by&#95;dictionary&#95;scan](../../../operations/settings/settings#use_text_index_like_evaluation_by_dictionary_scan)

Механизм возврата к полному сканированию управляется двумя настройками:

* [text&#95;index&#95;like&#95;min&#95;pattern&#95;length](../../../operations/settings/settings#text_index_like_min_pattern_length)
* [text&#95;index&#95;like&#95;max&#95;postings&#95;to&#95;read](../../../operations/settings/settings#text_index_like_max_postings_to_read)

Эта оптимизация поддерживает только функции `like` и `ilike`.

### Кэширование \{#caching\}

Доступны различные кэши для буферизации частей текстового индекса в памяти (см. раздел [Implementation Details](#implementation)).
В настоящее время доступны кэши для десериализованных заголовков, токенов и списков вхождений текстового индекса для снижения объёма операций ввода-вывода.
Их можно включить с помощью настроек [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache), [use_text_index_tokens_cache](/operations/settings/settings#use_text_index_tokens_cache) и [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache).

По умолчанию все кэши отключены.
Чтобы очистить кэши, используйте команду [SYSTEM CLEAR TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches).

Для настройки кэшей используйте следующие параметры сервера.

#### Настройки кэша токенов \{#caching-tokens\}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_tokens_cache_policy](/operations/server-configuration-parameters/settings#text_index_tokens_cache_policy)                | Имя политики кэширования токенов текстового индекса.                                                           |
| [text_index_tokens_cache_size](/operations/server-configuration-parameters/settings#text_index_tokens_cache_size)                    | Максимальный размер кэша в байтах.                                                                             |
| [text_index_tokens_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_tokens_cache_max_entries)      | Максимальное количество десериализованных токенов в кэше.                                                      |
| [text_index_tokens_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_tokens_cache_size_ratio)        | Размер защищённой очереди в кэше токенов текстового индекса относительно общего размера кэша.                  |

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

## Ограничения \{#limitations\}

В настоящий момент текстовый индекс имеет следующие ограничения:

- Материализация текстовых индексов с большим количеством токенов (например, 10 миллиардов токенов) может потреблять значительный объем памяти. Материализация текстового
  индекса может выполняться напрямую (`ALTER TABLE <table> MATERIALIZE INDEX <index>`) или косвенно при слиянии частей.
- Невозможно материализовать текстовые индексы на частях с более чем 4.294.967.296 (= 2^32 = примерно 4,2 миллиарда) строк. Без материализованного текстового индекса запросы переключаются на медленный поиск полным перебором внутри части. В худшем случае можно оценивать так: предположим, что часть содержит один столбец типа String и настройка MergeTree `max_bytes_to_merge_at_max_space_in_pool` (значение по умолчанию: 150 GB) не изменялась. В этом случае такая ситуация возникает, если столбец в среднем содержит менее 29,5 символов на строку. На практике таблицы также содержат другие столбцы, и порог в несколько раз меньше (в зависимости от количества, типа и размера других столбцов).

## Текстовые индексы и индексы на основе фильтра Блума \{#text-index-vs-bloom-filter-indexes\}

Строковые предикаты можно ускорить с помощью текстовых индексов и индексов на основе фильтра Блума (тип индекса `bloom_filter`, `ngrambf_v1`, `tokenbf_v1`, `sparse_grams`), однако эти подходы принципиально различаются по своему устройству и целевым сценариям использования:

**Индексы на основе фильтра Блума**

- Основаны на вероятностных структурах данных, которые могут давать ложноположительные срабатывания.
- Способны отвечать только на вопросы о принадлежности множеству, то есть столбец может содержать токен X или же точно не содержит X.
- Хранят информацию на уровне гранул, что позволяет пропускать крупные диапазоны во время выполнения запроса.
- Сложны для корректной настройки (см. [здесь](mergetree#n-gram-bloom-filter) для примера).
- Довольно компактны (несколько килобайт или мегабайт на часть).

**Текстовые индексы**

- Строят детерминированный инвертированный индекс по токенам. Ложноположительные срабатывания со стороны индекса невозможны.
- Специально оптимизированы для нагрузок полнотекстового поиска.
- Хранят информацию на уровне строк, что обеспечивает эффективный поиск по терминам.
- Довольно крупные (от десятков до сотен мегабайт на часть).

Индексы на основе фильтра Блума поддерживают полнотекстовый поиск лишь как «побочный эффект»:

- Они не поддерживают продвинутую токенизацию и предобработку.
- Они не поддерживают поиск по нескольким токенам.
- Они не обеспечивают характеристик производительности, ожидаемых от инвертированного индекса.

Текстовые индексы, напротив, специально предназначены для полнотекстового поиска:

- Они обеспечивают токенизацию и предобработку.
- Они обеспечивают эффективную поддержку функций `hasAllTokens`, `LIKE`, `match` и аналогичных функций текстового поиска.
- Они обладают значительно лучшей масштабируемостью для больших текстовых корпусов.

## Подробности реализации \{#implementation\}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:

* словаря, который отображает каждый токен в список вхождений, и
* набора списков вхождений, каждый из которых представляет собой множество номеров строк.

Текстовый индекс строится для всей части.
В отличие от других индексов пропуска данных, текстовый индекс при слиянии частей данных может быть объединён, а не перестроен (см. ниже).

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
Этот метод слияния текстовых индексов подобен тому, как объединяются [проекции](/docs/sql-reference/statements/alter/projection#projection-indexes) со столбцом `_part_offset`.
Если индекс не материализован в исходной части, он строится, записывается во временный файл и затем объединяется с индексами из других частей и из других временных файлов индексов.

**Отладка**

Табличная функция [mergeTreeTextIndex](../../../sql-reference/table-functions/mergeTreeTextIndex.md) может быть использована для анализа текстовых индексов.

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
SETTINGS query_plan_direct_read_from_text_index = 0;

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
SETTINGS query_plan_direct_read_from_text_index = 1;

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
SETTINGS query_plan_direct_read_from_text_index = 0;

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
SETTINGS query_plan_direct_read_from_text_index = 1;

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
Даже при отключённом прямом чтении стандартный индекс пропуска данных остаётся эффективным.
Он отфильтровывает 28,7 млн строк до всего 147,46 тыс. строк, но при этом всё равно приходится прочитать 57,03 МБ из столбца.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0;

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
SETTINGS query_plan_direct_read_from_text_index = 1;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.007 sec. Processed 147.46 thousand rows, 147.46 KB
```

Для этого поиска с оператором &quot;AND&quot; оптимизация прямого чтения более чем в 26 раз быстрее (0,184 с против 0,007 с), чем стандартное сканирование индекса пропуска данных.

### 4. Составной поиск: OR, AND, NOT, ... \{#compound-search\}

Оптимизация прямого чтения также применяется к составным логическим выражениям.
Здесь мы выполним регистронезависимый поиск по &#39;ClickHouse&#39; или &#39;clickhouse&#39;.

**Прямое чтение отключено (стандартное сканирование)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0;

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
SETTINGS query_plan_direct_read_from_text_index = 1;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.013 sec. Processed 25.87 million rows, 51.73 MB
```

Объединяя результаты из индекса, прямой запрос на чтение выполняется в 34 раза быстрее (0.450s против 0.013s) и не читает 9.58 GB данных столбца.
В этом конкретном случае предпочтительнее использовать более эффективный синтаксис `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`.

## Связанные материалы \{#related-content\}

- Презентация: https://github.com/ClickHouse/clickhouse-presentations/blob/master/2025-tumuchdata-munich/ClickHouse_%20full-text%20search%20-%2011.11.2025%20Munich%20Database%20Meetup.pdf
- Презентация: https://presentations.clickhouse.com/2026-fosdem-inverted-index/Inverted_indexes_the_what_the_why_the_how.pdf

**Устаревшие материалы**

- Статья в блоге: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Статья в блоге: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)