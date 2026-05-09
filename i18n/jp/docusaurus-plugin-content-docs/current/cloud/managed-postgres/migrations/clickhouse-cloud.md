---
slug: /cloud/managed-postgres/migrations/clickhouse-cloud
sidebar_label: 'ClickHouse Cloud'
title: 'ClickHouse Cloud の Data sources を使用した PostgreSQL データの移行'
description: 'ClickHouse Cloud に組み込まれている Data sources のインポートウィザードを使用して、PostgreSQL データベースを ClickHouse Managed Postgres に移行する方法を説明します。'
keywords: ['postgres', 'postgresql', '論理レプリケーション', '移行', 'データ転送', 'managed postgres', 'データソース', 'インポート']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
import initialLoad from '@site/static/images/managed-postgres/pgpg/initialload.png';
import migrationForm from '@site/static/images/managed-postgres/pgpg/migrationform.png';
import migrationList from '@site/static/images/managed-postgres/pgpg/migrationlist.png';
import nextExport from '@site/static/images/managed-postgres/pgpg/nextexport.png';
import nextImport from '@site/static/images/managed-postgres/pgpg/nextimport.png';
import overview from '@site/static/images/managed-postgres/pgpg/overview.png';
import psqlExport from '@site/static/images/managed-postgres/pgpg/psqlexport.png';
import psqlImport from '@site/static/images/managed-postgres/pgpg/psqlimport.png';
import serviceCard from '@site/static/images/managed-postgres/pgpg/servicecard.png';
import startImport from '@site/static/images/managed-postgres/pgpg/startimport.png';
import tablePicker from '@site/static/images/managed-postgres/pgpg/tablepicker.png';

# ClickHouse Cloudを使用してManaged Postgresに移行する \{#migrate-managed-postgres\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-clickhouse-cloud" />

ClickHouse Cloudには、外部のPostgreSQLデータベースをManaged Postgresサービスに移行するための組み込みインポートウィザードが用意されています。このウィザードは、ソース接続、schema のエクスポートとインポート、レプリケーション設定、テーブルの選択を、ガイド付きの5つのステップで処理します。

## 前提条件 \{#prerequisites\}

* レプリケーション権限を持つユーザーで、移行元の PostgreSQL データベースにアクセスできること。
* 移行先として ClickHouse Managed Postgres サービスがあること。まだ利用していない場合は、[クイックスタート](../quickstart)を参照してください。
* ローカルマシンに `pg_dump` と `psql` がインストールされていること。どちらも標準の PostgreSQL クライアントツールに含まれています。

## 移行前の考慮事項 \{#considerations\}

* **DDL の伝播**: 継続的レプリケーション (CDC) では、DML 操作と `ADD COLUMN` が取り込まれます。`DROP COLUMN` や `ALTER COLUMN` などのその他の DDL 変更は伝播されないため、ターゲット側で手動で適用する必要があります。
* **外部キー制約**: 外部キーのチェックによってインジェストが妨げられないように、ターゲットロールで一時的に `session_replication_role = replica` を設定します。これについては、以下のステップ 3 で説明します。

## ステップ 1: ソースデータベースに接続する \{#step-1-connect\}

