---
title: 'AWS 서비스 한도 및 쿼터 관리'
slug: /cloud/reference/byoc/aws-service-limits
sidebar_label: 'AWS 서비스 한도 및 쿼터'
keywords: ['BYOC', 'bring your own cloud', 'AWS', 'service quotas', 'service limits', 'EC2', 'EKS', 'VPC', 'EBS']
description: 'BYOC 온보딩 전에 확인해야 하는 AWS 서비스 쿼터, 증설 요청 방법, 그리고 서비스 확장 시 모니터링해야 할 항목'
doc_type: 'reference'
---

성공적인 BYOC 배포를 위해서는 AWS 계정에 충분한 AWS 서비스 쿼터(이전 명칭: *서비스 한도*)가 있어야 합니다. AWS는 대부분의 서비스에 리전별 기본 쿼터를 적용합니다. 이러한 기본값 중 상당수는, 특히 새로 생성했거나 사용량이 적은 AWS 계정에서는 프로덕션 BYOC 배포에 필요한 수준보다 낮습니다.

이 페이지에서는 배포 전 쿼터 점검표를 제공합니다. 사용량을 모니터링하고, 쿼터 증설은 클라우드 서비스 제공업체와 직접 협의하여 요청하십시오.

## 배포 전 쿼터 점검 목록 \{#pre-deployment-quota-checklist\}

BYOC 온보딩을 시작하기 전에 배포를 계획하는 AWS 리전에서 다음 쿼터를 확인하십시오. 쿼터는 리전 및 계정별로 적용됩니다.

### 필수 쿼터 \{#required-quotas\}

| 서비스                        | 쿼터 이름                                               | BYOC 요구 사항                                                                                | 기본값                     | 조치                                                         |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------- |
| **EC2**                    | 실행 중인 온디맨드 Standard(A, C, D, H, I, M, R, T, Z) 인스턴스 | ≥ 서비스 티어의 피크 vCPU × 1.5(자동 스케일링 및 MBB 업그레이드를 위한 여유분) + 시스템 및 Keeper workload용 100 vCPU 코어 | 신규 계정에서는 보통 32–256 vCPU | BYOC 요구 사항에 맞게 **증액 요청**                                   |
| **EC2 (VPC)**              | 리전당 VPC 수                                           | ≥ 1(BYOC는 전용 VPC 1개를 생성)                                                                  | 5                       | 사용 가능 여부 확인                                                |
| **EC2 (VPC)**              | 리전당 Elastic IP 수                                    | ≥ 3(NAT Gateway용으로 AZ당 1개)                                                                | 5                       | 사용 가능 여부를 확인하십시오. 동일한 리전에서 여러 BYOC 배포를 실행하는 경우 증액을 요청하십시오. |
| **EC2 (VPC)**              | AZ당 NAT Gateway 수                                   | ≥ 1                                                                                       | 5                       | 사용 가능 여부 확인                                                |
| **EC2 (VPC)**              | 리전당 Internet Gateway 수                              | ≥ 1                                                                                       | 5                       | 사용 가능 여부 확인                                                |
| **EC2 (VPC)**              | VPC당 서브넷 수                                          | ≥ 6(퍼블릭 3개 + 프라이빗 3개)                                                                     | 200                     | 조치 없음                                                      |
| **EC2 (VPC)**              | VPC당 보안 그룹 수                                        | ≥ 10                                                                                      | 2,500                   | 조치 없음                                                      |
| **EKS**                    | 리전당 클러스터 수                                          | ≥ 1                                                                                       | 100                     | 조치 없음                                                      |
| **EKS**                    | 클러스터당 관리형 노드 그룹 수                                   | ≥ 4                                                                                       | 30                      | 조치 없음                                                      |
| **EKS**                    | 관리형 노드 그룹당 노드 수                                     | ≥ 서비스 티어의 피크 노드 수                                                                         | 450                     | 조치 없음                                                      |
| **S3**                     | 계정당 버킷 수                                            | ≥ 4(데이터, 백업, 과금, 모니터링)                                                                    | 100(최대 1,000까지 증액 가능)   | 다른 workload를 위한 여유분 확인                                     |
| **EBS**                    | 범용 SSD(gp3) 스토리지                                    | ≥ 최대 ClickHouse 로그 + OS 볼륨 × 노드 수                                                         | 50 TiB                  | 사용 가능 여부 확인                                                |
| **Elastic Load Balancing** | 리전당 Network Load Balancer 수                         | ClickHouse 서비스당 ≥ 1                                                                       | 50                      | 사용 가능 여부 확인                                                |
| **CloudWatch Logs**        | 리전당 로그 그룹 수                                         | ≥ 5                                                                                       | 1,000,000               | 조치 없음                                                      |

### 선택적 기능 활성화 여부를 확인하기 위한 쿼터 \{#optional-feature-quotas\}

| 활성화된 기능         | 서비스       | 쿼터                                                                        |
| --------------- | --------- | ------------------------------------------------------------------------- |
| AWS PrivateLink | EC2 (VPC) | 리전별 VPC 엔드포인트 서비스 수(기본값 20) — 동시에 PrivateLink가 활성화된 각 서비스에 대해 증설을 요청하십시오. |
| VPC Peering     | EC2 (VPC) | VPC별 활성 VPC 피어링 연결 수(기본값 50).                                             |

## 관련 \{#related\}

* [청구 대상 AWS 서비스](/cloud/reference/byoc/billable-aws-services) — BYOC에서 프로비저닝하는 AWS 서비스의 전체 목록
* [BYOC 비용 모델 (AWS)](/cloud/reference/byoc/cost-model-aws) — ClickHouse Cloud와 AWS 요금이 어떻게 합산되는지
* [BYOC 아키텍처](/cloud/reference/byoc/architecture) — ClickHouse Cloud가 사용자 계정에 배포하는 구성 요소