---
slug: /about-us/cloud
sidebar_label: 'Cloud 서비스'
sidebar_position: 10
description: 'ClickHouse Cloud'
title: 'ClickHouse Cloud'
keywords: ['ClickHouse Cloud', '클라우드 데이터베이스', '관리형 ClickHouse', '서버리스 데이터베이스', '클라우드 OLAP']
doc_type: 'reference'
---

# ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud는 인기 있는 오픈 소스 OLAP 데이터베이스인 ClickHouse를 최초로 개발한 팀이 만든 Cloud 서비스입니다. 
[무료 체험을 시작](https://console.clickhouse.cloud/signUp)하여 ClickHouse Cloud를 직접 경험해 보십시오.

## ClickHouse Cloud의 이점 \{#clickhouse-cloud-benefits\}

ClickHouse Cloud를 사용하면 다음과 같은 이점이 있습니다:

* **가치 실현까지의 짧은 시간**: 클러스터 용량 산정과 확장 계획 없이도 즉시 구축을 시작할 수 있습니다.
* **원활한 확장**: 자동 확장이 가변적인 워크로드에 맞춰 조정되므로, 최대 사용량에 대비해 과도하게 리소스를 할당할 필요가 없습니다.
* **서버리스 운영**: 용량 및 확장, 보안, 안정성, 업그레이드를 서비스에서 대신 처리하므로 운영 부담 없이 사용할 수 있습니다.
* **투명한 요금 체계**: 리소스 예약 및 확장 제어 기능과 함께 사용한 만큼만 비용을 지불합니다.
* **총 소유 비용(TCO)**: 뛰어난 가격 대비 성능과 낮은 관리 오버헤드를 제공합니다.
* **폭넓은 에코시스템**: 선호하는 데이터 커넥터, 시각화 도구, SQL 및 언어 클라이언트를 그대로 함께 사용할 수 있습니다.

{/*
  ## OSS vs ClickHouse Cloud comparison                           

  | Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
  |--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
  | **Deployment modes**           | ClickHouse는 오픈 소스로 직접 운영하거나 Cloud에 배포하여 사용할 수 있는 유연성을 제공합니다. 서버 없이 로컬 파일을 다루려면 ClickHouse Local을, 애플리케이션에 ClickHouse를 직접 내장하려면 chDB를 사용하십시오.                                                                                                  | ✅               | ✅                 |
  | **Storage**                    | 오픈 소스이자 Cloud에 호스팅되는 제품으로서 ClickHouse는 공유 디스크(shared-disk)와 공유-없음(shared-nothing) 아키텍처 모두에 배포할 수 있습니다.                                                                                                                                                          | ✅               | ✅                 |
  | **Monitoring and alerting**    | 서비스 상태에 대한 모니터링과 알림은 최적의 성능을 보장하고 잠재적인 문제를 사전에 탐지하고 분류하기 위한 선제적 대응에 매우 중요합니다.                                                                                                                                                                       | ✅               | ✅                 |
  | **ClickPipes**                 | ClickPipes는 ClickHouse의 관리형 수집 파이프라인으로, 데이터베이스, API, 스트리밍 서비스 등의 외부 데이터 소스를 ClickHouse Cloud에 손쉽게 연결하여 파이프라인, 커스텀 잡 또는 ETL 프로세스를 직접 관리할 필요를 제거합니다. 모든 규모의 워크로드를 지원합니다.                          | ❌               | ✅                 |
  | **Pre-built integrations**     | ClickHouse는 데이터 레이크, SQL 및 언어 클라이언트, 시각화 라이브러리 등과 같은 인기 있는 도구 및 서비스에 ClickHouse를 연결하는 사전 구축된 통합 기능을 제공합니다.                                                                                                                                       | ❌               | ✅                 |
  | **SQL console**                | SQL console은 세련된 인터페이스, 쿼리 인터페이스, 데이터 가져오기 도구, 시각화, 협업 기능, GenAI 기반 SQL 지원을 포함하여 ClickHouse 데이터베이스에 빠르고 직관적으로 연결·탐색·쿼리할 수 있는 방법을 제공합니다.                                                                | ❌               | ✅                 |
  | **Compliance**                 | ClickHouse Cloud의 규제 준수 항목에는 CCPA, EU-US DPF, GDPR, HIPAA, ISO 27001, ISO 27001 SoA, PCI DSS, SOC2가 포함됩니다. ClickHouse Cloud의 보안, 가용성, 처리 무결성, 기밀성 관련 프로세스는 모두 독립적으로 감사됩니다. 자세한 내용: trust.clickhouse.com.                         | ❌               | ✅                 |
  | **Enterprise-grade security**  | SSO, 다중 요소 인증, 역할 기반 접근 제어(RBAC), Private Link 및 Private Service Connect를 지원하는 비공개·보안 연결, IP 필터링, 고객 관리 암호화 키(CMEK) 등 고급 보안 기능을 지원합니다.                                                                                                      | ❌               | ✅                 |
  | **Scaling and optimization**   | 워크로드에 따라 부하 기반으로 원활하게 확장 또는 축소되며, 수평 및 수직 확장을 모두 지원합니다. 자동 백업, 복제 및 고가용성을 통해 ClickHouse는 사용자에게 최적의 리소스 할당을 제공합니다.                                                                                                        | ❌               | ✅                 |
  | **Support services**           | 최고 수준의 지원 서비스와 오픈 소스 커뮤니티 리소스를 통해 어떤 배포 모델을 선택하더라도 지원을 제공합니다.                                                                                                                                                                                                | ❌               | ✅                 |
  | **Database upgrades**          | 강력한 보안 태세를 확립하고 최신 기능과 성능 향상을 활용하려면 정기적인 데이터베이스 업그레이드가 필수적입니다.                                                                                                                                                                                            | ❌               | ✅                 |
  | **Backups**                    | 백업 및 복원 기능은 데이터 내구성을 보장하고, 장애 또는 기타 중단 상황에서 원활한 복구를 지원합니다.                                                                                                                                                                                                       | ❌               | ✅                 |
  | **Compute-compute separation** | 스토리지와는 독립적으로 컴퓨트 리소스를 확장할 수 있으므로, 팀과 워크로드가 동일한 스토리지를 공유하면서도 전용 컴퓨트 리소스를 유지할 수 있습니다. 이를 통해 한 워크로드의 성능이 다른 워크로드에 영향을 미치지 않도록 하여 유연성, 성능, 비용 효율성을 높일 수 있습니다.                        | ❌               | ✅                 |
  | **Managed services**           | 클라우드 관리형 서비스를 사용하면 팀은 ClickHouse의 크기 조정, 설정 및 유지 관리와 같은 운영 오버헤드를 걱정하지 않고 비즈니스 성과에 집중하여 출시 시간을 단축할 수 있습니다.                                                                                                                          | ❌               | ✅                 |
  */ }


## ClickHouse Cloud는 어떤 버전의 ClickHouse를 사용하나요? \{#what-version-of-clickhouse-does-clickhouse-cloud-use\}

ClickHouse Cloud는 수정 사항, 새로운 기능 및 성능 개선이 포함된 최신 버전으로 서비스를 주기적으로 업그레이드합니다. 오픈 소스에 코어 데이터베이스 버전을 공개한 이후 Cloud 스테이징 환경에서 추가 검증을 수행하며, 일반적으로 프로덕션에 배포되기까지 6~8주가 소요됩니다. 배포는 Cloud 서비스 제공자, 서비스 유형 및 리전별로 단계적으로 진행됩니다.

ClickHouse Cloud 서비스의 업그레이드 일정을 지정하려면 특정 릴리스 채널을 구독하면 됩니다. 예를 들어, 정기 릴리스 일정보다 앞서 업데이트를 받을 수 있는 ["Fast" Release Channel](/manage/updates#fast-release-channel-early-upgrades)과 업그레이드를 미루기 위한 ["Slow" Release Channel](/manage/updates#slow-release-channel-deferred-upgrades), 그리고 그보다 더 세분화된 연기 예약 옵션을 제공합니다.

하위 호환성 보장을 포함한 ClickHouse Cloud의 업그레이드 프로세스 개요는 [Upgrades](/manage/updates) 참고 문서를 참조하십시오.