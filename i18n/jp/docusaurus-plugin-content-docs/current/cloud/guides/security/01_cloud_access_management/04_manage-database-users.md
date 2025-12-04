---
sidebar_label: 'データベースユーザーの管理'
slug: /cloud/security/manage-database-users
title: 'データベースユーザーの管理'
description: 'このページでは、管理者がデータベースユーザーを追加し、割り当てを管理し、データベースユーザーを削除する方法について説明します。'
doc_type: 'guide'
keywords: ['データベースユーザー', 'アクセス管理', 'セキュリティ', '権限', 'ユーザー管理']
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

このガイドでは、SQL コンソール内とデータベース内で直接データベースユーザーを管理する 2 通りの方法を説明します。

### SQL コンソールのパスワードレス認証 {#sql-console-passwordless-authentication}

SQL コンソールユーザーは各セッションごとに作成され、自動的に更新される X.509 証明書を使って認証されます。セッションが終了すると、そのユーザーは削除されます。監査目的のアクセスリストを作成する場合は、コンソールで対象サービスの Settings タブに移動し、データベース内に存在するデータベースユーザーに加えて、SQL コンソールからのアクセスも確認してください。カスタムロールが設定されている場合、ユーザーのアクセス権は、そのユーザー名で終わるロールに一覧表示されます。

## SQL コンソールのユーザーとロール {#sql-console-users-and-roles}

基本的な SQL コンソールのロールは、Service Read Only 権限および Service Admin 権限を持つユーザーに割り当てることができます。詳細は、[Manage SQL Console Role Assignments](/cloud/guides/sql-console/manage-sql-console-role-assignments) を参照してください。本ガイドでは、SQL コンソールユーザー向けにカスタムロールを作成する方法を説明します。

SQL コンソールユーザー向けにカスタムロールを作成し、汎用ロールを付与するには、次のコマンドを実行します。メールアドレスは、コンソール上のユーザーのメールアドレスと一致している必要があります。 

<VerticalStepper headerLevel="h4">

#### `database_developer` を作成して権限を付与する {#create-role-grant-permissions} 

`database_developer` ロールを作成し、`SHOW`、`CREATE`、`ALTER`、`DELETE` の権限を付与します。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### SQL コンソールユーザーロールを作成する {#create-sql-console-user-role} 

SQL コンソールユーザー my.user@domain.com 用のロールを作成し、`database_developer` ロールを割り当てます。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### ユーザーは SQL コンソール使用時に新しいロールが割り当てられる {#use-assigned-new-role}

ユーザーは、SQL コンソールを使用するたびに、自身のメールアドレスに関連付けられたロールが割り当てられます。 

</VerticalStepper>

## データベース認証 {#database-authentication}

### データベースユーザー ID とパスワード {#database-user-id--password}

パスワードを安全に保護するために、[ユーザーアカウントを作成](/sql-reference/statements/create/user.md)する際は SHA256&#95;hash メソッドを使用してください。ClickHouse データベースのパスワードは 12 文字以上である必要があり、英大文字・英小文字・数字および／または記号を含む複雑さ要件を満たさなければなりません。

