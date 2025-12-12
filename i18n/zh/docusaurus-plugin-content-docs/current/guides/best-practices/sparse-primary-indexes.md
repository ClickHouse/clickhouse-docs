---
sidebar_label: '主索引'
sidebar_position: 1
description: '在本指南中，我们将深入解析 ClickHouse 的索引机制。'
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

# ClickHouse 主索引实用入门指南 {#a-practical-introduction-to-primary-indexes-in-clickhouse}

## 介绍 {#introduction}

在本指南中，我们将深入探讨 ClickHouse 的索引机制。我们将详细说明：

- [ClickHouse 中的索引与传统关系型数据库管理系统中的索引有何不同](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建并使用数据表的稀疏主索引](#a-table-with-a-primary-key)
- [在 ClickHouse 中设计和使用索引的一些最佳实践](#using-multiple-primary-indexes)

你可以选择在本地环境中自行执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和入门说明，请参阅[快速开始](/get-started/quick-start)。

:::note
本指南重点介绍 ClickHouse 的稀疏主索引。

关于 ClickHouse 的[二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅[教程](/guides/best-practices/skipping-indexes.md)。
:::

### 数据集 {#data-set}

在整个指南中，我们将使用一个匿名化的 Web 流量示例数据集。

- 我们将使用该示例数据集中的一个子集，共 887 万行（事件）。
- 未压缩的数据大小为 887 万个事件，大约 700 MB。存储在 ClickHouse 中时压缩后约为 200 MB。
- 在我们的子集中，每一行包含三列，分别表示某个互联网用户（`UserID` 列）在特定时间（`EventTime` 列）点击了某个 URL（`URL` 列）。

仅凭这三列，我们已经可以编写一些典型的 Web 分析查询，例如：

- “对于某个特定用户，被点击次数最多的 10 个 URL 是哪些？”
- “对于某个特定 URL，点击该 URL 最频繁的前 10 个用户是谁？”
- “用户点击某个特定 URL 时，最热门的时间段是什么（例如一周中的哪几天）？”

### 测试机器 {#test-machine}

本文中给出的所有运行时数据均基于在一台配备 Apple M1 Pro 芯片和 16GB 内存的 MacBook Pro 上本地运行 ClickHouse 22.2.1 所得。

### 全表扫描 {#a-full-table-scan}

为了了解在没有主键的数据集上查询是如何执行的，我们通过执行以下 SQL DDL 语句来创建一张使用 MergeTree 表引擎的表：

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

接下来，使用以下 SQL `INSERT` 语句将 hits 数据集的一个子集插入到该表中。
这里使用了 [URL 表函数](/sql-reference/table-functions/url.md)，以便从 clickhouse.com 上托管的完整数据集中远程加载一个子集：

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

0 行数据。用时:145.993 秒。已处理 887 万行,18.40 GB(60.78 千行/秒,126.06 MB/秒)。
```

ClickHouse 客户端的结果输出显示，上述语句向该表插入了 887 万行记录。

最后，为了简化本指南后续的讨论，并使图示和结果便于复现，我们使用 FINAL 关键字对该表进行 [优化](/sql-reference/statements/optimize.md)：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般来说，在将数据加载到表之后，既不需要也不建议立即对表进行优化。至于为什么在本示例中需要这样做，稍后就会变得清楚。
:::

现在我们来执行第一个网站分析查询。下面的查询会计算出针对 UserID 为 749927693 的互联网用户，点击次数最多的前 10 个 URL：

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

返回了 10 行。耗时：0.022 秒。
# highlight-next-line {#highlight-next-line}
处理了 887 万行，
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse 客户端的结果输出表明，ClickHouse 执行了一次全表扫描！我们表中 887 万行数据的每一行都被流式写入了 ClickHouse。这样是无法很好扩展的。

要让这一过程（大幅）更高效、（显著）更快速，我们需要使用一个具有合适主键的表。这样 ClickHouse 就可以自动基于主键列创建稀疏主索引，从而显著加速我们示例查询的执行。

## ClickHouse 索引设计 {#clickhouse-index-design}

### 面向海量数据规模的索引设计 {#an-index-design-for-massive-data-scales}

在传统的关系型数据库管理系统中，主索引会为表中的每一行维护一个条目。对我们的数据集来说，这意味着主索引中将包含 887 万个条目。这样的索引能够快速定位特定行，从而在查找查询和点更新场景中提供高效率。在 `B(+)-Tree` 数据结构中查找一个条目，其平均时间复杂度为 `O(log n)`；更精确地说，为 `log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是被索引的行数。由于 `b` 通常在几百到几千之间，`B(+)-Trees` 是非常“浅”的结构，为定位记录只需要少量磁盘寻道。以 887 万行、分支因子为 1000 为例，平均只需要 2.3 次磁盘寻道。这种能力是有代价的：需要额外的磁盘和内存开销，向表中插入新行并向索引添加条目时插入成本更高，有时还需要对 B-Tree 进行重新平衡。

鉴于与 B-Tree 索引相关的这些挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse 的 [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) 被设计并优化用于处理海量数据。这些表被设计为每秒可以接收数百万行插入，并存储非常大规模的数据（数百 PB）。数据会被快速写入表的[各个 part](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)，并在后台根据规则对这些 part 进行合并。在 ClickHouse 中，每个 part 都有自己的主索引。当 part 被合并时，合并后 part 的主索引也会相应合并。由于 ClickHouse 是为极大规模而设计的，因此在磁盘和内存使用方面必须极其高效。因此，ClickHouse 并不是对每一行进行索引，而是让每个 part 的主索引对一组行（称为 “granule”）维护一个索引条目（称为 “mark”）——这种技术称为 **稀疏索引（sparse index）**。

稀疏索引之所以可行，是因为 ClickHouse 在磁盘上存储某个 part 的行时，会按主键列的顺序进行组织。稀疏主索引并不像基于 B-Tree 的索引那样直接定位单行，而是通过对索引条目进行二分查找，快速识别出**可能**匹配查询的行组。被定位出的这些可能匹配的行组（granule）随后会并行地流式传入 ClickHouse 引擎，以查找真正的匹配行。这种索引设计使得主索引可以保持很小（并且可以、也必须完全常驻内存），同时仍能显著加速查询执行时间，特别是对数据分析场景中常见的范围查询。

下面将详细说明 ClickHouse 如何构建和使用其稀疏主索引。在本文后续部分，我们还将讨论在构建索引（主键列）时，关于选择、移除和排序相关表列的一些最佳实践。

### 带主键的表 {#a-table-with-a-primary-key}

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
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # "<details open>"

<details>
  <summary>
    DDL 语句详解
  </summary>

  <p>
    为了简化本指南后续的讨论，并使图示和结果便于复现，这条 DDL 语句：

    <ul>
      <li>
        通过 <code>ORDER BY</code> 子句为该表指定了一个复合排序键。
      </li>

      <li>
        通过以下设置显式控制主索引将包含多少条索引条目：

        <ul>
          <li>
            <code>index&#95;granularity</code>：显式设置为其默认值 8192。这意味着对于每 8192 行数据，主索引会有一条索引条目。比如，如果表中包含 16384 行，那么索引会有两条索引条目。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>：设置为 0 以禁用 <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度（adaptive index granularity）</a>。自适应索引粒度意味着，当下列任一条件满足时，ClickHouse 会自动为一组 n 行创建一条索引条目：

            <ul>
              <li>
                如果 <code>n</code> 小于 8192，并且这 <code>n</code> 行合并后的行数据大小大于或等于 10 MB（<code>index&#95;granularity&#95;bytes</code> 的默认值）。
              </li>

              <li>
                如果这 <code>n</code> 行合并后的行数据大小小于 10 MB，但 <code>n</code> 为 8192。
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>：设置为 0 以禁用 <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引压缩</a>。这将允许我们在后续按需检查其内容。
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

上面的 DDL 语句中的主键会基于这两个指定的键列创建主索引。

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

响应结果如下所示：

```response
返回 0 行。用时:149.432 秒。已处理 887 万行,18.40 GB(59.38 千行/秒,123.16 MB/秒)。
```

<br />

并优化该表：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

我们可以使用以下查询来获取该表的元数据信息：

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
行数:                        8.87 million
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

结果集包含 1 行。用时：0.003 秒。
```

ClickHouse 客户端的输出显示：

* 表的数据以磁盘上特定目录中的[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)存储，这意味着在该目录中，表中的每一列都会对应一个数据文件（以及一个标记文件）。
* 该表包含 8.87 百万行。
* 所有行未压缩的数据总大小为 733.28 MB。
* 所有行在磁盘上的压缩总大小为 206.94 MB。
* 该表具有一个包含 1083 个条目的主索引（称为“标记”（marks）），索引大小为 96.93 KB。
* 总计，该表的数据文件、标记文件和主索引文件在磁盘上一共占用 207.07 MB。

### 数据在磁盘上按照主键列的顺序存储 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

我们在上面创建的表具有：

- 一个复合[主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`，以及
- 一个复合[排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

- 如果只指定排序键，那么主键会被隐式地定义为与排序键相同。

- 为了提高内存使用效率，我们显式指定了一个只包含查询过滤列的主键。基于主键的主索引会被完整加载到内存中。

- 为了在本指南中的图示保持一致性，并最大化压缩比，我们定义了一个单独的排序键，它包含表的所有列（如果某一列中相似的数据彼此靠近，例如通过排序实现，那么这些数据会有更好的压缩效果）。

- 当同时指定主键和排序键时，主键必须是排序键的前缀。
:::

插入的行在磁盘上按照主键列（以及来自排序键的额外 `EventTime` 列）的字典序升序存储。

:::note
ClickHouse 允许插入多行具有相同主键列值的数据。在这种情况下（参见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此由 `EventTime` 列的值决定。
:::

ClickHouse 是一款<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">列式数据库管理系统</a>。如下图所示：

- 在磁盘存储层面，每个表列对应一个数据文件（*.bin），该列的所有值都以<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>格式存储，并且
- 这 887 万行数据在磁盘上按照主键列（以及额外的排序键列）的字典序升序存储，即在本例中：
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是磁盘上的数据文件，分别存储 `UserID`、`URL` 和 `EventTime` 列的值。

:::note

- 由于主键定义了行在磁盘上的字典序顺序，因此一个表只能有一个主键。

- 我们从 0 开始为行编号，以与 ClickHouse 内部用于日志消息的行编号方案保持一致。
:::

### 数据被组织成 granule 以便并行数据处理 {#data-is-organized-into-granules-for-parallel-data-processing}

出于数据处理的目的，表的列值在逻辑上被划分为多个 granule。
granule 是以流式方式送入 ClickHouse 进行数据处理的最小不可再分的数据集合。
这意味着，ClickHouse 不是按单行读取数据，而是始终以流式且并行的方式读取一整组（granule）行。
:::note
列值并不是以 granule 为单位进行物理存储：granule 只是为查询处理而对列值进行的一种逻辑组织方式。
:::

下图展示了我们这张表的 887 万行（的列值）如何被组织成 1083 个 granule，这源于表的 DDL 语句中包含了 `index_granularity` 设置（其值为默认的 8192）。

<Image img={sparsePrimaryIndexes02} size="md" alt="稀疏主索引 02" background="white"/>

第一批（基于磁盘上的物理顺序）8192 行（它们的列值）在逻辑上属于 granule 0，接下来的 8192 行（它们的列值）属于 granule 1，如此类推。

:::note

- 最后一个 granule（granule 1082）“包含”的行数少于 8192 行。

- 我们在本指南开头的 “DDL Statement Details” 中提到过，我们禁用了 [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1)（以简化本指南中的讨论，并使图示和结果可复现）。

  因此，在我们的示例表中，所有 granule（除最后一个外）大小都相同。

- 对于启用了 adaptive index granularity 的表（索引粒度在[默认](/operations/settings/merge-tree-settings#index_granularity_bytes) 情况下是自适应的），部分 granule 的大小可能会小于 8192 行，这取决于行数据的大小。

- 我们用橙色标出了主键列（`UserID`、`URL`）中的某些列值。
  这些被橙色标出的列值是每个 granule 第一行的主键列值。
  正如下文所示，这些被橙色标出的列值将会成为表主索引中的条目。

- 我们从 0 开始为 granule 编号，这是为了与 ClickHouse 的内部编号方案保持一致，该方案也用于日志消息中。
:::

### 主索引对每个数据粒度都有一个条目 {#the-primary-index-has-one-entry-per-granule}

主索引是基于上图所示的数据粒度创建的。该索引是一个未压缩的扁平数组文件（primary.idx），其中包含从 0 开始编号的数值索引标记。

下图展示了该索引为每个数据粒度的第一行存储主键列的值（即上图中用橙色标出的值）。
换句话说：主索引存储的是表中每隔 8192 行的主键列值（基于由主键列定义的物理行顺序）。
例如：

- 第一个索引条目（下图中的 “mark 0”）存储的是上图中数据粒度 0 的第一行的键列值，
- 第二个索引条目（下图中的 “mark 1”）存储的是上图中数据粒度 1 的第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="稀疏主索引 03a" background="white"/>

对于我们这个拥有 887 万行和 1083 个数据粒度的表，索引总共有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="稀疏主索引 03b" background="white"/>

:::note

- 对于启用了 [自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1) 的表，主索引中还会额外存储一个“最终”标记，用来记录表最后一行的主键列值。但由于我们在本指南中禁用了自适应索引粒度（这样可以简化讨论，并使图示和结果可复现），因此示例表的索引中不包含这个最终标记。

- 主索引文件会被完整加载到内存中。如果该文件大于可用的空闲内存空间，ClickHouse 将报错。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自托管的 ClickHouse 集群中，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 来检查示例表的主索引内容。

为此，我们首先需要将主索引文件复制到正在运行的集群中某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>步骤 1：获取包含主索引文件的 part 路径</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>步骤 2：获取 user_files_path</li>
Linux 上的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 是
`/var/lib/clickhouse/user_files/`

在 Linux 上可以检查它是否被修改：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上的路径是 `/Users/tomschreiber/Clickhouse/user_files/`

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
这与我们针对该示例表绘制的主索引内容示意图完全一致：

</p>
</details>

主键条目被称为索引标记（index marks），因为每个索引条目都标记了一个特定数据范围的起始位置。具体到该示例表：

- UserID 索引标记：

  主索引中存储的 `UserID` 值按升序排序。<br/>
  因此，上图中的 “mark 1” 表示：在粒度 1 以及所有后续粒度中，所有表行的 `UserID` 值都保证大于等于 4.073.710。

[正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules)，这种全局有序性使得 ClickHouse 在查询对主键第一列进行过滤时，可以在第一键列的索引标记上<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分查找算法</a>。

- URL 索引标记：

  由于主键列 `UserID` 和 `URL` 的基数非常接近，这意味着总体来说，对于除第一列之外的所有键列，其索引标记通常只能表示一个数据范围，前提是前一键列的值在至少当前 granule 内的所有表行中都保持不变。<br/>
  例如，由于上图中标记 0 和标记 1 的 UserID 值不同，ClickHouse 无法假定 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是，如果上图中标记 0 和标记 1 的 UserID 值相同（意味着 granule 0 中所有表行的 UserID 值都相同），那么 ClickHouse 就可以假定 granule 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们将在后面更详细地讨论这对查询执行性能的影响。

### 主索引用于选择索引颗粒 {#the-primary-index-is-used-for-selecting-granules}

现在我们可以在主索引的支持下执行查询。

下面的查询计算了 UserID 749927693 点击次数最多的前 10 个 URL。

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
# highlight-next-line {#highlight-next-line}
已处理 8.19 千行,
740.18 KB (153 万行/秒,138.59 MB/秒)
```

现在 ClickHouse 客户端的输出显示，ClickHouse 不再进行全表扫描，而是只向 ClickHouse 流入了 8.19 千行数据。

如果启用了 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace 级别日志</a>，那么 ClickHouse 服务器日志文件会显示，ClickHouse 正在对 1083 个 UserID 索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以定位那些可能包含 UserID 列值为 `749927693` 的 granule。这个过程需要 19 步，平均时间复杂度为 `O(log2 n)`：

```response
...Executor): 键条件：(列 0 在 [749927693, 749927693] 范围内)
# highlight-next-line {#highlight-next-line}
...Executor): 对数据分片 all_1_9_2 的索引范围执行二分查找（1083 个标记）
...Executor): 找到左边界标记：176
...Executor): 找到右边界标记：177
...Executor): 经过 19 步找到连续范围
...Executor): 通过分区键选择了 1/1 个分片，通过主键选择了 1 个分片，
# highlight-next-line {#highlight-next-line}
              通过主键选择了 1/1083 个标记，需从 1 个范围读取 1 个标记
