---
slug: /cloud/managed-postgres/migrations/clickpipes
sidebar_label: 'ClickPipes'
title: 'ClickPipes の Data sources を使用して PostgreSQL データを移行する'
description: 'ClickPipes を使用して PostgreSQL データベースを ClickHouse Managed Postgres に移行する方法を説明します。'
keywords: ['postgres', 'postgresql', '論理レプリケーション', '移行', 'ClickPipes', 'Managed Postgres', 'Data sources', 'インポート']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
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

# ClickPipes を使用して Managed Postgres に移行する \{#migrate-managed-postgres\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-guide-clickhouse-cloud-beta" />

ClickHouse Cloud では、外部 PostgreSQL データベースを Managed Postgres サービスに移行するための ClickPipes を利用できるようになりました。この統合機能により、ソースデータベースへの接続、スキーマのエクスポート、Managed Postgres へのインポート、継続的なレプリケーションの設定を、よりスムーズに行えます。

## 前提条件 \{#prerequisites\}

* レプリケーション権限を持つユーザーで、ソース PostgreSQL データベースにアクセスできること。ソースに応じたセットアップガイドに従ってください。
  * [Amazon RDS Postgres](/integrations/clickpipes/postgres/source/rds)
  * [Amazon Aurora Postgres](/integrations/clickpipes/postgres/source/aurora)
  * [Supabase Postgres](/integrations/clickpipes/postgres/source/supabase)
  * [Google Cloud SQL Postgres](/integrations/clickpipes/postgres/source/google-cloudsql)
  * [Azure Flexible Server for Postgres](/integrations/clickpipes/postgres/source/azure-flexible-server-postgres)
  * [Neon Postgres](/integrations/clickpipes/postgres/source/neon-postgres)
  * [Crunchy Bridge Postgres](/integrations/clickpipes/postgres/source/crunchy-postgres)
  * [TimescaleDB](/integrations/clickpipes/postgres/source/timescale)
  * その他のプロバイダーまたはセルフホストのインスタンスについては、[Generic Postgres Source](/integrations/clickpipes/postgres/source/generic)
* 移行先として ClickHouse Managed Postgres サービスがあること。まだない場合は、[quickstart](../quickstart) を参照してください。
* ローカルマシンに `pg_dump` と `psql` がインストールされていること。どちらも標準の PostgreSQL クライアントツールに含まれています。

## 移行前の注意点 \{#considerations\}

* **DDL の反映**: 継続的レプリケーション (CDC) では、DML 操作と `ADD COLUMN` は取り込まれます。一方、`DROP COLUMN` や `ALTER COLUMN` などのその他の DDL 変更は反映されないため、ターゲット側で手動適用する必要があります。

:::note
移行中に問題が発生した場合は、一般的なエラーとその対処法について [Managed Postgres Migrations FAQ](/cloud/managed-postgres/migrations/faq) を確認してください。
:::

## ステップ 1: ソースデータベースに接続する \{#step-1-connect\}

