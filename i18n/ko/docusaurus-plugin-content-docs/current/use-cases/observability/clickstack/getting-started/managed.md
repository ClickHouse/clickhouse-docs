---
slug: /use-cases/observability/clickstack/getting-started/managed
title: '관리형 ClickStack 시작하기'
sidebar_label: '관리형'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: '관리형 ClickStack 시작하기'
doc_type: 'guide'
keywords: ['관리형 ClickStack', '시작하기', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import SetupManagedIngestion from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import ProviderSelection from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import NavigateClickStackUI from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import service_connect from '@site/static/images/_snippets/service_connect.png';

<BetaBadge />

가장 쉽게 시작하는 방법은 **ClickHouse Cloud**에서 **Managed ClickStack**을 배포하는 것입니다. 이렇게 하면 완전 관리형이고 보안이 강화된 백엔드를 제공하면서도 수집, 스키마, 관측성 워크플로우에 대한 완전한 제어를 유지할 수 있습니다. 사용자가 직접 ClickHouse를 운영할 필요가 없어지며, 다음과 같은 다양한 이점이 제공됩니다:

* 스토리지와 독립적인 컴퓨팅 자동 확장
* 객체 스토리지를 기반으로 한 저비용 및 사실상 무제한 보존
* 웨어하우스를 통해 읽기 및 쓰기 워크로드를 서로 독립적으로 분리할 수 있는 기능
* 통합 인증
* 자동화된 백업
* 보안 및 규정 준수 기능
* 원활한 업그레이드

<VerticalStepper headerLevel="h2">
  ## ClickHouse Cloud 가입 \{#signup-to-clickhouse-cloud\}

  [ClickHouse Cloud](https://console.clickhouse.cloud)에 Managed ClickStack 서비스를 생성하려면 먼저 [ClickHouse Cloud 빠른 시작 가이드](/getting-started/quick-start/cloud)의 **첫 번째 단계**를 완료하십시오.

  <ProviderSelection />

  ## 수집 설정 \{#setup-ingestion\}

  서비스가 프로비저닝되면 해당 서비스가 선택되어 있는지 확인한 후 왼쪽 메뉴에서 &quot;ClickStack&quot;을 클릭합니다.

  <SetupManagedIngestion />

  ## ClickStack UI로 이동 \{#navigate-to-clickstack-ui-cloud\}

  <NavigateClickStackUI />

  ## 다음 단계 \{#next-steps\}

  :::important[기본 자격 증명 기록]
  위 단계에서 기본 자격 증명을 기록하지 않았다면 서비스로 이동하여 `Connect`를 선택하고, 비밀번호와 HTTP/네이티브 엔드포인트를 기록하십시오. 이러한 관리자 자격 증명은 안전하게 보관하고, 이후 가이드에서 다시 사용할 수 있습니다.
  :::

  <Image img={service_connect} size="lg" alt="서비스 연결" border />

  새 사용자를 프로비저닝하거나 추가 데이터 소스를 연결하는 등의 작업을 수행하려면 [Managed ClickStack 배포 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks)를 참조하십시오.
</VerticalStepper>
