---
sidebar_label: 'Загрузка данных'
title: 'Загрузка данных из BigQuery в ClickHouse'
slug: /migrations/bigquery/loading-data
description: 'Как загрузить данные из BigQuery в ClickHouse'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_Это руководство применимо к ClickHouse Cloud и к саморазвёрнутым инсталляциям ClickHouse версии v23.5+._

В этом руководстве показано, как перенести данные из [BigQuery](https://cloud.google.com/bigquery) в ClickHouse.

Сначала мы экспортируем таблицу в [объектное хранилище Google (GCS)](https://cloud.google.com/storage), а затем импортируем эти данные в [ClickHouse Cloud](https://clickhouse.com/cloud). Эти шаги нужно повторить для каждой таблицы, которую вы хотите экспортировать из BigQuery в ClickHouse.



## Сколько времени займет экспорт данных в ClickHouse? {#how-long-will-exporting-data-to-clickhouse-take}

Время экспорта данных из BigQuery в ClickHouse зависит от размера набора данных. Для сравнения: экспорт [публичного набора данных Ethereum объемом 4 ТБ](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) из BigQuery в ClickHouse по данному руководству занимает около часа.

| Таблица                                                                                           | Строк         | Экспортировано файлов | Размер данных | Экспорт BigQuery | Время слотов    | Импорт ClickHouse |
| ------------------------------------------------------------------------------------------------- | ------------- | --------------------- | ------------- | ---------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16 569 489    | 73                    | 14,53 ГБ      | 23 сек           | 37 мин          | 15,4 сек          |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1 864 514 414 | 5169                  | 957 ГБ        | 1 мин 38 сек     | 1 день 8 ч      | 18 мин 5 сек      |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6 325 819 306 | 17 985                | 2,896 ТБ      | 5 мин 46 сек     | 5 дней 19 ч     | 34 мин 55 сек     |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57 225 837    | 350                   | 45,35 ГБ      | 16 сек           | 1 ч 51 мин      | 39,4 сек          |
| Итого                                                                                             | 8,26 млрд     | 23 577                | 3,982 ТБ      | 8 мин 3 сек      | \> 6 дней 5 ч   | 53 мин 45 сек     |

<VerticalStepper headerLevel="h2">


## Экспорт данных таблицы в GCS {#1-export-table-data-to-gcs}

На этом шаге мы используем [рабочую область BigQuery SQL](https://cloud.google.com/bigquery/docs/bigquery-web-ui) для выполнения SQL-команд. Ниже показан экспорт таблицы BigQuery с именем `mytable` в корзину GCS с помощью оператора [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements).

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- Рекомендуется устанавливать n в соответствии с количеством миллиардов строк. Например, для 5 миллиардов строк n = 5
SET n = 100;

WHILE i < n DO
  SET export_path = CONCAT('gs://mybucket/mytable/', i,'-*.parquet');
  EXPORT DATA
    OPTIONS (
      uri = export_path,
      format = 'PARQUET',
      overwrite = true
    )
  AS (
    SELECT * FROM mytable WHERE export_id = i
  );
  SET i = i + 1;
END WHILE;
```

В приведенном выше запросе таблица BigQuery экспортируется в [формат данных Parquet](https://parquet.apache.org/). В параметре `uri` используется символ `*`, который обеспечивает разделение результата на несколько файлов с числовым возрастающим суффиксом, если объем экспорта превышает 1 ГБ данных.

Этот подход имеет ряд преимуществ:

- Google позволяет экспортировать в GCS до 50 ТБ в день бесплатно. Пользователи платят только за хранение данных в GCS.
- Экспорт автоматически создает несколько файлов, ограничивая размер каждого максимум 1 ГБ табличных данных. Это полезно для ClickHouse, поскольку позволяет распараллелить импорт.
- Parquet как колоночный формат является более эффективным форматом обмена данными, поскольку он изначально сжат и обеспечивает более быстрый экспорт из BigQuery и выполнение запросов в ClickHouse


## Импорт данных в ClickHouse из GCS {#2-importing-data-into-clickhouse-from-gcs}

После завершения экспорта можно импортировать эти данные в таблицу ClickHouse. Для выполнения приведённых ниже команд можно использовать [консоль ClickHouse SQL](/integrations/sql-clients/sql-console) или [`clickhouse-client`](/interfaces/cli).

Сначала необходимо [создать таблицу](/sql-reference/statements/create/table) в ClickHouse:

```sql
-- Если таблица BigQuery содержит столбец типа STRUCT, необходимо включить эту настройку,
-- чтобы сопоставить этот столбец со столбцом ClickHouse типа Nested
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

После создания таблицы включите настройку `parallel_distributed_insert_select`, если в кластере имеется несколько реплик ClickHouse — это ускорит импорт. Если используется только один узел ClickHouse, этот шаг можно пропустить:

```sql
SET parallel_distributed_insert_select = 1;
```

Наконец, можно вставить данные из GCS в таблицу ClickHouse с помощью [команды `INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select), которая вставляет данные в таблицу на основе результатов запроса `SELECT`.

Для получения данных для `INSERT` можно использовать [функцию s3Cluster](/sql-reference/table-functions/s3Cluster) для извлечения данных из бакета GCS, поскольку GCS совместим с [Amazon S3](https://aws.amazon.com/s3/). Если используется только один узел ClickHouse, вместо функции `s3Cluster` можно использовать [табличную функцию s3](/sql-reference/table-functions/s3).

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') AS some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

Параметры `ACCESS_ID` и `SECRET`, используемые в приведённом выше запросе, представляют собой [ключ HMAC](https://cloud.google.com/storage/docs/authentication/hmackeys), связанный с бакетом GCS.

:::note Использование `ifNull` при экспорте nullable-столбцов
В приведённом выше запросе используется [функция `ifNull`](/sql-reference/functions/functions-for-nulls#ifNull) со столбцом `some_text` для вставки данных в таблицу ClickHouse со значением по умолчанию. Также можно сделать столбцы в ClickHouse [`Nullable`](/sql-reference/data-types/nullable), но это не рекомендуется, так как может негативно повлиять на производительность.

В качестве альтернативы можно выполнить `SET input_format_null_as_default=1`, и любые отсутствующие или NULL значения будут заменены значениями по умолчанию для соответствующих столбцов, если эти значения по умолчанию указаны.
:::


## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, что данные были корректно вставлены, выполните запрос `SELECT` к новой таблице:

```sql
SELECT * FROM mytable LIMIT 10;
```

Для экспорта дополнительных таблиц BigQuery повторите описанные выше шаги для каждой таблицы.

</VerticalStepper>


## Дополнительные материалы и поддержка {#further-reading-and-support}

Помимо данного руководства, рекомендуем ознакомиться с нашей статьей в блоге о том, [как использовать ClickHouse для ускорения работы с BigQuery и как выполнять инкрементальный импорт данных](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries).

Если у вас возникли проблемы с переносом данных из BigQuery в ClickHouse, обращайтесь в службу поддержки по адресу support@clickhouse.com.
