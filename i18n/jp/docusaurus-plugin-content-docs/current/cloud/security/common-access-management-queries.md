---
'sidebar_label': '共通アクセス管理クエリ'
'title': '共通アクセス管理クエリ'
'slug': '/cloud/security/common-access-management-queries'
'description': 'この記事では、SQLユーザーとロールの基本的な定義方法、そしてそれらの権限とアクセス許可をデータベース、テーブル、行、およびカラムに適用する方法を示します。'
---

import CommonUserRolesContent from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 一般アクセス管理クエリ

:::tip セルフマネージド
セルフマネージドの ClickHouse を使用している場合は、 [SQL ユーザーとロール](/guides/sre/user-management/index.md) をご覧ください。
:::

この記事では、SQL ユーザーとロールを定義し、それらの権限をデータベース、テーブル、行、カラムに適用する基本について説明します。

## 管理者ユーザー {#admin-user}

ClickHouse Cloud サービスには、サービスが作成されると同時に作成される管理者ユーザー `default` があります。 パスワードはサービス作成時に提供され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセット可能です。

ClickHouse Cloud サービスに追加の SQL ユーザーを追加する際には、SQL ユーザー名とパスワードが必要です。 彼らに管理レベルの権限を付与したい場合は、`default_role` を新しいユーザーに割り当ててください。 例えば、ユーザー `clickhouse_admin` を追加する場合：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL コンソールを使用する際、SQL ステートメントは `default` ユーザーとして実行されません。 代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行され、`cloud_login_email` は現在クエリを実行しているユーザーのメールアドレスです。

これらの自動生成された SQL コンソールユーザーは `default` ロールを持っています。
:::

## パスワードなし認証 {#passwordless-authentication}

SQL コンソールには 2 つのロールが用意されています： `sql_console_admin` は `default_role` と同じ権限を持ち、 `sql_console_read_only` は読み取り専用の権限を持ちます。

管理者ユーザーはデフォルトで `sql_console_admin` ロールが割り当てられるため、何も変更されません。 ただし、`sql_console_read_only` ロールにより、非管理者ユーザーに読み取り専用またはフルアクセスを任意のインスタンスに許可できます。 管理者がこのアクセスを構成する必要があります。 ロールは `GRANT` または `REVOKE` コマンドを使用して、インスタンス特有の要件により適合させることができ、これらのロールに加えた変更は永続化されます。

### 運用レベルのアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザーごとに詳細な制御を手動で設定することもできます。 新しい `sql_console_*` ロールをユーザーに割り当てる前に、`sql-console-role:<email>` という名前空間に一致する SQL コンソールユーザー固有のデータベースロールを作成する必要があります。 例えば：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、それがボイラープレートロールの代わりにユーザーに割り当てられます。 これにより、`sql_console_sa_role` や `sql_console_pm_role` などのロールを作成し、特定のユーザーに付与するなど、より複雑なアクセス制御構成を導入できます。 例えば：

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <whatever level of access> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <whatever level of access> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
