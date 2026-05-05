---
title: 'AI 규정 준수'
slug: /cloud/security/ai-compliance
description: 'ClickHouse의 AI 규정 준수 개요'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '인공지능', 'AI 거버넌스', 'AI 규정 준수']
---

ClickHouse는 고객 지원과 플랫폼 기능 확장을 위해 AI를 활용합니다. 이 문서에서는 AI가 사용되는 영역, 이를 활성화하거나 비활성화하는 방법, 그리고 사용 방법을 설명하는 다른 문서 링크를 안내합니다.

:::info AI 데이터 보존 및 학습
기본적으로 ClickHouse의 AI 기능은 고객 데이터를 보존하지 않으며, 모델 학습에 고객 데이터를 사용하지 않습니다.
:::

## AI 지원 \{#ai-support\}

ClickHouse는 고객이 설정 또는 문제 해결 지원을 위해 채팅 에이전트와 상호작용할 수 있도록 AI 기능을 제공합니다. 이 에이전트는 ClickHouse 문서와 사례 관리 시스템의 정보를 활용하여 고객 문의에 신속하게 답변합니다. ClickHouse는 문의 수, 응답이 도움이 되었는지에 대한 피드백(thumbs up/thumbs down)과 같은 비식별화된 AI 사용 데이터를 수집합니다. 고객은 조직 설정 탭에서 이 기능을 비활성화할 수 있습니다.

## ClickHouse Assistant \{#clickhouse-assistant\}

[ClickHouse Assistant](/cloud/features/ai-ml/ask-ai)는 SQL 콘솔에서 서비스 단위로 활성화할 수 있습니다. 이 기능은 다음과 같은 두 가지 별도 기능을 제공합니다.

| 기능                   | 설명                        | 사용 데이터                                  | 사용자 검증                             |
| :------------------- | :------------------------ | :-------------------------------------- | :--------------------------------- |
| SQL AI               | 쿼리를 작성, 분석하고 개선 사항을 제안합니다 | 서비스 메타데이터, 쿼리 텍스트, 프롬프트 입력              | 쿼리 실행 전에 사용자가 검토할 수 있도록 출력이 제공됩니다  |
| ClickHouse Assistant | 자연어로 질문하고 답변을 받을 수 있습니다   | 서비스 메타데이터 및 콘텐츠, ClickHouse 문서, 프롬프트 입력 | 출력이 검토용으로 제공되며, 사용 전 사용자가 검증해야 합니다 |

## 모델 컨텍스트 프로토콜 \{#model-comtext-protocol\}

[ClickHouse MCP](/cloud/features/ai-ml/remote-mcp)를 사용하면 ClickHouse 서비스의 데이터를 활용하는 자체 에이전트를 고객이 더 쉽게 구축할 수 있습니다. 이를 사용하려면 별도의 설정이 필요하며, 데이터 처리에는 고객이 선택한 AI 모델을 사용합니다. ClickHouse는 고객의 AI 모델을 관리하지 않으며, 해당 모델에 접근할 수도 없습니다.