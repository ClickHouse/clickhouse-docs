import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解有效的模式设计是优化 ClickHouse 性能的关键，涉及的选择通常涉及权衡，最佳方法取决于所服务的查询以及数据更新频率、延迟要求和数据量等因素。本指南提供了针对优化 ClickHouse 性能的模式设计最佳实践和数据建模技术的概述。

## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中，我们使用 Stack Overflow 数据集的一个子集。该数据集包含自 2008 年至 2024 年 4 月在 Stack Overflow 上发生的每个帖子、投票、用户、评论和徽章。此数据可通过以下模式在 Parquet 格式中使用，存储于 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/`：

> 所示的主键和关系并未通过约束进行强制（Parquet 是文件而非表格式），仅表示数据之间的关系及其所具有的唯一键。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow 数据集包含多个相关表。在任何数据建模任务中，我们建议用户首先专注于加载其主表。这不一定是最大的表，而是你预计将接收大多数分析查询的表。这将使你熟悉主要的 ClickHouse 概念和类型，尤其重要的是如果你来自一个以 OLTP 为主的背景。随着额外表的添加，该表可能需要重新建模，以充分利用 ClickHouse 的特性并获得最佳性能。

上述模式故意不是最优的，用于本指南目的。

## 建立初始模式 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标，我们集中在为该表建立模式。此数据可在公共 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中获取，每年一个文件。

> 从 S3 加载 Parquet 格式的数据是将数据加载到 ClickHouse 中最常见和首选的方式。ClickHouse 针对 Parquet 进行了优化，每秒可以潜在地从 S3 中读取和插入数千万行。

ClickHouse 提供了一种模式推断功能，能够自动识别数据集的类型。这对所有数据格式（包括 Parquet）都支持。我们可以利用这一特性，通过 s3 表函数和[`DESCRIBE`](/sql-reference/statements/describe-table) 命令识别数据的 ClickHouse 类型。请注意，我们使用了通配符 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

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

> [s3 表函数](/sql-reference/table-functions/s3) 允许在 ClickHouse 中直接查询 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了初始的非优化模式。默认情况下，ClickHouse 将这些映射到等效的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令创建一个 ClickHouse 表，使用这些类型。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

几个重要点：

我们的 posts 表在运行此命令后是空的。数据尚未加载。
我们指定了 MergeTree 作为我们的表引擎。MergeTree 是你可能使用的最常见的 ClickHouse 表引擎。它是你 ClickHouse 工具箱中的多功能工具，能够处理 PB 级的数据，适用于大多数分析用例。还有其他表引擎适用于需要支持高效更新的用例，如 CDC。

`ORDER BY ()` 子句表示我们没有索引，更具体地说，数据没有排序。稍后将对此进行详细说明。目前，只需知道所有查询都将需要线性扫描。

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

