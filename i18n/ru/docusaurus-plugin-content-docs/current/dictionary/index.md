---
slug: /dictionary
title: 'Словарь'
keywords: ['словарь', 'словари']
description: 'Словарь предоставляет ключ-значение представление данных для быстрого поиска.'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Словарь

Словарь в ClickHouse предоставляет представление данных в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизируя запросы для поиска с супернизкой задержкой.

Словари полезны для:
- Улучшения производительности запросов, особенно при использовании с `JOIN`s
- Обогащения поступающих данных на лету, не замедляя процесс их поступления

<Image img={dictionaryUseCases} size="lg" alt="Сценарии использования словаря в ClickHouse"/>

## Ускорение соединений с помощью словаря {#speeding-up-joins-using-a-dictionary}

Словари могут быть использованы для ускорения определенного типа `JOIN`: [`LEFT ANY` типа](/sql-reference/statements/select/join#supported-types-of-join), когда ключ соединения должен соответствовать атрибуту ключа основного хранилища ключ-значение.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Использование словаря с LEFT ANY JOIN"/>

Если это так, ClickHouse может использовать словарь для выполнения [Прямого Соединения](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения ClickHouse и применим, когда основной [движок таблиц](/engines/table-engines) для таблицы справа поддерживает запросы ключ-значение с низкой задержкой. В ClickHouse есть три движка таблиц, предлагающих эту возможность: [Join](/engines/table-engines/special/join) (это по сути предварительно рассчитанная хеш-таблица), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход на основе словаря, но механика одинаковая для всех трех движков.

Алгоритм прямого соединения требует, чтобы правая таблица была поддержана словарем, таким образом, данные, которые будут соединяться из этой таблицы, уже находятся в памяти в форме структуры данных с низкой задержкой ключ-значение.

### Пример {#example}

Используя набор данных Stack Overflow, давайте ответим на вопрос:
*Какой самый противоречивый пост по SQL на Hacker News?*

Мы определим противоречивость как ситуацию, когда посты имеют похожее количество голосов "за" и "против". Мы вычисляем это абсолютное различие, где значение, ближе к 0, означает большую противоречивость. Мы предположим, что пост должен иметь как минимум 10 голосов "за" и "против" - посты, за которые не голосуют, не являются очень противоречивыми.

С нашими нормализованными данными, этот запрос в настоящее время требует `JOIN` с таблицами `posts` и `votes`:

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

>**Используйте меньшие наборы данных на правой стороне `JOIN`**: Этот запрос может показаться более многословным, чем нужно, поскольку фильтрация по `PostId`s происходит как в внешнем, так и в подзапросах. Это оптимизация производительности, которая обеспечивает быстрое время отклика запроса. Для оптимальной производительности всегда убедитесь, что правая сторона `JOIN` является меньшим набором данных и как можно меньше. Для советов по оптимизации производительности JOIN и пониманию доступных алгоритмов мы рекомендуем [ эту серию блогов](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос быстрый, он зависит от нас, чтобы мы написали `JOIN` аккуратно для достижения хорошей производительности. В идеале, мы бы просто отфильтровали посты, содержащие "SQL", прежде чем рассматривать количество `UpVote` и `DownVote` для подмножества блогов, чтобы вычислить нашу метрику.

#### Применение словаря {#applying-a-dictionary}

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных голосования. Поскольку словари обычно хранятся в памяти ([ssd_cache](/sql-reference/dictionaries#ssd_cache) является исключением), пользователи должны быть осведомлены о размере данных. Подтверждаем размер нашей таблицы `votes`:

```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes           │ 1.25 GiB        │ 3.79 GiB          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

Данные будут храниться в несжатом виде в нашем словаре, поэтому нам нужно как минимум 4 ГБ памяти, если мы хотим хранить все столбцы (мы этого не будем) в словаре. Словарь будет реплицироваться по нашему кластеру, так что это количество памяти нужно резервировать *на узел*.

> В приведенном ниже примере данные для нашего словаря происходят из таблицы ClickHouse. Хотя это представляет собой самый распространенный источник словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, http и базы данных, включая [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут автоматически обновляться, что обеспечивает идеальный способ гарантировать, что небольшие наборы данных, подверженные частым изменениям, доступны для прямых соединений.

Нашему словарю требуется первичный ключ, по которому будут выполняться запросы. Это концептуально аналогично первичному ключу в транзакционной базе данных и должен быть уникальным. Наш запрос выше требует выполнения поиска по ключу соединения - `PostId`. Словарь должен, в свою очередь, быть заполнен общим количеством голосов "за" и "против" для каждого `PostId` из нашей таблицы `votes`. Вот запрос, чтобы получить эти данные для словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Чтобы создать наш словарь, требуется следующий DDL - обратите внимание на использование нашего запроса выше:

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

0 rows in set. Elapsed: 36.063 sec.
```

> В самоуправляемом OSS вышеуказанную команду необходимо выполнять на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицироваться на все узлы. Приведенная команда была выполнена на узле ClickHouse Cloud с 64 ГБ ОЗУ, время загрузки составило 36 секунд.

Чтобы подтвердить память, потребляемую нашим словарем:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Теперь получение голосов "за" и "против" для конкретного `PostId` можно выполнить с помощью простой функции `dictGet`. Ниже мы получаем значения для поста `11227902`:

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘


Используя это в нашем предыдущем запросе, мы можем убрать `JOIN`:

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

3 rows in set. Elapsed: 0.551 sec. Processed 119.64 million rows, 3.29 GB (216.96 million rows/s., 5.97 GB/s.)
Peak memory usage: 552.26 MiB.
```

Этот запрос не только гораздо проще, но и более чем в два раза быстрее! Его можно оптимизировать дальше, загружая в словарь только посты с более чем 10 голосами "за" и "против" и сохраняя предварительно рассчитанное значение противоречивости.

## Обогащение времени запроса {#query-time-enrichment}

Словари могут использоваться для поиска значений во время запроса. Эти значения могут быть возвращены в результатах или использованы в агрегатах. Допустим, мы создаем словарь для отображения идентификаторов пользователей на их местоположение:

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

Мы можем использовать этот словарь, чтобы обогатить результаты постов:

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
│ 52296928 │ Сравнение двух строк в ClickHouse                               │ Испания               │
│ 52345137 │ Как использовать файл для миграции данных из MySQL в ClickHouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ Как изменить PARTITION в ClickHouse                             │ Гуанчжоу, 广东省中国     │
│ 55608325 │ Clickhouse выбирает последнюю запись без max() по всей таблице │ Москва, Россия        │
│ 55758594 │ ClickHouse создает временную таблицу                           │ Пермь, Россия         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

Аналогично нашему вышеупомянутому примеру соединения, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходит большинство постов:

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
│ Индия                  │ 787814 │
│ Германия               │ 685347 │
│ Соединенные Штаты     │ 595818 │
│ Лондон, Великобритания │ 538738 │
│ Великобритания         │ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## Обогащение времени индексации {#index-time-enrichment}

В приведенном выше примере мы использовали словарь во время запроса, чтобы убрать соединение. Словари также могут использоваться для обогащения строк во время вставки. Это обычно уместно, если значение обогащения не меняется и существует во внешнем источнике, который может быть использован для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска словаря во время запроса.

Допустим, что `Location` пользователя в Stack Overflow никогда не меняется (на самом деле они меняются) - в частности, столбец `Location` таблицы `users`. Предположим, мы хотим выполнить аналитический запрос по таблице постов по местоположению. Это содержит `UserId`.

Словарь предоставляет отображение от идентификатора пользователя к местоположению, подкрепленное таблицей `users`:

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

> Мы опускаем пользователей с `Id < 0`, позволяя нам использовать тип словаря `Hashed`. Пользователи с `Id < 0` являются системными пользователями.

Чтобы использовать этот словарь во время вставки в таблицу постов, нам нужно изменить схему:

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

В приведенном выше примере `Location` объявляется как `MATERIALIZED` столбец. Это означает, что значение может быть предоставлено как частью `INSERT` запроса и всегда будет вычисляться.

> ClickHouse также поддерживает [`DEFAULT` столбцы](/sql-reference/statements/create/table#default_values) (где значение может быть вставлено или вычислено, если не было предоставлено).

Чтобы заполнить таблицу, мы можем использовать обычный `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

Теперь мы можем получить название местоположения, из которого происходит большинство постов:

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ Индия                  │ 787814 │
│ Германия               │ 685347 │
│ Соединенные Штаты     │ 595818 │
│ Лондон, Великобритания │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## Расширенные темы словарей {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Клаусула `LAYOUT` управляет внутренней структурой данных для словаря. Существует несколько опций, которые документированы [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые советы по выбору правильного макета можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали `LIFETIME` для словаря как `MIN 600 MAX 900`. LIFETIME - это интервал обновления для словаря, с указанными значениями, которые вызывают периодическую перезагрузку в случайном интервале от 600 до 900 секунд. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновлений старая версия словаря все еще может быть запрошена, при этом только начальная загрузка блокирует запросы. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей. 

Словари могут быть принудительно перезагружены с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников данных, таких как ClickHouse и Postgres, вы можете настроить запрос, который будет обновлять словари только в случае, если они действительно изменились (ответ на запрос это определяет), а не в периодическом интервале. Дополнительные сведения можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [Иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [Полигональные](/sql-reference/dictionaries#polygon-dictionaries) и [Словари регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительные материалы {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация для словарей](/sql-reference/dictionaries)
