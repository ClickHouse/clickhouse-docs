---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: '选择数据类型'
title: '选择数据类型'
description: '本页面介绍如何在 ClickHouse 中选择数据类型'
keywords: ['数据类型']
doc_type: 'reference'
---

import NullableColumns from '@site/docs/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse 查询性能的核心原因之一是其高效的数据压缩。磁盘上的数据越少，通过最小化 I/O 开销即可实现更快的查询和插入。ClickHouse 的列式架构天然会将相似数据相邻存放，使压缩算法和编解码器能够大幅减少数据大小。要最大化这些压缩收益，必须谨慎选择合适的数据类型。

ClickHouse 中的压缩效率主要取决于三个因素：排序键、数据类型和编解码器，这些都通过表结构进行定义。选择最优的数据类型可以立刻改进存储占用和查询性能。

一些简单直接的准则就能显著优化表结构：

* **使用严格类型：** 始终为列选择正确的数据类型。数值和日期字段应使用相应的数值和日期类型，而不是通用的 String 类型。这样可以在过滤和聚合时保证正确的语义。

* **避免可为空列：** 可为空列会通过维护单独的列来跟踪空值，从而引入额外开销。只有在确实需要区分空字符串和 null 状态时才使用 Nullable。否则，默认值或零等价值通常已经足够。关于为何应避免不必要地使用此类型的更多信息，请参阅 [Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)。

* **最小化数值精度：** 在仍能容纳预期数据范围的前提下，选择位宽尽可能小的数值类型。例如，如果不需要负值且数值范围在 0–65535 之内，则应优先选择 [UInt16 而非 Int32](/sql-reference/data-types/int-uint)。

* **优化日期和时间精度：** 选择能满足查询需求的、粒度尽可能粗的 date 或 datetime 类型。仅日期字段使用 Date 或 Date32，并优先选择 DateTime 而不是 DateTime64，除非确实需要毫秒或更高时间精度。

* **利用 LowCardinality 和特化类型：** 对于唯一值少于约 10,000 的列，使用 LowCardinality 类型可以通过字典编码显著减少存储。同样，仅在列值严格为定长字符串（例如国家或货币代码）时使用 FixedString；对于取值集合有限的列，优先使用 Enum 类型，以实现高效存储和内置数据校验。

* **使用 Enum 进行数据校验：** Enum 类型可以用于高效编码枚举类型。根据需要存储的唯一值数量，Enum 可以是 8 位或 16 位。如果你需要在插入时进行关联校验（未声明的值会被拒绝），或希望执行利用 Enum 值自然顺序的查询，请考虑使用它。例如，设想一个反馈列包含用户响应 Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3)。


## 示例 {#example}

ClickHouse 提供了内置工具来简化类型优化。例如,架构推断可以自动识别初始类型。以公开可用的 Parquet 格式 Stack Overflow 数据集为例。通过 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令运行简单的架构推断,可以获得初始的未优化架构。

:::note
默认情况下,ClickHouse 会将这些类型映射为等效的 Nullable 类型。由于架构仅基于部分行样本,因此这是推荐的做法。
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
请注意,下面我们使用 glob 模式 \*.parquet 来读取 stackoverflow/parquet/posts 文件夹中的所有文件。
:::

通过将我们之前的简单规则应用于 posts 表,我们可以为每个列确定最优类型:


| 列                       | 是否为数值型 | 最小值、最大值                                                      | 唯一值      | NULL 值 | 注释                                                   | 优化后类型                                                                                                                                                        |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 是      | 1, 8                                                         | 8        | 否      |                                                      | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是      | 0, 78285170                                                  | 12282094 | 是      | 区分 Null 和 0                                          | UInt32                                                                                                                                                       |
| `CreationDate`          | 否      | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 否      | 如果不需要毫秒级精度，请使用 DateTime                              | DateTime                                                                                                                                                     |
| `Score`                 | 是      | -217, 34970                                                  | 3236     | 否      |                                                      | Int32                                                                                                                                                        |
| `ViewCount`             | 是的     | 2, 13962748                                                  | 170867   | 否      |                                                      | UInt32                                                                                                                                                       |
| `Body`                  | 否      | -                                                            | *        | 否      |                                                      | 字符串                                                                                                                                                          |
| `OwnerUserId`           | 是      | -1, 4056915                                                  | 6256237  | 是      |                                                      | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 否      | -                                                            | 181251   | 是      | 将 Null 视作空字符串                                        | String                                                                                                                                                       |
| `LastEditorUserId`      | 是      | -1, 9999993                                                  | 1104694  | 是      | 0 是一个未被占用的值，可用于表示 NULL                               | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 否      | *                                                            | 70952    | 是      | 将 Null 视为空字符串。已测试 LowCardinality，未见收益                | String                                                                                                                                                       |
| `LastEditDate`          | 否      | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 否      | 如果不需要毫秒级精度，请使用 DateTime                              | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 否      | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 否      | 如果不需要毫秒级粒度，则使用 DateTime                              | DateTime                                                                                                                                                     |
| `标题`                    | 否      | -                                                            | *        | 否      | 将 Null 视作空字符串                                        | String                                                                                                                                                       |
| `标签`                    | 否      | -                                                            | *        | 否      | 将 Null 视为空字符串                                        | 字符串                                                                                                                                                          |
| `AnswerCount`           | 是      | 0, 518                                                       | 216      | 否      | 将 Null 与 0 视为相同                                      | UInt16                                                                                                                                                       |
| `CommentCount`          | 是的     | 0, 135                                                       | 100      | 否      | 将 Null 与 0 视为相同                                      | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 是      | 0, 225                                                       | 6        | 是的     | 将 Null 与 0 视为等同                                      | UInt8                                                                                                                                                        |
| `ContentLicense`        | 否      | -                                                            | 3        | 否      | LowCardinality 的性能优于 FixedString                     | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 否      | *                                                            | 20696028 | 是      | 将 Null 视为空字符串                                        | 字符串                                                                                                                                                          |
| `CommunityOwnedDate`    | 否      | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 是      | 对于 Null 值使用默认日期 1970-01-01。无需毫秒级精度，请使用 DateTime      | DateTime                                                                                                                                                     |
| `ClosedDate`            | 否      | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 是      | 对于 Null 值可以考虑使用默认值 1970-01-01。不需要毫秒级精度时，请使用 DateTime | DateTime                                                                                                                                                     |

:::note 提示
确定列的数据类型依赖于了解其数值范围以及唯一值的数量。要查找所有列的数值范围和不同取值的数量，用户可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在较小的数据子集上执行该操作，因为这可能开销较大。
:::

这会生成如下在类型方面经过优化的表结构：

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


## 避免使用可为空列 {#avoid-nullable-columns}

<NullableColumns />
