---
sidebar_label: '개요'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'ClickHouse로 데이터 마이그레이션하기'
description: '데이터를 ClickHouse로 마이그레이션할 때 사용할 수 있는 옵션을 설명하는 페이지입니다.'
doc_type: 'guide'
---

# ClickHouse로 데이터 마이그레이션 \{#migrating-data-into-clickhouse\}

<div class="vimeo-container">
  <iframe
    src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

<br />

현재 데이터가 어디에 위치하는지에 따라 ClickHouse Cloud로 데이터를 마이그레이션하는 방법에는 여러 가지가 있습니다:

* [자가 관리형에서 Cloud로](/cloud/migration/clickhouse-to-cloud): `remoteSecure` 함수를 사용하여 데이터를 전송합니다.
* [다른 DBMS에서](/cloud/migration/clickhouse-local): [clickhouse-local] ETL 도구와 현재 사용 중인 DBMS에 적합한 ClickHouse 테이블 함수(table function)를 함께 사용합니다.
* [어디서든!](/cloud/migration/etl-tool-to-clickhouse): 다양한 유형의 데이터 소스에 연결되는 여러 인기 ETL/ELT 도구 가운데 하나를 사용합니다.
* [객체 스토리지](/integrations/migration/object-storage-to-clickhouse): S3에서 ClickHouse로 데이터를 손쉽게 적재합니다.

예제 문서인 [Migrate from Redshift](/migrations/redshift/migration-guide)에서는 데이터를 ClickHouse로 마이그레이션하는 세 가지 방법을 제시합니다.