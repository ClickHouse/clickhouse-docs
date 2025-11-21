---
sidebar_label: "データベースユーザーの管理"
slug: /cloud/security/manage-database-users
title: "データベースユーザーの管理"
description: "このページでは、管理者がデータベースユーザーの追加、割り当ての管理、およびデータベースユーザーの削除を行う方法について説明します"
doc_type: "guide"
keywords:
  [
    "データベースユーザー",
    "アクセス管理",
    "セキュリティ",
    "権限",
    "ユーザー管理"
  ]
---

import Image from "@theme/IdealImage"
import user_grant_permissions_options from "@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png"

このガイドでは、SQLコンソール内およびデータベース内で直接データベースユーザーを管理する2つの方法を説明します。

### SQLコンソールのパスワードレス認証 {#sql-console-passwordless-authentication}

SQLコンソールユーザーは各セッションごとに作成され、自動的にローテーションされるX.509証明書を使用して認証されます。ユーザーはセッション終了時に削除されます。監査用のアクセスリストを生成する際は、コンソールのサービス設定タブに移動し、データベースに存在するデータベースユーザーに加えて、SQLコンソールアクセスも確認してください。カスタムロールが設定されている場合、ユーザーのアクセス権限はユーザー名で終わるロールに記載されています。


## SQLコンソールのユーザーとロール {#sql-console-users-and-roles}

基本的なSQLコンソールロールは、Service Read OnlyおよびService Admin権限を持つユーザーに割り当てることができます。詳細については、[SQLコンソールロール割り当ての管理](/cloud/guides/sql-console/manage-sql-console-role-assignments)を参照してください。本ガイドでは、SQLコンソールユーザー用のカスタムロールを作成する方法を説明します。

SQLコンソールユーザー用のカスタムロールを作成し、汎用ロールを付与するには、以下のコマンドを実行します。メールアドレスは、コンソール内のユーザーのメールアドレスと一致する必要があります。

<VerticalStepper headerLevel="h4">

#### `database_developer`を作成して権限を付与する {#create-role-grant-permissions}

`database_developer`ロールを作成し、`SHOW`、`CREATE`、`ALTER`、`DELETE`権限を付与します。

```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### SQLコンソールユーザーロールを作成する {#create-sql-console-user-role}

SQLコンソールユーザーmy.user@domain.com用のロールを作成し、database_developerロールを割り当てます。

```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### SQLコンソール使用時にユーザーに新しいロールが割り当てられる {#use-assigned-new-role}

ユーザーがSQLコンソールを使用する際には、そのメールアドレスに関連付けられたロールが割り当てられます。

</VerticalStepper>


## データベース認証 {#database-authentication}

### データベースユーザーIDとパスワード {#database-user-id--password}

パスワードを安全に保護するため、[ユーザーアカウントの作成](/sql-reference/statements/create/user.md)時にはSHA256_hashメソッドを使用してください。ClickHouseデータベースのパスワードは最低12文字以上で、以下の複雑性要件を満たす必要があります:大文字、小文字、数字、および/または特殊文字を含むこと。

:::tip パスワードを安全に生成する
管理者権限を持たないユーザーは自分でパスワードを設定できないため、管理者がアカウントを設定する前に、[このようなジェネレーター](https://tools.keycdn.com/sha256-online-generator)を使用してパスワードをハッシュ化するようユーザーに依頼してください。
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

### セキュアシェル(SSH)認証を使用したデータベースユーザー {#database-ssh}

ClickHouse Cloudデータベースユーザー向けにSSH認証を設定する手順は以下の通りです。

1. ssh-keygenを使用してキーペアを作成します。
2. 公開鍵を使用してユーザーを作成します。
3. ユーザーにロールおよび/または権限を割り当てます。
4. 秘密鍵を使用してサービスに対して認証を行います。

例を含む詳細な手順については、ナレッジベースの[SSHキーを使用してClickHouse Cloudに接続する方法](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)をご確認ください。


## データベース権限 {#database-permissions}

SQL [GRANT](/sql-reference/statements/grant) ステートメントを使用して、サービスおよびデータベース内で以下を設定します。

| ロール    | 説明                                                                  |
| :------ | :--------------------------------------------------------------------------- |
| Default | サービスへの完全な管理アクセス                                       |
| Custom  | SQL [`GRANT`](/sql-reference/statements/grant) ステートメントを使用して設定 |

- データベースロールは加算的です。つまり、ユーザーが2つのロールのメンバーである場合、ユーザーは両方のロールに付与された権限の和集合を持ちます。ロールを追加してもアクセス権が失われることはありません。
- データベースロールは他のロールに付与でき、階層構造を形成します。ロールは、メンバーとなっているロールのすべての権限を継承します。
- データベースロールはサービスごとに一意であり、同じサービス内の複数のデータベースに適用できます。

以下の図は、ユーザーに権限を付与できるさまざまな方法を示しています。

<Image
  img={user_grant_permissions_options}
  alt='ユーザーに権限を付与できるさまざまな方法を示す図'
  size='md'
  background='black'
/>

### 初期設定 {#initial-settings}

データベースには、サービス作成時に自動的に追加され、default_roleが付与される `default` という名前のアカウントがあります。サービスを作成したユーザーには、サービス作成時に `default` アカウントに割り当てられる自動生成されたランダムなパスワードが提示されます。パスワードは初期設定後には表示されませんが、後でコンソールでService Admin権限を持つユーザーによって変更できます。このアカウント、またはコンソール内でService Admin権限を持つアカウントは、いつでも追加のデータベースユーザーとロールを設定できます。

:::note
コンソールで `default` アカウントに割り当てられたパスワードを変更するには、左側のServicesメニューに移動し、サービスにアクセスし、Settingsタブに移動して、Reset passwordボタンをクリックします。
:::

個人に関連付けられた新しいユーザーアカウントを作成し、そのユーザーにdefault_roleを付与することを推奨します。これにより、ユーザーが実行するアクティビティがユーザーIDで識別され、`default` アカウントは緊急時の利用のために予約されます。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーは、SHA256ハッシュジェネレーターまたはPythonの `hashlib` などのコード関数を使用して、適切な複雑さを持つ12文字以上のパスワードをSHA256文字列に変換し、パスワードとしてシステム管理者に提供できます。これにより、管理者が平文パスワードを閲覧または取り扱うことがなくなります。

### SQLコンソールユーザーによるデータベースアクセスリスト {#database-access-listings-with-sql-console-users}

以下のプロセスを使用して、組織内のSQLコンソールとデータベース全体にわたる完全なアクセスリストを生成できます。

<VerticalStepper headerLevel="h4">

#### すべてのデータベース権限のリストを取得する {#get-a-list-of-all-database-grants}

データベース内のすべての権限のリストを取得するには、以下のクエリを実行します。

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

#### SQLコンソールへのアクセス権を持つコンソールユーザーに権限リストを関連付ける {#associate-grant-list-to-console-users-with-access-to-sql-console}

このリストをSQLコンソールへのアクセス権を持つコンソールユーザーに関連付けます。

a. コンソールに移動します。

b. 関連するサービスを選択します。

c. 左側のSettingsを選択します。

d. SQL console accessセクションまでスクロールします。

e. データベースへのアクセス権を持つユーザー数のリンク `There are # users with access to this service.` をクリックして、ユーザーリストを表示します。

</VerticalStepper>


## ウェアハウスユーザー {#warehouse-users}

ウェアハウスユーザーは、同じウェアハウス内のサービス間で共有されます。詳細については、[ウェアハウスのアクセス制御](/cloud/reference/warehouses#access-controls)を参照してください。
