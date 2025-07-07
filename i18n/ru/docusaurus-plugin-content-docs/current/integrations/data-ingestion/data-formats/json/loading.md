---
sidebar_label: 'Загрузка JSON'
sidebar_position: 20
title: 'Работа с JSON'
slug: /integrations/data-formats/json/loading
description: 'Загрузка JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'вставка']
score: 15
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# Загрузка JSON {#loading-json}

Следующие примеры предоставляют очень простой пример загрузки структурированных и полуструктурированных данных JSON. Для более сложного JSON, включая вложенные структуры, смотрите руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).

## Загрузка Структурированного JSON {#loading-structured-json}

В этом разделе мы предполагаем, что данные JSON находятся в формате [`NDJSON`](https://github.com/ndjson/ndjson-spec) (JSON с разделителями строк), известном как [`JSONEachRow`](/interfaces/formats#jsoneachrow) в ClickHouse, и хорошо структурированы, т.е. имена и типы колонок являются фиксированными. `NDJSON` является предпочтительным форматом для загрузки JSON благодаря своей краткости и эффективному использованию пространства, но другие форматы также поддерживаются для [входа и выхода](/interfaces/formats#json).

Рассмотрим следующий пример JSON, представляющий строку из набора данных [Python PyPI](https://clickpy.clickhouse.com/):

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

Для загрузки этого объекта JSON в ClickHouse необходимо определить схему таблицы. 

В этом простом случае наша структура статична, наши имена колонок известны, и их типы определены. 

Хотя ClickHouse поддерживает полуструктурированные данные через тип JSON, где имена ключей и их типы могут быть динамическими, в этом случае это не обязательно.

:::note Предпочитайте статические схемы, когда это возможно
В случаях, когда ваши колонки имеют фиксированные имена и типы, и не ожидаются новые колонки, всегда предпочтительнее использовать статически определённую схему в продакшене.

Тип JSON предпочтителен для высоко динамических данных, где имена и типы колонок могут изменяться. Этот тип также полезен в прототипировании и исследовании данных.
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

:::note Ключи сортировки
Мы выбрали ключ сортировки здесь с помощью предложения `ORDER BY`. Для получения дополнительных сведений о ключах сортировки и том, как их выбирать, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать данные JSON в нескольких форматах, автоматически выводя тип из расширения и содержимого. Мы можем читать JSON-файлы для вышеуказанной таблицы, используя [функцию S3](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Обратите внимание, что нам не требуется указывать формат файла. Вместо этого мы используем шаблон glob для чтения всех `*.json.gz` файлов в ведре. ClickHouse автоматически определяет формат как `JSONEachRow` (ndjson) по расширению файла и содержимому. Формат можно указать вручную через параметр функции в случае, если ClickHouse не может его распознать.

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

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

Строки также могут быть загружены инлайн с помощью [`FORMAT` clause](/sql-reference/statements/select/format), например

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

Эти примеры предполагают использование формата `JSONEachRow`. Поддерживаются также другие распространенные форматы JSON, примеры загрузки которых приведены [здесь](/integrations/data-formats/json/other-formats).


## Загрузка Полуструктурированного JSON {#loading-semi-structured-json}

<PrivatePreviewBadge/>

Наш предыдущий пример загружал JSON, который был статичным с известными именами ключей и типами. Это часто не так - ключи могут быть добавлены или их типы могут измениться. Это часто встречается в таких случаях, как данные мониторинга.

ClickHouse обрабатывает это через специализированный тип [`JSON`](/sql-reference/data-types/newjson).

Рассмотрим следующий пример из расширенной версии вышеуказанного набора данных [Python PyPI](https://clickpy.clickhouse.com/). Здесь мы добавили произвольную колонку `tags` с случайными парами ключ-значение.

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

Колонка tags здесь непредсказуема и, следовательно, невозможно ее смоделировать. Чтобы загрузить эти данные, мы можем использовать нашу предыдущую схему, но добавить дополнительную колонку `tags` типа [`JSON`](/sql-reference/data-types/newjson):

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

Мы заполняем таблицу, используя тот же подход, что и для первоначального набора данных:

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

Обратите внимание на разницу в производительности при загрузке данных. Колонка JSON требует вывода типа во время вставки, а также дополнительного места, если существуют колонки, которые имеют более одного типа. Хотя тип JSON может быть настроен (смотрите [Проектирование схемы JSON](/integrations/data-formats/json/schema)) для эквивалентной производительности с явным объявлением колонок, он изначально имеет намеренную гибкость. Тем не менее, эта гибкость имеет свою цену.

### Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
* Содержат **значения разного типа** (например, путь может иногда содержать строку, а иногда число).
* Требуется гибкость схемы, где строгая типизация невозможна.

Если структура ваших данных известна и последовательна, редко возникает необходимость в типе JSON, даже если ваши данные находятся в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы колонок, например String.
* **Предсказуемую вложенность**: используйте кортеж, массив или вложенные типы для этих структур.
* **Предсказуемую структуру с изменяющимися типами**: рассмотрите использование динамических или вариантивных типов вместо этого.

Вы также можете комбинировать подходы, как мы сделали в приведенном выше примере, используя статические колонки для предсказуемых ключей верхнего уровня и одну колонку JSON для динамической части полезной нагрузки.
