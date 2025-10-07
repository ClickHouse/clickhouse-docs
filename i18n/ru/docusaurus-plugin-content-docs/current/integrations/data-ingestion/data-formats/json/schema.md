---
'title': 'Проектирование схемы JSON'
'slug': '/integrations/data-formats/json/schema'
'description': 'Как оптимально проектировать схемы JSON'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'formats'
- 'schema'
- 'structured'
- 'semi-structured'
'score': 20
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# Проектирование вашей схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) может быть использован для установления начальной схемы для данных JSON и запроса файлов данных JSON на месте, например, в S3, пользователям следует стремиться установить оптимизированную версионированную схему для своих данных. Мы обсуждаем рекомендованный подход к моделированию структур JSON ниже.

## Статический vs динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON заключается в том, чтобы определить соответствующий тип для значения каждого ключа. Мы рекомендуем пользователям рекурсивно применять следующие правила к каждому ключу в иерархии JSON для определения соответствующего типа для каждого ключа.

1. **Простые типы** - Если значение ключа является простым типом, независимо от того, является ли оно частью под-объекта или находится на корне, убедитесь, что вы выбираете его тип в соответствии с общими [лучшие практиками проектирования схем](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы простых типов, такие как `phone_numbers` ниже, могут быть смоделированы как `Array(<type>)`, например, `Array(String)`.
2. **Статический vs динамический** - Если значение ключа является сложным объектом, т.е. либо объектом, либо массивом объектов, установите, подлежит ли оно изменениям. Объекты, в которых редко добавляются новые ключи, и где добавление нового ключа можно предсказать и обработать с помощью изменения схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), можно считать **статическими**. Это включает объекты, в которых только подмножество ключей может быть предоставлено в некоторых документах JSON. Объекты, в которые новые ключи добавляются часто и/или не предсказуемы, следует считать **динамическими**. **Исключение здесь составляют структуры с сотнями или тысячами под-ключей, которые могут считаться динамическими для удобства**.

Чтобы определить, является ли значение **статическим** или **динамическим**, смотрите соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p></p>

