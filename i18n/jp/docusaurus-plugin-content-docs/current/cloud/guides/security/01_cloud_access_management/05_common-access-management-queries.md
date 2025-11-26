---
sidebar_label: '一般的なアクセス管理クエリ'
title: '一般的なアクセス管理クエリ'
slug: /cloud/security/common-access-management-queries
description: 'この記事では、SQL ユーザーとロールの定義方法の基本と、それらの権限およびパーミッションをデータベース、テーブル、行、列に適用する方法について説明します。'
keywords: ['ClickHouse Cloud', 'アクセス管理']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# 一般的なアクセス管理クエリ

:::tip 自前運用
自前運用の ClickHouse を使用している場合は、[SQL ユーザーとロール](/guides/sre/user-management/index.md) を参照してください。
:::

この記事では、SQL ユーザーとロールの基本的な定義方法と、それらの権限（パーミッション）をデータベース、テーブル、行、列に適用する方法を説明します。



## 管理ユーザー

ClickHouse Cloud のサービスには、サービス作成時に `default` という管理ユーザーが作成されます。パスワードはサービス作成時に付与され、**Admin** ロールを持つ ClickHouse Cloud ユーザーであればリセットできます。

ClickHouse Cloud サービスに追加の SQL ユーザーを作成する場合、それぞれに SQL のユーザー名とパスワードが必要です。管理者レベルの権限を付与したい場合は、新しいユーザーにロール `default_role` を割り当ててください。例えば、ユーザー `clickhouse_admin` を追加する場合は次のとおりです。

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL Console を使用する場合、SQL ステートメントは `default` ユーザーとしては実行されません。代わりに、ステートメントは `sql-console:${cloud_login_email}` という名前のユーザーとして実行されます。ここで `cloud_login_email` は、現在クエリを実行しているユーザーのメールアドレスです。

これら自動的に生成される SQL Console ユーザーには、`default` ロールが付与されています。
:::


## パスワードレス認証

SQL コンソールには 2 種類のロールが利用可能です。`sql_console_admin` は `default_role` と同一の権限を持ち、`sql_console_read_only` は読み取り専用の権限を持ちます。

管理者ユーザーにはデフォルトで `sql_console_admin` ロールが割り当てられるため、これまでと動作は変わりません。一方で、`sql_console_read_only` ロールを使用すると、非管理者ユーザーに対して任意のインスタンスへの読み取り専用アクセスまたはフルアクセスを付与できます。このアクセス権の構成は管理者が行う必要があります。ロールは `GRANT` または `REVOKE` コマンドを使用して調整でき、インスタンス固有の要件に合わせて構成可能であり、これらのロールに加えられた変更は保存されます。

### きめ細かなアクセス制御

このアクセス制御機能は、ユーザー単位でも手動で設定できます。新しい `sql_console_*` ロールをユーザーに割り当てる前に、名前空間 `sql-console-role:<email>` に一致する、SQL コンソール用のユーザー固有データベースロールを作成しておく必要があります。例えば次のとおりです。

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

一致するロールが検出された場合は、定型的なロールではなく、そのロールがユーザーに割り当てられます。これにより、`sql_console_sa_role` や `sql_console_pm_role` のようなロールを作成して特定のユーザーに付与するなど、より複雑なアクセス制御構成を行えるようになります。例えば、次のようになります。

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
