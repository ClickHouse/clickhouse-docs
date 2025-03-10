---
title: Проектирование схемы JSON
slug: /integrations/data-formats/json/schema
description: Как оптимально спроектировать схему JSON
keywords: [json, clickhouse, вставка, загрузка, форматы, схема]
---

# Проектирование вашей схемы

Хотя [выявление схемы](/integrations/data-formats/json/inference) может использоваться для установления начальной схемы для данных JSON и запросов к JSON-файлам на месте, например, в S3, пользователи должны стремиться к установлению оптимизированной версионной схемы для своих данных. Мы обсудим варианты моделирования JSON-структур ниже.
## Извлечение, где это возможно {#extract-where-possible}

Где это возможно, пользователи рекомендуются извлекать ключи JSON, которые они часто запрашивают, в колонки на корне схемы. Кроме упрощения синтаксиса запроса, это позволяет пользователям использовать эти колонки в своем `ORDER BY`, если требуется, или указать [вторичный индекс](/optimize/skipping-indexes).

Рассмотрим [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), исследованный в руководстве [**Выявление схемы JSON**](/integrations/data-formats/json/inference):

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Числовой Парсинг на Гигабайт в Секунду",
  "comments": "Программное обеспечение на https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "С жесткими дисками и сетями, предоставляющими гигабайты в секунду ....\n",
  "versions": [
    {
      "created": "Пн, 11 Янв 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Сб, 30 Янв 2021 23:57:29 GMT",
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

Предположим, что мы хотим сделать первое значение `versions.created` основным ключом сортировки - предпочтительно под именем `published_date`. Это должно быть либо извлечено до вставки, либо во время вставки с использованием [материализованных представлений](/docs/materialized-view/incremental-materialized-view) ClickHouse или [материализованных колонок](/sql-reference/statements/alter/column#materialize-column).

Материализованные колонки представляют собой самый простой способ извлечения данных во время запроса и предпочтительны, если логика извлечения может быть зафиксирована как простое SQL-выражение. В качестве примера `published_date` может быть добавлена в схему arXiv как материализованная колонка и определена как ключ сортировки следующим образом:

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
    `published_date` DateTime DEFAULT parseDateTimeBestEffort(versions[1].1)
)
ENGINE = MergeTree
ORDER BY published_date
```

<!--TODO: Найти лучший способ-->
:::note Выражение колонки для вложенных данных
В приведенном выше примере нам необходимо получить доступ к кортежу с использованием нотации `versions[1].1`, ссылаясь на колонку `created` по позиции, а не по предпочтительному синтаксису `versions.created_at[1]`.
:::

При загрузке данных колонка будет извлечена:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
0 rows in set. Elapsed: 39.827 sec. Processed 2.52 million rows, 1.39 GB (63.17 thousand rows/s., 34.83 MB/s.)

SELECT published_date
FROM arxiv_2
LIMIT 2
┌──────published_date─┐
│ 2007-03-31 02:26:18 │
│ 2007-03-31 03:16:14 │
└─────────────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

:::note Поведение материализованной колонки
Значения материализованных колонок всегда рассчитываются во время вставки и не могут быть указаны в запросах `INSERT`. Материализованные колонки, по умолчанию, не будут возвращены в `SELECT *`. Это сделано для того, чтобы сохранить инвариант о том, что результат `SELECT *` всегда может быть снова вставлен в таблицу с помощью `INSERT`. Это поведение может быть отключено, установив `asterisk_include_materialized_columns=1`.
:::

Для более сложных задач фильтрации и преобразования мы рекомендуем использовать [материализованные представления](/materialized-view/incremental-materialized-view).
## Статический и динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON - определить соответствующий тип для каждого значения ключа. Мы рекомендуем пользователям применять следующие правила рекурсивно ко всем ключам в иерархии JSON, чтобы определить соответствующий тип для каждого ключа.

1. **Примитивные типы** - Если значение ключа является примитивным типом, независимо от того, является ли оно частью подпункта или находится на корне, убедитесь, что вы выбрали его тип в соответствии с общими [лучшими практиками проектирования схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` ниже, могут быть смоделированы как `Array(<type>)`, например, `Array(String)`.
2. **Статический против динамического** - Если значение ключа представляет собой сложный объект, т.е. либо объект, либо массив объектов, определите, подвержен ли он изменениям. Объекты, которые редко имеют новые ключи, где добавление нового ключа может быть предсказано и обработано с помощью изменения схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), могут считаться **статическими**. Это включает объекты, в которых только подмножество ключей может быть предоставлено в некоторых JSON-документах. Объекты, в которых новые ключи добавляются часто и/или непредсказуемы, следует считать **динамическими**. Чтобы определить, является ли значение **статическим** или **динамическим**, просмотрите соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-objects) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects) ниже.

