---
'slug': '/guides/developer/deduplication'
'sidebar_label': '去重策略'
'sidebar_position': 3
'description': '当您需要频繁进行 upserts、更新和删除时，请使用去重。'
'title': '去重策略'
'doc_type': 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 去重策略

**去重** 是指 ***移除数据集中重复行的过程***。在 OLTP 数据库中，这个过程比较简单，因为每一行都有一个唯一的主键，但这会导致插入速度变慢。每插入一行都需要先进行查找，如果找到，需要进行替换。

ClickHouse 在数据插入方面是为了速度而设计的。存储文件是不可变的，并且 ClickHouse 在插入行之前不检查现有的主键，因此去重涉及更多的工作。这也意味着去重不是立即发生的，它是 **最终** 的，这有一些副作用：

- 在任何时刻，您的表中可能仍然存在重复项（具有相同排序键的行）
- 实际的重复行移除发生在分区合并期间
- 您的查询需要考虑可能存在重复项的情况

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouse 提供免费的去重和其他主题的培训。 [删除和更新数据](/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 培训模块是一个很好的开始。|

</div>

## 去重选项 {#options-for-deduplication}

在 ClickHouse 中，去重是通过以下表引擎实现的：

1. `ReplacingMergeTree` 表引擎：使用此表引擎，具有相同排序键的重复行在合并期间被移除。`ReplacingMergeTree` 是模拟 upsert 行为（您希望查询返回最后插入的行）的良好选择。

2. 消除行：`CollapsingMergeTree` 和 `VersionedCollapsingMergeTree` 表引擎使用一种逻辑，即现有行被“取消”，并插入新行。它们的实现比 `ReplacingMergeTree` 复杂，但您的查询和聚合可以更简单，因为可以不必担心数据是否已合并。这两个表引擎在需要频繁更新数据时非常有用。

我们下面将讨论这两种技术。有关更多详细信息，请查看我们的免费按需 [删除和更新数据培训模块](/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用 ReplacingMergeTree 进行 Upserts {#using-replacingmergetree-for-upserts}

让我们来看一个简单的例子，其中一个表包含 Hacker News 评论，并有一个表示评论被查看次数的 views 列。假设我们在文章发布时插入一行，并在每一天更新一次，如果值增加，就 upsert 一行：

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

让我们插入两行：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

要更新 `views` 列，请插入一行与主键相同的新行（注意 `views` 列的新值）：

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

输出中的单独框展示了幕后这两个部分——这些数据尚未合并，因此重复行尚未被移除。让我们在 `SELECT` 查询中使用 `FINAL` 关键字，这将导致查询结果的逻辑合并：

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

结果只有 2 行，最后插入的行是被返回的行。

:::note
如果您的数据量较小，使用 `FINAL` 是可以的。但如果您处理的是大量数据，使用 `FINAL` 可能不是最佳选择。让我们讨论一个更好的选项来查找列的最新值。
:::

### 避免使用 FINAL {#avoiding-final}

让我们再次更新两个唯一行的 `views` 列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

表现在有 6 行，因为实际的合并尚未发生（只有查询时的合并，当我们使用 `FINAL` 时）。

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

不使用 `FINAL`，让我们使用一些业务逻辑——我们知道 `views` 列总是增加的，因此我们可以在按所需列分组后，使用 `max` 函数选择具有最大值的行：

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

如上面的查询所示的分组实际上可能在查询性能上比使用 `FINAL` 关键字更高效。

我们的 [删除和更新数据培训模块](/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 扩展了这个例子，包括如何使用 `version` 列与 `ReplacingMergeTree`。

## 使用 CollapsingMergeTree 频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新列涉及删除现有行并用新值替换它。如您所见，这种类型的突变在 ClickHouse 中是 _最终_ 发生的——在合并期间。如果您有很多行要更新，实际上避免使用 `ALTER TABLE..UPDATE`，而是只插入新数据并与现有数据并行，可以更高效。我们可以添加一个列来指示数据是过期的还是新的……实际上有一个表引擎已经非常好地实现了这种行为，尤其是考虑到它自动为您删除过期数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪 Hacker News 评论的查看次数，并且每隔几个小时，我们将数据推送到 ClickHouse。我们希望删除旧行，新行代表每个 Hacker News 评论的新状态。我们可以使用 `CollapsingMergeTree` 来实现这种行为。

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

注意 `hackernews_views` 表有一个名为 sign 的 `Int8` 列，被称为 **sign** 列。sign 列的名称是任意的，但 `Int8` 数据类型是必需的，并且注意列名在 `CollapsingMergeTree` 表的构造函数中被传递。

`CollapsingMergeTree` 表的 sign 列是什么？它表示行的 _状态_，且 sign 列只能为 1 或 -1。它的工作原理如下：

- 如果两行具有相同的主键（或如果排序顺序不同于主键），但 sign 列的值不同，则最后插入的带有 +1 的行成为状态行，而其他行则相互取消
- 在合并期间，相互取消的行会被删除
- 没有匹配对的行会被保留

让我们向 `hackernews_views` 表添加一行。由于它是该主键的唯一行，我们将其状态设置为 1：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们想要更改 `views` 列。您插入了两行：一行取消现有行，另一行包含行的新状态：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

表现在有主键 `(123, 'ricardo')` 的 3 行：

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

注意添加 `FINAL` 返回当前状态行：

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

但当然，使用 `FINAL` 不推荐用于大表。

:::note
在我们的例子中，传递给 `views` 列的值并不是真正需要的，也不需要与旧行的当前 `views` 值匹配。实际上，您可以使用主键和 -1 取消一行：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 来自多个线程的实时更新 {#real-time-updates-from-multiple-threads}

使用 `CollapsingMergeTree` 表，行使用 sign 列相互取消，行的状态由最后插入的行决定。但是，如果您从不同的线程插入行，行的插入顺序可能不同，这会导致问题。在这种情况下，使用“最后”行并不起作用。

这就是 `VersionedCollapsingMergeTree` 发挥作用的地方——它像 `CollapsingMergeTree` 一样合并行，但它保留的是您指定的具有最高值的版本列的行，而不是保持最后插入的行。

让我们看一个例子。假设我们想要跟踪我们的 Hacker News 评论的查看次数，并且数据频繁更新。我们希望报告使用最新值，而不强迫或等待合并。我们开始创建一个与 `CollapsedMergeTree` 类似的表，但我们添加一个列来存储行状态的版本：

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

注意该表使用 `VersionsedCollapsingMergeTree` 作为引擎，并传入 **sign 列** 和 **version 列**。这里是该表的工作原理：

- 它删除每对具有相同主键和版本并且 sign 不同的行
- 插入行的顺序无关紧要
- 请注意，如果版本列不是主键的一部分，ClickHouse 会将其隐式地添加到主键中，作为最后一个字段

在编写查询时，您使用相同的逻辑——按主键分组，并使用巧妙的逻辑来避免尚未删除的已取消行。让我们向 `hackernews_views_vcmt` 表添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新两行并删除其中一行。要取消一行，请确保包括先前的版本号（因为它是主键的一部分）：

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

`VersionedCollapsingMergeTree` 表在您想要在从多个客户端和/或线程插入行时实现去重时非常方便。

## 为什么我的行没有被去重？ {#why-arent-my-rows-being-deduplicated}

插入的行可能未被去重的一个原因是您在 `INSERT` 语句中使用了非幂等的函数或表达式。例如，如果您在插入行时使用列 `createdAt DateTime64(3) DEFAULT now()`，您的行 guaranteed 是唯一的，因为每一行的 `createdAt` 列将具有唯一的默认值。MergeTree / ReplicatedMergeTree 表引擎将不会知道去重，因为每一插入行将生成唯一的校验和。

在这种情况下，您可以为每批行指定自己的 `insert_deduplication_token`，以确保同一批次的多次插入不会导致相同的行被重新插入。有关此设置的更多详细信息，请参见 [关于 `insert_deduplication_token` 的文档](/operations/settings/settings#insert_deduplication_token)。
