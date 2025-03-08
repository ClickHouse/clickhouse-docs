---
slug: '/sql-reference/dictionaries'
sidebar_label: '定义字典'
sidebar_position: 35
---
```

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 字典

字典是一个映射 (`key -> attributes`)，方便用于各种类型的参考列表。

ClickHouse 支持用于处理字典的特殊函数，这些函数可以在查询中使用。使用函数与字典进行操作比使用与参考表的 `JOIN` 更加简单和高效。

ClickHouse 支持：

- 带有[一组函数](../../sql-reference/functions/ext-dict-functions.md)的字典。
- 带有特定[函数集合](../../sql-reference/functions/ym-dict-functions.md)的[嵌入式字典](#embedded-dictionaries)。

:::tip 教程
如果您是 ClickHouse 字典的初学者，我们有一份教程涵盖这一主题。请查看[这里](tutorial.md)。
:::

您可以从各种数据源添加自己的字典。字典的来源可以是 ClickHouse 表、文件（文本或可执行）、HTTP(s) 资源或其他 DBMS。有关更多信息，请参见“[字典来源](#dictionary-sources)”。

ClickHouse：

- 将字典完全或部分存储在 RAM 中。
- 定期更新字典并动态加载缺失的值。换句话说，字典可以动态加载。
- 允许使用 xml 文件或[DDL 查询](../../sql-reference/statements/create/dictionary.md)创建字典。

字典的配置可以位于一个或多个 xml 文件中。配置路径在[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)参数中指定。

字典可以在服务器启动时或首次使用时加载，这取决于[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)设置。

[system.dictionaries](/operations/system-tables/dictionaries) 系统表包含服务器上配置字典的信息。对于每个字典，您可以找到：

- 字典的状态。
- 配置参数。
- 例如为字典分配的 RAM 数量或自字典成功加载以来的查询次数等度量。

<CloudDetails />
## 使用 DDL 查询创建字典 {#creating-a-dictionary-with-a-ddl-query}

可以使用[DDL 查询](../../sql-reference/statements/create/dictionary.md)创建字典，这是推荐的方法，因为通过 DDL 创建的字典：

- 不会向服务器配置文件中添加额外记录
- 字典可以作为一类实体（如表或视图）进行操作
- 可以直接使用熟悉的 SELECT 进行数据读取，而不是使用字典表函数
- 字典可以很容易地重命名

## 使用配置文件创建字典 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
使用配置文件创建字典在 ClickHouse Cloud 中不可用。请使用 DDL（见上文），并以用户 `default` 创建字典。
:::

字典配置文件的格式如下：

``` xml
<clickhouse>
    <comment>一个可选元素，包含任何内容。被 ClickHouse 服务器忽略。</comment>

    <!--可选元素。带有替换的文件名-->
    <include_from>/etc/metrika.xml</include_from>

    <dictionary>
        <!-- 字典配置。 -->
        <!-- 配置文件中可以有任意数量的字典部分。 -->
    </dictionary>

</clickhouse>
```

您可以在同一文件中[配置](#configuring-a-dictionary)任意数量的字典。

:::note
您可以通过在 `SELECT` 查询中描述小字典来转换值（见[transform](../../sql-reference/functions/other-functions.md)函数）。此功能与字典无关。
:::

## 配置字典 {#configuring-a-dictionary}

<CloudDetails />

如果字典是使用 xml 文件配置的，那么字典配置具有以下结构：

``` xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 复杂的密钥配置 -->
    </structure>

    <source>
      <!-- 来源配置 -->
    </source>

    <layout>
      <!-- 内存布局配置 -->
    </layout>

    <lifetime>
      <!-- 字典在内存中的生命周期 -->
    </lifetime>
</dictionary>
```

相应的[DDL 查询](../../sql-reference/statements/create/dictionary.md)具有以下结构：

``` sql
CREATE DICTIONARY dict_name
(
    ... -- attributes
)
PRIMARY KEY ... -- 复杂或单一密钥配置
SOURCE(...) -- 来源配置
LAYOUT(...) -- 内存布局配置
LIFETIME(...) -- 字典在内存中的生命周期
```

## 在内存中存储字典 {#storing-dictionaries-in-memory}

有多种方法可以在内存中存储字典。

我们推荐[flat](#flat)、[hashed](#hashed) 和 [complex_key_hashed](#complex_key_hashed)，这些方法提供最佳的处理速度。

由于可能会造成性能不佳及在选择最佳参数时的困难，因此不推荐使用缓存。请在[cache](#cache)部分中了解更多信息。

有几种方法可以提升字典性能：

- 在 `GROUP BY` 后调用处理字典的函数。
- 将要提取的属性标记为可注入。如果不同的密钥对应不同的属性值，则该属性称为可注入。因此，当 `GROUP BY` 使用一个通过键提取属性值的函数时，该函数会自动被排除在 `GROUP BY` 之外。

ClickHouse 会对字典处理错误产生异常。错误示例：

- 无法加载所访问的字典。
- 查询`cached`字典时出错。

您可以在[system.dictionaries](../../operations/system-tables/dictionaries.md)表中查看字典及其状态的列表。

<CloudDetails />

配置看起来如下：

``` xml
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

相应的[DDL 查询](../../sql-reference/statements/create/dictionary.md)：

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- 布局设置
...
```

没有“complex-key*”字样的字典在布局中具有[UInt64](../../sql-reference/data-types/int-uint.md)类型的键，“complex-key*”字典则具有复合键（复杂，带任意类型）。

XML 字典中的[UInt64](../../sql-reference/data-types/int-uint.md)键通过 `<id>` 标签进行定义。

配置示例（列 key_column 具有 UInt64 类型）：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

复合 `complex` 键的 XML 字典通过 `<key>` 标签定义。

复合键（键有一个[String](../../sql-reference/data-types/string.md)类型元素）的配置示例：
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

## 在内存中存储字典的方法 {#ways-to-store-dictionaries-in-memory}

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

字典完全以平面数组的形式存储在内存中。字典使用多少内存？该量与最大密钥的大小（所占空间）成比例。

字典键为[UInt64](../../sql-reference/data-types/int-uint.md)类型，值被限制为 `max_array_size`（默认为 500,000）。如果在创建字典时发现更大的密钥，ClickHouse 会抛出异常并且不会创建字典。字典平面数组的初始大小由 `initial_array_size` 设置控制（默认为1024）。

所有类型的源都被支持。在更新时，数据（来自文件或表）会被完全读取。

此方法提供了在所有可用字典存储方法中最佳的性能。

配置示例：

``` xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

