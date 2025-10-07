---
'description': 'ClickHouse SQL リファレンスのドキュメンテーション'
'keywords':
- 'clickhouse'
- 'docs'
- 'sql reference'
- 'sql statements'
- 'sql'
- 'syntax'
'slug': '/sql-reference'
'title': 'SQL リファレンス'
'doc_type': 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'
import LinksDeployment from './sql-reference-links.json'


# ClickHouse SQL リファレンス

ClickHouse は、多くのケースで ANSI SQL 標準と同一の SQL に基づく宣言型クエリ言語をサポートしています。

サポートされているクエリには、GROUP BY、ORDER BY、FROM 内のサブクエリ、JOIN 句、IN 演算子、ウィンドウ関数、およびスカラサブクエリが含まれます。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
