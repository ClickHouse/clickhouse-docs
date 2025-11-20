---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'Multi tenancy'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

SaaS 型のデータ分析プラットフォームでは、組織、顧客、事業部門などの複数のテナントが、データを論理的に分離したまま同じデータベース基盤を共有することが一般的です。これにより、異なるユーザーでも同一プラットフォーム上で自分のデータのみに安全にアクセスできます。

要件に応じて、マルチテナンシーを実現する方法はいくつかあります。以下では、ClickHouse Cloud でそれらを実装する方法を解説します。



## 共有テーブル {#shared-table}

このアプローチでは、すべてのテナントのデータを単一の共有テーブルに格納し、各テナントのデータを識別するためのフィールド(または複数のフィールド)を使用します。パフォーマンスを最大化するために、このフィールドは[プライマリキー](/sql-reference/statements/create/table#primary-key)に含める必要があります。ユーザーが各自のテナントに属するデータのみにアクセスできるようにするため、[行ポリシー](/operations/access-rights#row-policy-management)を通じて実装された[ロールベースアクセス制御](/operations/access-rights)を使用します。

> **すべてのテナントが同じデータスキーマを共有し、データ量が中程度(< TB)の場合、このアプローチは管理が最も簡単であるため推奨されます**

すべてのテナントデータを単一のテーブルに統合することで、データ圧縮の最適化とメタデータオーバーヘッドの削減により、ストレージ効率が向上します。また、すべてのデータが一元管理されるため、スキーマの更新が簡素化されます。

この方法は、大量のテナント(数百万規模の可能性)を処理する場合に特に効果的です。

ただし、テナントが異なるデータスキーマを持つ場合や、時間の経過とともに分岐することが予想される場合は、代替アプローチの方が適している可能性があります。

テナント間でデータ量に大きな差がある場合、小規模なテナントは不要なクエリパフォーマンスへの影響を受ける可能性があります。なお、この問題はプライマリキーにテナントフィールドを含めることで大幅に軽減されます。

### 例 {#shared-table-example}

これは共有テーブルマルチテナンシーモデルの実装例です。

まず、プライマリキーに`tenant_id`フィールドを含む共有テーブルを作成します。

```sql
--- テーブルeventsを作成。tenant_idをプライマリキーの一部として使用
CREATE TABLE events
(
    tenant_id UInt32,                 -- テナント識別子
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (tenant_id, timestamp)
```

ダミーデータを挿入してみましょう。


```sql
-- ダミーデータを挿入
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

それでは、`user_1` と `user_2` という 2 つのユーザーを作成します。

```sql
-- ユーザーを作成する
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1` と `user_2` が自分のテナントのデータにのみアクセスできるように制限する [行ポリシーを作成](/sql-reference/statements/create/row-policy) します。

```sql
-- 行ポリシーの作成
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通ロールを使用して共有テーブルに対する [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- ロールを作成
CREATE ROLE user_role

-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

これで `user_1` として接続し、単純な SELECT 文を実行できます。最初のテナントの行だけが返されます。

```sql
-- user_1としてログイン済み
SELECT *
FROM events
```


┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```


## 個別テーブル {#separate-tables}

このアプローチでは、各テナントのデータを同じデータベース内の個別のテーブルに格納するため、テナントを識別するための専用フィールドが不要になります。ユーザーアクセスは[GRANT文](/sql-reference/statements/grant)を使用して制御され、各ユーザーは自分のテナントのデータを含むテーブルのみにアクセスできるようになります。

> **個別テーブルの使用は、テナントごとに異なるデータスキーマを持つ場合に適した選択肢です。**

非常に大規模なデータセットを持つ少数のテナントが存在し、クエリパフォーマンスが重要なシナリオでは、このアプローチは共有テーブルモデルよりも優れたパフォーマンスを発揮する可能性があります。他のテナントのデータをフィルタリングする必要がないため、クエリをより効率的に実行できます。さらに、プライマリキーに追加のフィールド(テナントIDなど)を含める必要がないため、プライマリキーをさらに最適化できます。

このアプローチは数千のテナントに対してスケールしないことに注意してください。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 {#separate-tables-example}

以下は個別テーブルマルチテナンシーモデルの実装例です。

まず、`tenant_1`のイベント用と`tenant_2`のイベント用の2つのテーブルを作成します。

```sql
-- テナント1用のテーブルを作成
CREATE TABLE events_tenant_1
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- プライマリキーは他の属性に焦点を当てることができる

-- テナント2用のテーブルを作成
CREATE TABLE events_tenant_2
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- プライマリキーは他の属性に焦点を当てることができる
```

サンプルデータを挿入します。

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

```


INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

次に、2つのユーザー `user_1` と `user_2` を作成しましょう。

```sql
-- ユーザーを作成
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

次に、対応するテーブルに `SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで `user_1` として接続し、このユーザーに対応するテーブルから簡単なSELECTクエリを実行できます。最初のテナントの行のみが返されます。

```sql
-- user_1としてログイン
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


## データベースの分離 {#separate-databases}

各テナントのデータは、同一のClickHouseサービス内の個別のデータベースに格納されます。

> **このアプローチは、各テナントが多数のテーブルやマテリアライズドビューを必要とし、異なるデータスキーマを持つ場合に有効です。ただし、テナント数が多い場合は管理が困難になる可能性があります。**

実装は個別テーブルアプローチと類似していますが、テーブルレベルではなくデータベースレベルで権限を付与します。

このアプローチは数千のテナントには対応できないことに注意してください。詳細は[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 {#separate-databases-example}

以下は、データベース分離型マルチテナンシーモデルの実装例です。

まず、`tenant_1`用と`tenant_2`用の2つのデータベースを作成します。

```sql
-- tenant_1用のデータベースを作成
CREATE DATABASE tenant_1;

-- tenant_2用のデータベースを作成
CREATE DATABASE tenant_2;
```

```sql
-- tenant_1用のテーブルを作成
CREATE TABLE tenant_1.events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);

-- tenant_2用のテーブルを作成
CREATE TABLE tenant_2.events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

サンプルデータを挿入します。

```sql
INSERT INTO tenant_1.events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

```


INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

次に、2つのユーザー `user_1` と `user_2` を作成しましょう。

```sql
-- ユーザーを作成
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

次に、対応するテーブルに `SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

これで `user_1` として接続し、適切なデータベースのeventsテーブルに対してシンプルなSELECTクエリを実行できます。最初のテナントの行のみが返されます。

```sql
-- user_1としてログイン
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


## コンピュート-コンピュート分離 {#compute-compute-separation}

上記の3つのアプローチは、[Warehouses](/cloud/reference/warehouses#what-is-a-warehouse)を使用することでさらに分離することができます。データは共通のオブジェクトストレージを通じて共有されますが、[コンピュート-コンピュート分離](/cloud/reference/warehouses#what-is-compute-compute-separation)により、各テナントは異なるCPU/メモリ比率で独自のコンピュートサービスを持つことができます。

ユーザー管理は前述のアプローチと同様です。ウェアハウス内のすべてのサービスが[アクセス制御を共有する](/cloud/reference/warehouses#database-credentials)ためです。

なお、ウェアハウス内の子サービスの数は少数に制限されています。詳細は[Warehouseの制限事項](/cloud/reference/warehouses#limitations)を参照してください。


## 個別のクラウドサービス {#separate-service}

最も抜本的なアプローチは、テナントごとに異なるClickHouseサービスを使用することです。

> **この一般的ではない方法は、法的、セキュリティ、または地理的近接性の理由により、テナントのデータを異なるリージョンに保存する必要がある場合の解決策となります。**

ユーザーが各テナントのデータにアクセスできるように、各サービスにユーザーアカウントを作成する必要があります。

このアプローチは管理が困難であり、各サービスが独自のインフラストラクチャを必要とするため、サービスごとにオーバーヘッドが発生します。サービスは[ClickHouse Cloud API](/cloud/manage/api/api-overview)を介して管理でき、[公式Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を介したオーケストレーションも可能です。

### 例 {#separate-service-example}

これは個別サービスマルチテナンシーモデルの実装例です。この例では1つのClickHouseサービス上でのテーブルとユーザーの作成を示していますが、同じ操作をすべてのサービスで複製する必要があります。

まず、テーブル`events`を作成しましょう

```sql
-- tenant_1用のテーブルを作成
CREATE TABLE events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントのタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

サンプルデータを挿入しましょう。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

次に、ユーザー`user_1`を作成しましょう

```sql
-- ユーザーを作成
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに`GRANT SELECT`権限を付与します。

```sql
-- eventsテーブルへの読み取り専用権限を付与
GRANT SELECT ON events TO user_1
```

これで、テナント1のサービスに`user_1`として接続し、単純なselectを実行できます。最初のテナントの行のみが返されます。

```sql
-- user_1としてログイン
SELECT *
FROM events

```


┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```
