---
'sidebar_label': '概要'
'slug': '/cloud/security/cloud-access-management/overview'
'title': 'クラウドアクセス管理'
'description': 'クラウドにおけるClickHouseのアクセス制御がどのように機能するかについて説明し、ロールタイプに関する情報を含みます。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';



# ClickHouse Cloudにおけるアクセス管理 {#access-control-in-clickhouse-cloud}

ClickHouse Cloudは、コンソール自体およびその中で利用可能な機能へのアクセスを制御します。
**コンソールユーザー**は、このアクセスの基盤であり、すべての権限、役割、およびアクセス制御はこれらのユーザーに割り当てられ、管理されます。
[データベースレベルの権限がコンソールユーザーに関連付けられている場合](/cloud/security/common-access-management-queries#modifying-users-and-roles)、それによりSQLコンソール経由でのクエリ時にデータアクセスが管理されます。

## コンソールユーザーと役割 {#console-users-and-roles}

[コンソール > ユーザーと役割ページで組織とサービスの役割の割り当てを設定](/cloud/guides/sql-console/configure-org-service-role-assignments)します。
[各サービスの設定ページでSQLコンソール役割の割り当てを設定](/cloud/guides/sql-console/config-sql-console-role-assignments)します。

ユーザーは組織レベルの役割を割り当てられ、オプションで1つ以上のサービスのサービス役割が割り当てられることがあります。サービス役割は、サービスの設定ページでSQLコンソールにアクセスするためにユーザーにオプションで設定できます。
- 組織管理者役割が割り当てられたユーザーは、デフォルトでサービス管理者が付与されます。
- SAML統合を通じて組織に追加されたユーザーには、最小限の権限でサービスへのアクセスが設定されるまでメンバー役割が自動的に割り当てられます。
- サービス管理者はデフォルトでSQLコンソール管理者役割が割り当てられます。SQLコンソールの権限は、サービスの設定ページで削除できます。

| コンテキスト  | 役割                   | 説明                                      |
|:-------------|:-----------------------|:-----------------------------------------|
| 組織        | 管理者                | 組織のすべての管理活動を行い、すべての設定を制御します。デフォルトで組織の最初のユーザーに割り当てられます。 |
| 組織        | 開発者                | サービスを除くすべてに対する閲覧アクセスを持ち、読み取り専用APIキーを生成できる能力があります。 |
| 組織        | 請求                  | 使用状況と請求書を表示し、支払い方法を管理します。 |
| 組織        | メンバー              | サインインのみで、個人プロファイル設定の管理が可能です。デフォルトでSAML SSOユーザーに割り当てられます。 |
| サービス     | サービス管理者       | サービス設定を管理します。                   |
| サービス     | サービス読み取り専用 | サービスと設定を表示します。                 |
| SQLコンソール | SQLコンソール管理者  | サービス内のデータベースへの管理アクセスを持ち、デフォルトのデータベース役割に相当します。 |
| SQLコンソール | SQLコンソール読み取り専用 | サービス内のデータベースへの読み取り専用アクセスを持ちます。 |
| SQLコンソール | カスタム              | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して設定します。役割をSQLコンソールユーザーに割り当てるために、その名前を役割に付けます。 |

SQLコンソールユーザーのカスタム役割を作成し、一般的な役割を付与するには、以下のコマンドを実行します。メールアドレスは、コンソール内のユーザーのメールアドレスと一致する必要があります。

<VerticalStepper headerLevel="h4">

#### `database_developer`を作成し、権限を付与する {#create-database_developer-and-grant-permissions}

`database_developer`役割を作成し、`SHOW`、`CREATE`、`ALTER`、`DELETE`の権限を付与します。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### SQLコンソールユーザー役割を作成する {#create-sql-console-user-role}

SQLコンソールユーザーmy.user@domain.comの役割を作成し、`database_developer`役割を割り当てます。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

</VerticalStepper>

### SQLコンソールのパスワードレス認証 {#sql-console-passwordless-authentication}
SQLコンソールユーザーは各セッションごとに作成され、自動的にローテーションされるX.509証明書を使用して認証されます。セッションが終了するとユーザーは削除されます。監査のためのアクセスリストを生成する際は、コンソール内のサービスの設定タブに移動し、データベースユーザーに加えてSQLコンソールへのアクセスを確認してください。カスタム役割が設定されている場合、ユーザーのアクセスはユーザー名で終わる役割にリストされます。

## データベース権限 {#database-permissions}
以下をサービスおよびデータベース内でSQL [GRANT](/sql-reference/statements/grant)文を使用して設定します。

| 役割                  | 説明                                                                   |
|:----------------------|:------------------------------------------------------------------------|
| デフォルト           | サービスに対する完全な管理アクセス                                     |
| カスタム              | SQL [`GRANT`](/sql-reference/statements/grant)文を使用して設定します。 |

- データベース役割は加算的です。つまり、ユーザーが2つの役割のメンバーである場合、ユーザーは2つの役割の中で最も多くのアクセス権を持つことになります。役割を追加してもアクセス権を失うことはありません。
- データベース役割は他の役割に付与することができ、階層構造を形成します。役割は所属する役割のすべての権限を継承します。
- データベース役割はサービスごとに一意であり、同じサービス内の複数のデータベースに適用できます。

以下の図は、ユーザーが権限を付与されるさまざまな方法を示しています。

<Image img={user_grant_permissions_options} alt='ユーザーが権限を付与されるさまざまな方法を示す図' size="md" background="black"/>

### 初期設定 {#initial-settings} 
データベースには、自動的に追加され、サービスの作成時にdefault_roleが付与される`default`という名前のアカウントがあります。サービスを作成したユーザーは、サービス作成時に`default`アカウントに割り当てられる自動生成のランダムパスワードを提示されます。初期設定後、パスワードは表示されませんが、コンソール内でサービス管理者権限を持つ任意のユーザーが後で変更できます。このアカウントまたはコンソール内のサービス管理者権限を持つアカウントは、いつでも追加のデータベースユーザーと役割を設定できます。

:::note
コンソール内の`default`アカウントに割り当てられたパスワードを変更するには、左側のサービスメニューに移動し、サービスにアクセスし、設定タブに移動してリセットパスワードボタンをクリックします。
:::

私たちは、個人に関連付けられた新しいユーザーアカウントを作成し、そのユーザーにdefault_roleを付与することを推奨します。これは、ユーザーが実行した活動がそのユーザーIDに識別され、`default`アカウントはブレイクグラス型の活動用に予約されるためです。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

ユーザーはSHA256ハッシュ生成器やPythonの`hashlib`などのコード関数を使用して、適切な複雑さを持つ12文字以上のパスワードをSHA256文字列に変換し、システム管理者にパスワードとして提供することができます。これにより、管理者はクリアテキストのパスワードを見ることも扱うこともありません。

### SQLコンソールユーザーを含むデータベースアクセスリスト {#database-access-listings-with-sql-console-users}
以下の手順を使用して、組織内のSQLコンソールおよびデータベース全体の完全なアクセスリストを生成できます。

<VerticalStepper headerLevel="h4">

#### すべてのデータベース権限リストを取得 {#get-a-list-of-all-database-grants}

次のクエリを実行して、データベース内のすべての権限のリストを取得します。 

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

このリストをSQLコンソールにアクセスできるコンソールユーザーに関連付けます。
   
a. コンソールに移動します。

b. 関連するサービスを選択します。

c. 左側の設定を選択します。

d. SQLコンソールアクセスセクションにスクロールします。

e. データベースにアクセスできるユーザー数のリンク`このサービスには#人のユーザーがアクセスできます。`をクリックして、ユーザーリストを表示します。

</VerticalStepper>
