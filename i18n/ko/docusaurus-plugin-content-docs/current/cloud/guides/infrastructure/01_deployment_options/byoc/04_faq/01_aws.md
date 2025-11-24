---
'title': 'AWS에서 BYOC FAQ'
'slug': '/cloud/reference/byoc/faq/aws'
'sidebar_label': 'AWS'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
- 'AWS'
'description': '자신의 클라우드 인프라스트럭처에 ClickHouse 배포하기'
'doc_type': 'reference'
---

## FAQ {#faq}

### Compute {#compute}

<details>
<summary>이 단일 EKS 클러스터에서 여러 서비스를 만들 수 있나요?</summary>

네. 인프라는 AWS 계정 및 리전 조합마다 한 번만 프로비저닝되면 됩니다.

</details>

<details>
<summary>BYOC를 지원하는 리전은 어디인가요?</summary>

BYOC는 ClickHouse Cloud와 동일한 [리전](/cloud/reference/supported-regions#aws-regions ) 집합을 지원합니다.

</details>

<details>
<summary>리소스 오버헤드가 있을까요? ClickHouse 인스턴스 이외의 서비스를 실행하는 데 필요한 리소스는 무엇인가요?</summary>

Clickhouse 인스턴스(ClickHouse 서버 및 ClickHouse Keeper) 외에도 `clickhouse-operator`, `aws-cluster-autoscaler`, Istio 등과 우리의 모니터링 스택을 실행합니다.

현재, 이러한 워크로드를 실행하기 위해 전용 노드 그룹에 세 가지 m5.xlarge 노드(각 AZ마다 하나)를 보유하고 있습니다.

</details>

### Network and security {#network-and-security}

<details>
<summary>설치가 완료된 후 설치 중에 설정한 권한을 철회할 수 있나요?</summary>

현재로서는 불가능합니다.

</details>

<details>
<summary>ClickHouse 엔지니어가 문제 해결을 위해 고객 인프라에 접근할 수 있도록 미래의 보안 제어를 고려하셨나요?</summary>

네. 고객이 클러스터에 대한 엔지니어의 접근을 승인할 수 있는 고객 제어 메커니즘 구현이 우리의 로드맵에 포함되어 있습니다. 현재로서는 엔지니어가 클러스터에 대한 적시 접근을 얻기 위해 우리의 내부 에스컬레이션 프로세스를 거쳐야 합니다. 이는 우리의 보안 팀에 의해 기록되고 감사됩니다.

</details>

<details>
<summary>생성된 VPC IP 범위의 크기는 얼마인가요?</summary>

기본적으로 BYOC VPC에 대해 `10.0.0.0/16`을 사용합니다. 우리는 잠재적인 미래 확장을 위해 최소 /22를 예약하는 것을 권장하지만, 크기를 제한하는 것을 원하신다면 /23을 사용할 수 있습니다. 이 경우 30개의 서버 팟으로 제한될 가능성이 높습니다.

</details>

<details>
<summary>유지 관리 주기를 결정할 수 있나요?</summary>

유지 관리 창을 예약하려면 지원팀에 문의하세요. 최소한 주간 업데이트 일정을 예상해 주세요.

</details>

### Uptime SLAs {#uptime-sla}

<details>
<summary>ClickHouse는 BYOC에 대한 가동 시간 SLA를 제공하나요?</summary>

아니요. 데이터 평면이 고객의 클라우드 환경에 호스팅되기 때문에 서비스 가용성은 ClickHouse의 통제를 벗어난 리소스에 따라 달라집니다. 따라서 ClickHouse는 BYOC 배포에 대한 공식적인 가동 시간 SLA를 제공하지 않습니다. 추가 질문이 있는 경우 support@clickhouse.com으로 문의해 주세요.

</details>
