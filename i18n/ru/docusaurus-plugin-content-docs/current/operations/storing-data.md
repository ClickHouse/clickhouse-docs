---
slug: '/operations/storing-data'
sidebar_label: 'Внешние диски для хранения данных'
sidebar_position: 68
description: 'Документация для highlight-next-line'
title: 'Внешние диски для хранения данных'
doc_type: guide
---
Данные, обрабатываемые в ClickHouse, обычно хранятся в локальной файловой системе машины, на которой работает сервер ClickHouse. Это требует дисков большой емкости, что может быть дорого. Чтобы избежать локального хранения данных, поддерживаются различные варианты хранения:
1. [Amazon S3](https://aws.amazon.com/s3/) объектное хранилище.
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).
3. Не поддерживается: Распределенная файловая система Hadoop ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

<br/>

:::note 
ClickHouse также поддерживает внешние движки таблиц, которые отличаются от описанного на этой странице внешнего варианта хранения, поскольку они позволяют читать данные, хранящиеся в каком-либо общем файловом формате (например, Parquet). На этой странице мы описываем конфигурацию хранения для таблиц семейства ClickHouse `MergeTree` или `Log`.

1. Для работы с данными, хранящимися на дисках `Amazon S3`, используйте движок таблиц [S3](/engines/table-engines/integrations/s3.md).
2. Для работы с данными, хранящимися в Azure Blob Storage, используйте движок таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md).
3. Для работы с данными в распределенной файловой системе Hadoop (не поддерживается) используйте движок таблиц [HDFS](/engines/table-engines/integrations/hdfs.md).
:::
## Конфигурация внешнего хранилища {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) и [`Log`](/engines/table-engines/log-family/log.md) 
семейства движков таблиц могут хранить данные в `S3`, `AzureBlobStorage`, `HDFS` (не поддерживается) используя диск с типами `s3`,
`azure_blob_storage`, `hdfs` (не поддерживается) соответственно.

Конфигурация диска требует:

1. Раздел `type`, равный одному из `s3`, `azure_blob_storage`, `hdfs` (не поддерживается), `local_blob_storage`, `web`.
2. Конфигурацию конкретного типа внешнего хранилища.

Начиная с версии ClickHouse 24.1, возможно использовать новый параметр конфигурации.
Он требует указания:

1. `type`, равный `object_storage`
2. `object_storage_type`, равный одному из `s3`, `azure_blob_storage` (или просто `azure`, начиная с `24.3`), `hdfs` (не поддерживается), `local_blob_storage` (или просто `local`, начиная с `24.3`), `web`.

<br/>

Дополнительно можно указать `metadata_type` (по умолчанию равно `local`), но также может быть установлено на `plain`, `web`, а начиная с `24.4`, `plain_rewritable`.
Использование типа метаданных `plain` описано в [разделе простого хранения](/operations/storing-data#plain-storage), тип метаданных `web` может использоваться только с типом объекта хранения `web`, тип метаданных `local` хранит файлы метаданных локально (каждый файл метаданных содержит отображение к файлам в объектном хранилище и некоторую дополнительную метаинформацию о них).

Например:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

равно следующей конфигурации (начиная с версии `24.1`):

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

Следующая конфигурация:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

равна:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Пример полной конфигурации хранения будет выглядеть так:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

Начиная с версии 24.1, она также может выглядеть так:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>object_storage</type>
                <object_storage_type>s3</object_storage_type>
                <metadata_type>local</metadata_type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

Чтобы сделать определенный тип хранения параметром по умолчанию для всех таблиц `MergeTree`, добавьте следующий раздел в файл конфигурации:

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

Если вы хотите настроить определенную политику хранения для конкретной таблицы, 
вы можете определить ее в настройках при создании таблицы:

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

Вы также можете использовать `disk` вместо `storage_policy`. В этом случае не требуется иметь раздел `storage_policy` в файле конфигурации, и достаточно раздела `disk`.

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## Динамическая конфигурация {#dynamic-configuration}

Также существует возможность указать конфигурацию хранения без предустановленного
диска в файле конфигурации, но она может быть настроена в 
настройках запроса `CREATE`/`ATTACH`.

Следующий пример запроса строится на описанной выше динамической конфигурации диска и
показывает, как использовать локальный диск для кэширования данных из таблицы, хранящейся по URL.

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=web,
    endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
  );
  -- highlight-end
```

Пример ниже добавляет кэш к внешнему хранилищу.

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
-- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
-- highlight-end
```

В отмеченных ниже настройках обратите внимание, что диск типа `type=web` вложен внутри
диска типа `type=cache`.

