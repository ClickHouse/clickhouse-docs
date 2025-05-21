---
'slug': '/best-practices/select-data-types'
'sidebar_position': 10
'sidebar_label': '选择数据类型'
'title': '选择数据类型'
'description': '页面描述如何在ClickHouse中选择数据类型'
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse 查询性能的核心原因之一是其高效的数据压缩。磁盘上的数据减少通过最小化 I/O 开销导致查询和插入速度更快。ClickHouse 的列式架构自然将相似数据相邻排列，使得压缩算法和编解码器能够显著减少数据大小。为了最大化这些压缩带来的好处，选择合适的数据类型至关重要。

ClickHouse 的压缩效率主要依赖于三个因素：排序键、数据类型和编解码器，所有这些都是通过表模式定义的。选择最佳的数据类型会在存储和查询性能上都带来即时改进。

一些简单的指导方针可以显著增强模式：

* **使用严格的数据类型：** 始终为列选择正确的数据类型。数值和日期字段应使用适当的数值和日期类型，而不是通用的字符串类型。这确保了过滤和聚合的语义正确。

* **避免使用 Nullable 列：** 带 Nullable 的列引入了额外的开销，因为它们需要维护单独的列来跟踪空值。仅在显式需要区分空和 Null 状态时才使用 Nullable。否则，默认值或零等值通常足够。有关为什么应该避免这种类型的更多信息，请参见 [Avoid Nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)。

* **最小化数值精度：** 选择最小比特宽度的数值类型，以满足预期的数据范围。例如，如果不需要负值，且范围适合于 0–65535，则更倾向于选择 [UInt16 over Int32](/sql-reference/data-types/int-uint)。

* **优化日期和时间精度：** 选择满足查询要求的最粗粒度的日期或日期时间类型。对于仅包含日期的字段，使用 Date 或 Date32，对于日期时间字段除非需要毫秒级或更精细的精度，否则优先选择 DateTime 而不是 DateTime64。

* **利用 LowCardinality 和专用类型：** 对于唯一值少于约 10,000 的列，使用 LowCardinality 类型可以通过字典编码显著减少存储。类似地，仅在列值严格为固定长度字符串（例如，国家或货币代码）时使用 FixedString，对于可能值有限的列优先选择 Enum 类型，以便实现高效存储和内置的数据验证。

* **使用枚举进行数据验证：** Enum 类型可以有效编码枚举类型。Enum 可以是 8 位或 16 位，具体取决于所需存储的唯一值数量。如果需要在插入时进行相关性验证（未声明的值将被拒绝）或想执行利用 Enum 值中的自然顺序的查询，可以考虑使用此方法，例如设想一个包含用户响应的反馈列 Enum(':(' = 1, ':|' = 2, ':)' = 3)。

## 示例 {#example}

ClickHouse 提供内置工具以简化类型优化。例如，模式推断可以自动识别初步类型。考虑 Stack Overflow 数据集，该数据集以 Parquet 格式公开可用。通过运行简单的模式推断，使用 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令提供初始的非优化模式。

:::note
默认情况下，ClickHouse 会将这些映射到等效的 Nullable 类型。这是合适的，因为模式仅基于样本行。
:::

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name───────────────────────┬─type──────────────────────────────┐
│ Id                         │ Nullable(Int64)                   │
│ PostTypeId                 │ Nullable(Int64)                   │
│ AcceptedAnswerId           │ Nullable(Int64)                   │
│ CreationDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ Score                      │ Nullable(Int64)                   │
│ ViewCount                  │ Nullable(Int64)                   │
│ Body                       │ Nullable(String)                  │
│ OwnerUserId                │ Nullable(Int64)                   │
│ OwnerDisplayName           │ Nullable(String)                  │
│ LastEditorUserId           │ Nullable(Int64)                   │
│ LastEditorDisplayName      │ Nullable(String)                  │
│ LastEditDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ LastActivityDate           │ Nullable(DateTime64(3, 'UTC'))    │
│ Title                      │ Nullable(String)                  │
│ Tags                       │ Nullable(String)                  │
│ AnswerCount                │ Nullable(Int64)                   │
│ CommentCount               │ Nullable(Int64)                   │
│ FavoriteCount              │ Nullable(Int64)                   │
│ ContentLicense             │ Nullable(String)                  │
│ ParentId                   │ Nullable(String)                  │
│ CommunityOwnedDate         │ Nullable(DateTime64(3, 'UTC'))    │
│ ClosedDate                 │ Nullable(DateTime64(3, 'UTC'))    │
└────────────────────────────┴───────────────────────────────────┘

