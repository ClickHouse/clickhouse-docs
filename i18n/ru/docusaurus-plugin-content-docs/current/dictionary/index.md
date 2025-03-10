---
slug: /dictionary
title: Словарь
keywords: ['словарь', 'словари']
description: Словарь предоставляет представление данных в формате ключ-значение для быстрого поиска.
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';


# Словарь

Словарь в ClickHouse предоставляет представление данных в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизируя запросы на поиск с очень низкой задержкой.

Словари полезны для:
- Улучшения производительности запросов, особенно при использовании с `JOIN`s
- Обогащения загружаемых данных на лету без замедления процесса загрузки

<img src={dictionaryUseCases}
  class="image"
  alt="Сценарии использования словаря в ClickHouse"
  style={{width: '100%', background: 'none'}} />

## Ускорение соединений с помощью словаря {#speeding-up-joins-using-a-dictionary}

Словари можно использовать для ускорения определенного типа `JOIN`: [`LEFT ANY` типа](/sql-reference/statements/select/join#supported-types-of-join), где ключ соединения должен совпадать с атрибутом ключа в хранилище ключ-значение.

<img src={dictionaryLeftAnyJoin}
  class="image"
  alt="Использование словаря с LEFT ANY JOIN"
  style={{width: '300px', background: 'none'}} />

Если это так, ClickHouse может использовать словарь для выполнения [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения в ClickHouse, который применим, когда подлежащий [движок таблицы](/engines/table-engines) для правой таблицы поддерживает запросы ключ-значение с низкой задержкой. У ClickHouse есть три движка таблиц, которые предоставляют эту возможность: [Join](/engines/table-engines/special/join) (который по сути является предрассчитанной хеш-таблицей), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход, основанный на словаре, но механика одинаковая для всех трех движков.

Алгоритм прямого соединения требует, чтобы правая таблица была поддержана словарем, так что данные, которые нужно соединить из этой таблицы, уже находятся в памяти в виде структуры данных ключ-значение с низкой задержкой.

### Пример {#example}

Используя набор данных Stack Overflow, давайте ответим на вопрос:
*Какой пост о SQL на Hacker News является самым противоречивым?*

Мы определим противоречивость как ситуацию, когда посты имеют схожее количество голосов "за" и "против". Мы вычислим эту абсолютную разницу, где значение, приближенное к 0, означает большее количество противоречий. Мы предположим, что пост должен иметь как минимум 10 голосов "за" и "против" — посты, на которые люди не голосуют, не очень противоречивы.

С нашими нормализованными данными этот запрос в настоящее время требует `JOIN` с использованием таблиц `posts` и `votes`:

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
Id:              	25372161
Title:           	Как добавить обработку исключений к SqlDataSource.UpdateCommand
UpVotes:         	13
DownVotes:       	13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**Используйте меньшие наборы данных с правой стороны `JOIN`**: Этот запрос может показаться более многословным, чем требуется, с фильтрацией по `PostId`s, происходящей как в внешнем, так и в подзапросах. Это оптимизация производительности, которая обеспечивает быстрое время отклика на запрос. Для оптимальной производительности всегда убедитесь, что правая сторона `JOIN` является меньшим набором и как можно более маленьким. Для советов по оптимизации производительности JOIN и понимания доступных алгоритмов рекомендуется [эта серия статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос быстрый, он зависит от того, что мы аккуратно написали `JOIN`, чтобы добиться хорошей производительности. В идеале мы просто отфильтровали бы посты с содержимым "SQL", прежде чем анализировать количество `UpVote` и `DownVote` для подмножества блогов для вычисления нашей метрики.

#### Применение словаря {#applying-a-dictionary}

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных голосования. Поскольку словари обычно хранятся в памяти ([ssd_cache](/sql-reference/dictionaries#ssd_cache) является исключением), пользователи должны быть осведомлены о размере данных. Проверяем размер нашей таблицы `votes`:

```sql
SELECT table,
	formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
	formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
	round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes │ 1.25 GiB    	│ 3.79 GiB      	│  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

Данные будут храниться в непакованном виде в нашем словаре, поэтому нам нужно как минимум 4 ГБ памяти, если мы хотим хранить все колонки (мы этого не сделаем) в словаре. Словарь будет реплицирован по нашему кластеру, поэтому эта величина памяти должна быть зарезервирована *на узел*.

> В приведенном ниже примере данные для нашего словаря происходят из таблицы ClickHouse. Хотя это представляет собой самый распространенный источник словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, http и базы данных, включая [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут обновляться автоматически, что обеспечивает идеальный способ обеспечить наличие небольших наборов данных, подверженных частым изменениям, для прямых соединений.

Нашему словарю требуется первичный ключ, по которому будут выполняться запросы. Это концептуально идентично первичному ключу транзакционной базы данных и должно быть уникальным. Наш вышеуказанный запрос требует поиска по ключу соединения - `PostId`. Словарь должен, в свою очередь, быть заполнен общим количеством голосов "за" и "против" для каждого `PostId` из нашей таблицы `votes`. Вот запрос на получение этих данных для словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Чтобы создать наш словарь, требуется следующий DDL - обратите внимание на использование нашего вышеизложенного запроса:

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

> В self-managed OSS вышеуказанная команда должна быть выполнена на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицирован на все узлы. Вышеуказанная команда была выполнена на узле ClickHouse Cloud с 64 ГБ RAM, это заняло 36 секунд для загрузки.

Чтобы подтвердить объем памяти, потребляемой нашим словарем:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

Получить количество голосов "за" и "против" для конкретного `PostId` теперь можно с помощью простой функции `dictGet`. Ниже мы получаем значения для поста `11227902`:

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Используя это в нашем ранее выполненном запросе, мы можем убрать `JOIN`:

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

Этот запрос не только гораздо проще, но и также более чем в два раза быстрее! Это можно дополнительно оптимизировать, загрузив только посты с более чем 10 голосами "за" и "против" в словарь и храня только предварительно вычисленное противоречивое значение.

## Обогащение времени запроса {#query-time-enrichment}

Словари могут использоваться для поиска значений во время запроса. Эти значения могут быть возвращены в результатах или использованы в агрегатах. Предположим, что мы создаем словарь, чтобы сопоставить идентификаторы пользователей с их местоположением:

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
│ 52296928 │ Сравнение двух строк в ClickHouse                               │ Испания             	│
│ 52345137 │ Как использовать файл для миграции данных из mysql в clickhouse? │ 中国江苏省Nanjing Shi │
│ 61452077 │ Как изменить PARTITION в clickhouse                            │ Гуанчжоу, 广东省中国 │
│ 55608325 │ Clickhouse выбрать последнюю запись без max() на всей таблице    │ Москва, Россия     	│
│ 55758594 │ ClickHouse создать временную таблицу                             │ Пермь, Россия      	│
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

Аналогично нашему вышеупомянутому примеру с соединением, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходит большинство постов:

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
│ Индия                   │ 787814 │
│ Германия                │ 685347 │
│ Соединенные Штаты      │ 595818 │
│ Лондон, Великобритания  │ 538738 │
│ Великобритания        │ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 миллион rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## Обогащение времени индексации {#index-time-enrichment}

В приведенном выше примере мы использовали словарь во время запроса, чтобы убрать соединение. Словари также могут использоваться для обогащения строк во время вставки. Это обычно уместно, если значение обогащения не изменяется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска во время запроса в словаре.

Предположим, что `Location` пользователя в Stack Overflow никогда не изменяется (на самом деле это не так) - конкретно колонка `Location` таблицы `users`. Предположим, мы хотим провести аналитический запрос по таблице постов, которая содержит `UserId`.

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

> Мы опускаем пользователей с `Id < 0`, что позволяет нам использовать тип словаря `Hashed`. Пользователи с `Id < 0` являются системными пользователями.

Чтобы использовать этот словарь во время вставки в таблицу постов, нам нужно изменить схему:

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     …
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

В приведенном выше примере `Location` объявлен как `MATERIALIZED` колонка. Это означает, что значение может быть предоставлено как часть запроса `INSERT` и всегда будет вычисляться.

> ClickHouse также поддерживает [`DEFAULT` колонки](/sql-reference/statements/create/table#default_values) (где значение может быть вставлено или вычислено, если не предоставлено).

Чтобы заполнить таблицу, мы можем использовать обычную команду `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

Теперь мы можем узнать название местоположения, из которого происходит большинство постов:

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ Индия                   │ 787814 │
│ Германия                │ 685347 │
│ Соединенные Штаты      │ 595818 │
│ Лондон, Великобритания  │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## Продвинутые темы словарей {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Клауза `LAYOUT` управляет внутренней структурой данных для словаря. Существует несколько вариантов, и они задокументированы [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые советы по выбору правильного макета можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали `LIFETIME` для словаря как `MIN 600 MAX 900`. LIFETIME — это интервал обновления для словаря, при этом значения здесь приводят к периодической перезагрузке в случайном интервале между 600 и 900 с. Этот случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом количестве серверов. Во время обновлений старая версия словаря все еще может быть запрошена, при этом только начальная загрузка блокирует запросы. Обратите внимание, что установка `(LIFETIME(0))` предотвращает обновление словарей. Словари могут быть принудительно перезагружены с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников баз данных, таких как ClickHouse и Postgres, вы можете настроить запрос, который будет обновлять словари только в случае реальных изменений (ответ на запрос определяет это), а не через периодический интервал. Дополнительные детали можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [многоугольные](/sql-reference/dictionaries#polygon-dictionaries) и [словари регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary).

### Дополнительные чтения {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация для словарей](/sql-reference/dictionaries)
