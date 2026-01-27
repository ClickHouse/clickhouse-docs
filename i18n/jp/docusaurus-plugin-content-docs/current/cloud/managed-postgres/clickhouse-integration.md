---
slug: /cloud/managed-postgres/clickhouse-integration
sidebar_label: 'ClickHouse 連携'
title: 'ClickHouse 連携'
description: '組み込みの CDC（変更データキャプチャ）機能を使用して、Postgres のデータを ClickHouse にレプリケートします'
keywords: ['postgres', 'clickhouse 連携', 'cdc', 'レプリケーション', 'clickpipes', 'データ同期']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import chIntegrationIntro from '@site/static/images/managed-postgres/clickhouse-integration-intro.png';
import replicationServiceStep from '@site/static/images/managed-postgres/replication-service-step.png';
import selectTablesStep from '@site/static/images/managed-postgres/select-tables-step.png';
import integrationRunning from '@site/static/images/managed-postgres/integration-running.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="clickhouse-integration" />

すべての Managed Postgres インスタンスには、任意の ClickHouse サービスへの組み込みの CDC（変更データキャプチャ）機能が付属しています。これにより、Postgres インスタンス上のデータの一部またはすべてを ClickHouse に移行し、Postgres 上のデータ変更を継続的かつほぼリアルタイムに ClickHouse に反映させることができます。これは内部的には [ClickPipes](/integrations/clickpipes) によって実現されています。

この機能にアクセスするには、Postgres インスタンスのサイドバーで **ClickHouse Integration** をクリックします。

<Image img={chIntegrationIntro} alt="サイドバーに統合オプションが表示されている ClickHouse インテグレーションのランディングページ" size="md" border />

:::note
続行する前に、Postgres サービスが ClickPipes サービスからアクセス可能であることを確認してください。通常はデフォルトで満たされていますが、IP アクセスを制限している場合は、**ClickHouse service** が存在するリージョンに基づいて、[この](/integrations/clickpipes#list-of-static-ips) リストにある一部の送信元 IP からのアクセスを許可する必要がある場合があります。
:::

**Replicate data in ClickHouse** をクリックして、ClickPipe の設定を開始します。

<VerticalStepper type="numbered" headerLevel="h2">
  ## レプリケーションサービスを構成する \{#configure-replication-service\}

  レプリケーション設定を入力します：

  * **Integration name**: この ClickPipe の名前
  * **ClickHouse service**: 既存の ClickHouse Cloud サービスを選択するか、新規に作成します
  * **Postgres database**: レプリケーション元となるソースデータベース
  * **Replication method**: 次のいずれかを選択します:
    * **Initial load + CDC**: 既存データをインポートし、新しい変更でテーブルを更新し続けます（推奨）
    * **Initial load only**: 既存データのスナップショットを 1 回だけ取得し、その後の更新は行いません
    * **CDC only**: 初期スナップショットをスキップし、以降の新しい変更のみを取り込みます

  <Image img={replicationServiceStep} alt="統合名、宛先サービス、およびレプリケーション方法オプションを示すレプリケーションサービスの設定画面" size="md" border />

  **Next** をクリックして進みます。

  ## レプリケーションするテーブルを選択する \{#select-tables\}

  宛先データベースを選択し、どのテーブルをレプリケーションするかを選択します：

  * **Destination database**: 既存の ClickHouse データベースを選択するか、新規に作成します
  * **Prefix default destination table names with schema name**: 名前の競合を避けるために、Postgres のスキーマ名をプレフィックスとして付与します
  * **Preserve NULL values from source**: デフォルト値への変換ではなく、NULL 値をそのまま保持します
  * **Remove deleted rows during merges**: [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) テーブルに対して、バックグラウンドマージ中に削除済みの行を物理的に削除します

  スキーマを展開し、レプリケーションする個々のテーブルを選択します。宛先テーブル名やカラム設定をカスタマイズすることもできます。

  <Image img={selectTablesStep} alt="データベース選択、レプリケーションオプション、およびスキーマごとにグループ化されたテーブルピッカーを含むテーブル選択ステップ" size="md" border />

  **Replicate data to ClickHouse** をクリックして、レプリケーションを開始します。

  ## ClickPipe を監視する \{#monitor-clickpipe\}

  ClickPipe が開始されると、同じメニューに一覧表示されます。すべてのデータの初回スナップショットは、テーブルサイズに応じて時間がかかる場合があります。

  <Image img={integrationRunning} alt="宛先サービスとステータスを持つ実行中の ClickPipe が表示された ClickHouse インテグレーション一覧" size="md" border />

  インテグレーション名をクリックすると、詳細なステータスの表示、進行状況の監視、エラーの確認、および ClickPipe の管理が行えます。ClickPipe が取りうるさまざまな状態については、[Lifecycle of a Postgres ClickPipe](/integrations/clickpipes/postgres/lifecycle) を参照してください。
</VerticalStepper>
