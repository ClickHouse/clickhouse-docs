---
'sidebar_label': '데이터베이스 감사 로그'
'slug': '/cloud/security/audit-logging/database-audit-log'
'title': '데이터베이스 감사 로그'
'description': '이 페이지에서는 사용자가 데이터베이스 감사 로그를 검토하는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'audit logging'
- 'database logs'
- 'compliance'
- 'security'
- 'monitoring'
---


# 데이터베이스 감사 로그 {#database-audit-log}

ClickHouse는 기본적으로 데이터베이스 감사 로그를 제공합니다. 이 페이지에서는 보안 관련 로그에 중점을 둡니다. 시스템에서 기록하는 데이터에 대한 자세한 내용은 [시스템 테이블](/operations/system-tables/overview) 문서를 참조하세요.

:::tip 로그 보존
정보는 시스템 테이블에 직접 기록되며 기본적으로 최대 30일 동안 보존됩니다. 이 기간은 시스템의 병합 빈도에 따라 길어지거나 짧아질 수 있습니다. 고객은 로그를 더 오래 보관하거나 보안 정보 및 이벤트 관리(SIEM) 시스템으로 로그를 내보내기 위한 추가 조치를 취할 수 있습니다. 아래에서 자세한 내용을 확인하세요.
:::

## 보안 관련 로그 {#security-relevant-logs}

ClickHouse는 주로 세션 및 쿼리 로그에 보안 관련 데이터베이스 이벤트를 기록합니다.

[system.session_log](/operations/system-tables/session_log) 는 성공 및 실패한 로그인 시도를 기록하며, 인증 시도의 위치도 포함됩니다. 이 정보는 ClickHouse 인스턴스에 대한 자격 증명 착취 또는 무차별 대입 공격을 식별하는 데 사용할 수 있습니다.

로그인 실패를 보여주는 샘플 쿼리
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

[system.query_log](/operations/system-tables/query_log) 는 ClickHouse 인스턴스에서 실행된 쿼리 활동을 캡처합니다. 이 정보는 위협 행위자가 실행한 쿼리를 결정하는 데 유용합니다.

"compromised_account" 사용자 활동을 검색하는 샘플 쿼리
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

## 서비스 내 로그 데이터 보존 {#reatining-log-data-within-services}

더 긴 보존 기간이나 로그 내구성이 필요한 고객은 물리화된 뷰를 사용하여 이러한 목표를 달성할 수 있습니다. 물리화된 뷰에 대한 더 많은 정보, 그 정의, 이점 및 구현 방법은 [물리화된 뷰](/materialized-views) 비디오 및 문서를 참조하세요.

## 로그 내보내기 {#exporting-logs}

시스템 로그는 SIEM 시스템과 호환되는 다양한 형식을 사용하여 저장 위치에 기록하거나 내보낼 수 있습니다. 더 많은 정보는 [테이블 함수](/sql-reference/table-functions) 문서를 참조하세요. 가장 일반적인 방법은 다음과 같습니다:
- [S3에 기록](/sql-reference/table-functions/s3)
- [GCS에 기록](/sql-reference/table-functions/gcs)
- [Azure Blob Storage에 기록](/sql-reference/table-functions/azureBlobStorage)
