---
slug: /deployment-modes
sidebar_label: '배포 방식'
description: 'ClickHouse는 동일한 강력한 데이터베이스 엔진을 사용하면서, 다양한 요구 사항에 맞게 패키징 방식만 다른 네 가지 배포 옵션을 제공합니다.'
title: '배포 방식'
keywords: ['배포 방식', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse는 요구 사항에 따라 여러 가지 방식으로 배포할 수 있는 다재다능한 데이터베이스 시스템입니다. 근본적으로 모든 배포 옵션은 **동일한 강력한 ClickHouse 데이터베이스 엔진을 사용**하며, 달라지는 것은 상호 작용 방식과 실행 위치입니다.

대규모 프로덕션 분석을 수행하거나 로컬에서 데이터 분석을 하거나 애플리케이션을 개발하는 경우 등, 각 사용 사례에 맞게 설계된 배포 옵션이 제공됩니다. 동일한 엔진을 기반으로 하므로 어떤 배포 모드를 사용하더라도 동일한 고성능과 SQL 호환성을 확보할 수 있습니다.
이 가이드는 ClickHouse를 배포하고 사용하는 네 가지 주요 방법을 다룹니다:

* 전통적인 클라이언트/서버 배포를 위한 ClickHouse Server
* 완전 관리형 데이터베이스 운영을 위한 ClickHouse Cloud
* 명령줄 데이터 처리를 위한 clickhouse-local
* 애플리케이션에 ClickHouse를 직접 내장하기 위한 chDB

각 배포 모드는 고유한 강점과 최적의 사용 사례를 가지며, 아래에서 자세히 살펴봅니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server \{#clickhouse-server\}

ClickHouse Server는 전통적인 클라이언트/서버 아키텍처 형태이며, 프로덕션 환경 배포에 적합합니다. 이 배포 모드는 ClickHouse가 잘 알려진 높은 처리량과 낮은 지연 시간의 쿼리를 포함한 완전한 OLAP 데이터베이스 기능을 제공합니다.

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

배포 유연성 측면에서 ClickHouse Server는 개발 또는 테스트 목적으로 로컬 머신에 설치할 수 있고, AWS, GCP, Azure와 같은 주요 클라우드 제공업체에 배포하여 클라우드 기반 운영에 사용할 수 있으며, 자체 온프레미스 하드웨어에 구축할 수도 있습니다. 더 큰 규모의 운영을 위해서는 분산 클러스터로 구성하여 증가한 부하를 처리하고 고가용성을 제공하도록 할 수 있습니다.

이 배포 모드는 신뢰성, 성능, 전체 기능에 대한 접근이 중요한 프로덕션 환경에서 우선적으로 선택되는 옵션입니다.

## ClickHouse Cloud \{#clickhouse-cloud\}

[ClickHouse Cloud](/cloud/overview)는 사용자가 직접 배포 환경을 운영할 때 발생하는 운영 부담을 제거해 주는 완전 관리형 ClickHouse 서비스입니다. ClickHouse Server의 핵심 기능은 모두 유지하면서도, 개발과 운영을 간소화하도록 설계된 다양한 추가 기능을 통해 사용 경험을 향상시킵니다.

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud의 핵심 장점 중 하나는 통합 도구 세트입니다. [ClickPipes](/getting-started/quick-start/cloud/#clickpipes)는 강력한 데이터 수집 프레임워크를 제공하여, 복잡한 ETL 파이프라인을 직접 관리하지 않고도 다양한 소스에서 데이터를 쉽게 연결하고 스트리밍할 수 있도록 합니다. 또한 전용 [querying API](/cloud/get-started/query-endpoints)를 제공하여 애플리케이션을 훨씬 더 쉽게 구축할 수 있습니다.

ClickHouse Cloud의 SQL Console에는 쿼리를 대화형 시각화로 변환할 수 있는 강력한 [dashboarding](/cloud/manage/dashboards) 기능이 포함되어 있습니다. 저장된 쿼리를 기반으로 대시보드를 생성하고 공유할 수 있으며, 쿼리 파라미터를 통해 대화형 요소를 추가할 수 있습니다. 전역 필터를 사용해 이러한 대시보드를 동적으로 구성할 수 있어, 사용자가 사용자 정의 가능한 뷰를 통해 데이터를 탐색할 수 있습니다. 다만 시각화를 보기 위해서는 기반이 되는 저장된 쿼리에 대해 최소한 읽기 권한이 필요하다는 점을 유의해야 합니다.

모니터링과 최적화를 위해 ClickHouse Cloud에는 기본 제공 차트와 [query insights](/cloud/get-started/query-insights)가 포함되어 있습니다. 이러한 도구는 클러스터 성능에 대한 심층적인 가시성을 제공하여, 쿼리 패턴, 리소스 사용량 및 잠재적인 최적화 기회를 파악하는 데 도움이 됩니다. 이러한 수준의 관측성은 인프라 관리를 위한 전담 리소스를 투입하지 않고도 고성능 분석 운영을 유지해야 하는 팀에게 특히 유용합니다.

이 서비스는 관리형 특성 덕분에 업데이트, 백업, 스케일링 또는 보안 패치에 대해 신경 쓸 필요가 없습니다. 이러한 작업은 모두 자동으로 처리되므로, 데이터베이스 관리보다 데이터와 애플리케이션에 집중하고자 하는 조직에 이상적인 선택입니다.

## clickhouse-local \{#clickhouse-local\}

[clickhouse-local](/operations/utilities/clickhouse-local)은(는) 단일 독립 실행형 바이너리로 ClickHouse의 전체 기능을 제공하는 강력한 명령줄 도구입니다. 본질적으로 ClickHouse Server와 동일한 데이터베이스이지만, 서버 인스턴스를 실행하지 않고도 명령줄에서 직접 ClickHouse의 모든 기능을 활용할 수 있도록 패키징된 형태입니다.

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

이 도구는 특히 로컬 파일이나 Cloud 스토리지 서비스에 저장된 데이터를 다룰 때 애드혹(ad-hoc) 데이터 분석에 매우 뛰어납니다. CSV, JSON, Parquet 등 다양한 형식의 파일을 ClickHouse SQL 방언을 사용해 직접 쿼리할 수 있어, 빠른 데이터 탐색이나 일회성 분석 작업에 탁월한 선택입니다.

clickhouse-local에는 ClickHouse의 모든 기능이 포함되어 있으므로, 일반적으로 ClickHouse Server로 수행하는 데이터 변환, 포맷 변환, 기타 데이터베이스 작업에 그대로 사용할 수 있습니다. 주로 일시적인 작업에 사용되지만, 필요할 경우 ClickHouse Server와 동일한 스토리지 엔진을 사용해 데이터를 지속적으로 저장할 수도 있습니다.

원격 테이블 함수와 로컬 파일 시스템 접근을 결합하면, clickhouse-local은 ClickHouse Server와 로컬 머신의 파일 간 데이터를 조인해야 하는 경우에 특히 유용합니다. 서버로 업로드하고 싶지 않은 민감한 로컬 데이터나 일시적인 로컬 데이터를 다룰 때 특히 가치가 큽니다.

## chDB \{#chdb\}

[chDB](/chdb)는 ClickHouse를 프로세스 내(in-process) 데이터베이스 엔진 형태로 내장한 것으로, 기본 구현은 Python이지만 Go, Rust, NodeJS, Bun에서도 사용할 수 있습니다. 이 배포 옵션은 ClickHouse의 강력한 OLAP 기능을 애플리케이션의 프로세스 안으로 직접 가져와 별도의 데이터베이스 설치가 필요 없도록 합니다.

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB는 애플리케이션 환경과 자연스럽게 통합됩니다. 예를 들어 Python에서는 Pandas, Arrow와 같은 일반적인 데이터 사이언스 도구와 효율적으로 동작하도록 최적화되어 있으며, Python `memoryview`를 통해 데이터 복사 오버헤드를 최소화합니다. 이를 통해 기존 워크플로에서 ClickHouse의 쿼리 성능을 활용하려는 데이터 사이언티스트와 애널리스트에게 특히 유용합니다.

chDB는 `clickhouse-local`로 생성된 데이터베이스에 연결할 수도 있어, 데이터 작업 방식에 높은 유연성을 제공합니다. 이를 통해 로컬 개발, Python에서의 데이터 탐색, 더 영구적인 저장소 솔루션 간을 데이터 접근 패턴을 변경하지 않고도 원활하게 전환할 수 있습니다.