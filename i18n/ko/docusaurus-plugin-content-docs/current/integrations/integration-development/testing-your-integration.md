---
slug: /integrations/integration-development/testing-your-integration
sidebar_label: '통합 테스트하기'
sidebar_position: 3
title: 'ClickHouse 통합 테스트하기'
description: 'ClickHouse Cloud 및 자체 호스팅 오픈소스 환경에서 통합을 검증하기 위한 기본 검증 매트릭스입니다.'
keywords: ['파트너', '통합', '테스트', '검증', '예시 데이터셋', 'ClickHouse Cloud', '오픈소스']
doc_type: '가이드'
---

# ClickHouse 통합 테스트 \{#testing-your-clickhouse-integration\}

검토를 위해 제출하기 전에, 두 가지 ClickHouse 배포 모드 모두와 ClickHouse의 타입 시스템을 의미 있는 규모로 검증할 수 있는 데이터셋을 대상으로 통합을 검증하십시오. 이 페이지에서는 항목 수준에서 &quot;테스트됨&quot;이 무엇을 의미하는지 정의합니다. 공식 검증은 더 높은 파트너십 등급으로 진행하는 파트너를 위한 별도의 절차입니다.

수집 및 사용 경로는 [Building integrations](/integrations/integration-development/building-integrations)를, 결과를 게시하는 방법은 [Documenting your integration](/integrations/integration-development/documenting-your-integration)를 참조하십시오.

## 테스트 매트릭스 \{#test-matrix\}

두 가지 배포 모드를 모두 포함하십시오. 대부분의 고객은 둘 중 하나만 사용하며, 일부 항목에서는 동작이 달라집니다(인증, 네트워킹, 사용 가능한 기능).

* **ClickHouse Cloud:** [무료 체험](https://clickhouse.com/cloud)에 가입하십시오. 개발 티어에서는 신용카드가 필요하지 않습니다
* **Self-hosted (open source):** [GitHub releases](https://github.com/ClickHouse/ClickHouse/releases)에서 최신 안정 릴리스를 사용하십시오. [설치 가이드](/install)는 Docker로 로컬 인스턴스를 가장 빠르게 구성할 수 있는 경로입니다

두 환경 모두에서 테스트하고, 통합 페이지에 기능 차이가 있다면 문서화하십시오.

## 무엇을 테스트할지 \{#what-to-test\}

**기능적 정확성.** 통합에서 노출하는 모든 코드 경로를 점검하십시오: 수집, 쿼리 수행, 스키마 탐색, 오류 처리, 재연결. 제품에서 최종 사용자에게 SQL을 직접 노출한다면, UI가 생성하는 쿼리가 전송, 실행, 결과 반환까지 문제없이 처리되는지 확인하십시오.

**타입 시스템 범위.** ClickHouse는 배열, 튜플, 맵, JSON, Nested, LowCardinality, Decimal, Date 및 DateTime 변형, UUID, IPv4 및 IPv6, enum, aggregate-function 타입을 지원합니다. 통합에서는 중첩 배열, 깊게 중첩된 튜플, JSON 컬럼에서 문제가 자주 발생합니다. 클라이언트 라이브러리와 UI는 이러한 경우를 무리 없이 처리해야 하며, 최소한 조용히 잘리거나 잘못 렌더링되는 대신 읽기 쉬운 오류를 표시하며 실패해야 합니다.

**규모.** 고객이 실제로 실행할 결과 집합 크기와 행 수를 기준으로 테스트하십시오. 사용자 대상 BI의 경우 이는 대개 수억~수십억 개의 행을 가진 테이블과, 단일 집계 결과부터 수만 개의 행에 이르는 결과 집합을 의미합니다. 범위 제한이 없는 읽기(`SELECT *`)는 멈추지 말고, 예측 가능하게 실패하거나 페이지네이션되어야 합니다.

**인증.** TLS가 활성화된 연결을 최소 하나는 검증하십시오. 인증 구성을 노출한다면, 문서화한 모든 모드를 테스트하십시오(TLS를 통한 사용자 이름 및 비밀번호, mTLS, SSL 클라이언트 인증서).

**연결 수명 주기.** 연결 끊김, 서버 재시작, 느린 쿼리 상황에서 동작이 합리적인지 확인하십시오. 상위 지원으로 이관되는 많은 문제는 쿼리 의미론이 아니라 연결 처리에서 비롯됩니다.

## 권장 예시 데이터셋 \{#recommended-example-datasets\}

전체 목록은 [**예시 데이터셋**](/getting-started/example-datasets) 섹션에서 확인할 수 있습니다. 다음 4개의 데이터셋은 대부분의 통합 테스트 요구 사항을 충족합니다:

* **[GitHub events](/getting-started/example-datasets/github-events):** 중첩된 이벤트 페이로드가 포함된 31억 행입니다. 배열, 튜플, 중첩 타입을 테스트하기에 가장 적합합니다
* **[NYC taxi data](/getting-started/example-datasets/nyc-taxi):** 널리 알려진 스키마를 갖춘 수십억 개의 행입니다. 처리량 및 읽기 경로 테스트에 적합합니다
* **[Stack Overflow](/getting-started/example-datasets/stackoverflow):** JOIN이 많은 BI 시나리오에 적합한 다중 테이블 관계형 데이터입니다
* **[Hacker News](/getting-started/example-datasets/hacker-news):** 2,800만 행으로, 빠르게 적재할 수 있어 반복 테스트에 유용합니다

초대규모 검증에는 **[WikiStat](/getting-started/example-datasets/wikistat)**(~5,000억 개의 레코드)를 사용하십시오.

## 테스트 결과에 포함할 내용 \{#what-to-capture-from-your-testing\}

통합을 검토용으로 제출할 때는 다음 내용을 공유하십시오:

* 테스트한 ClickHouse 버전(Cloud 및 오픈소스)
* 데이터셋과 대략적인 규모(행 수, 디스크 사용량)
* 통합에서 처리하는 타입과 처리하지 않는 타입(이는 문서의 **알려진 제한 사항** 섹션이 됩니다)
* 동작이 달라지는 결과 집합 임계값 등, 미리 밝혀 둘 만한 성능 특성

짧은 테스트 보고서만 있어도 검토 횟수를 줄일 수 있습니다. 문단 하나와 표 하나면 충분합니다.