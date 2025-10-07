---
'title': '从 BigQuery 迁移到 ClickHouse Cloud'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': '如何将您的数据从 BigQuery 迁移到 ClickHouse Cloud'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '迁移指南'
'doc_type': 'guide'
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

## Зачем использовать ClickHouse Cloud вместо BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

Кратко: Потому что ClickHouse быстрее, дешевле и мощнее, чем BigQuery для современных аналитических данных:

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## Загрузка данных из BigQuery в ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из BigQuery в ClickHouse Cloud мы используем набор данных Stack Overflow, документированный [здесь](/getting-started/example-datasets/stackoverflow). Этот набор содержит все `посты`, `голоса`, `пользователи`, `комментарии` и `значки`, которые произошли на Stack Overflow с 2008 года по апрель 2024 года. Схема BigQuery для этих данных показана ниже:

<Image img={bigquery_3} size="lg" alt="Схема"/>

Для пользователей, которые желают заполнить этот набор данных в экземпляр BigQuery для тестирования шагов миграции, мы предоставили данные для этих таблиц в формате Parquet в корзине GCS, а DDL команды для создания и загрузки таблиц в BigQuery доступны [здесь](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==).

### Миграция данных {#migrating-data}

Миграция данных между BigQuery и ClickHouse Cloud делится на два основных типа нагрузки:

