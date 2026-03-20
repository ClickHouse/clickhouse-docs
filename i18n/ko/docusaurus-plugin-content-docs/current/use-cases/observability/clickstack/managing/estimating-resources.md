---
slug: /use-cases/observability/clickstack/estimating-resources
title: '리소스 추정'
sidebar_label: '리소스 추정'
pagination_prev: null
pagination_next: null
description: '관리형 ClickStack 배포를 위한 리소스 추정 가이드'
doc_type: 'guide'
keywords: ['ClickStack', '리소스', '사이징', '컴퓨트', 'production', '용량 계획']
---

import ResourceEstimation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

<ResourceEstimation />

## 관측성 워크로드 격리 \{#isolating-workloads\}

실시간 애플리케이션 분석과 같은 다른 워크로드를 이미 지원하는 **기존 ClickHouse Cloud 서비스**에 ClickStack을 추가하는 경우, 관측성 트래픽을 격리하는 것을 강력히 권장합니다.

ClickStack 전용 **하위 서비스**를 생성하려면 [**관리형 웨어하우스**](/cloud/reference/warehouses)를 사용하십시오. 이 절을 사용하면 다음이 가능합니다:

* 기존 애플리케이션의 수집 및 쿼리 부하를 격리
* 관측성 워크로드를 독립적으로 확장
* 관측성 쿼리가 프로덕션 분석에 영향을 주지 않도록 방지
* 필요할 때 서비스 전반에서 동일한 기본 데이터세트를 공유

이 접근 방식은 관측성 데이터가 증가하더라도 기존 워크로드에 영향을 주지 않으면서 ClickStack을 독립적으로 확장할 수 있도록 합니다.

더 큰 규모의 배포 또는 사용자 지정 크기 조정 지침이 필요하면, 보다 정확한 견적을 위해 지원팀에 문의하십시오.