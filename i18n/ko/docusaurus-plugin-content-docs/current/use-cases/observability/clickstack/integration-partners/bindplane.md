---
slug: /use-cases/observability/clickstack/integration-partners/bindplane
title: 'Bindplane를 사용하여 OpenTelemetry를 ClickStack으로 전송하기'
sidebar_label: 'Bindplane'
pagination_prev: null
pagination_next: null
description: 'Bindplane을 사용해 텔레메트리를 ClickStack으로 라우팅하여 중앙에서 컬렉터를 관리합니다'
doc_type: 'guide'
keywords: ['Bindplane', 'OTEL', 'ClickStack', 'OpenTelemetry', 'collector management']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import bindplane_hyperdx from '@site/static/images/clickstack/bindplane/bindplane-hyperdx.png';
import bindplane_configuration from '@site/static/images/clickstack/bindplane/bindplane-configuration.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Bindplane으로 OpenTelemetry를 ClickStack에 전송하기 \{#bindplane-clickstack\}

<PartnerBadge/>

:::note[요약]
이 가이드는 Bindplane의 네이티브 ClickStack 대상(native ClickStack destination)을 사용하여 텔레메트리 데이터를 ClickStack으로 라우팅하는 방법을 설명합니다. 다음을 수행하는 방법을 안내합니다:

- Bindplane에서 ClickStack을 대상으로 구성하는 방법
- 텔레메트리 데이터를 처리하고 라우팅하기 위한 구성을 생성하는 방법
- OTel collector에 구성을 원격으로 배포하고 데이터 수집을 시작하는 방법
- ClickStack에서 텔레메트리 데이터를 확인하는 방법

이 통합은 ClickStack의 고성능 수집 기능과 Bindplane의 중앙 집중식 collector 관리 기능을 결합하여, 운영 부담 없이 관측성을 확장하기 쉽게 해줍니다.

소요 시간: 10-15분
:::

## Bindplane이란 무엇입니까? \{#what-is-bindplane\}

Bindplane은 OpenTelemetry Collector를 중앙에서 관리할 수 있게 해 주는 OpenTelemetry 네이티브 텔레메트리 파이프라인입니다. 시각적 구성 편집, 안전한 롤아웃, 지능형 파이프라인 기능을 제공하여 대규모 Collector 플릿 운영을 단순화합니다.

## Bindplane + ClickStack을 선택해야 하는 이유 \{#why-bindplane-clickstack\}

대규모 환경에서는 OpenTelemetry Collector 플릿을 관리하는 일이 운영상의 병목이 됩니다. ClickStack은 초대형 수집 규모를 처리할 수 있음이 이미 입증되었으며, 고객들은 초당 기가바이트 단위로 텔레메트리를 수집하고 수백 페타바이트를 저장하고 있습니다. 과제의 초점은 쿼리 성능에서 ClickHouse로 데이터를 공급하는 Collector 인프라를 안정적으로 운영하는 것으로 이동합니다.

Bindplane은 다음과 같이 이를 해결합니다.

- 수천 개에서 100만 개가 넘는 OpenTelemetry Collector에 대한 중앙 집중식 관리
- 안전한 원클릭 롤아웃이 가능한 시각적 구성 편집
- 데이터가 ClickStack에 도달하기 전에 일관되게 적용되는 자동 리소스 감지 및 보강
- 동일한 텔레메트리 스트림을 동시에 ClickStack과 다른 대상에 전송할 수 있는 팬아웃 라우팅
- Collector 상태, 처리량, 엔드 투 엔드 성능을 포함한 전체 파이프라인 가시성

:::tip 핵심 요약

- **ClickStack은 초대형 수집 규모, 저장, 그리고 빠른 분석 쿼리를 처리합니다.**
- **Bindplane은 Collector 플릿 운영에 따른 수집 파이프라인과 운영 복잡성을 관리합니다.**
:::

## 사전 준비 사항 \{#prerequisites\}

