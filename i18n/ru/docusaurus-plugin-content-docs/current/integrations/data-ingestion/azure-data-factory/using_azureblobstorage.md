---
sidebar_label: 'Использование табличной функции azureBlobStorage'
slug: /integrations/azure-data-factory/table-function
description: 'Использование табличной функции azureBlobStorage в ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Использование табличной функции azureBlobStorage в ClickHouse для загрузки данных из Azure'
---

import Image from '@theme/IdealImage';

import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Использование табличной функции azureBlobStorage в ClickHouse {#using-azureBlobStorage-function}

Это один из самых эффективных и простых способов скопировать данные из
Azure Blob Storage или Azure Data Lake Storage в ClickHouse. С помощью этой табличной
функции вы можете сообщить ClickHouse подключиться напрямую к Azure хранилищу и
читать данные по мере необходимости.

Она предоставляет интерфейс, похожий на таблицу, который позволяет вам выбирать, вставлять и
фильтровать данные непосредственно из источника. Функция сильно оптимизирована и
поддерживает множество широко используемых форматов файлов, включая `CSV`, `JSON`, `Parquet`, `Arrow`,
`TSV`, `ORC`, `Avro` и другие. Полный список см. в разделе ["Форматы данных"](/interfaces/formats).

В этом разделе мы рассмотрим простое руководство по передаче
данных из Azure Blob Storage в ClickHouse, а также важные аспекты
эффективного использования этой функции. Для получения более подробной информации и дополнительных опций,
обратитесь к официальной документации:
[`Табличная функция azureBlobStorage`](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Получение ключей доступа к Azure Blob Storage {#acquiring-azure-blob-storage-access-keys}

Чтобы разрешить ClickHouse доступ к вашему Azure Blob Storage, вам потребуется строка подключения с ключом доступа.

1. В портале Azure перейдите к своему **Учетной записи хранения**.

2. В левом меню выберите **Ключи доступа** в разделе **Безопасность и сетевое взаимодействие**.
   <Image img={azureDataStoreSettings} size="lg" alt="Настройки хранилища Azure" border/>

3. Выберите либо **key1**, либо **key2**, и нажмите кнопку **Показать** рядом с
   полем **Строка подключения**.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Ключи доступа хранилища Azure" border/>

4. Скопируйте строку подключения — вы будете использовать ее как параметр в табличной функции azureBlobStorage.

## Запрос данных из Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

Откройте свою любимую консоль запросов ClickHouse — это может быть веб-интерфейс ClickHouse Cloud,
клиент ClickHouse CLI или любой другой инструмент, который вы используете для выполнения
запросов. После того как вы подготовили строку подключения и консоль запросов ClickHouse,
вы можете начать запрашивать данные непосредственно из Azure Blob Storage.

В следующем примере мы запрашиваем все данные, хранящиеся в JSON-файлах, находящихся в
контейнере с именем data-container:

```sql
SELECT * FROM azureBlobStorage(
    '<ВАША СТРОКА ПОДКЛЮЧЕНИЯ>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Если вы хотите скопировать эти данные в локальную таблицу ClickHouse (например, my_table),
вы можете использовать команду `INSERT INTO ... SELECT`:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<ВАША СТРОКА ПОДКЛЮЧЕНИЯ>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Это позволяет вам эффективно загружать внешние данные в ClickHouse без
необходимости в промежуточных этапах ETL.

## Простой пример с использованием набора данных об экологических датчиках {#simple-example-using-the-environmental-sensors-dataset}

В качестве примера мы загрузим один файл из Набора данных об экологических датчиках.

1. Скачайте [пример файла](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)
   из [Набора данных об экологических датчиках](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)

2. В портале Azure создайте новую учетную запись хранения, если у вас ее еще нет.

:::warning
Убедитесь, что для вашей учетной записи хранения включен доступ к ключу учетной записи, иначе вы не сможете использовать ключи аккаунта для доступа к данным.
:::

3. Создайте новый контейнер в вашей учетной записи хранения. В этом примере мы назовем его sensors.
   Вы можете пропустить этот шаг, если используете существующий контейнер.

4. Загрузите ранее скачанный файл `2019-06_bmp180.csv.zst` в
   контейнер.

5. Следуйте описанным ранее шагам, чтобы получить строку подключения к Azure Blob Storage.

Теперь, когда все настроено, вы можете запрашивать данные непосредственно из Azure Blob Storage:

```sql
SELECT *
FROM azureBlobStorage(
    '<ВАША СТРОКА ПОДКЛЮЧЕНИЯ>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
LIMIT 10
SETTINGS format_csv_delimiter = ';'
```

7. Чтобы загрузить данные в таблицу, создайте упрощенную версию схемы, используемой в оригинальном наборе данных:
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
Для получения дополнительной информации о параметрах конфигурации и выводе схемы при
запросах к внешним источникам, таким как Azure Blob Storage, см. [Автоматический вывод схемы
из входных данных](https://clickhouse.com/docs/interfaces/schema-inference)
:::

8. Теперь вставьте данные из Azure Blob Storage в таблицу sensors:
```sql
INSERT INTO sensors
SELECT sensor_id, lat, lon, timestamp, temperature
FROM azureBlobStorage(
    '<ВАША СТРОКА ПОДКЛЮЧЕНИЯ>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
SETTINGS format_csv_delimiter = ';'
```

Ваша таблица sensors теперь заполнена данными из файла `2019-06_bmp180.csv.zst`,
сохраняемого в Azure Blob Storage.

## Дополнительные ресурсы {#additional-resources}

Это лишь базовое введение в использование функции azureBlobStorage. Для
более сложных опций и подробности конфигурации, пожалуйста, обратитесь к официальной
документации:

- [Табличная функция azureBlobStorage](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Форматы для входных и выходных данных](https://clickhouse.com/docs/sql-reference/formats)
- [Автоматический вывод схемы из входных данных](https://clickhouse.com/docs/interfaces/schema-inference)
