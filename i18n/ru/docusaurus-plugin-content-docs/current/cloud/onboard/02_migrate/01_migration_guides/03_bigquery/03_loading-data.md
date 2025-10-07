---
'sidebar_label': 'Загрузка данных'
'title': 'Загрузка данных из BigQuery в ClickHouse'
'slug': '/migrations/bigquery/loading-data'
'description': 'Как загрузить данные из BigQuery в ClickHouse'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
'doc_type': 'guide'
---

_Этот гид совместим с ClickHouse Cloud и для самоуправляемого ClickHouse версии v23.5+._

Этот гид показывает, как мигрировать данные из [BigQuery](https://cloud.google.com/bigquery) в ClickHouse.

Сначала мы экспортируем таблицу в [объектное хранилище Google (GCS)](https://cloud.google.com/storage), а затем импортируем эти данные в [ClickHouse Cloud](https://clickhouse.com/cloud). Эти шаги необходимо повторить для каждой таблицы, которую вы хотите экспортировать из BigQuery в ClickHouse.

## Как долго будет длиться экспорт данных в ClickHouse? {#how-long-will-exporting-data-to-clickhouse-take}

Экспорт данных из BigQuery в ClickHouse зависит от размера вашего набора данных. Для сравнения, перенос [публичного набора данных Ethereum объемом 4 ТБ](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) из BigQuery в ClickHouse с использованием данного гида занимает около часа.

| Таблица                                                                                         | Строки         | Экспортированные файлы | Размер данных | Экспорт из BigQuery | Время слота     | Импорт в ClickHouse |
| ------------------------------------------------------------------------------------------------ | -------------- | --------------------- | ------------- | ------------------- | ---------------- | ------------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)          | 16,569,489     | 73                    | 14.53GB       | 23 сек              | 37 мин           | 15.4 сек            |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414  | 5169                  | 957GB         | 1 мин 38 сек        | 1 день 8 часов   | 18 мин 5 сек       |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)          | 6,325,819,306  | 17,985                | 2.896TB       | 5 мин 46 сек        | 5 дней 19 часов  | 34 мин 55 сек      |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)     | 57,225,837     | 350                   | 45.35GB       | 16 сек              | 1 час 51 мин     | 39.4 сек            |
| Всего                                                                                           | 8.26 миллиардов | 23,577                | 3.982TB       | 8 мин 3 сек         | > 6 дней 5 часов | 53 мин 45 сек      |

<VerticalStepper headerLevel="h2">

## Экспорт данных таблицы в GCS {#1-export-table-data-to-gcs}

На этом этапе мы используем [SQL-рабочую область BigQuery](https://cloud.google.com/bigquery/docs/bigquery-web-ui) для выполнения наших SQL-команд. Ниже мы экспортируем таблицу BigQuery под названием `mytable` в корзину GCS с помощью оператора [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements).

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- We recommend setting n to correspond to x billion rows. So 5 billion rows, n = 5
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

В приведенном выше запросе мы экспортируем нашу таблицу BigQuery в [формат данных Parquet](https://parquet.apache.org/). Мы также используем символ `*` в нашем параметре `uri`. Это гарантирует, что выходные данные будут разбиты на несколько файлов, с возрастающим числовым суффиксом, если экспорт превышает 1 ГБ данных.

Этот подход имеет несколько преимуществ:

- Google позволяет экспортировать до 50 ТБ в день в GCS бесплатно. Пользователи платят только за хранение в GCS.
- Экспорт автоматически создает несколько файлов, ограничивая каждый максимум до 1 ГБ данных таблицы. Это полезно для ClickHouse, поскольку позволяет параллелизовать импорт.
- Parquet, будучи ориентированным на колонки форматом, представляет собой лучший формат обмена, так как он изначально сжат и быстрее для экспорта из BigQuery и для запросов в ClickHouse.

## Импорт данных в ClickHouse из GCS {#2-importing-data-into-clickhouse-from-gcs}

После завершения экспорта мы можем импортировать эти данные в таблицу ClickHouse. Вы можете использовать [SQL-консоль ClickHouse](/integrations/sql-clients/sql-console) или [`clickhouse-client`](/interfaces/cli) для выполнения команд ниже.

Сначала вы должны [создать свою таблицу](/sql-reference/statements/create/table) в ClickHouse:

```sql
-- If your BigQuery table contains a column of type STRUCT, you must enable this setting
-- to map that column to a ClickHouse column of type Nested
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

После создания таблицы, включите настройку `parallel_distributed_insert_select`, если у вас есть несколько реплик ClickHouse в вашем кластере, чтобы ускорить наш экспорт. Если у вас только один узел ClickHouse, вы можете пропустить этот шаг:

```sql
SET parallel_distributed_insert_select = 1;
```

Наконец, мы можем вставить данные из GCS в нашу таблицу ClickHouse с помощью команды [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select), которая вставляет данные в таблицу на основе результатов запроса `SELECT`.

Чтобы получить данные для `INSERT`, мы можем использовать функцию [s3Cluster](/sql-reference/table-functions/s3Cluster) для извлечения данных из нашей корзины GCS, так как GCS совместим с [Amazon S3](https://aws.amazon.com/s3/). Если у вас только один узел ClickHouse, вы можете использовать функцию [s3](/sql-reference/table-functions/s3) вместо функции `s3Cluster`.

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

`ACCESS_ID` и `SECRET`, используемые в приведенном выше запросе, это ваш [HMAC ключ](https://cloud.google.com/storage/docs/authentication/hmackeys), связанный с вашей корзиной GCS.

:::note Используйте `ifNull` при экспорте nullable колонок
В приведенном выше запросе мы используем функцию [`ifNull`](/sql-reference/functions/functions-for-nulls#ifNull) с колонкой `some_text`, чтобы вставить данные в нашу таблицу ClickHouse с помощью значения по умолчанию. Вы также можете сделать свои колонки в ClickHouse [`Nullable`](/sql-reference/data-types/nullable), но это не рекомендуется, так как может негативно сказаться на производительности.

В качестве альтернативы вы можете `SET input_format_null_as_default=1`, и все пропущенные или NULL значения будут заменены значениями по умолчанию для соответствующих колонок, если эти значения по умолчанию указаны.
:::

## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные правильно вставлены, просто выполните запрос `SELECT` на вашей новой таблице:

```sql
SELECT * FROM mytable LIMIT 10;
```

Чтобы экспортировать больше таблиц BigQuery, просто повторите шаги выше для каждой дополнительной таблицы.

</VerticalStepper>

## Дальнейшее чтение и поддержка {#further-reading-and-support}

В дополнение к этому гиду, мы также рекомендуем прочитать наш пост в блоге, который показывает [как использовать ClickHouse для ускорения BigQuery и как обрабатывать инкрементные импорты](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries).

Если у вас возникли проблемы с передачей данных из BigQuery в ClickHouse, пожалуйста, не стесняйтесь обращаться к нам по адресу support@clickhouse.com.
