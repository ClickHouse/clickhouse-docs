---
'sidebar_label': '개요'
'slug': '/migrations/snowflake-overview'
'description': 'Snowflake에서 ClickHouse로 마이그레이션'
'keywords':
- 'Snowflake'
'title': 'Snowflake에서 ClickHouse로 마이그레이션'
'show_related_blogs': true
'doc_type': 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# Snowflake에서 ClickHouse로 마이그레이션

> 이 문서는 Snowflake에서 ClickHouse로 데이터를 마이그레이션하는 방법에 대한 소개를 제공합니다.

Snowflake는 클라우드 기반 데이터 웨어하우스이며, 주로 레거시 온프레미스 데이터 웨어하우징 워크로드를 클라우드로 마이그레이션하는 데 중점을 두고 있습니다. 대규모로 오랜 시간 실행되는 보고서를 실행하는 데 최적화되어 있습니다. 데이터셋이 클라우드로 이동함에 따라 데이터 소유자는 이 데이터를 다른 방식으로 활용할 수 있는 방법을 고민하기 시작하며, 내부 및 외부 사용 사례를 위한 실시간 애플리케이션을 구축하기 위해 이러한 데이터셋을 사용하는 것을 포함합니다. 이 경우 그들은 종종 ClickHouse와 같은 실시간 분석을 위해 최적화된 데이터베이스가 필요하다는 것을 깨닫게 됩니다.

## 비교 {#comparison}

이 섹션에서는 ClickHouse와 Snowflake의 주요 기능을 비교합니다.

### 유사점 {#similarities}

Snowflake는 대량의 데이터를 저장, 처리 및 분석하기 위한 확장 가능하고 효율적인 솔루션을 제공하는 클라우드 기반 데이터 웨어하우징 플랫폼입니다. 
ClickHouse와 마찬가지로 Snowflake는 기존 기술을 기반으로 구축되지 않았지만 자체 SQL 쿼리 엔진과 맞춤형 아키텍처에 의존합니다.

Snowflake의 아키텍처는 공유 스토리지 (shared-disk) 아키텍처와 공용 없음(shared-nothing) 아키텍처의 하이브리드로 설명됩니다. 공유 스토리지 아키텍처는 데이터가 S3와 같은 객체 저장소를 사용하여 모든 컴퓨트 노드에서 액세스할 수 있는 구조입니다. 공용 없음 아키텍처는 각 컴퓨트 노드가 전체 데이터 세트의 일부를 로컬에 저장하여 쿼리에 응답하는 구조입니다. 이론적으로 이는 두 모델의 장점을 모두 제공하는데, 즉 공유 디스크 아키텍처의 간단함과 공용 없음 아키텍처의 확장성을 결합합니다.

이 디자인은 본질적으로 객체 저장소를 기본 저장 매체로 사용하며, 이는 동시 접근 중 거의 무한히 확장 가능하면서 높은 내구성과 확장 가능한 처리량 보장을 제공합니다.

아래 이미지는 [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)에서 제공하는 이 아키텍처를 보여줍니다:

<Image img={snowflake_architecture} size="md" alt="Snowflake architecture" />

반대로, 오픈 소스 및 클라우드 호스팅 제품인 ClickHouse는 공유 디스크 및 공용 없음 아키텍처 모두에 배포될 수 있습니다. 후자는 자체 관리 배포에 일반적입니다. CPU와 메모리를 쉽게 확장할 수 있도록 하면서, 공용 없음 구성은 데이터 관리의 고전적인 문제 및 데이터 복제의 오버헤드를 도입합니다, 특히 구성원이 변경될 때.

이러한 이유로 ClickHouse Cloud는 Snowflake와 개념적으로 유사한 공유 스토리지 아키텍처를 활용합니다. 데이터는 객체 저장소(단일 복사본)인 S3 또는 GCS에 한 번 저장되어 거의 무한한 저장 용량과 강력한 중복성 보장을 제공합니다. 각 노드는 이 단일 데이터 복사본과 캐시 용도의 로컬 SSD에 액세스할 수 있습니다. 필요에 따라 추가 CPU 및 메모리 자원을 제공하기 위해 노드를 확장할 수도 있습니다. Snowflake와 마찬가지로 S3의 확장성 특성은 클러스터의 현재 노드에 대한 I/O 처리량이 추가 노드를 추가할 때 영향을 받지 않도록 하여 공유 디스크 아키텍처의 고전적인 한계를 해결합니다.

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud architecture" />

