---
description: 'Этот движок обеспечивает интеграцию с экосистемой Azure Blob Storage.'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'Табличный движок AzureBlobStorage'
doc_type: 'reference'
---



# Движок таблицы AzureBlobStorage

Этот движок предоставляет интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).



## Создание таблицы {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

- `endpoint` — URL конечной точки AzureBlobStorage с контейнером и префиксом. Может опционально содержать account_name, если используемый метод аутентификации этого требует (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`). Эти параметры также могут быть указаны отдельно с использованием storage_account_url, account_name и container. Для указания префикса следует использовать endpoint.
- `endpoint_contains_account_name` — флаг, указывающий, содержит ли endpoint значение account_name, поскольку это требуется только для определенных методов аутентификации (по умолчанию: true).
- `connection_string|storage_account_url` — connection_string включает имя и ключ учетной записи ([создание строки подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)). Также можно указать URL учетной записи хранилища, а имя и ключ учетной записи передать как отдельные параметры (см. параметры account_name и account_key).
- `container_name` — имя контейнера.
- `blobpath` — путь к файлу. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` — если используется storage_account_url, имя учетной записи можно указать здесь.
- `account_key` — если используется storage_account_url, ключ учетной записи можно указать здесь.
- `format` — [формат](/interfaces/formats.md) файла.
- `compression` — поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию сжатие определяется автоматически по расширению файла (эквивалентно значению `auto`).
- `partition_strategy` — варианты: `WILDCARD` или `HIVE`. `WILDCARD` требует наличия `{_partition_id}` в пути, который заменяется ключом партиции. `HIVE` не допускает подстановочные символы, предполагает, что путь является корнем таблицы, и генерирует партиционированные каталоги в стиле Hive с идентификаторами Snowflake в качестве имен файлов и форматом файла в качестве расширения. По умолчанию: `WILDCARD`.
- `partition_columns_in_data_file` — используется только со стратегией партиционирования `HIVE`. Указывает ClickHouse, следует ли ожидать записи столбцов партиций в файл данных. По умолчанию: `false`.
- `extra_credentials` — используйте `client_id` и `tenant_id` для аутентификации. Если указаны extra_credentials, им отдается приоритет над `account_name` и `account_key`.

**Пример**

Для локальной разработки с Azure Storage можно использовать эмулятор Azurite. Подробнее см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). При использовании локального экземпляра Azurite может потребоваться заменить `http://localhost:10000` на `http://azurite1:10000` в приведенных ниже командах, где предполагается, что Azurite доступен на хосте `azurite1`.

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


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.


## Аутентификация {#authentication}

В настоящее время доступны 3 способа аутентификации:

- `Managed Identity` — можно использовать, указав `endpoint`, `connection_string` или `storage_account_url`.
- `SAS Token` — можно использовать, указав `endpoint`, `connection_string` или `storage_account_url`. Определяется по наличию символа '?' в URL. Примеры см. в разделе [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens).
- `Workload Identity` — можно использовать, указав `endpoint` или `storage_account_url`. Если в конфигурации установлен параметр `use_workload_identity`, для аутентификации используется ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)).

### Кэш данных {#data-cache}

Движок таблиц `Azure` поддерживает кэширование данных на локальном диске.
Параметры конфигурации и использование кэша файловой системы см. в этом [разделе](/operations/storing-data.md/#using-local-cache).
Кэширование выполняется на основе пути и ETag объекта хранилища, поэтому ClickHouse не будет читать устаревшую версию из кэша.

Для включения кэширования используйте настройки `filesystem_cache_name = '<name>'` и `enable_filesystem_cache = 1`.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. добавьте следующий раздел в конфигурационный файл ClickHouse:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>путь к директории кэша</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. повторно используйте конфигурацию кэша (и, следовательно, хранилище кэша) из раздела `storage_configuration` ClickHouse, [описанного здесь](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — необязательный параметр. В большинстве случаев ключ партиционирования не требуется, а если он необходим, обычно не нужен ключ партиционирования более детальный, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детальное партиционирование. Не партиционируйте данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.

#### Стратегия партиционирования {#partition-strategy}

`WILDCARD` (по умолчанию): заменяет подстановочный знак `{_partition_id}` в пути к файлу на фактический ключ партиции. Чтение не поддерживается.

`HIVE` реализует партиционирование в стиле Hive для чтения и записи. Чтение реализовано с использованием рекурсивного шаблона glob. Запись генерирует файлы в следующем формате: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

Примечание: при использовании стратегии партиционирования `HIVE` настройка `use_hive_partitioning` не действует.

Пример стратегии партиционирования `HIVE`:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

```


┌─&#95;path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```


## См. также {#see-also}

[Табличная функция Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
