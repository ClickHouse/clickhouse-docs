---
slug: /cloud/managed-postgres/migrations/logical-replication
sidebar_label: '論理レプリケーション'
title: '論理レプリケーションを使用して PostgreSQL データを移行する'
description: '論理レプリケーションを使用して、PostgreSQL データを ClickHouse Managed Postgres に移行する方法を説明します'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres']
doc_type: 'ガイド'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceReplicationSetup from '@site/static/images/managed-postgres/logical_replication/source-setup.png';
import targetInitialSetup from '@site/static/images/managed-postgres/logical_replication/target-initial-setup.png';
import migrationResult from '@site/static/images/managed-postgres/logical_replication/migration-result.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';


# ロジカルレプリケーションを使用して ClickHouse Managed Postgres へ移行する \{#logical-replication-migration\}

このガイドでは、Postgres ネイティブのロジカルレプリケーションを使用して、PostgreSQL データベースを ClickHouse Managed Postgres に移行する手順を、順を追って説明します。

<PrivatePreviewBadge />

## 前提条件 \{#migration-logical-replication-prerequisites\}

* ソースとなる PostgreSQL データベースへのアクセス権があること。
* ローカルマシンに `psql`、`pg_dump`、`pg_restore` がインストールされていること。これはターゲットデータベースに空のテーブルを作成するために使用します。これらのツールは通常、PostgreSQL のインストールに含まれています。含まれていない場合は、[PostgreSQL 公式サイト](https://www.postgresql.org/download/) からダウンロードできます。
* ソースデータベースが ClickHouse Managed Postgres から到達可能であること。必要なファイアウォールルールやセキュリティグループの設定が、この接続を許可していることを確認してください。Managed Postgres インスタンスの送信（egress）IP アドレスは、次のコマンドで取得できます。

```shell
dig +short <your-managed-postgres-hostname>
```


## セットアップ \{#migration-logical-replication-setup\}

ロジカル レプリケーションを動作させるには、ソースデータベースが適切に構成されている必要があります。主な要件は次のとおりです。

- ソースデータベースの `wal_level` が `logical` に設定されている必要があります。
- ソースデータベースの `max_replication_slots` が少なくとも `1` に設定されている必要があります。
- RDS（本ガイドで例として使用）では、パラメーターグループで `rds.logical_replication` が `1` に設定されていることを確認する必要があります。
- ソースデータベースのユーザーは `REPLICATION` 権限を持っている必要があります。RDS の場合、次のコマンドを実行します:
    ```sql
    GRANT rds_replication TO <your-username>;
    ```
- ターゲットデータベースで使用するロールは、ターゲットデータベースのオブジェクトに対する書き込み権限を持っている必要があります:
    ```sql
    GRANT USAGE ON SCHEMA <schema_i> TO subscriber_user;
    GRANT CREATE ON DATABASE destination_db TO subscriber_user;
    GRANT pg_create_subscription TO subscriber_user;

    -- テーブル権限を付与
    GRANT INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA <schema_i> TO subscriber_user;
    ```

ソースデータベースが次のように構成されていることを確認してください:

<Image img={sourceReplicationSetup} alt="ソース PostgreSQL のレプリケーション設定" size="md" border />

## ソースデータベースのスキーマのみのダンプ \{#migration-logical-replication-schema-dump\}

ロジカルレプリケーションをセットアップする前に、ターゲットの ClickHouse Managed Postgres データベースにスキーマを作成する必要があります。これは、`pg_dump` を使用してソースデータベースのスキーマのみのダンプを取得することで行えます。

```shell
pg_dump \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    -s \
    --format directory \
    -f rds-dump
```

ここでは次のように指定します。

* `<user>`、`<password>`、`<host>`、`<port>`、`<database>` をソースデータベースの認証情報に置き換えます。
* `-s` は、スキーマのみを含むダンプを取得することを指定します。
* `--format directory` は、`pg_restore` に適したディレクトリ形式でダンプを出力することを指定します。
* `-f rds-dump` は、ダンプファイルの出力ディレクトリを指定します。このディレクトリは自動的に作成され、事前に存在していてはなりません。

この例では、`events` テーブルと `users` テーブルの 2 つがあります。`events` には 100 万行、`users` には 1,000 行があります。

<Image img={sourceSetup} alt="Source PostgreSQL Tables Setup" size="xl" border />


### Managed Postgres インスタンスを作成する \{#migration-pgdump-pg-restore-create-pg\}

まず、Managed Postgres インスタンスが作成済みであることを確認してください。可能であれば、ソースと同じリージョンに配置します。クイックガイドは[こちら](../quickstart#create-postgres-database)を参照してください。このガイドでは、次のようなインスタンスを作成します:

<Image img={createPgForMigrate} alt="ClickHouse Managed Postgres インスタンスを作成する" size="md" border />

## ClickHouse Managed Postgres へスキーマを復元する \{#migration-logical-replication-restore-schema\}

スキーマダンプが用意できたので、`pg_restore` を使って ClickHouse Managed Postgres インスタンスに復元します。

```shell
pg_restore \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    --verbose \
    rds-dump
```

Here:

* `<user>`, `<password>`, `<host>`, `<port>`, `<database>` を、ターゲットの ClickHouse Managed Postgres データベースの認証情報に置き換えます。
* `--verbose` は、リストア処理中の詳細な出力を行います。
  このコマンドは、データを一切含めずに、ターゲットのデータベース内にすべてのテーブル、索引、ビュー、およびその他のスキーマオブジェクトを作成します。

このコマンドを実行すると、今回のケースでは 2 つのテーブルが作成されますが、中身は空の状態です。

<Image img={targetInitialSetup} alt="ターゲット ClickHouse Managed Postgres の初期セットアップ" size="xl" border />


## ロジカルレプリケーションをセットアップする \{#migration-logical-replication-setup-replication\}

スキーマの準備ができたら、ソースデータベースからターゲットとなる ClickHouse Managed Postgres データベースへのロジカルレプリケーションをセットアップします。これには、ソースデータベース側で publication を作成し、ターゲットデータベース側で subscription を作成する作業が含まれます。

### ソースデータベースでパブリケーションを作成する \{#migration-logical-replication-create-publication\}

ソースのPostgreSQLデータベースに接続し、レプリケーション対象とするテーブルを含むパブリケーションを作成します。

```sql
CREATE PUBLICATION <pub_name> FOR TABLE table1, table2...;
```

:::info
多数のテーブルが存在する場合、FOR ALL TABLES で publication を作成するとネットワークのオーバーヘッドが発生する可能性があります。レプリケーション対象とするテーブルだけを指定することを推奨します。
:::


### 対象の ClickHouse Managed Postgres データベース上でサブスクリプションを作成する \{#migration-logical-replication-create-subscription\}

次に、対象の ClickHouse Managed Postgres データベースに接続し、ソースデータベースのパブリケーションに接続するサブスクリプションを作成します。

```sql
CREATE SUBSCRIPTION demo_rds_subscription
CONNECTION 'postgresql://<user>:<password>@<host>:<port>/<database>'
PUBLICATION <pub_name_you_entered_above>;
```

これにより、ソースデータベース上にレプリケーションスロットが自動的に作成され、指定したテーブルからターゲットデータベースへのデータのレプリケーションが開始されます。データ量によっては、この処理に時間がかかる場合があります。

このケースでは、サブスクリプションを設定すると、データが次のように流れ込みました。

<Image img={migrationResult} alt="論理レプリケーション後の移行結果" size="xl" border />

ソースデータベースに新たに挿入された行は、ほぼリアルタイムでターゲットである ClickHouse Managed Postgres データベースにレプリケートされるようになります。


## 注意事項と考慮点 \{#migration-logical-replication-caveats\}

- ロジカルレプリケーションは、データの変更（INSERT、UPDATE、DELETE）のみを複製します。スキーマ変更（ALTER TABLE など）は別途対応する必要があります。
- レプリケーションの中断を避けるため、ソースデータベースとターゲットデータベース間のネットワーク接続が安定していることを確認してください。
- レプリケーションラグを監視し、ターゲットデータベースがソースデータベースに追従できていることを確認してください。ソースデータベースの `max_slot_wal_keep_size` に適切な値を設定することで、レプリケーションスロットの肥大化を抑え、ディスク容量の過剰消費を防ぐのに役立ちます。
- ユースケースによっては、レプリケーションプロセスに対する監視およびアラート通知を設定することを検討してください。

## 次のステップ \{#migration-pgdump-pg-restore-next-steps\}

おめでとうございます。`pg_dump` と `pg_restore` を使用して、PostgreSQL データベースを ClickHouse Managed Postgres へ正常に移行できました。これで、Managed Postgres の各種機能や ClickHouse との連携を活用する準備が整いました。ここから進めるための 10 分程度のクイックスタートは次のとおりです。

- [Managed Postgres クイックスタートガイド](../quickstart)