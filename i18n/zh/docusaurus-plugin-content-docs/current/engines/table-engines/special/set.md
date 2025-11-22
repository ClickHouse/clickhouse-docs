---
description: '一个始终驻留在 RAM 中的数据集。它被设计用于 `IN` 运算符的右侧。'
sidebar_label: 'Set'
sidebar_position: 60
slug: /engines/table-engines/special/set
title: 'Set 表引擎'
doc_type: 'reference'
---



# Set 表引擎

:::note
在 ClickHouse Cloud 中,如果您的服务是使用 25.4 之前的版本创建的,则需要使用 `SET compatibility=25.4` 将兼容性设置为至少 25.4。
:::

始终位于内存中的数据集。它用于 `IN` 运算符的右侧(请参阅"IN 运算符"部分)。

您可以使用 `INSERT` 向表中插入数据。新元素将被添加到数据集中,重复项将被忽略。
但您无法对该表执行 `SELECT`。检索数据的唯一方法是将其用于 `IN` 运算符的右侧。

数据始终位于内存中。对于 `INSERT`,插入数据的块也会写入磁盘上的表目录。启动服务器时,这些数据会加载到内存中。换句话说,重启后数据仍然保留。

对于非正常的服务器重启,磁盘上的数据块可能会丢失或损坏。在后一种情况下,您可能需要手动删除包含损坏数据的文件。

### 限制和设置 {#join-limitations-and-settings}

创建表时,将应用以下设置:

#### Persistent {#persistent}

禁用 Set 和 [Join](/engines/table-engines/special/join) 表引擎的持久化。

减少 I/O 开销。适用于追求性能且不需要持久化的场景。

可能的值:

- 1 — 启用。
- 0 — 禁用。

默认值:`1`。
