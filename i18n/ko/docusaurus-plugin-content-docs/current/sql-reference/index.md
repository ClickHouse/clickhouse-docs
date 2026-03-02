---
description: 'ClickHouse SQL 참조 문서'
keywords: ['clickhouse', 'docs', 'sql reference', 'sql statements', 'sql', 'syntax']
slug: /sql-reference
title: 'SQL 참조'
doc_type: 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'

import LinksDeployment from './sql-reference-links.json'

# ClickHouse SQL 레퍼런스 \{#clickhouse-sql-reference\}

ClickHouse는 SQL을 기반으로 한 선언적 쿼리 언어를 지원하며, 많은 부분에서 ANSI SQL 표준과 동일합니다.

지원되는 쿼리 유형에는 GROUP BY, ORDER BY, FROM 절의 서브쿼리, JOIN 절, IN 연산자, 윈도 함수, 스칼라 서브쿼리가 포함됩니다.

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />