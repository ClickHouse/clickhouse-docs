---
slug: /data-modeling/schema-design
title: 模式设计
description: 优化 ClickHouse 模式以提高查询性能
keywords: [模式, 模式设计, 查询优化]
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignTypes from '@site/static/images/data-modeling/schema-design-types.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';

理解有效的模式设计是优化 ClickHouse 性能的关键，这包括常涉及权衡的选择，最佳方法取决于所服务的查询以及数据更新频率、延迟要求和数据量等因素。本指南提供了模式设计最佳实践和数据建模技术的概述，以优化 ClickHouse 性能。

## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中，我们使用 Stack Overflow 数据集的一个子集。该数据集包含从 2008 年到 2024 年 4 月 Stack Overflow 上发生的每个帖子、投票、用户、评论和徽章。这些数据以 Parquet 格式提供，使用以下模式存储在 S3 桶 `s3://datasets-documentation/stackoverflow/parquet/` 中：

> 所指示的主键和关系并未通过约束强制执行（Parquet 是文件而不是表格式），仅仅指示数据之间的关系及其独特键。

<img src={stackOverflowSchema} class="image" alt="Stack Overflow Schema" style={{width: '800px', background: 'none'}} />

<br />

Stack Overflow 数据集包含多个相关表。在任何数据建模任务中，我们建议用户专注于首先加载其主要表。这可能不必是最大表，而是您预计将接收大多数分析查询的表。这将使您熟悉主要的 ClickHouse 概念和类型，尤其是如果您来自主要的 OLTP 背景时尤其重要。随着附加表的添加，这个表可能需要重新建模，以充分利用 ClickHouse 的特性并获得最佳性能。

上述模式在本指南中故意不是最佳的。

## 建立初始模式 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标，我们重点是为该表建立模式。该数据在公共 S3 桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中可用，以每年一个文件的方式存储。

> 以 Parquet 格式从 S3 加载数据是将数据加载到 ClickHouse 的最常见和首选方式。ClickHouse 针对处理 Parquet 进行了优化，每秒有潜力读取和插入数千万行数据。

ClickHouse 提供了模式推断功能，可以自动识别数据集的类型。这对于所有数据格式（包括 Parquet）均受支持。我们可以利用此功能通过 S3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令来识别数据的 ClickHouse 类型。请注意，我们在下面使用通配符模式 `*.parquet` 读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                	│ Nullable(Int64)            	│
│ PostTypeId        	│ Nullable(Int64)            	│
│ AcceptedAnswerId  	│ Nullable(Int64)            	│
│ CreationDate      	│ Nullable(DateTime64(3, 'UTC')) │
│ Score             	│ Nullable(Int64)            	│
│ ViewCount         	│ Nullable(Int64)            	│
│ Body              	│ Nullable(String)           	│
│ OwnerUserId       	│ Nullable(Int64)            	│
│ OwnerDisplayName  	│ Nullable(String)           	│
│ LastEditorUserId  	│ Nullable(Int64)            	│
│ LastEditorDisplayName │ Nullable(String)           	│
│ LastEditDate      	│ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate  	│ Nullable(DateTime64(3, 'UTC')) │
│ Title             	│ Nullable(String)           	│
│ Tags              	│ Nullable(String)           	│
│ AnswerCount       	│ Nullable(Int64)            	│
│ CommentCount      	│ Nullable(Int64)            	│
│ FavoriteCount     	│ Nullable(Int64)            	│
│ ContentLicense    	│ Nullable(String)           	│
│ ParentId          	│ Nullable(String)           	│
│ CommunityOwnedDate	│ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate        	│ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> [s3 表函数](/sql-reference/table-functions/s3) 允许从 ClickHouse 中原位查询 S3 中的数据。此函数与 ClickHouse 支持的所有文件格式兼容。

这为我们提供了一个初步的非优化模式。默认情况下，ClickHouse 将这些映射为对应的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令创建一个 ClickHouse 表。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

几点重要说明：

我们的 `posts` 表在执行该命令后为空，没有加载任何数据。
我们已经指定 MergeTree 作为我们的表引擎。MergeTree 是您可能使用的最常见的 ClickHouse 表引擎。它是您 ClickHouse 中的多功能工具，能够处理 PB 的数据，并满足大多数分析用例。对于需要支持高效更新的用例，存在其他表引擎。

子句 `ORDER BY ()` 意味着我们没有索引，更具体地说，我们的数据没有顺序。稍后会对此进行详细介绍。现在，只需知道所有查询将需要进行线性扫描。

确认表已创建的命令：

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

