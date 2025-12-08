---
sidebar_label: 'Загрузка данных'
title: 'Загрузка данных из BigQuery в ClickHouse'
slug: /migrations/bigquery/loading-data
description: 'Как загрузить данные из BigQuery в ClickHouse'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_Это руководство подходит для ClickHouse Cloud и для самостоятельного развертывания ClickHouse версии v23.5+._

В этом руководстве показано, как мигрировать данные из [BigQuery](https://cloud.google.com/bigquery) в ClickHouse.

Сначала мы экспортируем таблицу в [объектное хранилище Google (GCS)](https://cloud.google.com/storage), а затем импортируем эти данные в [ClickHouse Cloud](https://clickhouse.com/cloud). Эти шаги необходимо повторить для каждой таблицы, которую вы хотите экспортировать из BigQuery в ClickHouse.

## Сколько времени займет экспорт данных в ClickHouse? {#how-long-will-exporting-data-to-clickhouse-take}

Экспорт данных из BigQuery в ClickHouse зависит от размера набора данных. Для сравнения: экспорт [публичного набора данных Ethereum объемом 4 ТБ](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) из BigQuery в ClickHouse по данному руководству занимает около часа.

| Таблица                                                                                           | Строк         | Экспортировано файлов | Размер данных | Экспорт BigQuery | Время слотов    | Импорт ClickHouse |
| ------------------------------------------------------------------------------------------------- | ------------- | --------------------- | ------------- | ---------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73                    | 14.53GB       | 23 сек           | 37 мин          | 15.4 сек          |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169                  | 957GB         | 1 мин 38 сек     | 1 день 8 ч      | 18 мин 5 сек      |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985                | 2.896TB       | 5 мин 46 сек     | 5 дней 19 ч     | 34 мин 55 сек     |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350                   | 45.35GB       | 16 сек           | 1 ч 51 мин      | 39.4 сек          |
| Итого                                                                                             | 8.26 млрд     | 23,577                | 3.982TB       | 8 мин 3 сек      | \> 6 дней 5 ч   | 53 мин 45 сек     |

<VerticalStepper headerLevel="h2">

## Экспорт данных таблицы в GCS {#1-export-table-data-to-gcs}

На этом шаге мы используем [рабочую область BigQuery SQL](https://cloud.google.com/bigquery/docs/bigquery-web-ui) для выполнения SQL-команд. Ниже мы экспортируем таблицу BigQuery с именем `mytable` в бакет GCS с помощью оператора [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements).

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- Рекомендуется задавать n в соответствии с количеством миллиардов строк. Например, при 5 миллиардах строк n = 5
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

В приведённом выше запросе мы экспортируем таблицу BigQuery в [формат данных Parquet](https://parquet.apache.org/). В параметре `uri` мы также используем символ `*`. Это обеспечивает разбиение результата на несколько файлов с числовым возрастающим суффиксом в случае, если объём экспортируемых данных превысит 1 ГБ.

У такого подхода есть ряд преимуществ:

* Google позволяет бесплатно экспортировать до 50 ТБ в день в GCS. Пользователи платят только за хранение в GCS.
* Экспорт автоматически создаёт несколько файлов, ограничивая размер каждого максимум 1 ГБ табличных данных. Это выгодно для ClickHouse, поскольку позволяет распараллелить импорт.
* Parquet как колоночный формат является более подходящим форматом обмена данными, поскольку он изначально сжат и позволяет BigQuery быстрее выполнять экспорт, а ClickHouse — быстрее выполнять запросы.

## Импорт данных в ClickHouse из GCS {#2-importing-data-into-clickhouse-from-gcs}

После завершения экспорта мы можем импортировать эти данные в таблицу ClickHouse. Вы можете использовать [консоль ClickHouse SQL](/integrations/sql-clients/sql-console) или [`clickhouse-client`](/interfaces/cli) для выполнения приведённых ниже команд.

Сначала [создайте таблицу](/sql-reference/statements/create/table) в ClickHouse:

```sql
-- Если таблица BigQuery содержит столбец типа STRUCT, необходимо включить эту настройку
-- для сопоставления этого столбца со столбцом ClickHouse типа Nested
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

После создания таблицы включите параметр `parallel_distributed_insert_select`, если в вашем кластере несколько реплик ClickHouse, чтобы ускорить экспорт. Если у вас только один узел ClickHouse, вы можете пропустить этот шаг:

```sql
SET parallel_distributed_insert_select = 1;
```

Наконец, мы можем вставить данные из GCS в нашу таблицу ClickHouse с помощью [команды `INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select), которая вставляет данные в таблицу на основе результатов запроса `SELECT`.

Чтобы получить данные для `INSERT`, мы можем использовать [функцию s3Cluster](/sql-reference/table-functions/s3Cluster) для чтения данных из нашего GCS‑бакета, поскольку GCS совместим с [Amazon S3](https://aws.amazon.com/s3/). Если у вас только один узел ClickHouse, вместо функции `s3Cluster` вы можете использовать [табличную функцию s3](/sql-reference/table-functions/s3).

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

`ACCESS_ID` и `SECRET`, используемые в приведённом выше запросе, — это ваш [HMAC-ключ](https://cloud.google.com/storage/docs/authentication/hmackeys), связанный с вашим бакетом GCS.

:::note Используйте `ifNull` при экспорте nullable-столбцов
В приведённом выше запросе мы используем [функцию `ifNull`](/sql-reference/functions/functions-for-nulls#ifNull) с колонкой `some_text`, чтобы вставлять данные в таблицу ClickHouse с значением по умолчанию. Вы также можете сделать колонки в ClickHouse типом [`Nullable`](/sql-reference/data-types/nullable), но это не рекомендуется, так как это может негативно повлиять на производительность.

В качестве альтернативы вы можете выполнить `SET input_format_null_as_default=1`, и любые отсутствующие или NULL-значения будут заменены значениями по умолчанию для соответствующих колонок, если такие значения заданы.
:::

## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, что данные были корректно вставлены, выполните запрос `SELECT` к новой таблице:

```sql
SELECT * FROM mytable LIMIT 10;
```

Для экспорта дополнительных таблиц BigQuery повторите описанные выше шаги для каждой таблицы.

</VerticalStepper>

## Дополнительные материалы и поддержка {#further-reading-and-support}

Помимо этого руководства, мы также рекомендуем прочитать нашу публикацию в блоге, где объясняется, [как использовать ClickHouse для ускорения BigQuery и как работать с инкрементальными импортами](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries).

Если у вас возникают проблемы с передачей данных из BigQuery в ClickHouse, вы можете связаться с нами по адресу support@clickhouse.com.
