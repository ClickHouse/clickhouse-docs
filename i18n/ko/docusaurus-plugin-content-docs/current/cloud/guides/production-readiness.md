---
slug: /cloud/guides/production-readiness
sidebar_label: '프로덕션 준비 상태'
title: 'ClickHouse Cloud 프로덕션 운영 준비 가이드'
description: '빠른 시작 단계에서 엔터프라이즈급 ClickHouse Cloud 프로덕션 배포로 전환하려는 조직을 위한 가이드'
keywords: ['프로덕션 준비', '엔터프라이즈', 'saml', 'sso', 'terraform', '모니터링', '백업', '재해 복구']
doc_type: 'guide'
---

# ClickHouse Cloud 프로덕션 준비 가이드 \{#production-readiness\}

빠른 시작 가이드를 완료하고 데이터가 유입되는 활성 서비스를 운영 중인 조직을 위한 가이드입니다.

:::note[TL;DR]
이 가이드는 빠른 시작 단계에서 엔터프라이즈 수준의 ClickHouse Cloud 프로덕션 배포 환경으로 전환하는 데 도움이 됩니다. 다음 내용을 학습하게 됩니다:

- 안전한 테스트를 위해 개발/스테이징/프로덕션 환경을 분리해 구성하기
- 아이덴티티 공급자(IdP)와 SAML/SSO 인증을 연동하기
- Terraform 또는 Cloud API를 사용해 배포를 자동화하기
- 모니터링을 Prometheus, PagerDuty 등의 알림 인프라에 연결하기
- 백업 절차를 검증하고 재해 복구 프로세스를 문서화하기
:::

## Introduction \{#introduction\}

비즈니스 워크로드를 위해 ClickHouse Cloud를 성공적으로 운영하고 있습니다. 이제 컴플라이언스 감사, 테스트되지 않은 쿼리로 인한 프로덕션 장애, 또는 사내 시스템과의 통합을 요구하는 IT 요건 등 어떤 계기가 되었든, 배포 환경을 엔터프라이즈 프로덕션 표준을 충족하는 수준으로 고도화해야 합니다.

ClickHouse Cloud의 관리형 플랫폼은 인프라 운영, 자동 확장, 시스템 유지 관리를 담당합니다. 엔터프라이즈 수준의 프로덕션 준비 상태를 달성하려면 인증 시스템, 모니터링 인프라, 자동화 도구, 비즈니스 연속성 프로세스를 통해 ClickHouse Cloud를 보다 넓은 IT 환경에 연결해야 합니다.

엔터프라이즈 프로덕션 준비를 위해 수행해야 할 작업은 다음과 같습니다.

- 프로덕션 배포 전에 안전하게 테스트할 수 있도록 별도의 환경을 구축합니다.
- 기존 ID 제공자와 액세스 관리 시스템과 통합합니다.
- 운영 인프라에 모니터링 및 알림을 연동합니다.
- 일관된 관리를 위한 인프라 코드화(infrastructure-as-code) 방식을 구현합니다.
- 백업 검증 및 재해 복구 절차를 수립합니다.
- 비용 관리 및 청구 시스템 연동을 구성합니다.

이 가이드는 각 영역을 단계별로 안내하여, 동작 중인 ClickHouse Cloud 배포를 엔터프라이즈 수준으로 준비된 시스템으로 전환하는 데 도움을 줍니다.

## 환경 전략 \{#environment-strategy\}

프로덕션 워크로드에 영향을 주기 전에 변경 사항을 안전하게 테스트할 수 있도록 환경을 분리하여 구성합니다. 대부분의 프로덕션 장애는 프로덕션 시스템에 직접 배포된, 테스트되지 않은 쿼리나 설정 변경으로 인해 발생합니다.

:::note
**ClickHouse Cloud에서는 각 환경이 개별 서비스입니다.** 조직 내에 프로덕션, 스테이징, 개발 서비스를 각각 프로비저닝하며, 각 서비스는 자체적인 컴퓨트 리소스, 스토리지, 엔드포인트를 가집니다.
:::