<p></p>

**Важно:** Указанные выше правила должны применяться рекурсивно. Если значение ключа определяется как динамическое, дальнейшая оценка не требуется, и можно следовать указаниям в [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects). Если объект статический, продолжайте оценивать подклюющие элементы, пока либо значения ключей не станут примитивными, либо не встретятся динамические ключи.

Чтобы проиллюстрировать эти правила, мы используем следующий JSON-пример, представляющий человека:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "Склад данных в реальном времени для аналитики",
    "labels": {
      "type": "системы баз данных",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Базы данных",
    "holidays": [
      {
        "year": 2024,
        "location": "Азорские острова, Португалия"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

Применяя эти правила:

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены как тип `String`. Колонка `phone_numbers` является массивом примитивов типа `Array(String)`, а `dob` и `id` имеют тип `Date` и `UInt32` соответственно.
- Новые ключи не будут добавлены в объект `address` (только новые объекты адресов), и его можно считать **статическим**. Если мы рекурсируем, все подколонки можно считать примитивами (и типом `String`), кроме `geo`. Это также статическая структура с двумя колонками `Float32`, `lat` и `lon`.
- Колонка `tags` является **динамической**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект любого типа и структуры.
- Объект `company` является **статическим** и всегда будет содержать не более 3 указанных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект. Значения всегда будут парами ключ-значение типа string.
## Обработка статических объектов {#handling-static-objects}

Мы рекомендуем обрабатывать статические объекты с помощью именованных кортежей т.е. `Tuple`. Массивы объектов можно хранить с помощью массивов кортежей т.е. `Array(Tuple)`. Внутри самих кортежей колонки и их соответствующие типы должны быть определены с использованием тех же правил. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем ранее приведенный пример человека JSON, опуская динамические объекты:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "Склад данных в реальном времени для аналитики"
  },
  "dob": "2007-03-31"
}
```

Схема для этой таблицы представлена ниже:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

Обратите внимание, как колонка `company` определяется как `Tuple(catchPhrase String, name String)`. Поле `address` использует `Array(Tuple)`, с вложенным `Tuple`, чтобы представить колонку `geo`.

JSON можно вставить в эту таблицу в ее текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}
```

В нашем примере выше у нас минимальные данные, но, как показано ниже, мы можем запрашивать поля кортежа по их точечно-разделенным именам.

```sql
SELECT
    address.street,
    company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, как колонка `address.street` возвращается как `Array`. Чтобы запросить конкретный объект внутри массива по позиции, следует указать смещение массива после имени колонки. Например, чтобы получить улицу из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Основной недостаток кортежей заключается в том, что подколонки не могут быть использованы в ключах сортировки. Следовательно, следующее не будет работать:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY company.name

Code: 47. DB::Exception: Missing columns: 'company.name' while processing query: 'company.name', required columns: 'company.name' 'company.name'. (UNKNOWN_IDENTIFIER)
```

:::note Кортежи в ключе сортировки
Хотя колонки кортежей не могут быть использованы в ключах сортировки, весь кортеж может быть использован. Хотя это возможно, это редко имеет смысл.
:::
### Обработка значений по умолчанию {#handling-default-values}

Даже если JSON-объекты структурированы, они часто редкие, с только подмножеством известных ключей, предоставленных. К счастью, тип `Tuple` не требует всех колонок в полезной нагрузке JSON. Если они не предоставлены, будут использоваться значения по умолчанию.

Рассмотрим нашу ранее созданную таблицу `people` и следующий разреженный JSON, в котором отсутствуют ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771"
    }
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}
```

Мы можем увидеть, что следующая строка может быть успешно вставлена:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запросив эту единственную строку, мы можем увидеть, что используются значения по умолчанию для колонок (включая подпункты), которые были опущены:

```sql
SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "id": "1",
    "name": "Clicky McCliickHouse",
    "username": "Clicky",
    "email": "clicky@clickhouse.com",
    "address": [
        {
            "city": "Wisokyburgh",
            "geo": {
                "lat": 0,
                "lng": 0
            },
            "street": "Victor Plains",
            "suite": "",
            "zipcode": "90566-7771"
        }
    ],
    "phone_numbers": [],
    "website": "clickhouse.com",
    "company": {
        "catchPhrase": "",
        "name": "ClickHouse"
    },
    "dob": "2007-03-31"
}

