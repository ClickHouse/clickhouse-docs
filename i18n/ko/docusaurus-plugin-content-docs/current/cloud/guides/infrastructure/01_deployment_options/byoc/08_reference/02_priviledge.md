---
title: 'BYOC 권한'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: '권한'
keywords: ['BYOC', '클라우드', 'bring your own cloud', '권한']
description: '자체 클라우드 인프라스트럭처에 ClickHouse를 배포합니다.'
doc_type: 'reference'
---

## AWS IAM 역할 \{#aws-iam-roles\}

### Bootstrap IAM 역할 \{#bootstrap-iam-role\}

Bootstrap IAM 역할에는 다음과 같은 권한이 있습니다.

- **EC2 및 VPC 작업**: VPC 및 EKS 클러스터를 설정하는 데 필요합니다.
- **S3 작업(예: `s3:CreateBucket`)**: ClickHouse BYOC 스토리지를 위한 S3 버킷을 생성하는 데 필요합니다.
- **IAM 작업(예: `iam:CreatePolicy`)**: 컨트롤러에서 추가 IAM 역할을 생성하는 데 필요합니다(자세한 내용은 다음 섹션을 참조하십시오).
- **EKS 작업**: 이름이 `clickhouse-cloud` 접두사로 시작하는 리소스로만 제한됩니다.

### 컨트롤러에 의해 생성되는 추가 IAM 역할 \{#additional-iam-roles-created-by-the-controller\}

CloudFormation을 통해 생성되는 `ClickHouseManagementRole` 외에도, 컨트롤러는 여러 개의 추가 IAM 역할을 생성합니다.

이러한 역할은 고객의 EKS 클러스터 내에서 실행되는 애플리케이션이 assume 하도록 되어 있습니다.

- **State Exporter Role**
  - 서비스 상태 정보를 ClickHouse Cloud에 보고하는 ClickHouse 컴포넌트입니다.
  - ClickHouse Cloud가 소유한 SQS 큐에 기록할 수 있는 권한이 필요합니다.
- **Load-Balancer Controller**
  - 표준 AWS 로드 밸런서 컨트롤러입니다.
  - ClickHouse 서비스용 볼륨을 관리하는 EBS CSI 컨트롤러입니다.
- **External-DNS**
  - DNS 구성을 Route 53으로 전파합니다.
- **Cert-Manager**
  - BYOC 서비스 도메인에 대한 TLS 인증서를 프로비저닝합니다.
- **Cluster Autoscaler**
  - 필요에 따라 노드 그룹 크기를 조정합니다.

**K8s-control-plane** 및 **k8s-worker** 역할은 AWS EKS 서비스가 assume 하도록 설계되었습니다.

마지막으로, **`data-plane-mgmt`**는 ClickHouse Cloud 컨트롤 플레인 컴포넌트가 `ClickHouseCluster` 및 Istio Virtual Service/Gateway와 같은 필요한 커스텀 리소스를 조율(reconcile)할 수 있도록 합니다.

## GCP 서비스 계정 \{#gcp-service-accounts\}

### Bootstrap 서비스 계정 \{#bootstrap-service-account\}

Bootstrap 서비스 계정에는 다음 권한을 포함하는 프로젝트 범위의 사용자 지정 역할이 부여됩니다:

* **Common**: 기본적인 읽기 및 아이덴티티 권한입니다.
* **VPC**: BYOC 인프라를 호스팅하는 VPC, 서브넷, 라우팅, Private Service Connect 연결을 관리합니다.
* **Cluster**: GKE 클러스터와 클러스터 내 리소스를 관리합니다.
* **Storage**: ClickHouse 백업, 공유 상태, 모니터링 데이터에 사용되는 Cloud Storage 버킷을 관리합니다.
* **IAM Role**: 프로젝트 내의 서비스 계정과 사용자 지정 역할을 관리합니다. 이 역할에는 서비스 계정 키 생성, 조직 정책 바인딩, 또는 다른 프로젝트의 리소스에 대한 작업 권한은 포함되지 않습니다.

### 컨트롤러가 생성하는 추가 서비스 계정 \{#additional-service-accounts-created-by-the-controller\}

온보딩 과정에서 Terraform을 통해 생성된 `clickhouse-management` 서비스 계정 외에도, 첫 번째 BYOC 서비스를 프로비저닝하면 ClickHouse의 컨트롤 플레인(`clickhouse-management`로 인증)이 프로젝트 내 특정 인클러스터 워크로드용 추가 서비스 계정을 생성합니다. 각 서비스 계정은 제한된 단일 목적 권한 집합으로 생성됩니다.

* **GKE 노드 런타임 아이덴티티**
  * BYOC 클러스터의 모든 GKE 노드 가상 머신에 연결됩니다.
  * 큐블릿, 노드 로컬 에이전트, Cloud Operations collector가 로그와 메트릭을 내보내는 데 사용되며, 이미지 풀링 하위 시스템이 컨테이너 이미지를 다운로드하는 데도 사용됩니다.
* **청구 스크레이퍼 아이덴티티**
  * 독립 실행형 스크레이퍼 워크로드가 청구 telemetry를 수집하는 데 사용됩니다.
* **모니터링 아이덴티티**
  * 클러스터에서 실행되는 모니터링 스택의 대상 아이덴티티로 사용됩니다. 이 배포 전용 GCS 버킷의 장기 메트릭 스토리지를 읽고 쓰는 데 사용됩니다.
* **ClickHouse 런타임 관리 아이덴티티**
  * Private Service Connect endpoint 관리, 버킷 수명 주기 조정, 서비스 계정 교체와 같은 Day-2 운영 작업을 처리하는 ClickHouse의 런타임 데이터 플레인 관리 컨트롤러에서 사용됩니다.