**환경 구조**: 프로덕션(실제 라이브 워크로드), 스테이징(프로덕션과 동등한 수준의 검증용), 개발(개인/팀 실험용) 환경을 유지합니다.

**테스트**: 프로덕션에 배포하기 전에 스테이징 환경에서 쿼리를 테스트합니다. 소규모 데이터셋에서는 잘 동작하는 쿼리라도 프로덕션 규모에서는 메모리 고갈, 과도한 CPU 사용, 느린 실행을 유발하는 경우가 많습니다. 사용자 권한, QUOTA, 서비스 설정을 포함한 설정 변경은 반드시 스테이징에서 검증하십시오. 프로덕션에서 발견된 설정 오류는 즉각적인 운영 장애를 초래합니다.

**사이징**: 스테이징 서비스는 프로덕션 부하 특성과 최대한 가깝게 사이징합니다. 훨씬 작은 인프라에서 테스트하면 리소스 경합이나 스케일링 문제를 발견하지 못할 수 있습니다. 주기적인 데이터 갱신이나 합성 데이터 생성을 통해 프로덕션을 대표하는 데이터셋을 사용합니다. 스테이징 환경의 사이징과 서비스 스케일링에 대한 안내는 [Sizing and hardware recommendations](/guides/sizing-and-hardware-recommendations) 및 [Scaling in ClickHouse Cloud](/manage/scaling) 문서를 참고하십시오. 이 문서에서는 메모리, CPU, 스토리지 사이징에 대한 실질적인 조언과 함께, 스테이징 환경을 프로덕션 워크로드에 맞출 수 있도록 수직 및 수평 스케일링 옵션에 대한 세부 정보를 제공합니다.

## 프라이빗 네트워킹 \{#private-networking\}

ClickHouse Cloud의 [프라이빗 네트워킹](/cloud/security/connectivity/private-networking)은 ClickHouse 서비스와 클라우드 가상 네트워크를 직접 연결하여 데이터가 퍼블릭 인터넷을 통과하지 않도록 합니다. 이는 보안 또는 규정 준수 요구사항이 엄격한 조직이나 프라이빗 서브넷에서 애플리케이션을 운영하는 경우에 필수적입니다.

ClickHouse Cloud는 다음 메커니즘을 통해 프라이빗 네트워킹을 지원합니다:

- [AWS PrivateLink](/manage/security/aws-privatelink): 퍼블릭 인터넷에 트래픽을 노출하지 않고 VPC와 ClickHouse Cloud 간의 보안 연결을 제공합니다. 리전 간 연결을 지원하며 Scale 및 Enterprise 플랜에서 사용할 수 있습니다. 설정에는 PrivateLink 엔드포인트를 생성하고 이를 ClickHouse Cloud 조직 및 서비스 허용 목록에 추가하는 작업이 포함됩니다. 자세한 내용과 단계별 안내는 해당 문서에서 확인할 수 있습니다.
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC): Google Cloud VPC에서 ClickHouse Cloud로의 프라이빗 액세스를 허용합니다. AWS와 마찬가지로 Scale 및 Enterprise 플랜에서 제공되며, 서비스 엔드포인트와 허용 목록을 해당 문서에서 명시적으로 구성해야 합니다.
- [Azure Private Link](/cloud/security/azure-privatelink): Azure VNet과 ClickHouse Cloud 간의 프라이빗 연결을 제공하며, 리전 간 연결을 지원합니다. 설정 과정에는 연결 별칭을 획득하고 프라이빗 엔드포인트를 생성한 후 허용 목록을 해당 문서에서 업데이트하는 단계가 포함됩니다.

더 기술적인 세부 정보나 단계별 설정 지침이 필요하면, 각 클라우드 제공자에 대한 링크된 문서에서 종합적인 가이드를 확인할 수 있습니다.

## 엔터프라이즈 인증 및 사용자 관리 \{#enterprise-authentication\}

