---
description: 'Позволяет параллельно обрабатывать файлы из хранилища Azure Blob Storage на множестве узлов в указанном кластере.'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---

# Табличная функция azureBlobStorageCluster \{#azureblobstoragecluster-table-function\}

Позволяет обрабатывать файлы из [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) параллельно на множестве узлов в указанном кластере. На узле-инициаторе создаётся подключение ко всем узлам кластера, раскрываются звёздочки в пути к файлу S3, и каждый файл динамически распределяется между узлами. Рабочий узел запрашивает у инициатора следующую задачу и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут завершены.
Эта табличная функция аналогична [функции s3Cluster](../../sql-reference/table-functions/s3Cluster.md).

## Синтаксис \{#syntax\}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## Аргументы \{#arguments\}

| Argument            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | Имя кластера, используемое для построения набора адресов и параметров подключения к удалённым и локальным серверам.                                                                                                                                                                                                                                                                                                                                                                                             |
| `connection_string` | `storage_account_url` — `connection_string` включает имя и ключ учётной записи ([Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)), либо здесь можно указать URL учётной записи хранилища, а имя и ключ учётной записи передать отдельными параметрами (см. параметры `account_name` и `account_key`). | 
| `container_name`    | Имя контейнера.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | Путь к файлу. Поддерживает следующие шаблоны (wildcards) в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.                                                                                                                                                                                                                                                                                                                                    |
| `account_name`      | Если используется `storage_account_url`, имя учётной записи можно указать здесь.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `account_key`       | Если используется `storage_account_url`, ключ учётной записи можно указать здесь.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `format`            | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `compression`       | Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла (то же, что установка значения `auto`).                                                                                                                                                                                                                                                                                                                  |
| `structure`         | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Возвращаемое значение \{#returned_value\}

Таблица с указанной структурой для чтения данных из указанного файла или записи данных в него.

## Примеры \{#examples\}

Аналогично табличному движку [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) пользователи могут использовать эмулятор Azurite для локальной разработки с использованием Azure Storage. Дополнительные сведения см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Ниже мы предполагаем, что Azurite доступен по имени хоста `azurite1`.

Подсчитайте количество строк в файле `test_cluster_*.csv`, используя все узлы кластера `cluster_simple`:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## Использование подписей общего доступа (Shared Access Signatures, SAS) \{#using-shared-access-signatures-sas-sas-tokens\}

См. примеры в разделе [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens).

## См. также \{#related\}

- [Движок AzureBlobStorage](../../engines/table-engines/integrations/azureBlobStorage.md)
- [Табличная функция AzureBlobStorage](../../sql-reference/table-functions/azureBlobStorage.md)
