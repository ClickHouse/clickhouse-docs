---
description: 'Позволяет обрабатывать файлы из Azure Blob storage параллельно с множеством узлов в указанном кластере.'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
---


# azureBlobStorageCluster Табличная Функция

Позволяет обрабатывать файлы из [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) параллельно с множеством узлов в указанном кластере. При запуске создается соединение со всеми узлами в кластере, скрываются символы в пути файла S3, и динамически распределяются задачи для каждого файла. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет ее. Это повторяется до тех пор, пока все задачи не будут выполнены. Эта табличная функция аналогична функции [s3Cluster](../../sql-reference/table-functions/s3Cluster.md).

**Синтаксис**

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**Аргументы**

- `cluster_name` — Имя кластера, являющегося основой для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `connection_string|storage_account_url` — connection_string включает имя аккаунта и ключ ([Создать строку соединения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или можно также указать URL хранилища здесь и имя аккаунта с ключом как отдельные параметры (см. параметры account_name и account_key)
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя аккаунта можно указать здесь
- `account_key` - если используется storage_account_url, то ключ аккаунта можно указать здесь
- `format` — [формат](/sql-reference/formats) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию автоматически определяется метод сжатия по расширению файла. (то же самое, что установка на `auto`).
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанном файле.

**Примеры**

Аналогично движку таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки в Azure Storage. Подробности [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Предположим, что Azurite доступен на хосте `azurite1`.

Выберите количество для файла `test_cluster_*.csv`, используя все узлы в кластере `cluster_simple`:

```sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**См. также**

- [AzureBlobStorage engine](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage табличная функция](../../sql-reference/table-functions/azureBlobStorage.md)

## Использование Общих Доступов Подписей (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Смотрите [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.
