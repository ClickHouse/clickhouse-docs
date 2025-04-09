---
title: 'Миграция из BigQuery в ClickHouse Cloud'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'Как мигрировать ваши данные из BigQuery в ClickHouse Cloud'
keywords: ['миграция', 'миграция', 'миграция', 'данные', 'etl', 'elt', 'BigQuery']
---

import bigquery_2 from '@site/static/images/migrations/bigquery-2.png';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';
import Image from '@theme/IdealImage';

## Почему использовать ClickHouse Cloud вместо BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

TLDR: Потому что ClickHouse быстрее, дешевле и мощнее, чем BigQuery для современных аналитических данных:

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>
## Загрузка данных из BigQuery в ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}
### Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из BigQuery в ClickHouse Cloud, мы используем набор данных Stack Overflow, задокументированный [здесь](/getting-started/example-datasets/stackoverflow). Это содержит каждый `post`, `vote`, `user`, `comment` и `badge`, которые произошли на Stack Overflow с 2008 года до апреля 2024 года. Схема BigQuery для этих данных показана ниже:

<Image img={bigquery_3} size="lg" alt="Схема"/>

Для пользователей, которые хотят заполнить этот набор данных в экземпляре BigQuery, чтобы протестировать шаги миграции, мы предоставили данные для этих таблиц в формате Parquet в GCS bucket, а команды DDL для создания и загрузки таблиц в BigQuery доступны [здесь](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==).
### Миграция данных {#migrating-data}

Миграция данных между BigQuery и ClickHouse Cloud делится на два основных типа рабочих нагрузок:

