---
slug: /dictionary
title: 'Словарь'
keywords: ['словарь', 'словари']
description: 'Словарь предоставляет представление данных в формате ключ-значение для быстрого поиска.'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Словарь

Словарь в ClickHouse предоставляет представление данных в оперативной памяти в формате [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для запросов с крайне низкой задержкой поиска.

Словари полезны для:
- Повышения производительности запросов, особенно при использовании в операциях `JOIN`
- Обогащения данных на лету в процессе ингестии, не замедляя её

<Image img={dictionaryUseCases} size="lg" alt="Сценарии использования словарей в ClickHouse"/>



## Ускорение соединений с помощью Dictionary

Dictionary можно использовать для ускорения определённого типа `JOIN`: [`LEFT ANY`](/sql-reference/statements/select/join#supported-types-of-join), когда ключ соединения должен совпадать с ключевым атрибутом базового key-value-хранилища.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Использование Dictionary с LEFT ANY JOIN" />

В таком случае ClickHouse может использовать Dictionary для выполнения [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения в ClickHouse, и он применим, когда базовый [движок таблицы](/engines/table-engines) для таблицы правой части поддерживает key-value-запросы с низкой задержкой. В ClickHouse есть три движка таблиц, обеспечивающие это: [Join](/engines/table-engines/special/join) (по сути, предварительно вычисленная хеш-таблица), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход на основе Dictionary, но механика одинакова для всех трёх движков.

Алгоритм Direct Join требует, чтобы правая таблица была реализована на основе Dictionary, так, чтобы данные, которые нужно присоединять из этой таблицы, уже находились в памяти в виде key-value-структуры данных с низкой задержкой.

### Пример

Используя набор данных Stack Overflow, ответим на вопрос:
*Какой пост, касающийся SQL, является самым спорным на Hacker News?*

Мы будем считать пост спорным, если у него схожее количество голосов «за» и «против». Мы вычислим эту абсолютную разницу, где значение, ближе к нулю, означает большую спорность. Будем считать, что у поста должно быть как минимум 10 голосов «за» и 10 «против» — посты, за которые почти не голосуют, не слишком спорные.

При нормализованных данных этот запрос в текущем виде требует `JOIN` с использованием таблиц `posts` и `votes`:

```sql
WITH PostIds AS
(
         SELECT Id
         FROM posts
         WHERE Title ILIKE '%SQL%'
)
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
INNER JOIN
(
    SELECT
         PostId,
         countIf(VoteTypeId = 2) AS UpVotes,
         countIf(VoteTypeId = 3) AS DownVotes
    FROM votes
    WHERE PostId IN (PostIds)
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Id IN (PostIds)
ORDER BY Controversial_ratio ASC
LIMIT 1

Строка 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 строка в наборе. Прошло: 1.283 сек. Обработано 418.44 млн строк, 7.23 ГБ (326.07 млн строк/с., 5.63 ГБ/с.)
Пиковое использование памяти: 3.18 ГиБ.
```

> **Используйте меньшие наборы данных в правой части `JOIN`**: Этот запрос может показаться избыточно многословным, так как фильтрация по `PostId` выполняется и во внешнем, и во вложенном запросах. Это оптимизация производительности, которая обеспечивает быстрое время отклика запроса. Для оптимальной производительности всегда следите за тем, чтобы правая сторона `JOIN` была меньшим набором и по возможности как можно меньшего размера. Советы по оптимизации производительности `JOIN` и обзору доступных алгоритмов приведены в [этой серии статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос работает быстро, он требует от нас аккуратного использования `JOIN`, чтобы достичь хорошей производительности. В идеале мы бы просто отфильтровали посты по тем, которые содержат «SQL», прежде чем анализировать значения `UpVote` и `DownVote` для этого подмножества блогов, чтобы вычислить нашу метрику.

#### Применение словаря

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных о голосах. Поскольку словари обычно хранятся в памяти ([ssd&#95;cache](/sql-reference/dictionaries#ssd_cache) — исключение), пользователям следует учитывать размер данных. Проверим размер нашей таблицы `votes`:


```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS размер_сжатых_данных,
        formatReadableSize(sum(data_uncompressed_bytes)) AS размер_несжатых_данных,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS коэффициент
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─размер_сжатых_данных─┬─размер_несжатых_данных─┬─коэффициент─┐
│ votes           │ 1.25 GiB             │ 3.79 GiB               │  3.04       │
└─────────────────┴──────────────────────┴────────────────────────┴─────────────┘
```

Данные будут храниться в нашем словаре без сжатия, поэтому нам требуется как минимум 4 ГБ памяти, если бы мы сохраняли все столбцы (мы этого делать не будем) в словаре. Словарь будет реплицирован по нашему кластеру, поэтому этот объём памяти нужно зарезервировать *на каждый узел*.

> В приведённом ниже примере данные для нашего словаря берутся из таблицы ClickHouse. Хотя это и является наиболее распространённым источником словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, HTTP и базы данных, в том числе [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут автоматически обновляться, что является идеальным способом обеспечить доступность небольших наборов данных, подверженных частым изменениям, для прямых JOIN-ов.

Для нашего словаря необходим первичный ключ, по которому будут выполняться поиски. Концептуально он идентичен первичному ключу в транзакционной базе данных и должен быть уникальным. Наш запрос выше требует поиска по ключу соединения — `PostId`. Словарь, в свою очередь, должен быть заполнен суммарным количеством голосов «за» и «против» для каждого `PostId` из нашей таблицы `votes`. Ниже приведён запрос для получения данных для этого словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Чтобы создать наш словарь, потребуется следующий DDL — обратите внимание на использование нашего запроса, приведённого выше:

```sql
CREATE DICTIONARY votes_dict
(
  `PostId` UInt64,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
PRIMARY KEY PostId
SOURCE(CLICKHOUSE(QUERY 'SELECT PostId, countIf(VoteTypeId = 2) AS UpVotes, countIf(VoteTypeId = 3) AS DownVotes FROM votes GROUP BY PostId'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())

0 строк в наборе. Затрачено: 36.063 сек.
```

> В самоуправляемой установке OSS приведённую выше команду необходимо выполнить на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицирован на все узлы. Эту операцию выполняли на узле ClickHouse Cloud с 64 ГБ ОЗУ, загрузка заняла 36 с.

Чтобы проверить объём памяти, потребляемой нашим словарём:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Теперь получение голосов «за» и «против» для конкретного `PostId` сводится к использованию простой функции `dictGet`. Ниже показано, как получить значения для поста `11227902`:

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Используя это в нашем предыдущем запросе, можно убрать JOIN:

WITH PostIds AS
(
        SELECT Id
        FROM posts
        WHERE Title ILIKE '%SQL%'
)
SELECT Id, Title,
        dictGet('votes_dict', 'UpVotes', Id) AS UpVotes,
        dictGet('votes_dict', 'DownVotes', Id) AS DownVotes,
        abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
WHERE (Id IN (PostIds)) AND (UpVotes > 10) AND (DownVotes > 10)
ORDER BY Controversial_ratio ASC
LIMIT 3

Получено 3 строки. Затрачено: 0.551 сек. Обработано 119.64 млн строк, 3.29 ГБ (216.96 млн строк/сек., 5.97 ГБ/сек.)
Пиковое использование памяти: 552.26 МиБ.
```

Мало того, что этот запрос значительно проще, он ещё и более чем вдвое быстрее! Его можно дополнительно оптимизировать, загружая в словарь только посты с более чем 10 голосами «за» и «против» и сохраняя лишь заранее вычисленное значение спорности.


## Обогащение данных при выполнении запроса

Словари можно использовать для поиска значений в момент выполнения запроса. Эти значения могут возвращаться в результатах запроса или использоваться в агрегациях. Предположим, мы создаём словарь для сопоставления идентификаторов пользователей с их местоположением:

```sql
CREATE DICTIONARY users_dict
(
  `Id` Int32,
  `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM stackoverflow.users'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

Мы можем использовать этот словарь для обогащения результатов:

```sql
SELECT
        Id,
        Title,
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location
FROM posts
WHERE Title ILIKE '%clickhouse%'
LIMIT 5
FORMAT PrettyCompactMonoBlock

┌───────Id─┬─Title─────────────────────────────────────────────────────────┬─Location──────────────┐
│ 52296928 │ Сравнение двух строк в ClickHouse                             │ Spain                 │
│ 52345137 │ Как использовать файл для миграции данных из MySQL в ClickHouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ Как изменить PARTITION в ClickHouse                           │ Guangzhou, 广东省中国   │
│ 55608325 │ Выбор последней записи в ClickHouse без max() для всей таблицы │ Moscow, Russia        │
│ 55758594 │ Создание временной таблицы в ClickHouse                       │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

Получено 5 строк. Затрачено: 0,033 сек. Обработано 4,25 млн строк, 82,84 МБ (130,62 млн строк/с., 2,55 ГБ/с.)
Пиковое использование памяти: 249,32 МиБ.
```

Аналогично приведённому выше примеру join, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходит большинство постов:

```sql
SELECT
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location,
        count() AS c
FROM posts
WHERE location != ''
GROUP BY location
ORDER BY c DESC
LIMIT 5

┌─location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
│ United Kingdom         │ 537699 │
└────────────────────────┴────────┘

5 строк в наборе. Затрачено: 0.763 сек. Обработано 59.82 млн строк, 239.28 МБ (78.40 млн строк/с., 313.60 МБ/с.)
Пиковое использование памяти: 248.84 МиБ.
```


## Обогащение во время индексации

В приведённом выше примере мы использовали словарь на этапе выполнения запроса, чтобы убрать `JOIN`. Словари также можно использовать для обогащения строк на этапе вставки. Это обычно уместно, если значение для обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В таком случае обогащение строки на этапе вставки позволяет избежать обращения к словарю во время выполнения запроса.

Предположим, что `Location` пользователя в Stack Overflow никогда не меняется (в реальности это не так), а именно столбец `Location` таблицы `users`. Допустим, мы хотим выполнить аналитический запрос к таблице `posts` по местоположению. В этой таблице есть столбец `UserId`.

Словарь предоставляет соответствие между идентификатором пользователя и его местоположением, используя таблицу `users`:

```sql
CREATE DICTIONARY users_dict
(
    `Id` UInt64,
    `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM users WHERE Id >= 0'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

> Мы исключаем пользователей с `Id < 0`, что позволяет использовать тип словаря `Hashed`. Пользователи с `Id < 0` — это системные пользователи.

Чтобы задействовать этот словарь на этапе вставки данных в таблицу posts, необходимо изменить схему:

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     ...
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

В приведённом выше примере `Location` объявлен как столбец `MATERIALIZED`. Это означает, что значение может быть передано в запросе `INSERT` и всегда будет вычислено.

> ClickHouse также поддерживает [столбцы с типом `DEFAULT`](/sql-reference/statements/create/table#default_values) (когда значение может быть явно указано при вставке или вычислено, если не задано).

Чтобы заполнить таблицу, мы можем использовать обычный `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 строк в наборе. Затрачено: 36.830 сек. Обработано 238.98 млн строк, 2.64 ГБ (6.49 млн строк/с., 71.79 МБ/с.)
```

Теперь мы можем определить название местоположения, откуда поступает большинство сообщений:

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

Получено 4 строки. Время выполнения: 0.142 сек. Обработано 59.82 млн строк, 1.08 ГБ (420.73 млн строк/с., 7.60 ГБ/с.)
Пиковое потребление памяти: 666.82 МиБ.
```


## Расширенные темы по словарям {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Секция `LAYOUT` управляет внутренней структурой данных словаря. Существует несколько вариантов, которые описаны [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые рекомендации по выбору подходящего варианта структуры можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали для словаря `LIFETIME` со значением `MIN 600 MAX 900`. LIFETIME — это интервал обновления словаря; в данном случае значения приводят к периодической перезагрузке через случайный интервал между 600 и 900 с. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновления старая версия словаря по‑прежнему может запрашиваться; только начальная загрузка блокирует запросы. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей.
Словари можно принудительно перезагрузить с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников баз данных, таких как ClickHouse и Postgres, можно настроить запрос, который будет обновлять словари только в том случае, если они действительно изменились (это определяется ответом запроса), а не через фиксированный периодический интервал. Дополнительные сведения можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [иерархические словари](/sql-reference/dictionaries#hierarchical-dictionaries), [полигональные словари](/sql-reference/dictionaries#polygon-dictionaries) и словари на основе [регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительные материалы {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация словарей](/sql-reference/dictionaries)
