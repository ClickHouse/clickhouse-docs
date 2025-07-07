---
'description': '用于实现视图（欲了解更多信息，请参见 `CREATE VIEW 查询`）。它不存储数据，而仅存储指定的 `SELECT` 查询。当从表中读取时，它运行此查询（并删除查询中所有不必要的列）。'
'sidebar_label': '视图'
'sidebar_position': 90
'slug': '/engines/table-engines/special/view'
'title': '视图表引擎'
---


# View Table Engine

用于实现视图（更多信息，请参见 `CREATE VIEW query`）。它不存储数据，而只是存储指定的 `SELECT` 查询。在从表中读取时，它会运行此查询（并删除查询中所有不必要的列）。
