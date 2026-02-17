---
slug: /cloud/guides/data-sources
title: '데이터 소스'
hide_title: true
description: 'ClickHouse Cloud 가이드 섹션을 위한 목차 페이지'
doc_type: 'landing-page'
keywords: ['Cloud 가이드', '문서', '사용 방법 안내', 'Cloud 기능', '튜토리얼']
---

## Cloud 통합 \{#cloud-integrations\}

이 섹션에는 추가 구성이 필요한 외부 데이터 소스와 ClickHouse Cloud를 통합하기 위한 가이드와 참고 문서가 포함되어 있습니다.

| 페이지                                                            | 설명                                                                      |
|-----------------------------------------------------------------|---------------------------------------------------------------------------|
| [Cloud IP addresses](/manage/data-sources/cloud-endpoints-api)  | 일부 테이블 함수와 연결에 필요한 네트워크 정보                           |
| [Accessing S3 data securely](/cloud/data-sources/secure-s3)     | 역할 기반 액세스를 사용해 AWS S3에 있는 외부 데이터 소스에 안전하게 액세스 |
| [Accessing GCS data securely](/cloud/data-sources/secure-gcs)   | HMAC 키를 사용해 GCS에 있는 외부 데이터 소스에 안전하게 액세스           |

## 외부 데이터 소스용 추가 연결 \{#additional-connections-for-external-data-sources\}

### 데이터 수집을 위한 ClickPipes \{#clickpipes-for-data-ingestion\}

ClickPipes를 사용하면 여러 소스에서 스트리밍 데이터를 손쉽게 통합할 수 있습니다. 자세한 내용은 Integrations 문서의 [ClickPipes](/integrations/clickpipes) 항목을 참조하십시오.

### 외부 데이터 소스로 사용하는 테이블 함수 \{#table-functions-as-external-data-sources\}

ClickHouse는 외부 데이터 소스에 액세스하기 위한 여러 테이블 함수를 지원합니다. 자세한 내용은 SQL 참고 문서의 [테이블 함수(table functions)](/sql-reference/table-functions) 섹션을 참조하십시오.