...Reading ...从 1441792 开始读取约 8192 行数据
```

从上面的 trace 日志中可以看到，在现有的 1083 个 mark 中，只有 1 个 mark 满足该查询。

<details>
  <summary>
    Trace 日志详情
  </summary>

  <p>
    标识为 176 的 mark 被识别出来（&#39;found left boundary mark&#39; 为包含边界，&#39;found right boundary mark&#39; 为不包含边界），因此会将 granule 176 中的全部 8192 行（该 granule 从第 1,441,792 行开始——我们会在本指南后面看到这一点）流式传入 ClickHouse 中，以便找到 `UserID` 列值为 `749927693` 的实际数据行。
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

响应如下所示：

```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Expression (投影)                                                                      │
│   Limit (初步 LIMIT(不含 OFFSET))                                                      │
│     Sorting (ORDER BY 排序)                                                            │
│       Expression (ORDER BY 之前)                                                       │
│         Aggregating                                                                   │
│           Expression (GROUP BY 之前)                                                   │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (从存储读取后设置限制和配额)                          │
│                 ReadFromMergeTree                                                     │
│                 Indexes:                                                              │
│                   PrimaryKey                                                          │
│                     Keys:                                                             │
│                       UserID                                                          │
│                     Condition: (UserID in [749927693, 749927693])                     │
│                     Parts: 1/1                                                        │
# highlight-next-line {#highlight-next-line}
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

