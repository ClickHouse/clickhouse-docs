---
slug: /guides/developer/deduplication
sidebar_label: 去重策略
sidebar_position: 3
description: 在需要频繁进行 upsert、更新和删除时使用去重。
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';


# 去重策略

**去重** 指的是 ***移除数据集中的重复行*** 的过程。在 OLTP 数据库中，由于每一行都有一个唯一的主键，因此可以很容易地实现这一点，但代价是插入速度降低。每插入一行都需要首先进行搜索，如果找到则需要进行替换。

ClickHouse 在数据插入方面是为了速度而构建的。存储文件是不可变的，ClickHouse 在插入一行之前不会检查是否存在重复的主键，因此去重需要更多的工作。这也意味着去重不是立即完成的，而是 **最终** 完成的，这带来了一些副作用：

- 在任何时间点，你的表中仍然可能有重复（具有相同排序键的行）
- 实际的重复行移除发生在分片合并期间
- 你的查询需要考虑到可能存在重复的情况

<div class='transparent-table'>

|||
|------|----|
|<img src={deduplication} class="image" alt="Cassandra logo" style={{width: '16rem', 'background-color': 'transparent'}}/>|ClickHouse 提供免费的去重以及其他主题的培训。 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 是一个很好的起点。|

</div>

## 去重的选项 {#options-for-deduplication}

ClickHouse 使用以下表引擎来实现去重：

1. `ReplacingMergeTree` 表引擎：使用该表引擎，具有相同排序键的重复行在合并时会被移除。`ReplacingMergeTree` 是模拟 upsert 行为（即希望查询返回最后插入的行）的良好选择。

2. 行的折叠：`CollapsingMergeTree` 和 `VersionedCollapsingMergeTree` 表引擎使用一种逻辑，其中现有行被“取消”，并插入一行新行。它们比 `ReplacingMergeTree` 的实现更复杂，但你的查询和聚合可以更简单，因为不需要担心数据是否已合并。这两个表引擎在你需要频繁更新数据时非常有用。

