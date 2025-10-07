---
'description': '嵌入字典的函数文档'
'sidebar_label': 'Embedded dictionary'
'slug': '/sql-reference/functions/ym-dict-functions'
'title': '处理嵌入字典的函数'
'doc_type': 'reference'
---


# 使用嵌入式字典的函数

:::note
为了使下面的函数正常工作，服务器配置必须指定获取所有嵌入式字典的路径和地址。字典在首次调用这些函数时加载。如果无法加载参考列表，则会抛出异常。

因此，本节中显示的示例在默认情况下将在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 和快速发布及生产部署中抛出异常，除非首先进行配置。
:::

有关创建参考列表的信息，请参见["字典"](../dictionaries#embedded-dictionaries)部分。

## 多个地理基础 {#multiple-geobases}

ClickHouse 支持同时处理多个替代地理基础（区域层级），以支持对于某些地区属于哪些国家的各种视角。

'clickhouse-server' 配置指定区域层次的文件：

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

接受一个区域 ID 和地理基础，并返回对应语言的区域名称字符串。如果指定 ID 的区域不存在，则返回空字符串。

**语法**

```sql
regionToName(id\[, lang\])
```
**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 对应于 `geobase` 指定语言的区域名称。 [String](../data-types/string).
- 否则，返回空字符串。 

**示例**

查询：

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

结果：

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

接受来自地理基础的区域 ID。如果该区域是城市或城市的一部分，则返回适当城市的区域 ID。否则，返回 0。

**语法**

```sql
regionToCity(id [, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果存在，则返回适当城市的区域 ID。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

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

将区域转换为区域（地理基础中的类型 5）。在其他方面，此函数与 ['regionToCity'](#regiontocity) 相同。

**语法**

```sql
regionToArea(id [, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果存在，则返回适当区域的区域 ID。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

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

将区域转换为联邦区（地理基础中的类型 4）。在其他方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToDistrict(id [, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果存在，则返回适当城市的区域 ID。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

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

将区域转换为国家（地理基础中的类型 3）。在其他方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToCountry(id [, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果存在，则返回适当国家的区域 ID。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

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

将区域转换为大陆（地理基础中的类型 1）。在其他方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToContinent(id [, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果存在，则返回适当大陆的区域 ID。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

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

查找区域层次中最高的大陆。

**语法**

```sql
regionToTopContinent(id[, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 顶级大陆的标识符（即当您沿着区域层次上升时的最后一个）。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

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

获取区域的人口。人口可以在地理基础的文件中记录。有关更多信息，请参见["字典"](../dictionaries#embedded-dictionaries)部分。如果该区域没有记录人口，则返回 0。在地理基础中，人口可能记录在子区域中，但不记录在父区域中。

**语法**

```sql
regionToPopulation(id[, geobase])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 该区域的人口。 [UInt32](../data-types/int-uint).
- 如果不存在，返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

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

检查一个 `lhs` 区域是否属于一个 `rhs` 区域。如果属于，则返回等于 1 的 UInt8 数字；如果不属于，则返回 0。

**语法**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**参数**

- `lhs` — 来自地理基础的左侧区域 ID。 [UInt32](../data-types/int-uint).
- `rhs` — 来自地理基础的右侧区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 如果属于，则返回 1。 [UInt8](../data-types/int-uint).
- 如果不属于，则返回 0。

**实现细节**

这种关系是自反的——任何区域也属于它自己。

**示例**

查询：

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

结果：

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

接受一个 UInt32 数字——来自地理基础的区域 ID。返回一个由传递区域及沿链的所有父级组成的区域 ID 数组。

**语法**

```sql
regionHierarchy(id\[, geobase\])
```

**参数**

- `id` — 来自地理基础的区域 ID。 [UInt32](../data-types/int-uint).
- `geobase` — 字典键。见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string). 可选。

**返回值**

- 由传递区域及沿链的所有父级组成的区域 ID 数组。 [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**示例**

查询：

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

结果：

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
