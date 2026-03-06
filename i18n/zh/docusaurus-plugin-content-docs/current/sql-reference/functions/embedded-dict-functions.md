---
description: '用于操作嵌入式字典的函数文档'
sidebar_label: '嵌入式字典'
slug: /sql-reference/functions/ym-dict-functions
title: '用于操作嵌入式字典的函数'
doc_type: 'reference'
---

# 使用内嵌字典的函数 \{#functions-for-working-with-embedded-dictionaries\}

:::note
要使下面的函数正常工作，服务器配置中必须指定获取所有内嵌字典的路径和地址。这些字典会在首次调用任意一个相关函数时加载。如果参考列表无法加载，则会抛出异常。

因此，本节中展示的示例在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 中，以及在快速发布版本和生产环境中的部署中，默认都会抛出异常，除非事先完成相应配置。
:::

关于如何创建参考列表的更多信息，请参见章节 [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded)。

## 多个地理库（Geobase） \{#multiple-geobases\}

ClickHouse 支持同时使用多个不同的地理库（区域层级结构），以支持对某些地区应划归哪些国家的不同视角。

`clickhouse-server` 配置中指定了区域层级所使用的文件：

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

除了这个文件之外，它还会在同一目录中查找名称中带有 `_` 符号、并在文件扩展名之前追加任意后缀的文件。
例如，如果存在 `/opt/geo/regions_hierarchy_ua.txt` 文件，它也会被找到。这里的 `ua` 被称为字典键（dictionary key）。对于没有后缀的字典，其键是空字符串。

所有字典都会在运行时重新加载（每隔若干秒一次，该间隔由 [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 配置参数定义，默认值为每小时一次）。但是，可用字典的列表只会在服务器启动时确定一次。

所有与区域相关的函数在末尾都有一个可选参数——字典键，该参数称为 geobase。

示例：

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```


### regionToName

接受一个区域 ID 和 geobase，并返回一个字符串，该字符串为对应语言中该区域的名称。如果具有指定 ID 的区域不存在，则返回空字符串。

**语法**

```sql
regionToName(id\[, lang\])
```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 由 `geobase` 指定的对应语言中的区域名称。[String](../data-types/string)。
* 否则，返回空字符串。

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


### regionToCity

从 geobase 接收一个区域 ID。如果该区域本身是城市或隶属于某个城市，则返回相应城市的区域 ID；否则返回 0。

**语法**

```sql
regionToCity(id [, geobase])
```

**参数**

* `id` — 来自 geobase 的地区 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [多个 geobase](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应城市的地区 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则返回 0。

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


### regionToArea

将区域转换为地区（在 geobase 中为类型 5）。在其他方面，该函数与 [&#39;regionToCity&#39;](#regiontocity) 完全相同。

**语法**

```sql
regionToArea(id [, geobase])
```

**参数**

* `id` — geobase 中的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应联邦区的区域 ID（若存在）。[UInt32](../data-types/int-uint)。
* 否则为 0。

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


### regionToDistrict

将区域转换为联邦区（在 geobase 中为类型 4）。在其他方面，该函数与 &#39;regionToCity&#39; 完全相同。

**语法**

```sql
regionToDistrict(id [, geobase])
```

**参数**

* `id` — geobase 中的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 如果存在，则为对应城市的区域 ID。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

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


### regionToCountry

将区域转换为国家/地区（在 geobase 中类型为 3）。在其他方面，此函数与 `regionToCity` 完全相同。

**语法**

```sql
regionToCountry(id [, geobase])
```

**参数**

* `id` — 来自 geobase 的地域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应国家/地区的地域 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

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


### regionToContinent

将区域转换为大洲（在 geobase 中类型为 1）。在其他方面，此函数与 `regionToCity` 完全相同。

**语法**

```sql
regionToContinent(id [, geobase])
```

**参数**

* `id` — 来自地理库（geobase）的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [多个地理库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应大洲的区域 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

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


### regionToTopContinent

查找指定区域在层级结构中的最上级洲。

**语法**

```sql
regionToTopContinent(id[, geobase])
```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 顶层大洲的标识符（即在区域层级中向上追溯时得到的最高层级大洲）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

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


### regionToPopulation

获取某个区域的人口数。人口数据可以记录在 `geobase` 文件中。参见 [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded) 一节。若该区域未记录人口数，则返回 0。在 `geobase` 中，人口可能只记录在子区域，而未记录在父区域。

**语法**

```sql
regionToPopulation(id[, geobase])
```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)，可选。

**返回值**

* 区域人口数。[UInt32](../data-types/int-uint)。
* 若不存在，则返回 0。

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


### regionIn

检查 `lhs` 区域是否包含于 `rhs` 区域中。如果包含则返回 UInt8 类型的数值 1，否则返回 0。

**语法**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**参数**

* `lhs` — 来自 geobase 的左侧区域 ID。[UInt32](../data-types/int-uint)。
* `rhs` — 来自 geobase 的右侧区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 1，若属于。[UInt8](../data-types/int-uint)。
* 0，若不属于。

**实现细节**

该关系是自反的，即任何区域都属于其自身。

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


### regionHierarchy

接受一个 UInt32 类型的数值——来自 geobase 的区域 ID。返回一个由传入的区域及其所有上级区域组成的数组。

**语法**

```sql
regionHierarchy(id\[, geobase\])
```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 区域 ID 数组，由传入的区域及其所有上级区域组成。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

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

{/* 
    下方标签内的内容会在文档框架构建时，
    被替换为由 system.functions 生成的文档。请不要修改或移除这些标签。
    参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
