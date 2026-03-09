---
title: 'Прямые запросы к открытым табличным форматам'
sidebar_label: 'Прямые запросы'
slug: /use-cases/data-lake/getting-started/querying-directly
sidebar_position: 1
pagination_prev: use-cases/data_lake/getting-started
pagination_next: use-cases/data_lake/guides/connecting-catalogs
description: 'Используйте табличные функции ClickHouse для чтения таблиц Iceberg, Delta Lake, Hudi и Paimon в объектном хранилище без какой-либо предварительной настройки.'
toc_max_heading_level: 2
keywords: ['озера данных', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'табличные функции']
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouse предоставляет табличные функции для выполнения запросов к данным, хранящимся в открытых табличных форматах, напрямую в объектном хранилище. Для этого не нужно подключаться к внешнему каталогу — запросы выполняются к данным по месту хранения, подобно тому, как AWS Athena читает данные из S3.

Путь к хранилищу и учётные данные передаются прямо в вызове функции, а ClickHouse берёт на себя всё остальное. Доступны весь синтаксис SQL ClickHouse и все функции, а запросы выигрывают от параллельного выполнения ClickHouse и [эффективного встроенного средства чтения Parquet](/blog/clickhouse-and-parquet-a-foundation-for-fast-lakehouse-analytics).

:::note Сервер, clickhouse-local или chDB
Шаги в этом руководстве можно выполнить с помощью существующей установки сервера ClickHouse. Для разовых запросов вместо этого можно использовать [clickhouse-local](/operations/utilities/clickhouse-local) и выполнить тот же рабочий процесс без запуска сервера. С небольшими изменениями этот процесс также можно выполнить с помощью встраиваемого дистрибутива ClickHouse — [chDB](/chdb).
:::

В следующих примерах используется набор данных [hits](/getting-started/example-datasets/star-schema), сохранённый в каждом формате lakehouse в S3. Для каждого lakehouse-формата предусмотрены отдельные функции для каждого провайдера объектного хранилища.

