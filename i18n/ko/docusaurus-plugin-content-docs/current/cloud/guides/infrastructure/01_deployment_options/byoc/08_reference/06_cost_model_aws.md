---
title: 'BYOC 비용 모델 (AWS)'
slug: /cloud/reference/byoc/cost-model-aws
sidebar_label: '비용 모델 (AWS)'
keywords: ['BYOC', 'bring your own cloud', 'AWS', '비용', '청구', 'TCO', '가격', 'EC2', 'S3', 'EBS']
description: 'BYOC 배포의 총소유비용은 ClickHouse Cloud 요금과 AWS 인프라 요금이 합산되어 결정됩니다'
doc_type: 'reference'
---

ClickHouse BYOC 배포에서는 서로 독립적인 두 가지 비용이 청구됩니다:

1. **ClickHouse Cloud 요금** — 총 메모리 할당량을 기준으로 ClickHouse 서비스에 대해 ClickHouse가 청구하는 비용입니다.
2. **AWS 인프라 요금** — BYOC 배포가 AWS 계정에 프로비저닝하는 각 리소스에 대해 AWS가 AWS 계정으로 직접 청구하는 비용입니다.

이 페이지에서는 각 비용이 계산되는 방식과 이 비용들이 총소유비용(TCO)으로 어떻게 합산되는지 설명합니다.

## ClickHouse Cloud 요금 \{#clickhouse-cloud-charges\}

ClickHouse Cloud 요금은 총 메모리 할당량을 기준으로 책정됩니다. 이 요금이 현재 구성에 어떻게 적용되는지 알아보려면 [팀에 문의하십시오](https://clickhouse.com/cloud/bring-your-own-cloud).

## AWS 인프라 요금 \{#aws-infrastructure-charges\}

BYOC에서 프로비저닝된 모든 리소스에 대한 비용은 AWS가 계정에 직접 청구합니다. ClickHouse는 AWS 용량에 마진을 붙이거나 이를 재판매하지 않습니다. 필수 및 선택 서비스의 전체 목록은 [청구 대상 AWS 서비스](/cloud/reference/byoc/billable-aws-services)를 참조하십시오.

일반적으로 BYOC 청구서에서 비용 기여도가 큰 순서대로, 주요 비용 요인은 다음과 같습니다.

1. **Amazon EC2** — EKS 관리형 노드 그룹을 구성하는 워커 인스턴스입니다. 기본적으로 표준 Graviton 패밀리(예: `m7g`)가 사용됩니다. 인스턴스 패밀리와 개수는 서비스에 할당된 메모리와 노드 그룹 자동 스케일링에 따라 조정됩니다.
2. **Amazon S3** — 버킷에 저장되는 ClickHouse 테이블 데이터와 백업입니다. GB-월당 요금에 더해 요청당 요금 및 리전 간 데이터 전송 요금이 부과됩니다.
3. **Amazon EBS** — OS, 컨테이너 이미지, ClickHouse 로그용으로 워커 노드에 연결되는 gp3 볼륨입니다.
4. **NAT Gateway 및 AZ 간 데이터 전송** — 프라이빗 서브넷에서의 아웃바운드 트래픽과 가용 영역 간 트래픽입니다(멀티 AZ 배포에서는 AZ 간에 데이터가 복제됩니다).
5. **Amazon EKS** — 클러스터-시간당 고정 제어 플레인 요금입니다.
6. **Elastic Load Balancing (NLB)** — 클라이언트 인그레스 트래픽에 대해 LCU-시간당 요금이 부과됩니다.
7. **CloudWatch Logs, Route 53, KMS, VPC endpoints** — 일반적으로 전체 청구액에서 차지하는 비중은 작지만, 워크로드에 따라 달라집니다.

현재 AWS 정가는 [aws.amazon.com](https://aws.amazon.com/pricing/)의 서비스별 요금 페이지를 참조하십시오.

## 관련 \{#related\}

* [청구 대상 AWS 서비스](/cloud/reference/byoc/billable-aws-services) — BYOC에서 프로비저닝하는 AWS 서비스 전체 목록
* [AWS 서비스 한도 및 쿼터](/cloud/reference/byoc/aws-service-limits) — 배포 전에 확인해야 하는 쿼터
* [BYOC 아키텍처](/cloud/reference/byoc/architecture) — ClickHouse Cloud가 계정에 배포하는 구성 요소