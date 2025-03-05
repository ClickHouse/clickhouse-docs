---
sidebar_label: 概要
slug: /cloud/security/cloud-access-management/overview
title: クラウドアクセス管理
---


# ClickHouse Cloudにおけるアクセス制御
ClickHouseは、コンソールとデータベースの2か所でユーザーアクセスを制御します。コンソールへのアクセスはclickhouse.cloudユーザーインターフェースを介して管理され、データベースへのアクセスはデータベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーは、私たちのSQLコンソールを介してデータベースと対話するために必要なロールをデータベース内に付与される可能性があります。

## ロールの種類 {#types-of-roles}
以下に、利用可能な異なる種類のロールについて説明します：
- **コンソールロール**       clickhouse.cloudコンソールへのアクセスを有効にします
- **データベースロール**      単一サービス内の権限の管理を有効にします
- **SQLコンソールロール**   特別に名付けられたデータベースロールで、コンソールユーザーがSQLコンソールを介して割り当てられた権限を持つデータベースにアクセスできるようにします。

## 事前定義されたロール {#predefined-roles}
ClickHouse Cloudは、アクセス管理を可能にするために、限られた数の事前定義されたロールを提供します。追加のカスタムデータベースロールは、データベース内で[CREATE ROLE](/sql-reference/statements/create/role)および[GRANT](/sql-reference/statements/grant)コマンドを使用していつでも作成できます。

| コンテキスト      | ロール名             | 説明                                                                                   |
|--------------|-----------------------|-----------------------------------------------------------------------------------------------|
| コンソール      | Admin                 | ClickHouse組織への完全アクセス                                                      |
| コンソール      | Developer             | ClickHouse組織への読み取り専用アクセス                                               | 
| コンソール      | Billing               | 課金および使用情報の表示、支払い方法と請求先の管理                                   |
| SQLコンソール  | sql_console_admin     | データベースへの管理アクセス                                                           |
| SQLコンソール  | sql_console_read_only | データベースへの読み取り専用アクセス                                                  |
| データベース     | default               | データベースへの管理アクセス；サービス作成時に`default`ユーザーに自動的に付与されます |

## 初期設定 {#initial-settings}
ClickHouse Cloudアカウントを設定する最初のユーザーには、コンソールで自動的にAdminロールが割り当てられます。このユーザーは他のユーザーを組織に招待し、AdminまたはDeveloperロールを付与することができます。

:::note
コンソールでユーザーのロールを変更するには、左のユーザーメニューに移動し、ドロップダウンでユーザーのロールを変更します。
:::

データベースには、サービス作成時に自動的に追加され、default_roleが付与される`default`というアカウントがあります。サービスを作成するユーザーには、サービス作成時に`default`アカウントに割り当てられる自動生成されたランダムパスワードが表示されます。初期設定後にパスワードは表示されませんが、コンソール内でAdmin権限を持つユーザーが後で変更することができます。このアカウントまたはコンソール内でAdmin権限を持つアカウントは、いつでも他のデータベースユーザーやロールを設定することができます。

:::note
コンソールで`default`アカウントに割り当てられたパスワードを変更するには、左のサービスメニューに移動し、サービスにアクセスし、設定タブに移動してパスワードリセットボタンをクリックします。
:::

新しいユーザーアカウントを個人に関連付けて作成し、そのユーザーにdefault_roleを付与することをお勧めします。これは、ユーザーが行ったアクティビティをそのユーザーIDに特定し、`default`アカウントが非常時用の活動に保存されるようにするためです。 

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーは、SHA256ハッシュジェネレーターやPythonの`hashlib`のようなコード関数を使用して、適切な複雑さの12文字以上のパスワードをSHA256文字列に変換し、システム管理者にパスワードとして提供できます。これにより、管理者はプレーンテキストのパスワードを見ることも扱うこともありません。

## コンソールロール {#console-roles}
コンソールユーザーにはロールが割り当てられ、AdminまたはDeveloperロールが付与される可能性があります。各ロールに関連付けられた権限は以下に示します。

