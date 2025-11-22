---
description: 'Позволяет обрабатывать файлы из Azure Blob Storage параллельно на множестве узлов в указанном кластере.'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---



# Функция-таблица azureBlobStorageCluster

Позволяет обрабатывать файлы из [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) параллельно на множестве узлов в заданном кластере. На инициаторе она устанавливает соединение со всеми узлами в кластере, раскрывает подстановочные символы `*` в пути к файлам S3 и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут завершены.
Эта функция-таблица аналогична [табличной функции s3Cluster](../../sql-reference/table-functions/s3Cluster.md).



## Синтаксис {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```


## Аргументы {#arguments}

| Аргумент            | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`      | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам.                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | `storage_account_url` — строка подключения включает имя учётной записи и ключ ([Создание строки подключения](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)), либо можно указать URL учётной записи хранилища, а имя учётной записи и ключ — как отдельные параметры (см. параметры `account_name` и `account_key`) |
| `container_name`    | Имя контейнера                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `blobpath`          | Путь к файлу. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | Если используется `storage_account_url`, то имя учётной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | Если используется `storage_account_url`, то ключ учётной записи можно указать здесь                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла (аналогично установке значения `auto`).                                                                                                                                                                                                                                                                                                                               |
| `structure`         | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                                     |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанный файл.


## Примеры {#examples}

Аналогично движку таблиц [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage), пользователи могут использовать эмулятор Azurite для локальной разработки с Azure Storage. Подробнее см. [здесь](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage). Далее предполагается, что Azurite доступен по имени хоста `azurite1`.

Подсчитать количество записей в файле `test_cluster_*.csv`, используя все узлы кластера `cluster_simple`:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```


## Использование подписей общего доступа (SAS) {#using-shared-access-signatures-sas-sas-tokens}

Примеры см. в разделе [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens).


## Связанные разделы {#related}

- [Движок AzureBlobStorage](../../engines/table-engines/integrations/azureBlobStorage.md)
- [Табличная функция azureBlobStorage](../../sql-reference/table-functions/azureBlobStorage.md)
