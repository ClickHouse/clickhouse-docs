---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Использование JSON'
title: 'Используйте JSON, где это уместно'
description: 'Страница, описывающая, когда использовать JSON'
---

ClickHouse теперь предлагает собственный тип колонки JSON, предназначенный для полуструктурированных и динамических данных. Важно уточнить, что **это тип колонки, а не формат данных** — вы можете вставлять JSON в ClickHouse как строку или через поддерживаемые форматы, такие как [JSONEachRow](/docs/interfaces/formats/JSONEachRow), но это не значит, что следует использовать тип колонки JSON. Пользователи должны использовать тип JSON только тогда, когда структура их данных динамична, а не просто потому, что они хранят JSON.

## Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут изменяться с течением времени.
* Содержат **значения с различными типами** (например, путь может иногда содержать строку, а иногда число).
* Требуют гибкости схемы, где строгая типизация невозможна.

Если структура ваших данных известна и последовательна, редко возникает необходимость в типе JSON, даже если ваши данные находятся в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы колонок, например, String.
* **Предсказуемое вложение**: используйте типы Tuple, Array или Nested для этих структур.
* **Предсказуемую структуру с различными типами**: рассмотрите вместо этого типы Dynamic или Variant.

Вы также можете смешивать подходы — например, использовать статические колонки для предсказуемых полей верхнего уровня и одну колонку JSON для динамического раздела полезной нагрузки.

## Соображения и советы по использованию JSON {#considerations-and-tips-for-using-json}

Тип JSON позволяет эффективно хранить данные колонками, выравнивая пути в подколонки. Однако с гибкостью приходит ответственность. Чтобы использовать его эффективно:

* **Указывайте типы путей** с помощью [подсказок в определении колонки](/sql-reference/data-types/newjson), чтобы указать типы для известных подколонок, избегая ненужного вывода типов.
* **Пропускайте пути**, если значения не нужны, используя [SKIP и SKIP REGEXP](/sql-reference/data-types/newjson), чтобы сократить объем хранилища и повысить производительность.
* **Избегайте установки [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) слишком высоко** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве правила, держите его ниже 10 000.

:::note Подсказки типов
Подсказки типов предлагают больше, чем просто способ избегания ненужного вывода типов — они полностью устраняют косвенность хранения и обработки. Пути JSON с подсказками типов всегда хранятся так же, как и традиционные колонки, обходя необходимость [**колонок-дискриминаторов**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамического разрешения во время выполнения запросов. Это означает, что при наличии хорошо определенных подсказок типов вложенные поля JSON достигают такой же производительности и эффективности, как если бы они изначально моделировались как поля верхнего уровня. В результате для наборов данных, которые в основном последовательны, но все же выигрывают от гибкости JSON, подсказки типов предлагают удобный способ сохранения производительности без необходимости перестраивать вашу схему или конвейер приёма данных.
:::

## Расширенные функции {#advanced-features}

* Колонки JSON **могут использоваться в первичных ключах**, как и любые другие колонки. Кодеки не могут быть указаны для подколонки.
* Они поддерживают интроспекцию через функции, такие как [`JSONAllPathsWithTypes()` и `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions).
* Вы можете читать вложенные подобъекты, используя синтаксис `.^`.
* Синтаксис запросов может отличаться от стандартного SQL и может требовать специального преобразования или операторов для вложенных полей.

Для получения дополнительной информации смотрите [документацию по JSON ClickHouse](/sql-reference/data-types/newjson) или ознакомьтесь с нашей публикацией в блоге [Новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).

## Примеры {#examples}

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

Предположим, что эта схема статична и типы могут быть хорошо определены. Даже если данные находятся в формате NDJSON (JSON строка на строку), нет необходимости использовать тип JSON для такой схемы. Просто определите схему с классическими типами.

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

Рассмотрим набор данных [arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2.5 миллиона научных статей. Каждая строка в этом наборе данных, распределенном в виде NDJSON, представляет собой опубликованную академическую работу. Пример строки представлен ниже:

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

Хотя JSON здесь сложен, с вложенными структурами, он предсказуем. Количество и тип полей не изменится. Хотя мы могли бы использовать тип JSON для этого примера, мы также можем просто явно определить структуру, используя [Tuple](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested) типы:

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

Снова можем вставить данные как JSON:

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

Предположим, добавлена еще одна колонка с именем `tags`. Если бы это была просто массив строк, мы могли бы смоделировать как `Array(String)`, но предположим, что пользователи могут добавлять произвольные структуры тегов с разными типами (обратите внимание, что score — это строка или целое число). Наш модифицированный JSON-документ:

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

В этом случае мы можем смоделировать документы arXiv либо полностью в JSON, либо просто добавить колонку JSON `tags`. Мы предоставляем оба примера ниже:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
Мы предоставляем подсказку типа для колонки `update_date` в определении JSON, так как мы используем его в сортировке / первичном ключе. Это помогает ClickHouse знать, что эта колонка не будет равна null и гарантирует, что он знает, какую подколонку `update_date` использовать (может быть несколько для каждого типа, так что это иначе неоднозначно).
:::

Мы можем вставить данные в эту таблицу и просмотреть схему, которая была выведена, используя функцию [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes) и формат вывода [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow):

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

В качестве альтернативы мы могли бы смоделировать это, используя нашу ранее описанную схему и колонку JSON `tags`. Это обычно предпочтительнее, минимизируя вывод, необходимый ClickHouse:

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

Теперь мы можем вывести типы подколонки tags.

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
