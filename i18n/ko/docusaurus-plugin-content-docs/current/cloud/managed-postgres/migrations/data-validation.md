---
slug: /cloud/managed-postgres/migrations/data-validation
sidebar_label: '데이터 검증'
title: '마이그레이션 후 데이터 정확성 검증'
description: 'ClickHouse Managed Postgres로 마이그레이션한 후 데이터 정확성을 검증하는 방법을 알아보십시오'
keywords: ['postgres', 'postgresql', '논리 복제', '마이그레이션', '데이터 전송', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

## 모든 테이블의 개수 비교 \{#data-validation-counts\}

마이그레이션 후 데이터가 정확한지 확인하는 간단한 방법은 원본 데이터베이스와 대상 데이터베이스의 모든 테이블 개수를 비교하는 것입니다. 이를 위해 다음 쿼리를 두 데이터베이스에서 모두 실행할 수 있습니다:

```sql
SELECT table_name, 
       (xpath('/row/cnt/text()', xml_count))[1]::text::bigint AS row_count
FROM (
  SELECT table_name, 
         query_to_xml('SELECT count(*) AS cnt FROM ' || quote_ident(table_name), false, true, '') AS xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t
ORDER BY table_name;
```