---
description: 'ClickHouse 中外部字典功能概述'
sidebar_label: '定义字典'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: '字典'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 字典

字典是一种映射（`key -> attributes`），适用于各种类型的参照列表。

ClickHouse 提供了在查询中使用字典的专用函数。与对参照表使用 `JOIN` 相比，使用字典配合这些函数更加简单且高效。

ClickHouse 支持：

- 用于操作外部字典的[一组函数](../../sql-reference/functions/ext-dict-functions.md)。
- 具有特定[函数集](../../sql-reference/functions/embedded-dict-functions.md)的[内置字典](#embedded-dictionaries)。

:::tip 教程
如果您刚开始在 ClickHouse 中使用字典，我们提供了一个涵盖该主题的教程。请参见[此处](tutorial.md)。
:::

您可以基于多种数据源添加自定义字典。字典的源可以是 ClickHouse 表、本地文本或可执行文件、HTTP(s) 资源，或其他 DBMS（数据库管理系统）。更多信息请参见“[字典源](#dictionary-sources)”。

ClickHouse：

- 将字典全部或部分存储在 RAM 中。
- 定期更新字典并动态加载缺失的值。换言之，字典可以被动态加载。
- 允许使用 XML 文件或 [DDL 查询](../../sql-reference/statements/create/dictionary.md)创建字典。

字典配置可以位于一个或多个 XML 文件中。配置路径通过 [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) 参数指定。

根据 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 设置，字典可以在服务器启动时或首次使用时加载。

[dictionaries](/operations/system-tables/dictionaries) 系统表包含关于服务器上已配置字典的信息。对于每个字典，您可以在其中查看：

- 字典的状态。
- 配置参数。
- 指标，例如为字典分配的 RAM 大小，或自字典成功加载以来的查询次数。

<CloudDetails />



## 使用 DDL 查询创建字典 {#creating-a-dictionary-with-a-ddl-query}

可以使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md)创建字典,这是推荐的方法,因为使用 DDL 创建的字典具有以下优势:

- 不会在服务器配置文件中添加额外的记录。
- 字典可以作为一等实体进行操作,就像表或视图一样。
- 可以使用熟悉的 SELECT 语句直接读取数据,而不需要使用字典表函数。请注意,当通过 SELECT 语句直接访问字典时,缓存字典将仅返回缓存的数据,而非缓存字典将返回其存储的所有数据。
- 字典可以轻松重命名。


## 使用配置文件创建字典 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud 不支持使用配置文件创建字典。请使用 DDL 方式(见上文),并以 `default` 用户身份创建字典。
:::

字典配置文件的格式如下:

```xml
<clickhouse>
    <comment>可选元素,可包含任意内容。ClickHouse 服务器将忽略此元素。</comment>

    <!--可选元素。带替换变量的文件名-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- 字典配置。 -->
        <!-- 配置文件中可以包含任意数量的字典配置段。 -->
    </dictionary>

</clickhouse>
```

您可以在同一文件中[配置](#configuring-a-dictionary)任意数量的字典。

:::note
对于小型字典,您可以通过在 `SELECT` 查询中描述它来转换值(参见 [transform](../../sql-reference/functions/other-functions.md) 函数)。此功能与字典功能无关。
:::


## 配置字典 {#configuring-a-dictionary}

<CloudDetails />

如果使用 XML 文件配置字典,字典配置的结构如下:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 复合键配置 -->
    </structure>

    <source>
      <!-- 数据源配置 -->
    </source>

    <layout>
      <!-- 内存布局配置 -->
    </layout>

    <lifetime>
      <!-- 字典在内存中的生存时间 -->
    </lifetime>
</dictionary>
```

对应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md)结构如下:

```sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 复合键或单键配置
SOURCE(...) -- 数据源配置
LAYOUT(...) -- 内存布局配置
LIFETIME(...) -- 字典在内存中的生存时间
```


## 在内存中存储字典 {#storing-dictionaries-in-memory}

在内存中存储字典有多种方式。

我们推荐使用 [flat](#flat)、[hashed](#hashed) 和 [complex_key_hashed](#complex_key_hashed),它们可提供最优的处理速度。

不推荐使用缓存,因为可能存在性能不佳的问题,且难以选择最优参数。更多信息请参阅 [cache](#cache) 部分。

有几种方法可以提高字典性能:

- 在 `GROUP BY` 之后调用处理字典的函数。
- 将要提取的属性标记为单射的。如果不同的键对应不同的属性值,则该属性称为单射的。因此,当 `GROUP BY` 使用通过键获取属性值的函数时,该函数会自动从 `GROUP BY` 中提取出来。

ClickHouse 会对字典错误生成异常。错误示例:

- 无法加载正在访问的字典。
- 查询 `cached` 字典时出错。

您可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看字典列表及其状态。

<CloudDetails />

配置如下所示:

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- 布局设置 -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

对应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- 布局设置
...
```

布局中不包含 `complex-key*` 字样的字典具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型的键,`complex-key*` 字典具有复合键(复杂键,可以是任意类型)。

XML 字典中的 [UInt64](../../sql-reference/data-types/int-uint.md) 键使用 `<id>` 标签定义。

配置示例(列 key_column 的类型为 UInt64):

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

复合 `complex` 键的 XML 字典使用 `<key>` 标签定义。

复合键的配置示例(键包含一个 [String](../../sql-reference/data-types/string.md) 类型的元素):

```xml
...
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
...
```


## 在内存中存储字典的方式 {#ways-to-store-dictionaries-in-memory}

在内存中存储字典数据的各种方法涉及 CPU 和 RAM 使用之间的权衡。字典相关[博客文章](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)的[选择布局](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)段落中发布的决策树是决定使用哪种布局的良好起点。

- [flat](#flat)
- [hashed](#hashed)
- [sparse_hashed](#sparse_hashed)
- [complex_key_hashed](#complex_key_hashed)
- [complex_key_sparse_hashed](#complex_key_sparse_hashed)
- [hashed_array](#hashed_array)
- [complex_key_hashed_array](#complex_key_hashed_array)
- [range_hashed](#range_hashed)
- [complex_key_range_hashed](#complex_key_range_hashed)
- [cache](#cache)
- [complex_key_cache](#complex_key_cache)
- [ssd_cache](#ssd_cache)
- [complex_key_ssd_cache](#complex_key_ssd_cache)
- [direct](#direct)
- [complex_key_direct](#complex_key_direct)
- [ip_trie](#ip_trie)

### flat {#flat}

字典以平面数组的形式完全存储在内存中。字典使用多少内存?内存量与最大键的大小(所使用的空间)成正比。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md),值限制为 `max_array_size`(默认为 500,000)。如果在创建字典时发现更大的键,ClickHouse 会抛出异常并且不创建字典。字典平面数组的初始大小由 `initial_array_size` 设置控制(默认为 1024)。

支持所有类型的数据源。更新时,数据(来自文件或表)会被完整读取。

此方法在所有可用的字典存储方法中提供最佳性能。

配置示例:

```xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

或

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

### hashed {#hashed}

字典以哈希表的形式完全存储在内存中。字典可以包含任意数量的元素和任意标识符。实际上,键的数量可以达到数千万个。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

支持所有类型的数据源。更新时,数据(来自文件或表)会被完整读取。

配置示例:

```xml
<layout>
  <hashed />
</layout>
```

或

```sql
LAYOUT(HASHED())
```

配置示例:

```xml
<layout>
  <hashed>
    <!-- 如果分片数大于 1(默认为 `1`),字典将并行加载数据,
         当一个字典中有大量元素时很有用。 -->
    <shards>10</shards>

    <!-- 并行队列中块的积压大小。

         由于并行加载的瓶颈是重新哈希,为了避免因线程正在进行重新哈希
         而导致停滞,您需要有一些积压。

         10000 是内存和速度之间的良好平衡。
         即使对于 10e10 个元素也可以处理所有负载而不会饥饿。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- 哈希表的最大负载因子,值越大,内存利用率越高
         (浪费的内存越少),但读取/性能可能会下降。

         有效值:[0.5, 0.99]
         默认值:0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

或

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

类似于 `hashed`,但使用更少的内存,代价是更多的 CPU 使用。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

配置示例:


```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

或

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

此类型字典也可以使用 `shards`，对于 `sparse_hashed` 而言比 `hashed` 更为重要,因为 `sparse_hashed` 的速度较慢。

### complex_key_hashed {#complex_key_hashed}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `hashed`。

配置示例:

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

或

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex_key_sparse_hashed {#complex_key_sparse_hashed}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 [sparse_hashed](#sparse_hashed)。

配置示例:

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

或

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed_array {#hashed_array}

字典完全存储在内存中。每个属性存储在一个数组中。键属性以哈希表的形式存储,其中值是属性数组中的索引。字典可以包含任意数量的元素和任意标识符。实际应用中,键的数量可达数千万个。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

支持所有类型的数据源。更新时,数据(来自文件或表)将被完整读取。

配置示例:

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

或

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex_key_hashed_array {#complex_key_hashed_array}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 [hashed_array](#hashed_array)。

配置示例:

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

或

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range_hashed {#range_hashed}

字典以哈希表的形式存储在内存中,包含一个有序的范围数组及其对应的值。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。
此存储方法的工作方式与 hashed 相同,并且除键之外还允许使用日期/时间(任意数值类型)范围。

示例:表中包含每个广告商的折扣信息,格式如下:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```


要在日期范围中使用采样时，请在[结构](#dictionary-key-and-fields)中定义 `range_min` 和 `range_max` 元素。这些元素必须包含 `name` 和 `type` 元素（如果未指定 `type`，则使用默认类型为 Date）。`type` 可以是任意数值类型（Date / DateTime / UInt64 / Int32 / 其他）。

:::note
`range_min` 和 `range_max` 的值应在 `Int64` 类型的取值范围内。
:::

示例：

```xml
<layout>
    <range_hashed>
        <!-- 重叠范围的处理策略 (min/max)。默认值：min（返回 range_min 到 range_max 值最小的匹配范围） -->
        <range_lookup_strategy>min</range_lookup_strategy>
    </range_hashed>
</layout>
<structure>
    <id>
        <name>advertiser_id</name>
    </id>
    <range_min>
        <name>discount_start_date</name>
        <type>Date</type>
    </range_min>
    <range_max>
        <name>discount_end_date</name>
        <type>Date</type>
    </range_max>
    ...
```

或者

```sql
CREATE DICTIONARY discounts_dict (
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Date,
    amount Float64
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'discounts'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN discount_start_date MAX discount_end_date)
```

要使用这些字典，需要向 `dictGet` 函数传递一个额外的参数，并为该参数指定一个范围：

```sql
dictGet('dict_name', 'attr_name', id, date)
```

查询示例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

此函数返回指定 `id` 的值，以及包含所传入日期的日期区间。

算法细节：

* 如果未找到该 `id`，或为该 `id` 未找到任何区间，则返回该属性类型的默认值。
* 如果存在重叠区间且 `range_lookup_strategy=min`，则返回 `range_min` 最小的匹配区间；如果找到多个区间，则返回其中 `range_max` 最小的区间；如果仍有多个区间（多个区间的 `range_min` 和 `range_max` 相同），则从中随机返回一个区间。
* 如果存在重叠区间且 `range_lookup_strategy=max`，则返回 `range_min` 最大的匹配区间；如果找到多个区间，则返回其中 `range_max` 最大的区间；如果仍有多个区间（多个区间的 `range_min` 和 `range_max` 相同），则从中随机返回一个区间。
* 如果 `range_max` 为 `NULL`，则该区间在上界处为开区间。`NULL` 被视为可能的最大值。对于 `range_min`，可以使用 `1970-01-01` 或 `0`（-MAX&#95;INT）作为下界开区间的值。

配置示例：

```xml
<clickhouse>
    <dictionary>
        ...

        <layout>
            <range_hashed />
        </layout>

        <structure>
            <id>
                <name>Abcdef</name>
            </id>
            <range_min>
                <name>StartTimeStamp</name>
                <type>UInt64</type>
            </range_min>
            <range_max>
                <name>EndTimeStamp</name>
                <type>UInt64</type>
            </range_max>
            <attribute>
                <name>XXXType</name>
                <type>String</type>
                <null_value />
            </attribute>
        </structure>

    </dictionary>
</clickhouse>
```

或

```sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

包含重叠区间和开区间的配置示例：

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;
```


INSERT INTO discounts VALUES (1, '2015-01-01', Null, 0.1);
INSERT INTO discounts VALUES (1, '2015-01-15', Null, 0.2);
INSERT INTO discounts VALUES (2, '2015-01-01', '2015-01-15', 0.3);
INSERT INTO discounts VALUES (2, '2015-01-04', '2015-01-10', 0.4);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-15', 0.5);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-10', 0.6);

SELECT * FROM discounts ORDER BY advertiser_id, discount_start_date;
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│             1 │          2015-01-01 │              ᴺᵁᴸᴸ │    0.1 │
│             1 │          2015-01-15 │              ᴺᵁᴸᴸ │    0.2 │
│             2 │          2015-01-01 │        2015-01-15 │    0.3 │
│             2 │          2015-01-04 │        2015-01-10 │    0.4 │
│             3 │          1970-01-01 │        2015-01-15 │    0.5 │
│             3 │          1970-01-01 │        2015-01-10 │    0.6 │
└───────────────┴─────────────────────┴───────────────────┴────────┘

-- RANGE_LOOKUP_STRATEGY 'max'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'max'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- 只有一个范围匹配：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 有两个范围匹配，range_min 为 2015-01-15 (0.2)，大于 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 有两个范围匹配，range_min 为 2015-01-04 (0.4)，大于 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 有两个范围匹配，range_min 相等，2015-01-15 (0.5) 大于 2015-01-10 (0.6)
└─────┘

DROP DICTIONARY discounts_dict;

-- RANGE_LOOKUP_STRATEGY 'min'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'min'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- 只有一个范围匹配：2015-01-01 - Null
└─────┘



select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 匹配两个范围,range_min 2015-01-01 (0.1) 小于 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 匹配两个范围,range_min 2015-01-01 (0.3) 小于 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 匹配两个范围,range_min 相等,2015-01-10 (0.6) 小于 2015-01-15 (0.5)
└─────┘

````

### complex_key_range_hashed {#complex_key_range_hashed}

字典以哈希表的形式存储在内存中,包含一个有序的范围数组及其对应的值(参见 [range_hashed](#range_hashed))。此存储类型用于复合[键](#dictionary-key-and-fields)。

配置示例:

```sql
CREATE DICTIONARY range_dictionary
(
  CountryID UInt64,
  CountryKey String,
  StartDate Date,
  EndDate Date,
  Tax Float64 DEFAULT 0.2
)
PRIMARY KEY CountryID, CountryKey
SOURCE(CLICKHOUSE(TABLE 'date_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
````

### cache {#cache}

字典存储在具有固定单元数的缓存中。这些单元包含频繁使用的元素。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

查询字典时,首先搜索缓存。对于每个数据块,所有在缓存中未找到或已过期的键都会使用 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 从数据源请求。然后将接收到的数据写入缓存。

如果在字典中未找到键,则会创建更新缓存任务并添加到更新队列中。更新队列属性可以通过 `max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 等设置来控制。

对于缓存字典,可以设置缓存中数据的过期[生命周期](#refreshing-dictionary-data-using-lifetime)。如果自加载单元中的数据以来经过的时间超过 `lifetime`,则不使用该单元的值,键变为过期状态。下次需要使用该键时会重新请求。此行为可以通过 `allow_read_expired_keys` 设置来配置。

这是所有字典存储方式中效率最低的。缓存的速度在很大程度上取决于正确的设置和使用场景。缓存类型字典仅在命中率足够高时(建议 99% 及以上)才能表现良好。您可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看平均命中率。

如果将 `allow_read_expired_keys` 设置为 1(默认为 0),则字典可以支持异步更新。如果客户端请求的键都在缓存中,但其中一些已过期,则字典将向客户端返回过期的键,并从数据源异步请求它们。

要提高缓存性能,请使用带有 `LIMIT` 的子查询,并在外部调用字典函数。

支持所有类型的数据源。

设置示例:


```xml
<layout>
    <cache>
        <!-- 缓存大小，以单元格数量表示。向上舍入到 2 的幂次方。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 允许读取已过期的键。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新队列的最大大小。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 将更新任务推送到队列的最大超时时间（毫秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 等待更新任务完成的最大超时时间（毫秒）。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- 缓存字典更新的最大线程数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

或

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

设置足够大的缓存大小。您需要通过实验来选择单元格数量：

1.  设置某个值。
2.  运行查询直到缓存完全填满。
3.  使用 `system.dictionaries` 表评估内存消耗。
4.  增加或减少单元格数量，直到达到所需的内存消耗。

:::note
不要使用 ClickHouse 作为数据源，因为它处理随机读取查询的速度较慢。
:::

### complex_key_cache {#complex_key_cache}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `cache`。

### ssd_cache {#ssd_cache}

类似于 `cache`，但将数据存储在 SSD 上，索引存储在 RAM 中。所有与更新队列相关的缓存字典设置也可以应用于 SSD 缓存字典。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

```xml
<layout>
    <ssd_cache>
        <!-- 基本读取块的大小（字节）。建议等于 SSD 的页面大小。 -->
        <block_size>4096</block_size>
        <!-- 缓存文件的最大大小（字节）。 -->
        <file_size>16777216</file_size>
        <!-- 用于从 SSD 读取元素的 RAM 缓冲区大小（字节）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- 用于在刷新到 SSD 之前聚合元素的 RAM 缓冲区大小（字节）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- 缓存文件的存储路径。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

或

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `ssd_cache`。

### direct {#direct}

字典不存储在内存中，在处理请求期间直接访问数据源。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

支持所有类型的[数据源](#dictionary-sources)，本地文件除外。

配置示例：

```xml
<layout>
  <direct />
</layout>
```

或

```sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `direct`。

### ip_trie {#ip_trie}

此字典专为通过网络前缀进行 IP 地址查找而设计。它以 CIDR 表示法存储 IP 范围，并允许快速确定给定 IP 属于哪个前缀（例如子网或 ASN 范围），使其非常适合基于 IP 的搜索，如地理位置或网络分类。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza'
  title='使用 ip_trie 字典进行基于 IP 的搜索'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

**示例**

假设我们在 ClickHouse 中有一个包含 IP 前缀和映射的表：

```sql
CREATE TABLE my_ip_addresses (
    prefix String,
    asn UInt32,
    cca2 String
)
ENGINE = MergeTree
PRIMARY KEY prefix;
```


```sql
INSERT INTO my_ip_addresses VALUES
    ('202.79.32.0/20', 17501, 'NP'),
    ('2620:0:870::/48', 3856, 'US'),
    ('2a02:6b8:1::/48', 13238, 'RU'),
    ('2001:db8::/32', 65536, 'ZZ')
;
```

让我们为这个表定义一个 `ip_trie` 字典。`ip_trie` 字典的布局需要使用复合键：

```xml
<structure>
    <key>
        <attribute>
            <name>prefix</name>
            <type>String</type>
        </attribute>
    </key>
    <attribute>
            <name>asn</name>
            <type>UInt32</type>
            <null_value />
    </attribute>
    <attribute>
            <name>cca2</name>
            <type>String</type>
            <null_value>??</null_value>
    </attribute>
    ...
</structure>
<layout>
    <ip_trie>
        <!-- 可以通过 dictGetString 检索键属性 `prefix`。 -->
        <!-- 此选项会增加内存使用量。 -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

或

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix String,
    asn UInt32,
    cca2 String DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(CLICKHOUSE(TABLE 'my_ip_addresses'))
LAYOUT(IP_TRIE)
LIFETIME(3600);
```

键中只能有一个 `String` 类型的属性，用于包含允许的 IP 前缀。目前尚不支持其他类型。

语法如下：

```sql
dictGetT('dict_name', 'attr_name', ip)
```

该函数可以接收 IPv4 的 `UInt32` 类型，或 IPv6 的 `FixedString(16)` 类型。例如：

```sql
SELECT dictGet('my_ip_trie_dictionary', 'cca2', toIPv4('202.79.32.10')) AS result;

┌─result─┐
│ NP     │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', 'asn', IPv6StringToNum('2001:db8::1')) AS result;

┌─result─┐
│  65536 │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', ('asn', 'cca2'), IPv6StringToNum('2001:db8::1')) AS result;

┌─result───────┐
│ (65536,'ZZ') │
└──────────────┘
```

其他类型尚不支持。该函数返回与该 IP 地址对应前缀的属性。如果存在重叠前缀，则返回最具体的一个。

数据必须完全装入内存。


## 使用 LIFETIME 刷新字典数据 {#refreshing-dictionary-data-using-lifetime}

ClickHouse 根据 `LIFETIME` 标签(以秒为单位定义)定期更新字典。`LIFETIME` 是完全下载字典的更新间隔,也是缓存字典的失效间隔。

在更新期间,仍然可以查询字典的旧版本。字典更新(首次加载字典时除外)不会阻塞查询。如果更新期间发生错误,错误会被写入服务器日志,查询可以继续使用字典的旧版本。如果字典更新成功,旧版本的字典会被原子性地替换。

配置示例:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

或

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

设置 `<lifetime>0</lifetime>` (`LIFETIME(0)`) 可以阻止字典更新。

您可以设置更新的时间间隔,ClickHouse 将在此范围内选择一个均匀随机的时间。这对于在大量服务器上更新时分散字典源的负载是必要的。

配置示例:

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

或

```sql
LIFETIME(MIN 300 MAX 360)
```

如果 `<min>0</min>` 和 `<max>0</max>`,ClickHouse 不会按超时重新加载字典。
在这种情况下,如果字典配置文件被更改或执行了 `SYSTEM RELOAD DICTIONARY` 命令,ClickHouse 可以提前重新加载字典。

更新字典时,ClickHouse 服务器根据[源](#dictionary-sources)的类型应用不同的逻辑:

- 对于文本文件,它会检查修改时间。如果时间与先前记录的时间不同,则更新字典。
- 来自其他源的字典默认每次都会更新。

对于其他源(ODBC、PostgreSQL、ClickHouse 等),您可以设置一个查询,仅在字典真正发生变化时才更新字典,而不是每次都更新。要做到这一点,请按照以下步骤操作:

- 字典表必须有一个字段,该字段在源数据更新时始终会发生变化。
- 源的设置必须指定一个查询来检索变化的字段。ClickHouse 服务器将查询结果解释为一行,如果该行相对于其先前状态发生了变化,则更新字典。在[源](#dictionary-sources)的设置中的 `<invalidate_query>` 字段中指定查询。

配置示例:

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

或

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

对于 `Cache`、`ComplexKeyCache`、`SSDCache` 和 `SSDComplexKeyCache` 字典,同时支持同步和异步更新。

对于 `Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` 字典,也可以仅请求在上次更新后发生变化的数据。如果将 `update_field` 指定为字典源配置的一部分,则上次更新时间的值(以秒为单位)将被添加到数据请求中。根据源类型(Executable、HTTP、MySQL、PostgreSQL、ClickHouse 或 ODBC),在从外部源请求数据之前,将对 `update_field` 应用不同的逻辑。


* 如果源是 HTTP，则会将 `update_field` 作为查询参数添加，其参数值为上次更新时间。
* 如果源是 Executable，则会将 `update_field` 作为可执行脚本的参数添加，其参数值为上次更新时间。
* 如果源是 ClickHouse、MySQL、PostgreSQL、ODBC，则会在 `WHERE` 子句中增加一个条件，其中 `update_field` 与上次更新时间进行大于或等于的比较。
  * 默认情况下，此 `WHERE` 条件在 SQL 查询的最高层级进行检查。或者，也可以在查询中的任何其他 `WHERE` 子句中使用 `{condition}` 关键字进行检查。示例：
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

如果设置了 `update_field` 选项，则可以额外设置 `update_lag` 选项。在请求更新数据之前，会先从上次更新时间中减去 `update_lag` 选项的值。

设置示例：

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

或

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```


## 字典数据源 {#dictionary-sources}

<CloudDetails />

字典可以通过多种不同的数据源接入 ClickHouse。

如果使用 XML 文件配置字典，配置如下所示：

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- 数据源配置 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

在使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 时，上述配置形式如下：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- 数据源配置
...
```

数据源在 `source` 部分中进行配置。

对于 [Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse) 这些数据源类型，可以配置可选参数：

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

或

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

数据源类型（`source_type`）：

- [本地文件](#local-file)
- [可执行文件](#executable-file)
- [可执行进程池](#executable-pool)
- [HTTP(S)](#https)
- DBMS（数据库管理系统）
  - [ODBC](#odbc)
  - [MySQL](#mysql)
  - [ClickHouse](#clickhouse)
  - [MongoDB](#mongodb)
  - [Redis](#redis)
  - [Cassandra](#cassandra)
  - [PostgreSQL](#postgresql)

### 本地文件 {#local-file}

配置示例：

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

或

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

设置项说明：

- `path` – 文件的绝对路径。
- `format` – 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建以 `FILE` 作为数据源的字典时，源文件必须位于 `user_files` 目录中，以防止数据库用户访问 ClickHouse 节点上的任意文件。

**另请参阅**

- [Dictionary 函数](/sql-reference/table-functions/dictionary)

### 可执行文件 {#executable-file}

使用可执行文件作为数据源的方式取决于[字典在内存中的存储方式](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 会通过向可执行文件的标准输入（STDIN）发送请求来获取所需的键。否则，ClickHouse 会启动该可执行文件，并将其输出视为字典数据。

配置示例：

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

设置项说明：


- `command` — 可执行文件的绝对路径,或文件名(如果命令所在目录在 `PATH` 中)。
- `format` — 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。
- `command_termination_timeout` — 可执行脚本应包含一个主读写循环。字典销毁后,管道将关闭,可执行文件将有 `command_termination_timeout` 秒的时间来关闭,之后 ClickHouse 将向子进程发送 SIGTERM 信号。`command_termination_timeout` 以秒为单位指定。默认值为 10。可选参数。
- `command_read_timeout` - 从命令标准输出读取数据的超时时间,以毫秒为单位。默认值为 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时时间,以毫秒为单位。默认值为 10000。可选参数。
- `implicit_key` — 可执行源文件可以仅返回值,与请求键的对应关系由结果中行的顺序隐式确定。默认值为 false。
- `execute_direct` - 如果 `execute_direct` = `1`,则将在 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索 `command`。可以使用空格分隔符指定额外的脚本参数。示例:`script_name arg1 arg2`。如果 `execute_direct` = `0`,则 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `0`。可选参数。
- `send_chunk_header` - 控制在发送数据块进行处理之前是否发送行数。可选。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建具有可执行源的字典已被禁用;否则,数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### 可执行池 {#executable-pool}

可执行池允许从进程池加载数据。此源不适用于需要从源加载所有数据的字典布局。如果字典使用 `cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct` 或 `complex_key_direct` 布局[存储](#ways-to-store-dictionaries-in-memory),则可执行池可以工作。

可执行池将使用指定的命令生成一个进程池,并保持它们运行直到退出。程序应在数据可用时从 STDIN 读取数据,并将结果输出到 STDOUT。它可以等待 STDIN 上的下一个数据块。ClickHouse 在处理完一个数据块后不会关闭 STDIN,而是在需要时传输另一个数据块。可执行脚本应准备好以这种方式处理数据——它应轮询 STDIN 并尽早将数据刷新到 STDOUT。

设置示例:

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

设置字段:


- `command` — 可执行文件的绝对路径,或文件名(如果程序目录已写入 `PATH`)。
- `format` — 文件格式。支持"[格式](/sql-reference/formats)"中描述的所有格式。
- `pool_size` — 连接池大小。如果 `pool_size` 指定为 0,则不限制连接池大小。默认值为 `16`。
- `command_termination_timeout` — 可执行脚本应包含主读写循环。字典销毁后,管道关闭,可执行文件将有 `command_termination_timeout` 秒的时间进行关闭,之后 ClickHouse 将向子进程发送 SIGTERM 信号。以秒为单位。默认值为 10。可选参数。
- `max_command_execution_time` — 处理数据块时可执行脚本命令的最大执行时间。以秒为单位。默认值为 10。可选参数。
- `command_read_timeout` - 从命令标准输出读取数据的超时时间,以毫秒为单位。默认值为 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时时间,以毫秒为单位。默认值为 10000。可选参数。
- `implicit_key` — 可执行源文件只能返回值,与请求键的对应关系由结果中行的顺序隐式确定。默认值为 false。可选参数。
- `execute_direct` - 如果 `execute_direct` = `1`,则将在 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索 `command`。可以使用空格分隔符指定额外的脚本参数。示例:`script_name arg1 arg2`。如果 `execute_direct` = `0`,则 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `1`。可选参数。
- `send_chunk_header` - 控制在发送要处理的数据块之前是否发送行数。可选参数。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建具有可执行源的字典已被禁用,否则数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### HTTP(S) {#https}

与 HTTP(S) 服务器的交互取决于[字典在内存中的存储方式](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储,ClickHouse 通过 `POST` 方法发送请求来获取所需的键。

配置示例:

```xml
<source>
    <http>
        <url>http://[::1]/os.tsv</url>
        <format>TabSeparated</format>
        <credentials>
            <user>user</user>
            <password>password</password>
        </credentials>
        <headers>
            <header>
                <name>API-KEY</name>
                <value>key</value>
            </header>
        </headers>
    </http>
</source>
```

或

```sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

为了使 ClickHouse 能够访问 HTTPS 资源,必须在服务器配置中[配置 openSSL](../../operations/server-configuration-parameters/settings.md#openssl)。

配置字段:

- `url` – 源 URL。
- `format` – 文件格式。支持"[格式](/sql-reference/formats)"中描述的所有格式。
- `credentials` – 基本 HTTP 身份验证。可选参数。
- `user` – 身份验证所需的用户名。
- `password` – 身份验证所需的密码。
- `headers` – 用于 HTTP 请求的所有自定义 HTTP 标头条目。可选参数。
- `header` – 单个 HTTP 标头条目。
- `name` – 在请求中发送标头时使用的标识符名称。
- `value` – 为特定标识符名称设置的值。

使用 DDL 命令(`CREATE DICTIONARY ...`)创建字典时,HTTP 字典的远程主机会根据配置中 `remote_url_allow_hosts` 部分的内容进行检查,以防止数据库用户访问任意 HTTP 服务器。

### DBMS {#dbms}

#### ODBC {#odbc}

可以使用此方法连接任何具有 ODBC 驱动程序的数据库。

配置示例:


```xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>ShemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
    </odbc>
</source>
```

或

```sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

设置字段：

- `db` – 数据库名称。如果数据库名称已在 `<connection_string>` 参数中设置，则可省略。
- `table` – 表名称和模式名（如果存在）。
- `connection_string` – 连接字符串。
- `invalidate_query` – 用于检查字典状态的查询。可选参数。详见 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 章节。
- `background_reconnect` – 连接失败时在后台重新连接到副本。可选参数。
- `query` – 自定义查询。可选参数。

:::note
`table` 和 `query` 字段不能同时使用。必须声明 `table` 或 `query` 字段之一。
:::

ClickHouse 从 ODBC 驱动程序接收引号符号，并在发送给驱动程序的查询中对所有设置进行引用，因此需要根据数据库中表名的大小写正确设置表名。

如果在使用 Oracle 时遇到编码问题,请参阅相应的 [FAQ](/knowledgebase/oracle-odbc) 条目。

##### ODBC 字典功能的已知漏洞 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
通过 ODBC 驱动程序连接数据库时，连接参数 `Servername` 可能被替换。在这种情况下，`odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 值会被发送到远程服务器，可能导致泄露。
:::

**不安全使用示例**

为 PostgreSQL 配置 unixODBC。`/etc/odbc.ini` 的内容：

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

如果执行如下查询

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 驱动程序将把 `odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 值发送到 `some-server.com`。

##### 连接 PostgreSQL 示例 {#example-of-connecting-postgresql}

Ubuntu 操作系统。

安装 unixODBC 和 PostgreSQL 的 ODBC 驱动程序：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

配置 `/etc/odbc.ini`（如果以运行 ClickHouse 的用户身份登录，则配置 `~/.odbc.ini`）：

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL connection to my_db
    Driver              = PostgreSQL Unicode
    Database            = my_db
    Servername          = 127.0.0.1
    UserName            = username
    Password            = password
    Port                = 5432
    Protocol            = 9.3
    ReadOnly            = No
    RowVersioning       = No
    ShowSystemTables    = No
    ConnSettings        =
```

ClickHouse 中的字典配置：


```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 您可以在 connection_string 中指定以下参数: -->
                <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                <connection_string>DSN=myconnection</connection_string>
                <table>postgresql_table</table>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <hashed/>
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>some_column</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

或

```sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

您可能需要编辑 `odbc.ini` 文件以指定驱动程序库的完整路径 `DRIVER=/usr/local/lib/psqlodbcw.so`。

##### 连接 MS SQL Server 示例 {#example-of-connecting-ms-sql-server}

Ubuntu 操作系统。

安装用于连接 MS SQL 的 ODBC 驱动程序:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

配置驱动程序:

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # 测试 TDS 连接
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # 如果您以运行 ClickHouse 的用户身份登录

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (可选) 测试 ODBC 连接 (要使用 isql 工具,请安装 [unixodbc](https://packages.debian.org/sid/unixodbc) 软件包)
    $ isql -v MSSQL "user" "password"
```

备注:

- 要确定特定 SQL Server 版本支持的最早 TDS 版本,请参阅产品文档或查看 [MS-TDS 产品行为](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

在 ClickHouse 中配置字典:

```xml
<clickhouse>
    <dictionary>
        <name>test</name>
        <source>
            <odbc>
                <table>dict</table>
                <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
            </odbc>
        </source>

        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>

        <layout>
            <flat />
        </layout>

        <structure>
            <id>
                <name>k</name>
            </id>
            <attribute>
                <name>s</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

或


```sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```

#### Mysql {#mysql}

配置示例:

```xml
<source>
  <mysql>
      <port>3306</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <replica>
          <host>example01-1</host>
          <priority>1</priority>
      </replica>
      <replica>
          <host>example01-2</host>
          <priority>1</priority>
      </replica>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

或

```sql
SOURCE(MYSQL(
    port 3306
    user 'clickhouse'
    password 'qwerty'
    replica(host 'example01-1' priority 1)
    replica(host 'example01-2' priority 1)
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

配置字段:

- `port` – MySQL 服务器端口。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。

- `user` – MySQL 用户名。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。

- `password` – MySQL 用户密码。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。

- `replica` – 副本配置段。可以包含多个配置段。

        - `replica/host` – MySQL 主机地址。
        - `replica/priority` – 副本优先级。尝试连接时,ClickHouse 按优先级顺序遍历副本。数值越小,优先级越高。

- `db` – 数据库名称。

- `table` – 表名称。

- `where` – 筛选条件。条件语法与 MySQL 的 `WHERE` 子句相同,例如 `id > 10 AND id < 20`。可选参数。

- `invalidate_query` – 用于检查字典状态的查询语句。可选参数。详见 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 章节。

- `fail_on_connection_loss` – 控制服务器在连接丢失时行为的配置参数。若为 `true`,则客户端与服务器之间的连接丢失时立即抛出异常。若为 `false`,则 ClickHouse 服务器会在抛出异常前重试执行查询三次。注意,重试会增加响应时间。默认值:`false`。

- `query` – 自定义查询语句。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。且必须声明 `table` 或 `query` 字段之一。
:::

:::note
没有显式的 `secure` 参数。建立 SSL 连接时,安全性为强制要求。
:::

MySQL 可以通过套接字连接到本地主机。为此需设置 `host` 和 `socket`。

配置示例:

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

或


```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

#### ClickHouse {#clickhouse}

配置示例:

```xml
<source>
    <clickhouse>
        <host>example01-01-1</host>
        <port>9000</port>
        <user>default</user>
        <password></password>
        <db>default</db>
        <table>ids</table>
        <where>id=10</where>
        <secure>1</secure>
        <query>SELECT id, value_1, value_2 FROM default.ids</query>
    </clickhouse>
</source>
```

或

```sql
SOURCE(CLICKHOUSE(
    host 'example01-01-1'
    port 9000
    user 'default'
    password ''
    db 'default'
    table 'ids'
    where 'id=10'
    secure 1
    query 'SELECT id, value_1, value_2 FROM default.ids'
));
```

配置字段:

- `host` – ClickHouse 主机地址。如果是本地主机,查询将在无网络活动的情况下处理。为提高容错性,可以创建 [Distributed](../../engines/table-engines/special/distributed.md) 表并在后续配置中使用。
- `port` – ClickHouse 服务器端口。
- `user` – ClickHouse 用户名。
- `password` – ClickHouse 用户密码。
- `db` – 数据库名称。
- `table` – 表名称。
- `where` – 筛选条件。可省略。
- `invalidate_query` – 用于检查字典状态的查询。可选参数。详见 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 章节。
- `secure` - 使用 SSL 连接。
- `query` – 自定义查询语句。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。且必须声明 `table` 或 `query` 字段之一。
:::

#### MongoDB {#mongodb}

配置示例:

```xml
<source>
    <mongodb>
        <host>localhost</host>
        <port>27017</port>
        <user></user>
        <password></password>
        <db>test</db>
        <collection>dictionary_source</collection>
        <options>ssl=true</options>
    </mongodb>
</source>
```

或

```xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

或

```sql
SOURCE(MONGODB(
    host 'localhost'
    port 27017
    user ''
    password ''
    db 'test'
    collection 'dictionary_source'
    options 'ssl=true'
))
```

配置字段:

- `host` – MongoDB 主机地址。
- `port` – MongoDB 服务器端口。
- `user` – MongoDB 用户名。
- `password` – MongoDB 用户密码。
- `db` – 数据库名称。
- `collection` – 集合名称。
- `options` - MongoDB 连接字符串选项(可选参数)。

或

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

配置字段:

- `uri` - 用于建立连接的 URI。
- `collection` – 集合名称。

[关于该引擎的更多信息](../../engines/table-engines/integrations/mongodb.md)

#### Redis {#redis}

配置示例:

```xml
<source>
    <redis>
        <host>localhost</host>
        <port>6379</port>
        <storage_type>simple</storage_type>
        <db_index>0</db_index>
    </redis>
</source>
```

或

```sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

配置字段:


- `host` – Redis 主机地址。
- `port` – Redis 服务器端口。
- `storage_type` – 用于处理键的内部 Redis 存储结构。`simple` 用于简单源和单键哈希源,`hash_map` 用于双键哈希源。不支持范围源和具有复合键的缓存源。可省略,默认值为 `simple`。
- `db_index` – Redis 逻辑数据库的数字索引。可省略,默认值为 0。

#### Cassandra {#cassandra}

配置示例:

```xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspase>database_name</keyspase>
        <column_family>table_name</column_family>
        <allow_filtering>1</allow_filtering>
        <partition_key_prefix>1</partition_key_prefix>
        <consistency>One</consistency>
        <where>"SomeColumn" = 42</where>
        <max_threads>8</max_threads>
        <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
    </cassandra>
</source>
```

配置字段:

- `host` – Cassandra 主机地址或以逗号分隔的主机列表。
- `port` – Cassandra 服务器端口。如果未指定,则使用默认端口 9042。
- `user` – Cassandra 用户名。
- `password` – Cassandra 用户密码。
- `keyspace` – 键空间(数据库)名称。
- `column_family` – 列族(表)名称。
- `allow_filtering` – 是否允许在聚簇键列上使用可能代价高昂的条件。默认值为 1。
- `partition_key_prefix` – Cassandra 表主键中分区键列的数量。复合键字典必需此参数。字典定义中键列的顺序必须与 Cassandra 中的顺序相同。默认值为 1(第一个键列是分区键,其他键列是聚簇键)。
- `consistency` – 一致性级别。可选值:`One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。默认值为 `One`。
- `where` – 可选的筛选条件。
- `max_threads` – 在复合键字典中从多个分区加载数据时使用的最大线程数。
- `query` – 自定义查询语句。可选参数。

:::note
`column_family` 或 `where` 字段不能与 `query` 字段同时使用。并且必须声明 `column_family` 或 `query` 字段中的一个。
:::

#### PostgreSQL {#postgresql}

配置示例:

```xml
<source>
  <postgresql>
      <host>postgresql-hostname</hoat>
      <port>5432</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </postgresql>
</source>
```

或

```sql
SOURCE(POSTGRESQL(
    port 5432
    host 'postgresql-hostname'
    user 'postgres_user'
    password 'postgres_password'
    db 'db_name'
    table 'table_name'
    replica(host 'example01-1' port 5432 priority 1)
    replica(host 'example01-2' port 5432 priority 2)
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

配置字段:


- `host` – PostgreSQL 服务器的主机地址。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。
- `port` – PostgreSQL 服务器的端口。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。
- `user` – PostgreSQL 用户名。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。
- `password` – PostgreSQL 用户密码。可以为所有副本统一指定,也可以在 `<replica>` 内为每个副本单独指定。
- `replica` – 副本配置段。可以包含多个配置段:
  - `replica/host` – PostgreSQL 主机地址。
  - `replica/port` – PostgreSQL 端口。
  - `replica/priority` – 副本优先级。尝试连接时,ClickHouse 按优先级顺序遍历副本。数值越小,优先级越高。
- `db` – 数据库名称。
- `table` – 表名称。
- `where` – 选择条件。条件语法与 PostgreSQL 的 `WHERE` 子句相同。例如:`id > 10 AND id < 20`。可选参数。
- `invalidate_query` – 用于检查字典状态的查询。可选参数。详见 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。
- `background_reconnect` – 连接失败时在后台重新连接副本。可选参数。
- `query` – 自定义查询语句。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。且必须声明 `table` 或 `query` 字段之一。
:::

### Null {#null}

一种特殊数据源,用于创建虚拟(空)字典。此类字典适用于测试场景,或在具有分布式表的节点上使用数据与查询节点分离的配置。

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```


## 字典键和字段 {#dictionary-key-and-fields}

<CloudDetails />

`structure` 子句用于描述字典的键和可供查询使用的字段。

XML 描述:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- 属性参数 -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性在以下元素中描述:

- `<id>` — 键列
- `<attribute>` — 数据列:可以包含多个属性。

DDL 查询:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性在查询主体中描述:

- `PRIMARY KEY` — 键列
- `AttrName AttrType` — 数据列。可以包含多个属性。


## 键 {#key}

ClickHouse 支持以下类型的键:

- 数值键。`UInt64` 类型。在 `<id>` 标签中定义或使用 `PRIMARY KEY` 关键字定义。
- 复合键。不同类型值的集合。在 `<key>` 标签中定义或使用 `PRIMARY KEY` 关键字定义。

XML 结构可以包含 `<id>` 或 `<key>` 其中之一。DDL 查询必须包含单个 `PRIMARY KEY`。

:::note
不能将键描述为属性。
:::

### 数值键 {#numeric-key}

类型:`UInt64`。

配置示例:

```xml
<id>
    <name>Id</name>
</id>
```

配置字段:

- `name` – 包含键的列名称。

DDL 查询:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – 包含键的列名称。

### 复合键 {#composite-key}

键可以是由任意类型字段组成的 `tuple`。在这种情况下,[布局](#storing-dictionaries-in-memory)必须是 `complex_key_hashed` 或 `complex_key_cache`。

:::tip
复合键可以由单个元素组成。例如,这使得可以使用字符串作为键。
:::

键结构在 `<key>` 元素中设置。键字段的指定格式与字典[属性](#dictionary-key-and-fields)相同。示例:

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

或

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

对于 `dictGet*` 函数的查询,元组作为键传递。示例:`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。


## 属性 {#attributes}

配置示例：

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

或

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

配置字段：


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | 列名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Yes      |
| `type`                                               | ClickHouse 数据类型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse 会尝试将字典中的值转换为指定的数据类型。例如，对于 MySQL，源表中的字段可能是 MySQL 的 `TEXT`、`VARCHAR` 或 `BLOB`，但在 ClickHouse 中可以映射为 `String` 类型。<br/>[Nullable](../../sql-reference/data-types/nullable.md) 当前支持以下字典：[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)。在 [IPTrie](#ip_trie) 字典中不支持 `Nullable` 类型。 | Yes      |
| `null_value`                                         | 不存在元素时的默认值。<br/>在示例中，它是一个空字符串。[NULL](../syntax.md#null) 值只能用于 `Nullable` 类型（参见上一行的类型说明）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Yes      |
| `expression`                                         | ClickHouse 在该值上执行的[表达式](../../sql-reference/syntax.md#expressions)。<br/>表达式可以是远程 SQL 数据库中的列名，因此可以用它为远程列创建别名。<br/><br/>默认值：无表达式。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | 如果为 `true`，该属性包含当前键的父键值。参见[分层字典](#hierarchical-dictionaries)。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | No       |
| `injective`                                          | 标志，表示 `id -> attribute` 映射是否为[单射](https://en.wikipedia.org/wiki/Injective_function)。<br/>如果为 `true`，ClickHouse 可以在 `GROUP BY` 子句之后自动对该字典发起查询，通常会显著减少此类请求的数量。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | No       |
| `is_object_id`                                       | 标志，表示查询是否通过 `ObjectID` 针对 MongoDB 文档执行。<br/><br/>默认值：`false`。



## 层级字典 {#hierarchical-dictionaries}

ClickHouse 支持具有[数字键](#numeric-key)的层级字典。

以下是一个层级结构示例:

```text
0 (公共父节点)
│
├── 1 (俄罗斯)
│   │
│   └── 2 (莫斯科)
│       │
│       └── 3 (中心区)
│
└── 4 (英国)
    │
    └── 5 (伦敦)
```

该层级结构可以表示为以下字典表。

| region_id | parent_region | region_name   |
| --------- | ------------- | ------------- |
| 1         | 0             | Russia        |
| 2         | 1             | Moscow        |
| 3         | 2             | Center        |
| 4         | 0             | Great Britain |
| 5         | 4             | London        |

该表包含一个 `parent_region` 列,用于存储元素的直接父节点键。

ClickHouse 支持外部字典属性的层级特性。该特性允许您配置如上所述的层级字典。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 函数用于获取元素的父节点链。

在本示例中,字典结构可以定义如下:

```xml
<dictionary>
    <structure>
        <id>
            <name>region_id</name>
        </id>

        <attribute>
            <name>parent_region</name>
            <type>UInt64</type>
            <null_value>0</null_value>
            <hierarchical>true</hierarchical>
        </attribute>

        <attribute>
            <name>region_name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

    </structure>
</dictionary>
```


## 多边形字典 {#polygon-dictionaries}

此字典专为点在多边形内查询进行了优化,本质上是"反向地理编码"查找。给定一个坐标(纬度/经度),它可以高效地找出哪个多边形/区域(从许多多边形集合中,例如国家或地区边界)包含该点。它非常适合将位置坐标映射到其所属区域。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y'
  title='ClickHouse 中的多边形字典'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

多边形字典配置示例:

<CloudDetails />

```xml
<dictionary>
    <structure>
        <key>
            <attribute>
                <name>key</name>
                <type>Array(Array(Array(Array(Float64))))</type>
            </attribute>
        </key>

        <attribute>
            <name>name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

        <attribute>
            <name>value</name>
            <type>UInt64</type>
            <null_value>0</null_value>
        </attribute>
    </structure>

    <layout>
        <polygon>
            <store_polygon_key_column>1</store_polygon_key_column>
        </polygon>
    </layout>

    ...
</dictionary>
```

对应的 [DDL 查询](/sql-reference/statements/create/dictionary):

```sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

配置多边形字典时,键必须是以下两种类型之一:

- 简单多边形。它是一个点的数组。
- 多重多边形。它是一个多边形数组。每个多边形是一个二维点数组。该数组的第一个元素是多边形的外边界,后续元素指定要从中排除的区域。

点可以指定为其坐标的数组或元组。在当前实现中,仅支持二维点。

用户可以使用 ClickHouse 支持的所有格式上传自己的数据。

有 3 种类型的[内存存储](#storing-dictionaries-in-memory)可用:

- `POLYGON_SIMPLE`。这是一个简单实现,对于每个查询都会线性遍历所有多边形,并检查每个多边形的成员关系,不使用额外的索引。

- `POLYGON_INDEX_EACH`。为每个多边形构建单独的索引,这允许在大多数情况下快速检查其归属关系(针对地理区域进行了优化)。
  此外,在考虑的区域上叠加一个网格,这显著缩小了需要考虑的多边形数量。
  网格通过递归地将单元格划分为 16 个相等部分来创建,并使用两个参数进行配置。
  当递归深度达到 `MAX_DEPTH` 或单元格与不超过 `MIN_INTERSECTIONS` 个多边形相交时,划分停止。
  为了响应查询,会找到相应的单元格,并依次访问存储在其中的多边形的索引。

- `POLYGON_INDEX_CELL`。此布局也会创建上述网格。可用的选项相同。对于每个叶单元格,会在落入其中的所有多边形片段上构建索引,从而可以快速响应请求。

- `POLYGON`。`POLYGON_INDEX_CELL` 的同义词。

字典查询使用标准的[函数](../../sql-reference/functions/ext-dict-functions.md)来处理字典。
一个重要的区别是,这里的键将是您想要查找包含它们的多边形的点。

**示例**

使用上面定义的字典的示例:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

执行最后一条命令的结果是,对于 'points' 表中的每个点,将找到包含该点的最小面积多边形,并输出请求的属性。

**示例**

您可以通过 SELECT 查询从多边形字典中读取列,只需在字典配置或相应的 DDL 查询中启用 `store_polygon_key_column = 1`。

查询:


```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], '值');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

结果：

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ 值 │
└─────────────────────────────────┴───────┘
```


## 正则表达式树字典 {#regexp-tree-dictionary}

此字典允许您基于分层正则表达式模式将键映射到值。它针对模式匹配查找进行了优化(例如通过匹配正则表达式模式对用户代理字符串等字符串进行分类),而非精确键匹配。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX'
  title='ClickHouse 正则表达式树字典简介'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

### 在 ClickHouse 开源版本中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

在 ClickHouse 开源版本中,正则表达式树字典使用 YAMLRegExpTree 源进行定义,该源需要提供包含正则表达式树的 YAML 文件路径。

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

字典源 `YAMLRegExpTree` 表示正则表达式树的结构。例如:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: "TencentOS"
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: "Android"
  versions:
    - regexp: "33/tclwebkit"
      version: "13"
    - regexp: "3[12]/tclwebkit"
      version: "12"
    - regexp: "30/tclwebkit"
      version: "11"
    - regexp: "29/tclwebkit"
      version: "10"
```

此配置由正则表达式树节点列表组成。每个节点具有以下结构:

- **regexp**: 节点的正则表达式。
- **attributes**: 用户定义的字典属性列表。在此示例中,有两个属性:`name` 和 `version`。第一个节点定义了这两个属性。第二个节点仅定义了属性 `name`。属性 `version` 由第二个节点的子节点提供。
  - 属性值可能包含**反向引用**,引用匹配正则表达式的捕获组。在示例中,第一个节点中属性 `version` 的值由反向引用 `\1` 组成,引用正则表达式中的捕获组 `(\d+[\.\d]*)`。反向引用编号范围从 1 到 9,写作 `$1` 或 `\1`(对于编号 1)。在查询执行期间,反向引用会被匹配的捕获组替换。
- **child nodes**: 正则表达式树节点的子节点列表,每个子节点都有自己的属性和(可能的)子节点。字符串匹配以深度优先方式进行。如果字符串匹配某个正则表达式节点,字典会检查它是否也匹配该节点的子节点。如果匹配,则分配最深匹配节点的属性。子节点的属性会覆盖父节点中同名的属性。YAML 文件中子节点的名称可以是任意的,例如上述示例中的 `versions`。

正则表达式树字典仅允许使用函数 `dictGet`、`dictGetOrDefault` 和 `dictGetAll` 进行访问。

示例:

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

结果:

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

在这种情况下,我们首先匹配顶层第二个节点中的正则表达式 `\d+/tclwebkit(?:\d+[\.\d]*)`。然后字典继续查找子节点,并发现该字符串也匹配 `3[12]/tclwebkit`。因此,属性 `name` 的值为 `Android`(在第一层中定义),属性 `version` 的值为 `12`(在子节点中定义)。


通过强大的 YAML 配置文件,我们可以使用正则表达式树字典作为用户代理字符串解析器。我们支持 [uap-core](https://github.com/ua-parser/uap-core),并在功能测试 [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) 中演示了如何使用它

#### 收集属性值 {#collecting-attribute-values}

有时需要返回多个匹配正则表达式的值,而不仅仅是叶节点的值。在这种情况下,可以使用专用函数 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall)。如果节点具有类型为 `T` 的属性值,`dictGetAll` 将返回一个包含零个或多个值的 `Array(T)`。

默认情况下,每个键返回的匹配数量没有限制。可以将限制作为可选的第四个参数传递给 `dictGetAll`。数组按_拓扑顺序_填充,即子节点在父节点之前,兄弟节点按照源中的顺序排列。

示例:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```


```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: "ClickHouse"
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: "ClickHouse Documentation"
      topological_index: 0
      captured: '\1'
      parent: "ClickHouse"

- regexp: "/docs(/|$)"
  tag: "Documentation"
  topological_index: 2

- regexp: "github.com"
  tag: "GitHub"
  topological_index: 3
  captured: "NULL"
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

结果：

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### 匹配模式 {#matching-modes}

可以通过特定的字典设置来修改模式匹配行为：

- `regexp_dict_flag_case_insensitive`：使用不区分大小写的匹配（默认为 `false`）。可以在单个表达式中使用 `(?i)` 和 `(?-i)` 覆盖此设置。
- `regexp_dict_flag_dotall`：允许 '.' 匹配换行符（默认为 `false`）。

### 在 ClickHouse Cloud 中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上述使用的 `YAMLRegExpTree` 数据源在 ClickHouse 开源版本中可用，但在 ClickHouse Cloud 中不可用。要在 ClickHouse Cloud 中使用正则表达式树字典，首先需要在本地 ClickHouse 开源版本中从 YAML 文件创建正则表达式树字典，然后使用 `dictionary` 表函数和 [INTO OUTFILE](../statements/select/into-outfile.md) 子句将此字典导出到 CSV 文件。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV 文件的内容如下：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

导出文件的结构如下：

- `id UInt64`：RegexpTree 节点的 ID。
- `parent_id UInt64`：节点父节点的 ID。
- `regexp String`：正则表达式字符串。
- `keys Array(String)`：用户定义属性的名称。
- `values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建字典，首先创建一个具有以下表结构的表 `regexp_dictionary_source_table`：

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

然后通过以下命令将本地 CSV 导入：

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

您可以查看[插入本地文件](/integrations/data-ingestion/insert-local-files)以获取更多详细信息。在初始化源表之后，我们可以通过表数据源创建 RegexpTree：


```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```


## 嵌入式字典 {#embedded-dictionaries}

<SelfManaged />

ClickHouse 包含用于处理地理数据库的内置功能。

这使您能够:

- 使用地区 ID 获取指定语言的地区名称。
- 使用地区 ID 获取城市、区域、联邦区、国家或大洲的 ID。
- 检查某个地区是否属于另一个地区。
- 获取父级地区链。

所有函数都支持"跨地域性",即能够同时使用不同视角的地区归属关系。有关更多信息,请参阅"用于 Web 分析字典的函数"部分。

内部字典在默认包中是禁用的。
要启用它们,请在服务器配置文件中取消注释 `path_to_regions_hierarchy_file` 和 `path_to_regions_names_files` 参数。

地理数据库从文本文件加载。

将 `regions_hierarchy*.txt` 文件放入 `path_to_regions_hierarchy_file` 目录。此配置参数必须包含 `regions_hierarchy.txt` 文件(默认地区层次结构)的路径,其他文件(如 `regions_hierarchy_ua.txt`)必须位于同一目录中。

将 `regions_names_*.txt` 文件放入 `path_to_regions_names_files` 目录。

您也可以自己创建这些文件。文件格式如下:

`regions_hierarchy*.txt`: TabSeparated(无标题行),列:

- 地区 ID (`UInt32`)
- 父级地区 ID (`UInt32`)
- 地区类型 (`UInt8`): 1 - 大洲,3 - 国家,4 - 联邦区,5 - 地区,6 - 城市;其他类型没有值
- 人口 (`UInt32`) — 可选列

`regions_names_*.txt`: TabSeparated(无标题行),列:

- 地区 ID (`UInt32`)
- 地区名称 (`String`) — 不能包含制表符或换行符,即使是转义的也不行。

使用平面数组在 RAM 中存储。因此,ID 不应超过一百万。

字典可以在不重启服务器的情况下更新。但是,可用字典集不会更新。
对于更新,会检查文件修改时间。如果文件已更改,则更新字典。
检查更改的间隔在 `builtin_dictionaries_reload_interval` 参数中配置。
字典更新(首次使用时加载除外)不会阻塞查询。在更新期间,查询使用旧版本的字典。如果更新期间发生错误,错误会写入服务器日志,查询继续使用旧版本的字典。

我们建议定期更新地理数据库字典。在更新期间,生成新文件并将它们写入单独的位置。当一切准备就绪后,将它们重命名为服务器使用的文件。

还有用于处理操作系统标识符和搜索引擎的函数,但不应使用它们。
