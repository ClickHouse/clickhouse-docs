---
'slug': '/data-modeling/schema-design'
'title': '模式设计'
'description': '优化 ClickHouse 模式以提高查询性能'
'keywords':
- 'schema'
- 'schema design'
- 'query optimization'
'doc_type': 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解有效的模式设计是优化 ClickHouse 性能的关键，这涉及到的选择通常会牵涉到权衡，最优的方法取决于所服务的查询以及数据更新频率、延迟要求和数据量等因素。本指南提供了模式设计最佳实践和数据建模技术的概述，以优化 ClickHouse 性能。

## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中，我们使用 Stack Overflow 数据集的一个子集。此数据集包含了自 2008 年至 2024 年 4 月在 Stack Overflow 上发生的每一条帖子、投票、用户、评论和徽章。此数据以 Parquet 格式提供，存储在 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/` 下，使用以下模式：

> 所示的主键和关系并未通过约束来强制执行（Parquet 是文件而非表格式），仅表示数据之间的关系及其具有的唯一键。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow 数据集包含一些相关的表。在任何数据建模任务中，我们建议用户首先关注加载他们的主表。此表不一定是最大的表，而是您期望接收大多数分析查询的表。这将使您熟悉主要的 ClickHouse 概念和类型，尤其是在来自主要 OLTP 背景的情况下。这张表可能需要重建，以便在添加其他表时充分利用 ClickHouse 特性，实现最佳性能。

上述模式故意不符合最佳模式，以便于本指南的目的。

## 建立初始模式 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标，我们重点建立该表的模式。此数据可在公共 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中获取，每年一个文件。

> 从 S3 加载 Parquet 格式的数据是将数据加载到 ClickHouse 的最常见和首选方式。ClickHouse 针对处理 Parquet 进行了优化，理论上每秒可以从 S3 读取和插入数千万行。

ClickHouse 提供了模式推断能力，可以自动识别数据集的类型。这对所有数据格式（包括 Parquet）都受到支持。我们可以利用此功能，通过 s3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令识别数据的 ClickHouse 类型。请注意，我们使用 glob 模式 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

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

> [s3 表函数](/sql-reference/table-functions/s3) 允许从 ClickHouse 直接查询 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了一个初步的、未优化的模式。默认情况下，ClickHouse 将这些映射为等效的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令来创建一个 ClickHouse 表。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

几个重要的要点：

我们的 posts 表在运行此命令后是空的。没有数据被加载。
我们指定了 MergeTree 作为我们的表引擎。MergeTree 是您可能使用的最常见的 ClickHouse 表引擎。它是 ClickHouse 盒子中的多功能工具，能够处理 PB 的数据，并服务于大多数分析用例。其他表引擎存在于例如需要支持高效更新的 CDC 用例中。

子句 `ORDER BY ()` 表示我们没有索引，更具体地说，我们的数据没有顺序。稍后会详细介绍。在此之前，请了解所有查询都将需要线性扫描。

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

