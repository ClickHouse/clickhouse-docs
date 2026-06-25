---
slug: /integrations/integration-development
title: '통합 개발'
sidebar_label: '개요'
sidebar_position: 1
description: 'ClickHouse 통합을 구축, 테스트 및 문서화하기 위한 가이드입니다.'
keywords: ['통합 개발', '통합 구축', '파트너', '통합 파트너']
doc_type: 'landing-page'
---

# 통합 개발 \{#integration-development\}

이 가이드는 ClickHouse에 연결되는 제품을 개발하는 경우 참고할 수 있도록 구성되어 있습니다. 통합 대상 범위, connector를 검증하는 방법, 그리고 이 사이트에 문서를 게시하는 방법을 다룹니다.

:::note[파트너 포털]
통합을 등록하고 파트너 리소스에 액세스하려면 [파트너 포털](https://clickhouse.com/partners)을 사용하십시오. 아래 가이드에서는 connector를 빌드, 테스트 및 문서화하는 방법을 설명합니다.
:::

## 가이드 \{#guides\}

다음 순서로 읽으십시오:

| 가이드                                                                          | 다루는 내용                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| [통합 구축](/integrations/integration-development/building-integrations)         | 수집 및 소비 경로, wire 프로토콜, 클라이언트, User-Agent 규칙 |
| [통합 테스트](/integrations/integration-development/testing-your-integration)     | 배포 모드, 데이터셋, 유형 지원 범위, 검토 전에 보고해야 할 내용      |
| [통합 문서화](/integrations/integration-development/documenting-your-integration) | 필수 문서 섹션, 스타일 규칙, 제품 페이지용 PR 템플릿            |

프로토타입을 만들고 테스트한 후에는 [`/docs/integrations/<category>/<your-integration>/`](/integrations/integration-development/documenting-your-integration) 아래에 통합 페이지를 추가하고 [`clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs)에 pull request를 생성하십시오.