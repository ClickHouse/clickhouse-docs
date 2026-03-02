---
sidebar_label: 'Ask AI 에이전트'
slug: /cloud/features/ai-ml/ask-ai
title: 'Cloud에서 Ask AI 에이전트 사용하기'
description: 'ClickHouse Cloud의 Ask AI 채팅 기능에 대한 설명'
doc_type: 'reference'
---

# Cloud에서 AI 에이전트 사용하기 \{#ask-ai-agent-in-cloud\}

「Ask AI」 에이전트는 ClickHouse Cloud 서비스에 호스팅된 데이터에 대해 복잡한 분석 작업을 손쉽게 실행할 수 있도록 해 주는 턴키(즉시 사용 가능한) 기능입니다.
SQL을 작성하거나 대시보드를 탐색하는 대신, 찾고자 하는 내용을 자연어로 설명하면 됩니다.
에이전트는 생성된 쿼리, 시각화, 요약본 형태로 응답하며, 활성 탭, 저장된 쿼리, 스키마 세부 정보, 대시보드와 같은 컨텍스트를 함께 활용하여 정확도를 높일 수 있습니다.
질문에서 인사이트로, 프롬프트에서 실제로 동작하는 대시보드나 API로 빠르게 이어지도록 돕는 내장형 도우미로 설계되었습니다.

이 기능에는 콘솔에서 바로 ClickHouse 문서에 대해 구체적인 질문을 할 수 있는 「Docs AI」 서브 에이전트도 포함됩니다.
수백 페이지의 문서를 일일이 검색하는 대신, 「materialized view는 어떻게 구성합니까?」 또는 「ReplacingMergeTree와 AggregatingMergeTree의 차이는 무엇입니까?」와 같은 직접적인 질문을 입력하여, 관련 코드 예제와 원본 문서 링크가 포함된 정확한 답변을 받을 수 있습니다.

자세한 내용은 [guides](/use-cases/AI_ML/AIChat) 섹션을 참조하십시오.