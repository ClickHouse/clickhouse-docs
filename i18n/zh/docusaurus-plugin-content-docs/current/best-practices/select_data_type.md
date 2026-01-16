---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: '选择数据类型'
title: '选择数据类型'
description: '页面介绍如何在 ClickHouse 中选择数据类型'
keywords: ['数据类型']
doc_type: 'reference'
---

import NullableColumns from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse 查询性能的核心原因之一是其高效的数据压缩。磁盘上的数据越少，通过最小化 I/O 开销，查询和插入就越快。ClickHouse 的列式架构会自然地将相似数据相邻存放，使压缩算法和编解码器（codec）能够大幅减小数据体积。要最大化这些压缩收益，至关重要的是仔细选择合适的数据类型。

ClickHouse 中的压缩效率主要取决于三个因素：排序键、数据类型和 codec，这些都通过数据表的 schema 定义。选择最优的数据类型可以立即改善存储占用和查询性能。

一些简单直接的准则就可以显著优化 schema：

* **使用严格类型：** 始终为列选择正确的数据类型。数值和日期字段应使用合适的数值和日期类型，而不是通用的 String 类型。这可以确保过滤和聚合操作具有正确的语义。

* **避免使用 Nullable 列：** Nullable 列需要维护一列额外数据来跟踪空值，从而引入额外开销。仅在需要明确区分空字符串和 null 状态时才使用 Nullable。否则，通常使用默认值或等价的零值就足够了。关于为什么在非必要情况下应避免这种类型的更多信息，请参阅 [Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)。

* **最小化数值精度：** 在满足预期数据范围的前提下，选择位宽最小的数值类型。例如，如果不需要负值且数值范围可以落在 0–65535 之间，则应优先选择 [UInt16 而不是 Int32](/sql-reference/data-types/int-uint)。

* **优化日期和时间精度：** 选择能够满足查询需求的最粗粒度 Date 或 DateTime 类型。对于仅包含日期的字段，使用 Date 或 Date32；除非必须要毫秒或更高精度，否则应优先选择 DateTime 而不是 DateTime64。

* **利用 LowCardinality 和专用类型：** 对于唯一值少于约 10,000 的列，使用 LowCardinality 类型可以通过字典编码显著减少存储空间。同样，只有在列值严格为固定长度字符串（例如国家或货币代码）时才使用 FixedString；对于具有有限可能取值集合的列，应优先使用 Enum 类型，以实现高效存储并提供内置数据校验。

* **使用 Enum 进行数据校验：** Enum 类型可用于高效编码枚举类型。根据需要存储的唯一值数量，Enum 可以是 8 位或 16 位。如果你需要在写入时进行相关校验（未声明的值会被拒绝），或者希望执行利用 Enum 值自然顺序的查询，都应考虑使用该类型。例如，设想一个反馈列包含用户响应：Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3)。


## 示例 \{#example\}

ClickHouse 提供了内置工具来简化数据类型优化。例如，schema 推断可以自动识别初始类型。以以 Parquet 格式公开提供的 Stack Overflow 数据集为例，运行一个简单的 schema 推断，通过 [`DESCRIBE`](/sql-reference/statements/describe-table) 命令即可得到一个初始的、未优化的 schema。

:::note
默认情况下，ClickHouse 会将这些映射为等价的 Nullable 类型。之所以推荐这样做，是因为该 schema 只是基于部分行样本推断得到的。
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
请注意，下面我们使用通配符模式 *.parquet 来读取 stackoverflow/parquet/posts 文件夹中的所有文件。
:::

通过将前面定义的这些简单规则应用到我们的 posts 表，我们可以为每一列确定出一个最优的数据类型：


| 列                       | 数值类型 | 最小值、最大值                                                      | 唯一值      | NULL 值 | 注释                                                    | 已优化类型                                                                                                                                                        |
| ----------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 是    | 1, 8                                                         | 8        | 否      |                                                       | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 是的   | 0, 78285170                                                  | 12282094 | 是的     | 区分 Null 和 0 值                                         | UInt32                                                                                                                                                       |
| `CreationDate`          | 否    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 否      | 如果不需要毫秒级精度，请使用 DateTime                               | DateTime                                                                                                                                                     |
| `Score`                 | 是    | -217, 34970                                                  | 3236     | 否      |                                                       | Int32                                                                                                                                                        |
| `ViewCount`             | 是    | 2, 13962748                                                  | 170867   | 否      |                                                       | UInt32                                                                                                                                                       |
| `Body`                  | 否    | -                                                            | *        | 否      |                                                       | 字符串                                                                                                                                                          |
| `OwnerUserId`           | 是    | -1, 4056915                                                  | 6256237  | 是      |                                                       | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 否    | -                                                            | 181251   | 是      | 将 Null 视为空字符串                                         | 字符串                                                                                                                                                          |
| `LastEditorUserId`      | 是    | -1, 9999993                                                  | 1104694  | 是      | 0 是未使用的值，可用于表示 Null                                   | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 否    | *                                                            | 70952    | 是      | 将 Null 视为空字符串。已测试 LowCardinality，但未见收益                | 字符串                                                                                                                                                          |
| `LastEditDate`          | 否    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 否      | 如果不需要毫秒级精度，请使用 DateTime                               | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 否    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 否      | 如果不需要毫秒级精度，请使用 DateTime                               | DateTime                                                                                                                                                     |
| `标题`                    | 否    | -                                                            | *        | 否      | 将 Null 视作空字符串                                         | 字符串                                                                                                                                                          |
| `标签`                    | 否    | -                                                            | *        | 否      | 将 Null 视作空字符串                                         | String                                                                                                                                                       |
| `AnswerCount`           | 是    | 0, 518                                                       | 216      | 否      | 将 Null 和 0 视为相同                                       | UInt16                                                                                                                                                       |
| `CommentCount`          | 是    | 0, 135                                                       | 100      | 否      | 将 Null 与 0 视为等同                                       | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 是    | 0, 225                                                       | 6        | 是      | 将 Null 与 0 视为相同                                       | UInt8                                                                                                                                                        |
| `ContentLicense`        | 否    | -                                                            | 3        | 否      | LowCardinality 性能优于 FixedString                       | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 否    | *                                                            | 20696028 | 是      | 将 Null 视为空字符串                                         | 字符串                                                                                                                                                          |
| `CommunityOwnedDate`    | 否    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 是      | 对 Null 值建议使用默认日期 1970-01-01。不需要毫秒级精度，请使用 DateTime。    | DateTime                                                                                                                                                     |
| `ClosedDate`            | 否    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 是      | 对于 Null 值可考虑使用默认值 1970-01-01。无需毫秒级精度，使用 DateTime 类型即可 | DateTime                                                                                                                                                     |

:::note 提示
确定一列的数据类型依赖于理解其数值范围以及唯一值的数量。要查找所有列的取值范围和不同值的数量，你可以使用简单查询 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`。我们建议在较小的数据子集上执行该操作，因为这可能会比较耗资源。
:::

这将得到如下在类型上经过优化的模式：

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


## 避免 Nullable 列 \\{#avoid-nullable-columns\\}

<NullableColumns />