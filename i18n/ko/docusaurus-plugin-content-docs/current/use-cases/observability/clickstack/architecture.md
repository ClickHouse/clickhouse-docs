---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack 아키텍처 - ClickHouse 관측성 스택'
title: '아키텍처'
toc_max_heading_level: 2
doc_type: 'reference'
keywords: ['ClickStack 아키텍처', '관측성 아키텍처', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', '시스템 설계']
---

import Image from '@theme/IdealImage';
import oss_architecture from '@site/static/images/use-cases/observability/clickstack-oss-architecture.png';
import managed_architecture from '@site/static/images/use-cases/observability/clickstack-managed-architecture.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 아키텍처는 배포 방식에 따라 달라집니다. 모든 구성 요소를 자가 관리형으로 운영하는 **ClickStack Open Source**와 ClickHouse와 HyperDX UI가 ClickHouse Cloud에서 호스팅되고 운영되는 **Managed ClickStack** 간에는 중요한 아키텍처 차이점이 있습니다. 두 모델 모두 핵심 구성 요소는 동일하지만, 각 구성 요소의 호스팅, 확장, 보안을 담당하는 주체는 달라집니다.


## 아키텍처 개요 \{#architecture-overview\}

다음은 관리형 및 오픈 소스 ClickStack 아키텍처에 대한 개요입니다.

<Tabs groupId="architectures">
  <TabItem value="관리형 ClickStack" label="매니지드 ClickStack" default>
    Managed ClickStack는 **ClickHouse Cloud** 내에서 완전히 실행되며, 동일한 ClickStack 데이터 모델과 사용자 경험을 유지하면서 완전 관리형 관측성 백엔드를 제공합니다.

    이 모델에서 **ClickHouse와 ClickStack UI (HyperDX)**는 ClickHouse Cloud에서 호스팅·운영·보안이 적용됩니다. 사용자는 관리형 서비스로 텔레메트리 데이터를 보내기 위해 **OpenTelemetry (OTel) collector**만 실행하면 됩니다.

    <Image img={managed_architecture} alt="Managed Architecture" size="lg" />

    ### ClickHouse Cloud: 엔진

    Managed ClickStack의 핵심에는 ClickHouse의 서버리스 버전인 ClickHouse Cloud가 있습니다. ClickHouse는 대규모 실시간 분석을 위해 설계된 컬럼 지향 데이터베이스입니다. ClickHouse Cloud는 관측성 데이터의 수집과 쿼리를 처리하며, 다음을 가능하게 합니다:

    * 테라바이트 규모 이벤트에 대한 서브초 검색
    * 하루 수십억 개의 고카디널리티 레코드 수집
    * 관측성 데이터에 대해 최소 10배 이상의 높은 압축률
    * 동적 스키마 진화를 허용하는 반정형 JSON 데이터에 대한 네이티브 지원
    * 수백 개의 내장 분석 함수를 포함한 강력한 SQL 엔진

    ClickHouse Cloud는 관측성 데이터를 폭넓은 이벤트 형태로 처리하여, 단일 통합 구조 내에서 로그, 메트릭, 트레이스 전반에 걸친 심층적인 상관관계를 지원합니다.

    오픈 소스 ClickHouse에 더해, 관측성 측면에서 다음과 같은 이점을 제공합니다:

    * 스토리지와 독립적인 컴퓨트의 자동 확장
    * 객체 스토리지를 기반으로 한 저비용, 사실상 무제한 보존 기간
    * Warehouses를 사용해 읽기 및 쓰기 워크로드를 독립적으로 분리할 수 있는 기능
    * 통합 인증
    * 자동 백업
    * 보안 및 규정 준수 기능
    * 중단 없는 업그레이드

    ### OpenTelemetry collector: 데이터 수집

    Managed ClickStack에는 사전 구성된 OpenTelemetry (OTel) collector가 포함되어 있어, 개방형 표준 방식으로 텔레메트리를 수집합니다. OTLP 프로토콜을 사용하여 다음을 통해 데이터를 전송할 수 있습니다:

    * gRPC (포트 `4317`)
    * HTTP (포트 `4318`)

    collector는 효율적인 배치로 텔레메트리를 ClickHouse Cloud로 내보냅니다. 데이터 소스별로 최적화된 테이블 스키마를 지원하여, 모든 신호 유형에 걸쳐 확장 가능한 성능을 보장합니다.

    **이 아키텍처 구성 요소는 사용자가 관리합니다**

    ### ClickStack UI (HyperDX): 인터페이스

    ClickStack UI (HyperDX)는 ClickStack의 사용자 인터페이스입니다. 다음과 같은 기능을 제공합니다:

    * 자연어 및 Lucene 스타일 검색
    * 실시간 디버깅을 위한 라이브 테일링
    * 로그, 메트릭, 트레이스를 아우르는 통합 뷰
    * 프론트엔드 관측성을 위한 세션 리플레이
    * 대시보드 생성 및 알림 구성
    * 고급 분석을 위한 SQL 쿼리 인터페이스

    HyperDX는 ClickHouse에 특화되어 설계되었으며, 강력한 검색 기능과 직관적인 워크플로를 결합하여 이상 징후를 빠르게 포착하고, 문제를 조사하며, 인사이트를 신속히 얻을 수 있도록 합니다.

    Managed ClickStack에서 UI는 ClickHouse Cloud 콘솔 인증 시스템에 통합되어 있습니다.
  </TabItem>

  <TabItem value="oss-clickstack" label="오픈 소스 ClickStack">
    ClickStack 오픈소스 아키텍처는 세 가지 핵심 컴포넌트인 **ClickHouse**, **HyperDX**, 그리고 **OpenTelemetry (OTel) collector**를 중심으로 구축됩니다. **MongoDB** 인스턴스는 애플리케이션 상태를 저장합니다. 이들 구성 요소는 함께 로그, 메트릭, 트레이스를 위한 고성능 오픈소스 관측성 스택을 제공합니다.

    <Image img={oss_architecture} alt="Architecture" size="lg" />

    ### ClickHouse: 데이터베이스 엔진

    ClickStack의 중심에는 대규모 실시간 분석을 위해 설계된 컬럼 지향 데이터베이스인 ClickHouse가 있습니다. ClickHouse는 관측성 데이터의 수집과 쿼리를 처리하며, 다음을 가능하게 합니다:

    * 테라바이트 규모 이벤트에 대한 1초 미만 지연의 검색
    * 하루 수십억 건의 고카디널리티 레코드 수집
    * 관측성 데이터에 대해 최소 10배 이상의 높은 압축률
    * 동적 스키마 진화를 허용하는 반정형 JSON 데이터에 대한 네이티브 지원
    * 수백 개의 내장 분석 함수가 포함된 강력한 SQL 엔진

    ClickHouse는 관측성 데이터를 와이드(wide) 이벤트로 처리하여, 로그, 메트릭, 트레이스를 단일 통합 구조 내에서 깊이 있게 상관 분석할 수 있도록 합니다.

    ### OpenTelemetry collector: 데이터 수집

    ClickStack에는 사전 구성된 OpenTelemetry (OTel) collector가 포함되어 있어, 개방형이고 표준화된 방식으로 텔레메트리를 수집합니다. 데이터는 OTLP 프로토콜을 사용하여 다음을 통해 전송할 수 있습니다:

    * gRPC(포트 `4317`)
    * HTTP(포트 `4318`)

    Collector는 텔레메트리를 효율적인 배치 단위로 ClickHouse에 내보냅니다. 데이터 소스별로 최적화된 테이블 스키마를 지원하여 모든 시그널 유형에서 확장 가능한 성능을 보장합니다.

    ### ClickStack UI (HyperDX): 인터페이스

    ClickStack UI (HyperDX)는 ClickStack을 위한 사용자 인터페이스입니다. 다음을 제공합니다:

    * 자연어 및 Lucene 스타일 검색
    * 실시간 디버깅을 위한 라이브 테일링
    * 로그, 메트릭, 트레이스의 통합 뷰
    * 프론트엔드 관측성을 위한 세션 리플레이
    * 대시보드 생성 및 알림 구성
    * 고급 분석을 위한 SQL 쿼리 인터페이스

    HyperDX는 ClickHouse에 특화되어 설계되어, 강력한 검색 기능과 직관적인 워크플로를 결합함으로써 이상 징후를 빠르게 포착하고, 문제를 조사하며, 인사이트를 신속하게 얻을 수 있도록 합니다.

    ### MongoDB: 애플리케이션 상태

    ClickStack은 다음을 포함한 애플리케이션 수준 상태를 저장하기 위해 MongoDB를 사용합니다:

    * 대시보드
    * 알림
    * 사용자 프로필
    * 저장된 시각화

    이처럼 상태를 이벤트 데이터와 분리함으로써 성능과 확장성을 보장하고, 백업 및 구성을 단순화합니다.

    이 모듈식 아키텍처를 통해 ClickStack은 빠르고 유연하며 오픈소스인, 바로 사용할 수 있는 관측성 플랫폼을 제공합니다.
  </TabItem>
</Tabs>