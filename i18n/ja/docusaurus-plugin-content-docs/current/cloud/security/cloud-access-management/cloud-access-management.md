---
sidebar_label: 概要
slug: /cloud/security/cloud-access-management/overview
title: クラウドアクセス管理
---

# ClickHouse Cloudにおけるアクセス制御
ClickHouseは、コンソールとデータベースの二つの場所でユーザーアクセスを制御します。コンソールアクセスはclickhouse.cloudユーザーインターフェイスを介して管理されます。データベースアクセスはデータベースのユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーには、SQLコンソールを介してデータベースと対話するための権限を付与されたロールを設定することができます。

## ロールの種類 {#types-of-roles}
以下に、利用可能なロールの種類を説明します：
- **コンソールロール**       clickhouse.cloudコンソールへのアクセスを有効にします
- **データベースロール**      単一サービス内の権限管理を可能にします
- **SQLコンソールロール**   特に名付けられたデータベースロールで、コンソールユーザーが割り当てられた権限を持つデータベースにSQLコンソールを介してアクセスすることを可能にします。

## 事前定義されたロール {#predefined-roles}
ClickHouse Cloudでは、アクセス管理を可能にするために、限られた数の事前定義されたロールを提供しています。追加のカスタムデータベースロールは、いつでもデータベース内で[CREATE ROLE](/sql-reference/statements/create/role)および[GRANT](/sql-reference/statements/grant)コマンドを使用して作成できます。

| コンテキスト   | ロール名                | 説明                                                                                   |
|---------------|------------------------|----------------------------------------------------------------------------------------|
| コンソール     | Admin                  | ClickHouse組織への完全アクセス                                                        |
| コンソール     | Developer              | ClickHouse組織への読み取り専用アクセス                                               | 
| コンソール     | Billing                | 請求および使用情報の表示、支払い方法と請求先の管理へのアクセス                     |
| SQLコンソール  | sql_console_admin      | データベースへの管理アクセス                                                          |
| SQLコンソール  | sql_console_read_only  | データベースへの読み取り専用アクセス                                                  |
| データベース   | default                | データベースへの管理アクセス; サービス作成時に`default`ユーザーに自動的に付与されます |

## 初期設定 {#initial-settings}
ClickHouse Cloudアカウントを設定する最初のユーザーは、自動的にコンソールでAdminロールに割り当てられます。このユーザーは、組織に追加のユーザーを招待し、ユーザーにAdminまたはDeveloperロールを割り当てることができます。

:::note
コンソールでユーザーのロールを変更するには、左側のUsersメニューに移動し、ドロップダウンでユーザーのロールを変更してください。
:::

データベースには`default`という名前のアカウントが自動的に追加され、サービス作成時にdefault_roleが付与されます。サービスを作成するユーザーには、サービス作成時に`default`アカウントに割り当てられた自動生成されたランダムなパスワードが提示されます。このパスワードは初回設定後には表示されず、後でコンソールでAdmin権限を持つユーザーによって変更することができます。このアカウントまたはコンソール内のAdmin権限を持つアカウントは、いつでも追加のデータベースユーザーおよびロールを設定できます。

:::note
コンソールで`default`アカウントに割り当てられたパスワードを変更するには、左側のServicesメニューに移動し、サービスにアクセスし、Settingsタブに移動してReset passwordボタンをクリックしてください。
:::

私たちは、個人に関連付けられた新しいユーザーアカウントを作成し、そのユーザーにdefault_roleを付与することを推奨します。これは、ユーザーが行った活動がそのユーザーIDに識別され、`default`アカウントが緊急時の活動用に予約されるためです。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーは、SHA256ハッシュジェネレーターやPythonの`hashlib`のようなコード機能を使用して、適切な複雑さを持つ12文字以上のパスワードをSHA256文字列に変換し、それをシステム管理者に提供することでパスワードとすることができます。これにより、管理者は平文のパスワードを見ることも扱うこともありません。

## コンソールロール {#console-roles}
コンソールユーザーにはロールが割り当てられ、そのロールとしてAdminまたはDeveloperが指定される必要があります。各ロールに関連付けられた権限は以下に示します。

