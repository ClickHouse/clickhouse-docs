---
'slug': '/best-practices/select-data-types'
'sidebar_position': 10
'sidebar_label': '选择数据类型'
'title': '选择数据类型'
'description': '页面描述如何在 ClickHouse 中选择数据类型'
---

import NullableColumns from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse 查询性能的一个核心原因是其高效的数据压缩。磁盘上的数据更少通过最小化 I/O 开销来实现更快的查询和插入。 ClickHouse 的列式架构自然将相似数据相邻排列，使压缩算法和编解码器能够显著减少数据大小。为了最大限度地利用这些压缩效益，务必仔细选择合适的数据类型。

在 ClickHouse 中，压缩效率主要取决于三个因素：排序键、数据类型和编解码器，这些都通过表架构定义。选择最佳数据类型可以在存储和查询性能上立即获得改善。

一些简单的指导方针可以显著增强架构：

* **使用严格类型：** 始终为列选择正确的数据类型。数字和日期字段应使用适当的数字和日期类型，而不是通用的字符串类型。这可以确保过滤和聚合时逻辑的正确性。

* **避免 Nullable 列：** Nullable 列通过保持单独的列来跟踪空值，从而引入额外的开销。只有在明确需要区分空状态和 null 状态时才使用 Nullable。否则，默认值或零等效值通常就足够了。有关为什么应避免此类型的更多信息，请参见 [Avoid Nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)。

* **最小化数字精度：** 选择位宽最小的数字类型，以便仍然能够容纳预期的数据范围。例如，如果不需要负值并且范围在 0–65535 之间，则选择 [UInt16 over Int32](/sql-reference/data-types/int-uint)。

* **优化日期和时间精度：** 选择满足查询要求的最粗粒度的日期或日期时间类型。日期字段只使用 Date 或 Date32，对于 DateTime 字段，应优先选择 DateTime 而不是 DateTime64，除非需要毫秒级或更精细的精度。

* **利用 LowCardinality 和专用类型：** 对于唯一值少于大约 10,000 的列，使用 LowCardinality 类型可以通过字典编码显著减少存储。同样，仅当列值是严格固定长度的字符串（例如国家或货币代码）时才使用 FixedString，并且对具有有限可能值集的列，优先使用 Enum 类型，以实现有效存储和内置数据验证。

* **数据验证的枚举类型：** Enum 类型可以有效编码枚举类型。根据需要存储的唯一值数量，枚举可以是 8 位或 16 位。如果在插入时需要关联验证（未声明的值将被拒绝）或希望执行利用 Enum 值中自然顺序的查询（例如想象一个包含用户响应的反馈列 Enum(':(' = 1, ':|' = 2, ':)' = 3），考虑使用此功能。

## 示例 {#example}

ClickHouse 提供内置工具来简化类型优化。例如，架构推断可以自动识别初始类型。考虑 Stack Overflow 数据集，其以 Parquet 格式公开提供。通过 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令运行简单的架构推断可以得到初步的非优化架构。

:::note
默认情况下，ClickHouse 将这些映射为相应的 Nullable 类型。这是偏好的，因为架构仅基于行的样本。
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
请注意，我们下面使用 glob 模式 *.parquet 来读取 stackoverflow/parquet/posts 文件夹中的所有文件。
:::

通过将我们早期的简单规则应用于我们的 posts 表，我们可以为每一列确定最佳类型：

| 列                    | 是否数字 | 最小值，最大值                                             | 唯一值 | Nulls | 评论                                                                                      | 优化类型                           |
|----------------------|----------|----------------------------------------------------------|--------|-------|------------------------------------------------------------------------------------------|-----------------------------------|
| `PostTypeId`         | 是       | 1, 8                                                     | 8      | 否    |                                                                                          | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`   | 是       | 0, 78285170                                              | 12282094 | 是    | 区分 Null 与 0 值                                                                         | UInt32                           |
| `CreationDate`       | 否       | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | -      | 否    | 不需要毫秒粒度，使用 DateTime                                                            | DateTime                         |
| `Score`              | 是       | -217, 34970                                              | 3236   | 否    |                                                                                          | Int32                            |
| `ViewCount`          | 是       | 2, 13962748                                             | 170867 | 否    |                                                                                          | UInt32                           |
| `Body`               | 否       | -                                                        | -      | 否    |                                                                                          | String                           |
| `OwnerUserId`       | 是       | -1, 4056915                                             | 6256237 | 是    |                                                                                          | Int32                            |
| `OwnerDisplayName`   | 否       | -                                                        | 181251 | 是    | 考虑将 Null 视为空字符串                                                                  | String                           |
| `LastEditorUserId`   | 是       | -1, 9999993                                             | 1104694 | 是    | 0 作为未使用的值，可用于 Nulls                                                           | Int32                            |
| `LastEditorDisplayName` | 否    | -                                                        | 70952  | 是    | 考虑将 Null 视为一个空字符串。经过测试，LowCardinality 没有收益                           | String                           |
| `LastEditDate`       | 否       | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -      | 否    | 不需要毫秒粒度，使用 DateTime                                                            | DateTime                         |
| `LastActivityDate`   | 否       | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | -      | 否    | 不需要毫秒粒度，使用 DateTime                                                            | DateTime                         |
| `Title`              | 否       | -                                                        | -      | 否    | 考虑将 Null 视为一个空字符串                                                              | String                           |
| `Tags`               | 否       | -                                                        | -      | 否    | 考虑将 Null 视为一个空字符串                                                              | String                           |
| `AnswerCount`        | 是       | 0, 518                                                  | 216    | 否    | 考虑将 Null 与 0 视为相同                                                                  | UInt16                           |
| `CommentCount`       | 是       | 0, 135                                                  | 100    | 否    | 考虑将 Null 与 0 视为相同                                                                  | UInt8                            |
| `FavoriteCount`      | 是       | 0, 225                                                  | 6      | 是    | 考虑将 Null 与 0 视为相同                                                                  | UInt8                            |
| `ContentLicense`     | 否       | -                                                        | 3      | 否    | LowCardinality 性能优于 FixedString                                                        | LowCardinality(String)           |
| `ParentId`           | 否       | -                                                        | 20696028 | 是   | 考虑将 Null 视为一个空字符串                                                              | String                           |
| `CommunityOwnedDate` | 否       | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -      | 是    | 考虑将 Null 的默认值设为 1970-01-01。 不需要毫秒粒度，使用 DateTime                     | DateTime                         |
| `ClosedDate`         | 否       | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000     | -      | 是    | 考虑将 Null 的默认值设为 1970-01-01。 不需要毫秒粒度，使用 DateTime                     | DateTime                         |

:::note tip
确定某列的类型需要了解其数字范围和唯一值数量。用户可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical` 来查找所有列的范围和不同值的数量。我们建议在较小的数据子集上执行此操作，因为这可能会比较昂贵。
:::

这将导致以下优化后的架构（就类型而言）：

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