或者

``` sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

### hashed {#hashed}

字典完全以哈希表的形式存储在内存中。字典可以包含任意数量的元素和任意标识符。在实际应用中，键的数量可以达到数千万。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

所有类型的源都被支持。在更新时，数据（来自文件或表）会被完全读取。

配置示例：

``` xml
<layout>
  <hashed />
</layout>
```

或者

``` sql
LAYOUT(HASHED())
```

配置示例：

``` xml
<layout>
  <hashed>
    <!-- 如果 shards 大于 1（默认为 `1`），字典将并行加载数据，这对于在一个字典中有大量元素时非常有用。 -->
    <shards>10</shards>

    <!-- 并行队列中块的最大后备大小。

         由于并行加载的瓶颈是重新哈希，因此为了避免由于线程正在执行哈希计算而导致的停滞，需要有一些后备。

         10000 是内存和速度之间的良好平衡。
         即使对 10e10 个元素，也能在不导致饥饿的情况下处理所有负载。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- 哈希表的最大负载因子，值越大，内存利用率越高（浪费的内存越少），但读取/性能可能会下降。

         有效值：[0.5, 0.99]
         默认值：0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

或者

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

类似于 `hashed`，但使用更少的内存，换取更多的 CPU 使用。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

配置示例：

``` xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

或者

``` sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

也可以为这种类型的字典使用 `shards`，而且这对 `sparse_hashed` 比对 `hashed` 更为重要，因为 `sparse_hashed` 较慢。

### complex_key_hashed {#complex_key_hashed}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `hashed`。

配置示例：

``` xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

或者

``` sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex_key_sparse_hashed {#complex_key_sparse_hashed}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于 [sparse_hashed](#sparse_hashed)。

配置示例：

``` xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

或者

``` sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed_array {#hashed_array}

字典完全存储在内存中。每个属性存储在数组中。键属性存储为哈希表，其中值是属性数组的索引。字典可以包含任意数量的元素和任意标识符。在实际应用中，键的数量可以达到数千万。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

所有类型的源都被支持。在更新时，数据（来自文件或表）会被完全读取。

配置示例：

``` xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

或者

``` sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex_key_hashed_array {#complex_key_hashed_array}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于[hashed_array](#hashed_array)。

配置示例：

``` xml
<layout>
  <complex_key_hashed_array />
</layout>
```

或者

``` sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range_hashed {#range_hashed}

字典以哈希表的形式存储在内存中，具有有序的范围数组及其对应的值。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。
这种存储方法的单独部分也适用于其他任意数值范围。

示例：表中包含每个广告主的折扣，格式如下：

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

要使用日期范围的样本，请在[结构](#dictionary-key-and-fields)中定义`range_min`和`range_max`元素。这些元素必须包含`name`和`type`元素（如果未指定`type`，将使用默认类型 - Date）。`type`可以是任何数值类型（Date / DateTime / UInt64 / Int32 / 其他）。

:::note
`range_min` 和 `range_max` 的值应符合 `Int64` 类型。
:::

示例：

``` xml
<layout>
    <range_hashed>
        <!-- 重叠范围的策略（最小/最大）。默认：最小（返回带有最小 (range_min -> range_max) 值的匹配范围） -->
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

``` sql
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

要处理这些字典，需要将额外参数传递给 `dictGet` 函数，以选择范围：

``` sql
dictGet('dict_name', 'attr_name', id, date)
```

查询示例：

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

此函数返回指定 `id`s 和包含所传日期的日期范围的值。

算法细节：

- 如果未找到 `id` 或未为 `id` 找到范围，则返回属性类型的默认值。
- 如果存在重叠范围且 `range_lookup_strategy=min`，则返回带有最小 `range_min` 的匹配范围，如果找到多个范围，则返回带有最小 `range_max` 的范围，如果再次找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`），则返回它们中的一个随机范围。
- 如果存在重叠范围且 `range_lookup_strategy=max`，则返回带有最大 `range_min` 的匹配范围，如果找到多个范围，则返回带有最大 `range_max` 的范围，如果再次找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`），则返回它们中的一个随机范围。
- 如果 `range_max` 是 `NULL`，则该范围是开放的。`NULL` 被视为最大可能值。对于 `range_min` 可以使用 `1970-01-01` 或 `0`（-MAX_INT）作为开放值。

配置示例：

``` xml
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

或者

``` sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

配置示例，带有重叠范围和开放范围：

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;

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
│ 0.1 │ -- 唯一匹配范围：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 匹配到两个范围，range_min 2015-01-15 (0.2) 大于 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 匹配到两个范围，range_min 2015-01-01 (0.3) 大于 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 匹配到两个范围，range_min 相等，2015-01-15 (0.5) 大于 2015-01-10 (0.6)
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
│ 0.1 │ -- 唯一匹配范围：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 匹配到两个范围，range_min 2015-01-01 (0.1) 小于 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 匹配到两个范围，range_min 2015-01-01 (0.3) 小于 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 匹配到两个范围，range_min 相等，2015-01-10 (0.6) 小于 2015-01-15 (0.5)
└─────┘
```

### complex_key_range_hashed {#complex_key_range_hashed}

字典以哈希表的方式存储在内存中，具有有序的范围数组及其对应的值（见[range_hashed](#range_hashed)）。这种存储类型用于复合[键](#dictionary-key-and-fields)。

配置示例：

``` sql
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
```

### cache {#cache}

字典存储在具有固定数量单元的缓存中。这些单元包含经常使用的元素。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

查询字典时，首先会从缓存中查找。对于每个数据块，所有未在缓存中找到或已过期的键都通过 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 从源请求。收到的数据然后写入缓存。

如果字典中未找到键，则会创建更新缓存任务并将其添加到更新队列中。更新队列的属性可以通过设置 `max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 来控制。

对于缓存字典，可以设置缓存中数据的过期[lifetime](#refreshing-dictionary-data-using-lifetime)。如果自加载数据以来，单元中的时间超过了`lifetime`，则不使用该单元的值，键变为过期。下次需要使用时，将重新请求该键。通过设置 `allow_read_expired_keys` 来配置此行为。

这是所有字典存储方式中效果最差的一种。缓存的速度在很大程度上依赖于正确的设置和使用场景。仅当命中率足够高（建议99%及以上）时，缓存类型字典表现良好。您可以在[system.dictionaries](../../operations/system-tables/dictionaries.md)表中查看平均命中率。

如果设置 `allow_read_expired_keys` 为 1（默认值为 0），则字典可以支持异步更新。如果客户端请求键且所有键都在缓存中，但其中一些键已过期，则字典将返回过期的键给客户端，并异步请求它们。

为了改善缓存性能，可以使用结合 `LIMIT` 的子查询，并在外部调用字典函数。

所有类型的源都被支持。

设置示例：

``` xml
<layout>
    <cache>
        <!-- 缓存的大小，以单元的数量计算。四舍五入为 2 的冥数。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 允许读取过期的键。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 最大更新队列大小。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 最大推送更新任务到队列的超时（毫秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 最大等待超时（毫秒），用于更新任务完成。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- 处理缓存字典更新的最大线程数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

或者

``` sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

设置一个足够大的缓存大小。您需要尝试选择单元数量：

1. 设置一些值。
2. 运行查询，直到缓存完全满。
3. 使用 `system.dictionaries` 表评估内存消耗。
4. 增加或减少单元数量，直到达到所需的内存消耗。

:::note
不要将 ClickHouse 作为源，因为处理随机读取查询时速度较慢。
:::

### complex_key_cache {#complex_key_cache}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `cache`。

### ssd_cache {#ssd_cache}

类似于 `cache`，但将数据存储在 SSD 上并将索引存储在 RAM 中。对于 SSD 缓存字典，也可以应用与更新队列相关的缓存字典设置。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

``` xml
<layout>
    <ssd_cache>
        <!-- 每个读取块的大小（字节）。建议与 SSD 的页面大小相等。 -->
        <block_size>4096</block_size>
        <!-- 最大缓存文件大小（字节）。 -->
        <file_size>16777216</file_size>
        <!-- 用于从 SSD 读取元素的 RAM 缓冲区的大小（字节）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- 用于在刷新到 SSD 之前聚合元素的 RAM 缓冲区的大小（字节）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- 缓存文件将存储的路径。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

或者

``` sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `ssd_cache`。

### direct {#direct}

字典不存储在内存中，直接在处理请求时访问源。

字典的键为[UInt64](../../sql-reference/data-types/int-uint.md)类型。

支持所有类型的[源](#dictionary-sources)，但本地文件除外。

配置示例：

``` xml
<layout>
  <direct />
</layout>
```

或者

``` sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

这种存储类型用于复合[键](#dictionary-key-and-fields)。类似于 `direct`。

### ip_trie {#ip_trie}

这种存储类型用于将网络前缀（IP 地址）映射到元数据（如 ASN）。

**示例**

假设我们在 ClickHouse 中有一个包含我们的 IP 前缀及其映射的表：

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

让我们为此表定义一个 `ip_trie` 字典。`ip_trie` 布局要求使用复合键：

``` xml
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
        <!-- 键属性 `prefix` 可以通过 dictGetString 检索。 -->
        <!-- 此选项增加内存使用。 -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

或者

``` sql
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

关键必须只有一个 `String` 类型的属性，包含允许的 IP 前缀。其他类型是不被支持的。

语法为：

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

该函数接受 `UInt32` 作为 IPv4，或 `FixedString(16)` 作为 IPv6。例如：

``` sql
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

其他类型目前不被支持。该函数返回与此 IP 地址相应的前缀的属性。如果存在重叠前缀，将返回最具体的前缀。

数据必须完全适合内存。
```
```yaml
title: '使用生存时间刷新字典数据'
sidebar_label: '使用生存时间刷新字典数据'
keywords: ['字典', '生存时间', 'LIFETIME', '更新', '字典数据']
description: '了解如何使用生存时间定期刷新 ClickHouse 中的字典数据。'
```

## 使用生存时间刷新字典数据 {#refreshing-dictionary-data-using-lifetime}

ClickHouse 会根据 `LIFETIME` 标签定期更新字典（以秒为单位定义）。 `LIFETIME` 是完全下载字典的更新间隔以及缓存字典的失效间隔。

在更新过程中，字典的旧版本仍然可以被查询。字典的更新（除首次使用字典时的加载外）不会阻塞查询。如果在更新过程中发生错误，该错误将写入服务器日志，查询可以继续使用字典的旧版本。如果字典更新成功，旧版本的字典将被原子地替换。

设置示例：

<CloudDetails />

``` xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

或者

``` sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

设置 `<lifetime>0</lifetime>` (`LIFETIME(0)`) 将阻止字典更新。

您可以为更新设置一个时间间隔，ClickHouse 将在此范围内选择一个均匀随机的时间。这是为了在多个服务器上更新时分散字典源的负载。

设置示例：

``` xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

或者

``` sql
LIFETIME(MIN 300 MAX 360)
```

如果 `<min>0</min>` 和 `<max>0</max>`，ClickHouse 不会因超时而重新加载字典。
在这种情况下，如果字典配置文件发生变化或执行了 `SYSTEM RELOAD DICTIONARY` 命令，ClickHouse 可以更早地重新加载字典。

在更新字典时，ClickHouse 服务器根据[源类型](#dictionary-sources)应用不同的逻辑：

- 对于文本文件，它会检查修改时间。如果时间与先前记录的时间不同，则更新字典。
- 默认情况下，来自其他源的字典每次都更新。

对于其他源（ODBC、PostgreSQL、ClickHouse 等），您可以设置一个查询，仅在字典确实发生变化时才会更新，而不是每次都更新。为此，请按照以下步骤操作：

- 字典表必须具有一个字段，该字段在源数据更新时始终会发生变化。
- 源的设置必须指定一个查询，该查询检索变化的字段。ClickHouse 服务器将查询结果解释为一行，如果这行与其先前状态不同，字典会被更新。在[源](#dictionary-sources)的设置中指定查询为 `<invalidate_query>` 字段。

设置示例：

``` xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

或者

``` sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

对于 `Cache`、`ComplexKeyCache`、`SSDCache` 和 `SSDComplexKeyCache` 字典，支持同步和异步更新。

同样，`Flat`、`Hashed`、`ComplexKeyHashed` 字典也可以只请求自上次更新后发生变化的数据。如果在字典源配置中指定了 `update_field`，更新数据请求时将把上次更新时间的值（以秒为单位）添加到请求中。根据源类型（可执行文件、HTTP、MySQL、PostgreSQL、ClickHouse 或 ODBC），在从外部源请求数据之前，将对 `update_field` 应用不同的逻辑。

- 如果源是 HTTP，则将 `update_field` 作为查询参数添加，参数值为上次更新时间。
- 如果源是可执行文件，则将 `update_field` 作为可执行脚本参数添加，参数值为上次更新时间。
- 如果源是 ClickHouse、MySQL、PostgreSQL、ODBC，则将有一个附加的 `WHERE` 部分，其中 `update_field` 被比较为大于或等于上次更新时间。
    - 默认情况下，此 `WHERE` 条件在 SQL 查询的最高级别进行检查。或者，可以在查询中的任何其他 `WHERE` 子句中使用 `{condition}` 关键字检查条件。示例：
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

如果设置了 `update_field` 选项，可以设置附加选项 `update_lag`。 `update_lag` 选项的值在请求更新数据之前将从上次更新时间中减去。

设置示例：

``` xml
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

或者

``` sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```

## 字典源 {#dictionary-sources}

<CloudDetails />

字典可以从许多不同的源连接到 ClickHouse。

如果通过 xml 文件配置字典，配置看起来像这样：

``` xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- 源配置 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

在 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 的情况下，上述配置将如下所示：

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- 源配置
...
```

源在 `source` 部分中配置。

对于 [本地文件](#local-file)、[可执行文件](#executable-file)、[HTTP(S)](#https)、[ClickHouse](#clickhouse) 源类型，可以使用可选设置：

``` xml
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

或者

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

源类型 (`source_type`) 包括：

- [本地文件](#local-file)
- [可执行文件](#executable-file)
- [可执行池](#executable-pool)
- [HTTP(S)](#https)
- DBMS
    - [ODBC](#odbc)
    - [MySQL](#mysql)
    - [ClickHouse](#clickhouse)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Cassandra](#cassandra)
    - [PostgreSQL](#postgresql)

### 本地文件 {#local-file}

设置示例：

``` xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

或者

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

设置字段：

- `path` – 文件的绝对路径。
- `format` – 文件格式。支持[格式](/sql-reference/formats)中描述的所有格式。

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建源为 `FILE` 的字典时，源文件需要位于 `user_files` 目录中，以防止数据库用户访问 ClickHouse 节点上的任意文件。

**另见**

- [字典函数](/sql-reference/table-functions/dictionary)

### 可执行文件 {#executable-file}

与可执行文件的工作取决于[字典在内存中的存储方式](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 通过向可执行文件的 STDIN 发送请求来请求所需的键。否则，ClickHouse 启动可执行文件，并将其输出视为字典数据。

设置示例：

``` xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

设置字段：

- `command` — 可执行文件的绝对路径或文件名（如果命令目录在 `PATH` 中）。
- `format` — 文件格式。支持[格式](/sql-reference/formats)中描述的所有格式。
- `command_termination_timeout` — 可执行脚本应包含主要的读写循环。在字典被销毁后，管道关闭，而可执行文件将有 `command_termination_timeout` 秒的时间以进行关闭，之后 ClickHouse 将向子进程发送 SIGTERM 信号。`command_termination_timeout` 以秒为单位指定。默认值为 10。可选参数。
- `command_read_timeout` - 从命令标准输出读取数据的超时时间（以毫秒为单位）。默认值为 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时时间（以毫秒为单位）。默认值为 10000。可选参数。
- `implicit_key` — 可执行源文件只能返回值，与请求的键之间的对应关系是根据结果中的行顺序隐式确定的。默认值为 false。
- `execute_direct` - 如果 `execute_direct` = `1`，则将在由 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹内搜索 `command`。可以使用空格分隔指定附加脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，`command` 作为 `bin/sh -c` 的参数传递。默认值为 `0`。可选参数。
- `send_chunk_header` - 控制是否在发送数据块进行处理之前发送行数。可选。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建可执行源的字典被禁用；否则，数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### 可执行池 {#executable-pool}

可执行池允许从进程池加载数据。此源不适用于需要从源加载所有数据的字典布局。可执行池在字典[以](#ways-to-store-dictionaries-in-memory) `cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct` 或 `complex_key_direct` 布局存储时工作。

可执行池将生成一个包含指定命令的进程池，并保持它们处于运行状态直到它们退出。该程序应在 STDIN 可用时读取数据并将结果输出到 STDOUT。它可以在 STDIN 上等待下一个数据块。ClickHouse 在处理数据块后不会关闭 STDIN，但在需要时会传送另一块数据。可执行脚本应就此数据处理方式做好准备——它应轮询 STDIN 并提前刷新数据到 STDOUT。

设置示例：

``` xml
<source>
    <executable_pool>
        <command>while read key; do printf "$key\tData for key $key\n"; done</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10</max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

设置字段：

- `command` — 可执行文件的绝对路径或文件名（如果程序目录已写入 `PATH`）。
- `format` — 文件格式。支持"[格式](/sql-reference/formats)"中描述的所有格式。
- `pool_size` — 池的大小。如果指定 `pool_size` 为 0，则没有池大小限制。默认值为 16。
- `command_termination_timeout` — 可执行脚本应包含主要的读写循环。在字典被销毁后，管道关闭，而可执行文件将有 `command_termination_timeout` 秒的时间进行关闭，然后 ClickHouse 将发送 SIGTERM 信号给子进程。以秒为单位指定。默认值为 10。可选参数。
- `max_command_execution_time` — 处理数据块期间可执行脚本命令的最大执行时间。以秒为单位指定。默认值为 10。可选参数。
- `command_read_timeout` - 从命令标准输出读取数据的超时时间，以毫秒为单位。默认值为 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时时间，以毫秒为单位。默认值为 10000。可选参数。
- `implicit_key` — 可执行源文件只能返回值，与请求的键之间的对应关系是根据结果中的行顺序隐式确定的。默认值为 false。可选参数。
- `execute_direct` - 如果 `execute_direct` = `1`，则将在由 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹内搜索 `command`。可以使用空格分隔指定附加脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，`command` 作为 `bin/sh -c` 的参数传递。默认值为 `1`。可选参数。
- `send_chunk_header` - 控制是否在发送数据块进行处理之前发送行数。可选。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建可执行源的字典被禁用；否则，数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。

### HTTP(S) {#https}

与 HTTP(S) 服务器的交互取决于[字典在内存中的存储方式](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 通过 `POST` 方法发送请求以请求必要的键。

设置示例：

``` xml
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

或者

``` sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

为了让 ClickHouse 访问 HTTPS 资源，您必须在服务器配置中[配置 openSSL](../../operations/server-configuration-parameters/settings.md#openssl)。

设置字段：

- `url` – 源 URL。
- `format` – 文件格式。支持"[格式](/sql-reference/formats)"中描述的所有格式。
- `credentials` – 基本 HTTP 身份验证。可选参数。
- `user` – 身份验证所需的用户名。
- `password` – 身份验证所需的密码。
- `headers` – 用于 HTTP 请求的所有自定义 HTTP 头条目。可选参数。
- `header` – 单个 HTTP 头条目。
- `name` – 请求中发送的头的标识名称。
- `value` – 为特定标识名称设置的值。

在使用 DDL 命令（`CREATE DICTIONARY ...`）创建字典时，将根据配置中的 `remote_url_allow_hosts` 部分检查 HTTP 字典的远程主机，以防止数据库用户访问任意 HTTP 服务器。

### DBMS {#dbms}

#### ODBC {#odbc}

您可以使用此方法连接到任何具有 ODBC 驱动程序的数据库。

设置示例：

``` xml
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

或者

``` sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

设置字段：

- `db` – 数据库的名称。如果数据库名称在 `<connection_string>` 参数中设置，则省略它。
- `table` – 表和模式的名称（如果存在）。
- `connection_string` – 连接字符串。
- `invalidate_query` – 检查字典状态的查询。可选参数。更多信息请查看[使用生存时间刷新字典数据](#refreshing-dictionary-data-using-lifetime)部分。
- `background_reconnect` – 如果连接失败则在后台重新连接到副本。可选参数。
- `query` – 自定义查询。可选参数。

:::note
`table` 和 `query` 字段不能一起使用。并且必须声明 `table` 或 `query` 字段之一。
:::

ClickHouse 从 ODBC 驱动程序接收引号符号，并对所有设置在查询到驱动程序中引用，因此必须根据数据库中表名的大小写相应地设置表名。

如果在使用 Oracle 时遇到编码问题，请查看相应的[常见问题](https://www.example.com/knowledgebase/oracle-odbc)条目。

##### ODBC 字典功能的已知漏洞 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
通过 ODBC 驱动程序连接到数据库时，连接参数 `Servername` 可能会被替换。在这种情况下，来自 `odbc.ini` 的 `USERNAME` 和 `PASSWORD` 的值将发送到远程服务器并可能被泄露。
:::

**不安全使用示例**

让我们为 PostgreSQL 配置 unixODBC。`/etc/odbc.ini` 的内容：

``` text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

如果您随后执行类似于

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

则 ODBC 驱动程序会将 `odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 的值发送到 `some-server.com`。

##### 连接 PostgreSQL 的示例 {#example-of-connecting-postgresql}

Ubuntu 操作系统。

安装 unixODBC 和 PostgreSQL 的 ODBC 驱动程序：

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

配置 `/etc/odbc.ini`（或 `~/.odbc.ini`，如果您以运行 ClickHouse 的用户身份登录）：

``` text
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

在 ClickHouse 中的字典配置：

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 您可以在 connection_string 中指定以下参数： -->
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

或者

``` sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

您可能需要编辑 `odbc.ini` 以指定带有驱动程序的库的完整路径 `DRIVER=/usr/local/lib/psqlodbcw.so`。

##### 连接 MS SQL Server 的示例 {#example-of-connecting-ms-sql-server}

Ubuntu 操作系统。

安装用于连接 MS SQL 的 ODBC 驱动程序：

``` bash
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
    # $ cat ~/.odbc.ini # 如果您以运行 ClickHouse 的用户身份登录

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # （可选）测试 ODBC 连接（要使用 isql 工具，请安装 [unixodbc](https://packages.debian.org/sid/unixodbc)-包）
    $ isql -v MSSQL "user" "password"
```

备注：
- 如果要确定特定 SQL Server 版本所支持的最早 TDS 版本，请参考产品文档或查看[MS-TDS 产品行为](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)。

在 ClickHouse 中配置字典：

``` xml
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

或者

``` sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```

#### MySQL {#mysql}

设置示例：

``` xml
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

或者

``` sql
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

设置字段：

- `port` – MySQL 服务器的端口。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `user` – MySQL 用户的名称。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `password` – MySQL 用户的密码。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `replica` – 副本配置的部分。可以有多个部分。

        - `replica/host` – MySQL 主机。
        - `replica/priority` – 副本优先级。在尝试连接时，ClickHouse 会按优先级顺序遍历副本。数字越小，优先级越高。

- `db` – 数据库的名称。

- `table` – 表的名称。

- `where` – 选择标准。条件的语法与 MySQL 中的 `WHERE` 子句相同，例如 `id > 10 AND id < 20`。可选参数。

- `invalidate_query` – 检查字典状态的查询。可选参数。更多信息请查看[使用生存时间刷新字典数据](#refreshing-dictionary-data-using-lifetime)部分。

- `fail_on_connection_loss` – 控制服务器在连接丢失后行为的配置参数。如果 `true`，则如果客户端与服务器之间的连接丢失，将立即抛出异常。如果 `false`，则 ClickHouse 服务器在抛出异常之前会重复执行查询三次。请注意，重试会导致响应时间增加。默认值：`false`。

- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。并且必须声明 `table` 或 `query` 字段之一。
:::

:::note
没有显式的 `secure` 参数。在建立 SSL 连接时，安全性是强制性的。
:::

MySQL 可以通过本地套接字连接。要实现此目的，请设置 `host` 和 `socket`。

设置示例：

``` xml
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

或者

``` sql
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

设置示例：

``` xml
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

或者

``` sql
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

- `host` – ClickHouse 主机。如果是本地主机，则查询在没有网络活动的情况下处理。为了提高容错性，您可以创建一个[分布式](../../engines/table-engines/special/distributed.md)表，并在后续配置中输入它。
- `port` – ClickHouse 服务器的端口。
- `user` – ClickHouse 用户的名称。
- `password` – ClickHouse 用户的密码。
- `db` – 数据库的名称。
- `table` – 表的名称。
- `where` – 选择标准。可以省略。
- `invalidate_query` – 检查字典状态的查询。可选参数。更多信息请查看[使用生存时间刷新字典数据](#refreshing-dictionary-data-using-lifetime)部分。
- `secure` - 在连接时使用 ssl。
- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。并且必须声明 `table` 或 `query` 字段之一。
:::

#### MongoDB {#mongodb}

设置示例：

``` xml
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

或者

``` xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

或者

``` sql
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

- `host` – MongoDB 主机。
- `port` – MongoDB 服务器的端口。
- `user` – MongoDB 用户的名称。
- `password` – MongoDB 用户的密码。
- `db` – 数据库的名称。
- `collection` – 集合的名称。
- `options` - MongoDB 连接字符串选项（可选参数）。

或者

``` sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

设置字段：

- `uri` - 建立连接的 URI。
- `collection` – 集合的名称。

[有关引擎的更多信息](../../engines/table-engines/integrations/mongodb.md)
```
#### Redis {#redis}

设置示例如下：

``` xml
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

``` sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

设置字段：

- `host` – Redis 主机。
- `port` – Redis 服务器上的端口。
- `storage_type` – 内部 Redis 存储结构，用于处理键。`simple` 用于简单源和哈希单键源，`hash_map` 用于具有两个键的哈希源。范围源和复杂键的缓存源不支持。可省略，默认值为 `simple`。
- `db_index` – Redis 逻辑数据库的特定数字索引。可省略，默认值为 0。

#### Cassandra {#cassandra}

设置示例如下：

``` xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspace>database_name</keyspace>
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

- `host` – Cassandra 主机或以逗号分隔的主机列表。
- `port` – Cassandra 服务器上的端口。如果未指定，则使用默认端口 9042。
- `user` – Cassandra 用户名。
- `password` – Cassandra 用户的密码。
- `keyspace` – 键空间（数据库）的名称。
- `column_family` – 列族（表）的名称。
- `allow_filtering` – 是否允许在聚合键列上使用可能代价高昂的条件的标志。默认值为 1。
- `partition_key_prefix` – Cassandra 表主键中分区键列的数量。复合键字典所需。字典定义中的键列顺序必须与 Cassandra 相同。默认值为 1（第一个键列为分区键，其他键列为聚合键）。
- `consistency` – 一致性级别。可选值：`One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。默认值为 `One`。
- `where` – 可选选择标准。
- `max_threads` – 从多个分区加载数据时使用的最大线程数，适用于复合键字典。
- `query` – 自定义查询。可选参数。

:::note
`column_family` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `column_family` 或 `query` 字段中的一个。
:::

#### PostgreSQL {#postgresql}

设置示例如下：

``` xml
<source>
  <postgresql>
      <host>postgresql-hostname</host>
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

``` sql
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

设置字段：

- `host` – PostgreSQL 服务器上的主机。可以为所有副本指定，或为每个副本单独指定（在 `<replica>` 内）。
- `port` – PostgreSQL 服务器上的端口。可以为所有副本指定，或为每个副本单独指定（在 `<replica>` 内）。
- `user` – PostgreSQL 用户的名称。可以为所有副本指定，或为每个副本单独指定（在 `<replica>` 内）。
- `password` – PostgreSQL 用户的密码。可以为所有副本指定，或为每个副本单独指定（在 `<replica>` 内）。
- `replica` – 副本配置的部分。可以有多个部分：
    - `replica/host` – PostgreSQL 主机。
    - `replica/port` – PostgreSQL 端口。
    - `replica/priority` – 副本优先级。在尝试连接时，ClickHouse 按优先级顺序遍历副本。数字越小，优先级越高。
- `db` – 数据库的名称。
- `table` – 表的名称。
- `where` – 选择标准。条件的语法与 PostgreSQL 中的 `WHERE` 子句相同。例如，`id > 10 AND id < 20`。可选参数。
- `invalidate_query` – 用于检查字典状态的查询。可选参数。有关更多信息，请参见 [使用生存时间刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。
- `background_reconnect` – 如果连接失败，则在后台重新连接到副本。可选参数。
- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `table` 或 `query` 字段中的一个。
:::

### Null {#null}

一个特殊源，可用于创建虚拟（空）字典。这种字典可以用于测试，或在使用划分表的节点上与分离的数据和查询节点的设置一起使用。

``` sql
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

## Dictionary Key and Fields {#dictionary-key-and-fields}

<CloudDetails />

`structure` 子句描述字典键及可用于查询的字段。

XML 描述：

``` xml
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

属性在以下元素中描述：

- `<id>` — 键列
- `<attribute>` — 数据列：可以有多个属性。

DDL 查询：

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性在查询主体中描述：

- `PRIMARY KEY` — 键列
- `AttrName AttrType` — 数据列。可以有多个属性。
## Key {#key}

ClickHouse 支持以下类型的键：

- 数值键。`UInt64`。在 `<id>` 标签中定义或使用 `PRIMARY KEY` 关键字。
- 复合键。不同类型值的集合。在 `<key>` 标签中定义或使用 `PRIMARY KEY` 关键字。

XML 结构可以包含 `<id>` 或 `<key>`。DDL 查询必须包含单个 `PRIMARY KEY`。

:::note
不得将键描述为属性。
:::
### Numeric Key {#numeric-key}

类型：`UInt64`。

配置示例：

``` xml
<id>
    <name>Id</name>
</id>
```

配置字段：

- `name` – 键列的名称。

对于 DDL 查询：

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – 键列的名称。
### Composite Key {#composite-key}

键可以是任何字段类型的 `tuple`。此时的 [layout](#storing-dictionaries-in-memory) 必须为 `complex_key_hashed` 或 `complex_key_cache`。

:::tip
复合键可以包含单个元素。这使得可以将字符串用作键，例如。
:::

键结构在元素 `<key>` 中设置。键字段以与字典 [attributes](#dictionary-key-and-fields) 相同的格式指定。示例：

``` xml
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

``` sql
CREATE DICTIONARY (
    field1 String,
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

对于 `dictGet*` 函数的查询，`tuple` 作为键被传递。例如：`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## Attributes {#attributes}

配置示例：

``` xml
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

``` sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

配置字段：

| 标签                                                  | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 必需 |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|
| `name`                                               | 列名称。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 是   |
| `type`                                               | ClickHouse 数据类型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse 尝试将字典中的值转换为指定的数据类型。例如，对于 MySQL，该字段在 MySQL 源表中可能是 `TEXT`、`VARCHAR` 或 `BLOB`，但可以在 ClickHouse 中上传为 `String`。<br/>[Nullable](../../sql-reference/data-types/nullable.md) 当前支持 [Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache) 字典。在 [IPTrie](#ip_trie) 字典中不支持 `Nullable` 类型。 | 是   |
| `null_value`                                         | 不存在元素的默认值。<br/>在示例中，它是一个空字符串。`NULL` 值只能用于 `Nullable` 类型（请参见前面的类型描述行）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 是   |
| `expression`                                         | ClickHouse 在值上执行的 [表达式](../../sql-reference/syntax.md#expressions)。<br/>该表达式可以是远程 SQL 数据库中的列名称。因此，您可以使用它为远程列创建别名。<br/><br/>默认值：没有表达式。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 否   |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | 如果为 `true`，则属性包含当前键的父键值。参见 [层次字典](#hierarchical-dictionaries)。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 否   |
| `injective`                                          | 显示 `id -> 属性` 映像是否是 [一一映射](https://en.wikipedia.org/wiki/Injective_function) 的标志。<br/>如果为 `true`，ClickHouse 可以在 `GROUP BY` 子句之后自动放置 injection 请求。通常，这会显著减少此类请求的数量。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 否   |
| `is_object_id`                                       | 显示查询是否通过 `ObjectID` 为 MongoDB 文档执行的标志。<br/><br/>默认值：`false`。  
## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouse 支持具有 [数值键](#numeric-key) 的层次字典。

下面是层次结构的例子：

``` text
0 (普通父级)
│
├── 1 (俄罗斯)
│   │
│   └── 2 (莫斯科)
│       │
│       └── 3 (中心)
│
└── 4 (英国)
    │
    └── 5 (伦敦)
```

这个层次可以表示为以下字典表。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | 俄罗斯        |
| 2          | 1              | 莫斯科        |
| 3          | 2              | 中心          |
| 4          | 0              | 英国          |
| 5          | 4              | 伦敦          |

此表包含一列 `parent_region`，其中包含该元素最近父元素的键。

ClickHouse 支持外部字典属性的层次属性。此属性允许您配置层次字典，类似于上面所述。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 函数允许您获取元素的父链。

针对我们的示例，字典的结构可以如下：

``` xml
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

多边形字典允许您有效地搜索包含指定点的多边形。
例如：通过地理坐标定义城市区域。

多边形字典配置示例：

<CloudDetails />

``` xml
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

对应的 [DDL-query](/sql-reference/statements/create/dictionary)：
``` sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

在配置多边形字典时，键必须有以下两种类型之一：

- 简单多边形。它是一个点的数组。
- 多多边形。它是一个多边形的数组。每个多边形是一个二维点的数组。该数组的第一个元素是多边形的外部边界，后续元素指定要从中排除的区域。

可以将点指定为其坐标的数组或元组。在当前实现中，仅支持二维点。

用户可以以 ClickHouse 支持的所有格式上传自己的数据。

有 3 种类型的 [内存存储](#storing-dictionaries-in-memory) 可用：

- `POLYGON_SIMPLE`。这是一个简单的实现，对于每个查询，将对所有多边形进行线性遍历，并在不使用额外索引的情况下检查每个多边形的成员关系。

- `POLYGON_INDEX_EACH`。为每个多边形建立一个单独的索引，这在大多数情况下可以快速检查它是否属于（针对地理区域进行了优化）。此外，在考虑的区域上叠加了一个网格，这大大缩小了考虑的多边形数量。网格通过递归将单元格划分为 16 个相等部分创建，并使用两个参数进行配置。当递归深度达到 `MAX_DEPTH` 或当单元格交叉不超过 `MIN_INTERSECTIONS` 的多边形时，划分停止。响应查询时，会对应到一个单元格，并交替访问存储在其中的多边形索引。

- `POLYGON_INDEX_CELL`。此放置也创建上述描述的网格。可用相同的选项。对于每个工作表单元格，建立一个索引，涵盖所有落入其中的多边形片段，这使得可以快速响应请求。

- `POLYGON`。等同于 `POLYGON_INDEX_CELL`。

字典查询是使用标准的 [函数](../../sql-reference/functions/ext-dict-functions.md) 来执行字典操作。一个重要的区别在于，这里键将是您希望找到包含这些点的多边形的点。

**示例**

与上述定义的字典一起工作示例：

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

执行最后命令的结果是，对于 'points' 表中的每个点，都会找到一个包含该点的最小区域多边形，并输出请求的属性。

**示例**

您可以通过 SELECT 查询从多边形字典中读取列，只需在字典配置或相应的 DDL-query 中启用 `store_polygon_key_column = 1`。

查询：

``` sql
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

``` text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## 正则表达式树字典 {#regexp-tree-dictionary}

正则表达式树字典是一种特殊类型的字典，它通过正则表达式树表示从键到属性的映射。有一些用例，例如解析 [用户代理](https://en.wikipedia.org/wiki/User_agent) 字符串，可以通过正则表达式树字典优雅地表达。

### 在 ClickHouse 开源中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正则表达式树字典在 ClickHouse 开源中使用 YAMLRegExpTree 源定义，该源提供了包含正则表达式树的 YAML 文件的路径。

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

此配置由正则表达式树节点的列表组成。每个节点具有以下结构：

- **regexp**：节点的正则表达式。
- **attributes**：用户定义的字典属性的列表。在此示例中，有两个属性：`name` 和 `version`。第一个节点定义这两个属性。第二个节点仅定义属性 `name`。属性 `version` 由第二个节点的子节点提供。
  - 属性的值可以包含 **反向引用**，引用匹配正则表达式的捕获组。在此示例中，第一个节点的属性 `version` 的值包含了对捕获组 `(\d+[\.\d]*)` 的反向引用 `\1`。反向引用数字范围从 1 到 9，并写为 `$1` 或 `\1`（针对数字 1）。反向引用在查询执行期间被匹配的捕获组替换。
- **child nodes**：正则表达式树节点的子列表，每个都有其自己的属性和（可能的）子节点。字符串匹配以深度优先的方式进行。如果字符串与正则表达式节点匹配，则字典检查它是否也与节点的子节点匹配。如果是这样，则分配最深匹配节点的属性。子节点的属性会覆盖同名的父节点属性。YAML 文件中子节点的名称可以是任意的，例如上面的例子中的 `versions`。

正则表达式树字典仅允许使用 `dictGet`、`dictGetOrDefault` 和 `dictGetAll` 函数访问。

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

在此情况下，我们首先匹配顶层第二个节点中的正则表达式 `\d+/tclwebkit(?:\d+[\.\d]*)`。字典接着继续查找子节点，并发现该字符串也匹配 `3[12]/tclwebkit`。结果，属性 `name` 的值为 `Android`（在第一层定义），属性 `version` 的值为 `12`（在子节点中定义）。

借助强大的 YAML 配置文件，我们可以使用正则表达式树字典作为用户代理字符串解析器。我们支持 [uap-core](https://github.com/ua-parser/uap-core)，并演示如何在功能测试中使用它 [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)

#### 收集属性值 {#collecting-attribute-values}

有时，返回多个正则表达式匹配的值比仅返回叶节点的值更有用。在这些情况下，可以使用专业的 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 函数。如果节点具有类型为 `T` 的属性值，`dictGetAll` 将返回一个 `Array(T)`，其中包含零个或多个值。

默认情况下，每个键返回的匹配数量是没有上限的。可以通过将可选的第四个参数传递给 `dictGetAll` 来设置上限。该数组按 _拓扑顺序_ 填充，意味着子节点在父节点之前，兄弟节点按照源中的顺序跟随。

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
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
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
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### 匹配模式 {#matching-modes}

模式匹配行为可以通过某些字典设置进行修改：
- `regexp_dict_flag_case_insensitive`：使用不区分大小写的匹配（默认值为 `false`）。可以在个别表达式中使用 `(?i)` 和 `(?-i)` 重写。
- `regexp_dict_flag_dotall`：允许 `.` 匹配换行符（默认值为 `false`）。

### 在 ClickHouse Cloud 中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上述使用的 `YAMLRegExpTree` 源在 ClickHouse 开源中有效，但在 ClickHouse Cloud 中无效。要在 ClickHouse Cloud 中使用正则表达式树字典，首先在 ClickHouse 开源中从 YAML 文件创建正则表达式树字典，然后使用 `dictionary` 表函数和 [INTO OUTFILE](../statements/select/into-outfile.md) 子句将此字典转储到 CSV 文件。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV 文件的内容是：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

导出文件的模式为：

- `id UInt64`：正则表达式树节点的 ID。
- `parent_id UInt64`：节点的父节点 ID。
- `regexp String`：正则表达式字符串。
- `keys Array(String)`：用户定义的属性名称。
- `values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建字典，首先创建结构如下的表 `regexp_dictionary_source_table`：

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

然后通过以下方式更新本地 CSV：

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

您可以参见 [插入本地文件](/integrations/data-ingestion/insert-local-files) 获取更多细节。初始化源表后，我们可以通过表源创建 RegexpTree：

``` sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
## 嵌入字典 {#embedded-dictionaries}

<SelfManaged />

ClickHouse 包含用于处理地理基准的内置功能。

这允许您：

- 使用区域的 ID 获取所需语言的名称。
- 使用区域的 ID 获取城市、地区、联邦区、国家或大陆的 ID。
- 检查一个区域是否属于另一个区域。
- 获取父区域的链。

所有函数都支持“跨地方性”，即同时使用区域所有权的不同视角。有关更多信息，请参见“用于处理网络分析字典的函数”部分。

内部字典在默认软件包中禁用。
要启用它们，请在服务器配置文件中取消注释参数 `path_to_regions_hierarchy_file` 和 `path_to_regions_names_files`。

地理基准从文本文件加载。

将 `regions_hierarchy*.txt` 文件放入 `path_to_regions_hierarchy_file` 目录。此配置参数必须包含到 `regions_hierarchy.txt` 文件（默认区域层次）的路径，其他文件（`regions_hierarchy_ua.txt`）必须位于同一目录中。

将 `regions_names_*.txt` 文件放入 `path_to_regions_names_files` 目录。

您还可以自己创建这些文件。文件格式如下：

`regions_hierarchy*.txt`：制表符分隔（无标题），列：

- 区域 ID (`UInt32`)
- 父区域 ID (`UInt32`)
- 区域类型 (`UInt8`)：1 - 大陆，3 - 国家，4 - 联邦区，5 - 区域，6 - 城市；其他类型没有值
- 人口 (`UInt32`) — 可选列

`regions_names_*.txt`：制表符分隔（无标题），列：

- 区域 ID (`UInt32`)
- 区域名称 (`String`) — 不能包含制表符或换行符，连转义字符也不可以。

在内存中使用扁平数组进行存储。因此，ID 不应超过一百万。

字典可以在不重启服务器的情况下更新。但是，可用字典的集合不会更新。
对于更新，会检查文件的修改时间。如果文件发生更改，则更新字典。
检查变更的间隔由 `builtin_dictionaries_reload_interval` 参数配置。字典更新（在首次使用时加载除外）不会阻塞查询。在更新期间，查询使用旧版本的字典。如果更新期间发生错误，错误将写入服务器日志，查询将继续使用旧版本的字典。

我们建议定期更新地理基准字典。在更新期间，生成新文件并将其写入不同位置。准备好后，将它们重命名为服务器使用的文件。

还有用于处理操作系统标识符和搜索引擎的函数，但不应使用。