:::note
В примере используется `type=web`, но любой тип диска может быть настроен как динамический, 
включая локальный диск. Локальные диски требуют аргумент пути, чтобы находиться внутри параметра конфигурации сервера `custom_local_disks_base_directory`, который не имеет 
значения по умолчанию, поэтому установите это также при использовании локального диска.
:::

Сочетание конфигурации на основе конфигурации и конфигурации, определенной в sql, также возможно:

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  -- highlight-end
```

где `web` взят из файла конфигурации сервера:

```xml
<storage_configuration>
    <disks>
        <web>
            <type>web</type>
            <endpoint>'https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'</endpoint>
        </web>
    </disks>
</storage_configuration>
```
### Использование хранилища S3 {#s3-storage}
#### Обязательные параметры {#required-parameters-s3}

| Параметр           | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `endpoint`          | URL конечной точки S3 в `path` или `virtual hosted` [стилях](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html). Должен включать корзину и корневой путь для хранения данных. |
| `access_key_id`     | Идентификатор ключа доступа S3, используемый для аутентификации.                                                                                                                                              |
| `secret_access_key` | Секретный ключ доступа S3, используемый для аутентификации.                                                                                                                                          |
#### Дополнительные параметры {#optional-parameters-s3}

| Параметр                                       | Описание                                                                                                                                                                                                                                   | Значение по умолчанию                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | Название региона S3.                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | Управляет тем, нужно ли проверять поддержку пакетного удаления. Установите в `false`, когда используете Google Cloud Storage (GCS), поскольку GCS не поддерживает пакетные удаления.                                                                                                | `true`                                   |
| `use_environment_credentials`                   | Читает учетные данные AWS из переменных окружения: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`, если они существуют.                                                                                                        | `false`                                  |
| `use_insecure_imds_request`                     | Если `true`, использует небезопасный запрос IMDS для получения учетных данных из метаданных Amazon EC2.                                                                                                                                                    | `false`                                  |
| `expiration_window_seconds`                     | Период грации (в секундах) для проверки, истекли ли учетные данные на основе времени истечения.                                                                                                                                                          | `120`                                    |
| `proxy`                                         | Конфигурация прокси для конечной точки S3. Каждый элемент `uri` внутри блока `proxy` должен содержать URL прокси.                                                                                                                                      | -                                        |
| `connect_timeout_ms`                            | Тайм-аус при подключении сокета в миллисекундах.                                                                                                                                                                                                       | `10000` (10 секунд)                     |
| `request_timeout_ms`                            | Тайм-аус запроса в миллисекундах.                                                                                                                                                                                                              | `5000` (5 секунд)                       |
| `retry_attempts`                                | Количество попыток повторного запроса для неудачных запросов.                                                                                                                                                                                                 | `10`                                     |
| `single_read_retries`                           | Количество попыток повторного запроса при обрывах соединения во время чтения.                                                                                                                                                                                    | `4`                                      |
| `min_bytes_for_seek`                            | Минимальное количество байтов для использования операции поиска вместо последовательного чтения.                                                                                                                                                                     | `1 MB`                                   |
| `metadata_path`                                 | Путь в локальной файловой системе для хранения файлов метаданных S3.                                                                                                                                                                                             | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | Если `true`, пропускает проверки доступа к диску во время старта.                                                                                                                                                                                           | `false`                                  |
| `header`                                        | Добавляет указанный HTTP заголовок к запросам. Может быть указан несколько раз.                                                                                                                                                                      | -                                        |
| `server_side_encryption_customer_key_base64`    | Обязательные заголовки для доступа к объектам S3 с шифрованием SSE-C.                                                                                                                                                                              | -                                        |
| `server_side_encryption_kms_key_id`             | Обязательные заголовки для доступа к объектам S3 с [шифрованием SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html). Пустая строка использует управляемый ключ S3 от AWS.                                                     | -                                        |
| `server_side_encryption_kms_encryption_context` | Заголовок контекста шифрования для SSE-KMS (используется с `server_side_encryption_kms_key_id`).                                                                                                                                                        | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | Включает ключи корзины S3 для SSE-KMS (используется с `server_side_encryption_kms_key_id`).                                                                                                                                                           | Соответствует настройке на уровне корзины             |
| `s3_max_put_rps`                                | Максимальное количество запросов PUT в секунду перед ограничением.                                                                                                                                                                                            | `0` (безлимитный)                          |
| `s3_max_put_burst`                              | Максимальное количество параллельных запросов PUT, прежде чем достигнуть предела RPS.                                                                                                                                                                                     | То же самое, что и `s3_max_put_rps`                 |
| `s3_max_get_rps`                                | Максимальное количествоGET запросов в секунду перед ограничением.                                                                                                                                                                                            | `0` (безлимитный)                          |
| `s3_max_get_burst`                              | Максимальное количество параллельных запросов GET перед ограничением RPS.                                                                                                                                                                                     | То же самое, что и `s3_max_get_rps`                 |
| `read_resource`                                 | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на чтение.                                                                                                                                                             | Пустая строка (отключено)                  |
| `write_resource`                                | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на запись.                                                                                                                                                            | Пустая строка (отключено)                  |
| `key_template`                                  | Определяет формат генерации ключа объекта с использованием синтаксиса [re2](https://github.com/google/re2/wiki/Syntax). Требуется флаг `storage_metadata_write_full_object_key`. Несовместимо с `root path` в `endpoint`. Требует `key_compatibility_prefix`. | -                                        |
| `key_compatibility_prefix`                      | Требуется с `key_template`. Указывает предыдущий `root path` из `endpoint` для чтения более старых версий метаданных.                                                                                                                         | -                                        |
| `read_only`                                      | Разрешает только чтение с диска.                                                                                                                                                                                                          | -                                        |
:::note
Google Cloud Storage (GCS) также поддерживается с использованием типа `s3`. См. [Слияние MergeTree с GCS](/integrations/gcs).
:::
### Использование простого хранения {#plain-storage}

В `22.10` был введен новый тип диска `s3_plain`, который предоставляет однократное хранилище.
Параметры конфигурации для него такие же, как для типа диска `s3`.
В отличие от типа диска `s3`, он хранит данные без изменений. Другими словами, 
вместо случайно сгенерированных имен блобов он использует обычные имена файлов 
(так же, как ClickHouse хранит файлы на локальном диске) и не хранит никаких 
метаданных локально. Например, он производен из данных на `s3`.

Этот тип диска позволяет хранить статическую версию таблицы, так как не 
разрешает выполнять слияния с существующими данными и не разрешает вставку новых
данных. Случай использования для этого типа диска - создание резервных копий, что можно сделать
с помощью `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`. После этого 
вы можете выполнить `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` 
или использовать `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`.

Конфигурация:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Начиная с `24.1`, можно настроить любой диск объектного хранилища (`s3`, `azure`, `hdfs` (не поддерживается), `local`), используя
тип метаданных `plain`.

Конфигурация:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```
### Использование перезаписываемого простого хранилища S3 {#s3-plain-rewritable-storage}

Новый тип диска `s3_plain_rewritable` был введен в `24.4`.
Похожий на тип диска `s3_plain`, он не требует дополнительного хранилища для 
файлов метаданных. Вместо этого метаданные хранятся в S3.
В отличие от типа диска `s3_plain`, `s3_plain_rewritable` позволяет выполнять слияния 
и поддерживает операции `INSERT`.
[Мутации](/sql-reference/statements/alter#mutations) и репликацию таблиц не поддерживаются.

Случай использования для этого типа диска подходит для нереплицируемых таблиц `MergeTree`. Хотя 
тип диска `s3` подходит для нереплицируемых таблиц `MergeTree`, вы можете выбрать
тип диска `s3_plain_rewritable`, если вам не нужны локальные метаданные 
для таблицы и вы готовы принять ограниченный набор операций. Это может
быть полезно, например, для системных таблиц.

Конфигурация:

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

равно

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

Начиная с `24.5`, возможно настроить любой диск объектного хранилища 
(`s3`, `azure`, `local`) с использованием типа метаданных `plain_rewritable`.
### Использование Azure Blob Storage {#azure-blob-storage}

Движки таблиц семейства `MergeTree` могут хранить данные в [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) 
используя диск с типом `azure_blob_storage`.

Конфигурация:

```xml
<storage_configuration>
    ...
    <disks>
        <blob_storage_disk>
            <type>azure_blob_storage</type>
            <storage_account_url>http://account.blob.core.windows.net</storage_account_url>
            <container_name>container</container_name>
            <account_name>account</account_name>
            <account_key>pass123</account_key>
            <metadata_path>/var/lib/clickhouse/disks/blob_storage_disk/</metadata_path>
            <cache_path>/var/lib/clickhouse/disks/blob_storage_disk/cache/</cache_path>
            <skip_access_check>false</skip_access_check>
        </blob_storage_disk>
    </disks>
    ...
</storage_configuration>
```
#### Параметры подключения {#azure-blob-storage-connection-parameters}

| Параметр                        | Описание                                                                                                                                                                                      | Значение по умолчанию       |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `storage_account_url` (Обязательный) | URL-адрес учетной записи Azure Blob Storage. Например: `http://account.blob.core.windows.net` или `http://azurite1:10000/devstoreaccount1`.                                                                    | -                   |
| `container_name`                 | Имя целевого контейнера.                                                                                                                                                                           | `default-container` |
| `container_already_exists`       | Контролирует поведение при создании контейнера: <br/>- `false`: Создает новый контейнер <br/>- `true`: Подключается напрямую к существующему контейнеру <br/>- Не установлено: Проверяет, существует ли контейнер, создает при необходимости | -                   |

Параметры аутентификации (диск будет пытаться все доступные методы **и** Учетные данные управляемого идентификатора):

| Параметр           | Описание                                                     |
|---------------------|-----------------------------------------------------------------|
| `connection_string` | Для аутентификации с использованием строки подключения.                   |
| `account_name`      | Для аутентификации с использованием Общего ключа (используется с `account_key`).  |
| `account_key`       | Для аутентификации с использованием Общего ключа (используется с `account_name`). |
#### Параметры лимита {#azure-blob-storage-limit-parameters}

| Параметр                            | Описание                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| `s3_max_single_part_upload_size`     | Максимальный размер одного блока загрузки в Blob Storage.                      |
| `min_bytes_for_seek`                 | Минимальный размер области, доступной для поиска.                                          |
| `max_single_read_retries`            | Максимальное количество попыток прочитать кусок данных из Blob Storage.       |
| `max_single_download_retries`        | Максимальное количество попыток скачать читаемый буфер из Blob Storage. |
| `thread_pool_size`                   | Максимальное количество потоков для инстанцирования `IDiskRemote`.                  |
| `s3_max_inflight_parts_for_one_file` | Максимальное количество параллельных запросов на загрузку для одного объекта.              |
#### Другие параметры {#azure-blob-storage-other-parameters}

| Параметр                        | Описание                                                                        | Значение по умолчанию                            |
|----------------------------------|------------------------------------------------------------------------------------|------------------------------------------|
| `metadata_path`                  | Путь в локальной файловой системе для хранения файлов метаданных для Blob Storage.                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | Если `true`, пропускает проверки доступа к диску во время старта.                                | `false`                                  |
| `read_resource`                  | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на чтение.  | Пустая строка (отключено)                  |
| `write_resource`                 | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на запись. | Пустая строка (отключено)                  |
| `metadata_keep_free_space_bytes` | Количество свободного места на диске для метаданных.                                     | -                                        |

Примеры рабочих конфигураций можно найти в директории интеграционных тестов (см., например, [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) или [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)).

:::note Репликация без копирования не готова к производству
Репликация без копирования отключена по умолчанию в версиях ClickHouse 22.8 и выше. Эта функция не рекомендуется для использования в производственной среде.
:::
## Использование хранилища HDFS (не поддерживается) {#using-hdfs-storage-unsupported}

В этой примере конфигурации:
- диск типа `hdfs` (не поддерживается)
- данные находятся по адресу `hdfs://hdfs1:9000/clickhouse/`

Учтите, что HDFS не поддерживается, и, следовательно, могут возникнуть проблемы при его использовании. Если возникнут проблемы, вы можете сделать запрос на внесение изменений в код.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <hdfs>
                <type>hdfs</type>
                <endpoint>hdfs://hdfs1:9000/clickhouse/</endpoint>
                <skip_access_check>true</skip_access_check>
            </hdfs>
            <hdd>
                <type>local</type>
                <path>/</path>
            </hdd>
        </disks>
        <policies>
            <hdfs>
                <volumes>
                    <main>
                        <disk>hdfs</disk>
                    </main>
                    <external>
                        <disk>hdd</disk>
                    </external>
                </volumes>
            </hdfs>
        </policies>
    </storage_configuration>
</clickhouse>
```

Имейте в виду, что HDFS может не работать в крайних случаях.
### Использование шифрования данных {#encrypted-virtual-file-system}

Вы можете шифровать данные, хранящиеся на [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3), или [HDFS](#using-hdfs-storage-unsupported) (не поддерживается) внешних дисков, или на локальном диске. Чтобы включить режим шифрования, в файле конфигурации вы должны определить диск с типом `encrypted` и выбрать диск, на котором будут храниться данные. Зашифрованный диск шифрует все записанные файлы на лету, и когда вы читаете файлы с зашифрованного диска, он автоматически их расшифровывает. Таким образом, вы можете работать с зашифрованным диском так же, как с обычным.

Пример конфигурации диска:

```xml
<disks>
  <disk1>
    <type>local</type>
    <path>/path1/</path>
  </disk1>
  <disk2>
    <type>encrypted</type>
    <disk>disk1</disk>
    <path>path2/</path>
    <key>_16_ascii_chars_</key>
  </disk2>
</disks>
```

Например, когда ClickHouse записывает данные из какой-то таблицы в файл `store/all_1_1_0/data.bin` на `disk1`, то на самом деле этот файл будет записан на физическом диске по пути `/path1/store/all_1_1_0/data.bin`.

При записи того же файла на `disk2` он фактически будет записан на физическом диске по пути `/path1/path2/store/all_1_1_0/data.bin` в зашифрованном виде.
### Обязательные параметры {#required-parameters-encrypted-disk}

| Параметр  | Тип   | Описание                                                                                                                                  |
|------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `type`     | String | Должен быть установлен в `encrypted`, чтобы создать зашифрованный диск.                                                                                      |
| `disk`     | String | Тип диска, который будет использоваться для базового хранения.                                                                                                  |
| `key`      | Uint64 | Ключ для шифрования и расшифровки. Может быть задан в шестнадцатеричном формате с помощью `key_hex`. Несколько ключей могут быть указаны с использованием атрибута `id`. |
### Дополнительные параметры {#optional-parameters-encrypted-disk}

| Параметр        | Тип   | Значение по умолчанию        | Описание                                                                                                                             |
|------------------|--------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `path`           | String | Корневая директория | Место на диске, где будут храниться данные.                                                                                          |
| `current_key_id` | String | -              | Идентификатор ключа, используемый для шифрования. Все указанные ключи могут использоваться для расшифровки.                                                          |
| `algorithm`      | Enum   | `AES_128_CTR`  | Алгоритм шифрования. Опции: <br/>- `AES_128_CTR` (16-битный ключ) <br/>- `AES_192_CTR` (24-битный ключ) <br/>- `AES_256_CTR` (32-битный ключ) |

Пример конфигурации диска:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk_s3>
                <type>s3</type>
                <endpoint>...
            </disk_s3>
            <disk_s3_encrypted>
                <type>encrypted</type>
                <disk>disk_s3</disk>
                <algorithm>AES_128_CTR</algorithm>
                <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
                <key_hex id="1">ffeeddccbbaa99887766554433221100</key_hex>
                <current_key_id>1</current_key_id>
            </disk_s3_encrypted>
        </disks>
    </storage_configuration>
</clickhouse>
```
### Использование локального кэша {#using-local-cache}

Возможна настройка локального кэша на дисках в конфигурации хранения, начиная с версии 22.3. 
Для версий 22.3 - 22.7 кэш поддерживается только для типа диска `s3`. Для версий >= 22.8 кэш поддерживается для любого типа диска: S3, Azure, Local, Encrypted и т.д. 
Для версий >= 23.5 кэш поддерживается только для удаленных типов дисков: S3, Azure, HDFS (не поддерживается). 
Кэш использует политику кэширования `LRU`.

Пример конфигурации для версий, не ниже 22.8:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
            </s3>
            <cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/s3_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>cache</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

Пример конфигурации для версий, ниже 22.8:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
                <data_cache_enabled>1</data_cache_enabled>
                <data_cache_max_size>10737418240</data_cache_max_size>
            </s3>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

Настройки **конфигурации диска кэша**:

Эти настройки должны быть определены в разделе конфигурации диска.

| Параметр                               | Тип       | По умолчанию | Описание                                                                                                                                                                                   |
|----------------------------------------|-----------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                 | String    | -            | **Обязательный**. Путь к каталогу, где будет храниться кэш.                                                                                                                                   |
| `max_size`                             | Size      | -            | **Обязательный**. Максимальный размер кэша в байтах или удобочитаемом формате (например, `10Gi`). Файлы удаляются по политике LRU, когда достигается лимит. Поддерживаются форматы `ki`, `Mi`, `Gi` (с версии 22.10). |
| `cache_on_write_operations`            | Boolean   | `false`      | Включает кэш на запись для запросов `INSERT` и фоновых слияний. Может быть переопределен для конкретного запроса с помощью `enable_filesystem_cache_on_write_operations`.                      |
| `enable_filesystem_query_cache_limit`  | Boolean   | `false`      | Включает лимиты размера кэша на запрос для каждого запроса, основанные на `max_query_cache_size`.                                                                                        |
| `enable_cache_hits_threshold`          | Boolean   | `false`      | При включении данные кэшируются только после многократного чтения.                                                                                                                        |
| `cache_hits_threshold`                 | Integer   | `0`          | Количество чтений, необходимое для кэширования данных (требует `enable_cache_hits_threshold`).                                                                                             |
| `enable_bypass_cache_with_threshold`   | Boolean   | `false`      | Пропускает кэш для больших диапазонов чтения.                                                                                                                                                    |
| `bypass_cache_threshold`               | Size      | `256Mi`      | Размер диапазона чтения, который вызывает пропуск кэша (требует `enable_bypass_cache_with_threshold`).                                                                                            |
| `max_file_segment_size`                | Size      | `8Mi`        | Максимальный размер одного файла кэша в байтах или удобочитаемом формате.                                                                                                                  |
| `max_elements`                         | Integer   | `10000000`   | Максимальное количество файлов кэша.                                                                                                                                                         |
| `load_metadata_threads`                | Integer   | `16`         | Количество потоков для загрузки метаданных кэша при старте.                                                                                                                                 |

> **Примечание**: Значения размера поддерживают единицы такие как `ki`, `Mi`, `Gi` и т.д. (например, `10Gi`).
## Настройки запросов/профиля для файлового кэша {#file-cache-query-profile-settings}

| Настройка                                                       | Тип       | По умолчанию         | Описание                                                                                                                                                 |
|----------------------------------------------------------------|-----------|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_filesystem_cache`                                      | Boolean   | `true`              | Включает/выключает использование кэша для каждого запроса, даже при использовании типа диска `cache`.                                                 |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` | Boolean   | `false`             | При включении кэш используется только если данные существуют; новые данные не будут кэшироваться.                                                       |
| `enable_filesystem_cache_on_write_operations`                  | Boolean   | `false` (Cloud: `true`) | Включает кэш на запись. Требует `cache_on_write_operations` в конфигурации кэша.                                                                       |
| `enable_filesystem_cache_log`                                  | Boolean   | `false`             | Включает детальную запись использования кэша в `system.filesystem_cache_log`.                                                                             |
| `max_query_cache_size`                                         | Size      | `false`             | Максимальный размер кэша для каждого запроса. Требует `enable_filesystem_query_cache_limit` в конфигурации кэша.                                      |
| `skip_download_if_exceeds_query_cache`                         | Boolean   | `true`              | Управляет поведением, когда достигается `max_query_cache_size`: <br/>- `true`: Останавливает загрузку новых данных <br/>- `false`: Удаляет старые данные, чтобы освободить место для новых данных |

:::warning
Настройки конфигурации кэша и настройки запросов кэша соответствуют последней версии ClickHouse, 
для более ранних версий некоторые вещи могут не поддерживаться.
:::
#### Системные таблицы кэша {#cache-system-tables-file-cache}

| Имя Таблицы                  | Описание                                            | Требования                                   |
|------------------------------|----------------------------------------------------|---------------------------------------------|
| `system.filesystem_cache`    | Отображает текущее состояние файлового кэша.      | Нет                                         |
| `system.filesystem_cache_log`| Предоставляет подробную статистику использования кэша для каждого запроса. | Требует `enable_filesystem_cache_log = true` |
#### Команды кэша {#cache-commands-file-cache}
##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

Эта команда поддерживается только в том случае, если не указан `<cache_name>`
##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

Показать список файловых кэшей, которые были сконфигурированы на сервере. 
(Для версий до или равных `22.8` команда называется `SHOW CACHES`)

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```
##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

Показать конфигурацию кэша и некоторые общие статистические данные для конкретного кэша. 
Имя кэша можно взять из команды `SHOW FILESYSTEM CACHES`. (Для версий до или равных `22.8` команда называется `DESCRIBE CACHE`)

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| Текущие метрики кэша       | Асинхронные метрики кэша    | События профиля кэша                                                                         |
|----------------------------|-----------------------------|-----------------------------------------------------------------------------------------------|
| `FilesystemCacheSize`      | `FilesystemCacheBytes`      | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`                   |
| `FilesystemCacheElements`  | `FilesystemCacheFiles`      | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`     |
|                            |                             | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`                   |
|                            |                             | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`                 |
### Использование статического веб-хранилища (только для чтения) {#web-storage}

Это диск только для чтения. Его данные только читаются и никогда не изменяются. Новая таблица загружается на этот диск через запрос `ATTACH TABLE` (см. пример ниже). Локальный диск фактически не используется, каждый запрос `SELECT` будет приводить к `http` запросу для получения необходимых данных. Любые изменения в данных таблицы приведут к исключению, т.е. следующие типы запросов не разрешены: [`CREATE TABLE`](/sql-reference/statements/create/table.md),
[`ALTER TABLE`](/sql-reference/statements/alter/index.md), [`RENAME TABLE`](/sql-reference/statements/rename#rename-table),
[`DETACH TABLE`](/sql-reference/statements/detach.md) и [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md).
Веб-хранилище можно использовать только для чтения. Пример использования - размещение 
примерных данных или миграция данных. Существует инструмент `clickhouse-static-files-uploader`, 
который подготавливает каталог данных для данной таблицы (`SELECT data_paths FROM system.tables WHERE name = 'table_name'`). 
Для каждой необходимой таблицы вы получаете каталог файлов. Эти файлы могут быть загружены 
на, например, веб-сервер со статическими файлами. После этой подготовки 
вы можете загрузить эту таблицу на любой сервер ClickHouse через `DiskWeb`.

В этой примерной конфигурации:
- диск типа `web`
- данные размещены по адресу `http://nginx:80/test1/`
- используется кэш на локальном носителе

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>http://nginx:80/test1/</endpoint>
            </web>
            <cached_web>
                <type>cache</type>
                <disk>web</disk>
                <path>cached_web_cache/</path>
                <max_size>100000000</max_size>
            </cached_web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
            <cached_web>
                <volumes>
                    <main>
                        <disk>cached_web</disk>
                    </main>
                </volumes>
            </cached_web>
        </policies>
    </storage_configuration>
</clickhouse>
```

:::tip
Хранилище также может быть настроено временно в рамках запроса, если набор данных из веба 
не ожидается для рутинного использования, см. [динамическая конфигурация](#dynamic-configuration) и пропустите 
редактирование файла конфигурации.

[Демо-набор данных](https://github.com/ClickHouse/web-tables-demo) размещен на GitHub. Чтобы подготовить свои собственные таблицы для веб 
хранилища, смотрите инструмент [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

В этом запросе `ATTACH TABLE` предоставленный `UUID` соответствует имени каталога данных, а конечная точка - это URL для сырого контента GitHub.

```sql
-- highlight-next-line
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      );
  -- highlight-end
