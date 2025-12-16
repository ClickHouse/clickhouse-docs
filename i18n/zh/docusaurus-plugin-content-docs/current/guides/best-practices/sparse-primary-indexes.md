---
sidebar_label: '主键索引'
sidebar_position: 1
description: '在本指南中，我们将深入探讨 ClickHouse 的索引机制。'
title: 'ClickHouse 主键索引实用入门指南'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['主键索引', '索引', '性能', '查询优化', '最佳实践']
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


# ClickHouse 主索引实用入门指南 {#a-practical-introduction-to-primary-indexes-in-clickhouse}

## 介绍 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引。我们会通过示例并详细讨论：

- [ClickHouse 中的索引与传统关系型数据库管理系统中的索引有何不同](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建并使用表的稀疏主索引](#a-table-with-a-primary-key)
- [在 ClickHouse 中进行索引的一些最佳实践](#using-multiple-primary-indexes)

你也可以选择在本地机器上自行执行本指南中给出的所有 ClickHouse SQL 语句和查询。
关于 ClickHouse 的安装和入门说明，请参阅[快速开始](/get-started/quick-start)。

:::note
本指南重点介绍 ClickHouse 的稀疏主索引。

关于 ClickHouse 的[二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅[教程](/guides/best-practices/skipping-indexes.md)。
:::

### 数据集 {#data-set}

在本指南中，我们将使用一个示例匿名 Web 流量数据集。

- 我们将使用该示例数据集中的一个子集，共 887 万行（事件）。
- 未压缩的数据大小为 887 万个事件，大约 700 MB。在 ClickHouse 中存储时可压缩到约 200 MB。
- 在我们的子集中，每一行包含三列，表示某个互联网用户（`UserID` 列）在某个特定时间（`EventTime` 列）点击了某个 URL（`URL` 列）。

仅凭这三列，我们就可以构造一些典型的 Web 分析查询，例如：

- “对于某个特定用户，点击次数最多的前 10 个 URL 是哪些？”
- “最频繁点击某个特定 URL 的前 10 个用户是谁？”
- “在哪些时间（例如一周中的哪几天），某个用户点击某个特定 URL 最频繁？”

### 测试机器 {#test-machine}

本文档中给出的所有运行时数据均基于在一台配备 Apple M1 Pro 芯片和 16GB 内存的 MacBook Pro 上本地运行 ClickHouse 22.2.1 时的测试结果。

### 全表扫描 {#a-full-table-scan}

为了了解在没有主键的情况下查询是如何在数据集上执行的，我们执行下面的 SQL DDL 语句来创建一张使用 MergeTree 表引擎的表：

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

接下来，使用以下 SQL INSERT 语句将 hits 数据集的一个子集插入到表中。
这里通过 [URL 表函数](/sql-reference/table-functions/url.md) 从托管在 clickhouse.com 上的完整数据集中远程加载一个子集：


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

返回结果为：

```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse 客户端的结果输出显示，上述语句向该表中插入了 887 万行数据。

最后，为了简化本指南后续的讨论，并使图示和结果具有可复现性，我们使用 FINAL 关键字对该表执行 [optimize](/sql-reference/statements/optimize.md) 操作：


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般来说，在将数据加载到表之后，不需要也不建议立即对其进行优化。为什么在本示例中需要这样做，稍后就会变得清楚。
:::

现在我们来执行第一个 Web 分析查询。下面的查询会计算出，对 UserID 为 749927693 的互联网用户来说，点击次数最多的前 10 个 URL：

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
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

10 rows in set. Elapsed: 0.022 sec.
# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse 客户端的结果输出表明，ClickHouse 执行了一次全表扫描！我们表中 887 万行数据的每一行都被流式传入 ClickHouse，这在扩展性上行不通。

为了让这个过程（大幅）更高效、（显著）更快速，我们需要使用一个带有适当主键的表。这样 ClickHouse 就能够基于主键列自动创建一个稀疏主键索引，从而显著加速我们示例查询的执行。


## ClickHouse 索引设计 {#clickhouse-index-design}

### 面向海量数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系型数据库管理系统中，主索引会为表中的每一行数据保留一个条目。对于我们的数据集，这意味着主索引中将包含 887 万个条目。这样的索引可以快速定位特定行，从而使查找查询和点更新的效率很高。在 `B(+)-Tree` 数据结构中查找一个条目，其平均时间复杂度为 `O(log n)`；更精确地说，是 `log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是被索引的行数。由于 `b` 通常在数百到数千之间，`B(+)-Trees` 结构非常浅，仅需少量磁盘寻道即可定位记录。在有 887 万行且分支因子为 1000 的情况下，平均只需要 2.3 次磁盘寻道。这种能力是有代价的：需要额外的磁盘和内存开销，在向表中插入新行并向索引添加条目时插入成本更高，有时还需要对 B-Tree 进行重新平衡。

鉴于 B-Tree 索引相关的这些挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse 的 [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) 被设计并优化用于处理海量数据。这些表可以每秒接收数百万行插入，并存储非常大的数据量（数百 PB 级别）。数据会被快速写入表中，[以分区片段为单位](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)，并在后台根据规则合并这些分区片段。在 ClickHouse 中，每个分区片段都有自己的主索引。当分区片段被合并时，合并后的分区片段的主索引也会一并合并。在 ClickHouse 所面向的超大规模场景下，极高的磁盘和内存效率至关重要。因此，主索引并不是为每一行建立索引，而是为每组行（称为 “granule”）建立一个索引条目（称为 “mark”）——这种技术称为 **稀疏索引**。

稀疏索引之所以可行，是因为 ClickHouse 会按主键列的顺序在磁盘上存储某个分区片段的行。稀疏主索引并不像基于 B-Tree 的索引那样直接定位单行，而是通过对索引条目执行二分查找来快速确定哪些行组可能匹配查询。然后，这些被定位到的、潜在匹配的行组（granule）会被并行流式传入 ClickHouse 引擎，以查找实际匹配的数据。这种索引设计使得主索引可以很小（它可以并且必须完全放入主内存中），同时仍能显著加速查询执行时间，尤其是对数据分析场景中典型的范围查询。

下面将详细说明 ClickHouse 如何构建和使用其稀疏主索引。本文稍后还会讨论在构建索引（主键列）时如何选择、移除以及排序表列的一些最佳实践。

### 包含主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键的表，主键由 UserID 和 URL 列组成：

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
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # "<details open>"

<details>
  <summary>
    DDL 语句详情
  </summary>

  <p>
    为了简化本指南后续的讨论，并使图示和结果可复现，这条 DDL 语句：

    <ul>
      <li>
        通过 <code>ORDER BY</code> 子句为表指定了一个复合排序键。
      </li>

      <li>
        通过如下设置显式控制主索引将拥有多少个索引项：

        <ul>
          <li>
            <code>index&#95;granularity</code>：显式设置为其默认值 8192。这意味着每组 8192 行会在主索引中对应一个索引项。比如，如果表包含 16384 行，索引将有两个索引项。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>：设置为 0 以禁用<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着，当以下任一条件为真时，ClickHouse 会自动为一组 n 行创建一个索引项：

            <ul>
              <li>
                如果 <code>n</code> 小于 8192，且这 <code>n</code> 行合并后的行数据总大小大于或等于 10 MB（<code>index&#95;granularity&#95;bytes</code> 的默认值）。
              </li>

              <li>
                如果这 <code>n</code> 行合并后的行数据总大小小于 10 MB，但 <code>n</code> 为 8192。
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>：设置为 0 以禁用<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引压缩</a>。这将允许我们在需要时稍后查看其内容。
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

上面 DDL 语句中的主键会基于指定的两个键列创建主索引。

<br />

接下来插入数据：


```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

响应类似如下：

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

并对该表进行优化：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

我们可以使用以下查询来获取我们表的元数据：


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

返回结果：

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

* 表的数据以[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)存储在磁盘上的一个特定目录中，这意味着在该目录中，每个表列都会有一个数据文件（以及一个 mark 文件）。
* 该表包含 8.87 百万行。
* 所有行未压缩的数据总大小为 733.28 MB。
* 所有行在磁盘上的压缩后总大小为 206.94 MB。
* 该表有一个主索引，其中包含 1083 个条目（称为“marks”），索引大小为 96.93 KB。
* 合计来看，表的数据文件、mark 文件和主索引文件在磁盘上一共占用 207.07 MB。


### 数据在磁盘上按照主键列的顺序存储 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们在上面创建的表具有：

- 一个复合[主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`，以及
- 一个复合[排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

- 如果只指定了排序键，那么主键会被隐式地定义为与排序键相同。

- 为了节省内存，我们显式指定了一个仅包含查询过滤所用列的主键。基于该主键的主索引会被完整加载到内存中。

- 为了在本指南的示意图中保持一致性，并最大化压缩比，我们定义了一个单独的排序键，它包含了表的所有列（如果在某一列中相似数据彼此排列得更近，例如通过排序实现，那么这些数据会被压缩得更好）。

- 当同时指定主键和排序键时，主键必须是排序键的前缀。
:::

插入的行会按照主键列（以及来自排序键的额外 `EventTime` 列）以字典序（升序）存储在磁盘上。

:::note
ClickHouse 允许插入多行具有相同主键列值的数据。在这种情况下（见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此由 `EventTime` 列的值决定。
:::

ClickHouse 是一个<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">列式数据库管理系统</a>。如下图所示：

- 在磁盘上的物理存储中，每个表列对应一个数据文件（*.bin），该列的所有值都以<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>格式存储；并且
- 这 887 万行数据在磁盘上按照主键列（以及额外的排序键列）的字典序升序存储，即在本例中：
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="稀疏主索引 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是磁盘上的数据文件，其中分别存储了 `UserID`、`URL` 和 `EventTime` 列的值。

:::note

- 由于主键定义了磁盘上行的字典序，因此一张表只能有一个主键。

- 我们从 0 开始为行编号，以与 ClickHouse 内部使用、同时也用于日志消息的行编号方案保持一致。
:::

### 数据被组织为 granule 以支持并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，一个表的列值在逻辑上被划分为多个 granule。
granule 是以流式方式传入 ClickHouse 进行数据处理的最小不可再分的数据集。
这意味着 ClickHouse 不是逐行读取，而是始终以流式且并行的方式读取一整组（granule）行。
:::note
列值在物理上并不是存储在 granule 之内的：granule 只是为了查询处理而对列值进行的一种逻辑组织形式。
:::

下图展示了我们表中 887 万行（的列值）
是如何被组织成 1083 个 granule 的，这是由于表的 DDL 语句中包含了 `index_granularity` 这一设置项（其默认值为 8192）。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

第一批（基于磁盘上的物理顺序）8192 行（它们的列值）在逻辑上属于 granule 0，接下来的 8192 行（它们的列值）属于 granule 1，依此类推。

:::note

- 最后一个 granule（granule 1082）“包含”的行数少于 8192。

- 我们在本指南开头的 “DDL Statement Details” 中提到过，我们禁用了 [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1)（这是为了简化本指南中的讨论，并使图示和结果可复现）。

  因此，在我们的示例表中，除最后一个 granule 外，所有 granule 的大小都相同。

- 对于启用 adaptive index granularity 的表（默认情况下索引粒度是自适应的，参见[此处](/operations/settings/merge-tree-settings#index_granularity_bytes)），某些 granule 的大小可能会小于 8192 行，这取决于每行数据的大小。

- 我们用橙色标记了主键列（`UserID`、`URL`）中的一些列值。
  这些橙色标记的列值是每个 granule 的第一行对应的主键列值。
  正如我们稍后会看到的，这些橙色标记的列值将成为表主索引中的条目。

- 我们从 0 开始为 granule 编号，是为了与 ClickHouse 内部的编号方案保持一致，该编号方案也用于日志消息。
:::

### 主索引对每个粒度都有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上图所示的粒度创建的。该索引是一个未压缩的平面数组文件（primary.idx），其中包含从 0 开始的数字索引标记。

下图显示，该索引为每个粒度的第一行存储主键列值（上图中用橙色标记的那些值）。
换句话说：主索引存储的是表中每隔 8192 行的主键列值（基于由主键列定义的物理行顺序）。
例如：

- 第一个索引条目（下图中的 “mark 0”）存储的是上图中粒度 0 的第一行的键列值，
- 第二个索引条目（下图中的 “mark 1”）存储的是上图中粒度 1 的第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

总体而言，对于我们这个拥有 887 万行和 1083 个粒度的表，索引共有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note

- 对于启用了[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，主索引中还会额外存储一个“最终”标记，用于记录表最后一行的主键列值。但由于我们关闭了自适应索引粒度（这样做是为了简化本指南中的讨论，并使图示和结果可复现），所以我们示例表的索引中不包含这个最终标记。

- 主索引文件会被完整加载到主内存中。如果该文件大于可用的空闲内存空间，ClickHouse 将报错。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自管理的 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 来检查示例表主索引的内容。

为此，我们首先需要将主索引文件复制到正在运行集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>步骤 1：获取包含主索引文件的分区片段路径（part path）</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>步骤 2：获取 user_files_path</li>
Linux 上的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 为
`/var/lib/clickhouse/user_files/`

在 Linux 上可以通过以下命令检查它是否被修改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上，该路径为 `/Users/tomschreiber/Clickhouse/user_files/`

<li>步骤 3：将主索引文件复制到 user_files_path 中</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
现在我们可以通过 SQL 查询检查主索引的内容：
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
这与我们示例表主索引内容的示意图完全一致：

</p>
</details>

主键条目被称为索引标记（index mark），因为每个索引条目都标记了一个特定数据范围的起始位置。具体到这个示例表：

- UserID 索引标记：

  主索引中存储的 `UserID` 值按升序排序。<br/>
  因此，上图中的 “mark 1” 表明：在 granule 1 中以及后续所有 granule 中，所有表行的 `UserID` 值都保证大于或等于 4.073.710。

[正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules)，当查询在主键第一列上进行过滤时，这种全局有序性使 ClickHouse 能够在第一键列的索引标记上<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分查找算法</a>。

- URL 索引标记：

  主键列 `UserID` 和 `URL` 的基数非常相近，
  这意味着，除第一个键列外的其他所有键列的索引标记，一般只有在前一个键列的值在至少当前 granule 内所有表行中都保持不变时，才能实际指示一个数据范围。<br/>
  例如，由于上图中 mark 0 和 mark 1 的 UserID 值不同，ClickHouse 不能假设 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是，如果上图中 mark 0 和 mark 1 的 UserID 值相同（意味着 granule 0 中所有表行的 UserID 值都相同），那么 ClickHouse 就可以假设 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们将在后文更详细地讨论这对查询执行性能的影响。

### 主键索引用于选择数据粒度 {#the-primary-index-is-used-for-selecting-granules}

现在我们可以在主键索引的支持下执行查询。

下列查询会计算出 UserID 749927693 点击次数最多的前 10 个 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

响应如下：

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

ClickHouse 客户端的输出现在显示，不再执行整表扫描，而是仅有 8.19 千行被流式写入 ClickHouse。

如果启用了<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace 日志</a>，那么 ClickHouse 服务器日志文件会显示，ClickHouse 正在对 1083 个 UserID 索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以定位那些可能包含 UserID 列值为 `749927693` 的行的 granule。这个过程需要 19 步，时间复杂度平均为 `O(log2 n)`：

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

我们可以在上面的 trace 日志中看到，在现有的 1083 个 mark 中，有一个 mark 符合该查询条件。

<details>
  <summary>
    Trace 日志详情
  </summary>

  <p>
    确定了 Mark 176（“found left boundary mark”为包含边界，“found right boundary mark”为不包含边界），因此会将 granule 176 中的全部 8192 行（从第 1,441,792 行开始——我们将在本指南后面看到这一点）流式读取到 ClickHouse 中，以便找到实际满足 `UserID` 列值为 `749927693` 的那些行。
  </p>
</details>

我们也可以通过在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来复现这一点：

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

客户端输出显示，在 1083 个粒度中，有 1 个被选中，被认为可能包含 `UserID` 列值为 `749927693` 的行。

:::note 结论
当查询对一个复合键中且位于首位的列进行过滤时，ClickHouse 会在该键列的索引标记上执行二分查找算法。
:::

<br />

如上所述，ClickHouse 使用其稀疏主键索引，通过二分查找快速选择那些可能包含满足查询条件行的粒度。

这是 ClickHouse 查询执行的**第一阶段（粒度选择）**。

在**第二阶段（数据读取）**中，ClickHouse 会定位已选中的粒度，将这些粒度中的所有行流式传入 ClickHouse 引擎，以找到真正满足查询条件的行。

我们会在下一节中更详细地讨论第二阶段。


### 标记文件用于定位粒度 {#mark-files-are-used-for-locating-granules}

下图展示了我们这张表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="稀疏主索引 04" background="white"/>

如上文所述，通过对索引中 1083 个 UserID 标记执行二分查找，找到了标记 176。相应的粒度 176 因此可能包含 `UserID` 列值为 749.927.693 的行。

<details>
    <summary>
    粒度选择细节
    </summary>
    <p>

上图显示，标记 176 是第一个索引条目，它同时满足：与之关联的粒度 176 的最小 UserID 值小于 749.927.693，并且下一个标记（标记 177）对应的粒度 177 的最小 UserID 值大于该值。因此，只有标记 176 对应的粒度 176 可能包含 `UserID` 列值为 749.927.693 的行。
</p>
</details>

为了确认粒度 176 中是否存在某些行包含 `UserID` 列值 749.927.693，需要将该粒度所属的全部 8192 行流式读取到 ClickHouse 中。

为此，ClickHouse 需要知道粒度 176 的物理位置。

在 ClickHouse 中，我们这张表所有粒度的物理位置都存储在标记文件中。与数据文件类似，每个表列对应一个标记文件。

下图展示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`，它们存储了表中 `UserID`、`URL` 和 `EventTime` 列各自粒度的物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="稀疏主索引 05" background="white"/>

我们已经讨论过，主索引是一个扁平的未压缩数组文件（`primary.idx`），其中包含从 0 开始编号的索引标记。

类似地，标记文件也是一个扁平的未压缩数组文件（`*.mrk`），其中包含从 0 开始编号的标记。

一旦 ClickHouse 已经为某个粒度识别并选中了可能包含查询匹配行的索引标记，就可以在标记文件中按位置在数组中查找，以获得该粒度的物理位置。

每个特定列的标记文件条目以偏移量的形式存储两个位置：

- 第一个偏移量（上图中的 `block_offset`）定位到 <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块（block）</a> 在<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件中的位置，该块包含所选粒度的压缩版本。该压缩块可能包含多个压缩粒度。被定位到的压缩文件块在读取时会被解压到内存中。

- 第二个偏移量（上图中的 `granule_offset`）来自标记文件，提供粒度在未压缩块数据中的位置。

随后，属于定位到的未压缩粒度的全部 8192 行会被流式读取到 ClickHouse 中进行后续处理。

:::note

- 对于使用[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且未启用[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse 会使用如上图所示的 `.mrk` 标记文件，其中每个条目包含两个 8 字节长的地址。这些条目是粒度的物理位置，且所有粒度大小相同。

索引粒度在[默认情况](/operations/settings/merge-tree-settings#index_granularity_bytes)下是自适应的，但在我们的示例表中，我们禁用了自适应索引粒度（以便简化本指南中的讨论，并使图示和结果可复现）。我们的表使用宽格式，是因为数据大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（对于自管理集群，默认值为 10 MB）。

- 对于使用宽格式且启用了自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，它们与 `.mrk` 标记文件类似，但每个条目多了一个第三个值：当前条目关联的粒度所包含的行数。

- 对于使用[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse 使用 `.mrk3` 标记文件。

:::

:::note 为什么需要标记文件

为什么主键索引不直接包含与索引标记对应的粒度的物理位置？

因为在 ClickHouse 所设计应对的那种超大规模场景中，磁盘和内存的高效利用非常重要。

主键索引文件必须能放入主内存中。

对于我们的示例查询，ClickHouse 使用主键索引并选择了一个可能包含与查询匹配行的粒度。只有对于这个粒度，ClickHouse 才需要物理位置信息，以便流式读取对应的行进行后续处理。

此外，这些偏移量信息只需要针对 UserID 和 URL 列。

对于未在查询中使用的列（例如 `EventTime`），则不需要偏移量信息。

对于我们的示例查询，ClickHouse 只需要 UserID 数据文件（UserID.bin）中粒度 176 的两个物理位置偏移量，以及 URL 数据文件（URL.bin）中粒度 176 的两个物理位置偏移量。

通过标记文件提供的这层间接性，可以避免在主键索引内部直接为所有 1083 个粒度和所有三列存储物理位置信息条目，从而避免在主内存中存放不必要的（潜在不会被使用的）数据。
:::

下图和后续文字说明了对于我们的示例查询，ClickHouse 是如何在 UserID.bin 数据文件中定位粒度 176 的。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们在本指南前面已经讨论过，ClickHouse 选择了主键索引标记 176，因此选择了粒度 176 作为可能包含与查询匹配行的粒度。

ClickHouse 现在使用索引中选定的标记号（176），在 UserID.mrk 标记文件中进行基于位置的数组查找，以获取定位粒度 176 所需的两个偏移量。

如图所示，第一个偏移量用于定位 UserID.bin 数据文件中的压缩文件块，该文件块中包含了粒度 176 的压缩版本。

一旦定位到的文件块被解压到主内存中，就可以使用来自标记文件的第二个偏移量，在未压缩数据中定位粒度 176。

为了执行我们的示例查询（对于 UserID 为 749.927.693 的互联网用户，获取被点击次数最多的前 10 个 URL），ClickHouse 需要从 UserID.bin 数据文件和 URL.bin 数据文件中定位并流式读取粒度 176 的所有值。

上图展示了 ClickHouse 如何在 UserID.bin 数据文件中定位该粒度。

与此同时，ClickHouse 正在对 URL.bin 数据文件中的粒度 176 执行同样的操作。两个对应的粒度会对齐后被流式输入 ClickHouse 引擎进行后续处理，即对所有 UserID 为 749.927.693 的行按组聚合并统计 URL 值，最后输出计数最高的 10 个 URL 分组，并按计数降序排列。

## 使用多列主索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### 次级键列可能（并不）低效 {#secondary-key-columns-can-not-be-inefficient}

当一个查询在一个复合键中对首个键列进行过滤时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当一个查询在一个复合键中对某个键列进行过滤，而该列并不是首个键列时，会发生什么？

:::note
我们讨论的是这样一种场景：查询明确没有对首个键列进行过滤，而是对某个次级键列进行过滤。

当一个查询同时在首个键列以及其后的任意键列上进行过滤时，ClickHouse 会在首个键列的索引标记上运行二分查找。
:::

<br />

<br />

<a name="query-on-url" />

我们使用一个查询来统计点击 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 最频繁的前 10 个用户：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

返回结果为：<a name="query-on-url-slow" />

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

客户端输出表明，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse 仍然几乎执行了全表扫描！在该表总计 887 万行数据中，ClickHouse 读取了 881 万行。

如果启用了 [trace&#95;logging](/operations/server-configuration-parameters/settings#logger)，那么 ClickHouse 服务器日志文件会显示，ClickHouse 对 1083 个 URL 索引标记执行了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>，以识别那些可能包含 URL 列值为 &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的数据粒度中对应的行：

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

从上面的示例跟踪日志中我们可以看到，在 1083 个 granule 中，有 1076 个 granule（根据索引标记）被选为可能包含具有匹配 URL 值的行。

这会导致 881 万行数据被流式传入 ClickHouse 引擎中（通过 10 个流并行处理），以便识别哪些行实际上包含 URL 值 &quot;[http://public&#95;search&quot;。](http://public\&#95;search\&quot;。)

然而，我们稍后会看到，在选中的 1076 个 granule 中，实际上只有 39 个 granule 包含匹配的行。

虽然基于复合主键 (UserID, URL) 的主索引对于加速按特定 UserID 值过滤行的查询非常有用，但该索引对于加速按特定 URL 值过滤行的查询并没有提供显著的帮助。

其原因在于，URL 列不是第一个键列，因此 ClickHouse 在 URL 列的索引标记上使用的是通用排除搜索算法（而不是二分搜索），并且**该算法的有效性依赖于** URL 列与其前置键列 UserID 之间的基数差异。

为了说明这一点，我们将给出一些关于通用排除搜索工作机制的细节。

<a name="generic-exclusion-search-algorithm" />


### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

下面通过一个示例说明，当通过一个次要列选择颗粒（granule），而其前置键列具有较低或较高基数时，<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse 通用排除搜索算法</a>是如何工作的。

作为这两种情况的示例，我们做如下假设：

- 查询正在搜索 URL 值为 "W3" 的行。
- 一个抽象化的 hits 表，其中 UserID 和 URL 的值被简化。
- 索引使用相同的复合主键 (UserID, URL)。这意味着行首先按 UserID 值排序，具有相同 UserID 值的行再按 URL 排序。
- 颗粒大小为 2，即每个颗粒包含两行。

在下图中，我们用橙色标出了每个颗粒中第一行的键列值。

**前置键列具有较低基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 具有较低基数。在这种情况下，同一个 UserID 值很可能分布在多个表行和颗粒以及对应的索引标记上。对于具有相同 UserID 的索引标记，这些索引标记的 URL 值按升序排序（因为表行先按 UserID 再按 URL 排序）。这允许进行如下所述的高效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

在上图中，对于我们的抽象示例数据，颗粒选择过程有三种不同情况：

1. 对于索引标记 0，**其 URL 值小于 W3，且其直接后继索引标记的 URL 值也小于 W3**，可以被排除，因为标记 0 和 1 具有相同的 UserID 值。注意，这个排除的前提条件确保颗粒 0 完全由 UserID 为 U1 的行组成，因此 ClickHouse 可以假定颗粒 0 中的最大 URL 值也小于 W3，从而排除该颗粒。

2. 对于索引标记 1，**其 URL 值小于（或等于）W3，且其直接后继索引标记的 URL 值大于（或等于）W3**，则会被选中，因为这意味着颗粒 1 可能包含 URL 为 W3 的行。

3. 对于索引标记 2 和 3，**其 URL 值大于 W3**，则可以被排除，因为主索引的索引标记存储的是每个颗粒第一行的键列值，且表行在磁盘上按键列值排序，因此颗粒 2 和 3 不可能包含 URL 值为 W3 的行。

**前置键列具有较高基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 具有较高基数时，同一个 UserID 值分布在多个表行和颗粒上的情况就不太可能出现。这意味着索引标记上的 URL 值不再单调递增：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

如上图所示，所有 URL 值小于 W3 的索引标记都会被选中，用于将其关联颗粒中的行以流式方式传入 ClickHouse 引擎。

这是因为虽然图中的所有索引标记都符合前面所述的场景 1，但它们不满足前面提到的那个排除前提条件，即*直接后继索引标记的 UserID 值与当前标记相同*，因此无法被排除。

例如，考虑索引标记 0，**其 URL 值小于 W3，且其直接后继索引标记的 URL 值也小于 W3**。它*不能*被排除，因为其直接后继索引标记 1 的 UserID 值*不*与当前标记 0 相同。

这最终使得 ClickHouse 无法对颗粒 0 中的最大 URL 值做出任何假设。相反，它必须假定颗粒 0 可能包含 URL 值为 W3 的行，因此被迫选择标记 0。

标记 1、2 和 3 也同样属于这种情况。

:::note 结论
当查询在一个属于复合键但不是第一个键列的列上进行过滤时，ClickHouse 会使用<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a>来替代<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索算法</a>，而这种通用排除搜索算法在前一个键列的基数较低时最为有效。
:::

在我们的示例数据集中，两个键列（UserID、URL）都具有类似的高基数，而且如前所述，当 URL 列的前一个键列具有较高或类似的基数时，通用排除搜索算法的效果并不理想。

### 关于 data skipping index 的说明 {#note-about-data-skipping-index}

由于 UserID 和 URL 都具有相近的高基数，我们在[按 URL 过滤查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时，即使在 URL 列上创建一个[二级 data skipping index](./skipping-indexes.md)，
对于这张[主键为复合键 (UserID, URL) 的表](#a-table-with-a-primary-key)来说，带来的收益也不会太大。

例如，下面这两个语句会在这张表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index：

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse 此时创建了一个额外的索引，它按每组 4 个连续的[粒度单元](#data-is-organized-into-granules-for-parallel-data-processing)（注意上面的 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句）存储该组内 URL 的最小值和最大值：

<Image img={sparsePrimaryIndexes13a} size="md" alt="稀疏主索引 13a" background="white" />

第一个索引项（上图中的“mark 0”）存储了[属于我们表中前 4 个粒度单元的行](#data-is-organized-into-granules-for-parallel-data-processing)的 URL 最小值和最大值。

第二个索引项（“mark 1”）存储了属于我们表中接下来 4 个粒度单元的行的 URL 最小值和最大值，依此类推。

（ClickHouse 还为数据跳过索引创建了一个特殊的[标记文件](#mark-files-are-used-for-locating-granules)，用于[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的粒度单元分组。）

由于 UserID 和 URL 都具有类似的高基数，这个次级数据跳过索引在执行[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时，无法帮助排除被选中的粒度单元。

查询要查找的特定 URL 值（即 &#39;[http://public&#95;search&#39;）很可能位于索引为每组粒度单元存储的最小值和最大值之间，这样](http://public\&#95;search\&#39;）很可能位于索引为每组粒度单元存储的最小值和最大值之间，这样) ClickHouse 就不得不选择这组粒度单元（因为它们可能包含与查询匹配的行）。


### 需要使用多个主键索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想要显著加速针对特定 URL 进行过滤的示例查询，就需要使用一个专门为该查询优化的主键索引。

如果还希望在此基础上保持针对特定 UserID 进行过滤的示例查询的良好性能，那么我们就需要使用多个主键索引。

下面将介绍几种实现这一目标的方法。

<a name="multiple-primary-indexes"></a>

### 创建额外主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们想要显著加速这两个示例查询——一个是按特定 UserID 过滤行，另一个是按特定 URL 过滤行——那么我们需要使用多个主索引，可以通过以下三种方式之一来实现：

- 创建一张具有不同主键的**第二张表**。
- 在现有表上创建一个 **materialized view**。
- 向现有表添加一个 **projection**。

这三种方式都会实质上将我们的示例数据复制到一张额外的表中，以便重新组织表的主索引和行的排序顺序。

不过，这三种方式在额外表对用户的透明度方面有所不同，特别是在查询与插入语句如何被路由到这些表上这一点上。

当创建一张具有不同主键的**第二张表**时，查询必须显式地发送到最适合该查询的表版本，并且为了保持两张表的数据同步，新的数据也必须显式地插入到这两张表中：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用 **materialized view** 时，额外的表会被隐式创建，并且两张表之间的数据会自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而 **projection** 是透明度最高的选项，因为除了自动使隐式创建（且隐藏）的额外表与数据变更保持同步之外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

在接下来的内容中，我们将结合真实示例更详细地讨论这三种创建和使用多个主索引的方式。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### 选项 1：次级表 {#option-1-secondary-tables}

<a name="secondary-table" />

我们将创建一个新的次级表，在该表的主键中调换键列的顺序（相对于原始表）：

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
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

将我们[原始表](#a-table-with-a-primary-key)中的全部 887 万行插入到这个辅助表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

响应如下所示：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后，优化该表：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们调整了主键中列的顺序，插入的行现在在磁盘上的字典序与[原始表](#a-table-with-a-primary-key)不同，因此该表的 1083 个 granule（数据粒度单元）中所包含的值也发生了变化：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

这是生成的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

现在就可以利用它，大幅加速我们示例查询的执行：该查询在 URL 列上进行过滤，用于计算对 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 点击最频繁的前 10 个用户：

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

返回结果为：

<a name="query-on-url-fast" />

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

现在，ClickHouse 不再[几乎对整张表进行扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)，而是更加高效地执行了该查询。

在[原始表](#a-table-with-a-primary-key)的主键中，UserID 是第一个键，URL 是第二个键列。为执行该查询，ClickHouse 在索引标记上使用了[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)，但由于 UserID 和 URL 都具有相近的高基数，这种方式的效果并不理想。

当将 URL 作为主键中的第一列后，ClickHouse 现在会在索引标记上运行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找（binary search）</a>。
ClickHouse 服务端日志文件中的相应 trace 日志也证实了这一点：


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

ClickHouse 只选择了 39 个索引标记，而在使用通用排除搜索时则会选择 1076 个。

请注意，这个额外表经过优化，用于加速我们基于 URL 过滤的示例查询的执行。

类似于该查询在我们[原始表](#a-table-with-a-primary-key)上的[糟糕性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，我们基于 `UserIDs` 过滤的[示例查询](#the-primary-index-is-used-for-selecting-granules)在这个新表上的效果也不会很好，因为 UserID 现在是该表主键中的第二个键列，因此 ClickHouse 在选择数据粒度时会使用通用排除搜索，而对于 UserID 和 URL 这类[基数都很高的情况](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)来说，这种方式效果并不理想。
打开详情框以查看具体信息。

<details>
  <summary>
    基于 UserIDs 过滤的查询现在性能很差<a name="query-on-userid-slow" />
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

    结果集中有 10 行。耗时：0.024 秒。
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

我们现在有两个表，分别针对基于 `UserIDs` 过滤的查询和基于 URL 过滤的查询进行了优化加速：


### 选项 2：materialized view {#option-2-materialized-views}

在我们现有的表上创建一个 [materialized view](/sql-reference/statements/create/view.md)。

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

* 我们在该 view 的主键中交换了键列的顺序（与[原始表](#a-table-with-a-primary-key) 相比）
* 该 materialized view 由一个**隐式创建的表**作为底层表支撑，其行顺序和主索引基于给定的主键定义
* 这个隐式创建的表会被 `SHOW TABLES` 查询列出，并且其名称以 `.inner` 开头
* 也可以先显式创建一个作为 materialized view 底层表的表，然后该 view 可以通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 指向该表
* 我们使用 `POPULATE` 关键字，以便立即用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充这个隐式创建的表
* 如果新行被插入到源表 hits&#95;UserID&#95;URL，那么这些行也会自动插入到该隐式创建的表中
* 实际上，这个隐式创建的表与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white" />

ClickHouse 会将该隐式创建表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在 ClickHouse 服务器数据目录中的一个特殊文件夹内：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white" />

:::

现在，这个支撑 materialized view 的隐式创建表（及其主索引）可以用来显著加速我们示例中按 URL 列进行过滤的查询执行：

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应如下：

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

由于支撑该 materialized view 的隐式创建表（及其主键索引）在本质上与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此该查询的实际执行方式与使用显式创建的表时一致。

ClickHouse 服务器日志文件中的对应 trace 日志确认 ClickHouse 正在对索引标记执行二分查找：


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


### 方案 3：投影 {#option-3-projections}

在我们现有的表上创建一个投影：

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

然后物化该投影：

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* 该 projection 会创建一个**隐藏表**，其行顺序和主索引基于该 projection 指定的 `ORDER BY` 子句
* 该隐藏表不会在 `SHOW TABLES` 查询结果中列出
* 我们使用 `MATERIALIZE` 关键字，以便立刻用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充该隐藏表
* 如果向源表 hits&#95;UserID&#95;URL 插入新行，那么这些行也会自动插入到隐藏表中
* 查询在语法上始终是针对源表 hits&#95;UserID&#95;URL 的，但如果隐藏表的行顺序和主索引可以实现更高效的查询执行，则会改为使用该隐藏表
* 请注意，即使 ORDER BY 与 projection 的 ORDER BY 语句相匹配，projections 也不会让使用 ORDER BY 的查询更高效（参见 [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333)）
* 实际上，隐式创建的隐藏表与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse 会将隐藏表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在一个特殊的文件夹中（在下方截图中以橙色标出），该文件夹与源表的数据文件、mark 文件和主索引文件位于同一位置、相邻存放：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

现在，可以隐式地使用由 projection 创建的隐藏表（及其主索引），显著加速我们示例中基于 URL 列进行过滤的查询执行。请注意，该查询在语法上仍然是针对该 projection 的源表的。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应如下：

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

由于由 PROJECTION 创建的隐藏表（及其主索引）在本质上与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此该查询的实际执行方式与使用显式创建的表时相同。

ClickHouse 服务器日志文件中的对应 trace 日志确认，ClickHouse 正在对索引标记执行二分查找：


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


### 总结 {#summary}

我们带有[复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key)的主索引，在加速[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)时非常有用。  
但是，该索引对[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)的加速效果不明显，尽管 URL 列也是这个复合主键的一部分。

反之亦然：  
我们带有[复合主键 (URL, UserID) 的表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)的主索引在加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时非常有效，但对[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)帮助不大。

由于主键列 UserID 和 URL 的基数相近且都很高，对第二个键列进行过滤的查询[几乎无法从第二个键列包含在索引中获益](#generic-exclusion-search-algorithm)。

因此，从主索引中移除第二个键列（从而减少索引的内存消耗），并改为[使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)是合理的选择。

不过，如果复合主键中的各个键列在基数上有较大差异，那么按基数升序排列主键列[会对查询有利](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大，这些列在键中的排列顺序就越重要。我们将在下一节中展示这一点。

## 高效设计键列顺序 {#ordering-key-columns-efficiently}

<a name="test" />

在复合主键中，键列的顺序会显著影响以下两方面：

* 在查询中对后续键列进行过滤的效率，及
* 表数据文件的压缩比。

为演示这一点，我们将使用一个[网站流量示例数据集](#data-set)的变体，其中每一行包含三列，用于指示某个互联网“用户”（`UserID` 列）访问某个 URL（`URL` 列）时，该访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用一个包含上述三列的复合主键，用于加速典型的网站分析查询，这些查询会计算：

* 指定 URL 的流量中，有多少（百分比）来自机器人，或
* 我们有多大把握认为某个特定用户是（不是）机器人（该用户的流量中，有多少百分比被认为是机器人流量或非机器人流量）

我们使用下面的查询来计算计划作为复合主键键列的这三列的基数（注意，我们使用的是 [URL 表函数](/sql-reference/table-functions/url.md)，以便对 TSV 数据进行即席查询，而无需创建本地表）。在 `clickhouse client` 中运行此查询：

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

响应如下：

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

我们可以看到基数之间存在很大的差异，尤其是 `URL` 和 `IsRobot` 列之间的差异。因此，在复合主键中这些列的顺序，对于加速基于这些列进行过滤的查询以及为该表的列数据文件实现最优压缩比，都是至关重要的。

为了演示这一点，我们为机器人流量分析数据创建两个版本的表：

* 表 `hits_URL_UserID_IsRobot`，复合主键为 `(URL, UserID, IsRobot)`，其中按基数从高到低的顺序排列键列
* 表 `hits_IsRobot_UserID_URL`，复合主键为 `(IsRobot, UserID, URL)`，其中按基数从低到高的顺序排列键列

创建表 `hits_URL_UserID_IsRobot`，使用复合主键 `(URL, UserID, IsRobot)`：

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

并向其中填充 887 万行数据：

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

返回结果如下：

```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

接下来，创建表 `hits_IsRobot_UserID_URL`，复合主键为 `(IsRobot, UserID, URL)`：

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

并向其中写入与之前表相同的 887 万行数据：


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

返回结果为：

```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```


### 在次级键列上进行高效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询在过滤复合键中的至少一列，且该列是第一个键列时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

当查询（仅）在过滤复合键中的某一列，但该列不是第一个键列时，[ClickHouse 会在该键列的索引标记上使用通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中键列的排列顺序会显著影响[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的效果。

下面是一个对表中 `UserID` 列进行过滤的查询，在该表中，我们将键列 `(URL, UserID, IsRobot)` 按基数从高到低排序：

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

返回结果为：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

这是在这样一个表上执行的同一个查询：该表的键列 `(IsRobot, UserID, URL)` 按基数从小到大排列：

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

返回结果为：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

我们可以看到，在按基数从小到大对键列排序的表上，查询执行显著更加高效且更快。

原因在于，当通过一个次级键列来选择[granules](#the-primary-index-is-used-for-selecting-granules)且其前面的键列具有更低的基数时，[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的效果最佳。我们已经在本指南的[前一节](#generic-exclusion-search-algorithm)中对此进行了详细说明。


### 数据文件的最优压缩比 {#optimal-compression-ratio-of-data-files}

下面的查询比较了我们在上面创建的两个表中 `UserID` 列的压缩比：

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

返回结果如下：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

我们可以看到，当我们按基数升序排列键列 `(IsRobot, UserID, URL)` 时，对应表中 `UserID` 列的压缩比要显著更高。

虽然这两个表中存储的数据完全相同（我们向两个表中都插入了相同的 887 万行数据），但复合主键中键列的顺序会显著影响表中<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩后的</a>[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)在磁盘上占用的空间：

* 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，即按照基数降序排列键列，此时 `UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
* 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，即按照基数升序排列键列，此时 `UserID.bin` 数据文件仅占用 **877.47 KiB** 的磁盘空间

让表某一列在磁盘上的数据具有较好的压缩比，不仅可以节省磁盘空间，还可以加快需要读取该列数据的查询（尤其是分析型查询），因为从磁盘将该列数据搬运到内存（操作系统文件缓存）所需的 I/O 更少。

下面我们说明为什么将主键列按基数升序排序有利于提升表各列数据的压缩比。

下图示意了在主键的键列按基数升序排列时，行在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

我们已经讨论过，[表的行数据在磁盘上是按照主键列的顺序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表中的行（即其在磁盘上的列值）首先按 `cl` 的值排序，具有相同 `cl` 值的行再按 `ch` 的值排序。由于第一个键列 `cl` 的基数较低，很可能会有多行具有相同的 `cl` 值。正因如此，在这些具有相同 `cl` 值的行中，其 `ch` 值也很可能是局部有序的（对同一 `cl` 值对应的行而言）。

如果某一列中相似的数据彼此靠得很近，例如通过排序实现，那么这些数据通常可以被更好地压缩。一般来说，压缩算法从数据的“连续长度”（看到的数据越多，越有利于压缩）以及“局部性”（数据越相似，压缩比越高）中获益。

与上图相反，下图示意了在主键的键列按基数降序排列时，行在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white" />


现在，表中的行首先按照它们的 `ch` 值排序，而具有相同 `ch` 值的行再按照它们的 `cl` 值排序。
但是由于第一个排序键列 `ch` 具有很高的基数，出现具有相同 `ch` 值的行的可能性很低。也正因为如此，`cl` 值被排序（局部地——即在具有相同 `ch` 值的行中）的可能性也很低。

因此，`cl` 值很可能是随机顺序的，从而具有很差的数据局部性和相应较低的压缩率。

### 总结 {#summary-1}

为了在查询中高效地过滤次级键列，并提升表列数据文件的压缩比，将主键中的列按其基数从小到大排序是有利的。

## 高效识别单行记录 {#identifying-single-rows-efficiently}

虽然总体来说，这[并不是](/knowledgebase/key-value) ClickHouse 的最佳使用场景，
但有时构建在 ClickHouse 之上的应用需要在 ClickHouse 表中识别单行记录。

一个直观的解决方案是使用一个 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，为每一行分配唯一值，并将该列作为主键列，以便快速检索行。

为了实现最快的检索，UUID 列[需要作为第一个主键列](#the-primary-index-is-used-for-selecting-granules)。

我们已经讨论过，由于 [ClickHouse 表的行数据在磁盘上是按照主键列的顺序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，
在主键中，或者在复合主键中将一个基数极高的列（例如 UUID 列）放在基数较低的列之前，[会降低其他表列的压缩率](#optimal-compression-ratio-of-data-files)。

在最快检索与最佳数据压缩之间的一种折中方案，是使用复合主键，将 UUID 作为最后一个主键列，放在那些用于保证表中部分列拥有良好压缩率的低（或较低）基数主键列之后。

### 一个具体示例 {#a-concrete-example}

一个具体的示例是 Alexey Milovidov 开发并[撰文介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)的纯文本粘贴服务 [https://pastila.nl](https://pastila.nl)。

每当文本输入框内容发生变更时，数据都会自动保存到一个 ClickHouse 表的一行中（每次更改对应一行）。

标识和检索（某个特定版本的）粘贴内容的一种方式，是使用内容的哈希值作为包含该内容的表行的 UUID。

下图展示了

- 当内容发生变化时（例如在文本输入框中键入字符的按键操作）行的插入顺序，以及
- 在使用 `PRIMARY KEY (hash)` 时，插入行在磁盘上的数据存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="稀疏主索引 15a" background="white"/>

由于 `hash` 列被用作主键列

- 可以[非常快速地](#the-primary-index-is-used-for-selecting-granules)检索到特定的行，但
- 表的行（其列数据）在磁盘上按照（唯一且随机的）哈希值升序存储。因此，content 列的值也会以随机顺序存储，缺乏数据局部性，从而导致 **content 列数据文件的压缩比不理想**。

为了在仍然能够快速检索特定行的同时，大幅提升 content 列的压缩比，pastila.nl 使用了两个哈希（以及一个复合主键）来标识特定的行：

- 如上所述的内容哈希，对不同数据具有不同的值，以及
- 一个[局部敏感哈希（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，在数据发生小幅变化时 **不会** 改变。

下图展示了

- 当内容发生变化时（例如在文本输入框中键入字符的按键操作）行的插入顺序，以及
- 在使用复合 `PRIMARY KEY (fingerprint, hash)` 时，插入行在磁盘上的数据存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="稀疏主索引 15b" background="white"/>

现在，磁盘上的行首先按 `fingerprint` 排序，对于 fingerprint 值相同的行，再由它们的 `hash` 值决定最终顺序。

由于仅存在细微差异的数据会获得相同的 fingerprint 值，相似的数据现在会在 content 列中在磁盘上彼此紧邻地存储。对于 content 列的压缩比而言，这是非常有利的，因为一般来说，压缩算法会从数据局部性中获益（数据越相似，压缩比通常越好）。

这种折中在于：为了在由复合 `PRIMARY KEY (fingerprint, hash)` 产生的主索引上实现对特定行的最优利用，检索该行时需要使用两个字段（`fingerprint` 和 `hash`）。