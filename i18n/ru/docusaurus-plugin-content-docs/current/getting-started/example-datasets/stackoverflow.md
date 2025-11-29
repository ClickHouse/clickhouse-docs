---
description: 'Анализ данных Stack Overflow с помощью ClickHouse'
sidebar_label: 'Stack Overflow'
slug: /getting-started/example-datasets/stackoverflow
title: 'Анализ данных Stack Overflow с помощью ClickHouse'
keywords: ['StackOverflow']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import stackoverflow from '@site/static/images/getting-started/example-datasets/stackoverflow.png'

Этот набор данных содержит все `Posts`, `Users`, `Votes`, `Comments`, `Badges`, `PostHistory` и `PostLinks`, которые когда-либо были на Stack Overflow.

Пользователи могут либо скачать заранее подготовленные версии данных в формате Parquet, содержащие все публикации до апреля 2024 года, либо скачать последние данные в формате XML и загрузить их самостоятельно. Stack Overflow периодически обновляет эти данные — исторически примерно раз в 3 месяца.

На следующей диаграмме показана схема доступных таблиц для формата Parquet.

<Image img={stackoverflow} alt="Схема Stack Overflow" size="md" />

Описание схемы этих данных можно найти [здесь](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede).


## Заранее подготовленные данные {#pre-prepared-data}

Мы предоставляем копию этих данных в формате Parquet, актуальную по состоянию на апрель 2024 года. Хотя этот набор данных и невелик для ClickHouse с точки зрения количества строк (60 миллионов постов), он содержит значительные объемы текста и большие столбцы строкового типа (String).

```sql
CREATE DATABASE stackoverflow
```

Приведённые ниже замеры времени относятся к кластеру ClickHouse Cloud с 96 GiB памяти и 24 vCPU, расположенному в регионе `eu-west-2`. Набор данных находится в регионе `eu-west-3`.


### Публикации {#posts}

```sql
CREATE TABLE stackoverflow.posts
(
    `Id` Int32 CODEC(Delta(4), ZSTD(1)),
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
    `AcceptedAnswerId` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `Score` Int32,
    `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
    `Body` String,
    `OwnerUserId` Int32,
    `OwnerDisplayName` String,
    `LastEditorUserId` Int32,
    `LastEditorDisplayName` String,
    `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `LastActivityDate` DateTime64(3, 'UTC'),
    `Title` String,
    `Tags` String,
    `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
    `CommentCount` UInt8,
    `FavoriteCount` UInt8,
    `ContentLicense` LowCardinality(String),
    `ParentId` String,
    `CommunityOwnedDate` DateTime64(3, 'UTC'),
    `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)

INSERT INTO stackoverflow.posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 строк в наборе. Прошло: 265.466 сек. Обработано 59.82 млн строк, 38.07 ГБ (225.34 тыс. строк/с., 143.42 МБ/с.)
```

Публикации также доступны по годам, например, по адресу [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)


### Голоса {#votes}

```sql
CREATE TABLE stackoverflow.votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId, UserId)

INSERT INTO stackoverflow.votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 21.605 sec. Processed 238.98 million rows, 2.13 GB (11.06 million rows/s., 98.46 MB/s.)
```

Голоса также доступны по годам, например, по адресу [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)


### Комментарии {#comments}

```sql
CREATE TABLE stackoverflow.comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY CreationDate

INSERT INTO stackoverflow.comments SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')

0 строк в наборе. Прошло: 56.593 сек. Обработано 90.38 млн строк, 11.14 ГБ (1.60 млн строк/с., 196.78 МБ/с.)
```

Комментарии также доступны по годам, например, по адресу: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)


### Пользователи {#users}

```sql
CREATE TABLE stackoverflow.users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate)

INSERT INTO stackoverflow.users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 10.988 sec. Processed 22.48 million rows, 1.36 GB (2.05 million rows/s., 124.10 MB/s.)
```


### Значки {#badges}

```sql
CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

INSERT INTO stackoverflow.badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 строк в наборе. Прошло: 6.635 сек. Обработано 51.29 млн строк, 797.05 МБ (7.73 млн строк/с., 120.13 МБ/с.)
```


### PostLinks {#postlinks}

```sql
CREATE TABLE stackoverflow.postlinks
(
    `Id` UInt64,
    `CreationDate` DateTime64(3, 'UTC'),
    `PostId` Int32,
    `RelatedPostId` Int32,
    `LinkTypeId` Enum8('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO stackoverflow.postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 1.534 sec. Processed 6.55 million rows, 129.70 MB (4.27 million rows/s., 84.57 MB/s.)
```


### PostHistory {#posthistory}

```sql
CREATE TABLE stackoverflow.posthistory
(
    `Id` UInt64,
    `PostHistoryTypeId` UInt8,
    `PostId` Int32,
    `RevisionGUID` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `Text` String,
    `ContentLicense` LowCardinality(String),
    `Comment` String,
    `UserDisplayName` String
)
ENGINE = MergeTree
ORDER BY (CreationDate, PostId)

INSERT INTO stackoverflow.posthistory SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posthistory/*.parquet')

0 строк в наборе. Прошло: 422.795 сек. Обработано 160.79 млн строк, 67.08 ГБ (380.30 тыс. строк/с., 158.67 МБ/с.)
```


## Исходный набор данных {#original-dataset}

Исходный набор данных доступен в сжатом XML-формате (7zip) по адресу [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange) — файлы с префиксом `stackoverflow.com*`.

### Загрузка {#download}

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

Размер этих файлов может достигать 35 ГБ, и их загрузка может занять около 30 минут в зависимости от интернет-соединения — сервер загрузки ограничивает скорость примерно до 20 МБ/с.


### Преобразование в JSON {#convert-to-json}

На момент написания ClickHouse не имеет встроенной поддержки XML в качестве входного формата. Чтобы загрузить данные в ClickHouse, мы сначала преобразуем их в NDJSON.

