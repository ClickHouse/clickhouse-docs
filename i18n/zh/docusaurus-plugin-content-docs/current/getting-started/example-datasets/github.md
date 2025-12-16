---
description: '包含 ClickHouse 仓库所有提交和变更的数据集'
sidebar_label: 'GitHub 仓库'
slug: /getting-started/example-datasets/github
title: '在 ClickHouse 中使用 GitHub 数据编写查询'
keywords: ['GitHub']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import superset_github_lines_added_deleted from '@site/static/images/getting-started/example-datasets/superset-github-lines-added-deleted.png'
import superset_commits_authors from '@site/static/images/getting-started/example-datasets/superset-commits-authors.png'
import superset_authors_matrix from '@site/static/images/getting-started/example-datasets/superset-authors-matrix.png'
import superset_authors_matrix_v2 from '@site/static/images/getting-started/example-datasets/superset-authors-matrix_v2.png'

此数据集包含 ClickHouse 仓库的所有提交和变更。可以使用随 ClickHouse 一起分发的原生 `git-import` 工具生成。

生成的数据会为下列每个表提供一个 `TSV` 文件：

* `commits` - 带有统计信息的提交。
* `file_changes` - 每次提交中发生变更的文件，以及关于这些变更和统计信息的数据。
* `line_changes` - 每次提交中每个发生变更的文件里每一行的变更记录，包括该行的完整信息以及关于此行上一次变更的信息。

截至 2022 年 11 月 8 日，每个 TSV 的大致大小和行数如下：

* `commits` - 7.8M - 266,051 行
* `file_changes` - 53M - 266,051 行
* `line_changes` - 2.7G - 7,535,157 行


## 生成数据 {#generating-the-data}

