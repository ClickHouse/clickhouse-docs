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

ClickHouse Private는 ClickHouse Cloud에서 실행되는 것과 동일한 독점 ClickHouse 버전과, 컴퓨트와 스토리지 분리를 위해 구성된 ClickHouse 오퍼레이터로 이루어진 자가 배포 패키지입니다. 

:::note 참고
ClickHouse Private는 전용 인프라에 대한 완전한 제어가 필요하고 2 TB를 초과하는 메모리를 사용하는 대기업을 위해 설계되었습니다. 고객은 모든 인프라를 직접 관리해야 하며, 대규모 ClickHouse 운영에 대한 지식을 갖추고 있어야 합니다. 이 옵션은 [문의](https://clickhouse.com/company/contact?loc=nav)를 통해서만 이용할 수 있습니다.
:::

## 오픈 소스 대비 이점 \{#benefits-over-os\}

다음과 같은 기능으로 ClickHouse Private는 자가 관리형 오픈 소스 배포와 차별화됩니다:

* 컴퓨트와 스토리지의 네이티브 분리
* [shared merge tree](/cloud/reference/shared-merge-tree) 및 [warehouse](/cloud/reference/warehouses) 기능과 같은 독점 Cloud 기능
* ClickHouse 데이터베이스와 오퍼레이터 버전은 ClickHouse Cloud에서 철저히 테스트 및 검증되었습니다
* 백업 및 확장 작업을 포함한 프로그래밍 방식 작업을 위한 API

## 아키텍처 \{#architecture\}

ClickHouse Private는 배포 환경 내에 완전히 독립적으로 구성되며, ClickHouse의 Cloud 네이티브 컴퓨트와 스토리지 분리를 제공합니다. 

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private 아키텍처" background='black'/>

<br />

## 지원되는 구성 \{#supported-configurations\}

ClickHouse Private는 현재 다음 구성에서 지원됩니다.

| 환경    | 오케스트레이션                          | 스토리지                        | 상태    |
| :---- | :------------------------------- | :-------------------------- | :---- |
| AWS   | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 사용 가능 |
| GCP   | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | 프리뷰   |
| 베어 메탈 | Kubernetes                       | AIStor (NVMe 필요)            | 프리뷰   | 

## 온보딩 절차 \{#onboarding-process\}

고객은 사용 사례에 대한 ClickHouse Private 검토 통화를 요청하려면 [문의](https://clickhouse.com/company/contact?loc=nav)하실 수 있습니다. 최소 규모 요구 사항을 충족하고 지원되는 구성에 배포되는 사용 사례에 한해 검토가 진행됩니다. 온보딩은 제한적으로 제공됩니다. 설치 프로세스에는 AWS ECR에서 다운로드한 이미지와 Helm 차트를 사용하여 ClickHouse를 배포할 대상 환경에 맞는 설치 가이드를 따르는 과정이 포함됩니다.