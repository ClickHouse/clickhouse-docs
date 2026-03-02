---
slug: /use-cases/observability/clickstack/overview
title: 'ClickStack - ClickHouse 관측성 스택'
sidebar_label: '개요'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/getting-started/index
description: 'ClickStack - ClickHouse 관측성 스택 개요'
doc_type: 'guide'
keywords: ['clickstack', '관측성', '로그', '모니터링', '플랫폼']
---

import Image from '@theme/IdealImage';
import oss_simple_architecture from '@site/static/images/use-cases/observability/clickstack-simple-oss-architecture.png';
import managed_simple_architecture from '@site/static/images/use-cases/observability/clickstack-simple-managed-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={landing_image} alt="랜딩 페이지" size="lg" />

**ClickStack**은(는) ClickHouse 위에 구축된 프로덕션급 관측성 플랫폼으로, 로그, 트레이스, 메트릭, 세션을 단일 고성능 솔루션으로 통합합니다. 복잡한 시스템의 모니터링과 디버깅을 위해 설계되었으며, ClickStack을 사용하면 개발자와 SRE가 도구를 전환하거나 타임스탬프·상관관계 ID를 이용해 데이터를 수동으로 이어 붙이지 않고도 문제를 엔드 투 엔드로 추적할 수 있습니다.

ClickStack의 핵심에는 단순하지만 강력한 아이디어가 있습니다. 모든 관측성 데이터는 필드가 풍부한 와이드(wide) 이벤트 형태로 수집되어야 한다는 것입니다. 이러한 이벤트는 로그, 트레이스, 메트릭, 세션과 같은 데이터 유형별로 ClickHouse 테이블에 저장되지만, 데이터베이스 수준에서 완전히 쿼리 가능하고 상호 상관 분석이 가능합니다.

ClickStack은 ClickHouse의 열 지향 아키텍처, 기본 JSON 지원, 완전 병렬화된 실행 엔진을 활용하여 고카디널리티 워크로드를 효율적으로 처리하도록 설계되었습니다. 이를 통해 대규모 데이터셋에 대한 초 단위 미만의 쿼리, 넓은 시간 범위에 대한 빠른 집계, 개별 트레이스에 대한 심층 분석이 가능합니다. JSON은 압축된 컬럼형 포맷으로 저장되며, 사전 정의나 수동 개입 없이 스키마 진화를 허용합니다.


## 기능 \{#features\}

이 스택에는 디버깅과 근본 원인 분석을 위해 설계된 여러 핵심 기능이 포함됩니다:

- 로그, 메트릭, 세션 리플레이, 트레이스를 한 곳에서 연관시키고 검색
- 스키마에 구애받지 않으며, 기존 ClickHouse 스키마 위에서 그대로 동작
- ClickHouse에 최적화된 초고속 검색 및 시각화
- 직관적인 전문 검색 및 속성 검색 문법(예: `level:err`), SQL은 선택 사항
- 이벤트 델타(event delta)를 통한 이상 현상 추세 분석
- 몇 번의 클릭만으로 알림 설정
- 복잡한 쿼리 언어 없이 고 카디널리티(high cardinality) 이벤트를 대시보드로 시각화
- JSON 문자열에 대한 네이티브 쿼리 지원
- 항상 최신 이벤트를 보기 위한 라이브 테일(live tail) 로그 및 트레이스
- OpenTelemetry (OTel) 기본 지원
- HTTP 요청부터 DB 쿼리(APM)까지 상태 및 성능 모니터링
- 이상 징후 및 성능 회귀 식별을 위한 이벤트 델타
- 로그 패턴 인식

## Components \{#components\}

ClickStack는 세 가지 핵심 컴포넌트로 구성됩니다:

1. **ClickStack UI (HyperDX)** – 관측성 데이터 탐색 및 시각화를 위한 전용 프론트엔드
2. **OpenTelemetry collector** – 로그, 트레이스, 메트릭을 위한 사전 정의된 스키마를 갖춘 커스텀 사전 구성 수집기
3. **ClickHouse** – 스택의 중심에 위치한 고성능 분석 데이터베이스

이러한 컴포넌트는 완전한 **자가 관리형 ClickStack 오픈 소스** 환경으로 함께 배포하거나, 관리형 환경과 자체 호스팅 환경으로 나누어 배포할 수 있습니다. **Managed ClickStack**에서는 ClickHouse와 HyperDX UI가 [ClickHouse Cloud](/cloud/get-started)에서 호스팅 및 운영되며, 사용자는 OpenTelemetry collector만 실행합니다. 

