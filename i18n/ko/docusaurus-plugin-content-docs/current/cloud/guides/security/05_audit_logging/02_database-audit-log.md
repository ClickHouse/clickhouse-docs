---
sidebar_label: '데이터베이스 감사 로그'
slug: /cloud/security/audit-logging/database-audit-log
title: '데이터베이스 감사 로그'
description: '이 페이지에서는 데이터베이스 감사 로그를 검토하는 방법을 설명합니다'
doc_type: 'guide'
keywords: ['감사 로깅', '데이터베이스 로그', '규정 준수', '보안', '모니터링']
---

# 데이터베이스 감사 로그 \{#database-audit-log\}

ClickHouse는 기본적으로 데이터베이스 감사 로그를 제공합니다. 이 페이지는 보안 관련 로그에 초점을 맞춥니다. 시스템에서 기록하는 데이터에 대한 자세한 내용은 [system tables](/operations/system-tables/overview) 시스템 테이블(system tables) 문서를 참고하십시오.

:::tip 로그 보존
정보는 시스템 테이블(system tables)에 직접 기록되며 기본적으로 최대 30일 동안 보존됩니다. 이 기간은 시스템에서 머지 작업이 수행되는 빈도에 따라 더 길어지거나 짧아질 수 있습니다. 사용자는 로그를 더 오래 보관하거나 장기 보관을 위해 보안 정보 및 이벤트 관리(SIEM) 시스템으로 로그를 내보내기 위한 추가 조치를 취할 수 있습니다. 자세한 내용은 아래를 참고하십시오.
:::

## 보안 관련 로그 \{#security-relevant-logs\}

ClickHouse는 보안과 관련된 데이터베이스 이벤트를 주로 세션 로그와 쿼리 로그에 기록합니다.

[system.session&#95;log](/operations/system-tables/session_log)는 성공한 로그인 시도와 실패한 로그인 시도, 그리고 인증 시도가 발생한 위치를 기록합니다. 이 정보는 ClickHouse 인스턴스를 대상으로 하는 자격 증명 스터핑(credential stuffing)이나 무차별 대입(brute force) 공격을 식별하는 데 사용할 수 있습니다.

로그인 실패를 보여주는 예제 쿼리

```sql
select event_time
    ,type
    ,user
    ,auth_type
    ,client_address 
FROM clusterAllReplicas('default',system.session_log) 
WHERE type='LoginFailure' 
LIMIT 100
```

[system.query&#95;log](/operations/system-tables/query_log)는 ClickHouse 인스턴스에서 실행된 쿼리 활동을 기록합니다. 이 정보는 위협 행위자가 어떤 쿼리를 실행했는지 파악하는 데 유용합니다.

&quot;compromised&#95;account&quot; 사용자 활동을 검색하기 위한 예시 쿼리

```sql
SELECT event_time
    ,address
    ,initial_user
    ,initial_address
    ,forwarded_for
    ,query 
FROM clusterAllReplicas('default', system.query_log) 
WHERE user=’compromised_account’
```


## 서비스 내 로그 데이터 보존 \{#reatining-log-data-within-services\}

더 긴 보존 기간이나 로그의 지속성이 필요한 사용자는 이러한 요구 사항을 충족하기 위해 materialized views를 사용할 수 있습니다. materialized views의 개념, 장점 및 구현 방법에 대한 자세한 내용은 [materialized views](/materialized-views) 동영상과 문서를 참조하십시오.

## 로그 내보내기 \{#exporting-logs\}

시스템 로그는 SIEM 시스템과 호환되는 다양한 형식으로 저장 위치에 기록하거나 내보낼 수 있습니다. 자세한 내용은 [table functions](/sql-reference/table-functions) 문서를 참조하십시오. 가장 일반적인 방법은 다음과 같습니다.

- [S3에 쓰기](/sql-reference/table-functions/s3)
- [GCS에 쓰기](/sql-reference/table-functions/gcs)
- [Azure Blob Storage에 쓰기](/sql-reference/table-functions/azureBlobStorage)