定义了初始模式后，我们可以使用 `INSERT INTO SELECT` 来填充数据，通过 s3 表函数读取数据。以下代码在 8 核的 ClickHouse Cloud 实例上大约花费 2 分钟加载了 `posts` 数据。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上述查询加载了 6000 万行。尽管对于 ClickHouse 来说数量较小，但较慢的互联网连接用户可能希望加载数据的子集。这可以通过简单指定他们希望加载的年份的 glob 模式来实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。请参见 [这里](/sql-reference/table-functions/file#globs-in-path) 了解如何使用 glob 模式来定位文件子集。

## 优化类型 {#optimizing-types}

ClickHouse 查询性能的秘密之一是压缩。

磁盘上的数据减少意味着更少的 I/O，从而实现更快的查询和插入。任何压缩算法的 CPU 开销在大多数情况下将被 I/O 的减少所抵消。因此，改善数据的压缩应当是确保 ClickHouse 查询快速的首要关注点。

> 关于 ClickHouse 为何能如此高效地压缩数据，我们建议查看 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一个列式数据库，值将按列顺序写入。如果这些值是已排序的，相同的值将相邻存放。压缩算法利用连续的数据模式。除此之外，ClickHouse 还具有编解码器和细粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩将受到 3 个主要因素的影响：排序键、数据类型和所使用的任何编解码器。所有这些都通过模式进行配置。

通过简单的类型优化过程可以获得压缩和查询性能的最大初步改善。可以应用一些简单的规则来优化模式：

- **使用严格类型** - 我们的初始模式使用了许多明显是数字类型的列使用了 Strings。使用正确的类型将确保在过滤和聚合时获得预期的语义。日期类型也是如此，在 Parquet 文件中已正确提供。
- **避免 Nullable 列** - 默认情况下，上述列被假定为 Null。Nullable 类型允许查询区分空值和 Null 值。这会创建一个额外的 UInt8 类型列。每当用户处理 Nullable 列时，就必须处理这个附加的列。这会导致额外的存储空间使用，并几乎总会对查询性能产生负面影响。仅在类型的默认空值与 Null 之间存在差异时使用 Nullable。例如，`ViewCount` 列的空值使用 0 可能已足够，并不会影响结果。如果空值应被视为不同，则通常也可以通过过滤器从查询中排除。
- **数字类型使用最小精度** - ClickHouse 提供了一些针对不同数字范围和精度设计的数字类型。始终旨在最小化表示列所需的位数。除了不同大小的整数（例如、Int16），ClickHouse 还提供无符号变体，其最小值为 0。这些可允许在列中使用更少的位，例如，UInt16 的最大值为 65535，是 Int16 的两倍。如果可能，请优先使用这些类型而不是较大的有符号变体。
- **日期类型使用最小精度** - ClickHouse 支持多种日期和日期时间类型。Date 和 Date32 可用于存储纯日期，后者支持更大的日期范围但使用更多位。DateTime 和 DateTime64 提供了对于日期和时间的支持。DateTime 的粒度限制在秒，并使用 32 位。正如其名，DateTime64 使用 64 位，但支持高达纳秒的粒度。如以往选择查询中可接受的更粗版本，最小化所需的位数。
- **使用 LowCardinality** - 具有较少唯一值的数字、字符串、日期或日期时间列可以使用 LowCardinality 类型编码。此字典编码值，减少磁盘上的大小。考虑对此类列应用此技术，尤其是其唯一值少于 10k 的列。
- **特殊情况下使用 FixedString** - 长度固定的字符串可以使用 FixedString 类型进行编码，例如语言和货币代码。这在数据长度正好为 N 字节时是高效的。在所有其他情况下，可能会降低效率，而 LowCardinality 是优选。
- **使用 Enums 进行数据验证** - Enum 类型可用于高效编码枚举类型。Enums 可以是 8 位或 16 位，具体取决于其要求存储的唯一值数量。如果您需要在插入时进行关联验证（未声明的值将被拒绝）或者希望执行利用 Enum 值的自然顺序的查询，例如想象一个包含用户响应的反馈列 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`，请考虑使用此类型。

> 提示：要查找所有列的范围和唯一值数量，用户可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在数据的较小子集上执行此操作，因为这可能是昂贵的。此查询要求数字至少定义为如此，以获得准确结果，即不得为字符串。

通过将这些简单规则应用于我们的 posts 表，我们可以为每一列识别出最佳类型：

| 列                    | 是数字 | 最小值, 最大值                                                         | 唯一值     | Nulls | 评论                                                                                       | 优化类型                                                          |
|---------------------|--------|-----------------------------------------------------------------------|-----------|-------|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `PostTypeId`          | 是     | 1, 8                                                                  | 8         | 否    |                                                                                            | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)`  |
| `AcceptedAnswerId`    | 是     | 0, 78285170                                                          | 12282094  | 是    | 利用 0 值区分 Null                                                                     | UInt32                                                          |
| `CreationDate`        | 否     | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -         | 否    | 毫秒粒度不是必需的，使用 DateTime                                                      | DateTime                                                       |
| `Score`                | 是     | -217, 34970                                                          | 3236      | 否    |                                                                                            | Int32                                                          |
| `ViewCount`            | 是     | 2, 13962748                                                          | 170867    | 否    |                                                                                            | UInt32                                                          |
| `Body`                 | 否     | -                                                                    | -         | 否    |                                                                                            | String                                                         |
| `OwnerUserId`         | 是     | -1, 4056915                                                          | 6256237   | 是    |                                                                                            | Int32                                                          |
| `OwnerDisplayName`    | 否     | -                                                                    | 181251    | 是    | 考虑 Null 为空字符串                                                                  | String                                                         |
| `LastEditorUserId`    | 是     | -1, 9999993                                                          | 1104694   | 是    | 0 是一个未使用的值可以用于 Null                                                    | Int32                                                          |
| `LastEditorDisplayName`| 否     | -                                                                    | 70952     | 是    | 考虑 Null 为空字符串。测试 LowCardinality 并无益                                            | String                                                         |
| `LastEditDate`        | 否     | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -         | 否    | 毫秒粒度不是必需的，使用 DateTime                                                      | DateTime                                                       |
| `LastActivityDate`    | 否     | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -         | 否    | 毫秒粒度不是必需的，使用 DateTime                                                      | DateTime                                                       |
| `Title`                | 否     | -                                                                    | -         | 否    | 考虑 Null 为空字符串                                                                    | String                                                         |
| `Tags`                 | 否     | -                                                                    | -         | 否    | 考虑 Null 为空字符串                                                                    | String                                                         |
| `AnswerCount`         | 是     | 0, 518                                                               | 216       | 否    | 考虑 Null 和 0 为相同                                                                  | UInt16                                                         |
| `CommentCount`        | 是     | 0, 135                                                               | 100       | 否    | 考虑 Null 和 0 为相同                                                                  | UInt8                                                          |
| `FavoriteCount`       | 是     | 0, 225                                                               | 6         | 是    | 考虑 Null 和 0 为相同                                                                  | UInt8                                                          |
| `ContentLicense`      | 否     | -                                                                    | 3         | 否    | LowCardinality 优于 FixedString                                                       | LowCardinality(String)                                         |
| `ParentId`            | 否     | -                                                                    | 20696028  | 是    | 考虑 Null 为空字符串                                                                    | String                                                         |
| `CommunityOwnedDate`  | 否     | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -         | 是    | 考虑 Null 的默认值为 1970-01-01。毫秒粒度不是必需的，使用 DateTime                      | DateTime                                                       |
| `ClosedDate`          | 否     | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -         | 是    | 考虑 Null 的默认值为 1970-01-01。毫秒粒度不是必需的，使用 DateTime                      | DateTime                                                       |

<br />

以上给我们提供了以下模式：

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

我们可以使用简单的 `INSERT INTO SELECT` 来填充它，从我们之前的表中读取数据并插入到此表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

在我们的新模式中，我们不保留任何 Null。上述插入将这些隐式转换为其相应类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数值转换为其目标精度。
ClickHouse 中的主（排序）键
来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。

## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模下，内存和磁盘效率至关重要。数据是按块写入 ClickHouse 表中，称为 parts，同时应用合并部分的规则。在 ClickHouse 中，每个 part 具有自己的主索引。当部分合并时，合并部分的主索引也被合并。部分的主索引每组行只具有一个索引条目 - 这种技术称为稀疏索引。

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

在 ClickHouse 中选择的键将决定不仅是索引，而且是数据在磁盘上写入的顺序。因此，它可以显著影响压缩级别，从而影响查询性能。一个使大多数列的值按连续顺序写入的排序键将允许所选压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序，无论它们是否包含在键本身中。例如，若使用 `CreationDate` 作为键，则所有其他列中的值顺序将与 `CreationDate` 列中的值顺序相对应。可以指定多个排序键 - 这将与 `SELECT` 查询中的 `ORDER BY` 子句具有相同的语义。

可以应用一些简单的规则来帮助选择排序键。以下内容有时可能会相互冲突，因此请按顺序考虑这些。用户可以从该过程识别多个键，通常 4-5 个足够：

- 选择与常用过滤器对齐的列。如果某列在 `WHERE` 子句中使用频繁，优先考虑将其包含在关键字中，而不是那些使用较少的列。
- 优先考虑在过滤时可以帮助排除大量总行数的列，从而减少需要读取的数据量。
- 优先考虑与表中其他列高度相关的列。这将有助于确保这些值也是连续存储，从而改善压缩。
- 对于排序键中的列，`GROUP BY` 和 `ORDER BY` 操作可以更高效地使用内存。

在识别排序键的列子集时，请按特定顺序声明这些列。此顺序可能显著影响过滤的效率及表的数据文件的压缩比。通常，最好按基数的升序排列键。需要平衡的因素是，过滤在排序键后出现的列的效率将低于过滤在元组中较早出现的列。平衡这些行为并考虑您的访问模式（最重要的是测试变体）。

### 示例 {#example}

将上述指导方针应用于我们的 `posts` 表，假设我们的用户希望进行按日期和帖子类型过滤的分析，例如：

“在过去 3 个月内哪个问题的评论最多”。

使用我们早前的 `posts_v2` 表，该表具有优化类型但没有排序键的查询如下：

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

> 尽管对 6000 万行进行了线性扫描，查询速度依然很快——ClickHouse 的速度就是快 :) 你必须相信我们，在 TB 和 PB 级别中，排序键是值得的！

