---
title: 'Проектирование схем JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально проектировать схемы JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'форматы', 'схема', 'структурированные', 'полуструктурированные']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# Проектирование схемы

Хотя [выведение схемы](/integrations/data-formats/json/inference) можно использовать для первоначального определения схемы JSON‑данных и выполнения запросов к JSON‑файлам данных непосредственно, например в S3, пользователям следует стремиться к формированию оптимизированной версионируемой схемы для своих данных. Ниже мы рассматриваем рекомендуемый подход к моделированию структур JSON.



## Статический и динамический JSON

Основная задача при разработке схемы для JSON — подобрать соответствующий тип для значения каждого ключа. Мы рекомендуем рекурсивно применять следующие правила к каждому ключу в иерархии JSON, чтобы определить подходящий тип для каждого ключа.

1. **Примитивные типы** — Если значение ключа имеет примитивный тип, независимо от того, является ли оно частью вложенного объекта или корневого, убедитесь, что вы выбираете его тип в соответствии с общими [рекомендациями по проектированию схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` в примере ниже, могут быть представлены как `Array(<type>)`, например `Array(String)`.
2. **Статический и динамический** — Если значение ключа является сложным объектом, то есть либо объектом, либо массивом объектов, определите, подвержено ли оно изменениям. Объекты, в которых новые ключи появляются редко и добавление нового ключа можно предсказать и обработать изменением схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), можно считать **статическими**. Это включает объекты, в которых только подмножество ключей может присутствовать в некоторых JSON-документах. Объекты, в которые новые ключи добавляются часто и/или непредсказуемо, следует считать **динамическими**. **Исключением являются структуры с сотнями или тысячами под-ключей, которые для удобства можно считать динамическими**.

Чтобы определить, является ли значение **статическим** или **динамическим**, см. соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p />

**Важно:** Приведённые выше правила следует применять рекурсивно. Если значение ключа признано динамическим, дальнейшая оценка не требуется, и можно следовать рекомендациям из раздела [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект является статическим, продолжайте оценивать вложенные ключи до тех пор, пока значения ключей не станут примитивными или не будут обнаружены динамические ключи.

Чтобы проиллюстрировать эти правила, мы используем следующий пример JSON, описывающий человека:

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
    "catchPhrase": "Хранилище данных реального времени для аналитики",
    "labels": {
      "type": "системы управления базами данных",
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

* Корневые ключи `name`, `username`, `email`, `website` могут быть представлены типом `String`. Столбец `phone_numbers` является массивом типа `Array(String)`, при этом `dob` и `id` имеют типы `Date` и `UInt32` соответственно.
* Новые ключи не будут добавляться в объект `address` (только новые объекты `address`), поэтому он может считаться **статическим**. Если рекурсивно обойти структуру, все подстолбцы могут считаться примитивами (и иметь тип `String`), кроме `geo`. Это также статическая структура с двумя столбцами типа `Float32`, `lat` и `lon`.
* Столбец `tags` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги любого типа и структуры.
* Объект `company` является **статическим** и всегда будет содержать не более 3 указанных ключей. Вложенные ключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги. Значения всегда будут парами ключ–значение типа `String`.


:::note
Структуры с сотнями или тысячами статических ключей могут рассматриваться как динамические, так как редко бывает практично статически объявлять для них столбцы. Однако по возможности [пропускайте пути](#using-type-hints-and-skipping-paths), которые вам не нужны, чтобы сократить как объём хранимых данных, так и накладные расходы на выведение типов.
:::



## Обработка статических структур

Мы рекомендуем обрабатывать статические структуры с помощью именованных кортежей (`Tuple`). Массивы объектов можно хранить как массивы кортежей (`Array(Tuple)`). Внутри самих кортежей столбцы и их типы должны определяться по тем же правилам. Это может приводить к вложенным `Tuple`, которые представляют вложенные объекты, как показано ниже.

Чтобы проиллюстрировать это, воспользуемся рассмотренным ранее примером JSON-объекта person, опуская динамические объекты:

```json
{
  "id": 1,
  "name": "Кликки МакКликХаус",
  "username": "Кликки",
  "email": "klicky@clickhouse.com",
  "address": [
    {
      "street": "Виктор Плейнс",
      "suite": "Офис 879",
      "city": "Високибург",
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
    "catchPhrase": "Хранилище данных в реальном времени для аналитики"
  },
  "dob": "2007-03-31"
}
```

Схема этой таблицы приведена ниже:

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

JSON можно вставлять в эту таблицу в её текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

В приведённом выше примере у нас минимальное количество данных, но, как показано ниже, мы можем выполнять запросы к столбцам-кортежам по их именам, в которых части разделены точками.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, что столбец `address.street` возвращается в виде массива (`Array`). Чтобы выбрать конкретный элемент внутри массива по позиции, смещение в массиве следует указать после имени столбца. Например, чтобы получить значение `street` из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подстолбцы также можно использовать в ключах сортировки, начиная с версии ClickHouse [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

### Обработка значений по умолчанию

Даже если JSON‑объекты структурированы, они часто остаются разрежёнными и содержат только подмножество известных ключей. К счастью, тип `Tuple` не требует, чтобы в JSON‑данных присутствовали все столбцы. Если какое‑то значение не указано, будут подставлены значения по умолчанию.


Рассмотрим ранее описанную таблицу `people` и следующий неполный JSON, в котором отсутствуют ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

```json
{
  "id": 1,
  "name": "Кликки МакКликХаус",
  "username": "Кликки",
  "email": "klikki@clickhouse.com",
  "address": [
    {
      "street": "Виктор-Плейнс",
      "city": "Уайсокибург",
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

Как видно ниже, эта строка успешно вставляется:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Выполнив запрос этой единственной строки, мы увидим, что для опущенных столбцов (включая вложенные объекты) используются значения по умолчанию:

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

Получена 1 строка. Затрачено: 0.001 сек.
```

:::note Различение пустых и null-значений
Если пользователям необходимо различать ситуацию, когда значение пустое, и когда оно вообще не передано, можно использовать тип [Nullable](/sql-reference/data-types/nullable). [Следует избегать его использования](/best-practices/select-data-types#avoid-nullable-columns), за исключением случаев, когда это абсолютно необходимо, так как он отрицательно сказывается на хранении и производительности запросов по таким столбцам.
:::

### Обработка новых столбцов

Хотя структурированный подход является наиболее простым, когда ключи JSON статичны, его всё же можно использовать, если изменения схемы можно спланировать, то есть новые ключи известны заранее и схему можно соответствующим образом модифицировать.

Обратите внимание, что ClickHouse по умолчанию игнорирует ключи JSON, которые присутствуют в пейлоуде, но отсутствуют в схеме. Рассмотрим следующий модифицированный JSON-пейлоуд с добавлением ключа `nickname`:

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
    "catchPhrase": "Хранилище данных для аналитики в реальном времени"
  },
  "dob": "2007-03-31"
}
```

Этот JSON можно успешно вставить, при этом ключ `nickname` будет проигнорирован:


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

Добавлена 1 строка. Затрачено: 0.002 сек.
```

В схему можно добавлять столбцы с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию можно задать с помощью секции `DEFAULT`; оно будет использоваться, если не указано при последующих вставках. Для строк, у которых это значение отсутствует (поскольку они были вставлены до его появления), также будет возвращаться это значение по умолчанию. Если значение `DEFAULT` не указано, будет использовано значение по умолчанию для данного типа.

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

2 rows in set. Elapsed: 0.001 sec.
```


## Обработка полуструктурированных/динамических структур

Если JSON-данные полуструктурированы, при этом ключи могут динамически добавляться и/или иметь несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Более конкретно, используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут меняться со временем.
* Содержат **значения разных типов** (например, путь может иногда содержать строку, а иногда число).
* Требуют гибкой схемы, где строгая типизация непрактична.
* Имеют **сотни или даже тысячи** путей, которые статичны, но объявлять их явно нереалистично. Обычно это редкий случай.

Рассмотрим наш [более ранний пример JSON с описанием человека](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был признан динамическим.

Предположим, что `company.labels` содержит произвольные ключи. Дополнительно, тип для любого ключа в этой структуре может отличаться от строки к строке. Например:

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
    "catchPhrase": "Хранилище данных реального времени для аналитики",
    "labels": {
      "type": "системы управления базами данных",
      "founded": "2021",
      "employees": 250
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
    "catchPhrase": "Упрощенная аналитика в масштабе",
    "labels": {
      "type": [
        "обработка в реальном времени"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "Запуск симуляций",
    "holidays": [
      {
        "year": 2023,
        "location": "Киото, Япония"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

Учитывая динамическую природу столбца `company.labels` для разных объектов с точки зрения ключей и типов, у нас есть несколько вариантов моделирования этих данных:

* **Один столбец JSON** — представить всю схему в виде одного столбца `JSON`, позволяя всем структурам под ним быть динамическими.
* **Выделенный столбец JSON** — использовать тип `JSON` только для столбца `company.labels`, сохранив структурированную схему, использованную выше, для всех остальных столбцов.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), подход с одним столбцом JSON полезен для прототипирования и задач инженерии данных.

Для продакшн-развертываний ClickHouse в крупном масштабе мы рекомендуем явно задавать структуру и использовать тип JSON для целевых динамических подструктур, где это возможно.

Строгая схема имеет ряд преимуществ:


* **Проверка данных (data validation)** – строгое соблюдение схемы позволяет избежать риска «взрыва» числа столбцов за пределами отдельных структур.
* **Снижение риска «взрыва» числа столбцов** – хотя тип JSON масштабируется до потенциально тысяч столбцов, где подстолбцы хранятся как отдельные столбцы, это может привести к «взрыву» файлов столбцов, когда создаётся чрезмерное количество файлов столбцов, что ухудшает производительность. Чтобы снизить этот риск, базовый [тип Dynamic](/sql-reference/data-types/dynamic), используемый JSON, предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, сохраняемых как отдельные файлы столбцов. После достижения порогового значения дополнительные пути сохраняются в общем файле столбца с использованием компактного кодированного формата, что поддерживает производительность и эффективность хранения при сохранении гибкости ингестии данных. Однако доступ к этому общему файлу столбца менее эффективен. Обратите внимание, что JSON-столбец может использоваться с [type hints](#using-type-hints-and-skipping-paths). «Подсказанные» столбцы обеспечивают ту же производительность, что и выделенные столбцы.
* **Упрощённый анализ путей и типов** – хотя тип JSON поддерживает [инструменты интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры зачастую проще исследовать, например, с помощью `DESCRIBE`.

### Один столбец JSON

Этот подход полезен для прототипирования и задач инженерии данных. В продуктивной среде старайтесь использовать `JSON` только для динамических подструктур, когда это действительно необходимо.

:::note Performance considerations
Один столбец JSON можно оптимизировать, пропуская (не сохраняя) JSON-пути, которые не требуются, и используя [type hints](#using-type-hints-and-skipping-paths). Type hints позволяют пользователю явно задать тип для подстолбца, тем самым исключая вывод типа и дополнительную обработку во время выполнения запроса. Это можно использовать для обеспечения той же производительности, как если бы применялась явная схема. Дополнительные сведения см. в разделе [«Using type hints and skipping paths»](#using-type-hints-and-skipping-paths).
:::

Схема для одного JSON-столбца здесь проста:

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
Мы указываем [подсказку типа](#using-type-hints-and-skipping-paths) для столбца `username` в JSON-определении, так как мы используем его в сортировке/первичном ключе. Это помогает ClickHouse понять, что этот столбец не может быть `NULL`, и гарантирует, что он выберет правильный подстолбец `username` (для каждого типа данных их может быть несколько, поэтому иначе это было бы неоднозначно).
:::

Вставку строк в приведённую выше таблицу можно выполнять, используя формат `JSONAsObject`:

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 строка в наборе. Затрачено: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 строка в наборе. Затрачено: 0.004 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical
```


Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
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

Полный список функций интроспекции см. в разделе [«Функции интроспекции»](/sql-reference/data-types/newjson#introspection-functions)

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


Кроме того, для путей одного и того же типа создаётся отдельный подстолбец. Например, подстолбец существует для `company.labels.type` и типа `String`, и типа `Array(Nullable(String))`. Хотя при возможности будут возвращены оба варианта, мы можем обращаться к конкретным подстолбцам, используя синтаксис `.:`:

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

Получено 2 строки. Прошло: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

Получено 2 строки. Прошло: 0.009 sec.
```

Чтобы вернуть вложенные дочерние объекты, требуется использовать символ `^`. Это сделано намеренно, чтобы избегать чтения большого количества столбцов, если только это не запрошено явно. Объекты, к которым обращаются без `^`, будут возвращать `NULL`, как показано ниже:

```sql
-- вложенные объекты по умолчанию не возвращаются
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- возврат вложенных объектов с помощью нотации ^
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### Целевая колонка JSON

Хотя такой подход полезен для прототипирования и решения задач data engineering, в продуктивной среде мы рекомендуем по возможности использовать явную схему.

Наш предыдущий пример можно реализовать с помощью одной колонки `JSON` для столбца `company.labels`.

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

Мы можем вставлять данные в эту таблицу в формате `JSONEachRow`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Вставлена 1 строка. Время выполнения: 0.450 сек.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}
```


1 строка в наборе. Прошло: 0.440 сек.

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

Получено 2 строки. Затрачено: 0.005 сек.
````

[Функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) можно использовать для определения автоматически выводимых путей и типов для столбца `company.labels`.

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

### Использование подсказок типов и пропуска путей

Подсказки типов позволяют указывать тип для пути и его подстолбца, предотвращая ненужный вывод типов. Рассмотрим следующий пример, где мы задаём типы для ключей JSON `dissolved`, `employees` и `founded` внутри JSON-столбца `company.labels`

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

1 строка в наборе. Затрачено: 0.450 сек.
```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Вставлена 1 строка. Затрачено: 0.440 сек.

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

Получено 2 строки. Затрачено: 0.003 сек.
````

Кроме того, можно исключить пути внутри JSON, которые не требуется сохранять, с помощью параметров [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать объём хранилища и избежать ненужного вывода типов для неиспользуемых путей. Например, предположим, что для приведённых выше данных используется один столбец JSON. Можно исключить пути `address` и `company`:

```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Вставлена 1 строка. Затрачено: 0.450 сек.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Вставлена 1 строка. Затрачено: 0.440 сек.
```

Обратите внимание, что эти столбцы были исключены из данных:

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

#### Оптимизация производительности с помощью указаний типов {#optimizing-performance-with-type-hints}

Указания типов — это не просто способ избежать ненужного вывода типов. Они полностью устраняют косвенность хранения и обработки, а также позволяют задавать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). Пути JSON с указаниями типов всегда хранятся так же, как обычные столбцы, что исключает необходимость в [**столбцах-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении типов во время выполнения запроса.

Это означает, что при правильно определённых указаниях типов вложенные ключи JSON обеспечивают ту же производительность и эффективность, как если бы они изначально были смоделированы как столбцы верхнего уровня.

В результате для наборов данных, которые в основном согласованы, но при этом выигрывают от гибкости JSON, указания типов предоставляют удобный способ сохранить производительность без необходимости реструктурировать схему или конвейер приёма данных.

### Настройка динамических путей {#configuring-dynamic-paths}

ClickHouse хранит каждый путь JSON как подстолбец в полноценной колоночной структуре, обеспечивая те же преимущества производительности, что и обычные столбцы — такие как сжатие, обработка с ускорением SIMD и минимальный дисковый ввод-вывод. Каждая уникальная комбинация пути и типа в ваших данных JSON может стать отдельным файлом столбца на диске.

<Image img={json_column_per_type} size="md" alt="Столбец для каждого пути JSON" />

Например, когда два пути JSON вставляются с различными типами, ClickHouse хранит значения каждого [конкретного типа в отдельных подстолбцах](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). Эти подстолбцы доступны независимо друг от друга, что минимизирует ненужный ввод-вывод. Обратите внимание, что при запросе столбца с несколькими типами его значения всё равно возвращаются как единый колоночный ответ.

Кроме того, используя смещения, ClickHouse гарантирует, что эти подстолбцы остаются плотными, без сохранения значений по умолчанию для отсутствующих путей JSON. Этот подход максимизирует сжатие и дополнительно снижает ввод-вывод.

<Image img={json_offsets} size="md" alt="Смещения JSON" />

Однако в сценариях с высокой кардинальностью или сильно изменчивыми структурами JSON — таких как конвейеры телеметрии, журналы или хранилища признаков машинного обучения — такое поведение может привести к взрывному росту числа файлов столбцов. Каждый новый уникальный путь JSON приводит к созданию нового файла столбца, а каждый вариант типа под этим путём — к дополнительному файлу столбца. Хотя это оптимально для производительности чтения, это создаёт операционные проблемы: исчерпание файловых дескрипторов, увеличение использования памяти и замедление слияний из-за большого количества мелких файлов.

Чтобы смягчить эту проблему, ClickHouse вводит концепцию подстолбца переполнения: как только количество различных путей JSON превышает пороговое значение, дополнительные пути сохраняются в одном общем файле с использованием компактного закодированного формата. Этот файл всё ещё доступен для запросов, но не обладает теми же характеристиками производительности, что и выделенные подстолбцы.

<Image img={shared_json_column} size="md" alt="Общий столбец JSON" />

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

**Не устанавливайте это значение слишком большим** — большие значения повышают потребление ресурсов и снижают эффективность. В качестве общего ориентира держите его ниже 10 000. Для нагрузок с очень динамической структурой используйте подсказки типов и параметры `SKIP`, чтобы ограничить сохраняемые данные.

Пользователям, которым интересна реализация этого нового типа столбца, мы рекомендуем прочитать нашу подробную публикацию в блоге «Новый мощный тип данных JSON для ClickHouse» ([https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)).
