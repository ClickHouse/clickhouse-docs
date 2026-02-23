---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI Chatbot | Dot는 비즈니스 데이터 관련 질문에 답하고, 정의와 관련 데이터 자산을 찾아주며, 데이터 모델링까지 도와줄 수 있는 ClickHouse로 구동되는 지능형 가상 데이터 어시스턴트입니다.'
title: 'Dot'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot \{#dot\}

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/)은 **AI 데이터 분석가**입니다.
ClickHouse에 직접 연결되므로 자연어로 데이터를 질의하고, 데이터를 탐색하며, 가설을 검증하고, 원인(왜 그랬는지)에 대한 질문에 답변할 수 있습니다. 이 모든 작업을 Slack, Microsoft Teams, ChatGPT 또는 네이티브 Web UI에서 직접 수행할 수 있습니다.

## 사전 준비 사항 \{#pre-requisites\}

- 자체 호스팅 또는 [ClickHouse Cloud](https://clickhouse.com/cloud) 환경의 ClickHouse 데이터베이스  
- [Dot](https://www.getdot.ai/) 계정  
- [Hashboard](https://www.hashboard.com/) 계정과 프로젝트

## Dot를 ClickHouse에 연결하기 \{#connecting-dot-to-clickhouse\}

<Image size="md" img={dot_01} alt="Dot에서 ClickHouse 연결 구성하기(라이트 모드)" border />

<br/>

1. Dot UI에서 **Settings → Connections**로 이동합니다.  
2. **Add new connection**을 클릭하고 **ClickHouse**를 선택합니다.  
3. 연결 정보를 입력합니다.  
   - **Host**: ClickHouse 서버 호스트 이름 또는 ClickHouse Cloud 엔드포인트  
   - **Port**: `9440`(보안 네이티브 인터페이스) 또는 `9000`(기본 TCP)  
   - **Username / Password**: 읽기 권한이 있는 사용자  
   - **Database**: 필요하다면 기본 스키마를 설정합니다.  
4. **Connect**를 클릭합니다.

<Image img={dot_02} alt="ClickHouse에 연결하기" size="sm"/>

Dot은 **query-pushdown**을 사용합니다. 대규모 연산은 ClickHouse가 처리하며, Dot은 정확하고 신뢰할 수 있는 결과를 제공합니다.

## 주요 기능 \{#highlights\}

Dot는 대화를 통해 데이터를 쉽게 활용할 수 있게 합니다:

- **자연어로 질문**: SQL을 작성하지 않고도 답을 얻을 수 있습니다.  
- **Why 분석**: 후속 질문을 통해 추세와 이상 징후를 파악할 수 있습니다.  
- **업무 환경과의 통합**: Slack, Microsoft Teams, ChatGPT 또는 웹 앱에서 그대로 사용할 수 있습니다.  
- **신뢰할 수 있는 결과**: Dot가 스키마와 정의를 기준으로 쿼리를 검증하여 오류를 최소화합니다.  
- **확장 가능**: query-pushdown 방식을 기반으로 Dot의 지능과 ClickHouse의 속도를 결합하여 동작합니다.

## 보안과 거버넌스 \{#security\}

Dot은 엔터프라이즈 환경에 사용할 수 있도록 준비되어 있습니다:

- **권한 및 역할**: ClickHouse 사용자 액세스 제어를 그대로 따릅니다  
- **행 수준 보안(Row-level security)**: ClickHouse에서 구성된 경우 지원됩니다  
- **TLS / SSL**: ClickHouse Cloud에서는 기본적으로 활성화되며, 셀프 호스팅 환경에서는 수동으로 구성해야 합니다  
- **거버넌스 및 검증**: 학습/검증 공간을 통해 환각(hallucination) 현상을 방지하는 데 도움이 됩니다  
- **규정 준수**: SOC 2 Type I 인증을 획득했습니다

## 추가 자료 \{#additional-resources\}

- Dot 웹사이트: [https://www.getdot.ai/](https://www.getdot.ai/)  
- 문서: [https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Dot 앱: [https://app.getdot.ai/](https://app.getdot.ai/)  

이제 **ClickHouse + Dot**을 사용하여 Dot의 AI 어시스턴트와 ClickHouse의 빠르고 확장 가능한 분석 엔진을 결합해 대화형으로 데이터를 분석할 수 있습니다.