<Tabs groupId="lake-format">
  <TabItem value="Iceberg" label="Apache Iceberg" default>
    Табличная функция [`iceberg`](/sql-reference/table-functions/iceberg) (псевдоним для `icebergS3`) читает таблицы Iceberg непосредственно из объектного хранилища. Для каждого бэкенда хранилища предусмотрен отдельный вариант: `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`.

    **Пример синтаксиса:**

    ```sql
    icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    icebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note Поддержка GCS
    Вариант функций S3 можно использовать для Google Cloud Storage (GCS).
    :::

    **Пример:**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.375 sec. Processed 100.00 million rows, 9.98 GB (29.63 million rows/s., 2.96 GB/s.)
    Peak memory usage: 10.48 GiB.
    ```

    ### Кластерный вариант \{#iceberg-cluster-variant\}

    Функция [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster) распределяет операции чтения между несколькими узлами кластера ClickHouse. Узел-инициатор устанавливает соединения со всеми узлами и динамически распределяет файлы данных между ними. Каждый рабочий узел запрашивает и обрабатывает задачи до тех пор, пока не будут прочитаны все файлы. `icebergCluster` — псевдоним для `icebergS3Cluster`. Также существуют варианты для Azure ([`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster)) и HDFS ([`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)).

    **Пример синтаксиса:**

    ```sql
    icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
    -- icebergCluster is an alias for icebergS3Cluster

    icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    **Пример (ClickHouse Cloud):**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3Cluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/'
    )
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### Движок таблицы \{#iceberg-table-engine\}

    В качестве альтернативы использованию табличной функции в каждом запросе можно создать постоянную таблицу с помощью [движка таблиц `Iceberg`](/engines/table-engines/integrations/iceberg). Данные по-прежнему хранятся в объектном хранилище и считываются по требованию — никакие данные не копируются в ClickHouse. Преимущество заключается в том, что определение таблицы хранится в ClickHouse и доступно всем пользователям и сессиям без необходимости указывать путь к хранилищу и учётные данные для каждого пользователя. Для каждого бэкенда хранилища существуют варианты движка: `IcebergS3` (или псевдоним `Iceberg`), `IcebergAzure`, `IcebergHDFS` и `IcebergLocal`.

    Как движок таблиц, так и табличная функция поддерживают [кэширование данных](/engines/table-engines/integrations/iceberg#data-cache), используя тот же механизм кэширования, что и движки хранилищ S3, AzureBlobStorage и HDFS. Кроме того, [кэш метаданных](/engines/table-engines/integrations/iceberg#metadata-cache) хранит информацию о файлах манифеста в памяти, сокращая количество повторных обращений к метаданным Iceberg. Этот кэш включён по умолчанию с помощью настройки `use_iceberg_metadata_files_cache`.

    **Пример синтаксиса:**

    Движок таблиц `Iceberg` является псевдонимом `IcebergS3`.

    ```sql
    CREATE TABLE iceberg_table
        ENGINE = IcebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    CREATE TABLE iceberg_table
        ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

    CREATE TABLE iceberg_table
        ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note Поддержка GCS
    Вариант табличного движка S3 можно использовать для Google Cloud Storage (GCS).
    :::

    **Пример:**

    ```sql
    CREATE TABLE hits_iceberg
        ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')

    SELECT
        url,
        count() AS cnt
    FROM hits_iceberg
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 2.737 sec. Processed 100.00 million rows, 9.98 GB (36.53 million rows/s., 3.64 GB/s.)
    Peak memory usage: 10.53 GiB.
    ```

    Список поддерживаемых функций, включая отсечение партиций, эволюцию схемы, перемещение во времени, кэширование и другое, см. в [матрице поддержки](/use-cases/data-lake/support-matrix#format-support). Полную справочную информацию см. в документации по [табличной функции `iceberg`](/sql-reference/table-functions/iceberg) и [движку таблиц `Iceberg`](/engines/table-engines/integrations/iceberg).
  </TabItem>

  <TabItem value="дельта" label="Delta Lake">
    Табличная функция [`deltaLake`](/sql-reference/table-functions/deltalake) (псевдоним для `deltaLakeS3`) считывает таблицы Delta Lake из объектного хранилища. Для других бэкендов предусмотрены варианты: `deltaLakeAzure` и `deltaLakeLocal`.

    **Пример синтаксиса:**

    ```sql
    deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

    deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    deltaLakeLocal(path, [,format])
    ```

    :::note Поддержка GCS
    Вариант функций S3 можно использовать для Google Cloud Storage (GCS).
    :::

    **Пример:**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.878 sec. Processed 100.00 million rows, 14.82 GB (25.78 million rows/s., 3.82 GB/s.)
    Peak memory usage: 9.16 GiB.
    ```

    ### Кластерный вариант \{#delta-cluster-variant\}

    Функция [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster) распределяет операции чтения между несколькими узлами кластера ClickHouse. Узел-инициатор динамически направляет файлы данных на рабочие узлы для параллельной обработки. `deltaLakeS3Cluster` является псевдонимом `deltaLakeCluster`. Также доступен вариант для Azure ([`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster)).

    **Пример синтаксиса:**

    ```sql
    deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    -- deltaLakeS3Cluster is an alias for deltaLakeCluster

    deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    :::note Поддержка GCS
    Вариант функций S3 можно использовать для Google Cloud Storage (GCS).
    :::

    **Пример (ClickHouse Cloud):**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLakeCluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/'
    )
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### Движок таблицы \{#delta-table-engine\}

    В качестве альтернативы использованию табличной функции в каждом запросе можно создать постоянную таблицу с помощью [движка таблиц `DeltaLake`](/engines/table-engines/integrations/deltalake) при использовании S3-совместимого хранилища. Данные по-прежнему хранятся в объектном хранилище и считываются по требованию — никакие данные не копируются в ClickHouse. Преимущество заключается в том, что определение таблицы хранится в ClickHouse и доступно всем пользователям и сессиям без необходимости указывать путь к хранилищу и учётные данные для каждого пользователя отдельно.

    Движок таблицы и табличная функция поддерживают [кэширование данных](/engines/table-engines/integrations/deltalake#data-cache), используя тот же механизм кэширования, что и движки хранилища S3, AzureBlobStorage и HDFS.

    **Пример синтаксиса:**

    ```sql
    CREATE TABLE delta_table
        ENGINE = DeltaLake(url [,aws_access_key_id, aws_secret_access_key])
    ```

    :::note Поддержка GCS
    Этот движок таблиц можно использовать с Google Cloud Storage (GCS).
    :::

    **Пример:**

    ```sql
    CREATE TABLE hits_delta
        ENGINE = DeltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')

    SELECT
        URL,
        count() AS cnt
    FROM hits_delta
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.608 sec. Processed 100.00 million rows, 14.82 GB (27.72 million rows/s., 4.11 GB/s.)
    Peak memory usage: 9.27 GiB.
    ```

    Список поддерживаемых функций, включая серверные части хранилища, кэширование и другое, см. в [матрице поддержки](/use-cases/data-lake/support-matrix#format-support). Полную справочную информацию см. в документации по [табличной функции `deltaLake`](/sql-reference/table-functions/deltalake) и [движку таблиц `DeltaLake`](/engines/table-engines/integrations/deltalake).
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    Табличная функция [`hudi`](/sql-reference/table-functions/hudi) читает таблицы Hudi из S3.

    **Синтаксис:**

    ```sql
    hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### Вариант для кластера \{#hudi-cluster-variant\}

    Функция [`hudiCluster`](/sql-reference/table-functions/hudiCluster) распределяет операции чтения между несколькими узлами кластера ClickHouse. Узел-инициатор динамически распределяет файлы данных по рабочим узлам для параллельной обработки.

    ```sql
    hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### Табличный движок \{#hudi-table-engine\}

    В качестве альтернативы использованию табличной функции в каждом запросе вы можете создать постоянную таблицу с помощью [табличного движка `Hudi`](/engines/table-engines/integrations/hudi). Данные по-прежнему хранятся в объектном хранилище и читаются по мере необходимости — в ClickHouse ничего не копируется. Преимущество заключается в том, что определение таблицы хранится в ClickHouse и может использоваться разными пользователями и в разных сеансах без необходимости каждому пользователю указывать путь к хранилищу и учетные данные.

    **Синтаксис:**

    ```sql
    CREATE TABLE hudi_table
        ENGINE = Hudi(url [,aws_access_key_id, aws_secret_access_key])
    ```

    Сведения о поддерживаемых возможностях, включая бэкенды хранилища и другое, см. в [матрице поддержки](/use-cases/data-lake/support-matrix#format-support). Полное описание см. в документации по [табличной функции `hudi`](/sql-reference/table-functions/hudi) и [табличному движку `Hudi`](/engines/table-engines/integrations/hudi).
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    <ExperimentalBadge />

    Табличная функция [`paimon`](/sql-reference/table-functions/paimon) (псевдоним `paimonS3`) считывает таблицы Paimon из объектного хранилища. Для каждого бэкенда хранилища предусмотрены свои варианты: `paimonS3`, `paimonAzure`, `paimonHDFS` и `paimonLocal`.

    **Синтаксис:**

    ```sql
    paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

    paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFS(path_to_table, [,format] [,compression_method])

    paimonLocal(path_to_table, [,format] [,compression_method])
    ```

    ### Кластерный вариант \{#paimon-cluster-variant\}

    Функция [`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster) распределяет операции чтения между несколькими узлами кластера ClickHouse. Узел-инициатор динамически распределяет файлы данных между рабочими узлами для параллельной обработки. `paimonCluster` — псевдоним для `paimonS3Cluster`. Также доступны варианты для Azure ([`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)) и HDFS ([`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster)).

    ```sql
    paimonS3Cluster(cluster_name, url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    -- paimonCluster is an alias for paimonS3Cluster

    paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
    ```

    ### Табличный движок \{#paimon-table-engine\}

    В настоящее время в ClickHouse нет отдельного табличного движка для Paimon. Для выполнения запросов к таблицам Paimon используйте указанные выше табличные функции.

    Сведения о поддерживаемых возможностях, включая бэкенды хранения и другое, см. в [матрице поддержки](/use-cases/data-lake/support-matrix#format-support). Полное описание см. в документации по [табличной функции `paimon`](/sql-reference/table-functions/paimon).
  </TabItem>
</Tabs>