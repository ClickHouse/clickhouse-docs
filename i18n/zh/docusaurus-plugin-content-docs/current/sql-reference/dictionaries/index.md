---
'description': '介绍ClickHouse中外部字典功能'
'sidebar_label': '定义字典'
'sidebar_position': 35
'slug': '/sql-reference/dictionaries'
'title': '字典'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 字典

字典是一个映射（`key -> attributes`），方便用于各种类型的参考列表。

ClickHouse 支持用于字典的特定函数，这些函数可以在查询中使用。使用函数的字典比与参考表的 `JOIN` 更简单高效。

ClickHouse 支持：

- 带有一 [组函数](../../sql-reference/functions/ext-dict-functions.md) 的字典。
- 具有特定 [组函数](../../sql-reference/functions/ym-dict-functions.md) 的 [嵌入字典](#embedded-dictionaries)。

:::tip 教程
如果您刚开始使用 ClickHouse 的字典，我们提供了涵盖该主题的教程。请查看 [这里](tutorial.md)。
:::

您可以从各种数据源添加自己的字典。字典的源可以是 ClickHouse 表、局部文本或可执行文件、HTTP(s) 资源或其他 DBMS。有关更多信息，请参见 "[字典源](#dictionary-sources)"。

ClickHouse：

- 完全或部分地将字典存储在 RAM 中。
- 定期更新字典并动态加载缺失的值。换句话说，字典可以动态加载。
- 允许使用 xml 文件或 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建字典。

字典的配置可以位于一个或多个 xml 文件中。配置的路径在 [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) 参数中指定。

字典可以在服务器启动时或首次使用时加载，具体取决于 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 设置。

[dictionaries](/operations/system-tables/dictionaries) 系统表包含关于服务器上配置的字典的信息。您可以在这里找到每个字典：

- 字典的状态。
- 配置参数。
- 指标，比如分配给字典的 RAM 数量或自字典成功加载以来的查询次数。

<CloudDetails />
## 使用 DDL 查询创建字典 {#creating-a-dictionary-with-a-ddl-query}

字典可以通过 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建，这是推荐的方法，因为使用 DDL 创建的字典：
- 不会向服务器配置文件添加额外记录。
- 字典可以作为一等实体进行处理，如同表或视图。
- 数据可以通过熟悉的 SELECT 直接读取，而不是字典表函数。
- 字典可以很容易地重命名。
## 使用配置文件创建字典 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
使用配置文件创建字典不适用于 ClickHouse Cloud。请使用 DDL（见上文），并将字典创建为用户 `default`。
:::

字典配置文件的格式如下：

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

您可以在同一文件中 [配置](#configuring-a-dictionary) 任意数量的字典。

:::note
您可以通过在 `SELECT` 查询中描述小字典来转换值（参见 [transform](../../sql-reference/functions/other-functions.md) 函数）。此功能与字典无关。
:::
## 配置字典 {#configuring-a-dictionary}

<CloudDetails />

如果字典是使用 xml 文件配置的，则字典配置具有以下结构：

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Complex key configuration -->
    </structure>

    <source>
      <!-- Source configuration -->
    </source>

    <layout>
      <!-- Memory layout configuration -->
    </layout>

    <lifetime>
      <!-- Lifetime of dictionary in memory -->
    </lifetime>
</dictionary>
```

相应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 具有以下结构：

```sql
CREATE DICTIONARY dict_name
(
    ... -- attributes
)
PRIMARY KEY ... -- complex or single key configuration
SOURCE(...) -- Source configuration
LAYOUT(...) -- Memory layout configuration
LIFETIME(...) -- Lifetime of dictionary in memory
```
## 在内存中存储字典 {#storing-dictionaries-in-memory}

有多种方式可以在内存中存储字典。

我们推荐使用 [flat](#flat)、[hashed](#hashed) 和 [complex_key_hashed](#complex_key_hashed)，这些方法提供最佳的处理速度。

由于可能的低性能和选择最佳参数的困难，不建议使用缓存。有关更多信息，请参阅 [cache](#cache) 部分。

有几种方法可以提高字典性能：

- 在 `GROUP BY` 之后调用字典的工作函数。
- 将要提取的属性标记为可注入属性。如果不同的键对应不同的属性值，则该属性称为可注入属性。因此，当 `GROUP BY` 使用根据键获取属性值的函数时，该函数将自动从 `GROUP BY` 中排除。

ClickHouse 生成异常以处理字典中的错误。错误示例：

- 访问的字典无法加载。
- 查询 `cached` 字典时出错。

您可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看字典及其状态的列表。

<CloudDetails />

配置如下所示：

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- layout settings -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

相应的 [DDL 查询](../../sql-reference/statements/create/dictionary.md)：

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

没有单词 `complex-key*` 的字典布局具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型的键，而 `complex-key*` 字典具有复合键（复杂，具有任意类型）。

在 XML 字典中定义 [UInt64](../../sql-reference/data-types/int-uint.md) 键的 `<id>` 标签。

配置示例（列 key_column 具有 UInt64 类型）：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

复合 `complex` 键的 XML 字典由 `<key>` 标签定义。

复合键的配置示例（键具有一个元素，类型为 [String](../../sql-reference/data-types/string.md)）：
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

字典完全以平面数组的形式存储在内存中。字典使用了多少内存？数量与最大键的大小（使用的空间）成正比。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型，值限制为 `max_array_size`（默认值为 500,000）。如果在创建字典时发现更大的键，ClickHouse 将抛出异常并不创建字典。字典平面数组的初始大小由 `initial_array_size` 设置控制（默认值为 1024）。

支持所有类型的源。在更新时，将完整读取数据（来自文件或表）。

该方法在所有可用的字典存储方法中提供最佳性能。

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
### hashed {#hashed}

字典完全以哈希表的形式存储在内存中。字典可以包含任何数量的具有任意标识符的元素。在实践中，键的数量可以达到数千万个。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

支持所有类型的源。在更新时，将完整读取数据（来自文件或表）。

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
    <!-- If shards greater then 1 (default is `1`) the dictionary will load
         data in parallel, useful if you have huge amount of elements in one
         dictionary. -->
    <shards>10</shards>

    <!-- Size of the backlog for blocks in parallel queue.

         Since the bottleneck in parallel loading is rehash, and so to avoid
         stalling because of thread is doing rehash, you need to have some
         backlog.

         10000 is good balance between memory and speed.
         Even for 10e10 elements and can handle all the load without starvation. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Maximum load factor of the hash table, with greater values, the memory
         is utilized more efficiently (less memory is wasted) but read/performance
         may deteriorate.

         Valid values: [0.5, 0.99]
         Default: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

或

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### sparse_hashed {#sparse_hashed}

类似于 `hashed`，但使用更少的内存以换取更多的 CPU 使用率。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

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

或

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

同样可以为这种类型的字典使用 `shards`，对于 `sparse_hashed` 而言，这更为重要，因为 `sparse_hashed` 的速度较慢。
### complex_key_hashed {#complex_key_hashed}

这种存储类型用于复合 [键](#dictionary-key-and-fields)。类似于 `hashed`。

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
### complex_key_sparse_hashed {#complex_key_sparse_hashed}

这种存储类型用于复合 [键](#dictionary-key-and-fields)。类似于 [sparse_hashed](#sparse_hashed)。

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
### hashed_array {#hashed_array}

字典完全存储在内存中。每个属性都存储在一个数组中。键属性以哈希表的形式存储，其中值是属性数组中的索引。字典可以包含任何数量的具有任意标识符的元素。在实践中，键的数量可以达到数千万个。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

支持所有类型的源。在更新时，将完整读取数据（来自文件或表）。

配置示例：

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

这种存储类型用于复合 [键](#dictionary-key-and-fields)。类似于 [hashed_array](#hashed_array)。

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
### range_hashed {#range_hashed}

字典以哈希表的形式存储在内存中，里面有一个有序数组的范围及其对应的值。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。
这种存储方法与 hashed 的工作方式相同，并允许在键之外使用日期/时间（任意数字类型）范围。

示例：该表包含每个广告主的折扣，格式如下：

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

要使用日期范围的样本，请在 [structure](#dictionary-key-and-fields) 中定义 `range_min` 和 `range_max` 元素。这些元素必须包含 `name` 和 `type` 元素（如果未指定 `type`，将使用默认类型 - Date）。`type` 可以是任何数字类型（Date / DateTime / UInt64 / Int32 / 其他）。

:::note
`range_min` 和 `range_max` 的值应适合 `Int64` 类型。
:::

示例：

```xml
<layout>
    <range_hashed>
        <!-- Strategy for overlapping ranges (min/max). Default: min (return a matching range with the min(range_min -> range_max) value) -->
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

要与这些字典一起工作，您需要向 `dictGet` 函数传递一个额外的参数，以选择范围：

```sql
dictGet('dict_name', 'attr_name', id, date)
```
查询示例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

该函数返回指定 `id` 和包含传递日期的日期范围的值。

算法细节：

- 如果未找到 `id` 或未找到 `id` 的范围，它将返回属性类型的默认值。
- 如果有重叠范围且 `range_lookup_strategy=min`，它返回具有最小 `range_min` 的匹配范围，如果找到多个范围，它返回具有最小 `range_max` 的范围，如果再次找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`，则返回随机范围。
- 如果有重叠范围且 `range_lookup_strategy=max`，它返回具有最大 `range_min` 的匹配范围，如果找到多个范围，它返回具有最大 `range_max` 的范围，如果再次找到多个范围（多个范围具有相同的 `range_min` 和 `range_max`，则返回随机范围。
- 如果 `range_max` 为 `NULL`，则范围是开放的。`NULL` 被视为最大可能值。对于 `range_min`，`1970-01-01` 或 `0`（-MAX_INT）可以用作开放值。

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

配置示例，具有重叠范围和开放范围：

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
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- two ranges are matching, range_min 2015-01-15 (0.2) is bigger than 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- two ranges are matching, range_min 2015-01-04 (0.4) is bigger than 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- two ranges are matching, range_min are equal, 2015-01-15 (0.5) is bigger than 2015-01-10 (0.6)
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
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- two ranges are matching, range_min 2015-01-01 (0.1) is less than 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- two ranges are matching, range_min 2015-01-01 (0.3) is less than 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- two ranges are matching, range_min are equal, 2015-01-10 (0.6) is less than 2015-01-15 (0.5)
└─────┘
```
### complex_key_range_hashed {#complex_key_range_hashed}

字典以哈希表的形式存储在内存中，里面有一个有序数组的范围及其对应的值（见 [range_hashed](#range_hashed)）。这种存储类型用于复合 [键](#dictionary-key-and-fields)。

配置示例：

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
```
### cache {#cache}

字典存储在具有固定数量单元的缓存中。这些单元包含频繁使用的元素。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

在查找字典时，首先搜索缓存。对于每个数据块，所有未在缓存中找到或过期的键通过 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 从源请求。然后将接收到的数据写入缓存。

如果字典中找不到键，则会创建更新缓存任务并将其添加到更新队列。更新队列的属性可以通过设置 `max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` 进行控制。

对于缓存字典，可以设置缓存中数据的过期 [生存时间](#refreshing-dictionary-data-using-lifetime)。如果从单元加载数据的时间超过 `lifetime`，则该单元的值不被使用，键变为过期。下次需要使用该键时，将重新请求该键。此行为可以通过设置 `allow_read_expired_keys` 进行配置。

这是所有存储字典的方法中效率最低的方法。缓存的速度在很大程度上依赖于正确的设置和使用场景。缓存类型字典只能在命中率足够高时（推荐 99% 及以上）表现良好。您可以在 [system.dictionaries](../../operations/system-tables/dictionaries.md) 表中查看平均命中率。

如果设置 `allow_read_expired_keys` 设为 1，默认 0。则字典可以支持异步更新。如果客户端请求键且所有的键都在缓存中，但其中一些过期了，则字典将返回过期键供客户端使用，并异步从源请求它们。

为了提高缓存性能，使用 `LIMIT` 的子查询，并在外部调用字典函数。

支持所有类型的源。

设置示例：

```xml
<layout>
    <cache>
        <!-- The size of the cache, in number of cells. Rounded up to a power of two. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Allows to read expired keys. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Max size of update queue. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Max timeout in milliseconds for push update task into queue. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Max wait timeout in milliseconds for update task to complete. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Max threads for cache dictionary update. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

或

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

设置一个足够大的缓存大小。您需要进行实验以选择单元格的数量：

1. 设置一些值。
2. 运行查询，直到缓存完全填满。
3. 使用 `system.dictionaries` 表评估内存消耗。
4. 增加或减少单元数量，直到达到所需的内存消耗。

:::note
请勿使用 ClickHouse 作为源，因为处理随机读取的查询速度较慢。
:::
### complex_key_cache {#complex_key_cache}

这种存储类型用于复合 [键](#dictionary-key-and-fields)。与 `cache` 类似。
### ssd_cache {#ssd_cache}

类似于 `cache`，但将数据存储在 SSD 上，索引在 RAM 中。与更新队列相关的所有缓存字典设置也可以应用于 SSD 缓存字典。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

```xml
<layout>
    <ssd_cache>
        <!-- Size of elementary read block in bytes. Recommended to be equal to SSD's page size. -->
        <block_size>4096</block_size>
        <!-- Max cache file size in bytes. -->
        <file_size>16777216</file_size>
        <!-- Size of RAM buffer in bytes for reading elements from SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Size of RAM buffer in bytes for aggregating elements before flushing to SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Path where cache file will be stored. -->
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

这种存储类型用于复合 [键](#dictionary-key-and-fields)。与 `ssd_cache` 类似。
### direct {#direct}

字典不存储在内存中，而是在处理请求时直接访问源。

字典的键具有 [UInt64](../../sql-reference/data-types/int-uint.md) 类型。

支持所有类型的 [源](#dictionary-sources)，但不支持局部文件。

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

这种存储类型用于复合 [键](#dictionary-key-and-fields)。与 `direct` 类似。
### ip_trie {#ip_trie}

这种存储类型用于将网络前缀（IP 地址）映射到元数据，例如 ASN。

**示例**

假设我们在 ClickHouse 中有一个表，包含我们的 IP 前缀及其映射：

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

让我们为此表定义一个 `ip_trie` 字典。`ip_trie` 布局需要一个复合键：

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
        <!-- Key attribute `prefix` can be retrieved via dictGetString. -->
        <!-- This option increases memory usage. -->
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

键必须仅包含一个 `String` 类型属性，包含允许的 IP 前缀。其他类型尚不支持。

语法为：

```sql
dictGetT('dict_name', 'attr_name', ip)
```

该函数接受用于 IPv4 的 `UInt32` 或用于 IPv6 的 `FixedString(16)`。例如：

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

其他类型尚不支持。该函数返回与该 IP 地址对应的前缀的属性。如果存在重叠前缀，则返回最具体的一个。

数据必须完全适合 RAM。
## 使用 LIFETIME 刷新字典数据 {#refreshing-dictionary-data-using-lifetime}

ClickHouse 根据 `LIFETIME` 标签（以秒为单位）定期更新字典。`LIFETIME` 是完全下载的字典的更新间隔，也是缓存字典的失效间隔。

在更新期间，字典的旧版本仍然可以被查询。字典更新（除了初次使用字典的加载）不会阻塞查询。如果更新过程出错，错误将写入服务器日志，查询可以继续使用字典的旧版本。如果字典更新成功，字典的旧版本将原子性地被替换。

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

设置 `<lifetime>0</lifetime>` （`LIFETIME(0)`）将阻止字典更新。

您可以设置更新的时间间隔，ClickHouse 会在该范围内选择一个均匀随机的时间。这是为了在大量服务器上更新字典时分散对字典源的负载。

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

如果 `<min>0</min>` 和 `<max>0</max>`，ClickHouse 不会在超时后重新加载字典。
在这种情况下，如果字典配置文件发生更改或执行了 `SYSTEM RELOAD DICTIONARY` 命令，ClickHouse 也可以更早地重新加载字典。

在更新字典时，ClickHouse 服务器根据 [源](#dictionary-sources) 的类型应用不同的逻辑：

- 对于文本文件，它检查修改时间。如果时间与先前记录的时间不同，则更新字典。
- 来自其他源的字典默认在每次都更新。

对于其他源（ODBC、PostgreSQL、ClickHouse 等），您可以设置一个查询，该查询将在字典真正变化时更新字典，而不是每次都更新。为此，请遵循以下步骤：

- 字典表必须有一个字段，在源数据更新时该字段总是变化。
- 源的设置必须指定一个查询，以检索变化字段。ClickHouse 服务器将查询结果视为一行，如果此行与先前状态相比发生变化，字典将被更新。在 [源](#dictionary-sources) 的设置中，请在 `<invalidate_query>` 字段中指定此查询。

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

对于 `Cache`、`ComplexKeyCache`、`SSDCache` 和 `SSDComplexKeyCache` 字典，支持同步和异步更新。

也可以为 `Flat`、`Hashed`、`ComplexKeyHashed` 字典仅请求在上次更新后更改的数据。如果在字典源配置中指定了 `update_field`，则会将先前更新时的时间（以秒为单位）添加到数据请求。在从外部源请求数据之前，取决于源的类型（Executable、HTTP、MySQL、PostgreSQL、ClickHouse 或 ODBC），将对 `update_field` 应用不同的逻辑。

- 如果源是 HTTP，则 `update_field` 将作为查询参数添加，最后更新的时间作为参数值。
- 如果源是 Executable，则 `update_field` 将作为可执行脚本参数添加，最后更新的时间作为参数值。
- 如果源是 ClickHouse、MySQL、PostgreSQL、ODBC，将会有一个额外的 `WHERE` 部分，其中 `update_field` 将与最后更新的时间进行比较，检查是否大于或等于。
    - 默认情况下，此 `WHERE` 条件在 SQL 查询的最高级别进行检查。或者，可以使用 `{condition}` 关键字在查询中的任何其他 `WHERE` 从句中检查该条件。例如：
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

如果 `update_field` 选项已设置，则可以设置额外的选项 `update_lag`。`update_lag` 选项的值将在请求更新的数据之前从先前的更新时间中减去。

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
## 字典源 {#dictionary-sources}

<CloudDetails />

字典可以从多种不同来源连接到 ClickHouse。

如果字典是使用 xml 文件配置的，则配置如下：

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- Source configuration -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

如果使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md)，则上述配置将如下所示：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

源在 `source` 部分中配置。

对于源类型 [Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)，可以使用可选设置：

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

源的类型（`source_type`）：

- [Local file](#local-file)
- [Executable File](#executable-file)
- [Executable Pool](#executable-pool)
- [HTTP(S)](#https)
- DBMS
    - [ODBC](#odbc)
    - [MySQL](#mysql)
    - [ClickHouse](#clickhouse)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Cassandra](#cassandra)
    - [PostgreSQL](#postgresql)
### Local File {#local-file}

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

设置字段：

- `path` – 文件的绝对路径。
- `format` – 文件格式。所有在 [Formats](/sql-reference/formats) 中描述的格式均受支持。

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建源为 `FILE` 的字典时，源文件需要位于 `user_files` 目录中，以防止数据库用户访问 ClickHouse 节点上的任意文件。

**另见**

- [字典函数](/sql-reference/table-functions/dictionary)
### Executable File {#executable-file}

处理可执行文件取决于 [字典如何存储在内存中](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 通过向可执行文件的标准输入发送请求来请求所需的键。否则，ClickHouse 启动可执行文件，并将其输出视为字典数据。

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

设置字段：

- `command` — 可执行文件的绝对路径，或文件名（如果命令目录在 `PATH` 中）。
- `format` — 文件格式。所有在 [Formats](/sql-reference/formats) 中描述的格式均受支持。
- `command_termination_timeout` — 可执行脚本应包含主要的读写循环。在字典被销毁后，管道关闭，且可执行文件将有 `command_termination_timeout` 秒的时间来关闭，否则 ClickHouse 将向子进程发送 SIGTERM 信号。指定的时间以秒为单位。默认值为 10。可选参数。
- `command_read_timeout` - 从命令标准输出读取数据的超时（以毫秒为单位）。默认值 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时（以毫秒为单位）。默认值 10000。可选参数。
- `implicit_key` — 可执行源文件只能返回值，并且与请求键的对应关系是隐式确定的 — 由结果行的顺序决定。默认值为 false。
- `execute_direct` - 如果 `execute_direct` = `1`，则 `command` 将在由 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索。可以使用空格分隔额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0` ，则 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `0`。可选参数。
- `send_chunk_header` - 控制是否在发送数据块之前发送行数。可选。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建具有可执行源的字典是禁用的；否则，数据库用户可能会在 ClickHouse 节点上执行任意二进制文件。
### Executable Pool {#executable-pool}

可执行池允许从进程池中加载数据。该源不适用于需要从源中加载所有数据的字典布局。可执行池在字典 [存储](#ways-to-store-dictionaries-in-memory) 使用 `cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct` 或 `complex_key_direct` 布局时工作。

可执行池将使用指定的命令生成一个进程池，并保持它们在退出之前保持运行。该程序应从标准输入读取数据，同时它可用，并将结果输出到标准输出。它可以等待标准输入上的下一个数据块。ClickHouse 在处理数据块后不会关闭标准输入，但在需要时将引导另一个数据块。可执行脚本应为这种数据处理方式做好准备 — 它应轮询标准输入并提前将数据刷新到标准输出。

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

设置字段：

- `command` — 可执行文件的绝对路径，或文件名（如果程序目录已写入 `PATH`）。
- `format` — 文件格式。所有在 "[Formats](/sql-reference/formats)" 中描述的格式均受支持。
- `pool_size` — 池的大小。如果将 `pool_size` 设置为 0，则没有池大小限制。默认值为 `16`。
- `command_termination_timeout` — 可执行脚本应包含主要的读写循环。在字典被销毁后，管道关闭，且可执行文件将有 `command_termination_timeout` 秒的时间来关闭， ClickHouse 发送 SIGTERM 信号给子进程。以秒为单位。默认值为 10。可选参数。
- `max_command_execution_time` — 处理数据块的最大可执行脚本命令执行时间。以秒为单位指定。默认值为 10。可选参数。
- `command_read_timeout` - 从命令的标准输出读取数据的超时（以毫秒为单位）。默认值 10000。可选参数。
- `command_write_timeout` - 向命令标准输入写入数据的超时（以毫秒为单位）。默认值 10000。可选参数。
- `implicit_key` — 可执行源文件只能返回值，并且与请求键的对应关系是隐式确定的 — 由结果行的顺序确定。默认值为 false。可选参数。
- `execute_direct` - 如果 `execute_direct` = `1`，则 `command` 将在由 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) 指定的 user_scripts 文件夹中搜索。可以使用空格分隔额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `1`。可选参数。
- `send_chunk_header` - 控制是否在发送数据块之前发送行数。可选。默认值为 `false`。

该字典源只能通过 XML 配置进行配置。通过 DDL 创建具有可执行源的字典是禁用的， 否则，数据库用户可以在 ClickHouse 节点上执行任意二进制文件。
### HTTP(S) {#https}

与 HTTP(S) 服务器的工作取决于 [字典如何存储在内存中](#storing-dictionaries-in-memory)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 通过 `POST` 方法发送请求来请求所需的键。

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

为了让 ClickHouse 访问 HTTPS 资源，您必须在服务器配置中 [配置 openSSL](../../operations/server-configuration-parameters/settings.md#openssl)。

设置字段：

- `url` – 源 URL。
- `format` – 文件格式。所有在 "[Formats](/sql-reference/formats)" 中描述的格式均受支持。
- `credentials` – 基本 HTTP 认证。可选参数。
- `user` – 身份验证所需的用户名。
- `password` – 身份验证所需的密码。
- `headers` – 用于 HTTP 请求的所有自定义 HTTP 头条目。可选参数。
- `header` – 单个 HTTP 头条目。
- `name` – 请求中发送的标头的标识符名称。
- `value` – 为特定标识符名称设置的值。

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建字典时，会根据 `remote_url_allow_hosts` 部分的内容检查 HTTP 字典的远程主机，以防止数据库用户访问任意 HTTP 服务器。
### DBMS {#dbms}
#### ODBC {#odbc}

您可以使用这种方法连接任何具有 ODBC 驱动程序的数据库。

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

- `db` – 数据库名称。如果在 `<connection_string>` 参数中设置了数据库名称，则可以省略此项。
- `table` – 表和架构的名称（如果存在）。
- `connection_string` – 连接字符串。
- `invalidate_query` – 检查字典状态的查询。可选参数。有关更多信息，请参阅 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。
- `background_reconnect` – 如果连接失败，后台重新连接到副本。可选参数。
- `query` – 自定义查询。可选参数。

:::note
`table` 和 `query` 字段不能同时使用。必须声明 `table` 或 `query` 字段中的任意一个。
:::

ClickHouse 从 ODBC 驱动程序接收引用符号，并在查询中引用所有设置，因此必须根据数据库中的表名大小写相应地设置表名。

如果您在使用 Oracle 时遇到编码问题，请参见相应的 [FAQ](/knowledgebase/oracle-odbc) 项。
##### ODBC 字典功能的已知漏洞 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
通过 ODBC 驱动程序连接到数据库时，连接参数 `Servername` 可以被替换。在这种情况下，`odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 的值被发送到远程服务器，可能会被泄露。
:::

**不安全使用示例**

让我们为 PostgreSQL 配置 unixODBC。 `/etc/odbc.ini` 的内容：

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

如果您随后执行以下查询

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 驱动程序将把 `odbc.ini` 中的 `USERNAME` 和 `PASSWORD` 的值发送到 `some-server.com`。
##### 连接 PostgreSQL 的示例 {#example-of-connecting-postgresql}

Ubuntu 操作系统。

安装 unixODBC 和 PostgreSQL 的 ODBC 驱动程序：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

配置 `/etc/odbc.ini`（或 `~/.odbc.ini`，如果您以运行 ClickHouse 的用户身份登录）：

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
                <!-- You can specify the following parameters in connection_string: -->
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

您可能需要编辑 `odbc.ini` 以指定驱动程序库的完整路径 `DRIVER=/usr/local/lib/psqlodbcw.so`。
##### 连接 MS SQL 服务器的示例 {#example-of-connecting-ms-sql-server}

Ubuntu 操作系统。

安装连接 MS SQL 的 ODBC 驱动程序：

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

    # test TDS connection
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
    $ isql -v MSSQL "user" "password"
```

备注：
- 要确定特定 SQL Server 版本支持的最早 TDS 版本，请查阅产品文档或查看 [MS-TDS 产品行为](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

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
#### Mysql {#mysql}

设置示例：

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

设置字段：

- `port` – MySQL 服务器的端口。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `user` – MySQL 用户名。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `password` – MySQL 用户的密码。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。

- `replica` – 副本配置的部分。可以有多个部分。

        - `replica/host` – MySQL 主机。
        - `replica/priority` – 副本优先级。在尝试连接时，ClickHouse 按优先级顺序遍历副本。数字越小，优先级越高。

- `db` – 数据库名称。

- `table` – 表名称。

- `where` – 选择标准。条件的语法与 MySQL 中 `WHERE` 子句相同，例如，`id > 10 AND id < 20`。可选参数。

- `invalidate_query` – 检查字典状态的查询。可选参数。有关更多信息，请参阅 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。

- `fail_on_connection_loss` – 控制服务器在连接丢失时的行为的配置参数。如果设置为 `true`，则在客户端与服务器之间的连接丢失时立即抛出异常。如果设置为 `false`，则 ClickHouse 服务器在抛出异常之前会重试执行查询三次。请注意，重试会导致响应时间增加。默认值：`false`。

- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `table` 或 `query` 字段中的任意一个。
:::

:::note
没有显式参数 `secure`。建立 SSL 连接时安全性是强制性的。
:::

可以通过套接字在本地主机上连接 MySQL。为此，请设置 `host` 和 `socket`。

设置示例：

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

设置示例：

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

- `host` – ClickHouse 主机。如果是本地主机，查询将在没有任何网络活动的情况下处理。为了提高容错性，您可以创建一个 [Distributed](../../engines/table-engines/special/distributed.md) 表并在后续配置中输入它。
- `port` – ClickHouse 服务器的端口。
- `user` – ClickHouse 用户名。
- `password` – ClickHouse 用户的密码。
- `db` – 数据库名称。
- `table` – 表名称。
- `where` – 选择标准。可以省略。
- `invalidate_query` – 检查字典状态的查询。可选参数。有关更多信息，请参阅 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。
- `secure` - 使用 ssl 进行连接。
- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `table` 或 `query` 字段中的任意一个。
:::
#### MongoDB {#mongodb}

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

设置字段：

- `host` – MongoDB 主机。
- `port` – MongoDB 服务器的端口。
- `user` – MongoDB 用户名。
- `password` – MongoDB 用户的密码。
- `db` – 数据库名称。
- `collection` – 集合名称。
- `options` - MongoDB 连接字符串选项（可选参数）。

或

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

设置字段：

- `uri` - 用于建立连接的 URI。
- `collection` – 集合名称。

[有关引擎的更多信息](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

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

设置字段：

- `host` – Redis 主机。
- `port` – Redis 服务器的端口。
- `storage_type` – 用于工作与键的内部 Redis 存储的结构。`simple` 用于简单源和哈希单键源，`hash_map` 用于带有两个键的哈希源。不支持范围源和复杂键的缓存源。可以省略，默认值为 `simple`。
- `db_index` – Redis 逻辑数据库的特定数字索引。可以省略，默认值为 0。
#### Cassandra {#cassandra}

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

- `host` – Cassandra 主机或用逗号分隔的主机列表。
- `port` – Cassandra 服务器的端口。如果未指定，则使用默认端口 9042。
- `user` – Cassandra 用户名。
- `password` – Cassandra 用户的密码。
- `keyspace` – keyspace（数据库）名称。
- `column_family` – 列族（表）名称。
- `allow_filtering` – 允许或不允许在聚簇键列上执行潜在代价高的条件的标志。默认值为 1。
- `partition_key_prefix` – Cassandra 表主键中分区键列的数量。用于组合键字典时为必需。字典定义中键列的顺序必须与 Cassandra 中的顺序相同。默认值为 1（第一个键列是分区键，其他键列是聚簇键）。
- `consistency` – 一致性级别。可选值：`One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。默认值为 `One`。
- `where` – 可选选择标准。
- `max_threads` – 在组合键字典中从多个分区加载数据时使用的最大线程数。
- `query` – 自定义查询。可选参数。

:::note
`column_family` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `column_family` 或 `query` 字段中的任意一个。
:::
#### PostgreSQL {#postgresql}

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

设置字段：

- `host` – PostgreSQL 服务器上的主机。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。
- `port` – PostgreSQL 服务器上的端口。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。
- `user` – PostgreSQL 用户名。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。
- `password` – PostgreSQL 用户的密码。您可以为所有副本指定它，或单独为每个副本指定（在 `<replica>` 内）。
- `replica` – 副本配置的部分。可以有多个部分：
    - `replica/host` – PostgreSQL 主机。
    - `replica/port` – PostgreSQL 端口。
    - `replica/priority` – 副本优先级。在尝试连接时，ClickHouse 按优先级顺序遍历副本。数字越小，优先级越高。
- `db` – 数据库名称。
- `table` – 表名称。
- `where` – 选择标准。条件的语法与 PostgreSQL 中的 `WHERE` 子句相同。例如，`id > 10 AND id < 20`。可选参数。
- `invalidate_query` – 检查字典状态的查询。可选参数。有关更多信息，请参阅 [使用 LIFETIME 刷新字典数据](#refreshing-dictionary-data-using-lifetime) 部分。
- `background_reconnect` – 如果连接失败，后台重新连接到副本。可选参数。
- `query` – 自定义查询。可选参数。

:::note
`table` 或 `where` 字段不能与 `query` 字段一起使用。必须声明 `table` 或 `query` 字段中的任意一个。
:::
### Null {#null}

一个特殊的数据源，可以用来创建虚拟（空）字典。这样的字典对于测试或与在带有分布式表的节点上分离的数据和查询节点配合使用非常有用。

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

`structure` 子句描述字典键和可用于查询的字段。

XML 描述：

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Attribute parameters -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性在以下元素中描述：

- `<id>` — 键列
- `<attribute>` — 数据列：可以有多个属性。

DDL 查询：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

属性在查询主体中描述：

- `PRIMARY KEY` — 键列
- `AttrName AttrType` — 数据列。可以有多个属性。
## 键 {#key}

ClickHouse 支持以下类型的键：

- 数字键。`UInt64`。在 `<id>` 标签中定义或使用 `PRIMARY KEY` 关键字。
- 复合键。不同类型值的集合。在 `<key>` 标签中定义或 `PRIMARY KEY` 关键字。

XML 结构可以包含 `<id>` 或 `<key>`。DDL 查询必须包含单个 `PRIMARY KEY`。

:::note
您不得将键描述为属性。
:::
### 数字键 {#numeric-key}

类型： `UInt64`。

配置示例：

```xml
<id>
    <name>Id</name>
</id>
```

配置字段：

- `name` – 键列的名称。

对于 DDL 查询：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – 键列的名称。
### 复合键 {#composite-key}

键可以是任何类型字段的 `tuple`。在这种情况下，[布局](#storing-dictionaries-in-memory) 必须是 `complex_key_hashed` 或 `complex_key_cache`。

:::tip
复合键可以由单个元素组成。这使得可以将字符串作为键使用，例如。
:::

键结构在 `<key>` 元素中设置。键字段的指定格式与字典 [属性](#dictionary-key-and-fields) 相同。示例：

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
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

对于对 `dictGet*` 函数的查询，元组作为键被传递。示例：`dictGetString('dict_name', 'attr_name', tuple('field1 的字符串', num_for_field2))`。
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

| 标签                                                 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 必需   |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| `name`                                               | 列名称。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 是    |
| `type`                                               | ClickHouse 数据类型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse 尝试将字典中的值强制转换为指定的数据类型。例如，对于 MySQL，字段可能是 MySQL 源表中的 `TEXT`、`VARCHAR` 或 `BLOB`，但可以作为 `String` 上传到 ClickHouse。<br/>[Nullable](../../sql-reference/data-types/nullable.md) 当前支持 [Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache) 字典。在 [IPTrie](#ip_trie) 字典中不支持 `Nullable` 类型。 | 是    |
| `null_value`                                         | 非存在元素的默认值。<br/>在示例中，它是一个空字符串。只能为 `Nullable` 类型使用 [NULL](../syntax.md#null) 值（请参阅上面的一行类型描述）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 是    |
| `expression`                                         | [表达式](../../sql-reference/syntax.md#expressions)，ClickHouse 对值执行此表达式。<br/>该表达式可以是远程 SQL 数据库中的列名。因此，您可以使用它为远程列创建别名。<br/><br/>默认值：无表达式。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 否    |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | 如果为 `true`，则属性包含当前键的父键值。请参阅 [层次字典](#hierarchical-dictionaries)。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 否    |
| `injective`                                          | 显示 `id -> attribute` 图像是否具有 [单射](https://en.wikipedia.org/wiki/Injective_function) 标志。<br/>如果为 `true`，ClickHouse 可以在 `GROUP BY` 子句之后自动放置注入字典的请求。通常这显著减少了此类请求的数量。<br/><br/>默认值：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 否    |
| `is_object_id`                                       | 标志，指示查询是否通过 `ObjectID` 对 MongoDB 文档执行。<br/><br/>默认值：`false`。
## 层次字典 {#hierarchical-dictionaries}

ClickHouse 支持带有 [数字键](#numeric-key) 的层次字典。

看看以下层次结构：

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

这个层次结构可以表示为以下字典表。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | 俄罗斯        |
| 2          | 1              | 莫斯科       |
| 3          | 2              | 中心         |
| 4          | 0              | 英国         |
| 5          | 4              | 伦敦         |

此表包含一个 `parent_region` 列，包含元素最近父项的键。

ClickHouse 支持外部字典属性的层次属性。此属性允许您配置类似于上述描述的层次字典。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 函数允许您获取元素的父级链。

对于我们的示例，字典的结构可以是：

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
## Polygon 字典 {#polygon-dictionaries}

Polygon 字典允许您高效地搜索包含指定点的多边形。
例如：通过地理坐标定义城市区域。

Polygon 字典配置示例：

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

相应的 [DDL-query](/sql-reference/statements/create/dictionary):
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

在配置多边形字典时，键必须具有以下两种类型之一：

- 简单多边形。它是一个点的数组。
- MultiPolygon。它是一个多边形的数组。每个多边形是一个二维数组的点。该数组的第一个元素是多边形的外边界，后续元素指定要从中排除的区域。

点可以作为一个数组或其坐标的元组进行指定。在当前实现中，仅支持二维点。

用户可以上传 ClickHouse 支持的所有格式的数据。

有 3 种可用的 [内存存储](#storing-dictionaries-in-memory) 类型：

- `POLYGON_SIMPLE`。这是一个简单的实现，对于每个查询，线性遍历所有多边形，并检查每个多边形的成员资格而不使用额外的索引。

- `POLYGON_INDEX_EACH`。为每个多边形建立一个单独的索引，这允许您在大多数情况下快速检查它是否属于（针对地理区域进行了优化）。
此外，在考虑的区域上叠加一个网格，这显著缩小了待考虑的多边形数量。
该网格通过递归将单元格分成 16 个相等的部分创建，并使用两个参数进行配置。
当递归深度达到 `MAX_DEPTH` 或当单元格跨越不超过 `MIN_INTERSECTIONS` 个多边形时，分割停止。
为响应查询，访问相应单元格，并交替访问存储在其中的多边形的索引。

- `POLYGON_INDEX_CELL`。此放置同样创建上述描述的网格。可用相同的选项。对于每个单元格，基于落入其中的所有多边形片段建立索引，从而允许快速响应请求。

- `POLYGON`。`POLYGON_INDEX_CELL` 的同义词。

字典查询使用标准 [functions](../../sql-reference/functions/ext-dict-functions.md) 来处理字典。
一个重要的区别是，这里的键将是您想查找其所包含的多边形的点。

**示例**

使用上述定义的字典的示例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

执行最后一条命令的结果是，为 'points' 表中的每个点找到一个最小区域多边形，并输出请求的属性。

**示例**

您可以通过 SELECT 查询从多边形字典中读取列，只需在字典配置或相应的 DDL-query 中开启 `store_polygon_key_column = 1`。

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
## 正则表达式树字典 {#regexp-tree-dictionary}

正则表达式树字典是特殊类型的字典，它使用正则表达式树表示从键到属性的映射。有一些用例，例如解析 [用户代理](https://en.wikipedia.org/wiki/User_agent) 字符串，可以用正则表达式树字典优雅地表达。
### 在 ClickHouse 开源中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

使用 YAMLRegExpTree 源在 ClickHouse 开源中定义正则表达式树字典，该源提供了一个指向包含正则表达式树的 YAML 文件的路径。

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
- **attributes**：用户定义的字典属性列表。在本示例中，有两个属性：`name` 和 `version`。第一个节点定义了这两个属性。第二个节点仅定义属性 `name`。属性 `version` 由第二个节点的子节点提供。
  - 属性的值可以包含**反向引用**，引用匹配正则表达式的捕获组。在此示例中，第一节点的属性 `version` 的值包含对匹配正则表达式中捕获组 `(\d+[\.\d]*)` 的反向引用 `\1`。反向引用编号从 1 到 9，并写作 `$1` 或 `\1`（表示数字 1）。反向引用在查询执行时被匹配的捕获组替换。
- **child nodes**：正则表达式树节点的子节点列表，每个节点都有自己的属性和（可能的）子节点。字符串匹配按照深度优先的方式进行。如果字符串匹配了正则表达式节点，字典会检查它是否也匹配节点的子节点。如果是这种情况，则分配最深匹配节点的属性。子节点的属性会覆盖父节点同名的属性。YAML 文件中子节点的名称可以是任意的，例如上述示例中的 `versions`。

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

在这种情况下，我们首先在顶层的第二个节点匹配正则表达式 `\d+/tclwebkit(?:\d+[\.\d]*)`。字典随后继续查找子节点，发现字符串也匹配 `3[12]/tclwebkit`。因此，属性 `name` 的值为 `Android`（在第一层定义），属性 `version` 的值为 `12`（在子节点中定义）。

通过一个强大的 YAML 配置文件，我们可以将正则表达式树字典用作用户代理字符串解析器。我们支持 [uap-core](https://github.com/ua-parser/uap-core)，并展示如何在功能测试 [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) 中使用它。
#### 收集属性值 {#collecting-attribute-values}

有时，返回多个匹配的正则表达式的值比仅返回叶子节点的值更有用。在这些情况下，可以使用专门的 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 函数。如果节点具有类型为 `T` 的属性值，则 `dictGetAll` 将返回一个包含零个或多个值的 `Array(T)`。

默认情况下，按键返回的匹配数是无限的。可以将限制作为可选的第四个参数传递给 `dictGetAll`。数组以拓扑顺序填充，这意味着子节点在父节点之前出现，兄弟节点遵循源中的顺序。

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
- `regexp_dict_flag_case_insensitive`：使用不区分大小写的匹配（默认为 `false`）。可以在个别表达式中使用 `(?i)` 和 `(?-i)` 覆盖。
- `regexp_dict_flag_dotall`：允许 '.' 匹配换行符（默认为 `false`）。
### 在 ClickHouse Cloud 中使用正则表达式树字典 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上述使用的 `YAMLRegExpTree` 源适用于 ClickHouse 开源，但不适用于 ClickHouse Cloud。要在 ClickHouse Cloud 中使用正则表达式树字典，首先在 ClickHouse 开源中从 YAML 文件创建一个正则表达式树字典，然后使用 `dictionary` 表函数和 [INTO OUTFILE](../statements/select/into-outfile.md) 子句将该字典导出到 CSV 文件。

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

导出文件的结构是：

- `id UInt64`：正则表达式树节点的 ID。
- `parent_id UInt64`：一个节点的父节点的 ID。
- `regexp String`：正则表达式字符串。
- `keys Array(String)`：用户定义属性的名称。
- `values Array(String)`：用户定义属性的值。

要在 ClickHouse Cloud 中创建字典，首先创建表 `regexp_dictionary_source_table`，其表结构如下：

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

然后通过以下方法更新本地 CSV：

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

您可以查看如何 [插入本地文件](/integrations/data-ingestion/insert-local-files) 以获取更多详细信息。在初始化源表后，我们可以通过表源创建一个正则表达式树：

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
## 嵌入字典 {#embedded-dictionaries}

<SelfManaged />

ClickHouse 包含用于操作地理基数的内置功能。

这使您能够：

- 使用区域 ID 获取其所需语言的名称。
- 使用区域 ID 获取城市、地区、联邦区、国家或大陆的 ID。
- 检查一个区域是否属于另一个区域。
- 获取父区域链。

所有函数都支持“跨地域性”，即同时使用不同视角来查看区域所有权。有关更多信息，请参见“用于处理网页分析字典的函数”部分。

内部字典在默认包中被禁用。
要启用它们，请在服务器配置文件中取消注释 `path_to_regions_hierarchy_file` 和 `path_to_regions_names_files` 参数。

地理基数从文本文件加载。

将 `regions_hierarchy*.txt` 文件放入 `path_to_regions_hierarchy_file` 目录中。此配置参数必须包含指向 `regions_hierarchy.txt` 文件的路径（默认区域层级），其他文件（`regions_hierarchy_ua.txt`）必须位于同一目录中。

将 `regions_names_*.txt` 文件放入 `path_to_regions_names_files` 目录中。

您还可以自己创建这些文件。文件格式如下：

`regions_hierarchy*.txt`：制表符分隔（无标题），列：

- 区域 ID (`UInt32`)
- 父区域 ID (`UInt32`)
- 区域类型 (`UInt8`)：1 - 大陆，3 - 国家，4 - 联邦区，5 - 区，6 - 城市；其他类型没有值
- 人口 (`UInt32`) — 可选列

`regions_names_*.txt`：制表符分隔（无标题），列：

- 区域 ID (`UInt32`)
- 区域名称 (`String`) — 不能包含制表符或换行符，即使是转义的。

用于在 RAM 中存储一个平面数组。因此，ID 不应超过一百万。

字典可以在不重启服务器的情况下更新。但是，可用字典的集合不会更新。
对于更新，检查文件的修改时间。如果文件发生了变化，则更新字典。
检查更改的间隔由 `builtin_dictionaries_reload_interval` 参数配置。
字典更新（除了第一次使用时加载）不会阻塞查询。在更新期间，查询使用旧版本的字典。如果在更新过程中发生错误，错误将被写入服务器日志，查询将继续使用旧版本的字典。

我们建议定期更新字典与地理基数。在更新期间，生成新文件并将其写入单独的位置。当一切准备就绪后，将它们重命名为服务器使用的文件。

还有用于处理操作系统标识符和搜索引擎的函数，但不应使用。