1 row in set. Elapsed: 0.001 sec.
```

:::note Различение пустых и null
Если пользователям необходимо различать, является ли значение пустым или не предоставленным, можно использовать [Nullable](/sql-reference/data-types/nullable). Это [должно быть избегнуто](/cloud/bestpractices/avoid-nullable-columns), если это абсолютно необходимо, так как это негативно скажется на производительности хранения и запросов по этим колонкам.
:::
### Обработка новых колонок {#handling-new-columns}

Хотя структурированный подход является самым простым, когда JSON-ключи статичны, этот подход все равно может быть использован, если изменения в схеме могут быть запланированы, то есть новые ключи известны заранее, и схема может быть изменена соответственно.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые указаны в полезной нагрузке и отсутствуют в схеме. Рассмотрим следующую измененную JSON-полезную нагрузку с добавлением ключа `nickname`:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "nickname": "Clicky",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "Склад данных в реальном времени для аналитики"
  },
  "dob": "2007-03-31"
}
```

Этот JSON может быть успешно вставлен с игнорированием ключа `nickname`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Колонки можно добавлять в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию может быть указано через `DEFAULT`, которое будет использоваться, если оно не указано при последующих вставках. Строки, для которых это значение отсутствует (так как они были вставлены до его создания), также будут возвращать это значение по умолчанию. Если значение по умолчанию не указано, будет использоваться значение по умолчанию для типа.

Например:

```sql
-- вставить начальную строку (никнейм будет проигнорирован)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

-- добавить колонку
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- вставить новую строку (те же данные, но другой id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

-- выбрать 2 строки
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```
## Обработка динамических объектов {#handling-dynamic-objects}

Существует два рекомендуемых подхода к работе с динамическими объектами:

- тип [Map(String,V)](/sql-reference/data-types/map)
- [String](/sql-reference/data-types/string) с функциями JSON

Следующие правила могут быть применены для определения наиболее подходящего.

1. Если объекты сильно динамические, без предсказуемой структуры и содержат произвольные вложенные объекты, пользователи должны использовать тип `String`. Значения могут быть извлечены во время запроса с помощью функций JSON, как мы показываем ниже.
2. Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите возможность использования типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также может рассматриваться для объектов с подпункциями, при условии, что последние имеют однородность в своих типах. Обычно мы рекомендуем использовать тип `Map` для меток и тегов, например, метки подов Kubernetes в данных журналов.

<br />

:::note Применяйте подход на уровне объекта
Разные техники могут быть применены к разным объектам в одной схеме. Некоторые объекты можно лучше решить с помощью `String`, а другие - с помощью `Map`. Обратите внимание, что, как только используется тип `String`, дальнейшие решения по схеме не нужно принимать. Напротив, возможно вложение подпунктов внутри ключа `Map`, как мы показываем ниже - включая `String`, представляющий JSON.
:::
### Использование String {#using-string}

Обработка данных с использованием описанного выше структурированного подхода часто невозможна для тех пользователей, у которых динамический JSON, который подвержен изменениям или для которого схема не очень понятна. Для абсолютной гибкости пользователи могут просто хранить JSON как `String`, а затем использовать функции для извлечения полей по мере необходимости. Это представляет собой крайнее противоположность обработки JSON как структурированного объекта. Эта гибкость повышает стоимость с существенными недостатками - прежде всего увеличением сложности синтаксиса запросов, а также ухудшением производительности.

