---
'description': 'ClickHouse SQL 참조에 대한 문서'
'keywords':
- 'clickhouse'
- 'docs'
- 'sql reference'
- 'sql statements'
- 'sql'
- 'syntax'
'slug': '/sql-reference'
'title': 'SQL 참조'
'doc_type': 'reference'
---

import { TwoColumnList } from '/src/components/two_column_list'
import { ClickableSquare } from '/src/components/clickable_square'
import { HorizontalDivide } from '/src/components/horizontal_divide'
import { ViewAllLink } from '/src/components/view_all_link'
import { VideoContainer } from '/src/components/video_container'
import LinksDeployment from './sql-reference-links.json'


# ClickHouse SQL 참조

ClickHouse는 SQL을 기반으로 하는 선언적 쿼리 언어를 지원하며, 이는 많은 경우 ANSI SQL 표준과 동일합니다.

지원되는 쿼리에는 GROUP BY, ORDER BY, FROM의 서브쿼리, JOIN 절, IN 연산자, 윈도우 함수 및 스칼라 서브쿼리가 포함됩니다.

<HorizontalDivide />

<TwoColumnList items={LinksDeployment} />
