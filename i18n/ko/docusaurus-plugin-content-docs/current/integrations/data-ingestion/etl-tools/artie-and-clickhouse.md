---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', '연결', '통합', 'CDC', 'etl', '데이터 통합', '실시간', '스트리밍']
slug: /integrations/artie
description: 'Artie CDC 스트리밍 플랫폼을 사용하여 데이터를 ClickHouse로 스트리밍합니다'
title: 'Artie를 ClickHouse에 연결하기'
doc_type: '가이드'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Artie를 ClickHouse에 연결하기 \{#connect-artie-to-clickhouse\}

<a href="https://www.artie.com/" target="_blank">Artie</a>는 운영 환경 데이터를 ClickHouse로 복제하여 고객 대상 분석, 운영 워크플로, 운영 환경의 Agentic AI를 구현할 수 있게 해 주는 완전 관리형 실시간 데이터 스트리밍 플랫폼입니다.

## 개요 \{#overview\}

Artie는 AI 시대를 위한 현대적인 데이터 인프라 레이어로, 프로덕션 데이터를 데이터 웨어하우스와 실시간으로 지속적으로 동기화해 주는 완전 관리형 실시간(real-time) 데이터 스트리밍 플랫폼입니다.

기업들은 실시간 AI 워크로드, 운영 분석, 고객 지향 데이터 제품을 위해 웨어하우스를 활성화하면서, 빠르고 신뢰할 수 있으며 대규모 확장을 위해 설계된 인프라로 표준화하고 있습니다.

Artie는 기업이 10명 이상의 엔지니어를 채용하고 플랫폼 작업에 1–2년을 투자하지 않고도, Netflix, DoorDash, Instacart가 내부적으로 구축한 것과 같은 수준의 스트리밍 파이프라인과 심층적인 관측성을 제공합니다. Artie는 전체 수집 라이프사이클(변경 캡처, 머지, 백필(backfill), 관측성)을 자동화하며, 엔지니어링 유지 보수가 전혀 필요 없고 몇 분 안에 배포할 수 있습니다.

ClickUp, Substack, Alloy와 같은 리더들은 Artie를 사용해 오늘의 파이프라인 문제를 해결할 뿐만 아니라, AI 전략이 가속화됨에 따라 데이터 스택을 미래에도 대비할 수 있도록 합니다.

<VerticalStepper headerLevel="h2">

## Artie 계정 만들기 \{#1-create-an-artie-account\}

<a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a>를 방문하여 양식을 작성하고 액세스를 요청합니다.

<Image img={artie_signup} size="md" border alt="Artie 가입 페이지" />

## ClickHouse 자격 증명 찾기 \{#2-find-your-clickhouse-credentials\}

ClickHouse Cloud에서 서비스를 생성한 후 다음 필수 설정 값을 확인합니다:

<ConnectionDetails />

## Artie에서 새 파이프라인 생성 \{#3-create-a-new-pipeline-in-artie\}

앞선 단계에서 수집한 정보를 가지고 Artie로 이동한 다음, 3단계 절차를 따라 새 파이프라인을 생성합니다.

1. **소스 연결** - 소스 데이터베이스(Postgres, MySQL, Events API 등)를 구성합니다.
2. **복제할 테이블 선택** - ClickHouse로 동기화할 테이블을 선택합니다.
3. **대상 연결** - ClickHouse 자격 증명을 입력합니다.

<Image img={artie_edit_pipeline} size="lg" border alt="Artie 파이프라인 편집 인터페이스" />

</VerticalStepper>

## 문의하기 \{#contact-us\}

궁금한 점이 있으시면 <a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse 문서</a>를 참고하거나 <a href="mailto:hi@artie.com">hi@artie.com</a>으로 문의해 주십시오.

## 제품 스크린샷 \{#product-screenshots\}

분석 포털

<Image img={analytics} size="md" border alt="분석 포털"/>

파이프라인 및 테이블별 모니터링

<Image img={monitor} size="md" border alt="내장 모니터링"/>

일일 스키마 변경 알림

<Image img={schema_notification} size="md" border alt="스키마 변경 알림"/>