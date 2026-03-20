---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse와 OpenTelemetry(OTel)를 기반으로 구축된 프로덕션급 관측성 플랫폼인 ClickStack의 UI, HyperDX를 제공합니다. 이를 통해 로그, 트레이스, 메트릭, 세션을 하나의 고성능 확장형 솔루션으로 통합할 수 있습니다.'
doc_type: 'guide'
keywords: ['hyperdx', '관측성', '통합', 'Cloud 기능', '모니터링']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX는 [**ClickStack**](/use-cases/observability/clickstack)의 사용자 인터페이스로, ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 프로덕션급 관측성 플랫폼입니다. 로그, 트레이스, 메트릭, 세션 데이터를 단일 고성능 솔루션으로 통합합니다. 복잡한 시스템의 모니터링 및 디버깅을 위해 설계된 ClickStack은 개발자와 SRE가 도구를 전환하거나 타임스탬프 또는 상관관계 ID를 사용해 데이터를 수동으로 짜맞추지 않고도 문제를 엔드 투 엔드로 추적할 수 있도록 지원합니다.

HyperDX는 관측성 데이터를 탐색하고 시각화하도록 설계된 전용 프런트엔드로, Lucene 스타일 쿼리와 SQL 쿼리를 모두 지원합니다. 또한 대화형 대시보드, 알림, 트레이스 탐색 등 다양한 기능을 제공하며, 모든 기능은 백엔드인 ClickHouse에 맞게 최적화되어 있습니다.

ClickHouse Cloud의 HyperDX를 사용하면 더욱 간편한 ClickStack 환경을 이용할 수 있습니다. 관리할 인프라가 없고 별도로 구성할 인증도 없습니다.
HyperDX는 한 번의 클릭으로 실행하여 데이터에 연결할 수 있으며, ClickHouse Cloud 인증 시스템에 완전히 통합되어 관측성 인사이트에 원활하고 안전하게 액세스할 수 있습니다.


## 배포 \{#main-concepts\}

ClickHouse Cloud의 HyperDX는 현재 비공개 프리뷰 단계이며, 조직 단위에서 활성화해야 합니다. 활성화한 후에는 어떤 서비스를 선택하더라도 좌측 기본 내비게이션 메뉴에서 HyperDX를 확인할 수 있습니다.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ClickHouse Cloud에서 HyperDX를 시작하려면 전용 [시작 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)를 참고하십시오.

ClickStack에 대한 자세한 내용은 [전체 문서](/use-cases/observability/clickstack)를 참고하십시오. 