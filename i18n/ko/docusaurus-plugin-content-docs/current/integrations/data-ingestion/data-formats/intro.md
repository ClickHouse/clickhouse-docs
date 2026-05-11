---
slug: /integrations/data-formats
sidebar_label: '개요'
sidebar_position: 1
keywords: ['clickhouse', 'CSV', 'TSV', 'Parquet', 'clickhouse-client', 'clickhouse-local']
title: '다양한 데이터 형식에서 ClickHouse로 가져오기'
description: '다양한 데이터 형식을 ClickHouse로 가져오는 방법을 설명하는 페이지'
show_related_blogs: true
doc_type: 'guide'
---

# 다양한 데이터 형식에서 ClickHouse로 가져오기 \{#importing-from-various-data-formats-to-clickhouse\}

이 섹션에서는 다양한 파일 형식에서 데이터를 불러오는 예제를 확인할 수 있습니다.

### [**Binary**](/integrations/data-ingestion/data-formats/binary.md) \{#binary\}

ClickHouse Native, MessagePack, Protocol Buffers, Cap'n Proto와 같은 바이너리 포맷을 내보내거나 불러옵니다.

### [**CSV and TSV**](/integrations/data-ingestion/data-formats/csv-tsv.md) \{#csv-and-tsv\}

CSV 계열 형식(예: TSV)을 사용자 정의 헤더와 구분자를 사용해 가져오거나 내보낼 수 있습니다.

### [**JSON**](/integrations/data-ingestion/data-formats/json/intro.md) \{#json\}

객체 및 줄 단위 NDJSON을 포함한 다양한 형식의 JSON을 로드하고 내보낼 수 있습니다.

### [**Parquet data**](/integrations/data-ingestion/data-formats/parquet.md) \{#parquet-data\}

Parquet 및 Arrow와 같은 대표적인 Apache 데이터 형식을 처리합니다.

### [**SQL data**](/integrations/data-ingestion/data-formats/sql.md) \{#sql-data\}

MySQL 또는 Postgresql에 가져오기 위한 SQL 덤프가 필요하다면 이 섹션을 참고하십시오.

Grafana, Tableau 등과 같은 BI 도구를 연결하려는 경우, 문서의 [Visualize 카테고리](../../data-visualization/index.md)를 참고하십시오.