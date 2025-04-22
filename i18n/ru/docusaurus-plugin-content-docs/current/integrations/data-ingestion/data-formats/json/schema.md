---
title: 'Проектирование схемы JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально проектировать схемы JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'форматы', 'схема']
---

# Проектирование вашей схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) может быть использован для установления начальной схемы для данных JSON и запросов к файлам JSON напрямую, например, в S3, пользователям следует стремиться к установлению оптимизированной версиированной схемы для своих данных. Мы обсуждаем варианты моделирования структур JSON ниже.
## Извлечение, где это возможно {#extract-where-possible}

Где это возможно, пользователям рекомендуется извлекать ключи JSON, к которым они часто обращаются, в колонки на корне схемы. Это не только упрощает синтаксис запросов, но и позволяет использовать эти колонки в клаузе `ORDER BY`, если это необходимо, или указывать [вторичный индекс](/optimize/skipping-indexes).

Рассмотрим [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), исследованный в руководстве [**Вывод схемы JSON**](/integrations/data-formats/json/inference):

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Парсинг чисел со скоростью гигабайт в секунду",
  "comments": "Программное обеспечение на https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Программное обеспечение: практика и опыт 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "С дисками и сетями, обеспечивающими гигабайты в секунду ....\n",
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

Предположим, мы хотим сделать первое значение `versions.created` основным ключом сортировки - идеальным под названием `published_date`. Это должно быть извлечено либо до вставки, либо во время вставки, используя [материализованные представления](/docs/materialized-view/incremental-materialized-view) или [материализованные колонки](/sql-reference/statements/alter/column#materialize-column).

Материализованные колонки представляют собой самый простой способ извлечения данных во время запроса и предпочтительны, если логика извлечения может быть зафиксирована как простое SQL-выражение. К примеру, `published_date` можно добавить в схему arXiv как материализованную колонку и определить как ключ сортировки следующим образом:

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

<!--TODO: Find a better way-->
:::note Выражение колонки для вложенных
Вышеуказанное требует от нас доступа к кортежу используя нотацию `versions[1].1`, ссылаясь на колонку `created` по позиции, а не по предпочитаемому синтаксису `versions.created_at[1]`.
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
Значения материализованных колонок всегда рассчитываются во время вставки и не могут быть указаны в запросах `INSERT`. Материализованные колонки, по умолчанию, не будут возвращены в `SELECT *`. Это необходимо для сохранения инварианта, что результат `SELECT *` всегда можно снова вставить в таблицу с помощью INSERT. Это поведение может быть отключено, установив `asterisk_include_materialized_columns=1`.
:::

Для более сложных задач фильтрации и преобразования мы рекомендуем использовать [материализованные представления](/materialized-view/incremental-materialized-view).
## Статический vs динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON заключается в том, чтобы определить подходящий тип для каждого значения ключа. Мы рекомендуем пользователям применять следующие правила рекурсивно к каждому ключу в иерархии JSON, чтобы определить подходящий тип для каждого ключа.

1. **Примитивные типы** - Если значение ключа является примитивным типом, независимо от того, является ли оно частью под объекта или находится на корне, убедитесь, что вы выбираете его тип в соответствии с общими [лучшей практикой проектирования схем](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, таких как `phone_numbers` ниже, могут быть смоделированы как `Array(<type>)`, например, `Array(String)`.
2. **Статический vs динамический** - Если значение ключа является сложным объектом, т.е. либо объектом, либо массивом объектов, убедитесь, что оно подвержено изменениям. Объекты, которые редко имеют новые ключи, где добавление нового ключа можно предсказать и обработать с изменением схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), могут считаться **статическими**. Это включает объекты, где только подмножество ключей может быть предоставлено в некоторых JSON документах. Объекты, в которые ключи добавляются часто и/или непредсказуемо, должны считаться **динамическими**. Чтобы определить, является ли значение **статическим** или **динамическим**, смотрите соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-objects) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects) ниже.

<p></p>

**Важно:** Вышеуказанные правила должны применяться рекурсивно. Если значение ключа определяется как динамическое, дальнейшая оценка не требуется, и можно следовать рекомендациям в [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects). Если объект статический, продолжайте оценивать подключи, пока значения ключей не окажутся примитивными или не встретятся динамические ключи.