我们将在下面讨论这两种技术。如需更多详细信息，请查看我们免费的按需 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用 ReplacingMergeTree 进行 Upserts {#using-replacingmergetree-for-upserts}

让我们看一个简单的例子，表中包含 Hacker News 评论，以及表示评论被查看次数的 views 列。假设我们在文章发布时插入新行，并在每天上插入新行，以表示总的查看次数（如果值增加的话）：

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

让我们插入两个行：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新 `views` 列，插入一行具有相同主键的新行（注意 `views` 列的新值）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

现在表中有 4 行：

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

上面输出中的两个分离框演示了后台的两个部分——这些数据尚未合并，因此重复行尚未被移除。我们使用 `SELECT` 查询中的 `FINAL` 关键字，这会导致查询结果的逻辑合并：

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

结果只有 2 行，而最后插入的行是返回的行。

:::note
如果数据量较小，使用 `FINAL` 可以正常工作。如果处理大量数据，使用 `FINAL` 可能不是最佳选择。让我们讨论一种更好的选择来查找列的最新值……
:::

### 避免使用 FINAL {#avoiding-final}

让我们再次更新两个唯一行的 `views` 列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

此时表中有 6 行，因为实际合并尚未发生（只有在使用 `FINAL` 时进行的查询时合并）。

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

我们可以用一些业务逻辑来代替使用 `FINAL` - 我们知道 `views` 列总是递增的，因此我们可以在按所需列分组后使用 `max` 函数选择具有最大值的行：

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
│  2 │ ch_fan  │ This is post #2 │        250 │
│  1 │ ricardo │ This is post #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

如上所示的分组实际上在查询性能上可能比使用 `FINAL` 更有效。

我们的 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 扩展了该示例，包括如何与 `ReplacingMergeTree` 一起使用 `version` 列。

## 使用 CollapsingMergeTree 频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新一列涉及删除现有行并用新值替换。正如你所见，这种类型的变更在 ClickHouse 中是 _最终_ 实现的 - 在合并期间。如果你有很多行需要更新，避免使用 `ALTER TABLE..UPDATE` 而是直接将新数据插入到现有数据旁边可能会更高效。我们可以添加一列来表示数据是过时的还是新的……实际上已经有一个表引擎很好地实现了此行为，特别是考虑到它会为你自动删除过时的数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪 Hacker News 评论的查看次数，并且每隔几个小时将数据推送到 ClickHouse。我们希望旧行被删除，而新行表示每个 Hacker News 评论的新状态。我们可以使用 `CollapsingMergeTree` 来实现这种行为。

让我们定义一个表以存储查看次数：

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

请注意 `hackernews_views` 表有一列 `Int8` 类型的列命名为 sign，这被称为 **sign** 列。sign 列的名称是任意的，但 `Int8` 数据类型是必须的，请注意列名被传递给 `CollapsingMergeTree` 表的构造函数。

`CollapsingMergeTree` 表的 sign 列是什么？它表示行的 _状态_，并且 sign 列只能是 1 或 -1。它的工作原理如下：

- 如果两行具有相同主键（如果排序顺序与主键不同），但 sign 列的值不同，那么最后插入的带有 +1 的行会成为状态行，而其他行相互取消
- 在合并期间，相互取消的行会被删除
- 没有匹配对的行会被保留

现在让我们向 `hackernews_views` 表中添加一行。由于它是此主键的唯一行，因此我们将其状态设置为 1：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们想要更改 views 列。你插入两行：一行取消现有行，另一行包含行的新状态：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

此时表中有 3 行，主键为 `(123, 'ricardo')`：

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

请注意，添加 `FINAL` 将返回当前状态行：

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

但显然，对于大型表，不推荐使用 `FINAL`。

:::note
在我们的示例中，`views` 列所传入的值实际上并不是必需的，也不必与旧行的当前 `views` 值匹配。实际上，你可以仅用主键和 -1 来取消一行：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 多线程的实时更新 {#real-time-updates-from-multiple-threads}

使用 `CollapsingMergeTree` 表，行通过 sign 列相互取消，并且行的状态由最后插入的行确定。但如果你从不同线程插入行，行的插入可能会出现顺序问题。这种情况下使用“最后”一行并不起作用。

这就是 `VersionedCollapsingMergeTree` 的用武之地 - 它与 `CollapsingMergeTree` 一样折叠行，但是它保留具有最高值的由你指定的 version 列的行。

让我们来看一个例子。假设我们想跟踪 Hacker News 评论的查看次数，并且数据更新频繁。我们希望报表使用最新的值，而无需强制或等待合并。我们从一个类似于 `CollapsedMergeTree` 的表开始，除了我们添加一列来存储行的状态版本：

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

请注意该表使用 `VersionedCollapsingMergeTree` 作为引擎，并传入 **sign 列** 和 **version 列**。它的工作原理如下：

- 它删除每对具有相同主键和版本并且 sign 不同的行
- 插入行的顺序无关紧要
- 请注意，如果版本列不是主键的一部分，ClickHouse 会将其隐式添加到主键作为最后一个字段

编写查询时使用相同的逻辑 - 按主键分组并使用巧妙的逻辑避免还未删除的被取消的行。让我们向 `hackernews_views_vcmt` 表中添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新两行并删除其中一行。要取消一行，请确保包含之前的版本号（因为它是主键的一部分）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

我们将运行与之前相同的查询，巧妙地根据 sign 列添加和减去值：

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

结果是两行：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

我们强制进行表合并：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

结果中应该只有两行：

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

当你想在插入来自多个客户端和/或线程的行时，实现去重时，`VersionedCollapsingMergeTree` 表是非常有用的。

## 为什么我的行没有被去重？ {#why-arent-my-rows-being-deduplicated}

行插入后未去重的一个原因是，如果你在 `INSERT` 语句中使用了非幂等的函数或表达式。例如，如果你用列 `createdAt DateTime64(3) DEFAULT now()` 插入行，则你的行会保证唯一，因为每行的 `createdAt` 列将具有唯一的默认值。MergeTree / ReplicatedMergeTree 表引擎将不知道如何去重这些行，因为每个插入的行都会产生唯一的校验和。

在这种情况下，你可以为每批行指定自己的 `insert_deduplication_token`，以确保相同批次的多次插入不会导致同样的行被重新插入。有关如何使用此设置的更多详细信息，请参阅 [关于 `insert_deduplication_token` 的文档](/operations/settings/settings#insert_deduplication_token)。
