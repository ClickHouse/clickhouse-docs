---
title: '과금 대상 AWS 서비스'
slug: /cloud/reference/byoc/billable-aws-services
sidebar_label: '과금 대상 AWS 서비스'
keywords: ['BYOC', 'bring your own cloud', 'AWS', '청구', '비용', 'EKS', 'EC2', 'S3', 'NAT Gateway', 'PrivateLink']
description: 'ClickHouse BYOC가 프로비저닝하는 AWS 서비스를 필수 및 선택 항목으로 분류하고, 이 중 어떤 서비스가 AWS 요금에 포함되는지 설명합니다'
doc_type: 'reference'
---

ClickHouse BYOC는 AWS 계정에 독립적으로 구성된 데이터 플레인(data plane)을 프로비저닝합니다. 이 페이지에서는 배포에 사용되는 모든 AWS 서비스를 나열하고, 각 서비스를 필수 또는 선택 항목으로 분류하며, 이 중 어떤 서비스가 AWS 요금에 포함되는지 설명합니다.

:::note
AWS 인프라 비용은 AWS에서 계정으로 직접 청구되며, ClickHouse Cloud 구독과는 별개입니다.
:::

## 필수 서비스 \{#mandatory-services\}

다음 서비스는 모든 BYOC 배포에서 프로비저닝됩니다.

| 서비스                                                            | 용도                                                                                                                                                                      | 비용 청구 여부                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Amazon EKS**                                                 | ClickHouse 데이터 플레인을 실행하는 관리형 Kubernetes 컨트롤 플레인입니다.                                                                                                                     | 예 — 클러스터-시간당                  |
| **Amazon EC2** (EKS 관리형 노드 그룹을 통한 워커 인스턴스)                     | ClickHouse 서버 파드, ClickHouse Keeper, 플랫폼 애드온을 위한 컴퓨트입니다. 기본적으로 메모리 최적화 인스턴스 패밀리를 사용합니다.                                                                                 | 예 — 인스턴스-시간당                  |
| **Amazon EBS** (gp3 볼륨)                                        | 노드 OS, 컨테이너 이미지, ClickHouse 서버 로그를 위한 로컬 스토리지입니다.                                                                                                                       | 예 — GB-월당 + IOPS/처리량          |
| **Amazon S3**                                                  | 기본 ClickHouse 테이블 스토리지, 백업, 플랫폼 텔레메트리용입니다. 버킷 정책은 `BucketOwnerEnforced`, 퍼블릭 액세스 차단, SSE를 적용합니다.                                                                        | 예 — 스토리지 + 요청 + 데이터 전송        |
| **Amazon VPC** (VPC, 서브넷, 라우팅 테이블, 보안 그룹, 인터넷 게이트웨이)           | 데이터 플레인을 위한 네트워크 격리입니다. 여러 AZ에 걸쳐 3개의 프라이빗 서브넷과 3개의 퍼블릭 서브넷을 사용합니다.                                                                                                     | 아니요 — VPC 리소스 자체는 무료입니다       |
| **NAT Gateway + Elastic IP** (AZ당 1개)                          | 프라이빗 서브넷에서 인터넷으로 나가는 아웃바운드 이그레스입니다(컨트롤 플레인 연결, 이미지 풀, 텔레메트리).                                                                                                           | 예 — 시간당 + 데이터 처리 기준           |
| **VPC Endpoint for S3** (gateway endpoint)                     | NAT를 거치지 않고 S3에 비공개로 액세스할 수 있습니다.                                                                                                                                       | 아니요 — gateway endpoint는 무료입니다 |
| **Elastic Load Balancing (NLB)**                               | ClickHouse 서비스로 들어오는 클라이언트 트래픽용 인그레스입니다. 클러스터 내부의 AWS Load Balancer Controller가 생성합니다. 기본값은 내부용입니다.                                                                     | 예 — LCU-시간당 + 처리된 데이터 기준      |
| **AWS IAM** (역할, 정책, OIDC provider, Pod Identity associations) | ClickHouse Cloud를 위한 교차 계정 액세스와 클러스터 내부 컨트롤러(cert-manager, external-dns, load-balancer-controller, cluster-autoscaler, EBS CSI driver, state-exporter)를 위한 IRSA를 제공합니다. | 아니요                           |
| **Amazon CloudWatch Logs**                                     | EKS 컨트롤 플레인 로그(api, audit, authenticator, controllerManager, scheduler)입니다.                                                                                             | 예 — 수집 + 저장                   |

## 선택적 서비스 \{#optional-services\}

이러한 서비스는 해당 기능이 활성화된 경우에만 프로비저닝됩니다.

| 서비스                                        | 활성화 조건                                               | 과금 여부                                                    |
| ------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| **AWS PrivateLink** (VPC Endpoint Service) | NLB 대신 또는 NLB와 함께 클라이언트 트래픽용 PrivateLink 연결을 활성화한 경우 | 예 — VPC endpoint-시간 + 처리된 데이터 기준                         |
| **VPC Peering Connection**                 | BYOC VPC와 계정 내 다른 VPC 간 피어링을 요청한 경우                  | 연결 자체는 과금되지 않습니다. Cross-AZ 및 cross-Region 데이터 전송은 과금됩니다. |

## 데이터 전송 요금 \{#data-transfer-charges\}

개별 리소스가 무료이더라도 AWS 데이터 전송 요금은 적용됩니다.

* 다중 AZ 배포에서 EKS 노드 간 및 레플리카 간 **Cross-AZ 트래픽**.
* 컨트롤 플레인 하트비트, 텔레메트리, 이미지 풀을 위해 NAT Gateway를 통한 **인터넷 아웃바운드 트래픽**.
* 암호화된 오버레이(Tailscale)를 통한 **ClickHouse Cloud 컨트롤 플레인으로의 아웃바운드 트래픽**.
* NLB 또는 PrivateLink endpoint를 통한 **클라이언트 네트워크로의 아웃바운드 트래픽**.

현재 요금은 [AWS data transfer pricing](https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer)을 참조하십시오.

## 관련 항목 \{#related\}

* [BYOC architecture](/cloud/reference/byoc/architecture) — 계정에 ClickHouse Cloud가 배포하는 구성 요소
* [BYOC network security](/cloud/reference/byoc/reference/network_security) — 데이터 플레인이 ClickHouse Cloud에 연결되는 방법
* [BYOC privilege](/cloud/reference/byoc/reference/privilege) — BYOC 설정 중 생성되는 IAM 역할