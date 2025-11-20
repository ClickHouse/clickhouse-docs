---
'slug': '/guides/sizing-and-hardware-recommendations'
'sidebar_label': '크기 조정 및 하드웨어 권장 사항'
'sidebar_position': 4
'title': '크기 조정 및 하드웨어 권장 사항'
'description': '이 가이드는 오픈 소스 사용자를 위한 하드웨어, 컴퓨팅, 메모리 및 디스크 구성에 대한 일반적인 권장 사항을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'sizing'
- 'hardware'
- 'capacity planning'
- 'best practices'
- 'performance'
---


# 크기 측정 및 하드웨어 권장 사항

이 가이드는 오픈 소스 사용자를 위한 하드웨어, 컴퓨트, 메모리 및 디스크 구성에 대한 일반적인 권장 사항을 논의합니다. 설정을 단순화하려면 [ClickHouse Cloud](https://clickhouse.com/cloud)를 사용하는 것이 좋습니다. 이를 통해 인프라 관리에 관련된 비용을 최소화하면서 작업 부하에 맞게 자동으로 확장하고 조정합니다.

ClickHouse 클러스터의 구성은 애플리케이션의 사용 사례 및 작업 패턴에 따라 크게 달라집니다. 아키텍처를 계획할 때에는 다음과 같은 요소를 고려해야 합니다:

- 동시성 (초당 요청 수)
- 처리량 (초당 처리되는 행 수)
- 데이터 볼륨
- 데이터 보존 정책
- 하드웨어 비용
- 유지 관리 비용

## 디스크 {#disk}

ClickHouse와 함께 사용할 디스크 유형은 데이터 볼륨, 지연 시간 또는 처리량 요구 사항에 따라 달라집니다.

### 성능 최적화 {#optimizing-for-performance}

성능을 극대화하기 위해, AWS에서 제공하는 [프로비저닝된 IOPS SSD 볼륨](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) 또는 클라우드 공급자에서 제공하는 동등한 서비스를 직접 연결하는 것을 권장합니다. 이는 IO를 최적화합니다.

### 저장 비용 최적화 {#optimizing-for-storage-costs}

비용을 절감하려면 [일반 용도 SSD EBS 볼륨](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)을 사용할 수 있습니다.

SSD와 HDD를 사용하여 [핫/웜/콜드 아키텍처](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)를 구현하는 방법도 있습니다. 또는, [AWS S3](https://aws.amazon.com/s3/)를 사용하여 컴퓨트와 저장소를 분리하는 것도 가능합니다. ClickHouse를 사용하여 컴퓨트와 저장소를 분리하는 방법에 대한 가이드는 [여기](https://aws.amazon.com/s3/)에서 확인하십시오. ClickHouse Cloud에서는 기본적으로 컴퓨트와 저장소의 분리가 가능합니다.

## CPU {#cpu}

### 어떤 CPU를 사용해야 하나요? {#which-cpu-should-i-use}

사용해야 할 CPU 유형은 사용 패턴에 따라 달라집니다. 그러나 일반적으로, 동시에 여러 쿼리를 자주 실행하거나 더 많은 데이터를 처리하는 애플리케이션, 또는 계산 집약적인 UDF를 사용하는 애플리케이션은 더 많은 CPU 코어가 필요합니다.

**저지연 또는 고객-facing 애플리케이션**

상용 작업 부하와 같이 10밀리초의 지연 요구사항이 있는 경우, AWS의 EC2 [i3 라인](https://aws.amazon.com/ec2/instance-types/i3/) 또는 [i4i 라인](https://aws.amazon.com/ec2/instance-types/i4i/) 및 클라우드 제공자의 동등한 제품을 추천합니다. 이는 IO에 최적화되어 있습니다.

**높은 동시성 애플리케이션**

100건 이상의 쿼리를 초당 처리해야 하는 작업 부하의 경우, AWS의 [컴퓨트 최적화 C 시리즈](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) 또는 클라우드 제공자의 동등한 제품을 추천합니다.

**데이터 웨어하우징 사용 사례**

데이터 웨어하우징 작업 및 애드혹 분석 쿼리를 위한 경우, AWS의 [R형 시리즈](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) 또는 클라우드 제공자의 동등한 제품을 추천합니다. 이들은 메모리 최적화되어 있습니다.

---

### CPU 활용률은 어느 정도여야 하나요? {#what-should-cpu-utilization-be}

ClickHouse에 대한 표준 CPU 활용률 목표는 없습니다. [iostat](https://linux.die.net/man/1/iostat)와 같은 도구를 사용하여 평균 CPU 사용량을 측정하고, 예기치 않은 트래픽 급증을 관리하기 위해 서버 크기를 조절하세요. 그러나 분석 또는 데이터 웨어하우징을 위한 애드혹 쿼리의 경우, 10-20% CPU 활용률을 목표로 해야 합니다.

### CPU 코어 수는 얼마나 사용해야 하나요? {#how-many-cpu-cores-should-i-use}

사용해야 할 CPU 수는 작업 부하에 따라 다릅니다. 하지만 CPU 유형에 따라 일반적으로 다음과 같은 메모리-CPU 코어 비율을 권장합니다:

- **[M형](https://aws.amazon.com/ec2/instance-types/) (일반 용도 사용 사례):** 4 GB:1 메모리 대 CPU 코어 비율
- **[R형](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) (데이터 웨어하우징 사용 사례):** 8 GB:1 메모리 대 CPU 코어 비율
- **[C형](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) (컴퓨트 최적화 사용 사례):** 2 GB:1 메모리 대 CPU 코어 비율

예를 들어, M형 CPU를 사용할 때는 25 CPU 코어당 100GB의 메모리를 프로비저닝하는 것을 권장합니다. 애플리케이션에 적합한 메모리 양을 결정하기 위해 메모리 사용량을 프로파일링해야 합니다. [메모리 문제 디버깅에 대한 가이드](/guides/developer/debugging-memory-issues)를 읽거나 [내장된 가시성 대시보드](/operations/monitoring)를 사용하여 ClickHouse를 모니터링할 수 있습니다.

## 메모리 {#memory}

CPU 선택과 마찬가지로 메모리-저장소 비율 및 메모리-CPU 비율 선택은 사용 사례에 따라 달라집니다.

필요한 RAM 용량은 일반적으로 다음에 따라 달라집니다:
- 쿼리의 복잡성.
- 쿼리에서 처리되는 데이터의 양.

일반적으로 메모리 용량이 많을수록 쿼리 실행 속도가 빨라집니다. 
가격에 민감한 사용 사례의 경우, 메모리 용량을 줄일 수 있으며 설정([`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 및 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort))을 활성화하여 데이터를 디스크에 스필할 수 있도록 할 수 있지만, 이는 쿼리 성능에 중대한 영향을 미칠 수 있습니다.

### 메모리-저장소 비율은 어떠해야 하나요? {#what-should-the-memory-to-storage-ratio-be}

낮은 데이터 볼륨의 경우, 1:1 메모리-저장소 비율이 허용되지만 총 메모리는 8GB를 밑돌아서는 안 됩니다.

데이터의 보존 기간이 길거나 높은 데이터 볼륨을 가진 사용 사례의 경우, 1:100에서 1:130의 메모리-저장소 비율을 권장합니다. 예를 들어, 10TB의 데이터를 저장하는 경우, 복제본마다 100GB의 RAM을 사용하면 됩니다.

고객-facing 작업과 같은 자주 접근하는 사용 사례의 경우, 1:30에서 1:50의 메모리-저장소 비율을 사용할 것을 권장합니다.

## 복제본 {#replicas}

샤드당 최소 3개의 복제본을 가지는 것이 좋습니다(또는 [Amazon EBS](https://aws.amazon.com/ebs/)와 함께 2개의 복제본). 또한, 추가 복제본(수평 확장)을 추가하기 전에 모든 복제본을 수직으로 확장할 것을 권장합니다.

ClickHouse는 자동으로 샤딩되지 않으며, 데이터 세트를 다시 샤딩하려면 상당한 처리 능력이 필요합니다. 따라서, 향후 데이터를 다시 샤딩할 필요가 없도록 최대의 서버를 사용하는 것을 권장합니다.

[ClickHouse Cloud](https://clickhouse.com/cloud)를 사용하는 것을 고려하세요. 이 서비스는 자동으로 확장되며 사용 사례에 맞게 복제본 수를 손쉽게 조절할 수 있습니다.

## 대규모 작업 부하에 대한 예제 구성 {#example-configurations-for-large-workloads}

ClickHouse 구성은 특정 애플리케이션의 요구 사항에 크게 의존합니다. 비용 및 성능 최적화를 위해 도움이 필요하시면 [판매에 문의](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)하시기 바랍니다.

안내 목적으로, 다음은 프로덕션 환경에서 ClickHouse 사용자의 예제 구성입니다:

### 포춘 500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>저장소</em></strong></td>
    </tr>
    <tr>
        <td><strong>월간 신규 데이터 볼륨</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>총 저장소 (압축됨)</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>데이터 보존</strong></td>
        <td>18개월</td>
    </tr>
    <tr>
        <td><strong>노드당 디스크</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>동시성</strong></td>
        <td>200+ 동시 쿼리</td>
    </tr>
    <tr>
        <td><strong>복제본 수 (HA 쌍 포함)</strong></td>
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
        <td><strong>복제본당 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM-to-vCPU 비율</strong></td>
        <td>4 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM-to-disk 비율</strong></td>
        <td>1:50</td>
    </tr>
</table>

### 포춘 500 통신사 로그 사용 사례 {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>저장소</em></strong></td>
    </tr>
    <tr>
        <td><strong>월간 로그 데이터 볼륨</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>총 저장소 (압축됨)</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>데이터 보존</strong></td>
        <td>30일</td>
    </tr>
    <tr>
        <td><strong>노드당 디스크</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>복제본 수 (HA 쌍 포함)</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>노드당 vCPU</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>총 vCPU</strong></td>
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
        <td><strong>복제본당 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM-to-vCPU 비율</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM-to-disk 비율</strong></td>
        <td>1:60</td>
    </tr>
</table>

## 추가 자료 {#further-reading}

아래는 오픈 소스 ClickHouse를 사용하는 기업들의 아키텍처에 대한 게시된 블로그 포스트입니다:

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
