import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';

# 去重策略

**去重** 是指 ***移除数据集中的重复行*** 的过程。在 OLTP 数据库中，由于每行都有一个唯一的主键，因此可以轻松完成这一操作，但代价是插入速度会变慢。每插入一行，都需要先进行查找，如果找到则需要替换。

ClickHouse 在数据插入方面以速度为重。存储文件是不可变的，ClickHouse 在插入一行之前不会检查是否存在该主键，因此去重需要更多的努力。这也意味着去重不是即时的，它是 **最终** 的，这有几个副作用：

- 随时你的表中可能仍然存在重复项（具有相同排序键的行）
- 重复行的实际移除在分片合并期间进行
- 你的查询需要允许存在重复项的可能性

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="去重标志" size="sm"/>|ClickHouse 提供免费的去重及其他主题的培训。 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 是一个很好的起点.|

</div>

## 去重选项 {#options-for-deduplication}

ClickHouse 通过以下表引擎实现去重：

1. `ReplacingMergeTree` 表引擎：使用此表引擎，具有相同排序键的重复行在合并时被移除。`ReplacingMergeTree` 是模拟插入更新行为（即希望查询返回最后插入的行）的一个好选择。

2. 合并行：`CollapsingMergeTree` 和 `VersionedCollapsingMergeTree` 表引擎使用一种逻辑，其中现有行被“取消”，并插入新行。它们比 `ReplacingMergeTree` 更复杂，但你的查询和聚合可以更简单，无需担心数据是否已经合并。这两个表引擎在你需要频繁更新数据时非常有用。

我们将在下文中详细介绍这两种技术。要获取更多详细信息，请查看我们的免费点播 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用 ReplacingMergeTree 进行插入更新 {#using-replacingmergetree-for-upserts}

让我们看一个简单示例，其中表包含 Hacker News 评论，同时带有表示评论被查看次数的 views 列。假设我们在文章发布时插入一行，并在每天插入一行以更新总查看次数（如果该值增加）：

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

现在插入两行：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新 `views` 列，请插入一行具有相同主键的新行（注意 `views` 列的新值）：

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

上面输出中各个方框展示了幕后两个部分 - 这些数据尚未合并，因此重复行尚未移除。让我们在 `SELECT` 查询中使用 `FINAL` 关键字，这将导致查询结果的逻辑合并：

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

结果仅包含 2 行，最后插入的行是返回的行。

:::note
如果数据量较少，使用 `FINAL` 可以正常工作。如果你处理大量数据，使用 `FINAL` 可能不是最佳选择。让我们讨论一个更好的选择来查找列的最新值...
:::

### 避免使用 FINAL {#avoiding-final}

现在让我们再次更新两个唯一行的 `views` 列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

现在表中有 6 行，因为实际的合并尚未发生（只有在使用 `FINAL` 时的查询时合并）。

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

不使用 `FINAL`，我们使用一些商业逻辑 - 我们知道 `views` 列始终在增加，因此我们可以选择最大值的行，使用 `max` 函数，并按所需列分组：

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

如上所示的分组实际上可以比使用 `FINAL` 关键字更高效（在查询性能方面）。

我们的 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 扩展了这个示例，包括如何使用 `ReplacingMergeTree` 的 `version` 列。

## 使用 CollapsingMergeTree 频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新列涉及删除现有行并用新值替换它。如你已经看到的，这种类型的变更在 ClickHouse 中是 _最终_ 进行的 - 在合并期间。如果需要更新大量行，实际上可能更高效的是避免使用 `ALTER TABLE..UPDATE`，而是直接将新数据插入现有数据旁边。我们可以添加一个列来标识数据是过期还是新数据……实际上，有一种表引擎已经很好地实现了这一行为，特别是它会自动为你删除过期数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪 Hacker News 评论的查看次数，每隔几小时将数据推送到 ClickHouse。我们希望删除旧行，新行代表每条 Hacker News 评论的新状态。我们可以使用 `CollapsingMergeTree` 来实现这一行为。

让我们定义一个表来存储查看次数：

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

注意 `hackernews_views` 表有一个名为 sign 的 `Int8` 列，称为 **sign** 列。sign 列的名称是任意的，但 `Int8` 数据类型是必需的，并且注意该列名称是传递给 `CollapsingMergeTree` 表构造函数的。

`CollapsingMergeTree` 表的 sign 列是什么？它代表行的 _状态_ ，sign 列只能为 1 或 -1。它的工作原理如下：

- 如果两行具有相同的主键（或如果排序顺序不同于主键），但 sign 列的值不同，则最后插入的值为 +1 的行成为状态行，其他行相互取消
- 在合并过程中，相互取消的行将被删除
- 没有匹配对的行将被保留

让我们向 `hackernews_views` 表添加一行。由于这是该主键的唯一行，我们将其状态设为 1：

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

现在表中有 3 行，主键为 `(123, 'ricardo')`：

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

注意添加 `FINAL` 返回了当前状态行：

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

但当然，不建议对大表使用 `FINAL`。

:::note
在我们的示例中传入 `views` 列的值实际上并不是必需的，也不必与旧行的 `views` 当前值匹配。实际上，你可以只用主键和 -1 取消一行：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 来自多个线程的实时更新 {#real-time-updates-from-multiple-threads}

使用 `CollapsingMergeTree` 表，行通过一个 sign 列相互取消，行的状态由最后插入的行决定。但如果你从不同线程插入行，行可能会插入不按顺序，这可能会导致问题。在这种情况下，仅使用“最后一行”并不奏效。

这就是 `VersionedCollapsingMergeTree` 发挥作用的地方 - 它像 `CollapsingMergeTree` 一样合并行，但它保留指定的版本列最大值的行，而不是最后插入的行。

让我们看一个例子。假设我们想要跟踪 Hacker News 评论的查看次数，并且数据频繁更新。我们希望报告使用最新值，而不必强制合并或等待合并。我们开始创建一个与 `CollapsedMergeTree` 相似, 但添加一个列以存储行状态的版本的表：

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

注意该表使用 `VersionsedCollapsingMergeTree` 作为引擎，并传入 **sign 列** 和 **version 列**。该表的工作原理如下：

- 删除每对具有相同主键和版本的行，并且 sign 不同
- 行的插入顺序无关紧要
- 注意，如果版本列不是主键的一部分，ClickHouse 会隐式将其作为最后一个字段添加到主键中

在编写查询时，你使用相同类型的逻辑 - 按主键分组并使用巧妙的逻辑以避免尚未删除的被取消行。现在我们向 `hackernews_views_vcmt` 表添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新其中两个行，并删除其中一个。要取消一行，不要忘记包括先前版本号（因为它是主键的一部分）：

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

让我们强制合并表：

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

`VersionedCollapsingMergeTree` 表在你想要在从多个客户端和/或线程插入行时实施去重时非常方便。

## 为什么我的行没有被去重？ {#why-arent-my-rows-being-deduplicated}

插入的行可能没有被去重的一个原因是你在 `INSERT` 语句中使用了非幂等的函数或表达式。例如，如果你插入的行包含列 `createdAt DateTime64(3) DEFAULT now()`，则你的行是唯一的，因为每行将为 `createdAt` 列生成唯一的默认值。MergeTree / ReplicatedMergeTree 表引擎将无法了解如何去重这些行，因为每插入的行都会生成唯一的校验和。

在这种情况下，你可以为每批行指定自己的 `insert_deduplication_token`，以确保多次插入相同批次不会导致相同行重新插入。有关如何使用此设置的更多详细信息，请查阅 [关于 `insert_deduplication_token` 的文档](operations/settings/settings#insert_deduplication_token)。
