---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: 'Managed ClickStack으로 애플리케이션 계측하기'
sidebar_label: 'HackerNews Analyzer 데모'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'OpenTelemetry를 사용해 Node.js 애플리케이션을 계측하고 로그, 메트릭, 트레이스를 Managed ClickStack으로 전송하는 가이드'
doc_type: 'guide'
keywords: ['ClickStack', '계측', 'OpenTelemetry', 'Managed ClickStack', '관측성']
---

import InstrumentApplication from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

이 가이드에서는 OpenTelemetry를 사용해 간단한 Node.js 애플리케이션을 계측하고 해당 로그, 메트릭, 트레이스를 [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed)으로 전송하는 방법을 설명합니다. 백엔드는 애플리케이션 소스 코드를 변경하지 않고도 계측됩니다.

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer)는 공개 ClickHouse 데모 인스턴스에 호스팅된 HackerNews 데이터셋을 쿼리하는 작은 Node.js 앱입니다. 모든 차트, 테이블, 검색 상자는 실제 ClickHouse 쿼리를 기반으로 하므로 모든 상호작용에서 백엔드가 ClickHouse로 보내는 HTTPS 호출을 주 스팬으로 하는 트레이스가 생성됩니다.

## 필수 조건 \{#prerequisites\}

* Managed ClickStack 서비스로 데이터를 수집하도록 구성된 OTel collector에 접근할 수 있어야 합니다. 해당 OTLP endpoint와 수집 토큰이 필요합니다.
* Node 18+ 및 npm.

<InstrumentApplication />

## 자세히 알아보기 \{#learn-more\}

* [세션 리플레이](/use-cases/observability/clickstack/session-replay): 기능 개요, SDK 옵션, 개인정보 보호 설정.
* [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo): 로컬 ClickStack 인스턴스로 실행하는 독립형 데모.
* [ClickStack 시작하기](/use-cases/observability/clickstack/getting-started): ClickStack 배포 및 첫 데이터 수집.
* [모든 샘플 데이터셋](/use-cases/observability/clickstack/sample-datasets): 다른 예시 데이터셋과 가이드.