定义初始模式后，我们可以使用 `INSERT INTO SELECT` 将数据填充到表中，通过 s3 表函数读取数据。以下示例在 8 核 ClickHouse Cloud 实例上大约在 2 分钟内加载 `posts` 数据。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上述查询加载了 6000 万行。虽然对于 ClickHouse 而言不算大，但互联网连接较慢的用户可能希望加载部分数据。这可以通过简单地指定他们希望加载的年份来实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。请查看 [此处](/sql-reference/table-functions/file#globs-in-path) 了解如何使用通配符模式针对文件子集。

## 优化类型 {#optimizing-types}

ClickHouse 查询性能的一个秘密是压缩。

磁盘上的数据越少，I/O 就越少，因此查询和插入就越快。任何压缩算法的 CPU 开销在大多数情况下将被 I/O 的减少所抵消。因此，在确保 ClickHouse 查询快速时，改善数据的压缩应该是首要关注点。

> 关于 ClickHouse 如何实现优秀数据压缩，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简而言之，作为一种列式数据库，值将按列顺序写入。如果这些值是排序的，相同的值将相邻存储。压缩算法利用了连续的数据模式。此外，ClickHouse 具有编码器和粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩将受到三个主要因素的影响：排序键、数据类型和使用的任何编码器。所有这些都通过模式进行配置。

通过简单的类型优化过程，可以获得初始压缩和查询性能的最大提升。可以应用一些简单的规则来优化模式：

- **使用严格类型** - 我们的初始模式对许多明显是数字的列使用了字符串。使用正确的类型将确保在过滤和聚合时获得预期的语义。日期类型也是如此，在 Parquet 文件中已正确定义。
- **避免 Nullable 列** - 默认情况下，上述列假定为 Null。Nullable 类型允许查询确定空值和 Null 值之间的区别。这会创建一个额外的 UInt8 类型的列。用户每次处理可空列时都需处理该附加列。这将导致额外的存储空间使用，并几乎总是对查询性能产生负面影响。仅在类型的默认空值与 Null 之间存在差异时使用 Nullable。例如，在 `ViewCount` 列中，空值的 0 值对于大多数查询可能就足够且不会影响结果。如果空值应被视为不同，可以通过过滤将其排除在查询之外。
- **对数值类型使用最小精度** - ClickHouse 提供了一些数值类型，适用于不同的数值范围和精度。始终旨在最小化表示列的位数。除了不同大小的整数 e.g. Int16，ClickHouse 还提供无符号变体，其最小值为 0。这些可以减少列所需的位数，例如 UInt16 最大值为 65535，是 Int16 的两倍。尽可能优先使用这些类型而不是更大的有符号变体。
- **日期类型的最小精度** - ClickHouse 支持多种日期和日期时间类型。Date 和 Date32 可用于存储纯日期，后者在位数方面支持更大的日期范围。DateTime 和 DateTime64 提供日期时间的支持。DateTime 的粒度限制为秒，使用 32 位。DateTime64 如其名所示，使用 64 位，但支持到纳秒级粒度。与往常一样，为查询选择可接受的较粗版本，最小化所需的位数。
- **使用 LowCardinality** - 具有低唯一值数量的数字、字符串、日期或日期时间列可以使用 LowCardinality 类型进行编码。此字典编码值，减少磁盘上的存储空间。考虑对少于 10k 的唯一值列使用此类型。
- **对于特定情况使用 FixedString** - 长度固定的字符串可以使用 FixedString 类型编码 e.g. 语言和货币代码。当数据长度精确为 N 字节时，这种方式是高效的。在所有其他情况下，它可能会降低效率，优先选择 LowCardinality。
- **使用枚举进行数据验证** - Enum 类型可用于高效地编码枚举类型。根据所需存储的唯一值数量，枚举可以是 8 位或 16 位。如果您需要在插入时进行关联验证（未声明的值将被拒绝）或希望执行利用 Enum 值的自然顺序的查询 e.g. 想象一个包含用户响应的反馈列 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`，则考虑使用此类型。

> 提示：用户可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` 查找所有列的范围和不同值的数量。我们建议在较小的数据子集上执行此操作，因为这可能会很昂贵。此查询要求数值至少被定义为数值类型，即不能是字符串。

通过将这些简单规则应用于我们的 `posts` 表，我们可以为每列识别出最佳类型：

<img src={schemaDesignTypes} class="image" alt="模式设计 - 优化类型" style={{width: '1000px', background: 'none'}} />

<br />

以上为我们提供了以下模式：

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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '优化后的类型'
```

我们可以通过简单的 `INSERT INTO SELECT` 将数据填充到这个新的表中，从我们之前的表中读取数据并插入到这个表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

在我们的新模式中，我们没有保留任何 null 值。上述插入将这些值隐式转换为其各自类型的默认值 - 对于整数是 0，对于字符串是空值。ClickHouse 还会自动将任何数值转换为其目标精度。
ClickHouse 中的主（排序）键
来自 OLTP 数据库的用户通常在 ClickHouse 中寻找相应的概念。

## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模下，内存和磁盘效率至关重要。数据以称为部分的块写入 ClickHouse 表，并在后台应用合并规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分被合并时，合并部分的主索引也会合并。部分的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。

<img src={schemaDesignIndices} class="image" alt="ClickHouse 中的稀疏索引" style={{width: '600px', background: 'none'}} />

<br />

在 ClickHouse 中选择的键将决定索引以及数据写入磁盘的顺序。因此，它会显著影响压缩水平，进而影响查询性能。导致大多数列的值以连续顺序写入的排序键将使所选的压缩算法（和编码器）能够更有效地压缩数据。

> 表中的所有列都将根据指定的排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 用作键，则其他所有列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多个排序键 - 这将采用与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义。

可以应用一些简单规则来帮助选择排序键。这些规则在某些情况下可能相互冲突，因此请按顺序考虑这些规则。用户可以从该过程中识别出多个键，通常 4-5 个键足够：

- 选择与常见过滤器对齐的列。如果某列在 `WHERE` 子句中使用频率较高，请优先包含这些列，而非使用频率较低的列。
- 优先考虑在过滤时帮助排除大量总行的列，从而减少需要读取的数据量。
- 优先考虑可能与表中其他列高度相关的列。这将有助于确保这些值也连续存储，从而改善压缩。
- 使用排序键列的 `GROUP BY` 和 `ORDER BY` 操作可以使内存更高效。

在识别排序键列的子集时，请按特定顺序声明列。此顺序可以显著影响查询时对二级键列的过滤效率以及表数据文件的压缩比率。一般来说，最好按基数的升序顺序对键进行排序。需要平衡的是，过滤位于排序键后面列的效率通常低于过滤位于元组中前面的列。平衡这些行为并考虑您的访问模式（最重要的是测试变体）。

### 示例 {#example}

将上述准则应用于我们的 `posts` 表，假设用户希望执行按日期和帖子类型过滤的分析，例如：

“过去三个月哪些问题评论最多”。

对使用我们之前的 `posts_v2` 表执行此问题的查询（优化的类型但没有排序键）：

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
│ 78203063 │ 如何避免 std::vector 中对象的默认初始化？                         │       	74 │
│ 78183948 │ 关于内存栅栏                                                        │       	52 │
│ 77900279 │ 缓冲区对齐的速度测试：IBM 的 PowerPC 结果与我的 CPU 相比               │       	49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
```

> 在这里，查询非常快速，即使所有 6000 万行都进行了线性扫描 - ClickHouse 实在是够快 :) 您必须相信，我们的排序键在 TB 和 PB 级别是值得的！