Чтобы проиллюстрировать эти правила, мы используем следующий пример JSON, представляющий человека:

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
    "catchPhrase": "Время, хранилище данных для аналитики",
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

Применение этих правил:

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены как тип `String`. Колонка `phone_numbers` является массивом примитивов типа `Array(String)`, с `dob` и `id` типа `Date` и `UInt32` соответственно.
- Новые ключи не будут добавлены в объект `address` (только новые объекты адресов), и его можно считать **статическим**. Если мы рекурсируем, все подколонки могут считаться примитивными (и типа `String`), кроме `geo`. Это также статическая структура с двумя колонками типа `Float32`, `lat` и `lon`.
- Колонка `tags` является **динамической**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект любого типа и структуры.
- Объект `company` является **статическим** и всегда будет содержать не более 3 указанных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект. Значения всегда будут парами ключ-значение типа строка.
## Обработка статических объектов {#handling-static-objects}

Мы рекомендуем обрабатывать статические объекты, используя именованные кортежи, т.е. `Tuple`. Массивы объектов могут храниться с помощью массивов кортежей, т.е. `Array(Tuple)`. Внутри самих кортежей колонки и их соответствующие типы должны быть определены по тем же правилам. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем ранее упомянутый JSON-пример человека, опуская динамические объекты:

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
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "Время, хранилище данных для аналитики"
  },
  "dob": "2007-03-31"
}
```

Схема для этой таблицы показана ниже:

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

Обратите внимание, как колонка `company` определяется как `Tuple(catchPhrase String, name String)`. Поле `address` использует `Array(Tuple)`, с вложенной `Tuple` для представления колонки `geo`.

JSON можно вставлять в эту таблицу в текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Время, хранилище данных для аналитики"},"dob":"2007-03-31"}
```

В нашем примере выше у нас минимальные данные, но, как показано ниже, мы можем запросить поля кортежа по их именам, разделённым точкой.

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

Основной недостаток кортежей заключается в том, что подколонки не могут использоваться в ключах сортировки. Следовательно, следующее завершится неудачей:

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

Code: 47. DB::Exception: Отсутствуют колонки: 'company.name' при обработке запроса: 'company.name', требуемые колонки: 'company.name' 'company.name'. (UNKNOWN_IDENTIFIER)
```

:::note Кортежи в ключах сортировки
Хотя колонки кортежей не могут использоваться в ключах сортировки, весь кортеж может быть использован. Хотя это возможно, это редко имеет смысл.
:::
### Обработка значений по умолчанию {#handling-default-values}

Даже если объекты JSON структурированы, они часто являются разреженными, и только подмножество известных ключей предоставляется. К счастью, тип `Tuple` не требует всех колонок в полезной нагрузке JSON. Если они не предоставлены, будут использоваться значения по умолчанию.

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

Мы можем видеть, что эта строка может быть успешно вставлена:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запрашивая эту единственную строку, мы можем увидеть, что значения по умолчанию используются для колонок (включая подобъекты), которые были опущены:

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
Если пользователи должны различать между пустым значением и непродоставленным, может использоваться тип [Nullable](/sql-reference/data-types/nullable). Это [должно быть избегнуто](/cloud/bestpractices/avoid-nullable-columns), если это абсолютно не нужно, так как это отрицательно сказывается на производительности хранения и запросов по этим колонкам.
:::
### Обработка новых колонок {#handling-new-columns}

Хотя структурированный подход является самым простым, когда ключи JSON статичны, этот подход все еще может быть использован, если изменения в схеме могут быть запланированы, т.е. новые ключи известны заранее, и схема может быть изменена соответственно.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые предоставляются в полезной нагрузке и отсутствуют в схеме. Рассмотрим следующую изменённую полезную нагрузку JSON с добавлением ключа `nickname`:

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
    "catchPhrase": "Время, хранилище данных для аналитики"
  },
  "dob": "2007-03-31"
}
```

Этот JSON может быть успешно вставлен с игнорированием ключа `nickname`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Время, хранилище данных для аналитики"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Колонки могут быть добавлены в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию может быть указано с помощью условия `DEFAULT`, которое будет использоваться, если оно не указано во время последующих вставок. Строки, для которых это значение отсутствует (так как они были вставлены до его создания), также будут возвращать это значение по умолчанию. Если не указано значение `DEFAULT`, будет использовано значение по умолчанию для типа.

