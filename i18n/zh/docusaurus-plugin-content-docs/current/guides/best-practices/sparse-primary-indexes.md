---
'sidebar_label': '主键索引'
'sidebar_position': 1
'description': '在本指南中，我们将深入研究 ClickHouse 索引。'
'title': '在 ClickHouse 中主键索引的实用介绍'
'slug': '/guides/best-practices/sparse-primary-indexes'
'show_related_blogs': true
'doc_type': 'guide'
---

import sparsePrimaryIndexes01 from '@site/static/images/guides/best-practices/sparse-primary-indexes-01.png';
import sparsePrimaryIndexes02 from '@site/static/images/guides/best-practices/sparse-primary-indexes-02.png';
import sparsePrimaryIndexes03a from '@site/static/images/guides/best-practices/sparse-primary-indexes-03a.png';
import sparsePrimaryIndexes03b from '@site/static/images/guides/best-practices/sparse-primary-indexes-03b.png';
import sparsePrimaryIndexes04 from '@site/static/images/guides/best-practices/sparse-primary-indexes-04.png';
import sparsePrimaryIndexes05 from '@site/static/images/guides/best-practices/sparse-primary-indexes-05.png';
import sparsePrimaryIndexes06 from '@site/static/images/guides/best-practices/sparse-primary-indexes-06.png';
import sparsePrimaryIndexes07 from '@site/static/images/guides/best-practices/sparse-primary-indexes-07.png';
import sparsePrimaryIndexes08 from '@site/static/images/guides/best-practices/sparse-primary-indexes-08.png';
import sparsePrimaryIndexes09a from '@site/static/images/guides/best-practices/sparse-primary-indexes-09a.png';
import sparsePrimaryIndexes09b from '@site/static/images/guides/best-practices/sparse-primary-indexes-09b.png';
import sparsePrimaryIndexes09c from '@site/static/images/guides/best-practices/sparse-primary-indexes-09c.png';
import sparsePrimaryIndexes10 from '@site/static/images/guides/best-practices/sparse-primary-indexes-10.png';
import sparsePrimaryIndexes11 from '@site/static/images/guides/best-practices/sparse-primary-indexes-11.png';
import sparsePrimaryIndexes12a from '@site/static/images/guides/best-practices/sparse-primary-indexes-12a.png';
import sparsePrimaryIndexes12b1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-1.png';
import sparsePrimaryIndexes12b2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-2.png';
import sparsePrimaryIndexes12c1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-1.png';
import sparsePrimaryIndexes12c2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-2.png';
import sparsePrimaryIndexes13a from '@site/static/images/guides/best-practices/sparse-primary-indexes-13a.png';
import sparsePrimaryIndexes14a from '@site/static/images/guides/best-practices/sparse-primary-indexes-14a.png';
import sparsePrimaryIndexes14b from '@site/static/images/guides/best-practices/sparse-primary-indexes-14b.png';
import sparsePrimaryIndexes15a from '@site/static/images/guides/best-practices/sparse-primary-indexes-15a.png';
import sparsePrimaryIndexes15b from '@site/static/images/guides/best-practices/sparse-primary-indexes-15b.png';
import Image from '@theme/IdealImage';


