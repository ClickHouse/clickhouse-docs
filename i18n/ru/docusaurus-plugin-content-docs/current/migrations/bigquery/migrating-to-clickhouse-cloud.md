---
title: 'Миграция с BigQuery на ClickHouse Cloud'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'Как мигрировать данные из BigQuery в ClickHouse Cloud'
keywords: ['мигрировать', 'миграция', 'перенос', 'данные', 'etl', 'elt', 'BigQuery']
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

TLDR: Потому что ClickHouse быстрее, дешевле и мощнее, чем BigQuery для современных задач аналитики данных:

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>
## Загрузка данных из BigQuery в ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}
### Набор данных {#dataset}

В качестве примера набора данных, чтобы показать типичную миграцию из BigQuery в ClickHouse Cloud, мы используем набор данных Stack Overflow, задокументированный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит все `post`, `vote`, `user`, `comment` и `badge`, которые произошли на Stack Overflow с 2008 по апрель 2024 года. Схема BigQuery для этих данных показана ниже:

<Image img={bigquery_3} size="lg" alt="Schema"/>

Для пользователей, которые хотят загрузить этот набор данных в экземпляр BigQuery для тестирования миграционных шагов, мы предоставили данные для этих таблиц в формате Parquet в GCS bucket, а команды DDL для создания и загрузки таблиц в BigQuery доступны [здесь](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==).
### Миграция данных {#migrating-data}

Миграция данных между BigQuery и ClickHouse Cloud делится на два основных типа рабочих нагрузок:

