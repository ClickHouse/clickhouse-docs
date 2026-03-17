---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: 'PeerDB を使用して PostgreSQL データを移行する'
description: 'PeerDB を使用して PostgreSQL データを ClickHouse Managed Postgres に移行する方法について学びます'
keywords: ['postgres', 'postgresql', 'ロジカルレプリケーション', 'マイグレーション', 'データ転送', 'Managed Postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';
import settings from '@site/static/images/managed-postgres/peerdb/settings.png';


# PeerDB を使用して Managed Postgres に移行する \{#peerdb-migration\}

このガイドでは、PeerDB を使用して PostgreSQL データベースを ClickHouse Managed Postgres に移行するための手順をステップバイステップで説明します。

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## 前提条件 \{#migration-peerdb-prerequisites\}

- 移行元となる PostgreSQL データベースへのアクセス権限。
- データを移行先とする ClickHouse Managed Postgres インスタンス。
- PeerDB がインストールされているマシン。インストール手順については [PeerDB GitHub リポジトリ](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started) を参照してください。リポジトリをクローンして `docker-compose up` を実行するだけです。このガイドでは **PeerDB UI** を使用します。PeerDB が起動すると、`http://localhost:3000` でアクセス可能になります。

## 移行前の考慮事項 \{#migration-peerdb-considerations-before\}

移行を開始する前に、以下の点を確認してください。

- **データベースオブジェクト**: PeerDB はソーススキーマに基づき、ターゲットデータベースにテーブルを自動作成します。ただし、索引、制約、トリガーなど一部のデータベースオブジェクトは自動的には移行されません。移行後に、これらのオブジェクトをターゲットデータベース上で手動で再作成する必要があります。
- **DDL の変更**: 継続的レプリケーションを有効にした場合、PeerDB は DML 操作（INSERT、UPDATE、DELETE）についてソースとターゲットのデータベースを同期し、ADD COLUMN 操作を伝播します。ただし、その他の DDL 変更（DROP COLUMN、ALTER COLUMN など）は自動的には伝播されません。スキーマ変更のサポートについての詳細は[こちら](/integrations/clickpipes/postgres/schema-changes)を参照してください。
- **ネットワーク接続性**: PeerDB を実行しているマシンから、ソースおよびターゲットの両方のデータベースへアクセス可能であることを確認してください。接続を許可するために、ファイアウォールルールやセキュリティグループの設定を変更する必要がある場合があります。

## ピアを作成する \{#migration-peerdb-create-peers\}

まず、ソースデータベースとターゲットデータベースそれぞれについてピアを作成する必要があります。ピアはデータベースへの接続を表します。PeerDB の UI で、サイドバーの「Peers」をクリックして「Peers」セクションを開きます。新しいピアを作成するには、`+ New peer` ボタンをクリックします。

### ソース側ピアの作成 \{#migration-peerdb-source-peer\}

ホスト、ポート、データベース名、ユーザー名、パスワードなどの接続情報を入力して、ソース PostgreSQL データベース用のピアを作成します。すべて入力したら、`Create peer` ボタンをクリックしてピアを保存します。

<Image img={sourcePeer} alt="ソース側ピアの作成" size="md" border />

### ターゲットピアの作成 \{#migration-peerdb-target-peer\}

同様に、必要な接続情報を入力して、ClickHouse Managed Postgres インスタンス用のピアを作成します。インスタンスの[接続情報](../connection)は、ClickHouse Cloud コンソールから取得できます。情報を入力したら、`Create peer` ボタンをクリックしてターゲットピアを作成します。

<Image img={targetPeer} alt="ターゲットピアの作成" size="md" border />

これで、「Peers」セクションにソースピアとターゲットピアの両方が表示されているはずです。

<Image img={peers} alt="ピア一覧" size="md" border />

### ソーススキーマダンプの取得 \{#migration-peerdb-source-schema-dump\}

ターゲットデータベースでソースデータベースと同一のスキーマ構成を再現するために、ソースデータベースのスキーマダンプを取得する必要があります。ソースの PostgreSQL データベースについてスキーマのみのダンプを作成するには、`pg_dump` を使用できます。

<details>
  <summary>pg&#95;dump のインストール</summary>

  **Ubuntu:**

  パッケージリストを更新します。

  ```shell
  sudo apt update
  ```

  PostgreSQL クライアントをインストールします。

  ```shell
  sudo apt install postgresql-client
  ```

  **macOS:**

  方法 1: Homebrew を使用する (推奨)

  Homebrew がインストールされていない場合はインストールします。

  ```shell
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

  PostgreSQL をインストールします。

  ```shell
  brew install postgresql
  ```

  インストールを確認します。

  ```shell
  pg_dump --version
  ```
</details>

```shell
pg_dump -d 'postgresql://<user>:<password>@<host>:<port>/<database>'  -s > source_schema.sql
```


#### スキーマダンプから UNIQUE 制約と索引を削除する \{#migration-peerdb-remove-constraints-indexes\}

これをターゲットデータベースに適用する前に、ダンプファイルから UNIQUE 制約と索引を事前に削除しておく必要があります。そうしないと、これらの制約によって PeerDB によるターゲットテーブルへのインジェストがブロックされてしまいます。これらは次のコマンドで削除できます。

```shell
# Preview
grep -n "CONSTRAINT.*UNIQUE" <dump_file_path>
grep -n "CREATE UNIQUE INDEX" <dump_file_path>
grep -n -E "(CONSTRAINT.*UNIQUE|CREATE UNIQUE INDEX)" <dump_file_path>

# Remove
sed -i.bak -E '/CREATE UNIQUE INDEX/,/;/d; /(CONSTRAINT.*UNIQUE|ADD CONSTRAINT.*UNIQUE)/d' <dump_file_path>
```


### スキーマダンプをターゲットデータベースに適用する \{#migration-peerdb-apply-schema-dump\}

スキーマダンプファイルをクリーンアップしたら、`psql` で[接続](../connection)し、スキーマダンプファイルを実行してターゲットの ClickHouse Managed Postgres データベースに適用します。

```shell
psql -h <target_host> -p <target_port> -U <target_username> -d <target_database> -f source_schema.sql
```

ここではターゲット側で、外部キー制約によって PeerDB へのインジェストがブロックされないようにします。そのために、上記のターゲットピアで使用したターゲットロールを変更し、`session_replication_role` を `replica` に設定します:

```sql
ALTER ROLE <target_role> SET session_replication_role = replica;
```


## ミラーを作成する \{#migration-peerdb-create-mirror\}

次に、ソースとターゲットのピア間でのデータ移行プロセスを定義するミラーを作成します。PeerDB の UI でサイドバーの「Mirrors」をクリックして、「Mirrors」セクションに移動します。新しいミラーを作成するには、`+ New mirror` ボタンをクリックします。

<Image img={createMirror} alt="Create Mirror" size="md" border />

1. 移行内容がわかる名前をミラーに付けます。
2. ドロップダウンメニューから、先ほど作成したソースとターゲットのピアを選択します。
3. 次の点を確認します:

- Soft delete が OFF になっていること。
- `Advanced settings` を展開します。**Postgres type system is enabled** が有効になっており、**PeerDB columns are disabled** が無効になっていることを確認します。

<Image img={settings} alt="Mirror Settings" size="md" border />

4. 移行したいテーブルを選択します。特定のテーブルだけを選択することも、ソースデータベース内のすべてのテーブルを選択することもできます。

<Image img={tablePicker} alt="Table Picker" size="md" border />

:::info テーブルの選択
前のステップでスキーマをそのまま移行しているため、ターゲットデータベース内で、宛先テーブル名がソーステーブル名と同一であることを確認してください。
:::

5. ミラー設定の構成が完了したら、`Create mirror` ボタンをクリックします。

「Mirrors」セクションに、作成したばかりのミラーが表示されるはずです。

<Image img={mirrors} alt="Mirrors List" size="md" border />

## 初回ロードの完了を待つ \{#migration-peerdb-initial-load\}

ミラーを作成すると、PeerDB はソースからターゲットデータベースへの初回データロードを開始します。ミラーをクリックし、**Initial load** タブを開くと、初回データ移行の進行状況を確認できます。

<Image img={initialLoad} alt="Initial Load Progress" size="md" border />

初回ロードが完了すると、移行が完了したことを示すステータスが表示されます。

## 初期ロードとレプリケーションの監視 \{#migration-peerdb-monitoring\}

ソースの peer をクリックすると、PeerDB が実行中のコマンド一覧を確認できます。例えば、次のようなものがあります。

1. まず、各テーブル内の行数を見積もるために COUNT クエリを実行します。
2. 次に、NTILE を使用したパーティション分割クエリを実行し、大きなテーブルをより小さな chunk に分割して、データ転送を効率化します。
3. その後、FETCH コマンドを実行してソースデータベースからデータを取得し、PeerDB がそれらをターゲットデータベースに同期します。

## 移行後のタスク \{#migration-peerdb-considerations\}

:::note
これらの手順は、具体的なユースケースやアプリケーションの要件に応じて異なる場合があります。重要なのは、新しいシステムへ完全に切り替える前に、データの一貫性を確保し、ダウンタイムを最小限に抑え、移行後のデータの整合性を検証することです。
:::

移行が完了したら:

* **カットオーバー前の検証チェックを実施する**

トラフィックを切り替える前に、ソースとターゲットの主要なテーブルを比較します:

```sql
-- Row count comparison for critical tables
SELECT 'public.orders' AS table_name, COUNT(*) AS row_count FROM public.orders;
SELECT 'public.customers' AS table_name, COUNT(*) AS row_count FROM public.customers;

-- Spot-check latest records in high-activity tables
SELECT MAX(updated_at) FROM public.orders;
SELECT MAX(id) FROM public.orders;
```

* **ソースシステムへの書き込みを停止する**

まず、アプリケーションからの書き込みを一時停止します。追加の安全策として、カットオーバー中はソースデータベースを読み取り専用に設定します。

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

ロールバックが必要な場合は、書き込みを再び有効にできます。

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = off;
```

* **レプリケーションが完全に追いついていることを確認する**

1 つ以上の書き込み量の多いテーブルで、最新の行がソースとターゲットで一致していることを確認します:

```sql
-- Run on both source and target and compare results
SELECT MAX(id) AS latest_id, MAX(updated_at) AS latest_ts FROM public.orders;
```

* **制約、索引、トリガーを再作成して有効にする**

インジェストのために制約や索引を削除した、または適用を後回しにしていた場合は、ここで再適用します。また、以前に `replica` に設定していた場合は、ターゲット側のレプリケーションロールもリセットします。

```sql
ALTER ROLE <target_role> SET session_replication_role = origin;
```

```shell
# Example: apply a SQL file containing constraints/indexes/triggers
psql -h <target_host> -p <target_port> -U <target_user> -d <target_db> -f post_migration_objects.sql
```

* **移行先テーブルのシーケンスをリセットする**

データのロード後、テーブル内の現在の値に合わせてシーケンスを調整します:

```sql
-- Generic sequence reset for all serial/identity-backed columns in non-system schemas
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT
            n.nspname AS schema_name,
            c.relname AS table_name,
            a.attname AS column_name,
            pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) AS seq_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE c.relkind = 'r'
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        IF r.seq_name IS NOT NULL THEN
            EXECUTE format(
                'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                r.seq_name, r.column_name, r.schema_name, r.table_name
            );
        END IF;
    END LOOP;
END $$;
```

* **アプリケーショントラフィックを切り替える**

検証が完了し、シーケンスと制約が整ったら:

1. 読み取りトラフィックの向き先を ClickHouse Managed Postgres に切り替えます。
2. 書き込みトラフィックの向き先を ClickHouse Managed Postgres に切り替えます。
3. アプリケーションエラー、制約違反、データベースの健全性を監視します。

* **リソースをクリーンアップする**

移行に問題がないことを確認し、アプリケーションが ClickHouse Managed Postgres を使用するように切り替えたら、PeerDB のミラーとピアを削除できます。

:::info レプリケーションスロット
継続的レプリケーションを有効にした場合、PeerDB はソース PostgreSQL データベース上に **レプリケーションスロット** を作成します。不要なリソース消費を避けるため、移行完了後にソースデータベースからレプリケーションスロットを手動で削除してください。
:::


## 参考資料 \{#migration-peerdb-references\}

- [ClickHouse マネージド Postgres のドキュメント](../)
- [CDC 作成のための PeerDB ガイド](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe FAQ（PeerDB にも同様に適用されます）](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## 次のステップ \{#migration-pgdump-pg-restore-next-steps\}

おめでとうございます！pg_dump と pg_restore を使用して、PostgreSQL データベースを ClickHouse Managed Postgres に正常に移行できました。これで Managed Postgres の各種機能や ClickHouse との連携を試す準備が整いました。スムーズに始められるよう、10 分で完了するクイックスタートを用意しています:

- [Managed Postgres クイックスタートガイド](../quickstart)