[ClickHouse Cloud コンソール](https://clickhouse.cloud)を開き、Managed Postgres サービスを選択します。

<Image img={serviceCard} alt="ClickHouse Cloud のサービス一覧にある Managed Postgres サービスカード" size="lg" border />

左側のサイドバーで、**Data sources** をクリックします。

<Image img={overview} alt="Managed Postgres サービスのサイドバーにある Data sources 項目" size="lg" border />

**Start import** をクリックします。

<Image img={startImport} alt="Start import ボタンが表示された Data sources ページ" size="lg" border />

ソース PostgreSQL データベースの接続情報 (ホスト、ポート、ユーザー名、パスワード、データベース名) を入力します。必要に応じて、**TLS** を有効にします。

ソースデータベースへのプライベート接続が必要な場合は、**SSH トンネリング** を選択し、必要な SSH 情報を入力できます。これにより、公開されていないデータベースにも移行プロセスから安全に接続できます。

インジェスト方法を選択します。

* **初期ロード + CDC** — 既存データをコピーした後、継続的な変更に合わせてターゲットを同期し続けます。
* **初期ロード only** — 一回限りのコピーで、継続的なレプリケーションは行いません。
* **CDC only** — 初回コピーをスキップし、この時点以降の新しい変更のみをレプリケートします。

<Image img={migrationForm} alt="ステップ 1: インジェスト方法のオプションを含むソースデータベース接続フォーム" size="lg" border />

**Next** をクリックします。

## ステップ 2: データベース schema をエクスポートする \{#step-2-export-schema\}

ウィザードには、ソース接続の詳細があらかじめ入力された `pg_dump` 命令語が表示されます。これをターミナルで実行します。

<Image img={nextExport} alt="ステップ 2: schema をエクスポートするための pg_dump 命令語" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

これにより、現在のディレクトリに `pg.sql` が作成されます。

<Image img={psqlExport} alt="`pg_dump` 実行後のターミナル出力" size="lg" border />

**Next** をクリックします。

## ステップ 3: Managed Postgres サービスに schema をインポートする \{#step-3-import-schema\}

ドロップダウンから宛先データベースを選択するか、**Create a new database** をクリックして新しく作成します。

ウィザードに、schema ダンプを Managed Postgres サービスに適用するための `psql` 命令語が表示されます。これをターミナルで実行します。

<Image img={nextImport} alt="ステップ 3: schema のインポート用 `psql` 命令語" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="psql schema インポート実行後のターミナル出力" size="lg" border />

schema を適用したら、外部キー制約がインジェストを妨げないよう、対象のロールで `session_replication_role` を `replica` に設定します。

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'replica';
```


**次へ** をクリックします。

## ステップ4: インジェスト設定を構成する \{#step-4-ingestion-settings\}

論理レプリケーションで使用するパブリケーションを指定します。空欄のままにすると、パブリケーションは自動的に作成されます。

スループットを調整するには、**詳細なレプリケーション設定**を展開します。

| 設定                     | デフォルト   | 説明                             |
| ---------------------- | ------- | ------------------------------ |
| 同期間隔 (秒)               | 10      | レプリケーションスロットをポーリングする頻度         |
| 初期ロードの並列スレッド数          | 4       | Bulk Copy フェーズで使用するスレッド数       |
| プルバッチサイズ               | 100,000 | レプリケーションの各バッチで取得する行数           |
| スナップショットのパーティションあたりの行数 | 100000  | 大規模テーブルのスナップショットにおけるパーティションサイズ |
| 並列スナップショット取得テーブル数      | 1       | 同時にスナップショットを取得するテーブル数          |

<Image img={advancedSettings} alt="ステップ4: パブリケーションと詳細なレプリケーションオプションを含むインジェスト設定フォーム" size="lg" border />

**次へ**をクリックします。

## Step 5: テーブルを選択 \{#step-5-select-tables\}

複製するテーブルを選択します。テーブルは schema ごとにまとめられています。個別にテーブルを選択するか、schema を展開してその中のテーブルをすべて選択します。

<Image img={tablePicker} alt="ステップ 5: schema ごとにまとめられたテーブル選択画面と「移行を作成」ボタン" size="lg" border />

**移行を作成** をクリックします。

## 移行を監視する \{#monitor\}

移行を作成すると、**Data sources** に **Running** ステータスで表示されます。

<Image img={migrationList} alt="実行中の移行が表示された Data sources の一覧" size="lg" border />

移行をクリックして詳細ビューを開きます。**Tables** タブには、処理済みの行、パーティション、パーティションあたりの平均時間など、各テーブルの初期ロードの進行状況が表示されます。CDC が開始されると、**Metrics** タブにレプリケーションの遅延とスループットが表示されます。

<Image img={initialLoad} alt="テーブルごとの初期ロード統計が表示された移行の詳細ビュー" size="lg" border />

## 移行後の作業 \{#post-migration\}

初期ロードが完了し、CDC を使用している場合はレプリケーション遅延がほぼゼロになったら:

**行数を検証します。** トラフィックを切り替える前に、重要なテーブルの行数をソースとターゲットの両方で抜き取り確認します:

```sql
SELECT COUNT(*) FROM public.orders;
```

**ソース側への書き込みを停止します。** アプリケーションからの書き込みを一時停止します。切り替え時に読み取り専用モードを適用するには:

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**レプリケーションが追いついていることを確認します。** ソースとターゲットの最新行を比較します。

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**制約を再度有効化し、レプリケーションロールを復元します。** インポート中に後回しにした索引、制約、トリガーを適用した後、ターゲットロールをリセットします。

```sql
ALTER ROLE <target_role> SET session_replication_role TO 'origin';
```

**シーケンスをリセットします。** 各テーブルの現在の最大値に合わせてシーケンスを調整します。

```sql
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

**アプリケーショントラフィックを切り替えます。** 読み取り先と書き込み先を Managed Postgres サービスに切り替え、エラー、制約違反、レプリケーションの健全性を監視します。

**クリーンアップします。**  切り替えを完了し、新しいサービスが正常であることを確認したら、**Data sources** から移行を削除します。CDC を使用した場合は、リソースを解放するためにソース側のレプリケーションスロットを削除します:

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## 次のステップ \{#next-steps\}

* [Managed Postgres クイックスタート](../quickstart)
* [Managed Postgres の接続詳細](../connection)
* [ClickPipes Postgres FAQ](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)