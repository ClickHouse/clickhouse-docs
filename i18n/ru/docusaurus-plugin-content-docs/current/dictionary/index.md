---
slug: /dictionary
title: 'Словарь'
keywords: ['словарь', 'словари']
description: 'Словарь предоставляет представление данных в виде пар ключ-значение для быстрого поиска.'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Словарь

Словарь в ClickHouse предоставляет представление данных в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database), оптимизируя запросы на поиск с супернизкой задержкой из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources).

Словари полезны для:
- Улучшения производительности запросов, особенно при использовании с `JOIN`s
- Обогащения загружаемых данных на лету без замедления процесса загрузки

<Image img={dictionaryUseCases} size="lg" alt="Сценарии использования словаря в ClickHouse"/>

## Ускорение соединений с помощью словаря {#speeding-up-joins-using-a-dictionary}

Словари можно использовать для ускорения определенного типа `JOIN`: [`LEFT ANY` типа](/sql-reference/statements/select/join#supported-types-of-join), где ключ соединения должен соответствовать атрибуту ключа основного хранилища ключ-значение.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Использование словаря с LEFT ANY JOIN"/>

Если это так, ClickHouse может использовать словарь для выполнения [Прямого Соединения](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения ClickHouse и применим, когда основной [движок таблицы](/engines/table-engines) для правой стороны таблицы поддерживает запросы ключ-значение с низкой задержкой. ClickHouse имеет три движка таблиц, предоставляющих это: [Join](/engines/table-engines/special/join) (который по сути является предварительно рассчитанной хеш-таблицей), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход на основе словаря, но механика остается одинаковой для всех трех движков.

Алгоритм прямого соединения требует, чтобы правая таблица поддерживалась словарем, таким образом, данные для соединения из этой таблицы уже присутствуют в памяти в форме структуры данных ключ-значение с низкой задержкой.

### Пример {#example}

Используя набор данных Stack Overflow, давайте ответим на вопрос:
*Какой самый спорный пост по SQL на Hacker News?*

Мы определим спорный пост как пост, у которого почти одинаковое количество положительных и отрицательных голосов. Мы вычисляем это абсолютное различие, где значение, близкое к 0, означает большую спорность. Мы предположим, что пост должен иметь как минимум 10 положительных и отрицательных голосов - посты, по которым люди не голосуют, не являются очень спорными.

С нашими нормализованными данными этот запрос в данный момент требует `JOIN` с использованием таблиц `posts` и `votes`:

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

>**Используйте меньшие наборы данных с правой стороны `JOIN`**: Этот запрос может показаться более многословным, чем необходимо, с фильтрацией по `PostId`s, происходящей как в внешнем, так и в подзапросах. Это оптимизация производительности, которая гарантирует быстрое время ответа запроса. Для оптимальной производительности всегда убедитесь, что правая сторона `JOIN` является меньшим набором данных и как можно меньше. Для получения советов по оптимизации производительности JOIN и понимания доступных алгоритмов мы рекомендуем [эту серию блогов](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос быстрый, он зависит от того, чтобы мы написали `JOIN` осторожно для достижения хорошей производительности. В идеале, мы бы просто отфильтровали посты, содержащие "SQL", прежде чем рассматривать количество `UpVote` и `DownVote` для подмножества блогов, чтобы вычислить нашу метрику.

#### Применение словаря {#applying-a-dictionary}

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных голосования. Поскольку словари, как правило, хранятся в памяти ([ssd_cache](/sql-reference/dictionaries#ssd_cache) является исключением), пользователи должны уделять внимание размеру данных. Подтверждаем размер нашей таблицы `votes`:

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

Данные будут храниться в несжатом виде в нашем словаре, поэтому нам нужно как минимум 4 ГБ памяти, если мы хотим хранить все колонки (мы этого не будем) в словаре. Словарь будет реплицирован по нашему кластеру, поэтому это количество памяти должно быть зарезервировано *для каждого узла*.

> В приведенном ниже примере данные для нашего словаря происходят из таблицы ClickHouse. Хотя это представляет собой самый распространенный источник словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, http и базы данных, включая [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут автоматически обновляться, предоставляя идеальный способ гарантировать, что маленькие наборы данных, подверженные частым изменениям, доступны для прямых соединений.

Нашему словарю нужен первичный ключ, по которому будут выполняться запросы. Это концептуально идентично первичному ключу транзакционной базы данных и должно быть уникальным. Наш запрос требует поиска по ключу соединения - `PostId`. В свою очередь, словарь должен быть заполнен общим количеством положительных и отрицательных голосов по каждому `PostId` из нашей таблицы `votes`. Вот запрос для получения этих данных словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Чтобы создать наш словарь, требуется следующий DDL - обратите внимание на использование нашего предыдущего запроса:

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

> В самоуправляемом OSS вышеуказанная команда должна быть выполнена на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицирован на все узлы. Вышеуказанное было выполнено на узле ClickHouse Cloud с 64 ГБ оперативной памяти, заняв 36 секунд на загрузку.

Чтобы подтвердить объем памяти, потребляемой нашим словарем:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Теперь получение положительных и отрицательных голосов для конкретного `PostId` можно выполнить с помощью простой функции `dictGet`. Ниже мы получаем значения для поста `11227902`:

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

Не только этот запрос гораздо проще, он также более чем в два раза быстрее! Это можно оптимизировать еще больше, загрузив в словарь только посты с более чем 10 положительными и отрицательными голосами и предварительно вычислив спорное значение.

## Обогащение данных во время запроса {#query-time-enrichment}

Словари можно использовать для поиска значений во время выполнения запроса. Эти значения могут быть возвращены в результатах или использованы в агрегациях. Предположим, мы создаем словарь для сопоставления идентификаторов пользователей с их местоположением:

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

Мы можем использовать этот словарь для обогащения результатов постов:

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
│ 52296928 │ Comparision between two Strings in ClickHouse                 │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

Аналогично нашему предыдущему примеру с соединением, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходит большинство постов:

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

## Обогащение данных во время индексации {#index-time-enrichment}

В приведенном выше примере мы использовали словарь во время выполнения запроса, чтобы убрать соединение. Словари также можно использовать для обогащения строк во время вставки. Это обычно уместно, если значение обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска словаря во время выполнения запроса.

Предположим, что `Location` пользователя в Stack Overflow никогда не меняется (в реальности это не так) - в частности, столбец `Location` таблицы `users`. Предположим, мы хотим выполнить аналитический запрос по таблице постов по местоположению. Это содержит `UserId`.

Словарь предоставляет сопоставление от идентификатора пользователя к местоположению, поддерживаемое таблицей `users`:

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

> Мы исключаем пользователей с `Id < 0`, что позволяет нам использовать тип словаря `Hashed`. Пользователи с `Id < 0` являются системными пользователями.

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

В приведенном выше примере `Location` объявлен как `MATERIALIZED` столбец. Это означает, что значение может быть предоставлено как часть запроса `INSERT` и всегда будет вычисляться.

> ClickHouse также поддерживает [`DEFAULT` столбцы](/sql-reference/statements/create/table#default_values) (где значение может быть вставлено или рассчитано, если не предоставлено).

Чтобы заполнить таблицу, мы можем использовать обычный `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 миллиона строк/с., 71.79 МБ/с.)
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
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 миллиона строк/с., 7.60 ГБ/с.)
Peak memory usage: 666.82 MiB.
```

## Продвинутые темы словарей {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Клаузула `LAYOUT` управляет внутренней структурой данных для словаря. Существуют различные варианты, и они документированы [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые советы по выбору правильной компоновки можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали `LIFETIME` для словаря `MIN 600 MAX 900`. LIFETIME - это период обновления словаря, значения здесь вызывают периодическую перезагрузку через случайный интервал между 600 и 900 секундами. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновлений старую версию словаря все еще можно запрашивать, при этом только начальная загрузка блокирует запросы. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей. 
Словари можно принудительно перезагрузить с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников баз данных, таких как ClickHouse и Postgres, вы можете настроить запрос, который будет обновлять словари только в случае, если они действительно изменились (ответ на запрос это определяет), а не с периодическим интервалом. Дополнительные подробности можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [Иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [Полигональные](/sql-reference/dictionaries#polygon-dictionaries) и [Словари регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительное чтение {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Продвинутая конфигурация для словарей](/sql-reference/dictionaries)
