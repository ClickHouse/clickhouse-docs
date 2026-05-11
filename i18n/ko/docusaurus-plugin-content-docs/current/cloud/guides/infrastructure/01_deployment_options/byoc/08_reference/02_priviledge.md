---
title: 'BYOC 권한'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: '권한'
keywords: ['BYOC', '클라우드', 'bring your own cloud', '권한']
description: '자체 클라우드 인프라스트럭처에 ClickHouse를 배포합니다.'
doc_type: 'reference'
---

## CloudFormation IAM 역할 \{#cloudformation-iam-roles\}

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