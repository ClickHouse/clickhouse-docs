---
sidebar_label: 'Загрузка JSON'
sidebar_position: 20
title: 'Работа с JSON'
slug: /integrations/data-formats/json/loading
description: 'Загрузка JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка']
---


# Загрузка JSON

В этом разделе мы предполагаем, что данные JSON находятся в формате [NDJSON](https://github.com/ndjson/ndjson-spec) (JSON с разделением по строкам), известном как [`JSONEachRow`](/interfaces/formats#jsoneachrow) в ClickHouse. Это предпочтительный формат для загрузки JSON благодаря своей краткости и эффективному использованию пространства, но поддерживаются и другие для [входных и выходных данных](/interfaces/formats#json).

Рассмотрим следующий пример JSON, представляющий строку из [набор данных Python PyPI](https://clickpy.clickhouse.com/):

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

Для загрузки этого объекта JSON в ClickHouse необходимо определить схему таблицы. Простая схема для этого показана ниже, где **ключи JSON сопоставлены с именами столбцов**:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note Ключи сортировки
Мы выбрали ключ сортировки здесь с помощью `ORDER BY`. Для получения дополнительной информации о ключах сортировки и том, как их выбирать, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать данные JSON в нескольких форматах, автоматически определяя тип по расширению и содержимому. Мы можем читать файлы JSON для вышеуказанной таблицы, используя [функцию S3](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Обратите внимание, что мы не обязаны указывать формат файла. Вместо этого мы используем шаблон glob для чтения всех `*.json.gz` файлов в бакете. ClickHouse автоматически определяет, что формат — это `JSONEachRow` (ndjson) по расширению файла и содержимому. Формат можно явно указать через функции параметров в случае, если ClickHouse не может его обнаружить.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Сжатые файлы
Вышеуказанные файлы также сжаты. Это автоматически обнаруживается и обрабатывается ClickHouse.
:::

Для загрузки строк из этих файлов мы можем использовать [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┐
│ 2022-05-26 │ CN               │ clickhouse-connect │
│ 2022-05-26 │ CN               │ clickhouse-connect │
└────────────┴──────────────┴────────────────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

Строки также могут быть загружены интерактивно, используя [`FORMAT` clause](/sql-reference/statements/select/format) например:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

Эти примеры предполагают использование формата JSONEachRow. Поддерживаются и другие распространенные форматы JSON, примеры загрузки которых приведены [здесь](/integrations/data-formats/json/other-formats).

Выше представлено очень простое примеры загрузки данных JSON. Для более сложного JSON, включая вложенные структуры, смотрите руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).
