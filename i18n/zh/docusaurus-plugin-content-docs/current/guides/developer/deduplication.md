---
'slug': '/guides/developer/deduplication'
'sidebar_label': '去重策略'
'sidebar_position': 3
'description': '在需要频繁执行upserts、更新和删除操作时使用去重'
'title': '去重策略'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 去重策略

**去重**是指***删除数据集中的重复行***的过程。在OLTP数据库中，这种操作很容易，因为每一行都有一个唯一的主键——但这会导致插入速度变慢。每插入一行，首先需要进行搜索，如果找到相应的行，就需要进行替换。

ClickHouse在数据插入方面的设计是为了速度。存储文件是不可变的，并且ClickHouse在插入行时不会检查现有的主键——因此去重涉及到更多的工作。这也意味着去重不是即时的——它是**最终一致的**，这有几个副作用：

- 在任何时候，您的表中仍可能存在重复项（具有相同排序键的行）
- 重复行的实际删除发生在分片合并期间
- 您的查询需要考虑到可能存在重复项

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="去重标志" size="sm"/>|ClickHouse提供有关去重及其他主题的免费培训。 [删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) 是一个不错的起点。|

</div>

## 去重选项 {#options-for-deduplication}

在ClickHouse中，去重是使用以下表引擎实现的：

1. `ReplacingMergeTree` 表引擎：使用此表引擎，具有相同排序键的重复行在合并过程中会被删除。`ReplacingMergeTree`是模拟upsert行为的一个很好的选择（当您希望查询返回最后插入的行时）。

2. 合并行：`CollapsingMergeTree`和`VersionedCollapsingMergeTree`表引擎使用一种逻辑，现有行被“取消”，然后插入新行。与`ReplacingMergeTree`相比，它们的实现更复杂，但您的查询和聚合可以更简单，而无需担心数据是否已经合并。这两个表引擎在需要频繁更新数据时非常有用。

我们将在下面详细介绍这两种技术。有关更多详细信息，请查看我们的免费点播[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)。

## 使用ReplacingMergeTree进行Upserts {#using-replacingmergetree-for-upserts}

让我们看一个简单的例子，一个表包含Hacker News评论，带有一个表示评论被查看次数的views列。假设我们在文章发布时插入一行，并在每天upsert一行，带上总查看次数（如果该值增加）：

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

要更新`views`列，插入具有相同主键的新行（注意`views`列的新值）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

现在表中有4行：

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

输出中的不同框显示了背后的两个部分——这些数据尚未合并，因此重复行尚未被删除。让我们在`SELECT`查询中使用`FINAL`关键字，这将导致查询结果的逻辑合并：

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

结果只有2行，最后插入的一行是返回的行。

:::note
如果您的数据量较小，使用`FINAL`是可以的。如果您处理大量数据，使用`FINAL`可能不是最佳选择。让我们讨论一下找到列的最新值的更好选择...
:::

### 避免使用FINAL {#avoiding-final}

让我们再次更新两个唯一行的`views`列：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

现在表中有6行，因为实际合并尚未发生（只有在我们使用`FINAL`时的查询时合并）。

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

而不是使用`FINAL`，让我们使用一些业务逻辑——我们知道`views`列总是递增的，因此我们可以通过选择最大值的行：

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

如上查询中所示的分组实际上可以在查询性能方面比使用`FINAL`更高效。

我们的[删除和更新数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)扩展了这个例子，包括如何使用带有`ReplacingMergeTree`的`version`列。

## 使用CollapsingMergeTree频繁更新列 {#using-collapsingmergetree-for-updating-columns-frequently}

更新列涉及删除现有行并用新值替换它。正如您已经看到的，这种类型的变更在ClickHouse中会**最终**发生——在合并时。如果您有很多行需要更新，实际上避免`ALTER TABLE..UPDATE`并且仅插入与现有数据并排的新数据可能更高效。我们可以添加一个列，用于表示数据是过期还是新数据……实际上，有一个表引擎已经很好地实现了这种行为，尤其考虑到它会自动为您删除过期数据。让我们看看它是如何工作的。

假设我们使用外部系统跟踪Hacker News评论的查看次数，并且每隔几小时将数据推送到ClickHouse。我们希望旧行被删除，而新行代表每个Hacker News评论的新状态。我们可以使用`CollapsingMergeTree`来实现这种行为。

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

注意`hackernews_views`表有一个名为sign的`Int8`列，被称为**sign**列。sign列的名称是任意的，但`Int8`数据类型是必须的，并且请注意列名称在`CollapsingMergeTree`表的构造函数中传入。

`CollapsingMergeTree`表中的sign列是什么？它代表行的_状态_，sign列只能为1或-1。其工作原理如下：

- 如果两行具有相同的主键（或如果排序顺序与主键不同），但sign列的值不同，则插入的最后一行带有+1成为状态行，而其他行则互相取消
- 在合并期间，互相取消的行会被删除
- 没有匹配对的行会被保留

让我们向`hackernews_views`表添加一行。由于这是该主键的唯一行，我们将其状态设置为1：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

现在假设我们想要更改views列。您插入两行：一行取消现有行，另一行包含行的新状态：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

此时，表中有3行，主键为`(123, 'ricardo')`：

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

注意添加`FINAL`返回当前状态行：

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

但当然，对于大型表使用`FINAL`并不推荐。

:::note
我们示例中传入的`views`列的值并不是特别需要，也不必与旧行的当前`views`值匹配。事实上，您可以只使用主键和-1来取消一行：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 多线程的实时更新 {#real-time-updates-from-multiple-threads}

使用`CollapsingMergeTree`表，行通过sign列互相取消，行的状态由最后插入的行决定。但如果您从不同线程插入行，而行的插入顺序可能会不同，这可能会导致问题。在这种情况下，使用“最后”一行的方法并不适用。

这就是`VersionedCollapsingMergeTree`派上用场的地方——它和`CollapsingMergeTree`一样合并行，但它保留的是您指定的version列中值最大的行，而不是最后插入的行。

让我们看一个例子。假设我们想跟踪Hacker News评论的查看次数，并且数据频繁更新。我们希望报告使用最新值，而不强制或等待合并。我们以一个类似于`CollapsedMergeTree`的表开始，只是添加了一个列来存储行的状态的版本：

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

注意表使用`VersionsedCollapsingMergeTree`作为引擎，并传入**sign列**和**version列**。其工作原理如下：

- 它删除每对具有相同主键和版本且sign不同的行
- 行的插入顺序并不重要
- 请注意，如果version列不是主键的一部分，ClickHouse会将其隐式添加到主键中作为最后一个字段

在编写查询时，您使用相同类型的逻辑——按主键分组，采用巧妙的逻辑来避免尚未删除的被取消的行。让我们向`hackernews_views_vcmt`表添加一些行：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

现在我们更新其中两行并删除其中一行。要取消一行，请确保包含前一版本号（因为它是主键的一部分）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

我们将运行与之前相同的查询，该查询巧妙地根据sign列加减值：

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

当您需要在多个客户端和/或线程中插入行的同时实现去重时，`VersionedCollapsingMergeTree`表非常方便。

## 为什么我的行没有被去重？ {#why-arent-my-rows-being-deduplicated}

插入的行可能没有被去重的一个原因是您在`INSERT`语句中使用了非幂等函数或表达式。例如，如果您插入带有列`createdAt DateTime64(3) DEFAULT now()`的行，您的行将被保证唯一，因为每行的`createdAt`列都有唯一的默认值。MergeTree / ReplicatedMergeTree表引擎不知到去重这些行，因为每插入一行都会生成唯一的校验和。

在这种情况下，您可以为每批行指定自己的`insert_deduplication_token`，以确保同一批次的多次插入不会导致同样的行被重新插入。有关如何使用此设置的更多详细信息，请参见[关于`insert_deduplication_token`的文档](/operations/settings/settings#insert_deduplication_token)。
