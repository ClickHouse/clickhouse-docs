---
'sidebar_label': '主键索引'
'sidebar_position': 1
'description': '在本指南中，我们将深入探讨ClickHouse索引。'
'title': '对ClickHouse中主键索引的实用介绍'
'slug': '/guides/best-practices/sparse-primary-indexes'
'show_related_blogs': true
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


# ClickHouse 主索引的实用介绍
## 介绍 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引。我们将详细说明和讨论：
- [ClickHouse 中的索引与传统关系数据库管理系统的不同之处](#an-index-design-for-massive-data-scales)
- [ClickHouse 是如何构建和使用表的稀疏主索引的](#a-table-with-a-primary-key)
- [在 ClickHouse 中索引的一些最佳实践](#using-multiple-primary-indexes)

您可以选择在自己的机器上执行本指南中提供的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门说明，请参见 [快速开始](/quick-start.mdx)。

:::note
本指南专注于 ClickHouse 稀疏主索引。

有关 ClickHouse 的 [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参见 [教程](/guides/best-practices/skipping-indexes.md)。
:::
### 数据集 {#data-set}

在整个指南中，我们将使用一个匿名的网络流量数据集示例。

- 我们将使用数据集中 8.87 百万行（事件）的一个子集。
- 未压缩的数据大小为 8.87 百万事件，约为 700 MB。在 ClickHouse 中存储时，压缩为 200 MB。
- 在我们的子集中，每一行包含三列，指示在特定时间点击 URL 的互联网用户（`UserID` 列、`URL` 列、`EventTime` 列）。

有了这三列，我们已经可以构建一些典型的网络分析查询，例如：

- “特定用户点击次数最多的前 10 个 URL 是什么？”
- “最常点击特定 URL 的前 10 个用户是谁？”
- “用户在特定 URL 上点击的最热门时间（例如一周中的天数）是什么？”

### 测试机器 {#test-machine}

本文档中给出的所有运行时数字均基于在配备 Apple M1 Pro 芯片和 16GB RAM 的 MacBook Pro 上本地运行 ClickHouse 22.2.1。
### 完整表扫描 {#a-full-table-scan}

为了查看在没有主键的情况下查询是如何在我们的数据集中执行的，我们通过执行以下 SQL DDL 语句创建一个表（使用 MergeTree 表引擎）：

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

接下来，使用以下 SQL 插入语句将部分点击数据集插入该表。
这使用了 [URL 表函数](/sql-reference/table-functions/url.md)，以从 clickhouse.com 上远程托管的完整数据集中加载部分数据：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
响应为：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse 客户端的结果输出显示，上述语句将 8.87 百万行插入了该表。

最后，为了简化本指南后面的讨论并使图表和结果可重复，我们使用 FINAL 关键字对表进行 [优化](/sql-reference/statements/optimize.md)：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常在将数据加载到表后并不要求或推荐立即优化表。
为什么此示例需要这样做将变得显而易见。
:::

现在，我们执行第一个网络分析查询。以下查询计算用户 ID 为 749927693 的互联网用户点击次数最多的前 10 个 URL：

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
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

10 rows in set. Elapsed: 0.022 sec.

# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse 客户端的结果输出表明，ClickHouse 执行了完整的表扫描！我们表中的 8.87 百万行的每一行都被流入 ClickHouse。这不具有可扩展性。

为了使这一过程（更）高效且（更）快速，我们需要使用具有适当主键的表。这将使 ClickHouse 基于主键列自动创建稀疏主索引，从而显著加快我们示例查询的执行速度。

## ClickHouse 索引设计 {#clickhouse-index-design}
### 大规模数据的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系数据库管理系统中，主索引将为每一行表包含一个条目。这将导致主索引为我们的数据集包含 8.87 百万条条目。这样的索引允许快速定位特定行，从而为查找查询和点更新提供高效性。在 `B(+)-Tree` 数据结构中搜索一个条目的平均时间复杂度为 `O(log n)`；更准确地说，`log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是索引行的数量。因为 `b` 通常在几百到几千之间，`B(+)-Trees` 是非常浅的结构，定位记录所需的磁盘寻址次数很少。对于 8.87 百万行和分支因子为 1000，平均需要 2.3 次磁盘寻址。这个能力是有代价的：额外的磁盘和内存开销、更高的插入成本以及在向表中添加新行和索引条目时，有时需要重新平衡 B-Tree。

考虑到与 B-Tree 索引相关的挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse 的 [MergeTree 引擎家族](/engines/table-engines/mergetree-family/index.md) 被设计和优化以处理大规模数据量。这些表被设计为每秒接收数百万行的插入，并存储巨大的数据（数百 TB）。数据以 [逐部分](#mergetree-data-storage) 的方式快速写入表中，并在后台应用合并部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分合并时，合并部分的主索引也会合并。在 ClickHouse 被设计为支持的大规模环境中，磁盘和内存效率至关重要。因此，主索引为每个部分仅具有一个索引条目（称为“标记”），每组行（称为“粒度”）一个 —— 这种技术称为 **稀疏索引**。

稀疏索引是可能的，因为 ClickHouse 按照主键列的顺序在磁盘上存储一部分的行。与直接定位单行（如基于 B-Tree 的索引）不同，稀疏主索引允许它快速通过对索引条目的二分搜索识别可能与查询匹配的行组。定位到的潜在匹配的行组（粒度）然后以并行的方式流入 ClickHouse 引擎，以找到匹配项。这种索引设计使主索引体积小（它可以并且必须完全装入主内存），同时显著加快查询执行时间：尤其是对数据分析用例中典型的范围查询。

以下详细说明 ClickHouse 如何构建和使用其稀疏主索引。在文章后面，我们将讨论选择、删除和排序构建索引所用表列（主键列）的最佳实践。
### 具有主键的表 {#a-table-with-a-primary-key}

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

为了简化本指南后续的讨论，以及使图表和结果可重复，DDL 语句：

<ul>
  <li>
    通过 <code>ORDER BY</code> 子句指定了表的复合排序键。
  </li>
  <li>
    通过设置显式控制主索引将具有多少索引条目：
    <ul>
      <li>
        <code>index_granularity</code>：显式设置为默认值 8192。这意味着每 8192 行的组主索引将有一个索引条目。例如，如果表包含 16384 行，则索引将有两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>：设置为 0，以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着 ClickHouse 会自动为 n 行的组创建一个索引条目，如果以下任一条件为真：
        <ul>
          <li>
            如果 <code>n</code> 小于 8192 且该 <code>n</code> 行的组合行数据大小大于或等于 10 MB（<code>index_granularity_bytes</code> 的默认值）。
          </li>
          <li>
            如果 <code>n</code> 行的组合行数据大小小于 10 MB，但 <code>n</code> 为 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>：设置为 0，以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引的压缩</a>。这将允许我们在稍后选择性地检查其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

DDL 语句中的主键导致基于两个指定的关键列创建主索引。

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
响应如下：
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

响应为：

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

ClickHouse 客户端输出显示：

- 表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 存储在磁盘上的特定目录中，意味着每一列在该目录中将有一个数据文件（和一个标记文件）。
- 表具有 8.87 百万行。
- 所有行的未压缩数据总大小为 733.28 MB。
- 所有行在磁盘上的压缩大小为 206.94 MB。
- 表具有 1083 个条目的主索引（称为“标记”），索引的大小为 96.93 KB。
- 总体而言，表的数据和标记文件以及主索引文件在磁盘上一起占用 207.07 MB。

### 数据按主键列的顺序存储在磁盘上 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们上面创建的表具有
- 复合 [主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 和
- 复合 [排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- 如果我们只指定排序键，则主键将隐式定义为等于排序键。

- 为了提高内存利用率，我们显式指定了仅包含我们查询过滤的列的主键。基于主键的主索引完全加载到主内存中。

- 为了在指南的图表中保持一致并最大化压缩比率，我们定义了一个单独的排序键，其中包含所有表的列（如果在同一列中相似的数据彼此靠近，例如通过排序.then 这些数据将被更好地压缩）。

- 如果同时指定主键和排序键，则主键需要是排序键的前缀。
:::

插入的行在磁盘上按照主键列（和排序键中的额外 `EventTime` 列）以字典序（升序）存储。

:::note
ClickHouse 允许插入具有相同主键列值的多行。在这种情况下（请参见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此 `EventTime` 列的值。
:::

ClickHouse 是一个 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列式数据库管理系统</a>。如下图所示
- 对于磁盘上的表示，每个表列有一个单独的数据文件（*.bin），该列的所有值都是以 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 格式存储的，并且
- 8.87 百万行在磁盘上以主键列（和额外排序键列）的字典顺序存储，即在这种情况下
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是存储 `UserID`、`URL` 和 `EventTime` 列值的数据文件。

:::note
- 由于主键定义了磁盘上行的字典序，因此一个表只能有一个主键。

- 为了与 ClickHouse 内部的行编号方案保持一致，我们从 0 开始编号行，该方案也用于日志消息。
:::
### 数据被组织为粒度以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

为了处理数据，表的列值在逻辑上被划分为粒度。
粒度是流入 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着 ClickHouse 始终以流式方式（并行）读取一整组（粒度）行，而不是读取单个行。
:::note
列值不会物理存储在粒度内：粒度只是用于查询处理的列值的逻辑组织。
:::

以下图表显示了我们表 8.87 百万行的（列值的）组织方式
根据表的 DDL 语句中包含的 `index_granularity` 设置（设置为默认值 8192），它被组织成 1083 个粒度。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

根据磁盘上的物理顺序，前 8192 行（它们的列值）逻辑上属于粒度 0，然后接下来的 8192 行（它们的列值）属于粒度 1，依此类推。

:::note
- 最后一个粒度（粒度 1082）“包含”少于 8192 行。

- 我们在本指南开头的“DDL 语句详情”中提到，我们禁用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（为了简化本指南中的讨论以及使图表和结果可重复）。

因此我们示例表的所有粒度（除了最后一个）都具有相同的大小。

- 对于具有自适应索引粒度的表（索引粒度默认是自适应的），某些粒度的大小可能少于 8192 行，具体取决于行数据的大小。

- 我们用橙色标记了主键列中的一些列值（`UserID`、`URL`）。
这些橙色标记的列值是每个粒度的每行的主键列值。
正如我们下面看到的，这些橙色标记的列值将是表主索引中的条目。

- 我们从 0 开始编号粒度，以便与 ClickHouse 的内部编号方案保持一致，该方案也用于日志消息。
:::
### 主索引每个粒度有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上面图中显示的粒度创建的。该索引是一个未压缩的平面数组文件（primary.idx），包含从 0 开始的所谓数字索引标记。

下面的图表显示该索引存储每个粒度的第一行的主键列值（在上面的图中标记为橙色）。
换句话说：主索引存储表中每第 8192 行的主键列值（基于主键列定义的物理行顺序）。
例如：
- 第一个索引条目（下图中的 'mark 0'）存储上面图中粒度 0 第一行的键列值，
- 第二个索引条目（下图中的 'mark 1'）存储上面图中粒度 1 第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

总的来说，该索引对我们的 8.87 百万行和 1083 个粒度的表有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- 对于具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主索引中还会存储一个“最后”附加标记，记录最后一行的主键列的值，但由于我们禁用了自适应索引粒度（为了简化本指南中的讨论以及使图表和结果可重复），因此我们示例表的索引不包括这个最后标记。

- 主索引文件完全加载到主内存中。如果文件大于可用的空闲内存空，ClickHouse 会抛出错误。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自管理的 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 检查示例表的主索引的内容。

为此，我们首先需要将主索引文件复制到运行中的集群节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>：
<ul>
<li>步骤 1：获取包含主索引文件的部分路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` 在测试机器上。

<li>步骤 2：获取 user_files_path</li>
在 Linux 上，<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 是
`/var/lib/clickhouse/user_files/`

在 Linux 上，您可以检查其是否已更改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上，该路径为 `/Users/tomschreiber/Clickhouse/user_files/`

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
返回 `1083`

<li>获取前两个索引标记</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

返回

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>获取最后一个索引标记</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
返回
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
这与我们的示例表的主索引内容的图表完全匹配：

</p>
</details>

主键条目被称为索引标记，因为每个索引条目标记特定数据范围的开始。特别对于示例表：
- UserID 索引标记：

  存储在主索引中的 `UserID` 值按升序排列。<br/>
  因此，上图中的 'mark 1' 表示粒度 1 中所有表行的 `UserID` 值以及所有后续粒度的值保证大于或等于 4.073.710。

 [稍后我们将看到](#the-primary-index-is-used-for-selecting-granules)，这个全局顺序使 ClickHouse 能够在查询过滤第一个主键列时，对索引标记使用 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找算法</a>。

- URL 索引标记：

  主键列 `UserID` 和 `URL` 的类似基数意味着所有关键列中第一个列之后的索引标记通常仅指示数据范围，只要前一个键列值在当前粒度的所有行中保持不变。<br/>
由于图中的标记 0 和标记 1 的 UserID 值不同，ClickHouse 不能假设粒度 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。然而，如果上图中标记 0 和标记 1 的 UserID 值相同（意味着在粒度 0 中所有表行的 UserID 值保持不变），ClickHouse 可以假设粒度 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。

我们将稍后详细讨论这对查询执行性能的影响。
### 主索引用于选择粒度 {#the-primary-index-is-used-for-selecting-granules}

我们现在可以执行查询，并得到主索引的支持。

以下查询计算用户 ID 为 749927693 的用户点击次数最多的前 10 个 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
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

10 rows in set. Elapsed: 0.005 sec.

# highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouse 客户端的输出现在显示，取而代之的是执行完整的表扫描，只有 8.19 千行被流入 ClickHouse。

如果 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">启用跟踪日志记录</a>，然后 ClickHouse 服务器日志文件显示 ClickHouse 正在对 1083 个 UserID 索引标记执行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以识别可能包含 UserID 列值为 `749927693` 的行的粒度。这需要 19 步，平均时间复杂度为 `O(log2 n)`：
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

我们可以在上面的跟踪日志中看到，找到 1083 个标记中的一个满足查询。

<details>
    <summary>
    跟踪日志详情
    </summary>
    <p>

标记 176 被识别（‘找到左边界标记’是包含的，’找到右边界标记’是不包括的），因此粒度 176 中的所有 8192 行（从行 1.441.792 开始 - 我们将在本指南的后面部分看到）然后流入 ClickHouse，以寻找实际具有 UserID 列值为 `749927693` 的行。
</p>
</details>

我们还可以通过在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 进行重现：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

响应如下：

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
客户端输出显示，1083 个粒度中有一个被选择为可能包含 UserID 列值为 749927693 的行。

:::note 结论
当查询过滤的列是复合键的一部分且是第一个键列时，ClickHouse 会对键列的索引标记运行二分查找算法。
:::

<br/>

正如上面讨论的那样，ClickHouse 使用其稀疏主索引快速（通过二分查找）选择可能包含匹配查询的行的粒度。

这是 ClickHouse 查询执行的 **第一阶段（粒度选择）**。

在 **第二阶段（数据读取）** 中，ClickHouse 定位所选的粒度，以流入 ClickHouse 引擎所有这些行，从而找到实际匹配查询的行。

我们将在以下部分详细讨论这一第二阶段。
### 标记文件用于定位 granules {#mark-files-are-used-for-locating-granules}

下图说明了我们表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

如上所述，通过对索引的 1083 个 UserID 标记进行二分查找，识别出标记 176。因此，其对应的 granule 176 可能包含 UserID 列值为 749.927.693 的行。

<details>
    <summary>
    Granule 选择详情
    </summary>
    <p>

上图显示，标记 176 是第一个索引条目，其中关联的 granule 176 的最小 UserID 值小于 749.927.693，而下一个标记（标记 177）的 granule 177 的最小 UserID 值大于该值。因此，仅标记 176 的对应 granule 176 可能包含 UserID 列值为 749.927.693 的行。
</p>
</details>

为了确认（或否定）granule 176 中是否包含 UserID 列值为 749.927.693 的某些行，需要将属于该 granule 的所有 8192 行流式传输到 ClickHouse。

为此，ClickHouse 需要知道 granule 176 的物理位置。

在 ClickHouse 中，所有 granule 的物理位置都存储在标记文件中。类似于数据文件，每个表列都有一个标记文件。

下图显示了存储表的 `UserID`、`URL` 和 `EventTime` 列的 granules 物理位置的三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

我们已经讨论了主索引是一个扁平的无压缩数组文件（primary.idx），其中包含从 0 开始编号的索引标记。

类似地，标记文件也是一个扁平的无压缩数组文件（*.mrk），其中包含从 0 开始编号的标记。

一旦 ClickHouse 确定并选择了可能包含查询匹配行的 granule 的索引标记，就可以在标记文件中执行位置数组查找，以获得该 granule 的物理位置。

每个特定列的标记文件条目存储以偏移量的形式提供两个位置：

- 第一个偏移量（上图中的 'block_offset'）定位了包含所选 granule 压缩版本的 <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块</a>，该块位于 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 列数据文件中。这个压缩块可能包含几个压缩的 granules。定位到的压缩文件块在读取时被解压缩到主内存中。

- 第二个偏移量（上图中的 'granule_offset'）来自标记文件，提供了未压缩块数据中 granule 的位置。

然后，属于定位的未压缩 granule 的所有 8192 行被流式传输到 ClickHouse 进行进一步处理。

:::note

- 对于具有 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 且没有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，ClickHouse 如上图所示使用 `.mrk` 标记文件，包含每个条目的两个 8 字节长地址。这些条目是物理位置的 granules，它们的大小相同。

索引粒度在 [默认情况下](/operations/settings/merge-tree-settings#index_granularity_bytes) 是自适应的，但对于我们的示例表，我们禁用了自适应索引粒度（为了简化本文中的讨论，以及使图表和结果可重现）。我们的表使用宽格式，因为数据的大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（对于自管理集群默认值为 10 MB）。

- 对于具有宽格式且具有自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，其中的条目与 `.mrk` 标记文件相似，但每个条目包含一个额外的第三个值：与当前条目关联的 granule 的行数。

- 对于 [紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 的表，ClickHouse 使用 `.mrk3` 标记文件。

:::


:::note 为什么使用标记文件

为什么主索引不直接包含与索引标记对应的 granules 的物理位置？

因为在 ClickHouse 设计的那个非常大的规模上，非常重要的是高效地使用磁盘和内存。

主索引文件需要适合主内存。

对于我们的示例查询，ClickHouse 使用主索引并选择一个可能包含与我们的查询匹配的行的单个 granule。只有在这个 granule 中，ClickHouse 才需要物理位置以流式传输相应的行进行进一步处理。

此外，这些偏移信息仅对 UserID 和 URL 列是必需的。

对于未在查询中使用的列（例如 `EventTime`），不需要偏移信息。

对于我们的示例查询，ClickHouse 仅需要在 UserID 数据文件 (UserID.bin) 中 granule 176 的两个物理位置偏移量，以及在 URL 数据文件 (URL.bin) 中 granule 176 的两个物理位置偏移量。

通过标记文件提供的间接性避免将所有 1083 个 granules 的物理位置条目直接存储在主索引中：从而避免在主内存中存储不必要（可能未使用）的数据。
:::

下图和以下文本说明了 ClickHouse 如何在 UserID.bin 数据文件中定位 granule 176。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们之前在本指南中讨论了 ClickHouse 选择了主索引标记 176，因此 granule 176 可能包含与我们的查询匹配的行。

ClickHouse 现在使用选定的标记号 (176) 从索引中进行位置数组查找，以获取定位 granule 176 的两个偏移量。

如所示，第一个偏移量定位了包含 granule 176 压缩版本的 UserID.bin 数据文件中的压缩文件块。

一旦定位的文件块被解压缩到主内存中，标记文件中的第二个偏移量可以用于定位未压缩数据中的 granule 176。

ClickHouse 需要从 UserID.bin 数据文件和 URL.bin 数据文件中定位（并流式传输所有值）granule 176，以执行我们的示例查询（针对 UserID 为 749.927.693 的互联网用户点击次数最多的前 10 个 URL）。

上图显示了 ClickHouse 如何为 UserID.bin 数据文件定位 granule。

同时，ClickHouse 对 URL.bin 数据文件的 granule 176 做同样的操作。两个相应的 granules 对齐并被流式传输到 ClickHouse 引擎进行进一步处理，即对所有 UserID 为 749.927.693 的行聚合和计数 URL 值，然后最终输出按计数降序排列的 10 大 URL 组。
## 使用多个主索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 次级键列可能（不）低效 {#secondary-key-columns-can-not-be-inefficient}

当查询在作为复合键一部分的列上进行过滤且为第一个键列时，[ClickHouse 在键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但当查询在作为复合键一部分的列上过滤，但不是第一个键列时，会发生什么？

:::note
我们讨论一个场景，即查询明确不在第一个键列上过滤，而是在次级键列上进行过滤。

当查询在第一个键列和任何后续键列上进行过滤时，ClickHouse 在第一个键列的索引标记上运行二分查找。
:::

<br/>
<br/>

<a name="query-on-url"></a>
我们使用一个查询来计算最频繁点击 URL “http://public_search”的前 10 个用户：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为： <a name="query-on-url-slow"></a>
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

客户端输出表明，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse 几乎执行了全表扫描！ClickHouse 从 8.87 百万行的表中读取了 8.81 百万行。

如果启用 [trace_logging](/operations/server-configuration-parameters/settings#logger)，那么 ClickHouse 服务器日志文件显示，ClickHouse 在 1083 个 URL 索引标记上使用了 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a> 以识别可能包含行的 granules，其 URL 列值为 “http://public_search”：
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
我们可以在上述示例跟踪日志中看到，1076（通过标记）个 granules 被选中为可能包含匹配 URL 值的行。

这导致 8.81 百万行被流式传输到 ClickHouse 引擎（通过使用 10 个流并行），以识别实际包含 URL 值 “http://public_search”的行。

然而，正如我们稍后将看到的，实际上，仅 39 个 granules 出选中 1076 个 granules 实际上包含匹配行。

虽然基于复合主键 (UserID, URL) 的主索引对加速过滤特定 UserID 值的行的查询非常有用，但但它在加速过滤特定 URL 值的行的查询时并没有提供显著帮助。

原因在于 URL 列不是第一个键列，因此 ClickHouse 对 URL 列的索引标记使用通用排除搜索算法（而不是二分查找），而 **该算法的有效性取决于** URL 列与其前驱键列 UserID 之间的基数差异。

为了说明这一点，我们提供一些通用排除搜索如何工作的细节。

<a name="generic-exclusion-search-algorithm"></a>
### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下是说明 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse 通用排除搜索算法</a> 如何工作，当通过次级列选择 granules 时，前驱键列具有低（或高）基数。

对于这两种情况，我们假设：
- 一个查询在搜索 URL 值 = "W3" 的行。
- 我们的点击表的抽象版本，UserID 和 URL 的简化值。
- 相同的复合主键 (UserID, URL) 作为索引。这意味着行首先按 UserID 值排序。具有相同 UserID 值的行随后按 URL 排序。
- 每个 granule 的大小为两个，即每个 granule 包含两行。

我们在以下图表上标出每个 granule 的第一行的键列值。

**前驱键列具有低（或较低的）基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 的基数较低。在这种情况下，可能同一个 UserID 值分布在多个表行和 granules 以及索引标记中。对于具有相同 UserID 的索引标记，URL 值按升序排序（因为表行首先按 UserID 排序，然后按 URL 排序）。这允许有效过滤，如下所述：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

对于上图中我们抽象示例数据的 granule 选择过程，有三种不同的场景：

1. 索引标记 0 的 **URL 值小于 W3，并且直接后续索引标记的 URL 值也小于 W3**，可以排除，因为标记 0 和 1 具有相同的 UserID 值。请注意，此排除前提确保 granule 0 完全由 U1 UserID 值组成，以便 ClickHouse 可以假设 granule 0 中的最大 URL 值也小于 W3，因此可以排除该 granule。

2. 索引标记 1 的 **URL 值小于（或等于） W3，并且直接后续索引标记的 URL 值大于（或等于） W3** 被选中，因为这意味着 granule 1 可能包含 URL W3 的行。

3. 索引标记 2 和 3 的 **URL 值大于 W3** 可以被排除，因为主索引的索引标记存储每个 granule 第一行的键列值，而表行在磁盘上按键列值排序，因此 granule 2 和 3 不可能包含 URL 值 W3。

**前驱键列具有高（或较高的）基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 具有较高基数时，同一个 UserID 值分布在多个表行和 granules 的可能性较小。这意味着索引标记的 URL 值不是单调增加的：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

如上图所示，所有标记的 URL 值小于 W3 的索引标记都被选中，以流式传输其关联的 granules 的行到 ClickHouse 引擎。

这是因为虽然上图中的所有索引标记都属于上述场景 1，但它们不满足被提及的排除前提，即 *直接后续索引标记与当前标记具有相同的 UserID 值*，因此不能被排除。

例如，考虑索引标记 0 的 **URL 值小于 W3，并且直接后续索引标记的 URL 值也小于 W3**。这不能被排除，因为直接后续索引标记 1 不具有与当前标记 0 相同的 UserID 值。

这最终阻止 ClickHouse 对 granule 0 中的最大 URL 值做出假设。相反，它必须假设 granule 0 可能包含 URL 值 W3 的行，并被迫选择标记 0。

标记 1、2 和 3 的情况也是如此。

:::note 结论
ClickHouse 使用的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a> 而不是 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找算法</a>，当查询在作为复合键一部分的列上过滤时，但不是第一个键列时，在前驱键列具有低（或较低）基数时效果最佳。
:::

在我们的示例数据集中，两个键列 (UserID, URL) 具有相似的高基数，并且，如前所述，当 URL 列的前驱键列具有高（或相似）基数时，通用排除搜索算法的效果不佳。
### 关于数据跳过索引的说明 {#note-about-data-skipping-index}

由于 UserID 和 URL 的基数相似较高，因此我们的 [查询在 URL 上过滤](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 在创建 URL 列的 [次级数据跳过索引](./skipping-indexes.md) 时也不会有太大益处，
对于我们具有复合主键 (UserID, URL) 的 [表](#a-table-with-a-primary-key)。

例如，这两条语句在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) 数据跳过索引：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse 现在创建了一个附加索引，该索引存储 - 每组 4 个连续的 [granules](#data-is-organized-into-granules-for-parallel-data-processing)（注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句） - 最小和最大 URL 值：

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

第一个索引条目（上图中的 'mark 0'）存储属于我们表的前 4 个 granules 的 [行的最小和最大 URL 值](#data-is-organized-into-granules-for-parallel-data-processing)。

第二个索引条目（'mark 1'）存储属于我们表的下 4 个 granules 的行的最小和最大 URL 值，以此类推。

（ClickHouse 还为数据跳过索引创建了一个特殊的 [标记文件](#mark-files-are-used-for-locating-granules)，用于 [定位](#mark-files-are-used-for-locating-granules) 与索引标记关联的 granule 组。）

由于 UserID 和 URL 的基数相似较高，因此当执行我们的 [查询过滤在 URL 上](#secondary-key-columns-can-not-be-inefficient) 时，这个次级数据跳过索引不能有效帮助排除 granules。

查询所需的特定 URL 值（即 'http://public_search'）很可能在索引为每个 granule 组存储的最小和最大值之间，导致 ClickHouse 被迫选择该 granule 组（因为它们可能包含与查询匹配的行）。
### 需要使用多个主索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想显著加快过滤特定 URL 的行的示例查询，则需要使用针对该查询优化的主索引。

如果我们还希望保持查询过滤特定 UserID 的良好性能，则需要使用多个主索引。

以下是实现的方式。

<a name="multiple-primary-indexes"></a>
### 创建附加主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们希望显著加快两个示例查询 - 一个是过滤特定 UserID 的行，另一个是过滤特定 URL 的行 - 那么我们需要使用多个主索引，使用以下三种选项中的一种：

- 创建一个 **第二张表**，其主键不同。
- 在我们现有的表上创建一个 **物化视图**。
- 向我们现有的表添加一个 **投影**。

这三种选项都将有效地将我们的示例数据复制到附加表中，以重新组织表的主索引和行排序顺序。

然而，这三种选项在附加表相对于查询和插入语句的路由的透明性上有所不同。

当创建一个 **第二张表**，其主键不同，则必须显式将查询发送到最适合该查询的表版本，并且必须显式将新数据插入到两个表中，以保持表之间的同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用 **物化视图** 时，附加表会隐式创建，数据在两个表之间自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

**投影** 是最透明的选项，因为除了自动保持隐式创建（和隐藏的）附加表与数据变化同步外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

在以下部分中，我们将详细讨论这三种创建和使用多个主索引的选项，并提供实际示例。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### 选项 1：次级表 {#option-1-secondary-tables}

<a name="secondary-table"></a>
我们创建一个新的附加表，在主键中切换键列的顺序（与原始表相比）：

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

将我们 [原始表](#a-table-with-a-primary-key) 中的 8.87 百万行插入该附加表：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
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

由于我们切换了主键中列的顺序，插入的行现在以不同的字典序顺序存储在磁盘上（与我们 [原始表](#a-table-with-a-primary-key) 相比），因此该表的 1083 个 granules 也包含不同的值：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

这是生成的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

现在可以用来显著加快我们示例查询的执行，该查询过滤 URL 列以计算最频繁点击 URL “http://public_search”的前 10 个用户：
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

现在，ClickHouse 更有效地执行了该查询，而不是 [几乎进行全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)。

在我们 [原始表](#a-table-with-a-primary-key) 的主索引中，UserID 是第一个，URL 是第二个键列，ClickHouse 对索引标记使用了 [通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) 来执行该查询，这并不有效，因为 UserID 和 URL 的基数相似较高。

将 URL 作为主索引中的首列，ClickHouse 现在对索引标记运行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>。
ClickHouse 服务器日志文件中的相关跟踪日志确认：

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
ClickHouse 仅选择了 39 个索引标记，而不是使用通用排除搜索时的 1076 个。

请注意，附加表经过优化，可以加快执行根据 URL 过滤的示例查询。

与我们 [原始表](#a-table-with-a-primary-key) 的查询表现出 [较差的性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 相同，我们的 [根据 UserIDs 过滤的示例查询](#the-primary-index-is-used-for-selecting-granules) 在新附加表中也不会有效执行，因为 UserID 现在是该表主索引中的第二个键列，因此 ClickHouse 将对 granule 选择使用通用排除搜索，这对于 UserID 和 URL 的 [相似高基数](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) 并不有效。
点击详情框以获取具体信息。

<details>
    <summary>
    现在根据 UserIDs 过滤的查询性能较差<a name="query-on-userid-slow"></a>
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

我们现在有两个表。分别优化用于加快针对 `UserIDs` 的查询和加快针对 URLs 的查询：
### 选项 2：物化视图 {#option-2-materialized-views}

在我们现有的表上创建一个 [物化视图](/sql-reference/statements/create/view.md)。
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
- 我们在视图的主键中（与我们 [原始表](#a-table-with-a-primary-key) 相比）切换了键列的顺序
- 物化视图由一个 **隐式创建的表** 支持，其行顺序和主索引基于给定的主键定义
- 隐式创建的表可以通过 `SHOW TABLES` 查询列出，并且其名称以 `.inner` 开头
- 也可以首先显式创建物化视图的支持表，然后视图可以通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 定位该表
- 我们使用 `POPULATE` 关键字以便立即用来自源表 [hits_UserID_URL](#a-table-with-a-primary-key) 的所有 8.87 百万行填充隐式创建的表
- 如果向源表 hits_UserID_URL 插入新行，则也会自动插入到隐式创建的表中
- 实际上，隐式创建的表具有与我们 [显式创建的次级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse 将隐式创建的表（及其主索引）背后的列数据文件（*.bin）、标记文件（*.mrk2）和主索引（primary.idx）存储在 ClickHouse 服务器数据目录的特殊文件夹中：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

隐式创建的表（及其主索引）支持物化视图现在可以用来显著加快执行我们示例查询根据 URL 列过滤：
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

因为有效地隐式创建的表（及其主索引）支持的物化视图与我们 [显式创建的次级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同，因此查询的执行方式与显式创建的表相同。

ClickHouse 服务器日志文件中的相关跟踪日志确认，ClickHouse 正在对索引标记运行二分查找：

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
### 选项 3：投影 {#option-3-projections}

在我们现有的表上创建投影：
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

并对投影进行物化：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- 投影创建一个 **隐藏表**，其行顺序和主索引基于投影的给定 `ORDER BY` 子句
- 隐藏表不会通过 `SHOW TABLES` 查询列出
- 我们使用 `MATERIALIZE` 关键字以便立即用来自源表 [hits_UserID_URL](#a-table-with-a-primary-key) 的所有 8.87 百万行填充隐藏表
- 如果向源表 hits_UserID_URL 插入新行，则也会自动插入到隐藏表中
- 查询总是（在语法上）针对源表 hits_UserID_URL，但如果隐藏表的行顺序和主索引允许更有效的查询执行，则会使用该隐藏表
- 请注意，投影不会使使用 ORDER BY 的查询更有效，即使 ORDER BY 与投影的 ORDER BY 声明匹配（见 https://github.com/ClickHouse/ClickHouse/issues/47333）
- 实际上，隐式创建的隐藏表具有与我们 [显式创建的次级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse 将隐式创建的表（及其主索引）创建投影的列数据文件（*.bin）、标记文件（*.mrk2）和主索引（primary.idx）存储在源表的数据文件、标记文件和主索引文件旁边的特殊文件夹中（如下图所示的橙色标记）：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::


通过投影创建的隐藏表（及其主索引）现在可以（隐式）用于显著加快执行我们示例查询，过滤 URL 列。请注意，查询在语法上是针对投影的源表。
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

因为通过投影创建的隐式表（及其主索引）实际上与我们 [显式创建的次级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同，因此查询的执行方式与显式创建的表相同。

ClickHouse 服务器日志文件中的相关跟踪日志确认，ClickHouse 正在对索引标记运行二分查找：


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

我们带有复合主键（UserID，URL）的 [表](#a-table-with-a-primary-key) 的主索引在加速 [过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 时非常有用。但是，该索引在加速 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 时并没有提供显著的帮助，尽管 URL 列是复合主键的一部分。

反之亦然：
我们带有复合主键（URL，UserID）的 [表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 在加速 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 时表现良好，但在 [过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 中没有提供太多支持。

由于主键列 UserID 和 URL 的基数相似且均很高，过滤第二个键列的查询 [并不太受益于第二个键列在索引中的存在](#generic-exclusion-search-algorithm)。

因此，移除主索引中的第二个键列（从而降低索引的内存消耗）并 [使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) 是合理的。

然而，如果复合主键中的键列在基数上存在较大差异，那么按照基数升序排列主键列对于 [查询是有益的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大，它们在键中排列的顺序越重要。我们将在下一节中演示这一点。

## 高效排序键列 {#ordering-key-columns-efficiently}

<a name="test"></a>

在复合主键中，键列的顺序可以显著影响：
- 查询中过滤二级键列的效率，以及
- 表的数据文件的压缩比。

为了演示这一点，我们将使用我们的 [Web 流量示例数据集](#data-set) 的一个版本，其中每行包含三个列，指示互联网“用户”（`UserID` 列）对 URL (`URL` 列) 的访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用包含上述三个列的复合主键来加速计算典型网络分析查询的速度，这些查询可以计算
- 访问特定 URL 的流量中有多少（百分比）来自机器人，以及
- 我们对特定用户是否是（不是）机器人（该用户的流量中有多少（不是）被假定为机器人流量）的信心。

我们使用此查询来计算我们希望用作复合主键键列的三个列的基数（请注意，我们使用 [URL 表函数](/sql-reference/table-functions/url.md) 来临时查询 TSV 数据，而无需创建本地表）。在 `clickhouse client` 中运行此查询：
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
响应为：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
``` 

我们可以看到，基数之间的差异很大，尤其是在 `URL` 和 `IsRobot` 列之间，因此这些列在复合主键中的顺序对提高过滤这些列的查询效率和实现表的列数据文件的最佳压缩比都至关重要。

为了演示这一点，我们为我们的机器人流量分析数据创建两个表版本：
- 表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，我们按基数降序排列键列
- 表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，我们按基数升序排列键列

创建复合主键 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot`：
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

接下来，创建复合主键 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL`：
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
并用我们用于填充上一个表的相同 887 万行填充它：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
响应为：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### 在二级键列上高效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询至少过滤一个属于复合键的列，并且是第一个键列时，[ClickHouse 会在键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

当查询仅过滤一个属于复合键的列，但不是第一个键列时，[ClickHouse 使用通用排除搜索算法来处理键列的索引标记](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)。

在第二种情况下，复合主键中键列的顺序对于 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的有效性至关重要。

这是一个在我们按基数降序排列键列 `(URL, UserID, IsRobot)` 的表上过滤 `UserID` 列的查询：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
响应为：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

这是在我们按基数升序排列键列 `(IsRobot, UserID, URL)` 的表上执行的相同查询：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
响应为：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

我们可以看到，在按基数升序排列键列的表上，查询执行的效率和速度明显更高。

原因在于 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 在通过前驱键列具有低基数的二级键列选择 [分区片段](#the-primary-index-is-used-for-selecting-granules) 时效果最佳。我们在本指南的 [上一节](#generic-exclusion-search-algorithm) 中详细说明了这一点。

### 数据文件的最佳压缩比 {#optimal-compression-ratio-of-data-files}

此查询比较了我们上面创建的两个表中 `UserID` 列的压缩比：

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
响应为：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

我们可以看到，在按基数升序排列键列的表中，`UserID` 列的压缩比显著更高。

尽管在两个表中存储的数据完全相同（我们在两个表中插入了 887 万行），但复合主键中键列的顺序对表的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) 所需的压缩数据的磁盘空间有显著影响：
- 在带有复合主键 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot` 中，我们按基数降序排列键列，`UserID.bin` 数据文件占用 **11.24 MiB** 磁盘空间
- 在带有复合主键 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL` 中，我们按基数升序排列键列，`UserID.bin` 数据文件仅占用 **877.47 KiB** 磁盘空间

为了提高表列在磁盘上的数据压缩比，不仅能节省磁盘空间，还能使读取该列的数据的查询（尤其是分析查询）更快，因为从磁盘到主内存（操作系统的文件缓存）移动列数据所需的 I/O 更少。

接下来我们说明为什么按基数升序排列主键列对表的列的压缩比是有益的。

下图展示了主键中按基数升序排列的行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

我们讨论过 [表的行数据在磁盘上以主键列的顺序存储](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上面的图中，表的行（它们在磁盘上的列值）首先按其 `cl` 值排序，对于具有相同 `cl` 值的行按其 `ch` 值排序。由于第一个键列 `cl` 的基数较低，可能会有具有相同 `cl` 值的行。因此，`ch` 值通常也是有序的（在本地 - 对于具有相同 `cl` 值的行）。

如果在一列中，相似的数据相互靠近，例如通过排序，那么该数据将被更好地压缩。
一般而言，压缩算法受益于数据的运行长度（它看到的数据越多，压缩效果越好）和局部性（数据越相似，压缩比越好）。

与上面的图相对，下面的图展示了主键中按基数降序排列的行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

现在，表的行首先按其 `ch` 值排序，对于具有相同 `ch` 值的行按其 `cl` 值排序。
但由于第一个键列 `ch` 的基数较高，不太可能会有具有相同 `ch` 值的行。因此，这使得 `cl` 值的排序（在本地 - 对于具有相同 `ch` 值的行）也不太可能。

因此，`cl` 值很可能是随机顺序的，因此其局部性和压缩比都较差。

### 摘要 {#summary-1}

对于查询中二级键列的高效过滤和表的列数据文件的压缩比，将主键中的列按基数升序排列是有益的。

## 高效识别单行 {#identifying-single-rows-efficiently}

尽管从一般来说，这不是 [ClickHouse](https://clickhouse.com/docs/knowledgebase/key-value) 的最佳用例，
但有时构建在 ClickHouse 之上的应用需要识别 ClickHouse 表中的单行。

直观的解决方案可能是使用 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，每行有一个唯一值，并将该列用作主键列以快速检索行。

为了实现最快的检索，UUID 列 [需要是第一个键列](#the-primary-index-is-used-for-selecting-granules)。

我们讨论过，由于 [ClickHouse 表的行数据在磁盘上按主键列的顺序存储](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中将高基数列（如 UUID 列）放在基数较低的列之前 [不利于其他表列的压缩比](#optimal-compression-ratio-of-data-files)。

在最快的检索与最佳数据压缩之间的折衷是使用一个复合主键，其中 UUID 是最后一个键列，放置在用于确保表某些列良好压缩比的基数较低的键列之后。

### 一个具体示例 {#a-concrete-example}

一个具体示例是明文粘贴服务 [https://pastila.nl](https://pastila.nl)，由 Alexey Milovidov 开发并 [博客写过](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

在文本区域发生每次更改时，数据自动保存到 ClickHouse 表的行中（每次更改一行）。

识别和检索（特定版本的）粘贴内容的一种方法是将内容哈希作为包含内容的表行的 UUID。

下图显示
- 内容更改时（例如，由用户在文本区域中键入文本时）行的插入顺序，以及
- 当使用 `PRIMARY KEY (hash)` 时插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

由于 `hash` 列用作主键列
- 可以 [非常快速地](#the-primary-index-is-used-for-selecting-granules) 检索特定行，但
- 表的行（它们的列数据）在磁盘上按（唯一且随机的）哈希值升序存储。因此，内容列的值也随机存储，没有数据局部性，导致 **内容列数据文件的压缩比次优**。

为了显著提高内容列的压缩比，同时仍保持快速检索特定行，pastila.nl 使用两个哈希（和一个复合主键）来识别特定行：
- 如上所述的内容哈希，对于不同的数据是不同的，和
- 一种 [局部敏感哈希（指纹）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，在数据小变更时 **不** 改变。

下图显示
- 内容发生更改时（例如，由用户在文本区域中键入文本时）行的插入顺序，以及
- 当使用复合 `PRIMARY KEY (fingerprint, hash)` 时插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

此时，行在磁盘上首先按 `fingerprint` 排序，对于具有相同指纹值的行，其 `hash` 值决定了最终顺序。

由于数据仅因小变化而不同，因此获得相同指纹值的相似数据现在在内容列中彼此靠近存储。这对内容列的压缩比是非常有利的，因为压缩算法通常受益于数据的局部性（数据越相似，压缩比越好）。

折衷是需要两个字段（`fingerprint` 和 `hash`）来检索特定行，以最佳利用由复合 `PRIMARY KEY (fingerprint, hash)` 产生的主索引。
