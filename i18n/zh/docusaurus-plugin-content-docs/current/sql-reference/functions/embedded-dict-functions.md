---
description: '用于操作嵌入式字典的函数文档'
sidebar_label: '嵌入式字典'
slug: /sql-reference/functions/ym-dict-functions
title: '用于操作嵌入式字典的函数'
doc_type: 'reference'
---

# 使用内嵌字典的函数 {#functions-for-working-with-embedded-dictionaries}

:::note
要使下面的函数正常工作，服务器配置中必须指定获取所有内嵌字典的路径和地址。这些字典会在首次调用任意一个相关函数时加载。如果参考列表无法加载，则会抛出异常。

因此，本节中展示的示例在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 中，以及在快速发布版本和生产环境中的部署中，默认都会抛出异常，除非事先完成相应配置。
:::

关于如何创建参考列表的更多信息，请参见章节 [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries)。

## 多个地理库（Geobase） {#multiple-geobases}

ClickHouse 支持同时使用多个不同的地理库（区域层级结构），以支持对某些地区应划归哪些国家的不同视角。

`clickhouse-server` 配置中指定了区域层级所使用的文件：

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

除了这个文件之外，它还会在同一目录中查找名称中带有 `_` 符号、并在文件扩展名之前追加任意后缀的文件。
例如，如果存在 `/opt/geo/regions_hierarchy_ua.txt` 文件，它也会被找到。这里的 `ua` 被称为字典键（dictionary key）。对于没有后缀的字典，其键是空字符串。

所有字典都会在运行时重新加载（每隔若干秒一次，该间隔由 [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 配置参数定义，默认值为每小时一次）。但是，可用字典的列表只会在服务器启动时确定一次。

所有与区域相关的函数在末尾都有一个可选参数——字典键，该参数称为 geobase。

示例：

```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```

### regionToName {#regiontoname}

接受一个区域 ID 和 geobase，并返回一个字符串，该字符串为对应语言中该区域的名称。如果具有指定 ID 的区域不存在，则返回空字符串。

**语法**

```

### regionToName {#regiontoname}

Accepts a region ID and geobase and returns a string of the name of the region in the corresponding language. If the region with the specified ID does not exist, an empty string is returned.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 由 `geobase` 指定的对应语言中的区域名称。[String](../data-types/string)。
* 否则，返回空字符串。

**示例**

查询：

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

结果：

```

Result:

```

### regionToCity {#regiontocity}

从 geobase 接收一个区域 ID。如果该区域本身是城市或隶属于某个城市，则返回相应城市的区域 ID；否则返回 0。

**语法**

```

### regionToCity {#regiontocity}

Accepts a region ID from the geobase. If this region is a city or part of a city, it returns the region ID for the appropriate city. Otherwise, returns 0.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的地区 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [多个 geobase](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应城市的地区 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则返回 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToArea {#regiontoarea}

将区域转换为地区（在 geobase 中为类型 5）。在其他方面，该函数与 [&#39;regionToCity&#39;](#regiontocity) 完全相同。

**语法**

```

### regionToArea {#regiontoarea}

Converts a region to an area (type 5 in the geobase). In every other way, this function is the same as ['regionToCity'](#regiontocity).

**Syntax**

```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 如果存在，则为相应区域的区域 ID。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToDistrict {#regiontodistrict}

将区域转换为联邦区（在 geobase 中为类型 4）。在其他方面，该函数与 &#39;regionToCity&#39; 完全相同。

**语法**

```

### regionToDistrict {#regiontodistrict}

Converts a region to a federal district (type 4 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**参数**

* `id` — geobase 中的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应城市的区域 ID（若存在）。[UInt32](../data-types/int-uint)。
* 否则为 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToCountry {#regiontocountry}

将区域转换为国家（geobase 中的类型 3）。在其他方面，该函数与 `regionToCity` 相同。

**语法**

```

### regionToCountry {#regiontocountry}

Converts a region to a country (type 3 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**参数**

* `id` — 来自地理库（geobase）的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [多个地理库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应国家/地区的区域 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToContinent {#regiontocontinent}

将区域转换为大洲（在 geobase 中类型为 1）。在其他方面，此函数与 `regionToCity` 完全相同。

**语法**

```

### regionToContinent {#regiontocontinent}

Converts a region to a continent (type 1 in the geobase). In every other way, this function is the same as 'regionToCity'.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的地域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应大洲的地域 ID（如果存在）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToTopContinent {#regiontotopcontinent}

查找指定区域在层级结构中的最上级洲。

**语法**

```

### regionToTopContinent {#regiontotopcontinent}

Finds the highest continent in the hierarchy for the region.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 顶层大洲的标识符（即在区域层级中向上追溯时得到的最高层级大洲）。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionToPopulation {#regiontopopulation}

获取某个区域的人口数。人口数据可以记录在 `geobase` 文件中。参见 [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries) 一节。若该区域未记录人口数，则返回 0。在 `geobase` 中，人口可能只记录在子区域，而未记录在父区域。

**语法**

```

### regionToPopulation {#regiontopopulation}

Gets the population for a region. The population can be recorded in files with the geobase. See the section ["Dictionaries"](../dictionaries#embedded-dictionaries). If the population is not recorded for the region, it returns 0. In the geobase, the population might be recorded for child regions, but not for parent regions.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)，可选。

**返回值**

* 区域人口数。[UInt32](../data-types/int-uint)。
* 若不存在，则返回 0。

**示例**

查询：

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

结果：

```

Result:

```

### regionIn {#regionin}

检查 `lhs` 区域是否包含于 `rhs` 区域中。如果包含则返回 UInt8 类型的数值 1，否则返回 0。

**语法**

```

### regionIn {#regionin}

Checks whether a `lhs` region belongs to a `rhs` region. Returns a UInt8 number equal to 1 if it belongs, or 0 if it does not belong.

**Syntax**

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

结果：

```

Result:

```

### regionHierarchy {#regionhierarchy}

接受一个 UInt32 类型的数值——来自 geobase 的区域 ID。返回一个由该区域及其所有上级区域 ID 组成的数组。

**语法**

```

### regionHierarchy {#regionhierarchy}

Accepts a UInt32 number – the region ID from the geobase. Returns an array of region IDs consisting of the passed region and all parents along the chain.

**Syntax**

```

**参数**

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 区域 ID 数组，由传入的区域及其所有上级区域组成。[Array](../data-types/array)([UInt32](../data-types/int-uint))。

**示例**

查询：

```

**Parameters**

- `id` — Region ID from the geobase. [UInt32](../data-types/int-uint).
- `geobase` — Dictionary key. See [Multiple Geobases](#multiple-geobases). [String](../data-types/string). Optional.

**Returned value**

- Array of region IDs consisting of the passed region and all parents along the chain. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**Example**

Query:

```

结果：

```

Result:

```

{/* 
  下面标签的内部内容会在文档框架构建期间，
  被替换为由 system.functions 生成的文档。请不要修改或移除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
