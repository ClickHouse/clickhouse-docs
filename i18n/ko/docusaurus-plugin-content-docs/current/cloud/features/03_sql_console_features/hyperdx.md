---
'sidebar_label': 'HyperDX'
'slug': '/cloud/manage/hyperdx'
'title': 'HyperDX'
'description': '제공하는 HyperDX는 ClickHouse와 OpenTelemetry (OTel) 기반의 생산 등급 관찰 가능성 플랫폼인
  ClickStack의 UI로, 단일의 고성능 확장 가능한 솔루션에서 로그, 추적, 메트릭 및 세션을 통합합니다.'
'doc_type': 'guide'
'keywords':
- 'hyperdx'
- 'observability'
- 'integration'
- 'cloud features'
- 'monitoring'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge/>

HyperDX는 [**ClickStack**](/use-cases/observability/clickstack)의 사용자 인터페이스로, ClickHouse와 OpenTelemetry (OTel) 기반의 프로덕션급 관찰 가능성 플랫폼이며, 로그, 추적, 메트릭 및 세션을 단일의 고성능 솔루션으로 통합합니다. 복잡한 시스템을 모니터링하고 디버깅하기 위해 설계된 ClickStack은 개발자와 SRE가 도구 간 전환을 하거나 타임스탬프나 상관 관계 ID를 사용하여 수동으로 데이터를 연결하지 않고도 문제를 끝에서 끝까지 추적할 수 있도록 합니다.

HyperDX는 관찰 가능성 데이터를 탐색하고 시각화하기 위해 특별히 설계된 프론트 엔드로, Lucene 스타일 및 SQL 쿼리, 대화형 대시보드, 알림, 추적 탐색 등을 지원하며, 모두 ClickHouse를 백엔드로 최적화되어 있습니다.

ClickHouse Cloud에서 HyperDX를 사용하면 사용자는 보다 간편한 ClickStack 경험을 누릴 수 있습니다 - 관리할 인프라가 없고 별도의 인증을 설정할 필요가 없습니다. HyperDX는 한 번의 클릭으로 실행할 수 있으며 데이터와 연결됩니다 - ClickHouse Cloud 인증 시스템에 완전히 통합되어 관찰 가능성 통찰에 대한 원활하고 안전한 액세스를 제공합니다.

## 배포 {#main-concepts}

ClickHouse Cloud에서 HyperDX는 현재 비공식 미리보기 상태이며 조직 수준에서 활성화해야 합니다. 활성화되면 사용자는 모든 서비스를 선택할 때 주요 왼쪽 탐색 메뉴에서 HyperDX를 찾을 수 있습니다.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ClickHouse Cloud에서 HyperDX를 시작하려면 전용 [시작 가이드](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)를 권장합니다.

ClickStack에 대한 추가 세부정보는 [전체 문서](/use-cases/observability/clickstack)를 참조하십시오.
