---
'title': 'ClickHouse 정부'
'slug': '/cloud/infrastructure/clickhouse-government'
'keywords':
- 'government'
- 'fips'
- 'fedramp'
- 'gov cloud'
'description': 'ClickHouse 정부 제공 개요'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';

## 개요 {#overview}

ClickHouse Government는 ClickHouse Cloud에서 실행되고 ClickHouse Operator로 구성된 동일한 독점 버전의 ClickHouse로 이루어진 자가 배포 가능한 패키지로, 계산 및 스토리지를 분리하고 정부 기관 및 공공 부문 조직의 엄격한 요구 사항을 충족하도록 강화되었습니다. 이 패키지는 S3 호환 스토리지가 있는 Kubernetes 환경에 배포됩니다.

이 패키지는 현재 AWS에서 사용 가능하며, 곧 bare metal 배포가 제공될 예정입니다.

:::note 노트
ClickHouse Government는 정부 기관, 공공 부문 조직 또는 이러한 기관 및 조직에 판매하는 클라우드 소프트웨어 회사를 위해 설계되었으며, 전용 인프라에 대한 완전한 제어 및 관리 기능을 제공합니다. 이 옵션은 [문의하기](https://clickhouse.com/government)를 통해서만 사용할 수 있습니다.
:::

## 오픈소스 대비 장점 {#benefits-over-os}

다음 기능들은 ClickHouse Government를 자가 관리하는 오픈소스 배포와 차별화합니다:

<VerticalStepper headerLevel="h3">

### 향상된 성능 {#enhanced-performance}
- 계산과 저장소의 본질적인 분리
- [공유 머지 트리](/cloud/reference/shared-merge-tree) 및 [웨어하우스](/cloud/reference/warehouses) 기능과 같은 독점 클라우드 기능

### 다양한 사용 사례 및 조건에서 테스트 및 검증됨 {#tested-proven}
- ClickHouse Cloud에서 완전히 테스트되고 검증됨

### 준수 패키지 {#compliance-package}
- 운영 승인(ATO)을 가속화하기 위한 [NIST 위험 관리 프레임워크 (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) 문서

### 새로운 기능이 정기적으로 추가되는 전체 기능 로드맵 {#full-featured-roadmap}
곧 추가될 기능은 다음과 같습니다:
- 자원을 프로그래밍적으로 관리할 수 있는 API
  - 자동 백업
  - 자동 수직 스케일링 작업
- 아이덴티티 공급자 통합

</VerticalStepper>

## 아키텍처 {#architecture}

ClickHouse Government는 배포 환경 내에서 완전히 자급자족하며 Kubernetes 내에서 관리되는 계산과 S3 호환 스토리지 솔루션 내의 스토리지로 구성됩니다.

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government Architecture" background='black'/>

<br />

## 온보딩 프로세스 {#onboarding-process}

고객은 [문의하기](https://clickhouse.com/government)를 통해 온보딩을 시작할 수 있습니다. 자격이 있는 고객에게는 상세한 환경 구축 가이드와 배포를 위한 이미지 및 Helm 차트에 대한 액세스를 제공합니다.

## 일반 요구 사항 {#general-requirements}

이 섹션은 ClickHouse Government를 배포하는 데 필요한 자원에 대한 개요를 제공하기 위한 것입니다. 특정 배포 가이드는 온보딩의 일환으로 제공됩니다. 인스턴스/서버 유형 및 크기는 사용 경우에 따라 다릅니다.

### AWS의 ClickHouse Government {#clickhouse-government-aws}

필요한 자원:
- 이미지를 수신할 [ECR](https://docs.aws.amazon.com/ecr/) 및 Helm 차트
- FIPS 준수 인증서를 생성할 수 있는 인증 기관
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI 드라이버](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [클러스터 오토스케일러](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), 인증을 위한 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 및 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 공급자가 있는 [EKS](https://docs.aws.amazon.com/eks/) 클러스터
- 서버 노드는 Amazon Linux에서 실행됨
- 운영자는 x86 노드 그룹을 요구함
- EKS 클러스터와 같은 지역에 있는 S3 버킷
- 수신이 필요하면 NLB도 구성
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 AWS 역할
