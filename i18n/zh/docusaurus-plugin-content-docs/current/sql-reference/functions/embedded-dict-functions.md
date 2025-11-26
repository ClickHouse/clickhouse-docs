---
description: '用于操作嵌入式字典的函数文档'
sidebar_label: '嵌入式字典'
slug: /sql-reference/functions/ym-dict-functions
title: '用于操作嵌入式字典的函数'
doc_type: 'reference'
---



# 使用内嵌字典的函数

:::note
要使下面的函数正常工作，服务器配置中必须指定获取所有内嵌字典的路径和地址。这些字典会在首次调用任意一个相关函数时加载。如果参考列表无法加载，则会抛出异常。

因此，本节中展示的示例在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 中，以及在快速发布版本和生产环境中的部署中，默认都会抛出异常，除非事先完成相应配置。
:::

关于如何创建参考列表的更多信息，请参见章节 ["Dictionaries"](../dictionaries#embedded-dictionaries)。



## 多个地理库（Geobase）

ClickHouse 支持同时使用多个不同的地理库（区域层级结构），以支持对某些地区应划归哪些国家的不同视角。

`clickhouse-server` 配置中指定了区域层级所使用的文件：

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

除了这个文件之外，它还会在同一目录中查找名称中带有 `_` 符号、并在文件扩展名之前追加任意后缀的文件。
例如，如果存在 `/opt/geo/regions_hierarchy_ua.txt` 文件，它也会被找到。这里的 `ua` 被称为字典键（dictionary key）。对于没有后缀的字典，其键是空字符串。

所有字典都会在运行时重新加载（每隔若干秒一次，该间隔由 [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 配置参数定义，默认值为每小时一次）。但是，可用字典的列表只会在服务器启动时确定一次。

所有与区域相关的函数在末尾都有一个可选参数——字典键，该参数称为 geobase。

示例：

```sql
regionToCountry(RegionID) – 使用默认字典:/opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – 使用默认字典:/opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 使用 'ua' 键的字典:/opt/geo/regions_hierarchy_ua.txt
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

* `id` — 来自 geobase 的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 如果存在，则为相应区域的区域 ID。[UInt32](../data-types/int-uint)。
* 如果不存在，则为 0。

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
│ 莫斯科及莫斯科州                                        │
│ 圣彼得堡及列宁格勒州                                    │
│ 别尔哥罗德州                                           │
│ 伊万诺沃州                                             │
│ 卡卢加州                                               │
│ 科斯特罗马州                                           │
│ 库尔斯克州                                             │
│ 利佩茨克州                                             │
│ 奥廖尔州                                               │
│ 梁赞州                                                 │
│ 斯摩棱斯克州                                           │
│ 坦波夫州                                               │
│ 特维尔州                                               │
│ 图拉州                                                 │
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

* 对应城市的区域 ID（若存在）。[UInt32](../data-types/int-uint)。
* 否则为 0。

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
│ 中央联邦区                                                 │
│ 西北联邦区                                                 │
│ 南部联邦区                                                 │
│ 北高加索联邦区                                              │
│ 伏尔加联邦区                                               │
│ 乌拉尔联邦区                                               │
│ 西伯利亚联邦区                                              │
│ 远东联邦区                                                 │
│ 苏格兰                                                    │
│ 法罗群岛                                                   │
│ 佛兰德大区                                                 │
│ 布鲁塞尔首都大区                                            │
│ 瓦隆大区                                                   │
│ 波斯尼亚和黑塞哥维那联邦                                      │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry

将区域转换为国家（geobase 中的类型 3）。在其他方面，该函数与 `regionToCity` 相同。

**语法**

```sql
regionToCountry(id [, geobase])
```

**参数**


* `id` — 来自地理库（geobase）的区域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [多个地理库](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应国家/地区的区域 ID（如果存在）。[UInt32](../data-types/int-uint)。
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

* `id` — 来自 geobase 的地域 ID。[UInt32](../data-types/int-uint)。
* `geobase` — 字典键。参见 [Multiple Geobases](#multiple-geobases)。[String](../data-types/string)。可选。

**返回值**

* 对应大洲的地域 ID（如果存在）。[UInt32](../data-types/int-uint)。
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
│ 世界                                      │  0 │                                                               │
│ 美国                                        │ 10 │ North 美洲                                                 │
│ 科罗拉多州                                   │ 10 │ North 美洲                                                 │
│ 博尔德县                             │ 10 │ North 美洲                                                 │
│ 博尔德                                    │ 10 │ North 美洲                                                 │
│ 中国                                      │ 12 │ 亚洲                                                          │
│ 四川省                                    │ 12 │ 亚洲                                                          │
│ 成都市                                    │ 12 │ 亚洲                                                          │
│ 美洲                                    │  9 │ 美洲                                                       │
│ North 美洲                              │ 10 │ North 美洲                                                 │
│ 欧亚大陆                                    │ 11 │ 欧亚大陆                                                       │
│ 亚洲                                       │ 12 │ 亚洲                                                          │
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
│ 世界                                      │  0 │                                                                  │
│ 美国                                        │  9 │ 美洲                                                          │
│ 科罗拉多州                                   │  9 │ 美洲                                                          │
│ 博尔德县                             │  9 │ 美洲                                                          │
│ 博尔德市                                    │  9 │ 美洲                                                          │
│ 中国                                      │ 11 │ 欧亚大陆                                                          │
│ 四川省                                    │ 11 │ 欧亚大陆                                                          │
│ 成都市                                    │ 11 │ 欧亚大陆                                                          │
│ 美洲                                    │  9 │ 美洲                                                          │
│ North 美洲                              │  9 │ 美洲                                                          │
│ 欧亚大陆                                    │ 11 │ 欧亚大陆                                                          │
│ 亚洲                                       │ 11 │ 欧亚大陆                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation

获取某个区域的人口数。人口数据可以记录在 `geobase` 文件中。参见 [&quot;Dictionaries&quot;](../dictionaries#embedded-dictionaries) 一节。若该区域未记录人口数，则返回 0。在 `geobase` 中，人口可能只记录在子区域，而未记录在父区域。

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
│ 世界                                        │ 4294967295 │
│ 美国                                        │  330000000 │
│ 科罗拉多州                                   │    5700000 │
│ 博尔德县                                     │     330000 │
│ 博尔德市                                     │     100000 │
│ 中国                                        │ 1500000000 │
│ 四川省                                       │   83000000 │
│ 成都市                                       │   20000000 │
│ 美洲                                        │ 1000000000 │
│ 北美洲                                       │  600000000 │
│ 欧亚大陆                                     │ 4294967295 │
│ 亚洲                                        │ 4294967295 │
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
World 包含在 World 中
World 不包含在 USA 中
World 不包含在 Colorado 中
World 不包含在 Boulder County 中
World 不包含在 Boulder 中
USA 包含在 World 中
USA 包含在 USA 中
USA 不包含在 Colorado 中
USA 不包含在 Boulder County 中
USA 不包含在 Boulder 中    
```

### regionHierarchy

接受一个 UInt32 类型的数值——来自 geobase 的区域 ID。返回一个由该区域及其所有上级区域 ID 组成的数组。

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
│ [1]            │ ['世界']                                                                                    │
│ [2,10,9,1]     │ ['美国','北美','美洲','世界']                                                    │
│ [3,2,10,9,1]   │ ['科罗拉多州','美国','北美','美洲','世界']                                         │
│ [4,3,2,10,9,1] │ ['博尔德县','科罗拉多州','美国','北美','美洲','世界']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

{/* 
  下面标签的内部内容会在文档框架构建期间，
  被替换为由 system.functions 生成的文档。请不要修改或移除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