### 차이점 {#differences}

기본 스토리지 형식과 쿼리 엔진 외에도 이 아키텍처는 몇 가지 미묘한 차이점이 있습니다:

* Snowflake의 컴퓨트 리소스는 [웨어하우스](https://docs.snowflake.com/en/user-guide/warehouses)의 개념을 통해 제공됩니다. 이는 여러 노드로 구성되며, 각 노드는 정해진 크기를 가집니다. Snowflake는 자사의 웨어하우스의 구체적인 아키텍처를 공개하지 않지만, 일반적으로 [이해되는](https://select.dev/posts/snowflake-warehouse-sizing) 바에 따르면 각 노드는 8 vCPU, 16GiB, 200GB의 로컬 스토리지를 갖습니다(캐시 용도로). 노드의 수는 티셔츠 크기(예: x-small은 1개, small은 2개, medium은 4개, large는 8개 등)에 따라 다릅니다. 이러한 웨어하우스는 데이터와 독립적이며, 객체 스토리지에 저장된 모든 데이터베이스를 쿼리하는 데 사용할 수 있습니다. 유휴 상태일 때 쿼리 부하에 노출되지 않으면 웨어하우스는 일시 중지되며 쿼리가 수신되면 다시 실행됩니다. 저장 비용은 항상 청구된다고 할 수 있지만, 웨어하우스는 활성 상태일 때만 요금이 부과됩니다.

* ClickHouse Cloud는 로컬 캐시 저장소를 갖는 유사한 노드 원칙을 활용합니다. 티셔츠 크기 대신 사용자는 총 컴퓨트 및 사용 가능한 RAM 값을 가진 서비스를 배포합니다. 이는 쿼리 부하에 따라 투명하게 자동으로 확장됩니다(정의된 한도 내에서) - 각 노드에 대한 자원을 증가(또는 감소)시키거나 총 노드 수를 늘리거나 줄여서 수평적으로 확장됩니다. 현재 ClickHouse Cloud의 노드는 Snowflake의 1이 아닌 1 CPU-to-memory 비율을 가집니다. 느슨한 결합도 가능하지만, 서비스는 현재 데이터에 결합되어 있으며 Snowflake 웨어하우스와는 다릅니다. 노드는 또한 유휴 상태라면 일시 중지되고 쿼리가 도착하면 다시 실행됩니다. 필요한 경우 사용자가 서비스의 크기를 수동으로 조정할 수도 있습니다.

* ClickHouse Cloud의 쿼리 캐시는 현재 노드별로 특정적이며, Snowflake의 경우는 웨어하우스와 독립적인 서비스 계층에서 제공됩니다. 벤치마크에 따르면 ClickHouse Cloud의 노드 캐시는 Snowflake보다 성능이 우수합니다.

* Snowflake와 ClickHouse Cloud는 쿼리 동시성을 증가시키기 위해 서로 다른 접근 방식을 취합니다. Snowflake는 [다중 클러스터 웨어하우스](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)라는 기능을 통해 이를 해결합니다. 이 기능은 사용자가 웨어하우스에 클러스터를 추가할 수 있게 해줍니다. 이로 인해 쿼리 지연 시간이 개선되지는 않지만, 추가적인 병렬 처리를 제공하고 더 많은 쿼리 동시성을 허용합니다. ClickHouse는 수직 또는 수평 확장을 통해 서비스에 더 많은 메모리와 CPU를 추가하여 이를 달성합니다. 이 블로그에서는 레이턴시에 집중하였으나 이러한 서비스가 높은 동시성에 확장할 수 있는 능력을 탐구하지는 않았지만, ClickHouse가 모든 동시성 테스트에서 우수한 성능을 보일 것으로 예상합니다. Snowflake는 기본적으로[웨어하우스에서 동시 쿼리 수를 8로 제한](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)합니다. 이에 비해 ClickHouse Cloud는 노드당 최대 1000개의 쿼리를 실행할 수 있게 합니다.

* Snowflake는 데이터 세트에 대한 컴퓨트 크기를 전환할 수 있는 능력이 있으며, 웨어하우스의 빠른 재개 시간으로 인해 즉석 쿼리에 대한 우수한 경험을 제공합니다. 데이터 웨어하우스 및 데이터 레이크 사용 사례의 경우 이는 다른 시스템에 비해 이점을 제공합니다.

### 실시간 분석 {#real-time-analytics}

공식 [벤치마크](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-) 데이터에 따르면, ClickHouse는 다음 영역의 실시간 분석 애플리케이션에서 Snowflake보다 뛰어난 성능을 보여줍니다:

* **쿼리 지연 시간**: Snowflake 쿼리는 데이터를 최적화하기 위해 테이블에 클러스터링이 적용되더라도 더 높은 쿼리 지연 시간을 가집니다. 우리의 테스트에서 Snowflake는 Snowflake 클러스터링 키 또는 ClickHouse 기본 키의 일부인 필터가 적용된 쿼리에서 ClickHouse의 동등한 성능을 달성하기 위해 두 배 이상의 컴퓨트를 요구합니다. Snowflake의 [지속적 쿼리 캐시](https://docs.snowflake.com/en/user-guide/querying-persisted-results)는 이러한 지연 문제를 부분적으로 완화하지만, 필터 기준이 더 다양할 경우에는 효과적이지 않습니다. 이러한 쿼리 캐시의 효과는 기본 데이터가 변경될 때 재편성이 필요하며, 데이터 테이블이 변경될 때 캐시 항목이 무효화됩니다. 우리의 애플리케이션 벤치마크에서 이것이 아니라도, 실제 배포에서는 새로운 최신 데이터를 입력해야 할 필요가 있습니다. ClickHouse의 쿼리 캐시는 노드별로 특정적이며 [트랜잭션 일관성이 없습니다](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design), 이는 [실시간 분석에 더 적합합니다](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design). 사용자는 또한 [쿼리별로 캐시 사용 여부를 조정](https://operations/settings/settings#use_query_cache)하거나 [정확한 크기](https://operations/settings/settings#query_cache_max_size_in_bytes) 및 [쿼리가 캐시되는지 여부](https://operations/settings/settings#enable_writes_to_query_cache) 및 [수동 사용 여부](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)에 대해 세밀한 제어를 가질 수 있습니다.

* **낮은 비용**: Snowflake 웨어하우스는 쿼리 비활성 기간이 지나면 일시 중지하도록 구성할 수 있습니다. 일단 일시 중지되면 비용이 발생하지 않습니다. 일반적으로 이 비활성 검사 기간은 [60초로만 줄어들 수 있습니다](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse). 웨어하우스는 쿼리를 수신하면 자동으로 몇 초 내에 재개됩니다. Snowflake는 웨어하우스가 사용 중일 때만 자원에 대해 요금을 부과하므로, 즉석 쿼리와 같이 종종 유휴 상태에 있는 워크로드에 적합합니다.

  하지만 많은 실시간 분석 작업은 지속적인 실시간 데이터 수집과 자주 쿼리가 필요하며 비활성에서 이득을 보기 어렵습니다(예: 고객 대면 대시보드). 이는 웨어하우스가 자주 완전히 활성화되고 요금을 발생해야 함을 의미합니다. 이는 비활성 상태에서의 비용-편익과 Snowflake가 응답 상태로 더 빨리 복귀할 수 있는 성능 이점을 무효화합니다. ClickHouse Cloud의 활성 상태에 대한 초당 낮은 비용과 결합될 때, 이번 유형의 워크로드에서 ClickHouse Cloud가 상당히 낮은 총 비용을 제공하게 됩니다.

* **기능 예측 가능 가격**: 자료화 뷰 및 클러스터링(ClickHouse의 ORDER BY에 해당)과 같은 기능은 실시간 분석 사용 사례에서 최고 성능에 도달하기 위해 필요합니다. 이러한 기능은 Snowflake에서 추가 비용이 발생하며, 이는 더 높은 등급이 필요하여 기본 요금이 1.5배 증가하고 예측이 어려운 배경 비용 또한 발생합니다. 예를 들어, 자료화된 뷰는 백그라운드 유지 관리 비용이 있으며, 클러스터링도 마찬가지로 사용 전에 예측하기 어렵습니다. 이에 비해, ClickHouse Cloud에서는 이러한 기능에 대해 추가 비용이 발생하지 않으며, 일반적으로 고삽입 워크로드 사용 사례 외에는 거의 무시할 수 있는 추가 CPU 및 메모리 사용만 발생합니다. 우리의 벤치마크에서 이러한 차이점과 더 낮은 쿼리 지연 시간 및 더 높은 압축률이 결합되어 ClickHouse의 비용을 크게 줄이는 결과를 얻었습니다.
