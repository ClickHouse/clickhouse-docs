---
sidebar_label: 'データベース サービスアカウントの管理'
slug: /cloud/security/manage-database-service-accounts
title: 'データベース サービスアカウントの管理'
description: 'このページでは、管理者がデータベース サービスアカウントを追加する方法について説明します'
doc_type: 'guide'
keywords: ['データベース サービスアカウント', 'アクセス管理', 'セキュリティ', '権限']
---

データベース サービスアカウントは、認証用に別のパスワードまたは証明書を持つユーザーとしてシンプルに運用することもできます。より高度な運用では、SET ROLE を使用して権限のスコープを動的に変更できるアカウントをセットアップし、ログアウトやページの再読み込みを行わずにプロファイルをすばやく切り替えられるようにすることもできます。

## 概要 \{#overview\}

[SET ROLE](/docs/sql-reference/statements/set-role) を使用すると、セッション中のサービスアカウントの権限範囲を動的に絞り込めます。これは、有効な権限を、アクティブ化したロールによって付与されたもののみに制限することで実現されます。この方法には、次のような利点があります。

* サービスアカウントには複数のロールを割り当てられますが、特定のクエリに必要なロールだけを有効化できます。
* サービスアカウントが侵害された場合でも、攻撃者が利用できるのはアクティブなロールの権限だけです。
* タスクごとに別々の認証情報を用意しなくても、1 つのアカウントでロールを切り替えながらさまざまなタスクを実行できます。
* 個々のユーザーを更新する代わりに 1 つのロールを変更するだけで、同種のサービスアカウント全体の権限を更新できます。
* ログで、クエリ実行時にどのロールがアクティブだったかを追跡できるため、セキュリティ監査の文脈をより明確に把握できます。

実際には、次のようにします。

1. 許可する範囲を表すロールを設計します (read&#95;only、メンテナンス など)
2. それらをサービスアカウントに付与します
3. 接続時に、`SET ROLE` (または role パラメータ) でアクティブなロールを選択し、そのセッションで実行可能な操作を制限します

## サービスロールをセットアップする \{#setup-service-roles\}

<VerticalStepper headerLevel="h3">
  ### サービスアカウントにロールを付与する \{#grant-roles-to-service-account\}

  まず、必要な特権/設定を持つロールを作成し、それらをサービスアカウントに付与します。

  ```sql
  CREATE ROLE read_only_role;
  GRANT SELECT ON db1.* TO read_only_role;

  CREATE ROLE maint_role;
  GRANT SELECT, INSERT, ALTER on db1.* TO maint_role;

  GRANT read_only_role, maint_role TO service_user;
  ```

  ### SET ROLE を使用してセッションの権限範囲を定義する \{#define-permission-boundaries\}

  セッションの開始時に、サービスアカウントは有効にするロールを選択します。

  ```sql
  -- このセッションでは読み取り専用として動作
  SET ROLE read_only_role;
  ```

  または:

  ```sql
  -- 付与されたすべてのロールを使用する（フルアクセス）
  SET ROLE ALL;
  ```

  `SET ROLE` は現在のユーザーのロールを有効化します。実効特権は、有効なすべてのロールの特権と、ユーザーに直接付与された特権を合わせたものです。

  すべてのロールを無効化することもできます:

  ```sql
  SET ROLE NONE;
  ```

  または複数のロールを有効化できます:

  ```sql
  SET ROLE read_only_role, maint_role;
  ```

  現在有効なロールは `system.current_roles` で確認できます。

  ### サービスアカウントのデフォルトロールを設定する \{#set-default-role\}

  サービスアカウントが常に制限付きモードで開始されるようにするには、デフォルトロールを設定します:

  ```sql
  SET DEFAULT ROLE read_only_role TO service_user;
  ```

  または

  ```sql
  SET DEFAULT ROLE ALL EXCEPT maint_role TO service_user;
  ```

  ### HTTP / プログラムからの SET ROLE の使用 \{#use-set-role-programmatically\}

  サービスアカウントが HTTP 経由で接続する場合、`SET ROLE; SELECT ...` を複数文として送信することはできません。代わりに、ロールをクエリパラメータとして渡します:

  ```shell
  curl "https://host:8123?user=service_user&password=...&role=read_only_role" \
   --data-binary "SELECT * FROM db1.table1"
  ```

  `?role=`... は、その文の前に `SET ROLE read_only_role` を実行するのと同等です。複数の role パラメータは `SET ROLE role 1, role 2` と同様に動作します。

  一部のドライバ (例: Python 用 ClickHouse Connect) では、各リクエストで送信される role 設定を指定でき、サーバーはそれをセッションロールとして使用します。
</VerticalStepper>