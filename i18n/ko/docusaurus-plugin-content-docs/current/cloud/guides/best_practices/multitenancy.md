---
'slug': '/cloud/bestpractices/multi-tenancy'
'sidebar_label': '다중 테넌시'
'title': '다중 테넌시'
'description': '다중 테넌시 구현을 위한 모범 사례'
'doc_type': 'guide'
'keywords':
- 'multitenancy'
- 'isolation'
- 'best practices'
- 'architecture'
- 'multi-tenant'
---

On a SaaS 데이터 분석 플랫폼에서는 조직, 고객 또는 비즈니스 유닛과 같은 여러 테넌트가 동일한 데이터베이스 인프라를 공유하면서 각자의 데이터를 논리적으로 분리하는 것이 일반적입니다. 이를 통해 다양한 사용자가 동일한 플랫폼 내에서 자신의 데이터에 안전하게 접근할 수 있습니다.

요구 사항에 따라 다중 테넌시를 구현하는 다양한 방법이 있습니다. 아래는 ClickHouse Cloud를 사용하여 이를 구현하는 방법에 대한 가이드입니다.

## 공유 테이블 {#shared-table}

이 접근 방식에서는 모든 테넌트의 데이터가 하나의 공유 테이블에 저장되며, 각 테넌트의 데이터를 식별하기 위해 사용되는 필드(또는 필드 집합)가 있습니다. 성능을 극대화하기 위해 이 필드는 [기본 키](/sql-reference/statements/create/table#primary-key)에 포함되어야 합니다. 사용자가 자신의 테넌트에 해당하는 데이터만 접근할 수 있도록 하기 위해 [역할 기반 접근 제어](/operations/access-rights)를 사용하며, 이는 [행 정책](/operations/access-rights#row-policy-management)을 통해 구현됩니다.

> **이 접근 방식은 모든 테넌트가 동일한 데이터 스키마를 공유하고 데이터 볼륨이 적당할 경우(< TBs) 관리하기 가장 간단하므로 추천합니다.**

모든 테넌트 데이터를 하나의 테이블로 통합함으로써 데이터 압축 최적화를 통해 저장 효율성이 향상되고 메타데이터 오버헤드가 줄어듭니다. 추가로, 모든 데이터가 중앙에서 관리되므로 스키마 업데이트가 간소화됩니다.

이 방법은 특히 많은 수의 테넌트를 처리하는 데 효과적입니다(수백만 개 가능).

그러나 테넌트가 서로 다른 데이터 스키마를 가지고 있거나 시간이 지남에 따라 차별화될 것으로 예상되는 경우 대안 접근 방식이 더 적합할 수 있습니다.

테넌트 간의 데이터 볼륨 차이가 심한 경우, 작은 테넌트는 불필요한 쿼리 성능 저하를 경험할 수 있습니다. 이 문제는 기본 키에 테넌트 필드를 포함시킴으로써 대체로 완화됩니다.

### 예제 {#shared-table-example}

다음은 공유 테이블 다중 테넌시 모델 구현의 예입니다. 

먼저, 기본 키에 `tenant_id` 필드를 포함한 공유 테이블을 생성해 봅시다.

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

가짜 데이터를 삽입해 보겠습니다.

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

그 후, `user_1`과 `user_2`라는 두 사용자를 생성합시다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

우리는 `user_1`과 `user_2`가 자신의 테넌트 데이터에만 접근할 수 있도록 제한하는 [행 정책](/sql-reference/statements/create/row-policy)을 [생성](/sql-reference/statements/create/row-policy)합니다. 

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

그 후, 공통 역할을 사용하여 공유 테이블에 대해 [`GRANT SELECT`](/sql-reference/statements/grant#usage) 권한을 부여합니다.

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

이제 `user_1`로 연결하고 간단한 선택 쿼리를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다. 

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

## 별도 테이블 {#separate-tables}

이 접근 방식에서는 각 테넌트의 데이터가 동일한 데이터베이스 내의 별도 테이블에 저장되며, 테넌트를 식별하기 위한 특정 필드가 필요하지 않습니다. 사용자 접근은 [GRANT 문](/sql-reference/statements/grant)을 사용하여 강제되며, 각 사용자가 자신의 테넌트 데이터가 포함된 테이블만 접근할 수 있도록 보장합니다.

> **별도 테이블을 사용하는 것은 테넌트가 서로 다른 데이터 스키마를 가지고 있을 때 좋은 선택입니다.**

쿼리 성능이 중요한 경우, 매우 큰 데이터 세트를 가진 몇몇 테넌트와 관련된 시나리오에서는 이 접근 방식이 공유 테이블 모델보다 더 뛰어날 수 있습니다. 다른 테넌트의 데이터를 필터링할 필요가 없기 때문에 쿼리가 더 효율적일 수 있습니다. 추가적으로, 기본 키는 추가 필드(예: 테넌트 ID)를 기본 키에 포함할 필요가 없기 때문에 더욱 최적화할 수 있습니다.

이 접근 방식은 수천 개의 테넌트에 대해서는 확장이 불가능하다는 점에 유의하세요. [사용량 한계](/cloud/bestpractices/usage-limits)를 참조하세요.

### 예제 {#separate-tables-example}

다음은 별도 테이블 다중 테넌시 모델 구현의 예입니다. 

먼저, `tenant_1`의 이벤트를 위한 하나의 테이블과 `tenant_2`의 이벤트를 위한 또 다른 테이블을 생성해 봅시다.

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

가짜 데이터를 삽입해 보겠습니다.

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

그 후, `user_1`과 `user_2`라는 두 사용자를 생성합시다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

그럼 해당 테이블에 대해 `GRANT SELECT` 권한을 부여합니다.

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

이제 `user_1`로 연결하고 이 사용자의 해당 테이블에서 간단한 선택 쿼리를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다. 

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

## 별도 데이터베이스 {#separate-databases}

각 테넌트의 데이터는 동일한 ClickHouse 서비스 내의 별도 데이터베이스에 저장됩니다.

> **이 접근 방식은 각 테넌트가 많은 수의 테이블과 물리화된 뷰를 필요로 하고 서로 다른 데이터 스키마가 있을 경우 유용합니다. 그러나 테넌트 수가 많아지면 관리하기 어려워질 수 있습니다.**

구현은 별도 테이블 접근 방식과 유사하지만, 테이블 수준에서 권한을 부여하는 대신 데이터베이스 수준에서 권한을 부여합니다.

이 접근 방식은 수천 개의 테넌트에 대해서는 확장이 불가능하다는 점에 유의하세요. [사용량 한계](/cloud/bestpractices/usage-limits)를 참조하세요.

### 예제 {#separate-databases-example}

다음은 별도 데이터베이스 다중 테넌시 모델 구현의 예입니다. 

먼저, `tenant_1`과 `tenant_2`를 위한 두 개의 데이터베이스를 생성해 봅시다.

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

가짜 데이터를 삽입해 보겠습니다.

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

그 후, `user_1`과 `user_2`라는 두 사용자를 생성합시다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

그럼 해당 테이블에 대해 `GRANT SELECT` 권한을 부여합니다.

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

이제 `user_1`로 연결하고 적절한 데이터베이스의 이벤트 테이블에서 간단한 선택 쿼리를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다. 

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

## 컴퓨트-컴퓨트 분리 {#compute-compute-separation}

위에서 설명한 세 가지 접근 방식은 [창고](/cloud/reference/warehouses#what-is-a-warehouse)를 사용하여 추가로 분리될 수 있습니다. 데이터는 공통 객체 저장소를 통해 공유되지만, 각 테넌트는 [컴퓨트-컴퓨트 분리](/cloud/reference/warehouses#what-is-compute-compute-separation)를 통해 서로 다른 CPU/메모리 비율을 가진 자체 컴퓨트 서비스를 가질 수 있습니다. 

사용자 관리는 모두 같은 창고 내 서비스에서 [접근 권한을 공유](/cloud/reference/warehouses#database-credentials)하기 때문에 전에 설명한 접근 방식과 유사합니다.

창고에서는 자식 서비스의 수가 제한되어 있다는 점에 유의하세요. [창고 한계](/cloud/reference/warehouses#limitations)를 참조하세요.

## 별도 클라우드 서비스 {#separate-service}

가장 급진적인 접근 방식은 각 테넌트마다 다른 ClickHouse 서비스를 사용하는 것입니다.

> **이 방법은 테넌트 데이터가 법적, 보안 또는 근접성 이유로 서로 다른 지역에 저장되어야 하는 경우 해결책이 될 수 있습니다.**

사용자가 자신에게 해당하는 테넌트 데이터에 접근할 수 있는 각 서비스에 사용자 계정을 생성해야 합니다.

이 접근 방식은 관리하기가 더 어렵고 각 서비스에 추가 오버헤드가 발생합니다. 각 서비스는 자체 인프라가 필요합니다. 서비스는 [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 통해 관리될 수 있으며, [공식 Terraform 프로바이더](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)를 통해 오케스트레이션도 가능합니다.

### 예제 {#separate-service-example}

다음은 별도 서비스 다중 테넌시 모델 구현의 예입니다. 이 예는 하나의 ClickHouse 서비스에서 테이블과 사용자를 생성하는 방법을 보여줍니다. 동일한 작업을 모든 서비스에서 복제해야 합니다. 

먼저, `events` 테이블을 생성해 봅시다.

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

가짜 데이터를 삽입해 보겠습니다.

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

그 후, `user_1`을 생성합니다.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

그 후, 해당 테이블에 대해 `GRANT SELECT` 권한을 부여합니다.

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

이제 테넌트 1을 위한 서비스에 `user_1`로 연결하고 간단한 선택 쿼리를 실행할 수 있습니다. 첫 번째 테넌트의 행만 반환됩니다. 

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
