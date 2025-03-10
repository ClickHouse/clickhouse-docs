---
sidebar_label: '主索引'
sidebar_position: 1
description: '在本指南中，我们将深入了解 ClickHouse 索引。'
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

# ClickHouse 主索引的实用介绍
## 引言 {#introduction}

在本指南中，我们将深入了解 ClickHouse 索引。我们将详细说明和讨论：
- [ClickHouse 的索引与传统关系数据库管理系统的不同之处](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建和使用表的稀疏主索引](#a-table-with-a-primary-key)
- [在 ClickHouse 中索引的一些最佳实践](#using-multiple-primary-indexes)

您也可以选择在自己的机器上自行执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门操作，请参见 [快速入门](/quick-start.mdx)。

:::note
本指南专注于 ClickHouse 的稀疏主索引。

有关 ClickHouse [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参见 [教程](/guides/best-practices/skipping-indexes.md)。
:::
### 数据集 {#data-set}

在本指南中，我们将使用一个匿名的网页流量数据集作为示例。

- 我们将使用 8.87 百万行（事件）样本数据集的一个子集。
- 未压缩的数据大小为 8.87 百万事件，约 700 MB。存储在 ClickHouse 中时，压缩后为 200 MB。
- 在我们的子集中，每行包含三个列，表示特定时间 (`EventTime` 列) 点击 URL (`URL` 列) 的互联网用户 (`UserID` 列)。

通过这三列，我们已经可以形成一些典型的网页分析查询，例如：

- "特定用户点击最多的前 10 个 URL 是什么？"
- "点击特定 URL 最频繁的前 10 个用户是谁？"
- "用户点击特定 URL 的最热门时间（例如星期几）是什么时候？"
### 测试机器 {#test-machine}

本文件中给出的所有运行时数字都是基于在搭载 Apple M1 Pro 芯片和 16GB RAM 的 MacBook Pro 上本地运行 ClickHouse 22.2.1 的结果。
### 全表扫描 {#a-full-table-scan}

为了查看在没有主键的情况下如何对我们的数据集执行查询，我们创建一个表（使用 MergeTree 表引擎），执行以下 SQL DDL 语句：

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

接下来，使用以下 SQL 插入语句将部分点击数据集插入到表中。
这使用 [URL 表函数](/sql-reference/table-functions/url.md) 从远程加载完整数据集的一部分，该数据集托管在 clickhouse.com：

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

ClickHouse 客户端的结果输出显示上面的语句将 8.87 百万行插入到表中。

最后，为了简化本指南后面的讨论，并使图表和结果可复现，我们使用 FINAL 关键字对表进行 [优化](/sql-reference/statements/optimize.md)：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常在将数据加载到表中后不需要也不鼓励立即优化表。为什么这在本示例中是必要的将会变得明显。
:::

现在我们执行第一个网页分析查询。以下查询计算了用户 ID 为 749927693 的互联网用户点击最多的前 10 个 URL：

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
// highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse 客户端的结果输出指示 ClickHouse 执行了全表扫描！我们表中的 8.87 百万行的每一行都被流入了 ClickHouse。这无法扩展。

为了更高效（且更快）地执行此操作，我们需要使用具有适当主键的表。这将允许 ClickHouse 根据主键的列自动创建稀疏主索引，从而显著加快我们示例查询的执行速度。
### 相关内容 {#related-content}
- 博客：[加速您的 ClickHouse 查询](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouse 索引设计 {#clickhouse-index-design}
### 针对海量数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系数据库管理系统中，主索引将包含每个表行的一个条目。这将导致主索引对我们的数据集包含 8.87 百万条目。这种索引允许快速定位特定的行，导致查找查询和点更新时的高效率。在 `B(+)-Tree` 数据结构中搜索一个条目的平均时间复杂度为 `O(log n)`；更准确地说，`log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是已索引行的数量。由于 `b` 通常在几百到几千之间，`B(+)-Trees` 是非常浅的结构，定位记录所需的磁盘搜索很少。在 8.87 百万行和分支因子为 1000 的情况下，平均需要 2.3 次磁盘搜索。这个能力是有代价的：额外的磁盘和内存开销，添加新行到表和索引条目时更高的插入成本，以及有时需要重新平衡 B-Tree。

考虑到 B-Tree 索引所带来的挑战，ClickHouse 的表引擎采用了不同的方法。ClickHouse [MergeTree 引擎系列](/engines/table-engines/mergetree-family/index.md)被设计和优化以处理海量数据量。这些表设计用于每秒接收数百万行插入，并存储非常大的（数百 PB）数据量。数据是按部分快速写入表中，应用背景下的合并规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分被合并时，合并部分的主索引也会合并。在 ClickHouse 设计的非常大规模下，磁盘和内存效率非常重要。因此，部分的主索引不是为每一行建立索引，而是每组行（称为“粒度”）有一个索引条目（称为“标记”）——这种技术称为 **稀疏索引**。

稀疏索引之所以可行，是因为 ClickHouse 按照主键列的顺序在磁盘上存储部分的行。稀疏主索引不同于（如 B-Tree 基于索引），它允许快速（通过对索引条目进行二进制搜索）识别可能与查询匹配的行组。定位到的可能匹配行组（粒度）随后会并行地流入 ClickHouse 引擎以查找匹配项。这种索引设计允许主索引小（它可以，并且必须，完全适合主内存），同时仍能显著加快查询执行时间：尤其是对于数据分析用例中典型的范围查询。

接下来详细说明 ClickHouse 如何构建和使用其稀疏主索引。稍后在本文中，我们将讨论一些选择、移除和排列用于构建索引（主键列）表列的最佳实践。
### 具有主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键的表，主键列为 UserID 和 URL:

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
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

为了简化本指南后面的讨论，并且使图表和结果可复现，DDL 语句：

<ul>
  <li>
    通过 <code>ORDER BY</code> 子句为表指定一个复合排序键。
  </li>
  <li>
    通过设置显式控制主索引的索引条目数量：
    <ul>
      <li>
        <code>index_granularity</code>：显式设置为其默认值 8192。这意味着对于每 8192 行的组，主索引将有一个索引条目。例如，如果表中包含 16384 行，索引将有两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>：设置为 0，以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着 ClickHouse 会自动为一定数量的组创建一个索引条目，如果以下任意一项为真：
        <ul>
          <li>
            如果 <code>n</code> 小于 8192 且该 <code>n</code> 行的组合行数据大小大于或等于 10 MB（<code>index_granularity_bytes</code> 的默认值）。
          </li>
          <li>
            如果该 <code>n</code> 行的组合行数据大小小于 10 MB，但 <code>n</code> 是 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>：设置为 0 以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引的压缩</a>。这将允许我们稍后选择性地检查其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

上述 DDL 语句中的主键导致根据两个指定的关键列生成主索引。

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

ClickHouse 客户端的输出显示：

- 表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 存储在磁盘的特定目录中，意味着该目录中每个表列有一个数据文件（和一个标记文件）。
- 表具有 8.87 百万行。
- 所有行的未压缩数据大小总计为 733.28 MB。
- 所有行的压缩尺寸在磁盘上总计为 206.94 MB。
- 表具有 1083 个条目的主索引（称为“标记”），索引大小为 96.93 KB。
- 表的数据、标记文件和主索引文件共占用 207.07 MB 的磁盘空间。
### 数据在磁盘上的存储是按主键列排序的 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们创建的表具有
- 复合 [主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 和
- 复合 [排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- 如果我们只指定了排序键，则主键将被隐式定义为等于排序键。

- 为了节省内存，我们显式指定了仅包含查询过滤列的主键。依赖于主键的主索引完全加载到主内存中。

- 为了确保指南中图表的一致性，以及最大化压缩比，我们定义了一个单独的排序键，包括表中的所有列（如果在相似数据的列中将数据放在一起，例如通过排序，那么该数据将被更好地压缩）。

- 如果两个都被指定，则主键必须是排序键的前缀。
:::

插入的行在磁盘上按照主键列（和排序键的附加 `EventTime` 列）的字典顺序（升序）存储。

:::note
ClickHouse 允许插入具有相同主键列值的多行。在此情况下（见下图中的行 1 和行 2），最终顺序由指定的排序键决定，因此取决于 `EventTime` 列的值。
:::

ClickHouse 是一个 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列式数据库管理系统</a>。如下图所示：
- 在磁盘表示上，每个表列都有一个单独的数据文件（*.bin），其中该列的所有值以 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 格式存储，并且
- 8.87 百万行按主键列（和附加排序键列）的字典升序存储在磁盘上，即在这个例子中
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<img src={sparsePrimaryIndexes01} class="image"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是存储 `UserID`、`URL` 和 `EventTime` 列值的磁盘数据文件。

<br/>
<br/>

:::note
- 由于主键定义了磁盘上行的字典顺序，因此一个表只能有一个主键。

- 我们从 0 开始编号行，以便与 ClickHouse 内部行编号方案对齐，该方案也用于日志消息。
:::
### 数据被组织为颗粒以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，表的列值逻辑上被划分为颗粒。
颗粒是流入 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着 ClickHouse 总是以流的方式（并行）读取整组（颗粒）行，而不是单行读取。 
:::note
列值不在物理上存储在颗粒中：颗粒只是列值的逻辑组织形式，以便于查询处理。
:::

下图显示了我们表的 8.87 百万行（列值）是如何被组织成 1083 个颗粒的，这是由于表的 DDL 语句包含了设置 `index_granularity`（设置为其默认值 8192）。

<img src={sparsePrimaryIndexes02} class="image"/>

基于磁盘的物理顺序，前 8192 行（它们的列值）逻辑上属于颗粒 0，接下来的 8192 行（它们的列值）属于颗粒 1，以此类推。

:::note
- 最后一个颗粒（颗粒 1082）“包含”少于 8192 行。

- 在本指南开头提到，我们禁用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（为了简化本指南中的讨论，并使图表和结果可复现）。

  因此我们示例表的所有颗粒（最后一个颗粒除外）具有相同的大小。

- 对于具有自适应索引粒度的表（索引粒度默认为 [自适应](/operations/settings/merge-tree-settings#index_granularity_bytes)，某些颗粒的大小可能少于 8192 行，具体取决于行数据的大小。

- 我们将主键列（`UserID`、`URL`）的一些列值标记为橙色。
  这些标记为橙色的列值是每个颗粒第一行的主键列值。
  正如我们将在下面看到的，这些橙色标记的列值将成为表主索引中的条目。

- 我们从 0 开始编号颗粒，以便与 ClickHouse 内部编号方案对齐，该方案也用于日志消息。
:::
### 主键索引每个 granule 有一个条目 {#the-primary-index-has-one-entry-per-granule}

主键索引是基于上图所示的 granule 创建的。该索引是一个未压缩的平面数组文件 (primary.idx)，包含从 0 开始的所谓数值索引标记。

下面的图表显示该索引存储每个 granule 的每个第一行的主键列值（上图中以橙色标记的值）。
换句话说：主键索引存储表中每第 8192 行的主键列值（基于由主键列定义的物理行顺序）。
例如
- 第一个索引条目（下图中的“mark 0”）存储图中 granule 0 的第一行的主键列值，
- 第二个索引条目（下图中的“mark 1”）存储图中 granule 1 的第一行的主键列值，依此类推。

<img src={sparsePrimaryIndexes03a} class="image"/>

总的来说，索引对于我们的表（8.87百万行和 1083 个 granules）有 1083 条条目：

<img src={sparsePrimaryIndexes03b} class="image"/>

:::note
- 对于具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主键索引中还存储一个“最终”附加标记，该标记记录最后一行的主键列值，但由于我们禁用了自适应索引粒度（为了简化本指南中的讨论，并使图表和结果可重复），因此我们示例表的索引不包括这一最终标记。

- 主键索引文件完全加载到主存中。如果文件大于可用的空闲内存空间，则 ClickHouse 会引发错误。
:::

<details>
    <summary>
    检查主键索引的内容
    </summary>
    <p>

在自管理的 ClickHouse 集群中，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 来检查我们示例表的主键索引的内容。

首先，我们需要将主键索引文件复制到正在运行的集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>第 1 步：获取包含主键索引文件的 part-path</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>第 2 步：获取 user_files_path</li>
Linux 的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 为
`/var/lib/clickhouse/user_files/`

在 Linux 上，您可以检查它是否已更改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上，路径是 `/Users/tomschreiber/Clickhouse/user_files/`


<li>第 3 步：将主键索引文件复制到 user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

现在我们可以通过 SQL 检查主键索引的内容：
<ul>
<li>获取条目数量</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
返回 `1083`
<br/>
<br/>
<li>获取前两个索引标记</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`
<br/>
<br/>
返回
<br/>
`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`
<br/>
<br/>
<li>获取最后一个索引标记</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
<br/>
<br/>
返回
<br/>
`
4292714039 │ http://sosyal-mansetleri...
`



</ul>

这与我们示例表的主键索引内容的图表完全一致：
<img src={sparsePrimaryIndexes03b} class="image"/>
</p>
</details>

主键条目称为索引标记，因为每个索引条目标记一个特定数据范围的开始。具体来说，对于示例表：
- UserID 索引标记：<br/>
  已存储的 `UserID` 值在主键索引中按升序排序。<br/>
  因此，上图中的“标记 1”表示 granule 1 中以及所有后续 granule 中的所有表行的 `UserID` 值保证大于或等于 4.073.710。

 [稍后我们会看到](#the-primary-index-is-used-for-selecting-granules)，这种全局顺序使得 ClickHouse 能够 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">在查询过滤主键的第一列时，使用一元搜索算法</a>。

- URL 索引标记：<br/>
  主键列 `UserID` 和 `URL` 的基数相似，意味着在一般情况下，所有关键列后续索引标记只指示一个数据范围，只要前驱关键列值在当前 granule 中的所有表行中保持不变。<br/>
例如，由于上图中标记 0 和标记 1 的 UserID 值不同，ClickHouse 无法假设 granule 0 中的所有表行的所有 URL 值均大于或等于 `'http://showtopics.html%3...'`。但是，如果上图中标记 0 和标记 1 的 UserID 值相同（意味着 UserID 值在 granule 0 的所有表行中保持不变），ClickHouse 可以假设 granule 0 中所有表行的所有 URL 值均大于或等于 `'http://showtopics.html%3...'`。

我们稍后会更详细地讨论这一点对查询执行性能的影响。

### 主键索引用于选择 granules {#the-primary-index-is-used-for-selecting-granules}

现在我们可以通过主键索引执行我们的查询。

以下计算用户 ID 为 749927693 的前 10 个点击次数最多的 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
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

10 rows in set. Elapsed: 0.005 sec.
// highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouse 客户端的输出现在显示，与进行完整表扫描相比，只有 8.19 千行被流式传输到 ClickHouse。

如果启用了 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">跟踪日志</a>，则 ClickHouse 服务器日志文件显示 ClickHouse 正在对 1083 个 UserID 索引标记执行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二进制搜索</a>，以识别可能包含 UserID 列值为 `749927693` 的行的 granules。这需要 19 个步骤，平均时间复杂度为 `O(log2 n)`：
```response
...Executor): Key condition: (column 0 in [749927693, 749927693])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 176
...Executor): Found (RIGHT) boundary mark: 177
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              1/1083 marks by primary key, 1 marks to read from 1 ranges
...Reading ...approx. 8192 rows starting from 1441792
```

我们可以在上面的跟踪日志中看到，满足查询条件的一条标记是从 1083 个现有标记中确定的。

<details>
    <summary>
    跟踪日志详情
    </summary>
    <p>

标记 176 被识别（'找到左边界标记' 是包括的，'找到右边界标记' 是不包括的），因此 granule 176 中的所有 8192 行（从行 1.441.792 开始 - 我们将在本指南稍后看到）被流式传输到 ClickHouse 以查找实际具有 UserID 列值为 `749927693` 的行。
</p>
</details>

我们还可以使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 在我们的示例查询中重现这一点：
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
// highlight-next-line
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 rows in set. Elapsed: 0.003 sec.
```
客户端输出显示，有一个 granule 从 1083 个 granules 中被选中，可能包含 UserID 列值为 749927693 的行。

:::note 结论
当查询过滤一个是复合键一部分且是第一个关键列的列时，ClickHouse 对关键列的索引标记执行二进制搜索算法。
:::

<br/>

如上所述，ClickHouse 使用稀疏主键索引快速（通过二进制搜索）选择可能包含与查询匹配的行的 granules。

这是 ClickHouse 查询执行的 **第一阶段（granule 选择）**。

在 **第二阶段（数据读取）**，ClickHouse 定位所选的 granules，以便将所有其行流式传输到 ClickHouse 引擎中，以查找实际与查询匹配的行。

我们将在以下部分更详细地讨论第二阶段。

### 标记文件用于定位 granules {#mark-files-are-used-for-locating-granules}

下图说明了我们表的主键索引文件的一部分。

<img src={sparsePrimaryIndexes04} class="image"/>

如上所述，ClickHouse 通过在索引的 1083 个 UserID 标记上进行二进制搜索，识别出标记 176。因此其对应的 granule 176 可能包含 UserID 列值为 749.927.693 的行。

<details>
    <summary>
    granule 选择详情
    </summary>
    <p>

上面的图表显示，标记 176 是第一个索引条目，其相关 granule 176 的最小 UserID 值小于 749.927.693，而下一个标记（标记 177）的 granule 177 的最小 UserID 值大于该值。因此，只有与标记 176 相关的 granule 176 可能包含 UserID 列值为 749.927.693 的行。
</p>
</details>

为了确认（或不确认）granule 176 中是否有某些行包含 UserID 列值为 749.927.693，需要将属于此 granule 的所有 8192 行流式传输到 ClickHouse。

为此，ClickHouse 需要知道 granule 176 的物理位置。

在 ClickHouse 中，我们表的所有 granule 的物理位置存储在标记文件中。与数据文件类似，每个表列有一个标记文件。

下图显示存储表的 `UserID`、`URL` 和 `EventTime` 列的 granules 物理位置的三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`。
<img src={sparsePrimaryIndexes05} class="image"/>

我们已经讨论过，主键索引是一个未压缩的平面数组文件 (primary.idx)，其中包含从 0 开始编号的索引标记。

类似地，标记文件也是一个未压缩的平面数组文件 (*.mrk)，其中包含从 0 开始编号的标记。

一旦 ClickHouse 确定并选择了可能包含查询匹配行的 granule 的索引标记，就可以在标记文件中执行位置数组查找，以获得该 granule 的物理位置。

特定列的每个标记文件条目存储两个位置，表示为偏移量：

- 第一个偏移量（上图中的 `block_offset`）定位包含所选 granule 压缩版本的 <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块</a> 在 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 列数据文件中的位置。该压缩块可能包含几个压缩的 granules。读取时，定位的压缩文件块在主内存中解压缩。

- 第二个偏移量（上图中的 `granule_offset`）来自标记文件，提供了 uncompressed 块数据中 granule 的位置。

所有属于定位的未压缩 granule 的 8192 行被流式传输到 ClickHouse 进行进一步处理。

:::note

- 对于具有 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 和没有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，ClickHouse 使用如上所示的 `.mrk` 标记文件，其中包含每个条目两个 8 字节长的地址。这些条目是物理位置的 granules，所有 granules 的大小相同。

索引粒度默认是 [自适应的](/operations/settings/merge-tree-settings#index_granularity_bytes)，但我们示例表中禁用了自适应索引粒度（为了简化本指南中的讨论，并使图表和结果可重复）。我们的表使用宽格式，因为数据的大小超过了 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（在自管理集群中默认值为 10 MB）。

- 对于具有宽格式和自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，这些标记文件与 `.mrk` 标记文件类似，但每个条目多了一个第三个值：与当前条目相关的 granule 的行数。

- 对于具有 [紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 的表，ClickHouse 使用 `.mrk3` 标记文件。

:::


:::note 标记文件的原因

为什么主键索引不直接包含与索引标记对应的 granules 的物理位置？

因为在 ClickHouse 设计的大规模上，重要的是在磁盘和内存中非常高效。

主键索引文件需要适应主存。

对于我们的示例查询，ClickHouse 使用主键索引并选择一个可能包含匹配我们查询的行的 granule。仅对那个 granule，ClickHouse 需要物理位置，以流式传输对应的行进行进一步处理。

此外，这些偏移信息仅对 UserID 和 URL 列是必要的。

对未在查询中使用的列（例如 `EventTime`），不需要偏移信息。

对于我们的示例查询，ClickHouse 只需获取 UserID 数据文件（UserID.bin）中 granule 176 的两个物理位置偏移量，以及 URL 数据文件（URL.bin）中 granule 176 的两个物理位置偏移量。

通过标记文件提供的间接性避免了在主键索引内直接存储所有 1083 个 granules 的所有三列的物理位置条目，从而避免在主内存中有不必要（可能未使用）数据。
:::

下图和下面的文本说明了 ClickHouse 如何根据示例查询定位 UserID.bin 数据文件中的 granule 176。

<img src={sparsePrimaryIndexes06} class="image"/>

我们在本指南的早些时候讨论过，ClickHouse 选择了主键索引标记 176，因此 granule 176 可能包含与查询匹配的行。

ClickHouse 现在使用来自索引的选定标记号（176）在 UserID.mrk 标记文件中进行位置数组查找，以获取用于定位 granule 176 的两个偏移量。

如图所示，第一个偏移量定位 UserID.bin 数据文件中包含 granule 176 压缩版本的压缩文件块。

一旦定位的文件块被解压缩到主存中，来自标记文件的第二个偏移量可用于定位未压缩数据中的 granule 176。

ClickHouse 需要从 UserID.bin 数据文件和 URL.bin 数据文件定位（和流式传输所有值）granule 176，以执行我们的示例查询（用户 ID 为 749.927.693 的互联网用户点击次数最多的前 10 个 URL）。

上面的图表显示了 ClickHouse 如何定位 UserID.bin 数据文件中的 granule。

同时，ClickHouse 对 URL.bin 数据文件的 granule 176 也执行相同操作。两个各自的 granules 被对齐并流式传输到 ClickHouse 引擎进行进一步处理，即对所有行的 URL 值进行聚合和计数，最后以降序输出前 10 个最大 URL 组。

## 使用多个主键索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 次要键列可以（不）低效 {#secondary-key-columns-can-not-be-inefficient}

当一个查询过滤一个是复合键部分的列并且是第一个关键列时，[ClickHouse 对关键列的索引标记执行二进制搜索算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当一个查询过滤一个是复合键部分的列但不是第一个关键列时会发生什么？

:::note
我们讨论一个场景，当一个查询显式不上第一个关键列，而是上次要键列时。

当查询同时过滤第一个关键列和任何后续的关键列时，ClickHouse 将在第一个关键列的索引标记上运行二进制搜索。
:::

<br/>
<br/>

<a name="query-on-url"></a>
我们使用一个查询来计算点击次数最多的前 10 个用户，该查询表示 URL "http://public_search"：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应是： <a name="query-on-url-slow"></a>
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
// highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

客户端输出指示 ClickHouse 几乎执行了完整表扫描，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)！ClickHouse 从 8.87 百万行中读取了 8.81 百万行。

如果启用了 [trace_logging](/operations/server-configuration-parameters/settings#logger)，则 ClickHouse 服务器日志文件显示 ClickHouse 对 1083 个 URL 索引标记执行了 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>，以识别可能包含 URL 列值为 "http://public_search" 的行的 granules：
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```
我们可以在上面的样本跟踪日志中看到，1076（通过标记）从 1083 个 granules 中被选为可能包含 URL 列值匹配行。

这导致 8.81 百万行被流式传输到 ClickHouse 引擎（使用 10 个流并行），以识别实际包含 URL 值为 "http://public_search" 的行。

但是，如我们稍后看到，只有 39 个 granules 实际上包含匹配行。

尽管基于复合主键（UserID, URL）的主键索引对于加速筛选特定 UserID 值的行查询非常有用，但该索引在加速筛选特定 URL 值的行查询时并没有提供显着帮助。

原因是 URL 列不是第一个关键列，因此 ClickHouse 在 URL 列的索引标记上使用通用排除搜索算法，而 **该算法的有效性依赖于 URL 列与其前置关键列 UserID 之间的基数差异**。

为了说明这一点，我们提供一些关于通用排除搜索工作原理的细节。

<a name="generic-exclusion-search-algorithm"></a>
### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下示例说明了 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse 通用排除搜索算法</a> 在通过次要列选择 granules 时的工作原理，其中前驱关键列具有低或高基数。

作为这两种情况的示例，我们假设：
- 一个查询在搜索 URL 值 = "W3" 的行。
- 一个带有简化 `UserID` 和 `URL` 值的抽象版本的 hits 表。
- 对于索引的相同复合主键 (UserID, URL)。这意味着行首先根据 UserID 值排序。具有相同 UserID 值的行接下来按 URL 排序。
- granule 大小为 2，即每个 granule 包含两行。

我们在下面的图表中以橙色标记了每个 granule 的第一行的关键列值。

**前驱关键列具有较低基数** <a name="generic-exclusion-search-fast"></a>

假设 UserID 的基数较低。在这种情况下，相同的 UserID 值通常分布在多个表行和 granules 及索引标记中。对于相同的 UserID 的索引标记，URL 值按升序排序（因为表行按 UserID 排序然后才按 URL 排序）。这允许如下面所述的高效过滤：
<img src={sparsePrimaryIndexes07} class="image"/>

在上面的抽象示例数据的图表中，granule 选择过程的三种不同场景为：

1.  索引标记 0 对于 **URL 值小于 W3 并且直接后续索引标记的 URL 值也小于 W3** 可以被排除，因为标记 0 和 1 的 UserID 值相同。请注意，此排除前提确保 granule 0 完全由 U1 的 UserID 值构成，以便 ClickHouse 可以假设 granule 0 中的 URL 最大值也小于 W3，从而排除该 granule。

2.  索引标记 1 对于 **URL 值小于或等于 W3 并且直接后续索引标记的 URL 值大于或等于 W3** 被选择，因为这意味着 granule 1 可能包含 URL W3 的行。

3.  索引标记 2 和 3 对于 **URL 值大于 W3** 可以被排除，因为主键索引的索引标记存储的是每个 granule 的每个表行的关键列值，因此 granule 2 和 3 不可能包含 URL 值 W3。

**前驱关键列具有较高基数** <a name="generic-exclusion-search-slow"></a>

当 UserID 具有较高基数时，相同的 UserID 值通常不会分布在多个表行和 granules 中。这意味着索引标记的 URL 值不是单调增加的：

<img src={sparsePrimaryIndexes08} class="image"/>

如上图所示，所有 URL 值小于 W3 的标记都被选择以流式传输其相关 granule 的行到 ClickHouse 引擎中。

这是因为图中所有索引标记都属于上述场景 1，但不满足前面提到的排除前提，即 *直接后续索引标记的 UserID 值与当前标记相同*，因此无法排除。

例如，考虑标记 0，对于 **URL 值小于 W3 并且直接后续标记的 URL 值也小于 W3**。这 *不能* 被排除，因为直接后续标记 1 与当前标记 0 的 UserID 值 *不同*。

这最终阻止 ClickHouse 对 granule 0 中的 URL 最大值进行假设。相反，它必须假设 granule 0 可能包含 URL 值 W3，并被迫选择标记 0。

相同的场景也适用于标记 1、2和 3。

:::note 结论
当查询过滤的列是复合键的一部分，但不是第一个关键列时，ClickHouse 使用的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a> 的有效性在前驱关键列具有较低基数时最高。
:::

在我们的示例数据集中，两列（UserID，URL）的基数相似且较高。如上所述，当 URL 列的前驱关键列具有较高或相似基数时，通用排除搜索算法的效率并不高。
### 关于数据跳过索引的说明 {#note-about-data-skipping-index}

由于 UserID 和 URL 的基数相似且都很高，我们在 URL 上的 [查询过滤](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 实际上并不会从为 URL 列创建 [二级数据跳过索引](./skipping-indexes.md) 中受益多少，这个列是我们 [具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key)。

例如，以下两个语句在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) 数据跳过索引：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse 现在创建了一个附加索引，它每四个连续的 [粒度](#data-is-organized-into-granules-for-parallel-data-processing) （注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句）存储最小和最大 URL 值：

<img src={sparsePrimaryIndexes13a} class="image"/>

第一个索引条目（上图中的‘标记 0’）存储了 [属于我们表的前 4 个粒度的行](#data-is-organized-into-granules-for-parallel-data-processing) 的最小和最大 URL 值。

第二个索引条目（‘标记 1’）存储了属于下 4 个粒度的行的最小和最大 URL 值，以此类推。

（ClickHouse 还为数据跳过索引创建了一个特殊的 [标记文件](#mark-files-are-used-for-locating-granules)，用于 [定位](#mark-files-are-used-for-locating-granules) 与索引标记相关的粒度组。）

由于 UserID 和 URL 的基数相似且都很高，因此在执行我们的 [查询过滤 URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 时，无法借助此二级数据跳过索引来排除粒度。

查询所寻找的具体 URL 值（即 'http://public_search'）很可能位于索引为每个粒度组存储的最小值和最大值之间，导致 ClickHouse 被迫选择粒度组（因为它们可能包含与查询匹配的行）。

### 需要使用多个主键索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想显著加快过滤特定 URL 行的示例查询，我们需要使用针对该查询优化的主键索引。

如果我们还想保持对特定 UserID 的过滤示例查询的良好性能，则需要使用多个主键索引。

以下是实现该目标的方法。

<a name="multiple-primary-indexes"></a>
### 创建额外主键索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们想显著加快两个示例查询——一个过滤特定 UserID 的行，另一个过滤特定 URL 的行——那么我们需要通过使用以下三种选项之一来使用多个主键索引：

- 创建一个具有不同主键的 **第二个表**。
- 在现有表上创建一个 **物化视图**。
- 为现有表添加一个 **投影**。

这三种选项都有效地将示例数据复制到额外表中，以重新组织表的主键索引和行排序顺序。

但是，这三种选项在查询和插入语句的路由方面，用户所感知的额外表的透明度有所不同。

创建一个具有不同主键的 **第二个表** 时，查询必须被显式发送到最适合该查询的表版本，并且新数据必须显式插入到两个表中以使其保持同步：
<img src={sparsePrimaryIndexes09a} class="image"/>

通过 **物化视图**，额外表是隐式创建的，数据在两个表之间自动保持同步：
<img src={sparsePrimaryIndexes09b} class="image"/>

而 **投影** 是最透明的选项，因为在自动保持隐式创建（并隐藏的）额外表与数据更改同步的同时，ClickHouse 会自动选择最有效的表版本来处理查询：
<img src={sparsePrimaryIndexes09c} class="image"/>

接下来，我们将更详细地讨论这三种创建和使用多个主键索引的选项，并给出实际例子。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### 选项 1: 二级表 {#option-1-secondary-tables}

<a name="secondary-table"></a>
我们创建一个新的额外表，在主键中切换键列的顺序（与原始表相比）：

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

将我们 [原始表](#a-table-with-a-primary-key) 中的 8.87 百万行插入额外表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

响应结果如下：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后优化表：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们在主键中切换了列的顺序，插入的行现在在磁盘上以不同的字典顺序存储（与我们的 [原始表](#a-table-with-a-primary-key) 相比），因此该表的 1083 个粒度包含的值也不同：

<img src={sparsePrimaryIndexes10} class="image"/>

这就是最终的主键：

<img src={sparsePrimaryIndexes11} class="image"/>

现在可以用于显著加快我们示例查询的执行，该查询过滤 URL 列以计算最常点击 URL "http://public_search" 的前 10 位用户：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应结果是：
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
// highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

现在，ClickHouse 不再几乎执行全表扫描，而是更加有效地执行了该查询。

在 [原始表](#a-table-with-a-primary-key) 中的主键，则 UserID 为第一个主键列，URL 为第二个主键列，ClickHouse 在执行该查询时使用了 [通用排除搜索](#guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) 对索引标记进行处理，但由于 UserID 和 URL 的基数相似而效果不佳。

通过将 URL 作为主键中的第一列，ClickHouse 现在正在运行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二进制搜索</a> 对索引标记进行处理。
ClickHouse 服务器日志文件中的相应跟踪日志证实了这一点：
```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
ClickHouse 仅选择了 39 个索引标记，而不是当使用通用排除搜索时的 1076。

请注意，额外的表是针对加快对 URL 的过滤查询的执行而优化的。

与我们 [原始表](#a-table-with-a-primary-key) 的 [低效性能](#guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 相比，我们 [过滤 `UserIDs` 的示例查询](#the-primary-index-is-used-for-selecting-granules) 在新创建的额外表上不会非常有效，因为 UserID 现在是该表主键中的第二个列，因此 ClickHouse 将使用通用排除搜索进行粒度选择，这在基数相似的情况下 [并不高效](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

打开详细信息框以获取具体信息。

<details>
    <summary>
    现在基于 UserIDs 的查询性能较差<a name="query-on-userid-slow"></a>
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

响应结果是：

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
// highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

服务器日志：
```response
...Executor): Key condition: (column 1 in [749927693, 749927693])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
</p>
</details>

我们现在有两个表。分别针对加速对 `UserIDs` 的查询和对 URLs 的查询进行了优化：

<img src={sparsePrimaryIndexes12a} class="image"/>
### 选项 2: 物化视图 {#option-2-materialized-views}

在我们的现有表上创建一个 [物化视图](/sql-reference/statements/create/view.md)：
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

响应结果是：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 我们在视图的主键中切换了键列的顺序（与我们的 [原始表](#a-table-with-a-primary-key) 相比）
- 该物化视图由 **隐式创建的表** 支持，其行顺序和主索引基于给定的主键定义
- 该隐式创建的表可通过 `SHOW TABLES` 查询列出，并且名称以 `.inner` 开头
- 也可以先显式创建物化视图的支持表，然后通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 指向该表
- 我们使用 `POPULATE` 关键字立即将源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的所有 8.87 百万行填充到隐式创建的表中
- 如果向源表 hits_UserID_URL 插入新行，则这些行也会自动插入隐式创建的表中
- 实际上，隐式创建的表具有与我们 [显式创建的二级表](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同的行顺序和主索引：

<img src={sparsePrimaryIndexes12b1} class="image"/>

ClickHouse 将隐式创建的表及其主索引的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[标记文件](#mark-files-are-used-for-locating-granules) (*.mrk2) 以及 [主索引](#the-primary-index-has-one-entry-per-granule) (primary.idx) 存储在 ClickHouse 服务器数据目录中的一个特殊文件夹中：

<img src={sparsePrimaryIndexes12b2} class="image"/>

:::

隐式创建的表（及其主索引）现在可以用于显著加快针对 URL 列的查询执行：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应结果是：

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
// highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

由于隐式创建的表（及其主索引）与我们 [显式创建的二级表](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 实际相同，因此查询的执行方式也与显式创建的表相同。

ClickHouse 服务器日志文件中的相应跟踪日志确认 ClickHouse 正在对索引标记运行二进制搜索：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
// highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```
### 选项 3: 投影 {#option-3-projections}

在现有表中创建一个投影：
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

并填充投影：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- 该投影创建了一个 **隐藏表**，其行顺序和主要索引基于投影的 `ORDER BY` 子句
- 隐藏表不会通过 `SHOW TABLES` 查询列出
- 我们使用 `MATERIALIZE` 关键字立即将源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的所有 8.87 百万行填充到隐藏表
- 如果向源表 hits_UserID_URL 插入新行，则这些行也会自动插入隐藏表
- 查询始终（语法上）针对源表 hits_UserID_URL 进行，但如果隐藏表的行顺序和主索引允许更有效的查询执行，则将使用该隐藏表
- 请注意，投影不会使使用 `ORDER BY` 的查询更高效，即使 `ORDER BY` 与投影的 `ORDER BY` 声明匹配（请参见 https://github.com/ClickHouse/ClickHouse/issues/47333）
- 实际上，隐式创建的隐藏表的行顺序和主索引与之前 [显式创建的二级表](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同：

<img src={sparsePrimaryIndexes12c1} class="image"/>

ClickHouse 将隐式创建的隐藏表及其主索引的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[标记文件](#mark-files-are-used-for-locating-granules) (*.mrk2) 和 [主索引](#the-primary-index-has-one-entry-per-granule) (primary.idx) 存储在源表的数据文件、标记文件和主索引文件旁边的特殊文件夹中：

<img src={sparsePrimaryIndexes12c2} class="image"/>
:::

通过投影创建的隐藏表（及其主索引）现在可以（隐式地）用于显著加快对 URL 列的查询执行。请注意，查询在语法上是针对投影的源表。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应结果是：

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
// highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

由于实际上由投影创建的隐藏表（及其主索引）与 [显式创建的二级表](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 相同，因此查询的执行方式也与显式创建的表相同。

ClickHouse 服务器日志文件中的相应跟踪日志证实 ClickHouse 正在对索引标记运行二进制搜索：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
// highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
### 总结 {#summary}

我们 [具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key) 的主键对于加速 [过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 非常有用。但该索引对加速 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 没有提供显著帮助，尽管 URL 列是复合主键的一部分。

反之亦然：
我们 [具有复合主键 (URL, UserID) 的表](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 对于加速 [过滤 URL 的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 是有效的，但对于 [过滤 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 并没有提供 much support。

由于主键列 UserID 和 URL 的基数相似，用于对第二个主键列进行过滤的查询 [不能从索引中的第二个主键列受益多少](#generic-exclusion-search-algorithm)。

因此，从主索引中移除第二个主键列是有道理的（这将减少索引的内存消耗），并且 [使用多个主键索引](#guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) 代替。

但是，如果复合主键中的键列在基数上有较大差异，那么 [对于查询](#guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)来说，按升序排列主键列的基数是有益的。

主键列之间的基数差异越大，列在键中的顺序越重要。我们将在下一节中对此进行演示。
## 有效地排列键列 {#ordering-key-columns-efficiently}

<a name="test"></a>

在复合主键中，键列的顺序可以显著影响：
- 在查询中对二级键列过滤的效率，以及
- 表数据文件的压缩比率。

为了演示这一点，我们将使用我们 [网页流量示例数据集](#data-set) 的一个版本，其中每行包含三个列，这些列指示互联网 ‘用户’（`UserID` 列）对 URL （`URL` 列）的访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用一个包含所有三个前述列的复合主键，以加速典型的网页分析查询，这些查询计算：
- 对特定 URL 的流量有多少（百分比）来自机器人，或
- 我们对特定用户是否（不是）机器人有多大的信心（该用户的流量中有多少百分比被认为不是机器人流量）。

我们使用此查询计算我们希望用于复合主键的三个列的基数（注意，我们在查询 TSV 数据时使用 [URL 表函数](/sql-reference/table-functions/url.md)，无需创建本地表）。在 `clickhouse client` 中运行此查询：
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
响应结果是：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

我们可以看到，基数之间存在很大差异，尤其是 `URL` 和 `IsRobot` 列之间，因此，在复合主键中这些列的顺序对加速对这些列的查询以及实现表的列数据文件的最佳压缩比非常重要。

为了演示这一点，我们创建了两个表版本用于机器人的流量分析数据：
- 一个表 `hits_URL_UserID_IsRobot` 具有复合主键 `(URL, UserID, IsRobot)`，其中我们按降序排列键列
- 一个表 `hits_IsRobot_UserID_URL` 具有复合主键 `(IsRobot, UserID, URL)`，其中我们按升序排列键列

创建具有复合主键 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot`：
```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
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

接下来，创建具有复合主键 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL`：
```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
并填充与之前相同的 8.87 百万行：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
响应结果是：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```
### 在二级键列上有效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询过滤至少一个属于复合键的列，并且是第一个键列时，[ClickHouse 会对键列的索引标记进行二进制搜索算法](#the-primary-index-is-used-for-selecting-granules)。

当查询仅对属于复合键的列进行过滤，但不是第一个键列时， [ClickHouse 会对键列的索引标记使用通用排除搜索算法](#guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中键列的顺序对 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的有效性是显著的。

这是一个针对我们按基数降序排列键列的表的 `UserID` 列进行过滤的查询：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
响应结果是：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

这是在键列按基数升序排列的表上执行相同查询：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
响应结果是：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

我们可以看到，按基数升序排列键列的表的查询执行效果明显更好，速度也更快。

原因在于 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 在选择通过第二个键列筛选的粒度时，前面的键列具有较低基数，而工作效率最高。我们在本指南的 [先前部分](#generic-exclusion-search-algorithm) 中详细说明了这一点。
### 数据文件的最佳压缩比 {#optimal-compression-ratio-of-data-files}

这个查询比较了我们上面创建的两个表中 `UserID` 列的压缩比：

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
这是响应：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```
我们可以看到，`UserID` 列的压缩比在按基数升序排列键列的表中显著更高。

虽然在这两个表中存储的数据完全相同（我们向两个表中插入了相同的 8.87 百万行），但复合主键中键列的顺序对 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 表中的 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) 所需的磁盘空间有显著影响：
- 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，其中按基数降序排列键列，`UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
- 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，其中按基数升序排列键列，`UserID.bin` 数据文件只占用 **877.47 KiB** 的磁盘空间

对于表的列数据，良好的压缩比不仅节省了磁盘空间，而且使得需要读取该列数据的查询（尤其是分析性查询）速度更快，因为从磁盘到主内存（操作系统的文件缓存）移动列数据所需的 I/O 更少。

接下来，我们将说明将表的列按基数升序排列主键列为何是有益的。

下图勾划了按基数升序排列的主键的行在磁盘上的顺序：
<img src={sparsePrimaryIndexes14a} class="image"/>

我们讨论了 [表的行数据是按主键列在磁盘上存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表的行（它们在磁盘上的列值）首先按 `cl` 值排序，具有相同 `cl` 值的行按 `ch` 值排序。而由于第一个键列 `cl` 的基数较低，因此很可能存在具有相同 `cl` 值的行。因为这样，`ch` 值也是可能局部有序（对于具有相同 `cl` 值的行）。

如果某列中，相似的数据被放置得很接近，例如通过排序，那么该数据的压缩效果会更好。
一般来说，压缩算法受益于数据的运行长度（它看到的数据越多，对压缩越有利）和局部性（数据越相似，压缩比越好）。

与上图相比，下图勾划了按基数降序排列的主键的行在磁盘上的顺序：
<img src={sparsePrimaryIndexes14b} class="image"/>

现在表的行首先按它们的 `ch` 值排序，具有相同 `ch` 值的行按 `cl` 值排序。
但由于第一个键列 `ch` 的基数很高，因此很少存在具有相同 `ch` 值的行。因此，`cl` 值局部有序的可能性也很小（对于具有相同 `ch` 值的行）。

因此，`cl` 值很可能是随机顺序，从而导致较差的局部性和压缩比。

### 总结 {#summary-1}

为了在查询中有效地对二级键列进行过滤，并提高表列数据文件的压缩比，将主键中的列按基数升序排列是有益的。

### 相关内容 {#related-content-1}
- 博客: [加速您的 ClickHouse 查询](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## 高效识别单行 {#identifying-single-rows-efficiently}

虽然一般来说这不是 ClickHouse 的最佳用例，[但](https://knowledgebase/key-value) 有时构建在 ClickHouse 上的应用程序需要识别 ClickHouse 表的单行。

一个直观的解决方案可能是使用每行一个唯一值的 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，并将该列用作主键列以快速检索行。

为了实现最快的检索，UUID 列 [需要作为第一个键列](#the-primary-index-is-used-for-selecting-granules)。

我们已经讨论了 [ClickHouse 表的行数据是按主键列存储在磁盘上的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中拥有一个基数非常高的列（例如 UUID 列）将会 [对其他表列的压缩比产生不利影响](#optimal-compression-ratio-of-data-files)。

在最快检索和最佳数据压缩之间的折衷是使用复合主键，其中 UUID 是最后一个键列，在用于确保某些表列良好的压缩比的较低基数键列之后。

### 一个具体的例子 {#a-concrete-example}

一个具体的例子是纯文本粘贴服务 https://pastila.nl ，该服务由 Alexey Milovidov 开发，并 [在博客中介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

在每次更改文本区域时，数据会自动保存到 ClickHouse 表行中（每次更改一行）。

识别和检索（特定版本的）粘贴内容的一种方法是使用内容的哈希作为包含该内容的表行的 UUID。

下图显示了
- 当内容更改（例如因为在文本区域中输入文本）时行的插入顺序，以及
- 当使用 `PRIMARY KEY (hash)` 时插入行的数据在磁盘上的顺序：
<img src={sparsePrimaryIndexes15a} class="image"/>

由于 `hash` 列被用作主键列
- 特定行可以 [非常快速地](#the-primary-index-is-used-for-selecting-granules) 检索，但
- 表的行（它们的列数据）在磁盘上的存储是按（唯一和随机的）哈希值升序排列的。因此，内容列的值也随机存储，没有数据局部性，导致 **内容列数据文件的压缩比不理想**。

为了显著提高内容列的压缩比，同时仍能实现特定行的快速检索，pastila.nl 使用两个哈希（和一个复合主键）来识别特定行：
- 内容的哈希，如上所述，对于不同的数据是不同的，以及
- 一个 [局部敏感哈希（指纹）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，即 **不** 会因为数据的小变化而改变。

下图显示了
- 当内容更改（例如因为在文本区域中输入文本）时行的插入顺序，以及
- 当使用复合 `PRIMARY KEY (fingerprint, hash)` 时插入行的数据在磁盘上的顺序：

<img src={sparsePrimaryIndexes15b} class="image"/>

现在磁盘上的行首先按 `fingerprint` 排序，并且对于具有相同指纹值的行，其 `hash` 值确定最终顺序。

因为仅在小变化上不同的数据会获得相同的指纹值，现在相似的数据在内容列中存储得很接近。这对内容列的压缩比非常有利，因为一般来说，压缩算法受益于数据的局部性（数据越相似，压缩比越好）。

折衷的是，检索特定行的过程需要两个字段（`fingerprint` 和 `hash`），以便最佳利用从复合 `PRIMARY KEY (fingerprint, hash)` 产生的主索引。
