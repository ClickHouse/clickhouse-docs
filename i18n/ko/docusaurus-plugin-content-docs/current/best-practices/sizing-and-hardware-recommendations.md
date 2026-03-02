---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: '사이징 및 하드웨어 권장 사항'
sidebar_position: 4
title: '사이징 및 하드웨어 권장 사항'
description: '이 가이드는 오픈 소스 사용자를 위한 하드웨어, 컴퓨팅, 메모리 및 디스크 구성에 대한 일반적인 권장 사항을 제공합니다.'
doc_type: 'guide'
keywords: ['사이징', '하드웨어', '용량 계획', '모범 사례', '성능']
---

# 규모 산정 및 하드웨어 권장 사항 \{#sizing-and-hardware-recommendations\}

이 가이드는 오픈 소스 버전 사용자를 위한 하드웨어, 컴퓨팅 리소스, 메모리, 디스크 구성에 대한 일반적인 권장 사항을 다룹니다. 구성을 단순화하려면 [ClickHouse Cloud](https://clickhouse.com/cloud) 사용을 권장합니다. ClickHouse Cloud는 인프라 관리와 관련된 비용을 최소화하면서 워크로드에 맞게 자동으로 확장 및 조정합니다.

ClickHouse 클러스터 구성은 애플리케이션의 사용 사례와 워크로드 패턴에 크게 좌우됩니다. 아키텍처를 설계할 때는 다음 요소를 고려해야 합니다.

- 동시성(초당 요청 수)
- 처리량(초당 처리되는 행 수)
- 데이터 용량
- 데이터 보존 정책
- 하드웨어 비용
- 유지 관리 비용

## 디스크 \{#disk\}

ClickHouse에서 선택해야 하는 디스크 유형은 데이터 양, 지연 시간(latency), 처리량(throughput) 요구 사항에 따라 달라집니다.

### 성능 최적화 \{#optimizing-for-performance\}

성능을 최대화하기 위해 I/O에 최적화된 [AWS의 Provisioned IOPS SSD 볼륨](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) 또는 사용 중인 클라우드 제공업체의 동급 서비스를 인스턴스에 직접 연결하도록 권장합니다.

### 스토리지 비용 최적화 \{#optimizing-for-storage-costs\}

비용을 절감하기 위해 [general purpose SSD EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)를 사용할 수 있습니다.

또한 SSD와 HDD를 함께 사용하여 [hot/warm/cold 아키텍처](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) 기반의 계층형 스토리지(tiered storage)를 구현할 수 있습니다. 또는 컴퓨트와 스토리지를 분리하기 위해 스토리지로 [AWS S3](https://aws.amazon.com/s3/)를 사용하는 것도 가능합니다. 컴퓨트와 스토리지를 분리하여 오픈 소스 ClickHouse를 사용하는 방법은 [여기](/guides/separation-storage-compute)를 참고하십시오. 컴퓨트와 스토리지 분리는 ClickHouse Cloud에서 기본적으로 제공됩니다.

## CPU \{#cpu\}

### 어떤 CPU를 사용해야 합니까? \{#which-cpu-should-i-use\}

사용해야 하는 CPU 유형은 사용 패턴에 따라 달라집니다. 일반적으로 매우 자주 동시에 실행되는 쿼리가 많거나, 더 많은 데이터를 처리하거나, 연산 집약적인 UDF를 사용하는 애플리케이션에는 더 많은 CPU 코어가 필요합니다.

**저지연 또는 고객 대상 애플리케이션**

수십 밀리초 수준의 지연 시간이 요구되는 고객 대상 워크로드에는 AWS의 EC2 [i3 계열](https://aws.amazon.com/ec2/instance-types/i3/) 또는 [i4i 계열](https://aws.amazon.com/ec2/instance-types/i4i/)이나 이에 상응하는 클라우드 제공업체의 IO 최적화 인스턴스를 사용할 것을 권장합니다.

**고동시성 애플리케이션**

초당 100개 이상의 쿼리와 같이 동시성을 최적화해야 하는 워크로드에는 AWS의 [컴퓨팅 최적화 C 시리즈](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) 또는 이에 상응하는 클라우드 제공업체의 인스턴스를 권장합니다.

**데이터 웨어하우징 사용 사례**

데이터 웨어하우징 워크로드와 애드혹 분석 쿼리에는 AWS의 [R 시리즈](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) 또는 이에 상응하는 메모리 최적화 클라우드 인스턴스를 권장합니다.

---

### CPU 사용률은 어느 정도가 적절한가요? \{#what-should-cpu-utilization-be\}

ClickHouse에 대해 표준 CPU 사용률 목표치는 없습니다. [iostat](https://linux.die.net/man/1/iostat)과 같은 도구를 사용하여 평균 CPU 사용량을 측정한 뒤, 예기치 않은 트래픽 급증을 처리할 수 있도록 이에 맞춰 서버 규모를 조정하십시오. 다만, 애드혹 쿼리를 사용하는 분석 또는 데이터 웨어하우징 용도의 경우 CPU 사용률을 10–20% 수준으로 유지하는 것을 목표로 하는 것이 좋습니다.

### CPU 코어는 얼마나 사용해야 합니까? \{#how-many-cpu-cores-should-i-use\}

사용해야 하는 CPU 코어 수는 워크로드에 따라 달라집니다. 다만 일반적으로 CPU 유형에 따라 다음과 같은 메모리 대비 CPU 코어 비율을 권장합니다:

- **[M-type](https://aws.amazon.com/ec2/instance-types/) (범용 워크로드):** 메모리:CPU 코어 비율 4 GB:1
- **[R-type](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) (데이터 웨어하우징 워크로드):** 메모리:CPU 코어 비율 8 GB:1
- **[C-type](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) (컴퓨팅 최적화 워크로드):** 메모리:CPU 코어 비율 2 GB:1

예를 들어 M-type CPU를 사용하는 경우 CPU 코어 25개당 메모리 100GB를 프로비저닝할 것을 권장합니다. 애플리케이션에 적합한 메모리 용량을 결정하려면 메모리 사용량에 대한 프로파일링이 필요합니다. [메모리 문제 디버깅 가이드](/guides/developer/debugging-memory-issues)를 참고하거나 [내장 관측성 대시보드](/operations/monitoring)를 사용하여 ClickHouse를 모니터링할 수 있습니다.

## Memory \{#memory\}

CPU 선택과 마찬가지로, 메모리 대 스토리지 비율과 메모리 대 CPU 비율은 사용 사례에 따라 달라집니다.

필요한 RAM 용량은 일반적으로 다음 요소에 따라 결정됩니다.

- 쿼리의 복잡성.
- 쿼리에서 처리되는 데이터의 양.

일반적으로 메모리가 많을수록 쿼리가 더 빠르게 실행됩니다.  
비용에 민감한 사용 사례인 경우, 비교적 적은 메모리로도 디스크로 데이터를 스필(spill)하도록 허용하는 설정([`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 및 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort))을 활성화해 사용할 수 있습니다. 다만 이 경우 쿼리 성능에 상당한 영향을 줄 수 있다는 점에 유의해야 합니다.

### 메모리와 스토리지의 비율은 어떻게 설정해야 합니까? \{#what-should-the-memory-to-storage-ratio-be\}

데이터량이 작은 경우에는 메모리 대 스토리지 비율을 1:1로 설정해도 되지만, 총 메모리는 8GB 미만이 되지 않아야 합니다.

데이터 보존 기간이 길거나 데이터량이 많은 사용 사례에서는 메모리 대 스토리지 비율을 1:100에서 1:130으로 설정할 것을 권장합니다. 예를 들어, 10TB의 데이터를 저장하는 경우 레플리카당 100GB의 RAM을 사용하는 방식입니다.

고객 대상 워크로드와 같이 자주 액세스되는 사용 사례에서는 메모리 대 스토리지 비율을 1:30에서 1:50으로 설정하여 더 많은 메모리를 사용할 것을 권장합니다.

## 레플리카 \{#replicas\}

각 세گ먼트당 최소 3개의 레플리카를 두는 것을 권장합니다(또는 [Amazon EBS](https://aws.amazon.com/ebs/)를 사용하는 경우 2개의 레플리카). 또한 수평 확장(레플리카 추가)을 하기 전에, 모든 레플리카를 먼저 수직 확장하는 방식으로 규모를 조정할 것을 권장합니다.

ClickHouse는 자동으로 세그먼트를 나누지 않으며(sharding), 데이터셋을 다시 세그먼트로 분할하려면(re-sharding) 상당한 컴퓨팅 리소스가 필요합니다. 따라서 향후 데이터를 다시 세그먼트로 분할하지 않아도 되도록, 가능한 한 가장 큰 서버를 사용하는 것을 일반적으로 권장합니다.

자동으로 확장되며 사용 사례에 맞게 레플리카 수를 쉽게 제어할 수 있는 [ClickHouse Cloud](https://clickhouse.com/cloud) 사용을 고려하십시오.

## 대규모 워크로드를 위한 예시 구성 \{#example-configurations-for-large-workloads\}

ClickHouse 구성은 각 애플리케이션의 구체적인 요구 사항에 크게 좌우됩니다. 아키텍처를 비용과 성능 측면에서 최적화하는 데 도움이 필요하면 [영업팀에 문의](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)해 주십시오.

권장 사항이 아닌 참고용 안내를 위해, 다음은 프로덕션 환경에서 ClickHouse를 사용하는 사용자의 예시 구성입니다.

### Fortune 500 B2B SaaS \{#fortune-500-b2b-saas\}

<table>
    <tr>
        <td col="2"><strong><em>스토리지</em></strong></td>
    </tr>
    <tr>
        <td><strong>월간 신규 데이터량</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>총 스토리지(압축 기준)</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>데이터 보존 기간</strong></td>
        <td>18개월</td>
    </tr>
    <tr>
        <td><strong>노드당 디스크 용량</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>동시성</strong></td>
        <td>동시 쿼리 200개 이상</td>
    </tr>
    <tr>
        <td><strong>레플리카 수(HA 페어 포함)</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>노드당 vCPU</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>총 vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>메모리</em></strong></td>
    </tr>
    <tr>
        <td><strong>총 RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>레플리카당 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM:vCPU 비율</strong></td>
        <td>4 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM:디스크 비율</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 통신 사업자의 로깅 사용 사례 \{#fortune-500-telecom-operator-for-a-logging-use-case\}

<table>
    <tr>
        <td col="2"><strong><em>스토리지</em></strong></td>
    </tr>
    <tr>
        <td><strong>월간 로그 데이터량</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>총 스토리지 (압축 기준)</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>데이터 보존 기간</strong></td>
        <td>30일</td>
    </tr>
    <tr>
        <td><strong>노드당 디스크 용량</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>레플리카 수 (HA(고가용성) 페어 포함)</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>노드당 vCPU 수</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>총 vCPU 수</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>메모리</em></strong></td>
    </tr>
    <tr>
        <td><strong>총 RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>레플리카당 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 대 vCPU 비율</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM 대 디스크 비율</strong></td>
        <td>1:60</td>
    </tr>
</table>

## 추가 자료 \{#further-reading\}

아래는 오픈 소스 ClickHouse를 사용하는 기업들의 아키텍처를 다루는 공개 블로그 글입니다.

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)