Как уже упоминалось ранее, для [оригинального объекта человека](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру колонки `tags`. Мы вставляем оригинальную строку (также включаем `company.labels`, который мы игнорируем пока), объявляя колонку `Tags` как `String`:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики","labels":{"type":"системы баз данных","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

Мы можем выбрать колонку `tags` и увидеть, что JSON вставлен как строка:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Функции [JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions) могут использоваться для извлечения значений из этого JSON. Рассмотрите простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Азорские острова, Португалия"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, как функции требуют как ссылки на колонку `String` `tags`, так и пути в JSON для извлечения. Вложенные пути требуют вложения функций, например, `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, что извлекает колонку `tags.car.year`. Извлечение вложенных путей можно упростить с помощью функций [JSON_QUERY](/sql-reference/functions/json-functions#json_query) И [JSON_VALUE](/sql-reference/functions/json-functions#json_value).

Рассмотрим крайний случай с набором данных `arxiv`, где мы рассматриваем весь текст как `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

Чтобы вставить в эту схему, нам нужно использовать формат `JSONAsString`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

Предположим, что мы хотим подсчитать количество публикаций, выпущенных по годам. Сравните запрос как против [структурированной версии](/integrations/data-formats/json/inference#creating-tables) схемы, так и с использованием только строки:

```sql
-- используя структурированную схему
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- используя неструктурированную строку

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

Обратите внимание на использование здесь выражения XPath для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Функции String медленно, значительно (> 10x) по сравнению с явными преобразованиями типов с индексами. Вышеупомянутые запросы всегда требуют полного сканирования таблицы и обработки каждой строки. Хотя эти запросы все еще будут быстры на небольшом наборе данных, таком как этот, производительность ухудшится на более крупных наборах данных.

Гибкость этого подхода приходит с ясной ценой по производительности и синтаксису, и его следует использовать только для высокодинамических объектов в схеме.
#### Простые функции JSON {#simple-json-functions}

В приведенных выше примерах используются функции семейства JSON*. Эти функции используют полный парсер JSON на основе [simdjson](https://github.com/simdjson/simdjson), который строго относится к его анализу и различает один и тот же поле, вложенное на разных уровнях. Эти функции могут справляться с JSON, который синтаксически корректен, но не хорошо отформатирован, например, с двойными пробелами между ключами.

Существуют более быстрые и строгие функции. Эти функции `simpleJSON*` предлагают потенциально более высокую производительность, прежде всего, благодаря строгим предположениям о структуре и формате JSON. В частности:

* Имена полей должны быть постоянными
* Последовательное кодирование имен полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* Имена полей уникальны для всех вложенных структур. Дифференциация по уровням вложенности не осуществляется, и соответствие неразборчиво. В случае нескольких совпадающих полей используется первое вхождение.
* Никаких специальных символов вне строковых литералов. Это касается пробелов. Следующее недействительно и не будет парситься.

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    В то время как следующее парсится корректно:

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

В некоторых случаях, когда производительность критична и ваш JSON соответствует вышеуказанным требованиям, эти функции могут быть уместными. Пример ранее приведенного запроса, переписанного с использованием функций `simpleJSON*`, показан ниже:

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
```

Здесь используется `simpleJSONExtractString` для извлечения ключа `created`, используя тот факт, что нам нужно только первое значение для даты публикации. В этом случае ограничения функций `simpleJSON*` приемлемы для получения производительности.
### Использование Map {#using-map}

Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите использование типа `Map`. В идеале, количество уникальных ключей не должно превышать нескольких сотен. Мы рекомендуем использовать тип `Map` для меток и тегов, например, метки подов Kubernetes в данных журналов. Хотя это простой способ представления вложенных структур, `Map` имеет некоторые заметные ограничения:

- Все поля должны быть одного и того же типа.
- Для доступа к подпунктам требуется специальный синтаксис карты, поскольку поля не существуют как колонки; весь объект является колонкой.
- Доступ к подколонке загружает все значение `Map`, т.е. всех сиблингов и их соответствующие значения. Для более крупных карт это может привести к значительным потерям производительности.

:::note Строковые ключи
При моделировании объектов как `Map` используется ключ `String` для хранения имени ключа JSON. Таким образом, карта всегда будет иметь вид `Map(String, T)`, где `T` зависит от данных.
:::
#### Примитивные значения {#primitive-values}

Самое простое применение `Map` - это когда объект содержит значения одного и того же примитивного типа. В большинстве случаев это предполагает использование типа `String` для значения `T`.

Рассмотрим наш [предыдущий JSON для лица](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определен как динамический. Важно, что мы ожидаем добавления в этот объект только пар ключ-значение типа String. Таким образом, мы можем объявить это как `Map(String, String)`:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

Мы можем вставить наш оригинальный полный JSON объект:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 строка в наборе. Время: 0.002 сек.
```

Запрос этих полей внутри объекта требует синтаксиса карты, например:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 строка в наборе. Время: 0.001 сек.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 строка в наборе. Время: 0.001 сек.
```

Полный набор функций `Map` доступен для запроса в это время, описанный [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не одного типа, существуют функции для выполнения [необходимого приведения типов](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также может быть рассмотрен для объектов, которые имеют подобъекты, при условии, что последние имеют согласованность в своих типах.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где под-объект для каждого `tag` имеет колонку `name` и `time`. Упрощенный пример такого JSON документа может выглядеть следующим образом:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

Это может быть смоделировано с помощью `Map(String, Tuple(name String, time DateTime))`, как показано ниже:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 строка в наборе. Время: 0.002 сек.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 строка в наборе. Время: 0.001 сек.
```

Применение карт в этом случае обычно редкое и предполагает, что данные следует перепроектировать так, чтобы динамические имена ключей не содержали под-объектов. Например, вышеуказанное может быть перепроектировано следующим образом, позволяя использование `Array(Tuple(key String, name String, time DateTime))`.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```
