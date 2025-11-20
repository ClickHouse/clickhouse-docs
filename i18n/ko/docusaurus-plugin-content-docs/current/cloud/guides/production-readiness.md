---
'slug': '/cloud/guides/production-readiness'
'sidebar_label': '프로덕션 준비 상태'
'title': 'ClickHouse Cloud 프로덕션 준비 가이드'
'description': '빠른 시작에서 기업 준비 상태의 ClickHouse Cloud 배포로 전환하는 조직을 위한 가이드'
'keywords':
- 'production readiness'
- 'enterprise'
- 'saml'
- 'sso'
- 'terraform'
- 'monitoring'
- 'backup'
- 'disaster recovery'
'doc_type': 'guide'
---


# ClickHouse Cloud 생산 준비 가이드 {#production-readiness}

빠른 시작 가이드를 완료하고 데이터가 흐르고 있는 활성 서비스가 있는 조직을 위한 가이드입니다.

:::note[TL;DR]
이 가이드는 빠른 시작에서 기업 준비 완료 ClickHouse Cloud 배포로 전환하는 데 도움을 줍니다. 다음을 배우게 됩니다:

- 안전한 테스트를 위한 별도의 개발/스테이징/생산 환경 구축
- 아이덴티티 공급자와 SAML/SSO 인증 통합
- Terraform 또는 Cloud API를 사용하여 배포 자동화
- 모니터링을 경고 인프라(예: Prometheus, PagerDuty)에 연결
- 백업 절차 검증 및 재해 복구 프로세스 문서화
:::

## 소개 {#introduction}

비즈니스 업무에 ClickHouse Cloud를 성공적으로 운영하고 있습니다. 이제 규정 준수 감사, 테스트되지 않은 쿼리로 인한 생산 사고 또는 기업 시스템과의 통합 요구 사항 등으로 인해 기업 생산 표준을 충족하기 위해 배포를 성숙시켜야 합니다.

ClickHouse Cloud의 관리 플랫폼은 인프라 운영, 자동 확장 및 시스템 유지 관리를 처리합니다. 기업 생산 준비는 ClickHouse Cloud를 인증 시스템, 모니터링 인프라, 자동화 도구 및 비즈니스 연속성 프로세스를 통해 더 넓은 IT 환경과 연결하는 것을 요구합니다.

기업 생산 준비에 대한 귀하의 책임:
- 생산 배포 이전에 안전한 테스트를 위한 별도의 환경 구축
- 기존 아이덴티티 공급자 및 접근 관리 시스템과 통합
- 운영 인프라에 모니터링 및 경고 연결
- 일관된 관리를 위한 코드 기반 인프라 관행 구현
- 백업 검증 및 재해 복구 절차 확립
- 비용 관리 및 청구 통합 구성

이 가이드는 귀하가 작동 중인 ClickHouse Cloud 배포에서 기업 준비 완료 시스템으로 전환하는 데 도움을 줍니다.

## 환경 전략 {#environment-strategy}

생산 작업에 영향을 미치기 전에 안전하게 변경 사항을 테스트할 수 있는 별도의 환경을 구축합니다. 대부분의 생산 사고는 테스트되지 않은 쿼리 또는 구성 변경이 생산 시스템에 직접 배포된 결과로 나타납니다.

:::note
**ClickHouse Cloud에서는 각 환경이 별도의 서비스입니다.** 귀하는 조직 내에 특정 컴퓨팅 리소스, 저장소 및 엔드포인트를 가진 서로 다른 생산, 스테이징 및 개발 서비스를 프로비저닝합니다.
:::

**환경 구조**: 생산(실시간 작업), 스테이징(생산 기준 검증), 개발(개인/팀 실험) 환경을 유지합니다.

**테스트**: 생산 배포 이전에 스테이징에서 쿼리를 테스트합니다. 작은 데이터셋에서 작동하는 쿼리는 생산 규모에서 메모리 부족, 과도한 CPU 사용 또는 느린 실행을 초래할 수 있습니다. 사용자 권한, 할당량 및 서비스 설정을 포함한 구성 변경을 스테이징에서 검증합니다—생산에서 발견된 구성 오류는 즉각적인 운영 사고를 초래합니다.

**크기 조정**: 스테이징 서비스의 크기를 생산 부하 특성에 맞게 조정합니다. 상당히 작은 인프라에서의 테스트는 자원 경합이나 스케일링 문제를 드러내지 않을 수 있습니다. 정기적인 데이터 새로 고침 또는 합성 데이터 생성을 통해 생산에 대표적인 데이터셋을 사용합니다. 스테이징 환경의 크기를 조정하고 서비스를 적절하게 확장하는 방법에 대한 지침은 [크기 조정 및 하드웨어 권장 사항](/guides/sizing-and-hardware-recommendations)과 [ClickHouse Cloud에서의 스케일링](/manage/scaling) 문서를 참조하십시오. 이 리소스들은 메모리, CPU 및 저장소 크기 조정에 대한 실용적인 조언과 함께 생산 작업부하에 맞게 스테이징 환경을 조정하는 데 도움을 줄 수 있는 수직 및 수평 스케일링 옵션에 대한 세부정보를 제공합니다.

## 프라이빗 네트워킹 {#private-networking}

[프라이빗 네트워킹](/cloud/security/connectivity/private-networking) ClickHouse Cloud에서 ClickHouse 서비스와 클라우드 가상 네트워크를 직접 연결하여 데이터가 공용 인터넷을 통과하지 않도록 합니다. 이는 엄격한 보안 또는 규정 준수 요구 사항이 있는 조직이나 개인 서브넷에서 애플리케이션을 실행하는 조직에 필수적입니다.

ClickHouse Cloud는 다음 메커니즘을 통해 프라이빗 네트워킹을 지원합니다:

- [AWS PrivateLink](/manage/security/aws-privatelink): 공용 인터넷에 트래픽을 노출하지 않으면서 VPC와 ClickHouse Cloud 간의 안전한 연결을 활성화합니다. 교차 지역 연결을 지원하며 Scale 및 Enterprise 플랜에서 사용할 수 있습니다. 설정에는 PrivateLink 엔드포인트를 생성하고 ClickHouse Cloud 조직 및 서비스 허용 목록에 추가하는 과정이 포함됩니다. 세부정보 및 단계별 지침은 여기 문서에서 확인할 수 있습니다.
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC): Google Cloud VPC에서 ClickHouse Cloud에 대한 프라이빗 액세스를 허용합니다. AWS와 마찬가지로 Scale 및 Enterprise 플랜에서 사용할 수 있으며 서비스 엔드포인트 및 허용 목록의 명시적 구성이 필요합니다.
- [Azure Private Link](/cloud/security/azure-privatelink): Azure VNet과 ClickHouse Cloud 간의 프라이빗 연결을 제공하며, 교차 지역 연결을 지원합니다. 설정 과정에는 연결 별칭 획득, 프라이빗 엔드포인트 생성 및 허용 목록 업데이트가 포함됩니다.

더 많은 기술 세부정보나 단계별 설정 지침이 필요하다면 각 공급자에 대한 링크된 문서에서 포괄적인 가이드를 포함하고 있습니다.

## 기업 인증 및 사용자 관리 {#enterprise-authentication}

콘솔 기반 사용자 관리에서 기업 인증 통합으로의 전환은 생산 준비를 위해 필수적입니다.

### SSO 및 소셜 인증 {#sso-authentication}

[SAML SSO](/cloud/security/saml-setup): 기업 등급 ClickHouse Cloud는 Okta, Azure Active Directory 및 Google Workspace와 같은 아이덴티티 공급자와의 SAML 통합을 지원합니다. SAML 구성은 ClickHouse 지원 팀과 협력하여 진행되며 IdP 메타데이터를 제공하고 속성 매핑을 구성해야 합니다.

[소셜 SSO](/cloud/security/manage-my-account): ClickHouse Cloud는 SAML SSO에 대한 동등한 보안 대안으로 소셜 인증 공급자(구글, 마이크로소프트, GitHub)를 지원합니다. 소셜 SSO는 기존 SAML 인프라가 없는 조직에 대해 더 빠른 설정을 제공하면서 기업의 보안 표준을 유지합니다.

:::note 중요 제한 사항
SAML 또는 소셜 SSO를 통해 인증된 사용자는 기본적으로 "회원" 역할이 부여되며, 첫 로그인 이후 관리자가 수동으로 추가 역할을 부여해야 합니다. 그룹-역할 매핑 및 자동 역할 지정은 현재 지원되지 않습니다.
:::

### 접근 제어 설계 {#access-control-design}

ClickHouse Cloud는 조직 수준의 역할(관리자, 개발자, 청구, 회원)과 서비스/데이터베이스 수준의 역할(서비스 관리자, 읽기 전용, SQL 콘솔 역할)을 사용합니다. 최소 권한 원칙을 적용하여 직무 기능에 맞게 역할을 설계합니다:

- **애플리케이션 사용자**: 특정 데이터베이스 및 테이블 접근을 가진 서비스 계정
- **분석 사용자**: 선별된 데이터세트 및 보고 뷰에 대한 읽기 전용 액세스
- **관리 사용자**: 전체 관리 능력

