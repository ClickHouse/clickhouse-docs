---
slug: /cloud/managed-postgres/rbac
sidebar_label: 'RBAC'
title: 'Managed Postgres RBAC'
description: 'ClickHouse Managed Postgres のロールベースアクセス制御（RBAC）について説明します'
keywords: ['managed postgres RBAC', 'アクセス制御', 'ロール', '特権', '権限']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import usersAndRoles from '@site/static/images/managed-postgres/rbac/usersandroles.png';
import postgresEntity from '@site/static/images/managed-postgres/rbac/postgresentity.png';
import newPostgresPerms from '@site/static/images/managed-postgres/rbac/newpostgresperms.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.rbac-beta" />

ClickHouse Cloud では、Managed Postgres サービスでロールベースアクセス制御 (RBAC) を利用できます。特定の権限を持つカスタムロールを作成して組織メンバーに割り当てることで、Postgres サービスを閲覧または管理できるユーザーを制御できます。

## 利用可能な権限 \{#available-permissions\}

Managed Postgres は現在、2 つの権限をサポートしています。

| 権限                   | 説明                                         |
| -------------------- | ------------------------------------------ |
| **Postgres サービスの表示** | ユーザーが Postgres サービスとその詳細を表示できるようにします。      |
| **Postgres サービスの管理** | ユーザーが Postgres サービスを変更、スケーリング、設定できるようにします。 |

新しい Postgres サービスを作成するには、既存の **Organization manage** 権限が必要です。上記の権限は、既存のサービスにのみ適用されます。

:::note
より細かな権限は、今後のリリースで利用可能になる予定です。
:::

## カスタムロールの作成 \{#creating-a-custom-role\}

1. 左側のサイドバーで組織名をクリックし、**Users and roles** を選択します。

<Image img={usersAndRoles} alt="Users and roles メニュー" size="md" border />

2. **Roles** タブに切り替え、**Create role** をクリックします。
3. ロール名を入力し、**+ Allow** をクリックして、エンティティ一覧から **Postgres Service** を選択します。

<Image img={postgresEntity} alt="Postgres Service エンティティの選択" size="md" border />

4. このロールの対象とする Postgres サービスを選択し、付与する権限を選びます。

<Image img={newPostgresPerms} alt="ロールの Postgres 権限を設定" size="md" border />

5. **Create role** をクリックして保存します。

## ロールの割り当て \{#assigning-a-role\}

ロールを作成したら、同じ **Users and roles** ページの **Users** タブからユーザーに割り当てます。ユーザーには複数のロールを割り当てることができ、ロールを組み合わせることで、必要なアクセスプロファイルをきめ細かく設定できます。