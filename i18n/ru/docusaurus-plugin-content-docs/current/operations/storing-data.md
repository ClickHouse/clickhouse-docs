---
description: 'Документация для highlight-next-line'
sidebar_label: 'Внешние диски для хранения данных'
sidebar_position: 68
slug: /operations/storing-data
title: 'Внешние диски для хранения данных'
---

Данные, обрабатываемые в ClickHouse, обычно хранятся в локальной файловой системе — на той же машине, что и сервер ClickHouse. Для этого требуются диски большой ёмкости, которые могут быть достаточно дорогими. Чтобы избежать этого, вы можете хранить данные удаленно. Поддерживаются различные хранилища:
1. [Amazon S3](https://aws.amazon.com/s3/) объектное хранилище.
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).
3. Неподдерживаемое: Распределённая файловая система Hadoop ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouse также поддерживает внешние движки таблиц, которые отличаются от внешних вариантов хранения, описанных на этой странице, так как они позволяют читать данные, хранящиеся в каком-либо общем файловом формате (например, Parquet), в то время как на этой странице описывается конфигурация хранилища для таблиц семейства ClickHouse `MergeTree` или `Log`.
1. Для работы с данными, хранящимися на дисках `Amazon S3`, используйте движок таблицы [S3](/engines/table-engines/integrations/s3.md).
2. Для работы с данными, хранящимися в Azure Blob Storage, используйте движок таблицы [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md).
3. Неподдерживаемое: Для работы с данными в распределённой файловой системе Hadoop — движок таблицы [HDFS](/engines/table-engines/integrations/hdfs.md).
:::

## Конфигурация внешнего хранилища {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и [Log](/engines/table-engines/log-family/log.md) семейство движков таблиц могут хранить данные на `S3`, `AzureBlobStorage`, `HDFS` (неподдерживаемое) с использованием диска с типами `s3`, `azure_blob_storage`, `hdfs` (неподдерживаемое) соответственно.

Конфигурация диска требует:
1. Раздел `type`, равный одному из `s3`, `azure_blob_storage`, `hdfs` (неподдерживаемое), `local_blob_storage`, `web`.
2. Конфигурацию конкретного типа внешнего хранилища.