콘솔 기반 사용자 관리에서 엔터프라이즈 인증 통합으로 전환하는 것은 운영 환경(production) 준비를 위해 필수적입니다.

### SSO 및 소셜 인증 \{#sso-authentication\}

[SAML SSO](/cloud/security/saml-setup): 엔터프라이즈 티어 ClickHouse Cloud는 Okta, Azure Active Directory, Google Workspace와 같은 IdP(Identity Provider)와의 SAML 통합을 지원합니다. SAML 구성을 위해서는 ClickHouse 지원팀과의 협의가 필요하며, IdP 메타데이터 제공과 속성 매핑 구성이 포함됩니다.

[소셜 SSO](/cloud/security/manage-my-account): ClickHouse Cloud는 SAML SSO와 동등한 수준의 보안을 제공하는 대안으로 소셜 인증 제공자(Google, Microsoft, GitHub)도 지원합니다. 소셜 SSO는 기존 SAML 인프라가 없는 조직이 엔터프라이즈 보안 표준을 유지하면서 더 빠르게 설정할 수 있도록 합니다.

:::note 중요한 제한 사항
SAML 또는 소셜 SSO를 통해 인증된 사용자는 기본적으로 "Member" 역할이 부여되며, 최초 로그인 이후 관리자에 의해 수동으로 추가 역할을 부여받아야 합니다. 그룹과 역할 간 매핑 및 역할의 자동 할당은 현재 지원되지 않습니다.
:::

### Access control design \{#access-control-design\}

ClickHouse Cloud는 조직 수준 역할(Admin, Developer, Billing, Member)과 서비스/데이터베이스 수준 역할(Service Admin, Read Only, SQL console roles)을 사용합니다. 최소 권한 원칙을 적용하여 업무 역할을 중심으로 역할을 설계하십시오.

- **Application users**: 특정 데이터베이스 및 테이블에 대한 접근 권한만 가진 서비스 계정
- **Analyst users**: 선별된 데이터셋과 보고용 뷰에 대한 읽기 전용 권한
- **Admin users**: 전체 관리 기능 권한

서로 다른 사용자와 역할의 리소스 사용량을 관리하기 위해 쿼터(quotas), 제한(limits), 설정 프로필(settings profiles)을 구성하십시오. 개별 쿼리가 시스템 성능에 영향을 주지 않도록 메모리 및 실행 시간 한도를 설정하십시오. 감사 로그, 세션 로그, 쿼리 로그를 통해 리소스 사용량을 모니터링하여 한도에 자주 도달하는 사용자나 애플리케이션을 식별하십시오. ClickHouse Cloud의 감사 기능을 사용하여 정기적으로 접근 권한을 검토하십시오.

### 사용자 라이프사이클 관리 제한 사항 \{#user-lifecycle-management\}

ClickHouse Cloud는 현재 SCIM이나 IdP(아이덴티티 제공자)를 통한 자동 프로비저닝/디프로비저닝을 지원하지 않습니다. IdP에서 사용자를 제거한 후에는 ClickHouse Cloud 콘솔에서도 해당 사용자를 수동으로 제거해야 합니다. 이러한 기능이 제공될 때까지는 수동 사용자 관리 프로세스를 전제로 운영을 계획하십시오.

[Cloud Access Management](/cloud/security/cloud_access_management) 및 [SAML SSO 설정](/cloud/security/saml-setup)에 대해 자세히 알아보십시오.

## 코드형 인프라와 자동화 \{#infrastructure-as-code\}

코드형 인프라(infrastructure-as-code) 방식과 API 기반 자동화를 활용하여 ClickHouse Cloud를 관리하면 배포 구성의 일관성과 버전 관리, 재현성을 확보할 수 있습니다.

### Terraform Provider \{#terraform-provider\}

ClickHouse Cloud 콘솔에서 생성한 API 키를 사용하여 ClickHouse Terraform provider를 설정합니다:

```terraform
terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 2.0"
    }
  }
}

provider "clickhouse" {
  environment     = "production"
  organization_id = var.organization_id
  token_key       = var.token_key
  token_secret    = var.token_secret
}
```

