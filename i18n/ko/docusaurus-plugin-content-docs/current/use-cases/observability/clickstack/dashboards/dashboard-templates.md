---
slug: /use-cases/observability/clickstack/dashboards/dashboard-templates
title: '대시보드 템플릿'
sidebar_label: '대시보드 템플릿'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 사전 구축된 대시보드 템플릿 가져오기'
doc_type: 'guide'
keywords: ['ClickStack', '대시보드', '템플릿', '가져오기', '관측성']
---

import Image from '@theme/IdealImage';
import browse_dashboard_template from '@site/static/images/use-cases/observability/browse-dashboard-template.png';
import dashboard_template_gallery from '@site/static/images/use-cases/observability/dashboard-template-gallery.png';
import import_dashboard_template from '@site/static/images/use-cases/observability/import-dashboard-template.png';

ClickStack에는 일반적인 인프라 및 애플리케이션 메트릭을 즉시 확인할 수 있는 사전 구축된 대시보드 템플릿 라이브러리가 포함되어 있습니다.

## 사용 가능한 템플릿 둘러보기 \{#browsing-templates\}

기본 제공 템플릿 라이브러리를 둘러보려면 **대시보드**로 이동한 다음 **대시보드 템플릿 둘러보기**를 클릭하십시오.

<Image img={browse_dashboard_template} alt="대시보드 템플릿 둘러보기 버튼" size="lg" />

그러면 템플릿 갤러리가 열리며, 템플릿이 카테고리별로 정리되어 있습니다. 해당 템플릿의 가져오기 절차를 시작하려면 **Import**를 클릭하십시오.

<Image img={dashboard_template_gallery} alt="대시보드 템플릿 갤러리" size="lg" />

## 템플릿 가져오기 \{#importing-a-template\}

템플릿을 가져오려면 각 대시보드 시각화에 데이터 소스를 설정해야 합니다. 각 시각화의 드롭다운에서 데이터 소스를 선택한 후 `Finish Import`를 클릭하십시오.

<Image img={import_dashboard_template} alt="대시보드 템플릿 가져오기" size="lg" />

## 사전 구축된 템플릿 \{#pre-built-templates\}

### OTel 런타임 메트릭 \{#otel-runtime-metrics\}

기본 제공되는 OTel 런타임 메트릭 템플릿은 [OpenTelemetry runtime metrics](https://opentelemetry.io/docs/specs/semconv/runtime/)로 계측된 애플리케이션용으로 설계되었습니다.

| 템플릿                         | 설명                                                 |
| --------------------------- | -------------------------------------------------- |
| **.NET Runtime Metrics**    | .NET 애플리케이션의 GC 수집, 힙 크기, 스레드 풀 사용량, 어셈블리 수        |
| **Go Runtime Metrics**      | Go 애플리케이션의 고루틴 수, GC 일시 중지 시간, 힙 사용량, 메모리 통계       |
| **JVM Runtime Metrics**     | JVM 기반 애플리케이션의 힙 및 비힙 메모리, GC 지속 시간, 스레드 수, 클래스 로딩 |
| **Node.js Runtime Metrics** | Node.js 애플리케이션의 이벤트 루프 지연, 힙 사용량, CPU 사용률, V8 메모리  |

참고:

* 각 템플릿은 대시보드의 런타임과 일치하는 [`telemetry.sdk.language`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/telemetry/#telemetry-sdk-language) 리소스 속성을 가진 서비스를 대상으로 [사용자 지정 필터](./#custom-filters)가 구성되어 있습니다.
  * 사용자 지정 ClickHouse 메트릭 테이블 schema를 사용하는 환경에서는 올바른 Service Name 및 Resource Attributes 컬럼을 쿼리하도록 이 필터를 조정해야 할 수 있습니다.
  * 대용량 환경에서는 `ResourceAttributes['telemetry.sdk.language']` 컬럼을 [materialize](../managing/performance_tuning.md#materialize-frequently-queried-attributes)하여 필터 로드 시간을 줄일 수 있습니다.
* 템플릿은 게시 시점의 최신 OTel Semantic Conventions를 참조하며, OTel Spec이 업데이트되면 이에 맞춰 주기적으로 업데이트됩니다. 이전 버전의 OTel SDKs로 계측된 서비스의 경우, 이전 메트릭 이름을 참조하도록 시각화를 [편집](./#dashboards-editing-visualizations)해야 할 수 있습니다.