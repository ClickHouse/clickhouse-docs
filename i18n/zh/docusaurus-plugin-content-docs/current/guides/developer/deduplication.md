---
slug: /guides/developer/deduplication
sidebar_label: '去重策略'
sidebar_position: 3
description: '当你需要频繁执行 upsert、update 和 delete 操作时，可使用去重功能。'
title: '去重策略'
keywords: ['去重策略', '数据去重', 'upsert', 'update 和 delete', '开发者指南']
doc_type: 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';

# 去重策略 {#deduplication-strategies}

**去重**是指***删除数据集中重复行***的过程。在 OLTP 数据库中，这很容易实现，因为每一行都有唯一的主键——但代价是写入速度较慢。每次插入前都需要先查找该主键，如果已存在则需要进行替换。

ClickHouse 在数据写入方面针对速度进行了优化。存储文件是不可变的，并且 ClickHouse 在插入一行之前不会检查是否已经存在相同的主键——因此去重需要多做一些工作。这也意味着去重不是即时完成的，而是**最终完成的**（eventual），这会带来一些副作用：

- 在任意时刻，你的表中仍然可能存在重复数据（具有相同排序键的行）
- 实际删除重复行是在数据分片（parts）合并过程中发生的
- 你的查询需要能够处理可能存在的重复数据

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouse 提供关于去重和许多其他主题的免费培训。[Deleting and Updating Data 培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)是一个很好的起点。|

</div>

## 去重选项 {#options-for-deduplication}

在 ClickHouse 中，通过以下表引擎实现去重：

1. `ReplacingMergeTree` 表引擎：使用该表引擎时，在合并过程中会删除具有相同排序键的重复行。`ReplacingMergeTree` 是模拟 upsert 行为的一个不错选择（当您希望查询返回最后插入的那一行时）。

2. 折叠行：`CollapsingMergeTree` 和 `VersionedCollapsingMergeTree` 表引擎采用的逻辑是“取消”一条现有行并插入一条新行。与 `ReplacingMergeTree` 相比，它们实现起来更复杂，但您的查询和聚合可以写得更简单，而无需担心数据是否已经完成合并。这两种表引擎在您需要频繁更新数据时非常有用。

