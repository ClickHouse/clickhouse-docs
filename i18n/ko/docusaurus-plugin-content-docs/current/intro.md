---
'slug': '/intro'
'sidebar_label': 'ClickHouse란 무엇인가?'
'description': 'ClickHouse®는 온라인 분석 처리(OLAP)를 위한 컬럼형 SQL 데이터베이스 관리 시스템(DBMS)입니다. 오픈소스
  소프트웨어와 클라우드 서비스로 모두 제공됩니다.'
'title': 'ClickHouse란 무엇인가?'
'keywords':
- 'ClickHouse'
- 'columnar database'
- 'OLAP database'
- 'analytical database'
- 'high-performance database'
'doc_type': 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse®는 온라인 분석 처리(OLAP)를 위한 고성능 컬럼형 SQL 데이터베이스 관리 시스템(DBMS)입니다. 오픈 소스 소프트웨어로도 제공되며 [클라우드 서비스](https://clickhouse.com/cloud)로도 사용할 수 있습니다.

## 분석이란 무엇인가? {#what-are-analytics}

분석은 OLAP(온라인 분석 처리)라고도 알려져 있으며, 방대한 데이터셋에 대해 복잡한 계산(예: 집계, 문자열 처리, 산술)을 포함하는 SQL 쿼리를 의미합니다.

거래 쿼리(또는 OLTP, 온라인 트랜잭션 처리)와는 달리, 이러한 쿼리는 각 쿼리마다 몇 개의 행만 읽고 쓰므로 밀리초 단위로 완료됩니다. 반면, 분석 쿼리는 수십억 및 수조 개의 행을 정기적으로 처리합니다.

많은 사용 사례에서 [분석 쿼리는 "실시간"](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)으로 수행되어야 하며, 즉 1초 이내에 결과를 반환해야 합니다.

## 행 지향 저장소 vs. 열 지향 저장소 {#row-oriented-vs-column-oriented-storage}

그런 수준의 성능은 올바른 데이터 "지향성"을 통해서만 달성할 수 있습니다.

데이터베이스는 데이터를 [행 지향 또는 열 지향](https://clickhouse.com/engineering-resources/what-is-columnar-database)으로 저장합니다.

행 지향 데이터베이스에서는 연속적인 테이블 행이 차례로 저장됩니다. 이 구조는 각 행의 컬럼 값이 함께 저장되므로 행을 빠르게 검색할 수 있도록 허용합니다.

ClickHouse는 열 지향 데이터베이스입니다. 이러한 시스템에서는 테이블이 컬럼의 모음으로 저장됩니다. 즉, 각 컬럼의 값이 차례로 저장됩니다. 이러한 구조는 개별 행을 복원하는 것을 더 어렵게 만들지만 필터링이나 집계와 같은 컬럼 작업을 행 지향 데이터베이스보다 훨씬 빠르게 수행할 수 있습니다.

이 차이는 1억 개 행의 [실제 세계의 익명 웹 분석 데이터](/getting-started/example-datasets/metrica)에 대해 실행되는 예제 쿼리로 가장 잘 설명할 수 있습니다:

```sql
SELECT MobilePhoneModel, COUNT() AS c
FROM metrica.hits
WHERE
      RegionID = 229
  AND EventDate >= '2013-07-01'
  AND EventDate <= '2013-07-31'
  AND MobilePhone != 0
  AND MobilePhoneModel not in ['', 'iPad']
GROUP BY MobilePhoneModel
ORDER BY c DESC
LIMIT 8;
```

이 쿼리를 [ClickHouse SQL Playground에서 실행할 수 있습니다](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true), 100개 이상의 기존 컬럼 중 [일부만 선택하고 필터링하여](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true) 결과를 밀리초 안에 반환합니다:

<Image img={column_example} alt="열 지향 데이터베이스의 예제 쿼리" size="lg"/>

위 다이어그램의 통계 섹션에서 볼 수 있듯이, 이 쿼리는 1억 개 행을 92밀리초 안에 처리하여 초당 약 10억 개의 행 또는 초당 거의 7GB의 데이터가 전송되는 성능을 보여주었습니다.

**행 지향 DBMS**

행 지향 데이터베이스에서는 위 쿼리가 기존 컬럼 중 일부만 처리하더라도, 시스템은 여전히 다른 기존 컬럼에서 데이터를 디스크에서 메모리로 불러와야 합니다. 그 이유는 데이터가 [블록](https://en.wikipedia.org/wiki/Block_(data_storage))이라고 불리는 청크로 디스크에 저장되기 때문입니다(일반적으로 고정 크기, 예: 4KB 또는 8KB). 블록은 디스크에서 메모리로 읽을 때 가장 작은 데이터 단위입니다. 애플리케이션이나 데이터베이스가 데이터를 요청하면 운영 체제의 디스크 I/O 서브시스템이 필요한 블록을 디스크에서 읽습니다. 블록의 일부만 필요하더라도 전체 블록이 메모리로 읽힙니다(이는 디스크 및 파일 시스템 설계 때문입니다):

<Image img={row_orientated} alt="행 지향 데이터베이스 구조" size="lg"/>

**열 지향 DBMS**

각 컬럼의 값이 차례로 디스크에 저장되므로 위에서 실행된 쿼리에서는 불필요한 데이터가 로드되지 않습니다. 블록별 저장 및 디스크에서 메모리로의 전송이 분석 쿼리의 데이터 접근 패턴과 정렬되므로, 쿼리에 필요한 컬럼만 디스크에서 읽어지며, 사용되지 않는 데이터에 대한 불필요한 I/O를 피할 수 있습니다. 이는 [행 기반 저장소에 비해 훨씬 빠릅니다](https://benchmark.clickhouse.com/) 비록 전체 행(관련 없는 컬럼을 포함하여)이 읽히지만:

<Image img={column_orientated} alt="열 지향 데이터베이스 구조" size="lg"/>

## 데이터 복제 및 무결성 {#data-replication-and-integrity}

ClickHouse는 데이터가 여러 노드에 중복 저장되도록 비동기 다중 마스터 복제 방식을 사용합니다. 어떤 사용 가능한 복제본에 쓰인 후, 나머지 모든 복제본이 백그라운드에서 복사본을 가져옵니다. 시스템은 서로 다른 복제본에서 동일한 데이터를 유지합니다. 대부분의 장애 후 복구는 자동으로 수행되며, 복잡한 경우 반자동으로 수행됩니다.

## 역할 기반 접근 제어 {#role-based-access-control}

ClickHouse는 SQL 쿼리를 사용하여 사용자 계정 관리를 구현하며, ANSI SQL 표준 및 인기 있는 관계형 데이터베이스 관리 시스템에서 찾을 수 있는 것과 유사한 역할 기반 접근 제어 구성을 허용합니다.

## SQL 지원 {#sql-support}

ClickHouse는 많은 경우 ANSI SQL 표준과 동일한 [SQL 기반의 선언적 쿼리 언어](/sql-reference)를 지원합니다. 지원되는 쿼리 절에는 [GROUP BY](/sql-reference/statements/select/group-by), [ORDER BY](/sql-reference/statements/select/order-by), [FROM](/sql-reference/statements/select/from) 절의 서브쿼리, [JOIN](/sql-reference/statements/select/join) 절, [IN](/sql-reference/operators/in) 연산자, [윈도우 함수](/sql-reference/window-functions) 및 스칼라 서브쿼리가 포함됩니다.

## 근사 계산 {#approximate-calculation}

ClickHouse는 성능을 위해 정확성을 거래할 수 있는 방법을 제공합니다. 예를 들어, 일부 집계 함수는 중복 값 개수, 중앙값 및 분위수를 근사적으로 계산합니다. 또한, 데이터를 샘플로 하여 빠르게 근사 결과를 계산하는 쿼리를 실행할 수 있습니다. 마지막으로 제한된 수의 키로 집계를 실행할 수 있으며, 키의 분포가 어떻게 편향되어 있는지에 따라 적은 자원으로도 상당한 정확성을 제공할 수 있습니다.

## 적응형 조인 알고리즘 {#adaptive-join-algorithms}

ClickHouse는 조인 알고리즘을 적응적으로 선택합니다: 빠른 해시 조인으로 시작하고, 하나 이상의 대형 테이블이 있을 경우 머지 조인으로 대체합니다.

## 뛰어난 쿼리 성능 {#superior-query-performance}

ClickHouse는 매우 빠른 쿼리 성능으로 잘 알려져 있습니다. ClickHouse가 왜 이렇게 빠른지 알아보려면 [ClickHouse가 빠른 이유는 무엇인가요?](/concepts/why-clickhouse-is-so-fast.mdx) 가이드를 참조하십시오.

{/*
## OLAP란 무엇인가? {#what-is-olap}
OLAP 시나리오는 대량 데이터 세트를 기반으로 한 복잡한 분석 쿼리에 대한 실시간 응답을 요구합니다. 이러한 쿼리의 특성은 다음과 같습니다:
- 데이터 세트는 방대할 수 있음 - 수십억 또는 수조 개의 행
- 데이터는 많은 컬럼을 포함하는 테이블에 조직됨
- 특정 쿼리에 대한 응답으로 선택되는 컬럼 수는 적음
- 결과는 밀리초 또는 초 내에 반환되어야 함

## 열 지향 vs 행 지향 데이터베이스 {#column-oriented-vs-row-oriented-databases}
행 지향 DBMS에서는 데이터가 행에 저장되며, 모든 행과 관련된 값이 물리적으로 나란히 저장됩니다.

열 지향 DBMS에서는 데이터가 열에 저장되며, 동일한 열의 값이 함께 저장됩니다.

## OLAP 시나리오에서 열 지향 데이터베이스가 더 효과적인 이유 {#why-column-oriented-databases-work-better-in-the-olap-scenario}

열 지향 데이터베이스는 OLAP 시나리오에 더 적합합니다: 대부분의 쿼리를 처리하는 데 100배 이상 빠릅니다. 자세한 이유는 아래에 설명되어 있지만, 시각적으로 더 쉽게 증명할 수 있습니다:

차이를 볼 수 있나요?

이 문서의 나머지 부분은 열 지향 데이터베이스가 이러한 시나리오에 적합한 이유와 ClickHouse가 이 범주에서 [다른 데이터베이스보다 우수한 이유](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)에 대해 설명합니다.

## 왜 ClickHouse는 그렇게 빠른가? {#why-is-clickhouse-so-fast}

ClickHouse는 각 분석 쿼리를 가능한 한 빠르게 처리하기 위해 사용 가능한 모든 시스템 자원을 최대한 활용합니다. 이는 분석 능력과 가장 빠른 OLAP 데이터베이스를 구현하는 데 필요한 저수준 세부 사항에 대한 주의가 독특하게 결합되어 가능해졌습니다.

이 주제에 대한 더 깊이 있는 정보를 제공하는 유용한 기사는 다음과 같습니다:
- [ClickHouse 성능](/concepts/why-clickhouse-is-so-fast)
- [ClickHouse의 특징](/about-us/distinctive-features.md)
 - [자주 묻는 질문: ClickHouse가 그렇게 빠른 이유는 무엇인가요?](/knowledgebase/why-clickhouse-is-so-fast)
*/} 
## 실시간 분석 쿼리 처리 {#processing-analytical-queries-in-real-time}

행 지향 DBMS에서는 데이터가 다음과 같은 순서로 저장됩니다:

| 행 | WatchID     | JavaEnable | 제목              | GoodEvent | EventTime           |
|-----|-------------|------------|--------------------|-----------|---------------------|
| #0 | 89354350662 | 1          | 투자자 관계 | 1         | 2016-05-18 05:19:20 |
| #1 | 90329509958 | 0          | 연락처        | 1         | 2016-05-18 08:10:20 |
| #2 | 89953706054 | 1          | 미션            | 1         | 2016-05-18 07:38:00 |
| #N | ...           | ...          | ...                  | ...         | ...                   |

즉, 모든 행과 관련된 값이 물리적으로 나란히 저장됩니다.

행 지향 DBMS의 예로는 MySQL, Postgres 및 MS SQL Server가 있습니다.

열 지향 DBMS에서는 다음과 같이 데이터가 저장됩니다:

| 행:        | #0                 | #1                 | #2                 | #N |
|-------------|---------------------|---------------------|---------------------|-----|
| WatchID:    | 89354350662         | 90329509958         | 89953706054         | ...   |
| JavaEnable: | 1                   | 0                   | 1                   | ...   |
| 제목:      | 투자자 관계  | 연락처          | 미션             | ...   |
| GoodEvent:  | 1                   | 1                   | 1                   | ...   |
| EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

이러한 예는 데이터가 정렬된 방식을 보여줍니다. 서로 다른 컬럼의 값은 별도로 저장되며, 동일한 컬럼의 데이터는 함께 저장됩니다.

열 지향 DBMS의 예로는 Vertica, Paraccel(Actian Matrix 및 Amazon Redshift), Sybase IQ, Exasol, Infobright, InfiniDB, MonetDB(VectorWise 및 Actian Vector), LucidDB, SAP HANA, Google Dremel, Google PowerDrill, Druid 및 kdb+가 있습니다.

데이터를 저장하는 서로 다른 순서는 시나리오에 따라 더 나은 적합성을 가집니다. 데이터 접근 시나리오란 어떤 쿼리가, 얼마나 자주, 어떤 비율로 수행되는지, 각 쿼리 유형(행, 열 및 바이트)에 대해 얼마나 많은 데이터가 읽히는지, 데이터 읽기 및 업데이트 간의 관계, 데이터 작업 크기 및 지역적 사용 여부, 트랜잭션 사용 여부 및 고립 정도, 데이터 복제 및 논리적 무결성 요구 사항, 각 쿼리 유형에 대한 대기 시간 및 처리량 요구 사항 등을 말합니다.

시스템에 대한 부하가 높을수록 시스템 구성이 사용 시나리오의 요구 사항에 맞게 조정하는 것이 중요하며, 그 조정이 세밀해집니다. 상당히 다른 시나리오에 동등하게 잘 맞는 시스템은 없습니다. 시스템이 광범위한 시나리오에 적응 가능하다면 높은 부하 하에 모든 시나리오를 동등하게 잘 처리하지 못하거나, 단 한 가지 또는 그 불과 몇 가지 시나리오에 대해서만 잘 작동합니다.

### OLAP 시나리오의 주요 속성 {#key-properties-of-olap-scenario}

- 테이블은 "넓음" - 많은 수의 컬럼을 포함합니다.
- 데이터 세트는 크고, 쿼리는 단일 쿼리를 처리할 때 높은 처리량(서버 당 최대 수십억 행)을 요구합니다.
- 컬럼 값은 상당히 작습니다: 숫자와 짧은 문자열(예: URL당 60바이트).
- 쿼리는 많은 수의 행을 추출하지만, 컬럼의 하위 집합만 선택됩니다.
- 간단한 쿼리의 경우 대기 시간은 약 50ms 이내를 허용합니다.
- 쿼리당 하나의 대형 테이블이 있으며, 모든 테이블은 작습니다.
- 쿼리 결과는 소스 데이터보다 상당히 작습니다. 즉, 데이터가 필터링되거나 집계되어 결과가 단일 서버의 RAM에 맞습니다.
- 쿼리는 상대적으로 드물게 발생합니다(일반적으로 서버당 초당 수백 개의 쿼리 이하).
- 삽입은 비교적 큰 배치(> 1000 행)로 발생하며, 단일 행으로 이루어지지 않습니다.
- 트랜잭션이 필요하지 않습니다.

OLAP 시나리오는 다른 인기 있는 시나리오(예: OLTP 또는 키-값 접근)와 매우 다르므로, 적절한 성능을 얻고자 할 경우 OLTP나 키-값 DB를 분석 쿼리 처리에 사용하려고 해서는 안 됩니다. 예를 들어, MongoDB나 Redis를 분석에 사용하려고 하면 OLAP 데이터베이스와 비교할 경우 성능이 매우 저하됩니다.

### 입력/출력 {#inputoutput}

1.  분석 쿼리는 소수의 테이블 컬럼만 읽으면 됩니다. 열 지향 데이터베이스에서는 필요한 데이터만 읽을 수 있습니다. 예를 들어, 100개 중 5개 컬럼이 필요하면 I/O가 20배 줄어드는 것을 기대할 수 있습니다.
2.  데이터가 패킷으로 읽히므로 압축하기가 더 쉽습니다. 열의 데이터는 또한 압축하기가 더 쉽습니다. 이는 I/O량을 더욱 줄여줍니다.
3.  I/O가 줄어들어 시스템 캐시에 더 많은 데이터가 들어갑니다.

예를 들어, "각 광고 플랫폼의 레코드 수를 세는" 쿼리는 1바이트의 압축되지 않은 "광고 플랫폼 ID" 컬럼을 읽어야 합니다. 절대적인 대부분의 트래픽이 광고 플랫폼에서 발생하지 않았다면 이 컬럼의 압축률은 최소 10배를 기대할 수 있습니다. 빠른 압축 알고리즘을 사용할 경우, 비압축 데이터의 디컴프레션 속도는 최소 몇 기가바이트 이상이 가능합니다. 즉, 이 쿼리는 단일 서버에서 초당 수십억 개의 행을 처리할 수 있는 속도로 실행될 수 있습니다. 이 속도는 실제로도 달성되고 있습니다.

### CPU {#cpu}

쿼리를 실행하려면 많은 수의 행을 처리해야 하므로, 모든 작업을 개별 행이 아닌 전체 벡터에 대해 배정하는 것이 도움이 되거나, 쿼리 엔진을 구현하여 배정 비용을 거의 없앨 수 있습니다. 이를 수행하지 않으면 반 decent한 디스크 서브 시스템으로도 쿼리 해석기가 CPU의 작동을 중단하게 만듭니다. 가능할 때마다 데이터를 열로 저장하고 처리하는 것이 합리적입니다.

이를 수행하는 방법은 두 가지입니다:

1.  벡터 엔진. 모든 작업이 개별 값이 아닌 벡터에 대해 작성됩니다. 즉, 작업을 자주 호출할 필요가 없으며 배정 비용은 미미합니다. 작업 코드는 최적화된 내부 사이클을 포함합니다.

2.  코드 생성. 쿼리에 대해 생성된 코드에는 모든 간접 호출이 포함되어 있습니다.

이것은 행 지향 데이터베이스에서는 수행되지 않으며, 간단한 쿼리 실행 시에는 의미가 없습니다. 그러나 예외가 있습니다. 예를 들어, MemSQL은 SQL 쿼리 처리 시 대기 시간을 줄이기 위해 코드 생성을 사용합니다. (비교하자면, 분석 DBMS는 대기 시간보다는 처리량 최적화를 요구합니다.)

CPU 효율성을 위해 쿼리 언어는 선언적이어야 합니다(SQL 또는 MDX) 또는 최소한 벡터(J, K)여야 합니다. 쿼리에는 최적화를 허용하는 암시적 루프만 포함되어야 합니다.
