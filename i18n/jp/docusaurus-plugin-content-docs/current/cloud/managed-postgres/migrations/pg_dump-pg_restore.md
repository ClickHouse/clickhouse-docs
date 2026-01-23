---
slug: /cloud/managed-postgres/migrations/pg_dump-pg_restore
sidebar_label: 'pg_dump と pg_restore'
title: 'pg_dump と pg_restore を使用して PostgreSQL データを移行する'
description: 'pg_dump と pg_restore を使用して PostgreSQL データを ClickHouse Managed Postgres に移行する方法について説明します'
keywords: ['postgres', 'postgresql', 'pg_dump', 'pg_restore', 'migration', 'data transfer', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';
import dumpCommand from '@site/static/images/managed-postgres/pg_dump_restore/dump-command.png';
import restoreCommand from '@site/static/images/managed-postgres/pg_dump_restore/restore-command.png';
import targetSetup from '@site/static/images/managed-postgres/pg_dump_restore/target-setup.png';


# pg_dump と pg_restore を使用して Managed Postgres に移行する \{#pg-dump-pg-restore\}

このガイドでは、`pg_dump` と `pg_restore` ユーティリティを使用して、PostgreSQL データベースを ClickHouse Managed Postgres へ移行する手順をステップバイステップで説明します。

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="pg_dump-pg_restore" />

## 前提条件 \{#migration-pgdump-pg-restore-prerequisites\}

- 移行元の PostgreSQL データベースにアクセスできること。
- ローカルマシンに `pg_dump` と `pg_restore` がインストールされていること。これらは通常、PostgreSQL のインストールに含まれています。インストールされていない場合は、[PostgreSQL 公式サイト](https://www.postgresql.org/download/) からダウンロードできます。

## セットアップ \{#migration-pgdump-pg-restore-setup\}

手順を説明するために、サンプルの RDS Postgres データベースをソースデータベースとして使用します。次のような構成です:

<Image img={sourceSetup} alt="ソース PostgreSQL データベースのセットアップ" size="xl" border />

ここでは次のような構成を対象とします:

- 2 つのテーブル `events` と `users`。`events` は 100 万行、`users` は 1,000 行あります。
- `events` には索引があります。
- `events` テーブルの上に VIEW が定義されています。
- 複数のシーケンス

## 移行元データベースのダンプを作成する \{#migration-pgdump-pg-restore-dump\}

ここでは、上記のオブジェクトのダンプファイルを作成するために `pg_dump` を使用します。コマンドはシンプルで、次のとおりです：

```shell
pg_dump \
  -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
  --format directory \
  -f rds-dump
```

ここでは、次のようにします:

* `<user>`、`<password>`、`<host>`、`<port>`、`<database>` を、ソースデータベースの認証情報に置き換えます。ほとんどの Postgres プロバイダーは、そのまま利用できる接続文字列を提供します。
* `--format directory` は、ダンプをディレクトリ形式で取得することを指定します。これは `pg_restore` に適した形式です。
* `-f rds-dump` は、ダンプファイルの出力ディレクトリを指定します。このディレクトリは自動的に作成されるため、事前に存在していてはいけません。
* `--jobs` フラグを追加し、その後ろに実行したい並列ジョブ数を指定することで、ダンプ処理を並列化することもできます。詳細については [pg&#95;dump のドキュメント](https://www.postgresql.org/docs/current/app-pgdump.html) を参照してください。

:::tip
この手順を一度試してみて、処理にかかる時間とダンプファイルのサイズの感覚をつかんでおくとよいでしょう。
:::

このコマンドを実行すると、次のようなイメージになります:

<Image img={dumpCommand} alt="pg_dump Command Execution" size="xl" border />


## ダンプを ClickHouse Managed Postgres に移行する \{#migration-pgdump-pg-restore-restore\}

ダンプファイルが用意できたので、`pg_restore` を使用して ClickHouse Managed Postgres インスタンスに復元します。 

### Managed Postgres インスタンスを作成する \{#migration-pgdump-pg-restore-create-pg\}

まず、Managed Postgres インスタンスがセットアップ済みであることを確認します。可能であれば、ソースと同じリージョンに配置してください。クイックガイドは [こちら](../quickstart#create-postgres-database) を参照してください。このガイドで作成するインスタンスは次のとおりです:

<Image img={createPgForMigrate} alt="ClickHouse Managed Postgres インスタンスを作成する" size="md" border />

### ダンプを復元する \{#migration-pgdump-pg-restore-restore-dump\}

ローカルマシンに戻ったら、`pg_restore` コマンドを使用してダンプを Managed Postgres インスタンスに復元します。

```shell
pg_restore \
  -d 'postgresql://<user>:<password>@<pg_clickhouse_host>:5432/<database>' \
  --verbose \
  rds-dump
```

Managed Postgres インスタンスの接続文字列は、ClickHouse Cloud コンソールから取得できます。取得方法については[こちら](../connection)で簡潔に説明しています。

ここでも、いくつか注意すべきフラグがあります。

* `--verbose` は、復元処理中の詳細な出力を提供します。
* `--jobs` フラグを使用して、復元処理を並列化することもできます。詳しくは [pg&#95;restore のドキュメント](https://www.postgresql.org/docs/current/app-pgrestore.html)を参照してください。

この例では、次のようになります。

<Image img={restoreCommand} alt="pg_restore コマンドの実行" size="xl" border />


## 移行の検証 \{#migration-pgdump-pg-restore-verify\}

リストア処理が完了したら、Managed Postgres インスタンスに接続し、すべてのデータとオブジェクトが正常に移行されていることを確認できます。接続してクエリを実行するには、任意の PostgreSQL クライアントを使用できます。
移行後の Managed Postgres のセットアップは、次のようになります。

<Image img={targetSetup} alt="移行先の Managed Postgres データベース構成" size="xl" border />

すべてのテーブル、索引、ビュー、シーケンスが揃っており、データ件数も一致していることが確認できます。

## 考慮事項 \{#migration-pgdump-pg-restore-considerations\}

- ソースおよびターゲットのデータベースで使用している PostgreSQL のバージョンに互換性があることを確認してください。
ソースサーバーより古いバージョンの pg_dump を使用すると、機能が不足したり、リストア時に問題が発生したりする可能性があります。可能であれば、ソースデータベースと同じ、またはそれより新しいメジャーバージョンの pg_dump を使用してください。
- 大規模なデータベースでは、ダンプおよびリストアにかなりの時間がかかる場合があります。
ダウンタイムを最小限に抑えられるよう計画し、サポートされている場合は並列ダンプ/リストア（--jobs）の利用も検討してください。
- pg_dump / pg_restore は、すべてのデータベース関連オブジェクトやランタイム状態を複製しない点に注意してください。
これには、ロールおよびロールメンバーシップ、レプリケーションスロット、サーバーレベルの設定（例：postgresql.conf、pg_hba.conf）、テーブルスペース、およびランタイム統計情報が含まれます。

## 次のステップ \{#migration-pgdump-pg-restore-next-steps\}

おめでとうございます。pg_dump と pg_restore を使用して PostgreSQL データベースを ClickHouse Managed Postgres へ正常に移行できました。これで、Managed Postgres の各種機能や ClickHouse との連携を活用する準備が整いました。10 分で完了するクイックスタートはこちらです。

- [Managed Postgres クイックスタートガイド](../quickstart)