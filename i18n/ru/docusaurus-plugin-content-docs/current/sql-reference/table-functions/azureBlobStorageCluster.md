---
description: 'Позволяет обрабатывать файлы из Azure Blob Storage параллельно на множестве узлов в указанном кластере.'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
---


# azureBlobStorageCluster Табличная Функция

Позволяет обрабатывать файлы из [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) параллельно на множестве узлов в указанном кластере. На инициаторе она создает соединение со всеми узлами кластера, раскрывает звездочки в пути файла S3 и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и выполняет её. Этот процесс повторяется до тех пор, пока все задачи не будут завершены. Эта табличная функция схожа с функцией [s3Cluster](../../sql-reference/table-functions/s3Cluster.md).

**Синтаксис**

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**Аргументы**

- `cluster_name` — Имя кластера, который используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `connection_string|storage_account_url` — connection_string включает имя и ключ учетной записи ([Создать строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL учетной записи хранилища здесь, а имя учетной записи и ключ учетной записи как отдельные параметры (см. параметры account_name и account_key).
- `container_name` - Имя контейнера
- `blobpath` - путь к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
- `account_name` - если используется storage_account_url, то имя учетной записи можно указать здесь
- `account_key` - если используется storage_account_url, то ключ учетной записи можно указать здесь
- `format` — [формат](/sql-reference/formats) файла.
- `compression` — Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию он автоматически определяет сжатие по расширению файла. (то же самое, что установка на `auto`).
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанном файле.

**Примеры**

Похожим образом на движок таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Подробности [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Ниже мы предполагаем, что Azurite доступен по имени хоста `azurite1`.

Выберите количество для файла `test_cluster_*.csv`, используя все узлы в кластере `cluster_simple`:

```sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**См. Также**

- [AzureBlobStorage engine](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage табличная функция](../../sql-reference/table-functions/azureBlobStorage.md)

## Использование Совместимых Подписей Доступа (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Смотрите [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.
