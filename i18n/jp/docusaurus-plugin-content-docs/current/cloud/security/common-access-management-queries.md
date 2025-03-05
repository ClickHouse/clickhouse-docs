---
sidebar_label: "一般的なアクセス管理クエリ"
title: "一般的なアクセス管理クエリ"
slug: "/cloud/security/common-access-management-queries"
---

import CommonUserRolesContent from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 一般的なアクセス管理クエリ

:::tip セルフマネージド
セルフマネージドの ClickHouse を使用している場合は、[SQL ユーザーとロール](/guides/sre/user-management/index.md)を参照してください。
:::

この記事では、SQL ユーザーとロールの定義と、それらの特権と許可をデータベース、テーブル、行、カラムに適用する基本を示します。

## 管理者ユーザー {#admin-user}

ClickHouse Cloud サービスには、サービス作成時に作成される `default` という管理者ユーザーがあります。 パスワードはサービスの作成時に提供され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセットできます。

ClickHouse Cloud サービスに追加の SQL ユーザーを追加する場合、それらには SQL ユーザー名とパスワードが必要です。 管理者レベルの特権を持たせたい場合は、新しいユーザーに `default_role` のロールを割り当てます。 例えば、ユーザー `clickhouse_admin` を追加する場合：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL コンソールを使用する場合、SQL ステートメントは `default` ユーザーとして実行されません。 代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行されます。ここで、`cloud_login_email` は現在クエリを実行しているユーザーのメールアドレスです。

これらの自動生成された SQL コンソールユーザーは `default` ロールを持っています。
:::

## パスワードなし認証 {#passwordless-authentication}

SQL コンソールには、`sql_console_admin` および `sql_console_read_only` の2つのロールがあります。 `sql_console_admin` は `default_role` と同じ権限を持ち、`sql_console_read_only` は読み取り専用の権限を持っています。

管理者ユーザーにはデフォルトで `sql_console_admin` ロールが割り当てられているため、彼らにとっては何も変更されません。 ただし、`sql_console_read_only` ロールは、非管理者ユーザーに読み取り専用またはフルアクセスを任意のインスタンスに対して付与できます。このアクセスは管理者によって設定する必要があります。ロールは `GRANT` または `REVOKE` コマンドを使用してインスタンス固有の要件に適合させることができ、これらのロールに対する変更は永続化されます。

### グラニュラーアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザー レベルの粒度で手動で構成することもできます。 新しい `sql_console_*` ロールをユーザーに割り当てる前に、名前空間 `sql-console-role:<email>` に対応する SQL コンソールユーザー専用のデータベースロールを作成する必要があります。 例えば：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、それはテンプレートのロールの代わりにユーザーに割り当てられます。 これにより、`sql_console_sa_role` や `sql_console_pm_role` などのより複雑なアクセス制御構成を作成し、特定のユーザーに付与することができます。 例えば：

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