다른 사용자 및 역할의 자원 사용량을 관리하기 위해 쿼타, 제한 및 설정 프로파일을 구성합니다. 개별 쿼리가 시스템 성능에 영향을 미치지 않도록 메모리 및 실행 시간 제한을 설정합니다. 감사, 세션 및 쿼리 로그를 통해 자원 사용량을 모니터링하여 제한에 자주 도달하는 사용자 또는 애플리케이션을 식별합니다. ClickHouse Cloud의 감사 기능을 사용하여 정기적인 접근 검토를 수행합니다.

### 사용자 라이프사이클 관리 제한 사항 {#user-lifecycle-management}

ClickHouse Cloud는 현재 SCIM 또는 아이덴티티 공급자를 통한 자동 프로비저닝/디프로비저닝을 지원하지 않습니다. IdP에서 제거된 후 사용자는 ClickHouse Cloud 콘솔에서 수동으로 제거해야 합니다. 이러한 기능이 제공될 때까지 수동 사용자 관리 프로세스를 계획하십시오.

[클라우드 접근 관리](/cloud/security/cloud_access_management) 및 [SAML SSO 설정](/cloud/security/saml-setup)에 대해 더 알아보세요.

## 코드로서의 인프라 및 자동화 {#infrastructure-as-code}

코드 기반 인프라 관행 및 API 자동화를 통해 ClickHouse Cloud를 관리하면 배포 구성의 일관성, 버전 관리 및 반복 가능성을 제공합니다.

### Terraform 제공자 {#terraform-provider}

ClickHouse Cloud 콘솔에서 생성된 API 키로 ClickHouse Terraform 제공자를 구성합니다:

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

Terraform 제공자는 서비스 프로비저닝, IP 접근 목록 및 사용자 관리를 지원합니다. 현재 제공자는 기존 서비스를 가져오거나 명시적인 백업 구성을 지원하지 않습니다. 제공자가 다루지 않는 기능은 콘솔을 통해 관리하거나 ClickHouse 지원 팀에 문의하십시오.

서비스 구성 및 네트워크 접근 제어를 포함한 포괄적인 사례는 [클라우드 API 사용 방법에 대한 Terraform 예제](/knowledgebase/terraform_example)를 참조하십시오.

### Cloud API 통합 {#cloud-api-integration}

기존 자동화 프레임워크가 있는 조직은 Cloud API를 통해 ClickHouse Cloud 관리를 직접 통합할 수 있습니다. API는 서비스 생애 주기 관리, 사용자 관리, 백업 작업, 모니터링 데이터 검색에 대한 프로그래밍적 접근을 제공합니다.

일반적인 API 통합 패턴:
- 내부 티켓팅 시스템과 통합된 사용자 정의 프로비저닝 워크플로우
- 애플리케이션 배포 일정에 따라 자동 크기 조정 조정
- 준수를 위한 프로그래밍 쿼리 백업 검증 및 보고
- 기존 인프라 관리 플랫폼과의 통합

API 인증은 Terraform과 동일한 토큰 기반 방식을 사용합니다. 완전한 API 참조 및 통합 사례는 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 문서를 참조하십시오.

## 모니터링 및 운영 통합 {#monitoring-integration}

ClickHouse Cloud를 기존 모니터링 인프라에 연결하여 가시성과 사전 문제 감지를 보장합니다.

### 내장 모니터링 {#built-in-monitoring}

ClickHouse Cloud는 초당 쿼리 수, 메모리 사용량, CPU 사용량, 저장소 비율을 포함한 실시간 메트릭으로 고급 대시보드를 제공합니다. 모니터링 → 고급 대시보드에서 클라우드 콘솔을 통해 접근합니다. 특정 작업 패턴 또는 팀 자원 소비에 맞춤화된 대시보드를 생성합니다.

:::note 일반 생산 격차
기업 사고 관리 시스템 및 자동화된 비용 모니터링과의 사전 경고 통합 부족. 내장 대시보드는 가시성을 제공하지만 자동화된 경고에는 외부 통합이 필요합니다.
:::

### 생산 경고 설정 {#production-alerting}

**내장 기능**: ClickHouse Cloud는 청구 이벤트, 크기 조정 이벤트 및 서비스 상태에 대한 알림을 이메일, UI 및 Slack을 통해 제공합니다. 콘솔 알림 설정을 통해 전달 채널 및 알림 심각성을 구성합니다.

