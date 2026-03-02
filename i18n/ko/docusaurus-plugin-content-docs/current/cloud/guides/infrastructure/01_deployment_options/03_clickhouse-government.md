---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['정부', 'fips', 'fedramp', 'Government Cloud']
description: 'ClickHouse Government 서비스 개요'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 개요 \{#overview\}

ClickHouse Government는 ClickHouse Cloud에서 실행되는 것과 동일한 독점 버전의 ClickHouse와 ClickHouse Operator로 구성된 자체 배포 패키지입니다. 컴퓨트와 스토리지를 분리하도록 구성되어 있으며, 정부 기관과 공공 부문 조직의 엄격한 요구 사항을 충족할 수 있도록 보안이 강화되어 있습니다. Kubernetes 환경에 S3 호환 스토리지와 함께 배포됩니다.

이 패키지는 현재 AWS 환경에서 사용할 수 있으며, 베어 메탈 배포는 곧 제공될 예정입니다.

:::note 참고
ClickHouse Government는 정부 기관, 공공 부문 조직 또는 이러한 기관과 조직에 소프트웨어를 제공하는 클라우드 소프트웨어 기업을 위해 설계되었으며, 전용 인프라에 대한 완전한 제어 및 관리 권한을 제공합니다. 이 옵션은 [당사로 문의](https://clickhouse.com/government)하는 경우에만 이용할 수 있습니다.
:::



## 오픈 소스 대비 이점 \{#benefits-over-os\}

다음 기능은 ClickHouse Government를 자가 관리형 오픈 소스 배포와 구분합니다:

<VerticalStepper headerLevel="h3">

### 향상된 성능 \{#enhanced-performance\}
- 컴퓨트와 스토리지의 네이티브 분리
- [shared merge tree](/cloud/reference/shared-merge-tree) 및 [warehouse](/cloud/reference/warehouses) 기능과 같은 전용 Cloud 기능

### 다양한 사용 사례와 조건을 통해 검증된 안정성 \{#tested-proven\}
- ClickHouse Cloud에서 완전하게 테스트되고 검증되었습니다.

### 컴플라이언스 패키지 \{#compliance-package\}
- 운영 승인(Authorization to Operate, ATO) 절차를 가속하기 위한 [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) 문서

### 풍부한 기능을 갖춘 로드맵 및 정기적인 신규 기능 추가 \{#full-featured-roadmap\}
곧 제공될 추가 기능은 다음과 같습니다:
- 리소스를 프로그래밍 방식으로 관리하기 위한 API
  - 자동 백업
  - 자동 수직 확장 작업
- ID 공급자(IdP) 통합

</VerticalStepper>



## 아키텍처 \{#architecture\}

ClickHouse Government는 배포 환경 내에서 완전히 자체 포함형으로 동작하며, Kubernetes에서 관리되는 컴퓨팅 리소스와 S3 호환 스토리지 솔루션의 스토리지로 구성됩니다.

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government Architecture" background='black'/>

<br />



## 온보딩 프로세스 \{#onboarding-process\}

고객은 [저희에게](https://clickhouse.com/government) 문의하여 온보딩을 시작할 수 있습니다. 자격을 충족하는 고객에게는 상세한 환경 구축 가이드와 배포를 위한 이미지 및 Helm 차트에 대한 접근 권한을 제공합니다.



## 일반 요구 사항 \{#general-requirements\}

이 섹션에서는 ClickHouse Government를 배포하는 데 필요한 리소스에 대한 개요를 제공합니다. 구체적인 배포 가이드는 온보딩 과정의 일부로 제공됩니다. 인스턴스/서버 유형과 크기는 사용 사례에 따라 달라집니다.

### AWS에서의 ClickHouse Government \{#clickhouse-government-aws\}

필요한 리소스:
- 이미지를 수신하고 Helm 차트를 저장하기 위한 [ECR](https://docs.aws.amazon.com/ecr/)
- FIPS 규격을 준수하는 인증서를 발급할 수 있는 인증 기관(CA)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), 인증용 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html), [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 제공자가 구성된 [EKS](https://docs.aws.amazon.com/eks/) 클러스터
- Amazon Linux를 실행하는 서버 노드
- Operator용 x86 노드 그룹
- EKS 클러스터와 동일한 리전에 있는 S3 버킷
- 인그레스가 필요한 경우 NLB도 구성
- clickhouse-server/keeper 작업을 위한 ClickHouse 클러스터당 하나의 AWS IAM 역할
