---
'sidebar_label': 'Использование функции таблицы azureBlobStorage'
'slug': '/integrations/azure-data-factory/table-function'
'description': 'Использование функции таблицы azureBlobStorage ClickHouse'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'azureBlobStorage'
'title': 'Использование функции таблицы azureBlobStorage ClickHouse для переноса данных
  из Azure в ClickHouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Использование функции таблицы azureBlobStorage в ClickHouse {#using-azureBlobStorage-function}

Это один из самых эффективных и простых способов копирования данных из Azure Blob Storage или Azure Data Lake Storage в ClickHouse. С помощью этой функции таблицы вы можете указать ClickHouse напрямую подключиться к хранилищу Azure и читать данные по мере необходимости.

Она предоставляет интерфейс, похожий на таблицу, который позволяет вам выбирать, вставлять и фильтровать данные непосредственно из источника. Функция является высоко оптимизированной и поддерживает множество широко используемых форматов файлов, включая `CSV`, `JSON`, `Parquet`, `Arrow`, `TSV`, `ORC`, `Avro` и другие. Полный список смотрите в разделе ["Форматы данных"](/interfaces/formats).

В этом разделе мы рассмотрим простое руководство по началу переноса данных из Azure Blob Storage в ClickHouse, а также важные моменты для эффективного использования этой функции. Для получения более подробной информации и расширенных возможностей смотрите официальную документацию:
[`azureBlobStorage` Документация по функции таблицы](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Получение ключей доступа Azure Blob Storage {#acquiring-azure-blob-storage-access-keys}

Чтобы позволить ClickHouse получить доступ к вашему Azure Blob Storage, вам понадобится строка подключения с ключом доступа.

1. В портале Azure перейдите к вашему **Учетной записи хранения**.

2. В левом меню выберите **Ключи доступа** в разделе **Безопасность + сеть**.
   <Image img={azureDataStoreSettings} size="lg" alt="Настройки хранилища Azure" border/>

3. Выберите либо **key1**, либо **key2**, и нажмите кнопку **Показать** рядом с полем **Строка подключения**.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Ключи доступа хранилища Azure" border/>

4. Скопируйте строку подключения — вы будете использовать ее как параметр в функции таблицы azureBlobStorage.

## Запрос данных из Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

Откройте предпочитаемую консоль запросов ClickHouse — это может быть веб-интерфейс ClickHouse Cloud, клиент CLI ClickHouse или любой другой инструмент, который вы используете для выполнения запросов. Как только у вас будут готовы строка подключения и консоль запросов ClickHouse, вы можете начать запрашивать данные непосредственно из Azure Blob Storage.

В следующем примере мы запрашиваем все данные, хранящиеся в файлах JSON, расположенных в контейнере с именем data-container:

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Если вы хотите скопировать эти данные в локальную таблицу ClickHouse (например, my_table), вы можете использовать оператор `INSERT INTO ... SELECT`:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

Это позволяет вам эффективно извлекать внешние данные в ClickHouse без необходимости промежуточных шагов ETL.

## Простой пример с использованием набора данных сенсоров окружающей среды {#simple-example-using-the-environmental-sensors-dataset}

В качестве примера мы загрузим один файл из набора данных сенсоров окружающей среды.

1. Загрузите [образец файла](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)
   из [набора данных сенсоров окружающей среды](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

2. В портале Azure создайте новую учетную запись хранения, если у вас ее еще нет.

:::warning
Убедитесь, что для вашей учетной записи хранения включен доступ с использованием ключа учетной записи, в противном случае вы не сможете использовать ключи учетной записи для доступа к данным.
:::

3. Создайте новый контейнер в вашей учетной записи хранения. В этом примере мы назовем его sensors.
   Вы можете пропустить этот шаг, если используете существующий контейнер.

4. Загрузите ранее загруженный файл `2019-06_bmp180.csv.zst` в контейнер.

5. Следуйте шагам, описанным ранее, чтобы получить строку подключения к Azure Blob Storage.

Теперь, когда все настроено, вы можете запрашивать данные непосредственно из Azure Blob Storage:

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

7. Чтобы загрузить данные в таблицу, создайте упрощенную версию схемы, использованной в оригинальном наборе данных:
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
Для получения дополнительной информации о параметрах конфигурации и выводе схемы при запросе внешних источников, таких как Azure Blob Storage, смотрите [Автоматический вывод схемы из входных данных](https://clickhouse.com/docs/interfaces/schema-inference).
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

Ваша таблица sensors теперь заполнена данными из файла `2019-06_bmp180.csv.zst`, хранящегося в Azure Blob Storage.

## Дополнительные ресурсы {#additional-resources}

Это всего лишь базовое введение в использование функции azureBlobStorage. Для получения более продвинутых опций и деталей конфигурации, пожалуйста, ознакомьтесь с официальной документацией:

- [Функция таблицы azureBlobStorage](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Форматы для входных и выходных данных](https://clickhouse.com/docs/sql-reference/formats)
- [Автоматический вывод схемы из входных данных](https://clickhouse.com/docs/interfaces/schema-inference)
