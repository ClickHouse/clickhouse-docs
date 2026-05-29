---
slug: /cloud/managed-postgres/migrations/faq
sidebar_label: '자주 묻는 질문'
title: 'Managed Postgres 마이그레이션 FAQ'
description: 'ClickHouse Managed Postgres로 데이터를 마이그레이션할 때 자주 묻는 질문입니다.'
keywords: ['postgres', '마이그레이션', 'faq', 'managed postgres', '논리적 복제', 'enum', '고유 제약 조건']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migrations-faq" />

# Managed Postgres 마이그레이션 FAQ \{#managed-postgres-migrations-faq\}

Postgres 복제 작동 방식과 관련된 여러 질문(`TOAST` 컬럼, replication slot, publication, 스키마 변경, 데이터 타입 매핑 등)은 [ClickPipes for Postgres FAQ](/integrations/clickpipes/postgres/faq)에서 다룹니다. 해당 정보는 Managed Postgres 마이그레이션에도 동일하게 적용됩니다.

### 복제 중 &quot;enum에 대한 잘못된 입력 값&quot; 오류가 발생합니다 \{#invalid-enum-value\}

이 오류는 원본 Postgres에 대상 Managed Postgres에는 없는 enum 값이 있을 때 발생합니다. 논리적 복제는 `ALTER TYPE ... ADD VALUE` 명령을 자동으로 전파하지 않으므로, 초기 스키마 설정 후 원본에 새로 추가된 enum 값 때문에 대상에서 삽입이 실패합니다.

이 문제를 해결하려면 대상 Postgres의 enum 타입에 누락된 값을 추가하십시오:

```sql
ALTER TYPE your_enum_type ADD VALUE 'new_value';
```

`your_enum_type`는 enum 유형의 이름으로, `'new_value'`는 오류 메시지에 표시된 누락된 값으로 대체하십시오.

### 복제 중 고유 제약 조건 위반 오류가 발생합니다 \{#unique-constraint-violation\}

논리적 복제 중에는 복제 순서로 인해 대상에 이미 있는 고유 제약 조건과 충돌이 발생하여 고유 제약 조건 위반이 생길 수 있습니다. 이는 후속 업데이트에서 해결되기 전에 일시적으로 고유성이 깨지는 작업을 재생하는 CDC 워크로드에서 발생할 수 있습니다.

복제를 다시 진행할 수 있도록 대상 Postgres에서 고유 제약 조건을 삭제하십시오:

```sql
ALTER TABLE your_table DROP CONSTRAINT your_constraint_name;
```

다음을 실행하면 제약 조건 이름을 확인할 수 있습니다:

```sql
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'u';
```

복제가 완료되어 원본이 더 이상 활성 상태가 아니게 되면 컷오버 중에 제약 조건을 다시 추가하십시오:

```sql
ALTER TABLE your_table ADD CONSTRAINT your_constraint_name UNIQUE (column1, column2);
```