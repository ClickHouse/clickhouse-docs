---
title: '관리 및 배포 개요'
description: '관리 및 배포 개요 페이지'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['배포', '관리', '시스템 관리', '운영', '가이드']
---

# 관리 및 배포 \{#manage-and-deploy\}

이 섹션에서는 다음 내용을 다룹니다:

| Topic                                                                                                 | Description                                                                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | ClickHouse Support 및 Services 조직에서 ClickHouse 사용자에게 제공한 조언을 기반으로 한 실제 배포 예제입니다. |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | 저장소와 컴퓨트를 분리한 아키텍처를 ClickHouse와 S3를 사용해 구현하는 방법을 다루는 가이드입니다.                |
| [Sizing and hardware recommendations&#39;](/guides/sizing-and-hardware-recommendations)            | 오픈 소스 사용자를 위한 하드웨어, 컴퓨트, 메모리 및 디스크 구성에 대한 일반적인 권장 사항을 설명하는 가이드입니다.      |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | ClickHouse Keeper를 구성하는 방법에 대한 정보와 예제입니다.                                                                   |
| [Network ports](/guides/sre/network-ports)                                                    | ClickHouse에서 사용하는 네트워크 포트 목록입니다.                                                                                         |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | 세그먼트 리밸런싱에 대한 권장 사항입니다.                                                                                           |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | 멀티 리전 레플리케이션에 대한 FAQ입니다.                                                                                                  |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | 프로덕션 환경에서 사용할 ClickHouse 버전에 대한 FAQ입니다.                                                                                    |
| [Cluster Discovery](/operations/cluster-discovery)                                            | ClickHouse의 클러스터 디스커버리 기능에 대한 정보와 예제입니다.                                                               |
| [Monitoring](/operations/monitoring)                                                          | ClickHouse의 하드웨어 리소스 사용량과 서버 메트릭을 모니터링하는 방법에 대한 정보입니다.                                |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | OpenTelemetry를 ClickHouse와 함께 사용하는 방법에 대한 정보입니다.                                                                               |
| [Quotas](/operations/quotas)                                                                  | ClickHouse의 QUOTA에 대한 정보와 예제입니다.                                                                                 |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | ClickHouse와 Zookeeper 간 보안 통신을 설정하는 방법에 대한 가이드입니다.                                                       |
| [Startup Scripts](/operations/startup-scripts)                                                | 마이그레이션 또는 자동 스키마 생성을 위해 유용한, 서버 시작 시 스타트업 스크립트를 실행하는 방법에 대한 예제입니다.                         |
| [External Disks for Storing Data](/operations/storing-data)                                   | ClickHouse에서 외부 스토리지를 구성하는 방법에 대한 정보와 예제입니다.                                                         |
| [Allocation profiling](/operations/allocation-profiling)                                      | jemalloc를 사용한 할당 샘플링 및 프로파일링에 대한 정보와 예제입니다.                                                      |
| [Backup and Restore](/operations/backup/overview)                                             | 로컬 디스크 또는 외부 스토리지로 백업하는 방법에 대한 가이드입니다.                                                                          |
| [Caches](/operations/caches)                                                                  | ClickHouse의 다양한 캐시 유형에 대한 설명입니다.                                                                               |
| [Workload scheduling](/operations/workload-scheduling)                                        | ClickHouse의 워크로드 스케줄링에 대한 설명입니다.                                                                                   |
| [Self-managed Upgrade](/operations/update)                                                    | 자가 관리형 업그레이드를 수행하기 위한 지침입니다.                                                                                |
| [Troubleshooting](/guides/troubleshooting)                                                    | 다양한 문제 해결 팁입니다.                                                                                                    |
| [Usage Recommendations](/operations/tips)                                                     | ClickHouse 하드웨어 및 소프트웨어 사용에 대한 다양한 권장 사항입니다.                                                                  |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | `ON CLUSTER` 절에 대한 설명입니다.                                                                                             |