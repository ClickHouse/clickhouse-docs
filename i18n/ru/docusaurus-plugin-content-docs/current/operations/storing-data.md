---
description: 'Документация по highlight-next-line'
sidebar_label: 'Внешние диски для хранения данных'
sidebar_position: 68
slug: /operations/storing-data
title: 'Внешние диски для хранения данных'
doc_type: 'guide'
---

Данные, обрабатываемые в ClickHouse, обычно хранятся в локальной файловой системе 
машины, на которой запущен сервер ClickHouse. Для этого требуются диски большой ёмкости,
которые могут быть дорогими. Чтобы отказаться от локального хранения данных, поддерживаются различные варианты хранилищ:
1. Объектное хранилище [Amazon S3](https://aws.amazon.com/s3/).
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).
3. Не поддерживается: Hadoop Distributed File System ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

<br/>

:::note 
ClickHouse также поддерживает внешние движки таблиц, которые отличаются от 
вариантов внешнего хранилища, описанных на этой странице, так как позволяют читать данные,
хранящиеся в распространённых файловых форматах (например, Parquet). На этой странице мы описываем 
конфигурацию хранилища для семейств таблиц `MergeTree` или `Log`.

1. для работы с данными, хранящимися на дисках `Amazon S3`, используйте движок таблицы [S3](/engines/table-engines/integrations/s3.md).
2. для работы с данными, хранящимися в Azure Blob Storage, используйте движок таблицы [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md).
3. для работы с данными в Hadoop Distributed File System (не поддерживается), используйте движок таблицы [HDFS](/engines/table-engines/integrations/hdfs.md).
:::



## Настройка внешнего хранилища

Движки таблиц семейств [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) и [`Log`](/engines/table-engines/log-family/log.md)
могут сохранять данные в `S3`, `AzureBlobStorage`, `HDFS` (не поддерживается), используя диски типов `s3`,
`azure_blob_storage`, `hdfs` (не поддерживается) соответственно.

Конфигурация диска требует:

1. Раздела `type` со значением одним из `s3`, `azure_blob_storage`, `hdfs` (не поддерживается), `local_blob_storage`, `web`.
2. Настроек конкретного типа внешнего хранилища.

Начиная с версии ClickHouse 24.1, можно использовать новый вариант конфигурации.
Он требует указания:

1. `type`, равного `object_storage`
2. `object_storage_type`, равного одному из `s3`, `azure_blob_storage` (или просто `azure`, начиная с `24.3`), `hdfs` (не поддерживается), `local_blob_storage` (или просто `local`, начиная с `24.3`), `web`.

<br />

