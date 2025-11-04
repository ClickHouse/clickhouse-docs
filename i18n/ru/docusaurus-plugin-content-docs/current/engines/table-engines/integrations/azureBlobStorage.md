---
slug: '/engines/table-engines/integrations/azureBlobStorage'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
description: 'Этот движок предоставляет интеграцию с экосистемой Azure Blob Storage.'
title: 'Движок таблиц AzureBlobStorage'
doc_type: reference
---
# Движок таблиц AzureBlobStorage

Этот движок предоставляет интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).

## Создание таблицы {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

- `endpoint` — URL-адрес конечной точки AzureBlobStorage с контейнером и префиксом. Опционально может содержать account_name, если используемый метод аутентификации требует этого. (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) или эти параметры могут быть указаны отдельно с использованием storage_account_url, account_name и container. Для указания префикса следует использовать endpoint.
- `endpoint_contains_account_name` - Этот флаг используется для указания, содержит ли конечная точка account_name, так как это необходимо только для некоторых методов аутентификации. (По умолчанию: true)
- `connection_string|storage_account_url` — connection_string включает имя и ключ учетной записи ([Создать строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL-адрес учетной записи хранилища здесь, а имя учетной записи и ключ учетной записи в качестве отдельных параметров (см. параметры account_name и account_key)
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, тогда имя учетной записи можно указать здесь
- `account_key` - если используется storage_account_url, тогда ключ учетной записи можно указать здесь
- `format` — [формат](/interfaces/formats.md) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет автоматически определена сжатие по расширению файла. (то же самое, что и установка на `auto`).
- `partition_strategy` – Опции: `WILDCARD` или `HIVE`. `WILDCARD` требует наличие `{_partition_id}` в пути, который заменяется на ключ партиции. `HIVE` не допускает подстановочные знаки, предполагает, что путь является корнем таблицы, и генерирует каталоги, разделенные по стандарту Hive, с идентификаторами Snowflake в качестве имен файлов и формата файла в качестве расширения. По умолчанию: `WILDCARD`
- `partition_columns_in_data_file` - Используется только с стратегией партиционирования `HIVE`. Указывает ClickHouse, ожидать ли записи столбцов партиции в файле данных. По умолчанию `false`.
- `extra_credentials` - Используйте `client_id` и `tenant_id` для аутентификации. Если предоставлены дополнительные учетные данные, им будет предоставлено преимущество перед `account_name` и `account_key`.

**Пример**

Пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Дополнительные сведения [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Если используется локальный экземпляр Azurite, пользователи могут заменить `http://localhost:10000` на `http://azurite1:10000` в приведенных ниже командах, где предполагается, что Azurite доступен на хосте `azurite1`.

```sql
CREATE TABLE test_table (key UInt64, data String)
    ENGINE = AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV');

INSERT INTO test_table VALUES (1, 'a'), (2, 'b'), (3, 'c');

SELECT * FROM test_table;
```

```text
┌─key──┬─data──┐
│  1   │   a   │
│  2   │   b   │
│  3   │   c   │
└──────┴───────┘
```

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## Аутентификация {#authentication}

В настоящее время существует 3 способа аутентификации:
- `Managed Identity` - Может быть использован при предоставлении `endpoint`, `connection_string` или `storage_account_url`.
- `SAS Token` - Может быть использован при предоставлении `endpoint`, `connection_string` или `storage_account_url`. Определяется по наличию '?' в URL. См. [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.
- `Workload Identity` - Может быть использован при предоставлении `endpoint` или `storage_account_url`. Если в конфигурации установлен параметр `use_workload_identity`, ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) используется для аутентификации.

### Кэш данных {#data-cache}

Движок таблицы `Azure` поддерживает кэширование данных на локальном диске. См. параметры конфигурации файловой системы кэша и использование в этом [разделе](/operations/storing-data.md/#using-local-cache). Кэширование происходит в зависимости от пути и ETag объекта хранения, поэтому clickhouse не будет читать устаревшую версию кэша.

Чтобы включить кэширование, используйте настройку `filesystem_cache_name = '<name>'` и `enable_filesystem_cache = 1`.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. добавьте следующий раздел в файл конфигурации clickhouse:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>path to cache directory</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. повторно используйте конфигурацию кэша (и, следовательно, хранилище кэша) из раздела `storage_configuration` clickhouse, [описанного здесь](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — Опционально. В большинстве случаев вам не нужен ключ партиции, и если он нужен, вам обычно не нужен ключ партиции более детализированный, чем по месяцу. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Вы никогда не должны использовать слишком детализированное партиционирование. Не разделяйте свои данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцу используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций здесь имеют формат `"YYYYMM"`.

#### Стратегия партиционирования {#partition-strategy}

`WILDCARD` (по умолчанию): Заменяет подстановочный знак `{_partition_id}` в пути файла на фактический ключ партиции. Чтение не поддерживается.

`HIVE` реализует партиционирование в стиле hive для чтения и записи. Чтение реализовано с использованием рекурсивного шаблона glob. Запись генерирует файлы в следующем формате: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

Примечание: При использовании стратегии партиционирования `HIVE` настройка `use_hive_partitioning` не оказывает влияния.

Пример стратегии партиционирования `HIVE`:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

   ┌─_path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐
1. │ cont/hive_partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive_partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘
```

## См. также {#see-also}

[Функция таблицы Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)