- **Начальная массовая загрузка с периодическими обновлениями** - Необходимо мигрировать начальный набор данных, а также периодические обновления через установленные интервалы, например, ежедневно. Обновления здесь обрабатываются повторной отправкой строк, которые изменились - определяемых по столбцу, который можно использовать для сравнений (например, по дате). Удаления обрабатываются с помощью полной периодической перезагрузки набора данных.
- **Репликация в реальном времени или CDC** - Должен быть мигрирован начальный набор данных. Изменения в этом наборе данных должны отражаться в ClickHouse почти в реальном времени, при допустимой задержке в несколько секунд. Это эффективно процесс [Change Data Capture (CDC)](https://en.wikipedia.org/wiki/Change_data_capture), при котором таблицы в BigQuery должны быть синхронизированы с ClickHouse, т.е. вставки, обновления и удаления в таблице BigQuery должны применяться к эквивалентной таблице в ClickHouse.
#### Массовая загрузка через Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery поддерживает экспорт данных в объектное хранилище Google (GCS). Для нашего примера набора данных:

1. Экспортируйте 7 таблиц в GCS. Команды для этого доступны [здесь](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==).

2. Импортируйте данные в ClickHouse Cloud. Для этого мы можем использовать [функцию таблицы gcs](/sql-reference/table-functions/gcs). DDL и запросы импорта доступны [здесь](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==). Обратите внимание, что поскольку экземпляр ClickHouse Cloud состоит из нескольких вычислительных узлов, вместо функции таблицы `gcs`, мы используем функцию таблицы [s3Cluster](/sql-reference/table-functions/s3Cluster). Эта функция также работает с бакетами gcs и [использует все узлы сервиса ClickHouse Cloud](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) для загрузки данных параллельно.

<Image img={bigquery_4} size="md" alt="Массовая загрузка"/>

Этот подход имеет ряд преимуществ:

- Функциональность экспорта BigQuery поддерживает фильтр для экспорта подмножества данных.
- BigQuery поддерживает экспорт в [Parquet, Avro, JSON и CSV](https://cloud.google.com/bigquery/docs/exporting-data) форматы и несколько [типов сжатия](https://cloud.google.com/bigquery/docs/exporting-data) - все поддерживаемые ClickHouse.
- GCS поддерживает [управление жизненным циклом объектов](https://cloud.google.com/storage/docs/lifecycle), позволяя удалять данные, которые были экспортированы и импортированы в ClickHouse, после заданного времени.
- [Google позволяет экспортировать до 50 ТБ в день в GCS бесплатно](https://cloud.google.com/bigquery/quotas#export_jobs). Пользователи платят только за хранение в GCS.
- Экспорты автоматически создают несколько файлов, ограничивая каждый максимумом в 1 ГБ данных таблицы. Это полезно для ClickHouse, поскольку это позволяет оптимизировать импорты.

Перед тем, как пробовать следующие примеры, мы рекомендуем пользователям ознакомиться с [разрешениями, необходимыми для экспорта](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) и [рекомендациями по локализации](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) для максимизации производительности экспорта и импорта.
### Репликация в реальном времени или CDC через запланированные запросы {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) - это процесс, с помощью которого таблицы поддерживаются синхронизированными между двумя базами данных. Это значительно усложняется, если обновления и удаления должны обрабатываться в почти реальном времени. Один из подходов - просто запланировать периодический экспорт, используя функциональность [запланированных запросов BigQuery](https://cloud.google.com/bigquery/docs/scheduling-queries). Если вы можете принять некоторую задержку в данных, которые будут вставлены в ClickHouse, этот подход легко реализовать и поддерживать. Пример приведен в [этом блоге](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries).
## Проектирование схем {#designing-schemas}

Набор данных Stack Overflow содержит несколько связанных таблиц. Рекомендуем сосредоточиться на миграции основной таблицы в первую очередь. Это может не обязательно быть самой большой таблицей, а скорее той, на которую вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse. Эта таблица может потребовать переработки по мере добавления дополнительных таблиц, чтобы полностью использовать функции ClickHouse и получить оптимальную производительность. Мы изучаем этот процесс моделирования в наших [документах по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

Соблюдая этот принцип, мы сосредотачиваемся на основной таблице `posts`. Схема BigQuery для этого показана ниже:

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```
### Оптимизация типов {#optimizing-types}

Применение процесса [описанного здесь](/data-modeling/schema-design) приводит к следующей схеме:

```sql
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить эту таблицу с помощью простого [`INSERT INTO SELECT`](/sql-reference/statements/insert-into), читая экспортированные данные из gcs с использованием [`gcs` функции таблицы](/sql-reference/table-functions/gcs). Обратите внимание, что в ClickHouse Cloud вы также можете использовать совместимую с gcs [`s3Cluster` функцию таблицы](/sql-reference/table-functions/s3Cluster), чтобы параллелить загрузку по нескольким узлам:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

Мы не сохраняем никаких null в нашей новой схеме. Указанный выше вставляет их неявно в значения по умолчанию для их соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения в их целевую точность.
## Чем первичные ключи ClickHouse отличаются? {#how-are-clickhouse-primary-keys-different}

Как описано [здесь](/migrations/bigquery), как и в BigQuery, ClickHouse не обеспечивает уникальность значений столбца первичного ключа таблицы.

Подобно кластеризации в BigQuery, данные таблицы ClickHouse хранятся на диске в порядке расположения по столбцам первичного ключа. Этот порядок используется оптимизатором запросов для предотвращения повторной сортировки, минимизации использования памяти для соединений и обеспечения короткого замыкания для клаузул LIMIT.
В отличие от BigQuery, ClickHouse автоматически создает [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) на основе значений столбца первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по столбцам первичного ключа. В частности:

- Эффективность использования памяти и диска имеет первостепенное значение для масштаба, в котором ClickHouse часто используется. Данные записываются в таблицы ClickHouse партиями, известными как части, с применением правил для слияния этих частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части сливаются, то первичные индексы также сливаются. Имейте в виду, что эти индексы не создаются для каждой строки. Вместо этого первичный индекс для части имеет одну индексную запись на группу строк - эта техника называется разреженным индексированием.
- Разреженное индексирование возможно, потому что ClickHouse хранит строки для части на диске в порядке, заданном определенным ключом. Вместо того, чтобы напрямую находить отдельные строки (как индекс на основе B-дерева), разреженный первичный индекс позволяет быстро (с помощью бинарного поиска по индексным записям) идентифицировать группы строк, которые могли бы соответствовать запросу. Найденные группы потенциально соответствующих строк затем параллельно передаются в движок ClickHouse для поиска совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он полностью помещается в основной памяти), при этом значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, которые типичны для использования аналитических данных. Для получения более подробной информации мы рекомендуем [это подробное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={bigquery_5} size="md" alt="Первичные ключи ClickHouse"/>

Выбранный первичный ключ в ClickHouse будет определять не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого это может существенно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Ключ сортировки, который вызывает запись значений большинства столбцов в смежном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все столбцы в таблице будут отсортированы на основе значения указанного ключа сортировки, независимо от того, включены ли они в сам ключ. Например, если `CreationDate` используется как ключ, порядок значений во всех других столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей сортировки - это будет упорядочено с той же семантикой, что и клаузула `ORDER BY` в запросе `SELECT`.
### Выбор ключа сортировки {#choosing-an-ordering-key}

Для соображений и шагов по выбору ключа сортировки, используя таблицу постов в качестве примера, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
## Техники моделирования данных {#data-modeling-techniques}

Мы рекомендуем пользователям, мигрирующим из BigQuery, прочитать [руководство по моделированию данных в ClickHouse](/data-modeling/schema-design). Этот справочник использует тот же набор данных Stack Overflow и исследует несколько подходов, используя функции ClickHouse.
### Партиции {#partitions}

Пользователи BigQuery будут знакомы с концепцией партиционирования таблиц для повышения производительности и управляемости больших баз данных путем разделения таблиц на более мелкие, более управляемые части, называемые партициями. Это партиционирование можно достичь, используя либо диапазон на указанном столбце (например, даты), определенные списки или хэш на ключе. Это позволяет администраторам организовывать данные на основе определенных критериев, таких как диапазоны дат или географические местоположения.

Партиционирование помогает улучшить производительность запросов, позволяя более быстрый доступ к данным через отбор партиций и более эффективное индексирование. Это также помогает выполнять задачи обслуживания, такие как резервное копирование и очистка данных, позволяя выполнять операции на отдельных партициях, а не на всей таблице. Кроме того, партиционирование может значительно улучшить масштабируемость баз данных BigQuery, распределяя нагрузку между несколькими партициями.

В ClickHouse партиционирование указывается в таблице при ее первоначальном определении через клаузу [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key). Эта клаузула может содержать SQL-выражение по любому столбцу или столбцам, результаты которого определят, в какую партицию отправляется строка.

<Image img={bigquery_6} size="md" alt="Партиции"/>

Части данных логически связаны с каждой партицией на диске и могут запрашиваться в изоляции. Для примера ниже мы партиционируем таблицу постов по годам, используя выражение [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear). По мере вставки строк в ClickHouse это выражение будет оцениваться для каждой строки - строки затем маршрутизируются к результирующей партиции в виде новых частей данных, принадлежащих этой партиции.

```sql
CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```
#### Применения {#applications}

Партиционирование в ClickHouse имеет аналогичные применения, как и в BigQuery, но с некоторыми тонкими различиями. Более конкретно:

- **Управление данными** - В ClickHouse пользователи должны в первую очередь рассматривать партиционирование как функцию управления данными, а не как технику оптимизации запросов. Отделяя данные логически на основе ключа, каждая партиция может обрабатываться независимо, например, удаляться. Это позволяет пользователям эффективно перемещать партиции, а значит, подмножества, между [уровнями хранения](/integrations/s3#storage-tiers) по времени или [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition). Например, ниже мы удаляем посты 2008 года:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **Оптимизация запросов** - Хотя партиции могут помочь с производительностью запросов, это сильно зависит от паттернов доступа. Если запросы нацелены только на несколько партиций (в идеале одну), производительность может потенциально улучшиться. Это обычно полезно только в том случае, если ключ партиционирования не входит в первичный ключ и вы фильтруете по нему. Однако запросы, которые охватывают много партиций, могут иметь меньшую производительность, чем если бы партиционирование не использовалось (так как может быть больше частей в результате партиционирования). Преимущество нацеливания на одну партицию будет еще менее выраженным, если ключ партиционирования уже является ранним входом в первичный ключ. Партиционирование также можно использовать для [оптимизации запросов `GROUP BY`](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в общем пользователи должны убедиться, что первичный ключ оптимизирован и только в исключительных случаях рассматривать партиционирование как технику оптимизации запросов, когда паттерны доступа охватывают конкретное предсказуемое подмножество дня, например, партиционирование по дням, когда большинство запросов - в последний день.
#### Рекомендации {#recommendations}

Пользователи должны рассматривать партиционирование как технику управления данными. Это идеально, когда данные необходимо удалить из кластера для работы с временными рядами, например, старую партицию можно [просто удалить](/sql-reference/statements/alter/partition#drop-partitionpart).

Важно: убедитесь, что ваше выражение ключа партиционирования не приводит к высококардинальному набору, т.е. следует избегать создания более 100 партиций. Например, не партиционируйте свои данные по столбцам с высокой кардинальностью, таким как идентификаторы клиентов или имена. Вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении `ORDER BY`.

> Внутри ClickHouse [создаются части](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) для вставленных данных. По мере вставки данных количество частей увеличивается. Чтобы предотвратить чрезмерно высокое количество частей, что снизит производительность запросов (из-за большего количества файлов для чтения), части объединяются в фоновом асинхронном процессе. Если количество частей превышает [предварительно настроенный лимит](/operations/settings/merge-tree-settings#parts_to_throw_insert), то ClickHouse выдает исключение при вставке с ошибкой ["слишком много частей"](/knowledgebase/exception-too-many-parts). Это не должно происходить в нормальной работе и происходит только в случае неправильной настройки ClickHouse или неправильного его использования, например, при большом количестве мелких вставок. Поскольку части создаются для каждой партиции в изоляции, увеличение числа партиций приводит к увеличению числа частей, т.е. это кратное число партиций. Поэтому ключи партиционирования с высокой кардинальностью могут вызывать эту ошибку и должны быть избегаемы.
## Материализованные представления против проекций {#materialized-views-vs-projections}

Концепция проекций в ClickHouse позволяет пользователям задавать несколько клауз `ORDER BY` для таблицы.

В [моделировании данных ClickHouse](/data-modeling/schema-design) мы исследуем, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегатов, преобразования строк и оптимизации запросов для различных паттернов доступа. Для последнего мы [предоставили пример](/materialized-view/incremental-materialized-view#lookup-table), где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем у оригинальной таблицы, получающей вставки.

Например, рассмотрим следующий запрос:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

Этот запрос требует сканирования всех 90 млн строк (хотя и быстро), поскольку `UserId` не является ключом сортировки. Ранее мы решили эту задачу, используя материалаизованное представление, действующее как справочник для `PostId`. Ту же проблему можно решить с помощью проекции. Команда ниже добавляет проекцию для `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Обратите внимание, что сначала мы должны создать проекцию, а затем материализовать ее. Эта последняя команда приводит к тому, что данные хранятся дважды на диске в двух разных порядках. Проекция также может быть определена при создании данных, как показано ниже, и будет автоматически поддерживаться по мере вставки данных.

```sql
CREATE TABLE comments
(
        `Id` UInt32,
        `PostId` UInt32,
        `Score` UInt16,
        `Text` String,
        `CreationDate` DateTime64(3, 'UTC'),
        `UserId` Int32,
        `UserDisplayName` LowCardinality(String),
        PROJECTION comments_user_id
        (
        SELECT *
        ORDER BY UserId
        )
)
ENGINE = MergeTree
ORDER BY PostId
```

Если проекция создается через команду `ALTER`, создание происходит асинхронно, когда команда `MATERIALIZE PROJECTION` исполняется. Пользователи могут подтвердить прогресс этой операции с помощью следующего запроса, ожидая `is_done=1`.

```sql
SELECT
        parts_to_do,
        is_done,
        latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Если мы повторим приведенный выше запрос, мы увидим, что производительность значительно улучшилась за счет дополнительного хранения.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

С помощью команды [`EXPLAIN`](/sql-reference/statements/explain) мы также подтверждаем, что проекция использовалась для обслуживания этого запроса:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```
### Когда использовать проекции {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, поскольку они автоматически поддерживаются по мере вставки данных. Более того, запросы могут просто отправляться в одну таблицу, где проекции используются, где это возможно, чтобы сократить время отклика.

<Image img={bigquery_7} size="md" alt="Проекции"/>

Это контрастирует с материализованными представлениями, где пользователю необходимо выбрать соответствующую оптимизированную целевую таблицу или переписать свой запрос, в зависимости от фильтров. Это увеличивает акцент на приложениях пользователей и усложняет клиентскую сторону.

Несмотря на эти преимущества, проекции имеют некоторые присущие ограничения, о которых пользователи должны знать и поэтому должны использоваться осторожно:

- Проекции не позволяют использовать разные TTL для исходной таблицы и (скрытой) целевой таблицы. Материализованные представления допускают разные TTL.
- Проекции [в настоящее время не поддерживают `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) для (скрытой) целевой таблицы.
- Легковесные обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления могут быть цепочками: целевая таблица одного материализованного представления может быть исходной таблицей другого материализованного представления и так далее. Это невозможно с проекциями.
- Проекции не поддерживают соединения; материализованные представления поддерживают.
- Проекции не поддерживают фильтры (клаузу `WHERE`); материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полная переупорядочивание данных. Хотя выражение в проекции может, в теории, использовать `GROUP BY`, материализованные представления более эффективны для поддержки агрегатов. Оптимизатор запросов также с большей вероятностью воспользуется проекциями, которые используют простое переупорядочивание, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество столбцов в этом выражении, чтобы уменьшить объем хранимой информации.
- Пользователи комфортно воспринимают увеличение объема хранения и накладные расходы на дважды запись данных. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).
## Переписывание запросов BigQuery в ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

Следующее предоставляет примеры запросов, сравнивающих BigQuery и ClickHouse. Этот список направлен на демонстрацию того, как использовать функции ClickHouse для значительного упрощения запросов. Примеры здесь используют полный набор данных Stack Overflow (до апреля 2024 года).

**Пользователи (с более чем 10 вопросами), получающие наибольшее количество просмотров:**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Переписывание запросов BigQuery" border/>

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**Какие теги получают наибольшее количество просмотров:**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5


   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```
## Агрегатные функции {#aggregate-functions}

Где это возможно, пользователи должны использовать агрегатные функции ClickHouse. Ниже мы показываем использование [`argMax` функции](/sql-reference/aggregate-functions/reference/argmax) для вычисления самого просматриваемого вопроса каждого года.

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Агрегатные функции 1"/>

<Image img={bigquery_11} border size="sm" alt="Агрегатные функции 2"/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical


Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```
## Условные выражения и массивы {#conditionals-and-arrays}

Условные и массивные функции значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождениями) с наибольшим процентным увеличением с 2022 по 2023 год. Обратите внимание, как следующий запрос ClickHouse лаконичен благодаря условным выражениям, массивным функциям и возможности повторного использования алиасов в предложениях `HAVING` и `SELECT`.

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Условные выражения и массивы"/>

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 строк в наборе. Время: 0.096 сек. Обработано 5.08 миллиона строк, 155.73 МБ (53.10 миллиона строк/с., 1.63 ГБ/с.)
Пиковое использование памяти: 410.37 МиБ.
```

Это завершает наше основное руководство для пользователей, переходящих с BigQuery на ClickHouse. Мы рекомендуем пользователям, мигрирующим с BigQuery, прочитать руководство по [моделированию данных в ClickHouse](/data-modeling/schema-design), чтобы узнать больше о расширенных функциях ClickHouse.
