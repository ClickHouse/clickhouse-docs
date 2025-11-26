---
slug: /data-modeling/schema-design
title: 'Schema 设计'
description: '针对查询性能优化 ClickHouse Schema'
keywords: ['Schema', 'Schema 设计', '查询优化']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解高效的 schema 设计是优化 ClickHouse 性能的关键，其中的诸多选择往往需要在不同方案之间进行权衡，最优方案取决于实际查询模式，以及数据更新频率、延迟要求和数据量等因素。本指南概述了用于优化 ClickHouse 性能的 schema 设计最佳实践和数据建模技术。


## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中，我们使用 Stack Overflow 数据集的一个子集。该数据集包含自 2008 年至 2024 年 4 月在 Stack Overflow 上产生的每一条帖子、投票、用户、评论和徽章。该数据以 Parquet 格式提供，使用下方所示的 schema，存储在 S3 bucket `s3://datasets-documentation/stackoverflow/parquet/` 中：

> 所示的主键和关系并未通过约束进行强制执行（Parquet 是文件格式而非表格式），仅用于说明数据之间的关联方式以及其所具有的唯一键。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow 模式（Schema）"/>

<br />

Stack Overflow 数据集包含多张相互关联的表。在任何数据建模任务中，我们建议用户首先专注于加载主表。这不一定是最大的那张表，而是你预期会收到最多分析查询的那张表。这样可以让你熟悉 ClickHouse 的主要概念和数据类型——如果你主要来自 OLTP 背景，这一点尤为重要。随着更多关联表的加入，这张主表可能需要重新建模，以充分利用 ClickHouse 的特性并获得最佳性能。

上述 schema 在本指南中是刻意未进行最优设计的。



## 建立初始 schema

