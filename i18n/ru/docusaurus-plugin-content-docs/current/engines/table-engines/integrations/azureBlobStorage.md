---
slug: /engines/table-engines/integrations/azureBlobStorage
sidebar_position: 10
sidebar_label: Azure Blob Storage
title: 'Движок таблицы AzureBlobStorage'
description: 'Этот движок обеспечивает интеграцию с экосистемой Azure Blob Storage.'
---


# Движок таблицы AzureBlobStorage

Этот движок обеспечивает интеграцию с [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) экосистемой.

## Создание таблицы {#create-table}

``` sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Параметры движка {#engine-parameters}

- `endpoint` — URL-адрес конечной точки AzureBlobStorage с контейнером и префиксом. Дополнительно может содержать account_name, если используемый метод аутентификации требует этого. (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) или эти параметры могут быть предоставлены отдельно, используя storage_account_url, account_name и container. Для указания префикса следует использовать endpoint.
- `endpoint_contains_account_name` - Этот флаг используется для указания, включает ли конечная точка account_name, так как он нужен только для определенных методов аутентификации. (По умолчанию: true)
- `connection_string|storage_account_url` — connection_string включает имя учетной записи и ключ ([Создать строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL-адрес учетной записи хранения здесь и указать имя учетной записи и ключ учетной записи в качестве отдельных параметров (см. параметры account_name и account_key).
- `container_name` - Имя контейнера.
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя учетной записи может быть указано здесь.
- `account_key` - если используется storage_account_url, то ключ учетной записи может быть указан здесь.
- `format` — [формат](/interfaces/formats.md) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию он автоматически определяет сжатие по расширению файла. (то же самое, что и установка на `auto`).

**Пример**

Пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Подробности [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Если используется локальный экземпляр Azurite, пользователи могут заменить `http://localhost:10000` на `http://azurite1:10000` в приведенных ниже командах, где предполагается, что Azurite доступен по хосту `azurite1`.

``` sql
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
- `Managed Identity` - Может быть использован, предоставив `endpoint`, `connection_string` или `storage_account_url`.
- `SAS Token` - Может быть использован, предоставив `endpoint`, `connection_string` или `storage_account_url`. Он определяется по наличию '?' в URL. См. [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.
- `Workload Identity` - Может быть использован, предоставив `endpoint` или `storage_account_url`. Если параметр `use_workload_identity` установлен в конфигурации, ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) используется для аутентификации.

### Кэш данных {#data-cache}

`Azure` движок таблицы поддерживает кэширование данных на локальном диске.
Смотрите параметры настройки кэша файловой системы и использование в этом [разделе](/operations/storing-data.md/#using-local-cache).
Кэширование выполняется в зависимости от пути и ETag объекта хранения, поэтому clickhouse не будет читать устаревшую версию кэша.

Чтобы включить кэширование, используйте настройку `filesystem_cache_name = '<name>'` и `enable_filesystem_cache = 1`.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. добавьте следующий раздел в конфигурационный файл clickhouse:

``` xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>путь к директории кэша</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. повторно используйте конфигурацию кэша (и, соответственно, хранилище кэша) из секции clickhouse `storage_configuration`, [описанной здесь](/operations/storing-data.md/#using-local-cache)

## Смотрите также {#see-also}

[Функция таблицы Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
