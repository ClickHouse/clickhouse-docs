---
'sidebar_label': 'Загрузка JSON'
'sidebar_position': 20
'title': 'Работа с JSON'
'slug': '/integrations/data-formats/json/loading'
'description': 'Загрузка JSON'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'inserting'
'score': 15
'doc_type': 'guide'
---


# Загрузка JSON {#loading-json}

Следующие примеры предоставляют очень простой пример загрузки структурированных и полуструктурированных данных JSON. Для более сложного JSON, включая вложенные структуры, смотрите руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).

## Загрузка структурированного JSON {#loading-structured-json}

В этом разделе мы предполагаем, что данные JSON находятся в формате [`NDJSON`](https://github.com/ndjson/ndjson-spec) (JSON с разделителями строк), известном как [`JSONEachRow`](/interfaces/formats#jsoneachrow) в ClickHouse, и имеют хорошую структуру, т.е. имена колонок и типы фиксированы. `NDJSON` является предпочтительным форматом для загрузки JSON благодаря своей краткости и эффективному использованию пространства, но также поддерживаются и другие форматы для [входа и выхода](/interfaces/formats#json).

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

Для того чтобы загрузить этот объект JSON в ClickHouse, необходимо определить схему таблицы.

В этом простом случае наша структура статична, наши имена колонок известны, и их типы хорошо определены.

Хотя ClickHouse поддерживает полуструктурированные данные через тип JSON, где имена ключей и их типы могут быть динамическими, это здесь не требуется.

:::note Предпочитайте статические схемы, где это возможно
В случаях, когда ваши колонки имеют фиксированные имена и типы, и новые колонки не ожидаются, всегда предпочтительнее статически определенная схема в производстве.

Тип JSON предпочтителен для высоко динамичных данных, где имена и типы колонок могут меняться. Этот тип также полезен при прототипировании и исследовании данных.
:::

Простая схема для этого показана ниже, где **ключи JSON сопоставляются с именами колонок**:

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

:::note Упорядочение ключей
Мы выбрали здесь ключ упорядочения через условие `ORDER BY`. Для получения дополнительной информации о ключах упорядочения и том, как их выбирать, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать данные JSON в нескольких форматах, автоматически определяя тип по расширению и содержимому. Мы можем читать JSON-файлы для вышеуказанной таблицы, используя [функцию S3](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Обратите внимание, что нам не требуется указывать формат файла. Вместо этого мы используем шаблон для чтения всех файлов `*.json.gz` в корзине. ClickHouse автоматически определяет, что формат — это `JSONEachRow` (ndjson) на основе расширения файла и его содержимого. Формат можно указать вручную через параметры функций, если ClickHouse не может его определить.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Сжатые файлы
Вышеупомянутые файлы также сжаты. Это автоматически определяется и обрабатывается ClickHouse.
:::

Для загрузки строк из этих файлов мы можем использовать [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

Строки также могут быть загружены инлайн с использованием [`FORMAT` clause](/sql-reference/statements/select/format) например:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

Эти примеры предполагают использование формата `JSONEachRow`. Поддерживаются и другие общие форматы JSON, примеры загрузки которых приведены [здесь](/integrations/data-formats/json/other-formats).

## Загрузка полуструктурированного JSON {#loading-semi-structured-json}

Наш предыдущий пример загружал JSON, который был статичным с известными именами ключей и типами. Однако это часто не так — ключи могут быть добавлены или их типы могут измениться. Это распространено в таких случаях, как данные наблюдаемости.

ClickHouse обрабатывает это через специализированный тип [`JSON`](/sql-reference/data-types/newjson).

Рассмотрим следующий пример из расширенной версии вышеупомянутого набора данных [Python PyPI](https://clickpy.clickhouse.com/). Здесь мы добавили произвольный столбец `tags` с случайными парами ключ-значение.

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}

```

Столбец tags здесь непредсказуем и, следовательно, невозможно его смоделировать. Для загрузки этих данных мы можем использовать нашу предыдущую схему, но предоставить дополнительный столбец `tags` типа [`JSON`](/sql-reference/data-types/newjson):

```sql
SET enable_json_type = 1;

CREATE TABLE pypi_with_tags
(
    `date` Date,
    `country_code` String,
    `project` String,
    `type` String,
    `installer` String,
    `python_minor` String,
    `system` String,
    `version` String,
    `tags` JSON
)
ENGINE = MergeTree
ORDER BY (project, date);
```

Мы заполняем таблицу, используя тот же подход, что и для исходного набора данных:

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0 rows in set. Elapsed: 255.679 sec. Processed 1.00 million rows, 29.00 MB (3.91 thousand rows/s., 113.43 KB/s.)
Peak memory usage: 2.00 GiB.

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.149 sec.
```

Обратите внимание на разницу в производительности при загрузке данных. Столбец JSON требует определения типа во время вставки, а также дополнительного хранилища, если существуют колонки с более чем одним типом. Хотя тип JSON можно настроить (см. [Проектирование схемы JSON](/integrations/data-formats/json/schema)) для эквивалентной производительности с явным объявлением колонок, он специально предназначен для гибкости «из коробки». Однако эта гибкость имеет свои затраты. 

### Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
* Содержат **значения с варьируемыми типами** (например, путь может иногда содержать строку, иногда число).
* Требуют гибкости схемы, когда строгая типизация невозможна.

Если структура ваших данных известна и последовательна, редко возникает необходимость в типе JSON, даже если ваши данные находятся в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы колонок, например, String.
* **Предсказуемую вложенность**: используйте типы Tuple, Array или Nested для этих структур.
* **Предсказуемую структуру с варьируемыми типами**: рассмотрите возможность использования типов Dynamic или Variant.

Вы также можете смешивать подходы, как мы сделали в приведенном примере, используя статические колонки для предсказуемых ключей верхнего уровня и один JSON-столбец для динамической части полезной нагрузки.
