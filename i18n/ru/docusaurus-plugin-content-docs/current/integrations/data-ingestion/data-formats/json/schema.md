---
title: 'Проектирование схемы JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально спроектировать схему JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'форматы', 'схема']
---

# Проектирование вашей схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) может использоваться для установления начальной схемы для данных JSON и выполнения запросов к JSON-файлам на месте, например, в S3, пользователям следует стремиться установить оптимизированную версионированную схему для своих данных. Ниже мы обсудим варианты моделирования структур JSON.
## Извлечение по возможности {#extract-where-possible}

При возможности пользователи должны извлекать ключи JSON, которые они часто запрашивают, в столбцы на корне схемы. Это не только упрощает синтаксис запросов, но и позволяет пользователям использовать эти столбцы в своем условии `ORDER BY`, если это необходимо, или указывать [вторичный индекс](/optimize/skipping-indexes).

Рассмотрим [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), рассмотренный в руководстве [**Вывод схемы JSON**](/integrations/data-formats/json/inference):

```json
{
  "id": "2101.11408",
  "submitter": "Даниэль Лемир",
  "authors": "Даниэль Лемир",
  "title": "Разбор чисел на гигабайт в секунду",
  "comments": "Программное обеспечение на https://github.com/fastfloat/fast_float и\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Программное обеспечение: Практика и опыт 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "С дисками и сетями, предоставляющими гигабайты в секунду ....\n",
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
      "Лемир",
      "Даниэль",
      ""
    ]
  ]
}
```

