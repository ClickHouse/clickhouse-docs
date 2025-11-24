---
'slug': '/deployment-modes'
'sidebar_label': '배포 모드'
'description': 'ClickHouse는 모두 동일한 강력한 DATABASE 엔진을 사용하는 네 가지 배포 옵션을 제공합니다. 단지 특정
  요구에 맞게 다르게 패키징되어 있습니다.'
'title': '배포 모드'
'keywords':
- 'Deployment Modes'
- 'chDB'
'show_related_blogs': true
'doc_type': 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse는 필요에 따라 여러 가지 방식으로 배포할 수 있는 다목적 데이터베이스 시스템입니다. 핵심적으로 모든 배포 옵션은 **강력한 ClickHouse 데이터베이스 엔진을 사용하며** 차별화되는 점은 어떻게 상호작용하고 어디에서 실행되는가입니다.

대규모 분석을 실시하는 경우, 로컬 데이터 분석을 수행하는 경우 또는 애플리케이션을 구축하는 경우, 사용 사례에 맞춤화된 배포 옵션이 준비되어 있습니다. 기본 엔진의 일관성 덕분에 모든 배포 모드에서 동일한 높은 성능과 SQL 호환성을 유지할 수 있습니다. 이 가이드는 ClickHouse를 배포하고 사용하는 주요 네 가지 방법을 탐색합니다:

* 전통적인 클라이언트/서버 배포를 위한 ClickHouse Server
* 완전 관리형 데이터베이스 운영을 위한 ClickHouse Cloud
* 명령줄 데이터 처리용 clickhouse-local
* 애플리케이션에 ClickHouse를 직접 내장하는 chDB

각 배포 모드는 자체 강점과 이상적인 사용 사례를 갖고 있으며, 아래에서 자세히 살펴보겠습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server는 전통적인 클라이언트/서버 아키텍처를 나타내며 생산 배포에 적합합니다. 이 배포 모드는 ClickHouse가 자랑하는 높은 처리량과 낮은 지연 시간 쿼리 기능을 갖춘 전체 OLAP 데이터베이스 기능을 제공합니다.

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

배포 유연성 측면에서 ClickHouse Server는 개발 또는 테스트를 위해 로컬 머신에 설치할 수 있으며, AWS, GCP 또는 Azure와 같은 주요 클라우드 제공업체에 배포하거나 자체 온프레미스 하드웨어에 설정할 수 있습니다. 대규모 작업의 경우, 증가된 부하를 처리하고 높은 가용성을 제공하기 위해 분산 클러스터로 구성할 수 있습니다.

이 배포 모드는 신뢰성, 성능 및 전체 기능 접근이 중요한 생산 환경에 가장 적합한 선택입니다.

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)는 자체 배포를 운영할 필요 없이 운영 오버헤드를 제거한 완전 관리형 ClickHouse 버전입니다. 모든 핵심 기능을 유지하면서 개발 및 운영을 간소화하기 위한 추가 기능으로 사용자 경험을 향상시킵니다.

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud의 주요 장점 중 하나는 통합 도구입니다. [ClickPipes](/getting-started/quick-start/cloud/#clickpipes)는 복잡한 ETL 파이프라인을 관리하지 않고도 다양한 출처에서 데이터를 쉽게 연결하고 스트리밍할 수 있는 강력한 데이터 수집 프레임워크를 제공합니다. 이 플랫폼은 전용 [쿼리 API](/cloud/get-started/query-endpoints)를 제공하여 애플리케이션을 간단하게 구축할 수 있게 해줍니다.

ClickHouse Cloud의 SQL 콘솔에는 쿼리를 인터랙티브한 시각화로 변환할 수 있는 강력한 [대시보드](/cloud/manage/dashboards) 기능이 포함되어 있습니다. 저장된 쿼리로 작성된 대시보드를 만들고 공유할 수 있으며, 쿼리 매개변수를 통해 인터랙티브한 요소를 추가할 수 있습니다. 이러한 대시보드는 글로벌 필터를 사용하여 동적으로 만들 수 있어 사용자가 사용자 정의 보기를 통해 데이터를 탐색할 수 있습니다. 다만, 시각화를 보기 위해서는 사용자가 기본적으로 저장된 쿼리에 대해 최소한 읽기 액세스 권한이 필요합니다.

모니터링 및 최적화를 위해 ClickHouse Cloud에는 내장된 차트와 [쿼리 인사이트](/cloud/get-started/query-insights)가 포함되어 있습니다. 이러한 도구는 클러스터 성능에 대한 깊은 가시성을 제공하여 쿼리 패턴, 자원 사용 및 잠재적인 최적화 기회를 이해하는 데 도움을 줍니다. 이러한 관찰 가능성의 수준은 인프라 관리에 자원을 할당하지 않고도 고성능 분석 작업을 유지해야 하는 팀에게 특히 유용합니다.

서비스의 관리된 성격 덕분에 업데이트, 백업, 확장 또는 보안 패치에 대해 걱정할 필요가 없습니다. 이 모든 작업은 자동으로 처리됩니다. 따라서 데이터와 애플리케이션에 집중하고 싶은 조직에 적합한 선택입니다.

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)은 스탠드얼론 실행 파일로 ClickHouse의 전체 기능을 제공하는 강력한 명령줄 도구입니다. 본질적으로 ClickHouse Server와 동일한 데이터베이스이지만, 서버 인스턴스를 실행하지 않고도 명령줄에서 ClickHouse의 모든 기능을 직접 활용할 수 있도록 패키징되어 있습니다.

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

이 도구는 특히 로컬 파일 또는 클라우드 스토리지 서비스에 저장된 데이터와 작업할 때 즉석 데이터 분석에 뛰어납니다. ClickHouse의 SQL 방언을 사용하여 다양한 형식(CSV, JSON, Parquet 등)의 파일을 직접 쿼리할 수 있어 빠른 데이터 탐색이나 일회성 분석 작업에 대한 훌륭한 선택이 됩니다.

clickhouse-local은 ClickHouse의 모든 기능을 포함하므로 데이터 변환, 형식 변환 또는 일반적으로 ClickHouse Server로 수행하는 기타 데이터베이스 작업에 사용할 수 있습니다. 주로 임시 작업에 사용되지만 필요할 경우 ClickHouse Server와 동일한 저장 엔진을 사용하여 데이터를 지속할 수도 있습니다.

원격 테이블 함수와 로컬 파일 시스템 액세스의 조합 덕분에 clickhouse-local은 ClickHouse Server와 로컬 머신의 파일 간에 데이터를 조인해야 할 때 특히 유용합니다. 이는 민감하거나 임시적인 로컬 데이터를 서버에 업로드하지 않으려는 경우에 매우 가치가 있습니다.

## chDB {#chdb}

[chDB](/chdb)는 프로세스 내 데이터베이스 엔진으로 ClickHouse를 내장한 것으로, 주요 구현은 Python이며 Go, Rust, NodeJS, Bun에서도 사용할 수 있습니다. 이 배포 옵션은 ClickHouse의 강력한 OLAP 기능을 애플리케이션의 프로세스 내로 직접 가져오므로 별도의 데이터베이스 설치가 필요하지 않습니다.

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB는 애플리케이션의 생태계와 원활하게 통합됩니다. 예를 들어 Python에서는 Pandas와 Arrow와 같은 일반 데이터 과학 도구와 효율적으로 작업할 수 있도록 최적화되어 있으며, Python memoryview를 통해 데이터 복사 오버헤드를 최소화합니다. 이는 ClickHouse의 쿼리 성능을 기존 작업 흐름 내에서 활용하고자 하는 데이터 과학자와 분석가에게 특히 유용합니다.

chDB는 clickhouse-local로 생성된 데이터베이스에 연결할 수도 있어 데이터 작업 방식에 유연성을 제공합니다. 이는 로컬 개발, Python에서의 데이터 탐색 및 보다 영구적인 저장 솔루션 간에 데이터 접근 패턴을 변경하지 않고 원활하게 전환할 수 있음을 의미합니다.