브라우저에서 호스팅되는 HyperDX UI 버전도 제공되므로, 추가 UI 인프라를 배포하지 않고 기존 ClickHouse 배포에 직접 연결할 수 있습니다.

시작하려면 먼저 [시작하기 가이드](/use-cases/observability/clickstack/getting-started)를 확인한 다음 [샘플 데이터셋](/use-cases/observability/clickstack/sample-datasets)을 로드하십시오. 또한 [배포 옵션](/use-cases/observability/clickstack/deployment)과 [프로덕션 모범 사례](/use-cases/observability/clickstack/production)에 대한 문서도 살펴볼 수 있습니다.

## 원칙 \{#clickstack-principles\}

ClickStack은 관측성 스택의 모든 계층에서 사용 편의성, 성능, 유연성을 우선시하는 일련의 핵심 원칙에 따라 설계되었습니다.

### 몇 분 만에 손쉽게 설정 \{#clickstack-easy-to-setup\}

ClickStack은 최소한의 설정만으로 어떤 ClickHouse 인스턴스와 스키마에서도 바로 사용할 수 있습니다. 새로 시작하든 기존 환경과 통합하든, 몇 분 안에 바로 사용 가능한 상태로 만들 수 있습니다.

### 사용자 친화적이며 목적에 맞게 설계됨 \{#user-friendly-purpose-built\}

HyperDX UI는 SQL과 Lucene 스타일의 구문을 모두 지원하여, 사용자가 워크플로우에 가장 잘 맞는 쿼리 인터페이스를 선택할 수 있도록 합니다. 관측성을 위해 목적에 맞게 설계된 이 UI는 팀이 근본 원인을 빠르게 파악하고, 복잡한 데이터를 원활하게 탐색할 수 있도록 최적화되어 있습니다.

### 엔드투엔드 관측성 \{#end-to-end-observability\}

ClickStack은 프런트엔드 사용자 세션부터 백엔드 인프라 지표, 애플리케이션 로그, 분산 트레이스에 이르기까지 전체 스택에 대한 가시성을 제공합니다. 이러한 통합 뷰를 통해 전체 시스템을 대상으로 한 심층적인 상관 관계 분석이 가능합니다.

### ClickHouse용으로 설계됨 \{#built-for-clickhouse\}

스택의 모든 계층은 ClickHouse의 기능을 최대한 활용하도록 설계되었습니다. 쿼리는 ClickHouse의 분석 함수와 열 지향 엔진을 활용하도록 최적화되어 있어, 방대한 데이터에 대해 빠른 검색과 집계를 제공합니다.

### OpenTelemetry-네이티브 \{#open-telemetry-native\}

ClickStack은 OpenTelemetry와 기본적으로 통합되어 있으며, 모든 데이터를 OpenTelemetry collector 엔드포인트를 통해 수집합니다. 고급 사용자는 네이티브 파일 포맷, 사용자 정의 파이프라인, Vector와 같은 타사 도구를 사용해 데이터를 ClickHouse로 직접 수집하는 방식도 사용할 수 있습니다.

### 오픈 소스 및 완전한 사용자 정의 가능 \{#open-source-and-customizable\}

ClickStack은 완전한 오픈 소스이며 어디서나 배포할 수 있습니다. 스키마는 유연하고 사용자가 수정할 수 있으며, UI는 변경 없이도 사용자 정의 스키마에 맞게 구성할 수 있도록 설계되어 있습니다. 수집기, ClickHouse, UI를 포함한 모든 구성 요소는 수집, 쿼리 또는 저장소 요구 사항을 충족하도록 서로 독립적으로 확장할 수 있습니다.

## 아키텍처 개요 \{#architectural-overview\}

ClickStack 아키텍처는 배포 방식에 따라 달라집니다. 모든 컴포넌트를 자가 관리형으로 운영하는 **ClickStack Open Source**와, ClickHouse와 HyperDX UI가 ClickHouse Cloud에서 호스팅·운영되는 **Managed ClickStack** 사이에는 중요한 아키텍처 차이가 있습니다. 두 모델 모두 코어 컴포넌트는 동일하지만, 각 컴포넌트를 호스팅하고 확장하며 보안을 책임지는 주체가 다릅니다.

<Tabs groupId="architectures">
<TabItem value="managed-clickstack" label="Managed ClickStack" default>

<Image img={managed_simple_architecture} alt="Managed ClickStack 아키텍처" size="md" />

Managed ClickStack은 **ClickHouse Cloud** 내에서 완전히 실행되며, 동일한 ClickStack 데이터 모델과 사용자 경험을 유지하면서도 완전 관리형 관측성 백엔드를 제공합니다.

