---
slug: /use-cases/observability/clickstack/deployment
title: '배포 옵션'
pagination_prev: null
pagination_next: null
description: 'ClickStack 배포 - ClickHouse 관측성 스택'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack은 다양한 사용 사례에 맞게 여러 가지 배포 옵션을 제공합니다.

각 배포 옵션은 아래에 요약되어 있습니다. [시작 가이드](/use-cases/observability/clickstack/getting-started)는 특히 옵션 1과 2를 다룹니다. 완전성을 위해 여기에도 포함되어 있습니다.

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Managed ClickStack       | ClickHouse와 ClickStack UI(HyperDX)가 ClickHouse Cloud에 호스팅됩니다.                                                      | 프로덕션 배포, 데모, 개념 증명(POC)                                                                        | 없음                                                                               | [Managed](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)                               |
| All-in-One       | 모든 ClickStack 컴포넌트를 하나의 Docker 컨테이너로 번들링합니다.                                                      | 비프로덕션 배포, 데모, 개념 증명(POC)                                                                        | 프로덕션 환경에는 권장되지 않습니다                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Kubernetes 기반 배포를 위한 공식 Helm 차트입니다. ClickHouse Cloud와 프로덕션 확장을 지원합니다.             | Kubernetes에서의 프로덕션 배포                                                                   | Kubernetes에 대한 지식 필요, Helm을 통한 사용자 정의 필요                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 각 ClickStack 컴포넌트를 Docker Compose로 개별 배포합니다.                                                    | 로컬 테스트, 개념 증명(POC), 단일 서버 프로덕션, 자체 ClickHouse 사용(BYO ClickHouse)                                       | 장애 허용(fault tolerance) 없음, 여러 컨테이너를 직접 관리해야 함                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 자체 ClickHouse와 스키마를 사용하여 HyperDX만 독립적으로 사용합니다.                                                       | 기존 ClickHouse 사용자, 커스텀 이벤트 파이프라인                                                       | ClickHouse 미포함, 사용자가 수집과 스키마를 직접 관리해야 함                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 브라우저에서 로컬 스토리지만 사용하여 실행됩니다. 백엔드나 영속성은 없습니다.                                          | 데모, 디버깅, HyperDX를 활용한 개발                                                                     | 인증 없음, 영속성 없음, 알림 없음, 단일 사용자 전용                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |