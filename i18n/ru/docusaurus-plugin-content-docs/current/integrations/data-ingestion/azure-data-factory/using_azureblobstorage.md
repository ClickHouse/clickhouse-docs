---
sidebar_label: 'Использование табличной функции azureBlobStorage'
slug: /integrations/azure-data-factory/table-function
description: 'Использование табличной функции azureBlobStorage в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Использование табличной функции azureBlobStorage для загрузки данных из Azure в ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Использование табличной функции azureBlobStorage в ClickHouse {#using-azureBlobStorage-function}

Это один из наиболее эффективных и простых способов копирования данных из
Azure Blob Storage или Azure Data Lake Storage в ClickHouse. С помощью этой табличной
функции вы можете настроить ClickHouse на прямое подключение к хранилищу Azure и
чтение данных по запросу.

Функция предоставляет табличный интерфейс, который позволяет выбирать, вставлять и
фильтровать данные непосредственно из источника. Функция высоко оптимизирована и
поддерживает множество широко используемых форматов файлов, включая `CSV`, `JSON`, `Parquet`, `Arrow`,
`TSV`, `ORC`, `Avro` и другие. Полный список см. в разделе [«Форматы данных»](/interfaces/formats).

В этом разделе мы рассмотрим простое руководство по началу работы с переносом
данных из Azure Blob Storage в ClickHouse, а также важные аспекты
эффективного использования этой функции. Для получения более подробной информации и дополнительных опций
обратитесь к официальной документации:
[страница документации табличной функции `azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)


## Получение ключей доступа к Azure Blob Storage {#acquiring-azure-blob-storage-access-keys}

Чтобы предоставить ClickHouse доступ к вашему Azure Blob Storage, вам потребуется строка подключения с ключом доступа.

1. На портале Azure перейдите к вашей **учетной записи хранения** (Storage Account).

2. В меню слева выберите **Ключи доступа** (Access keys) в разделе **Безопасность + сеть** (Security + networking).

   <Image
     img={azureDataStoreSettings}
     size='lg'
     alt='Настройки хранилища данных Azure'
     border
   />

3. Выберите **key1** или **key2** и нажмите кнопку **Показать** (Show) рядом с полем **Строка подключения** (Connection string).

   <Image
     img={azureDataStoreAccessKeys}
     size='lg'
     alt='Ключи доступа к хранилищу данных Azure'
     border
   />

4. Скопируйте строку подключения — она будет использоваться в качестве параметра табличной функции azureBlobStorage.


## Запрос данных из Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

Откройте удобную для вас консоль запросов ClickHouse — это может быть веб-интерфейс ClickHouse Cloud, клиент ClickHouse CLI или любой другой инструмент для выполнения запросов. Когда у вас будет готова строка подключения и консоль запросов ClickHouse, вы сможете начать запрашивать данные напрямую из Azure Blob Storage.

В следующем примере мы запрашиваем все данные, хранящиеся в JSON-файлах, расположенных в контейнере с именем data-container:

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Если вы хотите скопировать эти данные в локальную таблицу ClickHouse (например, my_table), используйте оператор `INSERT INTO ... SELECT`:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Это позволяет эффективно загружать внешние данные в ClickHouse без промежуточных ETL-операций.


## Простой пример использования набора данных Environmental Sensors {#simple-example-using-the-environmental-sensors-dataset}

В качестве примера загрузим один файл из набора данных Environmental Sensors.

1. Загрузите [образец файла](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)
   из [набора данных Environmental Sensors](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)

2. На портале Azure создайте новую учетную запись хранения, если у вас ее еще нет.

:::warning
Убедитесь, что для вашей учетной записи хранения включен параметр **Allow storage account key access** (Разрешить доступ по ключу учетной записи хранения), иначе вы не сможете использовать ключи учетной записи для доступа к данным.
:::

3. Создайте новый контейнер в вашей учетной записи хранения. В этом примере мы назовем его sensors.
   Этот шаг можно пропустить, если вы используете существующий контейнер.

4. Загрузите ранее скачанный файл `2019-06_bmp180.csv.zst` в контейнер.

5. Следуйте шагам, описанным ранее, чтобы получить строку подключения к Azure Blob Storage.

Теперь, когда все настроено, вы можете запрашивать данные напрямую из Azure Blob Storage:

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

7. Чтобы загрузить данные в таблицу, создайте упрощенную версию схемы, используемой в исходном наборе данных:
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
Дополнительную информацию о параметрах конфигурации и автоматическом определении схемы при запросе внешних источников, таких как Azure Blob Storage, см. в разделе [Автоматическое определение схемы из входных данных](https://clickhouse.com/docs/interfaces/schema-inference)
:::

8. Теперь вставьте данные из Azure Blob Storage в таблицу sensors:
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

Таблица sensors теперь заполнена данными из файла `2019-06_bmp180.csv.zst`, хранящегося в Azure Blob Storage.


## Дополнительные ресурсы {#additional-resources}

Это лишь базовое введение в использование функции azureBlobStorage. Для получения информации о дополнительных возможностях и параметрах конфигурации обратитесь к официальной документации:

- [Табличная функция azureBlobStorage](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Форматы входных и выходных данных](https://clickhouse.com/docs/sql-reference/formats)
- [Автоматический вывод схемы из входных данных](https://clickhouse.com/docs/interfaces/schema-inference)