返回 16 行。耗时:0.003 秒。
```

客户端输出显示，在 1083 个 granule 中，有 1 个被选中，被认为可能包含 `UserID` 列值为 749927693 的行。

:::note Conclusion
当查询在复合键上进行过滤且该列是复合键的首列时，ClickHouse 会在该键列的索引标记上运行二分查找算法。
:::

<br />

如上所述，ClickHouse 使用其稀疏主索引，通过二分查找快速选取那些可能包含与查询匹配行的 granule。

这是 ClickHouse 查询执行的**第一阶段（granule 选取）**。

在**第二阶段（数据读取）**中，ClickHouse 会定位这些已选中的 granule，并将其中的所有行以流式方式读入 ClickHouse 引擎，以找出真正与查询匹配的行。

我们会在下一节中更详细地讨论第二阶段。

### 标记文件用于定位粒度 {#mark-files-are-used-for-locating-granules}

下图展示了我们这张表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="稀疏主键索引 04" background="white"/>

如前文所述，通过对索引中的 1083 个 `UserID` 标记执行二分查找，定位到了标记 176。其对应的粒度（granule）176 因此有可能包含 `UserID` 列值为 749.927.693 的行。

<details>
    <summary>
    粒度选择细节
    </summary>
    <p>

上图显示，标记 176 是第一个索引条目，它同时满足：与之关联的粒度 176 的最小 `UserID` 值小于 749.927.693，且下一个标记（标记 177）对应的粒度 177 的最小 `UserID` 值大于该值。因此，只有标记 176 对应的粒度 176 才有可能包含 `UserID` 列值为 749.927.693 的行。
</p>
</details>

为了确认粒度 176 中是否存在 `UserID` 列值为 749.927.693 的行，该粒度所属的全部 8192 行都需要被流式读取到 ClickHouse 中。

为此，ClickHouse 需要知道粒度 176 的物理位置。

在 ClickHouse 中，我们这张表所有粒度的物理位置都存储在标记文件（mark file）中。与数据文件类似，每个表列都有一个对应的标记文件。

下图展示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`，它们存储了该表 `UserID`、`URL` 和 `EventTime` 列各个粒度的物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="稀疏主键索引 05" background="white"/>

