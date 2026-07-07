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
import Image from '@theme/IdealImage';
import vision from '@site/static/images/cloud/agent-builder/vision/vision.png';

<BetaBadge />

Vision에서는 에이전트가 분석할 이미지를 업로드할 수 있습니다. 에이전트는 이미지를 비전 기능을 지원하는 모델에 전달하며, 해당 모델은 이미지에 포함된 내용을 설명하거나 요약하거나 관련 질문에 답변합니다.

## 비전 기능 활성화하기 \{#enable-it\}

비전은 이미지 입력을 지원하는 모델에서만 작동합니다. 선택한 모델이 이미지 입력을 처리할 수 없으면 메시지 컴포저의 업로드 컨트롤이 비활성화됩니다. 다시 활성화하려면 비전 지원 모델로 전환하세요.

## 비전 기능 사용하기 \{#use-it\}

메시지 컴포저의 왼쪽 아래에 있는 클립 아이콘을 클릭한 다음 **Upload to Provider**를 선택하여 이미지(스크린샷, 사진, 차트, 다이어그램)를 첨부하십시오. 그리고 이미지를 읽어야 답할 수 있는 질문을 할 수 있습니다. 예: *&quot;이 쿼리 계획의 문제는 무엇인가요?&quot;*, *&quot;이 스크린샷의 텍스트를 옮겨 적어 주세요,&quot;* 또는 *&quot;이 대시보드를 지난주 것과 비교해 주세요.&quot;*

<Image img={vision} alt="클립 메뉴가 열려 있고 Upload to Provider, Upload as Text, Upload to Code Environment 옵션이 표시된 메시지 컴포저" size="lg" />

에이전트는 이미지를 메시지 맥락의 일부로 처리하므로, 같은 턴의 후속 질문에서는 이미지를 다시 업로드하지 않고도 앞서 본 내용을 참조할 수 있습니다.

## 비전을 다른 도구와 함께 사용하기 \{#combine-with-other-tools\}

비전은 이미지 기반 분석에 [code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter)와 함께 사용하면 효과적입니다. 예를 들어, 에이전트가 스크린샷에서 숫자를 읽어낸 다음 Python을 실행해 합계를 계산할 수 있습니다. 또한 이미지에 모델이 조회해야 할 내용이 언급된 경우 [web search](/cloud/features/ai-ml/agents/builder/web-search)와도 잘 연계됩니다.