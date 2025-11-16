---
'sidebar_label': '개요'
'sidebar_position': 1
'slug': '/integrations/migration/overview'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
'title': 'ClickHouse로 데이터 이전하기'
'description': 'ClickHouse로 데이터를 이전하기 위해 사용할 수 있는 옵션에 대해 설명하는 페이지'
'doc_type': 'guide'
---


# ClickHouse로 데이터 마이그레이션

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>

현재 데이터가 위치한 곳에 따라 ClickHouse Cloud로 데이터를 마이그레이션할 수 있는 여러 옵션이 있습니다:

- [자체 관리에서 클라우드로](/cloud/migration/clickhouse-to-cloud): `remoteSecure` 함수를 사용하여 데이터를 전송합니다.
- [다른 DBMS에서](/cloud/migration/clickhouse-local): 현재 DBMS에 적합한 ClickHouse 테이블 함수와 함께 [clickhouse-local] ETL 도구를 사용합니다.
- [어디서든지!](/cloud/migration/etl-tool-to-clickhouse): 다양한 데이터 소스에 연결되는 여러 인기 있는 ETL/ELT 도구 중 하나를 사용합니다.
- [객체 저장소에서](/integrations/migration/object-storage-to-clickhouse): S3에서 ClickHouse로 쉽게 데이터를 삽입합니다.

예제 [Redshift에서 마이그레이션](/migrations/redshift/migration-guide)에서는 ClickHouse로 데이터를 마이그레이션하는 세 가지 방법을 제시합니다.
