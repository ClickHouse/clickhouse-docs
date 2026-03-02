---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: '멀티 테넌시'
title: '멀티 테넌시'
description: '멀티 테넌시를 구현하기 위한 모범 사례'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

SaaS 데이터 분석 플랫폼에서는 여러 테넌트(조직, 고객, 사업 부서 등)가 동일한 데이터베이스 인프라를 공유하면서도 각자의 데이터에 대해 논리적 분리를 유지하는 것이 일반적입니다. 이를 통해 서로 다른 사용자가 동일한 플랫폼 내에서 자신의 데이터에만 안전하게 액세스할 수 있습니다.

요구 사항에 따라 멀티 테넌시를 구현하는 방법은 여러 가지가 있습니다. 아래에서는 ClickHouse Cloud에서 멀티 테넌시를 구현하는 방법을 안내합니다.

## 공유 테이블 \{#shared-table\}

이 방식에서는 모든 테넌트의 데이터를 단일 공유 테이블에 저장하고, 각 테넌트의 데이터를 식별하기 위해 하나의 필드(또는 여러 필드의 집합)를 사용합니다. 성능을 극대화하려면 이 필드를 [기본 키(Primary Key)](/sql-reference/statements/create/table#primary-key)에 포함해야 합니다. 각 테넌트에 속한 데이터에만 접근하도록 보장하기 위해 [역할 기반 접근 제어](/operations/access-rights)를 사용하며, 이는 [행 정책(row policy)](/operations/access-rights#row-policy-management)을 통해 구현합니다.

> **모든 테넌트가 동일한 데이터 스키마를 사용하고 데이터 볼륨이 중간 규모(수 TB 미만)인 경우, 관리가 가장 간단하므로 이 방식을 권장합니다.**

모든 테넌트 데이터를 단일 테이블로 통합하면 데이터 압축 최적화 및 메타데이터 오버헤드 감소를 통해 저장 효율성이 향상됩니다. 또한 모든 데이터가 중앙에서 관리되므로 스키마 업데이트도 단순해집니다.

이 방법은 특히 (잠재적으로 수백만에 이르는) 매우 많은 수의 테넌트를 처리하는 데 효과적입니다.

다만 테넌트별로 데이터 스키마가 다르거나, 시간이 지남에 따라 점차 달라질 것으로 예상되는 경우에는 다른 방식이 더 적합할 수 있습니다.

테넌트 간 데이터 볼륨 차이가 큰 경우, 소규모 테넌트는 불필요한 쿼리 성능 저하를 겪을 수 있습니다. 이 문제는 테넌트 필드를 기본 키에 포함하면 상당 부분 완화된다는 점에 유의하십시오.

### 예시 \{#shared-table-example\}

공유 테이블 기반 다중 테넌시 모델 구현 예시입니다.

먼저, 기본 키에 `tenant_id` 필드를 포함하는 공유 테이블을 생성합니다.

```sql
--- Create table events. Using tenant_id as part of the primary key
CREATE TABLE events
(
    tenant_id UInt32,                 -- Tenant identifier
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (tenant_id, timestamp)
```

예제 데이터를 삽입해 보겠습니다.

```sql
-- Insert some dummy rows
INSERT INTO events (tenant_id, id, type, timestamp, user_id, data)
VALUES
(1, '7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
(1, '846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
(1, '6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
(2, '7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
(2, '6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
(2, '43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
(1, '83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
(1, '975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}'),
(2, 'f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
(2, '5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}'),
```

이제 `user_1`과 `user_2`라는 두 사용자를 생성합니다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

[행 정책(row policy)을 생성](/sql-reference/statements/create/row-policy)하여 `user_1`과 `user_2`가 각자의 테넌트 데이터에만 액세스하도록 제한합니다.

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

그런 다음 공통 역할을 사용하여 공유 테이블에 대해 [`GRANT SELECT`](/sql-reference/statements/grant#usage) 권한을 부여합니다.

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```


이제 `user_1`로 연결한 뒤 간단한 SELECT 쿼리를 실행하면 첫 번째 테넌트의 행만 반환됩니다.

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │         1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │         1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │         1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │         1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │         1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## Separate tables \{#separate-tables\}

이 접근 방식에서는 각 테넌트의 데이터가 동일한 데이터베이스 내에서 별도의 테이블에 저장되므로, 테넌트를 식별하기 위한 특정 필드가 필요하지 않습니다. 사용자 접근 제어는 [GRANT statement](/sql-reference/statements/grant)를 통해 적용되며, 각 사용자는 자신의 테넌트 데이터가 포함된 테이블에만 접근할 수 있습니다.

> **Separate tables 방식은 테넌트마다 데이터 스키마가 다른 경우에 적합합니다.**

쿼리 성능이 매우 중요한, 소수의 테넌트가 매우 큰 데이터셋을 보유한 시나리오에서는 이 방식이 공유 테이블 모델보다 더 나은 성능을 낼 수 있습니다. 다른 테넌트의 데이터를 필터링할 필요가 없으므로 쿼리가 더 효율적일 수 있습니다. 또한 기본 키(primary key)에 테넌트 ID와 같은 추가 필드를 포함할 필요가 없으므로 기본 키를 더욱 최적화할 수 있습니다. 

이 접근 방식은 수천 개 수준의 테넌트 환경에는 적절히 확장되지 않는다는 점에 유의하십시오. [usage limits](/cloud/bestpractices/usage-limits)를 참조하십시오.

### 예시 \{#separate-tables-example\}

다음은 개별 테이블 멀티 테넌시 모델 구현 예시입니다.

먼저 두 개의 테이블을 생성하세요. 하나는 `tenant_1`의 이벤트용이고, 다른 하나는 `tenant_2`의 이벤트용입니다.

```sql
-- Create table for tenant 1 
CREATE TABLE events_tenant_1
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes

-- Create table for tenant 2 
CREATE TABLE events_tenant_2
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes
```

테스트 데이터를 삽입합니다.

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

그런 다음 두 개의 사용자 `user_1`과 `user_2`를 생성하세요.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

그런 다음 해당 테이블에 대해 `GRANT SELECT` 권한을 부여하십시오.

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

이제 `user_1`로 연결하여 해당 사용자에 대응하는 테이블에서 간단한 SELECT를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다. 

```sql
-- Logged as user_1
SELECT *
FROM default.events_tenant_1

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## Separate databases \{#separate-databases\}

각 테넌트의 데이터는 동일한 ClickHouse 서비스 내에서 별도의 데이터베이스에 저장됩니다.

> **이 방식은 각 테넌트가 많은 수의 테이블과 필요에 따라 여러 개의 구체화된 뷰(materialized view)를 필요로 하고, 서로 다른 데이터 스키마를 갖는 경우에 유용합니다. 그러나 테넌트 수가 많아지면 관리가 어려워질 수 있습니다.**

구현 방식은 별도 테이블 접근 방식과 유사하지만, 테이블 단위로 권한을 부여하는 대신 데이터베이스 단위로 권한을 부여합니다.

참고로 이 방식은 수천 개 규모의 테넌트에는 확장되지 않습니다. [usage limits](/cloud/bestpractices/usage-limits)를 참조하십시오.

### 예시 \{#separate-databases-example\}

이 예시는 별도 데이터베이스를 사용하는 멀티 테넌시 모델 구현 예시입니다.

먼저 `tenant_1`용 데이터베이스와 `tenant_2`용 데이터베이스, 이렇게 두 개의 데이터베이스를 CREATE합니다.

```sql
-- Create database for tenant_1
CREATE DATABASE tenant_1;

-- Create database for tenant_2
CREATE DATABASE tenant_2;
```

```sql
-- Create table for tenant_1
CREATE TABLE tenant_1.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);

-- Create table for tenant_2
CREATE TABLE tenant_2.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);
```

샘플 데이터를 삽입해 보겠습니다.

```sql
INSERT INTO tenant_1.events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

이제 `user_1`과 `user_2` 두 사용자를 생성합니다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

그런 다음 해당 테이블에 `GRANT SELECT` 권한을 부여합니다.

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```


이제 `user_1`로 연결한 후 해당 데이터베이스의 events 테이블에서 간단한 SELECT 쿼리를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다.

```sql
-- Logged as user_1
SELECT *
FROM tenant_1.events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## 컴퓨트-컴퓨트 분리 \{#compute-compute-separation\}

위에서 설명한 세 가지 접근 방식은 [Warehouses](/cloud/reference/warehouses#what-is-a-warehouse)를 사용하여 추가로 격리할 수 있습니다. 데이터는 공용 객체 스토리지를 통해 공유되지만, [compute-compute separation](/cloud/reference/warehouses#what-is-compute-compute-separation)을 통해 각 테넌트는 서로 다른 CPU/메모리 비율을 가진 자체 컴퓨트 서비스를 가질 수 있습니다. 

USER 관리는 이전에 설명한 접근 방식과 유사하며, 하나의 Warehouse 안에 있는 모든 서비스는 [액세스 제어를 공유](/cloud/reference/warehouses#database-credentials)합니다. 

하나의 Warehouse에 포함될 수 있는 하위 서비스의 개수는 비교적 적은 수로 제한된다는 점에 유의하십시오. 자세한 내용은 [Warehouse 제한 사항](/cloud/reference/warehouses#limitations)을 참조하십시오.

## 별도의 Cloud 서비스 \{#separate-service\}

가장 극단적인 방법은 테넌트마다 서로 다른 ClickHouse 서비스를 사용하는 것입니다. 

> **이 비교적 드문 방법은 법적, 보안 또는 지연 시간 등의 이유로 테넌트 데이터를 서로 다른 리전에 저장해야 하는 경우에 대한 해결책이 될 수 있습니다.**

각 서비스마다 사용자 계정을 생성하여, 해당 계정이 자신의 테넌트 데이터에 접근할 수 있도록 해야 합니다.

이 접근 방식은 각 서비스가 동작하기 위한 별도의 인프라를 필요로 하므로 관리가 더 어렵고 서비스별로 오버헤드가 발생합니다. 서비스는 [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 통해 관리할 수 있으며, [공식 Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)를 통해 오케스트레이션을 수행할 수도 있습니다.

### 예시 \{#separate-service-example\}

이는 서비스 분리형 멀티 테넌시 모델 구현 예시입니다. 이 예시에서는 하나의 ClickHouse 서비스에서 테이블과 사용자를 생성하는 과정을 보여 주며, 동일한 구성을 모든 서비스에 동일하게 적용해야 합니다.

먼저 `events` 테이블을 생성합니다.

```sql
-- Create table for tenant_1
CREATE TABLE events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);
```

샘플 데이터를 삽입해 보겠습니다.

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

그러면 두 명의 사용자 `user_1`을 생성해 보겠습니다

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

그런 다음 해당 테이블에 `GRANT SELECT` 권한을 부여합니다.

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

이제 테넌트 1용 서비스에 `user_1`로 접속하여 간단한 SELECT를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다.

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```
