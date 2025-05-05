---
sidebar_label: 'Загрузка JSON'
sidebar_position: 20
title: 'Работа с JSON'
slug: /integrations/data-formats/json/loading
description: 'Загрузка JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка']
---


# Загрузка JSON

В этом разделе мы предполагаем, что данные JSON находятся в формате [NDJSON](https://github.com/ndjson/ndjson-spec) (JSON формата, разделенного новой строкой), известным как [`JSONEachRow`](/interfaces/formats#jsoneachrow) в ClickHouse. Это предпочтительный формат для загрузки JSON из-за его компактности и эффективного использования пространства, однако поддерживаются и другие форматы как для [входа, так и выхода](/interfaces/formats#json).

Рассмотрим следующий пример JSON, представляющий строку из [набора данных Python PyPI](https://clickpy.clickhouse.com/):

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

Для того чтобы загрузить этот объект JSON в ClickHouse, необходимо определить схему таблицы. Простой пример схемы показан ниже, где **ключи JSON сопоставлены с именами колонок**:

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
Мы выбрали ключ сортировки здесь через оператор `ORDER BY`. Для получения дополнительной информации о ключах сортировки и о том, как их выбирать, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать данные JSON в нескольких форматах, автоматически определяя тип по расширению и содержимому. Мы можем читать JSON-файлы для указанной таблицы, используя [S3 функцию](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Обратите внимание, что нам не требуется указывать формат файла. Вместо этого мы используем образец glob для чтения всех `*.json.gz` файлов в бакете. ClickHouse автоматически определяет формат как `JSONEachRow` (ndjson) на основе расширения файла и содержания. Формат можно указать вручную через параметры функций, в случае если ClickHouse не в состоянии его обнаружить.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Сжатые файлы
Вышеуказанные файлы также сжаты. Это автоматически обнаруживается и обрабатывается ClickHouse.
:::

Чтобы загрузить строки из этих файлов, мы можем использовать [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

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

Строки также могут быть загружены встраиваемым способом с использованием [`FORMAT` клаузулы](/sql-reference/statements/select/format), например:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

Эти примеры предполагают использование формата JSONEachRow. Поддерживаются и другие общие форматы JSON, с примерами загрузки которых можно ознакомиться [здесь](/integrations/data-formats/json/other-formats).

Предоставленный выше пример является очень простым примером загрузки данных JSON. Для более сложного JSON, включая вложенные структуры, смотрите руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).
