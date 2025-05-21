---
'slug': '/data-modeling/schema-design'
'title': '模式设计'
'description': '优化查询性能的ClickHouse模式'
'keywords':
- 'schema'
- 'schema design'
- 'query optimization'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解有效的架构设计是优化 ClickHouse 性能的关键，包括常常涉及权衡的选择，最佳方法取决于需要服务的查询以及数据更新频率、延迟要求和数据量等因素。本指南提供了架构设计最佳实践和数据建模技术的概述，以优化 ClickHouse 性能。

## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中，我们使用 Stack Overflow 数据集的一个子集。该数据集包含自 2008 年到 2024 年 4 月期间在 Stack Overflow 上发生的每个帖子、投票、用户、评论和徽章。这些数据以 Parquet 形式在 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/` 下提供，使用以下架构：

> 所示的主键和关系并未通过约束强制执行（Parquet 是文件格式而非表格式），仅表示数据之间的关系及其唯一键。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow 数据集包含多个相关表。在任何数据建模任务中，我们建议用户首先关注加载其主表。这不仅仅是指最大表，而是指您预计会收到大多数分析查询的表。这样可以让您熟悉主要的 ClickHouse 概念和类型，特别是在主要使用 OLTP 的背景下。这张表在添加其他表时可能需要重建，以充分利用 ClickHouse 的特性并获得最佳性能。

上述架构故意未针对本指南的目的进行了优化。

## 建立初始架构 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标，我们专注于为该表建立架构。该数据在公共 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中可获取，按年份分文件。

> 从 S3 中以 Parquet 格式加载数据是加载数据到 ClickHouse 的最常见和首选方式。ClickHouse 针对 Parquet 的处理进行了优化，每秒可以从 S3 读取和插入数千万行数据。

ClickHouse 提供了架构推断功能，以自动识别数据集的类型。这支持所有数据格式，包括 Parquet。我们可以通过 s3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令利用此功能识别数据的 ClickHouse 类型。下面注意我们使用通配符模式 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

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

> [s3 表函数](/sql-reference/table-functions/s3) 允许在 ClickHouse 中就地查询 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了一个初步的未优化架构。默认情况下，ClickHouse 将这些映射为相应的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令创建一个 ClickHouse 表，使用这些类型。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

一些重要要点：

在运行此命令后，我们的帖子表是空的。未加载任何数据。
我们已将 MergeTree 指定为我们的表引擎。MergeTree 是您可能使用的最常见 ClickHouse 表引擎。它是 ClickHouse 中的多功能工具，能够处理 PB 的数据，并用于大多数分析用例。其他表引擎适用于需要支持高效更新的用例，如 CDC。

`ORDER BY ()` 子句意味着我们没有索引，更具体地说，我们的数据没有顺序。有关此的更多信息，稍后再说。现在，请知道所有查询都将需要线性扫描。

要确认表已创建：

```sql
SHOW CREATE TABLE posts

CREATE TABLE posts
(
        `Id` Nullable(Int64),
        `PostTypeId` Nullable(Int64),
        `AcceptedAnswerId` Nullable(Int64),
        `CreationDate` Nullable(DateTime64(3, 'UTC')),
        `Score` Nullable(Int64),
        `ViewCount` Nullable(Int64),
        `Body` Nullable(String),
        `OwnerUserId` Nullable(Int64),
        `OwnerDisplayName` Nullable(String),
        `LastEditorUserId` Nullable(Int64),
        `LastEditorDisplayName` Nullable(String),
        `LastEditDate` Nullable(DateTime64(3, 'UTC')),
        `LastActivityDate` Nullable(DateTime64(3, 'UTC')),
        `Title` Nullable(String),
        `Tags` Nullable(String),
        `AnswerCount` Nullable(Int64),
        `CommentCount` Nullable(Int64),
        `FavoriteCount` Nullable(Int64),
        `ContentLicense` Nullable(String),
        `ParentId` Nullable(String),
        `CommunityOwnedDate` Nullable(DateTime64(3, 'UTC')),
        `ClosedDate` Nullable(DateTime64(3, 'UTC'))
)
ENGINE = MergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY tuple()
```

定义了初始架构后，我们可以使用 `INSERT INTO SELECT` 根据之前的表从 S3 中读取数据并填充数据。以下代码在 8 核心 ClickHouse Cloud 实例上大约需要 2 分钟加载 `posts` 数据。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上述查询加载了 6000 万行。虽然这对 ClickHouse 来说很小，但连接速度较慢的用户可能希望加载子集数据。可以通过简单指定他们希望加载的年份的通配符模式来实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。请参阅 [这里](/sql-reference/table-functions/file#globs-in-path) 了解如何使用通配符模式以目标文件的子集。

## 优化类型 {#optimizing-types}

ClickHouse 查询性能的一个秘密是压缩。

磁盘上的数据更少意味着更少的 I/O，从而加快查询和插入速度。任何压缩算法的 CPU 开销在大多数情况下都将被 I/O 的减少所抵消。因此，改善数据的压缩性应该是确保 ClickHouse 查询快速的首要任务。

> 关于 ClickHouse 为什么能够如此有效地压缩数据，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一种列式数据库，值将按列顺序写入。如果这些值是有序的，相同的值将彼此相邻。压缩算法利用连续的数据模式。在此基础上，ClickHouse 有编解码器和细粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩将受到三个主要因素的影响：排序键、数据类型以及使用的任何编解码器。所有这些都通过架构进行配置。

通过简单的类型优化过程，可以获得压缩和查询性能的最大初步提高。可以应用一些简单的规则来优化架构：

- **使用严格类型** - 我们的初始架构使用了许多显然是数值的列的字符串。正确使用类型将确保在过滤和聚合时期望的语义。日期类型也是如此，在 Parquet 文件中已正确提供。
- **避免 Nullable 列** - 默认情况下，上述列被假设为 Null。Nullable 类型允许查询确定空值与 Null 值之间的差异。这创建了一个 UInt8 类型的单独列。每当用户处理 Nullable 列时，都必须对这个附加列进行处理。这导致额外的存储空间使用，并且几乎总是会对查询性能产生负面影响。仅在一个类型的默认空值与 Null 之间存在差异时才使用 Nullable。例如，`ViewCount` 列中的空值的值 0 对大多数查询来说可能足够而不会影响结果。如果应将空值视为不同，它们通常也可以通过过滤从查询中排除。
- **数字类型应使用最小精度** - ClickHouse 具有设计用于不同数值范围和精度的多种数值类型。始终尽量减少表示列所需的位数。除了不同大小的整数类型（例如 Int16）外，ClickHouse 还提供其最小值为 0 的无符号变体。这些可以允许更少的位用于列，例如 UInt16 的最大值为 65535， 是 Int16 的两倍。如果可能，优先选择这些类型而不是更大的有符号变体。
- **日期类型应使用最小精度** - ClickHouse 支持多种日期和日期时间类型。可以使用 Date 和 Date32 存储纯日期，后者支持更大的日期范围，但需要更多位。DateTime 和 DateTime64 支持日期时间。DateTime 限制为秒级精度，使用 32 位。DateTime64，顾名思义，使用 64 位，但支持高达纳秒级的精度。和往常一样，选择适合查询的较粗版本，以减少所需的位数。
- **使用 LowCardinality** - 唯一值较少的数字、字符串、日期或日期时间列可以使用 LowCardinality 类型进行编码。这个字典编码值，减少磁盘占用。对唯一值少于 1 万的列考虑使用此类型。
- 对于特殊情况使用 FixedString - 长度固定的字符串可以用 FixedString 类型编码，例如语言和货币代码。当数据长为精确的 N 字节时，这是高效的。在所有其他情况下，可能会降低效率，且首选 LowCardinality。
- **使用 Enums 进行数据验证** - Enum 类型可以用于高效编码枚举类型。Enums 可以是 8 位或 16 位，具体取决于它们需要存储的唯一值数量。如果您需要在插入时进行相关验证（未声明的值将被拒绝）或希望执行利用 Enum 值的自然顺序的查询，例如，想象一个反馈列包含用户响应 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`。

> 提示：要查找所有列的范围和唯一值的数量，用户可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` 。我们建议对较小的数据子集执行此操作，因为这可能很昂贵。此查询要求数值至少被定义为数值，即不能是字符串。

通过将这些简单规则应用于我们的帖子表，我们可以识别每列的最佳类型：

| 列                    | 是否数值 | 最小、最大                                                             | 唯一值数 | Nulls | 注释                                                             | 优化类型                                          |
|-----------------------|-----------|-------------------------------------------------------------------------|-----------|--------|----------------------------------------------------------------|---------------------------------------------------|
| `PostTypeId`          | 是        | 1, 8                                                                    | 8         | 否     |                                                                | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`    | 是        | 0, 78285170                                                             | 12282094  | 是     | 用 0 值区分 Null                                                  | UInt32                                            |
| `CreationDate`        | 否        | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -         | 否     | 不需要毫秒级精度，使用 DateTime                                  | DateTime                                          |
| `Score`               | 是        | -217, 34970                                                             | 3236      | 否     |                                                                | Int32                                             |
| `ViewCount`           | 是        | 2, 13962748                                                             | 170867    | 否     |                                                                | UInt32                                            |
| `Body`                | 否        | -                                                                       | -         | 否     |                                                                | String                                            |
| `OwnerUserId`        | 是        | -1, 4056915                                                             | 6256237   | 是     |                                                                | Int32                                             |
| `OwnerDisplayName`    | 否        | -                                                                       | 181251    | 是     | 考虑将 Null 视为空字符串                                         | String                                            |
| `LastEditorUserId`    | 是        | -1, 9999993                                                             | 1104694   | 是     | 0 是未使用的值可用于 Null                                        | Int32                                             |
| `LastEditorDisplayName` | 否        | -                                                                       | 70952     | 是     | 考虑将 Null 视为空字符串。测试 LowCardinality 无效益           | String                                            |
| `LastEditDate`       | 否        | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -         | 否     | 不需要毫秒级精度，使用 DateTime                                  | DateTime                                          |
| `LastActivityDate`   | 否        | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -         | 否     | 不需要毫秒级精度，使用 DateTime                                  | DateTime                                          |
| `Title`               | 否        | -                                                                       | -         | 否     | 考虑将 Null 视为空字符串                                        | String                                            |
| `Tags`                | 否        | -                                                                       | -         | 否     | 考虑将 Null 视为空字符串                                        | String                                            |
| `AnswerCount`         | 是        | 0, 518                                                                  | 216       | 否     | 考虑将 Null 和 0 视为相同                                      | UInt16                                            |
| `CommentCount`        | 是        | 0, 135                                                                  | 100       | 否     | 考虑将 Null 和 0 视为相同                                      | UInt8                                             |
| `FavoriteCount`       | 是        | 0, 225                                                                  | 6         | 是     | 考虑将 Null 和 0 视为相同                                      | UInt8                                             |
| `ContentLicense`      | 否        | -                                                                       | 3         | 否     | LowCardinality 比 FixedString 更优                               | LowCardinality(String)                             |
| `ParentId`           | 否        | -                                                                       | 20696028  | 是     | 考虑将 Null 视为空字符串                                        | String                                            |
| `CommunityOwnedDate`  | 否        | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -         | 是     | 考虑默认 1970-01-01 对于 Null。毫秒级精度不需要，使用 DateTime   | DateTime                                          |
| `ClosedDate`         | 否        | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -         | 是     | 考虑默认 1970-01-01 对于 Null。毫秒级精度不需要，使用 DateTime   | DateTime                                          |

<br />

以上给我们提供了以下架构：

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
COMMENT 'Optimized types'
```

我们可以用简单的 `INSERT INTO SELECT` 从之前的表中读取数据并插入到这个表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

我们在新架构中不保留任何 null 值。上述插入隐式将这些转换为各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数值转换为其目标精度。
ClickHouse 中的主（排序）键
来自 OLTP 数据库的用户常常寻找 ClickHouse 中的等效概念。

## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模下，内存和磁盘效率至关重要。数据以被称为分片（parts）的块写入 ClickHouse 表，并在后台应用合并这些分片的规则。在 ClickHouse 中，每个分片都有自己的主索引。当分片合并时，合并后分片的主索引也会合并。分片的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

在 ClickHouse 中选择的键不仅会决定索引，还会决定数据在磁盘上的写入顺序。因此，这可以显著影响压缩等级，这反过来又会影响查询性能。一个导致大多数列的值连续写入的排序键将允许选定的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则所有其他列的值的顺序将对应于 `CreationDate` 列中的值的顺序。可以指定多个排序键 - 这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

可以应用一些简单的规则来帮助选择排序键。以下情况有时会相互矛盾，因此会依次考虑这些情况。用户可以通过此过程识别出多个键，通常 4-5 个就足够了：

- 选择与常见过滤条件一致的列。如果某列在 `WHERE` 子句中使用频繁，优先在您的键中包含这些列，而不是使用较少的列。
- 优先选择有助于在过滤时排除大量总行的列，从而减少需要读取的数据量。
- 优先考虑与表中其他列高度相关的列。这将确保这些值也被连续地存储，从而改善压缩。
- 为排序键中列的 `GROUP BY` 和 `ORDER BY` 操作可以提高内存效率。

在识别排序键的列子集时，以特定顺序声明列。这个顺序对查询中过滤次级键列的效率以及表数据文件的压缩比会有显著影响。一般来说，最好按基数的升序排列键。这应该与这样一个事实相平衡：在排序键后面出现的列的过滤效率将低于在元组中较早出现的列。平衡这些行为并考虑您的访问模式（最重要的是测试变体）。

### 示例 {#example}

将上述指南应用于我们的 `posts` 表，假设我们的用户希望执行按日期和帖子类型过滤的分析，例如：

“在过去的三个月中，哪些问题的评论最多”。

使用我们以前的 `posts_v2` 表进行此问题查询，类型已优化但没有排序键：

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

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
Peak memory usage: 429.38 MiB.
```

> 这里的查询非常迅速，即使所有 6000 万行都进行了线性扫描 - ClickHouse 速度确实很快 :) 您必须相信，我们在 TB 和 PB 规模下排序键是值得的！

选择 `PostTypeId` 和 `CreationDate` 作为我们的排序键。

或许在我们的情况下，我们预计用户总是会按 `PostTypeId` 进行过滤。这有 8 的基数，并代表我们的排序键的第一个条目的合逻辑选择。认识到日期粒度过滤可能足够（它仍然会受益于日期时间过滤），所以我们使用 `toDate(CreationDate)` 作为排序键的第二个组成部分。这也将生成一个较小的索引，因为日期可以通过 16 表示，从而加快过滤速度。我们的最终键条目是 `CommentCount` 以协助查找评论最多的帖子（最终排序）。

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
COMMENT 'Ordering Key'

--populate table from existing table

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.


Our previous query improves the query response time by over 3x:

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

10 rows in set. Elapsed: 0.020 sec. Processed 290.09 thousand rows, 21.03 MB (14.65 million rows/s., 1.06 GB/s.)
```

对于对使用特定类型和适当排序键获得的压缩改善感兴趣的用户，请参见 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)。如果用户需要进一步改善压缩，我们还推荐查看 [选择正确的列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

## 下一步：数据建模技术 {#next-data-modeling-techniques}

到现在为止，我们仅迁移了一个表。尽管这使我们能够介绍一些核心 ClickHouse 概念，但大多数架构不幸并不是如此简单。

在下面列出的其他指南中，我们将探讨一些技术，以重构更广泛的架构以优化 ClickHouse 查询。在这个过程中，我们希望 `Posts` 能够成为我们进行大多数分析查询的中心表。虽然仍可以独立查询其他表，但我们假设大多数分析希望在 `posts` 的背景下进行。

> 在本部分，我们使用其他表的优化版本。虽然我们提供了这些表的架构，但为了简洁起见，我们省略了所做的决策。这些是基于之前描述的规则，我们将推断决策留给读者。

以下方法都旨在最小化使用 JOIN 来优化读取并提高查询性能。虽然 ClickHouse 完全支持 JOIN，但我们建议它们少用（JOIN 查询中的 2-3 个表是可以的），以实现最佳性能。

> ClickHouse 并不考虑外键的概念。这并不妨碍联接，但意味着参照完整性由用户在应用程序级别管理。在 ClickHouse 等 OLAP 系统中，数据完整性通常是在应用程序级别或在数据摄取过程中管理的，而不是由数据库本身强制执行，这会产生显著的开销。这种方法允许更大的灵活性和更快的数据插入。这与 ClickHouse 对于非常大数据集的读取和插入查询的速度和可扩展性的关注一致。

为了在查询时最小化 JOIN 的使用，用户可以使用几种工具/方法：

- [**反规范化数据**](/data-modeling/denormalization) - 通过合并表并使用复杂类型来反规范化数据，以处理非 1:1 关系。这通常涉及将任何 JOIN 从查询时间移至插入时间。
- [**字典**](/dictionary) - ClickHouse 特有的处理直接连接和键值查找的功能。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - ClickHouse 的一个特性，将计算成本从查询时间转移到插入时间，包括增量计算聚合值的能力。
- [**可刷新物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中使用的物化视图，这允许定期计算查询结果并缓存结果。

我们在每个指南中探讨每种方法，强调每种方法在何时适用，并给出示例显示如何将其应用于解决 Stack Overflow 数据集的问题。