| コンポーネント                         | 機能                    | Admin  | Developer | Billing |
|-----------------------------------|----------------------------|--------|-----------|---------|
| サービスの管理                  | サービスの表示               |   ✅   |    ✅     |    ❌   |
|                                   | サービスの作成             |   ✅   |    ❌     |    ❌   |
|                                   | サービスの削除             |   ✅   |    ❌     |    ❌   |
|                                   | サービスの停止               |   ✅   |    ❌     |    ❌   |
|                                   | サービスの再起動            |   ✅   |    ❌     |    ❌   |
|                                   | サービスパスワードのリセット     |   ✅   |    ❌     |    ❌   |
|                                   | サービストラッキングデータの表示 |   ✅   |    ✅     |    ❌   |
| クラウドAPI                         | APIキー記録の表示       |   ✅   |    ✅     |    ❌   |
|                                   | APIキーの作成             |   ✅   | 読み取り専用 |    ❌   |
|                                   | APIキーの削除             |   ✅   | 自分のキー   |    ❌   |
| コンソールユーザーの管理            | ユーザーの表示                 |   ✅   |    ✅     |    ❌   |
|                                   | ユーザーの招待               |   ✅   |    ❌     |    ❌   |
|                                   | ユーザーのロールの変更           |   ✅   |    ❌     |    ❌   |
|                                   | ユーザーの削除               |   ✅   |    ❌     |    ❌   |
| 請求、組織とサポート | 請求の表示               |   ✅   |    ✅     |    ✅   |
|                                   | 請求の管理             |   ✅   |    ❌     |    ✅   |
|                                   | 組織アクティビティの表示 |   ✅   |    ❌     |    ✅   |
|                                   | サポートリクエストの提出    |   ✅   |    ✅     |    ✅   |
|                                   | 統合の表示          |   ✅   |    ✅     |    ❌   |

## SQLコンソールロール {#sql-console-roles}
私たちのコンソールには、パスワードなし認証を使用してデータベースと対話するためのSQLコンソールが含まれています。コンソールでAdmin権限を付与されたユーザーは、組織内のすべてのデータベースに対する管理アクセスを持ちます。Developerロールを付与されたユーザーはデフォルトではアクセスできませんが、コンソールから「フルアクセス」または「読み取り専用」データベース権限を付与される可能性があります。「読み取り専用」ロールは、最初にアカウントへの読み取り専用アクセスを付与します。しかし、読み取り専用アクセスが付与されると、SQLコンソールを介してデータベースに接続する際にそのユーザーに関連付けられる特定のカスタムロールが作成される可能性があります。

:::note
コンソールでDeveloperロールを持つユーザーがSQLコンソールにアクセスできるようにするには、左のサービスメニューに移動し、サービスにアクセスし、設定をクリックし、SQLコンソールアクセスセクションで「フルアクセス」または「読み取り専用」を選択します。アクセスが付与されると、以下の***SQLコンソールロールの作成***で示されるプロセスを使用してカスタムロールを割り当てることができます。
:::

### パスワードなし認証についてさらに {#more-on-passwordless-authentication}
SQLコンソールユーザーは各セッションのために作成され、自動的に回転するX.509証明書を使用して認証されます。セッションが終了するとユーザーは削除されます。監査用のアクセスリストを生成する際は、コンソールでサービスの設定タブに移動し、データベース内に存在するデータベースユーザーに加えてSQLコンソールアクセスを記録してください。カスタムロールが構成されている場合、ユーザーのアクセスはユーザー名で終わるロールにリストされます。

## SQLコンソールロールの作成 {#creating-sql-console-roles}
SQLコンソールユーザーに関連付けるカスタムロールを作成できます。SQLコンソールはユーザーが新しいセッションを開くたびに新しいユーザーアカウントを作成するため、システムは役割命名規則を使用してカスタムデータベースロールをユーザーに関連付けます。これは、各ユーザーに個別のロールが割り当てられることを意味します。個別のロールはその後、GRANT文を介して直接アクセスを割り当てることができ、ユーザーはdatabase_developerやsecurity_administratorのような新しい一般ロールを確立し、より一般的なロールを介して個々のユーザーロールにアクセスを割り当てることができます。

SQLコンソールユーザーのカスタムロールを作成し、一般ロールを付与するには、以下のコマンドを実行します。メールアドレスはコンソール内のユーザーのメールアドレスと一致する必要があります。 
1. database_developerロールを作成し、SHOW、CREATE、ALTER、およびDELETE権限を付与します。

```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

2. SQLコンソールユーザーmy.user@domain.comのためのロールを作成し、それにdatabase_developerロールを割り当てます。

```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

このロール構造を使用する際、ユーザーが存在しない場合、ユーザーアクセスを表示するためのクエリをロール間の権限付与を含むように修正する必要があります。

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

## データベースロール {#database-roles}
ユーザーやカスタムロールは、CREATE User、CREATE Role、およびGRANT文を使用してデータベース内で直接作成することもできます。SQLコンソール用に作成されたロールを除き、これらのユーザーとロールはコンソールユーザーやロールとは独立しています。

データベースロールは加算的です。つまり、ユーザーが2つのロールのメンバーである場合、そのユーザーは2つのロールに付与された最も多くのアクセスを持ちます。ロールを追加してもアクセスを失うことはありません。

データベースロールは他のロールに付与することができ、階層構造を持つことができます。ロールはメンバーであるロールのすべての権限を継承します。

データベースロールはサービスごとにユニークであり、同じサービス内の複数のデータベースにまたがって適用することができます。

下のイラストは、ユーザーがどのように権限を付与されるかのさまざまな方法を示しています。

![Screenshot 2024-01-18 at 5 14 41 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/94b45f98-48cc-4907-87d8-5eff1ac468e5)