让我们选择列 `PostTypeId` 和 `CreationDate` 作为排序键。

也许在我们的案例中，我们期待用户始终通过 `PostTypeId` 进行过滤。它的基数为 8，代表了排序键的第一个条目的逻辑选择。认识到日期粒度过滤可能是足够的（这仍然会受益于日期时间过滤），因此我们将 `toDate(CreationDate)` 作为我们键的第二个组件。这也将生成较小的索引，日期可以用 16 位表示，加快过滤。我们的最终键条目是 `CommentCount`，以帮助找到评论最多的帖子（最后排序）。

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

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.


我们之前的查询将查询响应时间提高了超过 3 倍：

```sql
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

对于希望通过使用特定类型和适当排序键实现的压缩改进的用户，请参阅 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)。如果用户需要进一步改善压缩，我们还推荐 [选择正确的列压缩编码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 部分。

## 下一步：数据建模技术 {#next-data-modelling-techniques}

到现在为止，我们仅迁移了一个表。虽然这使我们能够介绍一些核心 ClickHouse 概念，但大多数模式不幸并不如此简单。

在下面列出的其他指南中，我们将探讨许多技术，以重构我们更广泛的模式以优化 ClickHouse 查询。在整个过程中，我们的目标是使 `Posts` 成为我们执行大多数分析查询的中心表。虽然仍然可以单独查询其他表，但我们假设大多数分析希望在 `posts` 的上下文中进行。

> 在本节中，我们使用其他表的优化变体。虽然我们提供了这些的模式，但出于简洁考虑，我们省略了所做的决策。这些基于之前描述的规则，我们将推断的决策留给读者。

以下方法都旨在最大限度地减少使用 JOIN 以优化读取和提高查询性能。虽然 ClickHouse 完全支持 JOIN，但我们建议在 JOIN 查询中谨慎使用（2 到 3 个表的 JOIN 查询是可以接受的），以实现最佳性能。

> ClickHouse 不存在外键的概念。这并不禁止连接，但意味着引用完整性由用户在应用层自行管理。在 ClickHouse 等 OLAP 系统中，数据完整性通常在应用层或数据摄取过程中进行管理，而不是由数据库本身强制执行，因为那会带来显著的开销。这种方法允许更大的灵活性和更快的数据插入。这与 ClickHouse 在处理非常大的数据集时对读取和插入查询的速度和可扩展性的关注是一致的。

为了在查询时尽量减少使用连接，用户有几个工具/方法：

- [**去归一化数据**](/data-modeling/denormalization) - 通过合并表和使用复杂类型来去归一化数据，以处理非 1:1 的关系。这样通常涉及在查询时将任何连接移至插入时。
- [**字典**](/dictionary) - 一种 ClickHouse 特有的功能，用于处理直接连接和键值查找。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - 一种 ClickHouse 功能，它将计算的成本从查询时间转移到插入时间，包括逐步计算聚合值的能力。
- [**可刷新的物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中使用的物化视图，这使得查询结果可以定期计算并缓存结果。

我们将在每个指南中探讨这些方法，突出每种方法何时适用，并通过示例展示如何将其应用于 Stack Overflow 数据集的问题解决。
