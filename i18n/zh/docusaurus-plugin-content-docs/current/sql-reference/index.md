---
description: 'ClickHouse SQL 参考文档'
keywords: ['clickhouse', 'docs', 'SQL 参考', 'SQL 语句', 'sql', '语法']
slug: /sql-reference
title: 'SQL 参考'
doc_type: 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'

# ClickHouse SQL 参考 {#clickhouse-sql-reference}

ClickHouse 支持一种基于 SQL 的声明式查询语言，在许多情况下与 ANSI SQL 标准相同。

支持的查询包括 GROUP BY、ORDER BY、FROM 子句中的子查询、JOIN 子句、IN 运算符、窗口函数以及标量子查询。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />