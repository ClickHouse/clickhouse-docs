---
slug: /use-cases/observability/clickstack/service-maps
title: '서비스 맵'
sidebar_label: '서비스 맵'
pagination_prev: null
pagination_next: null
description: 'ClickStack 서비스 맵으로 서비스 간 의존성과 요청 흐름을 시각화합니다.'
doc_type: 'guide'
keywords: ['ClickStack', '서비스 맵', '토폴로지', '트레이스', '의존성', '분산 추적', '관측성', '요청 그래프']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import service_map_overview from '@site/static/images/clickstack/service-maps/service-map-overview.png';
import service_map_demo from '@site/static/images/clickstack/service-maps/service-map-demo.mp4';
import source_selector from '@site/static/images/clickstack/service-maps/source-selector.png';
import sampling from '@site/static/images/clickstack/service-maps/sampling.png';
import date_selector from '@site/static/images/clickstack/service-maps/date-selector.png';

<BetaBadge />

서비스 맵은 서비스 간 상호작용을 시각화합니다. ClickStack은 동일한 트레이스 내에서 클라이언트 스팬(나가는 요청)과 서버 스팬(들어오는 요청)을 매칭하여 그래프를 구축하고, 서비스 간 요청 경로를 재구성합니다.

전체 그래프를 열려면 왼쪽 탐색 패널에서 **Service Map**을 클릭하세요. OpenTelemetry로 [트레이스 데이터를 수집](/use-cases/observability/clickstack/ingesting-data)하면 서비스가 표시됩니다.

<Image img={service_map_overview} alt="서비스 노드와 그 사이의 요청 흐름을 보여주는 서비스 맵" size="lg" />

## 서비스 맵 살펴보기 \{#exploring-the-service-map\}

각 노드는 `service.name` 리소스 속성으로 식별되는 서비스를 나타냅니다. 간선(점선)은 한 서비스의 클라이언트 스팬이 다른 서비스의 서버 스팬과 일치하는 경우 두 서비스를 연결합니다. 노드 크기는 상대적인 트래픽 양을 반영하며, 빨간색 노드는 선택한 시간 범위에서 오류가 발생한 서비스를 나타냅니다.

맵 위의 도구 모음에서 필터를 적용하고 보기를 조정할 수 있습니다.

**소스 선택기** — 맵을 특정 트레이스 소스(예: &quot;ClickPy Traces&quot;)로 필터링합니다.

<Image img={source_selector} alt="서비스 맵 도구 모음에서 강조 표시된 소스 선택기" size="lg" />

**샘플링 슬라이더** — 성능과 정확성의 균형을 맞추도록 샘플링 비율을 조정합니다. 비율이 낮을수록 대용량 클러스터에서 더 빠르게 로드됩니다.

<Image img={sampling} alt="서비스 맵 도구 모음에서 강조 표시된 샘플링 슬라이더" size="lg" />

**날짜 범위 선택기** — 맵을 구축하는 데 사용할 트레이스 데이터의 시간 창을 설정합니다.

<Image img={date_selector} alt="서비스 맵 도구 모음에서 강조 표시된 날짜 범위 선택기" size="lg" />

맵 왼쪽 하단의 **+/-** 버튼을 사용하거나 스크롤하여 확대하거나 축소하십시오.

## 트레이스 수준 서비스 맵 \{#trace-level-service-maps\}

개별 트레이스를 살펴보면 해당 요청이 서비스 간을 어떻게 이동했는지 보여주는 서비스 맵이 표시됩니다. 이를 통해 트레이스 워터폴을 벗어나지 않고도 단일 요청의 토폴로지를 확인할 수 있습니다.

<video src={service_map_demo} autoPlay loop muted playsInline width="100%" />