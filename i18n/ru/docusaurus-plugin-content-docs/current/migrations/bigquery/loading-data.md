---
sidebar_label: 'Загрузка данных'
title: 'Загрузка данных из BigQuery в ClickHouse'
slug: /migrations/bigquery/loading-data
description: 'Как загрузить данные из BigQuery в ClickHouse'
keywords: ['миграция', 'миграция данных', 'миграция', 'данные', 'etl', 'elt', 'BigQuery']
---

_Этот путеводитель совместим с ClickHouse Cloud и с самоуправляемым ClickHouse v23.5+._

Этот путеводитель показывает, как мигрировать данные из [BigQuery](https://cloud.google.com/bigquery) в ClickHouse.

Сначала мы экспортируем таблицу в [объектное хранилище Google (GCS)](https://cloud.google.com/storage), а затем импортируем эти данные в [ClickHouse Cloud](https://clickhouse.com/cloud). Эти шаги необходимо повторить для каждой таблицы, которую вы хотите экспортировать из BigQuery в ClickHouse.

## Как долго будет занимать экспорт данных в ClickHouse? {#how-long-will-exporting-data-to-clickhouse-take}

Экспорт данных из BigQuery в ClickHouse зависит от размера вашего набора данных. Для сравнения, экспорт [публичного набора данных Ethereum размером 4 ТБ](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) из BigQuery в ClickHouse с использованием этого путеводителя занимает примерно час.

| Таблица                                                                                           | Строки        | Экспортированные файлы | Размер данных | Экспорт из BigQuery | Время Слота     | Импорт в ClickHouse |
| ------------------------------------------------------------------------------------------------- | ------------- | --------------------- | ------------- | ------------------- | ---------------- | ------------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)           | 16,569,489    | 73                    | 14.53ГБ      | 23 сек              | 37 мин           | 15.4 сек            |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169                  | 957ГБ        | 1 мин 38 сек        | 1 день 8ч        | 18 мин 5 сек        |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)           | 6,325,819,306 | 17,985                | 2.896ТБ      | 5 мин 46 сек        | 5 дней 19 ч      | 34 мин 55 сек       |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)     | 57,225,837    | 350                   | 45.35ГБ      | 16 сек              | 1 ч 51 мин       | 39.4 сек            |
| Итого                                                                                             | 8.26 миллиардов| 23,577                | 3.982ТБ      | 8 мин 3 сек         | \> 6 дней 5 ч    | 53 мин 45 сек       |

## 1. Экспорт данных таблицы в GCS {#1-export-table-data-to-gcs}

На этом этапе мы используем [рабочую область SQL BigQuery](https://cloud.google.com/bigquery/docs/bigquery-web-ui) для выполнения наших SQL-команд. Ниже мы экспортируем таблицу BigQuery под названием `mytable` в ведро GCS с помощью оператора [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements).

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- Рекомендуем установить n так, чтобы он соответствовал x миллиардам строк. То есть для 5 миллиардов строк, n = 5
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

В приведенном выше запросе мы экспортируем нашу таблицу BigQuery в [формат данных Parquet](https://parquet.apache.org/). У нас также есть символ `*` в нашем параметре `uri`. Это обеспечивает разбивку вывода на несколько файлов с нумерованным суффиксом, если экспорт превышает 1 ГБ данных.

У этого подхода есть несколько преимуществ:

- Google позволяет экспортировать до 50 ТБ в день в GCS бесплатно. Пользователи платят только за хранилище GCS.
- Экспорт автоматически создает несколько файлов, ограничивая каждый максимумом в 1 ГБ данных таблицы. Это полезно для ClickHouse, поскольку позволяет параллелизовать импорты.
- Parquet, как столбцовый формат, представляет собой лучший формат для обмена, так как он по своей природе сжат и быстрее для экспорта из BigQuery и запроса в ClickHouse.

## 2. Импорт данных в ClickHouse из GCS {#2-importing-data-into-clickhouse-from-gcs}

После завершения экспорта мы можем импортировать эти данные в таблицу ClickHouse. Вы можете использовать [SQL-консоль ClickHouse](/integrations/sql-clients/sql-console) или [`clickhouse-client`](/interfaces/cli), чтобы выполнить команды ниже.

Сначала вам нужно [создать вашу таблицу](/sql-reference/statements/create/table) в ClickHouse:

```sql
-- Если в вашей таблице BigQuery есть столбец типа STRUCT, необходимо включить эту настройку
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

После создания таблицы включите настройку `parallel_distributed_insert_select`, если у вас есть несколько реплик ClickHouse в вашем кластере, чтобы ускорить наш экспорт. Если у вас только один узел ClickHouse, этот шаг можно пропустить:

```sql
SET parallel_distributed_insert_select = 1;
```

Наконец, мы можем вставить данные из GCS в нашу таблицу ClickHouse, используя оператор [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select), который вставляет данные в таблицу на основе результатов запроса `SELECT`.

Чтобы получить данные для `INSERT`, мы можем использовать функцию [s3Cluster](/sql-reference/table-functions/s3Cluster) для получения данных из нашего ведра GCS, так как GCS совместим с [Amazon S3](https://aws.amazon.com/s3/). Если у вас только один узел ClickHouse, вы можете использовать функцию [s3](/sql-reference/table-functions/s3) вместо функции `s3Cluster`.

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') as some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

`ACCESS_ID` и `SECRET`, используемые в приведенном выше запросе, — это ваш [HMAC-ключ](https://cloud.google.com/storage/docs/authentication/hmackeys), связанный с вашим ведром GCS.

:::note Используйте `ifNull` при экспорте столбцов, допускающих NULL
В приведенном выше запросе мы используем функцию [`ifNull`](/sql-reference/functions/functions-for-nulls#ifnull) со столбцом `some_text`, чтобы вставить данные в нашу таблицу ClickHouse с значением по умолчанию. Вы также можете сделать ваши столбцы в ClickHouse [`Nullable`](/sql-reference/data-types/nullable), но это не рекомендуется, так как может негативно повлиять на производительность.

В качестве альтернативы вы можете использовать `SET input_format_null_as_default=1`, и любые отсутствующие или NULL значения будут заменены значениями по умолчанию для их соответствующих столбцов, если эти значения по умолчанию указаны.
:::

## 3. Тестирование успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные правильно вставлены, просто выполните запрос `SELECT` к вашей новой таблице:

```sql
SELECT * FROM mytable limit 10;
```

Чтобы экспортировать больше таблиц BigQuery, просто повторите шаги выше для каждой дополнительной таблицы.

## Дальнейшее чтение и поддержка {#further-reading-and-support}

В дополнение к этому путеводителю, мы также рекомендуем прочитать наш блог, который показывает [как использовать ClickHouse для ускорения BigQuery и как обрабатывать инкрементальные импорты](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries).

Если у вас возникли проблемы с передачей данных из BigQuery в ClickHouse, пожалуйста, не стесняйтесь обращаться к нам по адресу support@clickhouse.com.
