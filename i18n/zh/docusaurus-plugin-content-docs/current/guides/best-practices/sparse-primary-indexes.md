---
sidebar_label: '主索引'
sidebar_position: 1
description: '在本指南中，我们将深入介绍 ClickHouse 的主索引。'
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


# ClickHouse 主键索引实用入门指南 \{#a-practical-introduction-to-primary-indexes-in-clickhouse\}

## 引言 \\{#introduction\\}

在本指南中，我们将深入探讨 ClickHouse 的索引机制。我们将详细说明并讨论：

- [ClickHouse 中的索引与传统关系型数据库管理系统中的索引有何不同](#an-index-design-for-massive-data-scales)
- [ClickHouse 如何构建并使用表的稀疏主索引](#a-table-with-a-primary-key)
- [ClickHouse 索引的一些最佳实践](#using-multiple-primary-indexes)

你也可以在本地机器上选择性地执行本指南中给出的所有 ClickHouse SQL 语句和查询。
有关 ClickHouse 的安装和快速入门说明，请参阅[快速开始](/get-started/quick-start)。

:::note
本指南重点关注 ClickHouse 的稀疏主索引。

关于 ClickHouse 的[二级数据跳过索引](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)，请参阅[教程](/guides/best-practices/skipping-indexes.md)。
:::

### 数据集 \\{#data-set\\}

在本指南中，我们将使用一个经过匿名化的示例网站流量数据集。

- 我们将使用该示例数据集中的一个子集，共 887 万行（事件）。
- 未压缩的数据大小为 887 万个事件，大约 700 MB；在 ClickHouse 中存储时压缩后约为 200 MB。
- 在我们的子集中，每一行包含三列，表示某个互联网用户（`UserID` 列）在特定时间（`EventTime` 列）点击了某个 URL（`URL` 列）。

仅凭这三列，我们就可以编写一些典型的网站分析查询，例如：

- “对于某个特定用户，点击次数最多的前 10 个 URL 是什么？”
- “对于某个特定 URL，点击最频繁的前 10 个用户是谁？”
- “用户在什么时间（例如一周中的哪些天）点击某个特定 URL 最频繁？”

### 测试机器 \\{#test-machine\\}

本文档中给出的所有运行时数据均基于在一台本地运行 ClickHouse 22.2.1、配备 Apple M1 Pro 芯片和 16GB 内存的 MacBook Pro 上获得的结果。

### 全表扫描 \{#a-full-table-scan\}

为了了解在没有主键的情况下查询是如何在数据集上执行的，我们通过执行以下 SQL DDL 语句创建一张表（使用 MergeTree 表引擎）：

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
这里使用了 [URL table function](/sql-reference/table-functions/url.md)，以便从托管在 clickhouse.com 上的完整数据集中加载一个子集：


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

最后，为了简化本指南后续的讨论，并使图示和结果可复现，我们使用 FINAL 关键字对该表执行 [optimize](/sql-reference/statements/optimize.md)：


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般来说，在将数据加载到表中后，不需要也不建议立即对表进行优化。为什么在本示例中需要这样做，后文会变得一目了然。
:::

现在我们来执行第一个 Web 分析查询。下面的查询将统计 UserID 为 749927693 的互联网用户点击次数最多的前 10 个 URL：

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

ClickHouse 客户端的结果输出表明，ClickHouse 执行了一次全表扫描！我们表中 887 万行数据的每一行都被流式传入 ClickHouse。这在规模上根本行不通。

要让这一过程更加高效、运行得更快，我们需要使用一个具有合适主键的表。这样 ClickHouse 就能基于主键列自动创建一个稀疏主索引，从而显著加快我们示例查询的执行速度。


## ClickHouse 索引设计 \\{#clickhouse-index-design\\}

### 面向海量数据规模的索引设计 \\{#an-index-design-for-massive-data-scales\\}

在传统的关系型数据库管理系统中，主索引会为表中的每一行包含一个条目。对于我们的数据集，这意味着主索引中将包含 887 万个条目。这样的索引可以快速定位特定行，从而在查找类查询和点更新中具备很高的效率。在 `B(+)-Tree` 数据结构中查找一个条目，其平均时间复杂度为 `O(log n)`；更精确地说，`log_b n = log_2 n / log_2 b`，其中 `b` 是 `B(+)-Tree` 的分支因子，`n` 是被索引的行数。由于 `b` 通常在数百到数千之间，`B(+)-Trees` 是一种层级非常浅的结构，因此只需要很少的磁盘寻道即可定位记录。在具有 887 万行、分支因子为 1000 的情况下，平均需要 2.3 次磁盘寻道。这种能力也有代价：额外的磁盘和内存开销、向表中插入新行及向索引中添加条目时更高的写入成本，以及有时需要对 B-Tree 进行重平衡。

考虑到与 B-Tree 索引相关的这些挑战，ClickHouse 中的表引擎采用了不同的方法。ClickHouse 的 [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) 被设计并优化用于处理海量数据。这些表可以每秒接收数百万行的插入，并存储极其庞大的数据量（数百 PB）。数据会被快速写入表中，按[分区片段逐个写入](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)，并在后台按照规则对这些分区片段进行合并。在 ClickHouse 中，每个分区片段都有自己的主索引。当分区片段被合并时，合并后的分区片段的主索引也会被合并。对于 ClickHouse 所面向的这种超大规模场景，极高的磁盘和内存效率至关重要。因此，主索引不会为每一行建立索引，而是对每个分区片段中的一组行（称为“粒度 granule”）建立一个索引条目（称为“标记 mark”）——这种技术称为 **稀疏索引**。

稀疏索引之所以可行，是因为 ClickHouse 会按主键列对某个分区片段中的行在磁盘上进行有序存储。与基于 B-Tree 的索引那样直接定位单行不同，稀疏主索引通过在索引条目上执行二分查找，可以快速识别出可能与查询匹配的行分组。随后，这些可能匹配的行分组（粒度）会被并行地流式传入 ClickHouse 引擎，以找到真正的匹配记录。这种索引设计使主索引可以非常小（它可以并且必须完全放入主内存中），同时仍能显著加速查询执行时间——尤其是对于数据分析场景中常见的区间查询。

下面将详细说明 ClickHouse 如何构建和使用其稀疏主索引。本文后续部分还将讨论在选择、移除以及排序用于构建索引的表列（主键列）时的一些最佳实践。

### 带有主键的表 \{#a-table-with-a-primary-key\}

创建一个具有复合主键的表，其键列为 UserID 和 URL：

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
    为了简化本指南后续的讨论，并使图示和结果可重现，这条 DDL 语句会：

    <ul>
      <li>
        通过 <code>ORDER BY</code> 子句为表指定一个复合排序键。
      </li>

      <li>
        通过以下设置显式控制主索引中的索引条目数量：

        <ul>
          <li>
            <code>index&#95;granularity</code>：显式设为其默认值 8192。这意味着对于每组 8192 行数据，主索引会有一个索引条目。例如，如果表中包含 16384 行数据，索引将有两个索引条目。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>：设置为 0 以禁用<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">自适应索引粒度</a>。自适应索引粒度意味着，当满足以下任一条件时，ClickHouse 会自动为 n 行的一组数据创建一个索引条目：

            <ul>
              <li>
                若 <code>n</code> 小于 8192，且这 <code>n</code> 行合并后的行数据大小大于等于 10 MB（<code>index&#95;granularity&#95;bytes</code> 的默认值）。
              </li>

              <li>
                若 <code>n</code> 行合并后的行数据大小小于 10 MB，但 <code>n</code> 等于 8192。
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>：设置为 0 以禁用<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主索引压缩</a>。这将允许我们在需要时于稍后检查其内容。
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

上述 DDL 语句中的主键会基于指定的两个键列创建主索引。

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

返回结果类似如下：

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

并优化该表：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

我们可以使用以下查询来获取关于表的元数据：


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

返回结果如下：

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

* 该表的数据以 [宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 存储在磁盘上的特定目录中，这意味着该目录中每个表的列各自对应一个数据文件（以及一个标记文件）。
* 该表有 887 万行。
* 所有行未压缩的数据总大小为 733.28 MB。
* 所有行在磁盘上压缩后的总大小为 206.94 MB。
* 该表具有一个包含 1083 个条目的主索引（称为“marks”），索引大小为 96.93 KB。
* 总体而言，该表的数据文件、标记文件和主索引文件在磁盘上一共占用 207.07 MB。


### 数据按照主键列在磁盘上有序存储 \\{#data-is-stored-on-disk-ordered-by-primary-key-columns\\}

我们在上面创建的这张表具有

- 一个复合[主键](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`，以及
- 一个复合[排序键](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

- 如果我们只指定了排序键，那么主键会被隐式定义为与排序键相同。

- 为了节省内存，我们显式指定了一个仅包含查询过滤所用列的主键。基于主键的主索引会被完整加载到内存中。

- 为了在本指南的示意图中保持一致性，并最大化压缩比，我们定义了一个包含表中所有列的单独排序键（如果某一列中相似的数据彼此靠得更近，例如通过排序实现，那么这些数据会被压缩得更好）。

- 如果同时指定了主键和排序键，则主键需要是排序键的前缀。
:::

插入的行会按照主键列（以及来自排序键的额外 `EventTime` 列）以字典序（升序）存储在磁盘上。

:::note
ClickHouse 允许插入多个具有相同主键列值的行。在这种情况下（参见下图中的第 1 行和第 2 行），最终顺序由指定的排序键决定，因此由 `EventTime` 列的值决定。
:::

ClickHouse 是一个<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">列式数据库管理系统</a>。如下图所示

- 在磁盘上的物理表示中，每个表列对应一个数据文件（*.bin），该列的所有值都以<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>格式存储；并且
- 这 887 万行数据在磁盘上按照主键列（以及额外的排序键列）的字典序升序存储，即在本例中
  - 首先按 `UserID`，
  - 然后按 `URL`，
  - 最后按 `EventTime`：

<Image img={sparsePrimaryIndexes01} size="md" alt="稀疏主索引 01" background="white"/>

`UserID.bin`、`URL.bin` 和 `EventTime.bin` 是磁盘上的数据文件，其中分别存储了 `UserID`、`URL` 和 `EventTime` 列的值。

:::note

- 由于主键定义了磁盘上行的字典序，因此一张表只能有一个主键。

- 我们从 0 开始对行进行编号，以与 ClickHouse 内部用于日志消息的行编号方案保持一致。
:::

### 为并行数据处理而将数据组织成粒度 \\{#data-is-organized-into-granules-for-parallel-data-processing\\}

出于数据处理的目的，表的列值在逻辑上被划分为若干粒度（granule）。
粒度是在以流式方式将数据送入 ClickHouse 进行处理时，最小且不可再分的数据集。
这意味着 ClickHouse 并不是读取单独的行，而是始终以流式并行的方式读取一整组（粒度）行。
:::note
列值并不是物理地存储在粒度内部：粒度只是对列值进行的一种逻辑组织，用于查询处理。
:::

下图展示了我们表中 887 万行（其列值）如何组织成 1083 个粒度，
这是由于表的 DDL 语句中包含的 `index_granularity` 设置（设置为其默认值 8192）所决定的。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

按磁盘物理顺序，最前面的 8192 行（其列值）在逻辑上属于粒度 0，接下来的 8192 行（其列值）属于粒度 1，以此类推。

:::note

- 最后一个粒度（粒度 1082）“包含”的行数少于 8192 行。

- 我们在本指南开头的 “DDL Statement Details” 中提到过，为了简化本指南中的讨论，并使图示和结果可复现，我们禁用了[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)。

  因此，在我们的示例表中，除最后一个粒度外，所有粒度的大小都相同。

- 对于启用了自适应索引粒度的表（索引粒度[默认](/operations/settings/merge-tree-settings#index_granularity_bytes)为自适应），部分粒度的大小可能会小于 8192 行，这取决于行数据的大小。

- 我们用橙色标记了部分主键列（`UserID`、`URL`）中的列值。
  这些橙色标记的列值是每个粒度中第一行的主键列值。
  正如下文将看到的，这些橙色标记的列值将成为表主键索引中的条目。

- 我们从 0 开始对粒度进行编号，以便与 ClickHouse 内部编号方案保持一致，该方案也用于日志消息。
:::

### 主索引每个粒度有一个条目 \\{#the-primary-index-has-one-entry-per-granule\\}

主索引是基于上图中所示的粒度创建的。该索引是一个未压缩的扁平数组文件（primary.idx），包含从 0 开始的数值索引标记。

下图显示，索引为每个粒度的第一行存储主键列值（即上图中以橙色标记的值）。
换句话说：主索引存储的是表中每第 8192 行的主键列值（基于由主键列定义的物理行顺序）。
例如：

- 第一个索引条目（下图中的“mark 0”）存储的是上图中粒度 0 的第一行的键列值，
- 第二个索引条目（下图中的“mark 1”）存储的是上图中粒度 1 的第一行的键列值，依此类推。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="稀疏主索引 03a" background="white"/>

总体而言，对于我们的这张包含 887 万行和 1083 个粒度的表，索引共有 1083 个条目：

<Image img={sparsePrimaryIndexes03b} size="md" alt="稀疏主索引 03b" background="white"/>

:::note

- 对于启用了[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，主索引中还会存储一个额外的“最终”标记，用于记录表最后一行的主键列值。但由于我们在本指南中禁用了自适应索引粒度（以简化讨论，并使图示和结果可复现），因此示例表的索引并不包含这个最终标记。

- 主索引文件会被完整加载到内存中。如果该文件大于可用的空闲内存空间，ClickHouse 会抛出错误。
:::

<details>
    <summary>
    检查主索引的内容
    </summary>
    <p>

在自管理 ClickHouse 集群上，我们可以使用 <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file 表函数</a> 来检查示例表主索引的内容。

为此，我们首先需要将主索引文件复制到运行中集群某个节点的 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> 中：
<ul>
<li>步骤 1：获取包含主索引文件的分区片段路径（part path）</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

在测试机器上，返回 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`。

<li>步骤 2：获取 user_files_path</li>
Linux 上的 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">默认 user_files_path</a> 为
`/var/lib/clickhouse/user_files/`

在 Linux 上可以通过以下方式检查它是否被修改过：`$ grep user_files_path /etc/clickhouse-server/config.xml`

在测试机器上，该路径为 `/Users/tomschreiber/Clickhouse/user_files/`

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
这与我们示例表中主索引内容的示意图完全一致：

</p>
</details>

主键条目被称为索引标记（index marks），因为每个索引条目都标记了一个特定数据范围的起始位置。就示例表而言：

- UserID 索引标记：

  主索引中存储的 `UserID` 值按升序排列。<br/>
  因此，上图中的 “mark 1” 表示：粒度 1 中，以及所有后续粒度中，所有表行的 `UserID` 值都保证大于或等于 4.073.710。

[正如我们稍后将看到的](#the-primary-index-is-used-for-selecting-granules)，当查询在主键的第一列上进行过滤时，这种全局排序使 ClickHouse 能够在第一键列的索引标记上 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">使用二分查找算法</a>。

- URL 索引标记：

  主键列 `UserID` 和 `URL` 具有非常接近的基数，这意味着对于从第二个键列开始的所有键列，其索引标记一般只有在前一个键列的值在至少当前粒度内的所有表行中都保持不变时，才能指示一个数据范围。<br/>
  例如，由于上图中标记 0 和标记 1 的 UserID 值不同，ClickHouse 无法假设粒度 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。但是，如果上图中标记 0 和标记 1 的 UserID 值相同（意味着粒度 0 中所有表行的 UserID 值都相同），那么 ClickHouse 就可以假设粒度 0 中所有表行的 URL 值都大于或等于 `'http://showtopics.html%3...'`。

  我们将在后文更详细地讨论这对查询执行性能的影响。

### 主索引用于选择数据块（granule） \{#the-primary-index-is-used-for-selecting-granules\}

现在我们可以在主索引的支持下执行查询。

下面的查询将计算 UserID 749927693 点击次数最多的前 10 个 URL。

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

ClickHouse 客户端的输出现在显示，ClickHouse 不再执行全表扫描，而是仅有 8.19 千行数据被流式写入 ClickHouse。

如果启用了<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace 级别日志</a>，则在 ClickHouse 服务器日志文件中可以看到，ClickHouse 正在对 1083 个 UserID 索引标记执行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>，以识别那些可能包含 UserID 列值为 `749927693` 的行的 granule。该过程需要 19 步，平均时间复杂度为 `O(log2 n)`：

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

我们可以从上面的 trace 日志中看到，在现有的 1083 个 mark 中，只有一个 mark 满足了该查询。

<details>
  <summary>
    Trace 日志详情
  </summary>

  <p>
    识别到的是 Mark 176（&#39;found left boundary mark&#39; 为包含性边界，&#39;found right boundary mark&#39; 为不包含性边界），因此来自 granule 176 的全部 8192 行（该 granule 从第 1.441.792 行开始——我们将在本指南后面看到这一点）会被流式传入 ClickHouse，以便找到实际 UserID 列值为 `749927693` 的那些行。
  </p>
</details>

我们也可以在示例查询中使用 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 子句</a> 来重现这一点：

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返回结果类似如下：


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

客户端输出显示，在 1083 个 granule 中，有 1 个被选为可能包含 `UserID` 列值为 749927693 的行。

:::note 结论
当查询对某个既属于复合键又是该复合键首列的列进行过滤时，ClickHouse 会在该键列的索引标记上运行二分查找算法。
:::

<br />

如上所述，ClickHouse 使用其稀疏主键索引，通过二分查找快速选择那些可能包含满足查询条件行的 granule。

这是 ClickHouse 查询执行的**第一阶段（granule 选择）**。

在**第二阶段（数据读取）**中，ClickHouse 会定位已选中的 granule，将其中所有行流式传入 ClickHouse 引擎，以便找出真正满足查询条件的行。

我们将在下一节中更详细地讨论第二阶段。


### 标记文件用于定位粒度 \\{#mark-files-are-used-for-locating-granules\\}

下图展示了我们这张表的主索引文件的一部分。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

如上文所述，通过在索引中的 1083 个 UserID 标记上执行二分查找，找到了标记 176。与之对应的粒度 176 因此可能包含 `UserID` 列值为 749.927.693 的行。

<details>
    <summary>
    Granule Selection Details
    </summary>
    <p>

上图表明，标记 176 是第一个索引项，其中，与其关联的粒度 176 的最小 UserID 值小于 749.927.693，而下一条标记（标记 177）所对应的粒度 177 的最小 UserID 值大于该值。因此，只有标记 176 对应的粒度 176 可能包含 `UserID` 列值为 749.927.693 的行。
</p>
</details>

为了确认粒度 176 中是否有某些行包含 `UserID` 列值 749.927.693，需要将属于该粒度的全部 8192 行流式读取到 ClickHouse 中。

为此，ClickHouse 需要知道粒度 176 的物理位置。

在 ClickHouse 中，我们这张表所有粒度的物理位置都存储在标记文件中。与数据文件类似，每个表列对应一个标记文件。

下图展示了三个标记文件 `UserID.mrk`、`URL.mrk` 和 `EventTime.mrk`，它们存储了表中 `UserID`、`URL` 和 `EventTime` 列的粒度物理位置。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

我们已经讨论过，主索引是一个扁平的未压缩数组文件（primary.idx），其中包含从 0 开始编号的索引标记。

类似地，标记文件也是一个扁平的未压缩数组文件（*.mrk），其中的标记同样从 0 开始编号。

一旦 ClickHouse 确定并选中了某个粒度的索引标记，而该粒度可能包含查询所需的匹配行，就可以在标记文件中执行基于位置的数组查找，以获得该粒度的物理位置。

每个特定列的标记文件条目以偏移量的形式存储两个位置：

- 第一个偏移量（上图中的 `block_offset`）用于定位<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">块（block）</a>在<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>列数据文件中的位置，该块包含所选粒度的压缩版本。这个压缩块可能包含若干个被压缩的粒度。定位到的压缩文件块在读取时会被解压到内存中。

- 第二个偏移量（上图中的 `granule_offset`）来自标记文件，给出了粒度在未压缩块数据中的位置。

随后，属于该未压缩粒度的全部 8192 行都会被流式读取到 ClickHouse 中以进行后续处理。

:::note

- 对于使用[宽格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)且未启用[自适应索引粒度](/whats-new/changelog/2019.md/#experimental-features-1)的表，ClickHouse 使用如上所示的 `.mrk` 标记文件，其中每条记录包含两个 8 字节长的地址。这些记录是粒度的物理位置，所有粒度的大小都相同。

索引粒度在[默认情况下](/operations/settings/merge-tree-settings#index_granularity_bytes)是自适应的，但在我们的示例表中，我们禁用了自适应索引粒度（以简化本指南中的讨论，并使图示和结果可复现）。我们的表使用宽格式，是因为数据大小大于 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（对于自管理集群，其默认值为 10 MB）。

- 对于使用宽格式且启用了自适应索引粒度的表，ClickHouse 使用 `.mrk2` 标记文件，它们包含与 `.mrk` 标记文件类似的条目，但每条记录额外包含第三个值：当前条目关联的粒度的行数。

- 对于使用[紧凑格式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)的表，ClickHouse 使用 `.mrk3` 标记文件。

:::

:::note Why Mark Files

为什么主键索引不直接包含与索引标记对应的粒度的物理位置？

因为在 ClickHouse 设计所针对的这一超大规模下，高效使用磁盘和内存非常重要。

主键索引文件需要能够装入主内存。

针对我们的示例查询，ClickHouse 使用主键索引并选择了一个可能包含与查询匹配行的粒度。只有对于这一粒度，ClickHouse 才需要物理位置信息，以便将相应的行以流式方式传入进行进一步处理。

此外，这些偏移量信息只对 `UserID` 和 `URL` 列是必需的。

对于未在查询中使用的列（例如 `EventTime`），则不需要偏移量信息。

对于我们的示例查询，ClickHouse 只需要 `UserID` 数据文件（UserID.bin）中粒度 176 的两个物理位置偏移，以及 `URL` 数据文件（URL.bin）中粒度 176 的两个物理位置偏移。

标记文件提供的这种间接方式，避免了在主键索引中直接存储所有 3 列的全部 1083 个粒度的物理位置信息条目，从而避免在主内存中保留不必要的（潜在不会使用的）数据。
:::

下图及其后面的文字说明了在我们的示例查询中，ClickHouse 是如何在 UserID.bin 数据文件中定位粒度 176 的。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

我们在本指南前面已经讨论过，ClickHouse 选择了主键索引标记 176，因此选择了粒度 176 作为可能包含与我们的查询匹配行的粒度。

ClickHouse 现在使用索引中选定的标记编号（176），在 UserID.mrk 标记文件中进行基于位置的数组查找，以获取定位粒度 176 所需的两个偏移量。

如图所示，第一个偏移量用于定位 UserID.bin 数据文件中包含粒度 176 压缩版本的压缩文件块。

一旦将定位到的文件块解压到主内存中，就可以使用来自标记文件的第二个偏移量，在未压缩数据中定位粒度 176。

为了执行我们的示例查询（对于 UserID 为 749.927.693 的互联网用户，获取点击次数最多的前 10 个 URL），ClickHouse 需要从 UserID.bin 数据文件和 URL.bin 数据文件中定位（并流式读取所有值）粒度 176。

上图展示了 ClickHouse 是如何为 UserID.bin 数据文件定位该粒度的。

与此同时，ClickHouse 正在对 URL.bin 数据文件中的粒度 176 执行同样的操作。两个对应的粒度会被对齐并流式传入 ClickHouse 引擎进行进一步处理，即对所有 UserID 为 749.927.693 的行，以分组的方式聚合并统计 URL 值，最后按计数降序输出前 10 个计数最高的 URL 分组。

## 使用多个主索引 \\{#using-multiple-primary-indexes\\}

<a name="filtering-on-key-columns-after-the-first"></a>

### 二级键列可能（并非）低效 \{#secondary-key-columns-can-not-be-inefficient\}

当一个查询在过滤一个属于复合键且是第一个键列的列时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

但是，当查询在过滤一个属于复合键但不是第一个键列的列时，会发生什么？

:::note
我们讨论的场景是：查询明确地不在第一个键列上过滤，而是在某个二级键列上过滤。

当查询同时在第一个键列和第一个之后的任意键列上过滤时，ClickHouse 会在第一个键列的索引标记上运行二分查找。
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

10 rows in set. Elapsed: 0.086 sec.
# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

客户端输出表明，尽管 [URL 列是复合主键的一部分](#a-table-with-a-primary-key)，ClickHouse 仍然几乎执行了全表扫描！在这张表的 887 万行数据中，ClickHouse 读取了 881 万行。

如果启用了 [trace&#95;logging](/operations/server-configuration-parameters/settings#logger)，那么在 ClickHouse 服务器日志文件中可以看到，ClickHouse 在 1083 个 URL 索引标记上使用了<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索</a>，以识别那些可能包含 URL 列值为 &quot;[http://public&#95;search](http://public\&#95;search)&quot; 的行的数据粒度（granule）：

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

从上面的示例 trace 日志中可以看到，通过 marks，在 1083 个 granule 中有 1076 个被选为可能包含具有匹配 URL 值的行。

这会导致有 881 万行数据被流式加载到 ClickHouse 引擎中（通过 10 个流并行处理），以便识别哪些行实际上包含 URL 值 &quot;[http://public&#95;search&quot;。](http://public\&#95;search\&quot;。)

然而，正如我们稍后将看到的，在选出的这 1076 个 granule 中，实际上只有 39 个 granule 包含匹配的行。

尽管基于复合主键 (UserID, URL) 的主索引对于加速按特定 UserID 值过滤行的查询非常有用，但在加速按特定 URL 值过滤行的查询时，该索引并未提供显著帮助。

其原因在于 URL 列不是第一个键列，因此 ClickHouse 在 URL 列的 index marks 上使用的是通用排除搜索算法（而不是二分查找），并且**该算法的有效性取决于** URL 列与其前驱键列 UserID 之间的基数差异。

为此，我们给出一些关于通用排除搜索是如何工作的细节。

<a name="generic-exclusion-search-algorithm" />


### 通用排除搜索算法 \\{#generic-exclusion-search-algorithm\\}

下面通过一个示例说明，当通过一个次级键列选择颗粒、且其前置键列具有较低或较高基数时，<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse 通用排除搜索算法</a>是如何工作的。

在这两种情况下，我们都假设：

- 查询在搜索 URL 值为 "W3" 的行。
- 一个抽象化的 hits 表，其中 UserID 和 URL 的值被简化。
- 用于索引的相同复合主键 (UserID, URL)。这意味着行首先按 UserID 值排序，具有相同 UserID 值的行随后按 URL 排序。
- 颗粒大小为 2，即每个颗粒包含两行。

在下图中，我们用橙色标记了每个颗粒首行的键列值。

**前置键列具有较低基数**<a name="generic-exclusion-search-fast"></a>

假设 UserID 具有较低基数。在这种情况下，相同的 UserID 值很可能分布在多个表行和颗粒中，从而跨越多个索引标记。对于具有相同 UserID 的索引标记，其 URL 值是按升序排序的（因为表行首先按 UserID 然后按 URL 排序）。这使得可以按如下方式进行高效过滤：

<Image img={sparsePrimaryIndexes07} size="md" alt="稀疏主索引 06" background="white"/>

对于上图中的抽象示例数据，在颗粒选择过程中有三种不同场景：

1.  对于索引标记 0，**其 URL 值小于 W3，且其直接后继索引标记的 URL 值也小于 W3**，可以将其排除，因为标记 0 和 1 具有相同的 UserID 值。请注意，此排除前提条件确保颗粒 0 完全由 UserID 为 U1 的行组成，因此 ClickHouse 可以假设颗粒 0 中的最大 URL 值也小于 W3，从而排除该颗粒。

2. 对于索引标记 1，**其 URL 值小于（或等于）W3，且其直接后继索引标记的 URL 值大于（或等于）W3**，需要选择该标记，因为这意味着颗粒 1 可能包含 URL 为 W3 的行。

3. 对于索引标记 2 和 3，**其 URL 值大于 W3**，可以将其排除，因为主索引的索引标记为每个颗粒的首行存储键列值，而表行在磁盘上按键列值排序，因此颗粒 2 和 3 不可能包含 URL 值为 W3 的行。

**前置键列具有较高基数**<a name="generic-exclusion-search-slow"></a>

当 UserID 具有较高基数时，相同的 UserID 值分布在多个表行和颗粒上的可能性就很低。这意味着索引标记的 URL 值不再单调递增：

<Image img={sparsePrimaryIndexes08} size="md" alt="稀疏主索引 06" background="white"/>

如上图所示，所有 URL 值小于 W3 的索引标记都会被选中，用于将其关联颗粒中的行流式传入 ClickHouse 引擎。

这是因为尽管图中的所有索引标记都落在前面描述的场景 1 中，但它们并不满足前面提到的排除前提条件：*直接后继索引标记与当前标记具有相同的 UserID 值*，因此无法被排除。

例如，考虑索引标记 0，**其 URL 值小于 W3，且其直接后继索引标记的 URL 值也小于 W3**。该标记*不能*被排除，因为其直接后继索引标记 1 的 UserID 值与当前标记 0 的 UserID 值*不*相同。

这最终使得 ClickHouse 无法对颗粒 0 中的最大 URL 值做出任何假设。相反，它必须假设颗粒 0 可能包含 URL 值为 W3 的行，因此被迫选择标记 0。

对于标记 1、2 和 3，同样适用这一情形。

:::note 结论
当查询在一个属于复合键但不是第一个键列的列上进行过滤时，ClickHouse 会使用 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">通用排除搜索算法（generic exclusion search algorithm）</a> 来替代 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找算法（binary search algorithm）</a>。当前导键列的基数较低时，这种通用排除搜索算法效果最佳。
:::

在我们的示例数据集中，这两个键列（UserID、URL）都具有类似的高基数。正如前文所述，当 URL 列的前导键列具有较高或相近的基数时，通用排除搜索算法的效果并不理想。

### 关于 data skipping 索引的说明 \{#note-about-data-skipping-index\}

由于 UserID 和 URL 都具有类似的高基数，我们在 URL 上的[查询过滤](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，即使在 URL 列上创建一个[次级 data skipping 索引](./skipping-indexes.md)，对于带有[复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key)来说，收益也不会太大。

例如，下面这两个语句会在我们表的 URL 列上创建并填充一个 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping 索引：

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse 现在创建了一个额外的索引,该索引为每组 4 个连续的[颗粒](#data-is-organized-into-granules-for-parallel-data-processing)存储最小和最大 URL 值(注意上面 `ALTER TABLE` 语句中的 `GRANULARITY 4` 子句):

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

第一个索引条目(上图中的 &#39;mark 0&#39;)存储了[属于表中前 4 个颗粒的行](#data-is-organized-into-granules-for-parallel-data-processing)的最小和最大 URL 值。

第二个索引条目(&#39;mark 1&#39;)存储了属于表中接下来 4 个颗粒的行的最小和最大 URL 值,依此类推。

(ClickHouse 还为数据跳过索引创建了一个特殊的[标记文件](#mark-files-are-used-for-locating-granules),用于[定位](#mark-files-are-used-for-locating-granules)与索引标记关联的颗粒组。)

由于 UserID 和 URL 的基数同样很高,当执行[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)时,这个辅助数据跳过索引无法帮助排除颗粒。

查询要查找的特定 URL 值(即 &#39;[http://public&#95;search&#39;)很可能位于索引为每组颗粒存储的最小值和最大值之间,这导致](http://public\&#95;search\&#39;\)很可能位于索引为每组颗粒存储的最小值和最大值之间,这导致) ClickHouse 被迫选择该颗粒组(因为它们可能包含与查询匹配的行)。


### 需要使用多个主索引 \\{#a-need-to-use-multiple-primary-indexes\\}

因此，如果我们想要显著加速按特定 URL 过滤行的示例查询，就需要使用针对该查询优化的主索引。

如果同时还想保持按特定 UserID 过滤行的示例查询的良好性能，那么就需要使用多个主索引。

下面展示了实现这一点的方法。

<a name="multiple-primary-indexes"></a>

### 创建额外主索引的选项 \\{#options-for-creating-additional-primary-indexes\\}

如果我们想要显著加速这两个示例查询——一个是过滤具有特定 UserID 的行，另一个是过滤具有特定 URL 的行——那么我们需要通过以下三种方式之一来使用多个主索引：

- 创建一张具有不同主键的**第二张表**。
- 在现有表上创建一个 **materialized view**。
- 向现有表中添加一个 **projection**。

这三种选项都会有效地将我们的示例数据复制到一个额外的表中，以便重新组织表的主索引和行排序顺序。

不过，这三种选项在额外表对用户的透明程度上有所不同，特别是在查询和插入语句的路由方式方面。

当创建一张具有不同主键的**第二张表**时，查询必须显式发送到最适合该查询的表版本，并且为了保持两张表的数据同步，新数据必须显式插入到这两张表中：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

使用 **materialized view** 时，会隐式创建额外的表，并且两张表之间的数据会自动保持同步：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

而 **projection** 是最透明的选项，因为除了会自动将隐式创建（且对用户隐藏）的额外表与数据变更保持同步之外，ClickHouse 还会自动为查询选择最有效的表版本：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

在接下来的内容中，我们将更详细地讨论这三种创建和使用多个主索引的选项，并配以实际示例。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### 选项 1：辅助表 \{#option-1-secondary-tables\}

<a name="secondary-table" />

我们将创建一个新的辅助表，在该表的主键中，将键列的顺序（与原始表相比）对调：

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

将我们[原始表](#a-table-with-a-primary-key)中的全部 887 万行数据插入到这个辅助表中：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

返回结果大致如下：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最后，优化该表：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

由于我们调整了主键中列的顺序，插入的行现在在磁盘上的字典序顺序（与我们的[原始表](#a-table-with-a-primary-key)相比）也发生了变化，因此该表的 1083 个 granule 中所包含的值也与之前不同：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

这是新的主键：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

现在可以利用它显著加速我们示例查询的执行：该查询在 URL 列上进行过滤，用于计算在 URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; 上点击最频繁的前 10 个用户：

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

10 rows in set. Elapsed: 0.017 sec.
# highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

现在，ClickHouse 在执行该查询时效率高得多，而不再需要[几乎进行一次全表扫描](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)。

在[原始表](#a-table-with-a-primary-key)的主索引中，UserID 是第一列，URL 是第二个键列，ClickHouse 使用了[通用排除搜索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)在索引标记上执行该查询；由于 UserID 和 URL 都具有相近且较高的基数，这种方式效率并不高。

当 URL 作为主索引中的第一列时，ClickHouse 现在会在索引标记上运行<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分查找</a>。
ClickHouse 服务器日志文件中的相应 trace 日志证实了这一点：


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

ClickHouse 只选择了 39 个索引标记，而在使用通用排除搜索时会选择 1076 个。

请注意，这个附加表是为了加速我们按 URL 过滤的示例查询的执行而优化的。

与使用[原始表](#a-table-with-a-primary-key)时该查询性能[较差](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)类似，我们按 `UserIDs` 过滤的[示例查询](#the-primary-index-is-used-for-selecting-granules)在这个新的附加表上也无法高效运行，因为在该表的主键中，UserID 现在是第二个键列，因此 ClickHouse 会在粒度选择上使用通用排除搜索，而这对于 UserID 和 URL 这类[同样具有高基数的列来说效果并不理想](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
打开详情框查看具体信息。

<details>
  <summary>
    按 UserIDs 过滤的查询现在性能很差<a name="query-on-userid-slow" />
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

我们现在有两个表：一个针对按 `UserIDs` 过滤的查询进行了优化，另一个则针对按 URL 过滤的查询进行了优化：


### 选项 2：materialized view \{#option-2-materialized-views\}

在现有表上创建一个 [materialized view](/sql-reference/statements/create/view.md)。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

响应结果如下：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

* 我们在 view 的主键中调整了键列的顺序（相较于[原始表](#a-table-with-a-primary-key)）
* materialized view 背后有一个**隐式创建的表**作为底层表，其行顺序和主索引基于给定的主键定义
* 这个隐式创建的表会被 `SHOW TABLES` 查询列出，并且其名称以 `.inner` 开头
* 也可以先显式创建一个用于 materialized view 的底层表，然后在创建 view 时通过 `TO [db].[table]` [子句](/sql-reference/statements/create/view.md) 指向该表
* 我们使用 `POPULATE` 关键字，以便立即用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中全部 887 万行数据填充这个隐式创建的表
* 如果有新行插入到源表 hits&#95;UserID&#95;URL 中，那么这些行也会自动插入到该隐式创建的表中
* 实际上，这个隐式创建的表与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white" />

ClickHouse 会将该隐式创建表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在 ClickHouse 服务器数据目录中的一个特殊目录中：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white" />

:::

现在，可以利用这个作为 materialized view 底层表的隐式创建表（及其主索引），显著加速在 URL 列上进行过滤的示例查询的执行：

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
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

10 rows in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

由于支撑该 materialized view 的（隐式创建的）表及其主键索引，与我们[显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)本质上相同，因此该查询的实际执行方式与使用显式创建的表时相同。

ClickHouse 服务器日志文件中的对应 trace 日志条目确认，ClickHouse 正在对索引标记执行二分查找：


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


### 选项 3：PROJECTION \{#option-3-projections\}

在现有表上创建一个 PROJECTION：

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

并将该 PROJECTION 物化：

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* 投影会创建一个**隐藏表**，其行顺序和主索引基于该投影指定的 `ORDER BY` 子句
* 隐藏表不会出现在 `SHOW TABLES` 查询结果中
* 我们使用 `MATERIALIZE` 关键字，以便立即用源表 [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) 中的全部 887 万行数据填充隐藏表
* 如果向源表 hits&#95;UserID&#95;URL 插入新行，这些行也会自动插入到隐藏表中
* 查询在语法上始终以源表 hits&#95;UserID&#95;URL 为目标，但如果隐藏表的行顺序和主索引能够实现更高效的查询执行，则会优先使用该隐藏表
* 请注意，投影并不会让使用 ORDER BY 的查询更高效，即使该 ORDER BY 与投影的 ORDER BY 语句完全匹配也是如此（参见 [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333)）
* 实际上，隐式创建的隐藏表与[我们显式创建的二级表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)具有相同的行顺序和主索引：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse 将隐藏表的[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark 文件](#mark-files-are-used-for-locating-granules)（*.mrk2）以及[主索引](#the-primary-index-has-one-entry-per-granule)（primary.idx）存储在一个特殊文件夹中（在下方截图中用橙色标出），该文件夹与源表的数据文件、mark 文件和主索引文件位于同一位置：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

现在，由投影创建的隐藏表（及其主索引）可以（隐式地）用于显著加速我们对 URL 列进行过滤的示例查询的执行。请注意，该查询在语法上仍然以该投影的源表为目标。

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

由于投影创建的隐藏表（及其主索引）在本质上与[我们显式创建的辅助表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)相同，因此该查询的实际执行方式与使用显式创建的表时是一样的。

ClickHouse 服务器日志文件中的对应 trace 日志表明，ClickHouse 正在对索引标记执行二分查找：


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


### 总结 \\{#summary\\}

我们针对[具有复合主键 (UserID, URL) 的表](#a-table-with-a-primary-key) 的主索引，在加速[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 时非常有用。  
但这个索引在加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 时并没有提供显著帮助，尽管 URL 列也是该复合主键的一部分。

反过来也一样：  
我们针对[具有复合主键 (URL, UserID) 的表](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) 的主索引，可以加速[按 URL 过滤的查询](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)，但对[按 UserID 过滤的查询](#the-primary-index-is-used-for-selecting-granules) 的加速效果却不明显。

由于主键列 UserID 和 URL 都具有相近的高基数，对于一个按第二个键列进行过滤的查询，[第二个键列出现在索引中并不能带来太多收益](#generic-exclusion-search-algorithm)。

因此，将第二个键列从主索引中移除（从而减少索引的内存占用），并[改为使用多个主索引](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)，是合理的做法。

但是，如果复合主键中的各键列在基数上存在较大的差异，那么按照基数升序对主键列进行排序，[会对查询更有利](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

键列之间的基数差异越大，这些列在键中的顺序就越重要。我们将在下一节中演示这一点。

## 高效排列主键列顺序 \{#ordering-key-columns-efficiently\}

<a name="test" />

在复合主键中，键列的顺序会显著影响：

* 在查询中对后续键列进行过滤的效率，以及
* 表数据文件的压缩比。

为演示这一点，我们将使用一个[网页流量示例数据集](#data-set)的变体，其中每一行包含三列，用来指示某个互联网“用户”（`UserID` 列）对某个 URL（`URL` 列）的访问是否被标记为机器人流量（`IsRobot` 列）。

我们将使用一个包含上述三列的复合主键，用于加速典型的网页分析查询，这些查询会计算：

* 指向某个特定 URL 的流量中有多少（百分比）来自机器人，或
* 我们对某个特定用户是否为机器人的置信度（来自该用户的流量中有多少百分比被认为是（不是）机器人流量）

我们使用下面这个查询来计算计划作为复合主键键列的三列的基数（注意我们使用 [URL table function](/sql-reference/table-functions/url.md) 来对 TSV 数据进行即席查询，而无需创建本地表）。在 `clickhouse client` 中运行此查询：

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

返回结果为：

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

我们可以看到基数存在很大的差异，尤其是 `URL` 和 `IsRobot` 列之间的差异。因此，在复合主键中这些列的排列顺序，对于提高在这些列上进行过滤的查询效率，以及使表的列数据文件达到最佳压缩率，都是非常重要的。

为此，我们将为机器人流量分析数据创建两个表版本：

* 表 `hits_URL_UserID_IsRobot`，其复合主键为 `(URL, UserID, IsRobot)`，其中按基数对键列进行降序排列
* 表 `hits_IsRobot_UserID_URL`，其复合主键为 `(IsRobot, UserID, URL)`，其中按基数对键列进行升序排列

创建表 `hits_URL_UserID_IsRobot`，并使用复合主键 `(URL, UserID, IsRobot)`：

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
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
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

并向其中导入与上一张表相同的 887 万行数据：


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


### 在次级键列上进行高效过滤 \{#efficient-filtering-on-secondary-key-columns\}

当查询在至少一个属于复合键且是第一个键列的列上进行过滤时，[ClickHouse 会在该键列的索引标记上运行二分查找算法](#the-primary-index-is-used-for-selecting-granules)。

当查询只在一个属于复合键但不是第一个键列的列上进行过滤时，[ClickHouse 会在该键列的索引标记上使用通用排除搜索算法](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

在第二种情况下，复合主键中各键列的排列顺序会显著影响[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)的有效性。

下面是一个查询，它在 `UserID` 列上进行过滤，该表的键列 `(URL, UserID, IsRobot)` 按基数降序排列：

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

这是在这样一张表上执行的同一个查询：该表的键列 `(IsRobot, UserID, URL)` 按基数从小到大排列。

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

我们可以看到，在按基数升序排列键列的表上，查询执行显著更加高效且更快。

其原因在于，当通过某个次级键列来选择[粒度](#the-primary-index-is-used-for-selecting-granules)，且其前面的键列具有更低的基数时，[通用排除搜索算法](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) 的效果最佳。我们已经在本指南的[前一节](#generic-exclusion-search-algorithm)中对此进行了详细说明。


### 数据文件的最优压缩率 \{#optimal-compression-ratio-of-data-files\}

下面这个查询比较了我们在上面创建的两个表中 `UserID` 列的压缩率：

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

查询结果如下：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

我们可以看到，对于按基数升序排列键列 `(IsRobot, UserID, URL)` 的那张表，`UserID` 列的压缩率显著更高。

虽然这两张表中存储的完全是相同的数据（我们向两张表中都插入了相同的 887 万行），但复合主键中键列的顺序会显著影响表中<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">压缩</a>数据在[列数据文件](#data-is-stored-on-disk-ordered-by-primary-key-columns)上占用的磁盘空间：

* 在表 `hits_URL_UserID_IsRobot` 中，复合主键为 `(URL, UserID, IsRobot)`，我们按基数降序排列键列，此时 `UserID.bin` 数据文件占用 **11.24 MiB** 的磁盘空间
* 在表 `hits_IsRobot_UserID_URL` 中，复合主键为 `(IsRobot, UserID, URL)`，我们按基数升序排列键列，此时 `UserID.bin` 数据文件仅占用 **877.47 KiB** 的磁盘空间

在磁盘上为表的某个列数据获得良好的压缩率，不仅可以节省磁盘空间，还可以让需要从该列读取数据的查询（尤其是分析型查询）更快，因为将该列数据从磁盘移动到内存（操作系统文件缓存）所需的 I/O 更少。

下面我们说明为什么为了提升表各列的压缩率，将主键列按基数升序排列是有益的。

下图概略展示了主键在磁盘上的行顺序，其中键列按基数升序排列：

<Image img={sparsePrimaryIndexes14a} size="md" alt="稀疏主索引 14a" background="white" />

我们已经讨论过[表的行数据在磁盘上是按主键列排序存储的](#data-is-stored-on-disk-ordered-by-primary-key-columns)。

在上图中，表的行（它们在磁盘上的列值）首先按其 `cl` 值排序，具有相同 `cl` 值的行再按其 `ch` 值排序。由于第一个键列 `cl` 的基数较低，很可能会有多行具有相同的 `cl` 值。正因为如此，也很可能 `ch` 值是有序的（局部有序——针对具有相同 `cl` 值的行）。

如果在某一列中，相似的数据彼此靠得很近，例如通过排序实现，那么这部分数据通常会被压缩得更好。
一般而言，压缩算法会从数据的“运行长度”（连续数据越长，对压缩越有利）
以及“局部性”（数据越相似，压缩率越好）中获益。

与上图相对，下图概略展示了主键在磁盘上的行顺序，其中键列按基数降序排列：

<Image img={sparsePrimaryIndexes14b} size="md" alt="稀疏主索引 14b" background="white" />


现在，表中的行首先按它们的 `ch` 值排序，具有相同 `ch` 值的行再按它们的 `cl` 值排序。
但是，由于第一个键列 `ch` 具有很高的基数，几乎不太可能出现具有相同 `ch` 值的行。也因此，`cl` 值也几乎不可能是有序的（局部地——即仅在具有相同 `ch` 值的行之间）。

所以，`cl` 值很大概率是随机顺序的，相应地会导致很差的数据局部性和压缩比。

### 摘要 \\{#summary-1\\}

为了在查询中高效地对次级键列进行过滤，并提升表列数据文件的压缩率，通常应将主键中的列按其基数从小到大排序。

## 高效定位单行数据 \\{#identifying-single-rows-efficiently\\}

尽管总体而言，这[并不是](/knowledgebase/key-value) ClickHouse 最适合的使用场景，
但有时基于 ClickHouse 构建的应用程序需要在 ClickHouse 表中高效地标识单行数据。

一种直观的解决方案是使用一个 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列，为每一行提供唯一值，并将该列作为主键中的一列，用于快速检索行。

为了实现最快的检索，UUID 列[需要作为主键中的首列](#the-primary-index-is-used-for-selecting-granules)。

我们已经讨论过，由于[ClickHouse 表的行数据在磁盘上按照主键列的顺序存储](#data-is-stored-on-disk-ordered-by-primary-key-columns)，如果在主键或复合主键中，将一个基数非常高的列（例如 UUID 列）放在基数较低的列之前，[会降低其他表列的数据压缩率](#optimal-compression-ratio-of-data-files)。

在最快检索和最优数据压缩之间的一种折中方案，是使用一个复合主键，将 UUID 放在最后一个主键列的位置，前面使用基数较低的主键列，以确保表中部分列能够获得良好的压缩率。

### 一个具体示例 \\{#a-concrete-example\\}

一个具体的例子是 Alexey Milovidov 开发并[撰文介绍](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)的纯文本粘贴服务 [https://pastila.nl](https://pastila.nl)。

每当文本区域发生变更时，数据就会自动保存到 ClickHouse 表中的一行（每次变更一行）。

标识和检索（某个特定版本的）粘贴内容的一种方式，是使用内容的哈希值作为包含该内容的表行的 UUID。

下图展示了

- 当内容发生变化时（例如由于在文本区域中输入按键）行的插入顺序，以及
- 当使用 `PRIMARY KEY (hash)` 时，插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

由于使用了 `hash` 列作为主键列

- 可以[非常快速](#the-primary-index-is-used-for-selecting-granules)地检索特定行，但
- 表的行（其列数据）在磁盘上按照（唯一且随机的）哈希值升序排列。因此，`content` 列的值也以随机顺序存储，没有数据局部性，导致 **`content` 列数据文件的压缩比不理想**。

为了在仍然能够快速检索特定行的同时，显著提升 `content` 列的压缩比，pastila.nl 使用了两个哈希（以及一个复合主键）来标识特定行：

- 如上所述的内容哈希，对不同数据生成不同哈希值，并且
- 一个在数据发生小幅变更时**不会**改变的[局部敏感哈希（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

下图展示了

- 当内容发生变化时（例如由于在文本区域中输入按键）行的插入顺序，以及
- 当使用复合 `PRIMARY KEY (fingerprint, hash)` 时，插入行的数据在磁盘上的存储顺序：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

现在，磁盘上的行首先按照 `fingerprint` 排序；对于 fingerprint 值相同的行，其 `hash` 值决定最终顺序。

由于仅有小幅差异的数据会得到相同的 fingerprint 值，因此在 `content` 列中，相似的数据现在会在磁盘上彼此相邻地存储。这对 `content` 列的压缩比非常有利，因为一般来说，压缩算法会从数据局部性中获益（数据越相似，压缩比通常越好）。

这种权衡在于：为了最优地利用由复合 `PRIMARY KEY (fingerprint, hash)` 得到的主索引，在检索特定行时需要使用两个字段（`fingerprint` 和 `hash`）。