22 rows in set. Elapsed: 0.130 sec.
```

:::note
请注意，我们使用 glob 模式 *.parquet 来读取 stackoverflow/parquet/posts 文件夹中的所有文件。
:::

通过将我们早期的简单规则应用于我们的 posts 表，我们可以为每一列识别出最佳类型：

| 列名                     | 是否为数值 | 最小, 最大                                                             | 唯一值       | 空值  | 备注                                                                                       | 优化类型                             |
|-------------------------|------------|-------------------------------------------------------------------------|---------------|--------|----------------------------------------------------------------------------------------------|--------------------------------------|
| `PostTypeId`             | 是         | 1, 8                                                                    | 8             | 否     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是         | 0, 78285170                                                             | 12282094      | 是     | 通过 0 值区分 Null                                                                           | UInt32                               |
| `CreationDate`           | 否         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000            | -             | 否     | 毫秒级粒度不是必须的，使用 DateTime                                                       | DateTime                             |
| `Score`                  | 是         | -217, 34970                                                             | 3236          | 否     |                                                                                              | Int32                                |
| `ViewCount`              | 是         | 2, 13962748                                                             | 170867        | 否     |                                                                                              | UInt32                               |
| `Body`                   | 否         | -                                                                       | -             | 否     |                                                                                              | String                               |
| `OwnerUserId`            | 是         | -1, 4056915                                                             | 6256237       | 是     |                                                                                              | Int32                                |
| `OwnerDisplayName`       | 否         | -                                                                       | 181251        | 是     | 考虑 Null 为空字符串                                                                         | String                               |
| `LastEditorUserId`       | 是         | -1, 9999993                                                             | 1104694       | 是     | 0 是未使用的值，可以用于 Null                                                               | Int32                                |
| `LastEditorDisplayName`  | 否         | -                                                                       | 70952         | 是     | 考虑 Null 为一个空字符串。测试 LowCardinality 没有获益                                      | String                               |
| `LastEditDate`           | 否         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000            | -             | 否     | 毫秒级粒度不是必须的，使用 DateTime                                                       | DateTime                             |
| `LastActivityDate`       | 否         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000            | -             | 否     | 毫秒级粒度不是必须的，使用 DateTime                                                       | DateTime                             |
| `Title`                  | 否         | -                                                                       | -             | 否     | 考虑 Null 为一个空字符串                                                                     | String                               |
| `Tags`                   | 否         | -                                                                       | -             | 否     | 考虑 Null 为一个空字符串                                                                     | String                               |
| `AnswerCount`            | 是         | 0, 518                                                                  | 216           | 否     | 考虑 Null 和 0 相同                                                                         | UInt16                               |
| `CommentCount`           | 是         | 0, 135                                                                  | 100           | 否     | 考虑 Null 和 0 相同                                                                         | UInt8                                |
| `FavoriteCount`          | 是         | 0, 225                                                                  | 6             | 是     | 考虑 Null 和 0 相同                                                                         | UInt8                                |
| `ContentLicense`         | 否         | -                                                                       | 3             | 否     | LowCardinality 优于 FixedString                                                               | LowCardinality(String)               |
| `ParentId`               | 否         | -                                                                       | 20696028      | 是     | 考虑 Null 为一个空字符串                                                                     | String                               |
| `CommunityOwnedDate`     | 否         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000            | -             | 是     | 考虑 Null 的默认值为 1970-01-01。毫秒级粒度不是必须的，使用 DateTime                      | DateTime                             |
| `ClosedDate`             | 否         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                       | -             | 是     | 考虑 Null 的默认值为 1970-01-01。毫秒级粒度不是必须的，使用 DateTime                      | DateTime                             |

:::note tip
为列识别类型依赖于理解其数值范围和唯一值数量。用户可以使用简单的查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` 找到所有列的范围和不同值的数量。我们建议在较小数据子集上执行此操作，因为这可能会很昂贵。
:::

这将导致以下优化后的模式（关于类型）：

```sql
CREATE TABLE posts
(
   Id Int32,
   PostTypeId Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 
   'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   AcceptedAnswerId UInt32,
   CreationDate DateTime,
   Score Int32,
   ViewCount UInt32,
   Body String,
   OwnerUserId Int32,
   OwnerDisplayName String,
   LastEditorUserId Int32,
   LastEditorDisplayName String,
   LastEditDate DateTime,
   LastActivityDate DateTime,
   Title String,
   Tags String,
   AnswerCount UInt16,
   CommentCount UInt8,
   FavoriteCount UInt8,
   ContentLicense LowCardinality(String),
   ParentId String,
   CommunityOwnedDate DateTime,
   ClosedDate DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

## 避免 Nullable 列 {#avoid-nullable-columns}

<NullableColumns />
