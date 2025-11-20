---
title: 'Миграция из BigQuery в ClickHouse Cloud'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'Как мигрировать данные из BigQuery в ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: 'Руководство по миграции'
doc_type: 'guide'
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


## Почему стоит использовать ClickHouse Cloud вместо BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

Коротко: ClickHouse быстрее, дешевле и мощнее BigQuery для современной аналитики данных:

<Image img={bigquery_2} size='md' alt='ClickHouse vs BigQuery' />


## Загрузка данных из BigQuery в ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из BigQuery в ClickHouse Cloud мы используем набор данных Stack Overflow, описанный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит все `post`, `vote`, `user`, `comment` и `badge`, которые появились на Stack Overflow с 2008 года по апрель 2024 года. Схема BigQuery для этих данных показана ниже:

<Image img={bigquery_3} size='lg' alt='Схема' />

Для пользователей, которые хотят загрузить этот набор данных в экземпляр BigQuery для тестирования шагов миграции, мы предоставили данные для этих таблиц в формате Parquet в корзине GCS. DDL-команды для создания и загрузки таблиц в BigQuery доступны [здесь](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==).

### Миграция данных {#migrating-data}

Миграция данных между BigQuery и ClickHouse Cloud подразделяется на два основных типа рабочих нагрузок:

