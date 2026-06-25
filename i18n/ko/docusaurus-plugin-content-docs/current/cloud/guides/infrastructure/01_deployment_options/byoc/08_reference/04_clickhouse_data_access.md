---
title: 'ClickHouse 데이터 액세스 (BYOC)'
slug: /cloud/reference/byoc/reference/clickhouse_data_access
sidebar_label: 'ClickHouse 데이터 액세스'
keywords: ['BYOC', 'bring your own cloud', '데이터 액세스', '직원 액세스', 'system.query_log', '액세스 문제 해결', '컴플라이언스']
description: 'BYOC 배포에서 ClickHouse 직원이 고객 데이터에 대해 보유하는 액세스 권한'
doc_type: 'reference'
---

기본적으로 ClickHouse 직원은 사용자 데이터에 액세스할 수 없습니다. 모든 사용자 테이블과 쿼리 결과를 포함한 ClickHouse 데이터는 VPC 내부에 유지됩니다. ClickHouse가 배포와 상호 작용할 수 있는 경로는 아래에 설명된 경우뿐이며, 그 어느 경우에도 고객 테이블 데이터에 대한 액세스 권한은 부여되지 않습니다.

## 루틴 작업 \{#routine-operations\}

ClickHouse Cloud의 제어 플레인은 고객 데이터를 읽지 않고 BYOC 배포를 운영합니다. VPC 외부로 데이터를 전송하는 구성 요소는 운영 메타데이터만 전달합니다.

| 구성 요소           | VPC 외부로 나가는 항목                                     |
| --------------- | -------------------------------------------------- |
| State exporter  | ClickHouse Cloud가 소유한 `SQS` 큐로 전송되는 서비스 상태(헬스, 상태) |
| Billing scraper | ClickHouse Cloud가 소유한 S3 버킷으로 전송되는 CPU 및 메모리 메트릭   |
| AlertManager    | ClickHouse Cloud로 전송되는 클러스터 상태 알림                  |

쿼리 트래픽, 테이블 내용, 스키마는 이러한 채널을 통해 전송되지 않습니다. 로그와 메트릭은 BYOC VPC 내부에 유지됩니다.

## 액세스 문제 해결 \{#troubleshooting-access\}

ClickHouse 엔지니어가 배포 환경의 문제를 진단해야 하는 경우, 내부 에스컬레이션 및 승인 워크플로를 통해 필요한 시점에만 액세스를 요청합니다. 승인된 액세스는 유효 기간이 제한된 인증서를 통해 부여되며, [Tailscale](/cloud/reference/byoc/reference/network_security#tailscale-private-network)을 통해서만 라우팅되고 공용 인터넷은 사용하지 않습니다.

### 엔지니어가 볼 수 있는 항목 \{#what-engineers-can-see\}

승인된 문제 해결 액세스 권한이 있으면 엔지니어는 ClickHouse 시스템 테이블(system table)만 읽을 수 있습니다. 여기에는 다음이 포함됩니다.

* `system.query_log` — 서비스에서 실행된 쿼리의 쿼리 텍스트 및 실행 메타데이터
* `system.tables`, `system.columns` 및 이와 유사한 시스템 테이블 — 스키마와 메타데이터
* 진단에 사용되는 기타 `system.*` 테이블(예: 파트, 뮤테이션, 레플리카)

### 엔지니어가 볼 수 없는 것 \{#what-engineers-cant-see\}

엔지니어는 고객의 사용자 테이블을 읽을 수 없습니다. 접근 권한은 시스템 테이블(system table)에만 제한됩니다.

### 액세스가 적용되는 방식 \{#how-access-is-enforced\}

* **승인 필요**: 모든 액세스 요청은 지정된 승인자가 있는 내부 승인 시스템을 거칩니다. 엔지니어가 스스로 액세스 권한을 부여할 수는 없습니다.
* **기간 제한 인증서**: 승인된 각 세션마다 임시 기간 제한 인증서가 생성됩니다. 액세스는 자동으로 만료됩니다.
* **인증서 기반 인증(authentication)**: BYOC 인스턴스에 대한 모든 사용자 액세스에는 비밀번호 기반 액세스 대신 인증서가 사용됩니다.
* **시스템 테이블(system table)에 대한 읽기 전용**: 인증서 ID에는 시스템 테이블 읽기 권한만 부여됩니다.
* **데이터 반출 없음**: 문제 해결 세션의 로그와 쿼리 결과는 ClickHouse 인프라로 다시 반출되지 않습니다.

## 감사 \{#auditing\}

엔지니어 활동은 사용자가 확인할 수 있으며 ClickHouse에서 감사됩니다.

* **고객이 확인 가능**: ClickHouse 엔지니어가 인스턴스에서 실행하는 모든 쿼리는 쿼리 텍스트와 인증서 ID를 포함해 사용자의 `system.query_log`에 표시됩니다. 사용자는 이를 ClickHouse 서비스에서 직접 감사할 수 있습니다.
* **ClickHouse 측**: ClickHouse의 보안 팀은 모든 액세스 요청, 승인 및 Tailscale 연결을 내부적으로 기록하고 감사합니다.

## 향후 제어 기능 \{#future-controls\}

고객 제어 승인(Customer-controlled approval) — 각 엔지니어의 액세스 요청이 효력이 발생하기 전에 직접 승인하는 방식 — 기능은 로드맵에 포함되어 있습니다. 현재는 ClickHouse의 내부 에스컬레이션 프로세스를 통해 승인이 이루어집니다.

## 관련 \{#related\}

* [BYOC 네트워크 보안](/cloud/reference/byoc/reference/network_security) — Tailscale와 네트워크 경계의 작동 방식
* [BYOC 권한](/cloud/reference/byoc/reference/privilege) — BYOC 설정 중 생성되는 IAM 역할