我们已经讨论过，主索引是一个扁平的未压缩数组文件（`primary.idx`），其中包含的索引标记从 0 开始编号。

类似地，标记文件也是一个扁平的未压缩数组文件（`*.mrk`），其中的标记同样从 0 开始编号。

一旦 ClickHouse 已经为某个查询识别并选定了可能包含匹配行的粒度对应的索引标记，就可以在标记文件中基于该位置进行数组查找，以获取该粒度的物理位置。

每个特定列的标记文件条目以偏移量（offset）的形式存储两个位置：

- 第一个偏移量（上图中的 `block_offset`）用于定位压缩列数据文件中包含所选粒度压缩版本的<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块（block）</a>，该列数据文件是<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>过的。这个压缩块中可能包含若干个被压缩的粒度。被定位到的压缩文件块在读取时会被解压到主内存中。

- 第二个偏移量（上图中的 `granule_offset`）来自标记文件，提供了该粒度在解压后的块数据中的位置。

随后，属于被定位到的未压缩粒度的全部 8192 行会被流式读取到 ClickHouse 中以供进一步处理。

:::note

- 对于采用[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且未启用[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse 使用如上图所示的 `.mrk` 标记文件，每个条目包含两个 8 字节长的地址。这些条目是粒度的物理位置，所有粒度的大小都相同。

索引粒度在[默认情况下](/operations/settings/merge-tree-settings#index_granularity_bytes)是自适应的，但对于本示例表，我们禁用了自适应索引粒度（以简化本指南中的讨论，并使图示和结果可复现）。我们的表使用宽格式，是因为其数据大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（在自管集群中默认值为 10 MB）。

- 对于采用宽格式且启用了自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，其中的条目与 `.mrk` 标记文件类似，但每个条目中额外包含第三个值：当前条目所关联粒度的行数。

- 对于采用[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse 使用 `.mrk3` 标记文件。

:::

:::note 为什么需要标记文件

为什么主索引不会直接包含与索引标记对应的粒度（granule）的物理位置？

因为在 ClickHouse 所设计的超大规模场景下，磁盘和内存的高效利用至关重要。

主索引文件需要能够完全装入主内存。

在我们的示例查询中，ClickHouse 使用主索引并只选择了一个**可能**包含匹配行的粒度。只有对于这个粒度，ClickHouse 才需要知道物理位置，以便将对应的行流式读取出来进行后续处理。

此外，这些偏移量信息只需要用于 `UserID` 和 `URL` 两列。

对于未在查询中使用的列（例如 `EventTime`），则不需要偏移量信息。

在我们的示例查询中，ClickHouse 只需要 `UserID` 数据文件（UserID.bin）中粒度 176 的两个物理位置偏移量，以及 `URL` 数据文件（URL.bin）中粒度 176 的两个物理位置偏移量。

通过 mark 文件引入这一层间接寻址，可以避免在主索引中直接存储三列全部 1083 个粒度的物理位置信息条目，从而避免在主内存中存放不必要（并且可能根本不会被使用）的数据。
:::

下图及其后的文字说明，在我们的示例查询中，ClickHouse 是如何在 UserID.bin 数据文件中定位到粒度 176 的。

<Image img={sparsePrimaryIndexes06} size="md" alt="稀疏主索引 06" background="white"/>

我们之前在本指南中已讨论过，ClickHouse 选择了主索引标记 176，因此选择了粒度 176 作为**可能**包含与查询匹配行的粒度。

ClickHouse 现在使用索引中选中的标记号（176），在 UserID.mrk 标记文件中进行按位置的数组查找，以获取用于定位粒度 176 的两个偏移量。

如图所示，第一个偏移量用于定位 UserID.bin 数据文件中包含粒度 176 压缩版本的压缩文件块。

一旦将定位到的文件块解压到主内存中，就可以使用来自标记文件的第二个偏移量，在未压缩数据中定位粒度 176。

为了执行我们的示例查询（对 `UserID` 为 749.927.693 的互联网用户，查找点击次数最多的前 10 个 URL），ClickHouse 需要在 UserID.bin 数据文件和 URL.bin 数据文件中都定位并流式读取粒度 176 的所有值。

上图展示了 ClickHouse 如何在 UserID.bin 数据文件中定位该粒度。

与此同时，ClickHouse 也会对 URL.bin 数据文件中的粒度 176 执行相同的操作。随后，这两个对应的粒度会被对齐并流式送入 ClickHouse 引擎进行进一步处理，即对所有 `UserID` 为 749.927.693 的行，按组聚合并统计 URL 值的次数，最后按计数降序输出前 10 个 URL 分组。

## 使用多个主键索引 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### 次级键列可能（不）高效 {#secondary-key-columns-can-not-be-inefficient}

当查询在一个复合键中、且作为首个键列的列上进行过滤时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当查询在复合键中的某个列上进行过滤，而该列不是首个键列时，会发生什么？

:::note
我们讨论的场景是：查询明确不在首个键列上过滤，而是在某个次级键列上过滤。

当查询同时在首个键列以及之后任意键列上进行过滤时，ClickHouse 会在首个键列的索引标记上运行二分查找。
:::

<br />

<br />

<a name="query-on-url" />

我们使用一个查询来计算在 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 上点击最频繁的前 10 个用户：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

响应如下：<a name="query-on-url-slow" />

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

10 行结果。耗时:0.086 秒。
# highlight-next-line {#highlight-next-line}
已处理 881 万行,
799.69 MB(1.0211 亿行/秒,9.27 GB/秒)
```

客户端输出显示，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse 还是几乎执行了一次全表扫描！ClickHouse 从该表的 887 万行中读取了 881 万行。

如果启用了 [trace&#95;logging](/operations/server-configuration-parameters/settings#logger)，则 ClickHouse 服务器日志文件会显示 ClickHouse 在 1083 个 URL 索引标记上使用了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索（generic exclusion search）</a>，以识别那些可能包含 URL 列值为 &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的行的粒度（granule）：

```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line {#highlight-next-line}
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line {#highlight-next-line}
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```

从上面的示例 trace 日志中可以看到，通过索引标记，在 1083 个 granule 中有 1076 个被选为“可能包含具有匹配 URL 值的行”的 granule。

这会导致有 881 万行数据被流式读取到 ClickHouse 引擎中（通过 10 个并行数据流完成），以便找出那些实际包含 URL 值 &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的行。

然而，我们稍后会看到，在选中的这 1076 个 granule 中，实际上只有 39 个 granule 包含匹配的行。

虽然基于复合主键 (UserID, URL) 的主键索引对于加速按特定 UserID 值过滤行的查询非常有用，但对于仅按特定 URL 值过滤行的查询，这个索引并没有提供显著的加速效果。

原因在于 URL 列不是第一个键列，因此 ClickHouse 在 URL 列的索引标记上使用的是通用排除搜索算法（而不是二分搜索），并且**该算法的有效性取决于** URL 列与其前一个键列 UserID **之间的基数差异**。

为说明这一点，我们将介绍一些关于通用排除搜索如何工作的细节。

<a name="generic-exclusion-search-algorithm" />

### 通用排除搜索算法 {#generic-exclusion-search-algorithm}

下面将展示当通过一个次级列来选择 granule，而它前面的键列具有较低或较高基数时，<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse 通用排除搜索算法</a> 是如何工作的。

针对这两种情况，我们作如下假设：

- 查询在搜索 URL 值为 "W3" 的行。
- 使用一个抽象化的 hits 表，其中 UserID 和 URL 使用了简化的值。
- 索引采用相同的复合主键 (UserID, URL)。这意味着行首先按 UserID 排序，具有相同 UserID 的行再按 URL 排序。
- granule 大小为 2，即每个 granule 包含两行。

在下面的图示中，我们用橙色标出了每个 granule 的首行的键列值。

**前驱键列具有较低基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 的基数较低。在这种情况下，相同的 UserID 值很可能分布在多行和多个 granule 中，因此也分布在多个 index mark 上。对于具有相同 UserID 的 index mark，这些 mark 的 URL 值按升序排列（因为表行首先按 UserID 排序，然后按 URL 排序）。这使得可以进行如下所述的高效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="稀疏主索引 06" background="white"/>

对于上图中抽象样本数据的 granule 选择过程，有三种不同的情况：

1. 对于 index mark 0，**其 URL 值小于 W3，且其直接后继 index mark 的 URL 值也小于 W3**，可以将其排除，因为 mark 0 和 1 具有相同的 UserID 值。请注意，此排除前提条件确保 granule 0 完全由 UserID 为 U1 的行组成，因此 ClickHouse 可以假定 granule 0 中的最大 URL 值也小于 W3，从而排除该 granule。

2. 对于 index mark 1，**其 URL 值小于（或等于）W3，且其直接后继 index mark 的 URL 值大于（或等于）W3**，需要选择该 mark，因为这意味着 granule 1 可能包含 URL 为 W3 的行。

3. 对于 index mark 2 和 3，**其 URL 值大于 W3**，可以将其排除，因为主索引的 index mark 存储的是每个 granule 首行的键列值，并且表行在磁盘上按键列值排序，因此 granule 2 和 3 不可能包含 URL 值为 W3 的行。

**前驱键列具有较高基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 具有较高基数时，相同的 UserID 值分布在多行和多个 granule 中的情况就不太可能发生。这意味着 index mark 的 URL 值不再是单调递增的：

<Image img={sparsePrimaryIndexes08} size="md" alt="稀疏主索引 06" background="white"/>

如上图所示，所有 URL 值小于 W3 的 mark 都会被选中，以便将其关联 granule 的行流式传入 ClickHouse 引擎。

这是因为，尽管图中的所有 index mark 都符合前面描述的场景 1，但它们不满足前述排除前提条件——*直接后继 index mark 的 UserID 值与当前 mark 相同*——因此无法被排除。

例如，对于 index mark 0，**其 URL 值小于 W3，且其直接后继 index mark 的 URL 值也小于 W3**，它*不能*被排除，因为直接后继的 index mark 1 的 UserID 值*并不*与当前 mark 0 相同。

这最终使 ClickHouse 无法对 granule 0 中的最大 URL 值做出假设。相反，它必须假定 granule 0 可能包含 URL 值为 W3 的行，因此被迫选择 mark 0。

对于 mark 1、2 和 3，同样适用这一情况。

:::note 结论
当查询在一个属于复合键但不是第一个键列的列上进行过滤时，ClickHouse 会使用<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法</a>来替代<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索算法</a>。当前驱键列的基数较低时，这种做法最为高效。
:::

在我们的示例数据集中，两个键列（UserID、URL）都具有类似的高基数。如前所述，当位于 URL 列之前的键列具有较高或相近的基数时，通用排除搜索算法的效果并不理想。

### 关于 data skipping index 的说明 {#note-about-data-skipping-index}

由于 UserID 和 URL 都具有类似的高基数，我们在 URL 上的[查询过滤](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，即使在来自我们[复合主键表 (UserID, URL)](#a-table-with-a-primary-key)的 URL 列上创建一个[辅助 data skipping index](./skipping-indexes.md)，收益也不会太大。

例如，下面这两个语句会在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index：

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse 现在创建了一个额外的索引,该索引针对每组 4 个连续的[颗粒](#data-is-organized-into-granules-for-parallel-data-processing)(注意上述 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句)存储最小和最大 URL 值:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

第一个索引条目(上图中的&#39;mark 0&#39;)存储了[属于表中前 4 个颗粒的行](#data-is-organized-into-granules-for-parallel-data-processing)的最小和最大 URL 值。

第二个索引条目(&#39;mark 1&#39;)存储了属于表中接下来 4 个颗粒的行的最小和最大 URL 值,以此类推。

(ClickHouse 还为数据跳过索引创建了一个特殊的[标记文件](#mark-files-are-used-for-locating-granules),用于[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的颗粒组。)

由于 UserID 和 URL 的基数同样很高,当执行[基于 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时,这个辅助数据跳过索引无法帮助排除选中的颗粒。

查询所查找的特定 URL 值(即 &#39;[http://public&#95;search&#39;)很可能位于索引为每组颗粒存储的最小值和最大值之间,这导致](http://public\&#95;search\&#39;\)很可能位于索引为每组颗粒存储的最小值和最大值之间,这导致) ClickHouse 被迫选择该颗粒组(因为它们可能包含与查询匹配的行)。

### 需要使用多个主索引 {#a-need-to-use-multiple-primary-indexes}

因此，如果我们想要显著加速针对特定 URL 过滤行的示例查询，就需要使用一个针对该查询优化的主索引。

如果我们还希望保持针对特定 UserID 过滤行的示例查询的良好性能，那么就需要使用多个主索引。

下面展示了实现这一目标的几种方式。

<a name="multiple-primary-indexes"></a>

### 创建额外主索引的选项 {#options-for-creating-additional-primary-indexes}

如果我们想显著加速这两个示例查询——一个是按特定的 UserID 过滤行，另一个是按特定的 URL 过滤行——那么我们需要通过以下三种方式之一来使用多个主索引：

- 创建一张具有不同主键的**第二张表**。
- 在现有表上创建一个**物化视图**。
- 在现有表上添加一个 **projection**。

这三种选项都会有效地将我们的示例数据复制到一张额外的表中，以便重新组织表的主索引和行排序顺序。

不过，这三种选项在查询和插入语句的路由方式上，对用户而言该额外表的透明程度有所不同。

当创建一张具有不同主键的**第二张表**时，查询必须显式发送到最适合该查询的表版本，并且必须显式地向两张表中插入新数据，以保持两张表的数据同步：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用**物化视图**时，会隐式创建额外的表，并且会在两张表之间自动保持数据同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而 **projection** 则是透明度最高的选项，因为除了自动保持隐式创建（且对用户隐藏）的额外表与数据变更同步之外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

在下文中，我们将结合实际示例，更详细地讨论这三种创建和使用多个主索引的选项。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### 选项 1：辅助表 {#option-1-secondary-tables}

<a name="secondary-table" />

我们将创建一个新的辅助表，在该表的主键中交换键列的顺序（相对于原始表）：

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

将 [原始表](#a-table-with-a-primary-key) 中的全部 887 万行插入到这个新增的表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

响应类似如下：

```response
Ok.

返回 0 行。用时:2.898 秒。已处理 887 万行,838.84 MB(306 万行/秒,289.46 MB/秒)
```

最后，对表进行优化：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们在主键中调整了列的顺序，插入的行现在在磁盘上的字典序（与[原始表](#a-table-with-a-primary-key)相比）发生了变化，因此该表的 1083 个数据粒度中所包含的值也与之前不同：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

这是得到的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

现在可以利用它显著加速我们示例查询的执行：该查询在 URL 列上进行过滤，以计算最频繁点击 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的前 10 位用户：

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

10 行数据。耗时: 0.017 秒。
# highlight-next-line {#highlight-next-line}
处理了 319.49 千行数据,
11.38 MB (18.41 百万行/秒, 655.75 MB/秒)
```

现在，ClickHouse 不再需要[几乎做一次全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)，而是能够更加高效地执行该查询。

在[原始表](#a-table-with-a-primary-key)的主键设计中，UserID 是第一列，URL 是第二个键列。ClickHouse 在执行该查询时，会在索引标记上使用[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)算法，但由于 UserID 和 URL 都具有类似的高基数，这种方式的效果并不理想。

当在主键中将 URL 调整为第一列后，ClickHouse 现在会在索引标记上运行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分搜索</a>。
ClickHouse 服务器日志文件中的相应 trace 日志也印证了这一点：

```response
...Executor): 键条件：(列 0 在 ['http://public_search',
                                           'http://public_search'] 中)
# highlight-next-line {#highlight-next-line}
...Executor): 对数据分片 all_1_9_2 的索引范围执行二分查找（1083 个标记）
...Executor): 找到（左）边界标记：644
...Executor): 找到（右）边界标记：683
...Executor): 经过 19 步找到连续范围
...Executor): 通过分区键选择了 1/1 个分片，通过主键选择了 1 个分片，
# highlight-next-line {#highlight-next-line}
              通过主键选择了 39/1083 个标记，需从 1 个范围读取 39 个标记
...Executor): 使用 2 个流读取约 319488 行数据
```

ClickHouse 只选择了 39 个索引标记，而在使用通用排除搜索时会选择 1076 个。

注意，这个额外的表是专门为加速我们按 URL 过滤的示例查询的执行而优化的。

类似于该查询在我们[原始表](#a-table-with-a-primary-key)上的[性能不佳](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，我们[按 `UserIDs` 过滤的示例查询](#the-primary-index-is-used-for-selecting-granules)在新的额外表上执行也不会很高效，因为在这个表的主键中，UserID 现在是第二个键列，因此 ClickHouse 在 granule 选择时会使用通用排除搜索，而当 UserID 和 URL 都具有[类似的高基数](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)时，这种方式并不高效。
打开详情框以查看具体信息。

<details>
  <summary>
    现在按 UserIDs 过滤的查询性能很差<a name="query-on-userid-slow" />
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

我们现在有两个表，分别针对按 `UserIDs` 过滤的查询以及按 URL 过滤的查询进行了加速优化：

### 选项 2：物化视图 {#option-2-materialized-views}

在现有的表上创建一个[物化视图](/sql-reference/statements/create/view.md)。

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

返回 0 行。耗时:2.935 秒。已处理 887 万行,838.84 MB(302 万行/秒,285.84 MB/秒)。
```

:::note

* 我们在视图的主键中**调整了键列的顺序**（相对于[原始表](#a-table-with-a-primary-key)）
* 该物化视图由一个**隐式创建的表**作为底层表支撑，该表的行顺序和主索引基于给定的主键定义
* 这个隐式创建的表会出现在 `SHOW TABLES` 查询结果中，并且名称以 `.inner` 开头
* 也可以先显式创建物化视图所依赖的底层表，然后通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 让视图指向该表
* 我们使用 `POPULATE` 关键字，以便立刻用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充该隐式创建的表
* 如果向源表 hits&#95;UserID&#95;URL 插入新行，这些行也会自动插入到该隐式创建的表中
* 从效果上看，这个隐式创建的表拥有与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="稀疏主索引 12b1" background="white" />

ClickHouse 会将这个隐式创建的表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在 ClickHouse 服务器数据目录中的一个特殊文件夹内：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="稀疏主索引 12b2" background="white" />

:::

现在，这个作为物化视图底层表的隐式创建表（及其主索引）可以用于显著加速我们在 URL 列上进行过滤的示例查询的执行：

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

返回 10 行。耗时:0.026 秒。
# highlight-next-line {#highlight-next-line}
已处理 33.587 万行,
13.54 MB(1291 万行/秒,520.38 MB/秒)。
```

由于为该物化视图隐式创建的底层表（及其主索引）实际上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)完全相同，因此查询的实际执行方式与使用显式创建的表时是一样的。

ClickHouse 服务器日志文件中的对应跟踪日志确认，ClickHouse 正在对索引标记执行二分查找：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line {#highlight-next-line}
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
# highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```

### 选项 3：投影（Projection） {#option-3-projections}

在现有表上创建一个投影：

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

* 该 projection 会创建一个**隐藏表**，其行顺序和主键索引基于该 projection 中给定的 `ORDER BY` 子句
* 该隐藏表不会出现在 `SHOW TABLES` 查询的结果中
* 我们使用 `MATERIALIZE` 关键字，以便立刻将源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充到隐藏表中
* 如果向源表 hits&#95;UserID&#95;URL 中插入新行，则这些行也会自动插入到隐藏表中
* 查询在语法上始终是针对源表 hits&#95;UserID&#95;URL，但如果隐藏表的行顺序和主键索引可以实现更高效的查询执行，则会改为使用该隐藏表来执行查询
* 请注意，projection 并不会让使用 ORDER BY 的查询变得更高效，即使该 ORDER BY 与 projection 的 ORDER BY 语句完全匹配（参见 [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333)）
* 实际上，隐式创建的隐藏表拥有与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同的行顺序和主键索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse 会将隐藏表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主键索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在一个特殊的文件夹中（在下方截图中用橙色标记），该文件夹位于源表的数据文件、mark 文件和主键索引文件所在位置的旁边：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

由 projection 创建的隐藏表（及其主键索引）现在可以（隐式地）用来显著加速我们示例查询对 URL 列的过滤执行。请注意，该查询在语法上仍是针对该 projection 的源表。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

返回结果为：

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

返回了 10 行。耗时：0.029 秒。
# highlight-next-line {#highlight-next-line}
处理了 319.49 千行，1.38 MB（11.05 百万行/秒，393.58 MB/秒）
```

由于投影创建的隐藏表（及其主索引）本质上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，查询的执行方式与使用显式创建的表在实际效果上没有区别。

ClickHouse 服务器日志文件中的相应 trace 日志证实 ClickHouse 正在对索引标记执行二分查找：

```response
...Executor): 键条件：(列 0 在 ['http://public_search',
                                           'http://public_search'] 中)
# highlight-next-line {#highlight-next-line}
...Executor): 对数据分片 prj_url_userid 的索引范围执行二分查找（1083 个标记）
...Executor): ...
# highlight-next-line
...Executor): 选择完整的普通投影 prj_url_userid
...Executor): 投影所需列：URL、UserID
...Executor): 按分区键选中 1/1 个分片，按主键选中 1 个分片，
# highlight-next-line {#highlight-next-line}
              按主键选中 39/1083 个标记，将从 1 个范围读取 39 个标记
...Executor): 使用 2 个数据流读取约 319488 行
```

### 总结 {#summary}

我们的[复合主键表 (UserID, URL)](#a-table-with-a-primary-key) 的主索引在加速[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)方面非常有用。但该索引在加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)方面并没有提供显著帮助，尽管 URL 列也是复合主键的一部分。

反之亦然：
我们的[复合主键表 (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 的主索引在加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)方面非常有效，但对[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules)帮助不大。

由于主键列 UserID 和 URL 的基数都较高且相近，对第二个键列进行过滤的查询，[并不能从第二个键列包含在索引中获得太多收益](#generic-exclusion-search-algorithm)。

因此，将第二个键列从主索引中移除（从而减少索引的内存消耗），并[改为使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)是合理的做法。

不过，如果复合主键中的各键列在基数上存在较大差异，那么按基数从小到大排列主键列，对[查询是有益的](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大，它们在主键中的排列顺序就越重要。我们将在下一节中对此进行演示。

## 高效地为键列排序 {#ordering-key-columns-efficiently}

<a name="test" />

在复合主键中，键列的顺序会显著影响以下两点：

* 查询中过滤次级键列的效率，以及
* 表数据文件的压缩率。

为演示这一点，我们将使用[网页流量示例数据集](#data-set)的一个变体，
其中每一行包含三列，用于指示某次互联网「用户」（`UserID` 列）访问某个 URL（`URL` 列）时，该访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用一个包含上述三列的复合主键，用于加速典型的网页分析查询，这类查询会计算：

* 某个特定 URL 的流量中有多少（百分比）来自机器人，或者
* 我们对某个特定用户是否为机器人的判断有多大把握（来自该用户的流量中有多少百分比被认为是机器人流量或非机器人流量）

我们使用下列查询来计算计划在复合主键中用作键列的这三列的基数（注意我们使用了 [URL 表函数](/sql-reference/table-functions/url.md)，以便对 TSV 数据进行临时查询，而无需创建本地表）。在 `clickhouse client` 中运行此查询：

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

我们可以看到各列之间的基数差异很大，尤其是 `URL` 和 `IsRobot` 列之间的差异。因此，在复合主键中这些列的顺序，对于高效加速对这些列进行过滤的查询，以及为表的列数据文件实现最佳压缩比，都具有重要意义。

为便于演示，我们为机器人流量分析数据创建两个版本的表：

* 表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，其中我们按基数的降序排列键列
* 表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，其中我们按基数的升序排列键列

创建表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`：

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

以下是响应：

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

并用与上一张表相同的 887 万行数据来填充它：

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

### 在次级键列上进行高效过滤 {#efficient-filtering-on-secondary-key-columns}

当查询对至少一个属于复合键且是第一个键列的列进行过滤时，[ClickHouse 会在该键列的索引标记上运行二分搜索算法](#the-primary-index-is-used-for-selecting-granules)。

当查询仅对一个属于复合键但不是第一个键列的列进行过滤时，[ClickHouse 会在该键列的索引标记上使用通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

对于第二种情况，复合主键中各键列的顺序会影响[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的效果。

下面是一个查询示例，它对表中的 `UserID` 列进行过滤，该表的键列 `(URL, UserID, IsRobot)` 按基数从高到低排序：

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
已处理 792 万行,
31.67 MB(306.90 百万行/秒,1.23 GB/秒)
```

这是在这样一张表上执行的同一个查询：其中键列 `(IsRobot, UserID, URL)` 按基数从小到大排列：

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

响应如下：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
已处理 2.032 万行,
81.28 KB (每秒 661 万行, 26.44 MB/秒)
```

我们可以看到，在那张对键列按基数升序排序的表上，查询执行明显更加高效且更快。

其原因在于，当通过某个次级键列来选择 [granules](#the-primary-index-is-used-for-selecting-granules)，且其前一个键列具有更低的基数时，[generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的效果最佳。我们已经在本指南的[前一节](#generic-exclusion-search-algorithm)中对这一点进行了详细说明。

### 数据文件的最佳压缩率 {#efficient-filtering-on-secondary-key-columns}

此查询比较了我们在上面创建的两个表中 `UserID` 列的压缩率：

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

响应如下：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

返回 2 行。耗时：0.006 秒。
```

我们可以看到，对于 `UserID` 列，当我们按照基数的升序对键列 `(IsRobot, UserID, URL)` 排序时，其压缩比显著更高。

尽管在这两张表中存储的完全是相同的数据（我们向两张表都插入了相同的 8.87 百万行数据），但复合主键中键列的顺序会对表中<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>数据在该表[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)上所需的磁盘空间产生显著影响：

* 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，我们按照基数的降序对键列排序，其 `UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
* 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，我们按照基数的升序对键列排序，其 `UserID.bin` 数据文件仅占用 **877.47 KiB** 的磁盘空间

对于表某一列的数据而言，在磁盘上获得良好的压缩比不仅可以节省磁盘空间，还能够加速需要从该列读取数据的查询（尤其是分析型查询），因为在将该列数据从磁盘移动到主内存（操作系统文件缓存）时所需的 I/O 更少。

下面我们将说明，为了提升表列数据的压缩比，将主键列按基数升序排序有何好处。

下图示意了当主键列按基数升序排序时，行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

我们已经讨论过[表的行数据在磁盘上是按主键列排序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表的行（它们在磁盘上的列值）首先按其 `cl` 值排序，具有相同 `cl` 值的行再按其 `ch` 值排序。并且由于第一个键列 `cl` 的基数较低，很可能会有具有相同 `cl` 值的行。也正因为如此，对于具有相同 `cl` 值的行，其 `ch` 值也很可能是（局部地）有序的。

如果在某一列中，相似的数据彼此靠得很近，例如通过排序实现，那么这些数据会被压缩得更好。
一般来说，压缩算法会从数据的“运行长度”（看到的数据越多，压缩效果越好）
和“局部性”（数据越相似，压缩比越好）中获益。

与上图相反，下面的示意图展示了当主键列按基数降序排序时，行在磁盘上的顺序：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white" />

现在，表的行首先按它们的 `ch` 值排序，具有相同 `ch` 值的行再按它们的 `cl` 值排序。
但是因为第一个键列 `ch` 具有很高的基数，因此几乎不可能存在具有相同 `ch` 值的行。也正因为如此，`cl` 值在局部范围内（对具有相同 `ch` 值的行而言）也几乎不可能是有序的。

因此，`cl` 值极有可能近似于随机顺序，从而局部性较差，相应地压缩率也会较低。

### 总结 {#summary-1}

为了在查询中高效过滤次键列并提高表列数据文件的压缩比，建议按基数从小到大的顺序排列主键中的各个列。

## 高效地定位单行记录 {#identifying-single-rows-efficiently}

尽管总体而言，将 ClickHouse 用作[键值存储](/knowledgebase/key-value)并不是最理想的用例，但有时构建在 ClickHouse 之上的应用程序需要在 ClickHouse 表中定位单行记录。

一个直观的解决方案是使用一个 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，使每一行都有唯一值，并将该列用作主键列，以便可以快速检索行。

为了实现最快的检索，[UUID 列需要作为第一个主键列](#the-primary-index-is-used-for-selecting-granules)。

我们已经讨论过，由于[ClickHouse 表的行数据在磁盘上的存储顺序是按主键列排序的](#data-is-stored-on-disk-ordered-by-primary-key-columns)，在主键中，或者在复合主键中将一个基数非常高的列（例如 UUID 列）放在基数较低的列之前，[会降低表中其他列的压缩比](#optimal-compression-ratio-of-data-files)。

在最快检索与最优数据压缩之间的一种折中做法，是使用复合主键，并将 UUID 作为最后一个键列，放在用于保证部分表列良好压缩比的低（或较低）基数键列之后。

### 一个具体示例 {#a-concrete-example}

一个具体的示例是纯文本粘贴服务 [https://pastila.nl](https://pastila.nl)，由 Alexey Milovidov 开发，并在[博客中进行了介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)。

每当文本区域发生变更时，数据都会自动保存为 ClickHouse 表中的一行记录（每次变更一行）。

识别并检索（某个特定版本的）粘贴内容的一种方式，是使用内容的哈希值作为包含该内容的表行的 UUID。

下图展示了

- 当内容发生变化时（例如由于用户在文本区域中键入文本）行被插入的顺序，以及
- 当使用 `PRIMARY KEY (hash)` 时，插入行在磁盘上的数据存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

由于 `hash` 列被用作主键列：

- 可以[非常快速地](#the-primary-index-is-used-for-selecting-granules)检索特定行，但
- 表中的行（其列数据）在磁盘上按（唯一且随机的）hash 值升序存储。因此，content 列的值也会以随机顺序存储，没有数据局部性，从而导致 **content 列数据文件的压缩比不理想**。

为了在仍然能够快速检索特定行的同时显著提升 content 列的压缩比，pastila.nl 使用两个哈希值（以及一个复合主键）来标识一行记录：

- 一个内容哈希，如上所述，对不同数据产生不同的值；
- 一个[局部敏感哈希（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)，在数据发生少量变化时**不会**改变。

下图展示了

- 当内容发生变化时（例如由于用户在文本区域中键入文本）行被插入的顺序，以及
- 当使用复合主键 `PRIMARY KEY (fingerprint, hash)` 时，插入行在磁盘上的数据存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

现在，磁盘上的行首先按 `fingerprint` 排序；对于 fingerprint 值相同的行，再由其 `hash` 值决定最终顺序。

因为仅有少量差异的数据会获得相同的 fingerprint 值，相似的数据现在在 content 列中会在磁盘上彼此相邻存储。这对 content 列的压缩比非常有利，因为压缩算法通常会从数据局部性中获益（数据越相似，压缩比通常越好）。

这种权衡在于：为充分利用由复合主键 `PRIMARY KEY (fingerprint, hash)` 产生的主索引，在检索特定行时需要使用两个字段（`fingerprint` 和 `hash`）。