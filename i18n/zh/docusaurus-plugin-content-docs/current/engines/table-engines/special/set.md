---
description: '始终保存在 RAM 中的数据集。用于作为 `IN` 运算符右侧的操作数。'
sidebar_label: 'Set'
sidebar_position: 60
slug: /engines/table-engines/special/set
title: 'Set 表引擎'
doc_type: 'reference'
---

# Set 表引擎 \{#set-table-engine\}

:::note
在 ClickHouse Cloud 中，如果服务创建时使用的版本早于 25.4，则需要使用 `SET compatibility=25.4` 将兼容性设置为至少 25.4。
:::

一个始终驻留在 RAM 中的数据集。它用于 `IN` 运算符的右侧（参见 “IN operators” 章节）。

你可以使用 `INSERT` 向表中插入数据。新元素将被添加到数据集中，而重复元素会被忽略。
但是你不能对该表执行 `SELECT`。检索数据的唯一方式是将其用于 `IN` 运算符的右半部分。

数据始终位于 RAM 中。对于 `INSERT` 操作，插入的数据块也会被写入磁盘上的表目录。在服务器启动时，这些数据会被加载到 RAM 中。换句话说，重启之后，数据仍会保留。

在发生非正常服务器重启时，磁盘上的数据块可能会丢失或损坏。后一种情况下，你可能需要手动删除包含损坏数据的文件。

### 限制和设置 \{#join-limitations-and-settings\}

创建表时，会应用以下设置：

#### Persistent \{#persistent\}

为 Set 和 [Join](/engines/table-engines/special/join) 表引擎禁用持久化功能。

降低 I/O 开销。适用于追求性能且不需要持久化的场景。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

默认值：`1`。