Например:

```sql
-- вставка первоначальной строки (nickname будет проигнорирован)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Время, хранилище данных для аналитики"},"dob":"2007-03-31"}

-- добавление колонки
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- вставка новой строки (те же данные, другой id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Время, хранилище данных для аналитики"},"dob":"2007-03-31"}

-- выбор 2 строк
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```
## Обработка динамических объектов {#handling-dynamic-objects}

Существуют два рекомендуемых подхода к обработке динамических объектов:

- Тип [Map(String,V)](/sql-reference/data-types/map)
- [String](/sql-reference/data-types/string) с функциями JSON

Следующие правила могут быть применены для определения наиболее подходящего.

1. Если объекты очень динамичны, с непредсказуемой структурой и содержащими произвольные вложенные объекты, пользователям следует использовать тип `String`. Значения могут быть извлечены во время запроса с использованием функций JSON, как мы показываем ниже.
2. Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите возможность использования типа `Map`. Идеально, число уникальных ключей не должно превышать несколько сотен. Тип `Map` также можно рассматривать для объектов с под объектами, при условии, что последние имеют однородность в своих типах. В общем, мы рекомендуем использовать тип `Map` для меток и тегов, например, метки подов Kubernetes в логах.

<br />

:::note Примените подход на уровне объекта
Разные техники могут быть применены к разным объектам в одной схеме. Некоторые объекты можно лучше решить с помощью `String`, а другие - с помощью `Map`. Обратите внимание, что после использования типа `String` больше не требуется принимать решения по схеме. Напротив, можно вложить под объекты внутри ключа `Map`, как мы показываем ниже - включая `String`, представляющий JSON.
:::
### Использование String {#using-string}

Обработка данных с использованием структурированного подхода, описанного выше, часто оказывается непрактичной для пользователей с динамическим JSON, который либо подвержен изменениям, либо для которого схема плохо понятна. Для абсолютной гибкости пользователи могут просто хранить JSON как `String`, прежде чем использовать функции для извлечения полей по мере необходимости. Это представляет собой полное противопоставление обработке JSON как структурированного объекта. Эта гибкость влечет за собой значительные недостатки - прежде всего, увеличение сложности синтаксиса запросов, а также ухудшение производительности.

