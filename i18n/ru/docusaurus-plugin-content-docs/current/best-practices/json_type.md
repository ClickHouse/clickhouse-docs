---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Использование JSON'
title: 'Используйте JSON там, где это уместно'
description: 'Страница, описывающая, когда следует использовать JSON'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse теперь предлагает собственный тип столбца JSON, предназначенный для полуструктурированных и динамических данных. Важно отметить, что **это тип столбца, а не формат данных** — вы можете вставлять JSON в ClickHouse как строку или через поддерживаемые форматы, такие как [JSONEachRow](/interfaces/formats/JSONEachRow), но это само по себе не означает использование типа столбца JSON. Тип JSON следует использовать только тогда, когда структура ваших данных является динамической, а не когда вы просто храните данные в формате JSON.

## Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые со временем могут меняться.
* Содержат **значения разных типов** (например, один и тот же путь иногда может содержать строку, а иногда — число).
* Требуют гибкости схемы, при которой строгая типизация нецелесообразна.

Если структура ваших данных известна и постоянна, тип JSON требуется редко, даже если ваши данные представлены в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы столбцов, например String.
* **Предсказуемую вложенность**: используйте типы Tuple, Array или Nested для таких структур.
* **Предсказуемую структуру с разными типами значений**: вместо этого рассмотрите типы Dynamic или Variant.

Вы также можете комбинировать подходы — например, использовать статические столбцы для предсказуемых полей верхнего уровня и один столбец JSON для динамической части полезной нагрузки.

## Особенности и рекомендации по использованию JSON {#considerations-and-tips-for-using-json}

Тип JSON обеспечивает эффективное столбцовое хранение за счёт развёртывания путей в подстолбцы. Но вместе с гибкостью приходит и ответственность. Чтобы использовать его эффективно:

