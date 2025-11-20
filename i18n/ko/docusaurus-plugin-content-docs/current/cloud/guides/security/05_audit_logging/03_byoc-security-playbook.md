---
'sidebar_label': 'BYOC 보안 플레이북'
'slug': '/cloud/security/audit-logging/byoc-security-playbook'
'title': 'BYOC 보안 플레이북'
'description': '이 페이지는 고객이 잠재적인 보안 이벤트를 식별하는 데 사용할 수 있는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'byoc'
- 'security'
- 'playbook'
- 'best practices'
- 'compliance'
---


# BYOC 보안 핸드북 {#byoc-security-playbook}

ClickHouse는 보안 공유 책임 모델 하에 Bring Your Own Cloud (BYOC)를 운영하며, 이는 https://trust.clickhouse.com 에서 다운로드할 수 있습니다. 다음 정보는 BYOC 고객이 잠재적인 보안 사건을 식별하는 방법에 대한 예로 제공됩니다. 고객은 이 정보를 자신의 보안 프로그램의 맥락에서 고려하여 추가적인 탐지 및 알림이 도움이 될 수 있는지를 판단해야 합니다.

## 잠재적으로 손상된 ClickHouse 자격 증명 {#compromised-clickhouse-credentials}

자격 증명 기반 공격을 탐지하고 악의적인 활동을 조사하기 위한 쿼리와 관련된 [데이터베이스 감사 로그](/cloud/security/audit-logging/database-audit-log) 문서를 참조하십시오.

## 응용 프로그램 계층 서비스 거부 공격 {#application-layer-dos-attack}

서비스 거부(DoS) 공격을 실행하는 다양한 방법이 있습니다. 공격이 특정 페이로드를 통해 ClickHouse 인스턴스를 충돌시키는 데 집중되는 경우, 시스템을 실행 상태로 복구하거나 시스템을 재부팅하고 액세스를 제한하여 제어를 회복하십시오. 다음 쿼리를 사용하여 [system.crash_log](/operations/system-tables/crash_log)를 검토하여 공격에 대한 추가 정보를 얻으십시오.

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```

## 손상된 ClickHouse 생성 AWS 역할 {#compromised-clickhouse-created-aws-roles}

ClickHouse는 시스템 기능을 활성화하기 위해 미리 생성된 역할을 사용합니다. 이 섹션은 고객이 AWS에서 CloudTrail을 사용하고 CloudTrail 로그에 접근할 수 있다고 가정합니다.

사고가 손상된 역할의 결과일 수 있는 경우, ClickHouse IAM 역할 및 행동과 관련된 CloudTrail 및 CloudWatch에서 활동을 검토하십시오. 설정의 일환으로 제공되는 [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) 스택 또는 Terraform 모듈을 참조하여 IAM 역할 목록을 확인하십시오.

## EKS 클러스터에 대한 무단 액세스 {#unauthorized-access-eks-cluster}

ClickHouse BYOC는 EKS 내에서 실행됩니다. 이 섹션은 고객이 AWS에서 CloudTrail 및 CloudWatch를 사용하고 로그에 접근할 수 있다고 가정합니다.

사고가 손상된 EKS 클러스터의 결과일 수 있는 경우, 아래 쿼리를 EKS CloudWatch 로그 내에서 사용하여 특정 위협을 식별하십시오.

사용자 이름별 Kubernetes API 호출 수를 나열하십시오
```sql
fields user.username
| stats count(*) as count by user.username
```

사용자가 ClickHouse 엔지니어인지 식별하십시오
```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Kubernetes 비밀에 접근하는 사용자를 검토하고 서비스 역할을 필터링하십시오
```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
