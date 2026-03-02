---
sidebar_label: '개요'
slug: /migrations/redshift-overview
description: 'Amazon Redshift에서 ClickHouse로 마이그레이션'
keywords: ['Redshift']
title: 'ClickHouse Cloud와 Amazon Redshift 비교'
doc_type: 'guide'
---

# Amazon Redshift에서 ClickHouse로 마이그레이션 \{#amazon-redshift-to-clickhouse-migration\}

> 이 문서는 Amazon Redshift에서 ClickHouse로 데이터 마이그레이션에 대한 개요를 제공합니다.

## 소개 \{#introduction\}

Amazon Redshift는 구조화 및 반정형 데이터를 대상으로 보고 및
분석 기능을 제공하는 클라우드 데이터 웨어하우스입니다. 대규모 데이터
세트에 대한 분석 워크로드를 처리하기 위해 ClickHouse와 유사한
컬럼 지향 데이터베이스 원칙을 기반으로 설계되었습니다. AWS에서 제공하는
서비스의 일부로서, 분석용 데이터 요구 사항을 위해 AWS 사용자가
기본적으로 선택하는 솔루션이 되는 경우가 많습니다.

Amazon 생태계와의 긴밀한 통합 덕분에 기존 AWS 사용자에게는 매력적인
선택이지만, 이를 기반으로 실시간 분석 애플리케이션을 구축한 Redshift
사용자는 이러한 목적에 더 최적화된 솔루션을 필요로 하게 됩니다.
그 결과, 기존 Redshift 워크로드를 대체하거나 기존 워크로드와 함께
배치되는 「속도 계층(speed layer)」으로 ClickHouse를 도입하여,
우수한 쿼리 성능과 데이터 압축의 이점을 점점 더 많이 활용하고 있습니다.

## ClickHouse vs Redshift \{#clickhouse-vs-redshift\}

AWS 생태계에 크게 의존하는 사용자에게는 Redshift가 데이터 웨어하우징 요구 사항이 있을 때
자연스러운 선택입니다. Redshift는 중요한 측면에서 ClickHouse와 다릅니다. Redshift는
복잡한 리포팅과 분석 쿼리가 요구되는 데이터 웨어하우징 워크로드에 맞추어 엔진을
최적화합니다. 모든 배포 방식에서 다음 두 가지 제한 사항 때문에 Redshift를
실시간 분석 워크로드에 사용하기가 어렵습니다.

* Redshift는 [각 쿼리 실행 계획에 대해 코드를 컴파일](https://docs.aws.amazon.com/redshift/latest/dg/c-query-performance.html)하여
초기 쿼리 실행에 상당한 오버헤드를 추가합니다. 이 오버헤드는 쿼리 패턴이 예측 가능하고
컴파일된 실행 계획을 쿼리 캐시에 저장할 수 있을 때는 정당화될 수 있습니다. 그러나 이는
쿼리가 가변적인 대화형 애플리케이션에는 문제를 야기합니다. Redshift가 이러한 코드
컴파일 캐시를 활용할 수 있는 경우에도 대부분의 쿼리에서 ClickHouse가 더 빠릅니다.
["ClickBench"](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|Rf&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)를 참조하십시오.
* Redshift는 [모든 큐에서 동시성을 50으로 제한](https://docs.aws.amazon.com/redshift/latest/dg/c_workload_mngmt_classification.html)하며,
이는 BI 용도로는 충분할 수 있지만 동시성이 매우 높은 분석 애플리케이션에는 적합하지
않습니다.

반대로 ClickHouse 역시 복잡한 분석 쿼리에 사용할 수 있지만,
실시간 분석 워크로드에 최적화되어 있어 애플리케이션을 구동하거나
데이터 웨어하우스 가속 레이어로 동작할 수 있습니다. 그 결과 Redshift 사용자는 일반적으로
다음과 같은 이유로 Redshift를 ClickHouse로 대체하거나 ClickHouse로 보완합니다.

| Advantage                          | Description                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Lower query latencies**          | ClickHouse는 스트리밍 insert 작업이 수행되고 높은 동시성이 요구되는 상황에서도 다양한 쿼리 패턴에 대해 더 낮은 쿼리 지연 시간을 달성합니다. 대화형 사용자 지향 분석에서는 캐시 미스가 불가피한데, 쿼리가 캐시를 사용하지 못하는 경우에도 ClickHouse는 여전히 빠르게 처리할 수 있습니다.                                                                                                                     |
| **Higher concurrent query limits** | ClickHouse는 실시간 애플리케이션 경험에 필수적인 훨씬 더 높은 동시 쿼리 한도를 제공합니다. ClickHouse에서는 자가 관리형과 Cloud 환경 모두에서 각 서비스에 대해 애플리케이션이 필요로 하는 동시성을 달성할 수 있도록 컴퓨팅 할당량을 확장할 수 있습니다. 허용되는 쿼리 동시성 수준은 ClickHouse에서 구성 가능하며, ClickHouse Cloud의 기본값은 1000입니다. |
| **Superior data compression**      | ClickHouse는 뛰어난 데이터 압축을 제공하므로 전체 스토리지(따라서 비용)를 줄이거나 동일한 비용으로 더 많은 데이터를 보관하여 데이터로부터 더 많은 실시간 인사이트를 도출할 수 있습니다. 아래의 「ClickHouse vs Redshift Storage Efficiency」를 참조하십시오.                                                                                                                                            |