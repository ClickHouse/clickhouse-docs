---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Использование JSON'
title: 'Используйте JSON, когда это уместно'
description: 'Страница, описывающая, когда следует использовать JSON'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse теперь предлагает нативный тип столбца JSON, предназначенный для полуструктурированных и динамических данных. Важно уточнить, что **это тип столбца, а не формат данных** — вы можете вставлять JSON в ClickHouse как строку или с помощью поддерживаемых форматов, таких как [JSONEachRow](/interfaces/formats/JSONEachRow), но это само по себе не означает использование типа столбца JSON. Пользователям следует использовать тип JSON только в тех случаях, когда структура их данных является динамической, а не просто потому, что данные хранятся в формате JSON.

## Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые со временем могут изменяться.
* Содержат **значения разных типов** (например, в одном и том же пути иногда может быть строка, а иногда число).
* Требуют гибкой схемы, когда строгая типизация не подходит.

Если структура ваших данных известна и стабильна, тип JSON нужен редко, даже если данные представлены в формате JSON. В частности, если ваши данные имеют:

* **Плоскую структуру с известными ключами**: используйте стандартные типы столбцов, например String.
* **Предсказуемую вложенность**: используйте для таких структур типы Tuple, Array или Nested.
* **Предсказуемую структуру с разными типами значений**: вместо этого рассмотрите типы Dynamic или Variant.

Вы также можете комбинировать подходы — например, использовать статические столбцы для предсказуемых полей верхнего уровня и один столбец типа JSON для динамической части полезной нагрузки.

## Рекомендации и советы по использованию JSON {#considerations-and-tips-for-using-json}

Тип JSON обеспечивает эффективное колонночное хранение за счёт разворачивания путей в подстолбцы. Но вместе с гибкостью приходит и ответственность. Чтобы использовать его эффективно:

* **Указывайте типы путей**, используя [подсказки в определении столбца](/sql-reference/data-types/newjson), чтобы задать типы для известных подстолбцов и избежать ненужного вывода типов.
* **Пропускайте пути**, если вам не нужны их значения, с помощью [SKIP и SKIP REGEXP](/sql-reference/data-types/newjson), чтобы уменьшить объём хранения и повысить производительность.
* **Избегайте слишком большого значения [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве практического ориентира держите его ниже 10 000.

:::note Подсказки типов 
Подсказки типов дают больше, чем просто способ избежать ненужного вывода типов — они полностью устраняют уровень косвенности при хранении и обработке. Пути JSON с подсказками типов всегда хранятся так же, как традиционные столбцы, обходясь без [**дискриминаторных столбцов**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамического разрешения при выполнении запроса. Это означает, что при хорошо заданных подсказках типов вложенные поля JSON достигают той же производительности и эффективности, как если бы они с самого начала были смоделированы как поля верхнего уровня. В результате для наборов данных, которые в основном однородны, но всё ещё выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости переработки схемы или конвейера приёма данных.
:::

## Расширенные возможности {#advanced-features}

* Столбцы JSON **могут использоваться в первичных ключах**, как и любые другие столбцы. Для подстолбцов нельзя указывать кодеки.
* Поддерживается интроспекция с помощью функций [`JSONAllPathsWithTypes()` и `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions).
* Вы можете читать вложенные подобъекты, используя синтаксис `.^`.
* Синтаксис запросов может отличаться от стандартного SQL и может требовать специального приведения типов или операторов для вложенных полей.

Для получения дополнительной информации см. [документацию по JSON в ClickHouse](/sql-reference/data-types/newjson) или ознакомьтесь с нашей статьёй в блоге [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).

## Примеры {#examples}

Рассмотрим следующий образец JSON, представляющий строку из [набора данных Python PyPI](https://clickpy.clickhouse.com/):

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

Предположим, что эта схема статична и типы могут быть чётко определены. Даже если данные представлены в формате NDJSON (по одной JSON‑записи в строке), для такой схемы нет необходимости использовать тип JSON. Просто задайте схему с классическими типами.

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

и вставьте строки в формате JSON:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

Рассмотрим [датасет arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 млн научных статей. Каждая строка этого датасета в формате NDJSON соответствует одной опубликованной научной статье. Пример строки показан ниже:

```json
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
  "abstract": "Поскольку диски и сети обеспечивают пропускную способность в гигабайты в секунду ....\n",
  "versions": [
    {
      "created": "Пн, 11 янв. 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Сб, 30 янв. 2021 23:57:29 GMT",
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

Хотя приведённый здесь JSON довольно сложен из‑за вложенных структур, он предсказуем: количество и тип полей меняться не будут. Хотя для этого примера мы могли бы использовать тип данных JSON, мы также можем явно задать структуру, используя типы [Tuples](/sql-reference/data-types/tuple) и [Nested](/sql-reference/data-types/nested-data-structures/nested):

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

Предположим, что был добавлен дополнительный столбец `tags`. Если бы это был просто список строк, мы могли бы представить его в виде `Array(String)`, но допустим, пользователи могут добавлять произвольные структуры тегов со смешанными типами данных (обратите внимание, что `score` — это строка или целое число). Наш обновлённый JSON-документ:

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
         "comment": "Росомаха счёл более интересным",
       }
     ]
   }
 }
}
```

В этом случае мы могли бы представить документы arXiv либо целиком в формате JSON, либо просто добавить JSON-столбец `tags`. Ниже мы приводим оба примера:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
Мы указываем подсказку типа данных для столбца `update_date` в JSON-определении, так как используем его в сортировке/первичном ключе. Это помогает ClickHouse знать, что этот столбец не может быть null, и гарантирует, что он выберет нужную подколонку `update_date` (для каждого типа может быть несколько подколонок, поэтому без этого возникает неоднозначность).
:::

Мы можем выполнить вставку в эту таблицу и просмотреть впоследствии автоматически выведенную схему с помощью функции [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) и формата вывода [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow):

```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Парсинг чисел со скоростью гигабайт в секунду","comments":"Программное обеспечение: https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Учитывая, что диски и сети обеспечивают гигабайты в секунду ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"Пользователь ClickHouse","score":"A+","comment":"Полезное чтение, применимо к ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Мало что нового узнал","updates":[{"name":"professor X","comment":"Росомаха счёл более интересным"}]}}}
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

Получена 1 строка. Время выполнения: 0.003 сек.
```

В качестве альтернативы мы можем смоделировать это, используя нашу предыдущую схему и JSON-столбец `tags`. Такой подход обычно предпочтительнее, поскольку он минимизирует объём интерпретации данных, требуемой от ClickHouse:

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"Пользователь ClickHouse","score":"A+","comment":"Полезное чтение, применимо к ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Мало что нового узнал","updates":[{"name":"professor X","comment":"Росомаха счёл более интересным"}]}}}
```

Теперь мы можем определить типы подколонки `tags`.

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

Получена 1 строка. Прошло: 0.002 сек.
```
