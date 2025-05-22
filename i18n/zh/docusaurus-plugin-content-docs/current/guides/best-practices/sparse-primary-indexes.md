---
'sidebar_label': '主键索引'
'sidebar_position': 1
'description': '在本指南中，我们将深入探讨 ClickHouse 索引。'
'title': '在 ClickHouse 中主键索引的实用介绍'
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


# ClickHouse 主索引的实用介绍
## 引言 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引。我们将详细说明和讨论：
- [ClickHouse 的索引如何不同于传统的关系数据库管理系统](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建和使用表的稀疏主索引](#a-table-with-a-primary-key)
- [ClickHouse 中的一些最佳索引实践](#using-multiple-primary-indexes)

您可以选择在自己的计算机上执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关安装 ClickHouse 和入门的说明，请参见 [快速入门](/quick-start.mdx)。

:::note
本指南重点介绍 ClickHouse 的稀疏主索引。

有关 ClickHouse [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅 [教程](/guides/best-practices/skipping-indexes.md)。
:::
### 数据集 {#data-set}

在本指南中，我们将使用一组匿名的网络流量数据集作为示例。

- 我们将使用示例数据集中的 8.87 百万行（事件）的子集。
- 解压缩后的数据大小为 8.87 百万事件，约 700 MB。在 ClickHouse 中存储时压缩为 200 MB。
- 在我们的子集中，每行包含三个列，分别表示在特定时间点击了 URL 的互联网用户（`UserID` 列）、`URL` 列和 `EventTime` 列。

有了这三列，我们可以制定一些典型的网络分析查询，比如：

- “特定用户的前 10 个点击量最高的 URL 是哪些？”
- “点击特定 URL 最频繁的前 10 个用户是谁？”
- “用户点击特定 URL 的最受欢迎的时间（例如，星期几）是什么时候？”
### 测试机器 {#test-machine}

本文档中给出的所有运行时数据都基于在配备 Apple M1 Pro 芯片和 16GB RAM 的 MacBook Pro 上本地运行 ClickHouse 22.2.1。
### 完整表扫描 {#a-full-table-scan}

为了查看在没有主键的情况下查询如何在我们的数据集上执行，我们通过执行以下 SQL DDL 语句创建一个表（使用 MergeTree 表引擎）：

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

接下来，通过以下 SQL 插入语句将部分点击数据插入到表中。
这使用了 [URL 表函数](/sql-reference/table-functions/url.md) 来加载存储在 clickhouse.com 上的完整数据集的一个子集：

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

最后，为了简化本指南后续讨论，并使图表和结果可重复，我们使用 FINAL 关键字对表进行 [优化](/sql-reference/statements/optimize.md)：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常在将数据加载到表中后，不需要也不推荐立即优化表。
本示例为何需要这样做将变得明显。
:::


现在我们执行第一个网络分析查询。以下查询计算了互联网用户 UserID 为 749927693 的点击量前 10 的 URL：

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

ClickHouse 客户端的结果输出表明 ClickHouse 执行了完整的表扫描！我们表中的 8.87 百万行的每一行都被流入了 ClickHouse。这无法扩展。

为了使这一过程（更）高效且（大幅）加快速度，我们需要使用一个具有适当主键的表。这将使 ClickHouse 自动（基于主键的列）创建一个稀疏主索引，从而显著加快我们示例查询的执行速度。
### 相关内容 {#related-content}
- 博客: [为您的 ClickHouse 查询超充] (https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouse 索引设计 {#clickhouse-index-design}
### 为大规模数据设计索引 {#an-index-design-for-massive-data-scales}

在传统的关系数据库管理系统中，主索引会为每个表行包含一个条目。这将导致我们的数据集的主索引包含 8.87 百万条目。这种索引允许快速定位特定行，从而在查找查询和点更新中实现高效率。在 `B(+)-Tree` 数据结构中查找一个条目的平均时间复杂度为 `O(log n)`；更精确地说，`log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是被索引行的数量。由于 `b` 通常在几百到几千之间，因此 `B(+)-Trees` 是非常浅的结构，定位记录所需的磁盘寻址较少。在 8.87 百万行和分支因子为 1000 的情况下，平均需要 2.3 次磁盘寻址。这个能力是有代价的：额外的磁盘和内存开销，在向表中添加新行和将条目添加到索引时更高的插入成本，有时还需要对 B-Tree 进行重新平衡。

考虑到 B-Tree 索引相关的挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse [MergeTree 引擎系列](/engines/table-engines/mergetree-family/index.md) 被设计并优化以处理大规模的数据量。这些表被设计为每秒接收数百万行插入，并存储非常大的数据量（数百 PB）。数据快速写入表中 [逐部分](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)，在后台应用合并部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分被合并时，合并部分的主索引也会被合并。在 ClickHouse 所针对的巨大规模下，盘存和内存效率非常重要。因此，主索引为每个部分在一组行（称为“granule”）中只有一个索引条目（称为“mark”）——这种技术称为 **稀疏索引**。

稀疏索引之所以可行，是因为 ClickHouse 将每个部分的行在磁盘上按主键列的顺序存储。稀疏主索引允许它快速（通过对索引条目进行二分查找）识别可能匹配查询的行组，而不是直接定位单行。找到的可能匹配的行（granules）随后被并行流入 ClickHouse 引擎，以便查找匹配项。这种索引设计使主索引小（可以完全适应主内存），同时显著加快查询执行时间：尤其是对于数据分析用例中典型的范围查询。

以下详细说明了 ClickHouse 如何构建和使用其稀疏主索引。稍后在本文中，我们将讨论一些选择、删除和排序用于构建索引（主键列）的表列的最佳实践。
### 带主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键的表，关键列为 UserID 和 URL：

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

为了简化本指南后面的讨论，并使图表和结果可重现，DDL 语句：

<ul>
  <li>
    通过 <code>ORDER BY</code> 子句指定表的复合排序键。
  </li>
  <li>
    通过设置显式控制主索引将包含多少索引条目：
    <ul>
      <li>
        <code>index_granularity</code>: 显式设置为其默认值 8192。这意味着，对于每组 8192 行，主索引将有一个索引条目。例如，如果表包含 16384 行，则该索引将有两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>: 设置为 0，以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着 ClickHouse 会自动为一组 n 行创建一个索引条目，如果以下任一条件为真：
        <ul>
          <li>
            如果 <code>n</code> 小于 8192，且该 <code>n</code> 行的组合行数据大小大于或等于 10 MB（<code>index_granularity_bytes</code> 的默认值）。
          </li>
          <li>
            如果 <code>n</code> 行的组合行数据大小小于 10 MB，但 <code>n</code> 为 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 设置为 0 以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引的压缩</a>。这将使我们在以后可以选择查看其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


DDL 语句中的主键会根据指定的两个关键列创建主索引。

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

- 表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 存储在磁盘的特定目录中，这意味着该目录内每个表列都有一个数据文件（和一个标记文件）。
- 表包含 8.87 百万行。
- 所有行的未压缩数据大小为 733.28 MB。
- 所有行在磁盘上的压缩大小为 206.94 MB。
- 表有一个主索引，包含 1083 个条目（称为“marks”），索引大小为 96.93 KB。
- 总之，表的数据文件、标记文件和主索引文件在磁盘上共占用 207.07 MB。
### 数据在磁盘上按主键列（和附加列）排序存储 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们上面创建的表具有
- 复合 [主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 和
- 复合 [排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- 如果我们仅指定了排序键，则主键将被隐式地定义为等于排序键。

- 为了节省内存，我们显式指定了仅包含我们查询过滤的列的主键。基于主键的主索引被完全加载到主内存中。

- 为了在本指南的图表中保持一致性，并最大化压缩比，我们定义了一个单独的排序键，并包含了我们表的所有列（如果在相似数据的列中将数据放置得相对紧密，例如通过排序，那么该数据将得到更好的压缩）。

- 如果同时指定了主键，则主键必须是排序键的前缀。
:::

插入的行按主键列（和排序键的附加 `EventTime` 列）的字典顺序（升序）存储在磁盘上。

:::note
ClickHouse 允许插入具有相同主键列值的多行。在这种情况下（参见下方图表中的第 1 行和第 2 行），最终顺序由指定的排序键确定，因此取决于 `EventTime` 列的值。
:::


ClickHouse 是一个 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列式数据库管理系统</a>。如下图所示
- 在磁盘上的表示中，每个表列都有一个单独的数据文件 (*.bin)，其中存储该列的所有值，并采用 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a> 格式，并且
- 8.87 百万行在磁盘上按主键列（和附加排序键列）的字典升序存储，即在这种情况下
  - 首先按 `UserID`,
  - 然后按 `URL`,
  - 最后按 `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="稀疏主索引 01" background="white"/>

`UserID.bin`, `URL.bin`, 和 `EventTime.bin` 是磁盘上的数据文件，存储 `UserID`、`URL` 和 `EventTime` 列的值。

:::note
- 由于主键定义了行在磁盘上的字典顺序，因此一个表只能有一个主键。

- 我们从 0 开始编号行，以便与 ClickHouse 内部行编号方案对齐，该方案也用于记录消息。
:::
### 将数据组织到 granules 中以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，表的列值在逻辑上分成 granules。
granule 是流入 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着 ClickHouse 始终以流式方式（并行）读取一整组行（granule），而不是单独读取个别行。
:::note
列值不是物理存储在 granules 中：granules 只是用于查询处理的列值的逻辑组织形式。
:::

下图显示了我们表的 8.87 百万行（列值）如何被组织为 1083 个 granule，作为表的 DDL 语句中包含设置 `index_granularity`（默认值为 8192）的结果。

<Image img={sparsePrimaryIndexes02} size="md" alt="稀疏主索引 02" background="white"/>

基于在磁盘上的物理顺序，前 8192 行（它们的列值）逻辑上归属于 granule 0，然后下 8192 行（它们的列值）归属于 granule 1，依此类推。

:::note
- 最后一个 granule（granule 1082）“包含”少于 8192 行。

- 我们在本指南开头的“DDL 语句详情”中提到，我们禁用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（为了简化本指南中的讨论，并使图表和结果可重复）。

  因此，我们示例表的所有 granule（最后一个除外）的大小都是相同的。

- 对于具有自适应索引粒度的表（索引粒度是 [默认自适应的](https://operations/settings/merge-tree-settings#index_granularity_bytes)），某些 granule 的大小可能小于 8192 行，具体取决于行数据的大小。


- 我们用橙色标记了一些来自主键列的列值 (`UserID`, `URL`)。
  这些橙色标记的列值是在每个 granule 的每第一行的主键列值。
  正如我们将在下面看到的，这些橙色标记的列值将是表的主索引中的条目。

- 我们从 0 开始编号 granules，以便与 ClickHouse 内部的编号方案对齐，该方案也用于记录消息。
:::
### 主索引每个 granule 有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是根据上面图表中显示的 granules 创建的。该索引是一个未压缩的平面数组文件（primary.idx），包含所谓的从 0 开始的数值索引标记。

下图显示索引存储了每个 granule 的第一行的主键列值（在上面的图中用橙色标记的值）。
换句话说：主索引存储来自表中每第 8192 行的主键列的值（基于主键列定义的物理行顺序）。
例如：
- 第一个索引条目（下图中的“mark 0”）存储来自上面图表中 granule 0 第一行的关键列值， 
- 第二个索引条目（下图中的“mark 1”）存储来自上面图表中 granule 1 第一行的关键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="稀疏主索引 03a" background="white"/>

总的来说，该索引对于我们的表具有 8.87 百万行和 1083 个 granules，有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="稀疏主索引 03b" background="white"/>

:::note
- 对于具有 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主索引中还会存储一个“最终”的附加标记，用于记录最后一行的主键列值，但由于我们禁用了自适应索引粒度（为了简化本指南中的讨论，并使图表和结果可重复），因此我们示例表的索引不包括此最终标记。

- 主索引文件完全加载到主内存中。如果文件大于可用的空闲内存，则 ClickHouse 会引发错误。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自管理的 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 检查我们示例表的主索引内容。

为此，我们首先需要将主索引文件复制到正在运行的集群中的节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>：
<ul>
<li>步骤 1：获取包含主索引文件的部分路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` 在测试机器上。

<li>步骤 2：获取 user_files_path</li>
在 Linux 上 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 是
`/var/lib/clickhouse/user_files/`

您可以在 Linux 上检查是否有所更改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

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

主键条目称为索引标记，因为每个索引条目标记着特定数据范围的开始。针对示例表：
- UserID 索引标记：

  存储在主索引中的 `UserID` 值按升序排序。<br/>
  因此，上述图表中的“mark 1”表示在 granule 1 及所有后续 granule 中，所有表行的 `UserID` 值均保证大于或等于 4,073,710。

 [稍后我们将看到](#the-primary-index-is-used-for-selecting-granules)，这种全局顺序使 ClickHouse 能够 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">在查询过滤主键的第一列时对索引标记执行二分查找算法</a>。

- URL 索引标记：

  主键列 `UserID` 和 `URL` 的基数相似，通常意味着所有键列的索引标记仅在前驱键列值保持一致时，才表示数据范围。
  例如，由于上面图表中标记 0 和标记 1 的 UserID 值不同，ClickHouse 无法假设在 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是，如果上面图表中标记 0 和标记 1 的 UserID 值相同（这意味着 UserID 值在 granule 0 中的所有表行保持不变），ClickHouse 可假设在 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们稍后将详细讨论这一点对查询执行性能的影响。
### 主索引用于选择 granules {#the-primary-index-is-used-for-selecting-granules}

现在我们可以在主索引的支持下执行我们的查询。

以下查询计算了 UserID 为 749927693 的点击量前 10 的 URL。

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

# highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouse 客户端的输出现在显示，取而代之的是进行完整表扫描，仅流入 ClickHouse 的行数为 8,190。

如果 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">启用了跟踪日志</a>，则 ClickHouse 服务器日志文件显示 ClickHouse 正在对 1083 个 UserID 索引标记执行 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以识别可能包含 UserID 列值为 `749927693` 的行的 granules。这需要 19 步，平均时间复杂度为 `O(log2 n)`：
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

我们可以在上面的跟踪日志中看到，现存的 1083 个标记中有一个标记满足查询条件。

<details>
    <summary>
    跟踪日志详情
    </summary>
    <p>

标记 176 被识别（“找到的左边界标记”是含有的，“找到的右边界标记”是不含有的），因此 granule 176 的所有 8192 行（开始于行 1,441,792 - 我们将在本指南后面看到）被流入 ClickHouse，以找到 `UserID` 列值为 `749927693` 的实际行。
</p>
</details>

我们还可以通过在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来重现此过程：
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
客户端输出显示，选择了 1083 个 granules 中的一个，可能包含 UserID 列值为 749927693 的行。

:::note 结论
当查询过滤的列是复合键的一部分并且是第一个键列时，ClickHouse 将在关键列的索引标记上运行二分查找算法。
:::

<br/>

如上所述，ClickHouse 使用其稀疏主索引快速（通过二分查找）选择可能包含与查询匹配的行的 granules。

这是 ClickHouse 查询执行的 **第一阶段（granule 选择）**。

在 **第二阶段（数据读取）** 中，ClickHouse 定位所选的 granules，以便将其所有行流入 ClickHouse 引擎，以找到与查询实际匹配的行。

我们将在以下部分中更详细地讨论第二阶段。
### 标记文件用于定位分片 {#mark-files-are-used-for-locating-granules}

下图展示了我们表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

如上所述，通过对索引中1083个UserID标记进行二叉搜索，标记176被识别。因此，其对应的分片176可能包含UserID列值为749.927.693的行。

<details>
    <summary>
    分片选择详细信息
    </summary>
    <p>

上面的图示表明，标记176是第一个索引条目，其中与分片176相关的最小UserID值小于749.927.693，而标记177的下一个分片（分片177）的最小UserID值大于该值。因此，只有与标记176对应的分片176可能包含UserID列值为749.927.693的行。
</p>
</details>

为了确认（或否认）分片176中的某些行是否包含UserID列值为749.927.693，必须将属于该分片的所有8192行传输到ClickHouse中。

为此，ClickHouse需要知道分片176的物理位置。

在ClickHouse中，我们表的所有分片的物理位置存储在标记文件中。与数据文件类似，每个表列都有一个标记文件。

以下图示展示了存储表的UserID、URL和EventTime列的分片物理位置的三个标记文件`UserID.mrk`、`URL.mrk`和`EventTime.mrk`。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

我们讨论了主索引是一个平坦的未压缩数组文件（primary.idx），包含从0开始编号的索引标记。

类似地，标记文件也是一个平坦的未压缩数组文件（*.mrk），包含从0开始编号的标记。

一旦ClickHouse识别并选择了可能包含查询匹配行的分片的索引标记，就可以在标记文件中执行位置数组查找，以获取该分片的物理位置。

特定列的每个标记文件条目存储两个位置，形式为偏移量：

- 第一个偏移量（上图中的“block_offset”）定位于包含所选分片压缩版本的<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块</a>，该<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件潜在地包含几个压缩的分片。定位的压缩文件块在读取时解压到主内存中。

- 第二个偏移量（上图中的“granule_offset”）来自标记文件，提供了分片在未压缩块数据中的位置。

然后，将属于定位的未压缩分片的所有8192行传输到ClickHouse进行进一步处理。

:::note

- 对于具有[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且没有[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse使用如上所示的`.mrk`标记文件，包含每个条目的两个8字节长地址。这些条目是物理位置，所有位置的分片都具有相同的大小。

索引粒度是[默认自适应的](/operations/settings/merge-tree-settings#index_granularity_bytes)，但为了简化本指南中的讨论，并使图例和结果可重现，我们对示例表禁用了自适应索引粒度。我们的表使用宽格式，因为数据的大小大于[min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（默认情况下自管理集群为10 MB）。

- 对于具有宽格式且具有自适应索引粒度的表，ClickHouse使用`.mrk2`标记文件，它包含与`.mrk`标记文件相似的条目，但每个条目有一个额外的第三个值：与当前条目相关的分片的行数。

- 对于[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse使用`.mrk3`标记文件。

:::

:::note 为什么使用标记文件

为什么主索引不直接包含与索引标记相对应的分片的物理位置？

因为在ClickHouse设计的非常大规模下，重要的是要非常高效地使用磁盘和内存。

主索引文件需要适合主内存。

对于我们的示例查询，ClickHouse使用主索引并选择一个可能包含与我们的查询匹配的行的单个分片。仅对于那个分片，ClickHouse才需要物理位置来传输相应的行以进行进一步处理。

此外，仅UserID和URL列需要这些偏移信息。

对于在查询中未使用的列，例如`EventTime`，不需要偏移信息。

对于我们的示例查询，ClickHouse仅需要UserID数据文件（UserID.bin）中分片176的两个物理位置偏移量和URL数据文件（URL.bin）中分片176的两个物理位置偏移量。

标记文件提供的间接性避免了在主索引中直接存储所有三个列的1083个分片的物理位置条目，从而避免在主内存中存放不必要（可能未使用）数据。
:::

下图及以下文本说明了对于我们的示例查询，ClickHouse如何定位UserID.bin数据文件中的分片176。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们在本指南中早前讨论过，ClickHouse选择了主索引标记176，因此分片176被视为可能包含匹配查询的行。

ClickHouse现在使用来自索引的选定标记号（176）在UserID.mrk标记文件中进行位置数组查找，以获取定位分片176的两个偏移量。

如图所示，第一个偏移量定位于UserID.bin数据文件中的压缩文件块，该文件块反过来包含分片176的压缩版本。

一旦定位的文件块解压到主内存中，便可以使用标记文件中的第二个偏移量定位未经压缩的数据中的分片176。

ClickHouse需要定位（并从中流式传输所有值）UserID.bin数据文件和URL.bin数据文件中的分片176，以执行我们的示例查询（用户ID 749.927.693的互联网用户点击次数最多的前10个URL）。

上面的图示显示了ClickHouse如何定位UserID.bin数据文件的分片。

与此同时，ClickHouse正在对URL.bin数据文件的分片176执行相同的操作。两个相应的分片被对齐，并流式传输到ClickHouse引擎以进行进一步处理，即对所有UserID为749.927.693的行按组聚合和计数URL值，最后按降序输出计数最多的10个URL组。

## 使用多个主索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 次要关键列可能（不）效率低下 {#secondary-key-columns-can-not-be-inefficient}

当一个查询在包含复合主键的一列上进行过滤并且是第一个关键列时，[ClickHouse 会对该关键列的索引标记执行二叉搜索算法](#the-primary-index-is-used-for-selecting-granules)。

但是当查询在复合主键的一列上进行过滤，但该列不是第一个关键列时，会发生什么？

:::note
我们讨论一个场景，当查询明确不在第一个关键列上进行过滤，而是在次要关键列上进行过滤。

当查询在第一个关键列以及其后的任何关键列上都进行过滤时，ClickHouse对第一个关键列的索引标记执行二叉搜索。
:::

<br/>
<br/>

<a name="query-on-url"></a>
我们使用一个查询，计算在URL "http://public_search" 上点击最频繁的前10个用户：

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

# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

客户端输出显示，尽管[URL列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse几乎执行了完整的表扫描！ClickHouse从表的887万行中读取了881万行。

如果启用了[trace_logging](/operations/server-configuration-parameters/settings#logger)，ClickHouse服务器日志文件表明，ClickHouse在1083个URL索引标记中使用了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>来识别可能包含URL列值为"http://public_search"的行的分片：
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
我们在上面的示例追踪日志中可以看到，从1083个分片中选择了1076个（通过标记），这些分片被认为可能包含与匹配的URL值。

这导致有881万行流式传输到ClickHouse引擎（通过使用10个流并行进行），以识别实际包含URL值"http://public_search"的行。

然而，正如我们稍后所见，从所选的1076个分片中，只有39个分片实际包含匹配的行。

虽然基于复合主键（UserID，URL）的主索引对加速过滤特定UserID值的查询非常有用，但该索引在加速过滤特定URL值的查询方面并未提供显著帮助。

其原因是URL列不是第一个关键列，因此ClickHouse正在对URL列的索引标记使用通用排除搜索算法（而不是二叉搜索），**该算法的有效性依赖于** URL列与其前驱关键列UserID之间的基数差异。

为了说明这一点，我们提供了一些有关通用排除搜索如何工作的细节。

<a name="generic-exclusion-search-algorithm"></a>
### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下是说明<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse通用排除搜索算法</a>如何在通过次要列选择分片时工作的示例，前驱关键列具有较低或较高的基数。

我们将假设以下示例：
- 一个查询正在搜索URL值= "W3"的行。
- 我们的点击表的抽象版本，UserID和URL的简化值。
- 具有相同复合主键（UserID，URL）。这意味着行首先按UserID值排序。具有相同UserID值的行随后按URL排序。
- 每个分片的大小为两个，即每个分片包含两行。

我们在下面的图示中将每个分片的前两行的关键列值用橙色标记。

**前驱关键列具有较低的基数**<a name="generic-exclusion-search-fast"></a>

假设UserID具有较低的基数。在这种情况下，同一UserID值很可能分布在多个表行和分片中，因此索引标记相同的UserID。对于具有相同UserID的索引标记，URL值按升序排序（因为表行首先按UserID排序，然后按URL）。这允许高效过滤，如下所述：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

对于我们抽象示例数据的分片选择过程，有三种不同的场景，图中所示：

1. 标记0，其中**URL值小于W3，并且直接后续的索引标记的URL值也小于W3**可以被排除，因为标记0和1具有相同的UserID值。注意，这个排除预条件确保分片0完全由U1 UserID值组成，因此ClickHouse可以假设分片0中的最大URL值也小于W3并排除该分片。

2. 标记1，其中**URL值小于（或等于）W3，并且直接后续的索引标记的URL值大于（或等于）W3**被选中，因为这意味着分片1可能包含URL W3的行。

3. 标记2和3，其中**URL值大于W3**可以被排除，因为主索引的索引标记存储每个分片的第一行的关键列值，因此在磁盘上按关键列值对表行排序，分片2和3不可能包含URL值W3。

**前驱关键列具有较高的基数**<a name="generic-exclusion-search-slow"></a>

当UserID具有较高的基数时，同一UserID值分布在多个表行和分片中的可能性很小。这意味着索引标记的URL值不是单调增加的：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

如上图所示，所有显示的标记和URL值小于W3的标记都被选择以流式传输与其相关的分片行到ClickHouse引擎。

这是因为，尽管图中的所有索引标记都符合上述场景1的描述，但它们不满足提到的排除预条件，即*直接后继的索引标记具有与当前标记相同的UserID值*，因此不能被排除。

例如，考虑标记0，其中**URL值小于W3，并且直接后续的索引标记的URL值也小于W3**。这不能被排除，因为直接后续的标记1与当前标记0的UserID值不同。

这最终阻止ClickHouse对分片0中的最大URL值进行假设。相反，它必须假设分片0可能包含URL值W3，并被迫选择标记0。

标记1、2和3的情况也是如此。

:::note 结论
ClickHouse使用的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a>取代了在查询过滤的列是复合关键的一部分，但不是第一个关键列的情况下使用的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二叉搜索算法</a>，在前驱关键列基数较低时最有效。
:::

在我们的示例数据集中，两个关键列（UserID，URL）具有类似的高基数，并且正如所解释的，当前驱关键列为URL列时，通用排除搜索算法并不那么有效。

### 关于数据跳过索引的说明 {#note-about-data-skipping-index}

由于UserID和URL的基数相似较高，我们对URL的[查询过滤](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)在创建表的[复合主键(UserID，URL)](#a-table-with-a-primary-key)上也不会受益于创建[次级数据跳过索引](./skipping-indexes.md)。

例如，这两个语句在我们表的URL列上创建和填充一个[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)数据跳过索引：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse现在创建了一个额外的索引，每组4个连续的[分片](#data-is-organized-into-granules-for-parallel-data-processing)存储最小和最大URL值（注意上面的`GRANULARITY 4`子句）：

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

第一个索引条目（上图中的“标记0”）存储属于我们表的前4个分片的[行](#data-is-organized-into-granules-for-parallel-data-processing)的最小和最大URL值。

第二个索引条目（“标记1”）存储属于我们表接下来的4个分片的行的最小和最大URL值，依此类推。

（ClickHouse还为[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的分片组创建了一个特殊的[标记文件](#mark-files-are-used-for-locating-granules)）。

由于UserID和URL的基数相似较高，这个次级数据跳过索引无法帮助在执行我们的[查询过滤URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时排除分片的选择。

查询所查找的特定URL值（即'http://public_search'）非常可能在索引为每组分片存储的最小值和最大值之间，从而导致ClickHouse被迫选择这组分片（因为它们可能包含匹配查询的行）。

### 需要使用多个主索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想显著加速过滤特定URL的查询示例，则需要使用优化该查询的主索引。

如果我们还希望保持对过滤特定UserID的示例查询的良好性能，则需要使用多个主索引。

以下展示了实现这一点的方法。

<a name="multiple-primary-indexes"></a>
### 创建附加主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们想显著加速我们的两个示例查询——一个过滤具有特定UserID的行，另一个过滤具有特定URL的行——则需要使用多个主索引，使用以下三种选项之一：

- 创建一个**第二个表**，使用不同的主键。
- 在我们的现有表上创建一个**物化视图**。
- 向我们的现有表添加一个**投影**。

所有这些选项都将有效地将我们的示例数据复制到一个附加表中，以重新组织表的主索引和行排序顺序。

然而，这三种选项在如何透明地将附加表路由到用户查询和插入语句方面有所不同。

创建一个**第二个表**，使用不同的主键时，查询必须明确发送到最适合该查询的表版本，并且新数据必须显式地插入到两个表中，以保持表同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用**物化视图**时，附加表是隐式创建的，并且数据在两个表之间自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而**投影**是最透明的选择，因为除了在数据变化时自动保持隐式创建（并隐藏的）附加表同步外，ClickHouse也将自动选择最有效的表版本来处理查询：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

在下面，我们将更详细地讨论这三种创建和使用多个主索引的选项，并提供实际示例。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### 选项1：次要表 {#option-1-secondary-tables}

<a name="secondary-table"></a>
我们创建一个新的附加表，在主键中交换关键列的顺序（与我们的原始表相比）：

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

将我们[原始表](#a-table-with-a-primary-key)中的887万行全部插入附加表：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

响应如下：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后优化表：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们交换了主键中列的顺序，插入的行如今在磁盘中的字典序存储方式与我们的[原始表](#a-table-with-a-primary-key)相比是不同的，因此该表的1083个分片包含与之前不同的值：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

这是生成的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

现在可用于显著加速我们的示例查询，该查询过滤URL列，以计算在URL "http://public_search"上点击最频繁的前10个用户：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应是：
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

现在，ClickHouse比[几乎执行完整表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)要有效得多地执行该查询。

在[原始表](#a-table-with-a-primary-key)中，UserID是第一个，URL是第二个关键列，ClickHouse在执行此查询时使用了[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)算法，这在UserID和URL的基数相似较高时并不非常有效。

使用URL作为主索引中的第一列，ClickHouse现在在索引标记上运行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二叉搜索</a>。
ClickHouse服务器日志中的对应追踪日志确认了这一点：
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
ClickHouse仅选择了39个索引标记，而不是1176个当时使用通用排除搜索时选择的标记。

请注意，附加表是为加速对`UserIDs`的查询执行而优化的，但对于[原始表](#a-table-with-a-primary-key)的查询结果不佳.

类似于[原始表的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)对我们[示例查询]背后的`UserIDs`的性能并不会很有效，因为UserID现在是该表主索引中的第二个关键列，因此ClickHouse将使用通用排除搜索进行分片选择，而对于UserID和URL的基数相似较高，这并不有效。
打开详细框以获取具体信息。

<details>
    <summary>
    对UserIDs的查询筛选现在具有不佳的性能<a name="query-on-userid-slow"></a>
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

我们现在有两个表。分别优化为加速对`UserIDs`的查询和对URLs的查询。

### 选项2：物化视图 {#option-2-materialized-views}

在我们现有表上创建一个[物化视图](/sql-reference/statements/create/view.md)。
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
- 我们在视图的主键中交换了与我们的[原始表](#a-table-with-a-primary-key)中关键列的顺序。
- 物化视图由一个**隐式创建的表**支持，该表的行顺序和主索引基于给定的主键定义。
- 隐式创建的表由`SHOW TABLES`查询列出，且其名称以`.inner`开头。
- 也可以首先显式创建物化视图的后备表，然后该视图可以通过`TO [db].[table]`[子句](/sql-reference/statements/create/view.md)指向该表。
- 我们使用`POPULATE`关键字以立即用从源表[Hits_UserID_URL](#a-table-with-a-primary-key)的所有887万行填充隐式创建的表。
- 如果新行插入到源表Hits_UserID_URL中，则这些行也会自动插入到隐式创建的表中。
- 实际上，隐式创建的表具有与我们[显式创建的次级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse将隐式创建的表及其主索引（primary.idx）存储在ClickHouse服务器数据目录中的特殊文件夹中：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

隐式创建的表（及其主索引）支持的物化视图现在可以显著加速执行我们的示例查询，过滤URL列：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应是：

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

因为隐式创建的表（及其主索引）实际上与我们显式创建的[次级表相同](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)，因此查询以与显式创建的表相同的有效方式执行。

ClickHouse服务器日志中对应的追踪日志确认ClickHouse正在对索引标记运行二叉搜索：

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

在我们现有表上创建一个投影：
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
- 投影创建一个**隐藏表**，其行顺序和主索引基于投影的给定`ORDER BY`子句。
- 隐藏表不会由`SHOW TABLES`查询列出。
- 我们使用`MATERIALIZE`关键字立即填充隐式创建的表，填充源表[Hits_UserID_URL](#a-table-with-a-primary-key)中的所有887万行。
- 如果新行插入到源表Hits_UserID_URL中，这些行也会自动插入到隐藏表中。
- 查询始终（在语法上）针对源表Hits_UserID_URL，但如果隐藏表的行顺序和主索引允许更有效的查询执行，则将使用隐藏表。
- 请注意，即使ORDER BY与投影的ORDER BY语句匹配，投影也不会使使用ORDER BY的查询更高效（见 https://github.com/ClickHouse/ClickHouse/issues/47333）。
- 实际上，隐式创建的隐藏表具有与我们显式创建的[次级表相同的行顺序和主索引](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse将隐式创建的隐藏表（及其主索引）存储在源表的数据文件、标记文件和主索引文件旁边的特殊文件夹中（在下面的屏幕截图中用橙色标记）：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

投影创建的隐藏表（及其主索引）现在可以（隐式）用于显著加速执行我们的示例查询，过滤URL列。请注意，查询在语法上是针对投影的源表。
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应是：

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

因为隐式创建的隐藏表（及其主索引）与我们显式创建的[次级表相同](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)，查询以与显式创建的表相同的有效方式执行。

ClickHouse服务器日志中的相应追踪日志确认ClickHouse正在对索引标记运行二叉搜索：

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

我们 [复合主键（UserID，URL）的表](#a-table-with-a-primary-key) 的主索引对于加快 [基于 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 非常有用。但是，这个索引在加速基于 URL 的查询上并没有提供显著的帮助，尽管 URL 列是复合主键的一部分。

反之亦然：
我们 [复合主键（URL，UserID）的表](#option-1-secondary-tables) 的主索引对于加快 [基于 URL 的查询](#secondary-key-columns-can-not-be-inefficient) 很有帮助，但对于加快 [基于 UserID 的查询](#the-primary-index-is-used-for-selecting-granules) 支持不大。

由于主键列 UserID 和 URL 的基数相似得很高，基于第二个键列的查询 [没有太大好处，因为第二个键列在索引中的位置](#generic-exclusion-search-algorithm)。

因此，去掉主索引中的第二个键列是合理的（这将减少索引的内存消耗），并且改为 [使用多个主索引](#using-multiple-primary-indexes)。

然而，如果复合主键中的键列在基数上有很大的差异，则 [对查询是有利的](#generic-exclusion-search-algorithm)，按照基数升序排列主键列。

键列之间的基数差异越大，键列在复合主键中的顺序越重要。我们将在下一节中演示这一点。

## 高效排序键列 {#ordering-key-columns-efficiently}

<a name="test"></a>

在复合主键中，键列的顺序可以显著影响：
- 查询中对次键列的过滤效率，以及
- 表的数据文件的压缩比。

为了证明这一点，我们将使用我们的 [网络流量示例数据集](#data-set) 的一个版本，其中每一行包含三个列，指示互联网“用户”（`UserID` 列）对一个 URL（`URL` 列）的访问是否被标记为机器流量（`IsRobot` 列）。

我们将使用一个包含上述所有三个列的复合主键，加速典型的网络分析查询，这些查询计算
- 特定 URL 的流量中有多少（百分比）来自机器，或
- 我们有多大的把握认为特定用户（不）是机器（该用户的流量中有多少百分比（不）被假定为机器人流量）。

我们使用这个查询来计算我们希望用作复合主键中的键列的三个列的基数（注意，我们使用 [URL 表函数](../../sql-reference/table-functions/url.md) 来即时查询 TSV 数据，而不需要创建本地表）。在 `clickhouse client` 中运行这个查询：
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

我们可以看到基数之间存在很大差异，尤其是 URL 和 IsRobot 列之间的差异，因此这些列在复合主键中的顺序对加快对这些列的查询和优化表的列数据文件的压缩比都是重要的。

为了证明这一点，我们为我们的机器人流量分析数据创建两个表版本：
- 表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，我们按基数降序排列键列。
- 表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，我们按基数升序排列键列。

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

并填充 8.87 万行：
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
并用我们用来填充前一个表的同样的 8.87 万行填充它：

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

### 次键列的高效过滤 {#efficient-filtering-on-secondary-key-columns}

当一个查询过滤至少一个作为复合键一部分的列，并且是第一个键列时，[ClickHouse 会在该键列的索引标记上运行二进制搜索算法](#the-primary-index-is-used-for-selecting-granules)。

当查询过滤的仅仅是作为复合键一部分的一个列，但不是第一个键列时，[ClickHouse 会在该键列的索引标记上使用通用排除搜索算法](#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中键列的顺序对 [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的有效性是重要的。

这是一个过滤表中 `UserID` 列的查询，我们按基数降序排列键列 `(URL, UserID, IsRobot)`：
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

这是在我们按基数升序排列键列 `(IsRobot, UserID, URL)` 的表上的相同查询：
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

我们可以看到，在按基数升序排列键列的表上，查询执行显著更有效和更快。

原因在于， [通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 在 [Granules](#the-primary-index-is-used-for-selecting-granules) 通过第二个键列选择时，前一个键列的基数较低时工作最为高效。在本指南的 [前一节](#generic-exclusion-search-algorithm) 中我们详细说明了这一点。

### 数据文件的最佳压缩比 {#optimal-compression-ratio-of-data-files}

此查询比较我们上面创建的两个表中 `UserID` 列的压缩比：

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

我们可以看到，在按基数升序排列键列的表上，`UserID` 列的压缩比显著更高。

虽然这两个表中存储了完全相同的数据（我们在两个表中都插入了 8.87 万行），但复合主键中键列的顺序对表 [列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) 中压缩数据所需的磁盘空间有显著影响：
- 在复合主键为 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot` 中，我们按基数降序排列键列，该 `UserID.bin` 数据文件占用 **11.24 MiB** 磁盘空间。
- 在复合主键为 `(IsRobot, UserID, URL)` 的表 `hits_IsRobot_UserID_URL` 中，我们按基数升序排列键列，该 `UserID.bin` 数据文件仅占用 **877.47 KiB** 磁盘空间。

保持表中列在磁盘上的数据具有良好的压缩比，不仅可以节省磁盘空间，还可以加快需要从该列读取数据的查询（特别是分析查询），因为将列数据从磁盘移动到主内存（操作系统的文件缓存）所需的 I/O 更少。

以下将说明为何按基数升序排列主键列对表中列的压缩比是有利的。

下图展示了按基数升序排列的主键的行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

我们讨论过 [表的行数据是按主键列的顺序存储在磁盘上的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表的行（它们在磁盘上的列值）首先按其 `cl` 值排序，具有相同 `cl` 值的行按其 `ch` 值排序。而且由于第一个键列 `cl` 的基数低，很可能会有具有相同 `cl` 值的行。由于这个原因，`ch` 值在（对于具有相同 `cl` 值的行）局部有序也是很可能的。

如果在某列中，相似的数据被彼此靠近放置，例如通过排序，那么该数据将会得到更好的压缩。
一般来说，压缩算法有利于数据的运行长度（它看到的数据越多，压缩越好）和局部性（数据越相似，压缩比越好）。

与上述图相对的是，下面的图展示了按基数降序排列的主键的行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

现在，表的行首先按其 `ch` 值排序，具有相同 `ch` 值的行按其 `cl` 值排序。
但是，由于第一个键列 `ch` 的基数高，很难有具有相同 `ch` 值的行。因此，也不太可能在（对于具有相同 `ch` 值的行）局部有序的 `cl` 值。

因此，`cl` 值更可能是随机顺序，因此具有较差的局部性，压缩比也会较低。

### 摘要 {#summary-1}

对于次键列查询的高效过滤和表的列数据文件的压缩比，按基数升序排列主键中的列是有利的。

### 相关内容 {#related-content-1}
- 博客: [超级充电你的 ClickHouse 查询](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## 高效识别单行 {#identifying-single-rows-efficiently}

虽然一般来说 [这不是](https://knowledgebase/key-value) ClickHouse 的最佳用例，但有时构建在 ClickHouse 之上的应用程序需要识别 ClickHouse 表的单行。

对于此类情况，一个直观的解决方案可能是使用一个每行都有唯一值的 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，并将该列作为主键列以快速检索行。

为了获得最快的检索，UUID 列 [需要是第一个键列](#the-primary-index-is-used-for-selecting-granules)。

我们讨论过，因为 [ClickHouse 表的行数据是按主键列的顺序存储在磁盘上的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中含有非常高基数的列（比如 UUID 列）会对其他表列的压缩比 [产生不利影响](#optimal-compression-ratio-of-data-files)。

快速检索与最佳数据压缩之间的折衷是使用一个复合主键，其中 UUID 是最后一个键列，位于使用较低基数键列的后面，以确保某些表列的良好压缩比。

### 一个具体例子 {#a-concrete-example}

一个具体的例子是明文粘贴服务 [https://pastila.nl](https://pastila.nl)，这是 Alexey Milovidov 开发和 [写博客](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/) 的。

每当文本区域发生变化时，数据就会自动存储到 ClickHouse 表的行中（每次更改一行）。

识别和检索（特定版本的）粘贴内容的一种方法是使用内容的哈希作为包含内容的表行的 UUID。

下面的图示显示了
- 内容变化时（例如因为输入文本的按键）行的插入顺序，以及
- 使用 `PRIMARY KEY (hash)` 时插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

由于 `hash` 列用作主键列
- 特定行可以 [非常快速地检索](#the-primary-index-is-used-for-selecting-granules)，但
- 表的行（它们的列数据）在磁盘上的存储顺序是按（唯一且随机的）哈希值升序排列。因此，内容列的值以随机顺序存储，没有数据局部性，从而导致 **内容列数据文件的压缩比不理想**。

为了显著提高内容列的压缩比，同时仍能快速检索特定行，pastila.nl 使用两个哈希（和一个复合主键）来识别特定行：
- 上面讨论的内容的哈希，对于不同的数据是独特的，以及
- 一个 [局部敏感哈希（指纹）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，即使数据发生小变动也不会变化。

下面的图示显示了
- 内容变化时（例如由于输入文本的按键）行的插入顺序，以及
- 使用复合 `PRIMARY KEY (fingerprint, hash)` 时插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

现在，磁盘上的行首先按 `fingerprint` 排序，对于具有相同指纹值的行，哈希值决定最终顺序。

由于仅发生小变化的数据会获得相同的指纹值，因此相似的数据现在在内容列中以接近的方式存储在磁盘上。这种变化对内容列的压缩比非常有利，因为压缩算法通常受益于数据的局部性（数据越相似，压缩比越好）。

折衷在于为了最佳利用由复合 `PRIMARY KEY (fingerprint, hash)` 生成的主索引，需要两个字段（`fingerprint` 和 `hash`）来检索特定行。