Как было отмечено ранее, для [оригинального объекта человека](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру колонки `tags`. Мы вставляем исходную строку (мы также включаем `company.labels`, которую мы игнорируем на данный момент), объявляя колонку `Tags` как `String`:

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
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Время, хранилище данных для аналитики","labels":{"type":"системы баз данных","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

Мы можем выбрать колонку `tags` и увидеть, что JSON был вставлен как строка:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Для извлечения значений из этого JSON могут использоваться функции [JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions). Рассмотрим простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Азорские острова, Португалия"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что функции требуют как ссылки на колонку `String` `tags`, так и пути в JSON для извлечения. Вложенные пути требуют вложения функций, например, `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, который извлекает колонку `tags.car.year`. Извлечение вложенных путей можно упростить с помощью функций [JSON_QUERY](/sql-reference/functions/json-functions#json_query) И [JSON_VALUE](/sql-reference/functions/json-functions#json_value).

Рассмотрим крайний случай с набором данных `arxiv`, где мы считаем, что все тело это `String`.

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

Предположим, мы хотим подсчитать количество статей, выпущенных по годам. Сравните запрос против [структурированной версии](/integrations/data-formats/json/inference#creating-tables) схемы с использованием только строки:

```sql
-- с использованием структурированной схемы
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

10 строк в наборе. Elapsed: 0.264 sec. Обработано 2.31 миллиона строк, 153.57 MB (8.75 миллиона строк/сек., 582.58 MB/сек.)

-- с использованием неструктурированной строки

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

10 строк в наборе. Elapsed: 1.281 sec. Обработано 2.49 миллиона строк, 4.22 GB (1.94 миллиона строк/сек., 3.29 GB/сек.)
Пиковое использование памяти: 205.98 MiB.
```

Обратите внимание на использование выражения XPath для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Строковые функции значительно медленнее (> 10x), чем явные преобразования типов с индексами. Вышеуказанные запросы всегда требуют полного сканирования таблицы и обработки каждой строки. Хотя эти запросы все еще будут быстрыми на небольшом наборе данных, таких как этот, производительность ухудшится на больших наборах данных.

Гибкость этого подхода приходит с явной ценой в производительности и сложности синтаксиса, и его следует применять только для высокодинамических объектов в схеме.
#### Простые функции JSON {#simple-json-functions}

Вышеуказанные примеры используют функции семейства JSON*. Эти функции используют полный парсер JSON на основе [simdjson](https://github.com/simdjson/simdjson), который строго относится к парсингу и будет различать одно и то же поле, вложенное на разных уровнях. Эти функции способны работать с JSON, который синтаксически корректен, но плохо отформатирован, например, с двойными пробелами между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` могут предложить потенциально лучшую производительность, прежде всего, за счет строгих предположений о структуре и формате JSON. В частности:

* Имена полей должны быть константами
* Последовательное кодирование имен полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* Имена полей уникальны во всех вложенных структурах. Не производится различение между уровнями вложенности, а совпадения неразборчивы. В случае множественных совпадающих полей будет использовано первое вхождение.
* Никакие специальные символы вне строковых литералов. Это включает пробелы. Следующее является недействительным и не будет парситься.

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    В то время как следующее будет корректно парситься:

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

В некоторых случаях, где производительность критична и ваш JSON соответствует вышеуказанным требованиям, эти функции могут быть подходящими. Пример предыдущего запроса, переписанного с использованием функций `simpleJSON*`, показан ниже:

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

10 строк в наборе. Elapsed: 0.964 sec. Обработано 2.48 миллиона строк, 4.21 GB (2.58 миллиона строк/сек., 4.36 GB/сек.)
```

Вышеуказанный запрос использует `simpleJSONExtractString`, чтобы извлечь ключ `created`, воспользовавшись тем, что нам нужно только первое значение для даты публикации. В данном случае ограничения функций `simpleJSON*` приемлемы для получения преимущества в производительности.
### Использование Map {#using-map}

Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите возможность использования типа `Map`. Идеально, число уникальных ключей не должно превышать несколько сотен. Мы рекомендуем использовать тип `Map` для меток и тегов, например, метки подов Kubernetes в логах. Хотя это простой способ представления вложенных структур, `Map` имеет некоторые заметные ограничения:

- Поля должны иметь один и тот же тип.
- Доступ к под колонкам требует специального синтаксиса для карты, поскольку поля не существуют как колонки; весь объект является колонкой.
- Доступ к подколонке загружает все значение `Map`, т.е. всех сиблингов и их соответствующие значения. Для больших карт это может привести к значительному штрафу по производительности.

:::note Ключи строк
При моделировании объектов как `Map` используется строковой ключ для хранения имени ключа JSON. Таким образом, карта всегда будет `Map(String, T)`, где `T` зависит от данных. 
:::
#### Примитивные значения {#primitive-values}

Самое простое применение `Map` — это когда объект содержит одни и те же примитивные типы в качестве значений. В большинстве случаев это требует использования типа `String` для значения `T`.

Рассмотрим наш [предыдущий JSON объекта person](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определен как динамический. Важно, что мы ожидаем, что в этот объект будут добавлены только пары ключ-значение типа String. Таким образом, мы можем объявить это как `Map(String, String)`:

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

1 row in set. Elapsed: 0.002 sec.
```

Запрос этих полей в объекте запроса требует синтаксиса карты, например:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Полный набор функций `Map` доступен для запросов, описанных [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не имеют однородного типа, существуют функции для выполнения [необходимого приведения типов](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также может рассматриваться для объектов, которые имеют под-объекты, при условии, что у последних есть согласованность в их типах.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где под-объект для каждого `tag` имеет столбцы `name` и `time`. Упрощенный пример такого JSON документа может выглядеть следующим образом:

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

Это можно смоделировать с помощью `Map(String, Tuple(name String, time DateTime))`, как показано ниже:

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

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

Применение карт в этом случае обычно редко и предполагает, что данные должны быть переработаны так, чтобы динамические имена ключей не имели под-объектов. Например, приведенное выше можно переработать следующим образом, позволяя использовать `Array(Tuple(key String, name String, time DateTime))`.

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