| コンポーネント                      | 機能                            | Admin  | Developer | Billing |
|------------------------------------|--------------------------------|--------|-----------|---------|
| サービス管理                       | サービスの表示                  |   ✅   |    ✅     |    ❌   |
|                                    | サービスの作成                  |   ✅   |    ❌     |    ❌   |
|                                    | サービスの削除                  |   ✅   |    ❌     |    ❌   |
|                                    | サービスの停止                  |   ✅   |    ❌     |    ❌   |
|                                    | サービスの再起動                |   ✅   |    ❌     |    ❌   |
|                                    | サービスのパスワードのリセット  |   ✅   |    ❌     |    ❌   |
|                                    | サービスメトリクスの表示        |   ✅   |    ✅     |    ❌   |
| クラウドAPI                        | APIキーのレコードの表示         |   ✅   |    ✅     |    ❌   |
|                                    | APIキーの作成                   |   ✅   | 読み取り専用 |    ❌   |
|                                    | APIキーの削除                   |   ✅   | 自分のキー    |    ❌   |
| コンソールユーザーの管理          | ユーザーの表示                  |   ✅   |    ✅     |    ❌   |
|                                    | ユーザーの招待                  |   ✅   |    ❌     |    ❌   |
|                                    | ユーザーのロール変更            |   ✅   |    ❌     |    ❌   |
|                                    | ユーザーの削除                  |   ✅   |    ❌     |    ❌   |
| 請求、組織、サポート              | 請求の表示                      |   ✅   |    ✅     |    ✅   |
|                                    | 請求の管理                      |   ✅   |    ❌     |    ✅   |
|                                    | 組織活動の表示                  |   ✅   |    ❌     |    ✅   |
|                                    | サポートリクエストの提出        |   ✅   |    ✅     |    ✅   |
|                                    | 統合の表示                      |   ✅   |    ✅     |    ❌   |

## SQLコンソールロール {#sql-console-roles}
私たちのコンソールには、パスワードなしの認証を使用してデータベースと対話するためのSQLコンソールが含まれています。コンソールでAdmin権限が付与されたユーザーは、組織内のすべてのデータベースに管理アクセスを持っています。Developerロールが付与されたユーザーは、デフォルトではアクセス権を持ちませんが、コンソールから「完全アクセス」または「読み取り専用」のデータベース権限を割り当てることができます。「読み取り専用」ロールは最初にアカウントに読み取り専用アクセスを付与します。しかし、読み取り専用アクセスが付与されると、そのSQLコンソールユーザーに特有の新しいカスタムロールを作成することができ、SQLコンソールを介してデータベースに接続した際にそのユーザーに関連付けられます。

:::note
コンソールでDeveloperロールを持つユーザーにSQLコンソールにアクセスさせるには、左側のServicesメニューに移動し、サービスにアクセスし、Settingsをクリックし、SQLコンソールアクセスセクションまでスクロールして「完全アクセス」または「読み取り専用」を選択してください。アクセスが付与された後、以下の***SQLコンソールロールの作成***のプロセスを使用してカスタムロールを割り当てます。
:::

### パスワードなしの認証に関する詳細 {#more-on-passwordless-authentication}
SQLコンソールユーザーは、各セッションごとに作成され、自動的に回転するX.509証明書を使用して認証されます。セッションが終了すると、ユーザーは削除されます。監査のためにアクセスリストを生成する際は、コンソール内のサービスのSettingsタブに移動し、データベース内に存在するユーザーに加えてSQLコンソールのアクセスを確認してください。カスタムロールが構成されている場合、ユーザーのアクセスはユーザー名で終了するロールにリストされます。

## SQLコンソールロールの作成 {#creating-sql-console-roles}
カスタムロールを作成し、SQLコンソールユーザーに関連付けることができます。SQLコンソールは、ユーザーが新しいセッションを開始するたびに新しいユーザーアカウントを作成するため、システムはロール命名規則を使用してカスタムデータベースロールをユーザーに関連付けます。これは、各ユーザーが個別のロールに割り当てられることを意味します。個々のロールは、直接GRANTステートメントを介してアクセスを付与されるか、ユーザーがdatabase_developerやsecurity_administratorなどの新しい一般的なロールを設定し、より一般的なロールを通じて個別のユーザーロールにアクセスを割り当てることができます。

SQLコンソールユーザー用のカスタムロールを作成し、一般的なロールを付与するには、以下のコマンドを実行してください。メールアドレスはコンソール内のユーザーのメールアドレスと一致しなければなりません。
1. database_developerロールを作成し、SHOW、CREATE、ALTER、DELETE権限を付与します。

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

このロール構造を使用する場合、ユーザーが存在しない場合は、ユーザーアクセスを表示するためのクエリを変更して、ロール間の付与を含める必要があります。

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
ユーザーおよびカスタムロールは、CREATE USER、CREATE ROLE、GRANTステートメントを使用して直接データベース内で作成することもできます。SQLコンソール用に作成されたロールを除いて、これらのユーザーおよびロールはコンソールユーザーおよびロールとは独立しています。

データベースロールは加算的です。つまり、ユーザーが二つのロールのメンバーである場合、ユーザーは二つのロールのうち最も多くのアクセスが付与されたものを持ちます。ロールを追加することでアクセスを失うことはありません。

データベースロールは他のロールに付与することができ、階層構造を生み出します。ロールは、メンバーであるロールのすべての権限を引き継ぎます。

データベースロールはサービスごとにユニークであり、同じサービス内の複数のデータベースに適用できます。

以下の図は、ユーザーが権限を付与されるさまざまな方法を示しています。

![Screenshot 2024-01-18 at 5 14 41 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/94b45f98-48cc-4907-87d8-5eff1ac468e5)
