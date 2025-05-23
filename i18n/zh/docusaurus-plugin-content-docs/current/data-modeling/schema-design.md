---
'slug': '/data-modeling/schema-design'
'title': '架构设计'
'description': '优化 ClickHouse 架构以提高查询性能'
'keywords':
- 'schema'
- 'schema design'
- 'query optimization'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解有效的模式设计是优化 ClickHouse 性能的关键，包括常常涉及权衡的选择，最佳方法取决于所服务的查询以及数据更新频率、延迟要求和数据量等因素。 本指南提供了模式设计最佳实践和数据建模技术的概述，以优化 ClickHouse 性能。

## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南中的示例中，我们使用了 Stack Overflow 数据集的一个子集。该数据集包含了从 2008 到 2024 年 4 月，在 Stack Overflow 上发生的所有帖子、投票、用户、评论和徽章。这些数据以 Parquet 格式存储，使用以下模式在 S3 桶 `s3://datasets-documentation/stackoverflow/parquet/` 中提供：

> 指示的主键和关系并未通过约束强制执行（Parquet 是文件而非表格式），仅表示数据之间的关系和其独特的键。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow 数据集包含多个相关表。在任何数据建模任务中，我们建议用户首先关注加载其主表。这个表不一定是最大的表，而是您期望收到最多分析查询的那个表。这将使您熟悉主要的 ClickHouse 概念和类型，这尤其重要，如果您来自以 OLTP 为主的背景。随着更多表的添加，该表可能需要重新建模以充分利用 ClickHouse 的特性并获得最佳性能。

上述模式故意没有为本指南的目的而最优。

## 建立初始模式 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标，因此我们专注于为该表建立模式。该数据可以在公共 S3 桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中找到，每年一个文件。

> 从 S3 加载 Parquet 格式的数据是加载数据到 ClickHouse 最常见和首选的方式。ClickHouse 针对处理 Parquet 进行了优化，可能每秒从 S3 读取和插入数千万行。

ClickHouse 提供了一种模式推断能力，可以自动识别数据集的类型。这对于所有数据格式（包括 Parquet）均支持。我们可以利用此功能通过 s3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令识别数据的 ClickHouse 类型。请注意，我们在下面使用了通配符模式 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

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

> [s3 表函数](/sql-reference/table-functions/s3) 允许在 ClickHouse 中实时查询 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了一个初始的非优化模式。默认情况下，ClickHouse 将这些映射为等效的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令创建一个 ClickHouse 表。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

有几点重要事项：

我们的 `posts` 表在运行此命令后为空。没有数据被加载。
我们已指定 MergeTree 作为我们的表引擎。MergeTree 是您可能使用的最常见 ClickHouse 表引擎。这是 ClickHouse 工具箱中的多功能工具，能够处理 PB 的数据，服务于大多数分析用例。对于需要支持高效更新的用例，存在其他表引擎。

子句 `ORDER BY ()` 意味着我们没有索引，更具体地说就是数据没有顺序。稍后会详细讲述。现在，只需知道所有查询将需要线性扫描。

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