이 모델에서는 **ClickHouse와 ClickStack UI(HyperDX)** 가 ClickHouse Cloud에 의해 호스팅·운영·보호됩니다. OpenTelemetry Collector를 실행해 관리형 서비스로 텔레메트리 데이터를 전송하는 것만 사용자의 책임입니다.

Managed ClickStack은 다음 컴포넌트로 구성됩니다:

1. **ClickStack UI (HyperDX)**  
   HyperDX UI는 ClickHouse Cloud에 완전히 통합되어 서비스의 일부로서 관리됩니다. 로그 검색, 트레이스 탐색, 대시보드, 알림, 다양한 텔레메트리 유형 간 상관 분석 기능을 제공하며, 인증 및 액세스 제어가 통합되어 있습니다.

2. **OpenTelemetry collector (self-managed)**  
   OpenTelemetry Collector를 실행하여 애플리케이션과 인프라에서 발생하는 텔레메트리 데이터를 수신합니다. 이 Collector는 OTLP를 통해 데이터를 ClickHouse Cloud로 전달합니다. 표준을 준수하는 어떤 OpenTelemetry Collector도 사용할 수 있지만, ClickHouse로의 데이터 수집에 최적화되고 ClickStack 스키마와 즉시 연동되도록 사전 구성된 **ClickStack 배포판** 사용을 강력히 권장합니다.

3. **ClickHouse Cloud**  
   ClickHouse는 ClickHouse Cloud에서 완전 관리형으로 운영되며, 모든 관측성 데이터의 저장소이자 쿼리 엔진 역할을 합니다. 클러스터, 업그레이드 또는 운영상의 이슈를 직접 관리할 필요가 없습니다.

Managed ClickStack은 다음과 같은 주요 이점을 제공합니다:

- **스토리지와 독립적인 컴퓨팅 리소스 자동 확장**
- 객체 스토리지로 지원되는 **저비용의 사실상 무제한 보존 기간**
- ClickHouse Cloud Warehouses를 사용하는 **독립적인 읽기 및 쓰기 격리**
- **통합된 인증 및 액세스 제어**
- **자동 백업**
- **보안 및 컴플라이언스 기능**
- **운영 중단 없이 원활한 업그레이드**

이 배포 모델을 사용하면, 팀은 ClickHouse나 ClickStack UI를 직접 운영하는 부담 없이 관측성 워크플로와 계측 작업에만 전념할 수 있습니다.

운영 환경에 ClickStack을 배포하는 경우 Managed ClickStack 사용을 권장합니다. ClickHouse Cloud와 함께 ClickStack을 배포하는 방법은 [시작 가이드](/use-cases/observability/clickstack/getting-started/managed)를 참고하십시오.

<br/>
</TabItem>

<TabItem value="oss-clickstack" label="Open Source ClickStack" default>

<Image img={oss_simple_architecture} alt="OSS 단순 아키텍처" size="md" />

Open Source ClickStack은 세 가지 핵심 컴포넌트로 구성됩니다:

1. **ClickStack UI (HyperDX)**  
   관측성을 위해 설계된 사용자 친화적인 인터페이스입니다. Lucene 스타일과 SQL 쿼리 모두를 지원하며, 인터랙티브 대시보드, 알림, 트레이스 탐색 등을 제공하고, 백엔드로서 ClickHouse에 최적화되어 있습니다.

2. **OpenTelemetry collector**  
   ClickHouse로의 데이터 수집에 최적화된 opinionated 스키마로 구성된 커스텀 Collector입니다. OpenTelemetry 프로토콜을 통해 로그, 메트릭, 트레이스를 수신하고, 효율적인 배치 삽입을 사용하여 ClickHouse에 직접 기록합니다.

3. **ClickHouse**  
   폭이 넓은(wide) 이벤트의 중앙 데이터 저장소 역할을 하는 고성능 분석 데이터베이스입니다. ClickHouse는 열 지향 엔진과 JSON에 대한 네이티브 지원을 활용하여 대규모 환경에서 빠른 검색, 필터링, 집계를 제공합니다.

이 세 가지 컴포넌트 외에도, ClickStack은 대시보드, 사용자 계정, 구성 설정과 같은 애플리케이션 상태를 저장하기 위해 **MongoDB 인스턴스**를 사용합니다.

전체 아키텍처 다이어그램과 배포 세부 정보는 [아키텍처(Architecture) 섹션](/use-cases/observability/clickstack/architecture)에서 확인할 수 있습니다.

Open Source ClickStack을 운영 환경에 배포하려는 경우, ["Production"](/use-cases/observability/clickstack/production) 가이드를 읽을 것을 권장합니다.

<br/>
</TabItem>
</Tabs>