---
'description': 'Документация для Функции для работы с встроенными словарями'
'sidebar_label': 'Встроенный словарь'
'slug': '/sql-reference/functions/ym-dict-functions'
'title': 'Функции для работы с встроенными словарями'
'doc_type': 'reference'
---
# Функции для работы с встроенными словарями

:::note
Для работы функций, приведённых ниже, конфигурация сервера должна указывать пути и адреса для получения всех встроенных словарей. Словари загружаются при первом вызове любой из этих функций. Если справочные списки не могут быть загружены, выдается исключение.

Таким образом, примеры, показанные в этом разделе, будут вызывать исключение в [ClickHouse Fiddle](https://fiddle.clickhouse.com/) и в быстрых релизах и производственных развертываниях по умолчанию, если не будут предварительно настроены.
:::

Для получения информации о создании справочных списков см. раздел ["Словари"](../dictionaries#embedded-dictionaries).

## Несколько геобаз {#multiple-geobases}

ClickHouse поддерживает работу с несколькими альтернативными геобазами (региональными иерархиями) одновременно, чтобы поддерживать различные перспективы по принадлежности определенных регионов к странам.

Конфигурация 'clickhouse-server' указывает файл с региональной иерархией:

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

Принимает ID региона и геобазу и возвращает строку с названием региона на соответствующем языке. Если региона с указанным ID не существует, возвращается пустая строка.

**Синтаксис**

```sql
regionToName(id\[, lang\])
```
**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Название региона на соответствующем языке, указанном в `geobase`. [String](../data-types/string).
- В противном случае - пустая строка.

**Пример**

Запрос:

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

Результат:

```text
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

Преобразует регион в область (тип 5 в геобазе). Во всех других отношениях эта функция такая же, как и ['regionToCity'](#regiontocity).

**Синтаксис**

```sql
regionToArea(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующей области, если она существует. [UInt32](../data-types/int-uint).
- 0, если её нет.

**Пример**

Запрос:

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Результат:

```text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ Moscow and Moscow region                             │
│ St. Petersburg and Leningrad region                  │
│ Belgorod region                                      │
│ Ivanovsk region                                      │
│ Kaluga region                                        │
│ Kostroma region                                      │
│ Kursk region                                         │
│ Lipetsk region                                       │
│ Orlov region                                         │
│ Ryazan region                                        │
│ Smolensk region                                      │
│ Tambov region                                        │
│ Tver region                                          │
│ Tula region                                          │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

Преобразует регион в федеральный округ (тип 4 в геобазе). Во всех других отношениях эта функция такая же, как 'regionToCity'.

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

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

Результат:

```text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ Central federal district                                 │
│ Northwest federal district                               │
│ South federal district                                   │
│ North Caucases federal district                          │
│ Privolga federal district                                │
│ Ural federal district                                    │
│ Siberian federal district                                │
│ Far East federal district                                │
│ Scotland                                                 │
│ Faroe Islands                                            │
│ Flemish region                                           │
│ Brussels capital region                                  │
│ Wallonia                                                 │
│ Federation of Bosnia and Herzegovina                     │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

Преобразует регион в страну (тип 3 в геобазе). Во всех других отношениях эта функция такая же, как 'regionToCity'.

**Синтаксис**

```sql
regionToCountry(id [, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- ID региона для соответствующей страны, если она существует. [UInt32](../data-types/int-uint).
- 0, если её нет.

**Пример**

Запрос:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

```text
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

Преобразует регион в континент (тип 1 в геобазе). Во всех других отношениях эта функция такая же, как 'regionToCity'.

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

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ World                                      │  0 │                                                               │
│ USA                                        │ 10 │ North America                                                 │
│ Colorado                                   │ 10 │ North America                                                 │
│ Boulder County                             │ 10 │ North America                                                 │
│ Boulder                                    │ 10 │ North America                                                 │
│ China                                      │ 12 │ Asia                                                          │
│ Sichuan                                    │ 12 │ Asia                                                          │
│ Chengdu                                    │ 12 │ Asia                                                          │
│ America                                    │  9 │ America                                                       │
│ North America                              │ 10 │ North America                                                 │
│ Eurasia                                    │ 11 │ Eurasia                                                       │
│ Asia                                       │ 12 │ Asia                                                          │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

Находит самый высокий континент в иерархии для региона.

**Синтаксис**

```sql
regionToTopContinent(id[, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Идентификатор континента верхнего уровня (последний, когда поднимаешься по иерархии регионов). [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ World                                      │  0 │                                                                  │
│ USA                                        │  9 │ America                                                          │
│ Colorado                                   │  9 │ America                                                          │
│ Boulder County                             │  9 │ America                                                          │
│ Boulder                                    │  9 │ America                                                          │
│ China                                      │ 11 │ Eurasia                                                          │
│ Sichuan                                    │ 11 │ Eurasia                                                          │
│ Chengdu                                    │ 11 │ Eurasia                                                          │
│ America                                    │  9 │ America                                                          │
│ North America                              │  9 │ America                                                          │
│ Eurasia                                    │ 11 │ Eurasia                                                          │
│ Asia                                       │ 11 │ Eurasia                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

Получает население региона. Население может быть записано в файлах с геобазой. См. раздел ["Словари"](../dictionaries#embedded-dictionaries). Если население не записано для региона, возвращает 0. В геобазе население может быть записано для дочерних регионов, но не для родительских регионов.

**Синтаксис**

```sql
regionToPopulation(id[, geobase])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Население региона. [UInt32](../data-types/int-uint).
- 0, если его нет.

**Пример**

Запрос:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

Результат:

```text
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

Проверяет, принадлежит ли регион `lhs`.region региону `rhs`. Возвращает число UInt8, равное 1, если принадлежит, или 0, если не принадлежит.

**Синтаксис**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**Параметры**

- `lhs` — ID региона lhs из геобазы. [UInt32](../data-types/int-uint).
- `rhs` — ID региона rhs из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- 1, если принадлежит. [UInt8](../data-types/int-uint).
- 0, если не принадлежит.

**Подробности реализации**

Отношение рефлексивно – любой регион также принадлежит самому себе.

**Пример**

Запрос:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

Результат:

```text
World is in World
World is not in USA
World is not in Colorado
World is not in Boulder County
World is not in Boulder
USA is in World
USA is in USA
USA is not in Colorado
USA is not in Boulder County
USA is not in Boulder    
```

### regionHierarchy {#regionhierarchy}

Принимает число UInt32 – ID региона из геобазы. Возвращает массив ID регионов, состоящий из переданного региона и всех родителей вдоль цепочки.

**Синтаксис**

```sql
regionHierarchy(id\[, geobase\])
```

**Параметры**

- `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Массив ID регионов, состоящий из переданного региона и всех родителей вдоль цепочки. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Пример**

Запрос:

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

Результат:

```text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
Содержимое внутри тегов ниже заменяется при сборке документа на системы документации 
документов, сгенерированных из system.functions. Пожалуйста, не изменяйте и не удаляйте теги.
См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->