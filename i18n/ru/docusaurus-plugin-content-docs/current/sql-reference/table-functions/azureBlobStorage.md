---
description: 'Предоставляет интерфейс, подобный таблице, для выбора/вставки файлов в Azure Blob
  Storage. Похож на функцию s3.'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage Табличная Функция

Предоставляет интерфейс, подобный таблице, для выбора/вставки файлов в [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs). Эта табличная функция аналогична [функции s3](../../sql-reference/table-functions/s3.md).

**Синтаксис**

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**Аргументы**

- `connection_string|storage_account_url` — строка подключения включает имя аккаунта и ключ ([Создать строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL аккаунта хранения здесь, а имя аккаунта и ключ аккаунта как отдельные параметры (см. параметры account_name и account_key)
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя аккаунта можно указать здесь
- `account_key` - если используется storage_account_url, то ключ аккаунта можно указать здесь
- `format` — [формат](/sql-reference/formats) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет автоматически определена компрессия по расширению файла. (то же самое, что и установка на `auto`).
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с заданной структурой для чтения или записи данных в указанном файле.

**Примеры**

Аналогично таблице [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) движка таблиц, пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Дополнительные сведения [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Ниже мы предполагаем, что Azurite доступен по имени хоста `azurite1`.

Запишите данные в azure blob storage, используя следующее:

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

А затем его можно прочитать, используя

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

или с использованием connection_string

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```

## Виртуальные Столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Название файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.

**Смотрите Также**

- [AzureBlobStorage Движок Таблиц](engines/table-engines/integrations/azureBlobStorage.md)

## Разбиение по типу Hive {#hive-style-partitioning}

Когда `use_hive_partitioning` установлено в 1, ClickHouse будет определять разбиение по типу Hive в пути (`/name=value/`) и позволит использовать столбцы разбиения как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в разбиенном пути, но начинаются с `_`.

**Пример**

Используйте виртуальный столбец, созданный с разбиением по типу Hive

```sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Использование Подписей на Общий Доступ (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Подпись на Общий Доступ (SAS) — это URI, который предоставляет ограниченный доступ к контейнеру или файлу Azure Storage. Используйте его, чтобы предоставить временно ограниченный доступ к ресурсам учетной записи хранения без раскрытия ключа вашей учетной записи хранения. Дополнительные сведения [здесь](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature).

Функция `azureBlobStorage` поддерживает Подписи на Общий Доступ (SAS).

[Токен SAS для Blob](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) содержит всю необходимую информацию для аутентификации запроса, включая целевой blob, разрешения и срок действия. Чтобы построить URL для blob, добавьте токен SAS к конечной точке службы blob. Например, если конечная точка `https://clickhousedocstest.blob.core.windows.net/`, запрос выглядит так:

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

В качестве альтернативы пользователи могут использовать созданный [URL SAS для Blob](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers):

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```