```

Готовый тестовый случай. Необходимо добавить эту конфигурацию в config:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>https://clickhouse-datasets.s3.yandex.net/disk-with-static-files-tests/test-hits/</endpoint>
            </web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
        </policies>
    </storage_configuration>
</clickhouse>
```

А затем выполнить этот запрос:

```sql
ATTACH TABLE test_hits UUID '1ae36516-d62d-4218-9ae3-6516d62da218'
(
    WatchID UInt64,
    JavaEnable UInt8,
    Title String,
    GoodEvent Int16,
    EventTime DateTime,
    EventDate Date,
    CounterID UInt32,
    ClientIP UInt32,
    ClientIP6 FixedString(16),
    RegionID UInt32,
    UserID UInt64,
    CounterClass Int8,
    OS UInt8,
    UserAgent UInt8,
    URL String,
    Referer String,
    URLDomain String,
    RefererDomain String,
    Refresh UInt8,
    IsRobot UInt8,
    RefererCategories Array(UInt16),
    URLCategories Array(UInt16),
    URLRegions Array(UInt32),
    RefererRegions Array(UInt32),
    ResolutionWidth UInt16,
    ResolutionHeight UInt16,
    ResolutionDepth UInt8,
    FlashMajor UInt8,
    FlashMinor UInt8,
    FlashMinor2 String,
    NetMajor UInt8,
    NetMinor UInt8,
    UserAgentMajor UInt16,
    UserAgentMinor FixedString(2),
    CookieEnable UInt8,
    JavascriptEnable UInt8,
    IsMobile UInt8,
    MobilePhone UInt8,
    MobilePhoneModel String,
    Params String,
    IPNetworkID UInt32,
    TraficSourceID Int8,
    SearchEngineID UInt16,
    SearchPhrase String,
    AdvEngineID UInt8,
    IsArtifical UInt8,
    WindowClientWidth UInt16,
    WindowClientHeight UInt16,
    ClientTimeZone Int16,
    ClientEventTime DateTime,
    SilverlightVersion1 UInt8,
    SilverlightVersion2 UInt8,
    SilverlightVersion3 UInt32,
    SilverlightVersion4 UInt16,
    PageCharset String,
    CodeVersion UInt32,
    IsLink UInt8,
    IsDownload UInt8,
    IsNotBounce UInt8,
    FUniqID UInt64,
    HID UInt32,
    IsOldCounter UInt8,
    IsEvent UInt8,
    IsParameter UInt8,
    DontCountHits UInt8,
    WithHash UInt8,
    HitColor FixedString(1),
    UTCEventTime DateTime,
    Age UInt8,
    Sex UInt8,
    Income UInt8,
    Interests UInt16,
    Robotness UInt8,
    GeneralInterests Array(UInt16),
    RemoteIP UInt32,
    RemoteIP6 FixedString(16),
    WindowName Int32,
    OpenerName Int32,
    HistoryLength Int16,
    BrowserLanguage FixedString(2),
    BrowserCountry FixedString(2),
    SocialNetwork String,
    SocialAction String,
    HTTPError UInt16,
    SendTiming Int32,
    DNSTiming Int32,
    ConnectTiming Int32,
    ResponseStartTiming Int32,
    ResponseEndTiming Int32,
    FetchTiming Int32,
    RedirectTiming Int32,
    DOMInteractiveTiming Int32,
    DOMContentLoadedTiming Int32,
    DOMCompleteTiming Int32,
    LoadEventStartTiming Int32,
    LoadEventEndTiming Int32,
    NSToDOMContentLoadedTiming Int32,
    FirstPaintTiming Int32,
    RedirectCount Int8,
    SocialSourceNetworkID UInt8,
    SocialSourcePage String,
    ParamPrice Int64,
    ParamOrderID String,
    ParamCurrency FixedString(3),
    ParamCurrencyID UInt16,
    GoalsReached Array(UInt32),
    OpenstatServiceName String,
    OpenstatCampaignID String,
    OpenstatAdID String,
    OpenstatSourceID String,
    UTMSource String,
    UTMMedium String,
    UTMCampaign String,
    UTMContent String,
    UTMTerm String,
    FromTag String,
    HasGCLID UInt8,
    RefererHash UInt64,
    URLHash UInt64,
    CLID UInt32,
    YCLID UInt64,
    ShareService String,
    ShareURL String,
    ShareTitle String,
    ParsedParams Nested(
        Key1 String,
        Key2 String,
        Key3 String,
        Key4 String,
        Key5 String,
        ValueDouble Float64),
    IslandID FixedString(16),
    RequestNum UInt32,
    RequestTry UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID)
SETTINGS storage_policy='web';
```
#### Обязательные параметры {#static-web-storage-required-parameters}

