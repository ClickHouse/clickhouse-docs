---
slug: '/sql-reference/table-functions/azureBlobStorageCluster'
sidebar_label: azureBlobStorageCluster
sidebar_position: 15
description: 'Позволяет обрабатывать файлы из Azure Blob storage параллельно с многими'
title: azureBlobStorageCluster
doc_type: reference
---
# azureBlobStorageCluster Табличная Функция

Позволяет обрабатывать файлы из [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) параллельно на многих узлах в указанном кластере. На инициаторе она создает соединение со всеми узлами в кластере, раскрывает звездочки в пути к файлу S3 и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется, пока все задачи не будут завершены. Эта табличная функция аналогична функции [s3Cluster](../../sql-reference/table-functions/s3Cluster.md).

## Синтаксис {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## Аргументы {#arguments}

| Аргумент            | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | Имя кластера, которое используется для создания набора адресов и параметров соединения с удаленными и локальными серверами.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | `storage_account_url` — строка подключения включает имя учетной записи и ключ ([Создать строку подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) или вы также можете предоставить URL-адрес учетной записи хранения здесь, а имя учетной записи и ключ учетной записи как отдельные параметры (см. параметры `account_name` и `account_key`) | 
| `container_name`    | Имя контейнера                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | путь к файлу. Поддерживает следующие шаблоны в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.                                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | если используется `storage_account_url`, то имя учетной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | если используется `storage_account_url`, то ключ учетной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | [формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет автоматически обнаружено сжатие по расширению файла. (то же самое, что установка на `auto`).                                                                                                                                                                                                                                                                                                                                               |
| `structure`         |  Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанном файле.

## Примеры {#examples}

Подобно механизму таблицы [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки Azure Storage. Дополнительные детали [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Далее предполагаем, что Azurite доступен по имени хоста `azurite1`.

Выберите количество для файла `test_cluster_*.csv`, используя все узлы кластера `cluster_simple`:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## Использование Подписей Совместного Доступа (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Смотрите [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) для примеров.

## Связанные {#related}

- [Движок AzureBlobStorage](../../engines/table-engines/integrations/azureBlobStorage.md)
- [табличная функция azureBlobStorage](../../sql-reference/table-functions/azureBlobStorage.md)