Terraform provider는 서비스 프로비저닝, IP 액세스 목록, 사용자 관리를 지원합니다. provider에서 지원하지 않는 기능은 콘솔에서 관리하거나 ClickHouse 지원팀에 문의하십시오.

서비스 구성 및 네트워크 액세스 제어를 포함한 자세한 예시는 [Cloud API 사용 방법에 대한 Terraform 예제](/knowledgebase/terraform_example)를 참고하십시오.


### Cloud API 통합 \{#cloud-api-integration\}

기존 자동화 프레임워크를 보유한 조직은 Cloud API와 직접 통합하여 ClickHouse Cloud를 관리할 수 있습니다. 이 API는 서비스 라이프사이클 관리, 사용자 관리, 백업 작업, 모니터링 데이터 조회를 위한 프로그래밍 방식 접근을 제공합니다.

일반적인 API 통합 패턴:

- 내부 티켓 시스템과 통합된 사용자 정의 프로비저닝 워크플로우
- 애플리케이션 배포 일정에 따라 자동으로 조정되는 스케일링
- 규정 준수 워크플로우를 위한 프로그래밍 방식 백업 검증 및 보고
- 기존 인프라 관리 플랫폼과의 통합

API 인증은 Terraform과 동일한 토큰 기반 방식을 사용합니다. 전체 API 레퍼런스와 통합 예시는 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 문서를 참고하십시오.

## 모니터링 및 운영 통합 \{#monitoring-integration\}

기존 모니터링 인프라와 ClickHouse Cloud를 연동하면 가시성을 높이고 문제를 선제적으로 탐지할 수 있습니다.

### 내장 모니터링 \{#built-in-monitoring\}

ClickHouse Cloud는 초당 쿼리 수, 메모리 사용량, CPU 사용량, 스토리지 사용량 등의 실시간 메트릭을 제공하는 고급 대시보드를 제공합니다. Cloud 콘솔의 Monitoring → Advanced dashboard에서 이용할 수 있습니다. 특정 워크로드 패턴이나 팀별 리소스 사용량에 맞춘 맞춤형 대시보드를 생성할 수 있습니다.

:::note Common production gaps
엔터프라이즈 인시던트 관리 시스템 및 자동 비용 모니터링과의 사전 대응 알림 통합이 부족합니다. 내장 대시보드는 가시성을 제공하지만, 자동화된 알림을 위해서는 외부 시스템과의 통합이 필요합니다.
:::

### 프로덕션 알림 설정 \{#production-alerting\}

**기본 제공 기능**: ClickHouse Cloud는 과금 이벤트, 스케일링 이벤트, 서비스 상태에 대한 알림을 이메일, UI, Slack을 통해 제공합니다. 콘솔의 알림 설정에서 전송 채널과 알림 심각도를 설정합니다.

**엔터프라이즈 통합**: 고급 알림(PagerDuty, 사용자 지정 웹훅 등)을 위해 Prometheus 엔드포인트를 사용하여 메트릭을 기존 모니터링 인프라로 내보내십시오.

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

