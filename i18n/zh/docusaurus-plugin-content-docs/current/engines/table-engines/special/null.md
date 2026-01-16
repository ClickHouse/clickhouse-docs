---
description: '向 `Null` 表写入时，数据会被忽略。从 `Null` 表读取时，结果为空。'
sidebar_label: 'Null'
sidebar_position: 50
slug: /engines/table-engines/special/null
title: 'Null 表引擎'
doc_type: 'reference'
---

# Null 表引擎 \\{#null-table-engine\\}

当向 `Null` 表写入数据时，这些数据会被忽略。
当从 `Null` 表读取数据时，返回结果是空的。

`Null` 表引擎适用于在数据转换后不再需要原始数据的场景。
为此，可以在 `Null` 表上创建一个物化视图。
写入该表的数据将会被视图消费，但原始数据会被丢弃。