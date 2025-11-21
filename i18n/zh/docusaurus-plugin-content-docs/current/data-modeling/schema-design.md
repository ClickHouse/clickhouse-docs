---
slug: /data-modeling/schema-design
title: '模式设计'
description: '优化 ClickHouse 模式以提升查询性能'
keywords: ['模式', '模式设计', '查询优化']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

理解高效的模式设计是优化 ClickHouse 性能的关键，这一过程中的选择通常涉及各种权衡，最优方案取决于所需支持的查询类型，以及数据更新频率、延迟要求和数据规模等因素。本指南概述了用于优化 ClickHouse 性能的模式设计最佳实践和数据建模技术。


## Stack Overflow 数据集 {#stack-overflow-dataset}

在本指南的示例中,我们使用 Stack Overflow 数据集的一个子集。该数据集包含 2008 年至 2024 年 4 月期间 Stack Overflow 上的所有帖子、投票、用户、评论和徽章。这些数据以 Parquet 格式提供,使用以下模式存储在 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/` 中:

> 所示的主键和关系并非通过约束强制执行(Parquet 是文件格式而非表格式),仅用于说明数据之间的关联关系及其所拥有的唯一键。

<Image img={stackOverflowSchema} size='lg' alt='Stack Overflow Schema' />

<br />

Stack Overflow 数据集包含多个相关表。在任何数据建模任务中,我们建议用户首先专注于加载其主表。这不一定是最大的表,而是您预期会接收最多分析查询的表。这将帮助您熟悉 ClickHouse 的主要概念和类型,对于主要具有 OLTP 背景的用户来说尤为重要。随着添加更多表,该表可能需要重新建模,以充分利用 ClickHouse 的功能并获得最佳性能。

出于本指南的目的,上述模式有意设计为非最优状态。


## 建立初始架构 {#establish-initial-schema}

由于 `posts` 表将是大多数分析查询的目标表,我们重点为该表建立架构。该数据存储在公共 S3 存储桶 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 中,每年一个文件。

> 从 S3 以 Parquet 格式加载数据是将数据导入 ClickHouse 最常见且首选的方式。ClickHouse 针对 Parquet 处理进行了优化,每秒可以从 S3 读取并插入数千万行数据。

ClickHouse 提供了架构推断功能,可以自动识别数据集的类型。该功能支持所有数据格式,包括 Parquet。我们可以利用此功能,通过 s3 表函数和 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令来识别数据的 ClickHouse 类型。请注意,下面我们使用通配符模式 `*.parquet` 来读取 `stackoverflow/parquet/posts` 文件夹中的所有文件。

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

> [s3 表函数](/sql-reference/table-functions/s3)允许从 ClickHouse 直接查询 S3 中的数据。该函数兼容 ClickHouse 支持的所有文件格式。

这为我们提供了一个初始的未优化架构。默认情况下,ClickHouse 会将这些字段映射为等效的 Nullable 类型。我们可以使用简单的 `CREATE EMPTY AS SELECT` 命令,基于这些类型创建 ClickHouse 表。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

几个重要说明:

运行此命令后,posts 表是空的。尚未加载任何数据。
我们指定了 MergeTree 作为表引擎。MergeTree 是您最常使用的 ClickHouse 表引擎。它是 ClickHouse 工具箱中的多功能工具,能够处理 PB 级数据,适用于大多数分析场景。其他表引擎适用于需要支持高效更新的场景,例如 CDC。

`ORDER BY ()` 子句表示我们没有索引,更具体地说,数据没有排序。稍后会详细介绍。目前只需知道所有查询都需要进行线性扫描。

要确认表已创建:

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

定义好初始模式后,我们可以使用 `INSERT INTO SELECT` 填充数据,通过 s3 表函数读取数据。以下操作在 8 核 ClickHouse Cloud 实例上加载 `posts` 数据大约需要 2 分钟。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

返回 0 行。耗时:148.140 秒。已处理 5982 万行,38.07 GB(40.38 万行/秒,257.00 MB/秒)。
````

> 上述查询会加载 6000 万行数据。虽然对 ClickHouse 来说这并不算大，但网络连接较慢的用户可能希望只加载一部分数据。只需通过 glob 模式指定要加载的年份即可实现，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 或 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`。有关如何使用 glob 模式来选择文件子集，请参见[这里](/sql-reference/table-functions/file#globs-in-path)。


## 优化类型 {#optimizing-types}

ClickHouse 查询性能的秘诀之一是压缩。

磁盘上的数据越少意味着 I/O 越少,从而使查询和插入速度更快。在大多数情况下,任何压缩算法在 CPU 方面的开销都会被 I/O 减少所带来的收益所抵消。因此,在确保 ClickHouse 查询快速运行时,改进数据压缩应该是首要关注点。

> 关于 ClickHouse 为何能如此出色地压缩数据,我们推荐阅读[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简而言之,作为列式数据库,数据值将按列顺序写入。如果这些值已排序,相同的值将彼此相邻。压缩算法会利用数据的连续模式。此外,ClickHouse 具有编解码器和细粒度数据类型,允许用户进一步调整压缩技术。

ClickHouse 中的压缩受 3 个主要因素影响:排序键、数据类型和使用的编解码器。所有这些都通过 schema 进行配置。

通过简单的类型优化过程,可以获得压缩和查询性能的最大初始改进。可以应用以下几条简单规则来优化 schema:

- **使用严格类型** - 我们的初始 schema 对许多明显是数值的列使用了字符串类型。使用正确的类型将确保在过滤和聚合时具有预期的语义。这同样适用于日期类型,这些类型已在 Parquet 文件中正确提供。
- **避免可空列** - 默认情况下,上述列被假定为 Null。Nullable 类型允许查询区分空值和 Null 值。这会创建一个单独的 UInt8 类型列。每次用户处理可空列时都必须处理这个额外的列。这会导致使用额外的存储空间,并且几乎总是对查询性能产生负面影响。仅当类型的默认空值与 Null 之间存在差异时才使用 Nullable。例如,对于 `ViewCount` 列中的空值,值 0 对于大多数查询来说可能就足够了,不会影响结果。如果空值需要被区别对待,通常也可以通过过滤器将它们从查询中排除。
- **对数值类型使用最小精度** - ClickHouse 具有多种为不同数值范围和精度设计的数值类型。始终力求最小化用于表示列的位数。除了不同大小的整数(例如 Int16)之外,ClickHouse 还提供最小值为 0 的无符号变体。这些可以允许列使用更少的位,例如 UInt16 的最大值为 65535,是 Int16 的两倍。如果可能,优先使用这些类型而不是更大的有符号变体。
- **对日期类型使用最小精度** - ClickHouse 支持多种日期和日期时间类型。Date 和 Date32 可用于存储纯日期,后者支持更大的日期范围,但代价是使用更多位。DateTime 和 DateTime64 提供对日期时间的支持。DateTime 限于秒粒度并使用 32 位。DateTime64 顾名思义使用 64 位,但提供高达纳秒粒度的支持。一如既往,选择查询可接受的更粗粒度版本,最小化所需的位数。
- **使用 LowCardinality** - 具有少量唯一值的数字、字符串、Date 或 DateTime 列可以使用 LowCardinality 类型进行编码。这种字典编码方式可以减少磁盘上的大小。对于唯一值少于 10k 的列,可以考虑使用此类型。
- **特殊情况使用 FixedString** - 具有固定长度的字符串可以使用 FixedString 类型进行编码,例如语言和货币代码。当数据长度恰好为 N 字节时,这是高效的。在所有其他情况下,它可能会降低效率,建议使用 LowCardinality。
- **使用枚举进行数据验证** - Enum 类型可用于高效编码枚举类型。根据需要存储的唯一值数量,枚举可以是 8 位或 16 位。如果您需要在插入时进行相关验证(未声明的值将被拒绝),或者希望执行利用枚举值自然排序的查询,请考虑使用此类型,例如想象一个包含用户响应的反馈列 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`。

> 提示:要查找所有列的范围和不同值的数量,用户可以使用简单的查询 `SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在较小的数据子集上执行此操作,因为这可能会比较耗费资源。此查询要求数值至少定义为数值类型才能获得准确结果,即不能是字符串类型。

通过将这些简单规则应用于我们的 posts 表,我们可以为每列确定最佳类型:


| 列                       | 是否为数值 | 最小值、最大值                                                      | 唯一值      | NULL 值 | 注释                                                      | 优化后的类型                                                                                                                                                       |
| ----------------------- | ----- | ------------------------------------------------------------ | -------- | ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 是     | 1, 8                                                         | 8        | 否      |                                                         | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是     | 0.78285170                                                   | 12282094 | 是      | 将 Null 与 0 区分开来                                         | UInt32                                                                                                                                                       |
| `CreationDate`          | 否     | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 否      | 如果不需要毫秒级精度，请使用 DateTime                                 | DateTime                                                                                                                                                     |
| `Score`                 | 是     | -217, 34970                                                  | 3236     | 否      |                                                         | Int32                                                                                                                                                        |
| `ViewCount`             | 是     | 2, 13962748                                                  | 170867   | 否      |                                                         | UInt32                                                                                                                                                       |
| `Body`                  | 否     | -                                                            | *        | 否      |                                                         | 字符串                                                                                                                                                          |
| `OwnerUserId`           | 是     | -1, 4056915                                                  | 6256237  | 是      |                                                         | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 否     | -                                                            | 181251   | 是的     | 将 Null 当作空字符串处理                                         | 字符串                                                                                                                                                          |
| `LastEditorUserId`      | 是的    | -1, 9999993                                                  | 1104694  | 是      | 0 是一个未被占用的值，可用于表示 Null                                  | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 否     | *                                                            | 70952    | 是的     | 将 Null 视为空字符串。已对 LowCardinality 进行测试，但未见收益              | String                                                                                                                                                       |
| `LastEditDate`          | 否     | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 否      | 若不需要毫秒级精度，请使用 DateTime                                  | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 否     | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 否      | 如果不需要毫秒级精度，请使用 DateTime                                 | DateTime                                                                                                                                                     |
| `标题`                    | 否     | -                                                            | *        | 否      | 将 Null 视为一个空字符串                                         | String                                                                                                                                                       |
| `标签`                    | 否     | -                                                            | *        | 否      | 将 NULL 视为空字符串                                           | 字符串                                                                                                                                                          |
| `AnswerCount`           | 是的    | 0, 518                                                       | 216      | 否      | 将 Null 和 0 视为等同                                         | UInt16                                                                                                                                                       |
| `CommentCount`          | 是     | 0, 135                                                       | 100      | 否      | 将 Null 与 0 视为相等                                         | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 是     | 0, 225                                                       | 6        | 是      | 将 Null 和 0 视为相同                                         | UInt8                                                                                                                                                        |
| `ContentLicense`        | 否     | -                                                            | 3        | 否      | LowCardinality 的性能优于 FixedString                        | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 否     | *                                                            | 20696028 | 是      | 将 Null 当作空字符串处理                                         | 字符串                                                                                                                                                          |
| `CommunityOwnedDate`    | 否     | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 是      | 对于 Null 值使用默认日期 1970-01-01。无需毫秒级精度，请使用 DateTime         | DateTime                                                                                                                                                     |
| `ClosedDate`            | 否     | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 是的     | 对于 Null 值建议使用 1970-01-01 作为默认值。无需毫秒级精度，使用 DateTime 类型即可 | DateTime                                                                                                                                                     |

<br />

根据以上内容，我们得到如下模式（schema）：

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

我们可以通过一个简单的 `INSERT INTO SELECT` 语句来将其填充，从之前的表中读取数据并插入到这个表中：

```sql
INSERT INTO posts_v2 SELECT * FROM posts

返回 0 行。耗时:146.471 秒。已处理 5982 万行,83.82 GB(408.40 千行/秒,572.25 MB/秒)
```

在我们的新模式中不会保留任何 NULL。上述 INSERT 会将这些值隐式转换为其各自类型的默认值——整数为 0，字符串为空字符串。ClickHouse 也会自动将任何数值类型转换为其目标精度。
ClickHouse 中的主键（排序键）
来自 OLTP 数据库的用户经常会在 ClickHouse 中寻找与之等价的概念。


## 选择排序键 {#choosing-an-ordering-key}

在 ClickHouse 通常使用的规模下,内存和磁盘效率至关重要。数据以称为数据分片(parts)的块形式写入 ClickHouse 表,并在后台应用规则来合并这些数据分片。在 ClickHouse 中,每个数据分片都有自己的主索引。当数据分片合并时,合并后数据分片的主索引也会被合并。数据分片的主索引为每组行设置一个索引条目 - 这种技术称为稀疏索引。

<Image
  img={schemaDesignIndices}
  size='md'
  alt='ClickHouse 中的稀疏索引'
/>

在 ClickHouse 中选择的键不仅决定索引,还决定数据写入磁盘的顺序。因此,它会显著影响压缩级别,进而影响查询性能。使大多数列的值按连续顺序写入的排序键将使所选的压缩算法(和编解码器)能够更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序,无论它们是否包含在键本身中。例如,如果使用 `CreationDate` 作为键,则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多个排序键 - 这将使用与 `SELECT` 查询中 `ORDER BY` 子句相同的语义进行排序。

可以应用一些简单的规则来帮助选择排序键。以下规则有时可能会相互冲突,因此请按顺序考虑。用户可以从此过程中识别出多个键,通常 4-5 个就足够了:

- 选择与常用过滤条件对齐的列。如果某列在 `WHERE` 子句中频繁使用,则优先将这些列包含在键中,而不是那些使用频率较低的列。
  优先选择在过滤时有助于排除大部分总行数的列,从而减少需要读取的数据量。
- 优先选择可能与表中其他列高度相关的列。这将有助于确保这些值也连续存储,从而改善压缩效果。
  对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作可以提高内存效率。

在确定排序键的列子集时,请按特定顺序声明这些列。此顺序会显著影响查询中对次要键列的过滤效率以及表数据文件的压缩比。通常,最好按基数升序排列键。这应该与以下事实相平衡:对排序键中较晚出现的列进行过滤的效率将低于对元组中较早出现的列进行过滤。平衡这些行为并考虑您的访问模式(最重要的是测试不同变体)。

### 示例 {#example}

将上述指南应用于我们的 `posts` 表,假设我们的用户希望执行按日期和帖子类型过滤的分析,例如:

"过去 3 个月中哪些问题的评论最多"。

使用我们之前具有优化类型但没有排序键的 `posts_v2` 表来查询此问题:

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

返回 10 行。耗时:0.070 秒。处理了 5982 万行,569.21 MB(每秒 8.5255 亿行,8.11 GB/秒)。
峰值内存使用量:429.38 MiB。
```

> 尽管线性扫描了所有 6000 万行,但此查询仍然非常快 - ClickHouse 就是这么快 :) 您必须相信我们,在 TB 和 PB 规模下,排序键是值得的!

让我们选择 `PostTypeId` 和 `CreationDate` 列作为我们的排序键。


在我们的场景中，我们预期用户始终会按 `PostTypeId` 进行过滤。该列的基数为 8，是作为排序键首个字段的合理选择。考虑到按日期粒度进行过滤很可能已经足够（同时这对 datetime 过滤仍然有帮助），我们将 `toDate(CreationDate)` 作为键的第二个组成部分。这样也会生成更小的索引，因为日期可以用 16 位来表示，从而加快过滤。排序键的最后一项是 `CommentCount`，用于辅助查找评论数最多的帖子（最终排序）。

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

--从现有表填充表数据

INSERT INTO posts_v3 SELECT * FROM posts_v2

返回 0 行。用时:158.074 秒。已处理 5982 万行,76.21 GB(每秒 37.842 万行,482.14 MB/s)。
内存峰值:6.41 GiB。

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

对于有兴趣通过使用特定数据类型和合适排序键来提升压缩效果的用户，请参阅 [Compression in ClickHouse](/data-compression/compression-in-clickhouse)。如果需要进一步提高压缩比，我们还推荐阅读 [Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 这一部分。


## 下一步：数据建模技术 {#next-data-modeling-techniques}

到目前为止，我们只迁移了一张表。虽然这让我们能够介绍一些 ClickHouse 的核心概念，但遗憾的是，大多数数据模式并不是这么简单。

在下面列出的其他指南中，我们将探讨多种技术来重构更广泛的数据模式，以实现 ClickHouse 查询的最佳性能。在整个过程中，我们的目标是让 `Posts` 保持为中心表，大多数分析查询都通过它来执行。虽然其他表仍然可以单独查询，但我们假设大多数分析都需要在 `posts` 的上下文中执行。

> 在本节中，我们使用其他表的优化版本。虽然我们提供了这些表的模式定义，但为了简洁起见，我们省略了具体的决策过程。这些决策基于前面描述的规则，我们将推断这些决策的工作留给读者。

以下方法都旨在最小化 JOIN 的使用需求，以优化读取并提高查询性能。虽然 ClickHouse 完全支持 JOIN 操作，但我们建议谨慎使用(JOIN 查询中包含 2 到 3 张表是可以接受的)，以实现最佳性能。

> ClickHouse 没有外键的概念。这并不禁止连接操作，但意味着引用完整性需要由用户在应用程序层面进行管理。在像 ClickHouse 这样的 OLAP 系统中，数据完整性通常在应用程序层面或数据摄取过程中进行管理，而不是由数据库本身强制执行，因为后者会产生显著的性能开销。这种方法提供了更大的灵活性和更快的数据插入速度。这与 ClickHouse 专注于超大数据集的读取和插入查询的速度和可扩展性的设计理念相一致。

为了最小化查询时 JOIN 的使用，用户有以下几种工具/方法：

- [**数据反规范化**](/data-modeling/denormalization) - 通过组合表并对非 1:1 关系使用复杂类型来反规范化数据。这通常涉及将连接操作从查询时转移到插入时。
- [**字典**](/dictionary) - ClickHouse 特有的功能，用于处理直接连接和键值查找。
- [**增量物化视图**](/materialized-view/incremental-materialized-view) - ClickHouse 的一项功能，用于将计算成本从查询时转移到插入时，包括增量计算聚合值的能力。
- [**可刷新物化视图**](/materialized-view/refreshable-materialized-view) - 类似于其他数据库产品中使用的物化视图，允许定期计算查询结果并缓存结果。

我们在每个指南中探讨这些方法，重点说明每种方法的适用场景，并通过示例展示如何将其应用于解决 Stack Overflow 数据集的相关问题。
