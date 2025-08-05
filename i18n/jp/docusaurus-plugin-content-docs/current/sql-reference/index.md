---
description: 'ClickHouse SQLリファレンスのドキュメント'
keywords:
- 'clickhouse'
- 'docs'
- 'sql reference'
- 'sql statements'
- 'sql'
- 'syntax'
slug: '/sql-reference'
title: 'SQLリファレンス'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'
import LinksDeployment from './sql-reference-links.json'


# ClickHouse SQL リファレンス

ClickHouse は、多くの場合において ANSI SQL 標準と同一の SQL ベースの宣言的クエリ言語をサポートしています。

サポートされているクエリには、GROUP BY、ORDER BY、FROM 内のサブクエリ、JOIN 句、IN 演算子、ウィンドウ関数、およびスカラサブクエリが含まれます。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
