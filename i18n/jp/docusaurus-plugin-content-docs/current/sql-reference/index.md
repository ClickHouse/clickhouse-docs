---
description: 'ClickHouse SQL リファレンスのドキュメント'
keywords: ['clickhouse', 'ドキュメント', 'sql リファレンス', 'sql ステートメント', 'sql', '構文']
slug: /sql-reference
title: 'SQL リファレンス'
doc_type: 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'


# ClickHouse SQL リファレンス

ClickHouse は、SQL に基づく宣言的なクエリ言語をサポートしており、多くの点で ANSI SQL 標準と同一です。

サポートされるクエリには、GROUP BY、ORDER BY、FROM 句内のサブクエリ、JOIN 句、IN 演算子、ウィンドウ関数、スカラーサブクエリが含まれます。

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />