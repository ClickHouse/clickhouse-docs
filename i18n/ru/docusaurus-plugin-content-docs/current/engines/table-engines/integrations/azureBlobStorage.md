---
description: 'Этот движок предоставляет интеграцию с экосистемой Azure Blob Storage.'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'Движок таблиц AzureBlobStorage'
---


# Движок таблиц AzureBlobStorage

Этот движок предоставляет интеграцию с [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) экосистемой.

## Создание таблицы {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

- `endpoint` — URL-адрес конечной точки AzureBlobStorage с контейнером и префиксом. При необходимости может содержать account_name, если используемый метод аутентификации требует этого. (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) или эти параметры могут быть предоставлены отдельно с использованием storage_account_url, account_name и container. Для указания префикса следует использовать endpoint.
- `endpoint_contains_account_name` - Этот флаг используется для указания, содержит ли конечная точка account_name, так как это необходимо только для определенных методов аутентификации. (По умолчанию: true)
- `connection_string|storage_account_url` — connection_string включает имя аккаунта и ключ ([Создайте строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL-адрес учетной записи хранения здесь, а имя аккаунта и ключ аккаунта как отдельные параметры (см. параметры account_name и account_key)
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя аккаунта можно указать здесь
- `account_key` - если используется storage_account_url, то ключ аккаунта можно указать здесь
- `format` — [формат](/interfaces/formats.md) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию он будет автоматически определять сжатие по расширению файла. (то же самое, что установка на `auto`).

**Пример**

Пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Дополнительные сведения [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Если вы используете локальный экземпляр Azurite, пользователи могут заменить `http://localhost:10000` на `http://azurite1:10000` в командах ниже, где мы предполагаем, что Azurite доступен на хосте `azurite1`.

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

В настоящее время есть 3 способа аутентификации:
- `Managed Identity` - Может быть использован, предоставив `endpoint`, `connection_string` или `storage_account_url`.
- `SAS Token` - Может быть использован, предоставив `endpoint`, `connection_string` или `storage_account_url`. Он идентифицируется по наличию '?' в url. См. [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.
- `Workload Identity` - Может быть использован, предоставив `endpoint` или `storage_account_url`. Если параметр `use_workload_identity` установлен в конфигурации, ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) используется для аутентификации.

### Кэш данных {#data-cache}

Движок таблиц `Azure` поддерживает кэширование данных на локальном диске. См. параметры конфигурации кэша файловой системы и использование в этом [разделе](/operations/storing-data.md/#using-local-cache). Кэширование выполняется в зависимости от пути и ETag объекта хранения, поэтому ClickHouse не будет читать устаревшую версию кэша.

Чтобы включить кэширование, используйте настройку `filesystem_cache_name = '<name>'` и `enable_filesystem_cache = 1`.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. добавьте следующий раздел в файл конфигурации ClickHouse:

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

2. повторно используйте конфигурацию кэша (и, следовательно, хранилище кэша) из раздела конфигурации `storage_configuration` ClickHouse, [описанного здесь](/operations/storing-data.md/#using-local-cache)

## См. также {#see-also}

[Функция таблицы Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
