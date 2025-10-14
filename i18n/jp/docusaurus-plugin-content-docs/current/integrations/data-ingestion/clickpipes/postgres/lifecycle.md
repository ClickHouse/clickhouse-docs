---
'sidebar_label': 'Postgres ClickPipeのライフサイクル'
'description': 'さまざまなパイプのステータスとその意味'
'slug': '/integrations/clickpipes/postgres/lifecycle'
'title': 'Postgres ClickPipeのライフサイクル'
'doc_type': 'guide'
---



# Lifecycle of a Postgres ClickPipe {#lifecycle}

この文書では、Postgres ClickPipeのさまざまなフェーズ、異なるステータス、およびそれらが持つ意味について説明します。

## Provisioning {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスでは、サービスのためにClickPipesを実行するための基盤となるインフラストラクチャを立ち上げ、パイプの初期メタデータを登録します。ClickPipesの計算資源はサービス内で共有されるため、2つ目のClickPipeは1つ目よりもはるかに速く作成されます－インフラストラクチャが既に整っているためです。

## Setup {#setup}

パイプがプロビジョニングされると、`Setup`状態に入ります。この状態では、宛先のClickHouseテーブルを作成します。また、ここでソーステーブルのテーブル定義を取得し、記録します。

## Snapshot {#snapshot}

セットアップが完了すると、`Snapshot`状態に入ります（CDC専用パイプの場合は`Running`に遷移します）。`Snapshot`、`Initial Snapshot`、および`Initial Load`（より一般的）は互換性のある用語です。この状態では、ソースデータベーステーブルのスナップショットを取得し、それをClickHouseに読み込みます。これは論理レプリケーションを使用せず、このステップでレプリケーションスロットが作成されるため、`max_slot_wal_keep_size`やストレージパラメータは初期ロード中のスロット成長を考慮する必要があります。初期ロードの詳細については、[並列初期ロードのドキュメント](./parallel_initial_load)を参照してください。再同期がトリガーされたり、既存のパイプに新しいテーブルが追加された場合も、パイプは`Snapshot`状態に入ります。

## Running {#running}

初期ロードが完了すると、パイプは`Running`状態に入ります（スナップショット専用パイプの場合は`Completed`に遷移します）。ここでパイプは`Change-Data Capture`を開始します。この状態では、ソースデータベースからClickHouseへの論理レプリケーションを開始します。CDCの制御に関する情報については、[CDCの制御に関するドキュメント](./sync_control)を参照してください。

## Paused {#paused}

パイプが`Running`状態にあるとき、停止することができます。これによりCDCプロセスが停止し、パイプは`Paused`状態に入ります。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse内の既存データはそのまま残ります。この状態からパイプを再開することができます。

## Pausing {#pausing}

:::note
この状態は近日中に追加されます。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が継続して機能するように、今のうちにサポートを追加することを検討してください。
:::
Pauseボタンをクリックすると、パイプは`Pausing`状態に入ります。これはCDCプロセスを停止する途中である一時的な状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態に入ります。

## Modifying {#modifying}
:::note
この状態は近日中に追加されます。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が継続して機能するように、今のうちにサポートを追加することを検討してください。
:::
現在、この状態はパイプがテーブルを削除するプロセスにあることを示します。

## Resync {#resync}
:::note
この状態は近日中に追加されます。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が継続して機能するように、今のうちにサポートを追加することを検討してください。
:::
この状態は、パイプが原テーブルとの間で _resyncテーブルの原子的な入れ替えを行っている再同期フェーズにあることを示します。再同期の詳細については、[再同期ドキュメント](./resync)を参照してください。

## Completed {#completed}

この状態はスナップショット専用パイプに適用され、スナップショットが完了し、もう作業がないことを示します。

## Failed {#failed}

パイプに回復不能なエラーが発生した場合、`Failed`状態に入ります。この状態から回復するために、サポートに連絡するか、パイプを[再同期](./resync)することができます。

## Degraded {#degraded}

:::note
この状態は近日中に追加されます。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が継続して機能するように、今のうちにサポートを追加することを検討してください。
:::
