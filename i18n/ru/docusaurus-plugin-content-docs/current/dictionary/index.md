---
slug: /dictionary
title: 'Словарь'
keywords: ['словарь', 'словари']
description: 'Словарь представляет данные в формате ключ-значение для быстрого поиска.'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';

# Словарь {#dictionary}

Словарь в ClickHouse предоставляет хранящееся в памяти представление данных в формате [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных [внутренних и внешних источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для операций поиска с крайне низкой задержкой.

Словари полезны для:

- Повышения производительности запросов, особенно при использовании с операциями `JOIN`
- Обогащения поступающих данных «на лету» без замедления процесса ингестии

<Image img={dictionaryUseCases} size="lg" alt="Сценарии использования словаря в ClickHouse"/>

## Ускорение соединений с использованием словаря {#speeding-up-joins-using-a-dictionary}

Словари можно использовать для ускорения определённого типа операции `JOIN`: типа [`LEFT ANY`](/sql-reference/statements/select/join#supported-types-of-join), когда ключ соединения совпадает с ключевым атрибутом подлежащего хранилища ключ-значение.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Использование словаря с LEFT ANY JOIN"/>

В таком случае ClickHouse может использовать словарь для выполнения [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join). Это самый быстрый алгоритм соединения в ClickHouse, применимый, когда базовый [движок таблицы](/engines/table-engines) для таблицы справа поддерживает запросы к хранилищу ключ-значение с низкой задержкой. В ClickHouse есть три движка таблиц, которые это поддерживают: [Join](/engines/table-engines/special/join) (по сути, предварительно вычисленная хеш-таблица), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) и [Dictionary](/engines/table-engines/special/dictionary). Мы опишем подход, основанный на словаре, но механика одинакова для всех трёх движков.

Алгоритм Direct Join требует, чтобы правая таблица опиралась на словарь, благодаря чему данные для соединения из этой таблицы уже находятся в памяти в виде структуры данных хранилища ключ-значение с низкой задержкой.

### Пример {#example}

Используя [датасет Stack Overflow](/getting-started/example-datasets/stackoverflow), ответим на вопрос:
*Какой пост, касающийся SQL, является самым спорным на Hacker News?*

Мы будем считать пост спорным, если у него схожее количество голосов «за» и «против». Мы вычислим абсолютную разницу между ними: чем ближе значение к 0, тем сильнее спорность. Также будем считать, что у поста должно быть как минимум 10 голосов «за» и 10 голосов «против» — посты, за которые почти не голосуют, вряд ли можно считать спорными.

При нормализованных данных этот запрос требует `JOIN` с использованием таблиц `posts` и `votes`:

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

Обработана 1 строка. Затрачено: 1,283 сек. Обработано 418,44 млн строк, 7,23 ГБ (326,07 млн строк/с., 5,63 ГБ/с.)
Пиковое использование памяти: 3,18 ГиБ.
```

> **Используйте меньшие наборы данных в правой части `JOIN`**: Этот запрос может показаться более многословным, чем требуется, поскольку фильтрация по `PostId` выполняется как во внешнем, так и во вложенном запросе. Это оптимизация производительности, которая обеспечивает быстрое время ответа. Для оптимальной производительности всегда следите за тем, чтобы правая сторона `JOIN` была меньшим набором данных и оставалась как можно меньше. Советы по оптимизации производительности JOIN и обзору доступных алгоритмов приведены в [этой серии статей в блоге](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).

Хотя этот запрос и работает быстро, он требует от нас аккуратного использования `JOIN`, чтобы добиться хорошей производительности. В идеале мы бы просто отфильтровали записи до тех, которые содержат «SQL», прежде чем смотреть на значения `UpVote` и `DownVote` для подмножества блогов, чтобы вычислить нашу метрику.

#### Применение словаря {#applying-a-dictionary}

Чтобы продемонстрировать эти концепции, мы используем словарь для наших данных о голосовании. Поскольку словари обычно хранятся в памяти ([ssd&#95;cache](/sql-reference/dictionaries#ssd_cache) — исключение), пользователям следует учитывать объём данных. Проверим размер нашей таблицы `votes`:

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

Данные будут храниться в нашем словаре без сжатия, поэтому нам потребуется как минимум 4 ГБ памяти, если бы мы собирались хранить все столбцы (мы не будем) в словаре. Словарь будет реплицирован по нашему кластеру, поэтому этот объём памяти должен быть зарезервирован *на каждый узел*.

> В примере ниже данные для нашего словаря поступают из таблицы ClickHouse. Хотя это и является наиболее распространённым источником словарей, поддерживается [ряд источников](/sql-reference/dictionaries#dictionary-sources), включая файлы, HTTP и базы данных, в том числе [Postgres](/sql-reference/dictionaries#postgresql). Как мы покажем, словари могут автоматически обновляться, что делает их идеальным способом обеспечить доступность небольших наборов данных, подверженных частым изменениям, для прямых JOIN.

Для нашего словаря требуется первичный ключ, по которому будут выполняться обращения. Концептуально это идентично первичному ключу транзакционной базы данных и должно быть уникальным. Наш запрос выше требует обращения по ключу соединения — `PostId`. Словарь, в свою очередь, должен быть заполнен суммарными значениями голосов «за» и «против» по `PostId` из нашей таблицы `votes`. Ниже приведён запрос для получения данных этого словаря:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

Для создания нашего словаря используем следующий DDL — обратите внимание на использование приведённого выше запроса:

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

> В самоуправляемой OSS-установке указанную выше команду нужно выполнить на всех узлах. В ClickHouse Cloud словарь будет автоматически реплицирован на все узлы. Эта команда была выполнена на узле ClickHouse Cloud с 64 ГБ ОЗУ, загрузка заняла 36 секунд.

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

Этот запрос не только гораздо проще, но и более чем в два раза быстрее! Его можно дополнительно оптимизировать, загружая в словарь только посты с более чем 10 голосами «за» и «против» и сохраняя только предварительно вычисленное значение степени спорности.

## Обогащение при выполнении запроса {#query-time-enrichment}

Словари можно использовать для поиска значений при выполнении запроса. Эти значения могут возвращаться в результатах или использоваться в агрегациях. Предположим, мы создаём словарь для отображения идентификаторов пользователей на их местоположения:

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

Получено 5 строк. Затрачено: 0,033 сек. Обработано 4,25 млн строк, 82,84 МБ (130,62 млн строк/с., 2,55 ГБ/с.)
Пиковое использование памяти: 249,32 МиБ.
```

Аналогично нашему примеру выше с JOIN, мы можем использовать тот же словарь, чтобы эффективно определить, откуда происходит большинство постов:

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

## Обогащение на этапе вставки (index time) {#index-time-enrichment}

В приведённом выше примере мы использовали словарь на этапе выполнения запроса, чтобы убрать операцию JOIN. Словари также можно использовать для обогащения строк на этапе вставки. Это обычно целесообразно, если значение для обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки на этапе вставки позволяет избежать поиска в словаре во время выполнения запроса.

Предположим, что `Location` пользователя в Stack Overflow никогда не меняется (в реальности это не так), а именно столбец `Location` таблицы `users`. Допустим, мы хотим выполнить аналитический запрос к таблице `posts` по местоположению. В ней содержится столбец `UserId`.

Словарь задаёт соответствие между идентификатором пользователя и его местоположением, опираясь на таблицу `users`:

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

Чтобы использовать этот словарь при вставке данных в таблицу posts, нам нужно изменить схему:

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

В приведённом выше примере `Location` объявлен как столбец типа `MATERIALIZED`. Это означает, что значение может быть указано в запросе `INSERT` и при этом всегда будет вычислено.

> ClickHouse также поддерживает [`DEFAULT` столбцы](/sql-reference/statements/create/table#default_values) (когда значение может быть вставлено или вычислено, если оно не указано).

Чтобы заполнить таблицу, мы можем использовать привычный `INSERT INTO SELECT` из S3:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 строк в наборе. Затрачено: 36.830 сек. Обработано 238.98 млн строк, 2.64 ГБ (6.49 млн строк/с., 71.79 МБ/с.)
```

Теперь мы можем узнать название места, из которого поступает большинство записей:

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

Получено 4 строки. Прошло: 0.142 сек. Обработано 59.82 млн строк, 1.08 ГБ (420.73 млн строк/сек., 7.60 ГБ/сек.)
Пиковое использование памяти: 666.82 МиБ.
```

## Расширенные темы о словарях {#advanced-dictionary-topics}

### Выбор `LAYOUT` словаря {#choosing-the-dictionary-layout}

Клауза `LAYOUT` управляет внутренней структурой данных словаря. Существует несколько вариантов, описанных [здесь](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory). Некоторые рекомендации по выбору подходящего `LAYOUT` можно найти [здесь](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout).

### Обновление словарей {#refreshing-dictionaries}

Мы указали для словаря `LIFETIME` со значением `MIN 600 MAX 900`. LIFETIME — это интервал обновления словаря; в данном случае значения приводят к периодической перезагрузке через случайный интервал между 600 и 900 секундами. Такой случайный интервал необходим для распределения нагрузки на источник словаря при обновлении на большом числе серверов. Во время обновления старая версия словаря по-прежнему может использоваться в запросах, при этом только начальная загрузка блокирует запросы. Обратите внимание, что задание `(LIFETIME(0))` предотвращает обновление словарей.
Принудительную перезагрузку словарей можно выполнить с помощью команды `SYSTEM RELOAD DICTIONARY`.

Для источников данных, таких как ClickHouse и Postgres, вы можете настроить запрос, который будет обновлять словари только в том случае, если они действительно изменились (это определяется ответом на запрос), а не с периодическим интервалом. Дополнительные подробности можно найти [здесь](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

### Другие типы словарей {#other-dictionary-types}

ClickHouse также поддерживает [иерархические](/sql-reference/dictionaries#hierarchical-dictionaries), [многоугольные](/sql-reference/dictionaries#polygon-dictionaries) и [словарі на основе регулярных выражений](/sql-reference/dictionaries#regexp-tree-dictionary) словари.

### Дополнительные материалы для чтения {#more-reading}

- [Использование словарей для ускорения запросов](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Расширенная конфигурация словарей](/sql-reference/dictionaries)