- **Начальная массовая загрузка с периодическими обновлениями** — необходимо мигрировать начальный набор данных вместе с периодическими обновлениями через заданные интервалы, например ежедневно. Обновления обрабатываются путем повторной отправки изменившихся строк, идентифицируемых по столбцу, который можно использовать для сравнения (например, дата). Удаления обрабатываются полной периодической перезагрузкой набора данных.
- **Репликация в реальном времени или CDC** — необходимо мигрировать начальный набор данных. Изменения в этом наборе данных должны отражаться в ClickHouse практически в реальном времени с допустимой задержкой всего в несколько секунд. Это фактически [процесс захвата изменений данных (CDC)](https://en.wikipedia.org/wiki/Change_data_capture), при котором таблицы в BigQuery должны синхронизироваться с ClickHouse, то есть вставки, обновления и удаления в таблице BigQuery должны применяться к эквивалентной таблице в ClickHouse.

#### Массовая загрузка через Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery поддерживает экспорт данных в объектное хранилище Google (GCS). Для нашего примера набора данных:

1. Экспортируйте 7 таблиц в GCS. Команды для этого доступны [здесь](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==).

2. Импортируйте данные в ClickHouse Cloud. Для этого можно использовать [табличную функцию gcs](/sql-reference/table-functions/gcs). DDL и запросы импорта доступны [здесь](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==). Обратите внимание, что поскольку экземпляр ClickHouse Cloud состоит из нескольких вычислительных узлов, вместо табличной функции `gcs` мы используем [табличную функцию s3Cluster](/sql-reference/table-functions/s3Cluster). Эта функция также работает с корзинами GCS и [использует все узлы сервиса ClickHouse Cloud](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) для параллельной загрузки данных.

<Image img={bigquery_4} size='md' alt='Массовая загрузка' />

Этот подход имеет ряд преимуществ:

- Функциональность экспорта BigQuery поддерживает фильтрацию для экспорта подмножества данных.
- BigQuery поддерживает экспорт в форматы [Parquet, Avro, JSON и CSV](https://cloud.google.com/bigquery/docs/exporting-data) и несколько [типов сжатия](https://cloud.google.com/bigquery/docs/exporting-data) — все они поддерживаются ClickHouse.
- GCS поддерживает [управление жизненным циклом объектов](https://cloud.google.com/storage/docs/lifecycle), что позволяет удалять данные, которые были экспортированы и импортированы в ClickHouse, по истечении указанного периода.
- [Google позволяет экспортировать до 50 ТБ в день в GCS бесплатно](https://cloud.google.com/bigquery/quotas#export_jobs). Пользователи платят только за хранилище GCS.
- Экспорт автоматически создает несколько файлов, ограничивая каждый максимум 1 ГБ табличных данных. Это выгодно для ClickHouse, поскольку позволяет распараллелить импорт.

Перед тем как пробовать следующие примеры, рекомендуем ознакомиться с [разрешениями, необходимыми для экспорта](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions), и [рекомендациями по локальности](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) для максимизации производительности экспорта и импорта.


### Репликация в реальном времени или CDC через запланированные запросы {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) — это процесс, обеспечивающий синхронизацию таблиц между двумя базами данных. Задача значительно усложняется, если обновления и удаления необходимо обрабатывать практически в реальном времени. Один из подходов — настроить периодический экспорт с помощью [функциональности запланированных запросов](https://cloud.google.com/bigquery/docs/scheduling-queries) BigQuery. Если вы можете допустить некоторую задержку при вставке данных в ClickHouse, этот подход прост в реализации и обслуживании. Пример приведен в [этой статье блога](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries).


## Проектирование схем {#designing-schemas}

Набор данных Stack Overflow содержит несколько связанных таблиц. Рекомендуется сначала сосредоточиться на миграции основной таблицы. Это не обязательно самая большая таблица, а скорее та, на которую вы ожидаете наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse. По мере добавления дополнительных таблиц эта таблица может потребовать перемоделирования для полного использования возможностей ClickHouse и достижения оптимальной производительности. Процесс моделирования рассматривается в нашей [документации по моделированию данных](/data-modeling/schema-design#next-data-modeling-techniques).

Следуя этому принципу, мы сосредоточимся на основной таблице `posts`. Схема BigQuery для неё показана ниже:

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

Применение процесса, [описанного здесь](/data-modeling/schema-design), приводит к следующей схеме:

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

Заполнить эту таблицу можно с помощью простого [`INSERT INTO SELECT`](/sql-reference/statements/insert-into), читая экспортированные данные из GCS с использованием [табличной функции `gcs`](/sql-reference/table-functions/gcs). Обратите внимание, что в ClickHouse Cloud вы также можете использовать совместимую с GCS [табличную функцию `s3Cluster`](/sql-reference/table-functions/s3Cluster) для распараллеливания загрузки на несколько узлов:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

В новой схеме мы не сохраняем значения null. Приведённая выше вставка неявно преобразует их в значения по умолчанию для соответствующих типов — 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения к целевой точности.


## Чем отличаются первичные ключи ClickHouse? {#how-are-clickhouse-primary-keys-different}

Как описано [здесь](/migrations/bigquery), аналогично BigQuery, ClickHouse не обеспечивает уникальность значений столбцов первичного ключа таблицы.

Подобно кластеризации в BigQuery, данные таблицы ClickHouse хранятся на диске упорядоченными по столбцу (столбцам) первичного ключа. Этот порядок сортировки используется оптимизатором запросов для предотвращения повторной сортировки, минимизации использования памяти при соединениях и обеспечения досрочного завершения для предложений limit.
В отличие от BigQuery, ClickHouse автоматически создаёт [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) на основе значений столбцов первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по столбцам первичного ключа. В частности:

- Эффективность использования памяти и диска имеет первостепенное значение для масштабов, в которых обычно используется ClickHouse. Данные записываются в таблицы ClickHouse фрагментами, известными как куски (parts), с применением правил для слияния кусков в фоновом режиме. В ClickHouse каждый кусок имеет свой собственный первичный индекс. При слиянии кусков первичные индексы объединённого куска также сливаются. Обратите внимание, что эти индексы не строятся для каждой строки. Вместо этого первичный индекс куска содержит одну индексную запись на группу строк — этот метод называется разреженной индексацией.
- Разреженная индексация возможна потому, что ClickHouse хранит строки куска на диске упорядоченными по указанному ключу. Вместо прямого поиска отдельных строк (как в индексе на основе B-дерева), разреженный первичный индекс позволяет быстро (посредством бинарного поиска по индексным записям) идентифицировать группы строк, которые потенциально могут соответствовать запросу. Найденные группы потенциально подходящих строк затем параллельно передаются в движок ClickHouse для поиска совпадений. Такая конструкция индекса позволяет первичному индексу оставаться компактным (он полностью помещается в оперативную память), при этом значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, типичных для сценариев аналитики данных. Для получения более подробной информации рекомендуем [это подробное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={bigquery_5} size='md' alt='Первичные ключи ClickHouse' />

Выбранный первичный ключ в ClickHouse определяет не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого он может существенно влиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Ключ упорядочивания, который приводит к записи значений большинства столбцов в последовательном порядке, позволит выбранному алгоритму сжатия (и кодекам) сжимать данные более эффективно.

> Все столбцы в таблице будут отсортированы на основе значения указанного ключа упорядочивания, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей упорядочивания — это будет упорядочивать с той же семантикой, что и предложение `ORDER BY` в запросе `SELECT`.

### Выбор ключа упорядочивания {#choosing-an-ordering-key}

Рекомендации и шаги по выбору ключа упорядочивания на примере таблицы постов см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).


## Техники моделирования данных {#data-modeling-techniques}

Пользователям, мигрирующим из BigQuery, рекомендуется ознакомиться с [руководством по моделированию данных в ClickHouse](/data-modeling/schema-design). В этом руководстве используется тот же набор данных Stack Overflow и рассматриваются различные подходы с использованием возможностей ClickHouse.

### Партиции {#partitions}

Пользователи BigQuery знакомы с концепцией партиционирования таблиц для повышения производительности и управляемости больших баз данных путем разделения таблиц на более мелкие, управляемые части, называемые партициями. Партиционирование может выполняться с использованием диапазона по указанному столбцу (например, даты), определенных списков или через хеш по ключу. Это позволяет администраторам организовывать данные на основе определенных критериев, таких как диапазоны дат или географическое расположение.

Партиционирование помогает улучшить производительность запросов, обеспечивая более быстрый доступ к данным через отсечение партиций и более эффективную индексацию. Оно также упрощает задачи обслуживания, такие как резервное копирование и очистка данных, позволяя выполнять операции над отдельными партициями, а не над всей таблицей. Кроме того, партиционирование может значительно улучшить масштабируемость баз данных BigQuery за счет распределения нагрузки по нескольким партициям.

В ClickHouse партиционирование указывается для таблицы при ее первоначальном определении с помощью выражения [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key). Это выражение может содержать SQL-выражение для любого столбца или столбцов, результаты которого определят, в какую партицию будет отправлена строка.

<Image img={bigquery_6} size='md' alt='Партиции' />

Части данных логически связаны с каждой партицией на диске и могут запрашиваться изолированно. В приведенном ниже примере мы партиционируем таблицу posts по годам, используя выражение [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear). При вставке строк в ClickHouse это выражение вычисляется для каждой строки — затем строки направляются в соответствующую партицию в виде новых частей данных, принадлежащих этой партиции.

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

#### Применение {#applications}

Партиционирование в ClickHouse имеет схожие применения, как и в BigQuery, но с некоторыми тонкими различиями. В частности:

- **Управление данными** - В ClickHouse пользователи должны в первую очередь рассматривать партиционирование как функцию управления данными, а не как технику оптимизации запросов. Разделяя данные логически на основе ключа, каждая партиция может обрабатываться независимо, например, удаляться. Это позволяет пользователям эффективно перемещать партиции и, следовательно, подмножества данных между [уровнями хранения](/integrations/s3#storage-tiers) по времени или [устаревать данные/эффективно удалять их из кластера](/sql-reference/statements/alter/partition). В приведенном ниже примере мы удаляем посты за 2008 год:

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


- **Оптимизация запросов** - Хотя партиции могут улучшить производительность запросов, это сильно зависит от шаблонов доступа. Если запросы обращаются только к нескольким партициям (в идеале к одной), производительность может потенциально улучшиться. Это обычно полезно только в том случае, если ключ партиционирования не входит в первичный ключ и вы фильтруете по нему. Однако запросы, которым необходимо охватить много партиций, могут работать хуже, чем без использования партиционирования (поскольку в результате партиционирования может образоваться больше кусков данных). Преимущество обращения к одной партиции будет еще менее выраженным или вовсе отсутствовать, если ключ партиционирования уже является ранним элементом в первичном ключе. Партиционирование также можно использовать для [оптимизации запросов `GROUP BY`](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в целом пользователям следует убедиться, что первичный ключ оптимизирован, и рассматривать партиционирование как технику оптимизации запросов только в исключительных случаях, когда шаблоны доступа обращаются к конкретному предсказуемому подмножеству данных, например, партиционирование по дням, когда большинство запросов относятся к последнему дню.

#### Рекомендации {#recommendations}

Пользователям следует рассматривать партиционирование как технику управления данными. Оно идеально подходит, когда данные необходимо удалять из кластера при работе с временными рядами, например, самую старую партицию можно [просто удалить](/sql-reference/statements/alter/partition#drop-partitionpart).

Важно: Убедитесь, что выражение ключа партиционирования не приводит к набору с высокой кардинальностью, то есть следует избегать создания более 100 партиций. Например, не партиционируйте данные по столбцам с высокой кардинальностью, таким как идентификаторы или имена клиентов. Вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении `ORDER BY`.

> Внутренне ClickHouse [создает куски данных](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) для вставляемых данных. По мере вставки большего количества данных число кусков увеличивается. Чтобы предотвратить чрезмерно большое количество кусков, которое ухудшит производительность запросов (поскольку нужно читать больше файлов), куски объединяются в фоновом асинхронном процессе. Если количество кусков превышает [предварительно настроенный лимит](/operations/settings/merge-tree-settings#parts_to_throw_insert), то ClickHouse выбросит исключение при вставке в виде [ошибки «too many parts»](/knowledgebase/exception-too-many-parts). Это не должно происходить при нормальной работе и возникает только в случае неправильной настройки или некорректного использования ClickHouse, например, при множестве мелких вставок. Поскольку куски создаются для каждой партиции изолированно, увеличение количества партиций приводит к увеличению количества кусков, то есть оно кратно количеству партиций. Ключи партиционирования с высокой кардинальностью могут, следовательно, вызвать эту ошибку, и их следует избегать.


## Материализованные представления и проекции {#materialized-views-vs-projections}

Концепция проекций в ClickHouse позволяет пользователям указывать несколько выражений `ORDER BY` для таблицы.

В разделе [Моделирование данных в ClickHouse](/data-modeling/schema-design) мы рассматриваем, как материализованные представления могут использоваться
в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов
для различных шаблонов доступа. Для последнего случая мы [привели пример](/materialized-view/incremental-materialized-view#lookup-table), где
материализованное представление отправляет строки в целевую таблицу с ключом сортировки, отличным
от исходной таблицы, принимающей вставки.

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

Этот запрос требует сканирования всех 90 млн строк (хотя и быстро), поскольку `UserId`
не является ключом сортировки. Ранее мы решали эту задачу с помощью материализованного представления,
выступающего в качестве таблицы поиска для `PostId`. Та же проблема может быть решена с помощью проекции.
Команда ниже добавляет проекцию с `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её.
Последняя команда приводит к тому, что данные сохраняются на диске дважды в двух различных
порядках. Проекция также может быть определена при создании таблицы, как показано ниже,
и будет автоматически поддерживаться при вставке данных.

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

Если проекция создаётся с помощью команды `ALTER`, создание выполняется асинхронно
при выполнении команды `MATERIALIZE PROJECTION`. Пользователи могут проверить прогресс
этой операции следующим запросом, ожидая `is_done=1`.

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

Если мы повторим приведённый выше запрос, мы увидим, что производительность значительно улучшилась
за счёт дополнительного использования дискового пространства.

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

С помощью команды [`EXPLAIN`](/sql-reference/statements/explain) мы также подтверждаем, что для выполнения этого запроса была использована проекция:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

```


┌─explain─────────────────────────────────────────────┐

1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │   Filter                                            │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           Indexes:                                  │
6. │           PrimaryKey                                │
7. │           Keys:                                     │
8. │           UserId                                    │
9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

Получено 11 строк. Затрачено: 0,004 сек.

```

### Когда использовать проекции {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, поскольку они автоматически 
поддерживаются при вставке данных. Кроме того, запросы можно отправлять в одну
таблицу, где проекции используются при возможности для ускорения времени
ответа.

<Image img={bigquery_7} size="md" alt="Projections"/>

В отличие от материализованных представлений, где пользователь должен выбрать 
соответствующую оптимизированную целевую таблицу или переписать запрос в зависимости от фильтров,
проекции не требуют этого. Использование материализованных представлений создает большую нагрузку на пользовательские приложения и увеличивает сложность 
на стороне клиента.

Несмотря на эти преимущества, проекции имеют некоторые присущие им ограничения, о которых 
пользователи должны знать, и поэтому их следует применять с осторожностью. Для получения дополнительной 
информации см. раздел [«Материализованные представления и проекции»](/managing-data/materialized-views-versus-projections).

Мы рекомендуем использовать проекции в следующих случаях:

- Требуется полная переупорядочка данных. Хотя выражение в проекции теоретически может использовать `GROUP BY`, материализованные представления более эффективны для поддержания агрегатов. Оптимизатор запросов также с большей вероятностью использует проекции с простой переупорядочкой, т. е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество столбцов в этом выражении, чтобы уменьшить объем занимаемого хранилища.
- Пользователи готовы к связанному с этим увеличению объема хранилища и накладным расходам на двойную запись данных. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).
```


## Переписывание запросов BigQuery для ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

Ниже приведены примеры запросов в BigQuery и ClickHouse. Цель этого списка — показать, как использовать возможности ClickHouse для значительного упрощения запросов. В примерах используется полный набор данных Stack Overflow (по апрель 2024 года включительно).

**Пользователи (с более чем 10 вопросами), чьи вопросы набрали больше всего просмотров:**

_BigQuery_

<Image img={bigquery_8} size='sm' alt='Переписывание запросов BigQuery' border />

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

**Теги, которые набрали больше всего просмотров:**

_BigQuery_

<br />

<Image img={bigquery_9} size='sm' alt='BigQuery 1' border />

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

По возможности следует использовать агрегатные функции ClickHouse. Ниже показано использование [функции `argMax`](/sql-reference/aggregate-functions/reference/argmax) для определения наиболее просматриваемого вопроса за каждый год.

_BigQuery_

<Image img={bigquery_10} border size='sm' alt='Агрегатные функции 1' />

<Image img={bigquery_11} border size='sm' alt='Агрегатные функции 2' />

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

Условные функции и функции для работы с массивами значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождениями) с наибольшим процентным приростом с 2022 по 2023 год. Обратите внимание, насколько лаконичен данный запрос ClickHouse благодаря условным выражениям, функциям для работы с массивами и возможности повторного использования псевдонимов в секциях `HAVING` и `SELECT`.

_BigQuery_

<Image img={bigquery_12} size='sm' border alt='Условные выражения и массивы' />

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

Получено 5 строк. Затрачено: 0.096 сек. Обработано 5.08 млн строк, 155.73 МБ (53.10 млн строк/сек., 1.63 ГБ/сек.)
Пиковое использование памяти: 410.37 МиБ.
```

На этом завершается наше базовое руководство для пользователей, переходящих с BigQuery на ClickHouse. Мы рекомендуем пользователям, мигрирующим с BigQuery, ознакомиться с руководством по [моделированию данных в ClickHouse](/data-modeling/schema-design), чтобы узнать больше о расширенных возможностях ClickHouse.