Предположим, мы хотим сделать первое значение `versions.created` основным ключом сортировки - желательно под именем `published_date`. Это значение должно быть извлечено либо до вставки, либо во время вставки, используя [материализованные представления](/materialized-view/incremental-materialized-view) ClickHouse или [материализованные столбцы](/sql-reference/statements/alter/column#materialize-column).

Материализованные столбцы представляют собой самый простой способ извлечения данных во время выполнения запроса и предпочтительны, если логику извлечения можно представить в виде простого SQL-выражения. Например, `published_date` можно добавить в схему arXiv как материализованный столбец и определить как ключ сортировки следующим образом:

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
:::note Выражение столбца для вложенных
Вышеуказанное требует доступа к кортежу с использованием нотации `versions[1].1`, ссылаясь на столбец `created` по позиции, а не на предпочтительный синтаксис `versions.created_at[1]`.
:::

При загрузке данных столбец будет извлечен:

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

:::note Поведение материализованного столбца
Значения материализованных столбцов всегда вычисляются во время вставки и не могут быть указаны в запросах `INSERT`. Материализованные столбцы по умолчанию не будут возвращены в `SELECT *`. Это сделано для сохранения инварианта, что результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью INSERT. Это поведение может быть отключено, установив `asterisk_include_materialized_columns=1`.
:::

Для более сложных задач фильтрации и преобразования мы рекомендуем использовать [материализованные представления](/materialized-view/incremental-materialized-view).
## Статический vs динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON заключается в том, чтобы определить подходящий тип для каждого значения ключа. Мы рекомендуем пользователям применять следующие правила рекурсивно к каждому ключу в иерархии JSON для определения подходящего типа для каждого ключа.

1. **Простые типы** - Если значение ключа является простым типом, независимо от того, является ли оно частью вложенного объекта или находится на корне, убедитесь, что вы выбираете его тип в соответствии с общими [лучшими практиками проектирования схем](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` ниже, могут быть смоделированы как `Array(<type>)`, например, `Array(String)`.
2. **Статический vs динамический** - Если значение ключа является сложным объектом, т.е. либо объектом, либо массивом объектов, установите, подвержено ли оно изменениям. Объекты, которые редко имеют новые ключи, где добавление нового ключа может быть предсказано и обработано изменением схемы с помощью [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), могут считаться **статическими**. Это включает объекты, в которых только подмножество ключей может быть предоставлено в некоторых документах JSON. Объекты, в которых часто добавляются новые ключи и/или это невозможно предсказать, следует считать **динамическими**. Чтобы установить, является ли значение **статическим** или **динамическим**, см. соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-objects) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects) ниже.

<p></p>

**Важно:** Вышеуказанные правила следует применять рекурсивно. Если значение ключа определено как динамическое, дальнейшая оценка не требуется, и можно следовать рекомендациям в [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-dynamic-objects). Если объект является статическим, продолжайте оценивать под-ключи до тех пор, пока значения ключей не станут примитивными или не будут встречены динамические ключи.

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

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены как тип `String`. Столбец `phone_numbers` является массивом примитивов типа `Array(String)`, а `dob` и `id` имеют тип `Date` и `UInt32` соответственно.
- Новые ключи не будут добавлены в объект `address` (только новые объекты адреса), и его можно считать **статическим**. Если мы углубимся, все под-колонки можно считать примитивами (типа `String`), кроме `geo`. Это также статическая структура с двумя столбцами `Float32`, `lat` и `lon`.
- Столбец `tags` является **динамическим**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект любого типа и структуры.
- Объект `company` является **статическим** и всегда будет содержать не более 3 указанных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект. Значения всегда будут парами ключ-значение типа string.
## Обработка статических объектов {#handling-static-objects}

Мы рекомендуем обрабатывать статические объекты с помощью именованных кортежей, т.е. `Tuple`. Массивы объектов могут быть представлены с помощью массивов кортежей, т.е. `Array(Tuple)`. Внутри самих кортежей столбцы и их соответствующие типы должны быть определены с использованием тех же правил. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем предыдущий JSON-пример человека, опуская динамические объекты:

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

Обратите внимание, как столбец `company` определяется как `Tuple(catchPhrase String, name String)`. Поле `address` использует `Array(Tuple)` с вложенным `Tuple` для представления столбца `geo`.

JSON может быть вставлен в эту таблицу в его текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}
```

В нашем примере выше у нас минимальные данные, но, как показано ниже, мы можем запрашивать поля кортежей по их именам, разделенным точкой.

```sql
SELECT
    address.street,
    company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, что столбец `address.street` возвращается как массив. Чтобы запросить конкретный объект внутри массива по позиции, необходимо указать индекс массива после имени столбца. Например, чтобы получить улицу из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Основной недостаток кортежей заключается в том, что подколонки не могут использоваться в ключах сортировки. Следующее, таким образом, не удастся:

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
Хотя столбцы кортежей не могут использоваться в ключах сортировки, целый кортеж может быть использован. Хотя это возможно, это редко имеет смысл.
:::
### Обработка значений по умолчанию {#handling-default-values}

Даже если объекты JSON структурированы, они часто бывают разреженными и содержат только подмножество известных ключей. К счастью, тип `Tuple` не требует, чтобы все столбцы были в полезной нагрузке JSON. Если они не предоставлены, будут использоваться значения по умолчанию.

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

Запрашивая эту единственную строку, мы можем увидеть, что значения по умолчанию были использованы для столбцов (включая под-объекты), которые были опущены:

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
Если пользователям необходимо различать между пустым значением и не предоставленным, можно использовать [Nullable](/sql-reference/data-types/nullable) тип. Это [должно быть избегнуто](/cloud/bestpractices/avoid-nullable-columns), если это абсолютно не требуется, так как это негативно повлияет на производительность хранения и запросов по этим столбцам.
:::
### Обработка новых столбцов {#handling-new-columns}

Хотя структурированный подход является наиболее простым, когда ключи JSON статичны, этот подход можно также использовать, если изменения схемы можно планировать, т.е. новые ключи известны заранее, и схема может быть соответственно изменена.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые предоставлены в полезной нагрузке и отсутствуют в схеме. Рассмотрим следующий измененный JSON с добавлением ключа `nickname`:

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

Столбцы могут быть добавлены в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию может быть указано через оператор `DEFAULT`, который будет использоваться, если оно не указано во время последующих вставок. Ряды, для которых это значение отсутствует (так как они были вставлены до его создания), также будут возвращать это значение по умолчанию. Если значение по умолчанию не указано, будет использоваться значение по умолчанию для типа.

Например:

```sql
-- вставка начальной строки (nickname будет проигнорирован)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

-- добавление столбца
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- вставка новой строки (те же данные, другой id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

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

1. Если объекты являются сильно динамическими, с непредсказуемой структурой и содержат произвольные вложенные объекты, пользователи должны использовать тип `String`. Значения могут быть извлечены во время выполнения запроса с использованием функций JSON, как мы показываем ниже.
2. Если объект используется для хранения произвольных ключей, в основном одного типа, стоит рассмотреть использование типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также можно рассматривать для объектов с под-объектами, при условии, что последние имеют единство в своих типах. В общем, мы рекомендуем использовать тип `Map` для меток и тегов, например, меток пода Kubernetes в данных логов.

<br />

:::note Примените подход на уровне объекта
Разные методы могут применяться к разным объектам в одной и той же схеме. Некоторые объекты могут быть лучше решены с помощью `String`, а другие `Map`. Обратите внимание, что после того, как используется тип `String`, больше не нужно принимать никаких дальнейших решений по схеме. Напротив, возможно вложение под-объектов внутри ключа `Map`, как мы показываем ниже - включая `String`, представляющую JSON.
:::
### Использование String {#using-string}

Обработка данных с помощью структурированного подхода, описанного выше, часто недоступна для пользователей с динамическим JSON, который подвержен изменениям или для которого схема недостаточно хорошо понята. Для абсолютной гибкости пользователи могут просто хранить JSON как `String`, а затем использовать функции для извлечения полей по мере необходимости. Это представляет собой крайний противоположный случай обработки JSON как структурированного объекта. Эта гибкость несет в себе затраты с существенными недостатками - в первую очередь увеличение сложности синтаксиса запроса, а также ухудшение производительности.

Как упоминалось ранее, для [оригинального объекта человека](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру столбца `tags`. Мы вставляем оригинальную строку (мы также включаем `company.labels`, который игнорируем на данный момент), объявляя столбец `Tags` как `String`:

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

Мы можем выбрать столбец `tags` и увидеть, что JSON был вставлен как строка:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Функции [JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions) могут использоваться для извлечения значений из этого JSON. Рассмотрим простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Азорские острова, Португалия"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, как функции требуют как ссылки на столбец `String` `tags`, так и пути в JSON для извлечения. Вложенные пути требуют вложения функций, т.е. `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, который извлекает столбец `tags.car.year`. Извлечение вложенных путей можно упростить с помощью функций [JSON_QUERY](/sql-reference/functions/json-functions#json_query) И [JSON_VALUE](/sql-reference/functions/json-functions#json_value).

Рассмотрим крайний случай с набором данных `arxiv`, где мы считаем, что все тело является `String`.

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

Предположим, мы хотим посчитать количество опубликованных статей по годам. Сравним запрос против [структурированной версии](/integrations/data-formats/json/inference#creating-tables) схемы и использования только строки:

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

Обратите внимание на использование выражения XPath здесь для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Функции String значительно медленнее (> 10x), чем явные преобразования типов с использованием индексов. Вышеуказанные запросы всегда требуют полного сканирования таблицы и обработки каждой строки. Хотя эти запросы все еще будут быстрыми на небольших наборах данных, таких как этот, производительность будет ухудшаться на более крупных наборах данных.

Гибкость этого подхода имеет явные затраты на производительность и синтаксис, и его следует использовать только для сильно динамических объектов в схеме.
#### Простые функции JSON {#simple-json-functions}

В вышеуказанных примерах используются функции JSON*. Эти функции используют полный парсер JSON, основанный на [simdjson](https://github.com/simdjson/simdjson), который строг в своем анализе и будет различать одно и то же поле, вложенное на разных уровнях. Эти функции могут обрабатывать JSON, который синтаксически правильный, но не очень хорошо отформатированный, например, двойные пробелы между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` предлагают потенциально превосходную производительность, в первую очередь за счет строгих предположений относительно структуры и формата JSON. В частности:

* Имена полей должны быть константами
* Последовательное кодирование имен полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* Имена полей уникальны для всех вложенных структур. Нет различий между уровнями вложения, и соответствие произвольное. В случае нескольких соответствующих полей будет использовано первое вхождение.
* Нет специальных символов вне строковых литералов. Это включает пробелы. Следующее является недопустимым и не будет разобрано.

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    В то время как следующее будет разобрано корректно:

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

В некоторых случаях, когда производительность критична и ваш JSON соответствует указанным выше требованиям, эти функции могут быть подходящими. Пример ранее написанного запроса, переписанного на использование функций `simpleJSON*`, показан ниже:

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
Peak memory usage: 211.49 MiB.
```

Вышеуказанный запрос использует `simpleJSONExtractString`, чтобы извлечь ключ `created`, используя тот факт, что мы хотим только первое значение для даты публикации. В этом случае ограничения функций `simpleJSON*` приемлемы для увеличения производительности.
### Использование Map {#using-map}

Если объект используется для хранения произвольных ключей в основном одного типа, имеет смысл использовать тип `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Мы рекомендуем использовать тип `Map` для меток и тегов, например, меток пода Kubernetes в данных логов. Хотя это простой способ представления вложенных структур, у `Map` есть некоторые заметные ограничения:

- Поля должны быть одного и того же типа.
- Доступ к подколонкам требует специального синтаксиса для карты, так как поля не существуют как столбцы; весь объект является столбцом.
- Доступ к подколонке загружает все значение `Map`, то есть всех "соседей" и их соответствующие значения. Для больших карт это может привести к значительному падению производительности.

:::note Строковые ключи
При моделировании объектов как `Map` используется ключ `String` для хранения имени ключа JSON. Таким образом, карта всегда будет `Map(String, T)`, где `T` зависит от данных.
:::
#### Примитивные значения {#primitive-values}

Самое простое применение `Map` — это когда объект содержит значения одного и того же примитивного типа. В большинстве случаев это включает использование типа `String` для значения `T`.

Рассмотрим наш [предыдущий JSON для человека](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определён как динамический. Важно, что мы ожидаем, что в этот объект будут добавляться только пары ключ-значение типа String. Мы можем объявить это как `Map(String, String)`:

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

Мы можем вставить наш первоначальный полный JSON-объект:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запрос этих полей в объекте требует синтаксиса карты, например:

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

Полный набор функций `Map` доступен для запросов в это время, описанных [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не имеют единого типа, существуют функции для выполнения [необходимого преобразования типов](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также может применяться для объектов, которые имеют под-объекты, при условии, что у последних есть согласованность в своих типах.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где под-объект для каждого `tag` имеет столбцы `name` и `time`. Упрощённый пример такого JSON-документа может выглядеть следующим образом:

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

Применение карт в этом случае обычно редко и указывает на то, что данные должны быть переработаны таким образом, чтобы динамические имена ключей не имели под-объектов. Например, вышеуказанное можно переработать следующим образом, позволяя использовать `Array(Tuple(key String, name String, time DateTime))`.

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
