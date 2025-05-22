import NullableColumns from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse 查询性能的一个核心原因是其高效的数据压缩。在磁盘上存储更少数据可通过最小化 I/O 开销来实现更快的查询和插入。ClickHouse 的列式架构自然将相似的数据相邻排列，这使得压缩算法和编解码器能够显著减少数据大小。为了最大化这些压缩的好处，必须仔细选择适当的数据类型。

ClickHouse 中的压缩效率主要取决于三个因素：排序键、数据类型和编解码器，所有这些都在表架构中定义。选择最佳的数据类型可以立即改善存储和查询性能。

一些简单的指导方针可以显著增强架构：

* **使用严格类型：** 始终为列选择正确的数据类型。数字和日期字段应使用合适的数字和日期类型，而不是通用的字符串类型。这可以确保在过滤和聚合时的语义正确。

* **避免 Nullable 列：** Nullable 列通过维护单独的列来跟踪空值，从而引入额外的开销。仅在明确需要区分空状态和 null 状态时才使用 Nullable。否则，默认值或零等效值通常就足够了。有关为何在不必要时应避免这种类型的更多信息，请参见 [Avoid Nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)。

* **最小化数值精度：** 选择具有最小位宽的数字类型，以适应预期的数据范围。例如，如果不需要负值，且范围适合 0–65535，则更倾向于使用 [UInt16 而非 Int32](/sql-reference/data-types/int-uint)。

* **优化日期和时间精度：** 选择最粗粒度的日期或日期时间类型以满足查询要求。对于仅包含日期的字段，使用 Date 或 Date32，且除非毫秒或更精细的精度是必需的，否则更倾向于使用 DateTime 而非 DateTime64。

* **利用 LowCardinality 和专用类型：** 对于唯一值少于大约 10,000 的列，使用 LowCardinality 类型可以通过字典编码显著减少存储。同样，只有在列值严格为固定长度字符串（例如，国家或货币代码）时才使用 FixedString，并且对于具有有限可能值集合的列，倾向于使用 Enum 类型以启用高效存储和内置数据验证。

* **用于数据验证的 Enums：** Enum 类型可以用于高效编缉枚举类型。Enums 可以是 8 位或 16 位，具体取决于需要存储的唯一值数量。如果需要在插入时进行相关验证（未声明的值将被拒绝），或者希望执行可以利用 Enum 值的自然排序的查询，例如想象一个包含用户反馈的列 Enum(':(' = 1, ':|' = 2, ':)' = 3)，请考虑使用此项。

## 示例 {#example}

ClickHouse 提供内置工具以简化类型优化。例如，架构推断可以自动识别初步类型。考虑公共可用的以 Parquet 格式提供的 Stack Overflow 数据集。通过 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令运行简单的架构推断可以提供初步的非优化架构。

:::note
默认情况下，ClickHouse 将这些映射为等效的 Nullable 类型。这是首选的，因为架构仅基于部分行的样本。
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
请注意，这里我们使用通配符模式 *.parquet 读取 stackoverflow/parquet/posts 文件夹中的所有文件。
:::

通过将我们的早期简单规则应用于我们的帖子表，我们可以为每列识别最佳类型：

| 列                     | 是数字 | 最小, 最大                                                         | 唯一值 | Nulls | 注释                                                                                              | 优化类型                               |
|------------------------|--------|--------------------------------------------------------------------|---------|-------|---------------------------------------------------------------------------------------------------|----------------------------------------|
| `PostTypeId`             | 是      | 1, 8                                                               | 8       | 否    |                                                                                                   | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是      | 0, 78285170                                                        | 12282094 | 是    | 通过 0 值区分 Null                                                                                | UInt32                                 |
| `CreationDate`           | 否      | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000       | -       | 否    | 不需要毫秒粒度，使用 DateTime                                                                     | DateTime                               |
| `Score`                  | 是      | -217, 34970                                                        | 3236    | 否    |                                                                                                   | Int32                                  |
| `ViewCount`              | 是      | 2, 13962748                                                        | 170867  | 否    |                                                                                                   | UInt32                                 |
| `Body`                   | 否      | -                                                                  | -       | 否    |                                                                                                   | String                                 |
| `OwnerUserId`            | 是      | -1, 4056915                                                        | 6256237 | 是    |                                                                                                   | Int32                                  |
| `OwnerDisplayName`       | 否      | -                                                                  | 181251  | 是    | 考虑 Null 为空字符串                                                                              | String                                 |
| `LastEditorUserId`       | 是      | -1, 9999993                                                        | 1104694 | 是    | 0 是未使用值，可用于 Null                                                                      | Int32                                  |
| `LastEditorDisplayName`  | 否      | -                                                                  | 70952   | 是    | 考虑 Null 为一个空字符串。测试 LowCardinality 未显示好处                                                | String                                 |
| `LastEditDate`           | 否      | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000       | -       | 否    | 不需要毫秒粒度，使用 DateTime                                                                     | DateTime                               |
| `LastActivityDate`       | 否      | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000       | -       | 否    | 不需要毫秒粒度，使用 DateTime                                                                     | DateTime                               |
| `Title`                  | 否      | -                                                                  | -       | 否    | 考虑 Null 为一个空字符串                                                                          | String                                 |
| `Tags`                   | 否      | -                                                                  | -       | 否    | 考虑 Null 为一个空字符串                                                                          | String                                 |
| `AnswerCount`            | 是      | 0, 518                                                             | 216     | 否    | 将 Null 和 0 视为同一值                                                                          | UInt16                                 |
| `CommentCount`           | 是      | 0, 135                                                             | 100     | 否    | 将 Null 和 0 视为同一值                                                                          | UInt8                                  |
| `FavoriteCount`          | 是      | 0, 225                                                             | 6       | 是    | 将 Null 和 0 视为同一值                                                                          | UInt8                                  |
| `ContentLicense`         | 否      | -                                                                  | 3       | 否    | LowCardinality 比 FixedString 更优                                                                  | LowCardinality(String)                 |
| `ParentId`               | 否      | -                                                                  | 20696028 | 是    | 考虑 Null 为一个空字符串                                                                          | String                                 |
| `CommunityOwnedDate`     | 否      | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000       | -       | 是    | 考虑将默认值设为 1970-01-01 用于 Null。 不需要毫秒粒度，使用 DateTime                             | DateTime                               |
| `ClosedDate`             | 否      | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                 | -       | 是    | 考虑将默认值设为 1970-01-01 用于 Null。 不需要毫秒粒度，使用 DateTime                             | DateTime                               |

:::note tip
确定列的类型依赖于理解其数字范围和唯一值的数量。要查找所有列的范围和不同值的数量，用户可以使用简单的查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议对数据的较小子集执行此操作，因为这可能会消耗资源。
:::

这导致以下优化后的架构（就类型而言）：

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
