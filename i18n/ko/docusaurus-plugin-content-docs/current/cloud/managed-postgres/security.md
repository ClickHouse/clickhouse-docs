---
slug: /cloud/managed-postgres/security
sidebar_label: '보안'
title: '보안'
description: 'IP 허용 목록, 암호화, Private Link를 포함한 ClickHouse Managed Postgres의 보안 기능'
keywords: ['postgres 보안', 'ip 허용 목록', '암호화', 'tls', 'ssl', 'private link', '백업 보존 기간']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="security" />

Managed Postgres는 엔터프라이즈급 보안 기능을 갖추어 데이터를 보호하고 규제 준수(compliance) 요구 사항을 충족하도록 설계되었습니다. 이 페이지에서는 네트워크 보안, 암호화, 백업 보존 정책을 다룹니다.


## IP 허용 목록 \{#ip-whitelisting\}

IP 필터는 Managed Postgres 인스턴스에 연결이 허용되는 소스 IP 주소를 제어하여 네트워크 수준의 액세스 제어를 제공하고, 데이터베이스를 무단 연결로부터 보호합니다.

<Image img={ipFilters} alt="IP 액세스 목록 구성" size="md" border/>

### IP 필터 구성 \{#configuring-ip-filters\}

IP 필터 구성에 대한 자세한 내용은 [설정](/cloud/managed-postgres/settings#ip-filters) 페이지를 참조하십시오.

다음을 지정할 수 있습니다:

- 개별 IP 주소(예: `203.0.113.5`)
- 네트워크용 CIDR 범위(예: `192.168.1.0/24`)
- 모든 IP 주소를 허용하는 **Anywhere**(운영 환경에서는 권장하지 않음)
- 모든 연결을 차단하는 **Nowhere**

:::warning 운영 환경 모범 사례
IP 필터가 구성되지 않은 경우 모든 IP 주소에서의 연결이 허용됩니다. 운영 워크로드에서는 접근을 신뢰할 수 있는 IP 주소나 CIDR 범위로 제한하십시오. 예를 들어 다음 대상으로 접근을 제한하는 것을 고려하십시오:

- 애플리케이션 서버
- VPN 게이트웨이 IP 주소
- 관리용 베스천(bastion) 호스트
- 자동 배포용 CI/CD 파이프라인 IP
:::

## 암호화 \{#encryption\}

Managed Postgres는 포괄적인 데이터 보호를 위해 데이터가 저장될 때와 전송될 때 모두 암호화합니다.

### 저장 데이터 암호화 \{#encryption-at-rest\}

Managed Postgres에 저장되는 모든 데이터는 스토리지 인프라에 대한 무단 접근으로부터 보호하기 위해 저장 시 암호화됩니다.

#### NVMe storage encryption \{#nvme-encryption\}

NVMe 드라이브에 저장된 데이터베이스 파일, 트랜잭션 로그, 임시 파일은 업계 표준 암호화 알고리즘을 사용해 암호화됩니다. 이 암호화는 애플리케이션에서 투명하게 동작하며 추가적인 구성이 필요하지 않습니다.

#### 객체 스토리지 암호화 (S3) \{#s3-encryption\}

객체 스토리지에 저장되는 백업과 Write-Ahead Log (WAL) 아카이브도 저장 시 암호화(encryption at rest)가 적용됩니다. 여기에는 다음이 포함됩니다:

- 일별 전체 백업
- 증분 WAL 아카이브
- 시점 복구(point-in-time recovery) 데이터

모든 백업 데이터는 각 인스턴스에 한정되도록 설정된 자격 증명을 사용하여 전용으로 격리된 스토리지 버킷에 저장되므로, 백업 데이터는 안전하게 보호되며 권한이 부여된 시스템에서만 액세스할 수 있습니다.

:::info
저장 시 암호화(encryption at rest)는 모든 Managed Postgres 인스턴스에서 기본적으로 활성화되어 있으며 비활성화할 수 없습니다. 추가 구성은 필요하지 않습니다.
:::

### 전송 중 암호화 \{#encryption-in-transit\}

애플리케이션과 데이터베이스 사이에서 데이터가 이동하는 동안 이를 보호하기 위해 Managed Postgres로의 모든 네트워크 연결은 TLS(Transport Layer Security)를 사용합니다.

#### TLS/SSL 구성 \{#tls-ssl\}

기본적으로 연결은 인증서 검증 없이 TLS 암호화를 사용합니다. 운영 워크로드에서는 올바른 서버와 통신하고 있음을 보장하기 위해 인증이 검증된 TLS 연결 사용을 권장합니다.

TLS 구성 및 연결 옵션에 대한 자세한 내용은 [Connection](/cloud/managed-postgres/connection#tls) 페이지를 참조하십시오.

## Private Link \{#private-link\}

Private Link은 Managed Postgres 인스턴스와 Virtual Private Cloud(VPC) 간에 트래픽을 퍼블릭 인터넷에 노출하지 않고 프라이빗 연결을 제공하는 기능입니다. 이를 통해 추가적인 네트워크 격리 및 보안 계층이 제공됩니다.

:::note Manual setup required
Private Link 지원은 제공되나 ClickHouse 지원팀을 통한 수동 구성이 필요합니다. 이 기능은 엄격한 네트워크 격리 요구 사항을 가진 엔터프라이즈 고객에게 적합합니다.
:::

### Private Link 설정 요청 \{#requesting-private-link\}

Managed Postgres 인스턴스에 대해 Private Link를 활성화하려면 다음을 수행하십시오.

1. 지원 티켓을 생성하여 **ClickHouse 지원팀에 문의**합니다.
2. **다음 정보를 제공합니다.**
   - ClickHouse 조직 ID
   - Postgres 서비스의 ID 또는 호스트 이름
   - Private Link로 연결하려는 AWS 계정 ID/ARN
     - (선택 사항) Postgres 인스턴스가 위치한 리전 외에, 연결하려는 다른 리전

3. **ClickHouse 지원팀은 다음을 수행합니다.**
   - Managed Postgres 측에 Private Link 엔드포인트를 프로비저닝합니다.
   - 엔드포인트 인터페이스를 생성할 때 사용할 수 있는 엔드포인트 연결 정보를 제공합니다.

4. **Private Link를 설정합니다.**
   - AWS 설정에서 엔드포인트 인터페이스로 이동한 후, ClickHouse 지원팀이 제공한 구성을 사용해 Private Link를 생성합니다.
   - Private Link 상태가 "Available"로 표시되면, AWS UI에서 제공되는 Private DNS 이름을 사용해 연결합니다.

## 백업 보존 \{#backup-retention\}

Managed Postgres는 실수로 인한 삭제나 손상, 그 밖의 데이터 손실 상황으로부터 보호하기 위해 데이터를 자동으로 백업합니다.

### 보관 정책 \{#retention-policy\}

- **기본 보관 기간**: 7일
- **백업 주기**: 매일 전체 백업 + 지속적인 WAL 아카이빙(60초마다 또는 16MB마다, 둘 중 먼저 도달하는 조건)
- **복구 단위**: 보관 기간 내 임의의 시점으로의 시점 복구(Point-in-time recovery)

### 백업 보안 \{#backup-security\}

백업은 기본 데이터와 동일한 수준의 보안 보장을 적용하여 저장됩니다.

- 객체 스토리지에서의 **저장 데이터 암호화(Encryption at rest)**
- 권한 범위가 제한된 자격 증명을 사용하는 인스턴스별 **격리된 스토리지 버킷**
- 백업과 연결된 Postgres 인스턴스로만 제한되는 **액세스 제어**

백업 전략과 시점 복구(point-in-time recovery)에 대한 자세한 내용은 [백업 및 복구](/cloud/managed-postgres/backup-and-restore) 페이지를 참조하십시오.