- ClickStack 인스턴스 실행 중(로컬, Server, 또는 ClickHouse Cloud)
- Bindplane 계정([`app.bindplane.com`](https://app.bindplane.com)에서 계정 생성)
- Bindplane OTel Collector 설치 완료([Install Your First Collector](https://docs.bindplane.com/readme/install-your-first-collector) 참고)
- Bindplane collectors에서 ClickStack OTLP 엔드포인트로의 네트워크 연결 가능
- ClickStack API 수집 키(ClickStack Team Settings > API Keys에서 확인, 참고용 문서는 [여기에서 확인](/docs/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data))
- 필요한 네트워크 포트가 개방되어 있어야 함(`4318`은 HTTP/HTTPS, `4317`은 gRPC 용)

## Bindplane과 ClickStack 통합 \{#integrate-bindplane-clickstack\}

<VerticalStepper headerLevel="h4">

#### ClickStack를 대상(destination)으로 설정 \{#configure-destination\}

1. Bindplane 계정에 로그인합니다.
2. **Library**로 이동합니다.
3. **Add Destination**을 클릭합니다.
4. 사용 가능한 대상 목록에서 **ClickStack**을 선택합니다.
5. 연결을 설정합니다.
   - **Protocol**: HTTP 또는 gRPC를 선택합니다 (기본값: `4318` 포트의 HTTP).
   - **Hostname**: ClickStack OTLP 엔드포인트의 호스트 이름 또는 IP 주소를 입력합니다.
   - **Port**: 포트를 입력합니다 (`4318`은 HTTP, `4317`은 gRPC).
   - **API Ingestion Key**: ClickStack API 수집 키를 입력합니다.
6. 대상에 이름을 지정합니다 (예: "ClickStack Production").
7. **Save**를 클릭하여 대상을 생성합니다.

:::tip 핵심 정리
ClickStack 대상은 HTTP와 gRPC 프로토콜을 모두 지원합니다. 대량 트래픽 환경에서는 더 나은 성능을 위해 압축(gzip, zstd, snappy)을 사용하는 gRPC 구성을 권장합니다.
:::

#### 구성(configuration) 생성 \{#create-configuration\}

ClickStack 대상 구성이 완료되면, 텔레메트리를 처리하고 라우팅하기 위한 구성을 생성합니다.

1. **Configurations** → **Create Configuration**으로 이동합니다.
2. 구성에 이름을 지정합니다 (예: "ClickStack Pipeline").
3. 배포 환경에 맞는 **Collector Type**과 **Platform**을 선택합니다.
4. 소스를 추가합니다.
   - **Add Source**를 클릭하여 80개 이상의 사용 가능한 소스 중에서 선택합니다.
   - 테스트 목적이라면, 트래픽을 시뮬레이션하기 위한 텔레메트리 생성기 소스를 추가할 수 있습니다.
   - 운영 환경에서는 실제 텔레메트리(로그, 메트릭, 트레이스)를 위한 소스를 추가합니다.
5. ClickStack 대상을 추가합니다.
   - **Add Destination**을 클릭합니다.
   - 이전 단계에서 생성한 ClickStack 대상을 선택합니다.
   - 전송할 텔레메트리 유형(Logs, Metrics, Traces 또는 전체)을 선택합니다.

:::tip 핵심 정리
필터링, 샘플링, 마스킹, 보강, 배치 처리 등 다양한 프로세서를 추가하여 텔레메트리가 ClickStack에 도달하기 전에 형태를 조정할 수 있습니다. 이를 통해 일관되고 구조화된 데이터가 ClickHouse로 유입되도록 보장합니다.
:::

#### 프로세서 추가 (선택 사항) \{#add-processors\}

Bindplane은 파이프라인 인텔리전스와 프로세서 추천 기능을 제공합니다. 다음과 같은 프로세서를 추가할 수 있습니다.

- **Filter**: 불필요한 텔레메트리를 제외하여 데이터 양을 줄입니다.
- **Sample**: 대량 트레이스에 샘플링 전략을 적용합니다.
- **Enrich**: 리소스 속성, 라벨, 메타데이터를 추가합니다.
- **Transform**: 텔레메트리 구조 또는 내용을 수정합니다.
- **Batch**: 전송 효율화를 위해 배치 크기를 최적화합니다.

이러한 프로세서는 데이터가 ClickStack에 도달하기 전에 수집기 플릿(fleet) 전체에 일관되게 적용됩니다.

#### 수집기 배포 및 롤아웃 시작 \{#deploy-collectors\}

1. 구성에 수집기(BDOT Collector)를 추가합니다.
   - Bindplane에서 **Agents**로 이동합니다.
   - 대상 시스템에 Bindplane 수집기를 설치합니다. [Bindplane의 설치 안내](https://docs.bindplane.com/readme/install-your-first-collector)를 따릅니다.
   - 연결이 완료되면 수집기가 수집기 목록에 표시됩니다.

2. 구성을 수집기에 할당합니다.
   - 사용하려는 수집기를 선택합니다.
   - 해당 수집기에 ClickStack 구성을 할당합니다.

3. 롤아웃을 시작합니다.
   - **Start Rollout**을 클릭하여 구성을 배포합니다.
   - Bindplane이 롤아웃 전에 구성을 검증합니다.
   - Bindplane UI에서 롤아웃 상태를 모니터링합니다.

:::tip 핵심 정리
Bindplane은 검증 절차가 포함된 안전한 원클릭 롤아웃을 제공합니다. Bindplane 인터페이스를 통해 수집기 상태, 처리량, 오류를 실시간으로 모니터링할 수 있습니다.
:::

<Image img={bindplane_configuration} alt="Bindplane을 통한 ClickStack의 텔레메트리 신호" size="lg"/>

#### ClickStack에서 텔레메트리 검증 \{#verify-telemetry\}

구성 롤아웃이 완료되면, 관리되는 수집기 플릿에서 ClickStack으로 텔레메트리가 유입되기 시작합니다.

1. ClickStack 인스턴스(HyperDX UI)에 로그인합니다.
2. **Logs**, **Metrics**, **Traces** 탐색기로 이동합니다.
3. Bindplane에서 관리하는 수집기에서 전송된 텔레메트리 데이터가 표시되어야 합니다.
4. ClickStack에 도착하는 데이터는 이미 Bindplane 프로세서에 의해 보강되고 구조화된 상태입니다.

<Image img={bindplane_hyperdx} alt="Bindplane을 통한 ClickStack의 텔레메트리 신호" size="lg"/>

</VerticalStepper>

## 고급 설정 \{#advanced-configuration\}

### 팬아웃 라우팅 \{#fan-out-routing\}

Bindplane은 팬아웃 라우팅을 지원하여 동일한 텔레메트리 스트림을 여러 대상에 동시에 전송할 수 있습니다. 다음과 같은 구성이 가능합니다:

- 로그, 메트릭, 트레이스를 장기 보관 및 분석을 위해 ClickStack으로 전송
- 동일한 데이터를 실시간 알림을 위해 다른 관측성 플랫폼으로 라우팅
- 특정 텔레메트리를 보안 분석을 위해 SIEM 플랫폼으로 전달

이는 Bindplane 설정에 여러 개의 대상을 추가하는 방식으로 설정합니다.

### 압축 및 성능 \{#compression\}

대량 트래픽 환경에서는 ClickStack 대상으로 압축을 구성하십시오.

- **HTTP**: gzip, deflate, snappy, zstd 또는 none을 지원합니다 (기본값: gzip)
- **gRPC**: gzip, snappy, zstd 또는 none을 지원합니다 (기본값: gzip)

압축은 ClickStack으로 텔레메트리를 전송할 때 대역폭 사용량을 줄여 주며, 특히 대규모 환경에서 중요합니다.

## 다음 단계 \{#next-steps\}

이제 Bindplane에서 ClickStack으로 텔레메트리 데이터가 전송되도록 설정했으므로, 다음 작업을 수행할 수 있습니다:

- **대시보드 구축**: ClickStack(HyperDX)에서 로그, 메트릭, 트레이스를 위한 시각화를 생성합니다
- **알림 설정**: 치명적인 상태나 조건에 대해 ClickStack에서 알림을 구성합니다
- **배포 규모 확장**: 관측성 요구 사항이 증가함에 따라 더 많은 수집기와 소스를 추가하여 배포를 확장합니다
- **파이프라인 최적화**: Bindplane의 파이프라인 인텔리전스를 활용하여 최적화 기회를 식별합니다

## 자세히 알아보기 \{#read-more\}

* [Bindplane 문서의 ClickStack 통합](https://docs.bindplane.com/integrations/destinations/clickstack)

{/* - ["Bindplane + ClickStack Integration: OpenTelemetry (OTel)을 ClickStack으로 전송하기" Bindplane 블로그의](tbd) -- 게시되면 링크를 추가하십시오 */ }
