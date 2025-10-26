---
slug: '/engines/table-engines/mergetree-family/invertedindexes'
sidebar_label: 'Полнотекстовые индексы'
description: 'Быстро находите поисковые термины в тексте.'
title: 'Полнотекстовый поиск с использованием полнотекстовых индексов'
keywords: ['full-text search', 'text search', 'index', 'indices']
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Полнотекстовый поиск с использованием текстовых индексов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Текстовые индексы в ClickHouse (также известные как ["обратные индексы"](https://en.wikipedia.org/wiki/Inverted_index)) обеспечивают быстрые полнотекстовые возможности для строковых данных.
Индекс сопоставляет каждый токен в колонке с теми строками, которые содержат этот токен.
Токены генерируются в процессе, называемом токенизацией.
Например, ClickHouse токенизирует английское предложение "All cat like mice." по умолчанию как ["All", "cat", "like", "mice"] (обратите внимание, что конечная точка игнорируется).
Доступны более сложные токенизаторы, например, для логов.

## Создание текстового индекса {#creating-a-text-index}

Чтобы создать текстовый индекс, сначала активируйте соответствующую экспериментальную настройку:

```sql
SET allow_experimental_full_text_index = true;
```

Текстовый индекс может быть определен на [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md) и [Map](/sql-reference/data-types/map.md) (через [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) и [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) функции) колонок с использованием следующего синтаксиса:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha|splitByString(S)|ngrams(N)|array
                                -- Optional parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

Аргумент `tokenizer` указывает токенизатор:

- `splitByNonAlpha` разбивает строки по неалфавитным ASCII символам (также см. функцию [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitbynonalpha)).
- `splitByString(S)` разбивает строки по определенным разделителям, заданным пользователем `S` (также см. функцию [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitbystring)).
  Разделители могут быть указаны с помощью необязательного параметра, например, `tokenizer = splitByString([', ', '; ', '\n', '\\'])`.
  Обратите внимание, что каждая строка может состоять из нескольких символов (`', '` в примере).
  Список разделителей по умолчанию, если он не указан явно (например, `tokenizer = splitByString`), составляет один пробел `[' ']`.
- `ngrams(N)` разбивает строки на равные по размеру `N`-граммы (также см. функцию [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)).
  Длина ngram может быть указана с помощью необязательного целочисленного параметра от 2 до 8, например, `tokenizer = ngrams(3)`.
  Стандартный размер ngram по умолчанию, если он не указан явно (например, `tokenizer = ngrams`), составляет 3.
- `array` не выполняет токенизацию, т.е. каждое значение строки является токеном (также см. функцию [array](/sql-reference/functions/array-functions.md/#array)).

:::note
Токенизатор `splitByString` применяет разделители сверху вниз.
Это может создать неоднозначности.
Например, строковые разделители `['%21', '%']` приведут к тому, что `%21abc` будет токенизирован как `['abc']`, в то время как переключение двух строковых разделителей `['%', '%21']` выдаст `['21abc']`.
В большинстве случаев вы хотите, чтобы совпадение предпочитало более длинные разделители в первую очередь.
Это можно сделать, передав строковые разделители в порядке убывания длины.
Если строковые разделители случайно образуют [префиксный код](https://en.wikipedia.org/wiki/Prefix_code), их можно передавать в произвольном порядке.
:::

Чтобы протестировать, как токенизаторы разбивают входную строку, вы можете использовать функцию ClickHouse [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens):

Например,

```sql
SELECT tokens('abc def', 'ngrams', 3) AS tokens;
```

возвращает

```result
+-tokens--------------------------+
| ['abc','bc ','c d',' de','def'] |
+---------------------------------+
```

Текстовые индексы в ClickHouse реализованы как [вторичные индексы](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types).
Однако, в отличие от других индексных индексов, текстовые индексы имеют стандартную ГРАНУЛЯРНОСТЬ индекса 64.
Это значение выбрано эмпирически и обеспечивает хороший компромисс между скоростью и размером индекса для большинства случаев использования.
Опытные пользователи могут указать другую гранулярность индекса (чего мы не рекомендуем).

<details markdown="1">

<summary>Расширенные параметры</summary>

Стандартные значения следующих расширенных параметров будут хорошо работать практически в любых условиях.
Мы не рекомендуем их изменять.

Необязательный параметр `dictionary_block_size` (по умолчанию: 128) задает размер блоков словаря в строках.

Необязательный параметр `dictionary_block_frontcoding_compression` (по умолчанию: 1) указывает, используют ли блоки словаря фронт-кодирование в качестве сжатия.

Необязательный параметр `max_cardinality_for_embedded_postings` (по умолчанию: 16) задает порог кардинальности, ниже которого списки публикаций должны быть встроены в блоки словаря.

Необязательный параметр `bloom_filter_false_positive_rate` (по умолчанию: 0.1) задает уровень ложноположительных срабатываний фильтра Блума словаря.
</details>

Текстовые индексы могут быть добавлены или удалены из колонки после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```

## Использование текстового индекса {#using-a-text-index}

Использование текстового индекса в запросах SELECT просто, поскольку общие функции поиска строк будут автоматически использовать индекс.
Если индекс не существует, ниже перечисленные функции поиска строк будут возвращаться к медленным полным сканированиям.

### Поддерживаемые функции {#functions-support}

Текстовый индекс может быть использован, если текстовые функции применяются в предложении `WHERE` запроса SELECT:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` и `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) и `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) соответствуют всему данному поисковому термину.

Пример:

```sql
SELECT * from tab WHERE str = 'Hello';
```

Текстовый индекс поддерживает `=` и `!=`, однако поиск по равенству и неравенству имеет смысл только с токенизатором `array` (что приводит к тому, что индекс хранит целые значения строк).

#### `IN` и `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) и `NOT IN` ([notIn](/sql-reference/functions/in-functions)) аналогичны функциям `equals` и `notEquals`, но соответствуют всем (`IN`) или ни одному (`NOT IN`) из поисковых терминов.

Пример:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

Те же ограничения, что и для `=` и `!=`, применимы, т.е. `IN` и `NOT IN` имеют смысл только в сочетании с токенизатором `array`.

#### `LIKE`, `NOT LIKE` и `match` {#functions-example-like-notlike-match}

:::note
Эти функции в настоящее время используют текстовый индекс для фильтрации только в случае, если токенизатор индекса является либо `splitByNonAlpha`, либо `ngrams`.
:::

Для использования `LIKE` [like](/sql-reference/functions/string-search-functions.md/#like), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notlike)), и функции [match](/sql-reference/functions/string-search-functions.md/#match) с текстовыми индексами, ClickHouse должен быть в состоянии извлечь полные токены из поискового термина.

Пример:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

`support` в примере может соответствовать `support`, `supports`, `supporting` и т.д.
Этот вид запроса является запросом подстроки и его нельзя ускорить с помощью текстового индекса.

Чтобы использовать текстовый индекс для запросов с LIKE, шаблон LIKE должен быть переписан следующим образом:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

Пробелы слева и справа от `support` гарантируют, что термин может быть извлечен как токен.

#### `startsWith` и `endsWith` {#functions-example-startswith-endswith}

Аналогично `LIKE`, функции [startsWith](/sql-reference/functions/string-functions.md/#startswith) и [endsWith](/sql-reference/functions/string-functions.md/#endswith) могут использовать текстовый индекс, если полные токены могут быть извлечены из поискового термина.

Пример:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

В приведенном примере только `clickhouse` считается токеном.
`support` не является токеном, поскольку он может соответствовать `support`, `supports`, `supporting` и т.д.

Чтобы найти все строки, которые начинаются с `clickhouse supports`, добавьте пробел в конце шаблона поиска:

```sql
startsWith(comment, 'clickhouse supports ')`
```

Аналогично, `endsWith` следует использовать с ведущим пробелом:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` и `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

Функции [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken) и [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull) соответствуют одному заданному токену.

В отличие от ранее упомянутых функций, они не токенизируют поисковой термин (предполагают, что вход является одним токеном).

Пример:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

Функции `hasToken` и `hasTokenOrNull` являются самыми производительными функциями для использования с текстовым индексом.

#### `hasAnyTokens` и `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

Функции [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens) и [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens) соответствуют одному или всем заданным токенам.

Как и `hasToken`, токенизация поисковых терминов не происходит.

Пример:

```sql
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);

SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

Функция массива [has](/sql-reference/functions/array-functions#has) соответствует одному токену в массиве строк.

Пример:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

Функция [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)(алиас: `mapContainsKey`) соответствует одному токену в ключах карты.

Пример:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

Оператор доступа [operator[]](/sql-reference/operators#access-operators) может быть использован с текстовым индексом для фильтрации ключей и значений.

Пример:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse'; -- will use the text index if defined
```

Смотрите следующие примеры использования `Array(T)` и `Map(K, V)` с текстовым индексом.

### Примеры поддержки текстового индекса `Array` и `Map`. {#text-index-array-and-map-examples}

#### Индексация Array(String) {#text-indexi-example-array}

На простой платформе для ведения блогов авторы назначают ключевые слова своим публикациям для категоризации контента.
Общая функция позволяет пользователям находить связанный контент, кликая по ключевым словам или ища темы.

Рассмотрим следующее определение таблицы:

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String) COMMENT 'Author-defined keywords'
)
ENGINE = MergeTree
ORDER BY (post_id);
```

Без текстового индекса поиск публикаций с определенным ключевым словом (например, `clickhouse`) требует сканирования всех записей:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

По мере роста платформы это становится все более медленным, так как запрос должен просмотреть каждый массив ключевых слов в каждой строке.

Чтобы преодолеть эту проблему производительности, мы можем определить текстовый индекс для `keywords`, который создает структуру, оптимизированную для поиска и обрабатывающую все ключевые слова, позволяя мгновенные поиски:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
```

:::note
Важно: После добавления текстового индекса вы должны перестроить его для существующих данных:

```sql
ALTER TABLE posts MATERIALIZE INDEX keywords_idx;
```
:::

#### Индексация Map {#text-index-example-map}

В системе логирования запросы серверов часто хранят метаданные в парах ключ-значение. Операционным командам необходимо эффективно искать по логам для отладки, инцидентов безопасности и мониторинга.

Рассмотрим эту таблицу логов:

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

Без текстового индекса поиск по данным [Map](/sql-reference/data-types/map.md) требует полных сканирований таблицы:

1. Находит все логи с ограничением по скорости:

```sql
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan
```

2. Находит все логи с определенного IP:

```sql
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

По мере роста объема логов эти запросы становятся медленными.

Решением является создание текстового индекса для ключей и значений [Map](/sql-reference/data-types/map.md).

Используйте [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) для создания текстового индекса, когда вам нужно находить логи по именам полей или типам атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
```

Используйте [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) для создания текстового индекса, когда вам нужно искать в фактическом содержании атрибутов:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
```

:::note
Важно: После добавления текстового индекса вы должны перестроить его для существующих данных:

```sql
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```
:::

1. Найдите все запросы с ограничениями по скорости:

```sql
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast
```

2. Находит все логи с определенного IP:

```sql
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```

## Реализация {#implementation}

### Макет индекса {#index-layout}

Каждый текстовый индекс состоит из двух (абстрактных) структур данных:
- словарь, который сопоставляет каждый токен со списком публикаций, и
- набор списков публикаций, каждый из которых представляет собой набор номеров строк.

Поскольку текстовый индекс является индексом пропуска, эти структуры данных логически существуют на каждый гранулярный индекс.

Во время создания индекса создаются три файла (на каждую часть):

**Файл блоков словаря (.dct)**

Токены в грануле индекса сортируются и хранятся в блоках словаря по 128 токенов каждый (размер блока настраивается с помощью параметра `dictionary_block_size`).
Файл блоков словаря (.dct) содержит все блоки словаря всех гранул индекса в части.

**Файл гранул индекса (.idx)**

Файл гранул индекса содержит для каждого блока словаря первый токен блока, ее относительное смещение в файле блоков словаря и фильтр Блума для всех токенов в блоке.
Эта разреженная структура индекса аналогична [разреженному первичному индексу](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes) ClickHouse.
Фильтр Блума позволяет пропустить блоки словаря на раннем этапе, если искомый токен не содержится в блоке словаря.

**Файл списков публикаций (.pst)**

Списки публикаций для всех токенов расположены последовательно в файле списков публикаций.
Чтобы сэкономить место, обеспечивая при этом быстрые операции пересечения и объединения, списки публикаций хранятся в виде [roaring bitmaps](https://roaringbitmap.org/).
Если кардинальность списка публикаций меньше 16 (настраиваемый параметр `max_cardinality_for_embedded_postings`), он встраивается в словарь.

### Прямое чтение {#direct-read}

Некоторые типы текстовых запросов могут быть значительно ускорены с помощью оптимизации, называемой "прямое чтение".
Более конкретно, оптимизацию можно применить, если запрос SELECT _не_ проецирует из текстовой колонки.

Пример:

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

Оптимизация прямого чтения в ClickHouse отвечает на запрос исключительно с использованием текстового индекса (т.е. запросы текстового индекса) без доступа к основной текстовой колонке.
Запросы текстового индекса читают относительно мало данных, и поэтому гораздо быстрее, чем обычно индексы пропуска в ClickHouse (которые выполняют запрос индекса пропуска, за которым следует загрузка и фильтрация оставшихся гранул).

**Поддерживаемые функции**
Оптимизация прямого чтения поддерживает функции `hasToken`, `searchAll` и `searchAny`.
Эти функции также могут комбинироваться с операторами AND, OR и NOT.
В предложении WHERE также могут содержаться дополнительные фильтры, не связанные с текстовым поиском (для текстовых колонок или других колонок) - в этом случае оптимизация прямого чтения по-прежнему будет использоваться, но менее эффективно (она применяется только к поддерживаемым функциям текстового поиска).

## Пример: Набор данных Hackernews {#hacker-news-dataset}

Давайте посмотрим на улучшения производительности текстовых индексов на большом наборе данных с большим объемом текста.
Мы будем использовать 28.7M строк комментариев на популярном сайте Hacker News. Вот таблица без текстового индекса:

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

28.7M строк находятся в файле Parquet в S3 - давайте вставим их в таблицу `hackernews`:

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

Рассмотрим следующий простой поиск по термину `ClickHouse` (и его различным верхнему и нижнему регистрам) в колонке `comment`:

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

Обратите внимание, что выполнение запроса занимает 3 секунды:

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

Мы используем `ALTER TABLE` и добавляем текстовый индекс на строчные символы колонки `comment`, затем материализуем его (это может занять некоторое время - ждите его материализации):

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

Мы выполняем тот же запрос...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...и замечаем, что запрос выполняется в 4 раза быстрее:

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

Мы также можем искать один или все несколько терминов, т.е. дизъюнкции или конъюнкции:

```sql
-- multiple OR'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') OR hasToken(lower(comment), 'sve');

-- multiple AND'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

## Связанный контент {#related-content}

- Блог: [Введение в обратные индексы в ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- Блог: [Внутри полнотекстового поиска ClickHouse: быстро, нативно и столбцово](https://clickhouse.com/blog/clickhouse-full-text-search)
- Видео: [Полнотекстовые индексы: проектирование и эксперименты](https://www.youtube.com/watch?v=O_MnyUkrIq8)