---
sidebar_label: '概要'
slug: /cloud/security/cloud-access-management/overview
title: 'クラウドアクセス管理'
description: 'ClickHouseクラウドにおけるアクセス制御の仕組みとロールタイプに関する情報を説明します'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';


# ClickHouse Cloudにおけるアクセス制御 {#access-control-in-clickhouse-cloud}
ClickHouseは、コンソールとデータベースの2箇所でユーザーアクセスを制御します。コンソールアクセスは、clickhouse.cloudユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントおよびロールを介して管理されます。加えて、コンソールユーザーは、データベース内でロールが付与されることで、SQLコンソールを介してデータベースにインタラクトできるようになります。

## コンソールユーザーとロール {#console-users-and-roles}
コンソールの「ユーザーとロール」ページ内で、組織とサービスのロール割り当てを設定します。各サービスの設定ページ内でSQLコンソールのロール割り当てを設定します。

ユーザーは組織レベルのロールを割り当てられ、オプションで1つ以上のサービスのサービスロールを割り当てることができます。サービスロールは、サービスの設定ページでSQLコンソールにアクセスするためにユーザーにオプションで設定できます。
- 組織管理者ロールに割り当てられたユーザーは、デフォルトでサービス管理者を付与されます。
- SAML統合を介して組織に追加されたユーザーは、自動的にメンバーのロールが割り当てられます。
- サービス管理者はデフォルトでSQLコンソール管理者のロールが割り当てられます。SQLコンソールの権限はサービス設定ページで削除できます。


| コンテキスト         | ロール                   | 説明                                             |
|:-------------------|:-----------------------|:-------------------------------------------------|
| 組織                | 管理者                 | 組織に対するすべての管理活動を実行し、すべての設定を制御します。デフォルトで組織内の最初のユーザーに割り当てられます。 |
| 組織                | 開発者                 | サービスを除くすべてへのビューアクセスを持ち、読み取り専用APIキーを生成する能力があります。 |
| 組織                | 請求                   | 使用状況と請求書を表示し、支払い方法を管理します。 |
| 組織                | メンバー               | サインインのみで、個人プロフィール設定を管理する能力があります。デフォルトでSAML SSOユーザーに割り当てられます。 |
| サービス            | サービス管理者         | サービス設定を管理します。                       |
| サービス            | サービス読み取り専用   | サービスと設定を表示します。                     |
| SQLコンソール       | SQLコンソール管理者    | デフォルトのデータベースロールに相当するサービス内のデータベースへの管理アクセス。 |
| SQLコンソール       | SQLコンソール読み取り専用| サービス内のデータベースへの読み取り専用アクセス。 |
| SQLコンソール       | カスタム               | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して構成します; SQLコンソールユーザーにロールを割り当てるために、ユーザー名を使ってロールに名前を付けます。 |

SQLコンソールユーザーのためにカスタムロールを作成し、それに一般的なロールを付与するには、以下のコマンドを実行します。メールアドレスは、コンソールのユーザーのメールアドレスと一致する必要があります。

1. database_developerロールを作成し、`SHOW`、`CREATE`、`ALTER`、および`DELETE`権限を付与します。
    
    ```sql
    CREATE ROLE OR REPLACE database_developer;
    GRANT SHOW ON * TO database_developer;
    GRANT CREATE ON * TO database_developer;
    GRANT ALTER ON * TO database_developer;
    GRANT DELETE ON * TO database_developer;
    ```
    
2. SQLコンソールユーザー my.user@domain.com のためのロールを作成し、database_developerロールを付与します。
    
    ```sql
    CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
    GRANT database_developer TO `sql-console-role:my.user@domain.com`;
    ```

### SQLコンソールのパスワードレス認証 {#sql-console-passwordless-authentication}
SQLコンソールユーザーは各セッションごとに作成され、自動的にローテーションされるX.509証明書を使用して認証されます。セッションが終了すると、ユーザーは削除されます。監査用のアクセスリストを生成する際には、コンソールのサービスの設定タブに移動し、データベース内に存在するデータベースユーザーに加えてSQLコンソールアクセスを記録してください。カスタムロールが構成されている場合、ユーザーのアクセスはユーザーのユーザー名で終わるロールにリストされます。

## データベースの権限 {#database-permissions}
サービスおよびデータベース内でSQL [GRANT](/sql-reference/statements/grant)文を使用して、以下を設定します。

| ロール                 | 説明                                                                   |
|:----------------------|:-----------------------------------------------------------------------|
| デフォルト            | サービスへのフル管理アクセス                                          |
| カスタム              | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して構成         |


- データベースロールは加算されます。これは、ユーザーが2つのロールのメンバーである場合、ユーザーはその2つのロールに与えられた最大のアクセスを持つことを意味します。ロールを追加してもアクセスが失われることはありません。
- データベースロールは他のロールに付与することができ、階層構造を形成します。ロールは、メンバーであるロールからのすべての権限を継承します。
- データベースロールはサービスごとにユニークであり、同じサービス内の複数のデータベースに適用可能です。

以下のイラストは、ユーザーが権限を付与されるさまざまな方法を示しています。

<Image img={user_grant_permissions_options} alt='ユーザーが権限を付与される異なる方法を示すイラスト' size="md" background="black"/>

### 初期設定 {#initial-settings} 
データベースには、サービス作成時に自動的に追加され、default_roleが付与される`default`というアカウントがあります。サービスを作成したユーザーには、サービスが作成された際に`default`アカウントに割り当てられた自動生成されたランダムなパスワードが表示されます。初期設定後、パスワードは表示されませんが、コンソール内でサービス管理者の権限を持つ任意のユーザーが後で変更できます。このアカウントまたはコンソール内でサービス管理者権限を持つアカウントは、いつでも追加のデータベースユーザーとロールを設定できます。

:::note
コンソール内の`default`アカウントに割り当てられたパスワードを変更するには、左側のサービスメニューに移動し、サービスにアクセスし、設定タブに移動して、リセットパスワードボタンをクリックします。
:::

ユーザーに関連付けられた新しいユーザーアカウントを作成し、そのユーザーにdefault_roleを付与することをお勧めします。これは、ユーザーが実行した活動がそのユーザーIDに識別され、`default`アカウントが非常時用の活動に予約されるためです。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーはSHA256ハッシュジェネレータや、Pythonの`hashlib`のようなコード関数を使用して、適切な複雑さを持つ12文字以上のパスワードをSHA256文字列に変換し、それをシステム管理者にパスワードとして提供することができます。これにより、管理者はクリアテキストのパスワードを見たり扱ったりすることがなくなります。

### SQLコンソールユーザーによるデータベースアクセス一覧 {#database-access-listings-with-sql-console-users}
以下のプロセスを使用して、SQLコンソールとデータベース全体の完全なアクセス一覧を生成できます。

1. データベース内のすべての権限リストを取得するために、次のクエリを実行します。

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
    
2. このリストをSQLコンソールへのアクセスを持つコンソールユーザーに関連付けます。
   
    a. コンソールに移動します。

    b. 関連するサービスを選択します。

    c. 左側の設定を選択します。

    d. SQLコンソールアクセスセクションまでスクロールします。

    e. データベースにアクセスするユーザーの数を示すリンク `There are # users with access to this service.` をクリックして、ユーザー一覧を確認します。
