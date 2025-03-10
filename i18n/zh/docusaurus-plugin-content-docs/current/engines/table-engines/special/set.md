---
slug: /engines/table-engines/special/set
sidebar_position: 60
sidebar_label: Set
title: 'Set 表引擎'
description: '一个始终位于 RAM 中的数据集。它用于 `IN` 操作符的右侧。'
---


# Set 表引擎

一个始终位于 RAM 中的数据集。它用于 `IN` 操作符的右侧（参见 "IN 操作符" 部分）。

您可以使用 `INSERT` 向表中插入数据。新元素将被添加到数据集中，而重复项将被忽略。
但是，您不能从表中执行 `SELECT`。检索数据的唯一方法是在 `IN` 操作符的右半部分使用它。

数据始终位于 RAM 中。对于 `INSERT`，插入的数据块也会写入磁盘上的表目录。当服务器启动时，这些数据会加载到 RAM 中。换句话说，重启后，数据仍然保持在原地。

在粗略的服务器重启中，磁盘上的数据块可能会丢失或损坏。在后者的情况下，您可能需要手动删除损坏数据的文件。

### 限制和设置 {#join-limitations-and-settings}

创建表时，应用以下设置：

#### persistent {#persistent}

禁用 Set 和 [Join](/engines/table-engines/special/join) 表引擎的持久性。

减少 I/O 开销。适合追求性能且不需要持久性的场景。

可能的值：

- 1 — 启用。
- 0 — 禁用。

默认值：`1`。
