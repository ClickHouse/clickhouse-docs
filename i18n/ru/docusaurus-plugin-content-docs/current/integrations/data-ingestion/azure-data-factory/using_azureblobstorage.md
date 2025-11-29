---
sidebar_label: 'Использование табличной функции azureBlobStorage'
slug: /integrations/azure-data-factory/table-function
description: 'Использование табличной функции ClickHouse azureBlobStorage'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Использование табличной функции ClickHouse azureBlobStorage для загрузки данных из Azure в ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Использование табличной функции azureBlobStorage в ClickHouse {#using-azureBlobStorage-function}

Это один из наиболее эффективных и простых способов копирования данных из
Azure Blob Storage или Azure Data Lake Storage в ClickHouse. С помощью этой табличной
функции вы можете указать ClickHouse подключиться напрямую к хранилищу Azure и
считывать данные по запросу.

Она предоставляет интерфейс, аналогичный таблице, который позволяет выполнять выборки, вставку и
фильтрацию данных непосредственно из источника. Функция высоко оптимизирована и
поддерживает многие широко используемые форматы файлов, включая `CSV`, `JSON`, `Parquet`, `Arrow`,
`TSV`, `ORC`, `Avro` и другие. Полный список см. в разделе ["Data formats"](/interfaces/formats).

В этом разделе мы рассмотрим простой начальный пример переноса
данных из Azure Blob Storage в ClickHouse, а также важные аспекты
эффективного использования этой функции. Для получения дополнительных сведений и описания расширенных возможностей
обратитесь к официальной документации:
странице документации табличной функции [`azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)



## Получение ключей доступа к Azure Blob Storage {#acquiring-azure-blob-storage-access-keys}

Чтобы предоставить ClickHouse доступ к Azure Blob Storage, вам понадобится строка подключения с ключом доступа.

1. В портале Azure перейдите к своему **Storage Account**.

2. В меню слева выберите **Access keys** в разделе **Security +
   networking**.
   <Image img={azureDataStoreSettings} size="lg" alt="Параметры хранилища Azure" border/>

3. Выберите **key1** или **key2** и нажмите кнопку **Show** рядом с полем
   **Connection string**.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Ключи доступа к хранилищу Azure" border/>

4. Скопируйте строку подключения — вы будете использовать её в качестве параметра табличной функции azureBlobStorage.



## Выполнение запросов к данным в Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

Откройте предпочитаемую консоль для выполнения запросов в ClickHouse — это может быть
веб-интерфейс ClickHouse Cloud, клиент ClickHouse CLI или любой другой инструмент,
который вы используете для запуска запросов. Как только у вас будут строка
подключения и консоль запросов ClickHouse, вы можете начинать выполнять запросы
к данным напрямую из Azure Blob Storage.

В следующем примере мы выполняем запрос ко всем данным, хранящимся в JSON-файлах
в контейнере с именем data-container:

```sql
SELECT * FROM azureBlobStorage(
    '<ВАША_СТРОКА_ПОДКЛЮЧЕНИЯ>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Если вы хотите скопировать эти данные в локальную таблицу ClickHouse (например, my&#95;table),
можно использовать запрос `INSERT INTO ... SELECT`:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<ВАША_СТРОКА_ПОДКЛЮЧЕНИЯ>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Это позволяет эффективно загружать внешние данные в ClickHouse без необходимости выполнения промежуточных ETL-этапов.


## Простой пример с использованием набора данных Environmental Sensors {#simple-example-using-the-environmental-sensors-dataset}

В качестве примера мы загрузим один файл из набора данных Environmental Sensors.

1. Загрузите [пример файла](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)
   из [набора данных Environmental Sensors](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)

2. В портале Azure создайте новую учетную запись хранилища, если у вас ее еще нет.

:::warning
Убедитесь, что для вашей учетной записи хранилища включен параметр **Allow storage account key access**, иначе вы не сможете использовать ключи учетной записи для доступа к данным.
:::

3. Создайте новый контейнер в учетной записи хранилища. В этом примере мы назовем его sensors.
   Можно пропустить этот шаг, если вы используете существующий контейнер.

4. Загрузите ранее скачанный файл `2019-06_bmp180.csv.zst` в контейнер.

5. Выполните шаги, описанные ранее, чтобы получить строку подключения к Azure Blob Storage.

Теперь, когда все настроено, вы можете выполнять запросы к данным напрямую из Azure Blob Storage:

```sql
SELECT *
FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
LIMIT 10
SETTINGS format_csv_delimiter = ';'
```

7. Чтобы загрузить данные в таблицу, создайте упрощённую версию
   схемы, используемой в исходном наборе данных:
   ```sql
   CREATE TABLE sensors
   (
       sensor_id UInt16,
       lat Float32,
       lon Float32,
       timestamp DateTime,
       temperature Float32
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, sensor_id);
   ```

:::info
Для получения дополнительной информации о параметрах конфигурации и
автоматическом определении схемы при выполнении запросов к внешним
источникам, таким как Azure Blob Storage, см. раздел [Automatic schema
inference from input data](https://clickhouse.com/docs/interfaces/schema-inference)
:::

8. Теперь загрузите данные из Azure Blob Storage в таблицу sensors:
   ```sql
   INSERT INTO sensors
   SELECT sensor_id, lat, lon, timestamp, temperature
   FROM azureBlobStorage(
       '<YOUR CONNECTION STRING>', 
       'sensors',
       '2019-06_bmp180.csv.zst', 
       'CSVWithNames')
   SETTINGS format_csv_delimiter = ';'
   ```

Теперь таблица sensors заполнена данными из файла `2019-06_bmp180.csv.zst`,
хранящегося в Azure Blob Storage.


## Дополнительные ресурсы {#additional-resources}

Это лишь базовое введение в использование функции azureBlobStorage. Для более
продвинутых вариантов и параметров конфигурации обратитесь к официальной
документации:

- [Табличная функция azureBlobStorage](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Форматы входных и выходных данных](https://clickhouse.com/docs/sql-reference/formats)
- [Автоматическое определение схемы по входным данным](https://clickhouse.com/docs/interfaces/schema-inference)