我们选择列 `PostTypeId` 和 `CreationDate` 作为我们的排序键。

也许在我们的案例中，我们期待用户始终按 `PostTypeId` 进行过滤。它的基数为 8，代表了我们排序键中第一个条目的逻辑选择。认识到日期粒度过滤可能已足够（其仍将受益于日期时间过滤），因此我们将 `toDate(CreationDate)` 作为键的第二个组件。这也将产生较小的索引，因为日期可以用 16 表示，快速过滤。我们最终的键条目是 `CommentCount`，以帮助查找评论最多的帖子（最终排序）。

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

对于对使用特定类型和适当排序键所取得的压缩改进感兴趣的用户，请参见 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)。如果用户需要进一步改进压缩，我们也建议查看 [选择正确的列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

## 下一步：数据建模技术 {#next-data-modeling-techniques}

到目前为止，我们迁移了仅一个表。虽然这使我们能够介绍某些核心 ClickHouse 概念，但大多数模式不幸并不是如此简单。

在下面列出的其他指南中，我们将探讨一些技术，以重新构建我们更广泛的模式，实现最佳的 ClickHouse 查询。在这个过程中，我们的目标是使 `Posts` 继续作为大多数分析查询的核心表。尽管其他表仍然可以独立查询，但我们假设大多数分析希望在 `posts` 的上下文中进行。

> 在本节中，我们使用其他表的优化变体。虽然我们提供了这些的模式，但出于简洁性，我们省略了做出的决策。这些都是基于先前描述的规则，我们将推测决策留给读者。

以下方法都旨在最小化使用 JOIN 的需求，以优化读取并改善查询性能。虽然 ClickHouse 完全支持 JOIN，但我们建议适度使用（JOIN 查询中 2 到 3 个表是可以的），以实现最佳性能。

> ClickHouse 没有外键的概念。这并不禁止进行连接，但意味着引用完整性由用户在应用程序级别管理。在像 ClickHouse 这样的 OLAP 系统中，数据完整性通常在应用程序级别或数据摄取过程中进行管理，而不是由数据库本身强制执行，因为这样会产生显著的开销。这种方法允许更大的灵活性和更快的数据插入。这与 ClickHouse 专注于性能和可扩展性的读取和插入查询相关，尤其对于非常大的数据集。

为了在查询时最小化 JOIN 的使用，用户有几种工具/方法：

- [**数据反规范化**](/data-modeling/denormalization) - 通过合并表并为非 1:1 关系使用复杂类型来反规范化数据。这通常涉及将在查询时连接的任何部分移到插入时。
- [**字典**](/dictionary) - ClickHouse 特有的处理直接连接和键值查找的功能。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - ClickHouse 的一项功能，可以将计算的成本从查询时间转移到插入时间，包括增量计算聚合值的能力。
- [**可刷新的物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品使用的物化视图，这允许定期计算查询的结果并缓存结果。

我们将在每个指南中探讨这些方法，突出何时每种方法是合适的，并示例如何将其应用于解决 Stack Overflow 数据集的问题。
