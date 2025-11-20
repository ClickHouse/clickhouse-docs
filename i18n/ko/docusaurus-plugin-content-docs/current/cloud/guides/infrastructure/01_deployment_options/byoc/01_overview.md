---
'title': '개요'
'slug': '/cloud/reference/byoc/overview'
'sidebar_label': '개요'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': '자신의 클라우드 인프라에 ClickHouse 배포하기'
'doc_type': 'reference'
---

## 개요 {#overview}

BYOC (Bring Your Own Cloud)는 ClickHouse Cloud를 귀하의 클라우드 인프라스트럭처에 배포할 수 있도록 허용합니다. 이는 ClickHouse Cloud 관리 서비스 사용을 방해하는 특정 요구 사항이나 제약이 있는 경우 유용합니다.

> **접속을 원하시면, [문의해 주십시오](https://clickhouse.com/cloud/bring-your-own-cloud).** 추가 정보는 [서비스 약관](https://clickhouse.com/legal/agreements/terms-of-service)을 참조하시기 바랍니다.

BYOC는 현재 AWS에서만 지원됩니다. GCP 및 Azure의 대기자 명단에 [가입하실 수 있습니다](https://clickhouse.com/cloud/bring-your-own-cloud).

:::note 
BYOC는 대규모 배포를 위해 특별히 설계되었으며, 고객이 약정 계약에 서명해야 합니다.
:::

## 용어집 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloud가 소유한 VPC입니다.
- **고객 BYOC VPC:** 고객의 클라우드 계정이 소유하고 ClickHouse Cloud가 프로비저닝 및 관리하는 VPC로, ClickHouse Cloud BYOC 배포에 전념하고 있습니다.
- **고객 VPC**: 고객의 클라우드 계정이 소유한 다른 VPC로, 고객 BYOC VPC에 연결해야 하는 애플리케이션에 사용됩니다.

## 기능 {#features}

### 지원되는 기능 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud와 BYOC는 동일한 바이너리 및 구성을 사용합니다. 따라서 SharedMergeTree와 같은 ClickHouse 핵심의 모든 기능이 BYOC에서 지원됩니다.
- **서비스 상태 관리를 위한 콘솔 액세스**:
  - 시작, 중지 및 종료와 같은 작업을 지원합니다.
  - 서비스와 상태를 볼 수 있습니다.
- **백업 및 복원.**
- **수동으로 수직 및 수평 확장.**
- **유휴 상태.**
- **창고**: 컴퓨트-컴퓨트 분리
- **Tailscale을 통한 제로 트러스트 네트워크.**
- **모니터링**:
  - 클라우드 콘솔에는 서비스 건강 모니터링을 위한 기본 제공 건강 대시보드가 포함되어 있습니다.
  - Prometheus, Grafana 및 Datadog와 함께 중앙 집중식 모니터링을 위한 Prometheus 스크래핑. 설정 지침은 [Prometheus 문서](/integrations/prometheus)를 참조하십시오.
- **VPC 피어링.**
- **통합**: 전체 목록은 [이 페이지](/integrations)를 참조하십시오.
- **보안 S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### 계획된 기능 (현재 비지원) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 또는 CMEK (고객 관리 암호화 키)
- 인제스트를 위한 ClickPipes
- 자동 확장
- MySQL 인터페이스
