---
sidebar_label: '웹 검색'
sidebar_position: 3
slug: /cloud/features/ai-ml/agents/builder/web-search
title: '웹 검색'
description: 'ClickHouse Agents를 위한 외부 웹 검색 도구'
keywords: ['AI', 'ClickHouse Cloud', 'agents', '웹 검색']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import webSearch from '@site/static/images/cloud/agent-builder/web-search/web-search.png';

<BetaBadge />

웹 검색을 사용하면 에이전트가 대화 중 공개 웹에서 정보를 가져올 수 있습니다. 최근 릴리스처럼 최신 정보가 필요하거나, 서비스 외부에 있는 문서를 확인해야 하거나, 신뢰할 수 있는 출처를 빠르게 대조해야 하는 질문에 유용합니다.

## 활성화하기 \{#enable-it\}

Agent Builder에서 **Capabilities** 섹션의 **웹 검색**를 켜십시오. 활성화되면 에이전트는 사용자 질문과 에이전트 지침을 바탕으로 언제 검색을 실행할지 결정합니다. 검색이 실행되면 결과가 스크레이프되고, 가장 관련성이 높은 콘텐츠가 모델 컨텍스트로 다시 전달됩니다.

<Image img={webSearch} alt="웹 검색 체크박스가 표시된 웹 검색 섹션이 강조된 Capabilities 패널" size="sm" />

## 검색 라운드의 작동 방식 \{#how-a-search-round-works\}

각 검색은 Cloud에서 자동으로 관리되는 3단계로 진행됩니다.

1. **검색** - 에이전트의 쿼리가 후보 URL을 반환하는 검색 서비스로 전송됩니다.
2. **스크레이프** - 관련 페이지를 가져와 의미 있는 텍스트를 추출합니다.
3. **리랭크** - 리랭커가 결과에 점수를 매겨 모델이 가장 유용한 결과를 먼저 확인할 수 있게 합니다.

에이전트의 응답에는 실제로 사용한 URL이 함께 인용됩니다.

## 사용해야 하는 경우 \{#when-to-use-it\}

* 서비스에 없는 릴리스 노트나 changelog를 찾아봐야 할 때
* 모델이 알지 못할 수 있는 사실을 source와 대조해 확인해야 할 때
* 공개 블로그 게시물이나 문서를 대화에 가져와 분석해야 할 때

데이터나 모델 자체의 지식만으로 답변할 수 있는 질문에는 사용하지 마십시오. 검색 라운드를 한 번 수행할 때마다 지연 시간이 추가됩니다.