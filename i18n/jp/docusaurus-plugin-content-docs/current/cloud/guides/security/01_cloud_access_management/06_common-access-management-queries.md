---
sidebar_label: '一般的なアクセス管理クエリ'
title: '一般的なアクセス管理クエリ'
slug: /cloud/security/common-access-management-queries
description: 'この記事では、SQLユーザーとロールの定義方法の基本と、それらの権限をデータベース、テーブル、行、カラムに適用する方法を説明します。'
keywords: ['ClickHouse Cloud', 'アクセス管理']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# よくあるアクセス管理クエリ \{#common-access-management-queries\}

:::tip セルフマネージド
セルフマネージド環境で ClickHouse を運用している場合は、[SQL ユーザーとロール](/guides/sre/user-management/index.md) を参照してください。
:::

この記事では、SQL ユーザーとロールの定義方法の基本と、それらの権限をデータベース、テーブル、行、カラムに適用する方法について説明します。

## 管理ユーザー \{#admin-user\}

ClickHouse Cloud サービスには、サービス作成時に作成される `default` という管理ユーザーが存在します。パスワードはサービス作成時に設定され、**Admin** ロールを持つ ClickHouse Cloud ユーザーによってリセットできます。

ClickHouse Cloud サービスに追加の SQL ユーザーを作成する場合、それぞれに SQL のユーザー名とパスワードが必要です。これらのユーザーに管理者レベルの権限を付与したい場合は、新しいユーザーにロール `default_role` を割り当ててください。たとえば、ユーザー `clickhouse_admin` を追加する場合は次のようになります。

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL Console を使用する場合、SQL 文は `default` ユーザーとしては実行されません。代わりに、`sql-console:${cloud_login_email}` という名前のユーザーとして実行されます。ここで `cloud_login_email` は、現在クエリを実行しているユーザーのメールアドレスです。

これら自動的に作成される SQL Console ユーザーには、`default` ロールが付与されています。
:::


## パスワードレス認証 \{#passwordless-authentication\}

SQL コンソールには 2 種類のロールが利用可能です。`sql_console_admin` は `default_role` と同一の権限を持ち、`sql_console_read_only` は読み取り専用の権限を持ちます。 

管理者ユーザーにはデフォルトで `sql_console_admin` ロールが割り当てられるため、管理者側の挙動は従来と変わりません。一方で、`sql_console_read_only` ロールを使用すると、非管理者ユーザーにも任意のインスタンスに対する読み取り専用またはフルアクセス権を付与できます。このアクセスの設定は管理者が行う必要があります。ロールは `GRANT` または `REVOKE` コマンドを使用して調整でき、インスタンス固有の要件に合わせて柔軟に構成できます。これらのロールに対して行われた変更は永続化されます。

### きめ細かなアクセス制御 \{#granular-access-control\}

このアクセス制御機能は、ユーザー単位で手動設定することも可能です。新しい `sql_console_*` ロールをユーザーに割り当てる前に、ネームスペース `sql-console-role:&lt;email&gt;` に一致する、SQL コンソール用のユーザー固有のデータベースロールを作成しておく必要があります。たとえば、次のとおりです。

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが見つかった場合は、ひな型のロールではなく、そのロールがユーザーに割り当てられます。これにより、`sql_console_sa_role` や `sql_console_pm_role` といったロールを作成して特定のユーザーに付与するなど、より複雑なアクセス制御の構成が可能になります。例えば、次のようにします。

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
