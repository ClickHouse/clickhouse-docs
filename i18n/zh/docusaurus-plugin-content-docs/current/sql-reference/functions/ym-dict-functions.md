---
slug: /sql-reference/functions/ym-dict-functions
sidebar_position: 60
sidebar_label: 嵌入式字典
---


# 嵌入式字典的操作函数

:::note
为了使以下函数正常工作，服务器配置必须指定获取所有嵌入式字典的路径和地址。字典在首次调用任何这些函数时加载。如果无法加载参考列表，则会抛出异常。

因此，本节中所示的示例将在默认情况下在 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 以及快速发布和生产部署中抛出异常，除非首先进行配置。
:::

有关创建参考列表的信息，请参见["字典"](../dictionaries#embedded-dictionaries)部分。

## 多个地理基础 {#multiple-geobases}

ClickHouse 支持同时处理多个替代地理基础（区域层次结构），以支持对某些地区属于哪些国家的不同视角。

'clickhouse-server' 配置指定了区域层次结构的文件： 

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

除了该文件，它还会搜索附近具有 `_` 标识符并在文件扩展名前附加任意后缀的文件。
例如，如果存在，它也会找到文件 `/opt/geo/regions_hierarchy_ua.txt`。这里的 `ua` 被称为字典键。对于没有后缀的字典，键是空字符串。

在运行时，所有字典都会被重新加载（每隔一定秒数，如 [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 配置参数中定义，或每小时一次，默认情况下）。但是，可用字典的列表在服务器启动时会被定义一次。

所有用于处理区域的函数在末尾都有一个可选参数 – 字典键。称之为地理基础。

示例：

``` sql
regionToCountry(RegionID) – 使用默认字典: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – 使用默认字典: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – 使用字典 'ua' 键: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

接受区域 ID 和地理基础，并返回对应语言的区域名称字符串。如果指定 ID 的区域不存在，则返回空字符串。

**语法**

``` sql
regionToName(id\[, lang\])
```
**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 对应于 `geobase` 指定的语言的区域名称。 [String](../data-types/string)。
- 否则，返回空字符串。 

**示例**

查询：

``` sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

结果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ 世界                                      │
│ 美国                                      │
│ 科罗拉多                                   │
│ 博尔德县                                   │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

接受一个来自地理基础的区域 ID。如果该区域是城市或城市的一部分，则返回适当城市的区域 ID。否则，返回 0。

**语法**

```sql
regionToCity(id [, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果存在，返回适当城市的区域 ID。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

```response
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCity(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                          │
│ 世界                                      │  0 │                                                          │
│ 美国                                      │  0 │                                                          │
│ 科罗拉多                                   │  0 │                                                          │
│ 博尔德县                                   │  0 │                                                          │
│ 博尔德                                    │  5 │ 博尔德                                                  │
│ 中国                                      │  0 │                                                          │
│ 四川                                      │  0 │                                                          │
│ 成都                                      │  8 │ 成都                                                    │
│ 美洲                                      │  0 │                                                          │
│ 北美洲                                    │  0 │                                                          │
│ 欧亚                                      │  0 │                                                          │
│ 亚洲                                       │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

将地区转换为区域（类型 5）。在其他所有方面，此函数与 ['regionToCity'](#regiontocity) 相同。

**语法**

```sql
regionToArea(id [, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果存在，返回适当区域的区域 ID。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

结果：

``` text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ 莫斯科和莫斯科地区                             │
│ 圣彼得堡和列宁格勒地区                          │
│ 贝尔哥罗德地区                                  │
│ 伊万诺夫斯克地区                                │
│ 卡卢加地区                                      │
│ 科斯特罗马地区                                  │
│ 库尔斯克地区                                    │
│ 利佩茨克地区                                    │
│ 奥尔洛夫地区                                    │
│ 里亚赞地区                                      │
│ Смоленск地区                                    │
│ 坦波夫地区                                      │
│ 特维尔地区                                      │
│ 图拉地区                                        │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

将区域转换为联邦区（类型 4）。在其他所有方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToDistrict(id [, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果存在，返回适当城市的区域 ID。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

结果：

``` text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ 中央联邦区                                         │
│ 西北联邦区                                         │
│ 南方联邦区                                         │
│ 北高加索联邦区                                     │
│ 伏尔加联邦区                                       │
│ 乌拉尔联邦区                                       │
│ 西伯利亚联邦区                                     │
│ 远东联邦区                                         │
│ 苏格兰                                           │
│ 法罗群岛                                         │
│ 佛兰德地区                                        │
│ 布鲁塞尔首都地区                                   │
│ 瓦隆区                                           │
│ 波斯尼亚和黑塞哥维那联邦                           │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

将区域转换为国家（类型 3）。在其他所有方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToCountry(id [, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果存在，返回适当国家的区域 ID。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ 世界                                      │  0 │                                                             │
│ 美国                                      │  2 │ 美国                                                         │
│ 科罗拉多                                   │  2 │ 美国                                                         │
│ 博尔德县                                   │  2 │ 美国                                                         │
│ 博尔德                                    │  2 │ 美国                                                         │
│ 中国                                      │  6 │ 中国                                                         │
│ 四川                                      │  6 │ 中国                                                         │
│ 成都                                      │  6 │ 中国                                                         │
│ 美洲                                      │  0 │                                                             │
│ 北美洲                                    │  0 │                                                             │
│ 欧亚                                      │  0 │                                                             │
│ 亚洲                                       │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

将区域转换为大陆（类型 1）。在其他所有方面，此函数与 'regionToCity' 相同。

**语法**

```sql
regionToContinent(id [, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果存在，返回适当大陆的区域 ID。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ 世界                                      │  0 │                                                               │
│ 美国                                      │ 10 │ 北美洲                                                       │
│ 科罗拉多                                   │ 10 │ 北美洲                                                       │
│ 博尔德县                                   │ 10 │ 北美洲                                                       │
│ 博尔德                                    │ 10 │ 北美洲                                                       │
│ 中国                                      │ 12 │ 亚洲                                                        │
│ 四川                                      │ 12 │ 亚洲                                                        │
│ 成都                                      │ 12 │ 亚洲                                                        │
│ 美洲                                      │  9 │ 美洲                                                        │
│ 北美洲                                    │ 10 │ 北美洲                                                       │
│ 欧亚                                      │ 11 │ 欧亚                                                        │
│ 亚洲                                       │ 12 │ 亚洲                                                        │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

查找区域层次结构中最高的大陆。

**语法**

``` sql
regionToTopContinent(id[, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 顶级大陆的标识符（当你沿着区域层次结构向上攀爬时）。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ 世界                                      │  0 │                                                                  │
│ 美国                                      │  9 │ 美洲                                                            │
│ 科罗拉多                                   │  9 │ 美洲                                                            │
│ 博尔德县                                   │  9 │ 美洲                                                            │
│ 博尔德                                    │  9 │ 美洲                                                            │
│ 中国                                      │ 11 │ 欧亚                                                            │
│ 四川                                      │ 11 │ 欧亚                                                            │
│ 成都                                      │ 11 │ 欧亚                                                            │
│ 美洲                                      │  9 │ 美洲                                                            │
│ 北美洲                                    │  9 │ 美洲                                                            │
│ 欧亚                                      │ 11 │ 欧亚                                                            │
│ 亚洲                                       │ 11 │ 欧亚                                                            │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

获取一个区域的人口。人口数据可以记录在地理基础的文件中。请参见["字典"](../dictionaries#embedded-dictionaries)部分。如果该区域的人口没有记录，则返回 0。 在地理基础中，子区域可能记录人口，但父区域可能没有记录。

**语法**

``` sql
regionToPopulation(id[, geobase])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 该区域的人口。 [UInt32](../data-types/int-uint)。
- 如果没有则返回 0。

**示例**

查询：

``` sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

结果：

``` text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ 世界                                      │ 4294967295 │
│ 美国                                      │  330000000 │
│ 科罗拉多                                   │    5700000 │
│ 博尔德县                                   │     330000 │
│ 博尔德                                    │     100000 │
│ 中国                                      │ 1500000000 │
│ 四川                                      │   83000000 │
│ 成都                                      │   20000000 │
│ 美洲                                      │ 1000000000 │
│ 北美洲                                    │  600000000 │
│ 欧亚                                      │ 4294967295 │
│ 亚洲                                       │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

检查 `lhs` 区域是否属于 `rhs` 区域。如果属于，则返回等于 1 的 UInt8 数字，如果不属于，则返回 0。

**语法**

``` sql
regionIn(lhs, rhs\[, geobase\])
```

**参数**

- `lhs` — 地理基础中的左侧区域 ID。 [UInt32](../data-types/int-uint)。
- `rhs` — 地理基础中的右侧区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 如果属于则返回 1。 [UInt8](../data-types/int-uint)。
- 如果不属于则返回 0。

**实现细节**

关系具有自反性 – 任何区域也属于自己。

**示例**

查询：

``` sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' 是 ' : ' 不是 ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

结果：

``` text
世界 是 世界
世界 不是 美国
世界 不是 科罗拉多
世界 不是 博尔德县
世界 不是 博尔德    
美国 是 世界
美国 是 美国
美国 不是 科罗拉多
美国 不是 博尔德县
美国 不是 博尔德    
```

### regionHierarchy {#regionhierarchy}

接受一个 UInt32 数字 – 来自地理基础的区域 ID。返回一个区域 ID 的数组，包括传递的区域及其所有父区域。

**语法**

``` sql
regionHierarchy(id\[, geobase\])
```

**参数**

- `id` — 地理基础中的区域 ID。 [UInt32](../data-types/int-uint)。
- `geobase` — 字典键。参见 [多个地理基础](#multiple-geobases)。 [String](../data-types/string)。可选。

**返回值**

- 由传递的区域及其所有父区域组成的区域 ID 数组。 [Array](../data-types/array)([UInt32](../data-types/int-uint))。

**示例**

查询：

``` sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

结果：

``` text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['世界']                                                                                    │
│ [2,10,9,1]     │ ['美国','北美洲','美洲','世界']                                                    │
│ [3,2,10,9,1]   │ ['科罗拉多','美国','北美洲','美洲','世界']                                         │
│ [4,3,2,10,9,1] │ ['博尔德县','科罗拉多','美国','北美洲','美洲','世界']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```
