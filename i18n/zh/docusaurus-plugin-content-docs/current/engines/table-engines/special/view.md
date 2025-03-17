---
slug: /engines/table-engines/special/view
sidebar_position: 90
sidebar_label:  视图
title: "视图表引擎"
description: "用于实现视图（有关更多信息，请参见 `CREATE VIEW 查询`）。它不存储数据，仅存储指定的 `SELECT` 查询。在读取表时，它运行此查询（并删除查询中所有不必要的列）。"
---


# 视图表引擎

用于实现视图（有关更多信息，请参见 `CREATE VIEW 查询`）。它不存储数据，仅存储指定的 `SELECT` 查询。在读取表时，它运行此查询（并删除查询中所有不必要的列）。
