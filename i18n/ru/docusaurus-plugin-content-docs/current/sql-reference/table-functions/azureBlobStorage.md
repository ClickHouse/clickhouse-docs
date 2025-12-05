---
description: 'Предоставляет табличный интерфейс для выборки и вставки файлов в Azure Blob Storage. Аналогично табличной функции s3.'
keywords: ['Azure Blob Storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличная функция azureBlobStorage {#azureblobstorage-table-function}

Предоставляет табличный интерфейс для чтения и записи файлов в [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs). Эта табличная функция аналогична табличной функции [s3](../../sql-reference/table-functions/s3.md).



## Синтаксис {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```


## Аргументы {#arguments}

| Аргумент                                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | `connection_string` включает имя и ключ учетной записи ([Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)), либо здесь можно указать URL учетной записи хранилища, а имя и ключ учетной записи — отдельными параметрами (см. параметры `account_name` и `account_key`) |
| `container_name`                            | Имя контейнера                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `blobpath`                                  | Путь к файлу. Поддерживает следующие подстановочные шаблоны в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, а `'abc'`, `'def'` — строки.                                                                                                                                                                                                                                                                                                         |
| `account_name`                              | Если используется `storage_account_url`, то имя учетной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                         |
| `account_key`                               | Если используется `storage_account_url`, то ключ учетной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                        |
| `format`                                    | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `compression`                               | Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию сжатие автоматически определяется по расширению файла (то же, что `auto`).                                                                                                                                                                                                                                                                                                                   | 
| `structure`                                 | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `partition_strategy`                        | Необязательный параметр. Поддерживаемые значения: `WILDCARD` или `HIVE`. `WILDCARD` требует наличия `{_partition_id}` в пути, который заменяется ключом партиции. `HIVE` не допускает подстановочные шаблоны, предполагает, что путь указывает на корень таблицы, и создает структуру каталогов партиций в стиле Hive с идентификаторами Snowflake в качестве имен файлов и форматом файла в качестве расширения. По умолчанию используется `WILDCARD`. |
| `partition_columns_in_data_file`            | Необязательный параметр. Используется только со стратегией партиционирования `HIVE`. Указывает ClickHouse, следует ли ожидать, что столбцы партиции записаны в файл данных. По умолчанию — `false`.                                                                                                                                                                                                                                                                                        |
| `extra_credentials`                         | Используйте `client_id` и `tenant_id` для аутентификации. Если указаны `extra_credentials`, они имеют приоритет над `account_name` и `account_key`.                                                                                                                                                                                                                                                                                                                                      |



## Возвращаемое значение {#returned_value}

Таблица заданной структуры, предназначенная для чтения или записи данных в указанный файл.



## Примеры {#examples}

Аналогично движку таблицы [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), для локальной разработки с Azure Storage можно использовать эмулятор Azurite. Подробности см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Далее предполагается, что Azurite доступен по имени хоста `azurite1`.

Запишите данные в Azure Blob Storage с помощью следующего:

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

После этого его можно прочитать с помощью

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

или с использованием параметра connection&#95;string

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.



## Партиционированная запись {#partitioned-write}

### Стратегия партиционирования {#partition-strategy}

Поддерживается только для запросов INSERT.

`WILDCARD` (значение по умолчанию): Заменяет подстановку `{_partition_id}` в пути к файлу на фактический ключ партиции.

`HIVE` реализует партиционирование в стиле Hive для чтения и записи. Он генерирует файлы в следующем формате: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

**Пример стратегии партиционирования `HIVE`**

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root', format='CSVWithNames', compression='auto', structure='year UInt16, country String, id Int32', partition_strategy='hive') PARTITION BY (year, country) VALUES (2020, 'Russia', 1), (2021, 'Brazil', 2);
```

```result
select _path, * from azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root/**.csvwithnames')

   ┌─_path───────────────────────────────────────────────────────────────────────────┬─id─┬─year─┬─country─┐
1. │ cont/azure_table_root/year=2021/country=Brazil/7351307847391293440.csvwithnames │  2 │ 2021 │ Brazil  │
2. │ cont/azure_table_root/year=2020/country=Russia/7351307847378710528.csvwithnames │  1 │ 2020 │ Russia  │
   └─────────────────────────────────────────────────────────────────────────────────┴────┴──────┴─────────┘
```


## настройка use&#95;hive&#95;partitioning {#hive-style-partitioning}

Это указание для ClickHouse при чтении файлов с партиционированием в стиле Hive. На запись оно не влияет. Для симметричных операций чтения и записи используйте аргумент `partition_strategy`.

Когда настройка `use_hive_partitioning` установлена в значение 1, ClickHouse обнаруживает партиционирование в стиле Hive в пути (`/name=value/`) и позволяет использовать столбцы партиции как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в пути партиционирования, но с префиксом `_`.

**Пример**

Используйте виртуальный столбец, созданный с помощью партиционирования в стиле Hive

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Использование Shared Access Signatures (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Shared Access Signature (SAS) — это URI, который предоставляет ограниченный доступ к контейнеру или файлу в Azure Storage. Используйте его, чтобы предоставить ограниченный по времени доступ к ресурсам учетной записи хранения без передачи ключа этой учетной записи. Более подробно описано [здесь](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature).

Функция `azureBlobStorage` поддерживает Shared Access Signatures (SAS).

[Токен Blob SAS](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) содержит всю информацию, необходимую для аутентификации запроса, включая целевой BLOB-объект, права доступа и период действия. Чтобы сформировать URL BLOB-объекта, добавьте токен SAS к конечной точке службы BLOB-хранилища. Например, если конечная точка — `https://clickhousedocstest.blob.core.windows.net/`, запрос будет выглядеть так:

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

Кроме того, можно использовать сгенерированный [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers):

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```


## Связанные материалы {#related}
- [Движок таблицы AzureBlobStorage](engines/table-engines/integrations/azureBlobStorage.md)
