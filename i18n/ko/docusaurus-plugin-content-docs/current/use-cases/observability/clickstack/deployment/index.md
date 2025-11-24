---
'slug': '/use-cases/observability/clickstack/deployment'
'title': '배포 옵션'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 배포 - ClickHouse 관찰 가능성 스택'
'doc_type': 'reference'
'keywords':
- 'ClickStack'
- 'observability'
---

ClickStack은 다양한 사용 사례에 맞는 여러 배포 옵션을 제공합니다.

각 배포 옵션은 아래에 요약되어 있습니다. [시작하기 안내서](/use-cases/observability/clickstack/getting-started)는 특히 옵션 1과 2를 보여줍니다. 여기서 완전성을 위해 포함되었습니다.

| 이름              | 설명                                                                                                             | 적합한 경우                                                                                            | 한계                                                                                                        | 예시 링크                                                                                                                                      |
|------------------|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | 모든 ClickStack 구성 요소가 포함된 단일 Docker 컨테이너입니다.                                                  | 프로덕션 배포, 데모, 개념 증명                                                                           | 프로덕션에 권장되지 않음                                                                                     | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse와 HyperDX가 ClickHouse Cloud에서 호스팅됩니다.                                                  | 데모, 로컬 풀 스택 테스트                                                                                | 프로덕션에 권장되지 않음                                                                                     | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes 기반 배포를 위한 공식 Helm 차트입니다. ClickHouse Cloud 및 프로덕션 확장을 지원합니다.               | Kubernetes에서의 프로덕션 배포                                                                           | Kubernetes 지식 필요, Helm을 통한 사용자 정의                                                              | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | Docker Compose를 사용하여 각 ClickStack 구성 요소를 개별적으로 배포합니다.                                      | 로컬 테스트, 개념 증명, 단일 서버에서의 프로덕션, BYO ClickHouse                                          | 내결함성 없음, 여러 컨테이너 관리 필요                                                                       | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 자신의 ClickHouse 및 스키마로 HyperDX를 독립적으로 사용합니다.                                                | 기존 ClickHouse 사용자, 사용자 지정 이벤트 파이프라인                                                  | ClickHouse가 포함되지 않음, 사용자가 수집 및 스키마를 관리해야 함                                          | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 로컬 저장소와 함께 브라우저 내에서 완전히 실행됩니다. 백엔드 또는 지속성이 없습니다.                            | 데모, 디버깅, HyperDX와 함께하는 개발                                                                   | 인증 없음, 지속성 없음, 알림 없음, 단일 사용자 전용                                                       | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |
