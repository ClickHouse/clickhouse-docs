---
slug: /data-modeling/overview
title: '데이터 모델링 개요'
description: '데이터 모델링 개요'
keywords: ['데이터 모델링', '스키마 설계', '딕셔너리', 'materialized view', '데이터 압축', '데이터 비정규화']
doc_type: 'landing-page'
---

# 데이터 모델링 \{#data-modeling\}

이 섹션에서는 ClickHouse에서의 데이터 모델링을 다루며, 다음 주제를 포함합니다:

| Page                                                            | Description                                                                                                                                                                                   |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | 쿼리, 데이터 업데이트, 지연 시간, 데이터 볼륨과 같은 요소를 고려하여 최적의 성능을 위한 ClickHouse 스키마 설계를 설명합니다.                                                              |
| [Dictionary](/dictionary)                                       | 쿼리 성능을 향상하고 데이터를 보강하기 위해 딕셔너리를 정의하고 사용하는 방법을 설명합니다.                                                                                              |
| [Materialized Views](/materialized-views)                       | ClickHouse의 Materialized Views(materialized view)와 Refreshable Materialized Views(갱신 가능 구체화 뷰)에 대한 정보를 제공합니다.                                                                                                           |
| [Projections](/data-modeling/projections)| ClickHouse의 프로젝션(projections)에 대한 정보를 제공합니다.|
| [Data Compression](/data-compression/compression-in-clickhouse) | ClickHouse에서 사용 가능한 다양한 압축 모드와 특정 데이터 타입 및 워크로드에 적합한 압축 방식을 선택하여 데이터 저장 효율과 쿼리 성능을 최적화하는 방법을 설명합니다. |
| [Denormalizing Data](/data-modeling/denormalization)            | 관련 데이터를 하나의 테이블에 저장하여 쿼리 성능 향상을 목표로 하는 ClickHouse의 비정규화(denormalization) 접근 방식을 설명합니다.                                                  |