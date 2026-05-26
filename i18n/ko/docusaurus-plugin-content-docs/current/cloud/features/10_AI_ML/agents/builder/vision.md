---
sidebar_label: '비전'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/builder/vision
title: '비전'
description: 'ClickHouse Agents의 이미지 입력 및 시각 이해'
keywords: ['AI', 'ClickHouse Cloud', 'agents', '비전', '이미지 입력', '멀티모달']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Vision에서는 에이전트가 분석할 이미지를 업로드할 수 있습니다. 에이전트는 이미지를 비전 기능을 지원하는 모델에 전달하며, 해당 모델은 이미지에 포함된 내용을 설명하거나 요약하거나 관련 질문에 답변합니다.

## 활성화하기 \{#enable-it\}

Agent Builder에서 비전 기능을 켜십시오. 비전은 이미지 입력을 지원하는 모델에서만 작동하므로, 선택한 모델이 이를 지원하지 않으면 업로드 컨트롤이 비활성화됩니다. 다시 활성화하려면 [모델 매개변수](/cloud/features/ai-ml/agents/builder/model-parameters)에서 비전 지원 모델로 전환하세요.

## 사용하기 \{#use-it\}

사용자는 메시지에 이미지(스크린샷, 사진, 차트, 다이어그램)를 첨부할 수 있습니다. 그리고 이미지를 읽어야 답할 수 있는 질문을 할 수 있습니다. 예: *&quot;이 쿼리 계획의 문제는 무엇인가요?&quot;*, *&quot;이 스크린샷의 텍스트를 옮겨 적어 주세요,&quot;* 또는 *&quot;이 대시보드를 지난주 것과 비교해 주세요.&quot;*

에이전트는 이미지를 메시지 맥락의 일부로 처리하므로, 같은 턴의 후속 질문에서는 이미지를 다시 업로드하지 않고도 앞서 본 내용을 참조할 수 있습니다.

## 다른 도구와 함께 사용하기 \{#combine-with-other-tools\}

비전은 이미지 기반 분석에 [code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter)와 함께 사용하면 효과적입니다. 예를 들어, 에이전트가 스크린샷에서 숫자를 읽어낸 다음 Python을 실행해 합계를 계산할 수 있습니다. 또한 이미지에 모델이 조회해야 할 내용이 언급된 경우 [web search](/cloud/features/ai-ml/agents/builder/web-search)와도 잘 연계됩니다.