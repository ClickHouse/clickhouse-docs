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

ClickHouse Government는 ClickHouse Cloud에서 실행되는 것과 동일한 독점 버전의 ClickHouse와 ClickHouse Operator로 구성된 자체 배포 패키지입니다. 컴퓨트와 스토리지를 분리하도록 구성되어 있으며, 정부 기관과 공공 부문 조직의 엄격한 요구 사항을 충족할 수 있도록 보안이 강화되어 있습니다.

:::note 참고
ClickHouse Government는 정부 기관, 공공 부문 조직 또는 이러한 기관과 조직에 소프트웨어를 제공하는 클라우드 소프트웨어 기업을 위해 설계되었으며, 전용 인프라에 대한 완전한 제어 및 관리 권한을 제공합니다. 최소 배포 규모는 2 TB입니다. 이 옵션은 [당사에 문의](https://clickhouse.com/government)하는 경우에만 이용할 수 있습니다.
:::

## 오픈 소스 대비 이점 \{#benefits-over-os\}

다음 기능은 ClickHouse Government를 자가 관리형 오픈 소스 배포와 구분합니다:

* 컴퓨트와 스토리지의 네이티브 분리
* [shared merge tree](/cloud/reference/shared-merge-tree) 및 [warehouse](/cloud/reference/warehouses) 기능과 같은 전용 Cloud 기능
* ClickHouse Cloud에서 완전히 테스트되고 검증된 ClickHouse 데이터베이스 및 operator 버전
* 운영 승인(Authorization to Operate, ATO) 절차를 가속하기 위한 [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) 문서
* 백업 및 확장 작업을 포함한 프로그래밍 방식 작업을 위한 API

## Architecture \{#architecture\}

ClickHouse Government는 배포 환경 내에서 완전히 자체 포함형으로 동작하며, 클라우드 네이티브 방식의 컴퓨트와 스토리지 분리를 제공합니다. 

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government Architecture" background='black'/>

<br />

## 지원 구성 \{#supported-configurations\}

ClickHouse Government는 현재 다음 구성으로 지원됩니다.

| 환경  | 오케스트레이션                          | 스토리지                        | 상태    |
| :-- | :------------------------------- | :-------------------------- | :---- |
| AWS | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 사용 가능 |
| GCP | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | 프리뷰   |

## Onboarding process \{#onboarding-process\}

고객은 사용 사례에 적합한 ClickHouse Government를 검토하기 위한 상담을 요청하려면 [당사에 문의](https://clickhouse.com/company/contact?loc=nav)하실 수 있습니다. 최소 규모 요구 사항을 충족하고 지원되는 구성에 배포되는 사용 사례에 한해 검토가 진행됩니다. 온보딩은 제한적으로 제공됩니다. 설치 프로세스에는 AWS ECR에서 다운로드한 이미지와 Helm 차트를 사용하여 ClickHouse를 배포할 대상 환경에 맞는 설치 가이드를 따르는 과정이 포함됩니다.