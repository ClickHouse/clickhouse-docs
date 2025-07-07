---
description: 'Предоставляет интерфейс в виде таблицы для выбора/вставки файлов в Azure Blob Storage. Похож на функцию s3.'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage Табличная Функция

Предоставляет интерфейс в виде таблицы для выбора/вставки файлов в [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs). Эта табличная функция похожа на [функцию s3](../../sql-reference/table-functions/s3.md).

**Синтаксис**

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**Аргументы**

- `connection_string|storage_account_url` — connection_string включает имя и ключ учетной записи ([Создать строку соединения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете указать URL-адрес учетной записи хранения здесь, а имя учетной записи и ключ учетной записи в качестве отдельных параметров (см. параметры account_name и account_key)
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя учетной записи можно указать здесь
- `account_key` - если используется storage_account_url, то ключ учетной записи можно указать здесь
- `format` — [формат](/sql-reference/formats) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет определена сжатие по расширению файла. (то же самое, что установка на `auto`).
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанный файл.

**Примеры**

Похож на [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) движок таблиц, пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Подробности [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Ниже мы предполагаем, что Azurite доступен по имени хоста `azurite1`.

Запись данных в Azure Blob Storage с использованием следующего:

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

А затем его можно читать, используя

```sql
SELECT * FROM azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_1.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```response
┌───column1─┬────column2─┬───column3─┐
│     3     │       2    │      1    │
└───────────┴────────────┴───────────┘
```

или используя connection_string

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```

## Виртуальные Колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

**Смотрите Также**

- [Движок Таблицы AzureBlobStorage](engines/table-engines/integrations/azureBlobStorage.md)

## Партиционирование в стиле Hive {#hive-style-partitioning}

При установке `use_hive_partitioning` в 1, ClickHouse будет обнаруживать партиционирование в стиле Hive в пути (`/name=value/`) и позволит использовать колонки партиционирования в качестве виртуальных колонок в запросе. Эти виртуальные колонки будут иметь те же имена, что и в партиционированном пути, но с началом на `_`.

**Пример**

Использование виртуальной колонки, созданной с помощью партиционирования в стиле Hive

```sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Использование Подписей Общего Доступа (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Подпись общего доступа (SAS) — это URI, который предоставляет ограниченный доступ к контейнеру или файлу Azure Storage. Используйте его, чтобы предоставить временно ограниченный доступ к ресурсам учетной записи хранения без передачи ключа учетной записи хранения. Подробности [здесь](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature).

Функция `azureBlobStorage` поддерживает Подписи Общего Доступа (SAS).

[Token Blob SAS](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) содержит всю информацию, необходимую для аутентификации запроса, включая целевой blob, разрешения и срок действия. Чтобы построить URL-адрес blob, добавьте токен SAS к конечной точке службы blob. Например, если конечная точка — `https://clickhousedocstest.blob.core.windows.net/`, запрос становится:

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 строка в наборе. Затрачено: 0.425 сек.
```

В качестве альтернативы пользователи могут использовать сгенерированный [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers):

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 строка в наборе. Затрачено: 0.153 сек.
```
