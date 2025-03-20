---
slug: /sql-reference/functions/ym-dict-functions
sidebar_position: 60
sidebar_label: Встроенные словари
---


# Функции для работы с встроенными словарями

:::note
Для корректной работы приведенных ниже функций конфигурация сервера должна указывать пути и адреса для получения всех встроенных словарей. Словари загружаются при первом вызове любой из этих функций. Если референсные списки не могут быть загружены, выбрасывается исключение.

Таким образом, примеры, приведенные в этом разделе, вызовут исключение в [ClickHouse Fiddle](https://fiddle.clickhouse.com/) и в быстром релизе и продуктивных развертываниях по умолчанию, если сначала не настроены.
:::

Для получения информации о создании референсных списков, см. раздел ["Словари"](../dictionaries#embedded-dictionaries).

## Несколько геобаз {#multiple-geobases}

ClickHouse поддерживает работу с несколькими альтернативными геобазами (региональными иерархиями) одновременно, чтобы поддерживать различные представления о том, к каким странам принадлежат определенные регионы.

Конфигурация 'clickhouse-server' указывает файл с региональной иерархией:

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

Кроме этого файла, она также ищет близлежащие файлы, которые содержат символ `_` и любой суффикс, добавленный к имени (до расширения файла).
Например, будет найден файл `/opt/geo/regions_hierarchy_ua.txt`, если он присутствует. Здесь `ua` называется ключом словаря. Для словаря без суффикса ключ — это пустая строка.

Все словари перезагружаются во время выполнения (раз в определенное количество секунд, как определено в параметре конфигурации [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval), или раз в час по умолчанию). Тем не менее, список доступных словарей определяется один раз, когда сервер запускается.

Все функции для работы с регионами имеют необязательный аргумент в конце — ключ словаря. Он называется геобазой.

Пример:

``` sql
regionToCountry(RegionID) – Использует словарь по умолчанию: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Использует словарь по умолчанию: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Использует словарь для ключа 'ua': /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

Принимает ID региона и геобазу и возвращает строку с названием региона на соответствующем языке. Если регион с указанным ID не существует, возвращается пустая строка.

**Синтаксис**

``` sql
regionToName(id\[, lang\])
```
**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Название региона на соответствующем языке, указанном `geobase`. [String](../data-types/string).
- В противном случае — пустая строка.

**Пример**

Запрос:

``` sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

Результат:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ World                                      │
│ USA                                        │
│ Colorado                                   │
│ Boulder County                             │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

Принимает ID региона из геобазы. Если этот регион является городом или частью города, возвращает ID региона для соответствующего города. В противном случае возвращает 0.

**Синтаксис**

```sql
regionToCity(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующего города, если он существует. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

```response
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCity(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                          │
│ World                                      │  0 │                                                          │
│ USA                                        │  0 │                                                          │
│ Colorado                                   │  0 │                                                          │
│ Boulder County                             │  0 │                                                          │
│ Boulder                                    │  5 │ Boulder                                                  │
│ China                                      │  0 │                                                          │
│ Sichuan                                    │  0 │                                                          │
│ Chengdu                                    │  8 │ Chengdu                                                  │
│ America                                    │  0 │                                                          │
│ North America                              │  0 │                                                          │
│ Eurasia                                    │  0 │                                                          │
│ Asia                                       │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

Преобразует регион в область (тип 5 в геобазе). Во всем остальном эта функция такая же, как ['regionToCity'](#regiontocity).

**Синтаксис**

```sql
regionToArea(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующей области, если он существует. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Результат:

``` text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ Москва и Московская область                           │
│ Санкт-Петербург и Ленинградская область              │
│ Белгородская область                                  │
│ Ивановская область                                    │
│ Калужская область                                     │
│ Костромская область                                   │
│ Курская область                                      │
│ Липецкая область                                     │
│ Орловская область                                     │
│ Рязанская область                                     │
│ Смоленская область                                    │
│ Тамбовская область                                    │
│ Тверская область                                      │
│ Тульская область                                      │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

Преобразует регион в федеральный округ (тип 4 в геобазе). Во всем остальном эта функция такая же, как 'regionToCity'.

**Синтаксис**

```sql
regionToDistrict(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующего округа, если он существует. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Результат:

``` text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ Центральный федеральный округ                             │
│ Северо-западный федеральный округ                       │
│ Южный федеральный округ                                  │
│ Северо-Кавказский федеральный округ                     │
│ Приволжский федеральный округ                           │
│ Уральский федеральный округ                              │
│ Сибирский федеральный округ                              │
│ Дальневосточный федеральный округ                        │
│ Шотландия                                               │
│ Фарерские острова                                      │
│ Фламандский регион                                      │
│ Регион столицы Брюсселя                                │
│ Валлония                                               │
│ Федерация Боснии и Герцеговины                          │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

Преобразует регион в страну (тип 3 в геобазе). Во всем остальном эта функция такая же, как 'regionToCity'.

**Синтаксис**

```sql
regionToCountry(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующей страны, если он существует. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ World                                      │  0 │                                                             │
│ USA                                        │  2 │ USA                                                         │
│ Colorado                                   │  2 │ USA                                                         │
│ Boulder County                             │  2 │ USA                                                         │
│ Boulder                                    │  2 │ USA                                                         │
│ China                                      │  6 │ China                                                       │
│ Sichuan                                    │  6 │ China                                                       │
│ Chengdu                                    │  6 │ China                                                       │
│ America                                    │  0 │                                                             │
│ North America                              │  0 │                                                             │
│ Eurasia                                    │  0 │                                                             │
│ Asia                                       │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

Преобразует регион в континент (тип 1 в геобазе). Во всем остальном эта функция такая же, как 'regionToCity'.

**Синтаксис**

```sql
regionToContinent(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующего континента, если он существует. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ World                                      │  0 │                                                               │
│ USA                                        │ 10 │ Северная Америка                                             │
│ Colorado                                   │ 10 │ Северная Америка                                             │
│ Boulder County                             │ 10 │ Северная Америка                                             │
│ Boulder                                    │ 10 │ Северная Америка                                             │
│ China                                      │ 12 │ Азия                                                        │
│ Sichuan                                    │ 12 │ Азия                                                        │
│ Chengdu                                    │ 12 │ Азия                                                        │
│ America                                    │  9 │ Америка                                                     │
│ North America                              │ 10 │ Северная Америка                                             │
│ Eurasia                                    │ 11 │ Евразия                                                    │
│ Asia                                       │ 12 │ Азия                                                        │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

Находит самый высокий континент в иерархии для региона.

**Синтаксис**

``` sql
regionToTopContinent(id[, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Идентификатор континента верхнего уровня (последнего, когда вы поднимаетесь по иерархии регионов). [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ World                                      │  0 │                                                                  │
│ USA                                        │  9 │ Америка                                                          │
│ Colorado                                   │  9 │ Америка                                                          │
│ Boulder County                             │  9 │ Америка                                                          │
│ Boulder                                    │  9 │ Америка                                                          │
│ China                                      │ 11 │ Евразия                                                          │
│ Sichuan                                    │ 11 │ Евразия                                                          │
│ Chengdu                                    │ 11 │ Евразия                                                          │
│ America                                    │  9 │ Америка                                                          │
│ North America                              │  9 │ Америка                                                          │
│ Eurasia                                    │ 11 │ Евразия                                                          │
│ Asia                                       │ 11 │ Евразия                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

Получает население для региона. Население может быть зафиксировано в файлах с геобазой. См. раздел ["Словари"](../dictionaries#embedded-dictionaries). Если население не зафиксировано для региона, возвращает 0. В геобазе население может быть зафиксировано для дочерних регионов, но не для родительских регионов.

**Синтаксис**

``` sql
regionToPopulation(id[, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Население для региона. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ World                                      │ 4294967295 │
│ USA                                        │  330000000 │
│ Colorado                                   │    5700000 │
│ Boulder County                             │     330000 │
│ Boulder                                    │     100000 │
│ China                                      │ 1500000000 │
│ Sichuan                                    │   83000000 │
│ Chengdu                                    │   20000000 │
│ America                                    │ 1000000000 │
│ North America                              │  600000000 │
│ Eurasia                                    │ 4294967295 │
│ Asia                                       │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

Проверяет, принадлежит ли `lhs` регион к `rhs` региону. Возвращает число UInt8, равное 1, если принадлежит, или 0, если не принадлежит.

**Синтаксис**

``` sql
regionIn(lhs, rhs\[, geobase\])
```

**Параметры**

- `lhs` — ID региона lhs из геобазы. [UInt32](../data-types/int-uint).
- `rhs` — ID региона rhs из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- 1, если принадлежит. [UInt8](../data-types/int-uint).
- 0, если не принадлежит.

**Детали реализации**

Отношение является рефлексивным — любой регион также принадлежит самому себе.

**Пример**

Запрос:

``` sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' находится в ' : ' не находится в ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

Результат:

``` text
World находится в World
World не находится в USA
World не находится в Colorado
World не находится в Boulder County
World не находится в Boulder
USA находится в World
USA находится в USA
USA не находится в Colorado
USA не находится в Boulder County
USA не находится в Boulder    
```

### regionHierarchy {#regionhierarchy}

Принимает число UInt32 — ID региона из геобазы. Возвращает массив ID регионов, состоящий из переданного региона и всех предков вдоль цепочки.

**Синтаксис**

``` sql
regionHierarchy(id\[, geobase\])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Массив ID регионов, состоящий из переданного региона и всех предков вдоль цепочки. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Пример**

Запрос:

``` sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

Результат:

``` text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```
