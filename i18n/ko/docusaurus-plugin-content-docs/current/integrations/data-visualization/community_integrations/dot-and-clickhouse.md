---
'sidebar_label': '점'
'slug': '/integrations/dot'
'keywords':
- 'clickhouse'
- 'dot'
- 'ai'
- 'chatbot'
- 'mysql'
- 'integrate'
- 'ui'
- 'virtual assistant'
'description': 'AI 챗봇 | Dot은 비즈니스 데이터 질문에 답하고, 정의 및 관련 데이터 자산을 검색하며, ClickHouse 기반의
  데이터 모델링에도 도움을 줄 수 있는 지능형 가상 데이터 어시스턴트입니다.'
'title': '점'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/)는 당신의 **AI 데이터 분석가**입니다.
ClickHouse에 직접 연결되어 자연어로 데이터 질문을 하고, 데이터를 발견하며, 가설을 테스트하고, “왜” 질문에 대한 답변을 제공합니다 — 슬랙, Microsoft Teams, ChatGPT 또는 기본 웹 UI에서 직접 가능하게 해줍니다.

## Pre-requisites {#pre-requisites}

- 자체 호스팅된 ClickHouse 데이터베이스 또는 [ClickHouse Cloud](https://clickhouse.com/cloud)  
- [Dot](https://www.getdot.ai/) 계정  
- [Hashboard](https://www.hashboard.com/) 계정 및 프로젝트.

## Connecting Dot to ClickHouse {#connecting-dot-to-clickhouse}

<Image size="md" img={dot_01} alt="Dot에서 ClickHouse 연결 구성 (라이트 모드)" border />
<br/>

1. Dot UI에서 **Settings → Connections**로 이동합니다.  
2. **Add new connection**을 클릭하고 **ClickHouse**를 선택합니다.  
3. 연결 세부 정보를 제공합니다:  
   - **Host**: ClickHouse 서버 호스트명 또는 ClickHouse Cloud 엔드포인트  
   - **Port**: `9440` (보안 네이티브 인터페이스) 또는 `9000` (기본 TCP)  
   - **Username / Password**: 읽기 권한이 있는 사용자  
   - **Database**: 기본 스키마를 선택적으로 설정합니다  
4. **Connect**를 클릭합니다.

<Image img={dot_02} alt="ClickHouse 연결" size="sm"/>

Dot은 **query-pushdown**을 사용합니다: ClickHouse는 대규모 데이터 처리의 무거운 연산을 처리하며, Dot은 올바르고 신뢰할 수 있는 답변을 보장합니다.

## Highlights {#highlights}

Dot은 대화를 통해 데이터에 접근할 수 있도록 합니다:

- **자연어로 질문하기**: SQL을 작성하지 않고도 답변을 받을 수 있습니다.  
- **왜 분석**: 경향과 이상을 이해하기 위해 후속 질문을 할 수 있습니다.  
- **작업하는 곳에서 작동**: 슬랙, Microsoft Teams, ChatGPT 또는 웹 앱.  
- **신뢰할 수 있는 결과**: Dot은 오류를 최소화하기 위해 스키마 및 정의에 대해 쿼리를 검증합니다.  
- **확장 가능**: query-pushdown을 기반으로 하여 Dot의 지능과 ClickHouse의 속도를 결합합니다.

## Security and governance {#security}

Dot은 기업 준비가 완료되었습니다:

- **권한 및 역할**: ClickHouse 사용자 접근 제어를 상속합니다  
- **행 수준 보안**: ClickHouse에서 구성된 경우 지원됩니다  
- **TLS / SSL**: ClickHouse Cloud의 경우 기본적으로 활성화되어 있으며, 자체 호스팅의 경우 수동으로 구성해야 합니다  
- **거버넌스 및 검증**: 교육/검증 공간은 환각을 방지하는 데 도움을 줍니다  
- **규정 준수**: SOC 2 Type I 인증

## Additional resources {#additional-resources}

- Dot 웹사이트: [https://www.getdot.ai/](https://www.getdot.ai/)  
- 문서: [https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Dot 앱: [https://app.getdot.ai/](https://app.getdot.ai/)  

이제 **ClickHouse + Dot**를 사용하여 대화식으로 데이터를 분석할 수 있습니다 — Dot의 AI 도우미와 ClickHouse의 빠르고 확장 가능한 분석 엔진을 결합하여.
