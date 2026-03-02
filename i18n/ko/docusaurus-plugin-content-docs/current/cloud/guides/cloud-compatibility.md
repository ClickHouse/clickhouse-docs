---
slug: /whats-new/cloud-compatibility
sidebar_label: 'Cloud 호환성'
title: 'Cloud 호환성'
description: '이 가이드는 ClickHouse Cloud에서 기능 및 운영 측면에서 무엇을 기대할 수 있는지에 대한 개요를 제공합니다.'
keywords: ['ClickHouse Cloud', '호환성']
doc_type: 'guide'
---

# ClickHouse Cloud 호환성 가이드 \{#clickhouse-cloud-compatibility-guide\}

이 가이드는 ClickHouse Cloud에서 기능 및 운영 측면에서 어떤 점을 기대할 수 있는지에 대한 개요를 제공합니다. ClickHouse Cloud는 오픈 소스 ClickHouse 배포판을 기반으로 하지만, 아키텍처와 구현 측면에서 일부 차이가 있을 수 있습니다. 배경 지식으로 참고하기에 유용한 [ClickHouse Cloud를 어떻게 구축했는지](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)를 다룬 블로그 글입니다.

## ClickHouse Cloud architecture \{#clickhouse-cloud-architecture\}

ClickHouse Cloud는 운영 오버헤드를 크게 줄이고 대규모로 ClickHouse를 실행하는 비용을 절감해 줍니다. 배포 규모를 미리 산정하거나, 고가용성을 위한 복제를 설정하거나, 데이터를 수동으로 세그먼트로 분할하거나, 워크로드가 증가할 때 서버를 확장하거나, 사용하지 않을 때 서버를 축소할 필요가 없습니다. 이러한 작업은 모두 ClickHouse Cloud에서 처리합니다.

이러한 이점은 ClickHouse Cloud의 기본 아키텍처적 선택에서 비롯됩니다.

- 컴퓨트와 스토리지를 분리하여 각각을 독립적으로 자동 확장할 수 있으므로, 고정 인스턴스 구성에서 스토리지나 컴퓨트를 과도하게 프로비저닝할 필요가 없습니다.
- 오브젝트 스토어 위의 계층형 스토리지와 다단계 캐싱을 통해 사실상 무제한에 가까운 확장성과 우수한 가격 대비 성능을 제공하므로, 스토리지 파티션 용량을 사전에 산정하거나 높은 스토리지 비용을 걱정할 필요가 없습니다.
- 고가용성은 기본적으로 활성화되어 있으며 복제가 투명하게 관리되므로, 애플리케이션을 개발하거나 데이터를 분석하는 데 집중할 수 있습니다.
- 변동이 있는 지속적인 워크로드를 위한 자동 확장은 기본적으로 활성화되어 있으므로, 서비스를 미리 사이징하거나, 워크로드 증가 시 서버를 확장하거나, 활동이 줄어들었을 때 서버를 수동으로 축소할 필요가 없습니다.
- 간헐적인 워크로드를 위한 원활한 하이버네이션(hibernation)은 기본적으로 활성화되어 있습니다. 일정 기간 비활성 상태가 지속되면 컴퓨트 리소스를 자동으로 일시 중지하고, 새 쿼리가 도착하면 필요 시 자동으로 다시 시작하므로, 유휴 리소스에 대해 비용을 지불하지 않아도 됩니다.
- 고급 확장 제어 기능을 통해 비용 관리를 위한 자동 확장 최대값을 설정하거나, 특수한 성능 요구 사항이 있는 애플리케이션을 위해 컴퓨트 리소스를 예약하는 자동 확장 최소값을 설정할 수 있습니다.

## 기능 \{#capabilities\}

ClickHouse Cloud는 오픈 소스 ClickHouse 배포판에서 제공되는 기능 중 선별된 기능들을 사용할 수 있도록 합니다. 아래 표에서는 현재 ClickHouse Cloud에서 사용할 수 없는 일부 기능을 설명합니다.

### Database and table engines \{#database-and-table-engines\}

ClickHouse Cloud는 기본적으로 고가용성을 보장하는 레플리카 서비스를 제공합니다. 그 결과, 모든 데이터베이스 및 테이블 엔진은 「Replicated」 형태입니다. 예를 들어 ClickHouse Cloud에서는 `ReplicatedMergeTree`와 `MergeTree`가 동일하게 동작하므로, 「Replicated」를 별도로 지정할 필요가 없습니다.

**지원되는 테이블 엔진(table engines)**

- ReplicatedMergeTree (아무것도 지정하지 않았을 때 기본값)
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree (ReplicatedMergeTree로 변환됨)
- SummingMergeTree (ReplicatedSummingMergeTree로 변환됨)
- AggregatingMergeTree (ReplicatedAggregatingMergeTree로 변환됨)
- ReplacingMergeTree (ReplicatedReplacingMergeTree로 변환됨)
- CollapsingMergeTree (ReplicatedCollapsingMergeTree로 변환됨)
- VersionedCollapsingMergeTree (ReplicatedVersionedCollapsingMergeTree로 변환됨)
- URL
- View
- MaterializedView
- GenerateRandom
- Null
- Buffer
- Memory
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3
- Kafka

### 인터페이스 \{#interfaces\}

ClickHouse Cloud는 HTTPS, 네이티브 인터페이스, 그리고 [MySQL wire protocol](/interfaces/mysql)을 지원합니다. Postgres와 같은 추가 인터페이스에 대한 지원도 곧 제공될 예정입니다.

### Dictionaries \{#dictionaries\}

사전(Dictionaries)은 ClickHouse에서 조회 속도를 높이는 데 널리 사용되는 기능입니다. ClickHouse Cloud는 현재 PostgreSQL, MySQL, 원격 및 로컬 ClickHouse 서버, Redis, MongoDB, HTTP 소스를 기반으로 하는 Dictionaries를 지원합니다.

### 연합 쿼리 \{#federated-queries\}

Cloud 환경의 클러스터 간 통신과 외부 자가 관리형 ClickHouse 클러스터와의 통신을 위해 연합 ClickHouse 쿼리를 지원합니다. ClickHouse Cloud는 현재 다음 통합 엔진을 통한 연합 쿼리를 지원합니다.

- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite, ODBC, JDBC, Redis, HDFS 및 Hive와 같은 일부 외부 데이터베이스 및 테이블 엔진과의 연합 쿼리는 아직 지원되지 않습니다.

### User defined functions \{#user-defined-functions\}

ClickHouse Cloud의 사용자 정의 함수는 현재 [비공개 프리뷰(private preview)](https://clickhouse.com/docs/sql-reference/functions/udf) 단계에 있습니다.

#### 설정 동작 \{#udf-settings-behavior\}

:::warning 중요
ClickHouse Cloud의 UDF는 **사용자 수준 설정을 상속하지 않습니다**. 기본 시스템 설정으로 실행됩니다.
:::

이는 다음을 뜻합니다.

- 세션 수준 설정(`SET` 문을 통해 설정한 값)은 UDF 실행 컨텍스트로 전파되지 않습니다.
- 사용자 프로필 설정은 UDF에 상속되지 않습니다.
- 쿼리 수준 설정은 UDF 실행 중에는 적용되지 않습니다.

### 실험적 기능 \{#experimental-features\}

ClickHouse Cloud 서비스에서는 배포 안정성을 보장하기 위해 실험적 기능이 비활성화되어 있습니다.

### 네임드 컬렉션 \{#named-collections\}

[네임드 컬렉션](/operations/named-collections)은 아직 ClickHouse Cloud에서는 지원되지 않습니다.

## 운영 기본값 및 고려 사항 \{#operational-defaults-and-considerations\}

다음은 ClickHouse Cloud 서비스의 기본 설정입니다. 일부 설정은 서비스가 올바르게 동작하도록 고정되어 있으며, 나머지는 조정할 수 있습니다.

### 운영 한계 \{#operational-limits\}

#### `max_parts_in_total: 10,000` \{#max_parts_in_total-10000\}

MergeTree 테이블의 `max_parts_in_total` 설정 기본값이 100,000에서 10,000으로 낮아졌습니다. 이 변경의 이유는 클라우드 환경에서 데이터 파트가 너무 많을 경우 서비스 시작 시간이 느려지는 경향이 있다는 점이 관찰되었기 때문입니다. 파트 수가 많다는 것은 보통 파티션 키를 지나치게 세분화하여 선택했다는 의미이며, 이는 대개 의도치 않게 설정되는 것으로 피해야 합니다. 기본값 변경으로 이러한 사례를 더 이른 시점에 감지할 수 있습니다.

#### `max_concurrent_queries: 1,000` \{#max_concurrent_queries-1000\}

동시성을 높이기 위해 서버당 이 설정 값을 기본값인 `100`에서 `1000`으로 늘립니다.  
이렇게 하면 제공 요금제 서비스에서 `레플리카 수 * 1,000`개의 동시 쿼리를 처리할 수 있습니다.  
단일 레플리카로 제한되는 Basic 요금제 서비스에서는 `1000`개의 동시 쿼리가 가능하며, Scale 및 Enterprise 요금제에서는 구성된 레플리카 수에 따라 `1000+`개의 동시 쿼리가 가능합니다.

#### `max_table_size_to_drop: 1,000,000,000,000` \{#max_table_size_to_drop-1000000000000\}

이 설정을 50GB에서 상향 조정하여 최대 1TB까지 테이블/파티션을 삭제할 수 있도록 했습니다.

### System settings \{#system-settings\}

ClickHouse Cloud는 가변적인 워크로드에 맞게 최적화되어 있으며, 이러한 이유로 현재 대부분의 시스템 설정은 변경할 수 없습니다. 일반적으로 시스템 설정을 조정해야 할 필요는 없다고 예상되지만, 고급 시스템 튜닝과 관련해 문의 사항이 있으면 ClickHouse Cloud Support로 문의하십시오.

### 고급 보안 관리 \{#advanced-security-administration\}

ClickHouse 서비스를 생성하는 과정에서 기본 데이터베이스와, 이 데이터베이스에 대해 폭넓은 권한을 가진 기본 사용자 계정이 함께 생성됩니다. 이 초기 사용자 계정은 추가 사용자 계정을 생성하고 이 데이터베이스에 대한 권한을 부여할 수 있습니다. 이와는 별도로 Kerberos, LDAP 또는 SSL X.509 인증서 기반 인증을 사용하여 데이터베이스 내에서 다음과 같은 보안 기능을 활성화하는 것은 현재 지원되지 않습니다.

## 로드맵 \{#roadmap\}

현재 ClickHouse Cloud에 추가할 여러 기능에 대한 수요를 평가하고 있습니다. 의견이 있거나 특정 기능을 요청하려면 [여기에서 제출해 주십시오](https://console.clickhouse.cloud/support).