定义了初始模式后，我们可以使用 `INSERT INTO SELECT` 填充数据，通过 s3 表功能读取数据。以下在 8 核心的 ClickHouse Cloud 实例上大约在 2 分钟内加载 `posts` 数据。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上述查询加载 6000 万行。虽然对 ClickHouse 而言数量较小，但互联网连接较慢的用户可能希望加载数据的子集。这可以通过简单地指定希望加载的年份，通过通配符模式实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。有关如何使用通配符模式定位文件子集，请参见 [这里](/sql-reference/table-functions/file#globs-in-path)。

## 优化类型 {#optimizing-types}

ClickHouse 查询性能的一个秘密是压缩。

磁盘上的数据较少意味着较少的 I/O，因此查询和插入更快。在大多数情况下，任何压缩算法的 CPU 开销都将被 I/O 的减少所抵消。因此，在确保 ClickHouse 查询快速时，提升数据的压缩应该是首要关注点。

> 关于 ClickHouse 为什么能如此有效地压缩数据，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一个列式数据库，值将按列顺序写入。如果这些值被排序，相同的值将相邻存放。压缩算法利用数据的连续模式。在此基础上，ClickHouse 提供了编码器和细粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩将受到三个主要因素的影响：排序键、数据类型和所使用的编码器。所有这些都可以通过模式进行配置。

通过简单的类型优化过程，可以获得初始压缩和查询性能的最大改善。可以应用一些简单的规则来优化模式：

- **使用严格类型** - 我们的初始模式为许多明显是数字的列使用了字符串。使用正确的类型将确保在过滤和聚合时所需的语义。同样，日期类型也已在 Parquet 文件中正确提供。
- **避免 Nullable 列** - 默认情况下，以上列被假定为 Null。Nullable 类型允许查询确定空值和 Null 值之间的区别。这创建了一个额外的 UInt8 类型的列。在用户处理 nullable 列时，每次都必须处理这个额外的列。这会导致额外的存储空间使用，并几乎总是对查询性能产生负面影响。只有在类型的默认空值和 Null 之间存在差异时，才使用 Nullable。例如，`ViewCount` 列中的空值为 0 将对大多数查询足够且不影响结果。如果空值应被不同对待，可以通过过滤器排除它们。
- **对数字类型使用最小精度** - ClickHouse 具有多种数字类型，设计用于不同的数字范围和精度。始终希望将代表列所需的位数最小化。除了不同大小的整数（如 Int16），ClickHouse 还提供其最小值为 0 的无符号变体。这些可以允许列使用更少的位数，例如 UInt16 最大值为 65535，是 Int16 的两倍。在可能的情况下，优先使用这些类型而不是较大的有符号变体。
- **日期类型的最小精度** - ClickHouse 支持多种日期和日期时间类型。Date 和 Date32 可用于存储纯日期，后者支持更大的日期范围，但使用更多的位数。DateTime 和 DateTime64 提供日期时间支持。DateTime 的精度限制为秒，使用 32 位。DateTime64，顾名思义，使用 64 位但提供高达纳秒的精度。像往常一样，对于查询选择更粗略的版本，最小化所需的位数。
- **使用 LowCardinality** - 具有少量唯一值的数字、字符串、日期或日期时间列可以使用 LowCardinality 类型进行编码。此字典编码值，从而减少磁盘上的大小。对于少于 1 万个唯一值的列，请考虑使用此功能。
- **FixedString 适用于特殊情况** - 具有固定长度的字符串可以使用 FixedString 类型编码，例如语言和货币代码。当数据的长度恰好为 N 字节时，这是高效的。在所有其他情况下，可能会降低效率，建议使用 LowCardinality。
- **用于数据验证的 Enums** - Enum 类型可用于有效编码列举类型。Enums 可以是 8 位或 16 位，具体取决于需要存储的唯一值数量。如果您需要在插入时进行相关验证（未声明的值将被拒绝），或者希望执行利用 Enum 值自然顺序的查询，请考虑使用此功能，例如想象一个反馈列包含用户响应 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`。

> 提示：要找到所有列的范围及不同值的数量，用户可以使用简单的查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在数据的较小子集上执行此操作，因为这可能会很耗费资源。此查询要求数字至少定义为数字类型，以获得准确的结果，即不能是字符串。

通过将这些简单规则应用于我们的 posts 表，我们可以为每列识别最佳类型：

| 列                      | 是否为数字 | 最小，最大                                                     | 唯一值     | Nulls | 注释                                                                                       | 优化类型                                   |
|------------------------|------------|---------------------------------------------------------------|------------|-------|--------------------------------------------------------------------------------------------|--------------------------------------------|
| `PostTypeId`              | 是         | 1, 8                                                        | 8          | 否    |                                                                                            | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`       | 是         | 0, 78285170                                                 | 12282094   | 是    | 用 0 值区分 Null                                                                        | UInt32                                    |
| `CreationDate`            | 否         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | -          | 否    | 不需要毫秒精度，使用 DateTime                                                       | DateTime                                   |
| `Score`                   | 是         | -217, 34970                                                | 3236       | 否    |                                                                                            | Int32                                     |
| `ViewCount`               | 是         | 2, 13962748                                                | 170867     | 否    |                                                                                            | UInt32                                    |
| `Body`                    | 否         | -                                                          | -          | 否    |                                                                                            | String                                    |
| `OwnerUserId`            | 是         | -1, 4056915                                                | 6256237    | 是    |                                                                                            | Int32                                     |
| `OwnerDisplayName`       | 否         | -                                                          | 181251     | 是    | 考虑将 Null 视为空字符串                                                                  | String                                    |
| `LastEditorUserId`       | 是         | -1, 9999993                                                | 1104694    | 是    | 0 是未使用值，可用于 Null                                                               | Int32                                     |
| `LastEditorDisplayName`  | 否         | -                                                          | 70952      | 是    | 考虑将 Null 看作空字符串。测试 LowCardinality 发现没有好处                             | String                                    |
| `LastEditDate`           | 否         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -          | 否    | 不需要毫秒精度，使用 DateTime                                                       | DateTime                                   |
| `LastActivityDate`       | 否         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | -          | 否    | 不需要毫秒精度，使用 DateTime                                                       | DateTime                                   |
| `Title`                   | 否         | -                                                          | -          | 否    | 考虑将 Null 看作空字符串                                                                  | String                                    |
| `Tags`                    | 否         | -                                                          | -          | 否    | 考虑将 Null 看作空字符串                                                                  | String                                    |
| `AnswerCount`            | 是         | 0, 518                                                    | 216        | 否    | 将 Null 和 0 视为相同                                                                  | UInt16                                    |
| `CommentCount`           | 是         | 0, 135                                                    | 100        | 否    | 将 Null 和 0 视为相同                                                                  | UInt8                                     |
| `FavoriteCount`          | 是         | 0, 225                                                    | 6          | 是    | 将 Null 和 0 视为相同                                                                  | UInt8                                     |
| `ContentLicense`         | 否         | -                                                          | 3          | 否    | LowCardinality 超过 FixedString                                                          | LowCardinality(String)                     |
| `ParentId`               | 否         | -                                                          | 20696028   | 是    | 考虑将 Null 看作空字符串                                                                  | String                                    |
| `CommunityOwnedDate`     | 否         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -          | 是    | 对于 Null 考虑使用默认值 1970-01-01。不需要毫秒精度，使用 DateTime                   | DateTime                                   |
| `ClosedDate`             | 否         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000         | -          | 是    | 对于 Null 考虑使用默认值 1970-01-01。不需要毫秒精度，使用 DateTime                  | DateTime                                   |

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

我们可以通过简单的 `INSERT INTO SELECT` 来填充此数据，从我们之前的表读取数据并插入到这个表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

我们在新模式中不保留任何 null。上述插入将这些隐式转换为各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数字转换为目标精度。

ClickHouse 中的主（排序）键
来自 OLTP 数据库的用户通常会寻找 ClickHouse 中等效的概念。

## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模上，内存和磁盘效率是极其重要的。数据以称为分片的块写入 ClickHouse 表，合并分片的规则在后台应用。在 ClickHouse 中，每个分片都有自己的主索引。当分片被合并时，合并后的分片的主索引也会被合并。分片的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

在 ClickHouse 中选择的键将决定不仅是索引，还决定数据在磁盘上的写入顺序。因为这个原因，它可以显著影响压缩水平，进而影响查询性能。导致大多数列的值连续写入的排序键将使所选择的压缩算法（和编码器）能够更有效地压缩数据。

> 表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果将 `CreationDate` 用作键，所有其他列中的值的顺序将对应于 `CreationDate` 列中的值的顺序。可以指定多个排序键 - 这将具有与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义。

一些简单的规则可以帮助选择排序键。这些规则有时可能发生冲突，因此可以依次考虑。用户可以从这个过程中识别出多个键，通常 4-5 个即可：

- 选择与常用过滤器对齐的列。如果某个列经常出现在 `WHERE` 子句中，则优先将这些列包含在键中，而不是那些使用较少的列。
- 优先选择在过滤时有可能排除大量总行的列，从而减少需要读取的数据量。
- 优先选择与表中其他列高度相关的列。这将有助于确保这些值也连续存储，提高压缩效率。
- 对于排序键中的列，可以使 `GROUP BY` 和 `ORDER BY` 操作更节省内存。

当识别排序键的列子集时，应按特定顺序声明列。此顺序对查询中二级键列过滤的效率以及表的数据文件的压缩率有显著影响。一般来说，最好按基数升序排列键。这需要平衡，因为过滤出现在排序键后面的列的效率将低于过滤出现在元组前面的列。平衡这些行为并考虑访问模式（最重要的是测试不同的变体）。

### 示例 {#example}

将上述指导方针对应用于我们的 `posts` 表，假设我们的用户希望执行按日期和帖子类型过滤的分析，例如：

“在过去三个月中，哪些问题获得了最多的评论”。

使用我们之前的 `posts_v2` 表进行此问题的查询，优化了类型但没有排序键：

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

> 尽管所有 6000 万行都经过线性扫描，但该查询非常快 - ClickHouse 就是快 :) 你得相信我们，在 TB 和 PB 规模下排序键是值得的！

