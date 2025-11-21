---
sidebar_label: 'Загрузка JSON'
sidebar_position: 20
title: 'Работа с JSON'
slug: /integrations/data-formats/json/loading
description: 'Загрузка JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'вставка']
score: 15
doc_type: 'guide'
---



# Загрузка JSON {#loading-json}

Следующие примеры демонстрируют простую загрузку структурированных и полуструктурированных данных JSON. Для работы с более сложными JSON, включая вложенные структуры, см. руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).


## Загрузка структурированного JSON {#loading-structured-json}

В этом разделе предполагается, что данные JSON представлены в формате [`NDJSON`](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON), известном в ClickHouse как [`JSONEachRow`](/interfaces/formats/JSONEachRow), и хорошо структурированы, то есть имена и типы столбцов фиксированы. `NDJSON` является предпочтительным форматом для загрузки JSON благодаря его компактности и эффективному использованию пространства, однако для [ввода и вывода](/interfaces/formats/JSON) поддерживаются и другие форматы.

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

Для загрузки этого объекта JSON в ClickHouse необходимо определить схему таблицы.

В данном простом случае структура статична, имена столбцов известны, а их типы четко определены.

Хотя ClickHouse поддерживает полуструктурированные данные через тип JSON, где имена ключей и их типы могут быть динамическими, здесь это не требуется.

:::note Предпочитайте статические схемы, где это возможно
В случаях, когда столбцы имеют фиксированные имена и типы и не ожидается появление новых столбцов, всегда используйте статически определенную схему в продуктивной среде.

Тип JSON предпочтителен для высокодинамичных данных, где имена и типы столбцов могут изменяться. Этот тип также полезен при прототипировании и исследовании данных.
:::

Простая схема для этого показана ниже, где **ключи JSON сопоставляются с именами столбцов**:

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
Здесь мы выбрали ключ сортировки с помощью выражения `ORDER BY`. Подробнее о ключах сортировки и о том, как их выбирать, см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать данные JSON в нескольких форматах, автоматически определяя тип по расширению и содержимому файла. Мы можем читать файлы JSON для указанной выше таблицы с помощью [функции S3](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Обратите внимание, что нам не требуется указывать формат файла. Вместо этого мы используем шаблон glob для чтения всех файлов `*.json.gz` в хранилище. ClickHouse автоматически определяет, что формат — `JSONEachRow` (ndjson), по расширению и содержимому файла. Формат можно указать вручную через параметры функции, если ClickHouse не может его определить автоматически.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Сжатые файлы
Указанные выше файлы также сжаты. Это автоматически определяется и обрабатывается ClickHouse.
:::

Для загрузки строк из этих файлов можно использовать [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

```


┌───────date─┬─country&#95;code─┬─project────────────┬─type──┬─installer────┬─python&#95;minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 строки в наборе. Прошло: 0.005 сек. Обработано 8.19 тысяч строк, 908.03 KB (1.63 млн строк/с., 180.38 MB/с.)

````

Строки также можно загружать непосредственно в запросе с помощью [конструкции `FORMAT`](/sql-reference/statements/select/format), например:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
````

В этих примерах используется формат `JSONEachRow`. Поддерживаются и другие распространённые форматы JSON, примеры их загрузки приведены [здесь](/integrations/data-formats/json/other-formats).


## Загрузка полуструктурированного JSON {#loading-semi-structured-json}

В предыдущем примере мы загружали JSON со статической структурой, с известными именами ключей и типами. Часто это не так — ключи могут добавляться, а их типы могут изменяться. Это характерно для таких сценариев использования, как данные мониторинга (Observability).

ClickHouse обрабатывает такие данные с помощью специального типа [`JSON`](/sql-reference/data-types/newjson).

Рассмотрим следующий пример из расширенной версии упомянутого выше набора данных [Python PyPI dataset](https://clickpy.clickhouse.com/). Здесь мы добавили произвольный столбец `tags` со случайными парами ключ-значение.

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

Столбец tags здесь непредсказуем, и поэтому его невозможно смоделировать. Для загрузки этих данных мы можем использовать предыдущую схему, но добавить дополнительный столбец `tags` типа [`JSON`](/sql-reference/data-types/newjson):

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

Заполняем таблицу тем же способом, что и для исходного набора данных:

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

Обратите внимание на разницу в производительности при загрузке данных. Столбец JSON требует определения типов во время вставки, а также дополнительного хранилища, если существуют столбцы с более чем одним типом. Хотя тип JSON можно настроить (см. [Designing JSON schema](/integrations/data-formats/json/schema)) для достижения производительности, эквивалентной явному объявлению столбцов, он намеренно является гибким по умолчанию. Однако эта гибкость имеет определённую цену.

### Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

- Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
- Содержат **значения с различными типами** (например, путь может иногда содержать строку, а иногда число).
- Требуют гибкости схемы, когда строгая типизация неприменима.

Если структура ваших данных известна и согласована, редко возникает необходимость в типе JSON, даже если данные представлены в формате JSON. В частности, если ваши данные имеют:


* **Плоская структура с известными ключами**: используйте стандартные типы столбцов, например String.
* **Предсказуемая вложенность**: для таких структур используйте типы Tuple, Array или Nested.
* **Предсказуемая структура с различающимися типами**: рассмотрите использование типов Dynamic или Variant.

Вы также можете комбинировать эти подходы, как в приведённом выше примере, используя статические столбцы для предсказуемых ключей верхнего уровня и один столбец JSON для динамической части полезной нагрузки.
