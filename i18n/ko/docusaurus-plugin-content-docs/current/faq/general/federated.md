---
title: 'ClickHouse는 연합(federated) 쿼리를 지원하나요?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse는 연합(federated) 및 하이브리드 쿼리를 광범위하게 지원합니다'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse는 연합 쿼리를 지원합니까? \{#does-clickhouse-support-federated-queries\}

ClickHouse는 분석 데이터베이스 가운데 연합 쿼리와 하이브리드 쿼리 실행을 가장 포괄적으로 지원합니다.

다음과 같은 외부 데이터베이스에 대한 쿼리를 지원합니다:

* PostgreSQL
* MySQL
* MongoDB
* Redis
* 모든 ODBC 데이터 소스
* 모든 JDBC 데이터 소스
* 모든 Arrow Flight 데이터 소스
* Kafka, RabbitMQ와 같은 스트리밍 데이터 소스
* Iceberg, Delta Lake, Apache Hudi, Apache Paimon과 같은 데이터 레이크(data lake)
* AWS S3, GCS, Minio, Cloudflare R2, Azure Blob Storage, Alicloud OSS, Tencent COS와 같은 공유 스토리지에 위치한 외부 파일, 그리고 다양한 데이터 포맷을 지원하는 로컬 스토리지의 파일

ClickHouse는 단일 쿼리에서 서로 다른 여러 데이터 소스를 조인할 수 있습니다. 또한 로컬 리소스를 활용하면서 쿼리의 일부를 원격 머신으로 넘겨 실행하는 하이브리드 쿼리 실행 옵션을 제공합니다.

흥미로운 점은 ClickHouse가 데이터를 이동하지 않고도 외부 데이터 소스에 대한 쿼리를 가속할 수 있다는 것입니다. 예를 들어 MySQL에 대한 집계 쿼리는 ClickHouse에서 실행하면 더 빠르게 처리되는데, 이는 데이터 이동 오버헤드보다 ClickHouse의 더 빠른 쿼리 엔진이 제공하는 성능 이점이 더 크기 때문입니다.