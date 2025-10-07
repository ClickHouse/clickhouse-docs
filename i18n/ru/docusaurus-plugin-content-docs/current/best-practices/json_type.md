---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': '使用 JSON'
'title': '在适当的地方使用 JSON'
'description': '页面描述何时使用 JSON'
'keywords':
- 'JSON'
'show_related_blogs': true
'doc_type': 'reference'
---

ClickHouse теперь предлагает родной тип колонки JSON, предназначенный для полуструктурированных и динамических данных. Важно уточнить, что **это тип колонки, а не формат данных** — вы можете вставлять JSON в ClickHouse как строку или через поддерживаемые форматы, такие как [JSONEachRow](/docs/interfaces/formats/JSONEachRow), но это не подразумевает использования типа колонки JSON. Пользователи должны использовать тип JSON только когда структура их данных динамична, а не когда они просто хранят JSON.

## Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут меняться со временем.
* Содержат **значения с различными типами** (например, путь может иногда содержать строку, иногда число).
* Требуют гибкости схемы, где строгая типизация невозможна.

Если структура ваших данных известна и последовательна, в редких случаях потребуется тип JSON, даже если ваши данные находятся в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы колонок, например, String.
* **Предсказуемую вложенность**: используйте типы Tuple, Array или Nested для этих структур.
* **Предсказуемую структуру с различными типами**: рассмотрите использование типов Dynamic или Variant.

Вы также можете комбинировать подходы - например, используйте статические колонки для предсказуемых полей верхнего уровня и одну колонку JSON для динамической части полезной нагрузки.

## Соображения и советы по использованию JSON {#considerations-and-tips-for-using-json}

Тип JSON обеспечивает эффективное колонковое хранение, упрощая пути в подколонки. Но с гибкостью приходит ответственность. Чтобы использовать его эффективно:

* **Указывайте типы путей**, используя [подсказки в определении колонки](/sql-reference/data-types/newjson), чтобы указать типы для известных подколонок, избегая ненужного вывода типов.
* **Пропускайте пути**, если вам не нужны значения, с помощью [SKIP и SKIP REGEXP](/sql-reference/data-types/newjson), чтобы снизить объем хранения и улучшить производительность.
* **Избегайте установки [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) слишком высоко** - большие значения увеличивают потребление ресурсов и снижают эффективность. Как правило, держите его ниже 10 000.

:::note Подсказки типов 
Подсказки типов предлагают больше, чем просто способ избежать ненужного вывода типов - они полностью устраняют косвенность хранения и обработки. Пути JSON с подсказками типов всегда хранятся так же, как традиционные колонки, минуя необходимость в [**дискриминаторных колонках**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении во время выполнения запроса. Это означает, что при хорошо определенных подсказках типов вложенные поля JSON достигают такой же производительности и эффективности, как если бы они были смоделированы как поля верхнего уровня с самого начала. В результате, для наборов данных, которые в основном последовательны, но все же выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность, не требуя перестройки вашей схемы или конвейера ввода данных.
:::

## Расширенные функции {#advanced-features}

* Колонки JSON **могут использоваться в первичных ключах**, как и любые другие колонки. Кодеки не могут быть указаны для подколонки.
* Они поддерживают инспекцию с помощью функций, таких как [`JSONAllPathsWithTypes()` и `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions).
* Вы можете читать вложенные подобъекты с помощью синтаксиса `.^`.
* Синтаксис запросов может отличаться от стандартного SQL и может требовать специального приведения типов или операторов для вложенных полей.

Для дополнительного руководства смотрите [документацию по JSON ClickHouse](/sql-reference/data-types/newjson) или изучите наш пост в блоге [ Новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).

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

Предположим, эта схема статична, и типы могут быть чётко определены. Даже если данные находятся в формате NDJSON (JSON-строка на строку), нет необходимости использовать тип JSON для такой схемы. Просто определите схему с классическими типами.

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

Рассмотрим набор данных [arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 миллиона научных статей. Каждая строка в этом наборе данных, распределенном как NDJSON, представляет собой опубликованную научную работу. Пример строки представлен ниже:

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

Хотя JSON здесь сложен, с вложенными структурами, он предсказуем. Количество и типы полей не будут изменяться. Хотя мы могли бы использовать тип JSON для этого примера, мы также можем просто явно определить структуру, используя [Tuples](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested) типы:

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

Снова мы можем вставить данные как JSON:

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

Предположим, добавлена другая колонка под названием `tags`. Если это была бы просто строка, мы могли бы смоделировать её как `Array(String)`, но предположим, что пользователи могут добавлять произвольные структуры тегов с различными типами (обратите внимание, что score может быть строкой или целым числом). Наш изменённый документ JSON:

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

В этом случае мы могли бы смоделировать документы arXiv как все JSON или просто добавить колонку JSON `tags`. Мы предоставляем оба примера ниже:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
Мы указываем подсказку типа для колонки `update_date` в определении JSON, так как мы используем её в порядке/первичном ключе. Это помогает ClickHouse знать, что эта колонка не будет нулевой и гарантирует, что он знает, какую подколонку `update_date` использовать (для каждого типа может быть несколько подколонок, так что иначе это будет неоднозначно).
:::

Мы можем вставить в эту таблицу и просмотреть впоследствии выведенную схему с помощью функции [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) и формата вывода [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow):

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

В качестве альтернативы мы могли бы смоделировать это, используя нашу предыдущую схему и колонку JSON `tags`. Это обычно предпочтительно, минимизируя вывод, необходимый ClickHouse:

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
