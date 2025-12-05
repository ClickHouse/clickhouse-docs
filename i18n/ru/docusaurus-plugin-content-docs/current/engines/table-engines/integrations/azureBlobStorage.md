---
description: 'Этот движок предоставляет интеграцию с экосистемой Azure Blob Storage.'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'Табличный движок AzureBlobStorage'
doc_type: 'reference'
---

# Движок таблицы AzureBlobStorage {#azureblobstorage-table-engine}

Этот движок обеспечивает интеграцию с экосистемой [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).

## Создание таблицы {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

* `endpoint` — URL-адрес AzureBlobStorage с контейнером и префиксом. При необходимости может включать account&#95;name, если он требуется выбранному методу аутентификации (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`), либо эти параметры могут быть переданы отдельно с помощью storage&#95;account&#95;url, account&#95;name и container. Для указания префикса следует использовать endpoint.
* `endpoint_contains_account_name` — флаг, указывающий, содержит ли endpoint account&#95;name; это требуется только для некоторых методов аутентификации. (По умолчанию: true)
* `connection_string|storage_account_url` — connection&#95;string включает имя учетной записи и ключ ([Создание строки подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)), либо здесь можно указать URL учетной записи хранилища и задать имя учетной записи и ключ учетной записи как отдельные параметры (см. параметры account&#95;name и account&#95;key).
* `container_name` — имя контейнера.
* `blobpath` — путь к файлу. Поддерживает следующие шаблоны (wildcards) в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
* `account_name` — если используется storage&#95;account&#95;url, здесь можно указать имя учетной записи.
* `account_key` — если используется storage&#95;account&#95;url, здесь можно указать ключ учетной записи.
* `format` — [format](/interfaces/formats.md) файла.
* `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла (то же, что и установка значения `auto`).
* `partition_strategy` — Опции: `WILDCARD` или `HIVE`. Для `WILDCARD` требуется наличие `{_partition_id}` в пути, который заменяется ключом партиции. `HIVE` не допускает использование шаблонов (wildcards), предполагает, что путь является корнем таблицы и генерирует каталоги партиций в стиле Hive с идентификаторами Snowflake в качестве имен файлов и форматом файла в качестве расширения. По умолчанию используется `WILDCARD`.
* `partition_columns_in_data_file` — используется только со стратегией партиционирования `HIVE`. Указывает ClickHouse, следует ли ожидать, что столбцы партиций будут записаны в файл данных. По умолчанию `false`.
* `extra_credentials` — используйте `client_id` и `tenant_id` для аутентификации. Если заданы extra&#95;credentials, они имеют приоритет над `account_name` и `account_key`.

**Пример**

Для локальной разработки с Azure Storage можно использовать эмулятор Azurite. Подробности см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). При использовании локального экземпляра Azurite может потребоваться заменить в приведенных ниже командах `http://azurite1:10000` на `http://localhost:10000`, если Azurite доступен по хосту `localhost`, а не `azurite1`.

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

* `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
* `_file` — Имя файла. Тип: `LowCardinality(String)`.
* `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
* `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.

## Аутентификация {#authentication}

В настоящее время есть три способа аутентификации:

* `Managed Identity` — может использоваться при указании `endpoint`, `connection_string` или `storage_account_url`.
* `SAS Token` — может использоваться при указании `endpoint`, `connection_string` или `storage_account_url`. Определяется по наличию символа `?` в URL. Примеры см. в разделе [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens).
* `Workload Identity` — может использоваться при указании `endpoint` или `storage_account_url`. Если параметр `use_workload_identity` задан в конфигурации, для аутентификации используется [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications).

### Кэш данных {#data-cache}

Движок таблиц `Azure` поддерживает кэширование данных на локальном диске.
Параметры конфигурации файлового кэша и примеры использования приведены в этом [разделе](/operations/storing-data.md/#using-local-cache).
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
            <path>path to cache directory</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. использовать повторно конфигурацию кэша (и, следовательно, хранилище кэша) из секции `storage_configuration` ClickHouse, [описанной здесь](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — необязательный параметр. В большинстве случаев ключ партиционирования не требуется, а если он и нужен, то, как правило, не более детальный, чем по месяцам. Партиционирование не ускоряет выполнение запросов (в отличие от выражения ORDER BY). Никогда не используйте слишком детальное партиционирование. Не выполняйте партиционирование данных по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.

#### Стратегия партиционирования {#partition-strategy}

`WILDCARD` (по умолчанию): заменяет подстановочный шаблон `{_partition_id}` в пути к файлу фактическим ключом партиции. Чтение не поддерживается.

`HIVE` реализует партиционирование в стиле Hive для чтения и записи. Чтение реализовано с использованием рекурсивного шаблона glob. При записи файлы создаются в следующем формате: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

Примечание: при использовании стратегии партиционирования `HIVE` настройка `use_hive_partitioning` не оказывает никакого эффекта.

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
