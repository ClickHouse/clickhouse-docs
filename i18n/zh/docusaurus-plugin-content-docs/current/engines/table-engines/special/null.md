---
slug: /engines/table-engines/special/null
sidebar_position: 50
sidebar_label:  'Null'
title: 'Null 表引擎'
description: '当写入到 `Null` 表时，数据会被忽略。当从 `Null` 表读取时，响应为空。'
---


# Null 表引擎

当写入到 `Null` 表时，数据会被忽略。当从 `Null` 表读取时，响应为空。

:::note
如果你在想这有什么用，请注意你可以在 `Null` 表上创建一个 物化视图。因此，写入到该表的数据将影响视图，但原始的原始数据仍将被丢弃。
:::
