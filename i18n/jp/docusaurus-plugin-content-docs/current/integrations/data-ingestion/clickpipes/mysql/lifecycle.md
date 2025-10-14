---
'sidebar_label': 'MySQL ClickPipeのライフサイクル'
'description': 'さまざまなパイプのステータスとその意味'
'slug': '/integrations/clickpipes/mysql/lifecycle'
'title': 'MySQL ClickPipeのライフサイクル'
'doc_type': 'guide'
---


# MySQL ClickPipeのライフサイクル {#lifecycle}

これは、MySQL ClickPipeのさまざまなフェーズ、異なるステータスの意味に関する文書です。これはMariaDBにも適用されます。

## プロビジョニング {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスは、サービスのためのClickPipesを実行するための基盤となるインフラストラクチャを立ち上げ、パイプの初期メタデータを登録するプロセスです。サービス内のClickPipesの計算資源は共有されているため、2つ目のClickPipeは1つ目のものよりもはるかに早く作成されます -- インフラストラクチャはすでに整っています。

## セットアップ {#setup}

パイプがプロビジョニングされると、`Setup`状態に入ります。この状態では、宛先のClickHouseテーブルを作成します。また、ここでソーステーブルのテーブル定義を取得し、記録します。

## スナップショット {#snapshot}

セットアップが完了すると、`Snapshot`状態に入ります（ただし、CDC専用のパイプは`Running`に移行します）。`Snapshot`、`Initial Snapshot`、および`Initial Load`（より一般的）は、互換的な用語です。この状態では、ソースのMySQLテーブルのスナップショットを取り、ClickHouseにロードします。バイナリログの保持設定は、初期ロード時間を考慮する必要があります。初期ロードに関する詳細は、[並行初期ロードの文書](./parallel_initial_load)を参照してください。パイプは、再同期がトリガーされた場合や、既存のパイプに新しいテーブルが追加された場合にも`Snapshot`状態に入ります。

## 実行中 {#running}

初期ロードが完了すると、パイプは`Running`状態に入ります（ただし、スナップショット専用のパイプは`Completed`に移行します）。ここでは、パイプが`Change-Data Capture`を開始します。この状態では、ソースデータベースからバイナリログを読み取り、データをバッチでClickHouseに同期します。CDCを制御するための情報については、[CDC制御に関するドキュメント](./sync_control)を参照してください。

## 一時停止 {#paused}

パイプが`Running`状態にある場合、一時停止することができます。これによりCDCプロセスが停止し、パイプは`Paused`状態に入ります。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse内の既存データはそのまま保持されます。この状態からパイプを再開することができます。

## 一時停止中 {#pausing}

:::note
この状態は近日中に追加されます。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が引き続き機能するように、今すぐサポートを追加してみてください。
:::
Pauseボタンをクリックすると、パイプは`Pausing`状態に入ります。これは、CDCプロセスを停止するプロセス中の一時的な状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態に入ります。

## 修正中 {#modifying}
:::note
この状態は近日中に追加されます。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が引き続き機能するように、今すぐサポートを追加してみてください。
:::
現在、この状態はパイプがテーブルを削除しているプロセス中であることを示しています。

## 再同期 {#resync}
:::note
この状態は近日中に追加されます。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が引き続き機能するように、今すぐサポートを追加してみてください。
:::
この状態は、パイプが元のテーブルと_resyncテーブルの原子スワップを実行している再同期のフェーズにあることを示します。再同期に関する詳細は、[再同期の文書](./resync)を参照してください。

## 完了 {#completed}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了し、作業がこれ以上ないことを示します。

## 失敗 {#failed}

パイプに回復不可能なエラーが発生した場合、`Failed`状態に入ります。サポートに連絡するか、パイプを[再同期](./resync)してこの状態から回復できます。

## 劣化 {#degraded}

:::note
この状態は近日中に追加されます。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合、リリース時に統合が引き続き機能するように、今すぐサポートを追加してみてください。
:::
