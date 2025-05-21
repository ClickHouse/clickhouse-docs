---
'sidebar_label': '主键索引'
'sidebar_position': 1
'description': 'In this guide we are going to do a deep dive into ClickHouse indexing.'
'title': 'A Practical Introduction to 主键 in ClickHouse'
'slug': '/guides/best-practices/sparse-primary-indexes'
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


# ClickHouse 主键索引的实用入门
## 介绍 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引。我们将详细说明和讨论：
- [ClickHouse 的索引与传统关系数据库管理系统的不同之处](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建和使用表的稀疏主键索引](#a-table-with-a-primary-key)
- [ClickHouse 索引的一些最佳实践](#using-multiple-primary-indexes)

您可以选择在自己的计算机上执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门说明，请参见 [快速开始](/quick-start.mdx)。

:::note
本指南专注于 ClickHouse 的稀疏主键索引。

有关 ClickHouse [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参见 [教程](/guides/best-practices/skipping-indexes.md)。
:::
### 数据集 {#data-set}

在本指南中我们将使用一个样本匿名网页流量数据集。

- 我们将使用样本数据集中的 887 万行（事件）子集。
- 未压缩数据大小为 887 万事件，约为 700 MB。存储在 ClickHouse 中时压缩为 200 MB。
- 在我们的子集中，每行包含三个列，分别指示在特定时间（`EventTime` 列）点击 URL（`URL` 列）的互联网用户（`UserID` 列）。

有了这三列，我们已经可以制定一些典型的网站分析查询，如：

- “对于特定用户，最常点击的前 10 个 URL 是什么？”
- “最常点击特定 URL 的前 10 个用户是谁？”
- “用户点击特定 URL 的最热门时间（例如，一周中的天）是什么？”
### 测试机器 {#test-machine}

本文档中给出的所有运行时数字都基于在搭载 Apple M1 Pro 芯片和 16GB RAM 的 MacBook Pro 上本地运行的 ClickHouse 22.2.1。
### 全表扫描 {#a-full-table-scan}

为了查看在没有主键的情况下如何在我们的数据集上执行查询，我们通过执行以下 SQL DDL 语句创建一个表（使用 MergeTree 表引擎）：

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

接下来，将部分点击数据集插入该表，使用以下 SQL 插入语句。
这使用 [URL 表函数](/sql-reference/table-functions/url.md) 从 clickhouse.com 的远程托管完整数据集中加载子集：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
响应是：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse 客户端的结果输出显示，以上语句向表中插入了 887 万行。

最后，为了简化后续讨论并使图表和结果可重现，我们对表进行了 [优化](/sql-reference/statements/optimize.md) 操作，使用 FINAL 关键字：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般来说，在将数据加载到表中后，不需要也不推荐立即优化表。
为什么在这个示例中这是必要的，会变得显而易见。
:::

现在我们执行第一个网站分析查询。以下是计算用户 ID 为 749927693 的互联网用户最常点击的前 10 个 URL：

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
响应是：
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

ClickHouse 客户端的结果输出表明 ClickHouse 执行了全表扫描！我们表中的 887 万行每一行都被流式传入 ClickHouse。这不具有可扩展性。

为了使这个（方式）更高效（和）更快，我们需要使用一个带适当主键的表。这将允许 ClickHouse 自动（基于主键的列）创建一个稀疏主键索引，随后可以用来显著加速我们示例查询的执行。
### 相关内容 {#related-content}
- 博客：[超级提升您的 ClickHouse 查询](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouse 索引设计 {#clickhouse-index-design}
### 针对海量数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系数据库管理系统中，主键索引将包含每个表行的一个条目。这将导致主键索引为我们的数据集包含 887 万个条目。这样的索引允许快速定位特定行，从而在查找查询和点更新中实现高效率。在 `B(+)-树` 数据结构中寻找一个条目的平均时间复杂度为 `O(log n)`；更确切地说，`log_b n = log_2 n / log_2 b` 其中 `b` 是 `B(+)-树` 的分支因子，`n` 是索引行的数量。由于 `b` 通常在几百到几千之间，因此 `B(+)-树` 是非常浅的结构，定位记录几乎不需要磁盘寻址。对于 887 万行数据，分支因子为 1000，平均需要 2.3 次磁盘寻址。这种能力是有代价的：额外的磁盘和内存开销、更高的插入成本（在将新行添加到表和索引条目时），以及有时需要对 B-树进行重新平衡。

考虑到与 B-树索引相关的挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse 的 [MergeTree 引擎系列](/engines/table-engines/mergetree-family/index.md) 已经过优化以处理海量数据。为了接收每秒数百万行的插入并存储非常大的（数百 PB）数据量，这些表被设计出来。数据以 [部分为单位](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 快速写入表，后台则应用合并部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分合并时，合并部分的主索引也将合并。在 ClickHouse 所设计的非常大规模中，必须非常高效地使用磁盘和内存。因此，主索引为部分提供每组行（称为“粒”）一个索引条目（称为“标记”）——这种技术称为 **稀疏索引**。

稀疏索引是可能的，因为 ClickHouse 将部分的行按主键列的顺序存储在磁盘上。稀疏主索引允许快速（通过对索引条目的二分搜索）识别可能与查询匹配的行组，而不是直接查找单个行。定位到的潜在匹配行的组（粒）随后将在 ClickHouse 引擎中并行流入以查找匹配项。这种索引设计允许主索引变小（它可以而且必须完全适合主内存），同时仍显著加速查询执行时间：尤其是对于数据分析用例中典型的范围查询。

以下详细说明了 ClickHouse 如何构建和使用其稀疏主索引。稍后，本文将讨论选择、删除和排序用于构建索引的表列（主键列）的一些最佳实践。
### 带主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键（主键列为 UserID 和 URL）的表：

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
    DDL 语句详细情况
    </summary>
    <p>

为了简化后续讨论，并确保图表和结果可重现，DDL 语句：
<ul>
  <li>
    通过 <code>ORDER BY</code> 子句为表指定一个复合排序键。
  </li>
  <li>
    通过设置明确控制主索引将拥有多少个索引条目：
    <ul>
      <li>
        <code>index_granularity</code>: 明确设置为其默认值 8192。这意味着对于每 8192 行组，主索引将有一个索引条目。例如，如果表包含 16384 行，则索引将有两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>: 设置为 0 以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着 ClickHouse 在以下其中之一为真时，会自动为一组 n 行创建一个索引条目：
        <ul>
          <li>
            如果 <code>n</code> 小于 8192，并且该 <code>n</code> 行的组合行数据大小大于或等于 10 MB（<code>index_granularity_bytes</code> 的默认值）。
          </li>
          <li>
            如果 <code>n</code> 行的组合数据大小小于 10 MB，但 <code>n</code> 是 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 设置为 0 以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引压缩</a>。这将允许我们在以后选看其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

DDL 语句中的主键将基于两个指定的关键列创建主索引。

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
然后优化表：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
我们可以使用以下查询来获取有关我们表的元数据：

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

ClickHouse 客户端的输出显示：

- 表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)存储在磁盘的特定目录中，这意味着该目录内每个表列都将有一个数据文件（和一个标记文件）。
- 表具有 887 万行。
- 所有行的未压缩数据大小总计为 733.28 MB。
- 所有行的压缩大小为 206.94 MB。
- 表的主索引有 1083 个条目（称为“标记”），索引的大小为 96.93 KB。
- 总体而言，表的数据和标记文件及主索引文件的总大小为 207.07 MB。
### 数据按主键列的顺序存储在磁盘上 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们上述创建的表具有
- 复合 [主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 和
- 复合 [排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- 如果我们只指定了排序键，则主键将隐式定义为等于排序键。

- 为了提高内存效率，我们明确指定的主键仅包含我们的查询过滤的列。基于主键的主索引会完全加载到主内存中。

- 为了保持指南的图表一致性并最大化压缩比，我们定义了一个单独的排序键，该排序键包含我们表的所有列（如果在同一列中类似的数据相互靠近，例如通过排序，则该数据将获得更好的压缩效果）。

- 如果同时指定主键和排序键，则主键需为排序键的前缀。
:::

插入的行在磁盘上按主键列（以及排序键的附加 `EventTime` 列）的字典顺序（升序）存储。

:::note
ClickHouse 允许插入多行具有相同主键列值。在这种情况下（请参见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此 `EventTime` 列的值也会影响顺序。
:::

ClickHouse 是一个 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列式数据库管理系统</a>。下图显示了
- 在磁盘上的表示，每个表列都只有一个数据文件（*.bin），其中存储了该列的所有值，采用 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 格式存储，且
- 887 万行数据在磁盘上按主键列（以及附加排序键列）以字典式升序存储，也就是说在这个例子中
  - 首先按 `UserID`,
  - 其次按 `URL`,
  - 最后按 `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是存储 `UserID`、`URL` 和 `EventTime` 列值的磁盘数据文件。

:::note
- 由于主键定义了行在磁盘上的字典顺序，因此一个表只能有一个主键。

- 我们将行编号从 0 开始，以对齐 ClickHouse 内部的行编号方案，该方案也用于日志记录消息。
:::
### 数据组织成粒以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

为了处理数据，表的列值被逻辑上划分为粒。
粒是被流式传入 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着，ClickHouse 总是读取一整组（粒）行，而不是单独读取个别行（以流式方式并行处理）。
:::note
列值并不是物理上存储在粒中：粒仅是用于查询处理的列值的逻辑组织方式。
:::

下图显示了我们表的 887 万行的（列值）是如何组织成 1083 粒的，这是由于表的 DDL 语句包含的设置 `index_granularity`（设置为其默认值 8192）所致。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

基于物理磁盘顺序的前 8192 行（其列值）逻辑上属于粒 0，然后接下来的 8192 行（其列值）属于粒 1，以此类推。

:::note
- 最后一粒（粒 1082）“包含”的行少于 8192。

- 我们在本指南开始时提到“DDL 语句详细情况”，我们禁用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（为了简化本指南中的讨论，以及使图表和结果可重现）。

  因此我们示例表中的所有粒（除了最后一个）大小相同。

- 对于自适应索引粒度的表（索引粒度默认是 [自适应的](/operations/settings/merge-tree-settings#index_granularity_bytes)），某些粒的大小可能少于 8192 行，具体取决于行数据的大小。

- 我们将某些主键列 (`UserID`、`URL`) 的列值标记为橙色。
  这些标记为橙色的列值是每粒的每个第一行的主键列值。
  正如我们将在后面看到的，这些标记为橙色的列值将成为表主索引的条目。

- 我们将粒的编号从 0 开始，以对齐 ClickHouse 内部的编号方案，该方案也用于日志记录消息。
:::
### 主索引每粒有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上图所示的粒创建的。这个索引是一个未压缩的平面数组文件（primary.idx），其中包含从 0 开始的所谓数字索引标记。

下图显示了索引存储每个粒的第一行的主键列值（上图中标记为橙色的值）。
换句话说：主索引存储表中每第 8192 行的主键列值（基于主键列定义的物理行顺序）。
例如
- 第一个索引条目（下图中的“标记 0”）存储上图中粒 0 的第一行的关键列值，
- 第二个索引条目（下图中的“标记 1”）存储上图中粒 1 的第一行的关键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

总的来说，对于我们具有 887 万行和 1083 粒的表，索引共含有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- 对于具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主索引中还会存储按表中最后一行的主键列值的一个“最终”条目，但由于我们禁用了自适应索引粒度（为了简化本指南中的讨论，以及使图表和结果可重现），因此我们示例表的索引不包含此最终标记。

- 主索引文件完全加载到主内存中。如果文件超过可用的空闲内存空间，则 ClickHouse 将引发错误。
:::

<details>
    <summary>
    检查主索引内容
    </summary>
    <p>

在自管理的 ClickHouse 集群中，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 检查我们示例表的主索引内容。

为此，我们首先需要将主索引文件复制到正在运行的集群的某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>步骤 1：获取包含主索引文件的部分路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

返回的结果为 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`，在测试机器上。

<li>步骤 2：获取 user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Linux 上的默认 user_files_path</a> 是 
`/var/lib/clickhouse/user_files/`

您可以在 Linux 上检查是否已经更改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上的路径为 `/Users/tomschreiber/Clickhouse/user_files/`


<li>步骤 3：将主索引文件复制到 user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
现在我们可以通过 SQL 检查主索引的内容：
<ul>
<li>获取条目总数</li>
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
这与我们示例表的主索引内容的图表完全匹配：
</p>
</details>

主键条目被称为索引标记，因为每个索引条目标记特定数据范围的起始位置。对于示例表：
- `UserID` 的索引标记：

  存储在主索引中的 `UserID` 值按升序排列。<br/>
  因此，上图中的“标记 1”表示粒 1 中和所有后续粒中的所有表行的 `UserID` 值都保证大于或等于 4,073,710。

 [正如我们将后面看到的](#the-primary-index-is-used-for-selecting-granules)，这种全局顺序使 ClickHouse 能够在查询基于主键的第一个列过滤时，对索引标记使用 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索算法</a>。

- `URL` 的索引标记：

  主键列 `UserID` 和 `URL` 的基数相当相似，这意味着，通常情况下，主键中所有第二列及之后的列的索引标记只指示数据范围，只要前驱键列值在当前粒中所有表行中保持不变。<br/>
例如，鉴于上图中标记 0 和标记 1 的 `UserID` 值不同，ClickHouse 不能假设粒 0 中所有表行的 `URL` 值都大于或等于 `'http://showtopics.html%3...'`。然而，如果上图中标记 0 和标记 1 的 `UserID` 值相同（意味着在粒 0 中所有表行的 `UserID` 值保持不变），ClickHouse 可以假设在粒 0 中所有表行的 `URL` 值都大于或等于 `'http://showtopics.html%3...'`。

  我们将稍后更详细地讨论这对查询执行性能的影响。
### 主索引用于选择分片 {#the-primary-index-is-used-for-selecting-granules}

我们现在可以在主索引的支持下执行我们的查询。

以下查询计算 UserID 为 749927693 的前 10 个点击量最多的 URL。

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

10 行结果集。耗时: 0.005 秒。

# highlight-next-line
处理了 8.19 千行，
740.18 KB (1.53 百万行/秒，138.59 MB/秒。)
```

现在 ClickHouse 客户端输出显示，与进行全表扫描不同，只有 8.19 千行被流入 ClickHouse。

如果启用了 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">跟踪日志记录</a>，那么 ClickHouse 服务器日志文件显示，ClickHouse 在 1083 个 UserID 索引标记上运行了一个 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以识别可能包含 UserID 列值为 `749927693` 的行的分片。这需要 19 步，平均时间复杂度为 `O(log2 n)`：
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

我们可以在上述跟踪日志中看到，1083 个现有标记中，有一个标记满足了查询条件。

<details>
    <summary>
    跟踪日志详细信息
    </summary>
    <p>

标记 176 被识别（'找到左边界标记' 包含在内，'找到右边界标记' 不包含在内），因此从标记 176 的所有 8192 行被流入 ClickHouse，以便找到 UserID 列值为 `749927693` 的实际行。
</p>
</details>

我们还可以通过在例子查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来重现这一点：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

响应如下所示：

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

16 行结果集。耗时: 0.003 秒。
```
客户端输出显示，从 1083 个分片中选择了一个可能包含 UserID 列值为 749927693 的分片。

:::note 结论
当查询在复合键的一部分上进行过滤，并且是第一个键列时，ClickHouse 会在键列的索引标记上运行二分查找算法。
:::

<br/>

如上所述，ClickHouse 使用其稀疏主索引来快速（通过二分查找）选择可能包含与查询相匹配的行的分片。

这是 ClickHouse 查询执行的 **第一阶段（分片选择）**。

在 **第二阶段（数据读取）** 中，ClickHouse 定位所选分片，以便将它们的所有行流入 ClickHouse 引擎，从而找到实际上与查询匹配的行。

我们将在接下来的部分中详细讨论第二阶段。
### 标记文件用于定位分片 {#mark-files-are-used-for-locating-granules}

以下图表说明了我们表的一个主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

如上所述，通过对 1083 个 UserID 标记进行二分查找，标记 176 被识别。因此其相应的分片 176 可能包含 UserID 列值为 749.927.693 的行。

<details>
    <summary>
    分片选择详细信息
    </summary>
    <p>

上图显示标记 176 是第一个索引条目，其中相关分片 176 的最小 UserID 值小于 749.927.693，并且下一个标记（标记 177）的分片的最小 UserID 值大于该值。因此，只有与标记 176 对应的分片 176 可能包含 UserID 列值为 749.927.693 的行。
</p>
</details>

为了确认（或不确认）分片 176 中是否包含 UserID 列值为 749.927.693 的行，需要将属于该分片的所有 8192 行流入 ClickHouse。

为了实现这一点，ClickHouse 需要知道分片 176 的物理位置。

在 ClickHouse 中，表的所有分片的物理位置存储在标记文件中。类似于数据文件，每个表列都有一个标记文件。

以下图显示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`，它们存储表的 `UserID`、`URL` 和 `EventTime` 列的分片物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

我们已经讨论了主索引是一个平坦的未压缩数组文件（primary.idx），包含从 0 开始编号的索引标记。

同样，标记文件也是一个平坦的未压缩数组文件（*.mrk），包含从 0 开始编号的标记。

一旦 ClickHouse 确定并选择了可能包含与查询匹配行的分片的索引标记，就可以在标记文件中执行位置数组查找，以获取分片的物理位置。

每个特定列的标记文件条目存储两个位置，形式为偏移量：

- 第一个偏移量（上图中的 'block_offset'）定位在 <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块</a> 中，该块位于 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 列数据文件中，包含所选分片的压缩版本。这个压缩块可能包含几个压缩的分片。定位的压缩文件块在读取时被解压缩到主内存中。

- 第二个偏移量（上图中的 'granule_offset'）来自标记文件，提供了在未压缩块数据内找到分片的位置。

然后，属于所在的未压缩分片的所有 8192 行被流入 ClickHouse 进行进一步处理。

:::note

- 对于具有 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 且不具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，ClickHouse 使用如上所示的 `.mrk` 标记文件，包含每个条目两个 8 字节长地址。这些条目是物理位置，所有大小相同的分片。

索引粒度是 [默认](/operations/settings/merge-tree-settings#index_granularity_bytes) 适应的，但在我们的示例表中，我们禁用了自适应索引粒度（为了简化本指南中的讨论，以及使图表和结果可重复）。我们的表使用宽格式，因为数据的大小超过 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)(其默认为自管理集群的 10 MB)。

- 对于具有宽格式并具有自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，这些文件包含与 `.mrk` 标记文件类似的条目，但每个条目多一个第三个值：当前条目所关联的分片的行数。

- 对于具有 [紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 的表，ClickHouse 使用 `.mrk3` 标记文件。

:::


:::note 为什么使用标记文件

主要索引为何不直接包含与索引标记对应的分片的物理位置？

因为在 ClickHouse 设计的大规模数据情况下，重要的是保持磁盘和内存的高效。

主索引文件需要适配主内存。

对于我们的示例查询，ClickHouse 使用主索引并选择一个可能包含与查询匹配行的分片。只有对于该一个分片，ClickHouse 才需要物理位置以流入相应的行进行进一步处理。

此外，这些偏移信息仅对 UserID 和 URL 列是必要的。

对于不在查询中使用的列，例如 `EventTime`，不需要偏移信息。

对于我们的示例查询而言，ClickHouse 仅需要 UserID 数据文件 (UserID.bin) 中分片 176 的两个物理位置偏移量以及 URL 数据文件 (URL.bin) 中分片 176 的两个物理位置偏移量。

标记文件提供的间接性避免直接在主索引中存储所有 1083 个分片的物理位置条目，从而避免在主内存中存储不必要（可能未使用）数据。
:::

以下图表和文本说明了在我们的示例查询中 ClickHouse 如何定位 UserID.bin 数据文件中的分片 176。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们在本指南早些时候讨论了ClickHouse选择了主索引标记 176，因此分片 176 可能包含与我们查询匹配的行。

ClickHouse 现在使用索引中选定的标记号 (176) 在 UserID.mrk 标记文件中进行位置数组查找，以获得两个偏移量以定位分片 176。

如所示，第一个偏移量在 UserID.bin 数据文件中定位压缩文件块，该块包含分片 176 的压缩版本。

一旦定位的文件块被解压缩到主内存，标记文件中的第二个偏移量可以用来在未压缩数据中定位分片 176。

ClickHouse 需要从 UserID.bin 数据文件和 URL.bin 数据文件中定位（并传输所有值）分片 176，以执行我们的示例查询（获取用户 ID 为 749.927.693 的互联网用户点击量最多的前 10 个 URL）。

上图展示了 ClickHouse 如何定位 UserID.bin 数据文件中的分片。

同时，ClickHouse 也在 URL.bin 数据文件中对分片 176 进行相同的操作。两个相应的分片被对齐并流入 ClickHouse 引擎以进行进一步处理，即对所有行的 URL 值进行聚合和计数，其中 UserID 为 749.927.693，最后按降序输出 10 个 URL 分组中计数最多的。

## 使用多个主索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 次级键列可能（不）高效 {#secondary-key-columns-can-not-be-inefficient}


当查询在复合键的第一列上进行过滤时，[ClickHouse 会在键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但当查询在复合键的一部分上进行过滤，但不在第一键列上，情况会怎样呢？

:::note
我们讨论一个在第二键列上进行过滤，而明确不在第一键列上的场景。

当查询在第一键列和任何后续键列上同时进行过滤时，ClickHouse 会在第一键列的索引标记上运行二分查找。
:::

<br/>
<br/>

<a name="query-on-url"></a>
我们使用一个计算点击“http://public_search”的前 10 个用户的查询：

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

10 行结果集。耗时: 0.086 秒。

# highlight-next-line
处理了 8.81 百万行，
799.69 MB (102.11 百万行/秒，9.27 GB/秒。)
```

客户端输出表明，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse 的几乎执行了全表扫描。ClickHouse 从 8.87 百万行的表中读取了 8.81 百万行。

如果启用了 [trace_logging](/operations/server-configuration-parameters/settings#logger)，那么 ClickHouse 服务器日志文件显示，ClickHouse 在 1083 个 URL 索引标记上使用了一个 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a> 来识别那些可能包含 URL 列值为 "http://public_search" 的行的分片：
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
我们可以在上述示例跟踪日志中看到，1076 个标记中，有 1076 个以可能包含与匹配 URL 值的行被选择。

结果是约 8.81 百万行被流入 ClickHouse 引擎（并行使用 10 个流）以识别实际上包含 URL 值 "http://public_search" 的行。

然而，正如我们稍后所见，实际只有 39 个分片确实包含匹配的行。

尽管基于复合主键（UserID，URL）的主索引在加速过滤特定 UserID 值的行时非常有用，但该索引在加速过滤特定 URL 值的查询时并未提供显著帮助。

原因是 URL 列不是第一键列，因此 ClickHouse 在 URL 列的索引标记上使用了通用排除搜索算法（而不是二分查找），而 **该算法的有效性取决于 URL 列和其前驱键列 UserID 之间的基数差异**。

为了说明这一点，我们给出一些关于通用排除搜索工作原理的详细信息。

<a name="generic-exclusion-search-algorithm"></a>
### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下说明了 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse 通用排除搜索算法</a> 是如何在通过次级列选择分片时工作，前驱键列具有低（或高）基数的情况下。

作为两个案例的示例，我们假设：
- 一个搜索行的查询，URL 值 = "W3"。
- 我们 hits 表的抽象版本，使用简化的 UserID 和 URL 值。
- 相同的复合主键（UserID，URL）用于索引。这意味着行首先按 UserID 值排序。具有相同 UserID 值的行，然后按 URL 排序。
- 分片大小为两个，即每个分片包含两行。

我们在下面的图表中标记了每个分片的第一行的键列值。

**前驱键列具有低（或更低）基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 的基数较低。在这种情况下，可能同一个 UserID 值分散在多个表行和分片以及多个索引标记中。对于具有相同 UserID 的索引标记，索引标记的 URL 值按升序排序（因为表行首先按 UserID 排序，然后按 URL 排序）。这使得按照以下方式进行有效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

针对我们示例数据的分片选择过程有三种不同场景，如上图所示：

1. 索引标记 0，**其 URL 值小于 W3，并且直接后继索引标记的 URL 值也小于 W3** 可以被排除，因为标记 0 和 1 具有相同的 UserID 值。注意，这一排除前提确保了分片 0 完全由 U1 的 UserID 值组成，以便 ClickHouse 可以假定分片 0 中的最大 URL 值也小于 W3，从而排除该分片。

2. 索引标记 1，**其 URL 值小于（或等于）W3，并且直接后继索引标记的 URL 值大于（或等于）W3** 被选择，因为这意味着分片 1 可能包含 URL W3 的行。

3. 索引标记 2 和 3，**其 URL 值大于 W3** 可以被排除，因为主索引的索引标记存储每个分片第一行的键列值，因此分片 2 和 3 不可能包含 URL 值 W3。

**前驱键列具有高（或更高）基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 的基数较高时，可能相同的 UserID 值不会分散在多个表行和分片中。这意味着索引标记的 URL 值并不是单调递增的：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

如上图所示，所有 URL 值小于 W3 的标记都被选择以流入其关联分片的行，进入 ClickHouse 引擎。

这是因为尽管图中所有索引标记都符合上面描述的场景 1，但它们并不满足强调的排除前提，即 *直接后继索引标记具有与当前标记相同的 UserID 值*，因此不能被排除。

例如，考虑索引标记 0，**其 URL 值小于 W3，并且直接后继索引标记的 URL 值也小于 W3**。这*不能*排除，因为直接后继标记 1 不具有与当前标记 0 相同的 UserID 值。

这最终阻止了 ClickHouse 做出关于分片 0 中最大 URL 值的假设。相反，它必须假定分片 0 可能包含 URL 值为 W3 的行，并被迫选择标记 0。

标记 1、2 和 3 也符合同样情况。

:::note 结论
当在复合键的一部分上进行过滤，但不是第一键列时，ClickHouse 使用的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a> 相比于 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索算法</a> 在有效性方面要依赖于前驱键列的基数较低的情况。
:::

在我们的示例数据集中，两个键列（UserID，URL）具有相似的高基数。如上所述，当 URL 列的前驱键列具有高（或相似）基数时，通用排除搜索算法的有效性不高。

### 有关数据跳过索引的说明 {#note-about-data-skipping-index}


由于 UserID 和 URL 的基数相似较高，因此我们的 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 也不会从创建一个位于复合主键 (UserID, URL) 的 URL 列的 [次级数据跳过索引](./skipping-indexes.md) 中获益。

例如，这两个语句在我们的表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) 数据跳过索引：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse 现在创建了一个附加的索引，按 4 个连续 [分片](#data-is-organized-into-granules-for-parallel-data-processing) （请注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句），存储最小和最大的 URL 值：

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

第一个索引条目（上图中的 'mark 0'）存储与我们表的前 4 个分片的 [行](#data-is-organized-into-granules-for-parallel-data-processing) 相关的最小和最大 URL 值。

第二个索引条目（'mark 1'）存储与表的接下来的 4 个分片相关的最小和最大 URL 值，依此类推。

（ClickHouse 还创建了一个特殊的 [标记文件](#mark-files-are-used-for-locating-granules) 以供数据跳过索引 [定位](#mark-files-are-used-for-locating-granules) 相关的分片组。）

由于 UserID 和 URL 的基数相似较高，这个次级数据跳过索引无法帮助排除在执行 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 时不被选择的分片。

查询查找的特定 URL 值（即 'http://public_search'）很可能在索引为每组分片存储的最小和最大值之间，导致 ClickHouse 被迫选择该组分片（因为它们可能包含与查询匹配的行）。
### 需要使用多个主索引 {#a-need-to-use-multiple-primary-indexes}


因此，如果我们希望显著加速过滤特定 URL 行的示例查询，就需要使用优化该查询的主索引。

此外，如果我们希望保持过滤特定 UserID 行的示例查询的良好性能，就需要使用多个主索引。

以下是实现该目标的方法。

<a name="multiple-primary-indexes"></a>
### 创建额外主索引的选项 {#options-for-creating-additional-primary-indexes}


如果我们希望同时显著加速对特定 UserID 行和特定 URL 行的过滤查询，就需要通过使用以下三种选项中的一种来使用多个主索引：

- 创建一个 **有不同主键的第二张表**。
- 在现有表上创建一个 **物化视图**。
- 向现有表添加一个 **投影**。

这三种选项都将有效地将我们的示例数据复制到额外的表中，以重新组织表的主索引和行排序顺序。

但是，这三种选项在用户查询和插入语句的路由方面的透明性有所不同。

当创建一个 **有不同主键的第二张表** 时，查询必须明确发送到适合该查询的表版本，而新数据必须明确插入到两个表中以保持表的同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用 **物化视图** 时，将隐式创建额外的表，数据在两个表之间自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而 **投影** 是最透明的选项，因为除了自动保持隐式创建的（和隐藏的）额外表与数据变化的同步外，ClickHouse 还将自动选择最有效的表版本用于查询：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

接下来，我们将更详细地讨论这三种创建和使用多个主索引的选项，并给出真实示例。
### Option 1: Secondary Tables {#option-1-secondary-tables}

<a name="secondary-table"></a>
我们正在创建一个新的附加表，其中我们将主键中的关键列（与原始表相比）顺序进行了调整：

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

将我们[原始表](#a-table-with-a-primary-key)中的所有 8.87 百万行插入到附加表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

响应如下所示：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后优化表：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们在主键中切换了列的顺序，插入的行现在以不同的字典顺序存储在磁盘上（与我们的[原始表](#a-table-with-a-primary-key)相比），因此该表的 1083 个粒度包含的值也与之前不同：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

这是结果主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

这现在可以用来显著加速我们的示例查询，该查询过滤 URL 列以计算点击 URL “http://public_search” 最频繁的前 10 个用户：
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

现在，点击 House 执行此查询的效率远高于 [几乎进行全面表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)。

在 [原始表](#a-table-with-a-primary-key) 中，UserID 是第一个，URL 是第二个关键列，ClickHouse 在执行该查询时使用 [通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) 针对索引标记，而这并不是很有效，因为 UserID 和 URL 的基数相似且都很高。

现在，以 URL 作为主索引中的第一列，ClickHouse 正在对索引标记运行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索</a>。
ClickHouse 服务器日志文件中的相应跟踪日志确认了这一点：
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
ClickHouse 仅选择了 39 个索引标记，而在使用通用排除搜索时是 1076。

请注意，附加表经过优化，旨在加速过滤 URL 的查询。

与使用我们[原始表](#a-table-with-a-primary-key) 的查询的[糟糕性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 相似，我们[示例查询过滤 `UserIDs`](#the-primary-index-is-used-for-selecting-granules) 在新的附加表中运行效果也不会很好，因为 UserID 现在是该表主索引中的第二个关键列，因此 ClickHouse 将使用通用排除搜索来选择粒度，这在 UserID 和 URL 同样具有高基数的情况下是[不太有效的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
打开详细信息框以获取具体信息。

<details>
    <summary>
    针对 UserIDs 的查询当前性能不佳<a name="query-on-userid-slow"></a>
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


现在我们有两个表。一个是优化用于加速过滤 `UserIDs` 的查询，另一个是加速过滤 URL 的查询：
### Option 2: Materialized Views {#option-2-materialized-views}

在我们的现有表上创建一个 [物化视图](/sql-reference/statements/create/view.md)。
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

响应如下所示：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 我们在视图的主键中切换了关键列的顺序（与我们的[原始表](#a-table-with-a-primary-key)相比）
- 物化视图背后有一个 **隐式创建的表**，其行顺序和主索引基于给定的主键定义
- 隐式创建的表可以通过 `SHOW TABLES` 查询列出，并且名称以 `.inner` 开头
- 也可以先显式创建物化视图的后端表，然后该视图可以通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 目标该表
- 我们使用 `POPULATE` 关键字以便立即用源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的所有 8.87 百万行填充隐式创建的表
- 如果新的行插入到源表 hits_UserID_URL 中，那么这些行也会自动插入到隐式创建的表中
- 实际上，隐式创建的表具有与[我们显式创建的附加表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse 将隐式创建的表的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[标记文件](#mark-files-are-used-for-locating-granules) (*.mrk2) 和 [主索引](#the-primary-index-has-one-entry-per-granule) (primary.idx) 存储在 ClickHouse 服务器数据目录中的特殊文件夹中：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

物化视图后面的隐式创建的表（及其主索引）现在可以用来显著加速我们示例查询，该查询过滤 URL 列：
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

因为隐式创建的表（及其主索引）最终与我们显式创建的[附加表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此查询的执行方式与显式创建的数据表是一样的。

ClickHouse 服务器日志文件中的相应跟踪日志确认了 ClickHouse 正在对索引标记运行二分搜索：

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
### Option 3: Projections {#option-3-projections}

在现有表上创建一个投影：
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
- 该投影创建了一个 **隐藏表**，该表的行顺序和主索引基于投影的给定 `ORDER BY` 子句
- 隐藏表不会通过 `SHOW TABLES` 查询列出
- 我们使用 `MATERIALIZE` 关键字以便立即用源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的所有 8.87 百万行填充隐藏表
- 如果新的行插入到源表 hits_UserID_URL 中，那么这些行也会自动插入到隐藏表中
- 查询始终（从语法上）以源表 hits_UserID_URL 为目标，但如果隐藏表的行顺序和主索引允许更有效的查询执行，那么将使用该隐藏表
- 请注意，投影并不会使使用 ORDER BY 的查询更有效，即使 ORDER BY 与投影的 ORDER BY 声明匹配（见 https://github.com/ClickHouse/ClickHouse/issues/47333）
- 实际上，隐式创建的隐藏表与[我们显式创建的附加表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse 将隐式创建的表的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[标记文件](#mark-files-are-used-for-locating-granules) (*.mrk2) 和 [主索引](#the-primary-index-has-one-entry-per-granule) (primary.idx) 存储在源表的数据文件、标记文件和主索引文件旁边的特殊文件夹中：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::


由投影创建的隐藏表（及其主索引）现在可以（隐式）用于显著加速我们示例查询，该查询过滤 URL 列。请注意，查询的语法目标是投影的源表。
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

因为显式创建的隐藏表（及其主索引）与我们显式创建的[附加表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此查询的执行方式与显式创建的表是一样的。

ClickHouse 服务器日志文件中的相应跟踪日志确认了 ClickHouse 正在对索引标记运行二分搜索：

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
### Summary {#summary}

我们[具有复合主键的表（UserID, URL）](#a-table-with-a-primary-key)的主索引对于加速[过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules)非常有用。但这个索引并没有为加速[过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)提供显著帮助，尽管 URL 列是复合主键的一部分。

反之亦然：
我们[具有复合主键的表（URL, UserID）](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)的主索引加速了[过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，但并没有在[过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules)中提供多少支持。

由于主键列 UserID 和 URL 具有相似的高基数，仅使用第二个关键列 [并没有从该索引中获得太多好处](#generic-exclusion-search-algorithm)。

因此，去除主索引中的第二个关键列（从而减少索引内存消耗）以及[使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)是有意义的。

不过，如果复合主键中的关键列具有显著的基数差异，那么按基数升序排列主键列对于[查询](#generic-exclusion-search-algorithm)会更有利。

主键列之间的基数差异越大，关键列的顺序越重要。我们将在下一节中演示这一点。
## 高效排序关键列 {#ordering-key-columns-efficiently}

<a name="test"></a>

在复合主键中，关键列的顺序会显著影响：
- 在查询中对次要关键列过滤的效率，以及
- 表的数据文件的压缩比。

为了证明这一点，我们将使用我们[网页流量示例数据集](#data-set)的一个版本，其中每行包含三列，指示互联网“用户”（`UserID` 列）对 URL（`URL` 列）的访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用包含上述三列的复合主键，以加速典型网页分析查询，这些查询计算
- 特定网址的多少（百分比的）流量来自机器人，或
- 我们有多大的信心某个特定用户是（不是）机器人（该用户的流量中有多少百分比（不）被假定为机器人流量）

我们使用此查询来计算希望作为复合主键的关键列的三列的基数（注意我们使用 [URL 表函数](/sql-reference/table-functions/url.md) 来查询 TSV 数据，而无需创建本地表）。在 `clickhouse client` 中运行此查询：
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

我们可以看到，基数之间存在很大差异，尤其是在 `URL` 和 `IsRobot` 列之间，因此这些列在复合主键中的顺序对查询过滤效率和表列数据文件的最佳压缩比至关重要。

为了证明这一点，我们创建了两个版本的机器人流量分析数据表：
- 表 `hits_URL_UserID_IsRobot` 以复合主键 `(URL, UserID, IsRobot)` 创建，其中按基数降序排列关键列
- 表 `hits_IsRobot_UserID_URL` 以复合主键 `(IsRobot, UserID, URL)` 创建，其中按基数升序排列关键列

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

并填充 8.87 百万行：
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
并用我们用来填充先前表的相同 8.87 百万行填充它：

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
### 对次要关键列的高效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询在至少一个是复合键的一部分的列上进行过滤，并且是第一个关键列时，[ClickHouse 正在对该关键列的索引标记运行二分搜索算法](#the-primary-index-is-used-for-selecting-granules)。

当查询（仅）在是复合键一部分的列上进行过滤，但不是第一个关键列时，[ClickHouse 使用通用排除搜索算法对该关键列的索引标记进行搜索](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中关键列的顺序对于 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的有效性至关重要。

这是在我们以基数降序排列关键列 `(URL, UserID, IsRobot)` 的表中，过滤 `UserID` 列的查询：
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

在我们以基数升序排列关键列 `(IsRobot, UserID, URL)` 的表中，查询相同：
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

我们可以看到，在按基数升序排列关键列的表中，查询执行显著更高效且更快速。

原因在于 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 在通过具有较低基数的前驱关键列选择粒度时最有效。我们在本指南的[前一节](#generic-exclusion-search-algorithm)中详细说明了这一点。
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
我们可以看到，对于按基数升序排列关键列的表，`UserID` 列的压缩比明显更高。

尽管在两个表中存储了完全相同的数据（我们在两个表中都插入了相同的 8.87 百万行），但复合主键中关键列的顺序对表中数据的压缩情况产生了显著影响：
- 在复合主键 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot` 中，`UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
- 在复合主键 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL` 中，`UserID.bin` 数据文件占用仅 **877.47 KiB** 的磁盘空间

对于磁盘上表的列的数据具有良好压缩比不仅节省了磁盘空间，而且还可以加快读取该列数据的查询（特别是分析查询），因为所需从磁盘将该列的数据移到主内存（操作系统文件缓存）所需的I/O更少。

接下来，我们展示为何将主键列按基数以升序方式排序对表的列的压缩比有利。

下图草绘了按升序排列关键列的主键在磁盘上的行顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

我们讨论了[表的行数据在磁盘上的存储顺序是按主键列排序的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表的行（它们的列值在磁盘上）首先按其 `cl` 值排序，具有相同 `cl` 值的行按其 `ch` 值排序。由于第一个关键列 `cl` 的基数较低，因此同样 `cl` 值的行可能性很大。因此 `ch` 值也是有序的（局部-对于具有相同 `cl` 值的行）。

如果在列中，类似的数据放在靠近彼此的地方，例如通过排序，则该数据将更好地压缩。
一般而言，压缩算法受益于数据的连续性（数据越多，压缩效果越好）和局部性（相似数据越多，压缩比越好）。

与上面的图不同，下面的图描绘了按降序排列关键列的主键在磁盘上的行顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

现在表的行首先按其 `ch` 值排序，并且具有相同 `ch` 值的行按其 `cl` 值排序。
但由于第一个关键列 `ch` 的基数较高，因此具有相同 `ch` 值的行的可能性很小。因此，对于具有相同 `ch` 值的行，`cl` 值也是无序的（即局部-用于相同 `ch` 值的行）。

因此，`cl` 值很可能是随机顺序的，因此其局部性和压缩比相应较差。
### Summary {#summary-1}

对于查询中次要关键列的高效过滤和表的列数据文件的压缩比，将主键列按基数升序排列是有利的。
### Related content {#related-content-1}
- 博客: [提升 ClickHouse 查询性能](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## 高效识别单行 {#identifying-single-rows-efficiently}

尽管通常来讲 [这不是](/knowledgebase/key-value) ClickHouse 的最佳用例，
但有时构建在 ClickHouse 之上的应用程序需要识别 ClickHouse 表的单行。

直观的解决方案是使用 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，该列每行有一个唯一值，对于快速检索行使用该列作为主键。

为了实现最快的检索，UUID 列 [需要成为第一个关键列](#the-primary-index-is-used-for-selecting-granules)。

我们讨论过，由于 [ClickHouse 表的行数据在磁盘上按主键列（或列）排序](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中具有非常高基数的列（例如 UUID 列）出现在具有较低基数的列之前 [会对其他表列的压缩比产生不利影响](#optimal-compression-ratio-of-data-files)。

在最快检索和最佳数据压缩之间的折衷是使用一个复合主键，其中 UUID 是最后一个关键列，在较低基数关键列之后，以确保表中某些列的良好压缩比。
### 一个具体的例子 {#a-concrete-example}

一个具体的例子是Alexey Milovidov开发的明文粘贴服务 [https://pastila.nl](https://pastila.nl)，并在[博客中介绍了](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

在每次对文本区域的更改时，数据会自动保存到ClickHouse表行中（每次更改一行）。

识别和检索（特定版本的）粘贴内容的一种方式是使用内容的哈希值作为包含内容的表行的UUID。

下图显示了
- 内容更改时行的插入顺序（例如因为键入文本而产生的按键）以及
- 当使用`PRIMARY KEY (hash)`时插入行的数据在磁盘上的顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

因为`hash`列被用作主键列，
- 特定行可以[非常快速地](#the-primary-index-is-used-for-selecting-granules)检索，但
- 表的行（它们的列数据）在磁盘上按（唯一且随机的）哈希值升序存储。因此，内容列的值也以随机顺序存储，导致**内容列数据文件的压缩比不理想**。

为了显著改善内容列的压缩比，同时仍然实现特定行的快速检索，pastila.nl使用两个哈希（和复合主键）来识别特定行：
- 上述讨论的内容哈希，该哈希对于不同数据是唯一的，以及
- 一个[局部敏感哈希（指纹）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，它**不会**因数据的小变化而改变。

下图显示了
- 内容更改时行的插入顺序（例如因为键入文本而产生的按键）以及
- 当使用复合`PRIMARY KEY (fingerprint, hash)`时插入行的数据在磁盘上的顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

现在，磁盘上的行首先按`fingerprint`排序，对于具有相同指纹值的行，它们的`hash`值决定最终顺序。

由于仅在小变化上有所不同的数据获得相同的指纹值，因此相似的数据现在在磁盘上紧密存储在内容列中。这对内容列的压缩比非常有利，因为压缩算法一般受益于数据局部性（数据越相似，压缩比越好）。

妥协是，检索特定行需要两个字段（`fingerprint`和`hash`），以最佳利用由复合`PRIMARY KEY (fingerprint, hash)`产生的主索引。