Дополнительно может быть указан `metadata_type` (по умолчанию он равен `local`), но его также можно установить в `plain`, `web` и, начиная с `24.4`, `plain_rewritable`.
Использование типа метаданных `plain` описано в [разделе plain‑хранилища](/operations/storing-data#plain-storage), тип метаданных `web` может использоваться только с типом объектного хранилища `web`, тип метаданных `local` хранит файлы метаданных локально (каждый файл метаданных содержит отображение файлов в объектном хранилище и дополнительную информацию о них).

Например:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

эквивалентно следующей конфигурации (начиная с версии `24.1`):

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

равно:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Пример полной конфигурации хранилища выглядит следующим образом:

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

Начиная с версии 24.1, это может выглядеть, например, так:


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

Чтобы сделать определённый тип хранилища типом по умолчанию для всех таблиц `MergeTree`,
добавьте следующий раздел в файл конфигурации:

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

Если вы хотите настроить политику хранения для отдельной таблицы,
вы можете указать её в `SETTINGS` при создании таблицы:

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

Можно также использовать `disk` вместо `storage_policy`. В этом случае
раздел `storage_policy` в конфигурационном файле не обязателен, достаточно
указать раздел `disk`.

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```


## Динамическая конфигурация

Также есть возможность задать конфигурацию хранилища без заранее определённого
диска в конфигурационном файле, а настроить её в параметрах запросов `CREATE`/`ATTACH`.

Следующий пример запроса основывается на приведённой выше конфигурации динамического диска и
показывает, как использовать локальный диск для кэширования данных из таблицы, размещённой по URL-адресу.

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

В следующем примере к внешнему хранилищу добавляется кэш.

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

В настройках, показанных ниже, обратите внимание, что диск с `type=web` вложен в
диск с `type=cache`.

:::note
В примере используется `type=web`, но любой тип диска может быть настроен как динамический,
включая локальный диск. Для локальных дисков требуется, чтобы аргумент path находился внутри
каталога, заданного в параметре конфигурации сервера `custom_local_disks_base_directory`, который не имеет
значения по умолчанию, поэтому при использовании локального диска задайте и его.
:::

Также возможна комбинация конфигурации, задаваемой в config-файлах, и конфигурации, определяемой в SQL:

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

где `web` берётся из файла конфигурации сервера:


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

### Использование хранилища S3

#### Обязательные параметры

| Параметр            | Описание                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `endpoint`          | URL-адрес конечной точки S3 в стиле `path` или `virtual hosted` ([styles](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)). Должен включать bucket и корневой путь для хранения данных. |
| `access_key_id`     | Идентификатор ключа доступа S3, используемый для аутентификации.                                                                                                                                             |
| `secret_access_key` | Секретный ключ доступа S3, используемый для аутентификации.                                                                                                                                                  |

#### Необязательные параметры


| Parameter                                       | Description                                                                                                                                                                                                                                   | Default Value                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | Имя региона S3.                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | Управляет проверкой поддержки пакетного удаления. Установите значение `false` при использовании Google Cloud Storage (GCS), так как GCS не поддерживает пакетное удаление.                                                                   | `true`                                   |
| `use_environment_credentials`                   | Считывает учетные данные AWS из переменных окружения: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`, если они существуют.                                                                                               | `false`                                  |
| `use_insecure_imds_request`                     | Если `true`, использует небезопасный запрос IMDS при получении учетных данных из метаданных Amazon EC2.                                                                                                                                      | `false`                                  |
| `expiration_window_seconds`                     | Льготный интервал (в секундах), используемый при проверке, истекли ли учетные данные с ограниченным сроком действия.                                                                                                                         | `120`                                    |
| `proxy`                                         | Конфигурация прокси для конечной точки S3. Каждый элемент `uri` внутри блока `proxy` должен содержать URL прокси.                                                                                                                            | -                                        |
| `connect_timeout_ms`                            | Таймаут установления сокет-соединения в миллисекундах.                                                                                                                                                                                        | `10000` (10 секунд)                      |
| `request_timeout_ms`                            | Таймаут запроса в миллисекундах.                                                                                                                                                                                                              | `5000` (5 секунд)                        |
| `retry_attempts`                                | Количество попыток повтора для неуспешных запросов.                                                                                                                                                                                          | `10`                                     |
| `single_read_retries`                           | Количество попыток повторного подключения при обрыве соединения во время чтения.                                                                                                                                                            | `4`                                      |
| `min_bytes_for_seek`                            | Минимальное количество байт, при котором используется операция `seek` вместо последовательного чтения.                                                                                                                                       | `1 MB`                                   |
| `metadata_path`                                 | Локальный путь файловой системы для хранения файлов метаданных S3.                                                                                                                                                                           | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | Если `true`, пропускает проверку доступа к диску во время запуска.                                                                                                                                                                           | `false`                                  |
| `header`                                        | Добавляет указанный HTTP-заголовок к запросам. Может быть указан несколько раз.                                                                                                                                                              | -                                        |
| `server_side_encryption_customer_key_base64`    | Необходимые заголовки для доступа к объектам S3 с шифрованием SSE-C.                                                                                                                                                                         | -                                        |
| `server_side_encryption_kms_key_id`             | Необходимые заголовки для доступа к объектам S3 с [шифрованием SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html). Пустая строка означает использование управляемого AWS ключа для S3.                 | -                                        |
| `server_side_encryption_kms_encryption_context` | Заголовок контекста шифрования для SSE-KMS (используется с `server_side_encryption_kms_key_id`).                                                                                                                                             | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | Включает ключи бакета S3 для SSE-KMS (используется с `server_side_encryption_kms_key_id`).                                                                                                                                                   | Соответствует настройке на уровне бакета |
| `s3_max_put_rps`                                | Максимальное количество запросов PUT в секунду до начала ограничения пропускной способности.                                                                                                                                                 | `0` (без ограничений)                    |
| `s3_max_put_burst`                              | Максимальное количество одновременных запросов PUT до достижения лимита RPS.                                                                                                                                                                 | То же, что и `s3_max_put_rps`            |
| `s3_max_get_rps`                                | Максимальное количество запросов GET в секунду до начала ограничения пропускной способности.                                                                                                                                                 | `0` (без ограничений)                    |
| `s3_max_get_burst`                              | Максимальное количество одновременных запросов GET до достижения лимита RPS.                                                                                                                                                                 | То же, что и `s3_max_get_rps`            |
| `read_resource`                                 | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов чтения.                                                                                                                                                          | Пустая строка (отключено)                |
| `write_resource`                                | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов записи.                                                                                                                                                          | Пустая строка (отключено)                |
| `key_template`                                  | Определяет формат генерации ключа объекта, используя синтаксис [re2](https://github.com/google/re2/wiki/Syntax). Требует флага `storage_metadata_write_full_object_key`. Несовместим с `root path` в `endpoint`. Требует `key_compatibility_prefix`. | -                                        |
| `key_compatibility_prefix`                      | Обязателен при использовании `key_template`. Указывает предыдущий `root path` из `endpoint` для чтения более старых версий метаданных.                                                                                                       | -                                        |
| `read_only`                                      | Разрешает только чтение с диска.                                                                                                                                                                                                             | -                                        |
:::note
Google Cloud Storage (GCS) также поддерживается с использованием типа `s3`. См. [MergeTree с хранилищем GCS](/integrations/gcs).
:::

### Использование Plain Storage {#plain-storage}



В версии `22.10` был введён новый тип диска `s3_plain`, который предоставляет хранилище с однократной записью.
Параметры его конфигурации такие же, как у типа диска `s3`.
В отличие от типа диска `s3`, он хранит данные как есть. Другими словами,
вместо случайно сгенерированных имён блобов он использует обычные имена файлов
(так же, как ClickHouse хранит файлы на локальном диске) и не хранит никаких
метаданных локально. Например, метаданные восстанавливаются из данных в `s3`.

Этот тип диска позволяет сохранять статическую версию таблицы, так как он не
позволяет выполнять слияния существующих данных и не позволяет вставлять новые
данные. Один из вариантов использования этого типа диска — создание на нём резервных копий, что можно сделать
через `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`. После этого
можно выполнить `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`
или использовать `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`.

Конфигурация:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Начиная с версии `24.1` можно настраивать любой диск объектного хранилища (`s3`, `azure`, `hdfs` (не поддерживается), `local`), используя тип метаданных `plain`.

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

### Использование S3 Plain Rewritable Storage

Новый тип диска `s3_plain_rewritable` был представлен в версии `24.4`.
Аналогично типу диска `s3_plain`, он не требует дополнительного хранилища для
файлов метаданных. Вместо этого метаданные хранятся в S3.
В отличие от типа диска `s3_plain`, `s3_plain_rewritable` позволяет выполнять
слияния и поддерживает операции `INSERT`.
[Мутации](/sql-reference/statements/alter#mutations) и репликация таблиц не поддерживаются.

Один из вариантов использования этого типа диска — нереплицируемые таблицы `MergeTree`. Хотя
тип диска `s3` подходит для нереплицируемых таблиц `MergeTree`, вы можете выбрать
тип диска `s3_plain_rewritable`, если вам не требуются локальные метаданные
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

Начиная с версии `24.5` можно настроить любой диск объектного хранилища
(`s3`, `azure`, `local`) с использованием типа метаданных `plain_rewritable`.

### Использование Azure Blob Storage

Семейство движков таблиц `MergeTree` может сохранять данные в [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)
с использованием диска типа `azure_blob_storage`.

Фрагмент конфигурации:


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

#### Параметры подключения

| Parameter                        | Description                                                                                                                                                                                                                                  | Default Value       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `storage_account_url` (Required) | URL аккаунта Azure Blob Storage. Примеры: `http://account.blob.core.windows.net` или `http://azurite1:10000/devstoreaccount1`.                                                                                                               | -                   |
| `container_name`                 | Имя целевого контейнера.                                                                                                                                                                                                                     | `default-container` |
| `container_already_exists`       | Управляет поведением при создании контейнера: <br />- `false`: создаёт новый контейнер <br />- `true`: подключается напрямую к существующему контейнеру <br />- не задан: проверяет существование контейнера и создаёт его при необходимости | -                   |

Параметры аутентификации (диск попробует все доступные методы **и** Managed Identity Credential):

| Parameter           | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `connection_string` | Для аутентификации с использованием строки подключения.                         |
| `account_name`      | Для аутентификации с использованием Shared Key (используется с `account_key`).  |
| `account_key`       | Для аутентификации с использованием Shared Key (используется с `account_name`). |

#### Параметры ограничения

| Parameter                            | Description                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `s3_max_single_part_upload_size`     | Максимальный размер одиночной загрузки блока в Blob Storage.                     |
| `min_bytes_for_seek`                 | Минимальный размер области, доступной для произвольного чтения (seek).           |
| `max_single_read_retries`            | Максимальное число попыток чтения фрагмента данных из Blob Storage.              |
| `max_single_download_retries`        | Максимальное число попыток загрузки буфера данных из Blob Storage.               |
| `thread_pool_size`                   | Максимальное количество потоков для создания экземпляров `IDiskRemote`.          |
| `s3_max_inflight_parts_for_one_file` | Максимальное количество параллельных запросов на загрузку частей одного объекта. |

#### Прочие параметры

| Parameter                        | Description                                                                                 | Default Value                            |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `metadata_path`                  | Локальный путь в файловой системе для хранения файлов метаданных для Blob Storage.          | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | Если `true`, пропускает проверку доступа к диску при запуске.                               | `false`                                  |
| `read_resource`                  | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на чтение.      | Пустая строка (отключено)                |
| `write_resource`                 | Имя ресурса для [планирования](/operations/workload-scheduling.md) запросов на запись.      | Пустая строка (отключено)                |
| `metadata_keep_free_space_bytes` | Объём свободного дискового пространства под метаданные, который необходимо зарезервировать. | -                                        |

Примеры рабочих конфигураций можно найти в каталоге интеграционных тестов (см., например, [test&#95;merge&#95;tree&#95;azure&#95;blob&#95;storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) или [test&#95;azure&#95;blob&#95;storage&#95;zero&#95;copy&#95;replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)).

:::note Репликация без копирования (zero-copy) не готова к промышленной эксплуатации
Репликация без копирования (zero-copy) по умолчанию отключена в ClickHouse версии 22.8 и выше. Эта функция не рекомендуется для использования в production.
:::


## Использование хранилища HDFS (не поддерживается)

В этой примерной конфигурации:

* диск имеет тип `hdfs` (не поддерживается)
* данные размещены по адресу `hdfs://hdfs1:9000/clickhouse/`

Обратите внимание, что HDFS не поддерживается, поэтому при его использовании могут возникать проблемы. При возникновении каких-либо проблем вы можете отправить pull request с исправлением.

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

Имейте в виду, что HDFS может не работать в некоторых крайних случаях.

### Использование шифрования данных

Вы можете шифровать данные, хранящиеся на внешних дисках [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) или [HDFS](#using-hdfs-storage-unsupported) (не поддерживается), а также на локальном диске. Чтобы включить режим шифрования, в конфигурационном файле нужно определить диск с типом `encrypted` и выбрать диск, на котором будут сохраняться данные. Диск типа `encrypted` шифрует все записываемые файлы на лету, а при чтении файлов с диска `encrypted` автоматически расшифровывает их. Таким образом, вы можете работать с диском `encrypted` так же, как с обычным диском.

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

Например, когда ClickHouse записывает данные из некоторой таблицы в файл `store/all_1_1_0/data.bin` на `disk1`, на самом деле этот файл будет записан на физический диск по пути `/path1/store/all_1_1_0/data.bin`.

При записи того же файла на `disk2` он фактически будет записан на физический диск по пути `/path1/path2/store/all_1_1_0/data.bin` в зашифрованном виде.

### Обязательные параметры

| Параметр | Тип    | Описание                                                                                                                                                            |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | String | Должен быть установлен в `encrypted` для создания зашифрованного диска.                                                                                             |
| `disk`   | String | Тип диска, используемого в качестве базового хранилища.                                                                                                             |
| `key`    | Uint64 | Ключ для шифрования и расшифровки. Может быть указан в шестнадцатеричном формате с использованием `key_hex`. Несколько ключей можно задать с помощью атрибута `id`. |

### Необязательные параметры

| Параметр         | Тип    | Значение по умолчанию | Описание                                                                                                                                               |
| ---------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `path`           | String | Корневой каталог      | Расположение на диске, где будут сохраняться данные.                                                                                                   |
| `current_key_id` | String | -                     | Идентификатор ключа, используемого для шифрования. Все указанные ключи могут использоваться для расшифровки.                                           |
| `algorithm`      | Enum   | `AES_128_CTR`         | Алгоритм шифрования. Варианты: <br />- `AES_128_CTR` (16-байтный ключ) <br />- `AES_192_CTR` (24-байтный ключ) <br />- `AES_256_CTR` (32-байтный ключ) |

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

### Использование локального кэша

Начиная с версии 22.3 можно настроить локальный кэш поверх дисков в конфигурации хранилища.
Для версий 22.3–22.7 кэш поддерживается только для дисков типа `s3`. Для версий &gt;= 22.8 кэш поддерживается для любого типа диска: S3, Azure, Local, Encrypted и т. д.
Для версий &gt;= 23.5 кэш поддерживается только для удалённых типов дисков: S3, Azure, HDFS (не поддерживается).
Кэш использует политику кэширования `LRU`.

Пример конфигурации для версий 22.8 и выше:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... конфигурация S3 ...
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

Пример конфигурации для версий до 22.8:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... конфигурация S3 ...
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

Параметры конфигурации **диска файлового кэша**:

Эти параметры следует задавать в разделе конфигурации диска.


| Параметр                             | Тип     | Значение по умолчанию | Описание                                                                                                                                                                                                 |
|--------------------------------------|---------|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                               | String  | -                      | **Обязательный параметр**. Путь к каталогу, где будет храниться кэш.                                                                                                                                   |
| `max_size`                           | Size    | -                      | **Обязательный параметр**. Максимальный размер кэша в байтах или удобочитаемом формате (например, `10Gi`). При достижении лимита файлы удаляются по политике LRU. Поддерживаются форматы `ki`, `Mi`, `Gi` (начиная с v22.10). |
| `cache_on_write_operations`          | Boolean | `false`                | Включает кэширование при записи (write-through cache) для запросов `INSERT` и фоновых слияний. Может быть переопределён на уровне запроса с помощью `enable_filesystem_cache_on_write_operations`.     |
| `enable_filesystem_query_cache_limit`| Boolean | `false`                | Включает ограничение размера кэша для каждого запроса на основе `max_query_cache_size`.                                                                                                                |
| `enable_cache_hits_threshold`        | Boolean | `false`                | Если включено, данные кэшируются только после многократного чтения.                                                                                                                                    |
| `cache_hits_threshold`               | Integer | `0`                    | Количество чтений, необходимое перед кэшированием данных (требует `enable_cache_hits_threshold`).                                                                                                      |
| `enable_bypass_cache_with_threshold` | Boolean | `false`                | Не использует кэш для больших диапазонов чтения.                                                                                                                                                        |
| `bypass_cache_threshold`             | Size    | `256Mi`                | Размер диапазона чтения, при превышении которого кэш не используется (требует `enable_bypass_cache_with_threshold`).                                                                                   |
| `max_file_segment_size`              | Size    | `8Mi`                  | Максимальный размер одного файла кэша в байтах или удобочитаемом формате.                                                                                                                              |
| `max_elements`                       | Integer | `10000000`             | Максимальное количество файлов кэша.                                                                                                                                                                   |
| `load_metadata_threads`              | Integer | `16`                   | Количество потоков для загрузки метаданных кэша при запуске.                                                                                                                                           |

> **Примечание**: Значения размера поддерживают единицы, такие как `ki`, `Mi`, `Gi` и т. д. (например, `10Gi`).



## Параметры файлового кэша для запросов/профилей

| Параметр                                                                | Тип     | По умолчанию            | Описание                                                                                                                                                                           |
| ----------------------------------------------------------------------- | ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_filesystem_cache`                                               | Boolean | `true`                  | Включает/выключает использование кэша для конкретного запроса, даже если используется диск типа `cache`.                                                                           |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`           | Boolean | `false`                 | При включении читает данные только из кэша, если они уже там есть; новые данные не будут кэшироваться.                                                                             |
| `enable_filesystem_cache_on_write_operations`                           | Boolean | `false` (Cloud: `true`) | Включает сквозное кэширование при операциях записи (write-through cache). Требует параметра `cache_on_write_operations` в конфигурации кэша.                                       |
| `enable_filesystem_cache_log`                                           | Boolean | `false`                 | Включает детализированное логирование использования кэша в `system.filesystem_cache_log`.                                                                                          |
| `filesystem_cache_allow_background_download`                            | Boolean | `true`                  | Разрешает завершать частично скачанные сегменты в фоновом режиме. Отключите, чтобы все скачивания выполнялись в основном потоке для текущего запроса/сессии.                       |
| `max_query_cache_size`                                                  | Size    | `false`                 | Максимальный размер кэша на один запрос. Требует параметра `enable_filesystem_query_cache_limit` в конфигурации кэша.                                                              |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | Boolean | `true`                  | Управляет поведением при достижении `max_query_cache_size`: <br />- `true`: останавливает скачивание новых данных <br />- `false`: вытесняет старые данные, чтобы освободить место |

:::warning
Параметры конфигурации кэша и параметры кэша на уровне запроса соответствуют последней версии ClickHouse;
в более ранних версиях часть параметров может не поддерживаться.
:::

#### Системные таблицы кэша

| Имя таблицы                   | Описание                                                           | Требования                                     |
| ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `system.filesystem_cache`     | Отображает текущее состояние файлового кэша.                       | Нет                                            |
| `system.filesystem_cache_log` | Предоставляет детальную статистику использования кэша по запросам. | Требуется `enable_filesystem_cache_log = true` |

#### Команды работы с кэшем

##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER`

Эта команда поддерживается только если `<cache_name>` не указан.

##### `SHOW FILESYSTEM CACHES`

Показывает список файловых кэшей, настроенных на сервере.
(Для версий меньше либо равных `22.8` команда называется `SHOW CACHES`)

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Кеши──────┐
│ s3_cache  │
└───────────┘
```

##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'`

Показывает конфигурацию кэша и некоторые общие статистические сведения для конкретного кэша.
Имя кэша можно получить из команды `SHOW FILESYSTEM CACHES`. (Для версий меньше или равных `22.8` команда называется `DESCRIBE CACHE`)

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```


| Кэш текущих метрик        | Кэш асинхронных метрик | Кэш событий профиля                                                                       |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `FilesystemCacheSize`     | `FilesystemCacheBytes` | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles` | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                        | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                        | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |

### Использование статического Web-хранилища (только для чтения)

Это диск только для чтения. Данные на нём только читаются и никогда не изменяются. Новая таблица
загружается на этот диск с помощью запроса `ATTACH TABLE` (см. пример ниже). Локальный диск
фактически не используется, каждый запрос `SELECT` будет приводить к HTTP-запросу для
получения необходимых данных. Любое изменение данных таблицы приведёт к
исключению, то есть следующие типы запросов не допускаются: [`CREATE TABLE`](/sql-reference/statements/create/table.md),
[`ALTER TABLE`](/sql-reference/statements/alter/index.md), [`RENAME TABLE`](/sql-reference/statements/rename#rename-table),
[`DETACH TABLE`](/sql-reference/statements/detach.md) и [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md).
Web-хранилище может использоваться только для чтения. Пример использования — публикация
примеров данных или миграция данных. Существует утилита `clickhouse-static-files-uploader`,
которая подготавливает каталог данных для заданной таблицы (`SELECT data_paths FROM system.tables WHERE name = 'table_name'`).
Для каждой необходимой таблицы вы получаете каталог файлов. Эти файлы можно загрузить,
например, на веб-сервер со статическими файлами. После такой подготовки
вы можете загрузить эту таблицу на любой сервер ClickHouse через `DiskWeb`.

В этой примерной конфигурации:

* диск имеет тип `web`
* данные размещены по адресу `http://nginx:80/test1/`
* используется кэш на локальном хранилище

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
Хранилище также можно временно задать в самом запросе, если веб-набор данных
не планируется использовать регулярно. См. [динамическую конфигурацию](#dynamic-configuration) и
пропустите редактирование файла конфигурации.

[Демонстрационный набор данных](https://github.com/ClickHouse/web-tables-demo) размещён в GitHub. Чтобы подготовить собственные таблицы для веб-хранилища, используйте инструмент [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

В этом запросе `ATTACH TABLE` указанное `UUID` совпадает с именем каталога с данными, а endpoint — это URL для необработанного содержимого на GitHub.


```sql
-- highlight-next-line
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('прочее' = 0, 'рядная застройка' = 1, 'двухквартирный дом' = 2, 'отдельный дом' = 3, 'квартира' = 4),
    is_new UInt8,
    duration Enum8('неизвестно' = 0, 'собственность' = 1, 'аренда' = 2),
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

Готовый тестовый пример. Нужно добавить эту конфигурацию в config:

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

Затем выполните этот запрос:


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

#### Обязательные параметры

| Параметр   | Описание                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `web`. В противном случае диск не создаётся.                                                                                           |
| `endpoint` | URL эндпоинта в формате `path`. URL эндпоинта должен содержать корневой путь к каталогу хранения данных, в который они были загружены. |

#### Необязательные параметры


| Параметр                           | Описание                                                                      | Значение по умолчанию |
|-------------------------------------|-------------------------------------------------------------------------------|------------------------|
| `min_bytes_for_seek`                | Минимальное количество байт, при котором используется операция seek вместо последовательного чтения | `1` МБ                 |
| `remote_fs_read_backoff_threashold` | Максимальное время ожидания при попытке чтения данных с удалённого диска     | `10000` секунд         |
| `remote_fs_read_backoff_max_tries`  | Максимальное количество попыток чтения с использованием backoff              | `5`                    |

Если запрос завершается с исключением `DB:Exception Unreachable URL`, можно попробовать отрегулировать настройки: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout), [http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout), [keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout).

Чтобы получить файлы для загрузки, выполните:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` (`--metadata-path` можно получить запросом `SELECT data_paths FROM system.tables WHERE name = 'table_name'`).

При загрузке файлов по `endpoint` их необходимо загружать в путь `<endpoint>/store/`, но в конфигурации должен быть указан только `endpoint`.

Если URL недоступен при загрузке диска во время старта сервера и инициализации таблиц, то все ошибки перехватываются. Если в этом случае возникли ошибки, таблицы можно перезагрузить (они станут видимыми) с помощью `DETACH TABLE table_name` -> `ATTACH TABLE table_name`. Если метаданные были успешно загружены при старте сервера, таблицы сразу становятся доступными.

Используйте настройку [http_max_single_read_retries](/operations/storing-data#web-storage) для ограничения максимального количества повторных попыток во время одного HTTP-чтения.

### Репликация без копирования данных (Zero-copy Replication, не готово для production) {#zero-copy}

Репликация без копирования данных (zero-copy) возможна, но не рекомендуется, для дисков `S3` и `HDFS` (для `HDFS` не поддерживается). Репликация без копирования данных означает, что если данные хранятся удалённо на нескольких машинах и должны быть синхронизированы, то реплицируются только метаданные (пути к частям данных), а не сами данные.

:::note Репликация без копирования данных не готова для production
Репликация без копирования данных по умолчанию отключена в ClickHouse версии 22.8 и выше. Эта функция не рекомендуется для использования в production.
:::