Начиная с версии clickhouse 24.1, можно использовать новую конфигурационную опцию.
Необходимо указать:
1. `type`, равный `object_storage`
2. `object_storage_type`, равный одному из `s3`, `azure_blob_storage` (или просто `azure` с `24.3`), `hdfs` (неподдерживаемое), `local_blob_storage` (или просто `local` с `24.3`), `web`.
Дополнительно можно указать `metadata_type` (по умолчанию равный `local`), но также его можно установить в `plain`, `web` и, начиная с `24.4`, `plain_rewritable`.
Использование типа метаданных `plain` описано в [разделе о plain storage](/operations/storing-data#plain-storage), тип метаданных `web` можно использовать только с типом объекта хранения `web`, тип метаданных `local` хранит метафайлы локально (каждый метафайл содержит отображение на файлы в объектном хранилище и некоторую дополнительную метаинформацию о них).

Например, конфигурационная опция
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

равна конфигурации (с `24.1`):
```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

Конфигурация
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

равна
```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Пример полной конфигурации хранилища будет выглядеть так:
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

Начиная с версии clickhouse 24.1, это также может выглядеть так:
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

Чтобы сделать конкретный тип хранилища значением по умолчанию для всех таблиц `MergeTree`, добавьте следующий раздел в файл конфигурации:
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

Если вы хотите настроить конкретную политику хранения только для конкретной таблицы, вы можете определить ее в настройках при создании таблицы:

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

Вы также можете использовать `disk` вместо `storage_policy`. В этом случае не требуется иметь раздел `storage_policy` в файле конфигурации, только раздел `disk` будет достаточен.

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## Динамическая конфигурация {#dynamic-configuration}

Также существует возможность указать конфигурацию хранилища без предопределенного диска в конфигурационном файле, но ее можно настроить в настройках запроса `CREATE`/`ATTACH`.

Следующий пример запроса базируется на вышеупомянутой динамической конфигурации диска и показывает, как использовать локальный диск для кэширования данных из таблицы, хранящейся по URL.

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

В следующем примере добавляется кэш к внешнему хранилищу.

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

В настройках, выделенных ниже, обратите внимание, что диск с `type=web` вложен внутри диска с `type=cache`.

:::note
Пример использует `type=web`, но любой тип диска может быть настроен как динамический, даже локальный диск. Локальные диски требуют, чтобы аргумент пути находился внутри параметра сервера `custom_local_disks_base_directory`, который не имеет значения по умолчанию, поэтому установите и это значение при использовании локального диска.
:::

Комбинация конфигурации на основе конфигурации и конфигурации, определённой с помощью SQL, также возможна:

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

где `web` берётся из конфигурационного файла сервера:

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

Обязательные параметры:

- `endpoint` — URL конечной точки S3 в `path` или `виртуальном хостинге` [стилях](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html). URL конечной точки должен содержать ведро и корневой путь для хранения данных.
- `access_key_id` — ID ключа доступа S3.
- `secret_access_key` — секретный ключ доступа S3.

Необязательные параметры:

- `region` — название региона S3.
- `support_batch_delete` — Этот параметр контролирует проверку на поддержку пакетных удалений. Установите это значение в `false`, когда используете Google Cloud Storage (GCS), так как GCS не поддерживает пакетные удаления, и предотвращение проверок предотвратит сообщение об ошибке в логах.
- `use_environment_credentials` — Читает AWS учетные данные из переменных окружения AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY и AWS_SESSION_TOKEN, если они существуют. Значение по умолчанию `false`.
- `use_insecure_imds_request` — Если установлено в `true`, клиент S3 будет использовать небезопасный запрос IMDS при получении учетных данных из метаданных Amazon EC2. Значение по умолчанию `false`.
- `expiration_window_seconds` — Период времени для проверки, истекли ли учетные данные на основе срока действия. Необязательный, значение по умолчанию `120`.
- `proxy` — Конфигурация прокси для конечной точки S3. Каждый элемент `uri` внутри блока `proxy` должен содержать URL прокси.
- `connect_timeout_ms` — Тайм-аут подключения сокета в миллисекундах. Значение по умолчанию `10 секунд`.
- `request_timeout_ms` — Тайм-аут запроса в миллисекундах. Значение по умолчанию `5 секунд`.
- `retry_attempts` — Количество попыток повторного запроса в случае неудачного запроса. Значение по умолчанию `10`.
- `single_read_retries` — Количество попыток повторного запроса в случае разрыва соединения во время чтения. Значение по умолчанию `4`.
- `min_bytes_for_seek` — Минимальное количество байтов для использования операции перемотки вместо последовательного чтения. Значение по умолчанию `1 Mb`.
- `metadata_path` — Путь на локальной файловой системе для хранения метафайлов для S3. Значение по умолчанию `/var/lib/clickhouse/disks/<disk_name>/`.
- `skip_access_check` — Если `true`, проверки доступа к диску не будут выполняться при запуске диска. Значение по умолчанию `false`.
- `header` — Добавляет указанный HTTP заголовок к запросу к данной конечной точке. Необязательный параметр, может быть указан несколько раз.
- `server_side_encryption_customer_key_base64` — Если указано, будут установлены необходимые заголовки для доступа к объектам S3 с шифрованием SSE-C.
- `server_side_encryption_kms_key_id` - Если указано, будут установлены необходимые заголовки для доступа к объектам S3 с [шифрованием SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html). Если указана пустая строка, будет использоваться управляемый AWS ключ S3. Необязательный.
- `server_side_encryption_kms_encryption_context` - Если указано вместе с `server_side_encryption_kms_key_id`, будет установлен указанный заголовок контекста шифрования для SSE-KMS. Необязательный.
- `server_side_encryption_kms_bucket_key_enabled` - Если указано вместе с `server_side_encryption_kms_key_id`, будет установлен заголовок для включения ключей ведра S3 для SSE-KMS. Необязательный, может быть `true` или `false`, по умолчанию ничего не указывается (соответствует настройке на уровне ведра).
- `s3_max_put_rps` — Максимальная скорость PUT-запросов в секунду перед ограничением. Значение по умолчанию `0` (без ограничений).
- `s3_max_put_burst` — Максимальное количество запросов, которые могут быть выданы одновременно перед достижением ограничения запросов в секунду. По умолчанию (`0`) соответствует `s3_max_put_rps`.
- `s3_max_get_rps` — Максимальная скорость GET-запросов в секунду перед ограничением. Значение по умолчанию `0` (без ограничений).
- `s3_max_get_burst` — Максимальное количество запросов, которые могут быть выданы одновременно перед достижением ограничения запросов в секунду. По умолчанию (`0`) соответствует `s3_max_get_rps`.
- `read_resource` — Имя ресурса, которое будет использоваться для [планирования](/operations/workload-scheduling.md) запросов на чтение к этому диску. Значение по умолчанию — пустая строка (IO-планирование не включено для этого диска).
- `write_resource` — Имя ресурса, которое будет использоваться для [планирования](/operations/workload-scheduling.md) запросов на запись к этому диску. Значение по умолчанию — пустая строка (IO-планирование не включено для этого диска).
- `key_template` — Определите формат, с помощью которого генерируются ключи объектов. По умолчанию Clickhouse берет `root path` из параметра `endpoint` и добавляет случайный суффикс. Этот суффикс — это директория с 3 случайными символами и имя файла из 29 случайных символов. С помощью этой опции вы имеете полный контроль над тем, как генерируются ключи объектов. Некоторые сценарии использования требуют наличия случайных символов в префиксе или в середине ключа объекта. Например: `[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`. Значение обрабатывается с использованием [`re2`](https://github.com/google/re2/wiki/Syntax). Поддерживается только некоторый подмножество синтаксиса. Проверьте, поддерживается ли ваш предпочтительный формат, прежде чем использовать эту опцию. Диск не инициализируется, если clickhouse не может сгенерировать ключ по значению `key_template`. Это требует включенного флага функции [storage_metadata_write_full_object_key](/operations/storing-data#s3-storage). Он запрещает объявление `root path` в параметре `endpoint`. Требуется определение опции `key_compatibility_prefix`.
- `key_compatibility_prefix` — Эта опция обязательна, когда используется опция `key_template`. Чтобы иметь возможность читать ключи объектов, которые были сохранены в метафайловых файлах с версией метаданных ниже `VERSION_FULL_OBJECT_KEY`, предыдущий `root path` из параметра `endpoint` должен быть установлен здесь.

:::note
Также поддерживается Google Cloud Storage (GCS) с использованием типа `s3`. См. [MergeTree на базе GCS](/integrations/gcs).
:::

### Использование простого хранилища {#plain-storage}

В `22.10` был введен новый тип диска `s3_plain`, который предоставляет хранилище с записыванием только один раз. Параметры конфигурации такие же, как для типа диска `s3`.
В отличие от типа диска `s3`, он хранит данные как есть, например, вместо случайно сгенерированных имен блобов, он использует обычные имена файлов (так же, как clickhouse хранит файлы на локальном диске) и не хранит никаких метаданных локально, например, они выводятся из данных на `s3`.

Этот тип диска позволяет хранить статическую версию таблицы, так как он не позволяет выполнять слияния с существующими данными и не позволяет вставку новых данных.
Сценарий использования этого типа диска — создание резервных копий на нём, что может быть выполнено через `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`. После этого вы можете выполнить `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` или используя `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`.

Конфигурация:
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

Начиная с `24.1`, возможно настроить любой объектный диск (`s3`, `azure`, `hdfs` (неподдерживаемое), `local`) с использованием типа метаданных `plain`.

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
Подобно типу диска `s3_plain`, он не требует дополнительного хранилища для метафайлов; вместо этого метаданные хранятся в S3.
В отличие от типа диска `s3_plain`, `s3_plain_rewritable` разрешает выполнять слияния и поддерживает операции INSERT.
[Мутации](/sql-reference/statements/alter#mutations) и репликация таблиц не поддерживаются.

Сценарий использования этого типа диска — это не реплицированные таблицы `MergeTree`. Хотя тип диска `s3` подходит для не реплицированных таблиц MergeTree, вы можете выбрать тип диска `s3_plain_rewritable`, если не требуете локальных метаданных для таблицы и готовы принять ограниченный набор операций. Это может быть полезно, например, для системных таблиц.

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

Начиная с `24.5`, возможно настроить любой объектный диск (`s3`, `azure`, `local`) с использованием типа метаданных `plain_rewritable`.

### Использование Azure Blob Storage {#azure-blob-storage}

Движки таблиц семейства `MergeTree` могут хранить данные в [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) с использованием диска с типом `azure_blob_storage`.

Разметка конфигурации:
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

Параметры подключения:
* `storage_account_url` - **Обязательный**, URL-адрес хранилища Azure Blob Storage, например, `http://account.blob.core.windows.net` или `http://azurite1:10000/devstoreaccount1`.
* `container_name` - Имя целевого контейнера, по умолчанию `default-container`.
* `container_already_exists` - Если установлено в `false`, в учетной записи хранилища создается новый контейнер `container_name`, если установлено в `true`, диск подключается напрямую к контейнеру, а если не установлено, диск подключается к учетной записи, проверяет, существует ли контейнер `container_name`, и создает его, если он ещё не существует.

Параметры аутентификации (диск попытается все доступные методы **и** Managed Identity Credential):
* `connection_string` - Для аутентификации с использованием строки подключения.
* `account_name` и `account_key` - Для аутентификации с использованием общего ключа.

Параметры ограничения (в основном для внутреннего использования):
* `s3_max_single_part_upload_size` - Ограничивает размер одного блока, загружаемого в Blob Storage.
* `min_bytes_for_seek` - Ограничивает размер области, доступной для перемотки.
* `max_single_read_retries` - Ограничивает количество попыток прочитать кусок данных из Blob Storage.
* `max_single_download_retries` - Ограничивает количество попыток загрузить читаемый буфер из Blob Storage.
* `thread_pool_size` - Ограничивает количество потоков, с помощью которых создаётся `IDiskRemote`.
* `s3_max_inflight_parts_for_one_file` - Ограничивает количество `put` запросов, которые могут выполняться одновременно для одного объекта.

Другие параметры:
* `metadata_path` - Путь на локальной файловой системе для хранения метафайлов для Blob Storage. Значение по умолчанию — `/var/lib/clickhouse/disks/<disk_name>/`.
* `skip_access_check` — Если значение `true`, проверки доступа к диску не будут выполняться при запуске диска. Значение по умолчанию `false`.
* `read_resource` — Имя ресурса, которое будет использоваться для [планирования](/operations/workload-scheduling.md) запросов на чтение к этому диску. Значение по умолчанию — пустая строка (IO-планирование не включено для этого диска).
* `write_resource` — Имя ресурса, которое будет использоваться для [планирования](/operations/workload-scheduling.md) запросов на запись к этому диску. Значение по умолчанию — пустая строка (IO-планирование не включено для этого диска).
* `metadata_keep_free_space_bytes` - количество свободного места на диске для метаданных, которое нужно зарезервировать.

Примеры рабочих конфигураций можно найти в директории интеграционных тестов (см. например, [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) или [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)).

:::note Репликация без копирования не готова к использованию в производственной среде
Репликация без копирования по умолчанию отключена в версии ClickHouse 22.8 и выше. Эта функция не рекомендуется к использованию в производственной среде.
:::

## Использование HDFS хранилища (неподдерживаемое) {#using-hdfs-storage-unsupported}

В этом примере конфигурации:
- диск имеет тип `hdfs` (неподдерживаемое)
- данные размещены по адресу `hdfs://hdfs1:9000/clickhouse/`

К слову сказать, HDFS не поддерживается, и поэтому могут возникнуть проблемы при его использовании. Не стесняйтесь делать pull request с исправлением, если возникнет какая-либо проблема.

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

Вы можете зашифровать данные, хранящиеся на [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3), или на внешних дисках [HDFS](#using-hdfs-storage-unsupported) (неподдерживаемое), или на локальном диске. Чтобы включить режим шифрования, в файле конфигурации вы должны определить диск с типом `encrypted` и выбрать диск, на котором будут сохраняться данные. Зашифрованный диск шифрует все записанные файлы на лету, и при чтении файлов с зашифрованного диска они автоматически расшифровываются. Поэтому вы можете работать с зашифрованным диском так же, как с обычным.

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

Например, когда ClickHouse записывает данные из некоторой таблицы в файл `store/all_1_1_0/data.bin` на `disk1`, то на самом деле этот файл будет записан на физический диск по пути `/path1/store/all_1_1_0/data.bin`.

Когда вы записываете тот же файл на `disk2`, он на самом деле будет записан на физический диск по пути `/path1/path2/store/all_1_1_0/data.bin` в зашифрованном режиме.

Обязательные параметры:

- `type` — `encrypted`. В противном случае зашифрованный диск не создается.
- `disk` — Тип диска для хранения данных.
- `key` — Ключ для шифрования и дешифрования. Тип: [Uint64](/sql-reference/data-types/int-uint.md). Вы можете использовать параметр `key_hex` для кодирования ключа в шестнадцатеричной форме.
    Вы можете указать несколько ключей, используя атрибут `id` (см. пример ниже).

Необязательные параметры:

- `path` — Путь к месту на диске, где будут сохранены данные. Если не указано, данные будут сохранены в корневом каталоге.
- `current_key_id` — Ключ, используемый для шифрования. Все указанные ключи могут быть использованы для дешифрования, и вы всегда можете переключаться на другой ключ, сохраняя доступ к ранее зашифрованным данным.
- `algorithm` — [Алгоритм](/sql-reference/statements/create/table#encryption-codecs) для шифрования. Возможные значения: `AES_128_CTR`, `AES_192_CTR` или `AES_256_CTR`. Значение по умолчанию: `AES_128_CTR`. Длина ключа зависит от алгоритма: `AES_128_CTR` — 16 байт, `AES_192_CTR` — 24 байта, `AES_256_CTR` — 32 байта.

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

Возможна настройка локального кэша на дисках конфигурации хранения, начиная с версии 22.3. 
Для версий 22.3 - 22.7 кэш поддерживается только для типа диска `s3`. Для версий >= 22.8 кэш поддерживается для любых типов дисков: S3, Azure, Local, Encrypted и т. д. 
Для версий >= 23.5 кэш поддерживается только для удаленных типов дисков: S3, Azure, HDFS (не поддерживается). 
Кэш использует политику кэширования `LRU`.

Пример конфигурации для версий 22.8 и выше:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... конфигурация s3 ...
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
        </policies>
    </storage_configuration>
```

Пример конфигурации для версий, предшествующих 22.8:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... конфигурация s3 ...
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
        </policies>
    </storage_configuration>
```

**Настройки конфигурации диска кэша**:

Эти настройки должны быть определены в разделе конфигурации диска.

- `path` - путь к каталогу с кэшем. По умолчанию: None, эта настройка обязательна.

- `max_size` - максимальный размер кэша в байтах или в удобочитаемом формате, например, `ki, Mi, Gi и т. д.`. Пример: `10Gi` (такой формат работает, начиная с версии `22.10`). Когда лимит будет достигнут, файлы кэша удаляются в соответствии с политикой выброса кэша. По умолчанию: None, эта настройка обязательна.

- `cache_on_write_operations` - возможность включить кэш `write-through` (кэширование данных при любых операциях записи: запросы `INSERT`, фоновое слияние). По умолчанию: `false`. Кэш `write-through` можно отключить для конкретного запроса с помощью настройки `enable_filesystem_cache_on_write_operations` (данные кэшируются только при включении как настроек кэша, так и соответствующей настройки запроса).

- `enable_filesystem_query_cache_limit` - возможность ограничить размер кэша, который загружается в рамках каждого запроса (зависит от пользовательской настройки `max_query_cache_size`). По умолчанию: `false`.

- `enable_cache_hits_threshold` - число, определяющее, сколько раз некоторые данные должны быть прочитаны, прежде чем они будут закэшированы. По умолчанию: `false`. Этот порог может быть задействован с помощью `cache_hits_threshold`. По умолчанию: `0`, например, данные кэшируются с первой попытки их прочитать.

- `enable_bypass_cache_with_threshold` - позволяет полностью пропустить кэш, если запрашиваемый диапазон чтения превышает порог. По умолчанию: `false`. Этот порог может быть определен с помощью `bypass_cache_threashold`. По умолчанию: `268435456` (`256Mi`).

- `max_file_segment_size` - максимальный размер одного файла кэша в байтах или в удобочитаемом формате (`ki, Mi, Gi и т. д.`, пример `10Gi`). По умолчанию: `8388608` (`8Mi`).

- `max_elements` - лимит на количество файлов кэша. По умолчанию: `10000000`.

- `load_metadata_threads` - количество потоков, используемых для загрузки метаданных кэша в момент запуска. По умолчанию: `16`.

**Настройки запросов/профилей кэша**:

Некоторые из этих настроек отключат функции кэша для запроса/профиля, которые включены по умолчанию или в настройках конфигурации диска. Например, вы можете включить кэш в конфигурации диска и отключить его для конкретного запроса/профиля, установив `enable_filesystem_cache` в `false`. Также установка `cache_on_write_operations` в `true` в конфигурации диска означает, что кэш "write-through" включен. Но если вам нужно отключить эту общую настройку для конкретных запросов, установка `enable_filesystem_cache_on_write_operations` в `false` означает, что кэширование операций записи будет отключено для конкретного запроса/профиля.

- `enable_filesystem_cache` - позволяет отключить кэш для запроса, даже если политика хранения была настроена с типом диска `cache`. По умолчанию: `true`.

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - позволяет использовать кэш в запросе только в случае его существования, в противном случае данные запроса не будут записаны в локальное хранилище кэша. По умолчанию: `false`.

- `enable_filesystem_cache_on_write_operations` - включает кэш `write-through`. Эта настройка работает только если настройка `cache_on_write_operations` в конфигурации кэша активирована. По умолчанию: `false`. Значение по умолчанию в облаке: `true`.

- `enable_filesystem_cache_log` - включает логирование в таблицу `system.filesystem_cache_log`. Предоставляет детальное представление о использовании кэша для каждого запроса. Может быть включено для определенных запросов или активировано в профиле. По умолчанию: `false`.

- `max_query_cache_size` - лимит для размера кэша, который может быть записан в локальное хранилище кэша. Требуется включенная `enable_filesystem_query_cache_limit` в конфигурации кэша. По умолчанию: `false`.

- `skip_download_if_exceeds_query_cache` - позволяет изменить поведение настройки `max_query_cache_size`. По умолчанию: `true`. Если эта настройка включена и лимит загрузки кэша во время запроса достигнут, больше кэша не будет загружено в хранилище кэша. Если эта настройка отключена и лимит загрузки кэша во время запроса достигнут, кэш все равно будет записываться за счет вытеснения ранее загруженных (в рамках текущего запроса) данных. Например, второе поведение позволяет сохранить поведение "последнего использованного".

**Предупреждение**  
Настройки конфигурации кэша и настройки запросов кэша соответствуют последней версии ClickHouse, для более ранних версий может быть что-то не поддерживается.

**Системные таблицы кэша**:

- `system.filesystem_cache` - системные таблицы, которые показывают текущее состояние кэша.

- `system.filesystem_cache_log` - системная таблица, которая показывает детальное использование кэша по запросу. Требуется, чтобы настройка `enable_filesystem_cache_log` была установлена в `true`.

**Команды кэша**:

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` поддерживается только если `<cache_name>` не указан

- `SHOW FILESYSTEM CACHES` -- показать список файловых систем кэша, которые были настроены на сервере. (Для версий &lt;= `22.8` команда называется `SHOW CACHES`)

```sql
SHOW FILESYSTEM CACHES
```

Результат:

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - показать конфигурацию кэша и некоторую общую статистику для конкретного кэша. Имя кэша можно взять из команды `SHOW FILESYSTEM CACHES`. (Для версий &lt;= `22.8` команда называется `DESCRIBE CACHE`)

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

Текущие метрики кэша:

- `FilesystemCacheSize`

- `FilesystemCacheElements`

Асинхронные метрики кэша:

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

События профиля кэша:

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### Использование статического веб-хранилища (только для чтения) {#web-storage}

Это диск только для чтения. Его данные только читаются и никогда не изменяются. Новая таблица загружается на этот диск через запрос `ATTACH TABLE` (см. пример ниже). Локальный диск фактически не используется, каждый запрос `SELECT` приведет к HTTP-запросу для получения необходимых данных. Все изменения данных таблицы приведут к исключению, то есть следующие типы запросов не разрешены: [CREATE TABLE](/sql-reference/statements/create/table.md), [ALTER TABLE](/sql-reference/statements/alter/index.md), [RENAME TABLE](/sql-reference/statements/rename#rename-table), [DETACH TABLE](/sql-reference/statements/detach.md) и [TRUNCATE TABLE](/sql-reference/statements/truncate.md). 
Веб-хранилище может использоваться для целей только чтения. Пример использования - хостинг тестовых данных или миграция данных. 
Существует инструмент `clickhouse-static-files-uploader`, который подготавливает каталог данных для данной таблицы (`SELECT data_paths FROM system.tables WHERE name = 'table_name'`). Для каждой нужной таблицы вы получаете каталог файлов. Эти файлы могут быть загружены, например, на веб-сервер со статическими файлами. После этой подготовки вы можете загрузить эту таблицу на любой сервер ClickHouse через `DiskWeb`.

В этой примерной конфигурации:
- диск имеет тип `web`
- данные размещены по адресу `http://nginx:80/test1/`
- используется кэш на локальном хранилище

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
Хранилище также может быть настроено временно в рамках запроса, если ожидается, что набор данных веба не будет использоваться регулярно, см. [динамическую конфигурацию](#dynamic-configuration) и пропустите редактирование
конфигурационного файла.
:::

:::tip
Демонстрационный набор данных размещен на GitHub. Чтобы подготовить свои собственные таблицы для веб-хранилища, смотрите инструмент [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader).
:::

В этом запросе `ATTACH TABLE` предоставленный `UUID` соответствует имени каталога данных, а конечная точка - это URL для сырого содержимого GitHub.

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

Готовый тестовый случай. Вам нужно добавить эту конфигурацию в конфиг:

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

А затем выполните этот запрос:

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

Обязательные параметры:

- `type` — `web`. Иначе диск не создается.
- `endpoint` — URL конечной точки в формате `path`. URL конечной точки должен содержать корневой путь, чтобы хранить данные, где они были загружены.

Необязательные параметры:

- `min_bytes_for_seek` — минимальное количество байт, для использования операции поиска вместо последовательного чтения. Значение по умолчанию: `1` Мб.
- `remote_fs_read_backoff_threashold` — максимальное время ожидания при попытке прочитать данные для удаленного диска. Значение по умолчанию: `10000` секунд.
- `remote_fs_read_backoff_max_tries` — максимальное количество попыток чтения с обратным откатом. Значение по умолчанию: `5`.

Если запрос не удается, и возникает исключение `DB:Exception Unreachable URL`, то можно попробовать настроить параметры: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout), [http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout), [keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout).

Чтобы получить файлы для загрузки, выполните:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` (`--metadata-path` можно найти в запросе `SELECT data_paths FROM system.tables WHERE name = 'table_name'`).

При загрузке файлов по `endpoint` они должны загружаться в путь `<endpoint>/store/`, но конфигурация должна содержать только `endpoint`.

Если URL недоступен при загрузке диска, когда сервер запускает таблицы, то все ошибки перехватываются. Если в этом случае были ошибки, таблицы можно перезагрузить (стать видимыми) с помощью `DETACH TABLE table_name` -> `ATTACH TABLE table_name`. Если метаданные были успешно загружены при запуске сервера, таблицы будут доступны сразу же.

Используйте настройку [http_max_single_read_retries](/operations/storing-data#web-storage), чтобы ограничить максимальное количество повторных попыток во время одного HTTP-чтения.

### Репликация без копирования (не готово к производству) {#zero-copy}

Репликация без копирования возможна, но не рекомендуется, с дисками `S3` и `HDFS` (не поддерживается). Репликация без копирования означает, что если данные хранятся удаленно на нескольких машинах и их нужно синхронизировать, то только метаданные реплицируются (пути к частям данных), а не сами данные.

:::note Репликация без копирования не готова к производству
Репликация без копирования по умолчанию отключена в версии ClickHouse 22.8 и выше. Эта функция не рекомендована для использования в производственных условиях.
:::