定义好我们的初始模式后，我们可以使用 `INSERT INTO SELECT` 填充数据，通过 s3 表函数读取数据。以下命令在一个 8 核 ClickHouse Cloud 实例上，大约 2 分钟内加载 `posts` 数据。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上述查询加载了 6000 万行。虽然对于 ClickHouse 而言数量不大，但网络连接较慢的用户可能希望加载部分数据。通过简单地通过通配符模式指定他们希望加载的年份，可以实现此功能，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。有关如何使用通配符模式来目标特定文件子集，请参见 [此处](/sql-reference/table-functions/file#globs-in-path)。

## 优化类型 {#optimizing-types}

ClickHouse 查询性能的秘密之一是压缩。

磁盘上的数据越少，I/O 就越少，因此查询和插入速度更快。任何压缩算法的 CPU 开销在大多数情况下都将被 I/O 的减少所抵消。因此，改善数据的压缩应该是确保 ClickHouse 查询快速的首要任务。

> 关于 ClickHouse 为何如此有效地压缩数据，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简而言之，作为一个列式数据库，值将按列顺序写入。 如果这些值是排过序的，相同的值将相邻。压缩算法利用数据的连续模式。除此之外，ClickHouse 具有编解码器和细粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩会受到 3 个主要因素的影响：排序键、数据类型以及使用的任何编解码器。所有这些都可以通过模式配置。

通过简单的类型优化过程可以获得最大初始压缩和查询性能的提升。可以应用一些简单的规则来优化模式：

- **使用严格类型** - 我们的初始模式中许多列使用字符串，但它们显然是数值型。使用正确的类型将确保在过滤和聚合时获得期望的语义。日期类型也是如此，已经在 Parquet 文件中正确提供。
- **避免 Nullable 列** - 默认情况下，上述列被假定为 Null。Nullable 类型允许查询确定空值与 Null 值之间的区别。这会创建一个额外的 UInt8 类型的列。每当用户处理可空列时，必须处理此额外的列。这会导致额外的存储空间使用，并几乎总是对查询性能产生负面影响。仅在类型的默认空值与 Null 值之间存在差异时才使用 Nullable。例如，`ViewCount` 列中的空值使用 0 表示对于大多数查询将是足够的且不会影响结果。如果需要将空值视为不同的值，通常可以使用过滤器从查询中排除空值。
- **使用最小精度的数值类型** - ClickHouse 拥有一系列针对不同数值范围和精度设计的数值类型。始终旨在最小化表示列所使用的位数。除了具有不同大小的整数（例如 Int16），ClickHouse 还提供无符号变体，其最小值为 0。这可能允许在列中使用更少的位数，例如，UInt16 的最大值为 65535，是 Int16 的两倍。如果可能，优先使用这些类型而不是较大的有符号变体。
- **最小精度的日期类型** - ClickHouse 支持多种日期和日期时间类型。可以使用 Date 和 Date32 来存储纯日期，后者支持更大的日期范围，但需要更多的位数。DateTime 和 DateTime64 支持日期时间。DateTime 限制为秒粒度，使用 32 位。DateTime64，如其名所示，使用 64 位，但支持高达纳秒粒度的时间。与往常一样，选择适合查询的颗粒度较粗的版本，尽量减少所需的位数。
- **使用 LowCardinality** - 具有较少唯一值的数字、字符串、日期或日期时间列可以使用 LowCardinality 类型进行编码。此字典编码值，减少磁盘上的大小。考虑将该列用于唯一值少于 10k 的列。
- **固定字符串用于特殊情况** - 长度固定的字符串可以使用 FixedString 类型进行编码，例如语言和货币代码。当数据的长度恰好为 N 字节时，这种方式是有效的。在所有其他情况下，这可能会降低效率，优先使用 LowCardinality。
- **使用枚举进行数据验证** - 枚举类型可以用于有效地编码枚举类型。枚举可以是 8 位或 16 位，具体取决于它们需要存储的唯一值的数量。如果您需要在插入时进行相关验证（未声明的值将被拒绝）或希望执行利用枚举值自然顺序的查询，请考虑使用此选项，例如想象一下一个反馈列包含用户响应 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`。

> 提示：要查找所有列的范围和独特值的数量，用户可以使用简单的查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在较小的数据子集上进行此操作，因为这可能会非常耗费资源。该查询要求数字至少被定义为数字，以获得准确的结果，即不能是字符串。

通过将这些简单规则应用于我们的 `posts` 表，我们可以为每一列确定最佳类型：

| 列名                     | 是否为数值 | 最小值，最大值                                                       | 唯一值 | Nulls | 注释                                                                                       | 优化类型                           |
|-------------------------|------------|------------------------------------------------------------------------|---------|-------|-------------------------------------------------------------------------------------------|-------------------------------------|
| `PostTypeId`              | 是         | 1, 8                                                                    | 8       | 否    |                                                                                           | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`       | 是         | 0, 78285170                                                           | 12282094 | 是    | 用 0 值区分 Null                                                                          | UInt32                             |
| `CreationDate`            | 否         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000          | -       | 否    | 毫秒粒度不需要，使用 DateTime                                                            | DateTime                           |
| `Score`                   | 是         | -217, 34970                                                           | 3236    | 否    |                                                                                           | Int32                              |
| `ViewCount`               | 是         | 2, 13962748                                                           | 170867  | 否    |                                                                                           | UInt32                             |
| `Body`                    | 否         | -                                                                     | -       | 否    |                                                                                           | String                             |
| `OwnerUserId`             | 是         | -1, 4056915                                                           | 6256237 | 是    |                                                                                           | Int32                              |
| `OwnerDisplayName`        | 否         | -                                                                     | 181251  | 是    | 将 Null 看作空字符串                                                                      | String                             |
| `LastEditorUserId`        | 是         | -1, 9999993                                                           | 1104694 | 是    | 0 是未使用的值可用作 Null                                                                | Int32                              |
| `LastEditorDisplayName`   | 否         | -                                                                     | 70952   | 是    | 将 Null 看作空字符串。测试了 LowCardinality，但没有收益                                   | String                             |
| `LastEditDate`            | 否         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000          | -       | 否    | 毫秒粒度不需要，使用 DateTime                                                            | DateTime                           |
| `LastActivityDate`        | 否         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000          | -       | 否    | 毫秒粒度不需要，使用 DateTime                                                            | DateTime                           |
| `Title`                   | 否         | -                                                                     | -       | 否    | 将 Null 看作空字符串                                                                      | String                             |
| `Tags`                    | 否         | -                                                                     | -       | 否    | 将 Null 看作空字符串                                                                      | String                             |
| `AnswerCount`             | 是         | 0, 518                                                                | 216     | 否    | 将 Null 和 0 视为相同                                                                    | UInt16                             |
| `CommentCount`            | 是         | 0, 135                                                                | 100     | 否    | 将 Null 和 0 视为相同                                                                    | UInt8                              |
| `FavoriteCount`           | 是         | 0, 225                                                                | 6       | 是    | 将 Null 和 0 视为相同                                                                    | UInt8                              |
| `ContentLicense`          | 否         | -                                                                     | 3       | 否    | LowCardinality 超过了 FixedString                                                         | LowCardinality(String)             |
| `ParentId`                | 否         | -                                                                     | 20696028 | 是    | 将 Null 看作空字符串                                                                      | String                             |
| `CommunityOwnedDate`      | 否         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000          | -       | 是    | 将默认值 1970-01-01 用于 Null。毫秒粒度不需要，使用 DateTime                            | DateTime                           |
| `ClosedDate`              | 否         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                    | -       | 是    | 将默认值 1970-01-01 用于 Null。毫秒粒度不需要，使用 DateTime                            | DateTime                           |

<br />

上述内容为我们提供了以下模式：

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

我们可以通过简单的 `INSERT INTO SELECT` 将数据从之前的表读取并插入到这个表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

在我们的新模式中，我们不保留任何空值。上述插入将这些隐式转换为其各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数值转换为其目标精度。
ClickHouse 中的主键（排序键）
来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。

## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模下，内存和磁盘效率至关重要。数据以称为分片的块写入 ClickHouse 表中，并应用规则来在后台合并这些分片。在 ClickHouse 中，每个分片都有自己的主索引。当分片合并时，合并后的分片的主索引也会合并。分片的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

在 ClickHouse 中选择的键将不仅决定索引，还决定数据写入磁盘的顺序。因此，它可能会显著影响压缩水平，而这又会影响查询性能。导致大多数列的值以连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将根据指定的排序键的值排序，无论它们是否包含在键中。例如，如果将 `CreationDate` 用作键，则其他列中的所有值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键 - 这将以相同的语义对数据进行排序，就像 `SELECT` 查询中的 `ORDER BY` 子句一样。

可以应用一些简单规则来帮助选择排序键。以下规则有时可能会冲突，所以请依次考虑。用户可以从这个过程识别出多个键，通常 4-5 个就足够了：

- 选择与您的常见过滤条件对齐的列。如果某列在 `WHERE` 子句中使用频繁，将其优先包括在键中，而不是那些使用较少的列。
- 优先选择可以在过滤时帮助排除大量总行的列，从而减少需要读取的数据量。
- 优先选择可能与表中的其他列高度相关的列。这将有助于确保这些值也存储在连续的位置，从而改善压缩效果。
- 在排序键中的列进行 `GROUP BY` 和 `ORDER BY` 操作可以更有效地使用内存。

在确定排序键的列子集时，请按照特定顺序声明列。这一顺序可以显著影响查询中对二级键列过滤的效率，以及表的数据文件的压缩比。一般来说，最好按基数的升序对键进行排序。这应该与排序键中较后列的过滤效率较低这一事实保持平衡。平衡这些行为，并考虑您的访问模式（最重要的是测试不同的变体）。

### 示例 {#example}

将上述指南应用于我们的 `posts` 表，假设我们的用户希望执行按日期和帖子类型过滤的分析，例如：

“最近 3 个月哪个问题的评论最多”。

使用我们之前的 `posts_v2` 表（类型已优化但没有排序键）的问题查询：

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

> 即便扫描了所有 6000 万行，此查询也非常快速 - ClickHouse 就是快 :) 您必须相信我们，排序键在 TB 和 PB 规模上是值得的！