我们选择 `PostTypeId` 和 `CreationDate` 作为我们的排序键。

也许在我们的案例中，我们预计用户总是会按 `PostTypeId` 进行过滤。该列的基数为 8，代表了我们排序键的首个逻辑选择。认识到日期精度的过滤可能会足够（它仍会受益于日期时间过滤），所以我们使用 `toDate(CreationDate)` 作为我们键的第二个组成部分。这样也能生成较小的索引，因为日期可以用 16 表示，从而加快过滤速度。我们最终的键条目是 `CommentCount`，以帮助找到评论最多的帖子（最后排序）。

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

对于对使用特定类型和适当排序键所实现的压缩改进感兴趣的用户，请参见 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)。如果用户需要进一步提高压缩，也建议查看 [选择合适的列压缩编码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

## 接下来：数据建模技术 {#next-data-modeling-techniques}

到目前为止，我们只迁移了一个表。虽然这使我们能够介绍一些核心 ClickHouse 概念，但大多数模式不幸并不是这么简单。

在下面列出的其他指南中，我们将探索多种技术，以便重新构建更广泛的模式，以便最优化 ClickHouse 的查询。在此过程中，我们的目标是使 `Posts` 成为我们执行大多数分析查询的中心表。尽管其他表仍然可以单独查询，但我们假设大多数分析希望在 `posts` 的上下文中进行。

> 在这一部分，我们使用优化后的其他表的变体。虽然我们提供这些表的模式，但为了简洁起见，我们省略了所做的决策。这些基于前面描述的规则，我们将推测决策留给读者。

以下方法旨在最小化使用 JOIN 来优化读取和提高查询性能的需求。虽然 ClickHouse 完全支持 JOIN，但我们建议在 JOIN 查询中谨慎使用（2 到 3 个表的 JOIN 查询是可行的），以实现最佳性能。

> ClickHouse 没有外键的概念。这不禁止连接，但意味着引用完整性由用户在应用程序级别管理。在像 ClickHouse 这样的 OLAP 系统中，数据完整性通常在应用程序级别或数据摄取过程中进行管理，而不是通过数据库本身强制执行，因为这样会产生显著的开销。这种方法允许更大的灵活性和更快的数据插入。这与 ClickHouse 专注于处理非常大型数据集的读取和插入查询的速度和可扩展性一致。

为了最小化查询时的 JOIN 使用，用户有几种工具/方法：

- [**数据去规范化**](/data-modeling/denormalization) - 通过合并表并使用复杂类型处理非 1:1 关系去规范化数据。这通常涉及在插入时移动任何 JOIN。
- [**字典**](/dictionary) - ClickHouse 特有的处理直接连接和键值查找的功能。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - ClickHouse 的一种特征，能够将计算成本从查询时间移至插入时间，包括增量计算聚合值的能力。
- [**可刷新的物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中使用的物化视图，这允许查询的结果定期计算并缓存结果。

我们在每个指南中探索这些方法，突出何时使用各自的方法，并提供示例说明如何将其应用于解决 Stack Overflow 数据集的问题。
