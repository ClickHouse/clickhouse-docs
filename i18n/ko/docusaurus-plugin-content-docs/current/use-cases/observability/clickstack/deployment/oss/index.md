---
slug: /use-cases/observability/clickstack/deployment/oss
title: '오픈 소스 배포 옵션'
pagination_prev: null
pagination_next: null
description: '오픈 소스 ClickStack 배포 - ClickHouse 관측성(Observability) 스택'
doc_type: 'reference'
keywords: ['ClickStack', '관측성', 'Open Source']
---

오픈 소스 ClickStack은 다양한 사용 사례에 맞는 여러 배포 옵션을 제공합니다.

각 배포 옵션은 아래에 요약되어 있습니다. [오픈 소스 시작 가이드](/use-cases/observability/clickstack/getting-started/oss)는 특히 1번 옵션을 구체적으로 다루며, 완전한 설명을 위해 이 문서에도 포함되어 있습니다.

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | 모든 ClickStack 컴포넌트가 번들로 포함된 단일 Docker 컨테이너입니다.                                                      | 비프로덕션 배포, 데모, PoC(개념 증명)                                                                        | 프로덕션 환경에는 권장되지 않습니다.                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Kubernetes 기반 배포를 위한 공식 Helm 차트입니다. ClickHouse Cloud 및 프로덕션 규모 확장을 지원합니다.             | Kubernetes에서의 프로덕션 배포                                                                   | Kubernetes 지식이 필요하며, Helm을 통한 커스터마이징이 필요합니다.                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 각 ClickStack 컴포넌트를 Docker Compose를 통해 개별적으로 배포합니다.                                                    | 로컬 테스트, PoC(개념 증명), 단일 서버 프로덕션, 자체 ClickHouse 사용(BYO ClickHouse)                                       | 장애 허용이 없으며, 여러 컨테이너를 직접 관리해야 합니다.                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | HyperDX를 자체 ClickHouse 및 스키마와 함께 독립적으로 사용합니다.                                                       | 기존 ClickHouse 사용자, 커스텀 이벤트 파이프라인                                                       | ClickHouse가 포함되지 않으며, 사용자가 수집 및 스키마를 직접 관리해야 합니다.                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 브라우저에서만 로컬 스토리지를 사용하여 완전히 실행됩니다. 백엔드나 데이터 영속성은 없습니다.                                          | 데모, 디버깅, HyperDX를 사용한 개발                                                                     | 인증 없음, 영속성 없음, 알림 없음, 단일 사용자만 사용 가능                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |