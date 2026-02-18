---
slug: /cloud/managed-postgres/benchmarks
sidebar_label: '벤치마크'
title: '성능 벤치마크'
description: 'ClickHouse가 관리하는 Postgres와 AWS Aurora, RDS 및 기타 관리형 PostgreSQL 서비스의 성능 벤치마크 비교'
keywords: ['Postgres 벤치마크', '성능', 'pgbench', 'Aurora', 'RDS', 'TPS', '지연 시간', 'NVMe 성능']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import computeIntensive from '@site/static/images/managed-postgres/benchmarks/compute-intensive.png';
import ioReadOnly from '@site/static/images/managed-postgres/benchmarks/io-intensive-readonly.png';
import ioReadWrite from '@site/static/images/managed-postgres/benchmarks/io-intensive-readwrite.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="benchmarks" />

:::info TL;DR

* ClickHouse가 관리하는 Postgres를 AWS RDS(16k provisioned IOPS) 및 Aurora IO Optimized와 표준 [`pgbench`](https://www.postgresql.org/docs/current/pgbench.html) 테스트로 **벤치마크했습니다**
* **성능**: NVMe 스토리지를 사용하는 ClickHouse의 Postgres는 IO 집약적 워크로드에서 **4.3–9배 더 빠른 성능**을 제공하고, CPU 바운드 시나리오에서는 **12% 더 빠른 성능**을 제공합니다
* 높은 트랜잭션 처리량, 낮은 지연 시간 데이터 액세스, IO 병목 없이 예측 가능한 성능이 필요한 **급성장하는 AI 기반 워크로드에 이상적입니다**
  :::


## 벤치마크 개요 \{#overview\}

표준 PostgreSQL 벤치마킹 도구인 `pgbench`를 사용하여 중간 수준 및 높은 동시성 시나리오 모두에서 워크로드 성능을 평가하기 위한 종합적인 성능 테스트를 수행했습니다.

## 벤치마크 \{#benchmarks\}

모든 성능 테스트는 공정한 비교를 위해 동일한 연산 용량을 가진 클라이언트 VM을 사용하고, PostgreSQL 데이터베이스와 동일한 리전 및 가용 영역에 위치시키는 방식으로 수행했습니다.

### Test 1: IO Intensive - Read+Write (500 GB dataset) \{#test1\}

<Image img={ioReadWrite} alt="IO 집약적 Read+Write 벤치마크 결과" size="md" border/>

**RDS(16k IOPS) 대비 성능 향상:**

- **TPS 326% 증가** (4.3배 더 빠름)

**Aurora IO Optimized 대비 성능 향상:**

- **TPS 345% 증가** (4.5배 더 빠름)

**분석**: 읽기/쓰기 혼합 워크로드는 NVMe 스토리지의 가장 극적인 성능 이점을 보여 주며, **대용량 데이터 수집과 저지연 읽기를 모두 요구하는, 빠르게 성장하는 AI 기반 워크로드에 가장 현실적인 시나리오**에 해당합니다. **ClickHouse에서 관리하는 Postgres는 더 높은 동시성 환경에서 19.8K TPS를 달성**하여, 부하 상태에서 NVMe 스토리지가 얼마나 효과적으로 확장되는지를 입증합니다. 이는 **RDS 및 Aurora보다 4.3-4.5배 더 빠른 성능**입니다. 네트워크 연결 스토리지 솔루션은 쓰기 집약적 작업에서 성능 저하를 보였으며, RDS와 Aurora는 프로비저닝된 용량과 Aurora의 IO Optimized 구성에도 불구하고 TPS 4.4K-4.6K 수준에서 한계에 도달했습니다.

#### 설정 \{#test1-setup\}

이 테스트는 500 GB 규모의 대용량 데이터셋을 대상으로 혼합 읽기/쓰기 성능을 평가하며, 스토리지 서브시스템의 읽기 및 쓰기 경로 모두에 부하를 가합니다.

**인스턴스 구성:**

| 구성         | ClickHouse가 관리하는 Postgres | 16k IOPS 지원 RDS        | Aurora IO Optimized     |
| ---------- | ------------------------- | ---------------------- | ----------------------- |
| **PG 버전**  | 17                        | 17                     | 17                      |
| **vCPU 수** | 16                        | 16                     | 16                      |
| **RAM**    | 64 GB                     | 64 GB                  | 128 GB                  |
| **디스크 크기** | 1 TB                      | 1 TB                   | 1 TB                    |
| **디스크 유형** | NVMe (무제한 IOPS)           | 네트워크 연결형 (16,000 IOPS) | 네트워크 연결형 (IO Optimized) |

**테스트 구성:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read+Write benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30
```


### Test 2: IO Intensive - Read-Only (500 GB dataset) \{#test2\}

<Image img={ioReadOnly} alt="IO Intensive Read-Only benchmark results" size="md" border/>

**RDS(16k IOPS) 대비 성능 향상:**

- **TPS 802% 향상** (9.0배 더 빠름)

**분석**: 읽기 중심이면서 I/O에 병목이 있는 워크로드에서는 성능 격차가 극적으로 벌어집니다. **ClickHouse에서 관리하는 Postgres는 84.8K TPS를 기록한 반면**, 동일한 수준의 컴퓨트 리소스를 사용했음에도 16,000 IOPS를 프로비저닝한 RDS는 9.4K TPS에 그쳤습니다. 핵심 차이는 ClickHouse의 NVMe 스토리지는 동시성이 높아질수록 성능이 함께 확장되는 반면, 네트워크 연결 스토리지는 프로비저닝된 IOPS 한계에 의해 제약을 받는다는 점입니다. 프로비저닝된 IOPS를 사용했음에도 RDS는 여전히 ClickHouse보다 9배 느렸으며, 이는 I/O 집약적 워크로드에서 스토리지 아키텍처가 얼마나 중요한지를 잘 보여줍니다.

#### 설정 \{#test2-setup\}

이 테스트는 메모리에 모두 적재되지 않는 500 GB 규모의 대용량 데이터셋으로 읽기 성능을 평가하며, 디스크 I/O 성능을 중점적으로 측정합니다.

**인스턴스 구성:**

| 구성 항목      | ClickHouse가 관리하는 Postgres | 16k IOPS를 사용하는 RDS        |
| ---------- | ------------------------- | ------------------------- |
| **PG 버전**  | 17                        | 17                        |
| **vCPU 수** | 16                        | 16                        |
| **RAM**    | 64 GB                     | 64 GB                     |
| **디스크 크기** | 1 TB                      | 1 TB                      |
| **디스크 유형** | NVMe (무제한 IOPS)           | 네트워크 연결 디스크 (16,000 IOPS) |

**테스트 구성:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read-only benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 -S
```


### 테스트 3: CPU 집약적 (데이터가 메모리에 적재됨) \{#test3\}

<Image img={computeIntensive} alt="CPU 집약적 벤치마크 결과" size="md" border/>

**성능 향상:**

- RDS PostgreSQL 대비 **TPS 12.3% 향상**

**분석**: 디스크 I/O가 거의 없는 CPU 바운드 시나리오에서도 **ClickHouse가 관리하는 Postgres가 36.5K TPS로 최상위 성능을 보였습니다.** 두 서비스 모두 CPU 사용률이 100%에 도달했음에도 불구하고, ClickHouse의 NVMe 스토리지는 더 높은 캐시 적중률을 통해 우수한 성능을 제공했습니다. RDS 대비 12% 성능 우위는 워크로드가 주로 CPU 바운드일 때에도 기본 인프라의 효율성이 뛰어남을 보여 줍니다.

#### 설정 \{#test3-setup\}

이 테스트는 워킹 세트 전체가 메모리에 상주하여 디스크 I/O 영향이 최소화된 상태에서 CPU 성능을 평가합니다.

**인스턴스 구성:**

| 구성         | ClickHouse가 관리하는 Postgres | RDS PostgreSQL    |
| ---------- | ------------------------- | ----------------- |
| **PG 버전**  | 17                        | 17                |
| **vCPU 수** | 2                         | 2                 |
| **RAM**    | 8 GB                      | 8 GB              |
| **디스크 유형** | NVMe                      | 네트워크 연결형 디스크(gp3) |

**테스트 구성:**

```bash
# Initialize database (2 GB dataset)
pgbench -i -s 136

# Warm-up run to load dataset into memory
pgbench -c 1 -T 60 -S -M prepared

# Run benchmark (read-only, prepared statements)
pgbench -c 32 -j 16 -T 300 -S -M prepared -P 30
```


## 성능 요약 \{#summary\}

### 주요 결과 \{#key-findings\}

세 가지 벤치마크 시나리오 모두에서 ClickHouse가 관리하는 Postgres는 일관되게 우수한 성능을 보여주었습니다.

1. **IO 집약적인 읽기+쓰기 워크로드**: RDS(16k IOPS) 및 Aurora IO Optimized 대비 TPS가 4.3~4.5배 더 높음
2. **IO 집약적인 읽기 워크로드**: 16k IOPS로 구성된 RDS 대비 TPS가 9배 더 높음
3. **CPU 병목 워크로드**: RDS 대비 TPS가 12% 더 높음

### Postgres by ClickHouse가 특히 뛰어난 경우 \{#when-it-excels\}

Postgres by ClickHouse는 다음과 같은 애플리케이션에 적합합니다:

- **급성장하는 AI 기반 워크로드를 처리**해야 하며, 높은 처리량의 데이터 수집과 빈번한 upsert, 실시간 피처 업데이트가 필요하고, ClickHouse와의 원활한 통합을 통해 OLAP 워크로드에 대한 분석 기능을 바로 활용해야 하는 경우
- 빈번한 쓰기, 업데이트 또는 읽기/쓰기 혼합 작업을 수행하는 경우
- 예측 가능한 고성능 스토리지가 필요한 경우
- 기존 매니지드 Postgres 서비스의 IOPS 한계로 인해 성능에 제약을 받고 있는 경우

**향후 분석 기능이 필요해질 것으로 예상**되고, 트랜잭션 데이터가 실시간 대시보드, 피처 스토어, ML 파이프라인을 구동하는 현대적인 AI 워크로드에서 흔히 그렇듯 ClickHouse와의 보다 긴밀한 통합을 예상한다면, **Postgres by ClickHouse를 기본 선택지로 삼는 것이 바람직합니다**. 네이티브 통합을 통해 복잡한 ETL 파이프라인을 제거하고, 운영 데이터베이스와 분석 쿼리 간에 끊김 없는 데이터 흐름을 구현할 수 있습니다.

### NVMe 아키텍처의 이점 \{#nvme-advantage\}

성능상의 이점은 근본적인 아키텍처 차이에서 비롯됩니다.

| Aspect                  | NVMe Storage (Managed Postgres)     | Network-Attached Storage (Provisioned IOPS)        |
|-------------------------|-------------------------------------|----------------------------------------------------|
| **IOPS**                | 10만에서 사실상 무제한까지           | 16,000 IOPS가 사전 프로비저닝됨                    |
| **Network hops**        | 0 (로컬 디바이스)                    | 모든 디스크 작업마다 네트워크 왕복이 필요함       |
| **Performance scaling** | 동시성이 증가할수록 선형적으로 확장됨 | 프로비저닝된 IOPS에 의해 제한됨                   |

NVMe 스토리지의 성능 이점에 대한 자세한 내용은 「[NVMe 기반 성능](/cloud/managed-postgres/overview#nvme-performance)」을 참고하십시오.

## 비용 효율성 \{#cost-effectiveness\}

순수한 성능 지표를 넘어, ClickHouse가 관리하는 Postgres는 우수한 가격 대비 성능을 제공합니다.

- **달러당 더 높은 처리량**: 16k 프로비저닝된 IOPS 및 Aurora IO Optimized 구성의 RDS와 비교해 4~9배 더 높은 TPS를 달성합니다.
- **예측 가능한 비용**: 추가 IOPS 용량을 프로비저닝할 필요가 없으며, 무제한 로컬 IOPS가 포함됩니다.
- **더 낮은 컴퓨팅 리소스 요구 사항**: 효율적인 I/O 덕분에 더 작은 인스턴스 크기로 목표 성능을 달성할 수 있습니다.
- **읽기 레플리카 필요성 감소**: 단일 인스턴스 처리량이 높아 수평 확장의 필요성이 줄어듭니다.

현재 IOPS 한계로 인해 제약을 받는 워크로드는 Managed Postgres로 전환하면, 성능을 크게 향상하면서도 비용이 많이 드는 프로비저닝된 IOPS 또는 IO 최적화 구성을 사용할 필요가 사라집니다.

## 참고 자료 \{#references\}

전체 벤치마크 데이터, 구성, 그리고 자세한 메트릭은 [벤치마크 결과 스프레드시트](https://docs.google.com/spreadsheets/d/17TLWmwNKZb3Ie1vSQqvjtqByHskvoX6CF2eQ_FRx1cA/edit?gid=845104392#gid=845104392)에서 확인할 수 있습니다.

## 추가 자료 \{#resources\}

- [PeerDB: 관리형 Postgres 서비스 비교](https://blog.peerdb.io/comparing-postgres-managed-services-aws-azure-gcp-and-supabase)
- [pgbench 문서](https://www.postgresql.org/docs/current/pgbench.html)
- [관리형 Postgres 개요](/cloud/managed-postgres/overview)
- [Postgres 인스턴스 확장](/cloud/managed-postgres/scaling)