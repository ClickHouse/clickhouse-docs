---
sidebar_label: '一般的なアクセス管理クエリ'
title: '一般的なアクセス管理クエリ'
slug: /cloud/security/common-access-management-queries
description: 'この記事では、SQL ユーザーとロールの基本的な定義方法と、それらの権限や許可をデータベース、テーブル、行、列に適用する方法を説明します。'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# 一般的なアクセス管理クエリ

:::tip セルフマネージド
セルフマネージドの ClickHouse を利用している場合は、[SQL users and roles](/guides/sre/user-management/index.md) を参照してください。
:::

この記事では、SQL ユーザーとロールの基本的な定義方法と、それらの権限をデータベース、テーブル、行、列に適用する方法について説明します。



## 管理者ユーザー {#admin-user}

ClickHouse Cloudサービスには、サービス作成時に作成される管理者ユーザー`default`があります。パスワードはサービス作成時に提供され、**Admin**ロールを持つClickHouse Cloudユーザーがリセットできます。

ClickHouse Cloudサービスに追加のSQLユーザーを作成する際は、SQLユーザー名とパスワードが必要です。管理者レベルの権限を付与する場合は、新しいユーザーに`default_role`ロールを割り当てます。例えば、ユーザー`clickhouse_admin`を追加する場合:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL Consoleを使用する場合、SQLステートメントは`default`ユーザーとして実行されません。代わりに、`sql-console:${cloud_login_email}`という名前のユーザーとして実行されます。ここで`cloud_login_email`は、クエリを実行しているユーザーのメールアドレスです。

これらの自動生成されたSQL Consoleユーザーには`default`ロールが付与されています。
:::


## パスワードレス認証 {#passwordless-authentication}

SQLコンソールには2つのロールが用意されています:`sql_console_admin`は`default_role`と同一の権限を持ち、`sql_console_read_only`は読み取り専用の権限を持ちます。

管理者ユーザーにはデフォルトで`sql_console_admin`ロールが割り当てられるため、管理者の操作に変更はありません。一方、`sql_console_read_only`ロールを使用することで、非管理者ユーザーに任意のインスタンスへの読み取り専用アクセスまたはフルアクセスを付与できます。このアクセス設定は管理者が行う必要があります。これらのロールは、インスタンス固有の要件に合わせて`GRANT`または`REVOKE`コマンドを使用して調整でき、ロールに加えられた変更はすべて永続化されます。

### 詳細なアクセス制御 {#granular-access-control}

このアクセス制御機能は、ユーザーレベルの粒度で手動設定することもできます。新しい`sql_console_*`ロールをユーザーに割り当てる前に、`sql-console-role:<email>`という名前空間に一致するSQLコンソールユーザー固有のデータベースロールを作成する必要があります。例:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出されると、定型ロールの代わりにそのロールがユーザーに割り当てられます。これにより、`sql_console_sa_role`や`sql_console_pm_role`のようなロールを作成し、特定のユーザーに付与するといった、より複雑なアクセス制御設定が可能になります。例:

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
