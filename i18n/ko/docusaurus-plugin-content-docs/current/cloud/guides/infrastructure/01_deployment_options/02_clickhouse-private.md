---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'ClickHouse Private 오퍼링 개요'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 개요 \{#overview\}

ClickHouse Private는 ClickHouse Cloud에서 실행되는 것과 동일한 독점 ClickHouse 버전과, 컴퓨트와 스토리지 분리를 위해 구성된 ClickHouse Operator로 이루어진 자가 배포 패키지입니다. 이 패키지는 S3 호환 스토리지를 사용하는 Kubernetes 환경에 배포됩니다.

이 패키지는 현재 AWS와 IBM Cloud에서 사용할 수 있으며, 베어 메탈 배포는 곧 제공될 예정입니다.

:::note 참고
ClickHouse Private는 가장 엄격한 규정 준수(compliance) 요구 사항을 가진 대기업을 위해 설계되었으며, 전용 인프라에 대한 완전한 제어와 관리를 제공합니다. 이 옵션은 [문의](https://clickhouse.com/company/contact?loc=nav)를 통해서만 이용할 수 있습니다.
:::



## 오픈 소스 대비 이점 \{#benefits-over-os\}

다음과 같은 기능으로 ClickHouse Private는 자가 관리형 오픈 소스 배포와 차별화됩니다:

<VerticalStepper headerLevel="h3">

### 향상된 성능 \{#enhanced-performance\}
- 컴퓨트와 스토리지의 네이티브 분리
- [shared merge tree](/cloud/reference/shared-merge-tree) 및 [warehouse](/cloud/reference/warehouses) 기능과 같은 독점 Cloud 기능

### 다양한 사용 사례와 조건을 통해 검증된 안정성 \{#tested-proven-through-variety-of-use-cases\}
- ClickHouse Cloud에서 철저히 테스트되고 검증되었습니다

### 정기적으로 새로운 기능이 추가되는 완전한 로드맵 \{#full-featured-roadmap\}
곧 제공될 추가 기능은 다음과 같습니다:
- 리소스를 프로그래밍 방식으로 관리하기 위한 API
  - 자동 백업
  - 자동 수직 확장 작업
- IdP(Identity Provider) 통합

</VerticalStepper>



## 아키텍처 \{#architecture\}

ClickHouse Private는 배포 환경 내에 완전히 독립적으로 구성되며, Kubernetes에서 관리되는 컴퓨트 리소스와 S3 호환 스토리지 솔루션의 스토리지로 이루어져 있습니다.

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private 아키텍처" background='black'/>

<br />



## 온보딩 프로세스 \{#onboarding-process\}

고객은 [문의 페이지](https://clickhouse.com/company/contact?loc=nav)를 통해 온보딩을 시작할 수 있습니다. 요건을 충족하는 고객에게는 상세한 환경 구축 가이드와 배포를 위한 이미지 및 Helm 차트에 대한 접근 권한을 제공합니다.



## 일반적인 요구 사항 \{#general-requirements\}

이 섹션은 ClickHouse Private를 배포하는 데 필요한 리소스에 대한 개요를 제공합니다. 구체적인 배포 가이드는 온보딩 과정의 일부로 제공됩니다. 인스턴스/서버 유형과 크기는 사용 사례에 따라 달라집니다.

### AWS에서 ClickHouse Private \{#clickhouse-private-aws\}

필요한 리소스:
- 이미지와 Helm 차트를 저장하기 위한 [ECR](https://docs.aws.amazon.com/ecr/)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), 인증을 위한 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html), [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 제공자가 설정된 [EKS](https://docs.aws.amazon.com/eks/) 클러스터
- Amazon Linux를 실행하는 서버 노드
- 오퍼레이터용 x86 노드 그룹
- EKS 클러스터와 동일한 리전에 있는 S3 버킷
- 인그레스가 필요한 경우 NLB도 구성해야 합니다.
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 AWS 역할

### IBM Cloud에서 ClickHouse Private \{#clickhouse-private-ibm-cloud\}

필요한 리소스:
- 이미지와 Helm 차트를 저장하기 위한 [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started)
- [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model), [Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block), [Cloud DNS](https://www.ibm.com/products/dns), [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)가 설정된 [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- Ubuntu를 실행하는 서버 노드
- 오퍼레이터용 x86 노드 그룹
- Cloud Kubernetes Service 클러스터와 동일한 리전에 있는 [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)
- 인그레스가 필요한 경우 NLB도 구성해야 합니다.
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 서비스 계정
