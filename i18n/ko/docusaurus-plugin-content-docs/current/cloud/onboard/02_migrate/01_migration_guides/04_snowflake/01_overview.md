---
sidebar_label: '개요'
slug: /migrations/snowflake-overview
description: 'Snowflake에서 ClickHouse로 마이그레이션하기'
keywords: ['Snowflake']
title: 'Snowflake에서 ClickHouse로 마이그레이션하기'
show_related_blogs: true
doc_type: 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# Snowflake에서 ClickHouse로 마이그레이션 \{#snowflake-to-clickhouse-migration\}

> 이 문서는 Snowflake에서 ClickHouse로 데이터를 마이그레이션하는 방법을 소개합니다.

Snowflake는 주로 레거시 온프레미스 데이터 웨어하우징 워크로드를 Cloud로 마이그레이션하는 데 중점을 둔 클라우드 데이터 웨어하우스입니다. 대규모 데이터셋에 대해 장시간 실행되는 보고서를 효율적으로 수행하도록 잘 최적화되어 있습니다. 데이터셋이 Cloud로 마이그레이션되면, 데이터 소유자는 이러한 데이터셋을 내부 및 외부 사용 사례를 위한 실시간 애플리케이션 구동에 활용하는 등, 이 데이터에서 가치를 추출할 수 있는 다른 방법을 고민하기 시작합니다. 이러한 시점에 이르면, ClickHouse와 같이 실시간 분석에 최적화된 데이터베이스가 필요하다는 것을 깨닫는 경우가 많습니다.

## 비교 \{#comparison\}

이 섹션에서는 ClickHouse와 Snowflake의 주요 기능을 비교합니다.

### 유사점 \{#similarities\}

Snowflake는 클라우드 기반 데이터 웨어하우징 플랫폼으로, 대량의 데이터를 저장·
처리·분석하기 위한 확장 가능하고 효율적인 솔루션을 제공합니다.
ClickHouse와 마찬가지로 Snowflake는 기존 기술을 기반으로 하지 않고, 자체
SQL 쿼리 엔진과 전용 아키텍처에 의존합니다.

Snowflake의 아키텍처는 공유 스토리지(공유 디스크) 아키텍처와 공유-낫싱(shared-nothing)
아키텍처의 하이브리드로 설명됩니다. 공유 스토리지 아키텍처란 S3와 같은 객체
스토리지(object storage)를 사용해 모든 컴퓨트 노드에서 데이터에 접근할 수 있는
구조를 말합니다. 공유-낫싱 아키텍처는 각 컴퓨트 노드가 전체 데이터 셋의 일부를
로컬에 저장해 쿼리에 응답하는 구조입니다. 이론적으로는 공유 디스크 아키텍처의
단순성과 공유-낫싱 아키텍처의 확장성을 모두 제공할 수 있습니다.

이 설계는 기본적으로 객체 스토리지를 주요 스토리지 매체로 사용합니다.
객체 스토리지는 동시 액세스 상황에서도 사실상 무한에 가까운 확장성을 제공하며,
높은 내구성과 확장 가능한 처리량을 보장합니다.

아래 이미지는 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)
에서 가져온 것으로, 이러한 아키텍처를 보여줍니다:

<Image img={snowflake_architecture} size="md" alt="Snowflake 아키텍처" />

반대로, ClickHouse는 오픈 소스이자 클라우드에서 호스팅되는 제품으로,
공유 디스크와 공유-낫싱 아키텍처 모두에 배포될 수 있습니다. 후자는
자가 관리형 배포에서 일반적입니다. 이 방식은 CPU와 메모리를 쉽게 확장할 수
있게 해주지만, 공유-낫싱 구성은 특히 멤버십 변경 시 고전적인 데이터 관리
문제와 데이터 복제의 오버헤드를 초래합니다.

이러한 이유로 ClickHouse Cloud는 개념적으로 Snowflake와 유사한
공유 스토리지 아키텍처를 활용합니다. 데이터는 S3나 GCS와 같은
객체 스토리지에 단 한 번(단일 사본) 저장되며, 사실상 무한에 가까운
스토리지 용량과 강력한 중복성 보장을 제공합니다. 각 노드는 이 단일 사본
데이터와 캐시 용도의 자체 로컬 SSD에 접근할 수 있습니다. 노드는 필요에 따라
추가 CPU 및 메모리 리소스를 제공하도록 확장될 수 있습니다. Snowflake와 마찬가지로
S3의 확장성 특성은 클러스터에 노드가 추가되더라도 현재 노드에서 사용 가능한
I/O 처리량이 영향을 받지 않도록 보장함으로써, 디스크 I/O 및 네트워크 병목과 같은
공유 디스크 아키텍처의 고전적인 한계를 해결합니다.

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud 아키텍처" />

