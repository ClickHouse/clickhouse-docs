---
description: 'Документация по функциям для работы со встроенными словарями'
sidebar_label: 'Встроенный словарь'
slug: /sql-reference/functions/ym-dict-functions
title: 'Функции для работы со встроенными словарями'
doc_type: 'reference'
---



# Функции для работы со встроенными словарями

:::note
Чтобы функции, перечисленные ниже, работали, в конфигурации сервера должны быть указаны пути и адреса, по которым доступны все встроенные словари. Словари загружаются при первом обращении к любой из этих функций. Если справочники не удаётся загрузить, выбрасывается исключение.

Таким образом, примеры, показанные в этом разделе, по умолчанию будут приводить к исключению в [ClickHouse Fiddle](https://fiddle.clickhouse.com/), а также в средах быстрого и промышленного развёртывания, если их предварительно не настроить.
:::

Информацию о создании справочников см. в разделе ["Словари"](../dictionaries#embedded-dictionaries).



## Множественные геобазы {#multiple-geobases}

ClickHouse поддерживает одновременную работу с несколькими альтернативными геобазами (региональными иерархиями) для обеспечения различных представлений о принадлежности регионов к странам.

Конфигурация 'clickhouse-server' указывает файл с региональной иерархией:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

Помимо этого файла, также выполняется поиск соседних файлов, имеющих символ `_` и произвольный суффикс, добавленный к имени (перед расширением файла).
Например, будет найден файл `/opt/geo/regions_hierarchy_ua.txt`, если он присутствует. Здесь `ua` называется ключом словаря. Для словаря без суффикса ключ представляет собой пустую строку.

Все словари перезагружаются во время работы (с периодичностью, определенной в параметре конфигурации [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval), или раз в час по умолчанию). Однако список доступных словарей определяется однократно при запуске сервера.

Все функции для работы с регионами имеют необязательный аргумент в конце — ключ словаря. Он называется геобазой.

Пример:

```sql
regionToCountry(RegionID) – Использует словарь по умолчанию: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Использует словарь по умолчанию: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Использует словарь для ключа 'ua': /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

Принимает идентификатор региона и геобазу, возвращает строку с названием региона на соответствующем языке. Если регион с указанным идентификатором не существует, возвращается пустая строка.

**Синтаксис**

```sql
regionToName(id\[, lang\])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Название региона на соответствующем языке, указанном в `geobase`. [String](../data-types/string).
- В противном случае — пустая строка.

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

Принимает идентификатор региона из геобазы. Если этот регион является городом или частью города, возвращает идентификатор региона для соответствующего города. В противном случае возвращает 0.

**Синтаксис**

```sql
regionToCity(id [, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный.

**Возвращаемое значение**

- Идентификатор региона для соответствующего города, если он существует. [UInt32](../data-types/int-uint).
- 0, если такового нет.

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

Преобразует регион в область (тип 5 в геобазе). Во всех остальных отношениях эта функция идентична ['regionToCity'](#regiontocity).

**Синтаксис**

```sql
regionToArea(id [, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Идентификатор региона для соответствующей области, если она существует. [UInt32](../data-types/int-uint).
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
│ Москва и Московская область                          │
│ Санкт-Петербург и Ленинградская область              │
│ Белгородская область                                 │
│ Ивановская область                                   │
│ Калужская область                                    │
│ Костромская область                                  │
│ Курская область                                      │
│ Липецкая область                                     │
│ Орловская область                                    │
│ Рязанская область                                    │
│ Смоленская область                                   │
│ Тамбовская область                                   │
│ Тверская область                                     │
│ Тульская область                                     │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

Преобразует регион в федеральный округ (тип 4 в геобазе). Во всех остальных отношениях эта функция идентична 'regionToCity'.

**Синтаксис**

```sql
regionToDistrict(id [, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Идентификатор региона для соответствующего города, если он существует. [UInt32](../data-types/int-uint).
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
│ Центральный федеральный округ                            │
│ Северо-Западный федеральный округ                        │
│ Южный федеральный округ                                  │
│ Северо-Кавказский федеральный округ                      │
│ Приволжский федеральный округ                            │
│ Уральский федеральный округ                              │
│ Сибирский федеральный округ                              │
│ Дальневосточный федеральный округ                        │
│ Шотландия                                                │
│ Фарерские острова                                        │
│ Фламандский регион                                       │
│ Брюссельский столичный регион                            │
│ Валлония                                                 │
│ Федерация Боснии и Герцеговины                           │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

Преобразует регион в страну (тип 3 в геобазе). Во всех остальных отношениях эта функция идентична 'regionToCity'.

**Синтаксис**

```sql
regionToCountry(id [, geobase])
```

**Параметры**


- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Идентификатор региона соответствующей страны, если она существует. [UInt32](../data-types/int-uint).
- 0, если страна не найдена.

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

Преобразует регион в континент (тип 1 в геобазе). Во всех остальных аспектах эта функция аналогична `regionToCity`.

**Синтаксис**

```sql
regionToContinent(id [, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Идентификатор региона соответствующего континента, если он существует. [UInt32](../data-types/int-uint).
- 0, если континент не найден.

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

Находит континент верхнего уровня в иерархии для региона.

**Синтаксис**

```sql
regionToTopContinent(id[, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Идентификатор континента верхнего уровня (последний при подъёме по иерархии регионов). [UInt32](../data-types/int-uint).
- 0, если континент не найден.

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

Возвращает численность населения региона. Численность населения может быть записана в файлах геобазы. См. раздел [«Словари»](../dictionaries#embedded-dictionaries). Если численность населения для региона не записана, возвращается 0. В геобазе численность населения может быть записана для дочерних регионов, но не для родительских.

**Синтаксис**

```sql
regionToPopulation(id[, geobase])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Численность населения региона. [UInt32](../data-types/int-uint).
- 0, если данные отсутствуют.

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

Проверяет, принадлежит ли регион `lhs` региону `rhs`. Возвращает число типа UInt8, равное 1, если принадлежит, или 0, если не принадлежит.

**Синтаксис**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**Параметры**

- `lhs` — идентификатор левого региона из геобазы. [UInt32](../data-types/int-uint).
- `rhs` — идентификатор правого региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- 1, если принадлежит. [UInt8](../data-types/int-uint).
- 0, если не принадлежит.

**Детали реализации**

Отношение рефлексивно — любой регион принадлежит самому себе.

**Пример**

Запрос:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

Результат:


```text
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

Принимает число UInt32 — идентификатор региона из геобазы. Возвращает массив идентификаторов регионов, состоящий из переданного региона и всех родительских регионов в иерархии.

**Синтаксис**

```sql
regionHierarchy(id\[, geobase\])
```

**Параметры**

- `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
- `geobase` — ключ словаря. См. [Множественные геобазы](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

- Массив идентификаторов регионов, состоящий из переданного региона и всех родительских регионов в иерархии. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

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
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