* **Явно задавайте типы путей**, используя [подсказки в определении столбца](/sql-reference/data-types/newjson), чтобы указать типы для известных подстолбцов и избежать ненужного вывода типов. 
* **Пропускайте пути**, значения которых вам не нужны, с помощью [SKIP и SKIP REGEXP](/sql-reference/data-types/newjson), чтобы сократить объём хранимых данных и повысить производительность.
* **Избегайте слишком больших значений [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве общего ориентира держите его ниже 10 000.

:::note Подсказки типов 
Подсказки типов — это не только способ избежать ненужного вывода типов, они полностью устраняют уровни косвенности при хранении и обработке. Пути JSON с подсказками типов всегда хранятся так же, как традиционные столбцы, обходясь без [**столбцов-дискриминаторов**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамического разрешения во время выполнения запроса. Это означает, что при хорошо заданных подсказках типов вложенные поля JSON достигают той же производительности и эффективности, как если бы они с самого начала были смоделированы как поля верхнего уровня. В результате для наборов данных, которые в основном стабильны, но всё же выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости переработки вашей схемы или конвейера приёма.
:::

## Расширенные возможности {#advanced-features}

* JSON-столбцы **могут использоваться в первичных ключах** как любые другие столбцы. Для подстолбцов нельзя задавать кодеки.
* Они поддерживают интроспекцию через функции, такие как [`JSONAllPathsWithTypes()` и `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions).
* Вы можете читать вложенные подобъекты, используя синтаксис `.^`.
* Синтаксис запросов может отличаться от стандартного SQL и может требовать специального приведения типов или использования операторов для вложенных полей.

Для получения дополнительной информации см. [документацию по JSON в ClickHouse](/sql-reference/data-types/newjson) или ознакомьтесь с нашей публикацией в блоге [Новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).

## Примеры {#examples}

Рассмотрим следующий образец JSON, представляющий одну строку из [набора данных Python PyPI](https://clickpy.clickhouse.com/):

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

Предположим, что эта схема статична и типы могут быть чётко определены. Даже если данные представлены в формате NDJSON (по одной JSON-строке на строку), нет необходимости использовать тип JSON для такой схемы. Просто опишите схему, используя классические типы.

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

и вставьте строки JSON:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

Рассмотрим [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 млн научных статей. Каждая строка в этом наборе данных, предоставленном в формате NDJSON, представляет собой опубликованную научную статью. Пример строки показан ниже:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

Хотя приведённый здесь JSON из‑за вложенных структур довольно сложен, он предсказуем: число и тип полей не изменяются. Хотя для этого примера мы могли бы использовать тип JSON, мы можем явно задать структуру, используя типы [Tuples](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested):

```sql
CREATE TABLE arxiv
(
  `id` String,
  `submitter` String,
  `authors` String,
  `title` String,
  `comments` String,
  `journal-ref` String,
  `doi` String,
  `report-no` String,
  `categories` String,
  `license` String,
  `abstract` String,
  `versions` Array(Tuple(created String, version String)),
  `update_date` Date,
  `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

Снова вставим данные в формате JSON:


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

Предположим, что был добавлен ещё один столбец `tags`. Если бы это был просто список строк, мы могли бы представить его в виде `Array(String)`, но давайте предположим, что вы можете добавлять произвольные структуры тегов со смешанными типами (обратите внимание, что `score` — это строка или целое число). Наш модифицированный JSON-документ:

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "Number Parsing at a Gigabyte per Second",
 "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
 "journal-ref": "Software: Practice and Experience 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "With disks and networks providing gigabytes per second ....\n",
 "versions": [
 {
   "created": "Mon, 11 Jan 2021 20:31:27 GMT",
   "version": "v1"
 },
 {
   "created": "Sat, 30 Jan 2021 23:57:29 GMT",
   "version": "v2"
 }
 ],
 "update_date": "2022-11-07",
 "authors_parsed": [
 [
   "Lemire",
   "Daniel",
   ""
 ]
 ],
 "tags": {
   "tag_1": {
     "name": "ClickHouse user",
     "score": "A+",
     "comment": "A good read, applicable to ClickHouse"
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "Didn't learn much",
     "updates": [
       {
         "name": "professor X",
         "comment": "Wolverine found more interesting"
       }
     ]
   }
 }
}
```

В этом случае мы можем представить документы arXiv либо целиком в формате JSON, либо просто добавить столбец `tags` типа JSON. Ниже приведены оба варианта:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
Мы задаем подсказку о типе для столбца `update_date` в определении JSON, так как используем его в сортировке/как часть первичного ключа. Это помогает ClickHouse понять, что этот столбец не может быть null, и гарантирует, что он знает, какой подстолбец `update_date` использовать (для каждого типа их может быть несколько, поэтому без этого возникает неоднозначность).
:::

Мы можем вставить данные в эту таблицу и затем посмотреть автоматически выведенную схему, используя функцию [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) и формат вывода [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow):


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

```sql
SELECT JSONAllPathsWithTypes(doc)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(doc)": {
    "abstract": "String",
    "authors": "String",
    "authors_parsed": "Array(Array(Nullable(String)))",
    "categories": "String",
    "comments": "String",
    "doi": "String",
    "id": "String",
    "journal-ref": "String",
    "license": "String",
    "submitter": "String",
    "tags.28_03_2025.comment": "String",
    "tags.28_03_2025.name": "String",
    "tags.28_03_2025.score": "Int64",
    "tags.28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tags.tag_1.comment": "String",
    "tags.tag_1.name": "String",
    "tags.tag_1.score": "String",
    "title": "String",
    "update_date": "Date",
    "versions": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))"
  }
}

1 row in set. Elapsed: 0.003 sec.
```

В качестве альтернативы мы могли бы смоделировать это, используя ранее описанную схему и JSON-столбец `tags`. Такой подход обычно предпочтительнее, так как сводит к минимуму необходимость дополнительных выводов со стороны ClickHouse:

```sql
CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String)),
    `tags` JSON()
)
ENGINE = MergeTree
ORDER BY update_date
```

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```


Теперь мы можем вывести типы подстолбца `tags`.

```sql
SELECT JSONAllPathsWithTypes(tags)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(tags)": {
    "28_03_2025.comment": "String",
    "28_03_2025.name": "String",
    "28_03_2025.score": "Int64",
    "28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tag_1.comment": "String",
    "tag_1.name": "String",
    "tag_1.score": "String"
  }
}

1 row in set. Elapsed: 0.002 sec.
```
