---
description: 'Этот движок обеспечивает интеграцию с экосистемой Azure Blob Storage.'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'Табличный движок AzureBlobStorage'
doc_type: 'reference'
---

# Табличный движок AzureBlobStorage {#azureblobstorage-table-engine}

Этот движок предоставляет интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).

## Создание таблицы {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

* `endpoint` — URL конечной точки AzureBlobStorage с контейнером и префиксом. Дополнительно может содержать `account_name`, если это требуется используемому методу аутентификации (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`), либо эти параметры могут быть переданы отдельно с помощью `storage_account_url`, `account_name` и `container`. Для указания префикса должен использоваться `endpoint`.
* `endpoint_contains_account_name` — флаг, указывающий, содержит ли `endpoint` `account_name`, так как это требуется только для некоторых методов аутентификации. (По умолчанию: `true`)
* `connection_string|storage_account_url` — `connection_string` включает имя учетной записи и ключ ([Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)), либо здесь также можно указать URL учетной записи хранилища, а имя учетной записи и ключ учетной записи передать отдельными параметрами (см. параметры `account_name` и `account_key`).
* `container_name` — имя контейнера.
* `blobpath` — путь к файлу. Поддерживает следующие шаблоны (wildcards) в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
* `account_name` — если используется `storage_account_url`, то имя учетной записи можно указать здесь.
* `account_key` — если используется `storage_account_url`, то ключ учетной записи можно указать здесь.
* `format` — [формат](/interfaces/formats.md) файла.
* `compression` — поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла (то же, что и установка `auto`).
* `partition_strategy` – варианты: `WILDCARD` или `HIVE`. `WILDCARD` требует наличия `{_partition_id}` в пути, который будет заменён на ключ партиции. `HIVE` не допускает шаблоны, предполагает, что путь — это корень таблицы, и генерирует каталоги партиций в стиле Hive с идентификаторами Snowflake в качестве имён файлов и форматом файла в качестве расширения. По умолчанию используется `WILDCARD`.
* `partition_columns_in_data_file` — используется только со стратегией партиционирования `HIVE`. Сообщает ClickHouse, следует ли ожидать, что столбцы партиционирования будут записаны в файл данных. По умолчанию `false`.
* `extra_credentials` — используйте `client_id` и `tenant_id` для аутентификации. Если заданы `extra_credentials`, они имеют приоритет над `account_name` и `account_key`.

**Пример**

Пользователи могут использовать эмулятор Azurite для локальной разработки с Azure Storage. Дополнительные сведения — [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). При использовании локального экземпляра Azurite пользователям может потребоваться заменить `http://localhost:10000` на `http://azurite1:10000` в командах ниже, если предполагается, что Azurite доступен по хосту `azurite1`.

```sql
CREATE TABLE test_table (key UInt64, data String)
    ENGINE = AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV');

INSERT INTO test_table VALUES (1, 'a'), (2, 'b'), (3, 'c');

SELECT * FROM test_table;
```

```text
┌─ключ─┬─данные─┐
│  1   │   a   │
│  2   │   b   │
│  3   │   c   │
└──────┴───────┘
```

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## Аутентификация {#authentication}

В настоящее время есть три способа аутентификации:

* `Managed Identity` — может использоваться при указании `endpoint`, `connection_string` или `storage_account_url`.
* `SAS Token` — может использоваться при указании `endpoint`, `connection_string` или `storage_account_url`. Определяется по наличию символа &#39;?&#39; в URL. См. раздел [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) с примерами.
* `Workload Identity` — может использоваться при указании `endpoint` или `storage_account_url`. Если параметр `use_workload_identity` установлен в конфигурации, для аутентификации используется механизм [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications).

### Кэш данных {#data-cache}

Движок таблиц `Azure` поддерживает кэширование данных на локальном диске.
Параметры конфигурации и использование кэша файловой системы описаны в этом [разделе](/operations/storing-data.md/#using-local-cache).
Кэширование выполняется в зависимости от пути и ETag объекта хранилища, поэтому ClickHouse не будет читать устаревшую версию кэша.

Чтобы включить кэширование, используйте настройки `filesystem_cache_name = '<name>'` и `enable_filesystem_cache = 1`.

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
            <path>путь к каталогу кэша</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. повторно используйте конфигурацию кеша (и, соответственно, хранилище кеша) из секции `storage_configuration` ClickHouse, [описанной здесь](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — необязательный параметр. В большинстве случаев ключ партиционирования не нужен, а когда он все же требуется, обычно нет необходимости делать его более детализированным, чем по месяцам. Партиционирование не ускоряет выполнение запросов (в отличие от выражения ORDER BY). Не следует использовать слишком детализированное партиционирование. Не партиционируйте данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.

#### Стратегия партиционирования {#partition-strategy}

`WILDCARD` (по умолчанию): заменяет подстановочный шаблон `{_partition_id}` в пути к файлу фактическим ключом партиции. Чтение не поддерживается.

`HIVE` реализует партиционирование в стиле Hive для операций чтения и записи. Чтение реализовано с использованием рекурсивного glob-шаблона. Запись генерирует файлы в следующем формате: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

Примечание: при использовании стратегии партиционирования `HIVE` настройка `use_hive_partitioning` не влияет на поведение.

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
