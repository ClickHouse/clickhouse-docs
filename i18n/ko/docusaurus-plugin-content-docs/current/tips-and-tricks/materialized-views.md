---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: 'Materialized views'
doc_type: 'guide'
keywords: [
  'clickhouse materialized views',
  'materialized view 최적화',
  'materialized view 스토리지 문제',
  'materialized view 모범 사례',
  '데이터베이스 집계 패턴',
  'materialized view 안티패턴',
  '스토리지 폭증 문제',
  'materialized view 성능',
  '데이터베이스 VIEW 최적화',
  '집계 전략',
  'materialized view 문제 해결',
  'VIEW 스토리지 오버헤드'
]
title: '교훈 - materialized views'
description: 'materialized views의 실제 사례, 문제 및 해결 방안'
---

# materialized view: 어떻게 양날의 검이 될 수 있는가 \{#materialized-views-the-double-edged-sword\}

*이 가이드는 커뮤니티 밋업에서 얻은 인사이트를 모은 컬렉션의 일부입니다. 더 많은 실제 사례 기반 해결책과 인사이트는 [문제별로 찾아볼 수 있습니다](./community-wisdom.md).*
*너무 많은 파트 때문에 데이터베이스 성능이 저하되고 있습니까? [Too Many Parts](./too-many-parts.md) 커뮤니티 인사이트 가이드를 확인하십시오.*
*[Materialized Views](/materialized-views)에 대해 더 알아보십시오.*

## 10배 스토리지 안티패턴 \{#storage-antipattern\}

**실제 프로덕션 문제:** *"materialized view가 있었습니다. 원시 로그 테이블은 약 20GB였는데, 그 로그 테이블에서 생성된 view가 190GB까지 폭증해서 원본 테이블의 거의 10배 크기가 되었습니다. 각 attribute마다 한 행씩 생성했고, 각 로그에는 attribute가 10개까지 있을 수 있었기 때문에 이런 일이 발생했습니다."*

**규칙:** `GROUP BY`로 인해 제거되는 행보다 더 많은 행이 생성된다면, materialized view가 아니라 비용이 많이 드는 인덱스를 만들고 있는 것입니다.

## 운영 환경 materialized view 상태 검증 \{#mv-health-validation\}

이 쿼리는 materialized view를 생성하기 전에 데이터가 압축될지, 아니면 폭증할지를 예측하는 데 도움이 됩니다. 실제 테이블과 컬럼에 대해 실행하여 「190GB 폭증」과 같은 상황을 피하십시오.

**이 쿼리로 알 수 있는 내용:**

* **낮은 집계 비율** (&lt;10%) = 양호한 MV, 상당한 압축
* **높은 집계 비율** (&gt;70%) = 좋지 않은 MV, 스토리지 폭증 위험
* **Storage multiplier** = MV 크기가 얼마나 커지거나 작아지는지

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


## materialized view가 문제가 되는 시점 \{#mv-problems\}

**모니터링해야 할 경고 신호:**

- INSERT 지연 시간 증가 (이전에 10ms 걸리던 쿼리가 이제 100ms 이상 소요됨)
- "Too many parts" 오류 발생 빈도 증가
- INSERT 작업 중 CPU 사용률 급등
- 이전에는 발생하지 않던 INSERT 타임아웃 발생

`system.query_log`를 사용해 쿼리 실행 시간 추이를 추적하면 materialized view 추가 전후의 INSERT 성능을 비교할 수 있습니다.

## 영상 출처 \{#video-sources\}

- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - 「materialized view에 과도하게 의존한 사례」와 「20GB→190GB 폭증」 사례 연구의 출처입니다.