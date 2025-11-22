---
description: '嵌入式字典相关函数文档'
sidebar_label: '嵌入式字典'
slug: /sql-reference/functions/ym-dict-functions
title: '嵌入式字典相关函数'
doc_type: 'reference'
---



# 用于操作内置字典的函数

:::note
要使下列函数正常工作，服务器配置中必须指定获取所有内置字典的路径和地址。字典会在首次调用任意一个此类函数时加载。如果引用列表无法加载，则会抛出异常。

因此，除非事先完成相应配置，否则本节所示示例在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 以及默认的快速部署和生产部署中都会抛出异常。
:::

关于如何创建引用列表的更多信息，请参阅 ["Dictionaries"](../dictionaries#embedded-dictionaries) 一节。



## 多个地理数据库 {#multiple-geobases}

ClickHouse 支持同时使用多个备选地理数据库(区域层次结构),以支持对特定区域所属国家的不同视角。

'clickhouse-server' 配置指定了区域层次结构文件:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

除此文件外,系统还会搜索同一目录下文件名中包含 `_` 符号和任意后缀(位于文件扩展名之前)的文件。
例如,如果存在 `/opt/geo/regions_hierarchy_ua.txt` 文件,系统也会找到该文件。这里 `ua` 称为字典键。对于没有后缀的字典,键为空字符串。

所有字典在运行时都会重新加载(根据 [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 配置参数定义的间隔秒数重新加载,默认为每小时一次)。但是,可用字典列表仅在服务器启动时定义一次。

所有用于处理区域的函数末尾都有一个可选参数 – 字典键。它被称为地理数据库(geobase)。

示例:

```sql
regionToCountry(RegionID) – 使用默认字典: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – 使用默认字典: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 使用 'ua' 键的字典: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

接受区域 ID 和地理数据库,返回相应语言中该区域名称的字符串。如果指定 ID 的区域不存在,则返回空字符串。

**语法**

```sql
regionToName(id\[, lang\])
```

**参数**

- `id` — 来自地理数据库的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 由 `geobase` 指定的相应语言中的区域名称。[String](../data-types/string)。
- 否则返回空字符串。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

结果:

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

接受来自地理数据库的区域 ID。如果该区域是城市或城市的一部分,则返回相应城市的区域 ID。否则返回 0。

**语法**

```sql
regionToCity(id [, geobase])
```

**参数**

- `id` — 来自地理数据库的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 相应城市的区域 ID(如果存在)。[UInt32](../data-types/int-uint)。
- 如果不存在则返回 0。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果:


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

将区域转换为地区（在 geobase 中为类型 5）。在其他方面，该函数与 ['regionToCity'](#regiontocity) 相同。

**语法**

```sql
regionToArea(id [, geobase])
```

**参数**

- `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 若存在，则为对应地区的区域 ID。[UInt32](../data-types/int-uint)。
- 如果不存在，则为 0。

**示例**

查询：

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

结果：

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

将区域转换为联邦区（在 geobase 中为类型 4）。在其他方面，该函数与 `regionToCity` 相同。

**语法**

```sql
regionToDistrict(id [, geobase])
```

**参数**

- `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 若存在，则为对应城市的区域 ID。[UInt32](../data-types/int-uint)。
- 如果不存在，则为 0。

**示例**

查询：

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

结果：

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

将区域转换为国家（在 geobase 中为类型 3）。在其他方面，该函数与 `regionToCity` 相同。

**语法**

```sql
regionToCountry(id [, geobase])
```

**参数**


- `id` — 地理数据库中的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 对应国家的区域 ID(如果存在)。[UInt32](../data-types/int-uint)。
- 如果不存在则返回 0。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果:

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

将区域转换为大洲(地理数据库中的类型 1)。在其他方面,此函数与 'regionToCity' 相同。

**语法**

```sql
regionToContinent(id [, geobase])
```

**参数**

- `id` — 地理数据库中的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 对应大洲的区域 ID(如果存在)。[UInt32](../data-types/int-uint)。
- 如果不存在则返回 0。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果:

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

查找区域层次结构中的最顶层大洲。

**语法**

```sql
regionToTopContinent(id[, geobase])
```

**参数**

- `id` — 地理数据库中的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 顶层大洲的标识符(沿区域层次结构向上追溯时的最高层级)。[UInt32](../data-types/int-uint)。
- 如果不存在则返回 0。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果:


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

获取区域的人口数量。人口数据可记录在地理数据库文件中。请参阅["字典"](../dictionaries#embedded-dictionaries)部分。如果该区域未记录人口数据,则返回 0。在地理数据库中,可能为子区域记录了人口数据,但未为父区域记录。

**语法**

```sql
regionToPopulation(id[, geobase])
```

**参数**

- `id` — 地理数据库中的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。请参阅[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 区域的人口数量。[UInt32](../data-types/int-uint)。
- 如果无记录则返回 0。

**示例**

查询:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果:

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

检查 `lhs` 区域是否属于 `rhs` 区域。如果属于则返回 UInt8 数字 1,如果不属于则返回 0。

**语法**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**参数**

- `lhs` — 地理数据库中的左侧区域 ID。[UInt32](../data-types/int-uint)。
- `rhs` — 地理数据库中的右侧区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。请参阅[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 如果属于则返回 1。[UInt8](../data-types/int-uint)。
- 如果不属于则返回 0。

**实现细节**

该关系具有自反性 — 任何区域也属于其自身。

**示例**

查询:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

结果:


```text
World 在 World 中
World 不在 USA 中
World 不在 Colorado 中
World 不在 Boulder County 中
World 不在 Boulder 中
USA 在 World 中
USA 在 USA 中
USA 不在 Colorado 中
USA 不在 Boulder County 中
USA 不在 Boulder 中
```

### regionHierarchy {#regionhierarchy}

接受一个 UInt32 数字——来自地理数据库的区域 ID。返回一个区域 ID 数组,包含传入的区域及其层级链上的所有父级区域。

**语法**

```sql
regionHierarchy(id\[, geobase\])
```

**参数**

- `id` — 来自地理数据库的区域 ID。[UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见[多个地理数据库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

- 区域 ID 数组,包含传入的区域及其层级链上的所有父级区域。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

**示例**

查询:

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

结果:

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