**Важно:** Указанные выше правила должны применяться рекурсивно. Если значение ключа определено как динамическое, дальнейшая оценка не требуется, и можно следовать рекомендациям в [**Обработке динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект статический, продолжайте оценивать под-ключи, пока значения ключей не станут простыми или не будут встречены динамические ключи.

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
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

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены как тип `String`. Столбец `phone_numbers` является массивом примитивов типа `Array(String)`, а `dob` и `id` имеют типы `Date` и `UInt32` соответственно.
- Новые ключи не будут добавлены в объект `address` (только новые объекты адресов), поэтому его можно считать **статическим**. Если мы продолжим, все под-колонки можно считать примитивами (и типа `String`), за исключением `geo`. Это также статическая структура с двумя столбцами `Float32`, `lat` и `lon`.
- Столбец `tags` является **динамическим**. Мы предполагаем, что в этот объект могут быть добавлены новые произвольные теги любого типа и структуры.
- Объект `company` является **статическим** и будет всегда содержать не более 3 указанных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что в этот объект могут быть добавлены новые произвольные теги. Значения всегда будут парой ключ-значение типа строка.

:::note
Структуры с сотнями или тысячами статических ключей могут считаться динамическими, так как редко бывает реалистичным статически объявлять колонки для них. Однако, где это возможно, [пропускайте пути](#using-type-hints-and-skipping-paths), которые не нужны, чтобы сэкономить как хранилище, так и накладные расходы на вывод схемы.
:::

## Обработка статических структур {#handling-static-structures}

Мы рекомендуем обрабатывать статические структуры с помощью именованных кортежей, т.е. `Tuple`. Массивы объектов могут храниться с использованием массивов кортежей, т.е. `Array(Tuple)`. Внутри самих кортежей колонки и их соответствующие типы должны определяться с использованием тех же правил. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем ранее приведенный JSON пример человека, опуская динамические объекты:

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
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

Обратите внимание, как столбец `company` определён как `Tuple(catchPhrase String, name String)`. Ключ `address` использует `Array(Tuple)`, с вложенным `Tuple` для представления столбца `geo`.

JSON может быть вставлен в эту таблицу в текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

В нашем примере выше у нас минимальные данные, но, как показано ниже, мы можем запросить столбцы кортежей по их именам, разделенным точками.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, как столбец `address.street` возвращается как `Array`. Чтобы запросить конкретный объект в массиве по позиции, смещение массива должно быть указано после имени столбца. Например, чтобы получить улицу из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подколонки также могут быть использованы в ключах сортировки из [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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
```

### Обработка значений по умолчанию {#handling-default-values}

Даже если объекты JSON структурированы, они часто являются разреженными, с предоставленным только подмножеством известных ключей. К счастью, тип `Tuple` не требует всех колонок в полезной нагрузке JSON. Если они не предоставлены, будут использоваться значения по умолчанию.

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

Мы можем увидеть, что эта строка может быть успешно вставлена:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запрашивая эту единственную строку, мы видим, что для колонок (включая под-объекты), которые были опущены, используются значения по умолчанию:

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
Если пользователям нужно различать между значением, которое является пустым, и не предоставленным, можно использовать [Nullable](/sql-reference/data-types/nullable) тип. Это [должно быть избегнуто](/best-practices/select-data-types#avoid-nullable-columns), если это абсолютно не требуется, так как это негативно скажется на производительности хранилища и запроса для этих колонок.
:::

### Обработка новых колонок {#handling-new-columns}

Хотя структурированный подход является простейшим, когда ключи JSON статичны, этот подход все еще может быть использован, если изменения в схеме могут быть запланированы, т.е. новые ключи известны заранее и схема может быть изменена соответственно.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые предоставлены в полезной нагрузке и отсутствуют в схеме. Рассмотрим следующую измененную полезную нагрузку JSON с добавлением ключа `nickname`:

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

Этот JSON может быть успешно вставлен с игнорированным ключом `nickname`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Столбцы могут быть добавлены к схеме с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию может быть указано через `DEFAULT` клаузу, которое будет использовано, если оно не указано во время последующих вставок. Строки, для которых это значение отсутствует (так как они были вставлены до его создания), также вернут это значение по умолчанию. Если значение `DEFAULT` не указано, будет использоваться значение по умолчанию для типа.

Например:

```sql
-- insert initial row (nickname will be ignored)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- add column
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- insert new row (same data different id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- select 2 rows
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

## Обработка полуструктурированных/динамических структур {#handling-semi-structured-dynamic-structures}

Если данные JSON полуструктурированы и ключи могут быть динамически добавлены и/или имеют несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Более конкретно, используйте тип JSON, когда ваши данные:

- Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
- Содержат **значения с различными типами** (например, путь может иногда содержать строку, а иногда число).
- Требуют гибкости схемы, где строгая типизация нецелесообразна.
- У вас есть **сотни или даже тысячи** путей, которые статичны, но просто нецелесообразно их явно объявлять. Это встречается редко.

Рассмотрим наш [предыдущий пример JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определен как динамический.

Предположим, что `company.labels` содержит произвольные ключи. Кроме того, тип для любого ключа в этой структуре может не совпадать между строками. Например:

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021",
      "employees": 250
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

```json
{
  "id": 2,
  "name": "Analytica Rowe",
  "username": "Analytica",
  "address": [
    {
      "street": "Maple Avenue",
      "suite": "Apt. 402",
      "city": "Dataford",
      "zipcode": "11223-4567",
      "geo": {
        "lat": 40.7128,
        "lng": -74.006
      }
    }
  ],
  "phone_numbers": [
    "123-456-7890",
    "555-867-5309"
  ],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": [
        "real-time processing"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "Running simulations",
    "holidays": [
      {
        "year": 2023,
        "location": "Kyoto, Japan"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

Учитывая динамическую природу столбца `company.labels` между объектами, с точки зрения ключей и типов, у нас есть несколько вариантов моделирования этих данных:

- **Единый столбец JSON** - представляет всю схему как единственный столбец `JSON`, позволяя всем структурам быть динамическими под этим.
- **Целевой столбец JSON** - используйте тип `JSON` только для столбца `company.labels`, сохраняя структурированную схему, использованную выше, для всех остальных столбцов.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), подход с единым столбцом JSON полезен для прототипирования и задач по обработке данных.

Для производственных развертываний ClickHouse в крупном масштабе мы рекомендуем быть конкретными в структуре и использовать тип JSON для целевых динамических подсруктур, где это возможно.

Строгое определение схемы имеет ряд преимуществ:

- **Проверка данных** – соблюдение строгой схемы избегает риска взрыва колонок, за пределами специфических структур.
- **Избегает риска взрыва колонок** - Несмотря на то, что тип JSON может масштабироваться до потенциально тысяч колонок, когда подколонки хранятся как отдельные колонки, это может привести к взрыву файлов колонок, где создается чрезмерное количество файлов колонок, что влияет на производительность. Чтобы смягчить это, основной [Динамический тип](/sql-reference/data-types/dynamic), используемый в JSON, предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранящихся как отдельные файлы колонок. После достижения порога дополнительные пути хранятся в общем файловом формате с компактным кодированием, сохраняя производительность и эффективность хранения, поддерживая при этом гибкий прием данных. Однако доступ к этому общему файловому столбцу не так эффективен. Обратите внимание, однако, что столбец JSON может использоваться с [подсказками типов](#using-type-hints-and-skipping-paths). "Подсказанные" колонки обеспечат ту же производительность, что и выделенные колонки.
- **Упрощенная интроспекция путей и типов** - Хотя тип JSON поддерживает функции [интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для изучения, например, с помощью `DESCRIBE`.

### Единый столбец JSON {#single-json-column}

Этот подход полезен для прототипирования и задач по обработке данных. Для производственных развертываний старайтесь использовать `JSON` только для динамических подсруктур, где это необходимо.

:::note Соображения производительности
Единый столбец JSON можно оптимизировать, пропуская (не храня) пути JSON, которые не требуются, и с помощью [подсказок типов](#using-type-hints-and-skipping-paths). Подсказки типов позволяют пользователю явно определить тип для подколонки, тем самым пропуская вывод схемы и обработку косвенных ссылок во время выполнения запроса. Это можно использовать для достижения той же производительности, как если бы использовалась явная схема. См. ["Использование подсказок типов и пропуск путей"](#using-type-hints-and-skipping-paths) для получения дополнительных сведений.
:::

Схема для единого столбца JSON здесь проста:

```sql
SET enable_json_type = 1;

CREATE TABLE people
(
    `json` JSON(username String)
)
ENGINE = MergeTree
ORDER BY json.username;
```

:::note
Мы предоставляем [подсказку типа](#using-type-hints-and-skipping-paths) для столбца `username` в определении JSON, так как мы используем его в ключе сортировки/первичном ключе. Это помогает ClickHouse знать, что этот столбец не будет null, и гарантирует, что он знает, какой подколонку `username` использовать (может быть несколько для каждого типа, так что в противном случае это не однозначно).
:::

Вставка строк в таблицу выше может быть выполнена с использованием формата `JSONAsObject`:

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.004 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.
```

Мы можем определить выведенные подколонки и их типы, используя [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions). Например:

```sql
SELECT JSONDynamicPathsWithTypes(json) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.employees": "Int64",
        "company.labels.founded": "String",
        "company.labels.type": "String",
        "company.name": "String",
        "dob": "Date",
        "email": "String",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}
{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.dissolved": "Int64",
        "company.labels.employees": "Int64",
        "company.labels.founded": "Int64",
        "company.labels.type": "Array(Nullable(String))",
        "company.name": "String",
        "dob": "Date",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}

2 rows in set. Elapsed: 0.009 sec.
```

Для получения полного списка функций интроспекции смотрите ["Функции интроспекции"](/sql-reference/data-types/newjson#introspection-functions)

[Под-пути могут быть доступны](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) с помощью нотации `.` например.

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

Обратите внимание, как колонки, отсутствующие в строках, возвращаются как `NULL`.

Дополнительно, создается отдельная подколонка для путей с одинаковым типом. Например, подколонка существует для `company.labels.type` как `String`, так и `Array(Nullable(String))`. Хотя обе будут возвращаться, где это возможно, мы можем нацелиться на конкретные подколонки, используя синтаксис `.:`:

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

2 rows in set. Elapsed: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

Для того чтобы вернуть вложенные под-объекты, необходим символ `^`. Это дизайнерский выбор, чтобы избежать чтения высокого количества колонок - если это не запрошено явно. Объекты, доступные без `^`, вернут `NULL`, как показано ниже:

```sql
-- sub objects will not be returned by default
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- return sub objects using ^ notation
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### Целевой столбец JSON {#targeted-json-column}

Хотя полезен в прототипировании и задачах по обработке данных, мы рекомендуем использовать явную схему в производстве, где это возможно.

Наш предыдущий пример может быть смоделирован с единым столбцом `JSON` для столбца `company.labels`.

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
    `company` Tuple(catchPhrase String, name String, labels JSON),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

Мы можем вставить данные в эту таблицу, используя формат `JSONEachRow`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
id:            2
name:          Analytica Rowe
username:      Analytica
email:
address:       [('Dataford',(40.7128,-74.006),'Maple Avenue','Apt. 402','11223-4567')]
phone_numbers: ['123-456-7890','555-867-5309']
website:       fastdata.io
company:       ('Streamlined analytics at scale','FastData Inc.','{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]}')
dob:           1992-07-15
tags:          {"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}

Row 2:
──────
id:            1
name:          Clicky McCliickHouse
username:      Clicky
email:         clicky@clickhouse.com
address:       [('Wisokyburgh',(-43.9509,-34.4618),'Victor Plains','Suite 879','90566-7771')]
phone_numbers: ['010-692-6593','020-192-3333']
website:       clickhouse.com
company:       ('The real-time data warehouse for analytics','ClickHouse','{"employees":"250","founded":"2021","type":"database systems"}')
dob:           2007-03-31
tags:          {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}

2 rows in set. Elapsed: 0.005 sec.
```

[Функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) могут быть использованы для определения выведенных путей и типов для столбца `company.labels`.

```sql
SELECT JSONDynamicPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "Int64",
        "employees": "Int64",
        "founded": "Int64",
        "type": "Array(Nullable(String))"
 }
}
{
    "paths": {
        "employees": "Int64",
        "founded": "String",
        "type": "String"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```

### Использование подсказок типов и пропуск путей {#using-type-hints-and-skipping-paths}

Подсказки типов позволяют нам указывать тип для пути и его подколонки, предотвращая ненужный вывод типов. Рассмотрим следующий пример, в котором мы указываем типы для JSON ключей `dissolved`, `employees` и `founded` внутри JSON столбца `company.labels`

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(
        city String,
        geo Tuple(
            lat Float32,
            lng Float32),
        street String,
        suite String,
        zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(
        catchPhrase String,
        name String,
        labels JSON(dissolved UInt16, employees UInt16, founded UInt16)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

Обратите внимание, как эти колонки теперь имеют наши явные типы:

```sql
SELECT JSONAllPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "String"
 }
}
{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "Array(Nullable(String))"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```

Кроме того, мы можем пропускать пути внутри JSON, которые мы не хотим сохранять, с помощью параметров [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать хранилище и избежать ненужного вывода по не нужным путям. Например, предположим, что мы используем единый столбец JSON для вышеупомянутых данных. Мы можем пропустить пути `address` и `company`:

```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

Обратите внимание, как наши колонки были исключены из наших данных:

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "json": {
        "dob" : "1992-07-15",
        "id" : "2",
        "name" : "Analytica Rowe",
        "phone_numbers" : [
            "123-456-7890",
            "555-867-5309"
        ],
        "tags" : {
            "car" : {
                "model" : "Audi e-tron",
                "year" : "2022"
            },
            "hobby" : "Running simulations",
            "holidays" : [
                {
                    "location" : "Kyoto, Japan",
                    "year" : "2023"
                }
            ]
        },
        "username" : "Analytica",
        "website" : "fastdata.io"
    }
}
{
    "json": {
        "dob" : "2007-03-31",
        "email" : "clicky@clickhouse.com",
        "id" : "1",
        "name" : "Clicky McCliickHouse",
        "phone_numbers" : [
            "010-692-6593",
            "020-192-3333"
        ],
        "tags" : {
            "car" : {
                "model" : "Tesla",
                "year" : "2023"
            },
            "hobby" : "Databases",
            "holidays" : [
                {
                    "location" : "Azores, Portugal",
                    "year" : "2024"
                }
            ]
        },
        "username" : "Clicky",
        "website" : "clickhouse.com"
    }
}

2 rows in set. Elapsed: 0.004 sec.
```

#### Оптимизация производительности с помощью подсказок типов {#optimizing-performance-with-type-hints}  

Подсказки типов предлагают больше, чем просто способ избежать ненужного вывода типов - они полностью устраняют хранение и обработку косвенных ссылок, а также позволяют задавать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). Пути JSON с подсказками типов всегда хранятся так же, как традиционные колонки, обходя необходимость в [**колонках-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении во время выполнения запроса.

Это означает, что с хорошо определенными подсказками типов вложенные ключи JSON достигают той же производительности и эффективности, как если бы они изначально моделировались как колонки верхнего уровня.

В результате для наборов данных, которые в основном являются согласованными, но все же выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность, не требуя изменения схемы или конвейера получения данных.

### Настройка динамических путей {#configuring-dynamic-paths}

ClickHouse хранит каждый путь JSON как подколонку в настоящем столбцовом формате, позволяя использовать те же преимущества производительности, которые наблюдаются с традиционными колонками — такие как сжатие, обработка с помощью SIMD и минимальный ввод-вывод диска. Каждая уникальная комбинация пути и типа в ваших данных JSON может стать своим собственным файлом колонки на диске.

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

Например, когда два пути JSON вставляются с разными типами, ClickHouse хранит значения каждого [конкретного типа в отдельных подколонках](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). Эти подколонки могут быть доступны независимо, минимизируя ненужный ввод-вывод. Обратите внимание, что при запросе колонки с несколькими типами ее значения все равно возвращаются как единый столбцовый ответ.

Кроме того, используя смещения, ClickHouse обеспечивает плотность этих подколонок, не храня значения по умолчанию для отсутствующих путей JSON. Этот подход максимизирует сжатие и дополнительно уменьшает ввод-вывод.

<Image img={json_offsets} size="md" alt="JSON offsets" />

Однако в сценариях с высокой кардинальностью или сильно изменчивыми структурами JSON — такими как телеметрические конвейеры, журналы или хранилища признаков машинного обучения - такое поведение может привести к взрыву файлов колонок. Каждый новый уникальный путь JSON приводит к созданию нового файла колонки, и каждый типовый вариант под этим путем приводит к созданию дополнительного файла колонки. Хотя это оптимально для производительности чтения, это создает операционные проблемы: исчерпание дескрипторов файлов, повышенное использование памяти и замедление слияний из-за большого числа небольших файлов.

Чтобы смягчить это, ClickHouse вводит концепцию подколонки переполнения: как только количество различных путей JSON превышает порог, дополнительные пути хранятся в одном общем файле в компактном закодированном формате. Этот файл все еще может быть запрошен, но не получает таких же характеристик производительности, как выделенные подколонки.

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

Этот порог контролируется параметром [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) в объявлении типа JSON.

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**Избегайте установки этого параметра слишком высоким** - большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве правила thumb, держите его ниже 10,000. Для рабочей нагрузки с сильно динамическими структурами используйте подсказки типов и параметры `SKIP`, чтобы ограничить хранящиеся данные.

Для пользователей, интересующихся реализацией этого нового типа колонки, мы рекомендуем прочитать нашу подробную статью в блоге ["Новый мощный тип данных JSON для ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
