---
title: 'ClickHouse는 데이터 레이크를 지원하나요?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse는 Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive 등을 포함한 데이터 레이크를 지원합니다'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# ClickHouse는 데이터 레이크를 지원하나요? \{#does-clickhouse-support-data-lakes\}

ClickHouse는 Iceberg, Delta Lake, Apache Hudi, Apache Paimon, Hive를 포함한 데이터 레이크를 지원합니다.

**읽기** 및 **쓰기**를 지원하며, 파티션 프루닝, 통계 기반 프루닝, 스키마 진화, 위치 기반 삭제(positional deletes), 동등 조건 삭제(equality deletes), 타임 트래블(time travel), 인트로스펙션(introspection)과 완전히 호환됩니다.

ClickHouse에서 데이터 레이크는 **Unity**, **AWS Glue**, **REST**, **Polaris**, **Hive Metastore** 카탈로그뿐만 아니라 개별 테이블 단위로도 지원합니다.

데이터 레이크에 대한 쿼리 성능은 분산 처리, 효율적인 네이티브 Parquet 리더, 데이터 파일 캐싱 덕분에 최상위 수준입니다.