---
sidebar_label: '主索引'
sidebar_position: 1
description: '在本指南中，我们将深入解析 ClickHouse 的索引机制。'
title: 'ClickHouse 主索引实用指南'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['primary index', 'indexing', 'performance', 'query optimization', 'best practices']
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


# ClickHouse 主键索引实用入门指南



## 简介 {#introduction}

在本指南中,我们将深入探讨 ClickHouse 索引。我们将详细说明和讨论:

- [ClickHouse 中的索引与传统关系型数据库管理系统有何不同](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建和使用表的稀疏主索引](#a-table-with-a-primary-key)
- [ClickHouse 索引的一些最佳实践](#using-multiple-primary-indexes)

您可以选择在自己的机器上执行本指南中提供的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门说明,请参阅[快速入门](/get-started/quick-start)。

:::note
本指南重点介绍 ClickHouse 稀疏主索引。

有关 ClickHouse [二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes),请参阅[教程](/guides/best-practices/skipping-indexes.md)。
:::

### 数据集 {#data-set}

在本指南中,我们将使用一个匿名化的网络流量样本数据集。

- 我们将使用样本数据集中的 887 万行(事件)子集。
- 未压缩的数据大小为 887 万个事件,约 700 MB。存储在 ClickHouse 中时压缩至 200 MB。
- 在我们的子集中,每行包含三列,表示一个互联网用户(`UserID` 列)在特定时间(`EventTime` 列)点击了一个 URL(`URL` 列)。

使用这三列,我们可以构建一些典型的网络分析查询,例如:

- "特定用户点击次数最多的前 10 个 URL 是什么?"
- "最频繁点击特定 URL 的前 10 个用户是谁?"
- "用户点击特定 URL 的最热门时间(例如一周中的哪几天)是什么时候?"

### 测试机器 {#test-machine}

本文档中给出的所有运行时数据均基于在配备 Apple M1 Pro 芯片和 16GB 内存的 MacBook Pro 上本地运行 ClickHouse 22.2.1。

### 全表扫描 {#a-full-table-scan}

为了了解在没有主键的情况下如何对我们的数据集执行查询,我们通过执行以下 SQL DDL 语句创建一个表(使用 MergeTree 表引擎):

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

接下来使用以下 SQL 插入语句将点击数据集的子集插入到表中。
这使用了 [URL 表函数](/sql-reference/table-functions/url.md)来加载托管在 clickhouse.com 上的完整数据集的子集:


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

ClickHouse 客户端的输出结果显示，上述语句向表中插入了 887 万行数据。

最后，为了简化本指南后续的讨论，并使图表和结果可复现，我们使用 FINAL 关键字对该表执行 [OPTIMIZE](/sql-reference/statements/optimize.md) 操作：


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
通常在将数据加载到表中之后，既不需要也不建议立即对表进行优化。为什么在本示例中需要这样做，将在后文变得清楚。
:::

现在我们来执行第一个 Web 分析查询。下面的查询计算的是互联网用户 UserID 749927693 点击次数最多的前 10 个 URL：

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


10 行结果。耗时：0.022 秒。

# highlight-next-line

已处理 8.87 百万行，
70.45 MB（398.53 百万行/秒，3.17 GB/秒）

```

ClickHouse 客户端的结果输出表明 ClickHouse 执行了全表扫描!表中 887 万行数据的每一行都被流式传输到 ClickHouse 中。这种方式无法扩展。

为了使查询更加高效和快速,我们需要使用具有合适主键的表。这样 ClickHouse 就能自动(基于主键列)创建稀疏主索引,从而显著加快示例查询的执行速度。
```


## ClickHouse 索引设计 {#clickhouse-index-design}

### 面向海量数据的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系型数据库管理系统中,主索引为每个表行包含一个条目。对于我们的数据集,这将导致主索引包含 887 万个条目。这种索引能够快速定位特定行,从而实现高效的查找查询和点更新。在 `B(+)-Tree` 数据结构中搜索条目的平均时间复杂度为 `O(log n)`;更准确地说是 `log_b n = log_2 n / log_2 b`,其中 `b` 是 `B(+)-Tree` 的分支因子,`n` 是索引行数。由于 `b` 通常在几百到几千之间,`B(+)-Trees` 是非常浅的结构,定位记录只需要很少的磁盘查找次数。对于 887 万行数据和分支因子为 1000 的情况,平均需要 2.3 次磁盘查找。这种能力是有代价的:额外的磁盘和内存开销、向表中添加新行和向索引添加条目时更高的插入成本,以及有时需要对 B-Tree 进行重新平衡。

考虑到 B-Tree 索引相关的挑战,ClickHouse 中的表引擎采用了不同的方法。ClickHouse [MergeTree 引擎家族](/engines/table-engines/mergetree-family/index.md)经过专门设计和优化以处理海量数据。这些表设计为每秒可接收数百万行插入,并存储超大规模(数百 PB)的数据量。数据以[分块方式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)快速写入表中,并在后台应用规则合并这些分块。在 ClickHouse 中,每个分块都有自己的主索引。当分块合并时,合并后分块的主索引也会合并。在 ClickHouse 所针对的超大规模场景下,磁盘和内存效率至关重要。因此,主索引不是为每一行建立索引,而是为每组行(称为"granule",颗粒)建立一个索引条目(称为"mark",标记)——这种技术称为**稀疏索引**。

稀疏索引之所以可行,是因为 ClickHouse 将分块中的行按主键列的顺序存储在磁盘上。稀疏主索引不是直接定位单个行(如基于 B-Tree 的索引),而是能够快速(通过对索引条目进行二分查找)识别可能与查询匹配的行组。然后,定位到的潜在匹配行组(颗粒)会并行流式传输到 ClickHouse 引擎中以查找匹配项。这种索引设计使主索引保持较小规模(它可以且必须完全装入主内存),同时仍能显著加快查询执行时间:尤其是对于数据分析场景中典型的范围查询。

下文将详细说明 ClickHouse 如何构建和使用其稀疏主索引。在本文后续部分,我们将讨论选择、删除和排序用于构建索引的表列(主键列)的一些最佳实践。

### 带有主键的表 {#a-table-with-a-primary-key}

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

为了简化本指南后续的讨论,并使图表和结果可重现,该 DDL 语句:


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
            如果 <code>n</code> 小于 8192 且这 <code>n</code> 行的合并行
            数据大小大于或等于 10 MB
            (<code>index_granularity_bytes</code> 的默认值)。
          </li>
          <li>
            如果 <code>n</code> 行的合并行数据大小小于
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

返回结果如下：

```response
返回 0 行。用时:149.432 秒。已处理 887 万行,18.40 GB(59.38 千行/秒,123.16 MB/秒)。
```

<br />

并对该表进行优化：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

我们可以使用下面的查询来获取关于表的元数据：


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

响应结果为：

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

- 表数据以[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)存储在磁盘上的特定目录中，这意味着该目录内每个表列都有一个数据文件（和一个标记文件）。
- 该表有 887 万行。
- 所有行的未压缩数据总大小为 733.28 MB。
- 所有行在磁盘上的压缩总大小为 206.94 MB。
- 该表有一个包含 1083 个条目（称为"标记"）的主索引，索引大小为 96.93 KB。
- 总计，该表的数据文件、标记文件和主索引文件在磁盘上共占用 207.07 MB。

### 数据在磁盘上按主键列排序存储 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们上面创建的表具有

- 一个复合[主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` 以及
- 一个复合[排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

- 如果我们只指定排序键，那么主键将被隐式定义为等于排序键。

- 为了提高内存效率，我们明确指定了一个主键，该主键仅包含查询中用于过滤的列。基于主键的主索引会完全加载到主内存中。

- 为了保持指南图表的一致性并最大化压缩比，我们定义了一个单独的排序键，该排序键包含表的所有列（如果列中的相似数据彼此相邻放置，例如通过排序，那么这些数据将获得更好的压缩效果）。

- 如果同时指定了主键和排序键，则主键必须是排序键的前缀。
  :::

插入的行按主键列（以及排序键中的附加 `EventTime` 列）以字典序（升序）存储在磁盘上。

:::note
ClickHouse 允许插入具有相同主键列值的多行。在这种情况下（参见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此由 `EventTime` 列的值决定。
:::

ClickHouse 是一个<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">列式数据库管理系统</a>。如下图所示

- 对于磁盘上的表示形式，每个表列都有一个单独的数据文件（\*.bin），该列的所有值都以<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>格式存储，并且
- 这 887 万行按主键列（以及附加的排序键列）以字典序升序存储在磁盘上，即在本例中
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image
  img={sparsePrimaryIndexes01}
  size='md'
  alt='Sparse Primary Indices 01'
  background='white'
/>


`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是磁盘上的数据文件,用于存储 `UserID`、`URL` 和 `EventTime` 列的值。

:::note

- 由于主键定义了磁盘上行的字典序,因此一个表只能有一个主键。

- 我们从 0 开始对行进行编号,以便与 ClickHouse 内部行编号方案保持一致,该方案也用于日志消息。
  :::

### 数据被组织成颗粒以进行并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

为了数据处理的目的,表的列值在逻辑上被划分为颗粒。
颗粒是流式传输到 ClickHouse 进行数据处理的最小不可分割数据集。
这意味着 ClickHouse 不是读取单独的行,而是始终以流式方式并行读取整组(颗粒)行。
:::note
列值并非物理存储在颗粒内部:颗粒只是用于查询处理的列值的逻辑组织方式。
:::

下图显示了我们表中 887 万行的(列值)如何组织成 1083 个颗粒,这是由于表的 DDL 语句包含设置 `index_granularity`(设置为其默认值 8192)的结果。

<Image
  img={sparsePrimaryIndexes02}
  size='md'
  alt='稀疏主索引 02'
  background='white'
/>

第一批(基于磁盘上的物理顺序)8192 行(它们的列值)在逻辑上属于颗粒 0,然后接下来的 8192 行(它们的列值)属于颗粒 1,依此类推。

:::note

- 最后一个颗粒(颗粒 1082)"包含"少于 8192 行。

- 我们在本指南开头的"DDL 语句详情"中提到,我们禁用了[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)(为了简化本指南中的讨论,并使图表和结果可重现)。

  因此,我们示例表的所有颗粒(除了最后一个)都具有相同的大小。

- 对于具有自适应索引粒度的表(索引粒度[默认](/operations/settings/merge-tree-settings#index_granularity_bytes)是自适应的),某些颗粒的大小可能少于 8192 行,具体取决于行数据大小。

- 我们用橙色标记了主键列(`UserID`、`URL`)中的一些列值。
  这些橙色标记的列值是每个颗粒的第一行的主键列值。
  正如我们将在下面看到的,这些橙色标记的列值将成为表的主索引中的条目。

- 我们从 0 开始对颗粒进行编号,以便与 ClickHouse 内部编号方案保持一致,该方案也用于日志消息。
  :::

### 主索引每个颗粒有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上图所示的颗粒创建的。该索引是一个未压缩的平面数组文件(primary.idx),包含从 0 开始的所谓数值索引标记。

下图显示索引存储每个颗粒的第一行的主键列值(上图中用橙色标记的值)。
换句话说:主索引存储表中每第 8192 行的主键列值(基于主键列定义的物理行顺序)。
例如

- 第一个索引条目(下图中的"标记 0")存储上图中颗粒 0 的第一行的键列值,
- 第二个索引条目(下图中的"标记 1")存储上图中颗粒 1 的第一行的键列值,依此类推。

<Image
  img={sparsePrimaryIndexes03a}
  size='lg'
  alt='稀疏主索引 03a'
  background='white'
/>

对于我们拥有 887 万行和 1083 个颗粒的表,索引总共有 1083 个条目:

<Image
  img={sparsePrimaryIndexes03b}
  size='md'
  alt='稀疏主索引 03b'
  background='white'
/>


:::note
- 对于具有[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，主索引中还会额外存储一个“最终（final）”标记，用于记录表最后一行的主键列的值。但由于我们在本指南中禁用了自适应索引粒度（以简化讨论，并让图示和结果可复现），因此示例表的索引中不包含这个最终标记。

- 主索引文件会被完整加载到内存中。如果该文件大于可用的空闲内存空间，ClickHouse 会报错。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自托管的 ClickHouse 集群中，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a>来检查示例表主索引的内容。

为此，我们首先需要将主索引文件复制到正在运行集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 目录下：
<ul>
<li>步骤 1：获取包含主索引文件的数据分片（part）路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>步骤 2：获取 user_files_path</li>
Linux 上的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 为
`/var/lib/clickhouse/user_files/`

在 Linux 上可以通过如下方式检查它是否被修改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上的路径为 `/Users/tomschreiber/Clickhouse/user_files/`

<li>步骤 3：将主索引文件复制到 user_files_path 中</li>

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
这与我们为示例表绘制的主索引内容示意图完全一致：

</p>
</details>

主键记录被称为索引标记（index marks），因为每条索引记录都标记了一个特定数据范围的起始位置。具体到这个示例表：
- UserID 索引标记：

  主索引中存储的 `UserID` 值按升序排序。<br/>
  因此，上图中的“标记 1”表明：在粒度 1 以及所有后续粒度中的所有表行，其 `UserID` 值都保证大于或等于 4,073,710。



[正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules),这种全局顺序使 ClickHouse 能够在查询对主键的第一列进行过滤时,对第一个键列的索引标记<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分查找算法</a>。

- URL 索引标记:

  主键列 `UserID` 和 `URL` 的基数相当接近,这意味着第一列之后的所有键列的索引标记通常只在前驱键列值在至少当前颗粒内的所有表行中保持不变时才指示数据范围。<br/>
  例如,由于上图中标记 0 和标记 1 的 UserID 值不同,ClickHouse 无法假设颗粒 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是,如果上图中标记 0 和标记 1 的 UserID 值相同(意味着 UserID 值在颗粒 0 内的所有表行中保持不变),则 ClickHouse 可以假设颗粒 0 中所有表行的所有 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们稍后将更详细地讨论这对查询执行性能的影响。

### 主索引用于选择颗粒 {#the-primary-index-is-used-for-selecting-granules}

现在我们可以在主索引的支持下执行查询。

以下查询计算 UserID 749927693 点击次数最多的前 10 个 URL。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
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


结果集包含 10 行。耗时：0.005 秒。

# highlight-next-line

已处理 8.19 千行，
740.18 KB（1.53 百万行/秒，138.59 MB/秒）

```

ClickHouse 客户端的输出现在显示,系统没有执行全表扫描,而是仅向 ClickHouse 流式传输了 8190 行数据。
```


如果启用了 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace 级别日志</a>，那么 ClickHouse 服务器日志文件会显示 ClickHouse 正在对 1083 个 UserID 索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以识别可能包含 UserID 列值为 `749927693` 的 granule。这个过程需要 19 步，其平均时间复杂度为 `O(log2 n)`：

```response
...Executor): 键条件: (列 0 在 [749927693, 749927693] 范围内)
# highlight-next-line
...Executor): 对数据分片 all_1_9_2 的索引范围执行二分查找 (1083 个标记)
...Executor): 找到(左)边界标记: 176
...Executor): 找到(右)边界标记: 177
...Executor): 经过 19 步找到连续范围
...Executor): 通过分区键选择了 1/1 个分片,通过主键选择了 1 个分片,
# highlight-next-line
              通过主键选择了 1/1083 个标记,需从 1 个范围读取 1 个标记
...Reading ...从 1441792 开始读取约 8192 行
```

我们可以在上面的 trace 日志中看到，在现有的 1083 个 mark 中，只有 1 个 mark 满足了查询条件。

<details>
  <summary>
    Trace 日志详情
  </summary>

  <p>
    标识出了 mark 176（“found left boundary mark”为包含边界，“found right boundary mark”为不包含边界），因此来自 granule 176 的全部 8192 行（其起始行为第 1,441,792 行——我们将在本指南后面看到这一点）会被流式传入 ClickHouse，以便查找 `UserID` 列值为 `749927693` 的实际行。
  </p>
</details>

我们还可以在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来重现这一点：

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

响应类似如下：


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

客户端输出显示,在 1083 个数据粒度中,有一个被选中,可能包含 UserID 列值为 749927693 的行。

:::note 结论
当查询对复合键中的某一列进行过滤,且该列是第一个键列时,ClickHouse 会对该键列的索引标记执行二分查找算法。
:::

<br />

如上所述,ClickHouse 使用其稀疏主索引通过二分查找快速选择可能包含与查询匹配行的数据粒度。

这是 ClickHouse 查询执行的**第一阶段(数据粒度选择)**。

在**第二阶段(数据读取)**中,ClickHouse 会定位选中的数据粒度,将其所有行流式传输到 ClickHouse 引擎中,以找到实际与查询匹配的行。

我们将在下一节中更详细地讨论第二阶段。

### 标记文件用于定位数据粒度 {#mark-files-are-used-for-locating-granules}

下图展示了我们表的主索引文件的一部分。

<Image
  img={sparsePrimaryIndexes04}
  size='md'
  alt='Sparse Primary Indices 04'
  background='white'
/>

如上所述,通过对索引的 1083 个 UserID 标记进行二分查找,识别出了标记 176。因此,其对应的数据粒度 176 可能包含 UserID 列值为 749.927.693 的行。

<details>
    <summary>
    数据粒度选择详情
    </summary>
    <p>

上图显示,标记 176 是第一个满足以下条件的索引条目:关联数据粒度 176 的最小 UserID 值小于 749.927.693,而下一个标记(标记 177)对应的数据粒度 177 的最小 UserID 值大于此值。因此,只有标记 176 对应的数据粒度 176 可能包含 UserID 列值为 749.927.693 的行。

</p>
</details>

为了确认(或排除)数据粒度 176 中是否存在 UserID 列值为 749.927.693 的行,需要将属于该数据粒度的全部 8192 行流式传输到 ClickHouse 中。

为此,ClickHouse 需要知道数据粒度 176 的物理位置。

在 ClickHouse 中,表的所有数据粒度的物理位置存储在标记文件中。与数据文件类似,每个表列都有一个对应的标记文件。

下图显示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`,它们分别存储了表的 `UserID`、`URL` 和 `EventTime` 列的数据粒度的物理位置。

<Image
  img={sparsePrimaryIndexes05}
  size='md'
  alt='Sparse Primary Indices 05'
  background='white'
/>

我们已经讨论过,主索引是一个扁平的未压缩数组文件(primary.idx),包含从 0 开始编号的索引标记。

同样,标记文件也是一个扁平的未压缩数组文件(\*.mrk),包含从 0 开始编号的标记。

一旦 ClickHouse 识别并选择了可能包含查询匹配行的数据粒度的索引标记,就可以在标记文件中执行位置数组查找,以获取该数据粒度的物理位置。

特定列的每个标记文件条目以偏移量的形式存储两个位置:


- 第一个偏移量（上图中的 `block_offset`）用于在<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">数据块（block）</a>所在的<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件中，定位包含所选粒度（granule）压缩版本的块。该压缩块中可能包含多个已压缩的粒度。定位到的压缩文件块在读取时会被解压到主内存中。

- 第二个偏移量（上图中的 `granule_offset`）来自标记文件，用于在解压后的块数据中定位具体的粒度。

随后，属于该解压后粒度的全部 8192 行会被流式传入 ClickHouse 以进行后续处理。

:::note

- 对于使用[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且未启用[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse 使用如上所示的 `.mrk` 标记文件，其中每条记录包含两个 8 字节长的地址。这些记录对应粒度的物理位置，且所有粒度大小相同。

 索引粒度在[默认情况下](/operations/settings/merge-tree-settings#index_granularity_bytes)是自适应的，但在我们的示例表中我们禁用了自适应索引粒度（以简化本指南中的讨论，并使图示和结果可复现）。我们的表使用宽格式，是因为数据大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（在自管集群中默认是 10 MB）。

- 对于使用宽格式且启用了自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，其中包含与 `.mrk` 标记文件类似的记录，但每条记录多了第三个值：当前记录关联的粒度所包含的行数。

- 对于使用[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse 使用 `.mrk3` 标记文件。

:::

:::note Why Mark Files

为什么主索引不直接包含与索引标记对应的粒度的物理位置？

因为在 ClickHouse 所面向的这种极大规模下，磁盘和内存使用效率非常重要。

主索引文件需要能够放入主内存。

在我们的示例查询中，ClickHouse 使用主索引并选出一个可能包含满足查询条件行的粒度。只有对于这一个粒度，ClickHouse 才需要物理位置信息，以便流式读取相应的行进行进一步处理。

此外，这些偏移量信息只需要针对 UserID 和 URL 列。

对于查询中未使用的列（例如 `EventTime`），不需要偏移量信息。

在我们的示例查询中，ClickHouse 只需要 UserID 数据文件（UserID.bin）中粒度 176 的两个物理位置偏移量，以及 URL 数据文件（URL.bin）中粒度 176 的两个物理位置偏移量。

标记文件提供的这种间接引用方式，避免了在主索引中直接存储所有三个列的全部 1083 个粒度的物理位置条目，从而避免在主内存中保留不必要的（可能永远不会被使用的）数据。
:::

下图及其后文字说明展示了在我们的示例查询中，ClickHouse 如何在 UserID.bin 数据文件中定位粒度 176。

<Image img={sparsePrimaryIndexes06} size="md" alt="稀疏主索引 06" background="white"/>

我们在本指南前面已经讨论过，ClickHouse 选择了主索引标记 176，因此选择了粒度 176 作为可能包含满足查询条件行的粒度。

ClickHouse 现在使用从索引中选出的标记号（176），在 UserID.mrk 标记文件中通过位置数组查找，获取定位粒度 176 所需的两个偏移量。

如图所示，第一个偏移量用于在 UserID.bin 数据文件中定位压缩文件块，该块又包含粒度 176 的压缩版本。

当定位到的文件块被解压到主内存之后，可以使用来自标记文件的第二个偏移量在解压数据中定位粒度 176。

为了执行我们的示例查询（针对 UserID 为 749.927.693 的互联网用户，查询点击次数最多的前 10 个 URL），ClickHouse 需要在 UserID.bin 数据文件和 URL.bin 数据文件中同时定位并流式读取粒度 176 的全部值。



上图展示了 ClickHouse 如何为 UserID.bin 数据文件定位对应的 granule。

与此同时，ClickHouse 正在为 URL.bin 数据文件的 granule 176 执行相同的操作。两个对应的 granule 会对齐并以流式方式传入 ClickHouse 引擎进行后续处理，即对所有 UserID 为 749.927.693 的行按分组聚合并统计 URL 值的出现次数，最后按计数降序输出前 10 个 URL 分组。



## 使用多个主索引 {#using-multiple-primary-indexes}

<a name='filtering-on-key-columns-after-the-first'></a>

### 辅助键列可能（不）低效 {#secondary-key-columns-can-not-be-inefficient}

当查询在复合键的某个列上进行过滤，且该列是第一个键列时,[ClickHouse 会对该键列的索引标记执行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是,当查询在复合键的某个列上进行过滤,但该列不是第一个键列时,会发生什么情况呢?

:::note
我们讨论的场景是查询明确不在第一个键列上进行过滤,而是在辅助键列上进行过滤。

当查询同时在第一个键列和第一个键列之后的任意键列上进行过滤时,ClickHouse 会对第一个键列的索引标记执行二分查找。
:::

<br />
<br />

<a name='query-on-url'></a>
我们使用一个查询来计算点击 URL "http://public_search" 次数最多的前 10 个用户:

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应结果为: <a name="query-on-url-slow"></a>

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


共 10 行。耗时：0.086 秒。

# highlight-next-line

已处理 8.81 百万行，
799.69 MB（102.11 百万行/秒，9.27 GB/秒）

```

客户端输出表明,尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key),ClickHouse 仍然几乎执行了全表扫描!ClickHouse 从表中的 887 万行数据中读取了 881 万行。
```


如果启用了 [trace_logging](/operations/server-configuration-parameters/settings#logger),ClickHouse 服务器日志文件会显示 ClickHouse 对 1083 个 URL 索引标记使用了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>,以识别可能包含 URL 列值为 "http://public_search" 的行的颗粒:

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

从上面的示例跟踪日志中可以看到,1083 个颗粒中有 1076 个(通过标记)被选中为可能包含匹配 URL 值的行。

这导致 881 万行被流式传输到 ClickHouse 引擎(通过 10 个流并行处理),以识别实际包含 URL 值 "http://public_search" 的行。

然而,正如我们稍后将看到的,在选中的 1076 个颗粒中,实际上只有 39 个颗粒包含匹配的行。

虽然基于复合主键 (UserID, URL) 的主索引对于加速过滤具有特定 UserID 值的行的查询非常有用,但该索引对于加速过滤具有特定 URL 值的行的查询并没有提供显著帮助。

原因在于 URL 列不是第一个键列,因此 ClickHouse 对 URL 列的索引标记使用通用排除搜索算法(而不是二分搜索),并且**该算法的有效性取决于基数差异**,即 URL 列与其前驱键列 UserID 之间的基数差异。

为了说明这一点,我们提供一些关于通用排除搜索工作原理的详细信息。

<a name='generic-exclusion-search-algorithm'></a>

### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

以下说明了当通过次要列选择颗粒时,<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse 通用排除搜索算法</a>如何工作,其中前驱键列具有较低或较高的基数。

作为两种情况的示例,我们假设:

- 查询正在搜索 URL 值 = "W3" 的行。
- hits 表的抽象版本,其中 UserID 和 URL 的值已简化。
- 索引使用相同的复合主键 (UserID, URL)。这意味着行首先按 UserID 值排序。具有相同 UserID 值的行然后按 URL 排序。
- 颗粒大小为 2,即每个颗粒包含两行。

在下面的图表中,我们用橙色标记了每个颗粒的第一个表行的键列值。

**前驱键列具有较低基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 具有较低的基数。在这种情况下,相同的 UserID 值很可能分布在多个表行和颗粒中,因此也分布在多个索引标记中。对于具有相同 UserID 的索引标记,索引标记的 URL 值按升序排序(因为表行首先按 UserID 排序,然后按 URL 排序)。这允许进行高效的过滤,如下所述:

<Image
  img={sparsePrimaryIndexes07}
  size='md'
  alt='Sparse Primary Indices 06'
  background='white'
/>

对于上图中的抽象示例数据,颗粒选择过程有三种不同的场景:

1.  索引标记 0 的 **URL 值小于 W3,并且直接后续索引标记的 URL 值也小于 W3**,可以被排除,因为标记 0 和 1 具有相同的 UserID 值。请注意,这个排除前提条件确保颗粒 0 完全由 U1 UserID 值组成,因此 ClickHouse 可以假设颗粒 0 中的最大 URL 值也小于 W3,从而排除该颗粒。


2. 选择索引标记 1,因为其 **URL 值小于(或等于)W3,且其直接后继索引标记的 URL 值大于(或等于)W3**,这意味着颗粒 1 可能包含 URL 为 W3 的行。

3. 可以排除索引标记 2 和 3,因为它们的 **URL 值大于 W3**。由于主索引的索引标记存储每个颗粒第一行的键列值,且表行在磁盘上按键列值排序,因此颗粒 2 和 3 不可能包含 URL 值 W3。

**前驱键列具有较高基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 具有高基数时,相同的 UserID 值不太可能分布在多个表行和颗粒中。这意味着索引标记的 URL 值不是单调递增的:

<Image
  img={sparsePrimaryIndexes08}
  size='md'
  alt='Sparse Primary Indices 06'
  background='white'
/>

如上图所示,所有 URL 值小于 W3 的标记都被选中,以便将其关联颗粒的行流式传输到 ClickHouse 引擎中。

这是因为虽然图中所有索引标记都属于上述场景 1,但它们不满足所提到的排除前提条件,即_直接后继索引标记与当前标记具有相同的 UserID 值_,因此无法被排除。

例如,考虑索引标记 0,其 **URL 值小于 W3,且其直接后继索引标记的 URL 值也小于 W3**。这_不能_被排除,因为直接后继索引标记 1 与当前标记 0 的 UserID 值_不_相同。

这最终导致 ClickHouse 无法对颗粒 0 中的最大 URL 值做出假设。相反,它必须假设颗粒 0 可能包含 URL 值为 W3 的行,因此被迫选择标记 0。

标记 1、2 和 3 的情况也是如此。

:::note 结论
当查询过滤的列是复合键的一部分但不是第一个键列时,ClickHouse 使用的<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a>而非<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索算法</a>,在前驱键列具有较低基数时最为有效。
:::

在我们的示例数据集中,两个键列(UserID、URL)都具有相似的高基数,如前所述,当 URL 列的前驱键列具有较高或相似的基数时,通用排除搜索算法效果不佳。

### 关于数据跳过索引的说明 {#note-about-data-skipping-index}

由于 UserID 和 URL 的基数同样较高,我们在[具有复合主键(UserID、URL)的表](#a-table-with-a-primary-key)的 URL 列上创建[辅助数据跳过索引](./skipping-indexes.md),对[基于 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)也不会带来太多好处。

例如,以下两条语句在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) 数据跳过索引:

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse 现在创建了一个额外的索引,该索引为每组 4 个连续的[颗粒](#data-is-organized-into-granules-for-parallel-data-processing)(注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句)存储最小和最大 URL 值:

<Image
  img={sparsePrimaryIndexes13a}
  size='md'
  alt='Sparse Primary Indices 13a'
  background='white'
/>

第一个索引条目(上图中的"标记 0")存储[属于我们表的前 4 个颗粒的行](#data-is-organized-into-granules-for-parallel-data-processing)的最小和最大 URL 值。


第二个索引条目（'mark 1'）存储了表中接下来 4 个颗粒所属行的最小和最大 URL 值，依此类推。

（ClickHouse 还为数据跳过索引创建了一个特殊的 [mark 文件](#mark-files-are-used-for-locating-granules)，用于[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的颗粒组。）

由于 UserID 和 URL 同样具有高基数，当执行我们的 [URL 过滤查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时，这个辅助数据跳过索引无法帮助排除颗粒的选择。

查询要查找的特定 URL 值（即 'http://public_search'）很可能位于索引为每组颗粒存储的最小值和最大值之间，这导致 ClickHouse 被迫选择该颗粒组（因为它们可能包含与查询匹配的行）。

### 使用多个主索引的需求 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想要显著加速过滤特定 URL 行的示例查询，就需要使用针对该查询优化的主索引。

此外，如果我们还想保持过滤特定 UserID 行的示例查询的良好性能，那么就需要使用多个主索引。

以下展示了实现这一目标的方法。

<a name='multiple-primary-indexes'></a>

### 创建额外主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们想要显著加速两个示例查询——一个过滤特定 UserID 的行，另一个过滤特定 URL 的行——那么需要使用以下三个选项之一来使用多个主索引：

- 创建具有不同主键的**第二个表**。
- 在现有表上创建**物化视图**。
- 向现有表添加**投影**。

这三个选项都会有效地将示例数据复制到一个额外的表中，以便重新组织表的主索引和行排序顺序。

然而，这三个选项在额外表对用户的透明度方面有所不同，特别是在查询和插入语句的路由方面。

当创建具有不同主键的**第二个表**时，查询必须显式发送到最适合该查询的表版本，并且必须将新数据显式插入到两个表中以保持表的同步：

<Image
  img={sparsePrimaryIndexes09a}
  size='md'
  alt='Sparse Primary Indices 09a'
  background='white'
/>

使用**物化视图**时，额外的表会隐式创建，并且数据会在两个表之间自动保持同步：

<Image
  img={sparsePrimaryIndexes09b}
  size='md'
  alt='Sparse Primary Indices 09b'
  background='white'
/>

而**投影**是最透明的选项，因为除了自动保持隐式创建（且隐藏）的额外表与数据变更同步外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image
  img={sparsePrimaryIndexes09c}
  size='md'
  alt='Sparse Primary Indices 09c'
  background='white'
/>

接下来，我们将更详细地讨论这三个创建和使用多个主索引的选项，并提供实际示例。

<a name='multiple-primary-indexes-via-secondary-tables'></a>

### 选项 1：辅助表 {#option-1-secondary-tables}

<a name='secondary-table'></a>
我们正在创建一个新的额外表，其中我们在主键中交换了键列的顺序（与原始表相比）：

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

将[原始表](#a-table-with-a-primary-key)中的所有 887 万行插入到额外表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
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


由于我们调整了主键中列的顺序，新插入的行现在在磁盘上的字典序存储顺序（相较于我们的[原始表](#a-table-with-a-primary-key)）已经不同，因此该表的 1083 个 granule 中所包含的值也随之发生了变化：

<Image img={sparsePrimaryIndexes10} size="md" alt="稀疏主索引 10" background="white" />

这是新的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="稀疏主索引 11" background="white" />

现在可以利用这个主键，大幅加速我们示例查询的执行——该查询在 URL 列上进行过滤，用于计算最频繁点击 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的前 10 位用户：

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


结果集 10 行。耗时：0.017 秒。

# highlight-next-line

已处理 319.49 千行，
11.38 MB（18.41 百万行/秒，655.75 MB/秒）。

```

现在,ClickHouse 不再[几乎执行全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns),而是以更高效的方式执行该查询。

在[原始表](#a-table-with-a-primary-key)的主索引中,UserID 为第一键列,URL 为第二键列,ClickHouse 对索引标记使用[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)来执行该查询,但由于 UserID 和 URL 的基数都很高,因此效果不佳。
```


将 URL 作为主索引的第一列后,ClickHouse 现在对索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>。
ClickHouse 服务器日志文件中的相应跟踪日志证实了这一点:

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

请注意,这个附加表经过优化,用于加速按 URL 过滤的示例查询的执行。

与我们[原始表](#a-table-with-a-primary-key)中该查询的[糟糕性能](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)类似,我们[按 `UserIDs` 过滤的示例查询](#the-primary-index-is-used-for-selecting-granules)在新的附加表上运行效率不会很高,因为 UserID 现在是该表主索引中的第二个键列,因此 ClickHouse 将使用通用排除搜索来选择颗粒,而这对于 UserID 和 URL 同样高的基数[效率不高](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
展开详细信息框查看具体内容。

<details>
    <summary>
    按 UserID 过滤的查询现在性能较差<a name="query-on-userid-slow"></a>
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


10 行结果。耗时：0.024 秒。

# highlight-next-line

已处理 8.02 百万行，
73.04 MB (340.26 百万行/秒，3.10 GB/秒)

```
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

现在我们有两个表，分别针对加速基于 `UserIDs` 过滤的查询和加速基于 URLs 过滤的查询进行了优化：

### 选项 2：物化视图 {#option-2-materialized-views}

在现有表上创建一个[物化视图](/sql-reference/statements/create/view.md)。

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

- 我们在视图的主键中调换了键列的顺序（与我们的[原始表](#a-table-with-a-primary-key)相比）
- 物化视图由一个**隐式创建的表**支持，该表的行顺序和主索引基于给定的主键定义
- 隐式创建的表会在 `SHOW TABLES` 查询中列出，其名称以 `.inner` 开头
- 也可以先显式创建物化视图的底层表，然后视图可以通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md)指向该表
- 我们使用 `POPULATE` 关键字立即将源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的所有 887 万行填充到隐式创建的表中
- 如果向源表 hits_UserID_URL 插入新行，这些行也会自动插入到隐式创建的表中
- 实际上，隐式创建的表与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Sparse Primary Indices 12b1'
  background='white'
/>

ClickHouse 将隐式创建的表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（_.bin）、[标记文件](#mark-files-are-used-for-locating-granules)（_.mrk2）和[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在 ClickHouse 服务器数据目录中的一个特殊文件夹内：

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Sparse Primary Indices 12b2'
  background='white'
/>

:::

支持物化视图的隐式创建的表（及其主索引）现在可以用于显著加速我们基于 URL 列过滤的示例查询的执行：

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

```


10 行数据，耗时：0.026 秒。

# highlight-next-line

已处理 335.87 千行，
13.54 MB（12.91 百万行/秒，520.38 MB/秒）

```

由于物化视图底层隐式创建的表(及其主索引)实际上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)完全相同,因此查询的执行方式与使用显式创建的表时相同。

ClickHouse 服务器日志文件中的相应跟踪日志确认了 ClickHouse 正在对索引标记执行二分查找:
```


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

### 选项 3:投影 {#option-3-projections}

在现有表上创建投影:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

物化该投影:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

- 投影会创建一个**隐藏表**,其行顺序和主索引基于投影中给定的 `ORDER BY` 子句
- 隐藏表不会在 `SHOW TABLES` 查询中列出
- 我们使用 `MATERIALIZE` 关键字立即将源表 [hits_UserID_URL](#a-table-with-a-primary-key) 中的全部 887 万行数据填充到隐藏表中
- 如果向源表 hits_UserID_URL 插入新行,这些行也会自动插入到隐藏表中
- 查询始终(在语法上)针对源表 hits_UserID_URL,但如果隐藏表的行顺序和主索引能够实现更高效的查询执行,则会使用该隐藏表
- 请注意,即使 ORDER BY 与投影的 ORDER BY 语句匹配,投影也不会提高使用 ORDER BY 的查询效率(参见 https://github.com/ClickHouse/ClickHouse/issues/47333)
- 实际上,隐式创建的隐藏表与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引:

<Image
  img={sparsePrimaryIndexes12c1}
  size='md'
  alt='Sparse Primary Indices 12c1'
  background='white'
/>

ClickHouse 将隐藏表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)(_.bin)、[标记文件](#mark-files-are-used-for-locating-granules)(_.mrk2)和[主索引](#the-primary-index-has-one-entry-per-granule)(primary.idx)存储在一个特殊文件夹中(在下面的截图中以橙色标记),该文件夹位于源表的数据文件、标记文件和主索引文件旁边:

<Image
  img={sparsePrimaryIndexes12c2}
  size='sm'
  alt='Sparse Primary Indices 12c2'
  background='white'
/>

:::

投影创建的隐藏表(及其主索引)现在可以(隐式地)用于显著加速在 URL 列上进行过滤的示例查询的执行。请注意,该查询在语法上针对的是投影的源表。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应结果为:

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


10 行。耗时：0.029 秒。

# 高亮下一行

已处理 319.49 千行，1.38 MB（11.05 百万行/秒，393.58 MB/秒）

```

由于投影创建的隐藏表(及其主索引)实际上与我们[显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同,因此查询的执行方式与使用显式创建的表时完全一致。

ClickHouse 服务器日志文件中的相应跟踪日志确认了 ClickHouse 正在对索引标记执行二分查找:
```


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

我们的[具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key)的主索引对于加速[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)非常有用。但是,尽管 URL 列是复合主键的一部分,该索引对于加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)并没有提供显著帮助。

反之亦然:
我们的[具有复合主键 (URL, UserID) 的表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)的主索引加速了[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient),但对[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)没有提供太多支持。

由于主键列 UserID 和 URL 的基数都同样很高,对第二个键列进行过滤的查询[从第二个键列在索引中并不能获得太多收益](#generic-exclusion-search-algorithm)。

因此,从主索引中移除第二个键列(从而减少索引的内存消耗)并[使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)是有意义的。

但是,如果复合主键中的键列在基数上存在较大差异,那么按基数升序排列主键列对[查询是有益的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大,这些列在键中的顺序就越重要。我们将在下一节中演示这一点。


## 高效排序键列 {#ordering-key-columns-efficiently}

<a name='test'></a>

在复合主键中,键列的顺序会显著影响以下两个方面:

- 查询中对次要键列进行过滤的效率,以及
- 表数据文件的压缩比。

为了演示这一点,我们将使用我们的[网络流量示例数据集](#data-set)的一个版本,其中每行包含三列,用于指示互联网"用户"(`UserID` 列)对 URL(`URL` 列)的访问是否被标记为机器人流量(`IsRobot` 列)。

我们将使用包含上述所有三列的复合主键,该主键可用于加速典型的网络分析查询,这些查询计算

- 特定 URL 的流量中有多少(百分比)来自机器人,或
- 我们对特定用户是(不是)机器人的置信度(该用户的流量中有多少百分比被(不)假定为机器人流量)

我们使用此查询来计算我们想要在复合主键中用作键列的三列的基数(请注意,我们使用 [URL 表函数](/sql-reference/table-functions/url.md)来即席查询 TSV 数据,而无需创建本地表)。在 `clickhouse client` 中运行此查询:

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

响应为:

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

我们可以看到基数之间存在很大差异,特别是 `URL` 和 `IsRobot` 列之间,因此这些列在复合主键中的顺序对于有效加速对这些列进行过滤的查询以及实现表列数据文件的最佳压缩比都非常重要。

为了演示这一点,我们为机器人流量分析数据创建两个表版本:

- 一个表 `hits_URL_UserID_IsRobot`,其复合主键为 `(URL, UserID, IsRobot)`,其中我们按基数降序排列键列
- 一个表 `hits_IsRobot_UserID_URL`,其复合主键为 `(IsRobot, UserID, URL)`,其中我们按基数升序排列键列

创建表 `hits_URL_UserID_IsRobot`,其复合主键为 `(URL, UserID, IsRobot)`:

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

并用 887 万行数据填充它:

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

响应为:

```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

接下来,创建表 `hits_IsRobot_UserID_URL`,其复合主键为 `(IsRobot, UserID, URL)`:

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

并用我们用于填充前一个表的相同 887 万行数据填充它:


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

响应结果为:

```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### 对辅助键列进行高效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询对复合键中至少一个列进行过滤,且该列是第一个键列时,[ClickHouse 会对该键列的索引标记执行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

当查询(仅)对复合键中的某个列进行过滤,但该列不是第一个键列时,[ClickHouse 会对该键列的索引标记使用通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况,复合主键中键列的排序顺序对[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的有效性至关重要。

以下查询对表的 `UserID` 列进行过滤,该表的键列 `(URL, UserID, IsRobot)` 按基数降序排列:

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

响应结果为:

```response
┌─count()─┐
│      73 │
└─────────┘

```


1 行结果。耗时: 0.026 秒。

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

返回结果为：

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行结果。耗时：0.003 秒。

# highlight-next-line

处理了 20.32 千行，
81.28 KB（6.61 百万行/秒，26.44 MB/秒）

````

我们可以看到,在按基数升序排列键列的表上,查询执行效率明显更高且速度更快。

原因在于[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)在以下情况下最为有效:通过次级键列选择[颗粒](#the-primary-index-is-used-for-selecting-granules)时,其前置键列具有较低的基数。我们在本指南的[前面章节](#generic-exclusion-search-algorithm)中对此进行了详细说明。

### 数据文件的最优压缩率 {#optimal-compression-ratio-of-data-files}

此查询比较上面创建的两个表中 `UserID` 列的压缩率:

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

这是响应结果：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 行结果集。耗时：0.006 秒。
```

我们可以看到，对于按基数升序排列键列 `(IsRobot, UserID, URL)` 的表，`UserID` 列的压缩率要高得多。

尽管这两个表中存储的数据完全相同（我们向两个表中都插入了相同的 887 万行数据），但复合主键中键列的顺序会显著影响表中<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>数据在[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)上占用的磁盘空间：

* 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，键列按基数降序排列，此时 `UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
* 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，键列按基数升序排列，此时 `UserID.bin` 数据文件只占用 **877.47 KiB** 的磁盘空间

对于表中某列在磁盘上的数据，更高的压缩率不仅可以节省磁盘空间，还可以加快需要从该列读取数据的查询（尤其是分析型查询），因为将该列数据从磁盘移动到主内存（操作系统的文件缓存）所需的 I/O 更少。

下面我们将说明，为了提高表各列的压缩率，将主键列按基数升序排列为何是有益的。

下图示意了在主键的键列按基数升序排列时，行在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

我们已经讨论过，[表的行数据在磁盘上是按主键列顺序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。


在上图中,表的行(磁盘上的列值)首先按 `cl` 值排序,具有相同 `cl` 值的行再按 `ch` 值排序。由于第一个键列 `cl` 的基数较低,很可能存在多个具有相同 `cl` 值的行。因此,`ch` 值也很可能是有序的(局部有序 - 针对具有相同 `cl` 值的行)。

如果列中的相似数据彼此相邻放置(例如通过排序),那么这些数据将获得更好的压缩效果。
一般来说,压缩算法受益于数据的游程长度(处理的数据越多,压缩效果越好)
以及局部性(数据越相似,压缩比越高)。

与上图相反,下图展示了主键列按基数降序排列时行在磁盘上的顺序:

<Image
  img={sparsePrimaryIndexes14b}
  size='md'
  alt='稀疏主索引 14b'
  background='white'
/>

现在表的行首先按 `ch` 值排序,具有相同 `ch` 值的行再按 `cl` 值排序。
但由于第一个键列 `ch` 的基数较高,不太可能存在多个具有相同 `ch` 值的行。因此,`cl` 值也不太可能是有序的(局部有序 - 针对具有相同 `ch` 值的行)。

因此,`cl` 值很可能呈随机顺序,从而导致较差的局部性和压缩比。

### 总结 {#summary-1}

无论是对于查询中次要键列的高效过滤,还是对于表列数据文件的压缩比,按基数升序排列主键中的列都是有益的。


## 高效识别单行 {#identifying-single-rows-efficiently}

尽管通常这[并非](/knowledgebase/key-value) ClickHouse 的最佳使用场景,
但有时基于 ClickHouse 构建的应用程序需要识别 ClickHouse 表中的单行数据。

一个直观的解决方案是使用 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列,每行具有唯一值,并将该列用作主键列以实现快速检索。

为了实现最快的检索速度,UUID 列[需要作为第一个键列](#the-primary-index-is-used-for-selecting-granules)。

我们之前讨论过,由于 [ClickHouse 表的行数据在磁盘上按主键列排序存储](#data-is-stored-on-disk-ordered-by-primary-key-columns),在主键中使用非常高基数的列(如 UUID 列),或在复合主键中将其置于较低基数列之前,[会对其他表列的压缩率产生不利影响](#optimal-compression-ratio-of-data-files)。

在最快检索和最优数据压缩之间的折衷方案是使用复合主键,其中 UUID 作为最后一个键列,位于较低基数的键列之后,这些低基数列用于确保表中某些列获得良好的压缩率。

### 具体示例 {#a-concrete-example}

一个具体示例是 Alexey Milovidov 开发的纯文本粘贴服务 [https://pastila.nl](https://pastila.nl),他在[博客中介绍过该服务](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

每次文本区域发生更改时,数据都会自动保存到 ClickHouse 表的一行中(每次更改对应一行)。

识别和检索粘贴内容(特定版本)的一种方法是使用内容的哈希值作为包含该内容的表行的 UUID。

下图显示了

- 内容更改时行的插入顺序(例如由于在文本区域中键入文本的按键操作),以及
- 使用 `PRIMARY KEY (hash)` 时插入行数据在磁盘上的顺序:

<Image
  img={sparsePrimaryIndexes15a}
  size='md'
  alt='Sparse Primary Indices 15a'
  background='white'
/>

由于 `hash` 列被用作主键列

- 可以[非常快速地](#the-primary-index-is-used-for-selecting-granules)检索特定行,但
- 表的行(其列数据)在磁盘上按(唯一且随机的)哈希值升序存储。因此,内容列的值也以随机顺序存储,没有数据局部性,导致**内容列数据文件的压缩率欠佳**。

为了显著提高内容列的压缩率,同时仍能快速检索特定行,pastila.nl 使用两个哈希值(和一个复合主键)来识别特定行:

- 如上所述的内容哈希值,对于不同的数据具有不同的值,以及
- 一个[局部敏感哈希(指纹)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing),在数据发生小的更改时**不会**改变。

下图显示了

- 内容更改时行的插入顺序(例如由于在文本区域中键入文本的按键操作),以及
- 使用复合 `PRIMARY KEY (fingerprint, hash)` 时插入行数据在磁盘上的顺序:

<Image
  img={sparsePrimaryIndexes15b}
  size='md'
  alt='Sparse Primary Indices 15b'
  background='white'
/>

现在磁盘上的行首先按 `fingerprint` 排序,对于具有相同指纹值的行,它们的 `hash` 值决定最终顺序。

由于仅在小的更改上有所不同的数据会获得相同的指纹值,相似的数据现在在内容列中彼此相邻地存储在磁盘上。这对内容列的压缩率非常有利,因为压缩算法通常受益于数据局部性(数据越相似,压缩率越高)。

折衷之处在于需要两个字段(`fingerprint` 和 `hash`)来检索特定行,以便最优地利用复合 `PRIMARY KEY (fingerprint, hash)` 产生的主索引。
