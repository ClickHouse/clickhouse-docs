---
title: 'Проектирование схем JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально проектировать схемы JSON'
keywords: ['json', 'clickhouse', 'вставка данных', 'загрузка данных', 'форматы данных', 'схема', 'структурированные данные', 'полуструктурированные данные']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# Проектирование схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) можно использовать для определения начальной схемы данных JSON и выполнения запросов к JSON‑файлам непосредственно по месту их хранения, например в S3, пользователям следует стремиться к созданию оптимизированной схемы с версионированием для своих данных. Ниже мы рассматриваем рекомендуемый подход к моделированию JSON‑структур.



## Статический и динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON — определить подходящий тип для значения каждого ключа. Рекомендуется применять следующие правила рекурсивно к каждому ключу в иерархии JSON для определения подходящего типа.

1. **Примитивные типы** — Если значение ключа является примитивным типом, независимо от того, является ли оно частью подобъекта или находится в корне, выбирайте его тип в соответствии с общими [рекомендациями по проектированию схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` ниже, можно моделировать как `Array(<type>)`, например `Array(String)`.
2. **Статический или динамический** — Если значение ключа является сложным объектом, то есть объектом или массивом объектов, определите, подвержено ли оно изменениям. Объекты, в которых редко появляются новые ключи и добавление нового ключа можно предсказать и обработать изменением схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), могут считаться **статическими**. Это включает объекты, где в некоторых JSON-документах может присутствовать только подмножество ключей. Объекты, в которых новые ключи добавляются часто и/или непредсказуемо, следует считать **динамическими**. **Исключением являются структуры с сотнями или тысячами подключей, которые для удобства могут считаться динамическими**.

Чтобы определить, является ли значение **статическим** или **динамическим**, см. соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p></p>

**Важно:** Приведенные выше правила следует применять рекурсивно. Если значение ключа определено как динамическое, дальнейшая оценка не требуется, и можно следовать рекомендациям в разделе [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект статический, продолжайте оценивать подключи до тех пор, пока не будут обнаружены либо примитивные значения ключей, либо динамические ключи.

Для иллюстрации этих правил используется следующий пример JSON, представляющий человека:

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

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены типом `String`. Столбец `phone_numbers` является массивом примитивов типа `Array(String)`, а `dob` и `id` имеют типы `Date` и `UInt32` соответственно.
- Новые ключи не будут добавляться в объект `address` (только новые объекты адресов), поэтому он может считаться **статическим**. При рекурсивном анализе все подстолбцы можно считать примитивами типа `String`, за исключением `geo`. Это также статическая структура с двумя столбцами типа `Float32`: `lat` и `lon`.
- Столбец `tags` является **динамическим**. Предполагается, что к этому объекту могут быть добавлены новые произвольные теги любого типа и структуры.
- Объект `company` является **статическим** и всегда будет содержать не более 3 указанных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Предполагается, что к этому объекту могут быть добавлены новые произвольные теги. Значения всегда будут парами ключ-значение строкового типа.


:::note
Структуры с сотнями или тысячами статических ключей можно рассматривать как динамические, поскольку в таких случаях редко реалистично статически объявлять столбцы. Однако по возможности [пропускайте пути](#using-type-hints-and-skipping-paths), которые не нужны, чтобы сократить как затраты на хранение, так и накладные расходы на выполнение инференса.
:::



## Обработка статических структур {#handling-static-structures}

Для обработки статических структур рекомендуется использовать именованные кортежи, т.е. `Tuple`. Массивы объектов можно хранить в виде массивов кортежей, т.е. `Array(Tuple)`. Внутри самих кортежей столбцы и их типы должны определяться по тем же правилам. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Для иллюстрации используем предыдущий пример JSON с данными о человеке, опустив динамические объекты:

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

Обратите внимание, что столбец `company` определён как `Tuple(catchPhrase String, name String)`. Ключ `address` использует `Array(Tuple)` с вложенным `Tuple` для представления столбца `geo`.

JSON можно вставить в эту таблицу в текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

В приведённом выше примере у нас минимальный объём данных, но, как показано ниже, мы можем запрашивать столбцы кортежей по их именам, разделённым точками.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, что столбец `address.street` возвращается как `Array`. Для запроса конкретного объекта внутри массива по позиции необходимо указать смещение массива после имени столбца. Например, для доступа к улице из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подстолбцы также можно использовать в ключах сортировки начиная с версии [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

Даже если объекты JSON структурированы, они часто являются разреженными и содержат только подмножество известных ключей. К счастью, тип `Tuple` не требует наличия всех столбцов в JSON-данных. Если они не предоставлены, будут использованы значения по умолчанию.


Рассмотрим нашу таблицу `people` и следующий разреженный JSON, в котором отсутствуют ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

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

Ниже показано, что эта строка может быть успешно вставлена:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

При запросе этой единственной строки видно, что для пропущенных столбцов (включая вложенные объекты) используются значения по умолчанию:

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

:::note Различие между пустым значением и null
Если необходимо различать пустое значение и отсутствующее значение, можно использовать тип [Nullable](/sql-reference/data-types/nullable). Этого [следует избегать](/best-practices/select-data-types#avoid-nullable-columns), если это не является абсолютно необходимым, поскольку это негативно скажется на хранении данных и производительности запросов для этих столбцов.
:::

### Обработка новых столбцов {#handling-new-columns}

Хотя структурированный подход наиболее прост при статичных ключах JSON, этот подход можно использовать и в случае, если изменения схемы можно спланировать, то есть новые ключи известны заранее и схема может быть соответствующим образом изменена.

Обратите внимание, что ClickHouse по умолчанию игнорирует ключи JSON, которые присутствуют в данных, но отсутствуют в схеме. Рассмотрим следующие измененные данные JSON с добавленным ключом `nickname`:

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
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

Этот JSON может быть успешно вставлен, при этом ключ `nickname` будет проигнорирован:


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

Обработана 1 строка. Прошло: 0.002 сек.
```

Столбцы можно добавлять в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию можно задать в предложении `DEFAULT`, которое будет использоваться, если значение не указано при последующих вставках. Строки, для которых это значение отсутствует (так как они были вставлены до его создания), также будут возвращать это значение по умолчанию. Если значение `DEFAULT` не указано, используется значение по умолчанию для данного типа.

Например:

```sql
-- вставка начальной строки (nickname будет проигнорировано)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- добавить столбец
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- вставка новой строки (те же данные, другой id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- выбрать 2 строки
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

Получено 2 строки. Затрачено: 0.001 сек.
```


## Обработка полуструктурированных/динамических структур {#handling-semi-structured-dynamic-structures}

Если данные JSON являются полуструктурированными, где ключи могут динамически добавляться и/или иметь несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Более конкретно, используйте тип JSON, когда ваши данные:

- Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
- Содержат **значения различных типов** (например, путь может содержать то строку, то число).
- Требуют гибкости схемы, где строгая типизация неприменима.
- У вас есть **сотни или даже тысячи** путей, которые являются статическими, но их явное объявление нереалистично. Это, как правило, редкий случай.

Рассмотрим наш [предыдущий пример JSON с данными о человеке](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определён как динамический.

Предположим, что `company.labels` содержит произвольные ключи. Кроме того, тип любого ключа в этой структуре может различаться между строками. Например:

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
  "phone_numbers": ["123-456-7890", "555-867-5309"],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": ["real-time processing"],
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

Учитывая динамическую природу столбца `company.labels` между объектами в отношении ключей и типов, у нас есть несколько вариантов моделирования этих данных:

- **Один столбец JSON** — представляет всю схему в виде одного столбца `JSON`, позволяя всем структурам под ним быть динамическими.
- **Целевой столбец JSON** — использовать тип `JSON` только для столбца `company.labels`, сохраняя структурированную схему, используемую выше, для всех остальных столбцов.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), подход с одним столбцом JSON полезен для прототипирования и задач инженерии данных.

Для промышленных развёртываний ClickHouse в масштабе мы рекомендуем быть конкретными в отношении структуры и использовать тип JSON для целевых динамических подструктур, где это возможно.

Строгая схема имеет ряд преимуществ:


- **Валидация данных** – применение строгой схемы позволяет избежать риска неконтролируемого роста числа колонок за пределами специфических структур.
- **Предотвращение неконтролируемого роста числа колонок** - Хотя тип JSON масштабируется до потенциально тысяч колонок, где подколонки хранятся как отдельные колонки, это может привести к неконтролируемому росту числа файлов колонок, когда создается избыточное количество файлов колонок, что негативно влияет на производительность. Для решения этой проблемы базовый [тип Dynamic](/sql-reference/data-types/dynamic), используемый JSON, предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранящихся в виде отдельных файлов колонок. После достижения порогового значения дополнительные пути сохраняются в общем файле колонки с использованием компактного закодированного формата, что позволяет поддерживать производительность и эффективность хранения при одновременной поддержке гибкого приема данных. Однако доступ к этому общему файлу колонки менее производителен. Обратите внимание, что колонка JSON может использоваться с [подсказками типов](#using-type-hints-and-skipping-paths). Колонки с подсказками обеспечат ту же производительность, что и выделенные колонки.
- **Более простая интроспекция путей и типов** - Хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для исследования, например, с помощью `DESCRIBE`.

### Одна колонка JSON {#single-json-column}

Этот подход полезен для прототипирования и задач инженерии данных. Для продакшена рекомендуется использовать `JSON` только для динамических подструктур там, где это необходимо.

:::note Соображения производительности
Одна колонка JSON может быть оптимизирована путем пропуска (не сохранения) путей JSON, которые не требуются, и использования [подсказок типов](#using-type-hints-and-skipping-paths). Подсказки типов позволяют пользователю явно определить тип для подколонки, тем самым пропуская вывод типов и обработку косвенных обращений во время выполнения запроса. Это можно использовать для достижения той же производительности, как если бы использовалась явная схема. См. ["Использование подсказок типов и пропуск путей"](#using-type-hints-and-skipping-paths) для получения дополнительной информации.
:::

Схема для одной колонки JSON здесь проста:

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
Мы предоставляем [подсказку типа](#using-type-hints-and-skipping-paths) для колонки `username` в определении JSON, поскольку используем её в ключе сортировки/первичном ключе. Это помогает ClickHouse понять, что эта колонка не будет null, и гарантирует, что он знает, какую подколонку `username` использовать (может быть несколько для каждого типа, поэтому в противном случае это неоднозначно).
:::

Вставка строк в указанную выше таблицу может быть выполнена с использованием формата `JSONAsObject`:

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

```


Строка 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Строка 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

Получено 2 строки. Затрачено: 0.005 сек.

````

Определить выведенные подстолбцы и их типы можно с помощью [функций интроспекции](/sql-reference/data-types/newjson#introspection-functions). Например:

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

Получено 2 строки. Затрачено: 0.009 сек.
````

Полный список функций интроспекции см. в разделе [«Функции интроспекции»](/sql-reference/data-types/newjson#introspection-functions).

[Доступ к подпутям](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) осуществляется с помощью нотации `.`, например:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

Получено 2 строки. Затрачено: 0.006 сек.
```

Обратите внимание, что отсутствующие в строках столбцы возвращаются как `NULL`.


Кроме того, для путей одного типа создается отдельный подстолбец. Например, для `company.labels.type` существует подстолбец как для типа `String`, так и для типа `Array(Nullable(String))`. Хотя оба значения будут возвращены там, где это возможно, мы можем обратиться к конкретным подстолбцам, используя синтаксис `.:`:

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

Для возврата вложенных подобъектов требуется символ `^`. Это архитектурное решение, позволяющее избежать чтения большого количества столбцов, если это не запрошено явно. Объекты, к которым обращаются без `^`, вернут `NULL`, как показано ниже:

```sql
-- подобъекты не возвращаются по умолчанию
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- возврат подобъектов с использованием нотации ^
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### Целевой столбец JSON {#targeted-json-column}

Хотя это полезно при прототипировании и решении задач инженерии данных, мы рекомендуем использовать явную схему в продакшене везде, где это возможно.

Наш предыдущий пример можно смоделировать с одним столбцом `JSON` для столбца `company.labels`.

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

```


Получена 1 строка. Прошло: 0.440 сек.

````

```sql
SELECT *
FROM people
FORMAT Vertical

Строка 1:
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

Строка 2:
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

Получено 2 строки. Прошло: 0.005 сек.
````

[Функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) можно использовать для определения выведенных путей и типов столбца `company.labels`.

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

Получено 2 строки. Прошло: 0.003 сек.
```

### Использование подсказок типов и пропуск путей {#using-type-hints-and-skipping-paths}

Подсказки типов позволяют указать тип для пути и его подстолбца, предотвращая ненужный вывод типов. Рассмотрим следующий пример, в котором мы указываем типы для JSON-ключей `dissolved`, `employees` и `founded` в JSON-столбце `company.labels`

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

Получена 1 строка. Прошло: 0.450 сек.

```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Получена 1 строка. Время выполнения: 0.440 сек.

````

Обратите внимание, что теперь эти столбцы имеют явно заданные типы:

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

Получено 2 строки. Время выполнения: 0.003 сек.
````

Кроме того, можно пропустить пути внутри JSON, которые не требуется сохранять, используя параметры [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать объем хранилища и избежать ненужного вывода типов для неиспользуемых путей. Например, предположим, что для приведенных выше данных используется один столбец JSON. Можно пропустить пути `address` и `company`:

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

Получена 1 строка. Время выполнения: 0.440 сек.
```

Обратите внимание, что эти столбцы исключены из данных:

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

```


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

Получено 2 строки. Затрачено: 0.004 сек.

```

#### Оптимизация производительности с помощью указания типов {#optimizing-performance-with-type-hints}

Указание типов — это не просто способ избежать ненужного вывода типов. Они полностью устраняют косвенность при хранении и обработке данных, а также позволяют задавать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). JSON-пути с указанием типов всегда хранятся так же, как обычные столбцы, что исключает необходимость в [**столбцах-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом определении типов во время выполнения запроса.

Это означает, что при корректно заданных указаниях типов вложенные JSON-ключи обеспечивают ту же производительность и эффективность, как если бы они изначально были смоделированы в виде столбцов верхнего уровня.

Таким образом, для наборов данных, которые в основном имеют согласованную структуру, но при этом требуют гибкости JSON, указание типов предоставляет удобный способ сохранить производительность без необходимости реструктурировать схему или конвейер загрузки данных.

### Настройка динамических путей {#configuring-dynamic-paths}

ClickHouse хранит каждый JSON-путь как подстолбец в полноценной колоночной структуре, обеспечивая те же преимущества производительности, что и обычные столбцы: сжатие, SIMD-ускоренную обработку и минимальный дисковый ввод-вывод. Каждая уникальная комбинация пути и типа в ваших JSON-данных может стать отдельным файлом столбца на диске.

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

Например, когда вставляются два JSON-пути с разными типами, ClickHouse сохраняет значения каждого [конкретного типа в отдельных подстолбцах](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). Эти подстолбцы доступны независимо друг от друга, что минимизирует ненужный ввод-вывод. Обратите внимание, что при запросе столбца с несколькими типами его значения всё равно возвращаются как единый колоночный результат.

Кроме того, используя смещения, ClickHouse гарантирует, что эти подстолбцы остаются плотными, без сохранения значений по умолчанию для отсутствующих JSON-путей. Такой подход максимизирует сжатие и дополнительно снижает объём ввода-вывода.

<Image img={json_offsets} size="md" alt="JSON offsets" />

Однако в сценариях с высокой кардинальностью или сильно изменчивыми JSON-структурами — такими как конвейеры телеметрии, логи или хранилища признаков машинного обучения — такое поведение может привести к лавинообразному росту числа файлов столбцов. Каждый новый уникальный JSON-путь создаёт новый файл столбца, а каждый вариант типа под этим путём — дополнительный файл столбца. Хотя это оптимально для производительности чтения, возникают операционные проблемы: исчерпание файловых дескрипторов, увеличение потребления памяти и замедление слияний из-за большого количества мелких файлов.

Для решения этой проблемы ClickHouse вводит концепцию подстолбца переполнения: когда количество различных JSON-путей превышает пороговое значение, дополнительные пути сохраняются в одном общем файле с использованием компактного закодированного формата. Этот файл по-прежнему доступен для запросов, но не обладает теми же характеристиками производительности, что и выделенные подстолбцы.

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

Это пороговое значение контролируется параметром [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) в объявлении типа JSON.

```


```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**Не задавайте этому параметру слишком большое значение** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве общего ориентира держите его ниже 10 000. Для нагрузок с очень динамичной структурой используйте подсказки типов и параметры `SKIP`, чтобы ограничить сохраняемые данные.

Пользователям, которых интересует реализация этого нового типа столбца, мы рекомендуем ознакомиться с нашей подробной статьёй в блоге [&quot;A New Powerful JSON Data Type for ClickHouse&quot;](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
