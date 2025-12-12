---
description: 'Документация по функциям для работы со встроенными словарями'
sidebar_label: 'Встроенный словарь'
slug: /sql-reference/functions/ym-dict-functions
title: 'Функции для работы со встроенными словарями'
doc_type: 'reference'
---

# Функции для работы со встроенными словарями {#functions-for-working-with-embedded-dictionaries}

:::note
Чтобы функции, перечисленные ниже, работали, в конфигурации сервера должны быть указаны пути и адреса для получения всех встроенных словарей. Словари загружаются при первом вызове любой из этих функций. Если справочные списки не удаётся загрузить, генерируется исключение.

Таким образом, примеры, приведённые в этом разделе, по умолчанию будут приводить к исключению в [ClickHouse Fiddle](https://fiddle.clickhouse.com/), а также в быстрых и продукционных развертываниях, если предварительно не выполнить настройку.
:::

Сведения о создании справочных списков см. в разделе [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries).

## Несколько геобаз {#multiple-geobases}

ClickHouse поддерживает одновременную работу с несколькими альтернативными геобазами (региональными иерархиями), чтобы учитывать различные представления о том, к каким странам относятся те или иные регионы.

Конфигурация `clickhouse-server` задаёт файл с региональной иерархией:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

Помимо этого файла, также выполняется поиск файлов в той же директории, в имени которых к основному имени (перед расширением файла) добавлен символ `_` и любой суффикс.
Например, при наличии будет найден и файл `/opt/geo/regions_hierarchy_ua.txt`. Здесь `ua` называется ключом словаря. Для словаря без суффикса ключом является пустая строка.

Все словари перезагружаются во время работы (один раз в заданное количество секунд, определяемое параметром конфигурации [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval), или один раз в час по умолчанию). Однако список доступных словарей задаётся один раз — при запуске сервера.

Все функции для работы с регионами имеют в конце необязательный аргумент — ключ словаря. Он называется геобазой.

Пример:

```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```

### regionToName {#regiontoname}

Принимает идентификатор региона и геобазу данных и возвращает строку с названием региона на соответствующем языке. Если региона с указанным идентификатором не существует, возвращается пустая строка.

**Синтаксис**

```

### regionToName {#regiontoname}

Accepts a region ID and geobase and returns a string of the name of the region in the corresponding language. If the region with the specified ID does not exist, an empty string is returned.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона в геобазе. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Название региона на соответствующем языке, указанном в `geobase`. [String](../data-types/string).
* В противном случае — пустая строка.

**Пример**

Запрос:

```
**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Name of the region in the corresponding language specified by `geobase`. [String](../data-types/string).
- Otherwise, an empty string. 

**Example**

Query:

```

Результат:

```

Result:

```

### regionToCity {#regiontocity}

Принимает идентификатор региона из геобазы. Если этот регион является городом или частью города, функция возвращает идентификатор региона соответствующего города. В противном случае возвращает 0.

**Синтаксис**

```

### regionToCity {#regiontocity}

Accepts a region ID from the geobase. If this region is a city or part of a city, it returns the region ID for the appropriate city. Otherwise, returns 0.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* идентификатор региона для соответствующего города, если он существует. [UInt32](../data-types/int-uint).
* 0, если такого нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate city, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToArea {#regiontoarea}

Преобразует регион в область (тип 5 в геобазе). Во всём остальном эта функция аналогична функции [&#39;regionToCity&#39;](#regiontocity).

**Синтаксис**

```

### regionToArea {#regiontoarea}

Converts a region to an area (type 5 in the geobase). In every other way, this function is the same as ['regionToCity'](#regiontocity).

**Syntax**

```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор региона для соответствующей области, если он существует. [UInt32](../data-types/int-uint).
* 0, если такого нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate area, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToDistrict {#regiontodistrict}

Преобразует регион в федеральный округ (тип 4 в геобазе). Во всём остальном эта функция аналогична `regionToCity`.

**Синтаксис**

```

### regionToDistrict {#regiontodistrict}

Converts a region to a federal district (type 4 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* идентификатор региона для соответствующего города, если такой регион существует. [UInt32](../data-types/int-uint).
* 0, если такого региона нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate city, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToCountry {#regiontocountry}

Преобразует регион в страну (тип 3 в геобазе). Во всём остальном эта функция аналогична `regionToCity`.

**Синтаксис**

```

### regionToCountry {#regiontocountry}

Converts a region to a country (type 3 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**Параметры**

* `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* ID региона для соответствующей страны, если такой регион существует. [UInt32](../data-types/int-uint).
* 0, если его нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate country, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToContinent {#regiontocontinent}

Преобразует регион в континент (тип 1 в geobase). В остальном эта функция аналогична функции &#39;regionToCity&#39;.

**Синтаксис**

```

### regionToContinent {#regiontocontinent}

Converts a region to a continent (type 1 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор региона соответствующего континента, если он существует. [UInt32](../data-types/int-uint).
* 0, если такого региона нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Region ID for the appropriate continent, if it exists. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToTopContinent {#regiontotopcontinent}

Находит континент верхнего уровня в иерархии для региона.

**Синтаксис**

```

### regionToTopContinent {#regiontotopcontinent}

Finds the highest continent in the hierarchy for the region.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор континента верхнего уровня (континента, который получается при подъёме по иерархии регионов). [UInt32](../data-types/int-uint).
* 0, если такого нет.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Identifier of the top level continent (the latter when you climb the hierarchy of regions).[UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionToPopulation {#regiontopopulation}

Возвращает численность населения для региона. Данные о населении могут храниться в файлах geobase. См. раздел [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries). Если численность населения для региона не указана, функция возвращает 0. В geobase численность населения может быть указана для дочерних регионов, но не для родительских.

**Синтаксис**

```

### regionToPopulation {#regiontopopulation}

Gets the population for a region. The population can be recorded in files with the geobase. See the section ["Dictionaries"](../dictionaries#embedded-dictionaries). If the population is not recorded for the region, it returns 0. In the geobase, the population might be recorded for child regions, but not for parent regions.

**Syntax**

```

**Параметры**

* `id` — идентификатор региона в геобазе. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Численность населения региона. [UInt32](../data-types/int-uint).
* 0, если оно отсутствует.

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Population for the region. [UInt32](../data-types/int-uint).
- 0, if there is none.

**Example**

Query:

```

Результат:

```

Result:

```

### regionIn {#regionin}

Проверяет, принадлежит ли регион `lhs` региону `rhs`. Возвращает число типа UInt8, равное 1, если принадлежит, и 0 — если не принадлежит.

**Синтаксис**

```

### regionIn {#regionin}

Checks whether a `lhs` region belongs to a `rhs` region. Returns a UInt8 number equal to 1 if it belongs, or 0 if it does not belong.

**Syntax**

```

**Параметры**

* `lhs` — ID левого региона из геобазы. [UInt32](../data-types/int-uint).
* `rhs` — ID правого региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* 1, если принадлежит. [UInt8](../data-types/int-uint).
* 0, если не принадлежит.

**Подробности реализации**

Отношение рефлексивно — любой регион также принадлежит самому себе.

**Пример**

Запрос:

```

**Parameters**

- `lhs` — Lhs region ID from the geobase. [UInt32](../data-types/int-uint).
- `rhs` — Rhs region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- 1, if it belongs. [UInt8](../data-types/int-uint).
- 0, if it doesn't belong.

**Implementation details**

The relationship is reflexive – any region also belongs to itself.

**Example**

Query:

```

Результат:

```

Result:

```

### regionHierarchy {#regionhierarchy}

Принимает число типа UInt32 — идентификатор региона из геобазы. Возвращает массив идентификаторов регионов, включающий переданный регион и всех его родительских регионов по цепочке.

**Синтаксис**

```

### regionHierarchy {#regionhierarchy}

Accepts a UInt32 number – the region ID from the geobase. Returns an array of region IDs consisting of the passed region and all parents along the chain.

**Syntax**

```

**Параметры**

* `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Массив ID регионов, состоящий из переданного региона и всех родительских регионов по иерархии. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Пример**

Запрос:

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Array of region IDs consisting of the passed region and all parents along the chain. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Example**

Query:

```

Результат:

```

Result:

```

{/* 
  Внутреннее содержимое тегов ниже заменяется в процессе сборки фреймворка документации
  документами, сгенерированными из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
