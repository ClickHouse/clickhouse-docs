---
title: '레이크하우스 테이블 포맷 시작하기'
sidebar_label: '시작하기'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: use-cases/data_lake/index
pagination_next: use-cases/data_lake/getting-started/querying-directly
description: 'ClickHouse를 사용하여 오픈 테이블 포맷 데이터에 대해 쿼리하고, 성능을 가속하며, 데이터를 다시 기록하는 방법을 실습 위주로 소개합니다.'
keywords: ['data lake', 'lakehouse', 'getting started', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

이 가이드는 ClickHouse가 레이크하우스 테이블 포맷을 다루기 위해 제공하는 핵심 기능을 실습을 통해 안내합니다.

## 원본 위치에서 데이터 쿼리 \{#querying-data-in-place\}

ClickHouse는 객체 스토리지에 저장된 오픈 테이블 포맷 위에서 동작하는 쿼리 엔진으로 사용할 수 있습니다. 데이터를 복제하지 않고도, 기존 Iceberg, Delta Lake, Hudi, Paimon 테이블을 ClickHouse의 대상 테이블로 지정하여 프로덕션 워크로드를 처리하거나 데이터를 대화형으로 탐색하기 위한 쿼리를 즉시 시작할 수 있습니다. 이는 테이블 함수와 테이블 엔진을 사용한 직접 읽기 방식으로 수행하거나, 데이터 카탈로그에 연결하여 수행할 수 있습니다.

- [오픈 테이블 포맷 직접 쿼리](/use-cases/data-lake/getting-started/querying-directly) — 사전 설정 없이 ClickHouse 테이블 함수를 사용하여 객체 스토리지에 있는 Iceberg, Delta Lake, Hudi, Paimon 테이블을 읽습니다.
- [데이터 카탈로그에 연결](/use-cases/data-lake/getting-started/connecting-catalogs) — 카탈로그를 ClickHouse 데이터베이스로 노출하고 표준 SQL을 사용하여 해당 테이블을 쿼리합니다. 카탈로그 내 여러 테이블에 접근해야 할 때 권장됩니다. 

## 분석 가속화 \{#accelerating-analytics\}

저지연 응답과 높은 동시성을 요구하는 워크로드에는 오픈 테이블 포맷의 데이터를 ClickHouse의 MergeTree 엔진으로 적재하면 성능이 획기적으로 향상됩니다. 희소 기본 인덱스(sparse primary index), skip 인덱스, 열 지향(columnar) 저장 방식을 사용하므로 Parquet 파일에서 처리하면 수 초가 걸리던 쿼리를 밀리초 단위로 완료할 수 있습니다.

- [MergeTree로 분석 가속화](/use-cases/data-lake/getting-started/accelerating-analytics) - 카탈로그에서 데이터를 MergeTree 테이블로 적재하여 약 40배의 쿼리 속도 향상을 달성할 수 있습니다.

## 데이터 다시 쓰기 \{#writing-data-back\}

데이터는 ClickHouse에서 다시 오픈 테이블 포맷으로 내보낼 수도 있습니다. 오래된 데이터를 장기 보관용 스토리지로 이전하거나, 다운스트림에서 활용할 수 있도록 변환 결과를 제공하는 등 다양한 경우에 ClickHouse는 객체 스토리지에 있는 Iceberg 및 Delta 테이블에 데이터를 쓸 수 있습니다.

- [오픈 테이블 포맷으로 데이터 쓰기](/use-cases/data-lake/getting-started/writing-data) - ClickHouse에서 Iceberg 테이블로 원시 데이터와 집계 결과를 `INSERT INTO SELECT`를 사용해 기록합니다.