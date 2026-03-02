---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 프로덕션급 관측성 플랫폼 ClickStack의 UI인 HyperDX를 제공합니다. HyperDX는 로그, 트레이스, 메트릭, 세션을 하나의 고성능 확장형 솔루션에서 통합합니다.'
doc_type: 'guide'
keywords: ['hyperdx', '관측성', '통합', '클라우드 기능', '모니터링']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX는 [**ClickStack**](/use-cases/observability/clickstack)의 사용자 인터페이스로, ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 프로덕션급 관측성(observability) 플랫폼입니다. 로그, 트레이스, 메트릭, 세션 데이터를 단일 고성능 솔루션으로 통합합니다. 복잡한 시스템의 모니터링과 디버깅을 위해 설계된 ClickStack은 개발자와 SRE가 도구를 전환하거나 타임스탬프나 correlation ID를 사용해 데이터를 수동으로 결합하지 않고도 문제를 end-to-end로 추적할 수 있도록 합니다.

HyperDX는 관측성 데이터 탐색과 시각화를 위해 특화된 프론트엔드로, Lucene 스타일 및 SQL 쿼리, 대화형 대시보드, 알림(alerting), 트레이스 탐색 등 다양한 기능을 지원하며, 백엔드로서 ClickHouse에 최적화되어 있습니다.

ClickHouse Cloud에서 HyperDX를 사용하면 인프라 관리나 별도 인증 구성 없이 보다 간편한 ClickStack 경험을 누릴 수 있습니다.
HyperDX는 한 번의 클릭으로 실행하고 데이터에 연결할 수 있으며, ClickHouse Cloud 인증 시스템에 완전히 통합되어 관측성 인사이트에 안전하고 매끄럽게 접근할 수 있습니다.


## 배포 \{#main-concepts\}

ClickHouse Cloud의 HyperDX는 현재 비공개 프리뷰 단계이며, 조직 단위에서 활성화해야 합니다. 활성화한 후에는 어떤 서비스를 선택하더라도 좌측 기본 내비게이션 메뉴에서 HyperDX를 확인할 수 있습니다.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ClickHouse Cloud에서 HyperDX를 시작하려면 전용 [시작 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)를 참고하십시오.

ClickStack에 대한 자세한 내용은 [전체 문서](/use-cases/observability/clickstack)를 참고하십시오. 