让我们选择 `PostTypeId` 和 `CreationDate` 作为我们的排序键。

也许在我们的案例中，我们期望用户始终按 `PostTypeId` 进行过滤。该值的基数为 8，并且代表了我们排序键的第一个条目的逻辑选择。鉴于日期粒度过滤可能是足够的（它仍然会使 DateTime 过滤受益），因此我们使用 `toDate(CreationDate)` 作为我们键的第二个组成部分。这也将生成更小的索引，因为日期可以使用 16 位表示，从而加速过滤。我们的最终键条目是 `CommentCount`，以协助查找评论最多的帖子（最终排序）。

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

对于对通过使用特定类型和适当排序键实现的压缩改进感兴趣的用户，请参见 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)。如果用户需要进一步提高压缩，我们还推荐查看 [选择正确的列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

## 接下来: 数据建模技术 {#next-data-modeling-techniques}

到目前为止，我们仅迁移了单个表。虽然这使我们能够介绍一些核心 ClickHouse 概念，但大多数模式不幸并非如此简单。

在下面列出的其他指南中，我们将探索多种技术，以重构我们更广泛的模式，以便进行最佳 ClickHouse 查询。在此过程中，我们旨在保持 `Posts` 作为我们大多数分析查询的中心表。尽管其他表仍可以独立查询，但我们假设大多数分析希望在 `posts` 的上下文中进行。

> 在本节中，我们使用优化版本的其他表。虽然我们提供了这些表的模式，但为简洁起见，我们省略了所做的决策。这些基于前面描述的规则，我们留给读者推断这些决策。

以下方法都旨在最小化使用 JOIN 的需要，以优化读取和提高查询性能。虽然 ClickHouse 完全支持 JOIN，但我们建议在 JOIN 查询中尽量少用（2 到 3 个表的 JOIN 查询是可以的），以实现最佳性能。

> ClickHouse 没有外键的概念。这并不禁止 JOIN，但意味着参考完整性由用户在应用程序级别进行管理。在 ClickHouse 这样的 OLAP 系统中，数据完整性通常在应用程序级别或数据摄取过程中管理，而不是通过数据库自身强制执行，因为这样会产生显著的开销。这种方法允许更大的灵活性和更快的数据插入。这与 ClickHouse 对速度和大数据集的读取和插入查询的可扩展性重点一致。

为了最小化在查询时使用 JOIN，用户有几种工具/方法：

- [**数据去规范化**](/data-modeling/denormalization) - 通过合并表并使用复杂类型处理非 1:1 关系来去规范化数据。这通常涉及将任何 JOIN 从查询时间移到插入时间。
- [**字典**](/dictionary) - ClickHouse 特有的功能，用于处理直接的 JOIN 和键值查找。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - ClickHouse 的一种功能，将计算的成本从查询时间转移到插入时间，允许逐步计算聚合值。
- [**可刷新的物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中使用的物化视图，此功能允许周期性计算查询的结果并缓存结果。

我们将在每个指南中探讨这些方法，突出何时适用，并提供示例说明如何将其应用于解决 Stack Overflow 数据集的问题。
