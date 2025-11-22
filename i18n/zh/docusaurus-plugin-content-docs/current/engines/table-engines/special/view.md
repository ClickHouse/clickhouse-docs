---
description: '用于实现视图（更多信息参见 `CREATE VIEW` 查询）。它本身不存储数据，而仅保存指定的 `SELECT` 查询。从该表读取数据时，会执行此查询（并从查询中删除所有不必要的列）。'
sidebar_label: 'View'
sidebar_position: 90
slug: /engines/table-engines/special/view
title: 'View 表引擎'
doc_type: 'reference'
---

# View 表引擎

用于实现视图（更多信息，参见 `CREATE VIEW query`）。它本身不存储数据，而只保存指定的 `SELECT` 查询。从该表读取数据时，会执行此查询（并从查询结果中删除所有不需要的列）。