---
'description': 'ClickHouse SQL 参考文档'
'keywords':
- 'clickhouse'
- 'docs'
- 'sql reference'
- 'sql statements'
- 'sql'
- 'syntax'
'slug': '/sql-reference'
'title': 'SQL 参考'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'
import LinksDeployment from './sql-reference-links.json'

# ClickHouse SQL参考

ClickHouse支持一种基于SQL的声明性查询语言，在许多情况下与ANSI SQL标准相同。

支持的查询包括 GROUP BY、ORDER BY、FROM 中的子查询、JOIN 子句、IN 操作符、窗口函数和标量子查询。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
