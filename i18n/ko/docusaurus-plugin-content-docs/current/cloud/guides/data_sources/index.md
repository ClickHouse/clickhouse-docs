---
'slug': '/cloud/guides/data-sources'
'title': '데이터 소스'
'hide_title': true
'description': 'ClickHouse Cloud 가이드 섹션의 목차 페이지'
'doc_type': 'landing-page'
'keywords':
- 'cloud guides'
- 'documentation'
- 'how-to'
- 'cloud features'
- 'tutorials'
---

## Cloud 통합 {#cloud-integrations}

이 섹션은 추가 구성이 필요한 외부 데이터 소스와 ClickHouse Cloud를 통합하기 위한 가이드 및 참고 자료를 포함합니다.

| 페이지                                                           | 설명                                                                  |
|------------------------------------------------------------------|-----------------------------------------------------------------------|
| [Cloud IP 주소](/manage/data-sources/cloud-endpoints-api)        | 일부 테이블 함수 및 연결에 필요한 네트워킹 정보                     |
| [S3 데이터 안전하게 액세스하기](/cloud/data-sources/secure-s3)   | 역할 기반 액세스를 사용하여 AWS S3의 외부 데이터 소스에 액세스하기  |

## 외부 데이터 소스를 위한 추가 연결 {#additional-connections-for-external-data-sources}

### 데이터 수집을 위한 ClickPipes {#clickpipes-for-data-ingestion}

ClickPipes는 고객이 여러 소스에서 스트리밍 데이터를 쉽게 통합할 수 있게 해줍니다. 추가 정보는 통합 문서의 [ClickPipes](/integrations/clickpipes)를 참조하십시오.

### 외부 데이터 소스로서의 테이블 함수 {#table-functions-as-external-data-sources}

ClickHouse는 외부 데이터 소스에 액세스하기 위해 여러 가지 테이블 함수를 지원합니다. 자세한 내용은 SQL 참조 섹션의 [테이블 함수](/sql-reference/table-functions)를 참조하십시오.