:::tip パスワードを安全に生成する
管理者権限を持たないユーザーは自分でパスワードを設定できないため、アカウントをセットアップする前に、[このツール](https://tools.keycdn.com/sha256-online-generator)などのジェネレーターを使って自分のパスワードをハッシュ化し、そのハッシュ値を管理者に渡すようユーザーに依頼してください。
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

### セキュアシェル (SSH) 認証を使用するデータベースユーザー {#database-ssh}

ClickHouse Cloud のデータベースユーザーに対して SSH 認証を設定します。

1. `ssh-keygen` を使用してキーペアを作成します。
2. 公開鍵を使用してユーザーを作成します。
3. ユーザーにロールおよび／または権限を割り当てます。
4. 秘密鍵を使用してサービスに対して認証を行います。

詳細な手順と例については、ナレッジベース内の「[SSH キーを使用して ClickHouse Cloud に接続する方法](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)」を参照してください。

## データベース権限 {#database-permissions}

SQL の [GRANT](/sql-reference/statements/grant) ステートメントを使用して、サービスおよびデータベース内で次の設定を行います。

| Role    | Description                                                   |
| :------ | :------------------------------------------------------------ |
| Default | サービスへの完全な管理アクセス                                               |
| Custom  | SQL の [`GRANT`](/sql-reference/statements/grant) ステートメントで構成する |

* データベースロールは累積されます。つまり、ユーザーが 2 つのロールのメンバーである場合、そのユーザーは両方のロールで許可されている権限の合計を利用できます。ロールを追加してもアクセス権が失われることはありません。
* データベースロールは他のロールに付与することができ、階層構造を形成します。ロールは、それがメンバーとなっている他のロールのすべての権限を継承します。
* データベースロールはサービスごとに一意であり、同一サービス内の複数のデータベースに適用できます。

以下の図は、ユーザーに権限を付与するさまざまな方法を示しています。

<Image img={user_grant_permissions_options} alt="ユーザーに権限を付与するさまざまな方法を示す図" size="md" background="black" />

### 初期設定 {#initial-settings}

データベースには `default` という名前のアカウントがあり、サービス作成時に自動的に追加され、default&#95;role が付与されます。サービスを作成するユーザーには、サービス作成時に `default` アカウントに割り当てられる自動生成のランダムなパスワードが表示されます。このパスワードは初期セットアップ後は表示されませんが、後からコンソール内で Service Admin 権限を持つ任意のユーザーが変更できます。このアカウント、またはコンソール内で Service Admin 権限を持つアカウントは、いつでも追加のデータベースユーザーおよびロールを設定できます。

:::note
コンソールで `default` アカウントに割り当てられているパスワードを変更するには、左側の Services メニューからサービスにアクセスし、Settings タブに移動して Reset password ボタンをクリックします。
:::

ユーザーによる操作がそのユーザー ID に紐づいて識別できるようにし、`default` アカウントをいわゆるブレークグラス用途（緊急時のみの利用）のために確保しておくために、個人に紐づく新しいユーザーアカウントを作成し、そのユーザーに default&#95;role を付与することを推奨します。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーは、SHA256 ハッシュジェネレーターや Python の `hashlib` のような関数を使用して、適切な複雑さを備えた 12 文字以上のパスワードを SHA256 文字列に変換し、その文字列をパスワードとしてシステム管理者に渡すことができます。これにより、管理者が平文パスワードを閲覧・取り扱う必要がなくなります。

### SQL コンソールユーザーを含むデータベースアクセス一覧 {#database-access-listings-with-sql-console-users}

次の手順を使用して、組織内の SQL コンソールおよびデータベース全体の完全なアクセス一覧を生成できます。

<VerticalStepper headerLevel="h4">
  #### すべてのデータベース権限の一覧を取得する

  データベース内のすべての権限の一覧を取得するには、次のクエリを実行します。

  ```sql
  SELECT grants.user_name,
  grants.role_name,
  users.name AS role_member,
  grants.access_type,
  grants.database,
  grants.table
  FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
  LEFT OUTER JOIN system.users ON role_grants.user_name = users.name

  UNION ALL

  SELECT grants.user_name,
  grants.role_name,
  role_grants.role_name AS role_member,
  grants.access_type,
  grants.database,
  grants.table
  FROM system.role_grants LEFT OUTER JOIN system.grants ON role_grants.granted_role_name = grants.role_name
  WHERE role_grants.user_name is null;
  ```

  #### SQL コンソールにアクセスできる Console ユーザーに権限一覧を関連付ける

  この一覧を、SQL コンソールにアクセスできる Console ユーザーに関連付けます。

  a. Console を開きます。

  b. 対象のサービスを選択します。

  c. 左側で「Settings」を選択します。

  d. 「SQL console access」セクションまでスクロールします。

  e. データベースにアクセスできるユーザー数を示すリンク `There are # users with access to this service.` をクリックして、ユーザー一覧を表示します。
</VerticalStepper>

## ウェアハウスユーザー {#warehouse-users}

ウェアハウスユーザーは、同じウェアハウス内のサービス間で共有されます。詳細については、[ウェアハウスのアクセス制御](/cloud/reference/warehouses#access-controls)を参照してください。
