---
sidebar_label: "一般的なアクセス管理クエリ"
title: "一般的なアクセス管理クエリ"
slug: "/cloud/security/common-access-management-queries"
---

import CommonUserRolesContent from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';

# 一般的なアクセス管理クエリ

:::tip セルフマネージド
セルフマネージドの ClickHouse を使用している場合は、[SQL ユーザーとロール](/guides/sre/user-management/index.md)を参照してください。
:::

この記事では、SQL ユーザーとロールを定義し、これらの権限と許可をデータベース、テーブル、行、カラムに適用する基本について説明します。

## 管理者ユーザー {#admin-user}

ClickHouse Cloud サービスには、サービスが作成される際に作成される管理者ユーザー `default` があります。 パスワードはサービス作成時に提供され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセット可能です。

ClickHouse Cloud サービスに追加の SQL ユーザーを追加する際には、SQL ユーザー名とパスワードが必要になります。 管理者レベルの権限を付与したい場合は、新しいユーザーに `default_role` のロールを割り当ててください。 例えば、ユーザー `clickhouse_admin` を追加する場合は次の通りです：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL コンソールを使用する際は、SQL ステートメントは `default` ユーザーとして実行されません。 代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行され、`cloud_login_email` は現在クエリを実行しているユーザーのメールアドレスです。

これらの自動生成された SQL コンソールユーザーは `default` ロールを持っています。
:::

## パスワードなし認証 {#passwordless-authentication}

SQL コンソールには 2 つのロールが用意されています：`sql_console_admin`（`default_role` と同じ権限を持つ）および `sql_console_read_only`（読み取り専用権限を持つ）です。

管理者ユーザーにはデフォルトで `sql_console_admin` のロールが割り当てられますので、彼らの環境に変更はありません。 ただし、`sql_console_read_only` ロールを使用すると、非管理者ユーザーに対して読み取り専用またはフルアクセスが提供されます。 このアクセスは管理者が構成する必要があります。 ロールは `GRANT` や `REVOKE` コマンドを使用して、インスタンス特有の要件に合わせて調整できます。また、これらのロールへの変更は永続化されます。

### 精密なアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザーレベルでの詳細な制御のために手動で構成することもできます。 新しい `sql_console_*` ロールをユーザーに割り当てる前に、`sql-console-role:<email>` という名前空間に一致する SQL コンソールユーザー特有のデータベースロールを作成する必要があります。 例えば：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、定型的なロールの代わりにそのロールがユーザーに割り当てられます。 これにより、`sql_console_sa_role` や `sql_console_pm_role` のようなロールを作成し、特定のユーザーに割り当てるなど、より複雑なアクセス制御設定が可能になります。 例えば：

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
