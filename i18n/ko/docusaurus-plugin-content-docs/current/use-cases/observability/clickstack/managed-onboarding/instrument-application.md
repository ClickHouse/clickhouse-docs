---
slug: /use-cases/observability/clickstack/instrument-application
title: '애플리케이션 계측하기'
description: 'OpenTelemetry를 사용해 Node.js 애플리케이션을 계측하고 로그, 메트릭, 트레이스를 Managed ClickStack으로 전송합니다'
doc_type: 'guide'
keywords: ['clickstack', '계측', 'opentelemetry', '관리형', '관측성', 'sdk', 'nodejs']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import InstrumentApplication from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

이 가이드에서는 소규모 Node.js 애플리케이션을 OpenTelemetry로 계측하고, 해당 애플리케이션의 로그, 메트릭, 트레이스를 Managed ClickStack으로 전송하는 방법을 설명합니다. 백엔드는 애플리케이션 소스 코드를 변경하지 않고 계측됩니다.

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer)는 공개 ClickHouse 데모에 호스팅된 HackerNews 데이터셋을 쿼리하는 Node.js 앱입니다. 모든 차트, 테이블, 검색 상자는 실제 ClickHouse 쿼리를 기반으로 하므로, 모든 상호작용에서 트레이스가 생성되며 해당 트레이스의 주요 스팬은 백엔드에서 ClickHouse로 전송되는 HTTPS 호출입니다.

이 가이드에서는 [OpenTelemetry Collector 설정](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)을 이미 완료했고, 이 애플리케이션을 실행하는 머신에서 접근할 수 있는 ClickStack collector가 실행 중이라고 가정합니다. **collector의 OTLP endpoint**와 배포 시 설정한 `OTLP_AUTH_TOKEN`을 반드시 기록해 두십시오.

## 사전 요구 사항 \{#prerequisites\}

* 이 머신에서 접근할 수 있는 ClickStack collector. 아직 배포하지 않았다면 먼저 [OpenTelemetry Collector 설정](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)을 따르세요.
* 해당 collector의 OTLP endpoint와 여기에 설정한 `OTLP_AUTH_TOKEN`.
* Node 18+ 및 npm.

<InstrumentApplication />

## 더 읽어보기 \{#further-reading\}

* [Kubernetes 모니터링](/use-cases/observability/clickstack/monitoring-kubernetes): 클러스터에서 로그, 인프라 메트릭, Kubernetes 이벤트를 수집합니다.
* [AWS CloudWatch 로그 모니터링](/use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs): OpenTelemetry CloudWatch 수신기를 통해 CloudWatch 로그를 전달합니다.
* [세션 리플레이](/use-cases/observability/clickstack/session-replay): 기능 개요, SDK 옵션, 개인정보 보호 제어 기능을 다룹니다.
* [프로덕션 환경으로 전환하기](/use-cases/observability/clickstack/production): 프로덕션 환경으로 전환할 때의 권장 사항을 안내합니다.