**기업 통합**: 고급 경고(PagerDuty, 사용자 정의 웹훅)를 위해 Prometheus 엔드포인트를 사용하여 기존 모니터링 인프라에 메트릭을 내보냅니다:

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

자세한 Prometheus/Grafana 구성 및 고급 경고 설정을 포함한 포괄적인 설정은 [ClickHouse Cloud 관측 가능성 가이드](/use-cases/observability/cloud-monitoring#prometheus)를 참조하십시오.

## 비즈니스 연속성 및 지원 통합 {#business-continuity}

백업 검증 절차와 지원 통합을 설정하면 ClickHouse Cloud 배포가 사고에서 복구하고 필요할 때 도움을 받을 수 있습니다.

### 백업 전략 평가 {#backup-strategy}

ClickHouse Cloud는 구성 가능한 보존 기간을 가진 자동 백업을 제공합니다. 현재 백업 구성을 규정 준수 및 복구 요구 사항에 맞춰 평가합니다. 백업 위치나 암호화와 관련된 특정 규정 준수 요구 사항이 있는 기업 고객은 ClickHouse Cloud가 자신의 클라우드 스토리지 버킷(BYOB)에 백업을 저장하도록 구성할 수 있습니다. BYOB 구성을 위해 ClickHouse 지원에 연락하십시오.

### 복구 절차 검증 및 테스트 {#validate-test-recovery}

대부분의 조직은 실제 복구 시나리오 동안 백업 격차를 발견합니다. 사고가 발생하기 전에 백업 무결성을 확인하고 복구 절차를 테스트하기 위한 정기적인 검증 주기를 설정합니다. 비생산 환경에 대한 정기적인 복원 테스트 일정을 잡고, 단계별 복구 절차(시간 추정 포함)를 문서화하고, 복원된 데이터의 완전성과 애플리케이션 기능을 검증하고, 다양한 장애 시나리오(서비스 삭제, 데이터 손상, 지역 중단)를 통한 복구 절차를 테스트합니다. 온콜 팀이 접근할 수 있도록 업데이트된 복구 실행 문서를 유지합니다.

중요한 생산 서비스에 대해 백업 복원 테스트를 분기별로 최소한 한 번 수행합니다. 엄격한 규정 준수 요구 사항이 있는 조직은 매월 또는 매주 검증 주기가 필요할 수 있습니다.

### 재해 복구 계획 {#disaster-recovery-planning}

비즈니스 요구 사항을 충족하는지 확인하기 위해 복구 시간 목표(RTO) 및 복구 지점 목표(RPO)를 문서화합니다. 백업 복원에 대한 정기적인 테스트 일정을 수립하고 업데이트된 복구 문서를 유지합니다.

**교차 지역 백업 저장소**: 지리적 재해 복구 요구 사항이 있는 조직은 ClickHouse Cloud가 대체 지역의 고객 소유 저장소 버킷에 백업을 내보내도록 구성할 수 있습니다. 이는 지역 중단으로부터 보호를 제공하지만 수동 복원 절차가 필요합니다. 교차 지역 백업 내보내기를 구현하기 위해 ClickHouse 지원에 연락하십시오. 향후 플랫폼 릴리스는 자동화된 다지역 복제 기능을 제공할 것입니다.

### 생산 지원 통합 {#production-support}

현재 지원 계층의 SLA 기대치 및 에스컬레이션 절차를 이해합니다. ClickHouse 지원에 연락할 시점을 정의하는 내부 실행 문서를 작성하고 이러한 절차를 기존 사고 관리 프로세스에 통합합니다.

[ClickHouse Cloud 백업 및 복구](/cloud/manage/backups/overview) 및 [지원 서비스](/about-us/support)에 대해 더 알아보세요.

## 다음 단계 {#next-steps}

이 가이드의 통합 및 절차를 구현한 후 [클라우드 리소스 투어](/cloud/get-started/cloud/resource-tour)를 방문하여 [모니터링](/cloud/get-started/cloud/resource-tour#monitoring), [보안](/cloud/get-started/cloud/resource-tour#security) 및 [비용 최적화](/cloud/get-started/cloud/resource-tour#cost-optimization)에 대한 가이드를 확인하세요.

현재 [서비스 계층 제한 사항](/cloud/manage/cloud-tiers)이 생산 운영에 영향을 미친다면 [프라이빗 네트워킹](/cloud/security/connectivity/private-networking), [TDE/CMEK](/cloud/security/cmek) (고객 관리 암호화 키를 사용하는 투명한 데이터 암호화) 또는 [고급 백업 옵션](/cloud/manage/backups/configurable-backups)과 같은 향상된 기능을 위한 업그레이드 경로를 고려하십시오.
