---
slug: /intro
sidebar_label: 'ClickHouse란 무엇입니까?'
description: 'ClickHouse®는 온라인 분석 처리(OLAP)를 위한 열 지향 SQL 데이터베이스 관리 시스템(DBMS)입니다. 오픈 소스 소프트웨어와 클라우드 서비스 형태로 모두 제공됩니다.'
title: 'ClickHouse란 무엇입니까?'
keywords: ['ClickHouse', '컬럼형 데이터베이스', 'OLAP 데이터베이스', '분석용 데이터베이스', '고성능 데이터베이스']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse®는 온라인 분석 처리(OLAP)를 위한 고성능 컬럼 지향 SQL 데이터베이스 관리 시스템(DBMS)입니다. [오픈 소스 소프트웨어](https://github.com/ClickHouse/ClickHouse)와 [Cloud 서비스](https://clickhouse.com/cloud)로 모두 제공됩니다.


## 애널리틱스(Analytics)란 무엇입니까? \{#what-are-analytics\}

애널리틱스는 OLAP(Online Analytical Processing)라고도 하며, 방대한 데이터셋에 대해 집계, 문자열 처리, 산술 연산과 같은 복잡한 계산을 수행하는 SQL 쿼리를 의미합니다.

하나의 쿼리에서 소수의 행만 읽고 쓰며 밀리초 단위로 완료되는 트랜잭션 쿼리(또는 OLTP, Online Transaction Processing)와 달리, 애널리틱스 쿼리는 통상적으로 수십억에서 수조 개의 행을 처리합니다.

많은 사용 사례에서는 [애널리틱스 쿼리가 「실시간(real-time)」이어야 합니다](https://clickhouse.com/engineering-resources/what-is-real-time-analytics). 즉, 1초 미만의 시간 안에 결과를 반환해야 합니다.

## 행 지향 vs. 컬럼 지향 스토리지 \{#row-oriented-vs-column-oriented-storage\}

이러한 수준의 성능은 데이터의 올바른 「지향 방식」을 선택했을 때만 달성할 수 있습니다.

데이터베이스는 데이터를 [행 지향 또는 컬럼 지향](https://clickhouse.com/engineering-resources/what-is-columnar-database) 방식으로 저장합니다.

행 지향 데이터베이스에서는 테이블의 연속된 행이 순차적으로 차례대로 저장됩니다. 이 구조에서는 각 행의 컬럼 값이 함께 저장되므로 행을 빠르게 조회할 수 있습니다.

ClickHouse는 컬럼 지향 데이터베이스입니다. 이러한 시스템에서 테이블은 컬럼들의 집합으로 저장되며, 즉 각 컬럼의 값이 차례대로 연속해서 저장됩니다. 이 구조는 단일 행을 다시 재구성하는 작업을 더 어렵게 만들지만(이제 행 값들 사이에 간격이 생기기 때문입니다) 필터링이나 집계와 같은 컬럼 연산은 행 지향 데이터베이스보다 훨씬 더 빠르게 수행됩니다.

이 차이는 [실제 익명 웹 분석 데이터](/getting-started/example-datasets/metrica) 1억 행을 대상으로 실행되는 예제 쿼리로 가장 잘 설명할 수 있습니다.

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

[ClickHouse SQL Playground에서 이 쿼리를 실행](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs\&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ\&run_query=true)하면, 존재하는 100개가 넘는 컬럼 중 [극히 일부만 선택 및 필터링](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7\&tab=results\&run_query=true)하여 밀리초 단위로 결과를 반환하는 예제를 확인할 수 있습니다:

<Image img={column_example} alt="컬럼 지향 데이터베이스에서의 예제 쿼리" size="lg" />

위 다이어그램의 통계 섹션에서 볼 수 있듯이, 이 쿼리는 1억 행을 92밀리초 만에 처리했으며, 이는 초당 약 10억 행 이상, 또는 초당 거의 7GB에 가까운 데이터를 전송한 처리량에 해당합니다.

**행 지향 DBMS**

행 지향 데이터베이스에서는, 위 쿼리가 기존 컬럼들 중 일부만 처리하더라도, 시스템은 여전히 디스크에서 메모리로 로드하기 위해 다른 기존 컬럼의 데이터도 읽어야 합니다. 그 이유는 데이터가 디스크에 [블록](https://en.wikipedia.org/wiki/Block_\(data_storage\))이라고 불리는 청크(일반적으로 4KB 또는 8KB 같은 고정 크기) 단위로 저장되기 때문입니다. 블록은 디스크에서 메모리로 읽는 데이터의 최소 단위입니다. 애플리케이션이나 데이터베이스가 데이터를 요청하면, 운영 체제의 디스크 I/O 하위 시스템이 디스크에서 필요한 블록을 읽습니다. 블록의 일부만 필요하더라도, 전체 블록이 메모리로 읽힙니다(이는 디스크 및 파일 시스템 설계 방식에 따른 동작입니다):

<Image img={row_orientated} alt="행 지향 데이터베이스 구조" size="lg" />

**컬럼 지향 DBMS**


각 컬럼의 값이 디스크에 서로 연속적으로 저장되므로, 위의 쿼리가 실행될 때 불필요한 데이터는 로드되지 않습니다.
블록 단위 저장 및 디스크에서 메모리로의 전송 방식이 분석용 쿼리의 데이터 접근 패턴과 잘 맞기 때문에, 쿼리에 필요한 컬럼만 디스크에서 읽어 사용되지 않는 데이터에 대한 불필요한 I/O를 피할 수 있습니다. 이는 전체 행(관련 없는 컬럼까지 포함)을 읽는 행 기반 스토리지와 비교했을 때 [훨씬 빠릅니다](https://benchmark.clickhouse.com/):

<Image img={column_orientated} alt="컬럼 지향 데이터베이스 구조" size="lg"/>

## 데이터 복제와 무결성 \{#data-replication-and-integrity\}

ClickHouse는 비동기 멀티 마스터 복제 방식을 사용하여 데이터가 여러 노드에 중복 저장되도록 합니다. 사용 가능한 레플리카 중 어느 하나에 데이터가 기록되면, 나머지 레플리카는 백그라운드에서 해당 사본을 가져옵니다. 시스템은 서로 다른 레플리카 간에 동일한 데이터를 유지합니다. 대부분의 장애에 대해서는 복구가 자동으로 수행되며, 더 복잡한 경우에는 반자동으로 수행됩니다.

## 역할 기반 접근 제어(Role-Based Access Control) \{#role-based-access-control\}

ClickHouse는 SQL 쿼리를 통해 사용자 계정을 관리하며, ANSI SQL 표준과 널리 사용되는 관계형 데이터베이스 관리 시스템에서 제공하는 것과 유사한 역할 기반 접근 제어 구성을 제공합니다.

## SQL 지원 \{#sql-support\}

ClickHouse는 대부분의 경우 ANSI SQL 표준과 동일한 [SQL 기반 선언형 쿼리 언어](/sql-reference)를 지원합니다. 지원되는 쿼리 절에는 [GROUP BY](/sql-reference/statements/select/group-by), [ORDER BY](/sql-reference/statements/select/order-by), [FROM](/sql-reference/statements/select/from) 내 서브쿼리, [JOIN](/sql-reference/statements/select/join) 절, [IN](/sql-reference/operators/in) 연산자, [윈도우 함수](/sql-reference/window-functions), 스칼라 서브쿼리가 포함됩니다.

## 근사 계산 \{#approximate-calculation\}

ClickHouse는 정확성을 성능과 맞바꾸는 여러 방법을 제공합니다. 예를 들어, 일부 집계 함수는 서로 다른 값의 개수, 중앙값(median), 분위수(quantiles)를 근사값으로 계산합니다. 또한, 데이터 샘플에 대해서만 쿼리를 실행하여 근사 결과를 빠르게 계산할 수 있습니다. 마지막으로, 모든 키에 대해 집계를 수행하는 대신, 제한된 수의 키에 대해서만 집계를 수행할 수 있습니다. 키 분포의 편중 정도에 따라, 이는 정확한 계산보다 훨씬 적은 자원을 사용하면서도 충분히 정확한 결과를 제공할 수 있습니다.

## 적응형 조인 알고리즘 \{#adaptive-join-algorithms\}

ClickHouse는 상황에 따라 조인 알고리즘을 선택합니다. 먼저 빠른 해시 조인을 사용하고, 큰 테이블이 둘 이상인 경우 머지 조인으로 대체합니다.

## 뛰어난 쿼리 성능 \{#superior-query-performance\}

ClickHouse는 매우 빠른 쿼리 성능으로 널리 알려져 있습니다.
ClickHouse가 이렇게 빠른 이유를 알아보려면 [Why is ClickHouse fast?](/concepts/why-clickhouse-is-so-fast.mdx) 가이드를 참고하십시오.

{/*
  ## What is OLAP?                
  OLAP scenarios require real-time responses on top of large datasets for complex analytical queries with the following characteristics:
  - Datasets can be massive - billions or trillions of rows
  - Data is organized in tables that contain many columns
  - Only a few columns are selected to answer any particular query
  - Results must be returned in milliseconds or seconds

  ## Column-oriented vs row-oriented databases                                             
  In a row-oriented DBMS, data is stored in rows, with all the values related to a row physically stored next to each other.

  In a column-oriented DBMS, data is stored in columns, with values from the same columns stored together.

  ## Why column-oriented databases work better in the OLAP scenario                                                                  

  Column-oriented databases are better suited to OLAP scenarios: they're at least 100 times faster in processing most queries. The reasons are explained in detail below, but the fact is easier to demonstrate visually:

  See the difference?

  The rest of this article explains why column-oriented databases work well for these scenarios, and why ClickHouse in particular [outperforms](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated) others in this category.

  ## Why is ClickHouse so fast?                             

  ClickHouse uses all available system resources to their full potential to process each analytical query as fast as possible. This is made possible due to a unique combination of analytical capabilities and attention to the low-level details required to implement the fastest OLAP database.

  Helpful articles to dive deeper into this topic include:
  - [ClickHouse Performance](/concepts/why-clickhouse-is-so-fast)
  - [Distinctive Features of ClickHouse](/about-us/distinctive-features.md)
  - [FAQ: Why is ClickHouse so fast?](/knowledgebase/why-clickhouse-is-so-fast)

  ## Processing analytical queries in real time                                              

  In a row-oriented DBMS, data is stored in this order:

  | Row | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
  |-----|-------------|------------|--------------------|-----------|---------------------|
  | #0 | 89354350662 | 1          | Investor Relations | 1         | 2016-05-18 05:19:20 |
  | #1 | 90329509958 | 0          | Contact us         | 1         | 2016-05-18 08:10:20 |
  | #2 | 89953706054 | 1          | Mission            | 1         | 2016-05-18 07:38:00 |
  | #N | ...           | ...          | ...                  | ...         | ...                   |

  In other words, all the values related to a row are physically stored next to each other.

  Examples of a row-oriented DBMS are MySQL, Postgres, and MS SQL Server.

  In a column-oriented DBMS, data is stored like this:

  | Row:        | #0                 | #1                 | #2                 | #N |
  |-------------|---------------------|---------------------|---------------------|-----|
  | WatchID:    | 89354350662         | 90329509958         | 89953706054         | ...   |
  | JavaEnable: | 1                   | 0                   | 1                   | ...   |
  | Title:      | Investor Relations  | Contact us          | Mission             | ...   |
  | GoodEvent:  | 1                   | 1                   | 1                   | ...   |
  | EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

  These examples only show the order that data is arranged in. The values from different columns are stored separately, and data from the same column is stored together.

  Examples of a column-oriented DBMS: Vertica, Paraccel (Actian Matrix and Amazon Redshift), Sybase IQ, Exasol, Infobright, InfiniDB, MonetDB (VectorWise and Actian Vector), LucidDB, SAP HANA, Google Dremel, Google PowerDrill, Druid, and kdb+.

  Different orders for storing data are better suited to different scenarios. The data access scenario refers to what queries are made, how often, and in what proportion; how much data is read for each type of query – rows, columns, and bytes; the relationship between reading and updating data; the working size of the data and how locally it is used; whether transactions are used, and how isolated they're; requirements for data replication and logical integrity; requirements for latency and throughput for each type of query, and so on.

  The higher the load on the system, the more important it is to customize the system set up to match the requirements of the usage scenario, and the more fine grained this customization becomes. There is no system that is equally well-suited to significantly different scenarios. If a system is adaptable to a wide set of scenarios, under a high load, the system will handle all the scenarios equally poorly, or will work well for just one or few of possible scenarios.

  ### Key properties of the OLAP scenario                                   

  - Tables are "wide," meaning they contain a large number of columns.
  - Datasets are large and queries require high throughput when processing a single query (up to billions of rows per second per server).
  - Column values are fairly small: numbers and short strings (for example, 60 bytes per URL).
  - Queries extract a large number of rows, but only a small subset of columns.
  - For simple queries, latencies around 50ms are allowed.
  - There is one large table per query; all tables are small, except for one.
  - A query result is significantly smaller than the source data. In other words, data is filtered or aggregated, so the result fits in a single server's RAM.
  - Queries are relatively rare (usually hundreds of queries per server or less per second).
  - Inserts happen in fairly large batches (\> 1000 rows), not by single rows.
  - Transactions aren't necessary.

  It is easy to see that the OLAP scenario is very different from other popular scenarios (such as OLTP or Key-Value access). So it doesn't make sense to try to use OLTP or a Key-Value DB for processing analytical queries if you want to get decent performance. For example, if you try to use MongoDB or Redis for analytics, you will get very poor performance compared to OLAP databases.

  ### Input/output               

  1.  For an analytical query, only a small number of table columns need to be read. In a column-oriented database, you can read just the data you need. For example, if you need 5 columns out of 100, you can expect a 20-fold reduction in I/O.
  2.  Since data is read in packets, it is easier to compress. Data in columns is also easier to compress. This further reduces the I/O volume.
  3.  Due to the reduced I/O, more data fits in the system cache.

  For example, the query "count the number of records for each advertising platform" requires reading one "advertising platform ID" column, which takes up 1 byte uncompressed. If most of the traffic wasn't from advertising platforms, you can expect at least 10-fold compression of this column. When using a quick compression algorithm, data decompression is possible at a speed of at least several gigabytes of uncompressed data per second. In other words, this query can be processed at a speed of approximately several billion rows per second on a single server. This speed is actually achieved in practice.

  ### CPU       

  Since executing a query requires processing a large number of rows, it helps to dispatch all operations for entire vectors instead of for separate rows, or to implement the query engine so that there is almost no dispatching cost. If you don't do this, with any half-decent disk subsystem, the query interpreter inevitably stalls the CPU. It makes sense to both store data in columns and process it, when possible, by columns.

  There are two ways to do this:

  1.  A vector engine. All operations are written for vectors, instead of for separate values. This means you don't need to call operations very often, and dispatching costs are negligible. Operation code contains an optimized internal cycle.

  2.  Code generation. The code generated for the query has all the indirect calls in it.

  This isn't done in row-oriented databases, because it doesn't make sense when running simple queries. However, there are exceptions. For example, MemSQL uses code generation to reduce latency when processing SQL queries. (For comparison, analytical DBMSs require optimization of throughput, not latency.)

  Note that for CPU efficiency, the query language must be declarative (SQL or MDX), or at least a vector (J, K). The query should only contain implicit loops, allowing for optimization.
  */ }