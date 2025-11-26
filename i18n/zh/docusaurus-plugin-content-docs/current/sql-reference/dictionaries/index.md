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

字典是一种映射（`key -> attributes`），便于维护各种类型的参考列表。

ClickHouse 支持在查询中用于操作字典的特殊函数。与对参考表进行 `JOIN` 相比，配合这些函数使用字典更加简单且更高效。

ClickHouse 支持：

- 具备[一组函数](../../sql-reference/functions/ext-dict-functions.md)的字典。
- 具备特定[函数集](../../sql-reference/functions/embedded-dict-functions.md)的[嵌入式字典](#embedded-dictionaries)。

:::tip 教程
如果您刚开始在 ClickHouse 中使用字典，我们提供了一个介绍该主题的教程。请查看[这里](tutorial.md)。
:::

您可以基于各种数据源添加自定义字典。字典的源可以是 ClickHouse 表、本地文本或可执行文件、HTTP(s) 资源，或其他 DBMS（数据库管理系统）。有关更多信息，请参阅“[字典源](#dictionary-sources)”。

ClickHouse：

- 将字典全部或部分存储在 RAM 中。
- 定期更新字典并动态加载缺失的值。换句话说，字典可以被动态加载。
- 允许使用 XML 文件或 [DDL 查询](../../sql-reference/statements/create/dictionary.md)创建字典。

字典的配置可以位于一个或多个 XML 文件中。配置路径在 [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) 参数中指定。

字典可以在服务器启动时或首次使用时加载，具体取决于 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 设置。

[dictionaries](/operations/system-tables/dictionaries) 系统表包含服务器上已配置字典的信息。对于每个字典，您可以在其中查看：

- 字典的状态。
- 配置参数。
- 各类指标，例如为该字典分配的 RAM 容量，或自字典成功加载以来的查询次数。

<CloudDetails />



## 使用 DDL 查询创建字典 {#creating-a-dictionary-with-a-ddl-query}

可以使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md)来创建字典，这是推荐的方法，因为通过 DDL 创建的字典具有以下优点：
- 服务器配置文件中不会新增额外的记录。
- 这些字典可以作为一等公民对象使用，就像表或视图一样。
- 可以直接读取数据，使用熟悉的 SELECT，而不是字典表函数。请注意，当通过 SELECT 语句直接访问字典时，带缓存的字典只会返回已缓存的数据，而不带缓存的字典则会返回其存储的全部数据。
- 可以轻松重命名这些字典。



## 使用配置文件创建字典

<CloudNotSupportedBadge />

:::note
使用配置文件创建字典不适用于 ClickHouse Cloud。请使用 DDL（见上文），并以用户 `default` 创建字典。
:::

字典配置文件的格式如下：

```xml
<clickhouse>
    <comment>可选元素,可包含任意内容。ClickHouse 服务器将忽略此元素。</comment>

    <!--可选元素。包含替换变量的文件名-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- 字典配置 -->
        <!-- 配置文件中可包含任意数量的字典配置段 -->
    </dictionary>

</clickhouse>
```

您可以在同一个文件中[配置](#configuring-a-dictionary)任意数量的字典。

:::note
对于较小的字典，您可以在 `SELECT` 查询中对其进行描述来转换其值（参见 [transform](../../sql-reference/functions/other-functions.md) 函数）。该功能与字典无关。
:::


## 配置字典

<CloudDetails />

如果通过 XML 文件配置字典，则字典配置的结构如下：

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
      <!-- 字典内存生命周期 -->
    </lifetime>
</dictionary>
```

相应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 的结构如下：

```sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 复合主键或单主键配置
SOURCE(...) -- 数据源配置
LAYOUT(...) -- 内存布局配置
LIFETIME(...) -- 字典内存生命周期
```


## 在内存中存储字典

在内存中有多种方式可以存储字典。

我们推荐使用 [flat](#flat)、[hashed](#hashed) 和 [complex&#95;key&#95;hashed](#complex_key_hashed)，它们能够提供最佳的处理速度。

不推荐使用缓存，因为其性能可能较差且难以选择合适的参数。更多信息参见 [cache](#cache) 部分。

可以通过以下几种方式提升字典性能：

* 在 `GROUP BY` 之后再调用用于操作字典的函数。
* 将要提取的属性标记为 injective（单射）。如果不同的键对应不同的属性值，则称该属性为单射。因此，当 `GROUP BY` 中使用按键获取属性值的函数时，该函数会被自动从 `GROUP BY` 中提取出来单独执行。

ClickHouse 会针对字典相关的错误抛出异常。错误示例：

* 无法加载被访问的字典。
* 查询 `cached` 字典时出错。

可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看字典列表及其状态。

<CloudDetails />

配置如下所示：

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

对应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md)：

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- 布局设置
...
```

在布局名称中不包含单词 `complex-key*` 的字典，其键类型为 [UInt64](../../sql-reference/data-types/int-uint.md)，而布局名称包含 `complex-key*` 的字典则具有复合键（复杂键，可由任意类型组合构成）。

在 XML 字典中，使用 `<id>` 标签来定义 [UInt64](../../sql-reference/data-types/int-uint.md) 类型的键。

配置示例（列 `key_column` 的类型为 UInt64）：

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

复合 `complex` 键的 XML 字典通过 `<key>` 标签进行定义。

复合键的配置示例（键包含一个 [String](../../sql-reference/data-types/string.md) 类型的元素）：

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


## 在内存中存储字典的方式

在内存中存储字典数据的各种方法，在 CPU 和 RAM 使用方面各有取舍。字典相关[博客文章](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)中 [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 一节给出的决策树，是选择使用哪种布局的良好起点。

* [flat](#flat)
* [hashed](#hashed)
* [sparse&#95;hashed](#sparse_hashed)
* [complex&#95;key&#95;hashed](#complex_key_hashed)
* [complex&#95;key&#95;sparse&#95;hashed](#complex_key_sparse_hashed)
* [hashed&#95;array](#hashed_array)
* [complex&#95;key&#95;hashed&#95;array](#complex_key_hashed_array)
* [range&#95;hashed](#range_hashed)
* [complex&#95;key&#95;range&#95;hashed](#complex_key_range_hashed)
* [cache](#cache)
* [complex&#95;key&#95;cache](#complex_key_cache)
* [ssd&#95;cache](#ssd_cache)
* [complex&#95;key&#95;ssd&#95;cache](#complex_key_ssd_cache)
* [direct](#direct)
* [complex&#95;key&#95;direct](#complex_key_direct)
* [ip&#95;trie](#ip_trie)

### flat

字典以扁平数组的形式完全存储在内存中。字典会使用多少内存？其占用量与最大键的大小（占用的空间）成正比。

字典键使用 [UInt64](../../sql-reference/data-types/int-uint.md) 类型，值的数量被限制为 `max_array_size`（默认 — 500,000）。如果在创建字典时发现更大的键，ClickHouse 会抛出异常且不会创建字典。字典扁平数组的初始大小由 `initial_array_size` 设置控制（默认 — 1024）。

支持所有类型的数据源。在更新时，会将数据（来自文件或表）完整读入内存。

这种方法在所有可用的字典存储方式中性能最佳。

配置示例：

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

### hashed

字典以哈希表的形式完整存储在内存中。字典可以包含任意数量、具有任意标识符的元素。在实际应用中，键的数量可以达到数千万级。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

支持所有类型的数据源。在更新时，会将数据（来自文件或表）完整读取一遍。

配置示例：

```xml
<layout>
  <hashed />
</layout>
```

或

```sql
LAYOUT(HASHED())
```

配置示例：

```xml
<layout>
  <hashed>
    <!-- 如果分片数大于 1(默认为 `1`),字典将并行加载数据,
         适用于字典中包含大量元素的场景。 -->
    <shards>10</shards>

    <!-- 并行队列中块的积压队列大小。

         由于并行加载的瓶颈在于重新哈希,为避免线程执行重新哈希时发生阻塞,
         需要设置一定的积压队列。

         10000 是内存占用和加载速度之间的良好平衡点。
         即使对于 10e10 个元素也能处理全部负载而不会出现饥饿现象。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- 哈希表的最大负载因子。值越大,内存利用率越高(浪费的内存越少),
         但读取性能可能会下降。

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

### sparse&#95;hashed

类似于 `hashed`，但以更高的 CPU 开销为代价使用更少的内存。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

配置示例：


```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

或者

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

对于此类字典也可以使用 `shards`。同样，对于 `sparse_hashed` 来说，这比对 `hashed` 更关键，因为 `sparse_hashed` 更慢。

### complex&#95;key&#95;hashed

此类存储用于复合[键](#dictionary-key-and-fields)，与 `hashed` 类似。

配置示例：

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

### complex&#95;key&#95;sparse&#95;hashed

该存储类型用于复合[键](#dictionary-key-and-fields)。与 [sparse&#95;hashed](#sparse_hashed) 类似。

配置示例：

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

### hashed&#95;array

该字典完全存储在内存中。每个属性都存储在一个数组中。键属性以哈希表的形式存储，其中值为属性数组中的索引。字典可以包含具有任意标识符的任意数量的元素。在实际使用中，键的数量可以达到数千万级。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

支持所有类型的数据源。更新时会完整读取数据（无论来自文件还是表）。

配置示例：

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

或者

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex&#95;key&#95;hashed&#95;array

此存储类型用于复合[键](#dictionary-key-and-fields)。类似于 [hashed&#95;array](#hashed_array)。

配置示例：

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

或

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range&#95;hashed

字典在内存中以哈希表的形式存储，并包含一个有序的范围数组及其对应的值。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。
这种存储方式与 `hashed` 相同，并且在键之外还允许使用日期/时间（任意数值类型）范围。

示例：表中按如下格式存储了每个广告主的折扣信息：

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```


要在日期范围上使用采样，请在[结构](#dictionary-key-and-fields)中定义 `range_min` 和 `range_max` 元素。这些元素必须包含 `name` 和 `type` 字段（如果未指定 `type`，则会使用默认类型 Date）。`type` 可以是任意数值类型（Date / DateTime / UInt64 / Int32 / 其他）。

:::note
`range_min` 和 `range_max` 的值必须能用 `Int64` 类型表示。
:::

示例：

```xml
<layout>
    <range_hashed>
        <!-- 重叠范围的处理策略（最小值/最大值）。默认值：min（返回 range_min 到 range_max 值最小的匹配范围） -->
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

或

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

要使用这些字典，你需要向 `dictGet` 函数传递一个额外的参数，并为该参数选取一个范围：

```sql
dictGet('dict_name', 'attr_name', id, date)
```

查询示例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

此函数返回在包含所传入日期的日期范围内，指定 `id` 对应的值。

算法细节：

* 如果找不到该 `id`，或者为该 `id` 找不到范围，则返回该属性类型的默认值。
* 如果存在重叠范围且 `range_lookup_strategy=min`，则返回一个匹配范围，其 `range_min` 最小；如果找到多个范围，则返回其中 `range_max` 最小的范围；如果仍然找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`），则从中随机返回一个范围。
* 如果存在重叠范围且 `range_lookup_strategy=max`，则返回一个匹配范围，其 `range_min` 最大；如果找到多个范围，则返回其中 `range_max` 最大的范围；如果仍然找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`），则从中随机返回一个范围。
* 如果 `range_max` 为 `NULL`，则该范围在上界是开放的（无上界）。`NULL` 被视为可能的最大值。对于 `range_min`，可以使用 `1970-01-01` 或 `0`（-MAX&#95;INT）作为表示无下界的值。

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
│ 0.1 │ -- 只有一个匹配的区间：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 有两个匹配的区间，range_min 2015-01-15 (0.2) 大于 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 有两个匹配的区间，range_min 2015-01-04 (0.4) 大于 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 有两个匹配的区间，range_min 相同，2015-01-15 (0.5) 大于 2015-01-10 (0.6)
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
│ 0.1 │ -- 只有一个匹配的区间：2015-01-01 - Null
└─────┘



select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 1, toDate(&#39;2015-01-16&#39;)) res;
┌─res─┐
│ 0.1 │ -- 有两个区间匹配，range&#95;min 2015-01-01 (0.1) 小于 2015-01-15 (0.2)
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 2, toDate(&#39;2015-01-06&#39;)) res;
┌─res─┐
│ 0.3 │ -- 有两个区间匹配，range&#95;min 2015-01-01 (0.3) 小于 2015-01-04 (0.4)
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 3, toDate(&#39;2015-01-01&#39;)) res;
┌─res─┐
│ 0.6 │ -- 有两个区间匹配，range&#95;min 相同，2015-01-10 (0.6) 小于 2015-01-15 (0.5)
└─────┘

````

### complex_key_range_hashed

字典以哈希表的形式存储在内存中,包含一个有序的范围数组及其对应的值(参见 [range_hashed](#range_hashed))。此存储类型用于组合[键](#dictionary-key-and-fields)。

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

### cache

字典存储在具有固定数量单元格（槽位）的缓存中。这些单元格保存经常使用的元素。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

在查询字典时，系统会首先在缓存中查找。对于每个数据块，所有在缓存中未找到或已过期的键都会通过 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 向源端请求。接收到的数据随后写入缓存。

如果在字典中未找到键，则会创建缓存更新任务并将其添加到更新队列中。可以通过设置 `max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 来控制更新队列的属性。

对于缓存型（cache）字典，可以设置缓存中数据的过期[生命周期](#refreshing-dictionary-data-using-lifetime)。如果自单元格中的数据加载后经过的时间超过 `lifetime`，则不再使用该单元格的值，并将该键标记为过期。下一次需要使用该键时会重新请求。可以通过 `allow_read_expired_keys` 设置来配置此行为。

这是所有字典存储方式中效率最低的一种。缓存的性能在很大程度上取决于正确的设置和使用场景。仅当缓存命中率足够高时（推荐 99% 及以上），缓存型（cache）字典才能有良好表现。可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看平均命中率。

如果将 `allow_read_expired_keys` 设置为 1（默认值为 0），则字典可以支持异步更新。如果客户端请求的键全部在缓存中，但其中一些已过期，则字典会将这些过期值返回给客户端，并在后台异步向源端请求这些键的数据。

要提高缓存性能，请在子查询中使用 `LIMIT`，并在外层查询中调用使用该字典的函数。

支持所有类型的数据源。

设置示例：


```xml
<layout>
    <cache>
        <!-- 缓存大小,以单元格数量计。向上取整至2的幂。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 允许读取已过期的键。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新队列的最大容量。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 将更新任务推入队列的最大超时时间(毫秒)。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 等待更新任务完成的最大超时时间(毫秒)。 -->
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

设置足够大的缓存大小。你需要通过试验来选择 cell 的数量：

1. 设置一个初始值。
2. 运行查询，直到缓存被完全填满。
3. 使用 `system.dictionaries` 表评估内存消耗。
4. 增加或减少 cell 数量，直到达到所需的内存占用。

:::note
不要使用 ClickHouse 作为数据源，因为它在处理包含随机读取的查询时速度较慢。
:::

### complex&#95;key&#95;cache

该存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `cache`。

### ssd&#95;cache

类似于 `cache`，但将数据存储在 SSD 上，将索引存储在 RAM 中。所有与更新队列相关的缓存字典设置同样适用于 SSD 缓存字典。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

```xml
<layout>
    <ssd_cache>
        <!-- 基本读取块的字节大小。建议设置为与 SSD 页面大小相等。 -->
        <block_size>4096</block_size>
        <!-- 缓存文件的最大字节大小。 -->
        <file_size>16777216</file_size>
        <!-- 用于从 SSD 读取元素的 RAM 缓冲区字节大小。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- 用于在刷新到 SSD 之前聚合元素的 RAM 缓冲区字节大小。 -->
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

### complex&#95;key&#95;ssd&#95;cache

此类存储用于复合 [keys](#dictionary-key-and-fields)。与 `ssd_cache` 类似。

### direct

字典不会存储在内存中，而是在处理请求时直接访问源。

字典键的类型为 [UInt64](../../sql-reference/data-types/int-uint.md)。

除本地文件外，支持所有类型的 [数据源](#dictionary-sources)。

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

### complex&#95;key&#95;direct

此类存储用于复合[键](#dictionary-key-and-fields)，与 `direct` 类似。

### ip&#95;trie

此字典专为通过网络前缀进行 IP 地址查找而设计。它以 CIDR 表示法存储 IP 范围，并支持快速确定给定 IP 所属的前缀（例如子网或 ASN 范围），非常适合用于基于 IP 的搜索，如地理定位或网络分类。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="使用 ip_trie 字典进行基于 IP 的搜索" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**示例**

假设我们在 ClickHouse 中有一个表，其中包含我们的 IP 前缀及其映射关系：

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

让我们为该表定义一个 `ip_trie` 字典。`ip_trie` 布局需要使用复合键：

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
        <!-- 键属性 `prefix` 可通过 dictGetString 检索。 -->
        <!-- 此选项将增加内存使用量。 -->
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

此密钥只能有一个 `String` 类型的属性，该属性包含允许的 IP 前缀。暂不支持其他类型。

语法如下：

```sql
dictGetT('dict_name', 'attr_name', ip)
```

该函数的参数类型为：IPv4 使用 `UInt32`，IPv6 使用 `FixedString(16)`。例如：

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

其他类型暂不支持。该函数返回与该 IP 地址对应前缀的属性。如果存在重叠前缀，则返回最具体的前缀。

数据必须完全装入内存（RAM）。


## 使用 LIFETIME 刷新字典数据

ClickHouse 会根据以秒为单位定义的 `LIFETIME` 参数定期更新字典。`LIFETIME` 对于完整加载的字典表示更新间隔，对于缓存字典表示失效间隔。

在更新期间，仍然可以查询字典的旧版本。字典更新（首次加载字典以供使用除外）不会阻塞查询。如果在更新过程中发生错误，错误会被写入服务器日志，查询可以继续使用旧版本的字典。如果字典更新成功，旧版本的字典会以原子方式被替换。

设置示例：

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

将 `<lifetime>0</lifetime>`（`LIFETIME(0)`）设置为 0 会阻止字典更新。

你可以为更新设置一个时间间隔，ClickHouse 会在这个时间范围内均匀随机选择一个时间点。这样可以在大量服务器进行更新时，将对字典源的负载分散开来。

设置示例：

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

如果 `<min>0</min>` 和 `<max>0</max>`，ClickHouse 不会根据超时时间重新加载字典。
在这种情况下，如果字典配置文件发生了更改，或者执行了 `SYSTEM RELOAD DICTIONARY` 命令，ClickHouse 仍然可以提前重新加载字典。

在更新字典时，ClickHouse 服务器会根据[源](#dictionary-sources)类型采用不同的逻辑：

* 对于文本文件，它会检查修改时间。如果该时间与之前记录的时间不同，就会更新字典。
* 来自其他源的字典默认每次都会更新。

对于其他源（ODBC、PostgreSQL、ClickHouse 等），可以设置一个查询，使得只有在数据确实发生变化时才更新字典，而不是每次都更新。为此，请执行以下步骤：

* 字典表必须有一个字段，在源数据更新时该字段总是会改变。
* 在源的设置中必须指定一个查询，用于查询该变更字段。ClickHouse 服务器将查询结果解释为一行，如果这一行相对于之前的状态发生了变化，就会更新字典。在该[源](#dictionary-sources)的设置中，将查询指定在 `<invalidate_query>` 字段中。

设置示例：

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

对于 `Cache`、`ComplexKeyCache`、`SSDCache` 和 `SSDComplexKeyCache` 字典，支持同步和异步两种更新方式。

对于 `Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` 字典，也可以仅请求自上次更新后发生变更的数据。如果在字典源配置中指定了 `update_field`，则会在数据请求中附带上一次更新时间（以秒为单位）的值。根据源类型（Executable、HTTP、MySQL、PostgreSQL、ClickHouse 或 ODBC）的不同，在从外部源请求数据之前，会对 `update_field` 应用不同的处理逻辑。


* 如果数据源是 HTTP，则会将 `update_field` 作为查询参数附加到请求中，参数值为上次更新时间。
* 如果数据源是 Executable，则会将 `update_field` 作为可执行脚本的参数添加，参数值为上次更新时间。
* 如果数据源是 ClickHouse、MySQL、PostgreSQL、ODBC，则会在 `WHERE` 子句中追加额外条件，将 `update_field` 与上次更新时间进行大于或等于的比较。
  * 默认情况下，此 `WHERE` 条件会在 SQL 查询的最高层级进行检查。或者，也可以在查询中的任意其他 `WHERE` 子句中使用 `{condition}` 关键字来检查该条件。示例：
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

如果设置了 `update_field` 选项，则可以额外设置 `update_lag` 选项。在请求增量数据之前，会先从前一次更新时间中减去 `update_lag` 选项的值。

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


## 字典来源

<CloudDetails />

可以将 ClickHouse 中的字典连接到许多不同的数据源。

如果使用 XML 文件配置字典，其配置如下：

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

对于 [DDL-query](../../sql-reference/statements/create/dictionary.md) 的情况，上述配置如下所示：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- 数据源配置
...
```

源在 `source` 部分中进行配置。

对于源类型 [本地文件](#local-file)、[可执行文件](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)，
提供以下可选设置：

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

源类型（`source_type`）：

* [本地文件](#local-file)
* [可执行文件](#executable-file)
* [可执行文件池](#executable-pool)
* [HTTP(S)](#https)
* DBMS
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)

### 本地文件

设置示例：

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

字段设置：

* `path` – 文件的绝对路径。
* `format` – 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建以 `FILE` 作为来源的字典时，源文件必须位于 `user_files` 目录中，以防止数据库用户访问 ClickHouse 节点上的任意文件。

**另请参阅**

* [Dictionary 函数](/sql-reference/table-functions/dictionary)

### Executable File

与可执行文件的交互方式取决于[字典如何存储在内存中](#storing-dictionaries-in-memory)。如果字典使用 `cache` 或 `complex_key_cache` 存储，ClickHouse 会通过向可执行文件的 STDIN（标准输入）发送请求来获取所需的键。否则，ClickHouse 会启动该可执行文件，并将其输出视为字典数据。

设置示例：

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

字段设置：


* `command` — 可执行文件的绝对路径，或文件名（当该命令所在目录已包含在 `PATH` 中时）。
* `format` — 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。
* `command_termination_timeout` — 可执行脚本应包含一个主读写循环。在字典被销毁后，管道会被关闭，在 ClickHouse 向子进程发送 SIGTERM 信号之前，可执行文件将有 `command_termination_timeout` 秒的时间自行退出。`command_termination_timeout` 以秒为单位。默认值为 10。可选参数。
* `command_read_timeout` - 从命令的 STDOUT 读取数据的超时时间（毫秒）。默认值为 10000。可选参数。
* `command_write_timeout` - 向命令的 STDIN 写入数据的超时时间（毫秒）。默认值为 10000。可选参数。
* `implicit_key` — 可执行源仅需返回值，与请求键的对应关系是隐式确定的——通过结果中行的顺序来确定。默认值为 `false`。
* `execute_direct` - 如果 `execute_direct` = `1`，则会在由 [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 `user_scripts` 目录中查找 `command`。可以使用空格分隔符指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，`command` 会作为 `bin/sh -c` 的参数传递。默认值为 `0`。可选参数。
* `send_chunk_header` - 控制在发送一个数据块进行处理之前，是否先发送行数。可选参数。默认值为 `false`。

该字典源只能通过 XML 配置进行设置。通过 DDL 创建带有可执行源的字典已被禁用；否则，数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### Executable Pool

Executable pool 允许从一组进程（进程池）中加载数据。该源不适用于需要从源一次性加载全部数据的字典布局。只有当字典[以以下布局存储](#ways-to-store-dictionaries-in-memory)时，Executable pool 才能工作：`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct` 或 `complex_key_direct`。

Executable pool 会使用指定的命令启动一个进程池，并保持这些进程一直运行直到它们退出。程序应在 STDIN 有数据时从中读取，并将结果输出到 STDOUT。它可以在 STDIN 上等待下一块数据。ClickHouse 在处理完一块数据后不会关闭 STDIN，而是在需要时通过管道发送下一块数据。可执行脚本应为这种数据处理方式做好准备——应轮询 STDIN，并尽早将数据刷新到 STDOUT。

设置示例：

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

字段设置：


* `command` — 可执行文件的绝对路径，或者文件名（如果程序所在目录已加入 `PATH`）。
* `format` — 文件格式。支持 “[Formats](/sql-reference/formats)” 中描述的所有格式。
* `pool_size` — 池的大小。如果将 `pool_size` 指定为 0，则不限制池的大小。默认值为 `16`。
* `command_termination_timeout` — 可执行脚本应包含主读写循环。在字典被销毁后，管道会被关闭，可执行文件在 ClickHouse 向子进程发送 SIGTERM 信号之前，有 `command_termination_timeout` 秒的时间完成退出。以秒为单位。默认值为 10。可选参数。
* `max_command_execution_time` — 处理数据块时可执行脚本命令的最长执行时间。以秒为单位。默认值为 10。可选参数。
* `command_read_timeout` - 从命令的 stdout 读取数据的超时时间（毫秒）。默认值为 10000。可选参数。
* `command_write_timeout` - 向命令的 stdin 写入数据的超时时间（毫秒）。默认值为 10000。可选参数。
* `implicit_key` — 可执行源文件可以只返回值，与请求键的对应关系由结果中行的顺序隐式确定。默认值为 false。可选参数。
* `execute_direct` - 如果 `execute_direct` = `1`，则会在由 [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user&#95;scripts 目录中查找 `command`。可以使用空格分隔来指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则将 `command` 作为 `bin/sh -c` 的参数传入。默认值为 `1`。可选参数。
* `send_chunk_header` - 控制在发送一块待处理数据之前，是否先发送行数。可选参数。默认值为 `false`。

这类字典源只能通过 XML 配置进行设置。已禁用通过 DDL 创建带有可执行源的字典，否则数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### HTTP(S)

与 HTTP(S) 服务器的交互取决于[字典在内存中的存储方式](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 会通过 `POST` 方法发送请求以获取所需的键。

设置示例：

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

为了让 ClickHouse 访问 HTTPS 资源，必须在服务器配置中[配置 OpenSSL](../../operations/server-configuration-parameters/settings.md#openssl)。

设置字段：

* `url` – 源 URL。
* `format` – 文件格式。支持“[Formats](/sql-reference/formats)”中描述的所有格式。
* `credentials` – 基本 HTTP 认证。可选参数。
* `user` – 认证所需的用户名。
* `password` – 认证所需的密码。
* `headers` – HTTP 请求中使用的所有自定义 HTTP 头部条目。可选参数。
* `header` – 单个 HTTP 头部条目。
* `name` – 在请求中发送的该头部所使用的名称。
* `value` – 为特定名称设置的值。

使用 DDL 命令（`CREATE DICTIONARY ...`）创建字典时，会将 HTTP 字典的远程主机与配置中 `remote_url_allow_hosts` 部分的内容进行比对，以防止数据库用户访问任意 HTTP 服务器。

### DBMS

#### ODBC

可以使用此方法连接任何具有 ODBC 驱动程序的数据库。

设置示例：


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

* `db` – 数据库名称。如果在 `<connection_string>` 参数中已经设置了数据库名称，则可以省略。
* `table` – 表名称以及（如果存在）schema 名称。
* `connection_string` – 连接字符串。
* `invalidate_query` – 用于检查字典状态的查询。可选参数。详情参见[使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime)一节。
* `background_reconnect` – 连接失败时在后台重连到副本。可选参数。
* `query` – 自定义查询。可选参数。

:::note
`table` 和 `query` 字段不能同时使用，并且必须在两者中选择其一进行声明。
:::

ClickHouse 从 ODBC 驱动接收引号符号（quoting symbols），并在发送给驱动的查询中为所有设置加上引号，因此有必要按照数据库中表名的大小写精确设置表名。

如果在使用 Oracle 时遇到编码问题，请参阅相应的 [FAQ](/knowledgebase/oracle-odbc) 条目。

##### ODBC 字典功能的已知漏洞

:::note
通过 ODBC 驱动连接到数据库时，连接参数 `Servername` 可能被替换为其他值。在这种情况下，来自 `odbc.ini` 的 `USERNAME` 和 `PASSWORD` 值会被发送到远程服务器，并可能被泄露。
:::

**不安全用法示例**

以 PostgreSQL 为例配置 unixODBC。`/etc/odbc.ini` 的内容如下：

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

接下来如果执行如下查询：

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 驱动程序会将 `odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 的值发送到 `some-server.com`。

##### 连接 PostgreSQL 的示例

Ubuntu 操作系统。

安装 unixODBC 和 PostgreSQL 的 ODBC 驱动程序：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

配置 `/etc/odbc.ini`（或者，如果你是以运行 ClickHouse 的用户身份登录，则配置 `~/.odbc.ini`）：

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL 连接至 my_db
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
                <!-- 可在 connection_string 中指定以下参数: -->
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

您可能需要编辑 `odbc.ini`，以指定驱动程序库的完整路径，例如 `DRIVER=/usr/local/lib/psqlodbcw.so`。

##### 连接 MS SQL Server 的示例

Ubuntu 操作系统。

安装用于连接到 Microsoft SQL Server 的 ODBC 驱动程序：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

配置驱动程序：

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
    # $ cat ~/.odbc.ini # 如果以运行 ClickHouse 的用户身份登录

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (可选)测试 ODBC 连接(使用 isql 工具需安装 [unixodbc](https://packages.debian.org/sid/unixodbc) 软件包)
    $ isql -v MSSQL "user" "password"
```

备注：

* 若要确定某个特定 SQL Server 版本所支持的最低 TDS 版本，请参阅相应产品文档，或查看 [MS-TDS 产品行为](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

在 ClickHouse 中配置字典：

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

#### MySQL

配置示例：

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

配置字段：

* `port` – MySQL 服务器的端口。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。

* `user` – MySQL 用户名。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。

* `password` – MySQL 用户的密码。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。

* `replica` – 副本配置节。可以存在多个该节。

  * `replica/host` – MySQL 主机名。
  * `replica/priority` – 副本优先级。在尝试连接时，ClickHouse 会按优先级顺序遍历副本。数值越小，优先级越高。

* `db` – 数据库名称。

* `table` – 表名。

* `where` – 选择条件。条件语法与 MySQL 中 `WHERE` 子句的语法相同，例如 `id > 10 AND id < 20`。可选参数。

* `invalidate_query` – 用于检查字典状态的查询。可选参数。详见[使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime)一节。

* `fail_on_connection_loss` – 控制服务器在连接丢失时行为的配置参数。如果为 `true`，当客户端与服务器之间的连接丢失时会立即抛出异常。如果为 `false`，ClickHouse 服务器会在抛出异常前重试执行该查询三次。请注意，重试会增加响应时间。默认值：`false`。

* `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。并且必须声明 `table` 或 `query` 字段中的一个。
:::

:::note
不存在显式参数 `secure`。建立 SSL 连接时必须使用安全连接。
:::

MySQL 可以通过本地主机上的套接字进行连接。为此，请设置 `host` 和 `socket`。

配置示例：

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

#### ClickHouse

配置示例：

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

设置字段：

* `host` – ClickHouse 主机。如果是本地主机，则查询会在没有任何网络开销的情况下被处理。为提高容错性，可以创建一个 [Distributed](../../engines/table-engines/special/distributed.md) 表，并在后续配置中使用它。
* `port` – ClickHouse 服务器端口。
* `user` – ClickHouse 用户名。
* `password` – ClickHouse 用户密码。
* `db` – 数据库名称。
* `table` – 表名。
* `where` – 选择条件。可以省略。
* `invalidate_query` – 用于检查字典状态的查询语句。可选参数。更多信息参见[使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime)一节。
* `secure` - 使用 SSL 建立连接。
* `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用，并且必须声明 `table` 或 `query` 字段中的一个。
:::

#### MongoDB

设置示例：

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

或者

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

设置字段：

* `host` – MongoDB 主机地址。
* `port` – MongoDB 服务器端口。
* `user` – MongoDB 用户名。
* `password` – MongoDB 用户密码。
* `db` – 数据库名称。
* `collection` – 集合名称。
* `options` -  MongoDB 连接字符串选项（可选参数）。

或

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

设置字段：

* `uri` - 用于建立连接的 URI。
* `collection` – 集合名称。

[有关该引擎的更多信息](../../engines/table-engines/integrations/mongodb.md)

#### Redis

设置示例：

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

字段设置：


* `host` – Redis 主机。
* `port` – Redis 服务器的端口。
* `storage_type` – 用于处理键的 Redis 内部存储结构类型。`simple` 适用于简单源以及带哈希的单键源，`hash_map` 适用于具有两个键的哈希源。不支持范围型源以及具有复杂键的缓存源。可以省略，默认值为 `simple`。
* `db_index` – Redis 逻辑数据库的数值索引。可以省略，默认值为 0。

#### Cassandra

设置示例：

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

设置字段：

* `host` – Cassandra 主机或以逗号分隔的主机列表。
* `port` – Cassandra 服务器的端口。如果未指定，则使用默认端口 9042。
* `user` – Cassandra 用户名。
* `password` – Cassandra 用户密码。
* `keyspace` – keyspace（数据库）名称。
* `column_family` – 列族（表）名称。
* `allow_filtering` – 是否允许在聚簇键列上使用可能开销较大的条件的标志。默认值为 1。
* `partition_key_prefix` – Cassandra 表主键中分区键列的数量。复合键字典必需。字典定义中键列的顺序必须与 Cassandra 中的顺序一致。默认值为 1（第一个键列是分区键，其余键列是聚簇键）。
* `consistency` – 一致性级别。可能的取值：`One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。默认值为 `One`。
* `where` – 可选筛选条件。
* `max_threads` – 在复合键字典中从多个分区加载数据时使用的最大线程数。
* `query` – 自定义查询。可选参数。

:::note
`column_family` 或 `where` 字段不能与 `query` 字段同时使用，并且 `column_family` 或 `query` 字段中必须至少声明一个。
:::

#### PostgreSQL

设置示例：

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

字段设置：


* `host` – PostgreSQL 服务器上的主机地址。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。
* `port` – PostgreSQL 服务器上的端口。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。
* `user` – PostgreSQL 用户名。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。
* `password` – PostgreSQL 用户的密码。可以为所有副本统一指定，也可以在每个副本中单独指定（在 `<replica>` 内部）。
* `replica` – 副本配置段。可以有多个此类段：
  * `replica/host` – PostgreSQL 主机。
  * `replica/port` – PostgreSQL 端口。
  * `replica/priority` – 副本优先级。在尝试建立连接时，ClickHouse 会按优先级顺序遍历副本。数字越小，优先级越高。
* `db` – 数据库名称。
* `table` – 表名称。
* `where` – 选择条件。条件语法与 PostgreSQL 中 `WHERE` 子句相同。例如，`id > 10 AND id < 20`。可选参数。
* `invalidate_query` – 用于检查字典状态的查询。可选参数。更多信息请参见章节 [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)。
* `background_reconnect` – 如果连接失败，则在后台重新连接到副本。可选参数。
* `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段同时使用。并且必须声明 `table` 或 `query` 字段中的一个。
:::

### Null

一种特殊的数据源，可用于创建虚拟（空）字典。此类字典在测试时，或在数据节点与查询节点分离、并在包含 Distributed 表的节点上时非常有用。

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


## 字典键和字段

<CloudDetails />

`structure` 子句描述了可用于查询的字典键和字段。

XML 描述：

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

属性通过以下元素来描述：

* `<id>` — 键列
* `<attribute>` — 数据列：可以有多个属性。

DDL 查询：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

在查询体中定义属性：

* `PRIMARY KEY` — 主键列
* `AttrName AttrType` — 数据列。可以包含多个属性。


## 键

ClickHouse 支持以下类型的键：

* 数值键。`UInt64`。在 `<id>` 标签中定义，或使用 `PRIMARY KEY` 关键字定义。
* 复合键。由不同类型的值组成的集合。在 `<key>` 标签中定义，或使用 `PRIMARY KEY` 关键字定义。

一个 XML 结构中只能包含 `<id>` 或 `<key>` 其中之一。DDL 查询中必须且只能包含一个 `PRIMARY KEY`。

:::note
不得将键描述为属性。
:::

### 数值键

类型：`UInt64`。

配置示例：

```xml
<id>
    <name>ID</name>
</id>
```

配置字段：

* `name` – 键列名称。

对于 DDL 查询语句：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – 键列的名称。

### 复合键

键可以是由任意字段类型组成的 `tuple`。在这种情况下，[layout](#storing-dictionaries-in-memory) 必须是 `complex_key_hashed` 或 `complex_key_cache`。

:::tip
复合键可以只包含一个元素。例如，这样就可以使用字符串作为键。
:::

键结构在 `<key>` 元素中进行设置。键字段的指定格式与字典的[属性](#dictionary-key-and-fields)相同。示例：

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

在对 `dictGet*` 函数进行查询时，会将一个元组作为键传递。示例：`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。


## 属性

配置示例：

```xml
<structure>
    ...
    <attribute>
        <name>名称</name>
        <type>ClickHouse 数据类型</type>
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

配置项：


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | 列名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Yes      |
| `type`                                               | ClickHouse 数据类型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse 会尝试将字典中的值转换为指定的数据类型。比如，对于 MySQL，源表中的字段可以是 `TEXT`、`VARCHAR` 或 `BLOB`，但在 ClickHouse 中可以作为 `String` 类型导入。<br/>[Nullable](../../sql-reference/data-types/nullable.md) 目前支持以下字典类型：[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)。在 [IPTrie](#ip_trie) 字典中不支持 `Nullable` 类型。 | Yes      |
| `null_value`                                         | 不存在元素时的默认值。<br/>在示例中，这是一个空字符串。只有在 `Nullable` 类型中（参见上一行的类型说明）才可以使用 [NULL](../syntax.md#null) 值。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Yes      |
| `expression`                                         | ClickHouse 在该值上执行的[表达式](../../sql-reference/syntax.md#expressions)。<br/>表达式可以是远程 SQL 数据库中的列名。因此，可以使用它为远程列创建别名。<br/><br/>默认值：无表达式。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | 如果为 `true`，则该属性包含当前键的父键值。参见 [Hierarchical Dictionaries](#hierarchical-dictionaries)。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       |
| `injective`                                          | 用于指示 `id -> attribute` 映射是否为[单射](https://en.wikipedia.org/wiki/Injective_function)的标志。<br/>如果为 `true`，ClickHouse 可以自动将对这些单射字典的查询重写为在 `GROUP BY` 子句之后执行。通常可以显著减少此类请求的数量。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `is_object_id`                                       | 表示查询是否通过 `ObjectID` 针对 MongoDB 文档执行的标志。<br/><br/>默认值：`false`。



## 分层字典

ClickHouse 支持带有[数值键](#numeric-key)的分层字典。

请看如下层次结构：

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

这一层级结构可以用下列字典表来表示。

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

该表包含一个 `parent_region` 列，其中存储了每个元素最近父级元素的键。

ClickHouse 为外部字典属性提供了层级属性。通过该属性，您可以按上述方式配置层级字典。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 函数可用于获取某个元素的父级链。

在我们的示例中，字典的结构可以如下：

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


## 多边形字典

此类字典针对点在多边形内（point-in-polygon）的查询进行了优化，本质上用于执行“逆地理编码”类型的查找。给定一个坐标（纬度/经度），它可以高效地在一组多边形（例如国家或区域边界）中找到包含该点的多边形/区域。它非常适合将位置坐标映射到其所属的区域。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse 中的多边形字典" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

多边形字典配置示例：

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

对应的 [DDL 查询](/sql-reference/statements/create/dictionary)：

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

在配置 polygon 字典时，键必须是以下两种类型之一：

* 简单多边形。它是一个点的数组。
* MultiPolygon。它是一个多边形数组。每个多边形是一个二维点数组。该数组的第一个元素是多边形的外边界，后续元素指定需要从中排除的区域。

点可以被指定为其坐标的数组或元组。在当前实现中，仅支持二维点。

用户可以以 ClickHouse 支持的所有格式上传自己的数据。

有 3 种可用的[内存存储](#storing-dictionaries-in-memory)类型：

* `POLYGON_SIMPLE`。这是一个朴素实现，对于每个查询都会线性遍历所有多边形，并在不使用额外索引的情况下检查每一个是否包含该点。

* `POLYGON_INDEX_EACH`。为每个多边形单独构建索引，这在大多数情况下可以快速检查某点是否属于该多边形（针对地理区域进行了优化）。
  同时，在待考虑的区域上叠加一个网格，这显著缩小了需要考虑的多边形数量。
  该网格通过递归地将单元格划分为 16 个相等部分来创建，并通过两个参数进行配置。
  当递归深度达到 `MAX_DEPTH` 或单元格至多与 `MIN_INTERSECTIONS` 个多边形相交时，划分会停止。
  在响应查询时，会定位到对应的单元格，并依次访问存储在其中的多边形索引。

* `POLYGON_INDEX_CELL`。这种布局同样会创建上面描述的网格。可用的选项相同。对于每个网格单元，会基于落入其中的所有多边形片段构建索引，从而能够快速响应请求。

* `POLYGON`。是 `POLYGON_INDEX_CELL` 的同义词。

对字典的查询使用用于操作字典的标准[函数](../../sql-reference/functions/ext-dict-functions.md)来执行。
一个重要的区别是，这里的键是那些你希望查找其所在多边形的点。

**示例**

使用上面定义的字典的示例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

在对 `points` 表中每个点执行上述最后一条命令后，将找到包含该点的最小面积多边形，并输出所需的属性。

**示例**

你可以通过 `SELECT` 查询从多边形字典中读取列，只需在字典配置或相应的 DDL 查询中将 `store_polygon_key_column = 1` 打开即可。

查询：


```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

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
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```


## 正则表达式树字典

该字典允许根据分层的正则表达式模式将键映射到值。它针对模式匹配查找进行了优化（例如，通过匹配正则表达式来对诸如 User-Agent 字符串之类的字符串进行分类），而不是精确键匹配。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse 正则表达式树字典简介" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

### 在 ClickHouse 开源版本中使用正则表达式树字典

在 ClickHouse 开源版本中，正则表达式树字典是使用 `YAMLRegExpTree` 源来定义的，该源需要提供一个指向包含正则表达式树的 YAML 文件的路径。

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

字典源 `YAMLRegExpTree` 表示正则表达式树的结构。例如：

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

此配置由一组正则表达式树节点组成。每个节点具有以下结构：

* **regexp**：该节点的正则表达式。
* **attributes**：用户定义的字典属性列表。在此示例中，有两个属性：`name` 和 `version`。第一个节点同时定义了这两个属性。第二个节点只定义属性 `name`。属性 `version` 由第二个节点的子节点提供。
  * 属性的值可以包含**反向引用**，引用匹配到的正则表达式中的捕获组。在示例中，第一个节点中属性 `version` 的值由对正则表达式中捕获组 `(\d+[\.\d]*)` 的反向引用 `\1` 组成。反向引用编号范围为 1 到 9，写作 `$1` 或 `\1`（对于编号 1）。在查询执行过程中，反向引用会被对应的捕获组匹配结果替换。
* **child nodes**：正则表达式树节点的子节点列表，每个子节点都有自己的属性以及（可能存在的）子节点。字符串匹配以深度优先的方式进行。如果某个字符串匹配了一个正则表达式节点，字典会检查它是否也匹配该节点的子节点。如果是，则会赋予最深层匹配节点的属性。子节点的属性会覆盖父节点中同名的属性。YAML 文件中子节点的名称可以任意，例如上述示例中的 `versions`。

正则表达式树字典仅允许通过函数 `dictGet`、`dictGetOrDefault` 和 `dictGetAll` 进行访问。

示例：

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

结果：

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

在这个例子中，我们首先在顶层的第二个节点中匹配正则表达式 `\d+/tclwebkit(?:\d+[\.\d]*)`。然后字典继续遍历其子节点，并发现该字符串也匹配 `3[12]/tclwebkit`。因此，属性 `name` 的值为 `Android`（定义于第一层），属性 `version` 的值为 `12`（定义于子节点）。


借助功能强大的 YAML 配置文件，我们可以使用基于正则表达式树的字典作为 user agent 字符串解析器。我们支持 [uap-core](https://github.com/ua-parser/uap-core)，并在功能测试 [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) 中演示了如何使用它。

#### 收集属性值

有时，返回所有匹配到的多个正则表达式的值，而不仅仅是叶子节点的值，会非常有用。在这种情况下，可以使用专门的 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 函数。如果某个节点具有类型为 `T` 的属性值，`dictGetAll` 将返回一个包含零个或多个值的 `Array(T)`。

默认情况下，每个键返回的匹配个数没有上限。可以通过向 `dictGetAll` 传递一个可选的第四个参数来设置上限。数组按照*拓扑顺序*填充，这意味着子节点先于父节点，兄弟节点按照源定义中的顺序排列。

示例：

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
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse 文档'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: '文档'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
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
│ clickhouse.com/docs/en                 │ (['ClickHouse 文档','ClickHouse'],[0,1],['/en'],['ClickHouse'])                       │
│ github.com/clickhouse/tree/master/docs │ (['文档','GitHub'],[2,3],[NULL],[])                                                    │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### 匹配模式

可以通过某些字典设置来修改模式匹配行为：

* `regexp_dict_flag_case_insensitive`：使用不区分大小写的匹配（默认为 `false`）。可以在单个表达式中通过 `(?i)` 和 `(?-i)` 覆盖该行为。
* `regexp_dict_flag_dotall`：允许 `.` 匹配换行符（默认为 `false`）。

### 在 ClickHouse Cloud 中使用正则表达式树字典

上文使用的 `YAMLRegExpTree` 源在 ClickHouse 开源版本中可用，但在 ClickHouse Cloud 中不可用。要在 ClickHouse Cloud 中使用正则表达式树字典，首先在本地的 ClickHouse 开源版本中通过 YAML 文件创建一个正则表达式树字典，然后使用 `dictionary` 表函数和 [INTO OUTFILE](../statements/select/into-outfile.md) 子句将该字典导出为 CSV 文件。

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

导出文件的模式为：

* `id UInt64`：RegexpTree 节点的 id。
* `parent_id UInt64`：该节点父节点的 id。
* `regexp String`：正则表达式字符串。
* `keys Array(String)`：用户定义属性的名称。
* `values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建该字典，首先使用以下表结构创建表 `regexp_dictionary_source_table`：

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

然后使用以下命令更新本地 CSV：

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

你可以参见 [Insert Local Files](/integrations/data-ingestion/insert-local-files) 了解更多详细信息。初始化源表之后，我们可以基于该源表创建一个 RegexpTree：


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


## 内置字典 {#embedded-dictionaries}

<SelfManaged />

ClickHouse 包含一个用于处理地理库（geobase）的内置功能。

这使你可以：

- 使用某个区域的 ID，在所需语言中获取其名称。
- 使用某个区域的 ID，获取该区域对应的城市、地区、联邦区、国家或洲的 ID。
- 检查某个区域是否属于另一个区域。
- 获取上级区域的链条。

所有函数都支持 “translocality”，即能够同时使用不同视角来定义区域归属。更多信息，参见“用于处理 Web 分析字典的函数”一节。

在默认安装包中，内部字典处于禁用状态。
要启用它们，请在服务器配置文件中取消注释参数 `path_to_regions_hierarchy_file` 和 `path_to_regions_names_files`。

地理库从文本文件中加载。

将 `regions_hierarchy*.txt` 文件放入 `path_to_regions_hierarchy_file` 目录。该配置参数必须包含指向 `regions_hierarchy.txt` 文件（默认区域层级结构）的路径，其他文件（如 `regions_hierarchy_ua.txt`）必须位于同一目录中。

将 `regions_names_*.txt` 文件放入 `path_to_regions_names_files` 目录。

你也可以自行创建这些文件。文件格式如下：

`regions_hierarchy*.txt`：TabSeparated（无表头），列为：

- 区域 ID（`UInt32`）
- 上级区域 ID（`UInt32`）
- 区域类型（`UInt8`）：1 - 洲，3 - 国家，4 - 联邦区，5 - 地区，6 - 城市；其他类型没有取值
- 人口（`UInt32`）—— 可选列

`regions_names_*.txt`：TabSeparated（无表头），列为：

- 区域 ID（`UInt32`）
- 区域名称（`String`）—— 不能包含制表符或换行符，即使是转义的也不行。

在 RAM 中使用平面数组进行存储。出于这个原因，ID 不应超过一百万。

字典可以在不重启服务器的情况下更新。但是，可用字典的集合不会更新。
用于检测更新时，会检查文件的修改时间。如果文件发生变化，则更新字典。
检查变更的时间间隔由 `builtin_dictionaries_reload_interval` 参数配置。
字典更新（首次加载除外）不会阻塞查询。在更新过程中，查询会使用旧版本的字典。如果在更新期间发生错误，错误会写入服务器日志，查询将继续使用旧版本字典。

我们建议定期使用地理库更新这些字典。在执行更新时，生成新文件并将它们写入单独的位置。当一切准备就绪后，再将其重命名为服务器正在使用的文件名。

还有一些用于处理操作系统标识符和搜索引擎的函数，但不建议使用它们。