| Параметр  | Описание                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------------------------|
| `type`     | `web`. В противном случае диск не будет создан.                                                                    |
| `endpoint` | URL конечной точки в формате `path`. URL конечной точки должен содержать корневой путь для хранения данных, куда они были загружены. |
#### Необязательные параметры {#optional-parameters-web}

| Параметр                          | Описание                                                                  | Значение по умолчанию |
|-----------------------------------|--------------------------------------------------------------------------|-----------------------|
| `min_bytes_for_seek`              | Минимальное количество байтов для использования операции seek вместо последовательного чтения | `1` MB                |
| `remote_fs_read_backoff_threashold` | Максимальное время ожидания при попытке чтения данных для удаленного диска | `10000` секунд        |
| `remote_fs_read_backoff_max_tries`  | Максимальное количество попыток чтения с использованием backoff         | `5`                   |

Если запрос завершился с исключением `DB:Exception Unreachable URL`, вы можете попробовать отрегулировать настройки: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout), [http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout), [keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout).

Чтобы получить файлы для загрузки, выполните:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` (`--metadata-path` можно найти в запросе `SELECT data_paths FROM system.tables WHERE name = 'table_name'`).

При загрузке файлов через `endpoint` их необходимо загружать в путь `<endpoint>/store/`, но конфигурация должна содержать только `endpoint`.

Если URL недоступен при загрузке диска, когда сервер запускает таблицы, все ошибки будут обработаны. Если в этом случае произошли ошибки, таблицы можно перезагрузить (стать видимыми) с помощью `DETACH TABLE table_name` -> `ATTACH TABLE table_name`. Если метаданные были успешно загружены при старте сервера, таблицы будут доступны сразу.

Используйте настройку [http_max_single_read_retries](/operations/storing-data#web-storage), чтобы ограничить максимальное количество попыток во время одного HTTP чтения.
### Репликация без копирования (не готова к производству) {#zero-copy}

Репликация без копирования возможна, но не рекомендуется, с дисками `S3` и `HDFS` (не поддерживается). Репликация без копирования означает, что если данные хранятся удаленно на нескольких машинах и требуют синхронизации, то реплицируется только метаданные (пути к частям данных), но не сами данные.

:::note Репликация без копирования не готова к производству
Репликация без копирования по умолчанию отключена в версии ClickHouse 22.8 и выше. Эта функция не рекомендуется для использования в производственной среде.
:::