Prometheus/Grafana의 상세 구성 및 고급 경보 설정을 포함한 포괄적인 설정에 대해서는 [ClickHouse Cloud 관측성 가이드](/use-cases/observability/cloud-monitoring#prometheus)를 참조하십시오.


## 비즈니스 연속성 및 지원 통합 \{#business-continuity\}

백업 검증 절차와 지원 통합을 구축하면 ClickHouse Cloud 배포가 장애에서 복구하고 필요할 때 도움을 받을 수 있습니다.

### 백업 전략 평가 \{#backup-strategy\}

ClickHouse Cloud에서는 보존 기간을 설정할 수 있는 자동 백업 기능을 제공합니다. 현재 백업 구성을 규정 준수 및 복구 요구 사항을 기준으로 평가하십시오. 백업 위치 또는 암호화와 관련해 특정 규정 준수 요구 사항이 있는 엔터프라이즈 고객은 ClickHouse Cloud가 자체 클라우드 스토리지 버킷(BYOB)에 백업을 저장하도록 구성할 수 있습니다. BYOB 구성을 위해 ClickHouse 지원팀에 문의하십시오.

### 복구 절차 검증 및 테스트 \{#validate-test-recovery\}

대부분의 조직은 실제 복구 상황에서야 백업 상의 누락이나 문제를 발견합니다. 정기적인 검증 주기를 수립하여 사고가 발생하기 전에 백업 무결성을 확인하고 복구 절차를 테스트하십시오. 운영 환경이 아닌 환경에 주기적으로 복원 테스트를 수행하고, 소요 시간 추정치를 포함한 단계별 복구 절차를 문서화하며, 복원된 데이터의 완전성과 애플리케이션 기능을 검증하고, 다양한 장애 시나리오(서비스 삭제, 데이터 손상, 리전 장애 등)에 대해 복구 절차를 테스트하십시오. 온콜(on-call) 팀이 접근할 수 있도록 최신 복구 런북을 유지 관리하십시오.

중요한 프로덕션 서비스에 대해서는 최소 분기별로 백업 복원 테스트를 수행해야 합니다. 엄격한 컴플라이언스 요구 사항이 있는 조직은 매월 또는 매주 단위의 검증 주기가 필요할 수 있습니다.

### 재해 복구 계획 \{#disaster-recovery-planning\}

현재 백업 구성이 비즈니스 요구 사항을 충족하는지 검증할 수 있도록 복구 시간 목표(RTO)와 복구 시점 목표(RPO)를 문서화하십시오. 백업 복원을 위한 정기적인 테스트 일정을 수립하고, 최신 상태로 유지되는 복구 문서를 관리하십시오.

**리전 간 백업 스토리지**: 지리적 재해 복구 요구 사항이 있는 조직은 ClickHouse Cloud를 구성하여 다른 리전에 있는 고객 소유 스토리지 버킷으로 백업을 내보낼 수 있습니다. 이는 리전 장애에 대한 보호를 제공하지만 수동 복구 절차가 필요합니다. 리전 간 백업 내보내기를 설정하려면 ClickHouse 지원팀에 문의하십시오. 향후 플랫폼 릴리스에서는 자동화된 멀티 리전 레플리케이션 기능을 제공할 예정입니다.

### 프로덕션 지원 통합 \{#production-support\}

현재 지원 등급의 SLA(서비스 수준 계약) 기대치와 에스컬레이션(escalation) 절차를 파악합니다. ClickHouse 지원팀에 언제 요청할지 정의한 내부 런북(runbook)을 작성하고, 이러한 절차를 기존 인시던트 관리 프로세스와 통합합니다.

[ClickHouse Cloud 백업 및 복구](/cloud/manage/backups/overview)와 [지원 서비스](/about-us/support)에 대해 자세한 내용은 해당 문서를 참고하십시오.

## 다음 단계 \{#next-steps\}

이 가이드에서 설명한 통합 및 절차를 구현한 후, [모니터링](/cloud/get-started/cloud/resource-tour#monitoring), [보안](/cloud/get-started/cloud/resource-tour#security), [비용 최적화](/cloud/get-started/cloud/resource-tour#cost-optimization)에 대한 추가 가이드를 확인하려면 [Cloud 리소스 둘러보기](/cloud/get-started/cloud/resource-tour)를 방문하십시오.

현재 [서비스 티어 제한 사항](/cloud/manage/cloud-tiers)이 프로덕션 운영에 영향을 미치면, [프라이빗 네트워킹](/cloud/security/connectivity/private-networking), [TDE/CMEK](/cloud/security/cmek) (고객 관리형 암호화 키(Customer-Managed Encryption Keys)를 사용하는 투명한 데이터 암호화(Transparent Data Encryption)), 또는 [고급 백업 옵션](/cloud/manage/backups/configurable-backups)과 같은 향상된 기능을 위한 업그레이드 경로를 검토하십시오.