- **Начальная массовая загрузка с периодическими обновлениями** - Начальный набор данных должен быть мигрирован вместе с периодическими обновлениями через установленные интервалы, например, ежедневно. Обновления здесь обрабатываются повторной отправкой строк, которые изменились, - идентифицированных либо по столбцу, который может быть использован для сравнения (например, дата). Удаления обрабатываются полной периодической перезагрузкой набора данных.
- **Реальное время репликации или CDC** - Начальный набор данных должен быть мигрирован. Изменения в этом наборе данных должны отражаться в ClickHouse в почти реальном времени с допустимой задержкой в несколько секунд. Это по сути [процесс захвата изменений данных (CDC)](https://en.wikipedia.org/wiki/Change_data_capture), когда таблицы в BigQuery должны быть синхронизированы с ClickHouse, т.е. вставки, обновления и удаления в таблице BigQuery должны применяться к эквивалентной таблице в ClickHouse.
#### Массовая загрузка через Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery поддерживает экспорт данных в объектное хранилище Google (GCS). Для нашего примерного набора данных:

1. Экспортируйте 7 таблиц в GCS. Команды для этого доступны [здесь](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==).

2. Импортируйте данные в ClickHouse Cloud. Для этого мы можем использовать [табличную функцию gcs](/sql-reference/table-functions/gcs). Команды DDL и запросы на импорт доступны [здесь](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==). Обратите внимание, что поскольку экземпляр ClickHouse Cloud состоит из нескольких вычислительных узлов, вместо табличной функции `gcs` мы используем [табличную функцию s3Cluster](/sql-reference/table-functions/s3Cluster). Эта функция также работает с gcs bucket и [использует все узлы сервиса ClickHouse Cloud](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) для параллельной загрузки данных.

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

Этот подход имеет ряд преимуществ:

- Функциональность экспорта BigQuery поддерживает фильтрацию для экспорта подмножества данных.
- BigQuery поддерживает экспорт в [форматы Parquet, Avro, JSON и CSV](https://cloud.google.com/bigquery/docs/exporting-data) и несколько [типов сжатия](https://cloud.google.com/bigquery/docs/exporting-data), все из которых поддерживаются ClickHouse.
- GCS поддерживает [управление жизненным циклом объектов](https://cloud.google.com/storage/docs/lifecycle), что позволяет удалять данные, которые были экспортированы и импортированы в ClickHouse, после заданного периода.
- [Google позволяет экспортировать до 50 ТБ в день в GCS бесплатно](https://cloud.google.com/bigquery/quotas#export_jobs). Пользователи платят только за хранение в GCS.
- Экспорт автоматически создает несколько файлов, ограничивая каждый максимум до 1 ГБ данных таблицы. Это выгодно для ClickHouse, так как позволяет параллелизировать импорты.

Перед выполнением следующих примеров мы рекомендуем пользователям изучить [необходимые разрешения для экспорта](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) и [рекомендации по локализации](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) для максимизации производительности экспорта и импорта.
### Репликация в реальном времени или CDC через запланированные запросы {#real-time-replication-or-cdc-via-scheduled-queries}

Захват изменений данных (CDC) - это процесс, при котором таблицы сохраняются в синхронизации между двумя базами данных. Это значительно сложнее, если обновления и удаления должны обрабатываться в почти реальном времени. Один из подходов - просто планировать периодический экспорт с использованием [функциональности запланированных запросов BigQuery](https://cloud.google.com/bigquery/docs/scheduling-queries). Если вы готовы принять некоторую задержку в вставке данных в ClickHouse, этот подход легко реализуется и поддерживается. Пример приведен в [этом блоге](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries).
## Проектирование схем {#designing-schemas}

Набор данных Stack Overflow содержит несколько связанных таблиц. Мы рекомендуем сосредоточиться на миграции основной таблицы сначала. Это может быть не обязательно самая большая таблица, но та, по которой вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse. Эта таблица может потребовать изменения структуры по мере добавления дополнительных таблиц, чтобы полностью использовать возможности ClickHouse и получить оптимальную производительность. Этот процесс моделирования обсуждается в нашей [документации по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

Следуя этому принципу, мы сосредотачиваемся на основной таблице `posts`. Схема BigQuery для нее показана ниже:

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
COMMENT 'Optimized types'
```

Мы можем заполнить эту таблицу с помощью простого [`INSERT INTO SELECT`](/sql-reference/statements/insert-into), читая экспортированные данные из gcs с использованием [табличной функции `gcs`](/sql-reference/table-functions/gcs). Обратите внимание, что в ClickHouse Cloud вы также можете использовать совместимую с gcs [табличную функцию `s3Cluster`](/sql-reference/table-functions/s3Cluster) для параллельной загрузки на нескольких узлах:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

Мы не сохраняем пустые значения в нашей новой схеме. Вставка выше неявно преобразует их в значения по умолчанию для соответствующих типов - 0 для целых, и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые данные в их целевую точность.
## Чем отличаются первичные ключи ClickHouse? {#how-are-clickhouse-primary-keys-different}

Как описано [здесь](/migrations/bigquery), как и в BigQuery, ClickHouse не обеспечивает уникальность значений столбцов первичного ключа таблицы.

Аналогично кластеризации в BigQuery, данные таблицы ClickHouse хранятся на диске, отсортированными по столбцу(ам) первичного ключа. Этот порядок сортировки используется оптимизатором запросов для предотвращения пересортировки, минимизации использования памяти для соединений и включения короткого замыкания для пределов.

В отличие от BigQuery, ClickHouse автоматически создает [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes), основанный на значениях столбца первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по первичным ключам. В частности:

- Эффективность памяти и использования диска имеет первостепенное значение для масштаба, на котором часто используется ClickHouse. Данные записываются в таблицы ClickHouse большими частями, известными как части, с применением правил объединения частей в фоне. В ClickHouse каждая часть имеет свой первичный индекс. Когда части объединяются, соответственно, объединяются и их первичные индексы. Примечательно, что эти индексы не строятся для каждой строки. Вместо этого первичный индекс для части имеет одну запись на группу строк - эта техника называется разреженным индексированием.
- Разреженное индексирование возможно, потому что ClickHouse хранит строки части на диске в порядке, определённом указанным ключом. Вместо того чтобы прямо находить отдельные строки (как индекс, основанный на B-дереве), разреженный первичный индекс позволяет быстро (через двоичный поиск по записям индекса) идентифицировать группы строк, которые могут потенциально результатировать в совпадении с запросом. Найденные группы потенциально совпадающих строк затем, параллельно, передаются в движок ClickHouse для поиска совпадений. Эта конструкция индекса позволяет сделать первичный индекс компактным (полностью умещающимся в основной памяти), при этом значительно ускоряя выполнение запросов, особенно для диапазонов запросов, типичных для использования в аналитике данных. Для более детальной информации мы рекомендуем [это подробное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

Выбранный первичный ключ в ClickHouse определит не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого он может резко повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Порядковый ключ, который заставляет значения большинства столбцов быть записанными в смежном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжать данные.

> Все данные в таблице будут отсортированы на основе значения заданного порядкового ключа, независимо от того, включены ли они в сам ключ. Например, если `CreationDate` используется в качестве ключа, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько порядковых ключей - эти ключи упорядочат данные по тем же принципам, что и конструкция `ORDER BY` в запросе `SELECT`.
### Выбор порядкового ключа {#choosing-an-ordering-key}

Для рассмотрений и шагов при выборе порядкового ключа, используя таблицу постов в качестве примера, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
## Техники моделирования данных {#data-modeling-techniques}

Мы рекомендуем пользователям, мигрирующим из BigQuery, ознакомиться с [руководством по моделированию данных в ClickHouse](/data-modeling/schema-design). В этом руководстве используется тот же набор данных Stack Overflow и изучается множество подходов с использованием функций ClickHouse.
### Разделы {#partitions}

Пользователи BigQuery знакомы с концепцией разделения таблиц для повышения производительности и управляемости большими базами данных, разделяя таблицы на более мелкие, более управляемые части, называемые разделами. Такое разделение может быть достигнуто с использованием либо диапазона по определённому столбцу (например, дате), определенных списков или посредством хеша по ключу. Это позволяет администраторам организовать данные на основе конкретных критериев, таких как диапазоны дат или географические расположения.

Разделение помогает улучшить производительность запросов, обеспечивая более быстрый доступ к данным через отсечение разделов и более эффективное индексирование. Оно также упрощает задачи обслуживания, такие как резервное копирование и очистка данных, позволяя выполнять операции на отдельных разделах, а не на всей таблице. Кроме того, разделение может значительно увеличить масштабируемость баз данных BigQuery, распределяя нагрузку по нескольким разделам.

В ClickHouse разделение указывается для таблицы при её первоначальном определении через [ключевое слово `PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key). Это ключевое слово может содержать SQL-выражение на любом(ых) столбце(ах), результаты которого определят, в какой раздел будет отправлена строка.

<Image img={bigquery_6} size="md" alt="Partitions"/>

Части данных логически ассоциируются с каждым разделом на диске и могут быть запрошены отдельно. В приведенном ниже примере мы разбиваем таблицу постов по годам, используя выражение [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear). По мере вставки строк в ClickHouse, это выражение будет оцениваться для каждой строки, а строки будут направляться в полученный раздел в форме новых частей данных, принадлежащих этому разделу.

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
#### Приложения {#applications}

Разделение в ClickHouse имеет схожие приложения, как и в BigQuery, но с некоторыми тонкими отличиями. Более конкретно:

- **Управление данными** - В ClickHouse пользователи должны рассматривать разделение как функцию управления данными, а не как технику оптимизации запросов. Разделяя данные логически на основе ключа, каждый раздел может быть обработан независимо, например, удалён. Это позволяет пользователям перемещать разделы, а следовательно, подмножества, между [уровнями хранения](/integrations/s3#storage-tiers) эффективно по времени или [удалять данные/удалять из кластера](/sql-reference/statements/alter/partition). Например, ниже мы удаляем посты с 2008 года:

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

- **Оптимизация запросов** - Хотя разделы могут помочь с производительностью запросов, это зависит в значительной степени от образцов доступа. Если запросы нацелены только на несколько разделов (в идеале один), производительность может быть потенциально улучшена. Это полезно только в том случае, если ключ разбиения не находится в первичном ключе и вы фильтруете по нему. Однако запросы, которые должны покрывать много разделов, могут производить хуже, чем если бы разделение не использовалось (так как может быть больше частей, как результат разделения). Преимущество нацеливания на единственный раздел будет еще менее выраженным до несуществования, если ключ разбиения уже является ранней записью в первичном ключе. Разделение также может использоваться для [оптимизации `GROUP BY` запросов](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждом разделе уникальны. Однако в общем, пользователи должны обеспечивать, чтобы первичный ключ был оптимизирован и только рассматривать разбиение как технику оптимизации запросов в исключительных случаях, когда образцы доступа охватывают конкретное предсказуемое подмножество дня, например, разбиение по дню, с большинством запросов в последний день.
#### Рекомендации {#recommendations}

Пользователи должны рассматривать разбиение как технику управления данными. Это идеально подходит, когда данные нужно удалять из кластера при работе с данными временных рядов, например, самый старый раздел можно [просто удалить](/sql-reference/statements/alter/partition#drop-partitionpart).

Важно: Убедитесь, что ваше выражение для ключа разбиения не приводит к созданию множества с высокой кардинальностью, i.e. создание более чем 100 разделов следует избегать. Например, не разбивайте свои данные по столбцам с высокой кардинальностью, таким как идентификаторы клиентов или имена. Вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении `ORDER BY`.

> Внутренне ClickHouse [создаёт части](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) для вставленных данных. По мере вставки данных количество частей увеличивается. Чтобы предотвратить чрезмерно большое количество частей, что ухудшит производительность запросов (поскольку больше файлов для чтения), части объединяются в фоновом асинхронном процессе. Если количество частей превышает [предконфигурированный лимит](/operations/settings/merge-tree-settings#parts-to-throw-insert), тогда ClickHouse выбросит исключение при вставке как ["слишком много частей" ошибка](/knowledgebase/exception-too-many-parts). Это не должно происходить при нормальной работе и происходит только если ClickHouse неправильно настроен или используется неправильно, например, много маленьких вставок. Поскольку части создаются для каждого раздела изолированно, увеличение числа разделов вызывает увеличение количества частей, i.e. это множитель числа разделов. Высокая кардинальность ключей разбиения, следовательно, может вызвать эту ошибку и следует избегать.
## Материализованные представления против проекций {#materialized-views-vs-projections}

Концепция проекций в ClickHouse позволяет пользователям указывать несколько `ORDER BY` предложений для таблицы.

В [моделировании данных ClickHouse](/data-modeling/schema-design) мы исследуем, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов для различных способов доступа. В последнем случае мы [предложили пример](/materialized-view/incremental-materialized-view#lookup-table), где материализованное представление отправляет строки в целевую таблицу с другим порядковым ключом, чем у оригинальной таблицы, принимающей вставки.

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

Этот запрос требует сканирования всех 90 миллионов строк (примечательно, что быстро), так как `UserId` не является порядковым ключом. Ранее мы решали эту проблему с помощью материализованного представления, действующего как поиск для `PostId`. Та же проблема может быть решена с помощью проекции. Команда ниже добавляет проекцию для `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Обратите внимание, что мы сначала должны создать проекцию, а затем материализовать её. Эта последняя команда приводит к тому, что данные хранятся дважды на диске в двух разных порядках. Проекция также может быть определена при создании данных, как показано ниже, и будет автоматически поддерживаться по мере вставки данных.

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

Если проекция создается через команду `ALTER`, создание асинхронно при выдаче команды `MATERIALIZE PROJECTION`. Пользователи могут подтвердить прогресс этой операции с помощью следующего запроса, ожидая `is_done=1`.

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

Если повторить вышеуказанный запрос, мы можем увидеть, что производительность значительно улучшилась за счёт дополнительного хранения.

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

С помощью команды [`EXPLAIN`](/sql-reference/statements/explain), мы также подтверждаем, что проекция была использована для выполнения этого запроса:

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

Проекции обеспечивают своё привлекательное преимущество для новых пользователей, так как они автоматически поддерживаются по мере поступления данных. Кроме того, запросы могут просто отправляться на одну таблицу, где проекции используются по возможности для ускорения времени ответа.

<Image img={bigquery_7} size="md" alt="Projections"/>

Это контрастирует с материализованными представлениями, где пользователь должен выбрать соответствующую оптимизированную целевую таблицу или переписать свой запрос в зависимости от применяемых фильтров. Это увеличивает акцент на пользовательские приложения и добавляет сложность на стороне клиента.

Несмотря на эти преимущества, проекции имеют некоторые присущие ограничения, о которых пользователи должны быть в курсе и, следовательно, должны применяться умеренно:

- Проекции не позволяют использовать разные TTL для исходной таблицы и (скрытой) целевой таблицы. Материализованные представления допускают разные TTL.
- Проекции [в настоящее время не поддерживают `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) для (скрытой) целевой таблицы.
- Легковесные обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления могут быть объединены в цепочку: целевая таблица одного материализованного представления может быть исходной таблицей для другого материализованного представления и так далее. Это не возможно с проекциями.
- Проекции не поддерживают соединения; материализованные представления поддерживают.
- Проекции не поддерживают фильтры (`WHERE` условие); материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полное переупорядочивание данных. Хотя выражение в проекции может, теоретически, использовать `GROUP BY,` материализованные представления более эффективно подходят для поддержания агрегаций. Оптимизатор запросов также с большей вероятностью использует проекции, которые используют простое переупорядочивание, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество столбцов в этом выражении, чтобы уменьшить занимаемое хранилище.
- Пользователи готовы принять с этим связаное увеличение занимаемого хранилища и затраты на запись данных дважды. Проведите тесты влияния на скорость вставки и [оцените перерасход хранилища](/data-compression/compression-in-clickhouse).
## Переписывание запросов BigQuery в ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

Ниже приводятся примеры запросов, сравнивающих BigQuery с ClickHouse. Этот список имеет целью показать, как использовать возможности ClickHouse для значительного упрощения запросов. Примеры здесь используют полный набор данных Stack Overflow (до апреля 2024 года).

**Пользователи (с более чем 10 вопросами), которые получают наибольшее количество просмотров:**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Rewriting BigQuery queries" border/>

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

По возможности, пользователи должны использовать агрегатные функции ClickHouse. Ниже мы показываем использование функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax) для вычисления наиболее просматриваемого вопроса каждого года.

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Aggregate functions 1"/>

<Image img={bigquery_11} border size="sm" alt="Aggregate functions 2"/>

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
## Условные операторы и массивы {#conditionals-and-arrays}

Условные и массивные функции значительно упрощают запросы. Следующий запрос вычисляет теги (с более чем 10000 вхождений), которые показали наибольший процентный рост с 2022 по 2023 год. Обратите внимание, насколько лаконичен следующий запрос ClickHouse благодаря условным операторам, массивным функциям и возможности повторного использования алиасов в условиях `HAVING` и `SELECT`.

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Conditionals and Arrays"/>

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

5 строк в наборе. Прошло: 0.096 сек. Обработано 5.08 миллионов строк, 155.73 МБ (53.10 миллионов строк/сек., 1.63 ГБ/сек.)
Пиковое использование памяти: 410.37 МиБ.
```

Это завершает наше базовое руководство для пользователей, мигрирующих с BigQuery на ClickHouse. Мы рекомендуем пользователям, мигрирующим с BigQuery, ознакомиться с руководством по [моделированию данных в ClickHouse](/data-modeling/schema-design) для изучения более продвинутых функций ClickHouse.
