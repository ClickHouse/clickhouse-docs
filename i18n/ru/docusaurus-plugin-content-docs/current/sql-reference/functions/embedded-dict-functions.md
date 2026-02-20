---
description: 'Документация по функциям для работы со встроенными словарями'
sidebar_label: 'Встроенный словарь'
slug: /sql-reference/functions/ym-dict-functions
title: 'Функции для работы со встроенными словарями'
doc_type: 'reference'
---

# Функции для работы со встроенными словарями \{#functions-for-working-with-embedded-dictionaries\}

:::note
Чтобы функции, перечисленные ниже, работали, в конфигурации сервера должны быть указаны пути и адреса для получения всех встроенных словарей. Словари загружаются при первом вызове любой из этих функций. Если справочные списки не удаётся загрузить, генерируется исключение.

Таким образом, примеры, приведённые в этом разделе, по умолчанию будут приводить к исключению в [ClickHouse Fiddle](https://fiddle.clickhouse.com/), а также в быстрых и продукционных развертываниях, если предварительно не выполнить настройку.
:::

Сведения о создании справочных списков см. в разделе [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded#embedded-dictionaries).

## Несколько геобаз \{#multiple-geobases\}

ClickHouse поддерживает одновременную работу с несколькими альтернативными геобазами (региональными иерархиями), чтобы учитывать различные представления о том, к каким странам относятся те или иные регионы.

Конфигурация `clickhouse-server` задаёт файл с региональной иерархией:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

Помимо этого файла, также выполняется поиск файлов в той же директории, в имени которых к основному имени (перед расширением файла) добавлен символ `_` и любой суффикс.
Например, при наличии будет найден и файл `/opt/geo/regions_hierarchy_ua.txt`. Здесь `ua` называется ключом словаря. Для словаря без суффикса ключом является пустая строка.

Все словари перезагружаются во время работы (один раз в заданное количество секунд, определяемое параметром конфигурации [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval), или один раз в час по умолчанию). Однако список доступных словарей задаётся один раз — при запуске сервера.

Все функции для работы с регионами имеют в конце необязательный аргумент — ключ словаря. Он называется геобазой.

Пример:

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```


### regionToName

Принимает идентификатор региона и геобазу данных и возвращает строку с названием региона на соответствующем языке. Если региона с указанным идентификатором не существует, возвращается пустая строка.

**Синтаксис**

```sql
regionToName(id\[, lang\])
```

**Параметры**

* `id` — идентификатор региона в геобазе. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Название региона на соответствующем языке, указанном в `geobase`. [String](../data-types/string).
* В противном случае — пустая строка.

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


### regionToCity

Принимает идентификатор региона из геобазы. Если этот регион является городом или частью города, функция возвращает идентификатор региона соответствующего города. В противном случае возвращает 0.

**Синтаксис**

```sql
regionToCity(id [, geobase])
```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* идентификатор региона для соответствующего города, если он существует. [UInt32](../data-types/int-uint).
* 0, если такого нет.

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


### regionToArea

Преобразует регион в область (тип 5 в геобазе). Во всём остальном эта функция аналогична функции [&#39;regionToCity&#39;](#regiontocity).

**Синтаксис**

```sql
regionToArea(id [, geobase])
```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* идентификатор региона для соответствующего города, если такой регион существует. [UInt32](../data-types/int-uint).
* 0, если такого региона нет.

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


### regionToDistrict

Преобразует регион в федеральный округ (тип 4 в геобазе). Во всём остальном эта функция аналогична `regionToCity`.

**Синтаксис**

```sql
regionToDistrict(id [, geobase])
```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор региона для соответствующего города, если такой регион существует. [UInt32](../data-types/int-uint).
* 0, если такого региона нет.

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


### regionToCountry

Преобразует регион в страну (тип 3 в geobase). В остальном эта функция аналогична функции &#39;regionToCity&#39;.

**Синтаксис**

```sql
regionToCountry(id [, geobase])
```

**Параметры**

* `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — Ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* ID региона для соответствующей страны, если такой регион существует. [UInt32](../data-types/int-uint).
* 0, если его нет.

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


### regionToContinent

Преобразует регион в континент (тип 1 в geobase). В остальном эта функция аналогична функции &#39;regionToCity&#39;.

**Синтаксис**

```sql
regionToContinent(id [, geobase])
```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор региона соответствующего континента, если он существует. [UInt32](../data-types/int-uint).
* 0, если такого нет.

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


### regionToTopContinent

Находит континент верхнего уровня в иерархии для региона.

**Синтаксис**

```sql
regionToTopContinent(id[, geobase])
```

**Параметры**

* `id` — идентификатор региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Идентификатор континента верхнего уровня (континента, который получается при подъёме по иерархии регионов). [UInt32](../data-types/int-uint).
* 0, если такого нет.

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


### regionToPopulation

Возвращает численность населения для региона. Данные о населении могут храниться в файлах geobase. См. раздел [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded#embedded-dictionaries). Если численность населения для региона не указана, функция возвращает 0. В geobase численность населения может быть указана для дочерних регионов, но не для родительских.

**Синтаксис**

```sql
regionToPopulation(id[, geobase])
```

**Параметры**

* `id` — идентификатор региона в геобазе. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Численность населения региона. [UInt32](../data-types/int-uint).
* 0, если оно отсутствует.

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


### regionIn

Проверяет, принадлежит ли регион `lhs` региону `rhs`. Возвращает число типа UInt8, равное 1, если принадлежит, и 0 — если не принадлежит.

**Синтаксис**

```sql
regionIn(lhs, rhs\[, geobase\])
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


### regionHierarchy

Принимает число типа UInt32 — идентификатор региона из геобазы. Возвращает массив идентификаторов регионов, включающий переданный регион и всех его родительских регионов по цепочке.

**Синтаксис**

```sql
regionHierarchy(id\[, geobase\])
```

**Параметры**

* `id` — ID региона из геобазы. [UInt32](../data-types/int-uint).
* `geobase` — ключ словаря. См. [Несколько геобаз](#multiple-geobases). [String](../data-types/string). Необязательный параметр.

**Возвращаемое значение**

* Массив ID регионов, состоящий из переданного региона и всех родительских регионов по иерархии. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

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

{/* 
  Содержимое тегов ниже при сборке фреймворка документации заменяется документацией,
  сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