Для преобразования XML в JSON мы рекомендуем утилиту для Linux [`xq`](https://github.com/kislyuk/yq) — простую обёртку `jq` для работы с XML‑документами.

Установите xq и jq:

```bash
sudo apt install jq
pip install yq
```

Следующие шаги применимы к любому из указанных выше файлов. В качестве примера мы используем файл `stackoverflow.com-Posts.7z`. При необходимости модифицируйте шаги под свой файл.

Извлеките файл с помощью [p7zip](https://p7zip.sourceforge.net/). В результате будет создан один XML‑файл — в данном случае `Posts.xml`.

> Файлы сжаты примерно в 4,5 раза. При размере 22 ГБ в сжатом виде файл с постами занимает около 97 ГБ в распакованном виде.

```bash
p7zip -d stackoverflow.com-Posts.7z
```

Следующая команда разбивает XML‑файл на файлы по 10 000 строк каждый.

```bash
mkdir posts
cd posts
# следующая команда разбивает входной xml-файл на подфайлы по 10000 строк {#the-following-splits-the-input-xml-file-into-sub-files-of-10000-rows}
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

После выполнения приведённой выше команды у пользователей будет набор файлов, каждый содержащий 10 000 строк. Это гарантирует, что затраты памяти при выполнении следующей команды не будут чрезмерными (преобразование из XML в JSON выполняется в памяти).

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

Приведённая выше команда создаст один файл `posts.json`.

Загрузите данные в ClickHouse следующей командой. Обратите внимание, что схема указана для файла `posts.json`. Её потребуется скорректировать в зависимости от типов данных, чтобы она соответствовала целевой таблице.

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## Примеры запросов {#example-queries}

Несколько простых запросов для начала работы.

### Самые популярные теги на Stack Overflow {#most-popular-tags-on-stack-overflow}

```sql

SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS Tags,
    count() AS c
FROM stackoverflow.posts
GROUP BY Tags
ORDER BY c DESC
LIMIT 10

┌─Tags───────┬───────c─┐
│ javascript │ 2527130 │
│ python     │ 2189638 │
│ java       │ 1916156 │
│ c#         │ 1614236 │
│ php        │ 1463901 │
│ android    │ 1416442 │
│ html       │ 1186567 │
│ jquery     │ 1034621 │
│ c++        │  806202 │
│ css        │  803755 │
└────────────┴─────────┘

10 строк в наборе. Затрачено: 1.013 сек. Обработано 59.82 млн строк, 1.21 ГБ (59.07 млн строк/с., 1.19 ГБ/с.)
Пиковое использование памяти: 224.03 МиБ.
```


### Пользователь с наибольшим количеством ответов (активные учётные записи) {#user-with-the-most-answers-active-accounts}

Для учётной записи требуется `UserId`.

```sql
SELECT
    any(OwnerUserId) UserId,
    OwnerDisplayName,
    count() AS c
FROM stackoverflow.posts WHERE OwnerDisplayName != '' AND PostTypeId='Answer' AND OwnerUserId != 0
GROUP BY OwnerDisplayName
ORDER BY c DESC
LIMIT 5

┌─UserId─┬─OwnerDisplayName─┬────c─┐
│  22656 │ Jon Skeet        │ 2727 │
│  23354 │ Marc Gravell     │ 2150 │
│  12950 │ tvanfosson       │ 1530 │
│   3043 │ Joel Coehoorn    │ 1438 │
│  10661 │ S.Lott           │ 1087 │
└────────┴──────────────────┴──────┘

Получено 5 строк. Время выполнения: 0.154 сек. Обработано 35.83 млн строк, 193.39 МБ (232.33 млн строк/сек., 1.25 ГБ/сек.)
Пиковое потребление памяти: 206.45 МиБ.
```


### Самые популярные статьи о ClickHouse {#clickhouse-related-posts-with-the-most-views}

```sql
SELECT
    Id,
    Заголовок,
    ViewCount,
    AnswerCount
FROM stackoverflow.posts
WHERE Заголовок ILIKE '%ClickHouse%'
ORDER BY ViewCount DESC
LIMIT 10

┌───────Id─┬─Заголовок────────────────────────────────────────────────────────────────────────────┬─ViewCount─┬─AnswerCount─┐
│ 52355143 │ Можно ли удалить старые записи из таблицы ClickHouse?                            │     41462 │           3 │
│ 37954203 │ Импорт данных в ClickHouse                                                       │     38735 │           3 │
│ 37901642 │ Обновление данных в ClickHouse                                                   │     36236 │           6 │
│ 58422110 │ Pandas: Как вставить dataframe в ClickHouse                                      │     29731 │           4 │
│ 63621318 │ DBeaver - ClickHouse - SQL Error [159] .. Превышено время ожидания чтения        │     27350 │           1 │
│ 47591813 │ Как фильтровать таблицу ClickHouse по содержимому столбца массива?               │     27078 │           2 │
│ 58728436 │ Как выполнить поиск строки в запросе без учёта регистра в базе данных ClickHouse?│     26567 │           3 │
│ 65316905 │ ClickHouse: DB::Exception: Превышен лимит памяти (для запроса)                   │     24899 │           2 │
│ 49944865 │ Как добавить столбец в ClickHouse                                                │     24424 │           1 │
│ 59712399 │ Как преобразовать строки дат в формат DateTime с расширенным парсингом в ClickHouse?│     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

Получено 10 строк. Затрачено: 0,472 сек. Обработано 59,82 млн строк, 1,91 ГБ (126,63 млн строк/с., 4,03 ГБ/с.)
Пиковое использование памяти: 240,01 МиБ.
```


### Самые спорные публикации {#most-controversial-posts}

```sql
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM stackoverflow.posts
INNER JOIN
(
    SELECT
        PostId,
        countIf(VoteTypeId = 2) AS UpVotes,
        countIf(VoteTypeId = 3) AS DownVotes
    FROM stackoverflow.votes
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Title != ''
ORDER BY Controversial_ratio ASC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────┬─UpVotes─┬─DownVotes─┬─Controversial_ratio─┐
│   583177 │ VB.NET бесконечный цикл For                       │      12 │        12 │                   0 │
│  9756797 │ Чтение ввода консоли как перечисляемого - одним выражением? │      16 │        16 │                   0 │
│ 13329132 │ В чём смысл ARGV в Ruby?                          │      22 │        22 │                   0 │
└──────────┴───────────────────────────────────────────────────┴─────────┴───────────┴─────────────────────┘

Получено 3 строки. Затрачено: 4.779 сек. Обработано 298.80 млн строк, 3.16 ГБ (62.52 млн строк/с., 661.05 МБ/с.)
Пиковое использование памяти: 6.05 ГиБ.
```


## Благодарности {#attribution}

Мы благодарим Stack Overflow за предоставление этих данных по лицензии `cc-by-sa 4.0` и отмечаем их вклад, а также исходный источник данных: [https://archive.org/details/stackexchange](https://archive.org/details/stackexchange).