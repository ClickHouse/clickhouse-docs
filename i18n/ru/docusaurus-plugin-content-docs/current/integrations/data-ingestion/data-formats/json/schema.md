---
title: 'Проектирование схемы JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально спроектировать схемы JSON'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# Проектирование схемы {#designing-your-schema}

Хотя [вывод схемы](/integrations/data-formats/json/inference) можно использовать для первоначального определения схемы для данных в формате JSON и для выполнения запросов непосредственно к JSON‑файлам, расположенным, например, в S3, вам следует стремиться разработать оптимизированную, версионируемую схему для ваших данных. Ниже рассматривается рекомендуемый подход к моделированию структур JSON.

## Статический и динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON — подобрать подходящий тип для значения каждого ключа. Рекомендуется рекурсивно применять следующие правила к каждому ключу в иерархии JSON, чтобы определить соответствующий тип для каждого ключа.

1. **Примитивные типы** — если значение ключа является примитивным типом, независимо от того, является ли оно частью вложенного объекта или находится в корне, убедитесь, что вы выбираете его тип в соответствии с общими [передовыми практиками проектирования схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` в примере ниже, могут быть смоделированы как `Array(<type>)`, например `Array(String)`.
2. **Статический и динамический** — если значение ключа является сложным объектом, то есть либо объектом, либо массивом объектов, определите, подвержено ли оно изменениям. Объекты, в которых новые ключи появляются редко, и добавление нового ключа может быть предсказано и обработано изменением схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), можно считать **статическими**. Это включает объекты, в которых только подмножество ключей может присутствовать в некоторых JSON‑документах. Объекты, в которые новые ключи добавляются часто и/или непредсказуемо, следует считать **динамическими**. **Исключение — структуры с сотнями или тысячами вложенных ключей, которые для удобства можно считать динамическими**.

Чтобы определить, является ли значение **статическим** или **динамическим**, см. соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p />

**Важно:** Приведённые выше правила следует применять рекурсивно. Если значение ключа признано динамическим, дальнейшая оценка не требуется, и можно следовать рекомендациям в разделе [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект статический, продолжайте оценивать вложенные ключи до тех пор, пока значения ключей не окажутся примитивными или не будут обнаружены динамические ключи.

Для иллюстрации этих правил мы используем следующий пример JSON, представляющий человека:

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

* Корневые ключи `name`, `username`, `email`, `website` могут быть представлены типом `String`. Столбец `phone_numbers` — это массив примитивов типа `Array(String)`, при этом `dob` и `id` имеют типы `Date` и `UInt32` соответственно.
* Новые ключи не будут добавляться в объект `address` (только новые объекты `address`), поэтому его можно считать **статическим**. Если рекурсивно пройти структуру, все подстолбцы можно считать примитивами (типа `String`), кроме `geo`. Это также статическая структура с двумя столбцами типа `Float32`, `lat` и `lon`.
* Столбец `tags` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги любого типа и структуры.
* Объект `company` является **статическим** и будет содержать не более 3 указанных ключей. Вложенные ключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги. Значения всегда будут парами ключ‑значение типа `String`.


:::note
Структуры с сотнями или тысячами статических ключей можно считать динамическими, так как редко бывает реалистично статически объявлять для них столбцы. Однако по возможности [пропускайте пути](#using-type-hints-and-skipping-paths), которые не нужны, чтобы сократить накладные расходы как на хранение, так и на вывод типов.
:::

## Обработка статических структур {#handling-static-structures}

Мы рекомендуем обрабатывать статические структуры с помощью именованных кортежей, то есть `Tuple`. Массивы объектов могут храниться с использованием массивов кортежей, то есть `Array(Tuple)`. В самих кортежах столбцы и их соответствующие типы должны определяться по тем же правилам. Это может приводить к вложенным кортежам `Tuple` для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем приведённый ранее JSON-пример с объектом `person`, опуская динамические объекты:

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

Схема этой таблицы показана ниже:

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

Обратите внимание, что столбец `company` задан как `Tuple(catchPhrase String, name String)`. Ключ `address` использует `Array(Tuple)` с вложенным `Tuple` для представления столбца `geo`.

JSON можно вставлять в эту таблицу в её текущем виде:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

В приведённом выше примере у нас очень мало данных, но, как показано ниже, мы можем выполнять запросы к столбцам типа tuple, обращаясь к ним по именам в точечной нотации.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, что столбец `address.street` возвращается как `Array`. Чтобы обратиться к конкретному объекту внутри массива по позиции, смещение массива указывается после имени столбца. Например, чтобы получить значение улицы из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подстолбцы также могут использоваться в ключах сортировки, начиная с версии [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

Даже если объекты JSON структурированы, они часто получаются разрежёнными и содержат только подмножество известных ключей. К счастью, тип `Tuple` не требует наличия всех столбцов в JSON-данных. Если какие-то ключи не указаны, будут использованы значения по умолчанию.

Рассмотрим нашу ранее созданную таблицу `people` и следующий разрежённый JSON, в котором отсутствуют ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

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

Как видно ниже, эта строка может быть успешно вставлена:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Из этого запроса к этой единственной строке видно, что для столбцов (включая вложенные объекты), которые были опущены, используются значения по умолчанию:

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

:::note Различение пустого значения и NULL
Если вам нужно различать ситуацию, когда значение пустое и когда оно не задано, можно использовать тип [Nullable](/sql-reference/data-types/nullable). Однако [следует избегать](/best-practices/select-data-types#avoid-nullable-columns) его использования без крайней необходимости, так как это отрицательно влияет на хранение данных и производительность запросов по этим столбцам.
:::


### Обработка новых столбцов {#handling-new-columns}

Хотя структурированный подход — самый простой, когда JSON-ключи статичны, его по‑прежнему можно использовать, если изменения в схеме можно запланировать, то есть новые ключи известны заранее и схему можно соответствующим образом изменить.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать JSON-ключи, которые присутствуют в пейлоаде, но отсутствуют в схеме. Рассмотрим следующий модифицированный JSON-пейлоад с добавлением ключа `nickname`:

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

Этот JSON можно успешно вставить, при этом ключ `nickname` будет игнорироваться:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Столбцы могут быть добавлены в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию можно указать с помощью выражения `DEFAULT`; оно будет использовано, если не задано при последующих вставках. Для строк, для которых это значение отсутствует (так как они были вставлены до его создания), также будет возвращаться это значение по умолчанию. Если значение `DEFAULT` не указано, будет использоваться значение по умолчанию для данного типа.

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

Если JSON-данные полуструктурированы, а ключи могут динамически добавляться и/или иметь несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Конкретно, используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут меняться со временем.
* Содержат **значения разных типов** (например, путь может иногда содержать строку, а иногда число).
* Требуют гибкой схемы, при которой строгая типизация нецелесообразна.
* Содержат **сотни или даже тысячи** путей, которые статичны, но их нереалистично объявлять явно. Это, как правило, редкий случай.

Рассмотрим наш [предыдущий пример person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был признан динамическим.

Предположим, что `company.labels` содержит произвольные ключи. Кроме того, тип любого ключа в этой структуре может отличаться от строки к строке. Например:

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

Учитывая динамический характер столбца `company.labels` от объекта к объекту, с точки зрения ключей и типов, у нас есть несколько вариантов моделирования этих данных:

* **Один JSON-столбец** — представляет всю схему в виде одного столбца `JSON`, позволяя всем структурам под ним быть динамическими.
* **Точечный JSON-столбец** — использовать тип `JSON` только для столбца `company.labels`, сохранив структурированную схему, использованную выше, для всех остальных столбцов.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), подход с одним JSON-столбцом полезен для прототипирования и задач инженерии данных.

Для масштабных промышленных развертываний ClickHouse мы рекомендуем чётко задавать структуру и использовать тип JSON для целевых динамических подструктур, где это возможно.

Строгая схема имеет ряд преимуществ:


- **Проверка данных** – жёсткое соблюдение схемы позволяет избежать риска взрыва числа столбцов (за исключением отдельных специализированных структур). 
- **Снижение риска взрыва числа столбцов** – хотя тип JSON масштабируется потенциально до тысяч столбцов, где подстолбцы хранятся как отдельные столбцы, это может привести к взрыву числа файлов столбцов, когда создаётся чрезмерное количество файлов столбцов, что влияет на производительность. Чтобы смягчить этот эффект, базовый [тип Dynamic](/sql-reference/data-types/dynamic), используемый JSON, предоставляет параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранимых как отдельные файлы столбцов. После достижения порога дополнительные пути сохраняются в общем файле столбца с использованием компактного кодированного представления, что позволяет поддерживать производительность и эффективность хранения при одновременной поддержке гибкой ингестии данных. Однако доступ к этому общему файлу столбца менее эффективен. Обратите внимание, что столбец JSON может использоваться с [подсказками типов](#using-type-hints-and-skipping-paths). Столбцы с подсказками типов обеспечат ту же производительность, что и выделенные столбцы.
- **Упрощённая интроспекция путей и типов** – хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для изучения, например, с помощью `DESCRIBE`.

### Один столбец JSON {#single-json-column}

Этот подход полезен для прототипирования и задач инженерии данных. В продуктивной среде старайтесь использовать `JSON` только для динамических подструктур, где это действительно необходимо.

:::note Особенности производительности
Один столбец JSON можно оптимизировать, пропуская (не сохраняя) JSON‑пути, которые не требуются, и используя [type hints](#using-type-hints-and-skipping-paths). Type hints позволяют пользователю явно задать тип для подстолбца, тем самым избегая вывода типов и дополнительной обработки во время выполнения запроса. Это позволяет обеспечить ту же производительность, как если бы использовалась явная схема. Подробности см. в разделе [«Using type hints and skipping paths»](#using-type-hints-and-skipping-paths).
:::

Схема для одного столбца JSON здесь проста:

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
Мы указываем [подсказку типа](#using-type-hints-and-skipping-paths) для столбца `username` в определении JSON, так как используем его в сортировке/первичном ключе. Это помогает ClickHouse понять, что этот столбец не может быть NULL, и гарантирует, что ClickHouse знает, какой подстолбец `username` использовать (для каждого типа их может быть несколько, поэтому без такой подсказки возникает неоднозначность).
:::

Вставку строк в приведённую выше таблицу можно выполнить с помощью формата `JSONAsObject`:

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

Мы можем определить автоматически выведенные подстолбцы и их типы с помощью [функций интроспекции](/sql-reference/data-types/newjson#introspection-functions). Например:

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

Полный список функций интроспекции см. в разделе [&quot;Introspection functions&quot;](/sql-reference/data-types/newjson#introspection-functions)

[Доступ к вложенным путям можно получить](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) с помощью нотации `.` — например:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

Обратите внимание, что для отсутствующих в строках столбцов возвращается значение `NULL`.


Также создаётся отдельный подстолбец для путей с одинаковым типом. Например, существует подстолбец для `company.labels.type` и типа `String`, и типа `Array(Nullable(String))`. При выборке по умолчанию будут возвращены оба, но мы можем явно обращаться к конкретным подстолбцам, используя синтаксис `.:`:

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

Чтобы вернуть вложенные под-объекты, требуется использовать `^`. Это сделано намеренно, чтобы не считывать большое количество столбцов, если только это не запрошено явно. Объекты, к которым обращаются без `^`, вернут `NULL`, как показано ниже:

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


### Целевой JSON-столбец {#targeted-json-column}

Хотя такой подход полезен при прототипировании и решении задач инженерии данных, в продуктивной среде мы рекомендуем по возможности использовать явную схему.

Наш предыдущий пример можно смоделировать с помощью одного столбца `JSON`, соответствующего столбцу `company.labels`.

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

Мы можем вставлять данные в эту таблицу, используя формат `JSONEachRow`:

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

[Функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) можно использовать для определения путей и типов, выведенных для столбца `company.labels`.


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


### Использование подсказок типов и пропуска путей {#using-type-hints-and-skipping-paths}

Подсказки типов позволяют задать тип для пути и его подстолбца, избегая лишнего вывода типов. Рассмотрим следующий пример, где мы задаём типы для JSON-ключей `dissolved`, `employees` и `founded` внутри JSON-столбца `company.labels`.

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

Обратите внимание, что у этих столбцов теперь явно заданные типы:

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

Кроме того, мы можем пропускать пути внутри JSON, которые не хотим сохранять, с помощью параметров [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать объем хранимых данных и избежать ненужного вывода типов для неиспользуемых путей. Например, предположим, что мы используем один столбец JSON для приведенных выше данных. Мы можем пропустить пути `address` и `company`:


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

Обратите внимание, что наши столбцы отсутствуют в данных:

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

Подсказки типов дают не только способ избежать лишнего вывода типов — они полностью устраняют косвенность при хранении и обработке данных, а также позволяют задавать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). JSON-пути с подсказками типов всегда хранятся так же, как традиционные столбцы, исключая необходимость в [**столбцах-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении типов во время выполнения запроса. 

Это означает, что при чётко определённых подсказках типов вложенные JSON-ключи достигают той же производительности и эффективности, как если бы они изначально были смоделированы как столбцы верхнего уровня. 

В результате, для наборов данных, которые в целом однородны, но при этом выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости переработки схемы или конвейера приёма данных.

### Настройка динамических путей {#configuring-dynamic-paths}

ClickHouse сохраняет каждый JSON‑путь как подобстолбец при истинно столбцовой организации хранения, что обеспечивает те же преимущества по производительности, что и для традиционных столбцов — такие как сжатие, обработка с использованием SIMD и минимальный дисковый I/O. Каждая уникальная комбинация пути и типа в ваших JSON‑данных может становиться отдельным столбцовым файлом на диске.

<Image img={json_column_per_type} size="md" alt="Столбец на каждый JSON‑путь" />

Например, когда два JSON‑пути вставляются с разными типами, ClickHouse хранит значения каждого [конкретного типа в отдельных подобстолбцах](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). К каждому подобстолбцу можно обращаться независимо, что минимизирует лишний I/O. Обратите внимание, что при выполнении запроса к столбцу с несколькими типами его значения по‑прежнему возвращаются как единый столбцовый результат.

Кроме того, за счёт использования смещений ClickHouse гарантирует, что эти подобстолбцы остаются плотными: значения по умолчанию для отсутствующих JSON‑путей не хранятся. Такой подход максимизирует сжатие и ещё больше снижает I/O.

<Image img={json_offsets} size="md" alt="Смещения JSON" />

Однако в сценариях с высокой кардинальностью или сильно вариативными JSON‑структурами — таких как конвейеры телеметрии, логи или хранилища признаков для машинного обучения — такое поведение может привести к взрывному росту числа столбцовых файлов. Каждый новый уникальный JSON‑путь приводит к созданию нового столбцового файла, а каждый вариант типа для этого пути создаёт дополнительный столбцовый файл. Хотя это оптимально для производительности чтения, это вносит эксплуатационные сложности: исчерпание дескрипторов файлов, повышенное потребление памяти и более медленные слияния из‑за большого числа мелких файлов.

Чтобы смягчить это, ClickHouse вводит концепцию подобстолбца переполнения: как только количество различных JSON‑путей превышает порог, дополнительные пути сохраняются в одном общем файле с использованием компактного закодированного формата. Этот файл по‑прежнему доступен для запросов, но не обладает теми же характеристиками производительности, что и отдельные подобстолбцы.

<Image img={shared_json_column} size="md" alt="Общий JSON‑столбец" />

Этот порог управляется параметром [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) в объявлении типа JSON.

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**Не устанавливайте этот параметр слишком большим** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве ориентировочного правила держите его ниже 10 000. Для нагрузок с сильно динамической структурой используйте подсказки типов и параметры `SKIP`, чтобы ограничить сохраняемые данные.

Пользователям, которым интересно, как реализован этот новый тип столбца, мы рекомендуем ознакомиться с нашим подробным постом в блоге [&quot;A New Powerful JSON Data Type for ClickHouse&quot;](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
