---
'slug': '/dictionary'
'title': 'Словарь'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': 'Словарь предоставляет представление данных в виде пары ключ-значение
  для быстрого поиска.'
'doc_type': 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Словарь

Словарь в ClickHouse представляет собой хранимое в памяти [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) представление данных из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для запросов с супер-низкой задержкой.

Словари полезны для:
- Повышения производительности запросов, особенно при использовании с `JOIN`s
- Обогащения поступающих данных на лету без замедления процесса поступления

<Image img={dictionaryUseCases} size="lg" alt="Примеры использования словаря в ClickHouse"/>

## Ускорение соединений с использованием словаря {#speeding-up-joins-using-a-dictionary}

Словари могут использоваться для ускорения конкретного типа `JOIN`: [`LEFT ANY` типа](/sql-reference/statements/select/join#supported-types-of-join), где ключ соединения должен соответствовать атрибуту ключа базового хранилища ключ-значение.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Использование словаря с LEFT ANY JOIN"/>

Если это так, ClickHouse может использовать словарь для выполнения [Прямого Соединения](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения ClickHouse и применяется, когда базовый [движок таблицы](/engines/table-engines) для правой стороны таблицы поддерживает запросы ключ-значение с низкой задержкой. В ClickHouse есть три движка таблиц, предоставляющие эту возможность: [Join](/engines/table-engines/special/join) (который по сути является предрассчитанной хеш-таблицей), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход, основанный на словаре, но механика одинакова для всех трех движков.

Алгоритм прямого соединения требует, чтобы правая таблица была поддержана словарем, таким образом, данные, которые будут объединены из этой таблицы, уже находятся в памяти в виде структуры данных ключ-значение с низкой задержкой.

### Пример {#example}

Используя набор данных Stack Overflow, давайте ответим на вопрос:
*Какой пост вызывающий наибольшие споры относительно SQL на Hacker News?*

Мы определяем спорный пост как пост, у которого примерно равное количество голосов «за» и «против». Мы вычисляем эту абсолютную разницу, где значение, ближе к 0, означает большее количество споров. Будем считать, что пост должен иметь не менее 10 голосов «за» и «против» - посты, за которые люди не голосуют, не очень спорные.

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

>**Используйте меньшие наборы данных с правой стороны `JOIN`**: Этот запрос может показаться более многословным, чем требуется, с фильтрацией по `PostId` как в внешнем, так и в подзапросах. Это оптимизация производительности, которая обеспечивает быстрое время отклика на запрос. Для оптимальной производительности всегда удостоверяйтесь, что правая сторона `JOIN` является меньшим набором и как можно меньшим. Для получения советов по оптимизации производительности `JOIN` и понимания доступных алгоритмов, мы рекомендуем [эту серию статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос быстр, он зависит от того, что мы внимательно напишем `JOIN`, чтобы добиться хорошей производительности. В идеале, мы просто отфильтровали бы посты так, чтобы в них содержалось "SQL", прежде чем смотреть на количество `UpVote` и `DownVote` для выбранного подмножества блогов для вычисления нашей метрики.

#### Применение словаря {#applying-a-dictionary}

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных о голосовании. Поскольку словари обычно хранятся в памяти ([ssd_cache](/sql-reference/dictionaries#ssd_cache) является исключением), пользователи должны быть осведомлены о размере данных. Подтверждаем размер нашей таблицы `votes`:

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

Данные будут храниться несжатыми в нашем словаре, поэтому нам нужно как минимум 4 ГБ памяти, если мы хотим хранить все колонки (что не так). Словарь будет реплицироваться по кластерам, поэтому это количество памяти должно быть зарезервировано *для каждого узла*.

> В примере ниже данные для нашего словаря получены из таблицы ClickHouse. В то время как это представляет собой самый распространенный источник словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, http и базы данных, включая [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут быть автоматически обновляемыми, что обеспечивает идеальный способ гарантировать, что маленькие наборы данных, подлежащие частым изменениям, доступны для прямых соединений.

Наш словарь требует первичного ключа, по которому будут выполняться поиска. Это концептуально идентично первичному ключу транзакционной базы данных и должно быть уникальным. Наш вышеуказанный запрос требует поиск по ключу соединения - `PostId`. Словарь, в свою очередь, должен быть заполнен общим количеством голосов «за» и «против» для каждого `PostId` из нашей таблицы `votes`. Вот запрос для получения этих данных словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Чтобы создать наш словарь, требуется следующий DDL - обратите внимание на использование нашего вышеуказанного запроса:

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

> В самоуправляемом OSS вышеуказанная команда должна быть выполнена на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицироваться на все узлы. Вышеуказанное было выполнено на узле ClickHouse Cloud с 64 ГБ ОЗУ, время загрузки составило 36 секунд.

Чтобы подтвердить использование памяти нашим словарем:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Теперь получить количество голосов «за» и «против» для конкретного `PostId` можно с помощью простой функции `dictGet`. Ниже мы получаем значения для поста `11227902`:

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Exploiting this in our earlier query, we can remove the JOIN:

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

Этот запрос не только намного проще, но и более чем в два раза быстрее! Это можно было бы оптимизировать еще больше, загружая в словарь только посты с более чем 10 голосами «за» и «против» и храня только предрассчитанное спорное значение.

## Обогащение данных во время запроса {#query-time-enrichment}

Словари могут использоваться для поиска значений во время запроса. Эти значения могут возвращаться в результатах или использоваться в агрегациях. Предположим, мы создаем словарь для сопоставления идентификаторов пользователей с их местоположением:

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
│ 52296928 │ Comparison between two Strings in ClickHouse                  │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

Подобно нашему предыдущему примеру соединения, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходят большинство постов:

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

В приведенном выше примере мы использовали словарь во время запроса, чтобы убрать соединение. Словари также могут использоваться для обогащения строк во время вставки. Это обычно уместно, если значение обогащения не изменяется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска в словаре во время запроса.

Предположим, что `Location` пользователя в Stack Overflow никогда не меняется (на самом деле они меняются) - в частности, колонка `Location` таблицы `users`. Предположим, мы хотим сделать аналитический запрос к таблице постов по местоположению. Это содержит `UserId`.

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

> Мы пропускаем пользователей с `Id < 0`, что позволяет нам использовать тип словаря `Hashed`. Пользователи с `Id < 0` являются системными пользователями.

Чтобы использовать этот словарь во время вставки для таблицы постов, нам нужно изменить схему:

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

В приведенном выше примере `Location` объявляется как `MATERIALIZED` колонка. Это означает, что значение может быть предоставлено как часть запроса `INSERT` и всегда будет вычислено.

> ClickHouse также поддерживает [`DEFAULT` колонки](/sql-reference/statements/create/table#default_values) (где значение может быть вставлено или вычислено, если не предоставлено).

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
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## Расширенные темы словаря {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Клаузула `LAYOUT` управляет внутренней структурой данных для словаря. Существует несколько вариантов, которые описаны [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые советы по выбору правильного макета можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали `LIFETIME` для словаря `MIN 600 MAX 900`. `LIFETIME` - это интервал обновления для словаря, значения которого приводят к периодической перезагрузке в случайном интервале от 600 до 900 секунд. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновлений старая версия словаря может по-прежнему запрашиваться, при этом только начальная загрузка блокирует запросы. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей.
Словари можно принудительно перезагружать с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников данных, таких как ClickHouse и Postgres, вы можете настроить запрос, который будет обновлять словари только в том случае, если они действительно изменились (ответ на запрос это определяет), а не через периодический интервал. Подробности можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [Иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [Полигональные](/sql-reference/dictionaries#polygon-dictionaries) и [Словари регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительные материалы {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация для словарей](/sql-reference/dictionaries)