由于 `posts` 表将是大多数分析查询的目标，我们重点为该表建立 schema。此数据位于公共 S3 bucket `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中，每年一个文件。

> 以 Parquet 格式从 S3 加载数据是向 ClickHouse 加载数据最常见且推荐的方式。ClickHouse 针对处理 Parquet 做了优化，理论上可以每秒从 S3 读取并插入数千万行数据。

ClickHouse 提供了 schema 推断功能，可以自动识别数据集的数据类型。该功能支持所有数据格式，包括 Parquet。我们可以利用此特性，通过 S3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令来识别数据对应的 ClickHouse 类型。注意下面我们使用通配符模式 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                    │ Nullable(Int64)               │
│ PostTypeId            │ Nullable(Int64)               │
│ AcceptedAnswerId      │ Nullable(Int64)               │
│ CreationDate          │ Nullable(DateTime64(3, 'UTC')) │
│ Score                 │ Nullable(Int64)               │
│ ViewCount             │ Nullable(Int64)               │
│ Body                  │ Nullable(String)              │
│ OwnerUserId           │ Nullable(Int64)               │
│ OwnerDisplayName      │ Nullable(String)              │
│ LastEditorUserId      │ Nullable(Int64)               │
│ LastEditorDisplayName │ Nullable(String)              │
│ LastEditDate          │ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate      │ Nullable(DateTime64(3, 'UTC')) │
│ Title                 │ Nullable(String)              │
│ Tags                  │ Nullable(String)              │
│ AnswerCount           │ Nullable(Int64)               │
│ CommentCount          │ Nullable(Int64)               │
│ FavoriteCount         │ Nullable(Int64)               │
│ ContentLicense        │ Nullable(String)              │
│ ParentId              │ Nullable(String)              │
│ CommunityOwnedDate    │ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate            │ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> [`s3` 表函数](/sql-reference/table-functions/s3) 允许直接在 ClickHouse 中就地查询存储在 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了一个初始的、未经优化的 schema。默认情况下，ClickHouse 会将它们映射为等价的 `Nullable` 类型。我们可以使用一个简单的 `CREATE EMPTY AS SELECT` 命令，基于这些类型创建一个 ClickHouse 表。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

几点重要说明：

在运行此命令之后，我们的 posts 表是空的。尚未加载任何数据。
我们将表引擎指定为 MergeTree。MergeTree 是在 ClickHouse 中最常用的表引擎，相当于 ClickHouse 工具箱中的多功能工具，能够处理 PB 级别的数据量，并覆盖大多数分析型场景。对于诸如需要支持高效更新的 CDC 等场景，还可以使用其他表引擎。

子句 `ORDER BY ()` 表示我们没有索引，更具体地说，数据没有任何排序。后文会详细说明这一点。现在只需要知道，所有查询都将需要进行线性扫描。

要确认表已创建：

```sql
SHOW CREATE TABLE posts
```


CREATE TABLE posts
(
`Id` Nullable(Int64),
`PostTypeId` Nullable(Int64),
`AcceptedAnswerId` Nullable(Int64),
`CreationDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`Score` Nullable(Int64),
`ViewCount` Nullable(Int64),
`Body` Nullable(String),
`OwnerUserId` Nullable(Int64),
`OwnerDisplayName` Nullable(String),
`LastEditorUserId` Nullable(Int64),
`LastEditorDisplayName` Nullable(String),
`LastEditDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`LastActivityDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`Title` Nullable(String),
`Tags` Nullable(String),
`AnswerCount` Nullable(Int64),
`CommentCount` Nullable(Int64),
`FavoriteCount` Nullable(Int64),
`ContentLicense` Nullable(String),
`ParentId` Nullable(String),
`CommunityOwnedDate` Nullable(DateTime64(3, &#39;UTC&#39;)),
`ClosedDate` Nullable(DateTime64(3, &#39;UTC&#39;))
)
ENGINE = MergeTree(&#39;/clickhouse/tables/{uuid}/{shard}&#39;, &#39;{replica}&#39;)
ORDER BY tuple()

````

定义好初始架构后,我们可以使用 `INSERT INTO SELECT` 来填充数据,通过 S3 表函数读取数据。以下操作在 8 核 ClickHouse Cloud 实例上加载 `posts` 数据大约需要 2 分钟。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
````

> 上述查询会加载 6000 万行。对于 ClickHouse 来说这算小规模，但网络连接较慢的用户可能希望只加载一部分数据。可以通过使用 glob 通配模式指定要加载的年份来实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。关于如何使用 glob 模式来筛选文件子集，请参阅[此处](/sql-reference/table-functions/file#globs-in-path)。


## 优化类型 {#optimizing-types}

ClickHouse 查询性能的秘密之一是压缩。

磁盘上的数据越少，I/O 就越少，查询和写入（insert）就越快。就 CPU 开销而言，大多数情况下，任何压缩算法的开销都会被 I/O 的减少所抵消。因此，在确保 ClickHouse 查询足够快时，提高数据压缩率应该是首要关注点。

> 关于为什么 ClickHouse 能如此高效地压缩数据，我们推荐阅读[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简单来说，作为列式数据库，数据是按列写入的。如果这些值是排序的，相同的值会彼此相邻。压缩算法可以利用数据中连续的模式。在此基础上，ClickHouse 还提供了编解码器（codec）和更细粒度的数据类型，允许用户进一步调优压缩技术。

ClickHouse 中的压缩主要受 3 个因素影响：排序键（ordering key）、数据类型以及所使用的任何 codec。所有这些都通过表结构（schema）进行配置。

在压缩和查询性能方面，最初最大幅度的提升通常可以通过一个简单的类型优化流程来获得。可以应用几条简单的规则来优化 schema：

- **使用严格类型** - 我们最初的 schema 为很多显然是数值型的列使用了 String 类型。使用正确的类型可以在过滤和聚合时确保语义符合预期。对于日期类型同样如此，这些类型在 Parquet 文件中已经被正确提供。
- **避免 Nullable 列** - 默认情况下，上述列被假定为可能为 Null。`Nullable` 类型允许查询区分空值和 Null 值。这会额外创建一个 `UInt8` 类型的列。每当用户使用一个 Nullable 列时，这个附加列都必须被处理。这会占用额外存储空间，并几乎总是会对查询性能产生负面影响。只有在某个类型的默认空值与 Null 确实存在语义差异时才使用 Nullable。比如，在 `ViewCount` 列中将空值设为 0，对于大多数查询来说很可能已经足够，并且不会影响结果。如果需要对空值进行不同处理，通常也可以通过过滤条件将其从查询中排除。
- **为数值类型使用尽可能小的精度** - ClickHouse 针对不同的数值范围和精度提供了多种数值类型。应始终致力于最小化用于表示某列的位数。除了不同大小的整数（例如 Int16）之外，ClickHouse 还提供最小值为 0 的无符号变体。这些类型可以让某列使用更少的位数，例如 UInt16 的最大值为 65535，是 Int16 的两倍。如果可能，应优先选择这些类型，而不是更大的有符号变体。
- **为日期类型使用最小精度** - ClickHouse 支持多种日期和日期时间类型。`Date` 和 `Date32` 可用于存储纯日期，后者以更多位数为代价支持更大的日期范围。`DateTime` 和 `DateTime64` 用于存储日期时间。`DateTime` 仅支持到秒级精度，并使用 32 位；顾名思义，`DateTime64` 使用 64 位，但支持到纳秒级精度。一如既往，应选择查询可以接受的精度较粗的类型，从而最小化所需位数。
- **使用 LowCardinality** - 具有较少唯一值数量的数值、字符串、Date 或 DateTime 列可以考虑使用 `LowCardinality` 类型进行编码。该类型通过字典编码值，从而减小磁盘占用。可以考虑在唯一值少于 1 万的列上使用。
- **在特殊场景下使用 FixedString** - 具有固定长度的字符串可以使用 `FixedString` 类型进行编码，例如语言和货币代码。当数据长度恰好为 N 个字节时，这种方式效率很高。在其他情况下，它往往会降低效率，此时更推荐使用 `LowCardinality`。
- **使用 Enum 进行数据校验** - `Enum` 类型可以高效地编码枚举类型。根据需要存储的唯一值数量不同，Enum 可以是 8 位或 16 位。如果你希望在写入时进行约束校验（未声明的值会被拒绝），或者希望执行利用 Enum 值中自然顺序的查询（例如，设想一个反馈列包含用户响应 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`），可以考虑使用该类型。

> 提示：为了获取所有列的取值范围以及不同值的数量，用户可以使用简单查询：`SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在较小的数据子集上执行该查询，因为其代价可能较高。该查询要求数值列至少被定义为数值类型（即不能为 String），才能得到准确的结果。

通过将这些简单规则应用到我们的 posts 表，我们可以为每一列识别出一个最优类型：



| 列                       | 是否为数值 | 最小值，最大值                                                      | 唯一值      | 空值 | 注释                                                   | 优化类型                                                                                                                                                         |
| ----------------------- | ----- | ------------------------------------------------------------ | -------- | -- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 是     | 1, 8                                                         | 8        | 否  |                                                      | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是     | 0, 78285170                                                  | 12282094 | 是的 | 区分 Null 与 0 值                                        | UInt32                                                                                                                                                       |
| `CreationDate`          | 否     | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 否  | 如果不需要毫秒级精度，请使用 DateTime                              | DateTime                                                                                                                                                     |
| `Score`                 | 是     | -217, 34970                                                  | 3236     | 否  |                                                      | Int32                                                                                                                                                        |
| `ViewCount`             | 是     | 2, 13962748                                                  | 170867   | 否  |                                                      | UInt32                                                                                                                                                       |
| `Body`                  | 否     | -                                                            | *        | 否  |                                                      | String                                                                                                                                                       |
| `OwnerUserId`           | 是     | -1, 4056915                                                  | 6256237  | 是  |                                                      | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 否     | -                                                            | 181251   | 是的 | 将 Null 视作空字符串                                        | String                                                                                                                                                       |
| `LastEditorUserId`      | 是     | -1, 9999993                                                  | 1104694  | 是  | 0 是一个未被占用的值，可用于表示 Null                               | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 否     | *                                                            | 70952    | 是  | 将 Null 视为空字符串处理。已测试 LowCardinality，无明显收益。            | 字符串                                                                                                                                                          |
| `LastEditDate`          | 否     | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 否  | 如果不需要毫秒级精度，请使用 DateTime                              | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 否     | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 否  | 如果不需要毫秒级粒度，请使用 DateTime                              | DateTime                                                                                                                                                     |
| `Title`                 | 否     | -                                                            | *        | 否  | 将 Null 视作空字符串                                        | String                                                                                                                                                       |
| `标签`                    | 否     | -                                                            | *        | 否  | 将 NULL 视为空字符串                                        | 字符串                                                                                                                                                          |
| `AnswerCount`           | 是     | 0, 518                                                       | 216      | 否  | 将 Null 与 0 视为相同值                                     | UInt16                                                                                                                                                       |
| `CommentCount`          | 是     | 0, 135                                                       | 100      | 否  | 将 Null 与 0 视为相同                                      | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 是     | 0, 225                                                       | 6        | 是  | 将 Null 与 0 视为等同                                      | UInt8                                                                                                                                                        |
| `ContentLicense`        | 否     | -                                                            | 3        | 否  | LowCardinality 的性能优于 FixedString                     | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 否     | *                                                            | 20696028 | 是  | 将 Null 视为空字符串                                        | String                                                                                                                                                       |
| `CommunityOwnedDate`    | 否     | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 是  | 对于 Null 值建议使用默认值 1970-01-01。不需要毫秒级粒度，请使用 DateTime    | DateTime                                                                                                                                                     |
| `ClosedDate`            | 否     | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 是  | 对于 Null，考虑使用 1970-01-01 作为默认值。不需要毫秒级精度，请使用 DateTime。 | DateTime                                                                                                                                                     |

<br />

上述内容给出了如下模式：

```sql
CREATE TABLE posts_v2
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '已优化类型'
```

我们可以使用一条简单的 `INSERT INTO SELECT` 语句来向该表填充数据，从之前的表中读取数据并插入到这里：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

在我们的新模式中不会保留任何 null。上面的 insert 会将这些值隐式转换为各自类型的默认值——整数为 0，字符串为空字符串。ClickHouse 也会自动将所有数值转换为目标精度。
ClickHouse 中的主（排序）键
来自 OLTP 数据库的用户通常会在 ClickHouse 中寻找与之对应的等价概念。


## 选择排序键

在 ClickHouse 通常使用的规模下，内存和磁盘效率至关重要。数据以称为 part 的数据块形式写入 ClickHouse 表，并在后台根据规则对这些 part 进行合并。在 ClickHouse 中，每个 part 都有自己的主索引。当 part 被合并时，合并后 part 的主索引也会被合并。每个 part 的主索引对每一组行只包含一个索引条目——这种技术称为稀疏索引（sparse indexing）。

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse" />

在 ClickHouse 中，选择的键不仅决定索引，还决定数据在磁盘上的写入顺序。正因如此，它会显著影响压缩率，进而影响查询性能。能够让大多数组中的列值以连续顺序写入的排序键，将使所选压缩算法（和编解码器）能够更高效地压缩数据。

> 表中的所有列都会基于指定排序键的值进行排序，而不论这些列本身是否包含在排序键中。例如，如果使用 `CreationDate` 作为键，其他所有列中的值顺序都会对应 `CreationDate` 列中的值顺序。可以指定多个排序键——其排序语义与 `SELECT` 查询中的 `ORDER BY` 子句相同。

可以应用一些简单规则来帮助选择排序键。以下规则有时会互相冲突，因此请按顺序考虑。用户可以通过这一过程识别出若干候选键，通常 4–5 个就足够了：

* 选择与你常用过滤条件对齐的列。如果某列经常出现在 `WHERE` 子句中，应优先将其包含在排序键中，而不是那些使用频率较低的列。
  优先选择在过滤时能排除掉总行数中很大一部分的列，从而减少需要读取的数据量。
* 优先考虑可能与表中其他列高度关联的列。这将有助于确保这些值也被连续存储，从而提升压缩效果。
  对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作时，可以更高效地利用内存。

在确定用于排序键的列子集时，需要按特定顺序声明这些列。此顺序会显著影响查询中对排序键中后续列进行过滤的效率，以及表数据文件的压缩比。通常，最好按基数（cardinality）从低到高来排列键。这需要与以下事实进行权衡：对在排序键中位置靠后的列进行过滤，其效率会低于对位置靠前列的过滤。在这些行为之间取得平衡，并结合你的访问模式进行考虑（最重要的是要测试不同方案）。

### 示例

将上述指南应用于我们的 `posts` 表，假设用户希望执行按日期和帖子类型过滤的分析，例如：

“在过去 3 个月中，哪些问题的评论最多”。

使用之前那个已优化类型但尚未设置排序键的 `posts_v2` 表来回答这个问题的查询如下：

```sql
SELECT
    Id,
    Title,
    CommentCount
FROM posts_v2
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────────────────────┬─CommentCount─┐
│ 78203063 │ How to avoid default initialization of objects in std::vector?     │               74 │
│ 78183948 │ About memory barrier                                               │               52 │
│ 77900279 │ Speed Test for Buffer Alignment: IBM's PowerPC results vs. my CPU │        49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

返回 10 行。用时:0.070 秒。已处理 5982 万行,569.21 MB(852.55 百万行/秒,8.11 GB/秒)。
峰值内存用量:429.38 MiB。
```

> 即使对全部 6000 万行做了线性扫描，这里的查询依然非常快——ClickHouse 就是这么快 :) 在 TB 和 PB 级别的数据规模下，请相信我们：合理选择排序键是非常值得的！

让我们选择列 `PostTypeId` 和 `CreationDate` 作为排序键。


在我们的场景中，我们假定用户始终会按 `PostTypeId` 进行过滤。它的基数为 8，是作为排序键首个元素的合理选择。鉴于按日期粒度进行过滤通常已经足够（同时按日期时间过滤也会受益），因此我们将 `toDate(CreationDate)` 作为键的第二个组成部分。这样也会生成更小的索引，因为日期可以用 16 位来表示，从而加快过滤速度。我们键中的最后一个条目是 `CommentCount`，用于辅助找到评论数最多的帖子（最终排序）。

```sql
CREATE TABLE posts_v3
(
        `Id` Int32,
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime,
        `Score` Int32,
        `ViewCount` UInt32,
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime,
        `LastActivityDate` DateTime,
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16,
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime,
        `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
COMMENT '排序键'

--从现有表填充表

INSERT INTO posts_v3 SELECT * FROM posts_v2

返回 0 行。用时:158.074 秒。已处理 5982 万行,76.21 GB(每秒 37.842 万行,482.14 MB/s)。
峰值内存使用量:6.41 GiB。

之前的查询将查询响应时间提升了 3 倍以上:

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

返回 10 行。用时:0.020 秒。已处理 29.009 万行,21.03 MB(每秒 1465 万行,1.06 GB/s)。
```

对于希望通过使用特定数据类型和合理排序键来提升压缩效果的用户，请参阅 [Compression in ClickHouse](/data-compression/compression-in-clickhouse)。如果需要进一步提高压缩率，我们还推荐参考其中的 [Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 部分。


## 下一步：数据建模技术 {#next-data-modeling-techniques}

到目前为止，我们只迁移了一张表。虽然这已经让我们能够介绍一些核心的 ClickHouse 概念，但大多数 schema 往往没有这么简单。

在下面列出的其他指南中，我们将探索多种技术，以重构更大范围的 schema，从而实现针对 ClickHouse 的最佳查询性能。在整个过程中，我们的目标是让 `Posts` 始终作为核心表，大多数分析查询都通过它来完成。虽然其他表仍然可以被单独查询，但我们假定大多数分析都希望在 `Posts` 的上下文中进行。

> 在本节中，我们使用了其他表的优化版本。我们会提供这些表的 schema，但为了简洁起见，我们不会展开背后的决策过程。这些决策基于前文描述的规则，我们将推断这些决策的工作留给读者。

下面这些方法都旨在尽量减少对 JOIN 的使用，从而优化读取并提升查询性能。虽然 ClickHouse 完全支持 JOIN，但我们建议谨慎使用（在一个 JOIN 查询中包含 2 到 3 张表是可以的），以获得最佳性能。

> ClickHouse 不包含外键的概念。这并不禁止进行 JOIN，但意味着引用完整性需要由用户在应用层面进行管理。在像 ClickHouse 这样的 OLAP 系统中，数据完整性通常由应用层或数据摄取过程来管理，而不是由数据库自身强制执行，因为后者会带来显著开销。这种方式允许更高的灵活性和更快的数据插入。这与 ClickHouse 专注于在超大规模数据集上实现快速、可扩展的读写查询的目标是一致的。

为了在查询时尽量减少 JOIN 的使用，用户可以采用多种工具/方法：

- [**数据反规范化**](/data-modeling/denormalization) - 通过合并表并对非 1:1 关系使用复杂类型来实现数据反规范化。这通常涉及将原本在查询时进行的 JOIN 移到写入（insert）时完成。
- [**Dictionaries**](/dictionary) - ClickHouse 特有的功能，用于处理直接 JOIN 和键值查找。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - 一种 ClickHouse 功能，将计算成本从查询时转移到写入（insert）时，包括增量计算聚合值的能力。
- [**可刷新的物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中的物化视图，允许定期计算查询结果并对结果进行缓存。

我们会在各自的指南中分别探索这些方法，重点说明每种方法在何种情况下适用，并通过示例展示如何将其应用于解决 Stack Overflow 数据集中的问题。
