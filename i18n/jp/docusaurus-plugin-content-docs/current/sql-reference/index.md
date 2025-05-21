---
description: 'ClickHouse SQLリファレンスのドキュメント'
keywords: ['clickhouse', 'docs', 'sql reference', 'sql statements', 'sql', 'syntax']
slug: /sql-reference
title: 'SQLリファレンス'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'

# ClickHouse SQLリファレンス

ClickHouseは、SQLに基づいた宣言型クエリ言語をサポートしており、多くの場合ANSI SQL標準と同一です。

サポートされているクエリには、GROUP BY、ORDER BY、FROM内のサブクエリ、JOIN句、IN演算子、ウィンドウ関数、スカラーサブクエリが含まれます。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