### Differences \{#differences\}

기본이 되는 스토리지 포맷과 쿼리 엔진 외에도, 이러한 아키텍처는
몇 가지 미묘한 측면에서 서로 다릅니다:

* Snowflake에서 컴퓨트 리소스는 [warehouses](https://docs.snowflake.com/en/user-guide/warehouses)라는 개념을 통해 제공됩니다.
  이는 일정 크기를 가진 노드들의 집합으로 구성됩니다. Snowflake는
  웨어하우스의 구체적인 아키텍처를 공개하지 않지만,
  [일반적으로 알려진 바에 따르면](https://select.dev/posts/snowflake-warehouse-sizing)
  각 노드는 8 vCPU, 16 GiB, 200 GB의 로컬 스토리지(캐시용)로 구성됩니다.
  노드 수는 티셔츠 사이즈에 따라 달라집니다. 예를 들어 x-small은 1개의 노드,
  small은 2개, medium은 4개, large는 8개 등입니다. 이러한 웨어하우스는 데이터와
  독립적이며, 객체 스토리지(object storage)에 상주하는 어떤 데이터베이스라도 쿼리하는 데
  사용할 수 있습니다. 쿼리 부하가 없어 유휴 상태일 때 웨어하우스는 일시 중지되며,
  쿼리가 수신되면 다시 시작됩니다. 스토리지 비용은 항상 과금되지만, 웨어하우스는
  활성 상태일 때만 과금됩니다.

* ClickHouse Cloud는 로컬 캐시 스토리지를 가진 노드라는 유사한 원리를 활용합니다.
  티셔츠 사이즈 대신, 사용자는 총 컴퓨트 양과 사용 가능한 RAM을 기준으로 서비스를
  배포합니다. 그런 다음 정의된 한도 내에서 쿼리 부하에 따라 투명하게
  자동 확장됩니다. 이는 각 노드의 리소스를 늘리거나 줄이는 수직 확장이거나,
  전체 노드 수를 늘리거나 줄이는 수평 확장이 될 수 있습니다. ClickHouse
  Cloud 노드는 Snowflake와 달리 CPU 대 메모리 비율이 1:1입니다.
  더 느슨한 결합도 가능하지만, 서비스는 Snowflake 웨어하우스와 달리
  데이터에 결합됩니다. 노드는 유휴 상태이면 일시 중지되며,
  쿼리가 발생하면 다시 시작됩니다. 필요하다면 서비스를 수동으로 리사이즈하는
  것도 가능합니다.

* ClickHouse Cloud의 쿼리 캐시는 노드별로 동작하는 반면,
  Snowflake의 캐시는 웨어하우스와 독립적인 서비스 레이어에서 제공됩니다.
  벤치마크 결과에 따르면, ClickHouse Cloud의 노드 캐시는
  Snowflake의 캐시보다 더 우수한 성능을 보입니다.

* Snowflake와 ClickHouse Cloud는 쿼리 동시성을 높이기 위한
  확장 방식에서 서로 다른 접근 방식을 사용합니다. Snowflake는
  [multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)라는 기능을 통해 이를 해결합니다.
  이 기능을 사용하면 하나의 웨어하우스에 클러스터를 추가할 수 있습니다.
  쿼리 지연 시간(latency)이 개선되지는 않지만, 추가적인 병렬화를 제공하고
  더 높은 쿼리 동시성을 허용합니다. ClickHouse는 수직 또는 수평 확장을 통해
  서비스에 더 많은 메모리와 CPU를 추가함으로써 이를 달성합니다. 이 블로그에서는
  이러한 서비스가 더 높은 동시성으로 확장되는 능력을 자세히 다루지 않고
  지연 시간에 초점을 맞추지만, 완전한 비교를 위해서는 이 작업이
  수행되어야 함을 인정합니다. 다만, Snowflake가 [웨어하우스당 허용되는 동시 쿼리 수를 기본값으로 8개로 제한](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)하는 반면,
  ClickHouse Cloud는 노드당 최대 1,000개의 쿼리를 실행하도록 허용하므로,
  어떤 동시성 테스트에서도 ClickHouse가 좋은 성능을 보일 것으로
  예상합니다.

* 데이터셋에 대해 컴퓨트 크기를 전환할 수 있는 Snowflake의 기능과,
  웨어하우스의 빠른 재개(resume) 시간은 애드혹(ad hoc) 쿼리 환경을
  매우 우수하게 만들어 줍니다. 데이터 웨어하우스 및 데이터 레이크(data lake)
  사용 사례에서는 이것이 다른 시스템에 비해 장점을 제공합니다.

### 실시간 분석 \{#real-time-analytics\}

공개된 [벤치마크](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-) 데이터를 기반으로,
ClickHouse는 다음 영역에서 실시간 분석 애플리케이션에 대해 Snowflake보다 우수한 성능을 보입니다:

* **쿼리 지연 시간**: Snowflake 쿼리는 테이블에 클러스터링을 적용하여 성능을 최적화한 경우에도
  더 높은 쿼리 지연 시간을 보입니다. 테스트 결과, Snowflake는 필터가 Snowflake 클러스터링 키 또는
  ClickHouse 기본 키의 일부로 적용된 쿼리에서 ClickHouse와 동등한 성능을 달성하기 위해
  2배가 넘는 컴퓨팅 리소스가 필요합니다. Snowflake의
  [지속 쿼리 캐시(persistent query cache)](https://docs.snowflake.com/en/user-guide/querying-persisted-results)는
  이러한 지연 시간 문제 일부를 상쇄하지만, 필터 조건이 더 다양해지는 경우에는 효과가 떨어집니다.
  이 쿼리 캐시의 효과는 기본 데이터 변경으로 인해 테이블 변경 시 캐시 엔트리가 무효화되면서
  추가로 영향을 받을 수 있습니다. 이는 본 애플리케이션의 벤치마크에서는 해당하지 않지만,
  실제 배포 환경에서는 최신 데이터가 지속적으로 삽입되어야 합니다. 참고로 ClickHouse의 쿼리 캐시는
  노드별로 동작하며 [트랜잭션 일관성](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)을
  보장하지 않으므로, 실시간 분석에
  [더 적합](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)합니다.
  사용자에게는 [쿼리 단위](/operations/settings/settings#use_query_cache)로 사용 여부를 제어하고,
  [정확한 크기](/operations/settings/settings#query_cache_max_size_in_bytes),
  [쿼리를 캐시할지 여부](/operations/settings/settings#enable_writes_to_query_cache)
  (지속 시간 제한 또는 필요한 실행 횟수), 그리고 캐시를
  [수동으로만 사용할지](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings) 여부 등을
  세밀하게 제어할 수 있는 기능이 제공됩니다.

* **더 낮은 비용**: Snowflake 웨어하우스는 쿼리 비활성 상태가 일정 기간 지속되면 일시 중지되도록
  구성할 수 있습니다. 일시 중지되면 비용이 청구되지 않습니다.
  실제로 이 비활성 상태 체크는 [최소 60초까지](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)만 낮출 수 있습니다.
  웨어하우스는 쿼리가 수신되면 수 초 내에 자동으로 다시 시작됩니다.
  Snowflake는 웨어하우스가 사용 중일 때만 리소스 비용을 청구하므로, 이러한 동작은
  애드혹 쿼리와 같이 자주 유휴 상태로 있는 워크로드에 적합합니다.

  그러나 많은 실시간 분석 워크로드는 지속적인 실시간 데이터 수집과 빈번한 쿼리 실행이 필요하며,
  (고객 대시보드처럼) 유휴 상태의 이점을 거의 얻지 못합니다. 이는 웨어하우스가 자주
  완전 활성 상태를 유지해야 하며 그에 따른 비용이 계속 발생함을 의미합니다.
  이로 인해 유휴 상태의 비용 절감 효과는 상쇄되며, Snowflake가 대안보다 더 빠르게
  응답 가능한 상태로 복구할 수 있는 잠재적 성능 이점 역시 줄어듭니다.
  이러한 활성 상태 요구 사항이 ClickHouse Cloud의 활성 상태에 대한 초당 더 낮은 비용과
  결합되면, 이와 같은 유형의 워크로드에서 ClickHouse Cloud가 총비용 측면에서
  상당히 더 유리한 결과를 제공합니다.

* **기능 가격의 예측 가능성:** materialized view와 클러스터링(ClickHouse의 `ORDER BY`와 동일)은
  실시간 분석 사용 사례에서 최고 수준의 성능을 달성하기 위해 필수적인 기능입니다.
  이러한 기능은 Snowflake에서 추가 비용을 발생시키며, 크레딧당 비용을 1.5배 증가시키는
  더 높은 등급뿐 아니라 예측하기 어려운 백그라운드 비용도 요구합니다.
  예를 들어, materialized view에는 클러스터링과 마찬가지로 백그라운드 유지 관리 비용이 발생하며,
  이는 사용 전에 예측하기 어렵습니다. 반면 ClickHouse Cloud에서는 이러한 기능 자체에
  추가 비용이 부과되지 않고, 삽입 시점의 CPU와 메모리 사용량 증가만 발생하며,
  높은 삽입 워크로드 사용 사례를 제외하면 일반적으로 무시할 수 있는 수준입니다.
  벤치마크에서 관찰한 바에 따르면, 이러한 차이점과 더 낮은 쿼리 지연 시간, 더 높은 압축률이
  결합되어 ClickHouse의 비용이 상당히 낮게 나타납니다.