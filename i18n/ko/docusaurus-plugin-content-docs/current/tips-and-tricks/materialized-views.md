---
'sidebar_position': 1
'slug': '/tips-and-tricks/materialized-views'
'sidebar_label': '물리화된 뷰'
'doc_type': 'guide'
'keywords':
- 'clickhouse materialized views'
- 'materialized view optimization'
- 'materialized view storage issues'
- 'materialized view best practices'
- 'database aggregation patterns'
- 'materialized view anti-patterns'
- 'storage explosion problems'
- 'materialized view performance'
- 'database view optimization'
- 'aggregation strategy'
- 'materialized view troubleshooting'
- 'view storage overhead'
'title': '교훈 - 물리화된 뷰'
'description': '물리화된 뷰의 실제 사례, 문제 및 해결책'
---


# 물리화된 뷰: 어떻게 양날의 검이 될 수 있는가 {#materialized-views-the-double-edged-sword}

*이 가이드는 커뮤니티 모임에서 얻은 발견 사항 모음의 일부입니다. 더 많은 실제 솔루션과 통찰력을 얻으시려면 [특정 문제별로 찾아보세요](./community-wisdom.md).*
*데이터베이스가 너무 많은 파트로 압박받고 있나요? [너무 많은 파트](./too-many-parts.md) 커뮤니티 통찰력 가이드를 확인하세요.*
*물리화된 뷰에 대해 더 알아보세요 [물리화된 뷰](/materialized-views).*

## 10배 저장소 안티 패턴 {#storage-antipattern}

**실제 생산 문제:** *"우리는 물리화된 뷰가 있었습니다. 원시 로그 테이블은 약 20기가바이트였지만, 그 로그 테이블에서 생성된 뷰는 190기가바이트로 폭발했습니다. 즉, 원시 테이블의 거의 10배의 크기가 되었습니다. 이는 우리가 속성당 한 행을 생성했기 때문에 발생했으며, 각 로그는 10개의 속성을 가질 수 있습니다."*

**규칙:** `GROUP BY`가 제거하는 행보다 더 많은 행을 생성하면, 당신은 물리화된 뷰가 아니라 비싼 인덱스를 구축하고 있는 것입니다.

## 생산 물리화된 뷰 건강 검사 {#mv-health-validation}

이 쿼리는 물리화된 뷰가 데이터를 압축하거나 폭발시킬지를 예측하는 데 도움을 줍니다. "190GB 폭발" 시나리오를 피하기 위해 실제 테이블과 컬럼에 대해 실행하세요.

**제공하는 정보:**
- **낮은 집계 비율** (\<10%) = 좋은 MV, 상당한 압축
- **높은 집계 비율** (\>70%) = 나쁜 MV, 저장소 폭발 위험
- **저장소 배수기** = MV가 얼마나 더 커지거나 작아질 것인지

```sql
-- Replace with your actual table and columns
SELECT 
    count() as total_rows,
    uniq(your_group_by_columns) as unique_combinations,
    round(uniq(your_group_by_columns) / count() * 100, 2) as aggregation_ratio
FROM your_table
WHERE your_filter_conditions;

-- If aggregation_ratio > 70%, reconsider your MV design
-- If aggregation_ratio < 10%, you'll get good compression
```

## 물리화된 뷰가 문제되는 경우 {#mv-problems}

**모니터링할 경고 신호:**
- 삽입 지연 증가 (10ms가 걸리던 쿼리가 이제 100ms 이상 소요됨)
- "너무 많은 파트" 오류가 자주 발생
- 삽입 작업 중 CPU 급증
- 이전에 발생하지 않았던 삽입 시간 초과

MV를 추가하기 전후의 삽입 성능을 비교하려면 `system.query_log`를 사용하여 쿼리 지속 시간 트렌드를 추적하세요.

## 비디오 출처 {#video-sources}
- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - "물리화된 뷰에 대해 지나치게 열광한" 및 "20GB→190GB 폭발" 사례 연구 출처
