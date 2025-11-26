---
title: 'Проектирование схем JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально спроектировать схемы JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'форматы', 'схема', 'структурированные', 'полуструктурированные']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# Проектирование схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) можно использовать для формирования начальной схемы JSON‑данных и выполнения запросов к JSON‑файлам непосредственно в хранилище, например в S3, пользователям следует стремиться разработать оптимизированную версионируемую схему для своих данных. Ниже рассматривается рекомендуемый подход к моделированию JSON‑структур.

## Статический и динамический JSON

Основная задача при определении схемы для JSON — определить подходящий тип для значения каждого ключа. Мы рекомендуем рекурсивно применять к каждому ключу в иерархии JSON следующие правила, чтобы определить соответствующий тип для каждого ключа.

1. **Примитивные типы** — Если значение ключа является примитивным типом, независимо от того, является ли оно частью вложенного объекта или находится в корне, выбирайте его тип в соответствии с общими [рекомендациями по проектированию схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, например `phone_numbers` ниже, могут быть представлены как `Array(<type>)`, например `Array(String)`.
2. **Статический или динамический** — Если значение ключа является сложным объектом, т. е. либо объектом, либо массивом объектов, определите, подвержено ли оно изменениям. Объекты, у которых новые ключи появляются редко, и добавление нового ключа может быть предсказано и обработано изменением схемы с помощью [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), можно считать **статическими**. К ним относятся и объекты, в которых в отдельных JSON-документах присутствует только подмножество ключей. Объекты, в которых новые ключи добавляются часто и/или непредсказуемо, следует считать **динамическими**. **Исключение — структуры с сотнями или тысячами вложенных ключей, которые для удобства можно считать динамическими.**

Чтобы определить, является ли значение **статическим** или **динамическим**, см. соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p />

**Важно:** Приведённые выше правила следует применять рекурсивно. Если значение ключа признано динамическим, дальнейшая оценка не требуется, и можно следовать рекомендациям из раздела [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект статический, продолжайте оценивать вложенные ключи, пока значения ключей не окажутся примитивными или пока не будут обнаружены динамические ключи.

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

* Корневые ключи `name`, `username`, `email`, `website` могут быть представлены типом `String`. Столбец `phone_numbers` является примитивным массивом типа `Array(String)`, при этом `dob` и `id` имеют типы `Date` и `UInt32` соответственно.
* Новые ключи не будут добавляться в объект `address` (только новые объекты `address`), поэтому его можно считать **статическим**. Если рекурсивно раскрыть структуру, все вложенные столбцы можно считать примитивами (типа `String`), за исключением `geo`. Это также статическая структура с двумя столбцами типа `Float32`, `lat` и `lon`.
* Столбец `tags` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги любого типа и структуры.
* Объект `company` является **статическим** и будет содержать не более трёх указанных ключей. Вложенные ключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что в этот объект могут добавляться новые произвольные теги. Значения всегда будут парами ключ–значение типа `String`.


:::note
Структуры с сотнями или тысячами статических ключей можно считать динамическими, так как редко бывает реалистично статически объявлять для них столбцы. Тем не менее, при возможности [пропускайте пути](#using-type-hints-and-skipping-paths), которые не нужны, чтобы сократить затраты как на хранение, так и на определение типов.
:::

## Обработка статических структур

Мы рекомендуем обрабатывать статические структуры с помощью именованных кортежей (`Tuple`). Массивы объектов могут храниться в массивах кортежей, то есть `Array(Tuple)`. Внутри самих кортежей столбцы и их соответствующие типы должны определяться по тем же правилам. Это может приводить к вложенным `Tuple` для представления вложенных объектов, как показано ниже.

Для иллюстрации используем ранее приведённый пример JSON с объектом person, опуская динамические объекты:

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
    "catchPhrase": "Хранилище данных реального времени для аналитики"
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

Обратите внимание, что столбец `company` определён как `Tuple(catchPhrase String, name String)`. Ключ `address` использует `Array(Tuple)` и вложенный `Tuple` для представления столбца `geo`.

JSON можно вставлять в эту таблицу в её текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Хранилище данных для аналитики в реальном времени"},"dob":"2007-03-31"}
```

В приведённом выше примере у нас минимум данных, но, как показано ниже, мы можем выполнять запросы к столбцам-кортежам по их именам, разделённым точками.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, что столбец `address.street` возвращается как массив (`Array`). Чтобы обратиться к конкретному объекту внутри массива по позиции, индекс массива нужно указать после имени столбца. Например, чтобы получить улицу из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подстолбцы также могут использоваться в ключах сортировки, начиная с релиза [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

Даже если объекты JSON структурированы, они часто разреженные и содержат только подмножество известных ключей. К счастью, тип `Tuple` не требует, чтобы в JSON-полезной нагрузке присутствовали все столбцы. Если какие-либо из них не указаны, будут использованы значения по умолчанию.

Рассмотрим нашу ранее описанную таблицу `people` и следующий разреженный JSON, в котором отсутствуют ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

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

Ниже мы видим, что эту строку можно успешно вставить:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Если выполнить запрос к этой единственной строке, мы увидим, что для пропущенных столбцов (включая вложенные объекты) используются значения по умолчанию:

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

1 строка в наборе. Затрачено: 0.001 сек.
```

:::note Различие между пустыми и null-значениями
Если пользователям нужно различать ситуацию, когда значение пустое, и когда оно отсутствует, можно использовать тип [Nullable](/sql-reference/data-types/nullable). [Следует избегать](/best-practices/select-data-types#avoid-nullable-columns) его использования, если только это не абсолютно необходимо, поскольку это отрицательно сказывается на хранении данных и производительности запросов по этим столбцам.
:::


### Обработка новых столбцов

Хотя структурированный подход наиболее прост, когда ключи JSON статичны, его все же можно использовать и в том случае, если изменения схемы можно спланировать, то есть новые ключи известны заранее и схему можно соответствующим образом изменить.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые присутствуют в полезной нагрузке, но отсутствуют в схеме. Рассмотрим следующий изменённый JSON-пейлоад с добавлением ключа `nickname`:

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

Этот JSON можно успешно вставить, при этом ключ `nickname` игнорируется:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ок.

1 строка в наборе. Затрачено: 0.002 сек.
```

Столбцы можно добавлять в схему с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию можно задать с помощью предложения `DEFAULT`; оно будет использоваться, если явное значение не указано при последующих вставках. Строки, для которых это значение отсутствует (так как они были вставлены до его появления), также будут возвращать это значение по умолчанию. Если значение `DEFAULT` не указано, используется значение по умолчанию для соответствующего типа.

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

Получено 2 строки. Затрачено: 0,001 сек.
```


## Обработка полуструктурированных/динамических структур

Если JSON-данные являются полуструктурированными, где ключи могут динамически добавляться и/или иметь несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Конкретнее, используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут изменяться со временем.
* Содержат **значения с различными типами** (например, путь иногда может содержать строку, а иногда число).
* Требуют гибкости схемы, когда строгая типизация нецелесообразна.
* Содержат **сотни или даже тысячи** путей, которые статичны, но объявлять их явно нереалистично. Однако такие случаи, как правило, редки.

Рассмотрим наш [предыдущий JSON с человеком](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определён как динамический.

Предположим, что `company.labels` содержит произвольные ключи. Кроме того, тип для любого ключа в этой структуре может отличаться от строки к строке. Например:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Офис 879",
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
    "catchPhrase": "Хранилище данных в реальном времени для аналитики",
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

Учитывая динамическую природу столбца `company.labels` для разных объектов, с точки зрения ключей и типов, у нас есть несколько вариантов моделирования этих данных:

* **Один столбец JSON** — представляет всю схему в виде одного столбца `JSON`, оставляя внутренние структуры динамическими.
* **Точечный столбец JSON** — использовать тип `JSON` только для столбца `company.labels`, сохранив структурированную схему, описанную выше, для всех остальных столбцов.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), использование одного столбца JSON полезно для прототипирования и задач инженерии данных.

Для боевых развертываний ClickHouse в крупном масштабе мы рекомендуем четко задавать структуру и использовать тип JSON для целевых динамических подструктур, где это возможно.

Строгая схема имеет ряд преимуществ:


- **Проверка данных** – строгая схема позволяет избежать риска взрывного роста числа столбцов, за пределами специально предусмотренных структур. 
- **Избежание риска взрывного роста числа столбцов** – хотя тип JSON масштабируется потенциально до тысяч столбцов, где подстолбцы хранятся как отдельные столбцы, это может привести к «взрыву» файлов столбцов, когда создаётся чрезмерное количество файлов столбцов, что ухудшает производительность. Чтобы минимизировать этот риск, базовый [тип Dynamic](/sql-reference/data-types/dynamic), используемый JSON, предоставляет параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранимых как отдельные файлы столбцов. После достижения порога дополнительные пути сохраняются в общем файле столбца с использованием компактного кодированного формата, что позволяет сохранить производительность и эффективность хранения при обеспечении гибкости ингестии данных. Однако доступ к этому общему файлу столбца менее эффективен по производительности. Обратите внимание, что столбец JSON может использоваться с [подсказками типов](#using-type-hints-and-skipping-paths). Столбцы с «подсказками» будут обеспечивать ту же производительность, что и выделенные столбцы.
- **Упрощённая интроспекция путей и типов** – хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения выведенных типов и путей, статические структуры зачастую проще исследовать, например, с помощью `DESCRIBE`.

### Один столбец JSON

Этот подход полезен для прототипирования и задач data engineering. В продакшене старайтесь использовать `JSON` только для динамических подструктур, когда это действительно необходимо.

:::note Особенности производительности
Один столбец JSON можно оптимизировать, пропуская (не сохраняя) пути в JSON, которые не требуются, и используя [подсказки типов](#using-type-hints-and-skipping-paths). Подсказки типов позволяют пользователю явно задать тип для подстолбца, тем самым избегая вывода типа и дополнительной обработки во время выполнения запроса. Это позволяет достичь такой же производительности, как при использовании явной схемы. Дополнительные сведения см. в разделе [&quot;Использование подсказок типов и пропуск путей&quot;](#using-type-hints-and-skipping-paths).
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
Мы указываем [подсказку типа](#using-type-hints-and-skipping-paths) для столбца `username` в определении JSON, так как используем его в сортировке/первичном ключе. Это помогает ClickHouse понять, что в этом столбце не может быть значения NULL, и гарантирует, что он использует нужный вложенный столбец `username` (для каждого типа их может быть несколько, поэтому без этого возникает неоднозначность).
:::

Строки в приведённую выше таблицу можно вставлять, используя формат `JSONAsObject`:

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Вставлена 1 строка. Время выполнения: 0.028 сек.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Вставлена 1 строка. Время выполнения: 0.004 сек.
```


```sql
SELECT *
FROM people
FORMAT Vertical

Строка 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Строка 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

Получено 2 строки. Прошло: 0.005 сек.
```

Мы можем определить выведенные подстолбцы и их типы с помощью [функций интроспекции](/sql-reference/data-types/newjson#introspection-functions). Например:

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

Получено 2 строки. Время выполнения: 0.009 сек.
```

Полный список функций интроспекции см. в разделе [&quot;Introspection functions&quot;](/sql-reference/data-types/newjson#introspection-functions)

[К вложенным путям можно обращаться](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) с помощью нотации `.` , например:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

Получено 2 строки. Затрачено: 0,006 сек.
```

Обратите внимание, что отсутствующие в строках столбцы возвращаются как `NULL`.


Также для путей одного и того же типа создаётся отдельный подстолбец. Например, подстолбец существует для `company.labels.type` как для типа `String`, так и для `Array(Nullable(String))`. Оба подстолбца будут возвращены, когда это возможно, но при необходимости можно обращаться к конкретным подстолбцам, используя синтаксис `.:`:

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

Получено 2 строки. Затрачено: 0.007 сек.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

Получено 2 строки. Затрачено: 0.009 сек.
```

Чтобы возвращать вложенные подобъекты, требуется символ `^`. Это сделано намеренно, чтобы избежать чтения большого количества столбцов, если только они не запрошены явно. Объекты, к которым обращаются без `^`, вернут `NULL`, как показано ниже:

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


### Целевой столбец JSON

Хотя такой подход полезен при прототипировании и решении задач инженерии данных, в продуктивной среде мы рекомендуем по возможности использовать явную схему.

Наш предыдущий пример можно смоделировать одним столбцом типа `JSON`, соответствующим `company.labels`.

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

Вставлена 1 строка. Время выполнения: 0.450 сек.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Вставлена 1 строка. Время выполнения: 0.440 сек.
```

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

2 строки в наборе. Затрачено: 0.005 сек.
```

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


### Использование подсказок типов и пропуска путей

Подсказки типов позволяют указать тип для пути и его подстолбца, предотвращая излишний вывод типов. Рассмотрим следующий пример, в котором мы задаём типы для JSON-ключей `dissolved`, `employees` и `founded` внутри JSON-столбца `company.labels`.

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

1 строка добавлена. Затрачено: 0.450 сек.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 строка добавлена. Затрачено: 0.440 сек.
```

Обратите внимание, что у этих столбцов теперь явно указаны типы:

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
```

Кроме того, мы можем пропускать пути внутри JSON, которые не хотим сохранять, с помощью параметров [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать объём занимаемого места и избежать ненужного вывода структуры по неиспользуемым путям. Например, предположим, что мы используем один столбец JSON для приведённых выше данных. Мы можем пропустить пути `address` и `company`:


```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Добавлена 1 строка. Время выполнения: 0.450 сек.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

Добавлена 1 строка. Время выполнения: 0.440 сек.
```

Обратите внимание, что наши столбцы были исключены из нашего набора данных:

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

Выбрано 2 строки. Затрачено: 0.004 сек.
```


#### Оптимизация производительности с помощью подсказок типов {#optimizing-performance-with-type-hints}  

Подсказки типов позволяют не только избежать лишнего вывода типов — они полностью устраняют дополнительный уровень косвенности при хранении и обработке, а также позволяют указывать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). JSON‑пути с подсказками типов всегда хранятся так же, как традиционные столбцы, без необходимости в [**дискриминаторных столбцах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении во время выполнения запроса. 

Это означает, что при наличии чётко определённых подсказок типов вложенные ключи JSON обеспечивают ту же производительность и эффективность, как если бы они изначально были смоделированы как столбцы верхнего уровня. 

В результате для наборов данных, которые в основном однородны, но при этом выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости переработки схемы или конвейера приёма данных.

### Настройка динамических путей

ClickHouse хранит каждый JSON-путь как подколонку в настоящем колоночном формате, обеспечивая те же преимущества по производительности, что и для традиционных столбцов — например, сжатие, SIMD-ускоренную обработку и минимальное дисковое I/O. Каждая уникальная комбинация пути и типа в ваших JSON-данных может быть вынесена в отдельный файловый столбец на диске.

<Image img={json_column_per_type} size="md" alt="Отдельный столбец для каждого JSON-пути" />

Например, когда вставляются два JSON-пути с разными типами, ClickHouse хранит значения каждого [конкретного типа в отдельных подколонках](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). Эти подколонки могут считываться независимо, что минимизирует лишний I/O. Обратите внимание, что при запросе столбца с несколькими типами его значения всё равно возвращаются как единый колоночный результат.

Кроме того, за счёт использования смещений ClickHouse гарантирует, что эти подколонки остаются плотными, без хранения значений по умолчанию для отсутствующих JSON-путей. Такой подход максимизирует сжатие и дополнительно снижает I/O.

<Image img={json_offsets} size="md" alt="Смещения в JSON" />

Однако в сценариях с высокой кардинальностью или сильно вариативными JSON-структурами — таких как конвейеры телеметрии, логи или хранилища признаков для задач машинного обучения — такое поведение может приводить к взрывному росту числа файловых столбцов. Каждый новый уникальный JSON-путь приводит к созданию нового файлового столбца, а каждый вариант типа под этим путём создаёт дополнительный файловый столбец. Хотя это оптимально для производительности чтения, оно вносит операционные сложности: исчерпание дескрипторов файлов, увеличенное потребление памяти и более медленные слияния из-за большого числа мелких файлов.

Чтобы снизить эти эффекты, ClickHouse вводит концепцию подколонки overflow: после того как количество различных JSON-путей превышает порог, дополнительные пути сохраняются в одном общем файле с использованием компактного кодированного формата. Этот файл по-прежнему доступен для запросов, но не обладает теми же характеристиками производительности, что и выделенные подколонки.

<Image img={shared_json_column} size="md" alt="Общий JSON-столбец" />

Этот порог контролируется параметром [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) в определении типа JSON.

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**Не устанавливайте этот параметр слишком большим** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве ориентира держите его ниже 10 000. Для рабочих нагрузок с сильно динамической структурой используйте подсказки типов и параметры `SKIP`, чтобы ограничить сохраняемые данные.

Пользователям, которым интересна реализация этого нового типа столбца, мы рекомендуем подробную статью в блоге «A New Powerful JSON Data Type for ClickHouse» ([https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)).
