---
'sidebar_label': '개요'
'slug': '/migrations/redshift-overview'
'description': 'Amazon Redshift에서 ClickHouse로 마이그레이션'
'keywords':
- 'Redshift'
'title': 'Comparing ClickHouse Cloud and Amazon Redshift'
'doc_type': 'guide'
---


# Amazon Redshift에서 ClickHouse로의 마이그레이션

> 이 문서는 Amazon Redshift에서 ClickHouse로 데이터를 마이그레이션하는 방법에 대한 소개를 제공합니다.

## 소개 {#introduction}

Amazon Redshift는 구조화된 데이터와 반구조화된 데이터에 대한 보고 및 분석 기능을 제공하는 클라우드 데이터 웨어하우스입니다. 이는 ClickHouse와 유사한 컬럼 지향 데이터베이스 원칙을 사용하여 대규모 데이터 세트에 대한 분석 작업을 처리하도록 설계되었습니다. AWS 제공의 일환으로, 이는 AWS 사용자가 분석 데이터 요구를 충족하기 위해 자주 선택하는 기본 솔루션입니다.

Amazon 생태계와의 긴밀한 통합으로 인해 기존 AWS 사용자에게 매력적이지만, 실시간 분석 애플리케이션에 이를 채택한 Redshift 사용자들은 이러한 목적을 위한 보다 최적화된 솔루션이 필요하게 됩니다. 결과적으로, 그들은 ClickHouse로 점점 더 많이 전환하여 우수한 쿼리 성능과 데이터 압축의 이점을 얻고 있으며, 이를 기존 Redshift 작업량과 함께 배포하는 "속도 계층"으로 활용하거나 교체하고 있습니다.

## ClickHouse vs Redshift {#clickhouse-vs-redshift}

AWS 생태계에 깊이 투자한 사용자에게 Redshift는 데이터 웨어하우징 요구에 직면했을 때 자연스러운 선택을 나타냅니다. Redshift는 ClickHouse와의 중요한 차이점이 있으며, 데이터 웨어하우징 작업과 복잡한 보고 및 분석 쿼리에 대해 엔진을 최적화합니다. 모든 배포 모드에서 다음 두 가지 제한으로 인해 Redshift를 실시간 분석 작업에 사용하기 어렵습니다:
* Redshift는 [각 쿼리 실행 계획을 위해 코드를 컴파일합니다](https://docs.aws.amazon.com/redshift/latest/dg/c-query-performance.html), 이는 첫 번째 쿼리 실행에 상당한 오버헤드를 추가합니다. 쿼리 패턴이 예측 가능하고 컴파일된 실행 계획을 쿼리 캐시에 저장할 수 있을 때 이 오버헤드는 정당화될 수 있습니다. 그러나 이는 변동성이 있는 쿼리를 가진 인터랙티브 애플리케이션에 도전 과제를 제기합니다. Redshift가 이 코드 컴파일 캐시를 활용할 수 있을 때에도 ClickHouse는 대부분의 쿼리에서 더 빠릅니다. ["ClickBench"](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|Rf&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)를 참조하세요.
* Redshift는 [모든 큐에서 동시성을 50으로 제한합니다](https://docs.aws.amazon.com/redshift/latest/dg/c_workload_mngmt_classification.html), 이는 BI에는 적합하지만 매우 동시성이 높은 분석 애플리케이션에는 부적합합니다.

반대로 ClickHouse는 복잡한 분석 쿼리를 처리할 수 있지만 실시간 분석 작업에 최적화되어 있으며, 애플리케이션의 동력을 제공하거나 웨어하우스 가속기 역할을 합니다. 결과적으로 Redshift 사용자는 일반적으로 ClickHouse로 Redshift를 교체하거나 보완합니다. 그 이유는 다음과 같습니다:

| 장점                               | 설명                                                                                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **더 낮은 쿼리 대기 시간**          | ClickHouse는 높은 동시성 하에서도 다양한 쿼리 패턴과 스트리밍 인서트에도 불구하고 더 낮은 쿼리 대기 시간을 달성합니다. 사용자 인터페이스 분석에서 캐시 히트에 실패할 경우에도 ClickHouse는 여전히 빠르게 처리할 수 있습니다.                                                                                                                            |
| **더 높은 동시 쿼리 한도**           | ClickHouse는 동시 쿼리에 대한 매우 높은 한계를 두며, 이는 실시간 애플리케이션 경험에 필수적입니다. ClickHouse에서는 자체 관리 및 클라우드 모두에서 서비스를 위해 필요한 동시성을 달성하기 위해 컴퓨팅 할당을 증대할 수 있습니다. ClickHouse의 허용된 쿼리 동시성 수준은 구성할 수 있으며, ClickHouse Cloud는 기본적으로 1000의 값을 기본으로 합니다. |
| **우수한 데이터 압축**              | ClickHouse는 우수한 데이터 압축을 제공하여 사용자가 총 스토리지를 줄이거나 동일한 비용으로 더 많은 데이터를 지속할 수 있게 하여 데이터에서 더 많은 실시간 통찰력을 도출할 수 있도록 합니다. 아래 "ClickHouse vs Redshift 저장 효율성"을 참조하십시오.                                                                                                                   |