[ClickHouse Cloud コンソール](https://clickhouse.cloud)を開き、Managed Postgres サービスを選択します。

<Image img={serviceCard} alt="ClickHouse Cloud のサービス一覧にある Managed Postgres サービスカード" size="lg" border />

左側のサイドバーで、**Data sources**をクリックします。

<Image img={overview} alt="Managed Postgres サービスのサイドバーにあるData sources項目" size="lg" border />

**Start import** をクリックします。

<Image img={startImport} alt="Start import ボタンが表示されたデータソースページ" size="lg" border />

ソース PostgreSQL データベースの接続情報 (ホスト、ポート、ユーザー名、パスワード、データベース名) を入力します。ソース側で必要な場合は、**TLS** を有効にします。

ソースデータベースへのプライベート接続が必要な場合は、**SSH トンネリング**を選択し、必要な SSH 情報を入力します。これにより、一般公開されていないデータベースにも移行処理から安全に接続できます。

インジェスト方法を選択します。

* **初期ロード + CDC** — 既存データをコピーした後、継続的な変更に合わせてターゲットを同期し続けます。
* **初期ロードのみ** — 一回限りのコピーで、継続的なレプリケーションは行いません。
* **CDC のみ** — 初回コピーをスキップし、この時点以降の新しい変更のみをレプリケートします。

<Image img={migrationForm} alt="ステップ 1: インジェスト方法のオプションを含むソースデータベース接続フォーム" size="lg" border />

**Next** をクリックします。

## ステップ 2: データベースのスキーマをエクスポートする \{#step-2-export-schema\}

ウィザードには、ソース接続情報が事前入力された `pg_dump` コマンドが表示されます。これをターミナルで実行してください。

<Image img={nextExport} alt="ステップ 2: スキーマのエクスポート用 `pg_dump` コマンド" size="lg" border />

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

## ステップ 3: スキーマを Managed Postgres サービスにインポートする \{#step-3-import-schema\}

ドロップダウンから宛先データベースを選択するか、**Create a new database** をクリックして新しく作成します。

ウィザードに、スキーマダンプを Managed Postgres サービスに適用するための `psql` コマンドが表示されます。これをターミナルで実行します。

<Image img={nextImport} alt="ステップ 3: スキーマのインポート用 `psql` コマンド" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="psqlでスキーマをインポートした後のターミナル出力" size="lg" border />

「次へ」をクリックします。

## Step 4: インジェスト設定を構成する \{#step-4-ingestion-settings\}

論理レプリケーションに使用するパブリケーションを指定します。空欄のままにすると、パブリケーションが自動的に作成されます。

スループットを調整するには、**高度なレプリケーション設定** を展開します：

| 設定                    | デフォルト   | 説明                             |
| --------------------- | ------- | ------------------------------ |
| 同期間隔 (秒)              | 10      | レプリケーションスロットをポーリングする頻度         |
| 初期ロードの並列スレッド数         | 4       | 一括コピーフェーズで使用するスレッド数            |
| 取得バッチサイズ              | 100,000 | レプリケーションの各バッチで取得する行数           |
| スナップショットのパーティションごとの行数 | 100000  | 大規模テーブルのスナップショットにおけるパーティションサイズ |
| 並列でスナップショットするテーブル数    | 1       | 同時にスナップショットするテーブル数             |

<Image img={advancedSettings} alt="ステップ 4: パブリケーションと高度なレプリケーションオプションを含むインジェスト設定フォーム" size="lg" border />

**Next** をクリックします。

## ステップ 5: テーブルを選択 \{#step-5-select-tables\}

レプリケートするテーブルを選択します。テーブルはスキーマごとにグループ化されています。個別のテーブルを選択するか、スキーマを展開してその配下のテーブルをすべて選択します。

<Image img={tablePicker} alt="ステップ 5: スキーマごとにグループ化されたテーブルピッカーと、Create migration ボタン" size="lg" border />

**Create migration** をクリックします。

## 移行を監視する \{#monitor\}

移行を作成すると、**Data sources** に **Running** ステータスで表示されます。

<Image img={migrationList} alt="実行中の移行が表示された Data sources の一覧" size="lg" border />

移行をクリックして詳細ビューを開きます。**Tables** タブには、処理済み行数、パーティション数、パーティションあたりの平均時間など、各テーブルの初期ロードの進行状況が表示されます。**Metrics** タブには、CDC の開始後にレプリケーションラグとスループットが表示されます。

<Image img={initialLoad} alt="テーブルごとの初期ロード統計が表示された移行の詳細ビュー" size="lg" border />

## 移行後のタスク \{#post-migration\}

初期ロードが完了し、CDC (変更データキャプチャ) を使用している場合はレプリケーションラグがほぼゼロになったら、次の作業を実施します。

**行数を確認します。** トラフィックを切り替える前に、ソース側とターゲット側の両方で重要なテーブルを抜き取り確認します。

```sql
SELECT COUNT(*) FROM public.orders;
```

**移行元への書き込みを停止します。** アプリケーションからの書き込みを一時停止します。切り替え時に読み取り専用モードを適用するには:

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**レプリケーションが追いついていることを確認します。** ソースとターゲットで最新の行を比較します:

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**シーケンスをリセットします。** 各テーブルの現在の最大値に合わせてシーケンスを調整します:

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

**クリーンアップします。**  切り替えを実施し、新しいサービスが正常であることを確認したら、**Data sources** から移行を削除します。CDC を使用した場合は、リソースを解放するためにソース側のレプリケーションスロットを削除します。

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## 次のステップ \{#next-steps\}

* [Managed Postgres クイックスタート](../quickstart)
* [Managed Postgres 接続情報](../connection)
* [ClickPipes Postgres FAQ](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)