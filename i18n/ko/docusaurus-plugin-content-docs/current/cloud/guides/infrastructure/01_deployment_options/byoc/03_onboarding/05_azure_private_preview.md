---
title: 'Azure 프라이빗 프리뷰'
slug: /cloud/reference/byoc/onboarding/azure-private-preview
sidebar_label: 'Azure (프라이빗 프리뷰)'
keywords: ['BYOC', '클라우드', '사용자 소유 클라우드', 'Azure']
description: 'Terraform 모듈과 테넌트 간 인증(cross-tenant authentication)을 사용하여 Azure에서 ClickHouse BYOC를 온보딩합니다'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

:::note
Azure에서 BYOC는 현재 **비공개 프리뷰(private preview)** 단계입니다. 참여하려면 [ClickHouse 팀에 문의하십시오](https://clickhouse.com/cloud/bring-your-own-cloud).
:::


## 개요 \{#overview\}

Azure에서 BYOC를 사용하면 자체 Azure 구독 내에서 ClickHouse를 실행할 수 있습니다. 온보딩에는 Terraform 모듈이 사용되며, 이 모듈은 ClickHouse Cloud의 프로비저너가 사용자의 테넌트와 구독에서 Azure 리소스를 생성하고 관리하는 데 필요한 테넌트 간 인증을 프로비저닝합니다.

[아키텍처](/cloud/reference/byoc/architecture), [네트워크 보안](/cloud/reference/byoc/reference/network_security), [기능](/cloud/reference/byoc/overview#features), [연결 방식](/cloud/reference/byoc/connect)과 같은 배포의 다른 측면은 전반적으로 AWS 및 GCP BYOC 서비스와 유사합니다. 자세한 내용은 해당 페이지를 참조하십시오.

## 사전 준비 사항 \{#prerequisites\}

- BYOC 배포를 호스팅하려는 Azure **subscription** 및 **tenant**
- ClickHouse 팀과 공유할 **subscription ID** 및 **tenant ID**

## 온보딩 \{#onboarding\}

<VerticalStepper headerLevel="h3">

### 1. Terraform 모듈 적용 \{#apply-terraform-module\}

BYOC Azure 온보딩을 시작하려면 **대상 테넌트와 구독**에서 ClickHouse에서 제공하는 [Azure용 Terraform 모듈](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/azure)을 적용하십시오.

필요한 변수와 적용 단계는 모듈 문서를 참고하십시오. 적용이 완료되면 모듈이 Azure 환경에 필요한 ID와 권한을 설정합니다.

### 2. ClickHouse에 ID 제공 \{#provide-ids\}

다음 정보를 ClickHouse 팀에 제공합니다:

- **대상 구독 ID** — BYOC 리소스가 생성될 Azure 구독
- **대상 테넌트 ID** — 해당 구독을 소유한 Azure AD(Entra) 테넌트
- **리전(Region)** — ClickHouse 서비스를 배포하려는 Azure 리전
- **VNet CIDR 범위** — BYOC VNet에 사용할 IP 주소 범위

ClickHouse 팀은 이 정보를 사용하여 BYOC 인프라를 생성하고 온보딩을 완료합니다.

</VerticalStepper>

### 테넌트 간 인증 동작 방식 \{#cross-tenant-auth\}

[테넌트 간 인증을 위한 Azure 가이드](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)에 따르면 Terraform 모듈은 다음 작업을 수행합니다.

1. 대상 테넌트에 **엔터프라이즈 애플리케이션**(service principal, 서비스 주체)로서 **멀티 테넌트 애플리케이션을 프로비저닝**합니다.
2. 대상 구독 범위에서 해당 애플리케이션에 **필요한 권한을 부여**합니다.

이를 통해 ClickHouse Cloud Control Plane이 Azure 자격 증명을 ClickHouse에 저장하지 않고도, 해당 구독 내에서 Azure 리소스(리소스 그룹, AKS, 스토리지, 네트워킹 등)를 생성하고 관리할 수 있습니다.

Azure에서 멀티 테넌트 앱 및 테넌트 간 시나리오에 대한 자세한 내용은 다음을 참고하십시오.

- [Microsoft Entra ID의 싱글 테넌트 및 멀티 테넌트 앱](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)
- [테넌트 간 액세스 권한 부여(Azure SignalR 예제)](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-authorize-cross-tenant)