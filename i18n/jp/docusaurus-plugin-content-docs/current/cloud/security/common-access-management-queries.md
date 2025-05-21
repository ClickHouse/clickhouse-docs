---
sidebar_label: 'アクセス管理クエリの一般的な例'
title: 'アクセス管理クエリの一般的な例'
slug: /cloud/security/common-access-management-queries
description: 'この記事ではSQLユーザーおよびロールの定義の基本と、それらの特権と権限をデータベース、テーブル、行、およびカラムに適用する方法を示します。'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# アクセス管理クエリの一般的な例

:::tip セルフマネージド
セルフマネージドの ClickHouse を使用している場合は、[SQLユーザーとロール](/guides/sre/user-management/index.md)を参照してください。
:::

この記事ではSQLユーザーおよびロールの定義の基本と、それらの特権と権限をデータベース、テーブル、行、およびカラムに適用する方法を示します。

## 管理ユーザー {#admin-user}

ClickHouse Cloud サービスには、`default` という管理ユーザーがあり、サービスが作成されるときに作成されます。パスワードはサービスの作成時に提供され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセットできます。

ClickHouse Cloud サービスに追加の SQL ユーザーを追加する場合、SQL ユーザー名とパスワードが必要です。管理者レベルの特権を持たせたい場合は、新しいユーザーに `default_role` を割り当てます。たとえば、ユーザー `clickhouse_admin` を追加する場合:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL コンソールを使用する場合、SQL ステートメントは `default` ユーザーとして実行されません。代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行されます。ここで `cloud_login_email` は、現在クエリを実行しているユーザーのメールアドレスです。

これらの自動生成された SQL コンソールユーザーには、`default` ロールが与えられています。
:::

## パスワードレス認証 {#passwordless-authentication}

SQLコンソールには2つのロールが用意されています: `sql_console_admin` は `default_role` と同じ権限を持ち、 `sql_console_read_only` は読み取り専用の権限を持ちます。

管理ユーザーはデフォルトで `sql_console_admin` ロールが割り当てられるため、彼らにとっては何も変更はありません。しかし、`sql_console_read_only` ロールにより、非管理ユーザーも任意のインスタンスに対して読み取り専用またはフルアクセスを許可される可能性があります。これには管理者によるアクセスの設定が必要です。ロールは `GRANT` または `REVOKE` コマンドを使用して調整でき、インスタンス特有の要件により適合させることができ、これらのロールへの変更は永続化されます。

### グラニュラーアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザーレベルの細かい粒度のために手動で構成することもできます。新しい `sql_console_*` ロールをユーザーに割り当てる前に、名前空間 `sql-console-role:<email>` に一致する SQL コンソールユーザー特有のデータベースロールを作成する必要があります。たとえば:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、それは標準のロールの代わりにユーザーに割り当てられます。これにより、`sql_console_sa_role` や `sql_console_pm_role` のようなロールを作成し、それらを特定のユーザーに割り当てるなど、より複雑なアクセス制御設定が導入されます。例えば:

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <whatever level of access> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <whatever level of access> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role TO `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role TO `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role TO `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