本步骤为可选。我们免费提供这些数据——参见[下载并插入数据](#downloading-and-inserting-the-data)。

```bash
git clone git@github.com:ClickHouse/ClickHouse.git
cd ClickHouse
clickhouse git-import --skip-paths 'generated\.cpp|^(contrib|docs?|website|libs/(libcityhash|liblz4|libdivide|libvectorclass|libdouble-conversion|libcpuid|libzstd|libfarmhash|libmetrohash|libpoco|libwidechar_width))/' --skip-commits-with-messages '^Merge branch '
```

在 2021 款 MacBook Pro 上，对 ClickHouse 仓库执行此操作大约需要 3 分钟（截至 2022 年 11 月 8 日的数据）。

可以通过该工具内置的帮助获取完整的可用选项列表。

```bash
clickhouse git-import -h
```

本帮助文档还提供了上述每个表的 DDL，例如：

```sql
CREATE TABLE git.commits
(
    hash String,
    author LowCardinality(String),
    time DateTime,
    message String,
    files_added UInt32,
    files_deleted UInt32,
    files_renamed UInt32,
    files_modified UInt32,
    lines_added UInt32,
    lines_deleted UInt32,
    hunks_added UInt32,
    hunks_removed UInt32,
    hunks_changed UInt32
) ENGINE = MergeTree ORDER BY time;
```

**这些查询适用于任何代码仓库。你可以自行探索并反馈你的发现。** 以下是关于执行时间的一些参考（截至 2022 年 11 月）：

* Linux - `~/clickhouse git-import` - 160 分钟


## 下载和插入数据 {#downloading-and-inserting-the-data}

以下数据可用于复现一个可用的环境。或者，你也可以在 play.clickhouse.com 上获取该数据集——更多详情参见 [Queries](#queries)。

下面是为以下代码仓库生成的文件：

* ClickHouse（2022 年 11 月 8 日）
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/commits.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/commits.tsv.xz) - 2.5 MB
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/file&#95;changes.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/file_changes.tsv.xz) - 4.5 MB
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/line&#95;changes.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/line_changes.tsv.xz) - 127.4 MB
* Linux（2022 年 11 月 8 日）
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/linux/commits.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/linux/commits.tsv.xz) - 44 MB
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/linux/file&#95;changes.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/linux/file_changes.tsv.xz) - 467 MB
  * [https://datasets-documentation.s3.amazonaws.com/github/commits/linux/line&#95;changes.tsv.xz](https://datasets-documentation.s3.amazonaws.com/github/commits/linux/line_changes.tsv.xz) - 1.1G

要插入这些数据，请通过执行以下查询来准备数据库：

```sql
DROP DATABASE IF EXISTS git;
CREATE DATABASE git;

CREATE TABLE git.commits
(
    hash String,
    author LowCardinality(String),
    time DateTime,
    message String,
    files_added UInt32,
    files_deleted UInt32,
    files_renamed UInt32,
    files_modified UInt32,
    lines_added UInt32,
    lines_deleted UInt32,
    hunks_added UInt32,
    hunks_removed UInt32,
    hunks_changed UInt32
) ENGINE = MergeTree ORDER BY time;

CREATE TABLE git.file_changes
(
    change_type Enum('Add' = 1, 'Delete' = 2, 'Modify' = 3, 'Rename' = 4, 'Copy' = 5, 'Type' = 6),
    path LowCardinality(String),
    old_path LowCardinality(String),
    file_extension LowCardinality(String),
    lines_added UInt32,
    lines_deleted UInt32,
    hunks_added UInt32,
    hunks_removed UInt32,
    hunks_changed UInt32,

    commit_hash String,
    author LowCardinality(String),
    time DateTime,
    commit_message String,
    commit_files_added UInt32,
    commit_files_deleted UInt32,
    commit_files_renamed UInt32,
    commit_files_modified UInt32,
    commit_lines_added UInt32,
    commit_lines_deleted UInt32,
    commit_hunks_added UInt32,
    commit_hunks_removed UInt32,
    commit_hunks_changed UInt32
) ENGINE = MergeTree ORDER BY time;

CREATE TABLE git.line_changes
(
    sign Int8,
    line_number_old UInt32,
    line_number_new UInt32,
    hunk_num UInt32,
    hunk_start_line_number_old UInt32,
    hunk_start_line_number_new UInt32,
    hunk_lines_added UInt32,
    hunk_lines_deleted UInt32,
    hunk_context LowCardinality(String),
    line LowCardinality(String),
    indent UInt8,
    line_type Enum('Empty' = 0, 'Comment' = 1, 'Punct' = 2, 'Code' = 3),

    prev_commit_hash String,
    prev_author LowCardinality(String),
    prev_time DateTime,

    file_change_type Enum('Add' = 1, 'Delete' = 2, 'Modify' = 3, 'Rename' = 4, 'Copy' = 5, 'Type' = 6),
    path LowCardinality(String),
    old_path LowCardinality(String),
    file_extension LowCardinality(String),
    file_lines_added UInt32,
    file_lines_deleted UInt32,
    file_hunks_added UInt32,
    file_hunks_removed UInt32,
    file_hunks_changed UInt32,

    commit_hash String,
    author LowCardinality(String),
    time DateTime,
    commit_message String,
    commit_files_added UInt32,
    commit_files_deleted UInt32,
    commit_files_renamed UInt32,
    commit_files_modified UInt32,
    commit_lines_added UInt32,
    commit_lines_deleted UInt32,
    commit_hunks_added UInt32,
    commit_hunks_removed UInt32,
    commit_hunks_changed UInt32
) ENGINE = MergeTree ORDER BY time;
```

使用 `INSERT INTO SELECT` 和 [S3 函数](/sql-reference/table-functions/s3) 将数据插入。例如，在下面的示例中，我们将 ClickHouse 文件插入到各自对应的表中：

*commits*


```sql
INSERT INTO git.commits SELECT *
FROM s3('https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/commits.tsv.xz', 'TSV', 'hash String,author LowCardinality(String), time DateTime, message String, files_added UInt32, files_deleted UInt32, files_renamed UInt32, files_modified UInt32, lines_added UInt32, lines_deleted UInt32, hunks_added UInt32, hunks_removed UInt32, hunks_changed UInt32')

0 rows in set. Elapsed: 1.826 sec. Processed 62.78 thousand rows, 8.50 MB (34.39 thousand rows/s., 4.66 MB/s.)
```

*file&#95;changes*

```sql
INSERT INTO git.file_changes SELECT *
FROM s3('https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/file_changes.tsv.xz', 'TSV', 'change_type Enum(\'Add\' = 1, \'Delete\' = 2, \'Modify\' = 3, \'Rename\' = 4, \'Copy\' = 5, \'Type\' = 6), path LowCardinality(String), old_path LowCardinality(String), file_extension LowCardinality(String), lines_added UInt32, lines_deleted UInt32, hunks_added UInt32, hunks_removed UInt32, hunks_changed UInt32, commit_hash String, author LowCardinality(String), time DateTime, commit_message String, commit_files_added UInt32, commit_files_deleted UInt32, commit_files_renamed UInt32, commit_files_modified UInt32, commit_lines_added UInt32, commit_lines_deleted UInt32, commit_hunks_added UInt32, commit_hunks_removed UInt32, commit_hunks_changed UInt32')

0 rows in set. Elapsed: 2.688 sec. Processed 266.05 thousand rows, 48.30 MB (98.97 thousand rows/s., 17.97 MB/s.)
```

*line&#95;changes*

```sql
INSERT INTO git.line_changes SELECT *
FROM s3('https://datasets-documentation.s3.amazonaws.com/github/commits/clickhouse/line_changes.tsv.xz', 'TSV', '    sign Int8, line_number_old UInt32, line_number_new UInt32, hunk_num UInt32, hunk_start_line_number_old UInt32, hunk_start_line_number_new UInt32, hunk_lines_added UInt32,\n    hunk_lines_deleted UInt32, hunk_context LowCardinality(String), line LowCardinality(String), indent UInt8, line_type Enum(\'Empty\' = 0, \'Comment\' = 1, \'Punct\' = 2, \'Code\' = 3), prev_commit_hash String, prev_author LowCardinality(String), prev_time DateTime, file_change_type Enum(\'Add\' = 1, \'Delete\' = 2, \'Modify\' = 3, \'Rename\' = 4, \'Copy\' = 5, \'Type\' = 6),\n    path LowCardinality(String), old_path LowCardinality(String), file_extension LowCardinality(String), file_lines_added UInt32, file_lines_deleted UInt32, file_hunks_added UInt32, file_hunks_removed UInt32, file_hunks_changed UInt32, commit_hash String,\n    author LowCardinality(String), time DateTime, commit_message String, commit_files_added UInt32, commit_files_deleted UInt32, commit_files_renamed UInt32, commit_files_modified UInt32, commit_lines_added UInt32, commit_lines_deleted UInt32, commit_hunks_added UInt32, commit_hunks_removed UInt32, commit_hunks_changed UInt32')

0 rows in set. Elapsed: 50.535 sec. Processed 7.54 million rows, 2.09 GB (149.11 thousand rows/s., 41.40 MB/s.)
```


## 查询 {#queries}

该工具会在其帮助输出信息中建议若干查询。除这些查询外，我们还补充回答了一些额外感兴趣的问题。这些查询大致按复杂度递增排列，而不是沿用工具中给出的任意顺序。

该数据集可在 `git_clickhouse` 数据库中通过 [play.clickhouse.com](https://sql.clickhouse.com?query_id=DCQPNPAIMAQXRLHYURLKVJ) 获取。我们为所有查询都提供了指向该环境的链接，并在需要时调整数据库名称。请注意，由于数据采集时间不同，play 环境中的结果可能与此处展示的结果有所差异。

### 单个文件的历史记录 {#history-of-a-single-file}

这是最简单的查询。在这里，我们查看 `StorageReplicatedMergeTree.cpp` 的所有提交说明。由于这些通常更有意义，我们按时间倒序（最新的消息在前）进行排序。

[运行查询](https://sql.clickhouse.com?query_id=COAZRFX2YFULDBXRQTCQ1S)

```sql
SELECT
    time,
    substring(commit_hash, 1, 11) AS commit,
    change_type,
    author,
    path,
    old_path,
    lines_added,
    lines_deleted,
    commit_message
FROM git.file_changes
WHERE path = 'src/Storages/StorageReplicatedMergeTree.cpp'
ORDER BY time DESC
LIMIT 10

┌────────────────time─┬─commit──────┬─change_type─┬─author─────────────┬─path────────────────────────────────────────┬─old_path─┬─lines_added─┬─lines_deleted─┬─commit_message───────────────────────────────────┐
│ 2022-10-30 16:30:51 │ c68ab231f91 │ Modify      │ Alexander Tokmakov │ src/Storages/StorageReplicatedMergeTree.cpp │          │          13 │            10 │ fix accessing part in Deleting state             │
│ 2022-10-23 16:24:20 │ b40d9200d20 │ Modify      │ Anton Popov        │ src/Storages/StorageReplicatedMergeTree.cpp │          │          28 │            30 │ better semantic of constsness of DataPartStorage │
│ 2022-10-23 01:23:15 │ 56e5daba0c9 │ Modify      │ Anton Popov        │ src/Storages/StorageReplicatedMergeTree.cpp │          │          28 │            44 │ remove DataPartStorageBuilder                    │
│ 2022-10-21 13:35:37 │ 851f556d65a │ Modify      │ Igor Nikonov       │ src/Storages/StorageReplicatedMergeTree.cpp │          │           3 │             2 │ Remove unused parameter                          │
│ 2022-10-21 13:02:52 │ 13d31eefbc3 │ Modify      │ Igor Nikonov       │ src/Storages/StorageReplicatedMergeTree.cpp │          │           4 │             4 │ Replicated merge tree polishing                  │
│ 2022-10-21 12:25:19 │ 4e76629aafc │ Modify      │ Azat Khuzhin       │ src/Storages/StorageReplicatedMergeTree.cpp │          │           3 │             2 │ Fixes for -Wshorten-64-to-32                     │
│ 2022-10-19 13:59:28 │ 05e6b94b541 │ Modify      │ Antonio Andelic    │ src/Storages/StorageReplicatedMergeTree.cpp │          │           4 │             0 │ Polishing                                        │
│ 2022-10-19 13:34:20 │ e5408aac991 │ Modify      │ Antonio Andelic    │ src/Storages/StorageReplicatedMergeTree.cpp │          │           3 │            53 │ Simplify logic                                   │
│ 2022-10-18 15:36:11 │ 7befe2825c9 │ Modify      │ Alexey Milovidov   │ src/Storages/StorageReplicatedMergeTree.cpp │          │           2 │             2 │ Update StorageReplicatedMergeTree.cpp            │
│ 2022-10-18 15:35:44 │ 0623ad4e374 │ Modify      │ Alexey Milovidov   │ src/Storages/StorageReplicatedMergeTree.cpp │          │           1 │             1 │ Update StorageReplicatedMergeTree.cpp            │
└─────────────────────┴─────────────┴─────────────┴────────────────────┴─────────────────────────────────────────────┴──────────┴─────────────┴───────────────┴──────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.006 sec. Processed 12.10 thousand rows, 1.60 MB (1.93 million rows/s., 255.40 MB/s.)
```

我们还可以查看每一行的更改，并排除重命名事件（也就是说，当文件曾以不同名称存在时，不会显示重命名前的更改）：

[play](https://sql.clickhouse.com?query_id=AKS9SYLARFMZCHGAAQNEBN)


```sql
SELECT
    time,
    substring(commit_hash, 1, 11) AS commit,
    sign,
    line_number_old,
    line_number_new,
    author,
    line
FROM git.line_changes
WHERE path = 'src/Storages/StorageReplicatedMergeTree.cpp'
ORDER BY line_number_new ASC
LIMIT 10

┌────────────────time─┬─commit──────┬─sign─┬─line_number_old─┬─line_number_new─┬─author───────────┬─line──────────────────────────────────────────────────┐
│ 2020-04-16 02:06:10 │ cdeda4ab915 │   -1 │               1 │               1 │ Alexey Milovidov │ #include <Disks/DiskSpaceMonitor.h>                   │
│ 2020-04-16 02:06:10 │ cdeda4ab915 │    1 │               2 │               1 │ Alexey Milovidov │ #include <Core/Defines.h>                             │
│ 2020-04-16 02:06:10 │ cdeda4ab915 │    1 │               2 │               2 │ Alexey Milovidov │                                                       │
│ 2021-05-03 23:46:51 │ 02ce9cc7254 │   -1 │               3 │               2 │ Alexey Milovidov │ #include <Common/FieldVisitors.h>                     │
│ 2021-05-27 22:21:02 │ e2f29b9df02 │   -1 │               3 │               2 │ s-kat            │ #include <Common/FieldVisitors.h>                     │
│ 2022-10-03 22:30:50 │ 210882b9c4d │    1 │               2 │               3 │ alesapin         │ #include <ranges>                                     │
│ 2022-10-23 16:24:20 │ b40d9200d20 │    1 │               2 │               3 │ Anton Popov      │ #include <cstddef>                                    │
│ 2021-06-20 09:24:43 │ 4c391f8e994 │    1 │               2 │               3 │ Mike Kot         │ #include "Common/hex.h"                               │
│ 2021-12-29 09:18:56 │ 8112a712336 │   -1 │               6 │               5 │ avogar           │ #include <Common/ThreadPool.h>                        │
│ 2022-04-21 20:19:13 │ 9133e398b8c │    1 │              11 │              12 │ Nikolai Kochetov │ #include <Storages/MergeTree/DataPartStorageOnDisk.h> │
└─────────────────────┴─────────────┴──────┴─────────────────┴─────────────────┴──────────────────┴───────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.258 sec. Processed 7.54 million rows, 654.92 MB (29.24 million rows/s., 2.54 GB/s.)
```

请注意，还存在一个更复杂的查询变体，它会在考虑重命名的情况下，查找文件的[逐行提交历史](#line-by-line-commit-history-of-a-file)。


### 查找当前活动文件 {#find-the-current-active-files}

这对于后续分析非常重要，因为我们只想考虑代码库中当前存在的文件。我们将这一集合视为那些尚未被重命名或删除（然后再次添加或重命名）的文件。

**注意：在 `dbms`、`libs`、`tests/testflows/` 目录重命名期间，这些目录下文件的提交历史似乎存在问题。因此我们也排除这些目录下的文件。**

[play](https://sql.clickhouse.com?query_id=2HNFWPCFWEEY92WTAPMA7W)

```sql
SELECT path
FROM
(
    SELECT
        old_path AS path,
        max(time) AS last_time,
        2 AS change_type
    FROM git.file_changes
    GROUP BY old_path
    UNION ALL
    SELECT
        path,
        max(time) AS last_time,
        argMax(change_type, time) AS change_type
    FROM git.file_changes
    GROUP BY path
)
GROUP BY path
HAVING (argMax(change_type, last_time) != 2) AND NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)') ORDER BY path
LIMIT 10

┌─path────────────────────────────────────────────────────────────┐
│ tests/queries/0_stateless/01054_random_printable_ascii_ubsan.sh │
│ tests/queries/0_stateless/02247_read_bools_as_numbers_json.sh   │
│ tests/performance/file_table_function.xml                       │
│ tests/queries/0_stateless/01902_self_aliases_in_columns.sql     │
│ tests/queries/0_stateless/01070_h3_get_base_cell.reference      │
│ src/Functions/ztest.cpp                                         │
│ src/Interpreters/InterpreterShowTablesQuery.h                   │
│ src/Parsers/Kusto/ParserKQLStatement.h                          │
│ tests/queries/0_stateless/00938_dataset_test.sql                │
│ src/Dictionaries/Embedded/GeodataProviders/Types.h              │
└─────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.085 sec. Processed 532.10 thousand rows, 8.68 MB (6.30 million rows/s., 102.64 MB/s.)
```

请注意，这样做允许文件先被重命名，然后再被重命名回其原始名称。首先，我们对因重命名而“删除”的文件列表按其 `old_path` 进行聚合。然后，将其与每个 `path` 的最后一次操作进行 UNION。最后，我们过滤该列表，仅保留最终事件不是 `Delete` 的记录。

[play](https://sql.clickhouse.com?query_id=1OXCKMOH2JVMSHD3NS2WW6)

```sql
SELECT uniq(path)
FROM
(
    SELECT path
    FROM
    (
        SELECT
            old_path AS path,
            max(time) AS last_time,
            2 AS change_type
        FROM git.file_changes
        GROUP BY old_path
        UNION ALL
        SELECT
            path,
            max(time) AS last_time,
            argMax(change_type, time) AS change_type
        FROM git.file_changes
        GROUP BY path
    )
    GROUP BY path
    HAVING (argMax(change_type, last_time) != 2) AND NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)') ORDER BY path
)

┌─uniq(path)─┐
│      18559 │
└────────────┘
1 row in set. Elapsed: 0.089 sec. Processed 532.10 thousand rows, 8.68 MB (6.01 million rows/s., 97.99 MB/s.)
```

请注意，我们在导入过程中跳过了若干目录，例如：

`--skip-paths 'generated\.cpp|^(contrib|docs?|website|libs/(libcityhash|liblz4|libdivide|libvectorclass|libdouble-conversion|libcpuid|libzstd|libfarmhash|libmetrohash|libpoco|libwidechar_width))/'`

将此模式应用于 `git list-files` 时，会得到 18155 个结果。

```bash
git ls-files | grep -v -E 'generated\.cpp|^(contrib|docs?|website|libs/(libcityhash|liblz4|libdivide|libvectorclass|libdouble-conversion|libcpuid|libzstd|libfarmhash|libmetrohash|libpoco|libwidechar_width))/' | wc -l
   18155
```

**因此，我们当前的方案只是对当前文件的一种估计**

这里的差异是由以下几个因素引起的：


* 文件重命名可能会与对该文件的其他修改同时发生。这些会在 `file_changes` 中被列为单独的事件，但具有相同的时间戳。`argMax` 函数无法区分这些事件——它只会选取第一个值。插入记录的自然顺序（这是确定正确顺序的唯一手段）在 union 操作中不会被保留，从而可能选中某个修改事件。例如，在下方示例中，`src/Functions/geometryFromColumn.h` 文件在被重命名为 `src/Functions/geometryConverters.h` 之前进行了多次修改。我们当前的解决方案可能会将某个 Modify 事件选作最新更改，从而导致 `src/Functions/geometryFromColumn.h` 被保留下来。

[play](https://sql.clickhouse.com?query_id=SCXWMR9GBMJ9UNZYQXQBFA)

```sql
  SELECT
      change_type,
      path,
      old_path,
      time,
      commit_hash
  FROM git.file_changes
  WHERE (path = 'src/Functions/geometryFromColumn.h') OR (old_path = 'src/Functions/geometryFromColumn.h')

  ┌─change_type─┬─path───────────────────────────────┬─old_path───────────────────────────┬────────────────time─┬─commit_hash──────────────────────────────┐
  │ Add         │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 9376b676e9a9bb8911b872e1887da85a45f7479d │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 6d59be5ea4768034f6526f7f9813062e0c369f7b │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 33acc2aa5dc091a7cb948f78c558529789b2bad8 │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 78e0db268ceadc42f82bc63a77ee1a4da6002463 │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 14a891057d292a164c4179bfddaef45a74eaf83a │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ d0d6e6953c2a2af9fb2300921ff96b9362f22edb │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ fe8382521139a58c0ba277eb848e88894658db66 │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ 3be3d5cde8788165bc0558f1e2a22568311c3103 │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ afad9bf4d0a55ed52a3f55483bc0973456e10a56 │
  │ Modify      │ src/Functions/geometryFromColumn.h │                                    │ 2021-03-11 12:08:16 │ e3290ecc78ca3ea82b49ebcda22b5d3a4df154e6 │
  │ Rename      │ src/Functions/geometryConverters.h │ src/Functions/geometryFromColumn.h │ 2021-03-11 12:08:16 │ 125945769586baf6ffd15919b29565b1b2a63218 │
  └─────────────┴────────────────────────────────────┴────────────────────────────────────┴─────────────────────┴──────────────────────────────────────────┘
  11 rows in set. Elapsed: 0.030 sec. Processed 266.05 thousand rows, 6.61 MB (8.89 million rows/s., 220.82 MB/s.)
```

* 提交历史存在缺失——缺少删除事件。来源和原因有待确定。

这些差异不应对我们的分析产生实质性影响。**我们欢迎对此查询的改进版本**。


### 列出修改最多的文件 {#list-files-with-most-modifications}

在仅统计当前版本文件的前提下，我们将删除和新增行数之和视为修改次数。

[play](https://sql.clickhouse.com?query_id=MHXPSBNPTDMJYR3OYSXVR7)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    sum(lines_added) + sum(lines_deleted) AS modifications
FROM git.file_changes
WHERE (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
GROUP BY path
ORDER BY modifications DESC
LIMIT 10

┌─path───────────────────────────────────────────────────┬─modifications─┐
│ src/Storages/StorageReplicatedMergeTree.cpp            │         21871 │
│ src/Storages/MergeTree/MergeTreeData.cpp               │         17709 │
│ programs/client/Client.cpp                             │         15882 │
│ src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp │         14249 │
│ src/Interpreters/InterpreterSelectQuery.cpp            │         12636 │
│ src/Parsers/ExpressionListParsers.cpp                  │         11794 │
│ src/Analyzer/QueryAnalysisPass.cpp                     │         11760 │
│ src/Coordination/KeeperStorage.cpp                     │         10225 │
│ src/Functions/FunctionsConversion.h                    │          9247 │
│ src/Parsers/ExpressionElementParsers.cpp               │          8197 │
└────────────────────────────────────────────────────────┴───────────────┘

10 rows in set. Elapsed: 0.134 sec. Processed 798.15 thousand rows, 16.46 MB (5.95 million rows/s., 122.62 MB/s.)
```


### 通常在一周中的哪一天产生提交记录？ {#what-day-of-the-week-do-commits-usually-occur}

[运行](https://sql.clickhouse.com?query_id=GED2STFSYJDRAA59H8RLIV)

```sql
SELECT
    day_of_week,
    count() AS c
FROM git.commits
GROUP BY dayOfWeek(time) AS day_of_week

┌─day_of_week─┬─────c─┐
│           1 │ 10575 │
│           2 │ 10645 │
│           3 │ 10748 │
│           4 │ 10944 │
│           5 │ 10090 │
│           6 │  4617 │
│           7 │  5166 │
└─────────────┴───────┘
7 rows in set. Elapsed: 0.262 sec. Processed 62.78 thousand rows, 251.14 KB (239.73 thousand rows/s., 958.93 KB/s.)
```

这很合理，周五的生产力会有所下降。很高兴看到大家在周末也提交代码！非常感谢所有贡献者！


### 子目录/文件的变更历史——行数、提交次数和贡献者数量随时间的变化 {#history-of-subdirectoryfile---number-of-lines-commits-and-contributors-over-time}

如果不加过滤，这将产生一个庞大的查询结果，既不现实展示出来，也难以可视化。因此，在下面的示例中，可以按文件或子目录进行过滤。这里我们使用 `toStartOfWeek` 函数按周分组——可根据需要进行调整。

[play](https://sql.clickhouse.com?query_id=REZRXDVU7CAWT5WKNJSTNY)

```sql
SELECT
    week,
    sum(lines_added) AS lines_added,
    sum(lines_deleted) AS lines_deleted,
    uniq(commit_hash) AS num_commits,
    uniq(author) AS authors
FROM git.file_changes
WHERE path LIKE 'src/Storages%'
GROUP BY toStartOfWeek(time) AS week
ORDER BY week ASC
LIMIT 10

┌───────week─┬─lines_added─┬─lines_deleted─┬─num_commits─┬─authors─┐
│ 2020-03-29 │          49 │            35 │           4 │       3 │
│ 2020-04-05 │         940 │           601 │          55 │      14 │
│ 2020-04-12 │        1472 │           607 │          32 │      11 │
│ 2020-04-19 │         917 │           841 │          39 │      12 │
│ 2020-04-26 │        1067 │           626 │          36 │      10 │
│ 2020-05-03 │         514 │           435 │          27 │      10 │
│ 2020-05-10 │        2552 │           537 │          48 │      12 │
│ 2020-05-17 │        3585 │          1913 │          83 │       9 │
│ 2020-05-24 │        2851 │          1812 │          74 │      18 │
│ 2020-05-31 │        2771 │          2077 │          77 │      16 │
└────────────┴─────────────┴───────────────┴─────────────┴─────────┘
10 rows in set. Elapsed: 0.043 sec. Processed 266.05 thousand rows, 15.85 MB (6.12 million rows/s., 364.61 MB/s.)
```

这些数据非常适合进行可视化展示。下面我们使用 Superset。

**针对新增和删除的代码行：**

<Image img={superset_github_lines_added_deleted} alt="针对新增和删除的代码行" size="md" />

**针对提交和作者：**

<Image img={superset_commits_authors} alt="针对提交和作者" size="md" />


### 列出作者数量最多的文件 {#list-files-with-maximum-number-of-authors}

仅统计当前仍存在的文件。

[play](https://sql.clickhouse.com?query_id=CYQFNQNK9TAMPU2OZ8KG5Y)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    uniq(author) AS num_authors
FROM git.file_changes
WHERE path IN (current_files)
GROUP BY path
ORDER BY num_authors DESC
LIMIT 10

┌─path────────────────────────────────────────┬─num_authors─┐
│ src/Core/Settings.h                         │         127 │
│ CMakeLists.txt                              │          96 │
│ .gitmodules                                 │          85 │
│ src/Storages/MergeTree/MergeTreeData.cpp    │          72 │
│ src/CMakeLists.txt                          │          71 │
│ programs/server/Server.cpp                  │          70 │
│ src/Interpreters/Context.cpp                │          64 │
│ src/Storages/StorageReplicatedMergeTree.cpp │          63 │
│ src/Common/ErrorCodes.cpp                   │          61 │
│ src/Interpreters/InterpreterSelectQuery.cpp │          59 │
└─────────────────────────────────────────────┴─────────────┘

10 rows in set. Elapsed: 0.239 sec. Processed 798.15 thousand rows, 14.13 MB (3.35 million rows/s., 59.22 MB/s.)
```


### 代码库中历史最久的代码行 {#oldest-lines-of-code-in-the-repository}

仅包含当前仍存在的文件。

[试一试](https://sql.clickhouse.com?query_id=VWPBPGRZVGTHOCQYWNQZNT)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    any(path) AS file_path,
    line,
    max(time) AS latest_change,
    any(file_change_type)
FROM git.line_changes
WHERE path IN (current_files)
GROUP BY line
ORDER BY latest_change ASC
LIMIT 10

┌─file_path───────────────────────────────────┬─line────────────────────────────────────────────────────────┬───────latest_change─┬─any(file_change_type)─┐
│ utils/compressor/test.sh                    │ ./compressor -d < compressor.snp > compressor2              │ 2011-06-17 22:19:39 │ Modify                │
│ utils/compressor/test.sh                    │ ./compressor < compressor > compressor.snp                  │ 2011-06-17 22:19:39 │ Modify                │
│ utils/compressor/test.sh                    │ ./compressor -d < compressor.qlz > compressor2              │ 2014-02-24 03:14:30 │ Add                   │
│ utils/compressor/test.sh                    │ ./compressor < compressor > compressor.qlz                  │ 2014-02-24 03:14:30 │ Add                   │
│ utils/config-processor/config-processor.cpp │ if (argc != 2)                                              │ 2014-02-26 19:10:00 │ Add                   │
│ utils/config-processor/config-processor.cpp │ std::cerr << "std::exception: " << e.what() << std::endl;   │ 2014-02-26 19:10:00 │ Add                   │
│ utils/config-processor/config-processor.cpp │ std::cerr << "Exception: " << e.displayText() << std::endl; │ 2014-02-26 19:10:00 │ Add                   │
│ utils/config-processor/config-processor.cpp │ Poco::XML::DOMWriter().writeNode(std::cout, document);      │ 2014-02-26 19:10:00 │ Add                   │
│ utils/config-processor/config-processor.cpp │ std::cerr << "Some exception" << std::endl;                 │ 2014-02-26 19:10:00 │ Add                   │
│ utils/config-processor/config-processor.cpp │ std::cerr << "usage: " << argv[0] << " path" << std::endl;  │ 2014-02-26 19:10:00 │ Add                   │
└─────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┴─────────────────────┴───────────────────────┘

10 rows in set. Elapsed: 1.101 sec. Processed 8.07 million rows, 905.86 MB (7.33 million rows/s., 823.13 MB/s.)
```


### 历史最悠久的文件 {#files-with-longest-history}

仅包含当前仍存在的文件。

[play](https://sql.clickhouse.com?query_id=VWPBPGRZVGTHOCQYWNQZNT)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    count() AS c,
    path,
    max(time) AS latest_change
FROM git.file_changes
WHERE path IN (current_files)
GROUP BY path
ORDER BY c DESC
LIMIT 10

┌───c─┬─path────────────────────────────────────────┬───────latest_change─┐
│ 790 │ src/Storages/StorageReplicatedMergeTree.cpp │ 2022-10-30 16:30:51 │
│ 788 │ src/Storages/MergeTree/MergeTreeData.cpp    │ 2022-11-04 09:26:44 │
│ 752 │ src/Core/Settings.h                         │ 2022-10-25 11:35:25 │
│ 749 │ CMakeLists.txt                              │ 2022-10-05 21:00:49 │
│ 575 │ src/Interpreters/InterpreterSelectQuery.cpp │ 2022-11-01 10:20:10 │
│ 563 │ CHANGELOG.md                                │ 2022-10-27 08:19:50 │
│ 491 │ src/Interpreters/Context.cpp                │ 2022-10-25 12:26:29 │
│ 437 │ programs/server/Server.cpp                  │ 2022-10-21 12:25:19 │
│ 375 │ programs/client/Client.cpp                  │ 2022-11-03 03:16:55 │
│ 350 │ src/CMakeLists.txt                          │ 2022-10-24 09:22:37 │
└─────┴─────────────────────────────────────────────┴─────────────────────┘

10 rows in set. Elapsed: 0.124 sec. Processed 798.15 thousand rows, 14.71 MB (6.44 million rows/s., 118.61 MB/s.)
```

我们的核心数据结构 MergeTree 显然一直在持续演进，并且拥有悠久的演进与修改历史！


### 本月文档与代码贡献者分布情况 {#distribution-of-contributors-with-respect-to-docs-and-code-over-the-month}

**在数据采集期间，由于 `docs/` 目录的提交历史非常杂乱，我们对其中的变更进行了过滤。因此本查询结果并不精确。**

我们是否会在每月的某些时间点（例如发布前后）撰写更多文档？我们可以使用 `countIf` 函数来计算一个简单的比率，并使用 `bar` 函数对结果进行可视化。

[play](https://sql.clickhouse.com?query_id=BA4RZUXUHNQBH9YK7F2T9J)

```sql
SELECT
    day,
    bar(docs_ratio * 1000, 0, 100, 100) AS bar
FROM
(
    SELECT
        day,
        countIf(file_extension IN ('h', 'cpp', 'sql')) AS code,
        countIf(file_extension = 'md') AS docs,
        docs / (code + docs) AS docs_ratio
    FROM git.line_changes
    WHERE (sign = 1) AND (file_extension IN ('h', 'cpp', 'sql', 'md'))
    GROUP BY dayOfMonth(time) AS day
)

┌─day─┬─bar─────────────────────────────────────────────────────────────┐
│   1 │ ███████████████████████████████████▍                            │
│   2 │ ███████████████████████▋                                        │
│   3 │ ████████████████████████████████▋                               │
│   4 │ █████████████                                                   │
│   5 │ █████████████████████▎                                          │
│   6 │ ████████                                                        │
│   7 │ ███▋                                                            │
│   8 │ ████████▌                                                       │
│   9 │ ██████████████▎                                                 │
│  10 │ █████████████████▏                                              │
│  11 │ █████████████▎                                                  │
│  12 │ ███████████████████████████████████▋                            │
│  13 │ █████████████████████████████▎                                  │
│  14 │ ██████▋                                                         │
│  15 │ █████████████████████████████████████████▊                      │
│  16 │ ██████████▎                                                     │
│  17 │ ██████████████████████████████████████▋                         │
│  18 │ █████████████████████████████████▌                              │
│  19 │ ███████████                                                     │
│  20 │ █████████████████████████████████▊                              │
│  21 │ █████                                                           │
│  22 │ ███████████████████████▋                                        │
│  23 │ ███████████████████████████▌                                    │
│  24 │ ███████▌                                                        │
│  25 │ ██████████████████████████████████▎                             │
│  26 │ ███████████▏                                                    │
│  27 │ ███████████████████████████████████████████████████████████████ │
│  28 │ ████████████████████████████████████████████████████▏           │
│  29 │ ███▌                                                            │
│  30 │ ████████████████████████████████████████▎                       │
│  31 │ █████████████████████████████████▏                              │
└─────┴─────────────────────────────────────────────────────────────────┘

31 rows in set. Elapsed: 0.043 sec. Processed 7.54 million rows, 40.53 MB (176.71 million rows/s., 950.40 MB/s.)
```

也许在月底前后会略微高一些，不过总体上分布还是比较均匀的。需要再次说明的是，由于在数据写入期间使用了 docs 过滤器，这一结果并不可靠。


### 影响范围最广的作者 {#authors-with-the-most-diverse-impact}

这里的多样性指的是某位作者参与贡献过的不同文件数量。

[play](https://sql.clickhouse.com?query_id=MT8WBABUKYBYSBA78W5TML)

```sql
SELECT
    author,
    uniq(path) AS num_files
FROM git.file_changes
WHERE (change_type IN ('Add', 'Modify')) AND (file_extension IN ('h', 'cpp', 'sql'))
GROUP BY author
ORDER BY num_files DESC
LIMIT 10

┌─author─────────────┬─num_files─┐
│ Alexey Milovidov   │      8433 │
│ Nikolai Kochetov   │      3257 │
│ Vitaly Baranov     │      2316 │
│ Maksim Kita        │      2172 │
│ Azat Khuzhin       │      1988 │
│ alesapin           │      1818 │
│ Alexander Tokmakov │      1751 │
│ Amos Bird          │      1641 │
│ Ivan               │      1629 │
│ alexey-milovidov   │      1581 │
└────────────────────┴───────────┘

10 rows in set. Elapsed: 0.041 sec. Processed 266.05 thousand rows, 4.92 MB (6.56 million rows/s., 121.21 MB/s.)
```

让我们看看最近工作中谁的提交最为多样。我们不按日期过滤，而是限定在某位作者最近的 N 次提交上（这里我们使用的是 3，你也可以自行修改）：

[play](https://sql.clickhouse.com?query_id=4Q3D67FWRIVWTY8EIDDE5U)

```sql
SELECT
    author,
    sum(num_files_commit) AS num_files
FROM
(
    SELECT
        author,
        commit_hash,
        uniq(path) AS num_files_commit,
        max(time) AS commit_time
    FROM git.file_changes
    WHERE (change_type IN ('Add', 'Modify')) AND (file_extension IN ('h', 'cpp', 'sql'))
    GROUP BY
        author,
        commit_hash
    ORDER BY
        author ASC,
        commit_time DESC
    LIMIT 3 BY author
)
GROUP BY author
ORDER BY num_files DESC
LIMIT 10

┌─author───────────────┬─num_files─┐
│ Mikhail              │       782 │
│ Li Yin               │       553 │
│ Roman Peshkurov      │       119 │
│ Vladimir Smirnov     │        88 │
│ f1yegor              │        65 │
│ maiha                │        54 │
│ Vitaliy Lyudvichenko │        53 │
│ Pradeep Chhetri      │        40 │
│ Orivej Desh          │        38 │
│ liyang               │        36 │
└──────────────────────┴───────────┘

10 rows in set. Elapsed: 0.106 sec. Processed 266.05 thousand rows, 21.04 MB (2.52 million rows/s., 198.93 MB/s.)
```


### 某位作者的常用文件 {#favorite-files-for-an-author}

在这里，我们选择我们的创始人 [Alexey Milovidov](https://github.com/alexey-milovidov)，并将分析范围限定为当前存在的文件。

[play](https://sql.clickhouse.com?query_id=OKGZBACRHVGCRAGCZAJKMF)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    count() AS c
FROM git.file_changes
WHERE (author = 'Alexey Milovidov') AND (path IN (current_files))
GROUP BY path
ORDER BY c DESC
LIMIT 10

┌─path────────────────────────────────────────┬───c─┐
│ CMakeLists.txt                              │ 165 │
│ CHANGELOG.md                                │ 126 │
│ programs/server/Server.cpp                  │  73 │
│ src/Storages/MergeTree/MergeTreeData.cpp    │  71 │
│ src/Storages/StorageReplicatedMergeTree.cpp │  68 │
│ src/Core/Settings.h                         │  65 │
│ programs/client/Client.cpp                  │  57 │
│ programs/server/play.html                   │  48 │
│ .gitmodules                                 │  47 │
│ programs/install/Install.cpp                │  37 │
└─────────────────────────────────────────────┴─────┘

10 rows in set. Elapsed: 0.106 sec. Processed 798.15 thousand rows, 13.97 MB (7.51 million rows/s., 131.41 MB/s.)
```

这是合理的，因为 Alexey 一直负责维护变更日志。
但如果我们用文件的基础名称来识别他最受欢迎的文件呢？这样即使文件被重命名也没问题，并且应当更侧重于代码贡献。

[play](https://sql.clickhouse.com?query_id=P9PBDZGOSVTKXEXU73ZNAJ)

```sql
SELECT
    base,
    count() AS c
FROM git.file_changes
WHERE (author = 'Alexey Milovidov') AND (file_extension IN ('h', 'cpp', 'sql'))
GROUP BY basename(path) AS base
ORDER BY c DESC
LIMIT 10

┌─base───────────────────────────┬───c─┐
│ StorageReplicatedMergeTree.cpp │ 393 │
│ InterpreterSelectQuery.cpp     │ 299 │
│ Aggregator.cpp                 │ 297 │
│ Client.cpp                     │ 280 │
│ MergeTreeData.cpp              │ 274 │
│ Server.cpp                     │ 264 │
│ ExpressionAnalyzer.cpp         │ 259 │
│ StorageMergeTree.cpp           │ 239 │
│ Settings.h                     │ 225 │
│ TCPHandler.cpp                 │ 205 │
└────────────────────────────────┴─────┘
10 rows in set. Elapsed: 0.032 sec. Processed 266.05 thousand rows, 5.68 MB (8.22 million rows/s., 175.50 MB/s.)
```

这也许更能反映他的兴趣领域。


### 作者最少的最大文件 {#largest-files-with-lowest-number-of-authors}

为此，我们首先需要找出最大的文件。若要基于提交历史为每个文件做完整重建来估算大小，开销会非常高！

为了估算（假设我们只考虑当前存在的文件），我们将所有新增的行数求和，再减去删除的行数。然后就可以计算文件长度与作者数量之间的比值。

[play](https://sql.clickhouse.com?query_id=PVSDOHZYUMRDDUZFEYJC7J)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    sum(lines_added) - sum(lines_deleted) AS num_lines,
    uniqExact(author) AS num_authors,
    num_lines / num_authors AS lines_author_ratio
FROM git.file_changes
WHERE path IN (current_files)
GROUP BY path
ORDER BY lines_author_ratio DESC
LIMIT 10

┌─path──────────────────────────────────────────────────────────────────┬─num_lines─┬─num_authors─┬─lines_author_ratio─┐
│ src/Common/ClassificationDictionaries/emotional_dictionary_rus.txt    │    148590 │           1 │             148590 │
│ src/Functions/ClassificationDictionaries/emotional_dictionary_rus.txt │     55533 │           1 │              55533 │
│ src/Functions/ClassificationDictionaries/charset_freq.txt             │     35722 │           1 │              35722 │
│ src/Common/ClassificationDictionaries/charset_freq.txt                │     35722 │           1 │              35722 │
│ tests/integration/test_storage_meilisearch/movies.json                │     19549 │           1 │              19549 │
│ tests/queries/0_stateless/02364_multiSearch_function_family.reference │     12874 │           1 │              12874 │
│ src/Functions/ClassificationDictionaries/programming_freq.txt         │      9434 │           1 │               9434 │
│ src/Common/ClassificationDictionaries/programming_freq.txt            │      9434 │           1 │               9434 │
│ tests/performance/explain_ast.xml                                     │      5911 │           1 │               5911 │
│ src/Analyzer/QueryAnalysisPass.cpp                                    │      5686 │           1 │               5686 │
└───────────────────────────────────────────────────────────────────────┴───────────┴─────────────┴────────────────────┘

10 rows in set. Elapsed: 0.138 sec. Processed 798.15 thousand rows, 16.57 MB (5.79 million rows/s., 120.11 MB/s.)
```

文本字典可能不太现实，因此先通过文件扩展名过滤，只统计代码文件！

[play](https://sql.clickhouse.com?query_id=BZHGWUIZMPZZUHS5XRBK2M)


```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    sum(lines_added) - sum(lines_deleted) AS num_lines,
    uniqExact(author) AS num_authors,
    num_lines / num_authors AS lines_author_ratio
FROM git.file_changes
WHERE (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
GROUP BY path
ORDER BY lines_author_ratio DESC
LIMIT 10

┌─path──────────────────────────────────┬─num_lines─┬─num_authors─┬─lines_author_ratio─┐
│ src/Analyzer/QueryAnalysisPass.cpp    │      5686 │           1 │               5686 │
│ src/Analyzer/QueryTreeBuilder.cpp     │       880 │           1 │                880 │
│ src/Planner/Planner.cpp               │       873 │           1 │                873 │
│ src/Backups/RestorerFromBackup.cpp    │       869 │           1 │                869 │
│ utils/memcpy-bench/FastMemcpy.h       │       770 │           1 │                770 │
│ src/Planner/PlannerActionsVisitor.cpp │       765 │           1 │                765 │
│ src/Functions/sphinxstemen.cpp        │       728 │           1 │                728 │
│ src/Planner/PlannerJoinTree.cpp       │       708 │           1 │                708 │
│ src/Planner/PlannerJoins.cpp          │       695 │           1 │                695 │
│ src/Analyzer/QueryNode.h              │       607 │           1 │                607 │
└───────────────────────────────────────┴───────────┴─────────────┴────────────────────┘
10 rows in set. Elapsed: 0.140 sec. Processed 798.15 thousand rows, 16.84 MB (5.70 million rows/s., 120.32 MB/s.)
```

这里存在一定的“最近性偏差”——较新的文件被提交变更的机会更少。如果我们只看至少已有 1 年历史的文件呢？

[play](https://sql.clickhouse.com?query_id=RMHHZEDHFUCBGRQVQA2732)


```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    min(time) AS min_date,
    path,
    sum(lines_added) - sum(lines_deleted) AS num_lines,
    uniqExact(author) AS num_authors,
    num_lines / num_authors AS lines_author_ratio
FROM git.file_changes
WHERE (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
GROUP BY path
HAVING min_date <= (now() - toIntervalYear(1))
ORDER BY lines_author_ratio DESC
LIMIT 10

┌────────────min_date─┬─path───────────────────────────────────────────────────────────┬─num_lines─┬─num_authors─┬─lines_author_ratio─┐
│ 2021-03-08 07:00:54 │ utils/memcpy-bench/FastMemcpy.h                                │       770 │           1 │                770 │
│ 2021-05-04 13:47:34 │ src/Functions/sphinxstemen.cpp                                 │       728 │           1 │                728 │
│ 2021-03-14 16:52:51 │ utils/memcpy-bench/glibc/dwarf2.h                              │       592 │           1 │                592 │
│ 2021-03-08 09:04:52 │ utils/memcpy-bench/FastMemcpy_Avx.h                            │       496 │           1 │                496 │
│ 2020-10-19 01:10:50 │ tests/queries/0_stateless/01518_nullable_aggregate_states2.sql │       411 │           1 │                411 │
│ 2020-11-24 14:53:34 │ programs/server/GRPCHandler.cpp                                │       399 │           1 │                399 │
│ 2021-03-09 14:10:28 │ src/DataTypes/Serializations/SerializationSparse.cpp           │       363 │           1 │                363 │
│ 2021-08-20 15:06:57 │ src/Functions/vectorFunctions.cpp                              │      1327 │           4 │             331.75 │
│ 2020-08-04 03:26:23 │ src/Interpreters/MySQL/CreateQueryConvertVisitor.cpp           │       311 │           1 │                311 │
│ 2020-11-06 15:45:13 │ src/Storages/Rocksdb/StorageEmbeddedRocksdb.cpp                │       611 │           2 │              305.5 │
└─────────────────────┴────────────────────────────────────────────────────────────────┴───────────┴─────────────┴────────────────────┘

10 rows in set. Elapsed: 0.143 sec. Processed 798.15 thousand rows, 18.00 MB (5.58 million rows/s., 125.87 MB/s.)
```


### 提交次数和代码行数按时间分布；按星期几、按作者；针对特定子目录 {#commits-and-lines-of-code-distribution-by-time-by-weekday-by-author-for-specific-subdirectories}

这里按星期几统计新增和删除的代码行数。在本例中，我们关注 [Functions 目录](https://github.com/ClickHouse/ClickHouse/tree/master/src/Functions)

[play](https://sql.clickhouse.com?query_id=PF3KEMYG5CVLJGCFYQEGB1)

```sql
SELECT
    dayOfWeek,
    uniq(commit_hash) AS commits,
    sum(lines_added) AS lines_added,
    sum(lines_deleted) AS lines_deleted
FROM git.file_changes
WHERE path LIKE 'src/Functions%'
GROUP BY toDayOfWeek(time) AS dayOfWeek

┌─dayOfWeek─┬─commits─┬─lines_added─┬─lines_deleted─┐
│         1 │     476 │       24619 │         15782 │
│         2 │     434 │       18098 │          9938 │
│         3 │     496 │       26562 │         20883 │
│         4 │     587 │       65674 │         18862 │
│         5 │     504 │       85917 │         14518 │
│         6 │     314 │       13604 │         10144 │
│         7 │     294 │       11938 │          6451 │
└───────────┴─────────┴─────────────┴───────────────┘

7 rows in set. Elapsed: 0.034 sec. Processed 266.05 thousand rows, 14.66 MB (7.73 million rows/s., 425.56 MB/s.)
```

以及按一天中的时间段，

[play](https://sql.clickhouse.com?query_id=Q4VDVKEGHHRBCUJHNCVTF1)


```sql
SELECT
    hourOfDay,
    uniq(commit_hash) AS commits,
    sum(lines_added) AS lines_added,
    sum(lines_deleted) AS lines_deleted
FROM git.file_changes
WHERE path LIKE 'src/Functions%'
GROUP BY toHour(time) AS hourOfDay

┌─hourOfDay─┬─commits─┬─lines_added─┬─lines_deleted─┐
│         0 │      71 │        4169 │          3404 │
│         1 │      90 │        2174 │          1927 │
│         2 │      65 │        2343 │          1515 │
│         3 │      76 │        2552 │           493 │
│         4 │      62 │        1480 │          1304 │
│         5 │      38 │        1644 │           253 │
│         6 │     104 │        4434 │          2979 │
│         7 │     117 │        4171 │          1678 │
│         8 │     106 │        4604 │          4673 │
│         9 │     135 │       60550 │          2678 │
│        10 │     149 │        6133 │          3482 │
│        11 │     182 │        8040 │          3833 │
│        12 │     209 │       29428 │         15040 │
│        13 │     187 │       10204 │          5491 │
│        14 │     204 │        9028 │          6060 │
│        15 │     231 │       15179 │         10077 │
│        16 │     196 │        9568 │          5925 │
│        17 │     138 │        4941 │          3849 │
│        18 │     123 │        4193 │          3036 │
│        19 │     165 │        8817 │          6646 │
│        20 │     140 │        3749 │          2379 │
│        21 │     132 │       41585 │          4182 │
│        22 │      85 │        4094 │          3955 │
│        23 │     100 │        3332 │          1719 │
└───────────┴─────────┴─────────────┴───────────────┘

24 rows in set. Elapsed: 0.039 sec. Processed 266.05 thousand rows, 14.66 MB (6.77 million rows/s., 372.89 MB/s.)
```

考虑到我们的大部分开发团队位于阿姆斯特丹，这种分布是合理的。`bar` 函数可以帮助我们将这些分布可视化：

[play](https://sql.clickhouse.com?query_id=9AZ8CENV8N91YGW7T6IB68)


```sql
SELECT
    hourOfDay,
    bar(commits, 0, 400, 50) AS commits,
    bar(lines_added, 0, 30000, 50) AS lines_added,
    bar(lines_deleted, 0, 15000, 50) AS lines_deleted
FROM
(
    SELECT
        hourOfDay,
        uniq(commit_hash) AS commits,
        sum(lines_added) AS lines_added,
        sum(lines_deleted) AS lines_deleted
    FROM git.file_changes
    WHERE path LIKE 'src/Functions%'
    GROUP BY toHour(time) AS hourOfDay
)

┌─hourOfDay─┬─commits───────────────────────┬─lines_added────────────────────────────────────────┬─lines_deleted──────────────────────────────────────┐
│         0 │ ████████▊                     │ ██████▊                                            │ ███████████▎                                       │
│         1 │ ███████████▎                  │ ███▌                                               │ ██████▍                                            │
│         2 │ ████████                      │ ███▊                                               │ █████                                              │
│         3 │ █████████▌                    │ ████▎                                              │ █▋                                                 │
│         4 │ ███████▋                      │ ██▍                                                │ ████▎                                              │
│         5 │ ████▋                         │ ██▋                                                │ ▋                                                  │
│         6 │ █████████████                 │ ███████▍                                           │ █████████▊                                         │
│         7 │ ██████████████▋               │ ██████▊                                            │ █████▌                                             │
│         8 │ █████████████▎                │ ███████▋                                           │ ███████████████▌                                   │
│         9 │ ████████████████▊             │ ██████████████████████████████████████████████████ │ ████████▊                                          │
│        10 │ ██████████████████▋           │ ██████████▏                                        │ ███████████▌                                       │
│        11 │ ██████████████████████▋       │ █████████████▍                                     │ ████████████▋                                      │
│        12 │ ██████████████████████████    │ █████████████████████████████████████████████████  │ ██████████████████████████████████████████████████ │
│        13 │ ███████████████████████▍      │ █████████████████                                  │ ██████████████████▎                                │
│        14 │ █████████████████████████▌    │ ███████████████                                    │ ████████████████████▏                              │
│        15 │ ████████████████████████████▊ │ █████████████████████████▎                         │ █████████████████████████████████▌                 │
│        16 │ ████████████████████████▌     │ ███████████████▊                                   │ ███████████████████▋                               │
│        17 │ █████████████████▎            │ ████████▏                                          │ ████████████▋                                      │
│        18 │ ███████████████▍              │ ██████▊                                            │ ██████████                                         │
│        19 │ ████████████████████▋         │ ██████████████▋                                    │ ██████████████████████▏                            │
│        20 │ █████████████████▌            │ ██████▏                                            │ ███████▊                                           │
│        21 │ ████████████████▌             │ ██████████████████████████████████████████████████ │ █████████████▊                                     │
│        22 │ ██████████▋                   │ ██████▋                                            │ █████████████▏                                     │
│        23 │ ████████████▌                 │ █████▌                                             │ █████▋                                             │
└───────────┴───────────────────────────────┴────────────────────────────────────────────────────┴────────────────────────────────────────────────────┘

24 rows in set. Elapsed: 0.038 sec. Processed 266.05 thousand rows, 14.66 MB (7.09 million rows/s., 390.69 MB/s.)
```


### 展示作者之间代码重写关系的矩阵，用于显示哪些作者倾向于重写其他作者的代码 {#matrix-of-authors-that-shows-what-authors-tends-to-rewrite-another-authors-code}

`sign = -1` 表示代码删除。我们不统计标点符号的变更和空行的插入。

[play](https://sql.clickhouse.com?query_id=448O8GWAHY3EM6ZZ7AGLAM)

```sql
SELECT
    prev_author || '(a)' AS add_author,
    author  || '(d)' AS delete_author,
    count() AS c
FROM git.line_changes
WHERE (sign = -1) AND (file_extension IN ('h', 'cpp')) AND (line_type NOT IN ('Punct', 'Empty')) AND (author != prev_author) AND (prev_author != '')
GROUP BY
    prev_author,
    author
ORDER BY c DESC
LIMIT 1 BY prev_author
LIMIT 100

┌─prev_author──────────┬─author───────────┬─────c─┐
│ Ivan                 │ Alexey Milovidov │ 18554 │
│ Alexey Arno          │ Alexey Milovidov │ 18475 │
│ Michael Kolupaev     │ Alexey Milovidov │ 14135 │
│ Alexey Milovidov     │ Nikolai Kochetov │ 13435 │
│ Andrey Mironov       │ Alexey Milovidov │ 10418 │
│ proller              │ Alexey Milovidov │  7280 │
│ Nikolai Kochetov     │ Alexey Milovidov │  6806 │
│ alexey-milovidov     │ Alexey Milovidov │  5027 │
│ Vitaliy Lyudvichenko │ Alexey Milovidov │  4390 │
│ Amos Bird            │ Ivan Lezhankin   │  3125 │
│ f1yegor              │ Alexey Milovidov │  3119 │
│ Pavel Kartavyy       │ Alexey Milovidov │  3087 │
│ Alexey Zatelepin     │ Alexey Milovidov │  2978 │
│ alesapin             │ Alexey Milovidov │  2949 │
│ Sergey Fedorov       │ Alexey Milovidov │  2727 │
│ Ivan Lezhankin       │ Alexey Milovidov │  2618 │
│ Vasily Nemkov        │ Alexey Milovidov │  2547 │
│ Alexander Tokmakov   │ Alexey Milovidov │  2493 │
│ Nikita Vasilev       │ Maksim Kita      │  2420 │
│ Anton Popov          │ Amos Bird        │  2127 │
└──────────────────────┴──────────────────┴───────┘

20 rows in set. Elapsed: 0.098 sec. Processed 7.54 million rows, 42.16 MB (76.67 million rows/s., 428.99 MB/s.)
```

Sankey 图（SuperSet）可以非常直观地展示这一点。注意我们将 `LIMIT BY` 提高到了 3，以便为每位作者获取前 3 名删除其代码的人，从而增加可视化结果的多样性。

<Image img={superset_authors_matrix} alt="Superset authors matrix" size="md" />

Alexey 显然很喜欢删除别人的代码。让我们把他排除在外，以获得更均衡的代码删除视图。

<Image img={superset_authors_matrix_v2} alt="Superset authors matrix v2" size="md" />


### 按一周中的每一天来看，贡献占比最高的是谁？ {#who-is-the-highest-percentage-contributor-per-day-of-week}

如果我们只按提交次数来算：

[play](https://sql.clickhouse.com?query_id=WXPKFJCAHOKYKEVTWNFVCY)

```sql
SELECT
    day_of_week,
    author,
    count() AS c
FROM git.commits
GROUP BY
    dayOfWeek(time) AS day_of_week,
    author
ORDER BY
    day_of_week ASC,
    c DESC
LIMIT 1 BY day_of_week

┌─day_of_week─┬─author───────────┬────c─┐
│           1 │ Alexey Milovidov │ 2204 │
│           2 │ Alexey Milovidov │ 1588 │
│           3 │ Alexey Milovidov │ 1725 │
│           4 │ Alexey Milovidov │ 1915 │
│           5 │ Alexey Milovidov │ 1940 │
│           6 │ Alexey Milovidov │ 1851 │
│           7 │ Alexey Milovidov │ 2400 │
└─────────────┴──────────────────┴──────┘

7 rows in set. Elapsed: 0.012 sec. Processed 62.78 thousand rows, 395.47 KB (5.44 million rows/s., 34.27 MB/s.)
```

好吧，这里资历最深的贡献者——我们的创始人 Alexey——可能会有一些优势。我们将分析范围限制在过去一年。

[play](https://sql.clickhouse.com?query_id=8YRJGHFTNJAWJ96XCJKKEH)

```sql
SELECT
    day_of_week,
    author,
    count() AS c
FROM git.commits
WHERE time > (now() - toIntervalYear(1))
GROUP BY
    dayOfWeek(time) AS day_of_week,
    author
ORDER BY
    day_of_week ASC,
    c DESC
LIMIT 1 BY day_of_week

┌─day_of_week─┬─author───────────┬───c─┐
│           1 │ Alexey Milovidov │ 198 │
│           2 │ alesapin         │ 162 │
│           3 │ alesapin         │ 163 │
│           4 │ Azat Khuzhin     │ 166 │
│           5 │ alesapin         │ 191 │
│           6 │ Alexey Milovidov │ 179 │
│           7 │ Alexey Milovidov │ 243 │
└─────────────┴──────────────────┴─────┘

7 rows in set. Elapsed: 0.004 sec. Processed 21.82 thousand rows, 140.02 KB (4.88 million rows/s., 31.29 MB/s.)
```

这仍然有些过于简单，无法体现人们的实际工作情况。

一个更好的度量方式可能是：在过去一年中，对每一天计算，当天贡献占该日总工作量比例最高的是谁。请注意，我们将删除代码和添加代码视为同等贡献。

[play](https://sql.clickhouse.com?query_id=VQF4KMRDSUEXGS1JFVDJHV)


```sql
SELECT
    top_author.day_of_week,
    top_author.author,
    top_author.author_work / all_work.total_work AS top_author_percent
FROM
(
    SELECT
        day_of_week,
        author,
        sum(lines_added) + sum(lines_deleted) AS author_work
    FROM git.file_changes
    WHERE time > (now() - toIntervalYear(1))
    GROUP BY
        author,
        dayOfWeek(time) AS day_of_week
    ORDER BY
        day_of_week ASC,
        author_work DESC
    LIMIT 1 BY day_of_week
) AS top_author
INNER JOIN
(
    SELECT
        day_of_week,
        sum(lines_added) + sum(lines_deleted) AS total_work
    FROM git.file_changes
    WHERE time > (now() - toIntervalYear(1))
    GROUP BY dayOfWeek(time) AS day_of_week
) AS all_work USING (day_of_week)

┌─day_of_week─┬─author──────────────┬──top_author_percent─┐
│           1 │ Alexey Milovidov    │  0.3168282877768332 │
│           2 │ Mikhail f. Shiryaev │  0.3523434231193969 │
│           3 │ vdimir              │ 0.11859742484577324 │
│           4 │ Nikolay Degterinsky │ 0.34577318920318467 │
│           5 │ Alexey Milovidov    │ 0.13208704423684223 │
│           6 │ Alexey Milovidov    │ 0.18895257783624633 │
│           7 │ Robert Schulze      │  0.3617405888930302 │
└─────────────┴─────────────────────┴─────────────────────┘

7 rows in set. Elapsed: 0.014 sec. Processed 106.12 thousand rows, 1.38 MB (7.61 million rows/s., 98.65 MB/s.)
```


### 代码在仓库中的年龄分布 {#distribution-of-code-age-across-repository}

我们将分析范围限制为当前存在的文件。为简洁起见，我们将结果限制为目录深度 2，并且每个根文件夹最多显示 5 个文件。可根据需要进行调整。

[play](https://sql.clickhouse.com?query_id=6YWAUQYPZINZDJGBEZBNWG)

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    concat(root, '/', sub_folder) AS folder,
    round(avg(days_present)) AS avg_age_of_files,
    min(days_present) AS min_age_files,
    max(days_present) AS max_age_files,
    count() AS c
FROM
(
    SELECT
        path,
        dateDiff('day', min(time), toDate('2022-11-03')) AS days_present
    FROM git.file_changes
    WHERE (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
    GROUP BY path
)
GROUP BY
    splitByChar('/', path)[1] AS root,
    splitByChar('/', path)[2] AS sub_folder
ORDER BY
    root ASC,
    c DESC
LIMIT 5 BY root

┌─folder───────────────────────────┬─avg_age_of_files─┬─min_age_files─┬─max_age_files─┬────c─┐
│ base/base                        │              387 │           201 │           397 │   84 │
│ base/glibc-compatibility         │              887 │            59 │           993 │   19 │
│ base/consistent-hashing          │              993 │           993 │           993 │    5 │
│ base/widechar_width              │              993 │           993 │           993 │    2 │
│ base/consistent-hashing-sumbur   │              993 │           993 │           993 │    2 │
│ docker/test                      │             1043 │          1043 │          1043 │    1 │
│ programs/odbc-bridge             │              835 │            91 │           945 │   25 │
│ programs/copier                  │              587 │            14 │           945 │   22 │
│ programs/library-bridge          │              155 │            47 │           608 │   21 │
│ programs/disks                   │              144 │            62 │           150 │   14 │
│ programs/server                  │              874 │           709 │           945 │   10 │
│ rust/BLAKE3                      │               52 │            52 │            52 │    1 │
│ src/Functions                    │              752 │             0 │           944 │  809 │
│ src/Storages                     │              700 │             8 │           944 │  736 │
│ src/Interpreters                 │              684 │             3 │           944 │  490 │
│ src/Processors                   │              703 │            44 │           944 │  482 │
│ src/Common                       │              673 │             7 │           944 │  473 │
│ tests/queries                    │              674 │            -5 │           945 │ 3777 │
│ tests/integration                │              656 │           132 │           945 │    4 │
│ utils/memcpy-bench               │              601 │           599 │           605 │   10 │
│ utils/keeper-bench               │              570 │           569 │           570 │    7 │
│ utils/durability-test            │              793 │           793 │           793 │    4 │
│ utils/self-extracting-executable │              143 │           143 │           143 │    3 │
│ utils/self-extr-exec             │              224 │           224 │           224 │    2 │
└──────────────────────────────────┴──────────────────┴───────────────┴───────────────┴──────┘

24 rows in set. Elapsed: 0.129 sec. Processed 798.15 thousand rows, 15.11 MB (6.19 million rows/s., 117.08 MB/s.)
```


### 某位作者编写的代码中，有多少百分比被其他作者删除了？ {#what-percentage-of-code-for-an-author-has-been-removed-by-other-authors}

对于这个问题，我们需要用被其他贡献者删除的该作者代码行总数，除以该作者编写的代码行数总和。

[play](https://sql.clickhouse.com?query_id=T4DTWTB36WFSEYAZLMGRNF)

```sql
SELECT
    k,
    written_code.c,
    removed_code.c,
    removed_code.c / written_code.c AS remove_ratio
FROM
(
    SELECT
        author AS k,
        count() AS c
    FROM git.line_changes
    WHERE (sign = 1) AND (file_extension IN ('h', 'cpp')) AND (line_type NOT IN ('Punct', 'Empty'))
    GROUP BY k
) AS written_code
INNER JOIN
(
    SELECT
        prev_author AS k,
        count() AS c
    FROM git.line_changes
    WHERE (sign = -1) AND (file_extension IN ('h', 'cpp')) AND (line_type NOT IN ('Punct', 'Empty')) AND (author != prev_author)
    GROUP BY k
) AS removed_code USING (k)
WHERE written_code.c > 1000
ORDER BY remove_ratio DESC
LIMIT 10

┌─k──────────────────┬─────c─┬─removed_code.c─┬───────remove_ratio─┐
│ Marek Vavruša      │  1458 │           1318 │ 0.9039780521262003 │
│ Ivan               │ 32715 │          27500 │ 0.8405930001528351 │
│ artpaul            │  3450 │           2840 │ 0.8231884057971014 │
│ Silviu Caragea     │  1542 │           1209 │ 0.7840466926070039 │
│ Ruslan             │  1027 │            802 │ 0.7809152872444012 │
│ Tsarkova Anastasia │  1755 │           1364 │ 0.7772079772079772 │
│ Vyacheslav Alipov  │  3526 │           2727 │ 0.7733976176971072 │
│ Marek Vavruša      │  1467 │           1124 │ 0.7661895023858214 │
│ f1yegor            │  7194 │           5213 │ 0.7246316374756742 │
│ kreuzerkrieg       │  3406 │           2468 │  0.724603640634175 │
└────────────────────┴───────┴────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.126 sec. Processed 15.07 million rows, 73.51 MB (119.97 million rows/s., 585.16 MB/s.)
```


### 列出被重写次数最多的文件？ {#list-files-that-were-rewritten-most-number-of-times}

针对这个问题，一个最简单的思路是按路径统计每个文件的行修改次数（仅限当前仍存在的文件），并找出修改次数最多的那些文件，例如：

```sql
WITH current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    )
SELECT
    path,
    count() AS c
FROM git.line_changes
WHERE (file_extension IN ('h', 'cpp', 'sql')) AND (path IN (current_files))
GROUP BY path
ORDER BY c DESC
LIMIT 10

┌─path───────────────────────────────────────────────────┬─────c─┐
│ src/Storages/StorageReplicatedMergeTree.cpp            │ 21871 │
│ src/Storages/MergeTree/MergeTreeData.cpp               │ 17709 │
│ programs/client/Client.cpp                             │ 15882 │
│ src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp │ 14249 │
│ src/Interpreters/InterpreterSelectQuery.cpp            │ 12636 │
│ src/Parsers/ExpressionListParsers.cpp                  │ 11794 │
│ src/Analyzer/QueryAnalysisPass.cpp                     │ 11760 │
│ src/Coordination/KeeperStorage.cpp                     │ 10225 │
│ src/Functions/FunctionsConversion.h                    │  9247 │
│ src/Parsers/ExpressionElementParsers.cpp               │  8197 │
└────────────────────────────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.160 sec. Processed 8.07 million rows, 98.99 MB (50.49 million rows/s., 619.49 MB/s.)
```

然而，这并不能体现“重写”的概念，即在某次提交中，文件的大部分内容发生变化。这需要一个更复杂的查询。如果我们将重写定义为：超过 50% 的内容被删除，且超过 50% 的内容被新增，那么你可以根据自己对“重写”的理解来调整查询。

该查询仅针对当前存在的文件。我们通过按 `path` 和 `commit_hash` 分组来列出所有文件更改，返回新增和删除的行数。使用窗口函数，我们通过累积求和来估算任意时间点文件的总大小，并将每次变更对文件大小的影响估算为 `lines added - lines removed`。基于这一统计，我们可以计算每次变更中文件新增或删除的百分比。最后，我们统计每个文件中符合重写条件的文件变更次数，即 `(percent_add >= 0.5) AND (percent_delete >= 0.5) AND current_size > 50`。注意，我们要求文件行数大于 50，以避免文件早期的少量贡献被计为重写。这也避免了对非常小的文件产生偏差，因为这些文件更有可能被完全重写。

[play](https://sql.clickhouse.com?query_id=5PL1QLNSH6QQTR8H9HINNP)


```sql
WITH
    current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    ),
    changes AS
    (
        SELECT
            path,
            max(time) AS max_time,
            commit_hash,
            any(lines_added) AS num_added,
            any(lines_deleted) AS num_deleted,
            any(change_type) AS type
        FROM git.file_changes
        WHERE (change_type IN ('Add', 'Modify')) AND (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
        GROUP BY
            path,
            commit_hash
        ORDER BY
            path ASC,
            max_time ASC
    ),
    rewrites AS
    (
        SELECT
            path,
            commit_hash,
            max_time,
            type,
            num_added,
            num_deleted,
            sum(num_added - num_deleted) OVER (PARTITION BY path ORDER BY max_time ASC) AS current_size,
            if(current_size > 0, num_added / current_size, 0) AS percent_add,
            if(current_size > 0, num_deleted / current_size, 0) AS percent_delete
        FROM changes
    )
SELECT
    path,
    count() AS num_rewrites
FROM rewrites
WHERE (type = 'Modify') AND (percent_add >= 0.5) AND (percent_delete >= 0.5) AND (current_size > 50)
GROUP BY path
ORDER BY num_rewrites DESC
LIMIT 10

┌─path──────────────────────────────────────────────────┬─num_rewrites─┐
│ src/Storages/WindowView/StorageWindowView.cpp         │            8 │
│ src/Functions/array/arrayIndex.h                      │            7 │
│ src/Dictionaries/CacheDictionary.cpp                  │            6 │
│ src/Dictionaries/RangeHashedDictionary.cpp            │            5 │
│ programs/client/Client.cpp                            │            4 │
│ src/Functions/polygonPerimeter.cpp                    │            4 │
│ src/Functions/polygonsEquals.cpp                      │            4 │
│ src/Functions/polygonsWithin.cpp                      │            4 │
│ src/Processors/Formats/Impl/ArrowColumnToCHColumn.cpp │            4 │
│ src/Functions/polygonsSymDifference.cpp               │            4 │
└───────────────────────────────────────────────────────┴──────────────┘

10 rows in set. Elapsed: 0.299 sec. Processed 798.15 thousand rows, 31.52 MB (2.67 million rows/s., 105.29 MB/s.)
```


### 代码在仓库中最有可能被保留的是一周中的哪一天？ {#what-weekday-does-the-code-have-the-highest-chance-to-stay-in-the-repository}

为此，我们需要对每一行代码进行唯一标识。由于同一行内容可能在一个文件中多次出现，我们通过文件路径和行内容来进行估算。

我们对新增的代码行执行查询，并将其与被删除的代码行进行关联——只保留删除时间晚于添加时间的情况。这样我们就得到了已被删除的代码行，并可以据此计算这两个事件之间的时间间隔。

最后，我们在这个数据集上进行聚合，按一周中的星期几统计代码行在仓库中停留的平均天数。

[play](https://sql.clickhouse.com?query_id=GVF23LEZTNZI22BT8LZBBE)

```sql
SELECT
    day_of_week_added,
    count() AS num,
    avg(days_present) AS avg_days_present
FROM
(
    SELECT
        added_code.line,
        added_code.time AS added_day,
        dateDiff('day', added_code.time, removed_code.time) AS days_present
    FROM
    (
        SELECT
            path,
            line,
            max(time) AS time
        FROM git.line_changes
        WHERE (sign = 1) AND (line_type NOT IN ('Punct', 'Empty'))
        GROUP BY
            path,
            line
    ) AS added_code
    INNER JOIN
    (
        SELECT
            path,
            line,
            max(time) AS time
        FROM git.line_changes
        WHERE (sign = -1) AND (line_type NOT IN ('Punct', 'Empty'))
        GROUP BY
            path,
            line
    ) AS removed_code USING (path, line)
    WHERE removed_code.time > added_code.time
)
GROUP BY dayOfWeek(added_day) AS day_of_week_added

┌─day_of_week_added─┬────num─┬───avg_days_present─┐
│                 1 │ 171879 │ 193.81759260875384 │
│                 2 │ 141448 │  153.0931013517335 │
│                 3 │ 161230 │ 137.61553681076722 │
│                 4 │ 255728 │ 121.14149799787273 │
│                 5 │ 203907 │ 141.60181847606998 │
│                 6 │  62305 │ 202.43449161383518 │
│                 7 │  70904 │  220.0266134491707 │
└───────────────────┴────────┴────────────────────┘

7 rows in set. Elapsed: 3.965 sec. Processed 15.07 million rows, 1.92 GB (3.80 million rows/s., 483.50 MB/s.)
```


### 按平均代码存活时间排序的文件 {#files-sorted-by-average-code-age}

此查询使用与[代码在仓库中保留概率最高的是一周中的哪一天](#what-weekday-does-the-code-have-the-highest-chance-to-stay-in-the-repository)相同的原理——通过路径和行内容来唯一标识一行代码。
这使我们能够识别一行代码从被添加到被删除之间的时间。不过，我们只筛选当前仍存在的文件和代码行，并对每个文件中各行的时间取平均值。

[运行](https://sql.clickhouse.com?query_id=3CYYT7HEHWRFHVCM9JCKSU)

```sql
WITH
    current_files AS
    (
        SELECT path
        FROM
        (
            SELECT
                old_path AS path,
                max(time) AS last_time,
                2 AS change_type
            FROM git.file_changes
            GROUP BY old_path
            UNION ALL
            SELECT
                path,
                max(time) AS last_time,
                argMax(change_type, time) AS change_type
            FROM git.clickhouse_file_changes
            GROUP BY path
        )
        GROUP BY path
        HAVING (argMax(change_type, last_time) != 2) AND (NOT match(path, '(^dbms/)|(^libs/)|(^tests/testflows/)|(^programs/server/store/)'))
        ORDER BY path ASC
    ),
    lines_removed AS
    (
        SELECT
            added_code.path AS path,
            added_code.line,
            added_code.time AS added_day,
            dateDiff('day', added_code.time, removed_code.time) AS days_present
        FROM
        (
            SELECT
                path,
                line,
                max(time) AS time,
                any(file_extension) AS file_extension
            FROM git.line_changes
            WHERE (sign = 1) AND (line_type NOT IN ('Punct', 'Empty'))
            GROUP BY
                path,
                line
        ) AS added_code
        INNER JOIN
        (
            SELECT
                path,
                line,
                max(time) AS time
            FROM git.line_changes
            WHERE (sign = -1) AND (line_type NOT IN ('Punct', 'Empty'))
            GROUP BY
                path,
                line
        ) AS removed_code USING (path, line)
        WHERE (removed_code.time > added_code.time) AND (path IN (current_files)) AND (file_extension IN ('h', 'cpp', 'sql'))
    )
SELECT
    path,
    avg(days_present) AS avg_code_age
FROM lines_removed
GROUP BY path
ORDER BY avg_code_age DESC
LIMIT 10

┌─path────────────────────────────────────────────────────────────┬──────avg_code_age─┐
│ utils/corrector_utf8/corrector_utf8.cpp                         │ 1353.888888888889 │
│ tests/queries/0_stateless/01288_shard_max_network_bandwidth.sql │               881 │
│ src/Functions/replaceRegexpOne.cpp                              │               861 │
│ src/Functions/replaceRegexpAll.cpp                              │               861 │
│ src/Functions/replaceOne.cpp                                    │               861 │
│ utils/zookeeper-remove-by-list/main.cpp                         │            838.25 │
│ tests/queries/0_stateless/01356_state_resample.sql              │               819 │
│ tests/queries/0_stateless/01293_create_role.sql                 │               819 │
│ src/Functions/ReplaceStringImpl.h                               │               810 │
│ src/Interpreters/createBlockSelector.cpp                        │               795 │
└─────────────────────────────────────────────────────────────────┴───────────────────┘

10 rows in set. Elapsed: 3.134 sec. Processed 16.13 million rows, 1.83 GB (5.15 million rows/s., 582.99 MB/s.)
```


### 谁更倾向于编写更多测试 / CPP 代码 / 注释？ {#who-tends-to-write-more-tests--cpp-code--comments}

我们可以用几种方式来回答这个问题。聚焦在代码与测试的比例上，这条查询语句相对简单——统计对包含 `tests` 的文件夹的贡献次数，并计算其占总贡献次数的比例。

这里我们将查询限定为变更次数超过 20 次的用户，以聚焦于经常提交代码的用户，并避免一次性贡献带来的偏差。

[play](https://sql.clickhouse.com?query_id=JGKZSEQDPDTDKZXD3ZCGLE)

```sql
SELECT
    author,
    countIf((file_extension IN ('h', 'cpp', 'sql', 'sh', 'py', 'expect')) AND (path LIKE '%tests%')) AS test,
    countIf((file_extension IN ('h', 'cpp', 'sql')) AND (NOT (path LIKE '%tests%'))) AS code,
    code / (code + test) AS ratio_code
FROM git.clickhouse_file_changes
GROUP BY author
HAVING code > 20
ORDER BY code DESC
LIMIT 20

┌─author───────────────┬─test─┬──code─┬─────────ratio_code─┐
│ Alexey Milovidov     │ 6617 │ 41799 │ 0.8633303040317251 │
│ Nikolai Kochetov     │  916 │ 13361 │ 0.9358408629263851 │
│ alesapin             │ 2408 │  8796 │  0.785076758300607 │
│ kssenii              │  869 │  6769 │ 0.8862267609321812 │
│ Maksim Kita          │  799 │  5862 │ 0.8800480408347096 │
│ Alexander Tokmakov   │ 1472 │  5727 │ 0.7955271565495208 │
│ Vitaly Baranov       │ 1764 │  5521 │ 0.7578586135895676 │
│ Ivan Lezhankin       │  843 │  4698 │ 0.8478613968597726 │
│ Anton Popov          │  599 │  4346 │ 0.8788675429726996 │
│ Ivan                 │ 2630 │  4269 │ 0.6187853312074214 │
│ Azat Khuzhin         │ 1664 │  3697 │  0.689610147360567 │
│ Amos Bird            │  400 │  2901 │ 0.8788245986064829 │
│ proller              │ 1207 │  2377 │ 0.6632254464285714 │
│ chertus              │  453 │  2359 │ 0.8389046941678521 │
│ alexey-milovidov     │  303 │  2321 │ 0.8845274390243902 │
│ Alexey Arno          │  169 │  2310 │ 0.9318273497377975 │
│ Vitaliy Lyudvichenko │  334 │  2283 │ 0.8723729461215132 │
│ Robert Schulze       │  182 │  2196 │ 0.9234650967199327 │
│ CurtizJ              │  460 │  2158 │ 0.8242933537051184 │
│ Alexander Kuzmenkov  │  298 │  2092 │ 0.8753138075313808 │
└──────────────────────┴──────┴───────┴────────────────────┘

20 rows in set. Elapsed: 0.034 sec. Processed 266.05 thousand rows, 4.65 MB (7.93 million rows/s., 138.76 MB/s.)
```

我们可以将该分布绘制成直方图。

[play](https://sql.clickhouse.com?query_id=S5AJIIRGSUAY1JXEVHQDAK)


```sql
WITH (
        SELECT histogram(10)(ratio_code) AS hist
        FROM
        (
            SELECT
                author,
                countIf((file_extension IN ('h', 'cpp', 'sql', 'sh', 'py', 'expect')) AND (path LIKE '%tests%')) AS test,
                countIf((file_extension IN ('h', 'cpp', 'sql')) AND (NOT (path LIKE '%tests%'))) AS code,
                code / (code + test) AS ratio_code
            FROM git.clickhouse_file_changes
            GROUP BY author
            HAVING code > 20
            ORDER BY code DESC
            LIMIT 20
        )
    ) AS hist
SELECT
    arrayJoin(hist).1 AS lower,
    arrayJoin(hist).2 AS upper,
    bar(arrayJoin(hist).3, 0, 100, 500) AS bar

┌──────────────lower─┬──────────────upper─┬─bar───────────────────────────┐
│ 0.6187853312074214 │ 0.6410053888179964 │ █████                         │
│ 0.6410053888179964 │ 0.6764177968945693 │ █████                         │
│ 0.6764177968945693 │ 0.7237343804750673 │ █████                         │
│ 0.7237343804750673 │ 0.7740802855073157 │ █████▋                        │
│ 0.7740802855073157 │  0.807297655565091 │ ████████▋                     │
│  0.807297655565091 │ 0.8338381996094653 │ ██████▎                       │
│ 0.8338381996094653 │ 0.8533566747727687 │ ████████▋                     │
│ 0.8533566747727687 │  0.871392376017531 │ █████████▍                    │
│  0.871392376017531 │  0.904916108899021 │ ████████████████████████████▋ │
│  0.904916108899021 │ 0.9358408629263851 │ █████████████████▌            │
└────────────────────┴────────────────────┴───────────────────────────────┘
10 rows in set. Elapsed: 0.051 sec. Processed 266.05 thousand rows, 4.65 MB (5.24 million rows/s., 91.64 MB/s.)
```

大多数贡献者写的代码都比测试多，这是意料之中的事。

那么，在贡献代码时，谁写的注释最多呢？

[play](https://sql.clickhouse.com?query_id=EXPHDIURBTOXXOK1TGNNYD)


```sql
SELECT
    author,
    avg(ratio_comments) AS avg_ratio_comments,
    sum(code) AS code
FROM
(
    SELECT
        author,
        commit_hash,
        countIf(line_type = 'Comment') AS comments,
        countIf(line_type = 'Code') AS code,
        if(comments > 0, comments / (comments + code), 0) AS ratio_comments
    FROM git.clickhouse_line_changes
    GROUP BY
        author,
        commit_hash
)
GROUP BY author
ORDER BY code DESC
LIMIT 10
┌─author─────────────┬──avg_ratio_comments─┬────code─┐
│ Alexey Milovidov   │  0.1034915408309902 │ 1147196 │
│ s-kat              │  0.1361718900215362 │  614224 │
│ Nikolai Kochetov   │ 0.08722993407690126 │  218328 │
│ alesapin           │  0.1040477684726504 │  198082 │
│ Vitaly Baranov     │ 0.06446875712939285 │  161801 │
│ Maksim Kita        │ 0.06863376297549255 │  156381 │
│ Alexey Arno        │ 0.11252677608033655 │  146642 │
│ Vitaliy Zakaznikov │ 0.06199215397180561 │  138530 │
│ kssenii            │ 0.07455322590796751 │  131143 │
│ Artur              │ 0.12383737231074826 │  121484 │
└────────────────────┴─────────────────────┴─────────┘
10 rows in set. Elapsed: 0.290 sec. Processed 7.54 million rows, 394.57 MB (26.00 million rows/s., 1.36 GB/s.)
```

注意，我们是按代码贡献量排序的。对于我们所有主要贡献者而言，代码所占的比例都出乎意料地高，这也是让我们的代码如此易读的部分原因。


### 从代码/注释比例来看，作者的提交随时间是如何变化的？ {#how-does-an-authors-commits-change-over-time-with-respect-to-codecomments-percentage}

按作者来计算这个指标非常简单，

```sql
SELECT
    author,
    countIf(line_type = 'Code') AS code_lines,
    countIf((line_type = 'Comment') OR (line_type = 'Punct')) AS comments,
    code_lines / (comments + code_lines) AS ratio_code,
    toStartOfWeek(time) AS week
FROM git.line_changes
GROUP BY
    time,
    author
ORDER BY
    author ASC,
    time ASC
LIMIT 10

┌─author──────────────────────┬─code_lines─┬─comments─┬─────────ratio_code─┬───────week─┐
│ 1lann                       │          8 │        0 │                  1 │ 2022-03-06 │
│ 20018712                    │          2 │        0 │                  1 │ 2020-09-13 │
│ 243f6a8885a308d313198a2e037 │          0 │        2 │                  0 │ 2020-12-06 │
│ 243f6a8885a308d313198a2e037 │          0 │      112 │                  0 │ 2020-12-06 │
│ 243f6a8885a308d313198a2e037 │          0 │       14 │                  0 │ 2020-12-06 │
│ 3ldar-nasyrov               │          2 │        0 │                  1 │ 2021-03-14 │
│ 821008736@qq.com            │         27 │        2 │ 0.9310344827586207 │ 2019-04-21 │
│ ANDREI STAROVEROV           │        182 │       60 │ 0.7520661157024794 │ 2021-05-09 │
│ ANDREI STAROVEROV           │          7 │        0 │                  1 │ 2021-05-09 │
│ ANDREI STAROVEROV           │         32 │       12 │ 0.7272727272727273 │ 2021-05-09 │
└─────────────────────────────┴────────────┴──────────┴────────────────────┴────────────┘

10 rows in set. Elapsed: 0.145 sec. Processed 7.54 million rows, 51.09 MB (51.83 million rows/s., 351.44 MB/s.)
```

不过，理想情况下，我们希望看到的是：从作者开始提交代码的第一天起，所有作者整体上这一指标是如何变化的。他们会不会随着时间推移，慢慢减少自己写的注释数量？

为此，我们首先计算每位作者随时间变化的注释比例——做法类似于 [Who tends to write more tests / CPP code / comments?](#who-tends-to-write-more-tests--cpp-code--comments)。然后将其与每位作者的首次提交日期进行关联，从而可以按「周偏移量」计算注释比例。

在计算出所有作者按周偏移量的平均值之后，我们每隔 10 周抽取一次数据，对这些结果进行采样。

[play](https://sql.clickhouse.com?query_id=SBHEWR8XC4PRHY13HPPKCN)


```sql
WITH author_ratios_by_offset AS
    (
        SELECT
            author,
            dateDiff('week', start_dates.start_date, contributions.week) AS week_offset,
            ratio_code
        FROM
        (
            SELECT
                author,
                toStartOfWeek(min(time)) AS start_date
            FROM git.line_changes
            WHERE file_extension IN ('h', 'cpp', 'sql')
            GROUP BY author AS start_dates
        ) AS start_dates
        INNER JOIN
        (
            SELECT
                author,
                countIf(line_type = 'Code') AS code,
                countIf((line_type = 'Comment') OR (line_type = 'Punct')) AS comments,
                comments / (comments + code) AS ratio_code,
                toStartOfWeek(time) AS week
            FROM git.line_changes
            WHERE (file_extension IN ('h', 'cpp', 'sql')) AND (sign = 1)
            GROUP BY
                time,
                author
            HAVING code > 20
            ORDER BY
                author ASC,
                time ASC
        ) AS contributions USING (author)
    )
SELECT
    week_offset,
    avg(ratio_code) AS avg_code_ratio
FROM author_ratios_by_offset
GROUP BY week_offset
HAVING (week_offset % 10) = 0
ORDER BY week_offset ASC
LIMIT 20

┌─week_offset─┬──────avg_code_ratio─┐
│           0 │ 0.21626798253005078 │
│          10 │ 0.18299433892099454 │
│          20 │ 0.22847255749045017 │
│          30 │  0.2037816688365288 │
│          40 │  0.1987063517030308 │
│          50 │ 0.17341406302829748 │
│          60 │  0.1808884776496144 │
│          70 │ 0.18711773536450496 │
│          80 │ 0.18905573684766458 │
│          90 │  0.2505147771581594 │
│         100 │  0.2427673990917429 │
│         110 │ 0.19088569009169926 │
│         120 │ 0.14218574654598348 │
│         130 │ 0.20894252550489317 │
│         140 │ 0.22316626978848397 │
│         150 │  0.1859507592277053 │
│         160 │ 0.22007759757363546 │
│         170 │ 0.20406936638195144 │
│         180 │  0.1412102467834332 │
│         190 │ 0.20677550885049117 │
└─────────────┴─────────────────────┘

20 rows in set. Elapsed: 0.167 sec. Processed 15.07 million rows, 101.74 MB (90.51 million rows/s., 610.98 MB/s.)
```

令人鼓舞的是，我们的评论比例基本保持不变，并不会因为作者贡献时间变长而降低。


### 代码在被重写之前的平均时间和中位数（代码“衰减”的半衰期）是多少？ {#what-is-the-average-time-before-code-will-be-rewritten-and-the-median-half-life-of-code-decay}

我们可以使用与[List files that were rewritten most number of time or by most of authors](#list-files-that-were-rewritten-most-number-of-times)相同的原理来识别重写，但这次考虑所有文件。这里使用一个窗口函数来计算每个文件两次重写之间的时间。基于此，我们可以计算所有文件的平均值和中位数。

[play](https://sql.clickhouse.com?query_id=WSHUEPJP9TNJUH7QITWWOR)

```sql
WITH
    changes AS
    (
        SELECT
            path,
            commit_hash,
            max_time,
            type,
            num_added,
            num_deleted,
            sum(num_added - num_deleted) OVER (PARTITION BY path ORDER BY max_time ASC) AS current_size,
            if(current_size > 0, num_added / current_size, 0) AS percent_add,
            if(current_size > 0, num_deleted / current_size, 0) AS percent_delete
        FROM
        (
            SELECT
                path,
                max(time) AS max_time,
                commit_hash,
                any(lines_added) AS num_added,
                any(lines_deleted) AS num_deleted,
                any(change_type) AS type
            FROM git.file_changes
            WHERE (change_type IN ('Add', 'Modify')) AND (file_extension IN ('h', 'cpp', 'sql'))
            GROUP BY
                path,
                commit_hash
            ORDER BY
                path ASC,
                max_time ASC
        )
    ),
    rewrites AS
    (
        SELECT
            *,
            any(max_time) OVER (PARTITION BY path ORDER BY max_time ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS previous_rewrite,
            dateDiff('day', previous_rewrite, max_time) AS rewrite_days
        FROM changes
        WHERE (type = 'Modify') AND (percent_add >= 0.5) AND (percent_delete >= 0.5) AND (current_size > 50)
    )
SELECT
    avgIf(rewrite_days, rewrite_days > 0) AS avg_rewrite_time,
    quantilesTimingIf(0.5)(rewrite_days, rewrite_days > 0) AS half_life
FROM rewrites

┌─avg_rewrite_time─┬─half_life─┐
│      122.2890625 │ [23]      │
└──────────────────┴───────────┘

1 row in set. Elapsed: 0.388 sec. Processed 266.05 thousand rows, 22.85 MB (685.82 thousand rows/s., 58.89 MB/s.)
```


### 一周中在哪个时间写代码最糟糕，也就是代码被重写的概率最高？ {#what-is-the-worst-time-to-write-code-in-sense-that-the-code-has-highest-chance-to-be-re-written}

与 [What is the average time before code will be rewritten and the median (half-life of code decay)?](#what-is-the-average-time-before-code-will-be-rewritten-and-the-median-half-life-of-code-decay) 和 [List files that were rewritten most number of time or by most of authors](#list-files-that-were-rewritten-most-number-of-times) 类似，只是这里按一周中的星期几进行聚合。可根据需要调整，例如按一年中的月份聚合。

[play](https://sql.clickhouse.com?query_id=8PQNWEWHAJTGN6FTX59KH2)

```sql
WITH
    changes AS
    (
        SELECT
            path,
            commit_hash,
            max_time,
            type,
            num_added,
            num_deleted,
            sum(num_added - num_deleted) OVER (PARTITION BY path ORDER BY max_time ASC) AS current_size,
            if(current_size > 0, num_added / current_size, 0) AS percent_add,
            if(current_size > 0, num_deleted / current_size, 0) AS percent_delete
        FROM
        (
            SELECT
                path,
                max(time) AS max_time,
                commit_hash,
                any(file_lines_added) AS num_added,
                any(file_lines_deleted) AS num_deleted,
                any(file_change_type) AS type
            FROM git.line_changes
            WHERE (file_change_type IN ('Add', 'Modify')) AND (file_extension IN ('h', 'cpp', 'sql'))
            GROUP BY
                path,
                commit_hash
            ORDER BY
                path ASC,
                max_time ASC
        )
    ),
    rewrites AS
    (
        SELECT any(max_time) OVER (PARTITION BY path ORDER BY max_time ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS previous_rewrite
        FROM changes
        WHERE (type = 'Modify') AND (percent_add >= 0.5) AND (percent_delete >= 0.5) AND (current_size > 50)
    )
SELECT
    dayOfWeek(previous_rewrite) AS dayOfWeek,
    count() AS num_re_writes
FROM rewrites
GROUP BY dayOfWeek

┌─dayOfWeek─┬─num_re_writes─┐
│         1 │           111 │
│         2 │           121 │
│         3 │            91 │
│         4 │           111 │
│         5 │            90 │
│         6 │            64 │
│         7 │            46 │
└───────────┴───────────────┘

7 rows in set. Elapsed: 0.466 sec. Processed 7.54 million rows, 701.52 MB (16.15 million rows/s., 1.50 GB/s.)
```


### 哪位作者的代码“粘性”最高？ {#which-authors-code-is-the-most-sticky}

我们将“粘性”定义为某位作者的代码在被重写之前能保持不变的时间长度。类似前一个问题 [代码在被重写前的平均时间是多少？中位数（代码衰减的半衰期）又是多少？](#what-is-the-average-time-before-code-will-be-rewritten-and-the-median-half-life-of-code-decay) —— 使用相同的重写度量标准，即对某个文件进行 50% 的新增和 50% 的删除。我们按作者计算平均重写时间，并且只考虑改动了超过两个文件的贡献者。

[play](https://sql.clickhouse.com?query_id=BKHLVVWN5SET1VTIFQ8JVK)

```sql
WITH
    changes AS
    (
        SELECT
            path,
            author,
            commit_hash,
            max_time,
            type,
            num_added,
            num_deleted,
            sum(num_added - num_deleted) OVER (PARTITION BY path ORDER BY max_time ASC) AS current_size,
            if(current_size > 0, num_added / current_size, 0) AS percent_add,
            if(current_size > 0, num_deleted / current_size, 0) AS percent_delete
        FROM
        (
            SELECT
                path,
                any(author) AS author,
                max(time) AS max_time,
                commit_hash,
                any(file_lines_added) AS num_added,
                any(file_lines_deleted) AS num_deleted,
                any(file_change_type) AS type
            FROM git.line_changes
            WHERE (file_change_type IN ('Add', 'Modify')) AND (file_extension IN ('h', 'cpp', 'sql'))
            GROUP BY
                path,
                commit_hash
            ORDER BY
                path ASC,
                max_time ASC
        )
    ),
    rewrites AS
    (
        SELECT
            *,
            any(max_time) OVER (PARTITION BY path ORDER BY max_time ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS previous_rewrite,
            dateDiff('day', previous_rewrite, max_time) AS rewrite_days,
            any(author) OVER (PARTITION BY path ORDER BY max_time ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS prev_author
        FROM changes
        WHERE (type = 'Modify') AND (percent_add >= 0.5) AND (percent_delete >= 0.5) AND (current_size > 50)
    )
SELECT
    prev_author,
    avg(rewrite_days) AS c,
    uniq(path) AS num_files
FROM rewrites
GROUP BY prev_author
HAVING num_files > 2
ORDER BY c DESC
LIMIT 10

┌─prev_author─────────┬──────────────────c─┬─num_files─┐
│ Michael Kolupaev    │              304.6 │         4 │
│ alexey-milovidov    │  81.83333333333333 │         4 │
│ Alexander Kuzmenkov │               64.5 │         5 │
│ Pavel Kruglov       │               55.8 │         6 │
│ Alexey Milovidov    │ 48.416666666666664 │        90 │
│ Amos Bird           │               42.8 │         4 │
│ alesapin            │ 38.083333333333336 │        12 │
│ Nikolai Kochetov    │  33.18421052631579 │        26 │
│ Alexander Tokmakov  │ 31.866666666666667 │        12 │
│ Alexey Zatelepin    │               22.5 │         4 │
└─────────────────────┴────────────────────┴───────────┘

10 rows in set. Elapsed: 0.555 sec. Processed 7.54 million rows, 720.60 MB (13.58 million rows/s., 1.30 GB/s.)
```


### 作者连续提交天数最长的记录 {#most-consecutive-days-of-commits-by-an-author}

此查询首先需要计算每位作者进行提交的日期。通过使用窗口函数并按作者进行分区，我们可以计算相邻两次提交之间相隔的天数。对于每个提交，如果距离上一次提交的时间为 1 天，我们将其标记为连续（1），否则为 0，并将这一结果存储在 `consecutive_day` 中。

接下来使用数组函数计算每位作者最长的连续 1 序列。首先使用 `groupArray` 函数汇总某位作者的所有 `consecutive_day` 值。这个由 1 和 0 组成的数组随后会按值 0 拆分为若干子数组。最后，我们计算其中最长的子数组。

[play](https://sql.clickhouse.com?query_id=S3E64UYCAMDAYJRSXINVFR)

```sql
WITH commit_days AS
    (
        SELECT
            author,
            day,
            any(day) OVER (PARTITION BY author ORDER BY day ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS previous_commit,
            dateDiff('day', previous_commit, day) AS days_since_last,
            if(days_since_last = 1, 1, 0) AS consecutive_day
        FROM
        (
            SELECT
                author,
                toStartOfDay(time) AS day
            FROM git.commits
            GROUP BY
                author,
                day
            ORDER BY
                author ASC,
                day ASC
        )
    )
SELECT
    author,
    arrayMax(arrayMap(x -> length(x), arraySplit(x -> (x = 0), groupArray(consecutive_day)))) - 1 AS max_consecutive_days
FROM commit_days
GROUP BY author
ORDER BY max_consecutive_days DESC
LIMIT 10

┌─author───────────┬─max_consecutive_days─┐
│ kssenii          │                   32 │
│ Alexey Milovidov │                   30 │
│ alesapin         │                   26 │
│ Azat Khuzhin     │                   23 │
│ Nikolai Kochetov │                   15 │
│ feng lv          │                   11 │
│ alexey-milovidov │                   11 │
│ Igor Nikonov     │                   11 │
│ Maksim Kita      │                   11 │
│ Nikita Vasilev   │                   11 │
└──────────────────┴──────────────────────┘

10 rows in set. Elapsed: 0.025 sec. Processed 62.78 thousand rows, 395.47 KB (2.54 million rows/s., 16.02 MB/s.)
```


### 文件逐行提交历史 {#line-by-line-commit-history-of-a-file}

文件可能会被重命名。发生这种情况时，会产生一个重命名事件，其中 `path` 列被设置为文件的新路径，而 `old_path` 表示之前的位置，例如：

[play](https://sql.clickhouse.com?query_id=AKTW3Z8JZAPQ4H9BH2ZFRX)

```sql
SELECT
    time,
    path,
    old_path,
    commit_hash,
    commit_message
FROM git.file_changes
WHERE (path = 'src/Storages/StorageReplicatedMergeTree.cpp') AND (change_type = 'Rename')

┌────────────────time─┬─path────────────────────────────────────────┬─old_path─────────────────────────────────────┬─commit_hash──────────────────────────────┬─commit_message─┐
│ 2020-04-03 16:14:31 │ src/Storages/StorageReplicatedMergeTree.cpp │ dbms/Storages/StorageReplicatedMergeTree.cpp │ 06446b4f08a142d6f1bc30664c47ded88ab51782 │ dbms/ → src/   │
└─────────────────────┴─────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────┴────────────────┘

1 row in set. Elapsed: 0.135 sec. Processed 266.05 thousand rows, 20.73 MB (1.98 million rows/s., 154.04 MB/s.)
```

这使得查看某个文件的完整历史变得比较困难，因为我们没有一个单一的值来关联所有的行或文件变更。

为了解决这个问题，我们可以使用用户自定义函数（UDF，User Defined Functions）。它们目前还不支持递归，因此，为了识别一个文件的历史，我们必须定义一系列 UDF，并让它们彼此显式调用。

这意味着我们只能在一个最大深度内跟踪重命名——下面的示例深度为 5 层。文件被重命名超过这个次数的情况并不常见，因此目前来说，这已经足够了。

```sql
CREATE FUNCTION file_path_history AS (n) -> if(empty(n),  [], arrayConcat([n], file_path_history_01((SELECT if(empty(old_path), Null, old_path) FROM git.file_changes WHERE path = n AND (change_type = 'Rename' OR change_type = 'Add') LIMIT 1))));
CREATE FUNCTION file_path_history_01 AS (n) -> if(isNull(n), [], arrayConcat([n], file_path_history_02((SELECT if(empty(old_path), Null, old_path) FROM git.file_changes WHERE path = n AND (change_type = 'Rename' OR change_type = 'Add') LIMIT 1))));
CREATE FUNCTION file_path_history_02 AS (n) -> if(isNull(n), [], arrayConcat([n], file_path_history_03((SELECT if(empty(old_path), Null, old_path) FROM git.file_changes WHERE path = n AND (change_type = 'Rename' OR change_type = 'Add') LIMIT 1))));
CREATE FUNCTION file_path_history_03 AS (n) -> if(isNull(n), [], arrayConcat([n], file_path_history_04((SELECT if(empty(old_path), Null, old_path) FROM git.file_changes WHERE path = n AND (change_type = 'Rename' OR change_type = 'Add') LIMIT 1))));
CREATE FUNCTION file_path_history_04 AS (n) -> if(isNull(n), [], arrayConcat([n], file_path_history_05((SELECT if(empty(old_path), Null, old_path) FROM git.file_changes WHERE path = n AND (change_type = 'Rename' OR change_type = 'Add') LIMIT 1))));
CREATE FUNCTION file_path_history_05 AS (n) -> if(isNull(n), [], [n]);
```

通过调用 `file_path_history('src/Storages/StorageReplicatedMergeTree.cpp')`，我们会递归遍历重命名历史，每一级函数调用都会使用 `old_path` 传递到下一层。结果使用 `arrayConcat` 进行合并。

例如，

```sql
SELECT file_path_history('src/Storages/StorageReplicatedMergeTree.cpp') AS paths

┌─paths─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['src/Storages/StorageReplicatedMergeTree.cpp','dbms/Storages/StorageReplicatedMergeTree.cpp','dbms/src/Storages/StorageReplicatedMergeTree.cpp'] │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.074 sec. Processed 344.06 thousand rows, 6.27 MB (4.65 million rows/s., 84.71 MB/s.)
```


我们现在可以利用这一功能来汇总某个文件整个历史中的所有提交记录。在本示例中，我们针对每个 `path` 值各展示一个提交记录。

```sql
SELECT
    time,
    substring(commit_hash, 1, 11) AS commit,
    change_type,
    author,
    path,
    commit_message
FROM git.file_changes
WHERE path IN file_path_history('src/Storages/StorageReplicatedMergeTree.cpp')
ORDER BY time DESC
LIMIT 1 BY path
FORMAT PrettyCompactMonoBlock

┌────────────────time─┬─commit──────┬─change_type─┬─author─────────────┬─path─────────────────────────────────────────────┬─commit_message──────────────────────────────────────────────────────────────────┐
│ 2022-10-30 16:30:51 │ c68ab231f91 │ Modify      │ Alexander Tokmakov │ src/Storages/StorageReplicatedMergeTree.cpp      │ fix accessing part in Deleting state                                            │
│ 2020-04-03 15:21:24 │ 38a50f44d34 │ Modify      │ alesapin           │ dbms/Storages/StorageReplicatedMergeTree.cpp     │ Remove empty line                                                               │
│ 2020-04-01 19:21:27 │ 1d5a77c1132 │ Modify      │ alesapin           │ dbms/src/Storages/StorageReplicatedMergeTree.cpp │ Tried to add ability to rename primary key columns but just banned this ability │
└─────────────────────┴─────────────┴─────────────┴────────────────────┴──────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

3 rows in set. Elapsed: 0.170 sec. Processed 611.53 thousand rows, 41.76 MB (3.60 million rows/s., 246.07 MB/s.)
```


## 未解决的问题 {#unsolved-questions}

### Git blame {#git-blame}

由于目前无法在数组函数中保持状态，要获得精确结果尤其困难。在支持 `arrayFold` 或 `arrayReduce` 之后就可以实现，因为它们允许在每次迭代中保存状态。

一个近似解法，足以用于高层级分析，大致可以如下所示：

```sql
SELECT
    line_number_new,
    argMax(author, time),
    argMax(line, time)
FROM git.line_changes
WHERE path IN file_path_history('src/Storages/StorageReplicatedMergeTree.cpp')
GROUP BY line_number_new
ORDER BY line_number_new ASC
LIMIT 20

┌─line_number_new─┬─argMax(author, time)─┬─argMax(line, time)────────────────────────────────────────────┐
│               1 │ Alexey Milovidov     │ #include <Disks/DiskSpaceMonitor.h>                           │
│               2 │ s-kat                │ #include <Common/FieldVisitors.h>                             │
│               3 │ Anton Popov          │ #include <cstddef>                                            │
│               4 │ Alexander Burmak     │ #include <Common/typeid_cast.h>                               │
│               5 │ avogar               │ #include <Common/ThreadPool.h>                                │
│               6 │ Alexander Burmak     │ #include <Common/DiskSpaceMonitor.h>                          │
│               7 │ Alexander Burmak     │ #include <Common/ZooKeeper/Types.h>                           │
│               8 │ Alexander Burmak     │ #include <Common/escapeForFileName.h>                         │
│               9 │ Alexander Burmak     │ #include <Common/formatReadable.h>                            │
│              10 │ Alexander Burmak     │ #include <Common/thread_local_rng.h>                          │
│              11 │ Alexander Burmak     │ #include <Common/typeid_cast.h>                               │
│              12 │ Nikolai Kochetov     │ #include <Storages/MergeTree/DataPartStorageOnDisk.h>         │
│              13 │ alesapin             │ #include <Disks/ObjectStorages/IMetadataStorage.h>            │
│              14 │ alesapin             │                                                               │
│              15 │ Alexey Milovidov     │ #include <DB/Databases/IDatabase.h>                           │
│              16 │ Alexey Zatelepin     │ #include <Storages/MergeTree/ReplicatedMergeTreePartheckout er.h> │
│              17 │ CurtizJ              │ #include <Storages/MergeTree/MergeTreeDataPart.h>             │
│              18 │ Kirill Shvakov       │ #include <Parsers/ASTDropQuery.h>                             │
│              19 │ s-kat                │ #include <Storages/MergeTree/PinnedPartUUIDs.h>               │
│              20 │ Nikita Mikhaylov     │ #include <Storages/MergeTree/MergeMutateExecutor.h>           │
└─────────────────┴──────────────────────┴───────────────────────────────────────────────────────────────┘
20 rows in set. Elapsed: 0.547 sec. Processed 7.88 million rows, 679.20 MB (14.42 million rows/s., 1.24 GB/s.)
```

欢迎在此给出更精确或更优的解决方案。
