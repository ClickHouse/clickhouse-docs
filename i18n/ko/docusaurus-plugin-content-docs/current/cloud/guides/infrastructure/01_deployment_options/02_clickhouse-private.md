---
'title': 'ClickHouse Private'
'slug': '/cloud/infrastructure/clickhouse-private'
'keywords':
- 'private'
- 'on-prem'
'description': 'ClickHouse Private 제공 개요'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';

## 개요 {#overview}

ClickHouse Private는 ClickHouse Cloud에서 실행되는 동일한 독점 버전의 ClickHouse로 구성된 자체 배포 패키지이며, 컴퓨팅과 저장소의 분리를 위해 구성됩니다. 이는 S3 호환 스토리지를 갖춘 Kubernetes 환경에 배포됩니다.

현재 이 패키지는 AWS 및 IBM Cloud에서 사용할 수 있으며, 곧 베어 메탈 배포가 예정되어 있습니다.

:::note 주의
ClickHouse Private는 가장 엄격한 규정 준수 요구 사항이 있는 대규모 기업을 위해 설계되었으며, 전용 인프라에 대한 완전한 제어 및 관리를 제공합니다. 이 옵션은 [저희에게 문의](https://clickhouse.com/company/contact?loc=nav)하여만 이용 가능합니다.
:::

## 오픈 소스에 대한 장점 {#benefits-over-os}

다음 기능은 ClickHouse Private가 자체 관리 오픈 소스 배포와 차별화됩니다:

<VerticalStepper headerLevel="h3">

### 향상된 성능 {#enhanced-performance}
- 컴퓨팅과 저장소의 네이티브 분리
- [공유 머지 트리](/cloud/reference/shared-merge-tree) 및 [창고](/cloud/reference/warehouses) 기능과 같은 독점 클라우드 기능

### 다양한 사용 사례 및 조건에서 테스트 및 검증됨 {#tested-proven-through-variety-of-use-cases}
- ClickHouse Cloud에서 완전히 테스트 및 검증됨

### 새로운 기능이 정기적으로 추가되는 완전한 기능 로드맵 {#full-featured-roadmap}
곧 추가될 기능은 다음과 같습니다:
- 프로그램적으로 리소스를 관리하기 위한 API
  - 자동 백업
  - 자동 수직 스케일링 작업
- ID 공급자 통합

</VerticalStepper>

## 아키텍처 {#architecture}

ClickHouse Private는 배포 환경 내에서 완전히 자급자족하며, Kubernetes 내에서 관리되는 컴퓨팅과 S3 호환 스토리지 솔루션 내의 저장소로 구성됩니다.

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private Architecture" background='black'/>

<br />

## 온보딩 프로세스 {#onboarding-process}

고객은 [저희에게 연락](https://clickhouse.com/company/contact?loc=nav)하여 온보딩을 시작할 수 있습니다. 적격 고객에게는 상세한 환경 구축 가이드와 배포를 위한 이미지 및 Helm 차트에 대한 액세스를 제공합니다.

## 일반 요구 사항 {#general-requirements}

이 섹션은 ClickHouse Private 배포에 필요한 리소스에 대한 개요를 제공합니다. 특정 배포 가이드는 온보딩의 일환으로 제공됩니다. 인스턴스/서버 유형 및 크기는 사용 사례에 따라 다릅니다.

### AWS에서의 ClickHouse Private {#clickhouse-private-aws}

필요한 리소스:
- 이미지를 수신하기 위한 [ECR](https://docs.aws.amazon.com/ecr/)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI 드라이버](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [클러스터 오토스케일러](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 인증을 위한 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 공급자를 갖춘 [EKS](https://docs.aws.amazon.com/eks/) 클러스터
- 서버 노드는 Amazon Linux에서 실행
- 운영자는 x86 노드 그룹 필요
- EKS 클러스터와 동일한 리전 내의 S3 버킷
- 인그레스가 필요한 경우 NLB도 구성
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 AWS 역할

### IBM Cloud에서의 ClickHouse Private {#clickhouse-private-ibm-cloud}

필요한 리소스:
- 이미지를 수신하기 위한 [컨테이너 레지스트리](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started)
- [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model), [VPC용 클라우드 블록 스토리지](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block), [클라우드 DNS](https://www.ibm.com/products/dns), [클러스터 오토스케일러](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)를 갖춘 [클라우드 쿠버네티스 서비스](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- 서버 노드는 Ubuntu에서 실행
- 운영자는 x86 노드 그룹 필요
- [클라우드 오브젝트 스토리지](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)가 클라우드 쿠버네티스 서비스 클러스터와 동일한 리전 내에 있음
- 인그레스가 필요한 경우 NLB도 구성
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 서비스 계정
