---
'sidebar_label': '一般的なアクセス管理クエリ'
'title': '一般的なアクセス管理クエリ'
'slug': '/cloud/security/common-access-management-queries'
'description': 'この記事では、SQL ユーザーとロールを定義し、それらの特権と権限をデータベース、TABLE、行、カラムに適用する基本について説明します。'
'doc_type': 'guide'
---

import CommonUserRolesContent from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 一般的なアクセス管理クエリ

:::tip セルフマネージド
セルフマネージドの ClickHouse を使用している場合は、[SQL ユーザーとロール](/guides/sre/user-management/index.md)を参照してください。
:::

この記事では、SQL ユーザーとロールの定義の基本、およびそれらの特権と権限をデータベース、テーブル、行、カラムに適用する方法を示します。

## 管理者ユーザー {#admin-user}

ClickHouse Cloud サービスには、サービス作成時に作成される管理者ユーザー `default` があります。 パスワードはサービス作成時に提供され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセット可能です。

ClickHouse Cloud サービスに追加の SQL ユーザーを追加する場合、SQL ユーザー名とパスワードが必要です。 管理者レベルの権限を付与する場合は、新しいユーザーに `default_role` を割り当てます。 例えば、ユーザー `clickhouse_admin` を追加する場合:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL コンソールを使用する場合、SQL ステートメントは `default` ユーザーとして実行されません。 代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行されます。ここで、`cloud_login_email` はクエリを実行しているユーザーのメールアドレスです。

これらの自動生成された SQL コンソールユーザーには `default` ロールが付与されます。
:::

## パスワードなし認証 {#passwordless-authentication}

SQL コンソールに利用できるロールは2つあります: `sql_console_admin` は `default_role` と同じ権限を持ち、`sql_console_read_only` は読み取り専用の権限を持っています。

管理者ユーザーはデフォルトで `sql_console_admin` ロールが割り当てられているため、彼らにとって何も変更はありません。 しかし、`sql_console_read_only` ロールを用いると、非管理者ユーザーに対して読み取り専用または完全なアクセスを付与することができます。 そのアクセスの構成は管理者が行う必要があります。 インスタンス固有の要件に合わせて、`GRANT` または `REVOKE` コマンドを使用してロールを調整することができ、これらのロールへの変更は永続化されます。

### 詳細なアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザー単位の詳細な制御のために手動で構成することも可能です。 新しい `sql_console_*` ロールをユーザーに割り当てる前に、名前空間 `sql-console-role:<email>` に一致するSQLコンソールユーザー固有のデータベースロールを作成する必要があります。 例えば:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、それがボイラープレートのロールの代わりにユーザーに割り当てられます。 これにより、`sql_console_sa_role` と `sql_console_pm_role` のようなロールを作成し、特定のユーザーに付与するなど、より複雑なアクセス制御構成が導入されます。 たとえば:

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