下面我们将演示这两种技术的使用方法。欲了解更多详情，请查看我们免费的按需培训模块 [Deleting and Updating Data 培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用 ReplacingMergeTree 实现 Upsert {#using-replacingmergetree-for-upserts}

来看一个简单示例：一张表中包含 Hacker News 的评论，并有一个 `views` 列表示某条评论被查看的次数。假设在文章发布时我们插入一条新记录，并且之后如果浏览量增加，每天为该评论插入一条包含最新总浏览次数的新记录来完成 upsert 操作：

```sql
CREATE TABLE hackernews_rmt (
    id UInt32,
    author String,
    comment String,
    views UInt64
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (author, id)
```

我们来插入两行数据：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新 `views` 列，请插入一条具有相同主键的新记录（注意 `views` 列的新值）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', '这是帖子 #1', 100),
   (2, 'ch_fan', '这是帖子 #2', 200)
```

该表现在包含 4 行数据：

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是帖子 #2 │     0 │
│  1 │ ricardo │ 这是帖子 #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是帖子 #2 │   200 │
│  1 │ ricardo │ 这是帖子 #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

上面输出中的两个独立框展示了在后台运作的两个部分——这些数据尚未被合并，因此重复行也尚未被移除。让我们在 `SELECT` 查询中使用 `FINAL` 关键字，对查询结果进行逻辑合并：

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ 这是第 2 条帖子  │   200 │
│  1 │ ricardo │ 这是第 1 条帖子  │   100 │
└────┴─────────┴─────────────────┴───────┘
```

结果只有 2 行，并且最后插入的那一行就是被返回的那一行。

:::note
如果数据量较小，使用 `FINAL` 还可以接受。但如果你要处理的是海量数据，
使用 `FINAL` 可能就不是最佳选择了。下面我们来讨论一种更好的方式，
用于查找某一列的最新值。
:::

### 避免使用 FINAL {#avoiding-final}

我们再次更新这两条唯一记录的 `views` 列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

该表现在有 6 行，这是因为真正的合并尚未发生（目前只有在我们使用 `FINAL` 时才会在查询时进行合并）。

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   250 │
│  1 │ ricardo │ This is post #1 │   150 │
└────┴─────────┴─────────────────┴───────┘
```

我们可以不用 `FINAL`，而是利用一些业务逻辑——我们知道 `views` 列的值始终递增，因此可以在按所需列分组后，使用 `max` 函数选出值最大的那一行：

```sql
SELECT
    id,
    author,
    comment,
    max(views)
FROM hackernews_rmt
GROUP BY (id, author, comment)
```

```response
┌─id─┬─author──┬─comment─────────┬─max(views)─┐
│  2 │ ch_fan  │ 这是第 2 篇帖子 │        250 │
│  1 │ ricardo │ 这是第 1 篇帖子 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

如上面查询所示那样进行分组，在查询性能方面实际上可能比使用 `FINAL` 关键字更高效。

我们的[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse\&utm_medium=docs)在此示例基础上进行了扩展，其中包括如何将 `version` 列与 `ReplacingMergeTree` 一起使用。

## 使用 CollapsingMergeTree 处理频繁的列更新 {#using-collapsingmergetree-for-updating-columns-frequently}

更新一列意味着删除一条现有行并用新值替换它。正如前文所示，这类变更在 ClickHouse 中是*最终才生效的*——会在合并过程中完成。如果你需要更新大量行，与其使用 `ALTER TABLE..UPDATE`，往往更高效的做法是直接将新数据与现有数据一并插入。我们可以添加一列，用于标记数据是过期的还是最新的，而且其实已经有一个表引擎很好地实现了这种行为，特别是它还能自动为你删除过期数据。下面来看它是如何工作的。

假设我们通过一个外部系统跟踪每条 Hacker News 评论的浏览次数，并且每隔几个小时就将这些数据推送到 ClickHouse。我们希望旧行被删除，新行能够表示每条 Hacker News 评论的最新状态。我们可以使用 `CollapsingMergeTree` 来实现这种行为。

让我们定义一个表来存储浏览次数：

```sql
CREATE TABLE hackernews_views (
    id UInt32,
    author String,
    views UInt64,
    sign Int8
)
ENGINE = CollapsingMergeTree(sign)
PRIMARY KEY (id, author)
```

请注意，`hackernews_views` 表中有一个名为 sign 的 `Int8` 列，我们称之为 **sign** 列。sign 列的名称可以任意命名，但数据类型必须是 `Int8`，并且请注意，该列名被传递给了 `CollapsingMergeTree` 表的构造函数。

`CollapsingMergeTree` 表中的 sign 列有什么作用？它表示该行的*状态*，并且 sign 列的取值只能是 1 或 -1。其工作机制如下：

* 如果两行具有相同的主键（或者如果排序键与主键不同，则具有相同的排序键），但 sign 列的值不同，那么最后插入、且 sign 为 +1 的那一行会成为状态行，而其余行会相互抵消
* 在合并过程中，相互抵消的行会被删除
* 没有匹配对的行会被保留

让我们向 `hackernews_views` 表中添加一行。由于这是此主键对应的唯一一行，我们将其状态设置为 1：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们要更改 `views` 列。需要插入两行记录：一行用于抵消现有行，另一行表示该行的新状态：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

该表现在包含 3 行，主键为 `(123, 'ricardo')`：

```sql
SELECT *
FROM hackernews_views
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │   -1 │
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │    1 │
└─────┴─────────┴───────┴──────┘
```

请注意，添加 `FINAL` 将返回当前状态的那一行：

```sql
SELECT *
FROM hackernews_views
FINAL
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
```

当然，不推荐在大表上使用 `FINAL`。

:::note
在我们的示例中传入的 `views` 列的值其实并不是必需的，也不需要与旧行当前的 `views` 值相匹配。实际上，你只需要主键和 -1 就可以作废一行记录：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```

:::

## 来自多个线程的实时更新 {#real-time-updates-from-multiple-threads}

在 `CollapsingMergeTree` 表中，行通过一个符号列（sign 列）彼此抵消，一行的状态由最后插入的那一行决定。但是，如果你从不同的线程插入行，而且这些行可能乱序插入，就会出现问题。在这种情况下，使用“最后”一行的方法是行不通的。

这就是 `VersionedCollapsingMergeTree` 派上用场的场景——它与 `CollapsingMergeTree` 一样会折叠（合并）行，但它不是保留最后插入的那一行，而是保留你指定的版本列中值最高的那一行。

来看一个例子。假设我们想跟踪自己在 Hacker News 上评论的浏览次数，而且这些数据会被频繁更新。我们希望报表使用最新的值，而不需要强制执行或等待合并操作。我们从一个与 `CollapsedMergeTree` 类似的表开始，只是额外添加了一列，用于存储该行状态的版本信息：

```sql
CREATE TABLE hackernews_views_vcmt (
    id UInt32,
    author String,
    views UInt64,
    sign Int8,
    version UInt32
)
ENGINE = VersionedCollapsingMergeTree(sign, version)
PRIMARY KEY (id, author)
```

请注意，该表使用 `VersionsedCollapsingMergeTree` 作为引擎，并传入了**符号列（sign column）**和**版本列（version column）**。该表的工作机制如下：

* 删除每一对主键和版本相同但符号不同的行
* 行的插入顺序无关紧要
* 请注意，如果版本列不是主键的一部分，ClickHouse 会自动将其作为最后一个字段隐式添加到主键中

在编写查询时，你需要使用相同的逻辑——按主键进行分组，并通过合适的条件来排除那些已经被取消但尚未被删除的行。让我们向 `hackernews_views_vcmt` 表中添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新其中两行并删除一行。要作废一行记录，请务必包含其之前的版本号（因为它是主键的一部分）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

我们将再次运行之前的那个查询，该查询会根据 `sign` 列的符号巧妙地进行加减运算：

```sql
SELECT
    id,
    author,
    sum(views * sign)
FROM hackernews_views_vcmt
GROUP BY (id, author)
HAVING sum(sign) > 0
ORDER BY id ASC
```

结果是两行数据：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

强制触发表合并：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

结果中应只包含两行：

```sql
SELECT *
FROM hackernews_views_vcmt
```

```response
┌─id─┬─author──┬─views─┬─sign─┬─version─┐
│  1 │ ricardo │    50 │    1 │       2 │
│  3 │ kenny   │  1000 │    1 │       2 │
└────┴─────────┴───────┴──────┴─────────┘
```

当你希望在从多个客户端和/或线程插入数据时实现去重时，`VersionedCollapsingMergeTree` 表非常实用。

## 为什么我的行没有被去重？ {#why-arent-my-rows-being-deduplicated}

插入的行可能没有被去重的一个原因，是在 `INSERT` 语句中使用了非幂等函数或表达式。例如，如果你插入的行中包含列 `createdAt DateTime64(3) DEFAULT now()`，那么这些行一定是唯一的，因为每一行的 `createdAt` 列默认值都是唯一的。MergeTree / ReplicatedMergeTree 表引擎不会对这些行进行去重，因为每一行插入时都会生成唯一的校验和。

在这种情况下，你可以为每一批行指定自己的 `insert_deduplication_token`，以确保对同一批数据进行多次插入时，不会导致相同行被重复插入。有关如何使用该设置的更多详细信息，请参阅 [`insert_deduplication_token` 的文档](/operations/settings/settings#insert_deduplication_token)。
