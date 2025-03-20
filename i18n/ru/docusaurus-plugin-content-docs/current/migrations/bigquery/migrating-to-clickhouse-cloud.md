---
title: 'Миграция с BigQuery в ClickHouse Cloud'
slug: '/migrations/bigquery/migrating-to-clickhouse-cloud'
description: 'Как мигрировать ваши данные из BigQuery в ClickHouse Cloud'
keywords: ['миграция', 'миграция', 'мигрант', 'данные', 'etl', 'elt', 'BigQuery']
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

## Почему стоит использовать ClickHouse Cloud вместо BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

TLDR: Потому что ClickHouse быстрее, дешевле и мощнее, чем BigQuery для современных аналитических задач:

<br />

<img src={bigquery_2}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />
## Загрузка данных из BigQuery в ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}
### Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции с BigQuery в ClickHouse Cloud мы используем набор данных Stack Overflow, задокументированный [здесь](/getting-started/example-datasets/stackoverflow). Это содержит каждое `post`, `vote`, `user`, `comment` и `badge`, которые произошли на Stack Overflow с 2008 года по апрель 2024 года. Схема BigQuery для этих данных показана ниже:

<br />

<img src={bigquery_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px'}} />

<br />

Для пользователей, которые хотят заполнить этот набор данных в экземпляре BigQuery для тестирования шагов миграции, мы предоставили данные для этих таблиц в формате Parquet в GCS bucket, и команды DDL для создания и загрузки таблиц в BigQuery доступны [здесь](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==).
### Миграция данных {#migrating-data}

Миграция данных между BigQuery и ClickHouse Cloud делится на два основных типа рабочих нагрузок:

- **Начальная массовая загрузка с периодическими обновлениями** - Необходима миграция первоначального набора данных вместе с периодическими обновлениями через установленные интервалы, например, ежедневно. Обновления здесь обрабатываются повторной отправкой строк, которые изменились, - определяемых либо колонкой, которая может использоваться для сравнений (например, дата). Удаления обрабатываются с полной периодической перезагрузкой набора данных.
- **Реальная репликация или CDC** - Необходима миграция первоначального набора данных. Изменения в этом наборе данных должны отражаться в ClickHouse в реальном времени с задержкой в несколько секунд. Это фактически процесс [Change Data Capture (CDC)](https://en.wikipedia.org/wiki/Change_data_capture), при котором таблицы в BigQuery должны синхронизироваться с ClickHouse, т.е. вставки, обновления и удаления в таблице BigQuery должны применяться к эквивалентной таблице в ClickHouse.
#### Массовая загрузка через Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery поддерживает экспорт данных в объектное хранилище Google (GCS). Для нашего примера набора данных:

1. Экспортируйте 7 таблиц в GCS. Команды для этого доступны [здесь](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==).

2. Импортируйте данные в ClickHouse Cloud. Для этого мы можем использовать [функцию таблицы gcs](/sql-reference/table-functions/gcs). Команды DDL и запросы импорта доступны [здесь](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==). Обратите внимание, что поскольку экземпляр ClickHouse Cloud состоит из нескольких вычислительных узлов, вместо функции таблицы `gcs`, мы используем функцию таблицы [s3Cluster](/sql-reference/table-functions/s3Cluster). Эта функция также работает с корзинами gcs и [использует все узлы сервиса ClickHouse Cloud](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) для загрузки данных параллельно.

<br />

<img src={bigquery_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

Этот подход имеет ряд преимуществ:

- Функциональность экспорта BigQuery поддерживает фильтр для экспорта подмножества данных.
- BigQuery поддерживает экспорт в форматы [Parquet, Avro, JSON и CSV](https://cloud.google.com/bigquery/docs/exporting-data) и несколько [типов сжатия](https://cloud.google.com/bigquery/docs/exporting-data) - все они поддерживаются ClickHouse.
- GCS поддерживает [управление жизненным циклом объектов](https://cloud.google.com/storage/docs/lifecycle), позволяя удалять данные, которые были экспортированы и импортированы в ClickHouse, после заданного периода.
- [Google позволяет бесплатно экспортировать до 50 ТБ в день в GCS](https://cloud.google.com/bigquery/quotas#export_jobs). Пользователи платят только за хранение GCS.
- Экспорты автоматически создают несколько файлов, ограничивая каждый максимальным размером 1 ГБ данных таблицы. Это полезно для ClickHouse, поскольку позволяет параллелизовать импорты.

Прежде чем попробовать следующие примеры, мы рекомендуем пользователям ознакомиться с [требуемыми разрешениями для экспорта](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) и [рекомендациями по локализации](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) для максимизации производительности экспорта и импорта.
### Реальная репликация или CDC через запланированные запросы {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) - это процесс, с помощью которого таблицы поддерживаются в синхронизации между двумя базами данных. Это значительно более сложно, если обновления и удаления необходимо обрабатывать в почти реальном времени. Один из подходов - просто запланировать периодический экспорт, используя [функциональность запланированных запросов BigQuery](https://cloud.google.com/bigquery/docs/scheduling-queries). Если вы можете принять некоторое задержку в данных, вставляемых в ClickHouse, этот подход просто реализовать и поддерживать. Пример приведён в [этом блоге](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries).
## Проектирование схем {#designing-schemas}

Набор данных Stack Overflow содержит несколько связанных таблиц. Мы рекомендуем сначала сосредоточиться на миграции основной таблицы. Это может быть не обязательно самая большая таблица, а скорее та, по которой вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse. Эта таблица может потребоваться модифицировать по мере добавления других таблиц для полного использования возможностей ClickHouse и получения оптимальной производительности. Мы изучаем этот процесс моделирования в нашей [документации по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

Соблюдая этот принцип, мы сосредоточимся на основной таблице `posts`. Схема BigQuery для этого показана ниже:

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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить эту таблицу с помощью простого [`INSERT INTO SELECT`](/sql-reference/statements/insert-into), считывая экспортированные данные из gcs, используя [`gcs` функцию таблицы](/sql-reference/table-functions/gcs). Обратите внимание, что в ClickHouse Cloud вы также можете использовать совместимую с gcs [`s3Cluster` функцию таблицы](/sql-reference/table-functions/s3Cluster) для параллелизации загрузки по нескольким узлам:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

Мы не сохраняем никаких null в нашей новой схеме. Вышеуказанный insert неявно преобразует их в значения по умолчанию для своих соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения в целевую точность.
## Каковы отличия первичных ключей ClickHouse? {#how-are-clickhouse-primary-keys-different}

Как описано [здесь](/migrations/bigquery), так же как и в BigQuery, ClickHouse не обеспечивает уникальность значений колонок первичного ключа таблицы.

Похожим образом кластеризации в BigQuery, данные таблицы ClickHouse хранятся на диске в порядке, установленном колонками первичного ключа. Этот порядок сортировки используется оптимизатором запросов для предотвращения повторной сортировки, минимизации использования памяти для соединений и включения краткосрочной обработки для клаузул LIMIT. 
В отличие от BigQuery, ClickHouse автоматически создает [с (разреженным) первичным индексом](/guides/best-practices/sparse-primary-indexes) на основе значений колонок первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по колонкам первичного ключа. В частности:

- Эффективность использования памяти и диска имеют первостепенное значение для масштаба, на котором ClickHouse часто используется. Данные записываются в таблицы ClickHouse партиями, известными как parts, с установленными правилами для слияния этих частей в фоне. В ClickHouse у каждой части есть свой первичный индекс. Когда части сливаются, индексы первичных ключей объединённых частей также сливаются. Обратите внимание, что эти индексы не создаются для каждой строки. Вместо этого первичный индекс для части имеет одну запись индекса на группу строк - эта техника называется разреженной индексацией.
- Разреженная индексация возможна из-за того, что ClickHouse хранит строки для части на диске в порядке, установленном определённым ключом. Вместо того чтобы непосредственно находить отдельные строки (например, индекс, основанный на B-дереве), разреженный первичный индекс позволяет быстро (через бинарный поиск по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально подходящих строк затем, параллельно, потока в движок ClickHouse для нахождения совпадений. Этот дизайн индекса позволяет первичному индексу быть маленьким (он полностью вмещается в основную память), при этом значительно ускоряет время выполнения запросов, особенно для диапазонных запросов, которые типичны для случаев использования аналитики данных. Для получения дополнительных сведений мы рекомендуем [это углубленное руководство](/guides/best-practices/sparse-primary-indexes).

<br />

<img src={bigquery_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Выбранный первичный ключ в ClickHouse определит не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого он может существенно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Ключа порядка, который вызывает запись значений большинства колонок в последовательном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все колонки в таблице будут отсортированы на основе значения указанного ключа порядка, независимо от того, включены ли они в сам ключ. Например, если `CreationDate` используется в качестве ключа, порядок значений во всех остальных колонках будет соответствовать порядку значений в колонке `CreationDate`. Можно указать несколько ключей порядка - они будут сортированы с той же семантикой, что и клаузула `ORDER BY` в запросе `SELECT`.
### Выбор ключа порядка {#choosing-an-ordering-key}

Для рассмотрений и шагов по выбору ключа порядка, используя таблицу постов в качестве примера, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
## Техники моделирования данных {#data-modeling-techniques}

Мы рекомендуем пользователям, мигрирующим из BigQuery, ознакомиться с [руководством по моделированию данных в ClickHouse](/data-modeling/schema-design). Это руководство использует тот же набор данных Stack Overflow и исследует несколько подходов с использованием возможностей ClickHouse.
### Партиции {#partitions}

Пользователи BigQuery будут знакомы с концепцией партиционирования таблиц для повышения производительности и управляемости для крупных баз данных за счет разделения таблиц на меньшие, более управляемые части, называемые партициями. Это партиционирование может быть достигнуто с использованием либо диапазона по указанной колонке (например, даты), определенных списков либо хеширования по ключу. Это позволяет администраторам организовывать данные на основе определенных критериев, таких как диапазоны дат или географические положения.

Партиционирование помогает улучшить производительность запросов, позволяя более быстрый доступ к данным через обрезку партиций и более эффективную индексацию. Оно также помогает в задачах обслуживания, таких как резервное копирование и очистка данных, позволяя выполнять операции на отдельных партициях, а не на всей таблице. Кроме того, партиционирование может значительно улучшить масштабируемость баз данных BigQuery за счет распределения нагрузки между несколькими партициями.

В ClickHouse партиционирование указывается на таблице, когда она первоначально определяется с помощью клаузулы [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key). Эта клаузула может содержать SQL-выражение по любым колонкам, результаты которого определяют, в какую партицию направляется строка.

<br />

<img src={bigquery_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Данные части логически ассоциируются с каждой партицией на диске и могут быть запрошены в изоляции. В следующем примере мы партиционируем таблицу постов по годам с использованием выражения [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear). По мере вставки строк в ClickHouse это выражение будет оцениваться относительно каждой строки, и строки будут направлены в соответствующую партицию в виде новых частей данных, принадлежащих этой партиции.

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

Партиционирование в ClickHouse имеет аналогичные применения, как и в BigQuery, но с некоторыми тонкими отличиями. В частности:

- **Управление данными** - В ClickHouse пользователи должны прежде всего считать партиционирование функцией управления данными, а не техникой оптимизации запросов. Разделяя данные логически на основе ключа, каждую партицию можно обрабатывать независимо, например, удалять. Это позволяет пользователям перемещать партиции, а следовательно, подмножества, между [уровнями хранения](/integrations/s3#storage-tiers) эффективно со временем или [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition). Например, ниже мы удаляем посты с 2008 года:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 rows in set. Elapsed: 0.002 sec.
	
	ALTER TABLE posts
	(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **Оптимизация запросов** - Хотя партиции могут помочь с производительностью запросов, это сильно зависит от схем доступа. Если запросы нацелены только на несколько партиций (желательно одну), производительность может потенциально улучшиться. Это обычно полезно, если ключ партиционирования не находится в первичном ключе, и вы фильтруете по нему. Тем не менее, запросы, которым необходимо охватить много партиций, могут работать хуже, чем если бы не использовалось партиционирование (поскольку в результате партиционирования может быть больше частей). Преимущества нацеливания на одну партицию будут также менее выражены или вовсе отсутствовать, если ключ партиционирования уже является ранним элементом в первичном ключе. Партиционирование также можно использовать для [оптимизации запросов `GROUP BY`](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако, в общем, пользователи должны убедиться, что первичный ключ оптимизирован и рассмотреть партиционирование как технику оптимизации запросов только в исключительных случаях, когда схемы обращения обращаются к определённому предсказуемому подмножеству дня, например, партиционирование по дням, в то время как большинство запросов в последний день.
#### Рекомендации {#recommendations}

Пользователи должны рассматривать партиционирование как технику управления данными. Оно идеально подходит, когда данные нуждаются в истечении из кластера при работе с временными рядами, например, самая старая партиция может [просто быть удалена](/sql-reference/statements/alter/partition#drop-partitionpart). 

Важно: Убедитесь, что ваше выражение ключа партиционирования не приводит к высокой кардинальности, т.е. создание более 100 партиций следует избегать. Например, не партиционируйте ваши данные по колонкам высокой кардинальности, таким как идентификаторы клиентов или имена. Вместо этого сделайте идентификатор клиента или имя первой колонкой в выражении `ORDER BY`. 

> Внутри ClickHouse [создаются части](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) для вставленных данных. По мере вставки больше данных количество частей увеличивается. Чтобы предотвратить чрезмерно высокое количество частей, что ухудшает производительность запросов (поскольку читается больше файлов), части объединяются в фоне асинхронном процессе. Если количество частей превышает [преднастроенный лимит](/operations/settings/merge-tree-settings#parts-to-throw-insert), ClickHouse выдаст исключение при вставке, как ошибка ["слишком много частей"](/knowledgebase/exception-too-many-parts). Это не должно происходить в нормальной эксплуатации и происходит только в случае неправильной настройки ClickHouse или неправильного использования, например, множество мелких вставок. Так как части создаются для каждой партиции в изоляции, увеличение числа партиций приводит к увеличению количества частей, т.е. это кратное количество партиций. Ключи партиционирования с высокой кардинальностью могут, таким образом, вызвать эту ошибку, и их следует избегать.
## Материализованные представления против проекций {#materialized-views-vs-projections}

Концепция проекций ClickHouse позволяет пользователям указывать несколько клаузул `ORDER BY` для таблицы.

В [моделировании данных ClickHouse](/data-modeling/schema-design) мы исследуем, как могут использоваться материализованные представления в ClickHouse для предварительного вычисления агрегатов, преобразования строк и оптимизации запросов для различных схем доступа. Для последнего мы [привели пример](/materialized-view/incremental-materialized-view#lookup-table), где материализованное представление отправляет строки в целевую таблицу с другим ключом порядка, чем исходная таблица, принимающая вставки.

Например, рассмотрим следующий запрос:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182  │
   └────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

Этот запрос требует сканирования всех 90 миллионов строк (признаемся, быстро), так как `UserId` не является ключом порядка. Ранее мы решили эту задачу с помощью материализованного представления, действующего как поиск для `PostId`. Ту же проблему можно решить с помощью проекции. Команда ниже добавляет проекцию для `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Обратите внимание, что сначала мы должны создать проекцию, а затем материализовать её. Эта последняя команда приводит к тому, что данные хранятся дважды на диске в двух различных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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

Если проекция создаётся через команду `ALTER`, создание происходит асинхронно, когда команда `MATERIALIZE PROJECTION` выдается. Пользователи могут подтвердить ход этой операции с помощью следующего запроса, ожидая, что `is_done=1`.

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │       	1 │   	0 │                	│
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Если мы повторим вышеуказанный запрос, мы увидим, что производительность значительно улучшилась за счёт увеличения объёма хранения.

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

С помощью команды [`EXPLAIN`](/sql-reference/statements/explain) мы также подтверждаем, что для этого запроса использовалась проекция:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

	┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))     	│
 2. │   Aggregating                                   	│
 3. │ 	Filter                                      	│
 4. │   	ReadFromMergeTree (comments_user_id)      	│
 5. │   	Indexes:                                  	│
 6. │     	PrimaryKey                              	│
 7. │       	Keys:                                 	│
 8. │         	UserId                              	│
 9. │       	Condition: (UserId in [8592047, 8592047]) │
10. │       	Parts: 2/2                            	│
11. │       	Granules: 2/11360                     	│
	└─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```
### Когда использовать проекции {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, так как они автоматически поддерживаются по мере вставки данных. Кроме того, запросы можно просто отправить в одну таблицу, где проекции используются, когда это возможно, для ускорения времени отклика.

<br />

<img src={bigquery_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Это в отличие от материализованных представлений, где пользователю необходимо выбрать соответствующую оптимизированную целевую таблицу или переписать свой запрос в зависимости от фильтров. Это создает большую нагрузку на клиентскую сторону и увеличивает её сложность.

Несмотря на эти преимущества, проекции имеют некоторые свои ограничения, о которых пользователи должны быть осведомлены и, следовательно, должны развертываться с осторожностью:

- Проекции не позволяют использовать разные TTL для исходной таблицы и (скрытой) целевой таблицы. Материализованные представления позволяют использовать разные TTL.
- Проекции [в настоящее время не поддерживают `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) для (скрытой) целевой таблицы.
- Лёгкие обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления могут быть соединены: целевая таблица одного материализованного представления может быть исходной таблицей другого материализованного представления и так далее. Это невозможно с проекциями.
- Проекции не поддерживают соединения; материализованные представления поддерживают.
- Проекции не поддерживают фильтры (клаузу `WHERE`); материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Необходимо полное переупорядочение данных. Хотя выражение в проекции может, теоретически, использовать `GROUP BY`, более эффективно использовать материализованные представления для поддержания агрегатов. Оптимизатор запросов также с большей вероятностью использует проекции, которые используют простое переупорядочение, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество колонок в этом выражении, чтобы уменьшить объем хранения.
- Пользователи комфортны с ассоциированным увеличением объема хранения и накладными расходами на запись данных дважды. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).
## Переписывание запросов BigQuery в ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

Ниже приведены примерные запросы, сравнивающие BigQuery с ClickHouse. Этот список призван продемонстрировать, как можно использовать функции ClickHouse для значительного упрощения запросов. Примеры здесь используют полный набор данных Stack Overflow (до апреля 2024 года).

**Пользователи (с более чем 10 вопросами), которые получают наибольшее количество просмотров:**

_BigQuery_

<img src={bigquery_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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

**Какие тэги получают наибольшее количество просмотров:**

_BigQuery_

<br />

<img src={bigquery_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '400px'}} />

<br />

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
## Аггрегатные функции {#aggregate-functions}

Где это возможно, пользователи должны использовать агрегатные функции ClickHouse. Ниже мы показываем использование [`argMax` функции](/sql-reference/aggregate-functions/reference/argmax) для вычисления самого просматриваемого вопроса каждого года.

_BigQuery_

<br />

<img src={bigquery_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

<img src={bigquery_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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

…

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
## Условные операторы и массивы {#conditionals-and-arrays}

Функции условий и массивов значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождений) с наибольшим процентным увеличением с 2022 по 2023 год. Обратите внимание, как следующий запрос ClickHouse лаконичен благодаря условиям, функциям массивов и возможности повторного использования псевдонимов в предложениях `HAVING` и `SELECT`.

_BigQuery_

<br />

<img src={bigquery_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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
│ next.js   │   13788 │     10520 │   31.06463878326996 │
│ spring-boot │     16573 │     17721 │  -6.478189718413183 │
│ .net      │   11458 │     12968 │ -11.644046884639112 │
│ azure     │   11996 │     14049 │ -14.613139725247349 │
│ docker    │   13885 │     16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 строк в наборе. Затрачено: 0.096 сек. Обработано 5.08 миллионов строк, 155.73 МБ (53.10 миллионов строк/с., 1.63 ГБ/с.)
Пиковое использование памяти: 410.37 MiB.
```

Это завершает наше базовое руководство для пользователей, переходящих с BigQuery на ClickHouse. Мы рекомендуем пользователям, переходящим с BigQuery, прочитать руководство по [моделированию данных в ClickHouse](/data-modeling/schema-design), чтобы узнать больше о расширенных возможностях ClickHouse.
