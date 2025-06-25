---
title: 'Проектирование схемы JSON'
slug: /integrations/data-formats/json/schema
description: 'Как оптимально проектировать схемы JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'форматы', 'схема', 'структурированные', 'полу-структурированные']
score: 20
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';

# Проектирование вашей схемы

Хотя [вывод схемы](/integrations/data-formats/json/inference) можно использовать для установления начальной схемы для данных JSON и запроса файлов JSON на месте, например, в S3, пользователи должны стремиться установить оптимизированную версионированную схему для своих данных. Мы обсуждаем рекомендуемый подход к моделированию JSON-структур ниже.
## Статический и динамический JSON {#static-vs-dynamic-json}

Основная задача при определении схемы для JSON заключается в определении подходящего типа для значения каждого ключа. Мы рекомендуем пользователям рекурсивно применять следующие правила к каждому ключу в иерархии JSON для определения соответствующего типа.

1. **Примитивные типы** - Если значение ключа является примитивным типом, независимо от того, является ли оно частью подпункта или находится на корневом уровне, убедитесь, что вы выбрали его тип в соответствии с общими [лучшими практиками проектирования схемы](/data-modeling/schema-design) и [правилами оптимизации типов](/data-modeling/schema-design#optimizing-types). Массивы примитивов, такие как `phone_numbers` ниже, могут быть смоделированы как `Array(<type>)`, например, `Array(String)`.
2. **Статический против динамического** - Если значение ключа является сложным объектом, т.е. либо объектом, либо массивом объектов, определите, подвержено ли оно изменениям. Объекты, у которых редко появляются новые ключи, и добавление нового ключа можно предсказать и обработать с помощью изменения схемы через [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column), можно считать **статическими**. Это включает объекты, в которых только подмножество ключей может быть представлено в некоторых документах JSON. Объекты, в которых часто добавляются новые ключи и/или они непредсказуемы, следует считать **динамическими**. **Исключение здесь составляют структуры с сотнями или тысячами подпунктов, которые могут считаться динамическими в целях удобства**.

Чтобы выяснить, является ли значение **статическим** или **динамическим**, смотрите соответствующие разделы [**Обработка статических объектов**](/integrations/data-formats/json/schema#handling-static-structures) и [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) ниже.

<p></p>

**Важно:** Указанные выше правила должны применяться рекурсивно. Если значение ключа определяется как динамическое, дальнейшая оценка не требуется, и можно следовать рекомендациям в [**Обработка динамических объектов**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures). Если объект статический, продолжайте оценивать подпункты до тех пор, пока либо значения ключей не станут примитивными, либо не встретятся динамические ключи.

Чтобы проиллюстрировать эти правила, мы используем следующий пример JSON, представляющий личность:

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

- Корневые ключи `name`, `username`, `email`, `website` могут быть представлены как тип `String`. Колонка `phone_numbers` является массивом примитивов типа `Array(String)`, с `dob` и `id` типа `Date` и `UInt32` соответственно.
- Новые ключи не будут добавлены в объект `address` (только новые объекты адресов), и его можно считать **статическим**. Если мы рекурсивно проанализируем, все подколонки могут считаться примитивами (и типа `String`), кроме `geo`. Это также статическая структура с двумя колонками `Float32`, `lat` и `lon`.
- Колонка `tags` является **динамической**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект любого типа и структуры.
- Объект `company` является **статическим** и всегда будет содержать не более 3 заданных ключей. Подключи `name` и `catchPhrase` имеют тип `String`. Ключ `labels` является **динамическим**. Мы предполагаем, что новые произвольные теги могут быть добавлены в этот объект. Значения всегда будут парами ключ-значение типа строка.

:::note
Структуры с сотнями или тысячами статических ключей могут считаться динамическими, так как редко бывает реалистично статично объявить колонки для них. Однако, где это возможно, [пропустите пути](#using-type-hints-and-skipping-paths), которые не нужны, чтобы сэкономить как место для хранения, так и накладные расходы на вывод.
:::
## Обработка статических структур {#handling-static-structures}

Мы рекомендуем обрабатывать статические структуры с помощью именованных кортежей, т.е. `Tuple`. Массивы объектов могут храниться с использованием массивов кортежей, т.е. `Array(Tuple)`. Внутри самих кортежей колонки и их соответствующие типы должны определяться с использованием тех же правил. Это может привести к вложенным кортежам для представления вложенных объектов, как показано ниже.

Чтобы проиллюстрировать это, мы используем предыдущий пример JSON с личностью, пропуская динамические объекты:

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

Обратите внимание, как колонка `company` определена как `Tuple(catchPhrase String, name String)`. Ключ `address` использует `Array(Tuple)`, с вложенным `Tuple` для представления колонки `geo`.

JSON можно вставить в эту таблицу в текущей структуре:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}
```

В нашем приведенном выше примере у нас минимальные данные, но, как показано ниже, мы можем запрашивать кортежные колонки по их именам, разделенным точками.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

Обратите внимание, как колонка `address.street` возвращается как массив. Чтобы запросить конкретный объект внутри массива по позиции, индекс массива следует указать после имени колонки. Например, чтобы получить улицу из первого адреса:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Подколонки также могут использоваться в ключах сортировки из [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key):

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

Даже если объекты JSON структурированы, они часто являются разреженными, с тем, что представлены только подмножества известных ключей. К счастью, тип `Tuple` не требует, чтобы все колонки были в полезной нагрузке JSON. Если ключи не указаны, будут использоваться значения по умолчанию.

Рассмотрим нашу прежнюю таблицу `people` и следующий разреженный JSON, пропускающий ключи `suite`, `geo`, `phone_numbers` и `catchPhrase`.

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

Запрашивая эту одну строку, мы можем увидеть, что для колонок (включая под-объекты), которые были пропущены, используются значения по умолчанию:

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

:::note Различение пустого и нулевого
Если пользователи необходимо различать, является ли значение пустым и не предоставленным, можно использовать тип [Nullable](/sql-reference/data-types/nullable). Это [должно быть избегнуто](/best-practices/select-data-types#avoid-nullable-columns), если это абсолютно не требуется, так как это негативно скажется на хранении и производительности запросов для этих колонок.
:::
### Обработка новых колонок {#handling-new-columns}

Хотя структурированный подход является самым простым, когда ключи JSON статичны, этот подход все же может быть использован, если изменения в схеме могут быть запланированы, т.е. новые ключи известны заранее, и схема может быть изменена соответственно.

Обратите внимание, что ClickHouse по умолчанию будет игнорировать ключи JSON, которые присутствуют в полезной нагрузке и отсутствуют в схеме. Рассмотрим следующую измененную JSON-полезную нагрузку с добавлением ключа `nickname`:

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
    "catchPhrase": "Склад данных в реальном времени для аналитики"
  },
  "dob": "2007-03-31"
}
```

Эти JSON могут быть успешно вставлены с игнорированием ключа `nickname`:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Колонки могут быть добавлены к схеме с помощью команды [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column). Значение по умолчанию может быть указано через `DEFAULT`, которое будет использовано, если не будет указано во время последующих вставок. Строки, для которых это значение не присутствует (так как они были вставлены до его создания), также вернут это значение по умолчанию. Если значение по умолчанию не указано, будет использовано значение по умолчанию для типа.

Например:

```sql
-- вставка первоначальной строки (псевдоним будет проигнорирован)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики"},"dob":"2007-03-31"}

-- добавление колонки
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
## Обработка полу-структурированных/динамических структур {#handling-semi-structured-dynamic-structures}

<PrivatePreviewBadge/>

Если данные JSON имеют полу-структурированный вид, где ключи могут добавляться динамически и/или иметь несколько типов, рекомендуется использовать тип [`JSON`](/sql-reference/data-types/newjson).

Более конкретно, используйте тип JSON, когда ваши данные:

- Имеют **непредсказуемые ключи**, которые могут меняться со временем.
- Содержат **значения с различными типами** (например, путь может иногда содержать строку, иногда число).
- Требуют гибкости схемы, где строгая типизация нецелесообразна.
- У вас есть **сотни или даже тысячи** путей, которые статичны, но просто нереалистично объявлять явно. Это бывает редко.

Рассмотрим наш [предыдущий JSON с личностью](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определен как динамический.

Предположим, что `company.labels` содержит произвольные ключи. Кроме того, тип для любого ключа в этой структуре может быть непостоянным между строками. Например:

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
    "catchPhrase": "Склад данных в реальном времени для аналитики",
    "labels": {
      "type": "системы баз данных",
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
    "catchPhrase": "Упрощенная аналитика в масштабах",
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

Учитывая динамическую природу колонки `company.labels` между объектами, касающиеся ключей и типов, у нас есть несколько вариантов для моделирования этих данных:

- **Единая колонка JSON** - представляет всю схему как единую колонку `JSON`, позволяя всем структурам быть динамическими.
- **Целевая колонка JSON** - используйте тип `JSON` только для колонки `company.labels`, сохраняя структурированную схему, используемую выше, для всех остальных колонок.

Хотя первый подход [не соответствует предыдущей методологии](#static-vs-dynamic-json), подход с единой колонкой JSON полезен для прототипирования и задач по обработке данных.

Для производственных развертываний ClickHouse в масштабе мы рекомендуем быть конкретными со структурой и использовать тип JSON для целевых динамических подструктур, где это возможно.

Строгая схема имеет ряд преимуществ:

- **Валидация данных** – обеспечение строгой схемы избегает риска взрыва колонн, кроме специфических структур.
- **Избегает риска взрыва колонн** - Хотя тип JSON масштабируется до потенциально тысяч колонн, где подпункты хранятся как отдельные колонки, это может привести к взрыву файлов колонн, когда создается чрезмерное количество файлов колонн, что влияет на производительность. Для смягчения этого подлежащий [Динамический тип](/sql-reference/data-types/dynamic), используемый JSON, предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранящихся как отдельные файлы колонн. Как только порог достигается, дополнительные пути хранятся в общем файле колонн с использованием компактного закодированного формата, поддерживая производительность и эффективность хранения, при этом поддерживая гибкий прием данных. Однако доступ к этому общему файлу колонн не так оптимален. Однако стоит отметить, что колонка JSON может использоваться с [подсказками типов](#using-type-hints-and-skipping-paths). "Подсказанные" колонки будут обеспечивать такую же производительность, как и выделенные колонки.
- **Проще проанализировать пути и типы** - Хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для исследования, например, с помощью `DESCRIBE`.
### Единая колонка JSON {#single-json-column}

Этот подход полезен для прототипирования и задач по обработке данных. Для производства старайтесь использовать `JSON` только для динамических подструктур, где это необходимо.

:::note Учетные соображения производительности
Единую колонку JSON можно оптимизировать, пропуская (не сохраняя) пути JSON, которые не требуются, и используя [подсказки типов](#using-type-hints-and-skipping-paths). Подсказки типов позволяют пользователю явно определить тип для подпункта, избегая тем самым вывода и обработки косвенности во время выполнения запроса. Это может быть использовано для обеспечения такой же производительности, как если бы была использована явная схема. См. ["Использование подсказок типов и пропуск путей"](#using-type-hints-and-skipping-paths) для дальнейших подробностей.
:::

Схема для единой колонки JSON здесь проста:

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
Мы предоставляем [подсказку типа](#using-type-hints-and-skipping-paths) для колонки `username` в определении JSON, поскольку мы используем ее в ключе сортировки/первичном ключе. Это помогает ClickHouse понимать, что эта колонка не будет нулевой и гарантирует, что он знает, какую подколонку `username` использовать (так как их может быть несколько для каждого типа, поэтому это иначе не однозначно).
:::

Вставка строк в вышеупомянутую таблицу может быть выполнена с использованием формата `JSONAsObject`:

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"Склад данных в реальном времени для аналитики","labels":{"type":"системы баз данных","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Базы данных","holidays":[{"year":2024,"location":"Азорские острова, Португалия"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Упрощенная аналитика в масштабах","labels":{"type":["обработка в реальном времени"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Запуск симуляций","holidays":[{"year":2023,"location":"Киото, Япония"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.004 sec.
```


```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Упрощенная аналитика в масштабах","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["обработка в реальном времени"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Запуск симуляций","holidays":[{"location":"Киото, Япония","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"Склад данных в реальном времени для аналитики","labels":{"employees":"250","founded":"2021","type":"системы баз данных"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Базы данных","holidays":[{"location":"Азорские острова, Португалия","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.
```

Мы можем определить выведенные подпункты и их типы, используя [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions). Например:

```sql
SELECT JSONDynamicPathsWithTypes(json) as paths
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

Для получения полного списка функций интроспекции смотрите ["Функции интроспекции"](/sql-reference/data-types/newjson#introspection-functions).

[Подпути можно получить](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) с помощью нотации `.` например:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

Обратите внимание, что колонки, отсутствующие в строках, возвращаются как `NULL`.

Кроме того, для путей с одинаковым типом создается отдельная подколонка. Например, существует подколонка для `company.labels.type` как `String`, так и `Array(Nullable(String))`. Хотя обе будут возвращены, когда это возможно, мы можем нацелиться на конкретные подколонки, используя синтаксис `.:`:

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['обработка в реальном времени'] │
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

Для того, чтобы вернуть вложенные под-объекты, требуется `^`. Это выбор дизайна, чтобы избежать чтения большого числа колонн — если не запрашивается явно. Объекты, доступные без `^`, вернут `NULL`, как показано ниже:

```sql
-- подпункты по умолчанию не будут возвращены
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- вернуть подпункты, используя нотацию ^
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"системы баз данных"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["обработка в реальном времени"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```
### Целевая колонка JSON {#targeted-json-column}

Хотя это полезно при прототипировании и решении задач в области инженерии данных, мы рекомендуем использовать явную схему в производственных системах, где это возможно.

Наш предыдущий пример можно смоделировать с помощью одной колонки `JSON` для колонки `company.labels`.

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

[Функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) могут быть использованы для определения выведенных путей и типов для колонки `company.labels`.

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

Подсказки типов позволяют нам указывать тип для пути и его подколонки, предотвращая ненужный вывод типов. Рассмотрим следующий пример, где мы указываем типы для ключей JSON `dissolved`, `employees` и `founded` внутри колонки JSON `company.labels`.

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

Обратите внимание, как теперь эти колонки имеют наши явные типы:

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

Дополнительно мы можем пропускать пути в JSON, которые не хотим сохранять, с помощью параметров [`SKIP` и `SKIP REGEXP`](/sql-reference/data-types/newjson), чтобы минимизировать объем хранимых данных и избежать ненужного вывода на не нужных путях. Например, предположим, что мы используем одну колонку JSON для данных выше. Мы можем пропустить пути `address` и `company`:

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

Обратите внимание, как наши колонки были исключены из данных:

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

Подсказки типов предлагают больше, чем просто способ избежать ненужного вывода типов — они полностью устраняют косвенные обращения к памяти и процессору, а также позволяют указывать [оптимальные примитивные типы](/data-modeling/schema-design#optimizing-types). JSON пути с подсказками типов всегда хранятся так же, как традиционные колонки, обходя необходимость в [**столбцах-дискриминаторах**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) или динамическом разрешении во время выполнения запросов.

Это значит, что при хорошо определенных подсказках типов, вложенные JSON ключи достигают той же производительности и эффективности, как если бы они изначально моделировались как колонки верхнего уровня.

В результате, для наборов данных, которые в основном последовательны, но все же выигрывают от гибкости JSON, подсказки типов предоставляют удобный способ сохранить производительность без необходимости перестраивать свою схему или конвейер приема данных.
### Настройка динамических путей {#configuring-dynamic-paths}

ClickHouse хранит каждый JSON путь как подколонку в истинной колонной раскладке, что позволяет получить те же преимущества производительности, которые наблюдаются с традиционными колонками, такие как сжатие, обработка с ускорением SIMD и минимальный ввод-вывод диска. Каждая уникальная комбинация пути и типа в ваших JSON данных может стать своим собственным файловым столбцом на диске.

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

Например, когда два JSON пути вставляются с различающимися типами, ClickHouse хранит значения каждого [конкретного типа в отдельных подколонках](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data). Эти подколонки могут быть доступны независимо, минимизируя ненужный ввод-вывод. Обратите внимание, что при запросе колонки с несколькими типами, ее значения все равно возвращаются как единый колонный ответ.

Кроме того, используя смещения, ClickHouse обеспечивает, чтобы эти подколонки оставались плотными, без хранения значений по умолчанию для отсутствующих JSON путей. Этот подход максимизирует сжатие и дополнительно снижает ввод-вывод.

<Image img={json_offsets} size="md" alt="JSON offsets" />

Однако в сценариях с высокой кардинальностью или сильно изменчивыми структурами JSON — такими как телеметрические конвейеры, логи или хранилища функций машинного обучения — это поведение может привести к взрыву файлов столбцов. Каждый новый уникальный JSON путь приводит к созданию нового файла столбца, и каждый вариант типа под этим путем результирует в дополнительном файлов столбце. Хотя это оптимально для производительности чтения, это создает операционные проблемы: исчерпание дескрипторов файлов, увеличение использования памяти и замедленные слияния из-за большого количества мелких файлов.

Чтобы смягчить это, ClickHouse вводит концепцию подколонки переполнения: как только количество уникальных JSON путей превышает порог, дополнительные пути хранятся в одном общем файле с использованием компактного закодированного формата. Этот файл все еще подлежит запросам, но не имеет тех же характеристик производительности, что и специальные подколонки.

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

**Избегайте установки этого параметра слишком высоким** — большие значения увеличивают потребление ресурсов и снижают эффективность. В качестве правила, держите его ниже 10,000. Для рабочих нагрузок с высокодинамичными структурами используйте подсказки типов и параметры `SKIP`, чтобы ограничить то, что сохраняется.

Для заинтересованных пользователей в реализации этого нового типа столбца мы рекомендуем ознакомиться с нашей детальной статьей ["Новый мощный тип данных JSON для ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse).
