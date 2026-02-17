---
slug: /use-cases/observability/build-your-own
title: '직접 구축하는 관측성 스택'
pagination_prev: null
pagination_next: null
description: '직접 관측성 스택을 구축하기 위한 랜딩 페이지'
doc_type: 'landing-page'
keywords: ['관측성', '사용자 정의 스택', '직접 구축', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

이 가이드는 ClickHouse를 기반으로 사용자 정의 관측성 스택을 구축하는 방법을 다룹니다. 실용적인 예제와 모범 사례를 통해 logs, metrics, traces에 대한 관측성 솔루션을 설계, 구현 및 최적화하는 방법을 살펴봅니다.

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 이 가이드는 ClickHouse를 사용하여, 특히 logs와 traces에 중점을 두고 자체 관측성 솔루션을 구축하려는 사용자를 위해 설계되었습니다.                                             |
| [Schema design](/use-cases/observability/schema-design)          | logs와 traces를 위해 고유한 스키마를 생성할 것을 권장하는 이유와 이를 구현하기 위한 몇 가지 모범 사례를 안내합니다.                                                  |
| [Managing data](/observability/managing-data)          | 관측성을 위한 ClickHouse 배포에는 필연적으로 관리가 필요한 대규모 데이터 세트가 포함됩니다. ClickHouse는 데이터 관리를 지원하는 다양한 기능을 제공합니다.           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse와 함께 OpenTelemetry를 사용하여 logs와 traces를 수집하고 내보내는 방법을 설명합니다.                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX와 Grafana를 포함한 ClickHouse용 관측성 시각화 도구를 사용하는 방법을 다룹니다.                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse에서 logs와 traces를 처리하도록 포크된 OpenTelemetry Demo Application을 살펴봅니다.                                           |