- **Начальная пакетная загрузка с периодическими обновлениями** - Начальный набор данных должен быть мигрирован вместе с периодическими обновлениями через заданные интервалы, например, ежедневно. Обновления здесь обрабатываются путем повторной отправки измененных строк - идентифицируемых по столбцу, который можно использовать для сравнений (например, дате). Удаления обрабатываются с помощью полной периодической перезагрузки набора данных.
- **Репликация в реальном времени или CDC** - Начальный набор данных должен быть мигрирован. Изменения в этом наборе данных должны отражаться в ClickHouse почти в реальном времени с приемлемой задержкой в несколько секунд. Это фактически процесс [Change Data Capture (CDC)](https://en.wikipedia.org/wiki/Change_data_capture), когда таблицы в BigQuery должны синхронизироваться с ClickHouse, то есть вставки, обновления и удаления в таблице BigQuery должны применяться к эквивалентной таблице в ClickHouse.

#### Пакетная загрузка через Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery поддерживает экспорт данных в объектное хранилище Google (GCS). Для нашего примера набора данных:

1. Экспортируйте 7 таблиц в GCS. Команды для этого доступны [здесь](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==).

2. Импортируйте данные в ClickHouse Cloud. Для этого мы можем использовать [функцию таблицы gcs](/sql-reference/table-functions/gcs). DDL и запросы импорта доступны [здесь](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==). Обратите внимание, что поскольку экземпляр ClickHouse Cloud состоит из нескольких вычислительных узлов, вместо функции таблицы `gcs` мы используем [функцию таблицы s3Cluster](/sql-reference/table-functions/s3Cluster). Эта функция также работает с корзинами gcs и [использует все узлы службы ClickHouse Cloud](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) для параллельной загрузки данных.

<Image img={bigquery_4} size="md" alt="Пакетная загрузка"/>

Этот подход имеет несколько преимуществ:

- Функция экспорта BigQuery поддерживает фильтр для экспорта поднабора данных.
- BigQuery поддерживает экспорт в форматы [Parquet, Avro, JSON и CSV](https://cloud.google.com/bigquery/docs/exporting-data) и несколько [типов сжатия](https://cloud.google.com/bigquery/docs/exporting-data) - все они поддерживаются ClickHouse.
- GCS поддерживает [управление жизненным циклом объектов](https://cloud.google.com/storage/docs/lifecycle), позволяя удалять данные, которые были экспортированы и импортированы в ClickHouse, после определенного периода.
- [Google допускает экспорт до 50 ТБ в день в GCS бесплатно](https://cloud.google.com/bigquery/quotas#export_jobs). Пользователи платят только за хранилище GCS.
- Экспорты автоматически производят несколько файлов, ограничивая каждый максимумом в 1 ГБ данных таблицы. Это полезно для ClickHouse, поскольку позволяет параллелизовать импорты.

Перед тем как попробовать приведенные ниже примеры, мы рекомендуем пользователям ознакомиться с [разрешениями, необходимыми для экспорта](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) и [рекомендациями по локализации](https://cloud.google.com/bigquery/docs/exporting-data#data-locations), чтобы максимизировать производительность экспорта и импорта.

### Репликация в реальном времени или CDC через запланированные запросы {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) - это процесс, с помощью которого таблицы синхронизируются между двумя базами данных. Это значительно сложнее, если обновления и удаления должны обрабатываться почти в реальном времени. Один из подходов - просто запланировать периодический экспорт с помощью функции [запланированных запросов BigQuery](https://cloud.google.com/bigquery/docs/scheduling-queries). При условии, что вы можете принять некоторую задержку в данных, которые вставляются в ClickHouse, этот подход легко реализовать и поддерживать. Пример приведен в [этом блоге](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries).

## Проектирование схем {#designing-schemas}

Набор данных Stack Overflow содержит несколько связанных таблиц. Мы рекомендуем сначала сосредоточиться на миграции основной таблицы. Это может быть не обязательно самая большая таблица, но та, от которой вы ожидаете наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse. Эта таблица может потребовать переработки по мере добавления дополнительных таблиц, чтобы полностью использовать возможности ClickHouse и получить оптимальную производительность. Мы изучаем этот процесс моделирования в нашей [документации по моделированию данных](/data-modeling/schema-design#next-data-modeling-techniques).

Следуя этому принципу, мы сосредоточимся на основной таблице `posts`. Схема BigQuery для этого показана ниже:

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
COMMENT 'Optimized types'
```

Мы можем заполнить эту таблицу с помощью простого [`INSERT INTO SELECT`](/sql-reference/statements/insert-into), читая экспортированные данные из gcs с использованием функции таблицы [`gcs` таблицы](/sql-reference/table-functions/gcs). Обратите внимание, что в ClickHouse Cloud вы также можете использовать совместимую с gcs [`s3Cluster` таблицу](/sql-reference/table-functions/s3Cluster), чтобы параллелизовать загрузку по нескольким узлам:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

Мы не сохраняем никаких null значений в нашей новой схеме. Вышеуказанный вставка неявно преобразует их в значения по умолчанию для их соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения к их целевой точности.

## Чем отличаются первичные ключи в ClickHouse? {#how-are-clickhouse-primary-keys-different}

Как описано [здесь](/migrations/bigquery), как и в BigQuery, ClickHouse не обеспечивают уникальность для значений столбцов первичного ключа таблицы.

Аналогично кластеризации в BigQuery, данные таблицы ClickHouse хранятся на диске, упорядоченные по первичному ключу. Этот порядок сортировки используется оптимизатором запросов для предотвращения повторной сортировки, минимизации использования памяти для соединений и обеспечения быстрого выполнения ограничений.
В отличие от BigQuery, ClickHouse автоматически создает [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) на основе значений столбцов первичного ключа. Этот индекс используется для ускорения всех запросов, которые содержат фильтры по столбцам первичного ключа. В частности:

- Эффективность использования памяти и диска имеет первостепенное значение для масштаба, на котором ClickHouse часто используется. Данные записываются в таблицы ClickHouse частями, известными как части, с применением правил для объединения этих частей на фоне. В ClickHouse у каждой части есть свой собственный первичный индекс. Когда части объединяются, первичные индексы объединённых частей также объединяются. Обратите внимание, что эти индексы не создаются для каждой строки. Вместо этого первичный индекс для части имеет одну запись индекса на группу строк - эта техника называется разреженным индексированием.
- Разреженное индексирование возможно, потому что ClickHouse хранит строки для части на диске, упорядоченные по указанному ключу. Вместо того, чтобы напрямую находить отдельные строки (как Б-дерево), разреженный первичный индекс позволяет быстро (через бинарный поиск по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально подходящих строк затем, параллельно, передаются в движок ClickHouse для поиска совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он полностью помещается в основную память), одновременно значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, которые типичны для аналитики данных. Для получения более подробной информации мы рекомендуем [это углубленное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={bigquery_5} size="md" alt="Первичные ключи ClickHouse"/>

Выбранный первичный ключ в ClickHouse будет определять не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого это может значительно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Ключ сортировки, который заставляет значения большинства колонок записываться в последовательном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все колонки в таблице будут отсортированы на основе значения указанного ключа сортировки, независимо от того, включены ли они в ключ. Например, если `CreationDate` используется в качестве ключа, порядок значений во всех других колонках будет соответствовать порядку значений в колонке `CreationDate`. Можно указать несколько ключей сортировки - это упорядочит данные с той же семантикой, что и оператор `ORDER BY` в запросе `SELECT`.

### Выбор ключа сортировки {#choosing-an-ordering-key}

Для соображений и шагов по выбору ключа сортировки, используя таблицу posts в качестве примера, см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).

## Техники моделирования данных {#data-modeling-techniques}

Мы рекомендуем пользователям, мигрирующим из BigQuery, прочитать [руководство по моделированию данных в ClickHouse](/data-modeling/schema-design). Это руководство использует тот же набор данных Stack Overflow и исследует несколько подходов, использующих возможности ClickHouse.

### Партиции {#partitions}

Пользователи BigQuery будут знакомы с концепцией партиционирования таблиц для повышения производительности и управляемости больших баз данных, деля таблицы на более мелкие, более управляемые части, называемые партициями. Это партиционирование может быть выполнено с помощью диапазона по указанному столбцу (например, по датам), определенных списков или с помощью хеширования по ключу. Это позволяет администраторам организовывать данные на основе конкретных критериев, таких как диапазоны дат или географические местоположения.

Партиционирование способствует улучшению производительности запросов, позволяя более быстрому доступу к данным через обрезку партиций и более эффективное индексирование. Оно также помогает в задачах обслуживания, таких как резервное копирование и очистка данных, позволяя выполнять операции над отдельными партициями, а не над всей таблицей. Кроме того, партиционирование может значительно улучшить масштабируемость баз данных BigQuery, распределяя нагрузку по нескольким партициям.

В ClickHouse партиционирование указывается на уровне таблицы при ее первоначальном определении через оператор [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key). Этот оператор может содержать SQL-выражение по любым столбцам, результаты которого будут определять, в какую партицию будет отправлена строка.

<Image img={bigquery_6} size="md" alt="Партиции"/>

Части данных логически ассоциированы с каждой партицией на диске и могут запрашиваться изолированно. Для примера ниже мы распределяем таблицу posts по годам, используя выражение [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear). По мере вставки строк в ClickHouse это выражение будет оцениваться для каждой строки — строки затем маршрутизируются в результирующую партицию в форме новых частей данных, принадлежащих этой партиции.

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

Партиционирование в ClickHouse имеет схожие применения с BigQuery, но с некоторыми тонкими отличиями. Более конкретно:

- **Управление данными** - В ClickHouse пользователи должны в первую очередь рассматривать партиционирование как функцию управления данными, а не как технику оптимизации запросов. Разделяя данные логически на основе ключа, каждая партиция может обрабатываться независимо, например, удаляться. Это позволяет пользователям перемещать партиции, и, следовательно, подс conjuntos, между [уровнями хранения](/integrations/s3#storage-tiers) эффективно по времени или [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition). В примере ниже мы удаляем посты 2008 года:

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

- **Оптимизация запросов** - Хотя партиции могут помочь с производительностью запросов, это сильно зависит от шаблонов доступа. Если запросы нацелены только на несколько партиций (желательно на одну), производительность может улучшиться. Это обычно полезно, если ключ партиционирования не входит в первичный ключ, и вы фильтруете по нему. Однако запросы, которые требуют покрытия многих партиций, могут работать хуже, чем если бы партиционирование не использовалось (поскольку может быть больше частей в результате партиционирования). Преимущество нацеливания на одну партицию будет еще менее выражено, если ключ партиционирования уже является ранним значением в первичном ключе. Партиционирование также может использоваться для [оптимизации запросов `GROUP BY`](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в общем пользователи должны следить за тем, чтобы первичный ключ был оптимизирован и рассматривать партиционирование как технику оптимизации запросов только в исключительных случаях, когда шаблоны доступа касаются определенного предсказуемого подмножества дня, например, партиционирование по дням, с большинством запросов за последний день.

#### Рекомендации {#recommendations}

Пользователи должны рассматривать партиционирование как технику управления данными. Это идеально, когда данные необходимо истекать из кластера при работе с данными временных рядов, например, старая партиция может [просто быть удалена](/sql-reference/statements/alter/partition#drop-partitionpart).

Важно: Убедитесь, что выражение для ключа партиционирования не приводит к множеству с высокой кардинальностью, т.е. создание более 100 партиций следует избегать. Например, не партиционируйте свои данные по столбцам с высокой кардинальностью, таким как идентификаторы клиентов или имена. Вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении `ORDER BY`.

> Внутри ClickHouse [создаются части](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) для вставленных данных. По мере вставки большего количества данных количество частей увеличивается. Чтобы предотвратить чрезмерно высокое количество частей, что ухудшит производительность запросов (поскольку необходимо читать больше файлов), части объединяются в фоновом асинхронном процессе. Если количество частей превышает [преднастроенный лимит](/operations/settings/merge-tree-settings#parts_to_throw_insert), ClickHouse выдаст исключение при вставке как ошибка ["слишком много частей"](/knowledgebase/exception-too-many-parts). Это не должно происходить в нормальных условиях эксплуатации и происходит только в случае неправильной конфигурации или неправильного использования ClickHouse, например, при множественных мелких вставках. Поскольку части создаются по партициям изолированно, увеличение числа партиций вызывает увеличение числа частей, т.е. это кратное число количеству партиций. Ключи партиционирования с высокой кардинальностью могут, следовательно, вызывать эту ошибку и должны быть избегаемы.

## Материализованные представления против проекций {#materialized-views-vs-projections}

Концепция проекций в ClickHouse позволяет пользователям указывать несколько операторов `ORDER BY` для таблицы.

В [моделировании данных ClickHouse](/data-modeling/schema-design) мы изучаем, как можно использовать материализованные представления в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов для различных шаблонов доступа. Для последнего мы [предоставили пример](/materialized-view/incremental-materialized-view#lookup-table), где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем в оригинальной таблице, принимающей вставки.

Например, рассмотрим следующий запрос:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

Этот запрос требует сканирования всех 90 миллионов строк (хотя и быстро), поскольку `UserId` не является ключом сортировки. Ранее мы решали эту проблему с помощью материализованного представления, действующего как справочный для `PostId`. Ту же проблему можно решить с помощью проекции. Команда ниже добавляет проекцию с `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Обратите внимание, что сначала мы должны создать проекцию, а затем материализовать её. Эта последняя команда приводит к тому, что данные сохраняются дважды на диске в двух разных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

Если проекция создается через команду `ALTER`, процесс создания происходит асинхронно при выполнении команды `MATERIALIZE PROJECTION`. Пользователи могут подтвердить ход выполнения этой операции с помощью следующего запроса, дожидаясь `is_done=1`.

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

Если мы повторим приведенный выше запрос, мы можем увидеть, что производительность значительно улучшилась за счет дополнительного хранилища.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

С помощью команды [`EXPLAIN`](/sql-reference/statements/explain) мы также подтверждаем, что проекция была использована для выполнения этого запроса:

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

Проекции являются привлекательной функцией для новых пользователей, поскольку они автоматически поддерживаются по мере вставки данных. Кроме того, запросы могут быть направлены только в одну таблицу, где проекции используются, если это возможно, для ускорения времени ответа.

<Image img={bigquery_7} size="md" alt="Проекции"/>

Это контрастирует с материализованными представлениями, где пользователю необходимо выбрать оптимальную целевую таблицу или переписать свой запрос в зависимости от фильтров. Это создает большее внимание к приложениям пользователей и увеличивает сложность на стороне клиента.

Несмотря на эти преимущества, проекции имеют некоторые присущие ограничения, о которых пользователям следует знать, и поэтому их следует использовать с осторожностью. Для получения дополнительной информации смотрите ["материализованные представления против проекций"](/managing-data/materialized-views-versus-projections).

Мы рекомендуем использовать проекции, когда:

- Необходимо полное изменение порядка данных. Хотя выражение в проекции может в теории использовать `GROUP BY`, материализованные представления более эффективны для поддержания агрегатов. Оптимизатор запросов также с большей вероятностью использует проекции, которые используют простую перестановку, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество колонок в этом выражении, чтобы уменьшить объем хранилища.
- Пользователи комфортны с сопутствующим увеличением объема хранилища и накладными расходами на запись данных дважды. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранилище](/data-compression/compression-in-clickhouse).

## Переписывание запросов BigQuery в ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

Ниже приведены примеры запросов, сравнивающих BigQuery и ClickHouse. Этот список предназначен для демонстрации того, как использовать возможности ClickHouse для значительного упрощения запросов. Примеры здесь используют полный набор данных Stack Overflow (до апреля 2024 года).

**Пользователи (с более чем 10 вопросами), которые получают наибольшее количество просмотров:**

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

**Какие теги получают больше всего просмотров:**

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

Там, где это возможно, пользователи должны использовать агрегатные функции ClickHouse. Ниже мы демонстрируем использование функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax) для вычисления наиболее просматриваемого вопроса каждого года.

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

## Условные и массивные функции {#conditionals-and-arrays}

Условные и массивные функции значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождений) с наибольшим процентом увеличения с 2022 по 2023 год. Обратите внимание, что следующий запрос ClickHouse лаконичен благодаря условным, массивным функциям и возможности повторного использования псевдонимов в операторах `HAVING` и `SELECT`.

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Условные и массивные функции"/>

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

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```

Это завершает наш основной гид для пользователей, мигрирующих из BigQuery в ClickHouse. Мы рекомендуем пользователям, мигрирующим из BigQuery, прочитать руководство по [моделированию данных в ClickHouse](/data-modeling/schema-design), чтобы подробнее узнать о продвинутых возможностях ClickHouse.
