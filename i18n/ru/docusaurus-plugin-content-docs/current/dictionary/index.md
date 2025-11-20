---
slug: /dictionary
title: 'Справочник'
keywords: ['dictionary', 'dictionaries']
description: 'Справочник представляет данные в виде пар ключ-значение для быстрого доступа.'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Справочник

Справочник в ClickHouse предоставляет хранящееся в памяти [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) представление данных из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для сверхмалой задержки при поисковых запросах.

Справочники полезны для:
- Повышения производительности запросов, особенно при использовании с `JOIN`
- Обогащения поступающих данных «на лету» без замедления процесса загрузки

<Image img={dictionaryUseCases} size="lg" alt="Сценарии использования справочников в ClickHouse"/>



## Ускорение соединений с помощью словаря {#speeding-up-joins-using-a-dictionary}

Словари можно использовать для ускорения определённого типа `JOIN`: типа [`LEFT ANY`](/sql-reference/statements/select/join#supported-types-of-join), где ключ соединения должен совпадать с ключевым атрибутом базового хранилища ключ-значение.

<Image
  img={dictionaryLeftAnyJoin}
  size='sm'
  alt='Использование словаря с LEFT ANY JOIN'
/>

В этом случае ClickHouse может использовать словарь для выполнения [прямого соединения (Direct Join)](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения в ClickHouse, применимый когда базовый [движок таблиц](/engines/table-engines) для правой таблицы поддерживает запросы ключ-значение с низкой задержкой. В ClickHouse есть три движка таблиц, обеспечивающих это: [Join](/engines/table-engines/special/join) (по сути предварительно вычисленная хеш-таблица), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход на основе словаря, но механизм работы одинаков для всех трёх движков.

Алгоритм прямого соединения требует, чтобы правая таблица была основана на словаре, так что данные из этой таблицы, подлежащие соединению, уже присутствуют в памяти в виде структуры данных ключ-значение с низкой задержкой.

### Пример {#example}

Используя набор данных Stack Overflow, ответим на вопрос:
_Какая публикация о SQL на Hacker News является наиболее спорной?_

Мы определим спорность как ситуацию, когда публикации имеют примерно одинаковое количество положительных и отрицательных голосов. Мы вычисляем абсолютную разницу, где значение ближе к 0 означает большую спорность. Предположим, что публикация должна иметь как минимум 10 положительных и отрицательных голосов — публикации, за которые люди не голосуют, не являются особо спорными.

При нормализованных данных этот запрос в настоящее время требует `JOIN` с использованием таблиц `posts` и `votes`:

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

Row 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

> **Используйте меньшие наборы данных в правой части `JOIN`**: Этот запрос может показаться более многословным, чем требуется, с фильтрацией по `PostId` как во внешнем, так и во вложенном запросах. Это оптимизация производительности, которая обеспечивает быстрое время отклика запроса. Для оптимальной производительности всегда следите за тем, чтобы правая часть `JOIN` была меньшим набором данных и настолько малой, насколько возможно. Для советов по оптимизации производительности JOIN и понимания доступных алгоритмов мы рекомендуем [эту серию статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос быстрый, он требует от нас тщательного написания `JOIN` для достижения хорошей производительности. В идеале мы бы просто отфильтровали публикации до тех, которые содержат «SQL», прежде чем смотреть на количество `UpVote` и `DownVote` для подмножества публикаций для вычисления нашей метрики.

#### Применение словаря {#applying-a-dictionary}

Для демонстрации этих концепций мы используем словарь для наших данных о голосах. Поскольку словари обычно хранятся в памяти ([ssd_cache](/sql-reference/dictionaries#ssd_cache) является исключением), пользователи должны учитывать размер данных. Проверим размер нашей таблицы `votes`:


```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes           │ 1.25 ГиБ        │ 3.79 ГиБ          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

Данные будут храниться в словаре без сжатия, поэтому нам потребуется как минимум 4 ГБ памяти, если бы мы сохраняли в словаре все столбцы (мы этого делать не будем). Словарь будет реплицирован по всему нашему кластеру, поэтому этот объём памяти необходимо зарезервировать *на каждый узел*.

> В примере ниже данные для нашего словаря берутся из таблицы ClickHouse. Хотя это и является самым распространённым источником словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, HTTP и базы данных, в том числе [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут автоматически обновляться, что является идеальным способом обеспечить доступность небольших наборов данных, подверженных частым изменениям, для прямых соединений.

Нашему словарю требуется первичный ключ, по которому будут выполняться выборки. Концептуально он идентичен первичному ключу в транзакционной базе данных и должен быть уникальным. В нашем запросе выше требуется поиск по ключу соединения — `PostId`. Словарь, в свою очередь, должен быть заполнен суммарным количеством голосов «за» и «против» по каждому `PostId` из нашей таблицы `votes`. Ниже приведён запрос для получения этих данных для словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Для создания нашего словаря требуется следующий DDL — обратите внимание на использование приведённого выше запроса:

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

> В самоуправляемом варианте OSS приведённую выше команду необходимо выполнить на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицирован на все узлы. Операция выше была выполнена на узле ClickHouse Cloud с 64 ГБ ОЗУ, загрузка заняла 36 секунд.

Чтобы подтвердить объём памяти, потребляемый нашим словарём:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Получить количество голосов «за» и «против» для конкретного `PostId` теперь можно с помощью простой функции `dictGet`. Ниже мы получаем значения для поста `11227902`:

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

Этот запрос не только гораздо проще, но и более чем в два раза быстрее! Можно ещё сильнее оптимизировать его, загружая в словарь только записи с более чем 10 голосами «за» и «против» и сохраняя лишь заранее вычисленное значение спорности.


## Обогащение данных на этапе выполнения запроса {#query-time-enrichment}

Словари можно использовать для поиска значений на этапе выполнения запроса. Эти значения могут возвращаться в результатах или использоваться в агрегациях. Предположим, мы создаём словарь для сопоставления идентификаторов пользователей с их местоположением:

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

Мы можем использовать этот словарь для обогащения результатов по постам:

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
│ 52296928 │ Comparison between two Strings in ClickHouse                  │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

Аналогично приведённому выше примеру с соединением, мы можем использовать тот же словарь для эффективного определения, откуда поступает большинство постов:

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

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```


## Обогащение данных при вставке {#index-time-enrichment}

В приведённом выше примере мы использовали словарь во время выполнения запроса, чтобы избежать соединения. Словари также можно использовать для обогащения строк во время вставки. Это обычно целесообразно, если значение для обогащения не изменяется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки позволяет избежать обращения к словарю во время выполнения запроса.

Предположим, что `Location` пользователя в Stack Overflow никогда не меняется (в действительности меняется) — а именно столбец `Location` таблицы `users`. Допустим, мы хотим выполнить аналитический запрос к таблице постов по местоположению. Эта таблица содержит `UserId`.

Словарь обеспечивает сопоставление идентификатора пользователя с местоположением на основе таблицы `users`:

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

> Мы исключаем пользователей с `Id < 0`, что позволяет использовать тип словаря `Hashed`. Пользователи с `Id < 0` являются системными пользователями.

Чтобы использовать этот словарь во время вставки для таблицы постов, необходимо изменить схему:

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

В приведённом выше примере `Location` объявлен как столбец `MATERIALIZED`. Это означает, что значение может быть предоставлено как часть запроса `INSERT` и всегда будет вычисляться.

> ClickHouse также поддерживает [столбцы `DEFAULT`](/sql-reference/statements/create/table#default_values) (где значение может быть вставлено или вычислено, если оно не предоставлено).

Для заполнения таблицы можно использовать обычный `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

Теперь можно получить название местоположения, из которого происходит больше всего постов:

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

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```


## Расширенные возможности словарей {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Параметр `LAYOUT` определяет внутреннюю структуру данных словаря. Доступно несколько вариантов, которые описаны [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Рекомендации по выбору подходящего layout можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали `LIFETIME` для словаря как `MIN 600 MAX 900`. LIFETIME — это интервал обновления словаря, при этом указанные значения вызывают периодическую перезагрузку через случайный интервал от 600 до 900 секунд. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновления старая версия словаря остается доступной для запросов, блокируются только запросы при первоначальной загрузке. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей.
Словари можно принудительно перезагрузить с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников баз данных, таких как ClickHouse и Postgres, можно настроить запрос, который будет обновлять словари только при их фактическом изменении (это определяется ответом запроса), а не через периодический интервал. Дополнительные сведения можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [полигональные](/sql-reference/dictionaries#polygon-dictionaries) и словари на основе [регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительные материалы {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация словарей](/sql-reference/dictionaries)
