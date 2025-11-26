---
sidebar_label: '主索引'
sidebar_position: 1
description: '在本指南中，我们将深入解析 ClickHouse 的主索引机制。'
title: 'ClickHouse 主索引实用入门'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['主索引', '索引', '性能', '查询优化', '最佳实践']
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


# ClickHouse 主索引实用入门



## 简介

在本指南中，我们将深入探讨 ClickHouse 索引机制。我们将通过示例详细说明和讨论：

* [ClickHouse 中的索引与传统关系型数据库管理系统中的索引有何不同](#an-index-design-for-massive-data-scales)
* [ClickHouse 如何构建和使用数据表的稀疏主索引](#a-table-with-a-primary-key)
* [在 ClickHouse 中使用索引的一些最佳实践](#using-multiple-primary-indexes)

你也可以在自己的机器上执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门说明，请参阅[快速开始](/get-started/quick-start)。

:::note
本指南聚焦于 ClickHouse 的稀疏主索引。

关于 ClickHouse 的[二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅[教程](/guides/best-practices/skipping-indexes.md)。
:::

### 数据集

在整个指南中，我们将使用一个匿名化的网页流量示例数据集。

* 我们将使用该示例数据集中的一个子集，共 887 万行（事件）。
* 未压缩数据大小为 887 万条事件，大约 700 MB。在 ClickHouse 中存储时压缩到约 200 MB。
* 在我们的子集中，每一行包含三列，表示某个互联网用户（`UserID` 列）在某个特定时间（`EventTime` 列）点击了某个 URL（`URL` 列）。

仅使用这三列，我们就可以写出一些典型的网页分析查询，例如：

* “针对某个特定用户，被点击次数最多的前 10 个 URL 是什么？”
* “对于某个特定 URL，点击该 URL 最频繁的前 10 个用户是谁？”
* “用户在什么时间（例如一周中的哪些天）最常点击某个特定 URL？”

### 测试机器

本文档中的所有运行时数据，均基于在一台搭载 Apple M1 Pro 芯片和 16GB 内存的 MacBook Pro 上本地运行 ClickHouse 22.2.1 所得到的结果。

### 全表扫描

为了了解在没有主键的情况下查询是如何在我们的数据集上执行的，我们通过执行以下 SQL DDL 语句来创建一张表（使用 MergeTree 表引擎）：

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

接下来，使用以下 SQL `INSERT` 语句向表中插入 hits 数据集的一个子集。
这里使用了 [URL 表函数](/sql-reference/table-functions/url.md)，从托管在 clickhouse.com 上的完整数据集中远程加载该子集：


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

响应如下：

```response
Ok.

0 行数据。耗时:145.993 秒。已处理 887 万行,18.40 GB(60.78 千行/秒,126.06 MB/秒)。
```

ClickHouse 客户端的输出结果显示，上述语句向该表插入了 887 万行数据。

最后，为了简化本指南后续的讨论，并使图示和结果具有可复现性，我们使用 FINAL 关键字对表进行[优化](/sql-reference/statements/optimize.md)：


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常情况下，在将数据加载到表之后，既不需要、也不推荐立即对该表进行优化。为何在本示例中这是必要的，原因稍后会变得清楚。
:::

现在我们来执行第一个网页分析查询。下面的查询会计算出针对 UserID 为 749927693 的互联网用户，被点击次数最多的前 10 个 URL：

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
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
```


10 行。耗时：0.022 秒。

# highlight-next-line

已处理 8.87 百万行，
70.45 MB（398.53 百万行/秒，3.17 GB/秒）

```

ClickHouse 客户端的结果输出表明 ClickHouse 执行了全表扫描!表中 887 万行数据的每一行都被流式传输到 ClickHouse 中。这种方式无法扩展。

为了使查询更高效、更快速,我们需要使用具有适当主键的表。这将允许 ClickHouse 根据主键列自动创建稀疏主索引,从而显著加快示例查询的执行速度。
```


## ClickHouse 索引设计 {#clickhouse-index-design}

### 面向海量数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统关系型数据库管理系统中,主索引会为表中的每一行创建一个条目。这意味着对于我们的数据集,主索引将包含 887 万个条目。这种索引能够快速定位特定行,从而为查找查询和点更新提供高效率。在 `B(+)-Tree` 数据结构中搜索条目的平均时间复杂度为 `O(log n)`;更准确地说是 `log_b n = log_2 n / log_2 b`,其中 `b` 是 `B(+)-Tree` 的分支因子,`n` 是索引行数。由于 `b` 通常在几百到几千之间,`B(+)-Trees` 是非常浅的结构,定位记录只需要很少的磁盘寻址。对于 887 万行数据和分支因子为 1000 的情况,平均需要 2.3 次磁盘寻址。但这种能力是有代价的:额外的磁盘和内存开销、向表中添加新行和向索引添加条目时更高的插入成本,以及有时需要重新平衡 B-Tree。

考虑到 B-Tree 索引相关的挑战,ClickHouse 中的表引擎采用了不同的方法。ClickHouse [MergeTree 引擎家族](/engines/table-engines/mergetree-family/index.md)经过专门设计和优化,可以处理海量数据。这些表设计为每秒接收数百万行插入,并存储超大规模(数百 PB)的数据量。数据以[分块方式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)快速写入表中,并在后台应用规则合并这些数据分块。在 ClickHouse 中,每个数据分块都有自己的主索引。当数据分块合并时,合并后数据分块的主索引也会合并。在 ClickHouse 所针对的超大规模场景下,磁盘和内存效率至关重要。因此,主索引不是为每一行建立索引,而是为每组行(称为"granule"颗粒)建立一个索引条目(称为"mark"标记)——这种技术称为**稀疏索引**。

稀疏索引之所以可行,是因为 ClickHouse 将数据分块中的行按主键列的顺序存储在磁盘上。稀疏主索引不是直接定位单个行(如基于 B-Tree 的索引),而是能够快速(通过对索引条目进行二分查找)识别可能与查询匹配的行组。然后,定位到的潜在匹配行组(颗粒)会并行流式传输到 ClickHouse 引擎中以查找匹配项。这种索引设计使主索引保持较小规模(它可以且必须完全装入主内存),同时仍能显著加快查询执行时间:特别是对于数据分析场景中典型的范围查询。

以下详细说明了 ClickHouse 如何构建和使用其稀疏主索引。在本文后面部分,我们将讨论选择、删除和排序用于构建索引的表列(主键列)的一些最佳实践。

### 具有主键的表 {#a-table-with-a-primary-key}

创建一个具有复合主键的表,主键列为 UserID 和 URL:

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

[//]: # "<details open>"

<details>
    <summary>
    DDL 语句详情
    </summary>
    <p>

为了简化本指南后续的讨论,并使图表和结果可重现,DDL 语句:


<ul>
  <li>
    通过 <code>ORDER BY</code>{" "}
    子句为表指定复合排序键。
  </li>
  <li>
    通过以下设置显式控制主索引的索引条目数量:
    <ul>
      <li>
        <code>index_granularity</code>: 显式设置为默认值
        8192。这意味着每 8192 行为一组,主索引
        将包含一个索引条目。例如,如果表包含 16384
        行,索引将包含两个索引条目。
      </li>
      <li>
        <code>index_granularity_bytes</code>: 设置为 0 以禁用{" "}
        <a
          href='https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1'
          target='_blank'
        >
          自适应索引粒度
        </a>
        。自适应索引粒度是指 ClickHouse 会在满足以下任一条件时自动为一组 n 行创建
        一个索引条目:
        <ul>
          <li>
            <code>n</code> 小于 8192 且这 <code>n</code> 行的合并行
            数据大小大于或等于 10 MB
            (<code>index_granularity_bytes</code> 的默认值)。
          </li>
          <li>
            <code>n</code> 行的合并行数据大小小于
            10 MB 但 <code>n</code> 等于 8192。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 设置为 0 以禁用{" "}
        <a
          href='https://github.com/ClickHouse/ClickHouse/issues/34437'
          target='_blank'
        >
          主索引压缩
        </a>
        。这样我们可以在之后根据需要检查其内容。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

上述 DDL 语句中的主键会基于指定的两个键列创建主索引。

<br />
接下来插入数据:


```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

响应大致如下：

```response
返回 0 行。耗时:149.432 秒。已处理 887 万行,18.40 GB(每秒 5.938 万行,123.16 MB/秒)。
```

<br />

并对该表进行优化：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

我们可以使用以下查询来获取关于我们的表的元数据：


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

响应如下：

```response
part_type:                   Wide
path:                        ./store/d9f/d9f36a1a-d2e6-46d4-8fb5-ffe9ad0d5aed/all_1_9_2/
rows:                        887 万
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

1 行结果集。耗时:0.003 秒。
```

ClickHouse 客户端的输出显示：

* 表数据以磁盘上特定目录中的[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)存储，这意味着该目录中表的每一列都有一个数据文件（以及一个标记文件）。
* 该表包含 8.87 百万行。
* 所有行未压缩的数据总大小为 733.28 MB。
* 所有行在磁盘上的压缩后总大小为 206.94 MB。
* 该表具有包含 1083 个条目的主索引（称为 “marks”），索引大小为 96.93 KB。
* 总体而言，该表的数据文件、标记文件和主索引文件在磁盘上一共占用 207.07 MB。

### 数据在磁盘上按主键列排序存储

我们在上面创建的表具有：

* 复合[主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`，以及
* 复合[排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

* 如果我们只指定排序键，则主键会被隐式定义为等于排序键。

* 为了提高内存使用效率，我们显式指定了一个仅包含查询过滤列的主键。基于该主键的主索引会被完整加载到内存中。

* 为了在本指南的图示中保持一致性并最大化压缩率，我们定义了一个单独的排序键，它包含表的所有列（如果某一列中相似的数据彼此靠得更近，例如通过排序实现，那么这些数据会被压缩得更好）。

* 当同时指定主键和排序键时，主键必须是排序键的前缀。
  :::

插入的行在磁盘上按照主键列（以及排序键中的额外 `EventTime` 列）的字典序（升序）存储。

:::note
ClickHouse 允许插入多行具有相同主键列值的数据。在这种情况下（见下方图示中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此由 `EventTime` 列的值来决定。
:::

ClickHouse 是一个<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">面向列的数据库管理系统</a>。如下面图示所示，

* 在磁盘上的物理表示中，每个表列对应一个数据文件（*.bin），该列的所有值都以<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>格式存储，并且
* 这 8.87 百万行在磁盘上按主键列（以及额外的排序键列）的字典序升序存储，即在此示例中：
  * 首先按 `UserID`，
  * 然后按 `URL`，
  * 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="稀疏主索引 01" background="white" />


`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是磁盘上的数据文件，用于存储 `UserID`、`URL` 和 `EventTime` 列的值。

:::note
- 由于主键定义了磁盘上行的字典序，因此一张表只能有一个主键。

- 我们从 0 开始对行进行编号，以与 ClickHouse 的内部行编号方案保持一致，该方案也用于日志消息。
:::

### 数据被组织成 granule 以实现并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，表中各列的值在逻辑上被划分为 granule。
granule 是以流式方式送入 ClickHouse 进行数据处理的最小不可分数据集。
这意味着 ClickHouse 不是读取单独的行，而是始终（以流式、并行的方式）读取一整组（granule）行。
:::note
列值并不是物理地存储在 granule 内部：granule 只是用于查询处理的列值的逻辑组织方式。
:::

下图展示了我们的表中 887 万行（的列值）是如何被组织成 1083 个 granule 的，这是由于表的 DDL 语句中包含了设置 `index_granularity`（设置为其默认值 8192）而产生的结果。

<Image img={sparsePrimaryIndexes02} size="md" alt="稀疏主索引 02" background="white"/>

磁盘物理顺序上的前 8192 行（及其列值）在逻辑上属于 granule 0，然后接下来的 8192 行（及其列值）属于 granule 1，以此类推。

:::note
- 最后一个 granule（granule 1082）“包含”的行数少于 8192。

- 我们在本指南开头的 “DDL Statement Details” 中提到，我们禁用了[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)（这样做是为了简化本指南中的讨论，同时使图示和结果可复现）。

  因此，在我们的示例表中，除最后一个之外的所有 granule 都具有相同的大小。

- 对于启用自适应索引粒度的表（索引粒度默认是[自适应](/operations/settings/merge-tree-settings#index_granularity_bytes) 的），部分 granule 的大小可能会小于 8192 行，这取决于行数据的大小。

- 我们将主键列（`UserID`、`URL`）中的某些列值标记为橙色。
  这些橙色标记的列值是每个 granule 第一行的主键列值。
  正如下文将看到的，这些橙色标记的列值将成为表主索引中的条目。

- 我们从 0 开始对 granule 进行编号，以与 ClickHouse 的内部编号方案保持一致，该方案也用于日志消息。
:::

### 主索引每个 granule 有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上图所示的 granule 创建的。该索引是一个未压缩的扁平数组文件（primary.idx），其中包含从 0 开始的数字索引标记（numerical index marks）。

下图显示，索引为每个 granule 的第一行存储主键列值（即上图中标记为橙色的值）。
换句话说：主索引为表中每第 8192 行存储主键列值（基于由主键列定义的物理行顺序）。
例如：
- 第一个索引条目（下图中的 “mark 0”）存储的是上图中 granule 0 的第一行的键列值，
- 第二个索引条目（下图中的 “mark 1”）存储的是上图中 granule 1 的第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="稀疏主索引 03a" background="white"/>

对于我们这张有 887 万行和 1083 个 granule 的表，索引总共有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="稀疏主索引 03b" background="white"/>



:::note
- 对于具有[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，在主索引中还会额外存储一个“最终”标记，用于记录表最后一行的主键列的值。但由于我们在本指南中禁用了自适应索引粒度（这样可以简化后续讨论，并使图示和结果可复现），因此本示例表的索引中不包含这个最终标记。

- 主索引文件会被完整加载到内存中。如果该文件大小超过可用空闲内存空间，ClickHouse 将抛出错误。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自托管的 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 来检查示例表的主索引内容。

为此，我们首先需要将主索引文件拷贝到运行集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>步骤 1：获取包含主索引文件的 part 路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>步骤 2：获取 user_files_path</li>
Linux 上的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 为
`/var/lib/clickhouse/user_files/`

在 Linux 上可以通过如下方式检查是否被修改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上该路径为 `/Users/tomschreiber/Clickhouse/user_files/`

<li>步骤 3：将主索引文件拷贝到 user_files_path 中</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
现在我们可以通过 SQL 来检查主索引的内容：
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

主键条目被称为索引标记（index marks），因为每个索引条目都标记了一个特定数据范围的起始位置。对于本示例表来说，具体如下：
- UserID 索引标记：

  主索引中存储的 `UserID` 值按升序排序。<br/>
  上图中的 “mark 1” 因此表示，在粒度 1 以及后续所有粒度中的所有表行，其 `UserID` 值都保证大于或等于 4.073.710。



[正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules)，这种全局排序使 ClickHouse 能够在查询对主键第一列进行过滤时，在第一键列的索引标记上<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分查找算法</a>。

* URL 索引标记：

  主键列 `UserID` 和 `URL` 的基数非常接近，
  这意味着通常情况下，只要前一个键列在至少当前 granule 中的所有表行内保持相同，第一列之后的所有键列的索引标记只标识一个数据范围。<br />
  例如，因为上图中标记 0 和标记 1 的 UserID 值不同，ClickHouse 不能假设 granule 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是，如果上图中标记 0 和标记 1 的 UserID 值相同（意味着在 granule 0 中所有表行的 UserID 值都相同），那么 ClickHouse 就可以假设 granule 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们稍后会更详细地讨论这对查询执行性能的影响。

### 主索引用于选择 granule

现在我们可以在主索引的支持下执行查询了。

下面的查询会计算 UserID 为 749927693 时点击次数最多的前 10 个 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返回结果：

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
```


10 行结果。耗时: 0.005 秒。

# highlight-next-line

已处理 8.19 千行，
740.18 KB（1.53 百万行/秒，138.59 MB/秒）

```

ClickHouse 客户端的输出现在显示，不再执行全表扫描，而是仅将 8,190 行数据流式传输到 ClickHouse 中。
```


如果启用了<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace 日志</a>，则 ClickHouse 服务器日志文件会显示其正在对 1083 个 UserID 索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以确定哪些粒度（granule）可能包含 UserID 列值为 `749927693` 的行。这个过程需要 19 步，平均时间复杂度为 `O(log2 n)`：

```response
...Executor): 键条件：(列 0 在 [749927693, 749927693] 范围内)
# highlight-next-line
...Executor): 对数据分片 all_1_9_2 的索引范围执行二分查找（1083 个标记）
...Executor): 找到左边界标记：176
...Executor): 找到右边界标记：177
...Executor): 经过 19 步找到连续范围
...Executor): 通过分区键选择了 1/1 个分片，通过主键选择了 1 个分片，
# highlight-next-line
              通过主键选择了 1/1083 个标记，需从 1 个范围读取 1 个标记
...Reading ...从 1441792 开始读取约 8192 行
```

我们可以从上面的 trace 日志中看到，在现有的 1083 个 mark 中，有一个 mark 满足了该查询。

<details>
  <summary>
    Trace 日志详情
  </summary>

  <p>
    识别出了 mark 176（&#39;found left boundary mark&#39; 为包含边界，&#39;found right boundary mark&#39; 为不包含边界），因此会将 granule 176 中的全部 8192 行（其起始行号为 1,441,792——我们稍后在本指南中会看到这一点）流式传入 ClickHouse，以便查找 `UserID` 列值为 `749927693` 的实际行。
  </p>
</details>

我们也可以在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来复现这一点：

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
│ Expression (投影)                                                                     │
│   Limit (初步 LIMIT(无 OFFSET))                                                       │
│     Sorting (ORDER BY 排序)                                                           │
│       Expression (ORDER BY 之前)                                                      │
│         Aggregating                                                                   │
│           Expression (GROUP BY 之前)                                                  │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (从存储读取后设置限制和配额)                      │
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

返回 16 行。耗时:0.003 秒。
```

客户端输出显示，在 1083 个数据粒度（granule）中，有 1 个被选中为**可能**包含 UserID 列值为 749927693 的行。

:::note 结论
当查询在一个复合键中按**首列**进行过滤时，ClickHouse 会在该键列的索引标记上运行二分查找算法。
:::

<br />

如上所述，ClickHouse 使用稀疏主索引，通过二分查找快速选出**可能**包含满足查询条件行的数据粒度。

这是 ClickHouse 查询执行的**第一阶段（粒度选择）**。

在**第二阶段（数据读取）**中，ClickHouse 会定位这些已选中的粒度，并将其中的所有行流式读入 ClickHouse 引擎，从而找出真正满足查询条件的行。

我们会在下一小节中更详细地讨论这一第二阶段。

### 标记文件用于定位数据粒度

下图展示了我们这张表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white" />

如上所述，通过对索引中 1083 个 UserID 标记执行二分查找，定位到了标记 176。其对应的数据粒度 176 因此可能包含 UserID 列值为 749.927.693 的行。

<details>
  <summary>
    粒度选择细节
  </summary>

  <p>
    上图显示，标记 176 是第一个索引条目，满足：与其关联的数据粒度 176 的最小 UserID 值小于 749.927.693，并且下一条标记（标记 177）对应的数据粒度 177 的最小 UserID 值大于该值。因此，只有标记 176 对应的数据粒度 176 可能包含 UserID 列值为 749.927.693 的行。
  </p>
</details>

为了确认（或否定）数据粒度 176 中是否确有某些行包含 UserID 列值为 749.927.693，需要将该粒度所属的全部 8192 行流式读入 ClickHouse。

要做到这一点，ClickHouse 需要先知道数据粒度 176 的物理位置。

在 ClickHouse 中，我们这张表中所有数据粒度的物理位置都存储在标记文件（mark files）中。与数据文件类似，每个表列对应一个标记文件。

下图展示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`，它们分别存储了表中 `UserID`、`URL` 和 `EventTime` 列的数据粒度的物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white" />

我们已经讨论过，主索引是一个扁平的未压缩数组文件（primary.idx），其中包含的索引标记从 0 开始编号。

类似地，标记文件也是一个扁平的未压缩数组文件（*.mrk），其中的标记同样从 0 开始编号。

当 ClickHouse 已经确定并选中了某个可能包含查询匹配行的数据粒度的索引标记后，就可以在标记文件中通过位置数组查找来获取该数据粒度的物理位置。

针对某一列，每个标记文件条目都以偏移量（offset）的形式存储两个位置：


- 第一个偏移量（上图中的 `block_offset`）用于在<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块（block）</a>所在的<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件中，定位包含所选粒度（granule）压缩版本的那个块。该压缩块中可能包含多个被压缩的粒度。读取时，定位到的压缩文件块会被解压到主内存中。

- 第二个偏移量（上图中的 `granule_offset`）来自 mark 文件，用于给出该粒度在未压缩块数据中的位置。

随后，属于定位到的未压缩粒度的全部 8192 行会被流式传入 ClickHouse 以进行后续处理。

:::note

- 对于采用[宽格式（wide format）](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且未启用[自适应索引粒度（adaptive index granularity）](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse 使用如上所示的 `.mrk` mark 文件，其中每条记录包含两个 8 字节长的地址。这些记录给出了粒度的物理位置，且所有粒度的大小都相同。

 索引粒度在[默认情况下](/operations/settings/merge-tree-settings#index_granularity_bytes)是自适应的，但在我们的示例表中，我们禁用了自适应索引粒度（以便简化本指南中的讨论，并使图示和结果可复现）。我们的表使用宽格式，是因为数据大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（在自管集群中默认值为 10 MB）。

- 对于使用宽格式并启用自适应索引粒度的表，ClickHouse 使用 `.mrk2` mark 文件，其中包含与 `.mrk` mark 文件类似的记录，但每条记录多了第三个值：当前记录所关联粒度的行数。

- 对于采用[紧凑格式（compact format）](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse 使用 `.mrk3` mark 文件。

:::

:::note Why Mark Files

为什么主索引不直接包含与索引标记（index marks）对应粒度的物理位置？

因为在 ClickHouse 所针对的这种超大规模场景下，磁盘和内存的高效使用至关重要。

主索引文件需要能够放入主内存。

在我们的示例查询中，ClickHouse 使用主索引并选出了一个可能包含与查询匹配行的粒度。只有对于这一个粒度，ClickHouse 才需要物理位置信息，以便将相应的行流式传入进行进一步处理。

此外，这些偏移量信息只需要用于 UserID 和 URL 两列。

对于未在查询中使用的列（例如 `EventTime`），不需要偏移量信息。

对于我们的示例查询，ClickHouse 只需要 UserID 数据文件（UserID.bin）中粒度 176 的两个物理位置偏移量，以及 URL 数据文件（URL.bin）中粒度 176 的两个物理位置偏移量。

mark 文件提供的这一层间接寻址，避免了在主索引内部直接存储所有三个列的全部 1083 个粒度的物理位置信息条目，从而避免在主内存中保留不必要的（可能不会被使用的）数据。
:::

下图及后续文本说明了在我们的示例查询中，ClickHouse 是如何在 UserID.bin 数据文件中定位粒度 176 的。

<Image img={sparsePrimaryIndexes06} size="md" alt="稀疏主索引 06" background="white"/>

我们在本指南前文中已经讨论过，ClickHouse 选择了主索引标记 176，因此将粒度 176 视为可能包含与查询匹配行的粒度。

ClickHouse 现在使用从索引中选出的标记编号（176），在 UserID.mrk mark 文件中执行基于位置的数组查找（positional array lookup），以获取用于定位粒度 176 的两个偏移量。

如图所示，第一个偏移量用于在 UserID.bin 数据文件中定位压缩文件块，该块进而包含粒度 176 的压缩版本。

一旦定位到的文件块被解压到主内存中，就可以使用来自 mark 文件的第二个偏移量，在未压缩数据中定位粒度 176。

为了执行我们的示例查询（对 UserID 为 749.927.693 的互联网用户，统计点击次数最多的前 10 个 URL），ClickHouse 需要在 UserID.bin 数据文件和 URL.bin 数据文件中同时定位粒度 176，并流式读取其中的所有值。



上图展示了 ClickHouse 如何为 UserID.bin 数据文件定位对应的 granule。

与此同时，ClickHouse 也在为 URL.bin 数据文件的 granule 176 执行同样的操作。随后将这两个对应的 granule 对齐，并以流式方式送入 ClickHouse 引擎进行后续处理，即对所有 UserID 为 749.927.693 的行，按分组聚合并统计各组中 URL 的出现次数，最终按计数降序输出出现次数最多的前 10 个 URL 分组。



## 使用多个主索引

<a name="filtering-on-key-columns-after-the-first" />

### 次级键列未必低效

当查询在筛选一个属于复合键且是第一个键列的列时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当查询在筛选一个属于复合键但不是第一个键列的列时，会发生什么呢？

:::note
这里讨论的是这样一种场景：查询明确没有在第一个键列上进行筛选，而是只在某个次级键列上筛选。

当查询同时在第一个键列以及之后的任意键列上进行筛选时，ClickHouse 会在第一个键列的索引标记上运行二分查找。
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

响应为：<a name="query-on-url-slow" />

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
```


10 行数据。耗时：0.086 秒。

# 高亮下一行

已处理 8.81 百万行数据，
799.69 MB（102.11 百万行/秒，9.27 GB/秒）。

```

客户端输出表明,尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key),ClickHouse 仍然几乎执行了全表扫描!ClickHouse 从表中的 887 万行数据中读取了 881 万行。
```


如果启用了 [trace&#95;logging](/operations/server-configuration-parameters/settings#logger)，ClickHouse 服务器日志文件会显示 ClickHouse 在 1083 个 URL 索引标记上执行了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索（generic exclusion search）</a>，以识别那些可能包含 URL 列值为 &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的行的粒度块（granule）：

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

从上面的示例 trace 日志中可以看到，在 1083 个 granule 中，有 1076 个（通过 marks 可见）被选为可能包含具有匹配 URL 值的行。

这会导致有 881 万行数据被流式写入 ClickHouse 引擎（通过使用 10 个流并行处理），以便识别哪些行实际包含 URL 值 &quot;[http://public&#95;search&quot;。](http://public\&#95;search\&quot;。)

然而，正如我们稍后会看到的，在选中的 1076 个 granule 中，实际上只有 39 个 granule 含有匹配的行。

虽然基于复合主键 (UserID, URL) 的主索引在加速按特定 UserID 值过滤行的查询时非常有用，但对于按特定 URL 值过滤行的查询，这个索引并没有提供明显的加速效果。

原因在于，URL 列不是第一个键列，因此 ClickHouse 在 URL 列的索引 marks 上使用的是通用排除搜索算法（而不是二分查找），并且**该算法的有效性取决于** URL 列与其前置键列 UserID **之间的基数差异**。

为说明这一点，我们将给出一些关于通用排除搜索工作方式的细节。

<a name="generic-exclusion-search-algorithm" />

### 通用排除搜索算法

下面说明的是，当通过一个前置键列具有较低或较高基数的次级列来选择 granule 时，<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse 通用排除搜索算法</a>是如何工作的。

作为这两种情况的示例，我们做如下假设：

* 一个查询正在搜索 URL 值 = &quot;W3&quot; 的行。
* 我们的 hits 表的一个抽象版本，其中 UserID 和 URL 使用了简化的值。
* 对索引使用相同的复合主键 (UserID, URL)。这意味着行首先按 UserID 值排序，具有相同 UserID 值的行接着按 URL 排序。
* granule 大小为 2，即每个 granule 包含两行。

在下面的图示中，我们用橙色标记了每个 granule 中首行的键列值。

**前置键列具有较低基数**<a name="generic-exclusion-search-fast" />

假设 UserID 的基数较低。在这种情况下，相同的 UserID 值很可能分布在多个表行和 granule 中，也就分布在多个 index mark 上。对于拥有相同 UserID 的 index mark，其 URL 值按升序排序（因为表行首先按 UserID 然后按 URL 排序）。这使得可以进行如下所述的高效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="稀疏主索引 06" background="white" />

在上图所示的抽象示例数据中，granule 选择过程有三种不同情况：

1. 对于 index mark 0，**其 URL 值小于 W3，且其紧随其后的 index mark 的 URL 值也小于 W3**，则可以将其排除，因为 mark 0 和 1 具有相同的 UserID 值。请注意，这个排除前提确保 granule 0 完全由 UserID 为 U1 的行组成，从而 ClickHouse 可以假定 granule 0 中的最大 URL 值也小于 W3，并将该 granule 排除。


2. 选择索引标记 1，即**URL 值小于（或等于）W3，且其直接后继索引标记的 URL 值大于（或等于）W3**，因为这意味着 granule 1 中可能包含 URL 为 W3 的行。

3. 可以排除索引标记 2 和 3，因为它们的 **URL 值大于 W3**；由于主索引的索引标记为每个 granule 存储该 granule 第一行的键列值，并且表行在磁盘上按键列值排序，因此 granule 2 和 3 不可能包含 URL 值 W3。

**前置键列具有较高（更高）的基数**<a name="generic-exclusion-search-slow" />

当 UserID 具有高基数时，同一个 UserID 值分布在多行和多个 granule 上的情况就不太可能。这意味着索引标记上的 URL 值不是单调递增的：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white" />

如上图所示，所有 URL 值小于 W3 的索引标记都会被选中，以便将其关联 granule 的行流式传入 ClickHouse 引擎。

这是因为，尽管图中的所有索引标记都属于上文描述的场景 1，但它们并不满足前面提到的排除前提条件——*直接后继索引标记与当前标记具有相同的 UserID 值*——因此无法被排除。

例如，考虑索引标记 0，其 **URL 值小于 W3，且其直接后继索引标记的 URL 值也小于 W3**。这个标记*不能*被排除，因为直接后继索引标记 1 与当前标记 0 *不*具有相同的 UserID 值。

这最终使得 ClickHouse 无法对 granule 0 中的最大 URL 值做出假设。相反，它必须假定 granule 0 可能包含 URL 值 W3 的行，因此被迫选择标记 0。

标记 1、2 和 3 也是同样的情况。

:::note Conclusion
当查询在一个复合键中筛选某一列，但该列不是第一个键列时，ClickHouse 使用的、替代 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search algorithm</a> 的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search algorithm</a>，在前置键列具有较低基数时最为有效。
:::

在我们的示例数据集中，两个键列（UserID、URL）都具有类似的高基数，而且如上所述，当 URL 列的前置键列具有较高或相近的基数时，generic exclusion search algorithm 的效果并不理想。

### 关于 data skipping index 的说明

由于 UserID 和 URL 都具有类似的高基数，我们在[基于 URL 进行过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)中，即使为 URL 列创建一个 [secondary data skipping index](./skipping-indexes.md) 也不会带来太多收益，
该 URL 列属于我们的[具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key)。

例如，下面这两条语句会在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index：

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse 现在创建了一个额外的索引，它会按每一组连续的 4 个[粒度](#data-is-organized-into-granules-for-parallel-data-processing)（注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句）存储 URL 的最小值和最大值：

<Image img={sparsePrimaryIndexes13a} size="md" alt="稀疏主索引 13a" background="white" />

第一个索引记录（上图中的 “mark 0”）存储了[属于我们表的前 4 个粒度的行](#data-is-organized-into-granules-for-parallel-data-processing)的 URL 最小值和最大值。


第二个索引条目（&#39;mark 1&#39;）存储了表中接下来 4 个颗粒所属行的最小和最大 URL 值，以此类推。

（ClickHouse 还为数据跳过索引创建了一个特殊的 [mark 文件](#mark-files-are-used-for-locating-granules)，用于[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的颗粒组。）

由于 UserID 和 URL 的基数同样很高，当执行我们[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时，这个辅助数据跳过索引无法帮助排除颗粒的选择。

查询要查找的特定 URL 值（即 &#39;[http://public&#95;search&#39;）很可能位于索引为每组颗粒存储的最小值和最大值之间，这导致](http://public\&#95;search\&#39;）很可能位于索引为每组颗粒存储的最小值和最大值之间，这导致) ClickHouse 被迫选择该颗粒组（因为它们可能包含与查询匹配的行）。

### 使用多个主索引的必要性

因此，如果我们想要显著加快过滤特定 URL 行的示例查询速度，就需要使用针对该查询优化的主索引。

此外，如果我们还想保持过滤特定 UserID 行的示例查询的良好性能，就需要使用多个主索引。

以下展示了实现这一目标的方法。

<a name="multiple-primary-indexes" />

### 创建额外主索引的选项

如果我们想要显著加快两个示例查询的速度——一个过滤特定 UserID 的行，另一个过滤特定 URL 的行——那么需要使用以下三个选项之一来创建多个主索引：

* 创建具有不同主键的**第二个表**。
* 在现有表上创建**物化视图**。
* 向现有表添加**投影**。

这三个选项都会将示例数据复制到一个额外的表中，以便重新组织表的主索引和行排序顺序。

但是，这三个选项在额外表对用户的透明度方面有所不同，主要体现在查询和插入语句的路由方式上。

当创建具有不同主键的**第二个表**时，查询必须显式发送到最适合该查询的表版本，并且新数据必须显式插入到两个表中以保持表的同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white" />

使用**物化视图**时，额外的表是隐式创建的，数据在两个表之间自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white" />

而**投影**是最透明的选项，因为除了自动保持隐式创建的（和隐藏的）额外表与数据更改同步之外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white" />

下文将更详细地讨论这三个创建和使用多个主索引的选项，并提供实际示例。

<a name="multiple-primary-indexes-via-secondary-tables" />

### 选项 1：辅助表

<a name="secondary-table" />

我们将创建一个新的额外表，在主键中交换键列的顺序（与原始表相比）：

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

将我们的[原始表](#a-table-with-a-primary-key)中的全部 887 万行插入到这个新表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

响应如下：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后，优化该表：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```


由于我们调整了主键中各列的顺序，插入的行现在在磁盘上的字典序（相对于我们[原始的表](#a-table-with-a-primary-key)）也发生了变化，因此该表的 1083 个 granule 中所包含的值也与之前不同：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

这是新的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

现在可以利用它显著加速我们的示例查询执行：该查询在 URL 列上进行过滤，用于计算最频繁点击 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的前 10 个用户：

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应如下：

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
```


10 行结果。耗时：0.017 秒。

# highlight-next-line

已处理 319.49 千行，
11.38 MB（18.41 百万行/秒，655.75 MB/秒）

```

现在,ClickHouse 不再[几乎执行全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns),而是以更高效的方式执行该查询。

在[原始表](#a-table-with-a-primary-key)的主索引中,UserID 为第一键列,URL 为第二键列。ClickHouse 对索引标记使用[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)来执行该查询,但由于 UserID 和 URL 的基数均较高,因此效果不佳。
```


将 URL 作为主索引的第一列后,ClickHouse 现在对索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>。
ClickHouse 服务器日志文件中的相应跟踪日志确认了这一点:

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

ClickHouse 仅选择了 39 个索引标记,而使用通用排除搜索时选择了 1076 个。

请注意,该附加表已针对加速按 URL 过滤的示例查询执行进行了优化。

与该查询在我们的[原始表](#a-table-with-a-primary-key)上的[不佳性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)类似,我们的[按 `UserIDs` 过滤的示例查询](#the-primary-index-is-used-for-selecting-granules)在新的附加表上也无法高效运行,因为 UserID 现在是该表主索引中的第二个键列,因此 ClickHouse 将使用通用排除搜索来选择颗粒,而这对于 UserID 和 URL 的类似高基数[效果不佳](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
展开详细信息框查看具体内容。

<details>
    <summary>
    按 UserID 过滤的查询现在性能不佳<a name="query-on-userid-slow"></a>
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

响应结果为:

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

```


10 行结果，耗时 0.024 秒。

# 高亮下一行

已处理 8.02 百万行，
73.04 MB（340.26 百万行/秒，3.10 GB/秒）

```
```


服务器日志:

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

现在我们有两个表,分别针对按 `UserIDs` 过滤的查询和按 URLs 过滤的查询进行了优化:

### 选项 2: 物化视图 {#option-2-materialized-views}

在现有表上创建一个[物化视图](/sql-reference/statements/create/view.md)。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

响应如下:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

- 我们在视图的主键中调换了键列的顺序(与我们的[原始表](#a-table-with-a-primary-key)相比)
- 物化视图由一个**隐式创建的表**支持,该表的行顺序和主索引基于给定的主键定义
- 隐式创建的表会在 `SHOW TABLES` 查询中列出,其名称以 `.inner` 开头
- 也可以先显式创建物化视图的支持表,然后视图可以通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md)指向该表
- 我们使用 `POPULATE` 关键字,以便立即用源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的全部 887 万行填充隐式创建的表
- 如果向源表 hits_UserID_URL 插入新行,这些行也会自动插入到隐式创建的表中
- 实际上,隐式创建的表与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引:

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Sparse Primary Indices 12b1'
  background='white'
/>

ClickHouse 将隐式创建的表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns) (_.bin)、[标记文件](#mark-files-are-used-for-locating-granules) (_.mrk2) 和[主索引](#the-primary-index-has-one-entry-per-granule) (primary.idx) 存储在 ClickHouse 服务器数据目录中的一个特殊文件夹内:

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Sparse Primary Indices 12b2'
  background='white'
/>

:::

支持物化视图的隐式创建的表(及其主索引)现在可以用于显著加快我们按 URL 列过滤的示例查询的执行速度:

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应为:

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

```


共返回 10 行。耗时：0.026 秒。

# highlight-next-line

已处理 335.87 千行，
13.54 MB（12.91 百万行/秒，520.38 MB/秒）

```

由于物化视图底层隐式创建的表(及其主索引)实际上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)完全相同,因此查询的执行方式与使用显式创建的表时一致。

ClickHouse 服务器日志文件中的相应跟踪日志确认了 ClickHouse 正在对索引标记执行二分查找:
```


```response
...Executor): 键条件:(列 0 在 ['http://public_search',
                                           'http://public_search'] 中)
# highlight-next-line
...Executor): 在索引范围内执行二分查找 ...
...
...Executor): 按分区键选中 4/4 个部分,按主键选中 4 个部分,
# highlight-next-line
              按主键选中 41/1083 个标记,从 4 个范围读取 41 个标记
...Executor): 使用 4 个流读取约 335872 行
```

### 选项 3：投影（Projections）

在现有的表上创建一个投影：

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

并物化该投影：

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* 该 projection 会创建一个**隐藏表**，其行顺序和主索引基于该 projection 中给定的 `ORDER BY` 子句
* 该隐藏表不会出现在 `SHOW TABLES` 查询的结果中
* 我们使用 `MATERIALIZE` 关键字，立即用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充该隐藏表
* 如果向源表 hits&#95;UserID&#95;URL 插入新行，这些行也会自动插入到隐藏表中
* 查询在语法上始终是针对源表 hits&#95;UserID&#95;URL，但如果隐藏表的行顺序和主索引可以实现更高效的查询执行，则会改为使用该隐藏表
* 请注意，projection 并不会让使用 ORDER BY 的查询更高效，即使该 ORDER BY 与 projection 的 ORDER BY 声明匹配（参见 [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333)）
* 本质上，隐式创建的隐藏表与我们[显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="稀疏主键索引 12c1" background="white" />

ClickHouse 会将隐藏表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[标记文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在一个特殊的文件夹中（在下方截图中以橙色标出），该文件夹与源表的数据文件、标记文件和主索引文件位于同一位置：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="稀疏主键索引 12c2" background="white" />

:::

通过 projection 创建的隐藏表（及其主索引）现在可以被（隐式地）用于显著加速我们示例中按 URL 列进行过滤的查询执行。请注意，该查询在语法上仍然是针对该 projection 的源表。

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
```


10 行结果。耗时：0.029 秒。

# highlight-next-line

已处理 319.49 千行，1
1.38 MB（11.05 百万行/秒，393.58 MB/秒）

```

由于投影创建的隐藏表(及其主索引)实际上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)完全相同,因此查询的执行方式与使用显式创建的表时一致。

ClickHouse 服务器日志文件中的相应跟踪日志确认,ClickHouse 正在对索引标记执行二分查找:
```


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): 对部分 prj_url_userid 的索引范围执行二分查找（1083 个标记）
...Executor): ...
# highlight-next-line
...Executor): 选择完整的普通投影 prj_url_userid
...Executor): 投影所需列：URL、UserID
...Executor): 通过分区键选择了 1/1 个部分，通过主键选择了 1 个部分，
# highlight-next-line
              通过主键选择了 39/1083 个标记，将从 1 个范围读取 39 个标记
...Executor): 使用 2 个流读取约 319488 行
```

### 总结

我们的[具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key) 的主键索引在加速[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 时非常有用。\
但是，即使 URL 列也是复合主键的一部分，该索引在加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 方面却并没有提供显著帮助。

反之亦然：\
我们的[具有复合主键 (URL, UserID) 的表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 的主键索引可以加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，但对[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 并没有提供太多帮助。

由于主键列 UserID 和 URL 的基数都很高且彼此相近，对于仅按第二个键列过滤的查询，[第二个键列包含在索引中并不会带来太多收益](#generic-exclusion-search-algorithm)。

因此，从主键索引中移除第二个键列是合理的（从而降低索引的内存消耗），并改为[使用多个主键索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)。

然而，如果复合主键中的各个键列在基数上存在较大差异，那么按基数从小到大来排列主键列，对[查询是有利的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大，这些列在键中的顺序就越重要。我们将在下一节中演示这一点。


## 高效地排列键列顺序

<a name="test" />

在复合主键中，键列的顺序会显著影响以下两点：

* 查询中对后续键列进行过滤的效率，和
* 表数据文件的压缩比。

为说明这一点，我们将使用一个 [网页流量示例数据集](#data-set) 的变体，
其中每一行包含三列，用于指示互联网“用户”（`UserID` 列）访问某个 URL（`URL` 列）时，
该访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用一个包含上述三列的复合主键，用于加速典型的 Web 分析查询，这类查询会计算：

* 指向某个特定 URL 的流量中，有多少（百分比）来自机器人，或
* 我们对某个特定用户是（或不是）机器人的置信度有多高（来自该用户的流量中，有多少百分比被认为是机器人流量，或不是机器人流量）

我们使用下面这个查询来计算计划在复合主键中用作键列的三个列的基数（注意我们使用的是 [URL table function](/sql-reference/table-functions/url.md)，以便对 TSV 数据进行临时查询，而无需创建本地表）。在 `clickhouse client` 中运行此查询：

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
│ 239 万          │ 11.908 万          │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

返回 1 行。用时:118.334 秒。已处理 887 万行,15.88 GB(74.99 千行/秒,134.21 MB/秒)。
```

我们可以看到各列的基数差异很大，尤其是 `URL` 和 `IsRobot` 列之间的差异。因此，在复合主键中这些列的顺序，对于高效提升在这些列上进行过滤的查询性能，以及实现表各列数据文件的最优压缩比，都具有重要意义。

为了演示这一点，我们为机器人流量分析数据创建了两个版本的表：

* 表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，其中我们按基数的降序对键列进行排序
* 表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，其中我们按基数的升序对键列进行排序

创建具有复合主键 `(URL, UserID, IsRobot)` 的表 `hits_URL_UserID_IsRobot`：

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

并向其中插入 887 万行数据：

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

响应如下：

```response
返回 0 行。用时:104.729 秒。已处理 887 万行,15.88 GB(84.73 千行/秒,151.64 MB/秒)。
```

接下来，创建表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`：

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

并向其中填充与上一张表相同的 887 万行数据：


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

响应如下：

```response
返回 0 行。用时:95.959 秒。已处理 887 万行,15.88 GB(92.48 千行/秒,165.50 MB/秒)。
```

### 在次要键列上进行高效过滤

当查询在过滤复合键中的至少一列，且该列是第一个键列时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

当查询只在过滤复合键中的某一列，但该列不是第一个键列时，[ClickHouse 会在该键列的索引标记上使用通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中各键列的排列顺序会显著影响[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的有效性。

下面这个查询是在对表中的 `UserID` 列进行过滤，该表的键列 `(URL, UserID, IsRobot)` 是按基数从高到低排序来定义的：

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

响应如下：

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行结果，耗时 0.026 秒。

# highlight-next-line

已处理 7.92 百万行，
31.67 MB（306.90 百万行/秒，1.23 GB/秒）

````

这是在键列 `(IsRobot, UserID, URL)` 按基数升序排列的表上执行的相同查询:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
````

响应如下：

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行数据。耗时：0.003 秒。

# highlight-next-line

已处理 20.32 千行数据，
81.28 KB（6.61 百万行/秒，26.44 MB/秒）。

````

我们可以看到,在按基数升序排列键列的表上,查询执行效率明显更高且速度更快。

原因在于,[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)在通过次级键列选择[颗粒](#the-primary-index-is-used-for-selecting-granules)时效果最佳,前提是前置键列具有较低的基数。我们在本指南的[前面章节](#generic-exclusion-search-algorithm)中对此进行了详细说明。

### 数据文件的最佳压缩比 {#optimal-compression-ratio-of-data-files}

此查询比较我们上面创建的两个表中 `UserID` 列的压缩比:

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
````

响应如下：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

返回 2 行。用时:0.006 秒。
```

我们可以看到，对于将键列 `(IsRobot, UserID, URL)` 按基数升序排序的那张表，`UserID` 列的压缩比显著更高。

尽管两张表中存储的都是完全相同的数据（我们向两张表中都插入了相同的 8.87 百万行），但复合主键中键列的顺序会显著影响表中<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>后数据在[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)中所占用的磁盘空间：

* 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，其中键列按基数降序排序，`UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
* 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，其中键列按基数升序排序，`UserID.bin` 数据文件只占用 **877.47 KiB** 的磁盘空间

让表中某一列在磁盘上的数据具有良好的压缩比，不仅可以节省磁盘空间，还会让需要从该列读取数据的查询（尤其是分析类查询）更快，因为从磁盘将该列数据移动到内存（操作系统的文件缓存）所需的 I/O 更少。

下面我们将说明，为了提升表各列的压缩比，将主键列按基数升序排序是有好处的。

下图示意了在主键列按基数升序排序的情况下，行在磁盘上的排序方式：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

我们已经讨论过[表的行数据在磁盘上是按主键列排序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。


在上图中，表的行（其在磁盘上的列值）首先按它们的 `cl` 值排序，而具有相同 `cl` 值的行则按它们的 `ch` 值排序。由于第一个键列 `cl` 的基数较低，因此很有可能存在具有相同 `cl` 值的行。也正因此，对于具有相同 `cl` 值的行，其 `ch` 值也很可能是有序的（局部有序）。

如果在某一列中，相似的数据彼此靠得很近，例如通过排序实现，那么这些数据会被压缩得更好。
一般来说，压缩算法会从数据的连续长度（连续数据越长，对压缩越有利）
以及局部性（数据越相似，压缩比越高）中获益。

与上图不同，下图示意了当主键中的键列按基数降序排列时，行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

现在表的行首先按它们的 `ch` 值排序，而具有相同 `ch` 值的行则按它们的 `cl` 值排序。
但是，由于第一个键列 `ch` 的基数较高，因此不太可能存在具有相同 `ch` 值的行。也正因此，对于具有相同 `ch` 值的行，其 `cl` 值也不太可能是有序的（局部有序）。

因此，`cl` 值很大概率是随机顺序的，相应地局部性较差，压缩比也较低。

### 总结 {#summary-1}

为了在查询中高效地基于次级键列进行过滤，并提升表列数据文件的压缩比，将主键中的列按其基数升序排列是有利的。



## 高效识别单行记录 {#identifying-single-rows-efficiently}

虽然总体来说这[并不是](/knowledgebase/key-value) ClickHouse 的最佳使用场景，
但有时基于 ClickHouse 构建的应用需要在某个 ClickHouse 表中识别单独的一行记录。

一种直观的解决方案是使用一个 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，每行一个唯一值，并将该列作为主键列，以实现行的快速检索。

为了获得最快的检索速度，UUID 列[需要作为首个键列](#the-primary-index-is-used-for-selecting-granules)。

我们之前讨论过，由于[ClickHouse 表的行数据在磁盘上是按主键列顺序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键或复合主键中把一个基数非常高的列（比如 UUID 列）放在低基数列之前，[会损害其他表列的压缩比](#optimal-compression-ratio-of-data-files)。

在最快检索和最佳数据压缩之间的一种折衷方案，是使用复合主键，并把 UUID 放在最后一个键列，前面是用于保证部分列有良好压缩比的低（或较低）基数键列。

### 一个具体示例 {#a-concrete-example}

一个具体示例是 Alexey Milovidov 开发并[撰文介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)的明文粘贴服务 [https://pastila.nl](https://pastila.nl)。

每当文本区域发生变化时，数据就会自动保存为 ClickHouse 表中的一行（每次变更对应一行）。

识别并检索（某个特定版本的）粘贴内容的一种方式，是使用内容的哈希值作为包含该内容的表行的 UUID。

下图展示了
- 当内容变化时（例如通过按键在文本区域中输入文本）行的插入顺序，以及
- 在使用 `PRIMARY KEY (hash)` 时，这些已插入行对应的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="稀疏主索引 15a" background="white"/>

因为 `hash` 列被用作主键列，
- 可以[非常快速地](#the-primary-index-is-used-for-selecting-granules)检索特定行，但
- 表的行（其列数据）在磁盘上按（唯一且随机的）哈希值升序存储。因此，content 列的值也会以随机顺序存储，没有数据局部性，导致 **content 列数据文件的压缩比不理想**。

为了在显著提升 content 列压缩比的同时，仍然实现特定行的快速检索，pastila.nl 使用了两个哈希值（以及复合主键）来标识一行记录：
- 一个内容的哈希值，如上所述，对于不同数据是不同的，并且
- 一个[局部敏感哈希（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，在数据发生小幅变化时**不会**改变。

下图展示了
- 当内容变化时（例如通过按键在文本区域中输入文本）行的插入顺序，以及
- 在使用复合 `PRIMARY KEY (fingerprint, hash)` 时，这些已插入行对应的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="稀疏主索引 15b" background="white"/>

现在，磁盘上的行首先按 `fingerprint` 排序，对于具有相同 fingerprint 值的行，则由它们的 `hash` 值决定最终顺序。

由于仅有小幅差异的数据会得到相同的 fingerprint 值，相似的数据在 content 列中会在磁盘上彼此靠近存储。而这对 content 列的压缩比非常有利，因为压缩算法通常会从数据局部性中获益（数据越相似，压缩比越好）。

这种折衷在于：为了最优利用由复合 `PRIMARY KEY (fingerprint, hash)` 得到的主索引，在检索特定行时需要提供两个字段（`fingerprint` 和 `hash`）。