# ClickHouse 主索引的实际介绍
## 引言 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引。我们将详细说明和讨论：
- [ClickHouse 的索引与传统关系数据库管理系统的不同之处](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建和使用表的稀疏主索引](#a-table-with-a-primary-key)
- [在 ClickHouse 中的索引最佳实践](#using-multiple-primary-indexes)

您可以选择在自己的机器上执行本指南中提供的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装及入门说明，请参见 [快速开始](/get-started/quick-start)。

:::note
本指南关注于 ClickHouse 的稀疏主索引。

有关 ClickHouse [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅 [教程](/guides/best-practices/skipping-indexes.md)。
:::
### 数据集 {#data-set}

在本指南中，我们将使用一个示例的匿名化网页流量数据集。

- 我们将使用来自示例数据集的 8.87 百万行（事件）的一个子集。
- 未压缩数据大小为 8.87 百万事件，约 700 MB。存储在 ClickHouse 中时压缩为 200 MB。
- 在我们的子集中，每行包含三列，指示一个互联网用户（`UserID` 列）在特定时间（`EventTime` 列）点击了一个 URL（`URL` 列）。

通过这三列，我们已经可以定义一些典型的网页分析查询，例如：

- “特定用户点击次数最多的前 10 个 URL 是什么？”
- “最常点击特定 URL 的前 10 个用户是谁？”
- “用户在特定 URL 上点击的最热门时间（例如一周中的天数）是什么？”
### 测试机器 {#test-machine}

本文档中给出的所有运行时数据基于在配备 Apple M1 Pro 芯片和 16GB RAM 的 MacBook Pro 本地运行的 ClickHouse 22.2.1。
### 完整表扫描 {#a-full-table-scan}

为了查看没有主键的数据集上如何执行查询，我们通过执行以下 SQL DDL 语句创建一个表（使用 MergeTree 表引擎）：

```sql
CREATE TABLE hits_NoPrimaryKey
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
PRIMARY KEY tuple();
```

接下来，使用以下 SQL 插入语句将部分点击数据集插入表中。
这将使用 [URL 表函数](/sql-reference/table-functions/url.md) 从 clickhouse.com 上加载一个完整数据集的子集：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
返回的结果是：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse 客户端的结果输出显示，上述语句将 8.87 百万行插入到表中。

最后，为了简化本指南后面的讨论并使图表和结果可重复，我们使用 FINAL 关键字来 [优化](/sql-reference/statements/optimize.md) 表：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常，在将数据加载到表中后，立即优化表并不是必需的，也不建议这么做。为什么在此示例中需要这样做将变得显而易见。
:::

现在我们执行第一个网页分析查询。以下是计算用户 ID 为 749927693 的互联网用户点击次数最多的前 10 个 URL：

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
返回结果是：
```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.022 sec.

# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse 客户端的结果输出表明，ClickHouse 执行了完整表扫描！我们表中 8.87 百万行中的每一行都被流入 ClickHouse。这无法扩展。

为了使这（大大）更高效且（更）快速，我们需要使用一个具有合适主键的表。这将允许 ClickHouse 自动（基于主键的列）创建一个稀疏主索引，然后可以用来显著加快我们示例查询的执行。
## ClickHouse 索引设计 {#clickhouse-index-design}
### 大规模数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系数据库管理系统中，主索引将包含每个表行的一个条目。这将导致主索引对于我们的数据集包含 8.87 百万条条目。这样的索引可以快速定位特定行，从而在查找查询和点更新上实现高效率。在 `B(+)-Tree` 数据结构中搜索一个条目的平均时间复杂度为 `O(log n)`；更准确地说，`log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是已索引的行数。由于 `b` 通常在几百到几千之间，`B(+)-Trees` 是非常浅的结构，需要的磁盘寻址次数较少。对于 8.87 百万行和分支因子为 1000 的情况，平均需要 2.3 次磁盘寻址。这个能力是有代价的：额外的磁盘和内存开销，添加新行和索引条目时更高的插入成本，以及有时需要重新平衡 B 树。

考虑到 B-Tree 索引相关的挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse [MergeTree 引擎系列](/engines/table-engines/mergetree-family/index.md) 被设计和优化以处理大量数据。这些表旨在每秒接收数百万行的插入，并存储非常大的（数百 PB）数据量。数据以 [分片方式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 快速写入，以便在后台应用合并分片的规则。在 ClickHouse 中，每个分片都有自己的主索引。当合并分片时，合并分片的主索引也会被合并。在 ClickHouse 设计的大规模系统中，确保磁盘和内存的高效使用至关重要。因此，主索引对于每个分片只有一个索引条目（称为“标记”），每组行（称为“颗粒”）对应一个条目 - 这种技术被称为 **稀疏索引**。

稀疏索引之所以可行，是因为 ClickHouse 在磁盘上按照主键列的顺序存储行。稀疏主索引允许快速（通过索引条目进行二分搜索）识别可能匹配查询的行组，而不是直接定位单个行。然后，找到的可能匹配的行组（颗粒）被并行流入 ClickHouse 引擎，以找到匹配的行。此索引设计允许主索引小（它可以且必须完全 fitting into the main memory），同时仍显著加快查询执行时间：尤其是对于数据分析用例中的典型范围查询。

以下详细说明了 ClickHouse 如何构建和使用其稀疏主索引。稍后在文章中，我们将讨论一些最佳实践，以选择、删除和排序用于构建索引（主键列）的表列。
### 带有主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键的表，主键列为 UserID 和 URL：

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    DDL 语句详情
    </summary>
    <p>

为了简化本指南后面讨论，并使图表和结果可重复，DDL 语句：

<ul>
  <li>
    通过 <code>ORDER BY</code> 子句为表指定复合排序键。
  </li>
  <li>
    通过设置显式控制主索引将具有多少个索引条目：
    <ul>
      <li>
        <code>index_granularity</code>: 显式设置为其默认值 8192。这意味着对于每组 8192 行，主索引将具有一个索引条目。例如，如果表包含 16384 行，则索引将具有两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>: 设置为 0 以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着 ClickHouse 会在以下条件之一为一组 n 行自动创建一个索引条目：
        <ul>
          <li>
            如果 <code>n</code> 小于 8192 且这些行的组合行数据大小大于或等于 10 MB（<code>index_granularity_bytes</code> 的默认值）。
          </li>
          <li>
            如果 <code>n</code> 行的组合行数据大小小于 10 MB，但 <code>n</code> 为 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 设置为 0 以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引压缩</a>。这将允许我们稍后选择性地查看其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

上述 DDL 语句中的主键导致根据指定的两个键列创建主索引。

<br/>
接下来插入数据：

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
返回的结果如下：
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br/>
并优化表：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
我们可以使用以下查询获取有关我们表的元数据：

```sql
SELECT
    part_type,
    path,
    formatReadableQuantity(rows) AS rows,
    formatReadableSize(data_uncompressed_bytes) AS data_uncompressed_bytes,
    formatReadableSize(data_compressed_bytes) AS data_compressed_bytes,
    formatReadableSize(primary_key_bytes_in_memory) AS primary_key_bytes_in_memory,
    marks,
    formatReadableSize(bytes_on_disk) AS bytes_on_disk
FROM system.parts
WHERE (table = 'hits_UserID_URL') AND (active = 1)
FORMAT Vertical;
```

返回的结果为：

```response
part_type:                   Wide
path:                        ./store/d9f/d9f36a1a-d2e6-46d4-8fb5-ffe9ad0d5aed/all_1_9_2/
rows:                        8.87 million
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

1 rows in set. Elapsed: 0.003 sec.
```

ClickHouse 客户端的输出显示：

- 表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 存储在磁盘上的特定目录中，这意味着该目录中每个表列将有一个数据文件（和一个标记文件）。
- 表有 8.87 百万行。
- 所有行的未压缩数据总大小为 733.28 MB。
- 所有行在磁盘上的压缩大小总共为 206.94 MB。
- 表具有 1083 个条目（称为“标记”）的主索引，索引大小为 96.93 KB。
- 综合来看，表的数据、标记文件和主索引文件在磁盘上总共占用 207.07 MB。
### 数据按照主键列的顺序存储在磁盘上 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们上面创建的表有
- 复合 [主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 和
- 复合 [排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- 如果我们只指定了排序键，则主键将隐式定义为等于排序键。

- 为了实现内存效率，我们显式指定了仅包含我们查询过滤的列的主键。基于主键的主索引完全加载到主内存中。

- 为了在指南的图表中保持一致性，并最大限度提高压缩比，我们定义了一个单独的排序键，其中包含所有表列（如果在一个列中相似数据放在相互靠近的位置，例如通过排序，那么该数据会更好地压缩）。

- 如果同时指定了主键，则主键需要是排序键的前缀。
:::

插入的行按主键列（和附加的 `EventTime` 列）在磁盘上的字典序（升序）顺序存储。

:::note
ClickHouse 允许插入具有相同主键列值的多行。在这种情况下（参见下图的第 1 行和第 2 行），最终顺序由指定的排序键确定，因此 `EventTime` 列的值也会影响顺序。
:::

ClickHouse 是一个 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列式数据库管理系统</a>。如下面的图所示
- 对于磁盘上的表示，每个表列都有一个单独的数据文件 (*.bin)，该列的所有值都存储为<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩的</a>格式，并且
- 8.87 百万行在磁盘上按照主键列（以及附加排序键列）的字典顺序存储，即在这种情况下
  - 首先按 `UserID` 排序，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是在磁盘上存储 `UserID`、`URL` 和 `EventTime` 列值的数据文件。

:::note
- 由于主键定义了磁盘上行的字典序，因此一个表只能有一个主键。

- 我们将行的编号从 0 开始，以便与 ClickHouse 内部的行编号方案保持一致，该方案也用于日志消息。
:::
### 数据被组织成颗粒以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，表的列值在逻辑上被划分为颗粒。
颗粒是流入 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着 ClickHouse 总是以流式方式并行读取整组（颗粒）的行，而不是逐行读取。
:::note
列值并不是物理地存储在颗粒内：颗粒只是查询处理的列值的逻辑组织。
:::

以下图表显示了我们表的 8.87 百万行（列值）是如何组织成 1083 个颗粒，结果是因为表的 DDL 语句包含设置 `index_granularity`（设置为其默认值 8192）。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

首先（基于在磁盘上的物理顺序）8192 行（其列值）逻辑上属于颗粒 0，然后下一个 8192 行（其列值）属于颗粒 1，依此类推。

:::note
- 最后一个颗粒（颗粒 1082）“包含”少于 8192 行。

- 我们在本指南的开头提到，在“DDL 语句详情”中，我们禁用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（目的是简化本指南中的讨论并使图表和结果可重复）。

  因此，示例表的所有颗粒（最后一个颗粒除外）都具有相同的大小。

- 对于具有自适应索引粒度的表（根据 [默认值](/operations/settings/merge-tree-settings#index_granularity_bytes) 自适应索引粒度，某些颗粒的大小可能小于 8192 行，这取决于行数据大小）。

- 我们用橙色标记了来自主键列（`UserID`、`URL`）的一些列值。
  这些橙色标记的列值是每个颗粒的每一行的主键列值。
  正如我们将在后面看到的，这些橙色标记的列值将是表主索引的条目。

- 我们将颗粒编号从 0 开始，以便与 ClickHouse 内部的编号方案保持一致，该方案也用于日志消息。
:::
### 主索引每个颗粒有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引基于上图所示的颗粒创建。该索引是一个未压缩的平面数组文件（primary.idx），包含所谓的从 0 开始的数值索引标记。

下图表明，索引存储了每个颗粒的第一行的主键列值（上图中标记为橙色的值）。
换句话说：主索引存储来自表中每隔 8192 行的主键列值（根据主键列定义的物理行顺序）。
例如
- 第一个索引条目（下图中的“标记 0”）存储来自上图中颗粒 0 的第一行的键列值，
- 第二个索引条目（下图中的“标记 1”）存储来自上图中颗粒 1 的第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

对于我们有 8.87 百万行和 1083 个颗粒的表，索引总共有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- 对于具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主索引中还存储一个“最终”额外的标记，记录最后一行的主键列值，但因为我们禁用了自适应索引粒度（以简化本指南的讨论并使图表和结果可重复），因此我们的示例表的索引不包括此最终标记。

- 主索引文件完全加载到主内存中。如果文件大于可用的空闲内存空间，ClickHouse 将引发错误。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自管理的 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 检查示例表的主索引内容。

为此，我们首先需要将主索引文件复制到正在运行的集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>：
<ul>
<li>步骤 1：获取包含主索引文件的部分路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` 在测试机器上。

<li>步骤 2：获取 user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Linux 上默认的 user_files_path</a> 是
`/var/lib/clickhouse/user_files/`

在 Linux 上，您可以检查它是否被更改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上，路径是 `/Users/tomschreiber/Clickhouse/user_files/`

<li>步骤 3：将主索引文件复制到 user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
现在我们可以通过 SQL 检查主索引的内容：
<ul>
<li>获取条目数量</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
结果为 `1083`

<li>获取前两个索引标记</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

结果为

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>获取最后的索引标记</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
返回
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
这与我们示例表的主索引内容图完全匹配：

</p>
</details>

主键条目被称为索引标记，因为每个索引条目标记了特定数据范围的起始位置。具体来说，对于示例表：
- UserID 索引标记：

  存储在主索引中的 `UserID` 值按升序排序。<br/>
  图中的“标记 1”因此表明颗粒 1 及所有后续颗粒中的所有表行的 `UserID` 值都保证大于或等于 4,073,710。

 [正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules)，这种全局顺序使 ClickHouse 能够 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分搜索算法</a> 在查询过滤主键的第一列时，对第一列的索引标记运行搜索。

- URL 索引标记：

  主键列 `UserID` 和 `URL` 的相似基数意味着所有后续主键列索引标记通常只指示数据范围，只要前驱键列值在至少当前颗粒内的所有表行均保持一致。<br/>例如，因为图中标记 0 和标记 1 的 UserID 值不同，所以 ClickHouse 无法假定颗粒 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。然而，如果图中标记 0 和标记 1 的 UserID 值相同（意味着 UserID 值在颗粒 0 的所有表行中保持一致），ClickHouse 可以假定颗粒 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们将稍后详细讨论此对查询执行性能的影响。
### 主索引用于选择颗粒 {#the-primary-index-is-used-for-selecting-granules}

现在我们可以在主索引的支持下执行查询。

以下是计算 UserID 为 749927693 的用户点击次数最多的前 10 个 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返回结果为：

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.005 sec.

# highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouse 客户端的输出现在显示，与执行完整表扫描不同，仅有 8,190 行流入了 ClickHouse。

如果启用了 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">跟踪日志记录</a>，则 ClickHouse 服务器日志文件显示 ClickHouse 正在对 1083 个 UserID 索引标记进行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索</a>，以识别可能包含 `749927693` 的 UserID 列值的颗粒。这需要 19 步，平均时间复杂度为 `O(log2 n)`：
```response
...Executor): Key condition: (column 0 in [749927693, 749927693])

# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 176
...Executor): Found (RIGHT) boundary mark: 177
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              1/1083 marks by primary key, 1 marks to read from 1 ranges
...Reading ...approx. 8192 rows starting from 1441792
```

我们可以在上述跟踪日志中看到，1083 个现有标记中有一个标记满足了查询。

<details>
    <summary>
    跟踪日志详情
    </summary>
    <p>

标记 176 被识别（“找到左边界标记”是包含的，“找到右边界标记”是排除的），因此颗粒 176 中的所有 8192 行（从第 1,441,792 行开始 - 我们将在后面的指南中看到）将被流入 ClickHouse，以查找实际满足 `749927693` 的 UserID 列值的行。
</p>
</details>

我们也可以通过在我们的示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来重复这一点：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返回结果如下：

```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Expression (Projection)                                                               │
│   Limit (preliminary LIMIT (without OFFSET))                                          │
│     Sorting (Sorting for ORDER BY)                                                    │
│       Expression (Before ORDER BY)                                                    │
│         Aggregating                                                                   │
│           Expression (Before GROUP BY)                                                │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (Set limits and quota after reading from storage) │
│                 ReadFromMergeTree                                                     │
│                 Indexes:                                                              │
│                   PrimaryKey                                                          │
│                     Keys:                                                             │
│                       UserID                                                          │
│                     Condition: (UserID in [749927693, 749927693])                     │
│                     Parts: 1/1                                                        │

# highlight-next-line
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 rows in set. Elapsed: 0.003 sec.
```
客户端输出显示，1083 个颗粒中有一个颗粒被选为可能包含 UserID 列值为 749927693 的行。

:::note 结论
当查询在包含复合键的列（且为首个键列）上进行过滤时，ClickHouse 会对键列索引标记运行二分搜索算法。
:::

<br/>

正如上文所述，ClickHouse 使用其稀疏主索引快速（通过二分搜索）选择可能包含与查询匹配的行的颗粒。

这是 ClickHouse 查询执行的 **第一阶段（颗粒选择）**。

在 **第二阶段（数据读取）**，ClickHouse 正在定位所选择的颗粒，以便将其所有行流入 ClickHouse 引擎，以找到实际满足查询的行。

我们将在下面的部分中更详细地讨论第二阶段。
### 标记文件用于定位分片 {#mark-files-are-used-for-locating-granules}

下图展示了我们表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

如前所述，通过对索引的1083个UserID标记进行二分查找，标记176被识别出来。因此，其对应的分片176可能包含UserID列值为749.927.693的行。

<details>
    <summary>
    分片选择详情
    </summary>
    <p>

上面的图表显示标记176是第一个索引条目，其关联的分片176的最小UserID值小于749.927.693，同时下一个标记（标记177）的分片177的最小UserID值大于此值。因此，只有标记176对应的分片176可能包含UserID列值为749.927.693的行。
</p>
</details>

为了确认（或不确认）分片176中是否包含UserID列值为749.927.693的行，需将属于该分片的8192行全部流入ClickHouse。

为此，ClickHouse需知道分片176的物理位置。

在ClickHouse中，我们表的所有分片的物理位置存储在标记文件中。与数据文件类似，每个表列都有一个标记文件。

下图展示了三个标记文件`UserID.mrk`、`URL.mrk`和`EventTime.mrk`，它们存储了表的`UserID`、`URL`和`EventTime`列的分片物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

我们已经讨论了主索引是一个扁平的未压缩数组文件（primary.idx），它包含从0开始编号的索引标记。

同样，标记文件也是一个扁平的未压缩数组文件（*.mrk），包含从0开始编号的标记。

一旦ClickHouse识别并选择了一个可能包含符合查询的行的分片的索引标记，就可以在标记文件中执行位置数组查找，以获取该分片的物理位置。

每个特定列的标记文件条目以偏移量的形式存储两个位置：

- 第一个偏移量（'block_offset'在上图中）定位了包含所选分片压缩版本的<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块</a>，在<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件中。该压缩块可能包含几个压缩的分片。定位到的压缩文件块在读取时会解压到主内存中。

- 第二个偏移量（'granule_offset'在上图中）来自标记文件，提供了未压缩块数据中分片的位置。

然后，将所有属于定位的未压缩分片的8192行流入ClickHouse以进行进一步处理。

:::note

- 对于[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)及无[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse使用上面所示的`.mrk`标记文件，该文件包含每个条目两个8字节长的地址。这些条目是大小相同的分片的物理位置。

索引粒度默认[是自适应的](/operations/settings/merge-tree-settings#index_granularity_bytes)，但为了简化本指南的讨论，以及使图表和结果可重复，我们对示例表禁用了自适应索引粒度。我们的表使用宽格式是因为数据的大小大于[min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（默认为自管理集群的10 MB）。

- 对于宽格式且具有自适应索引粒度的表，ClickHouse使用`.mrk2`标记文件，该文件包含与`.mrk`标记文件类似的条目，但每个条目增加了一个第三个值：当前条目关联的分片的行数。

- 对于[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse使用`.mrk3`标记文件。

:::

:::note 为什么使用标记文件

为什么主索引不直接包含与索引标记对应的分片的物理位置？

因为在ClickHouse旨在应对的非常大规模下，重要的是要非常有效地使用磁盘和内存。

主索引文件必须适应主内存。

对于我们的示例查询，ClickHouse使用了主索引并选择了一个可能包含符合我们查询条件的行的单个分片。仅对于该单个分片，ClickHouse才需要物理位置以流入相应的行进行进一步处理。

此外，偏移信息仅对UserID和URL列是必需的。

对于查询中未使用的列，例如`EventTime`，不需要偏移信息。

对于我们的示例查询，ClickHouse仅需要分片176在UserID数据文件（UserID.bin）中的两个物理位置偏移，以及分片176在URL数据文件（URL.bin）中的两个物理位置偏移。

标记文件提供的间接性避免了直接在主索引中存储所有三个列的1083个分片的物理位置条目：从而避免在主内存中存储不必要的（可能未使用的）数据。
:::

下图及以下文本展示了对于我们的示例查询ClickHouse如何在UserID.bin数据文件中定位分片176。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们在本指南早先讨论过，ClickHouse选择了主索引标记176，因此分片176可能包含符合我们查询条件的行。

ClickHouse现在使用索引中的选定标记号（176）在UserID.mrk标记文件中进行位置数组查找，以获取定位分片176的两个偏移量。

如图所示，第一个偏移量定位了包含分片176压缩版本的UserID.bin数据文件中的压缩文件块。

一旦定位的文件块解压到主内存中，标记文件中的第二个偏移量可用于在未压缩数据中定位分片176。

ClickHouse需要从UserID.bin和URL.bin数据文件中定位（并流入所有值）分片176，以执行我们的示例查询（获取UserID为749.927.693的用户点击最多的前10个URL）。

上述图示了ClickHouse如何定位UserID.bin数据文件的分片。

同时，ClickHouse在URL.bin数据文件中也对分片176执行相同的操作。这两个相应的分片对齐并进入ClickHouse引擎进行进一步处理，即对所有UserID为749.927.693的行，按组聚合和计数URL值，然后最后按计数降序输出最大的10个URL组。
## 使用多个主索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 次要键列可能（不）效率低下 {#secondary-key-columns-can-not-be-inefficient}

当查询在复合键的一部分列上进行过滤，并且是第一个键列时，[ClickHouse就会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当查询在复合键的某一列上进行过滤，但该列不是第一个键列时会发生什么？

:::note
我们讨论了一个场景，即查询显式不在第一个键列上进行过滤，而是在次要键列上进行过滤。

当查询在第一个键列和第一个键列之后的任何键列上进行过滤时，ClickHouse正在对第一个键列的索引标记执行二分查找。
:::

<br/>
<br/>

<a name="query-on-url"></a>
我们使用一个查询，计算最常点击URL "http://public_search" 的前10个用户:

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为: <a name="query-on-url-slow"></a>
```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.086 sec.

# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

客户端输出显示，尽管[URL列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse几乎执行了全表扫描！ClickHouse从表的887万行中读取了881万行。

如果启用[trace_logging](/operations/server-configuration-parameters/settings#logger)，则ClickHouse服务器日志文件显示，ClickHouse对1083个URL索引标记使用了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>，以识别可能包含URL列值为"http://public_search"的行的分片：
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```
我们可以在上面的示例跟踪日志中看到，通过标记选定的1076个（来自1083个）分片可能包含具有匹配URL值的行。

因此，ClickHouse流入了881万行（通过10个流并行）进入ClickHouse引擎，以识别哪些实际包含URL值"http://public_search"的行。

然而，正如我们稍后将看到的，在选定的1076个分片中，只有39个实际包含匹配的行。

虽然基于复合主键（UserID, URL）的主索引对加速过滤特定UserID值的行非常有用，但在加速过滤特定URL值的查询中，该索引并未提供显著的帮助。

原因是URL列不是第一个键列，因此ClickHouse在URL列的索引标记上使用了通用排除搜索算法（而不是二分查找），而且**该算法的有效性依赖于**URL列与其前驱键列UserID之间的基数差异。

为了说明这一点，我们提供了一些通用排除搜索的工作原理的细节。

<a name="generic-exclusion-search-algorithm"></a>
### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下示意了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse通用排除搜索算法</a>在通过次要列选择分片时的工作原理，其中前驱键列具有较低或较高的基数。

我们假设对于这两种情况的例子:
- 查询正在寻找URL值= "W3" 的行。
- 我们命中的表的抽象版本，UserID和URL的值简化。
- 相同的复合主键（UserID, URL）作为索引。这意味着行首先按UserID值排序。具有相同UserID值的行按URL排序。
- 分片大小为两个，即每个分片包含两行。

我们用橙色标记了每个分片的前驱键列值的第一行的关键列值。

**前驱键列具有较低的基数**<a name="generic-exclusion-search-fast"></a>

假设UserID具有较低的基数。在这种情况下，相同UserID值的行可能分布在多个表行和分片中，因此索引标记的数量。对于具有相同UserID的索引标记，URL值是按升序排列的（因为表的行首先按UserID排序，然后按URL）。这允许如下面所述的高效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上面的图对于我们的抽象示例数据的分片选择过程有三种不同的场景：

1.  索引标记0，其**URL值小于W3，并且直接后续的索引标记的URL值也小于W3**，可以被排除，因为标记0和1具有相同的UserID值。请注意，此排除先决条件确保分片0完全由U1 UserID值组成，因此ClickHouse可以假设分片0中的最大URL值也小于W3并排除该分片。

2.  索引标记1，其**URL值小于（或等于）W3，且直接后续的索引标记的URL值大于（或等于）W3**，被选中，因为这意味着分片1可能包含URL W3的行。

3.  索引标记2和3，其**URL值大于W3**，可以被排除，因为主索引的索引标记存储了每个分片的第一行的关键列值，因此分片2和3不可能包含URL值W3。

**前驱键列具有较高的基数**<a name="generic-exclusion-search-slow"></a>

当UserID具有较高的基数时，情况就不太可能相同的UserID值分布在多个表行和分片中。这意味着索引标记的URL值并不是单调增加的：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

如上图所示，所有显示的标记，其URL值小于W3的，都被选中以流入其关联分片的行到ClickHouse引擎。

这是因为，尽管这一图中的所有索引标记都落入了上述场景1，它们并不满足提到的排除先决条件，即**直接后续的索引标记与当前标记具有相同的UserID值**，因此不能被排除。

例如，考虑索引标记0，其**URL值小于W3，并且直接后续的索引标记的URL值也小于W3**。这**不能**被排除，因为直接后续的索引标记1与当前标记0不具有相同的UserID值。

这最终阻止了ClickHouse对分片0中的最大URL值做出假设。相反，它必须假设分片0可能包含URL值W3，并被迫选择标记0。

标记1、2和3也是同样的场景。

:::note 结论
ClickHouse使用的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a>，而不是<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找算法</a>，当查询在复合键的一部分列上进行过滤，但不是第一个键列时，最有效的时候是当前驱键列具有较低的基数。
:::

在我们的示例数据集中，两个关键列（UserID, URL）具有相似的高基数，如前所述，当URL列的前驱键列具有较高或相似的基数时，通用排除搜索算法并不有效。
### 关于数据跳过索引的说明 {#note-about-data-skipping-index}

由于UserID和URL的基数相似较高，我们[在URL上过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)也不会从在URL列上创建[次要数据跳过索引](./skipping-indexes.md)中受益
的[复合主键表（UserID，URL）](#a-table-with-a-primary-key)。

例如，这两个语句在URL列上创建并填充[最小最大](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)数据跳过索引：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse现在创建了一个附加索引，该索引按4个连续[分片](#data-is-organized-into-granules-for-parallel-data-processing)（注意上面的`GRANULARITY 4`子句） 存储最小值和最大值施。

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

第一个索引条目（上述图中的'mark 0'）存储我们表的前4个分片的[行的最小和最大URL值](#data-is-organized-into-granules-for-parallel-data-processing)。

第二个索引条目（'mark 1'）存储我们表的下4个分片的行的最小和最大URL值，依此类推。

（ClickHouse也为数据跳过索引创建了特殊的[标记文件](#mark-files-are-used-for-locating-granules)，用于[定位](#mark-files-are-used-for-locating-granules)与索引标记相关的分片组。）

由于UserID和URL的基数相似较高，该次要数据跳过索引无法在我们执行[查询URL的过滤](#secondary-key-columns-can-not-be-inefficient)时帮助排除分片。

查询所寻求的特定URL值（即'http://public_search'）很可能位于由索引为每个分片组存储的最小值和最大值之间，导致ClickHouse被迫选择分片组（因为它们可能包含与查询条件匹配的行）。
### 需要使用多个主索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们希望显著加快我们的示例查询（过滤特定URL的行），则需要使用针对该查询优化的主索引。

如果我们还希望保持示例查询（过滤特定UserID的行）的良好性能，则需要使用多个主索引。

以下是实现的几种方法。

<a name="multiple-primary-indexes"></a>
### 创建额外主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们希望显著加快两个示例查询 — 一个过滤特定UserID的行，另一个过滤特定URL的行，则需要通过以下三种选项使用多个主索引：

- 创建具有不同主键的**第二张表**。
- 在现有表上创建**物化视图**。
- 向现有表添加**投影**。

这三种选项将有效地将我们示例数据复制到附加表中，以重组表的主索引和行排序顺序。

但是，这三种选项在用户查询和插入语句的路由方面透明度上有所不同。

当创建具有不同主键的**第二张表**时，则必须显式将查询发送到最佳适合该查询的表版本，并且必须显式将新数据插入到两个表中以保持同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用**物化视图**，将隐式创建附加表，数据会在两个表之间自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而**投影**是最透明的选择，因为除了自动保持隐式创建（和隐藏）附加表与数据变化同步外，ClickHouse会自动选择最有效的表版本用于查询：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

接下来，我们详细讨论这三种创建和使用多个主索引的选项，并提供实际示例。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### 选项1：次要表 {#option-1-secondary-tables}

<a name="secondary-table"></a>
我们创建一个新附加表，其中我们改变主键中关键列的顺序（与我们的原始表相比）：

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

插入所有887万行到我们的[原始表](#a-table-with-a-primary-key)中到附加表：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

响应如下：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后优化该表：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

因为我们改变了主键中列的顺序，插入的行现在按不同的字典顺序存储在磁盘上（与我们的[原始表](#a-table-with-a-primary-key)相比），因此该表的1083个分片也包含不同的值：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

这是生成的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

现在可以用来显著加快执行我们的示例查询（过滤URL列）以计算最常点击URL "http://public_search" 的前10个用户：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为：
<a name="query-on-url-fast"></a>

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.017 sec.

# highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

现在，ClickHouse执行该查询要有效得多，而不是[几乎进行全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)。

在[原始表](#a-table-with-a-primary-key)的主索引中，UserID是第一个，URL是第二个键列，ClickHouse使用了[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)来执行该查询，但由于UserID和URL的基数相似高，因此效果不佳。

将URL作为主索引中的第一个列，ClickHouse现在运行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>在索引标记上。

ClickHouse服务器日志文件中的相应跟踪日志确认：
```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
ClickHouse仅选择39个索引标记，而不是1076个，当使用通用排除搜索时。

注意，附加表专门用于加快对URL的过滤查询的执行。

与我们[原始表](#a-table-with-a-primary-key)中对[次要键列](#secondary-key-columns-can-not-be-inefficient)的该查询的[糟糕性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)相似，我们的[过滤`UserIDs`的示例查询](#the-primary-index-is-used-for-selecting-granules)在新附加表中也不会以非常有效的方式运行，因为UserID现在是该表主索引中的第二个键列，因此ClickHouse将使用通用排除搜索进行分片选择，而这对于UserID和URL的基数相似高是[不太有效的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

展开详情框以获取具体信息。

<details>
    <summary>
    现在过滤UserIDs的查询性能差<a name="query-on-userid-slow"></a>
    </summary>
    <p>

```sql
SELECT URL, count(URL) AS Count
FROM hits_URL_UserID
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

响应为：

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.024 sec.

# highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

服务器日志：
```response
...Executor): Key condition: (column 1 in [749927693, 749927693])

# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
</p>
</details>

我们现在有两个表。分别优化以加速对`UserIDs`的查询和加速对URL的查询：
### 选项2：物化视图 {#option-2-materialized-views}

在现有表上创建[物化视图](/sql-reference/statements/create/view.md)。
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

响应如下：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 我们在视图的主键中切换了关键列的顺序（与我们的[原始表](#a-table-with-a-primary-key)相比）
- 该物化视图由**隐式创建的表**支持，其行顺序和主索引基于给定的主键定义
- 该隐式创建的表通过`SHOW TABLES`查询列出，其名称以 `.inner` 开头
- 也可以首先明确为物化视图创建后备表，然后通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 指向该表
- 我们使用`POPULATE`关键字立即将隐式创建的表填充来自源表[hits_UserID_URL](#a-table-with-a-primary-key)的所有887万行
- 如果新行被插入到源表hits_UserID_URL中，那么这些行也会自动插入到隐式创建的表中
- 实际上，隐式创建的表具有与我们[显式创建的次要表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse将隐式创建表和其主索引的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[标记文件](#mark-files-are-used-for-locating-granules)（*.mrk2）和[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在ClickHouse服务器数据目录中的特殊文件夹内：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

物化视图背后的隐式创建的表（及其主索引）现在可以用来显著加快执行我们示例查询的过滤的URL列：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为：

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

因为物化视图背后的隐式创建的表（及其主索引）在功能上与我们[显式创建的次要表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此该查询的执行效果与采用显式创建的表相同。

ClickHouse服务器日志文件中的相应跟踪日志确认，ClickHouse在索引标记上执行二分查找：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,

# highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```
### 选项3：投影 {#option-3-projections}

在现有表上创建投影：
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

并将投影物化：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- 该投影创建了一个**隐藏表**，其行顺序和主索引基于给定的投影的`ORDER BY`子句
- 该隐藏表不会通过`SHOW TABLES`查询列出
- 我们使用`MATERIALIZE`关键字立即填充隐藏表，包含来自源表[hits_UserID_URL](#a-table-with-a-primary-key)的所有887万行
- 如果新行被插入到源表hits_UserID_URL中，那么这些行也会自动插入到隐藏表中
- 查询始终（在语法上）针对源表hits_UserID_URL，但如果行顺序和隐藏表的主索引允许更有效的查询执行，则将使用该隐藏表
- 请注意，即使ORDER BY与投影的ORDER BY语句匹配，投影也不会使使用ORDER BY的查询更加高效（见https://github.com/ClickHouse/ClickHouse/issues/47333）
- 隐式创建的隐藏表在功能上与我们[显式创建的次要表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse将隐式创建的表（*.bin）、标记文件（*.mrk2）和主索引（primary.idx）存储在与源表的数据文件、标记文件和主索引文件相邻的特殊文件夹中（在下面的屏幕截图中标记为橙色）：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

投影创建的隐藏表（及其主索引）现在可以（隐式）用于显著加快执行我们示例查询的过滤的URL列。请注意，查询在语法上是针对投影的源表的。
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为：

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.029 sec.

# highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

因为投影创建的隐藏表（及其主索引）在功能上与我们[显式创建的次要表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此该查询的执行效果与采用显式创建的表相同。

ClickHouse服务器日志文件中的相应跟踪日志确认，ClickHouse在索引标记上执行二分查找：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...

# highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
### 摘要 {#summary}

我们带有复合主键 (UserID, URL) 的 [表](#a-table-with-a-primary-key) 的主索引对于加速 [基于 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 非常有用。但尽管 URL 列是复合主键的一部分，这个索引对于加速 [基于 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 并没有提供显著的帮助。

反之亦然：
我们带有复合主键 (URL, UserID) 的 [表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 能够加速 [基于 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，但对 [基于 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 并没有提供太多支持。

因为主键列 UserID 和 URL 的基数相似较高，因此基于第二个键列进行过滤的查询 [并不太受益于该第二个键列在索引中的存在](#generic-exclusion-search-algorithm)。

因此，删除主索引中的第二个键列是有意义的（从而使索引的内存消耗减少），并且可以 [使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)。

然而，如果复合主键中的键列在基数上存在较大差异，那么 [对于查询](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) 来说，将主键列按基数升序排列是有益的。

键列之间的基数差异越大，键中这些列的顺序就越重要。我们将在下一节中演示这一点。

## 高效排序键列 {#ordering-key-columns-efficiently}

<a name="test"></a>

在复合主键中，键列的顺序可以显著影响：
- 查询中对次级键列的过滤效率，以及
- 表数据文件的压缩比。

为了证明这一点，我们将使用我们 [网络流量示例数据集](#data-set) 的一个版本，其中每行包含三列，指示互联网“用户” (`UserID` 列) 对某个 URL (`URL` 列) 的访问是否被标记为机器人流量 (`IsRobot` 列)。

我们将使用一个包含上述三个列的复合主键，用于加速典型的网络分析查询，这些查询计算：
- 针对特定 URL 的流量中有多少（百分比）来自机器人，或
- 我们对特定用户（不是）机器人的信心有多大（该用户的流量有多少（不）被假设为机器人流量）。

我们使用这个查询来计算我们希望作为复合主键的键列中的三个列的基数（注意，我们使用 [URL 表函数](/sql-reference/table-functions/url.md) 来临时查询 TSV 数据，无需创建本地表）。在 `clickhouse client` 中运行此查询：
```sql
SELECT
    formatReadableQuantity(uniq(URL)) AS cardinality_URL,
    formatReadableQuantity(uniq(UserID)) AS cardinality_UserID,
    formatReadableQuantity(uniq(IsRobot)) AS cardinality_IsRobot
FROM
(
    SELECT
        c11::UInt64 AS UserID,
        c15::String AS URL,
        c20::UInt8 AS IsRobot
    FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
    WHERE URL != ''
)
```
响应是：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

我们可以看到，特别是在 `URL` 和 `IsRobot` 列之间存在较大的基数差异，因此这些列在复合主键中的顺序对于加速基于这些列的查询和实现表的列数据文件的最佳压缩比至关重要。

为了证明这一点，我们创建两个用于我们机器人流量分析数据的表版本：
- 一个表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，在这个表中我们按基数降序排列键列
- 一个表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，在这个表中我们按基数升序排列键列

创建复合主键为 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot`：
```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

并填充 887 万行：
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
这是响应：
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

接下来，创建复合主键为 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL`：
```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
并用我们用来填充前一个表的同样的 887 万行填充它：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
响应是：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### 高效过滤次级键列 {#efficient-filtering-on-secondary-key-columns}

当查询至少过滤一个作为复合键一部分的列，并且是第一个键列时，[ClickHouse 将在其索引标记上运行二分搜索算法](#the-primary-index-is-used-for-selecting-granules)。

当查询仅在作为复合键一部分的列上过滤，但不是第一个键列时，[ClickHouse 使用在键列索引标记上的通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中键列的顺序对 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的有效性是至关重要的。

以下是一个在按基数降序排列键列的表中过滤 `UserID` 列的查询：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
响应是：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

这是在按基数升序排列键列的表上的相同查询：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
响应是：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

我们可以看到，在按基数升序排列键列的表上，查询执行显著更有效和更快。

原因是 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 在通过次级键列选择 [分区片段](#the-primary-index-is-used-for-selecting-granules) 时最有效，当前驱键列具有较低的基数。我们在本指南的 [前一节](#generic-exclusion-search-algorithm) 中详细说明了这一点。

### 数据文件的最佳压缩比 {#optimal-compression-ratio-of-data-files}

此查询比较了我们上述两个表中 `UserID` 列的压缩比：

```sql
SELECT
    table AS Table,
    name AS Column,
    formatReadableSize(data_uncompressed_bytes) AS Uncompressed,
    formatReadableSize(data_compressed_bytes) AS Compressed,
    round(data_uncompressed_bytes / data_compressed_bytes, 0) AS Ratio
FROM system.columns
WHERE (table = 'hits_URL_UserID_IsRobot' OR table = 'hits_IsRobot_UserID_URL') AND (name = 'UserID')
ORDER BY Ratio ASC
```
响应是：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

我们可以看到，对于按基数升序排列键列的表，`UserID` 列的压缩比显著更高。

尽管在两个表中存储的完全相同的数据（我们在两个表中插入了相同的 887 万行），但复合主键中键列的顺序对表的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) 中 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 数据所需的磁盘空间有显著影响：
- 在复合主键为 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot` 中，我们按基数降序排列键列，`UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
- 在复合主键为 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL` 中，我们按基数升序排列键列，`UserID.bin` 数据文件仅占用 **877.47 KiB** 的磁盘空间

对于表中某列的数据在磁盘上具有良好的压缩比，不仅可以节省磁盘空间，还可以加快需要从该列读取数据的查询（尤其是分析性查询），因为从磁盘将该列的数据移动到主内存（操作系统的文件缓存）所需的 I/O 更少。

在接下来的内容中，我们将说明为什么按基数升序排列主键列有利于表中列的压缩比。

下面的图示描绘了主键的行在磁盘上的顺序，其中键列按基数升序排列：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

我们讨论过 [表的行数据是在磁盘上按主键列的顺序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上面的图中，表的行（它们在磁盘上的列值）首先按其 `cl` 值排序，具有相同 `cl` 值的行按其 `ch` 值排序。由于第一个键列 `cl` 的基数较低，因此很可能存在具有相同 `cl` 值的行。因此，由于这个原因，`ch` 值也可能是有序的（本地 - 对于具有相同 `cl` 值的行）。

如果在某列中，相似的数据彼此靠近，例如通过排序，那么这些数据的压缩效果会更好。
通常，压缩算法受益于数据的重复长度（数据量越大，压缩效果越好）
和局部性（数据越相似，压缩比越好）。

与上面的图示相比，下面的图示描绘了主键的行在磁盘上的顺序，其中键列按基数降序排列：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

现在，表的行首先按其 `ch` 值排序，具有相同 `ch` 值的行按其 `cl` 值排序。
但是，由于第一个键列 `ch` 的基数较高，因此可能不存在具有相同 `ch` 值的行。因此，由于这个原因，`cl` 值也不太可能是有序的（本地 - 对于具有相同 `ch` 值的行）。

因此，`cl` 值很可能是随机顺序，因此局部性差，以至于压缩比也变得很差。

### 摘要 {#summary-1}

对于查询中对次级键列的高效过滤和表的列数据文件的压缩比，将主键中的列按基数升序排列是有益的。

## 高效识别单行 {#identifying-single-rows-efficiently}

尽管一般来说这不是 [ClickHouse 的最佳用例](/knowledgebase/key-value)，但有时在 ClickHouse 上构建的应用程序需要识别 ClickHouse 表的单行。

一个直观的解决方案可能是使用一个具有唯一值的 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，并将该列用作主键列以快速检索行。

为了实现最快的检索，UUID 列 [需要是第一个键列](#the-primary-index-is-used-for-selecting-granules)。

我们讨论过，由于 [ClickHouse 表的行数据是在磁盘上按主键列存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中具有非常高基数的列（比如 UUID 列）在低基数列之前 [对其他表列的压缩比是有害的](#optimal-compression-ratio-of-data-files)。

在最快检索和最佳数据压缩之间的折中是在复合主键中使用 UUID 作为最后一个键列，在低（或较低）基数键列之后，这些列用于确保一些表列的良好压缩比。

### 一个具体示例 {#a-concrete-example}

一个具体示例是纯文本粘贴服务 [https://pastila.nl](https://pastila.nl)，由 Alexey Milovidov 开发并 [博文介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

每次更改文本区域时，数据都会自动保存到 ClickHouse 表的行中（每次更改一行）。

一种识别和检索（特定版本的）粘贴内容的方法是使用内容的哈希作为包含该内容的表行的 UUID。

下图展示了
- 当内容发生变化时行的插入顺序（例如，通过在文本区域中输入文本的按键）以及
- 使用 `PRIMARY KEY (hash)` 时插入行的数据在磁盘上的顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

因为 `hash` 列被用作主键列，
- 特定行可以 [非常快速地](#the-primary-index-is-used-for-selecting-granules) 检索，但
- 表的行（它们的列数据）在磁盘上按（唯一和随机的）哈希值按升序存储。因此，内容列的值也以随机顺序存储，导致 **内容列数据文件的压缩比不理想**。

为了在保持对特定行的快速检索的同时显著提高内容列的压缩比，pastila.nl 使用了两个哈希（和一个复合主键）来标识特定行：
- 上述讨论的内容哈希，对于不同数据是不同的，
- 一个 [局部敏感哈希（指纹）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，在数据发生小变化时 **不会** 改变。

下图展示了
- 当内容发生变化时行的插入顺序（例如，通过在文本区域中输入文本的按键）以及
- 使用复合 `PRIMARY KEY (fingerprint, hash)` 时插入行的数据在磁盘上的顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

现在，磁盘上的行首先按 `fingerprint` 排序，对于具有相同指纹值的行，它们的 `hash` 值决定了最终顺序。

由于仅在小变化中有所不同的数据得到相同指纹值，因此相似的数据现在在内容列的磁盘上近似存储。这对内容列的压缩比是很有利的，因为压缩算法通常受益于数据的局部性（数据越相似，压缩比越好）。

其折中是需要两个字段（`fingerprint` 和 `hash`）才能在最优地利用复合 `PRIMARY KEY (fingerprint, hash)` 产生的主索引来检索特定行。
