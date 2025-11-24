---
'title': 'AWS용 BYOC 온보딩'
'slug': '/cloud/reference/byoc/onboarding/aws'
'sidebar_label': 'AWS'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
- 'AWS'
'description': '자신의 클라우드 인프라에서 ClickHouse 배포하기'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## 온보딩 프로세스 {#onboarding-process}

고객은 [우리에](https://clickhouse.com/cloud/bring-your-own-cloud) 문의하여 온보딩 프로세스를 시작할 수 있습니다. 고객은 전용 AWS 계정을 보유하고 사용할 지역을 알아야 합니다. 현재 ClickHouse Cloud에 대해 지원하는 지역에서만 BYOC 서비스를 시작할 수 있습니다.

### AWS 계정 준비하기 {#prepare-an-aws-account}

고객은 ClickHouse BYOC 배포를 호스팅하기 위해 전용 AWS 계정을 준비할 것을 권장합니다. 이는 더 나은 격리를 보장하기 위함입니다. 그러나 공유 계정 및 기존 VPC를 사용하는 것도 가능합니다. 아래의 *BYOC 인프라 설정*에서 자세한 내용을 확인하십시오.

이 계정과 초기 조직 관리자 이메일로 ClickHouse 지원에 문의할 수 있습니다.

### BYOC 설정 초기화 {#initialize-byoc-setup}

초기 BYOC 설정은 CloudFormation 템플릿이나 Terraform 모듈을 사용하여 수행할 수 있습니다. 두 접근 방식 모두 동일한 IAM 역할을 생성하여 ClickHouse Cloud의 BYOC 컨트롤러가 인프라를 관리할 수 있도록 합니다. ClickHouse를 실행하는 데 필요한 S3, VPC 및 컴퓨팅 리소스는 이 초기 설정에 포함되지 않는 점에 유의하십시오.

#### CloudFormation 템플릿 {#cloudformation-template}

[BYOC CloudFormation 템플릿](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Terraform 모듈 {#terraform-module}

[BYOC Terraform 모듈](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### BYOC 인프라 설정 {#setup-byoc-infrastructure}

CloudFormation 스택을 생성한 후, 클라우드 콘솔에서 S3, VPC 및 EKS 클러스터를 포함한 인프라를 설정하라는 메시지가 표시됩니다. 이 단계에서 특정 구성 사항을 결정해야 하며, 나중에 변경할 수 없습니다. 구체적으로:

- **사용할 지역**: ClickHouse Cloud에 대해 우리가 지원하는 모든 [공용 지역](/cloud/reference/supported-regions) 중 하나를 선택할 수 있습니다.
- **BYOC에 대한 VPC CIDR 범위**: 기본적으로 BYOC VPC CIDR 범위에 `10.0.0.0/16`을 사용합니다. 다른 계정과 VPC 피어링을 계획하는 경우 CIDR 범위가 겹치지 않도록 해야 합니다. BYOC를 위한 적절한 CIDR 범위를 할당하며, 최소 크기는 `/22` 이상이어야 합니다.
- **BYOC VPC의 가용성 영역**: VPC 피어링을 사용할 계획이 있는 경우 소스 계정과 BYOC 계정 간의 가용성 영역을 맞추는 것이 교차 AZ 트래픽 비용을 줄이는데 도움이 될 수 있습니다. AWS에서 가용성 영역 접미사(`a, b, c`)는 계정별로 다른 물리적 영역 ID를 나타낼 수 있습니다. 자세한 내용은 [AWS 가이드](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)를 참조하십시오.

#### 고객 관리 VPC {#customer-managed-vpc}
기본적으로 ClickHouse Cloud는 BYOC 배포를 위한 더 나은 격리를 제공하기 위해 전용 VPC를 프로비저닝합니다. 그러나 기존 계정의 VPC를 사용할 수도 있습니다. 이는 특정 구성 세팅을 요구하며 ClickHouse 지원 팀과 조정해야 합니다.

**기존 VPC 구성**
1. ClickHouse Cloud에서 사용할 수 있도록 3개의 서로 다른 가용성 영역에 걸쳐 최소 3개의 프라이빗 서브넷을 할당합니다.
2. 각 서브넷은 ClickHouse 배포에 대한 충분한 IP 주소를 제공하기 위해 최소 CIDR 범위 `/23` (예: 10.0.0.0/23)을 가져야 합니다.
3. 각 서브넷에 태그 `kubernetes.io/role/internal-elb=1`을 추가하여 적절한 로드 밸런서 구성을 활성화합니다.

<br />

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC Subnet" background='black'/>

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC Subnet Tags" background='black'/>

<br />

4. S3 게이트웨이 엔드포인트 구성
VPC에 이미 S3 게이트웨이 엔드포인트가 구성되어 있지 않은 경우, VPC와 Amazon S3 간의 안전하고 비공식적인 통신을 활성화하기 위해 하나를 생성해야 합니다. 이 엔드포인트는 ClickHouse 서비스가 공용 인터넷을 거치지 않고 S3에 접근할 수 있도록 합니다. 아래 스크린샷을 참조하여 구성 예시를 확인하십시오.

<br />

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" background='black'/>

<br />

**ClickHouse 지원에 문의**  
아래의 정보를 포함하여 지원 티켓을 생성합니다:

* 귀하의 AWS 계정 ID
* 서비스를 배포하려는 AWS 지역
* 귀하의 VPC ID
* ClickHouse에 할당한 프라이빗 서브넷 ID
* 이러한 서브넷이 위치한 가용성 영역

### 선택 사항: VPC 피어링 설정 {#optional-setup-vpc-peering}

ClickHouse BYOC에 대한 VPC 피어링을 생성하거나 삭제하려면 다음 단계를 따릅니다:

#### 단계 1: ClickHouse BYOC에 대한 프라이빗 로드 밸런서 활성화 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Private Load Balancer를 활성화하기 위해 ClickHouse 지원에 문의합니다.

#### 단계 2: 피어링 연결 생성 {#step-2-create-a-peering-connection}
1. ClickHouse BYOC 계정의 VPC 대시보드로 이동합니다.
2. 피어링 연결을 선택합니다.
3. 피어링 연결 생성을 클릭합니다.
4. VPC 요청자를 ClickHouse VPC ID로 설정합니다.
5. VPC 수락자를 대상 VPC ID로 설정합니다. (적용 가능한 경우 다른 계정을 선택)
6. 피어링 연결 생성을 클릭합니다.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

<br />

#### 단계 3: 피어링 연결 요청 수락 {#step-3-accept-the-peering-connection-request}
피어링 계정으로 이동하여 (VPC -> Peering connections -> Actions -> Accept request) 페이지에서 고객이 이 VPC 피어링 요청을 승인할 수 있습니다.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

<br />

#### 단계 4: ClickHouse VPC 라우트 테이블에 대상 추가 {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOC 계정에서,
1. VPC 대시보드에서 라우트 테이블을 선택합니다.
2. ClickHouse VPC ID를 검색합니다. 프라이빗 서브넷에 연결된 각 라우트 테이블을 편집합니다.
3. 라우트 탭 아래의 편집 버튼을 클릭합니다.
4. 다른 라우트를 추가를 클릭합니다.
5. 대상을 위해 대상 VPC의 CIDR 범위를 입력합니다.
6. "Peering Connection" 및 피어링 연결의 ID를 대상으로 선택합니다.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

<br />

#### 단계 5: 대상 VPC 라우트 테이블에 대상 추가 {#step-5-add-destination-to-the-target-vpc-route-tables}
피어링 AWS 계정에서,
1. VPC 대시보드에서 라우트 테이블을 선택합니다.
2. 대상 VPC ID를 검색합니다.
3. 라우트 탭 아래의 편집 버튼을 클릭합니다.
4. 다른 라우트를 추가를 클릭합니다.
5. 대상을 위해 ClickHouse VPC의 CIDR 범위를 입력합니다.
6. "Peering Connection" 및 피어링 연결의 ID를 대상으로 선택합니다.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

<br />

#### 단계 6: 피어링된 VPC 접근을 허용하도록 보안 그룹 편집 {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOC 계정에서, 피어링된 VPC에서 트래픽을 허용하도록 보안 그룹 설정을 업데이트해야 합니다. 귀하의 피어링된 VPC의 CIDR 범위를 포함하는 인바운드 규칙 추가를 요청하려면 ClickHouse 지원에 문의하십시오.

---
이제 ClickHouse 서비스에 피어링된 VPC에서 접근할 수 있어야 합니다.

ClickHouse에 사적으로 접근하기 위해, 사용자의 피어링된 VPC에서 안전한 연결을 위해 프라이빗 로드 밸런서와 엔드포인트가 프로비저닝됩니다. 프라이빗 엔드포인트는 공개 엔드포인트 형식을 따르며 `-private` 접미사가 붙습니다. 예를 들어:
- **공개 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **프라이빗 엔드포인트**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

선택적으로, 피어링이 작동하는지 확인한 후 ClickHouse BYOC에 대한 공개 로드 밸런서 제거를 요청할 수 있습니다.

## 업그레이드 프로세스 {#upgrade-process}

우리는 ClickHouse 데이터베이스 버전 업그레이드, ClickHouse Operator, EKS 및 기타 구성 요소를 포함하여 소프트웨어를 정기적으로 업그레이드합니다.

매끄러운 업그레이드(예: 롤링 업그레이드 및 재시작)를 목표로 하고 있지만, ClickHouse 버전 변경 및 EKS 노드 업그레이드와 같은 몇몇 업그레이드는 서비스에 영향을 미칠 수 있습니다. 고객은 유지 관리 창(예: 매주 화요일 오전 1:00 PDT)을 지정할 수 있으며, 이러한 업그레이드는 예정된 시간 동안만 발생하도록 할 수 있습니다.

:::note
유지 관리 창은 보안 및 취약성 수정에 적용되지 않습니다. 이러한 수정 사항은 오프 사이클 업그레이드로 처리되며, 적시에 커뮤니케이션하여 적절한 시간에 조정하고 운영 영향을 최소화합니다.
:::

## CloudFormation IAM 역할 {#cloudformation-iam-roles}

### 부트스트랩 IAM 역할 {#bootstrap-iam-role}

부트스트랩 IAM 역할에는 다음 권한이 포함됩니다:

- **EC2 및 VPC 작업**: VPC 및 EKS 클러스터 설정에 필요합니다.
- **S3 작업 (예: `s3:CreateBucket`)**: ClickHouse BYOC 저장소를 위한 버킷 생성을 위해 필요합니다.
- **`route53:*` 권한**: Route 53에서 레코드 구성을 위한 외부 DNS에 필요합니다.
- **IAM 작업 (예: `iam:CreatePolicy`)**: 컨트롤러가 추가 역할을 생성하는 데 필요합니다 (자세한 내용은 다음 섹션 참조).
- **EKS 작업**: `clickhouse-cloud` 접두사로 시작하는 이름을 가진 리소스에만 제한됩니다.

### 컨트롤러가 생성하는 추가 IAM 역할 {#additional-iam-roles-created-by-the-controller}

CloudFormation을 통해 생성된 `ClickHouseManagementRole` 외에도, 컨트롤러는 여러 개의 추가 역할을 생성합니다.

이 역할들은 고객의 EKS 클러스터 내에서 실행되는 애플리케이션에 의해 가정됩니다:
- **상태 내보내기 역할**
  - ClickHouse 클라우드에 서비스 건강 정보를 보고하는 ClickHouse 구성 요소입니다.
  - ClickHouse Cloud가 소유하는 SQS 큐에 기록할 권한이 필요합니다.
- **로드 밸런서 컨트롤러**
  - 표준 AWS 로드 밸런서 컨트롤러입니다.
  - ClickHouse 서비스용 볼륨을 관리하기 위한 EBS CSI 컨트롤러입니다.
- **External-DNS**
  - Route 53에 DNS 구성을 전파합니다.
- **Cert-Manager**
  - BYOC 서비스 도메인을 위한 TLS 인증서를 프로비저닝합니다.
- **클러스터 오토스케일러**
  - 필요에 따라 노드 그룹 크기를 조정합니다.

**K8s-control-plane** 및 **k8s-worker** 역할은 AWS EKS 서비스에 의해 가정되도록 설계되었습니다.

마지막으로, **`data-plane-mgmt`**는 ClickHouse Cloud 제어 평면 구성 요소가 `ClickHouseCluster` 및 Istio Virtual Service/Gateway와 같은 필요한 사용자 정의 리소스를 조정할 수 있도록 허용합니다.

## 네트워크 경계 {#network-boundaries}

이 섹션에서는 고객 BYOC VPC로의 다양한 네트워크 트래픽을 다룹니다:

- **인바운드**: 고객 BYOC VPC로 들어오는 트래픽.
- **아웃바운드**: 고객 BYOC VPC에서 시작되어 외부 대상으로 전송되는 트래픽.
- **공용**: 공용 인터넷에서 접근 가능한 네트워크 엔드포인트.
- **사적**: VPC 피어링, VPC Private Link 또는 Tailscale와 같은 사적 연결을 통해서만 접근 가능한 네트워크 엔드포인트.

**Istio 인그레스는 ClickHouse 클라이언트 트래픽을 수용하기 위해 AWS NLB 뒤에 배포됩니다.**

*인바운드, 공용 (사적일 수 있음)*

Istio 인그레스 게이트웨이는 TLS를 종료합니다. 인증서는 CertManager가 Let's Encrypt로 제공하며, EKS 클러스터 내에서 비밀로 저장됩니다. Istio와 ClickHouse 간의 트래픽은 [AWS에 의해](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) 암호화됩니다. 동일한 VPC 내에 있기 때문입니다.

기본적으로 인그레스는 IP 허용 목록 필터링과 함께 공개적으로 접근할 수 있습니다. 고객은 VPC 피어링을 구성하여 사적으로 만들고 공용 연결을 비활성화할 수 있습니다. 액세스를 제한하기 위해 [IP 필터](/cloud/security/setting-ip-filters)를 설정할 것을 강력히 권장합니다.

### 접근 문제 해결 {#troubleshooting-access}

*인바운드, 공용 (사적일 수 있음)*

ClickHouse Cloud 엔지니어는 Tailscale을 통해 문제 해결 접근이 필요합니다. 그들은 BYOC 배포를 위해 적시에 인증서 기반 인증이 제공됩니다.

### 청구 스크랩퍼 {#billing-scraper}

*아웃바운드, 사적*

청구 스크랩퍼는 ClickHouse에서 청구 데이터를 수집하여 ClickHouse Cloud가 소유하는 S3 버킷으로 전송합니다.

이는 ClickHouse 서버 컨테이너와 함께 사이드카 형태로 실행되며, 주기적으로 CPU 및 메모리 메트릭을 스크랩합니다. 동일한 지역 내의 요청은 VPC 게이트웨이 서비스 엔드포인트를 통해 라우팅됩니다.

### 경고 {#alerts}

*아웃바운드, 공용*

AlertManager는 고객의 ClickHouse 클러스터가 비정상일 때 ClickHouse Cloud에 경고를 전송하도록 구성됩니다.

메트릭과 로그는 고객의 BYOC VPC 내에 저장됩니다. 로그는 현재 EBS에 로컬 저장됩니다. 향후 업데이트에서는 로그가 BYOC VPC 내의 ClickHouse 서비스인 LogHouse에 저장될 예정입니다. 메트릭은 Prometheus 및 Thanos 스택을 사용하며, BYOC VPC 내에 로컬로 저장됩니다.

### 서비스 상태 {#service-state}

*아웃바운드*

상태 내보내기 도구는 ClickHouse 서비스 상태 정보를 ClickHouse Cloud가 소유하는 SQS에 전송합니다.
