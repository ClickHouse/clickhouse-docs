---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Using JSON'
title: 'Используйте JSON там, где это уместно'
description: 'Страница, описывающая, когда следует использовать JSON'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse теперь предлагает нативный тип столбца JSON, предназначенный для полуструктурированных и динамических данных. Важно уточнить, что **это тип столбца, а не формат данных** — вы можете вставлять JSON в ClickHouse как строку или через поддерживаемые форматы, такие как [JSONEachRow](/interfaces/formats/JSONEachRow), но это само по себе не означает использование типа столбца JSON. Тип JSON следует использовать только тогда, когда структура данных является динамической, а не в случаях, когда данные лишь хранятся в формате JSON.



## Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

- Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
- Содержат **значения различных типов** (например, путь может содержать то строку, то число).
- Требуют гибкости схемы в случаях, когда строгая типизация невозможна.

Если структура данных известна и стабильна, необходимость в типе JSON возникает редко, даже если данные представлены в формате JSON. В частности, если ваши данные имеют:

- **Плоскую структуру с известными ключами**: используйте стандартные типы столбцов, например String.
- **Предсказуемую вложенность**: используйте типы Tuple, Array или Nested для таких структур.
- **Предсказуемую структуру с различными типами**: рассмотрите вместо этого типы Dynamic или Variant.

Вы также можете комбинировать подходы — например, использовать статические столбцы для предсказуемых полей верхнего уровня и один столбец JSON для динамической части полезной нагрузки.


## Рекомендации и советы по использованию JSON {#considerations-and-tips-for-using-json}

Тип JSON обеспечивает эффективное колоночное хранение путём преобразования путей в подколонки. Но с гибкостью приходит и ответственность. Для эффективного использования:

- **Указывайте типы путей** с помощью [подсказок в определении колонки](/sql-reference/data-types/newjson), чтобы задать типы для известных подколонок и избежать ненужного вывода типов.
- **Пропускайте пути**, если значения не нужны, используя [SKIP и SKIP REGEXP](/sql-reference/data-types/newjson) для сокращения объёма хранения и повышения производительности.
- **Избегайте установки слишком высокого значения [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)**—большие значения увеличивают потребление ресурсов и снижают эффективность. Как правило, рекомендуется держать его ниже 10 000.

:::note Подсказки типов
Подсказки типов — это не просто способ избежать ненужного вывода типов, они полностью устраняют косвенность хранения и обработки. Пути JSON с подсказками типов всегда хранятся так же, как обычные колонки, исключая необходимость в [**колонках-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении во время выполнения запроса. Это означает, что при правильно определённых подсказках типов вложенные поля JSON достигают той же производительности и эффективности, как если бы они были смоделированы как поля верхнего уровня с самого начала. В результате для наборов данных, которые в основном согласованы, но всё же выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости реструктурировать схему или конвейер загрузки данных.
:::


## Расширенные возможности {#advanced-features}

- Столбцы JSON **могут использоваться в первичных ключах** так же, как и любые другие столбцы. Для подстолбцов нельзя указывать кодеки.
- Они поддерживают интроспекцию с помощью функций [`JSONAllPathsWithTypes()` и `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions).
- Вложенные подобъекты можно читать с использованием синтаксиса `.^`.
- Синтаксис запросов может отличаться от стандартного SQL и может требовать специального приведения типов или операторов для вложенных полей.

Дополнительную информацию см. в [документации ClickHouse по JSON](/sql-reference/data-types/newjson) или в статье блога [Новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).


## Примеры {#examples}

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

Предположим, что эта схема статична и типы данных могут быть чётко определены. Даже если данные представлены в формате NDJSON (по одной строке JSON на строку), нет необходимости использовать тип JSON для такой схемы. Достаточно определить схему с использованием классических типов.

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

и вставить строки JSON:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

Рассмотрим [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 миллиона научных статей. Каждая строка в этом наборе данных, распространяемом в формате NDJSON, представляет опубликованную научную работу. Пример строки показан ниже:

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

Хотя JSON здесь сложный, с вложенными структурами, он предсказуем. Количество и типы полей не изменятся. Хотя для этого примера можно использовать тип JSON, мы также можем явно определить структуру, используя типы [Tuple](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested):

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

Данные снова можно вставить в формате JSON:


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

Предположим, что добавлен ещё один столбец `tags`. Если бы это был простой список строк, мы могли бы смоделировать его как `Array(String)`, но давайте предположим, что пользователи могут добавлять произвольные структуры тегов со смешанными типами (обратите внимание, что `score` может быть строкой или целым числом). Наш модифицированный JSON документ:

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "Парсинг чисел со скоростью гигабайт в секунду",
 "comments": "Программное обеспечение: https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/",
 "journal-ref": "Software: Practice and Experience 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "Поскольку диски и сети обеспечивают гигабайты в секунду ....\n",
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
     "name": "Пользователь ClickHouse",
     "score": "A+",
     "comment": "Полезное чтение, применимо к ClickHouse"
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "Мало что нового узнал",
     "updates": [
       {
         "name": "professor X",
         "comment": "Росомаха оказался интереснее"
       }
     ]
   }
 }
}
```

В этом случае мы могли бы представить документы arXiv либо целиком в формате JSON, либо просто добавить JSON‑столбец `tags`. Ниже приведены оба примера:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
Мы указываем подсказку типа для столбца `update_date` в JSON-определении, так как используем его в сортировке/первичном ключе. Это помогает ClickHouse понять, что этот столбец не будет равен NULL, и гарантирует, что он выберет корректный подстолбец `update_date` (для каждого типа может существовать несколько подстолбцов, поэтому без этого возникает неоднозначность).
:::

Мы можем выполнить вставку в эту таблицу и просмотреть затем автоматически выведенную схему с помощью функции [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) и формата вывода [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow):


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Парсинг чисел со скоростью гигабайт в секунду","comments":"Программное обеспечение: https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Поскольку диски и сети обеспечивают гигабайты в секунду ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"Пользователь ClickHouse","score":"A+","comment":"Полезное чтение, применимо к ClickHouse"},"28_03_2025":{"name":"профессор X","score":10,"comment":"Мало что нового узнал","updates":[{"name":"профессор X","comment":"Росомаха нашёл это более интересным"}]}}}
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

1 строка в наборе. Затрачено: 0.003 сек.
```

В качестве альтернативы мы могли бы смоделировать это, используя нашу предыдущую схему и JSON-столбец `tags`. Обычно такой подход предпочтительнее, так как он минимизирует объем неявных выводов, которые должен делать ClickHouse:

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Парсинг чисел со скоростью гигабайт в секунду","comments":"Программное обеспечение: https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Учитывая, что диски и сети обеспечивают гигабайты в секунду ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"Пользователь ClickHouse","score":"A+","comment":"Полезное чтение, применимо к ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Мало что нового узнал","updates":[{"name":"professor X","comment":"Росомаха нашёл это более интересным"}]}}}
```


Теперь мы можем определить типы подстолбца `tags`.

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

Получена 1 строка. Затрачено: 0.002 сек.
```
