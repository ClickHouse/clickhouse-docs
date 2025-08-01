---
sidebar_label: 'Overview'
slug: '/cloud/security/cloud-access-management/overview'
title: 'Cloud access management'
description: 'Describes how access control in ClickHouse cloud works, including
  information on role types'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';



# ClickHouse Cloudにおけるアクセス制御 {#access-control-in-clickhouse-cloud}
ClickHouseは、コンソールとデータベースの2か所でユーザーアクセスを制御します。コンソールアクセスは、clickhouse.cloudユーザーインターフェイスを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーには、SQLコンソールを介してデータベースと対話するための権限を持つロールをデータベース内に付与することができます。

## コンソールユーザーとロール {#console-users-and-roles}
コンソール > ユーザーとロールページで、組織およびサービスロールの割り当てを設定します。各サービスの設定ページでSQLコンソールロールの割り当てを設定します。

ユーザーには組織レベルのロールが割り当てられる必要があり、一つまたは複数のサービスのためにサービスロールが任意で割り当てられることがあります。サービス設定ページで、ユーザーがSQLコンソールにアクセスするためのサービスロールが任意で設定されることがあります。
- Organization Adminロールが割り当てられているユーザーには、デフォルトでService Adminが付与されます。
- SAML統合を介して組織に追加されたユーザーには、メンバーのロールが自動的に割り当てられます。
- Service AdminはデフォルトでSQLコンソール管理者ロールが付与されます。SQLコンソールの権限は、サービス設定ページで削除されることがあります。

| コンテキスト   | ロール                  | 説明                                            |
|:---------------|:------------------------|:-------------------------------------------------|
| 組織           | Admin                   | 組織のすべての管理活動を行い、すべての設定を制御します。デフォルトで組織内の最初のユーザーに割り当てられます。 |
| 組織           | Developer               | サービスを除くすべての表示アクセス、読み取り専用APIキーを生成する能力。 |
| 組織           | Billing                 | 使用状況および請求書を表示し、支払い方法を管理します。 |
| 組織           | Member                  | サインインのみで、個人のプロフィール設定を管理する能力があります。デフォルトでSAML SSOユーザーに割り当てられます。 |
| サービス       | Service Admin           | サービス設定を管理します。                        |
| サービス       | Service Read Only       | サービスおよび設定を表示します。                     |
| SQLコンソール   | SQLコンソール管理者   | サービス内のデータベースに対する管理アクセス（Defaultデータベースロールと同等）。 |
| SQLコンソール   | SQLコンソール読み取り専用 | サービス内のデータベースに対する読み取り専用のアクセス。 |
| SQLコンソール   | カスタム                | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して設定します。SQLコンソールユーザーには、ユーザー名の後にロールを付けて割り当てます。 |

SQLコンソールユーザーのためにカスタムロールを作成し、一般的なロールを付与するには、以下のコマンドを実行します。メールアドレスは、コンソール内のユーザーのメールアドレスと一致する必要があります。

1. database_developerロールを作成し、`SHOW`、`CREATE`、`ALTER`、および`DELETE`権限を付与します。

    ```sql
    CREATE ROLE OR REPLACE database_developer;
    GRANT SHOW ON * TO database_developer;
    GRANT CREATE ON * TO database_developer;
    GRANT ALTER ON * TO database_developer;
    GRANT DELETE ON * TO database_developer;
    ```

2. SQLコンソールユーザーmy.user@domain.comのためのロールを作成し、database_developerロールを割り当てます。

    ```sql
    CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
    GRANT database_developer TO `sql-console-role:my.user@domain.com`;
    ```

### SQLコンソールのパスワードレス認証 {#sql-console-passwordless-authentication}
SQLコンソールユーザーは各セッションのために作成され、自動的に回転されるX.509証明書を使用して認証されます。ユーザーはセッション終了時に削除されます。監査のためのアクセスリストを生成する際は、コンソール内のサービスの設定タブに移動し、データベース内に存在するデータベースユーザーに加えてSQLコンソールアクセスを記録してください。カスタムロールが設定されている場合、ユーザーのアクセスは、ユーザー名で終わるロールにリストされます。

## データベース権限 {#database-permissions}
以下をサービスとデータベース内でSQL [GRANT](/sql-reference/statements/grant)文を使用して設定します。

| ロール                 | 説明                                                                                                      |
|:------------------------|:-----------------------------------------------------------------------------------------------------------|
| Default                 | サービスへのフル管理アクセス                                                                               |
| Custom                  | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して設定します                                      |

- データベースロールは加算的です。これは、ユーザーが2つのロールのメンバーである場合、ユーザーは2つのロールで付与された最も多くのアクセスを持つことを意味します。ロールを追加してもアクセスを失いません。
- データベースロールは、他のロールに付与することができ、階層構造を結果として持ちます。ロールは、メンバーであるロールのすべての権限を継承します。
- データベースロールはサービスごとに固有であり、同じサービス内の複数のデータベースに適用される場合があります。

以下の図は、ユーザーが権限を付与される異なる方法を示しています。

<Image img={user_grant_permissions_options} alt='ユーザーが権限を付与される異なる方法を示す図' size="md" background="black"/>

### 初期設定 {#initial-settings} 
データベースには、`default`という名前のアカウントが自動的に追加され、サービス作成時にdefault_roleが付与されます。サービスを作成するユーザーには、サービスが作成されたときに`default`アカウントに割り当てられる自動生成されたランダムパスワードが提示されます。初期設定後はパスワードは表示されず、後でコンソール内でService Admin権限を持つユーザーが変更できます。このアカウントまたはコンソール内でService Admin権限を持つアカウントは、いつでも追加のデータベースユーザーとロールを設定できます。

:::note
コンソール内の`default`アカウントに割り当てられたパスワードを変更するには、左側のサービスメニューに移動し、サービスにアクセスし、設定タブに移動してパスワードリセットボタンをクリックします。
:::

新しいユーザーアカウントを作成し、そのユーザーにdefault_roleを付与することをお勧めします。これは、ユーザーによって実行された活動がそのユーザーIDに識別され、`default`アカウントは非常時対応の活動用に予約されるためです。

  ```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
  ```

ユーザーは、SHA256ハッシュジェネレーターやPythonの`hashlib`のようなコード関数を使用して、適切な複雑さを持つ12文字以上のパスワードをSHA256文字列に変換し、それをシステム管理者にパスワードとして提供することができます。これにより、管理者はクリアテキストのパスワードを見たり扱ったりしないことが保証されます。

### SQLコンソールユーザーのデータベースアクセスリスト {#database-access-listings-with-sql-console-users}
以下のプロセスを使用して、組織内のSQLコンソールとデータベース全体の完全なアクセスリストを生成できます。

1. データベース内のすべてのグラントのリストを取得するには、以下のクエリを実行します。

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

2. このリストをSQLコンソールへのアクセスを持つコンソールユーザーに結びつけます。
   
    a. コンソールに移動します。

    b. 該当するサービスを選択します。

    c. 左側の設定を選択します。

    d. SQLコンソールアクセスセクションまでスクロールします。

    e. データベースへのアクセスを持つユーザーの番号のリンク`There are # users with access to this service.`をクリックして、ユーザーリストを表示します。
