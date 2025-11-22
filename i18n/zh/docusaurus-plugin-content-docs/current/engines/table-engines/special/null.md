---
description: '向 `Null` 表写入时，会忽略所有数据；从 `Null` 表读取时，不会返回任何数据。'
sidebar_label: 'Null'
sidebar_position: 50
slug: /engines/table-engines/special/null
title: 'Null 表引擎'
doc_type: 'reference'
---

# Null 表引擎 

向 `Null` 表写入数据时，这些数据会被忽略。
从 `Null` 表读取数据时，返回结果为空。

`Null` 表引擎适用于这样的数据转换场景：在数据完成转换后，不再需要保留原始数据。
为此，你可以在 `Null` 表之上创建一个物化视图。
写入该表的数据会被视图消费，但原始原始数据会被丢弃。