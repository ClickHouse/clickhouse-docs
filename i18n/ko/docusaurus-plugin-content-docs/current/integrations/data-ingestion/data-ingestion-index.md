---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: '데이터 수집'
description: '데이터 수집 섹션의 랜딩 페이지'
doc_type: 'landing-page'
---

# 데이터 수집 \{#data-ingestion\}

ClickHouse는 데이터 통합과 변환을 위한 다양한 솔루션과 통합됩니다.
자세한 내용은 아래 페이지를 참고하십시오.

| Data Ingestion Tool                                              | Description                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | 오픈 소스 데이터 통합 플랫폼입니다. ELT 데이터 파이프라인을 생성할 수 있으며, 140개가 넘는 기본 제공 커넥터와 함께 제공됩니다.                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 단일 노드 머신이나 클러스터에서 데이터 엔지니어링, 데이터 사이언스, 머신 러닝을 실행하기 위한 다중 언어 엔진입니다.                                                                                                         |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | Flink의 DataStream API를 통해 ClickHouse로 실시간 데이터 수집 및 처리를 수행하며, 배치 쓰기를 지원합니다.                                                                                                         |
| [Amazon Glue](/integrations/glue)                                | Amazon Web Services(AWS)에서 제공하는 완전관리형 서버리스 데이터 통합 서비스로, 분석, 머신 러닝, 애플리케이션 개발을 위한 데이터 탐색, 준비, 변환 과정을 단순화합니다.     |
| [Artie](/integrations/artie)                                     | 운영 데이터(프로덕션 데이터)를 ClickHouse로 실시간 복제하는 완전관리형 실시간 데이터 스트리밍 플랫폼으로, 고객 대상 분석, 운영 워크플로우, 운영 환경의 Agentic AI를 구현할 수 있습니다.                                          |
| [Azure Synapse](/integrations/azure-synapse)                     | Microsoft Azure에서 제공하는 완전관리형 클라우드 기반 분석 서비스로, 빅데이터와 데이터 웨어하우징을 통합하여 SQL, Apache Spark, 데이터 파이프라인을 사용한 대규모 데이터 통합, 변환, 분석을 단순화합니다. |
| [Azure Data Factory](/integrations/azure-data-factory)           | 대규모로 데이터 워크플로를 생성, 예약, 오케스트레이션할 수 있게 해 주는 클라우드 기반 데이터 통합 서비스입니다. |
| [Apache Beam](/integrations/apache-beam)                         | 배치 및 스트림(연속) 데이터 처리 파이프라인을 정의하고 실행할 수 있게 해 주는 오픈 소스 통합 프로그래밍 모델입니다.                                                                                  |
| [BladePipe](/integrations/bladepipe)                         | 플랫폼 간 원활한 데이터 흐름을 지원하며, 초 단위 미만의 지연 시간을 제공하는 실시간 엔드 투 엔드 데이터 통합 도구입니다.                                                                                |
| [dbt](/integrations/dbt)                                         | 분석 엔지니어가 단순히 SELECT SQL 문을 작성하는 방식으로 데이터 웨어하우스의 데이터를 변환할 수 있게 해 줍니다.                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | 다양한, 그리고 종종 정리되지 않은 데이터 소스에서 잘 구조화된 실시간 데이터셋으로 데이터를 적재하기 위해 Python 스크립트에 추가할 수 있는 오픈 소스 라이브러리입니다.                                                                            |
| [Estuary](/integrations/estuary)                                 | 유연한 배포 옵션과 함께 밀리초 지연 ETL 파이프라인을 구현할 수 있는 right-time 데이터 플랫폼입니다.                                    |
| [Fivetran](/integrations/fivetran)                               | 클라우드 데이터 플랫폼에서, 그리고 클라우드 데이터 플랫폼 간에 데이터를 자동으로 이동하는 자동화된 데이터 이동 플랫폼입니다.                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | 소프트웨어 시스템 간 데이터 흐름을 자동화하도록 설계된 오픈 소스 워크플로 관리 소프트웨어입니다.                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 조직이 관측성(observability) 데이터를 직접 제어할 수 있게 해 주는 고성능 관측성 데이터 파이프라인입니다.                                                                                                                        |