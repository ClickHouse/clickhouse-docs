---
sidebar_label: 'BYOC 보안 플레이북'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC 보안 플레이북'
description: '이 페이지에서는 잠재적인 보안 이벤트를 식별하는 데 사용할 수 있는 방법을 보여줍니다'
doc_type: 'guide'
keywords: ['byoc', 'security', 'playbook', 'best practices', 'compliance']
---

# BYOC 보안 플레이북 \{#byoc-security-playbook\}

ClickHouse는 보안 공동 책임 모델에 기반해 Bring Your Own Cloud(BYOC)를 운영하며, 해당 모델은 https://trust.clickhouse.com 의 Trust Center에서 다운로드할 수 있습니다. 다음 정보는 잠재적인 보안 이벤트를 식별하는 방법에 대한 예시로 BYOC 고객에게 제공됩니다. 고객은 이 정보를 자체 보안 프로그램의 맥락에서 검토하여, 추가적인 탐지 및 경보를 구성하는 것이 유용한지 여부를 판단해야 합니다.

## 잠재적으로 유출된 ClickHouse 자격 증명 \{#compromised-clickhouse-credentials\}

자격 증명 기반 공격을 탐지하고 악의적인 활동을 조사하는 데 사용할 수 있는 쿼리에 대해서는 [데이터베이스 감사 로그(database audit log)](/cloud/security/audit-logging/database-audit-log) 문서를 참고하십시오.

## 애플리케이션 계층 서비스 거부 공격 \{#application-layer-dos-attack\}

서비스 거부(DoS, Denial of Service) 공격을 수행하는 방법에는 여러 가지가 있습니다. 공격이 특정 페이로드를 통해 ClickHouse 인스턴스를 비정상 종료시키는 데 집중되어 있다면, 시스템을 다시 실행 가능한 상태로 복구하거나 시스템을 재부팅한 뒤 접근을 제한하여 제어권을 다시 확보하십시오. 공격에 대한 추가 정보를 얻기 위해 다음 쿼리를 사용하여 [system.crash&#95;log](/operations/system-tables/crash_log)를 검토하십시오.

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```


## 침해된 ClickHouse가 생성한 AWS 역할 \{#compromised-clickhouse-created-aws-roles\}

ClickHouse는 시스템 기능을 제공하기 위해 미리 생성된 역할을 사용합니다. 이 섹션은 사용자가 CloudTrail이 활성화된 AWS를 사용하고 있으며 CloudTrail 로그에 접근할 수 있다고 가정합니다.

사고가 침해된 역할로 인해 발생했을 수 있다고 판단되면, ClickHouse IAM 역할 및 작업과 관련된 CloudTrail 및 CloudWatch의 활동을 검토하십시오. IAM 역할 목록은 설정의 일부로 제공된 [CloudFormation](/cloud/reference/byoc/reference/priviledge#cloudformation-iam-roles) 스택 또는 Terraform 모듈을 참고하십시오.

## EKS 클러스터에 대한 무단 액세스 \{#unauthorized-access-eks-cluster\}

ClickHouse BYOC는 EKS 내부에서 실행됩니다. 이 섹션에서는 사용자가 AWS에서 CloudTrail과 CloudWatch를 사용하고 있으며 로그에 액세스할 수 있다고 가정합니다.

사고가 손상된 EKS 클러스터로 인해 발생했을 가능성이 있다면, 아래 쿼리를 EKS CloudWatch 로그에서 실행하여 특정 위협을 식별합니다.

사용자 이름별 Kubernetes API 호출 횟수 집계

```sql
fields user.username
| stats count(*) as count by user.username
```

사용자가 ClickHouse 엔지니어인지 판별하기

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Kubernetes 시크릿에 접근하는 사용자 계정을 검토하고, 서비스 역할은 제외합니다

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
