---
'sidebar_label': 'MongoDB ClickPipeのライフサイクル'
'description': 'さまざまなパイプのステータスとその意味'
'slug': '/integrations/clickpipes/mongodb/lifecycle'
'title': 'MongoDB ClickPipeのライフサイクル'
'doc_type': 'guide'
---


# MongoDB ClickPipeのライフサイクル {#lifecycle}

これはMongoDB ClickPipeのさまざまなフェーズ、可能なステータス、およびそれらの意味についての文書です。

## プロビジョニング {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスは、サービスのためにClickPipesを実行するための基盤となるインフラを立ち上げ、パイプ用の初期メタデータを登録するプロセスです。サービス内のClickPipesのコンピュートは共有されるため、あなたの2つ目のClickPipeは最初のものよりもはるかに早く作成されます。すでにインフラが整っているからです。

## セットアップ {#setup}

パイプがプロビジョニングされると、`Setup`状態に入ります。この状態では、宛先のClickHouseテーブルを作成します。

## スナップショット {#snapshot}

セットアップが完了すると、`Snapshot`状態に入ります（CDC専用のパイプでない限り、`Running`に遷移します）。`Snapshot`、`Initial Snapshot`および`Initial Load`（より一般的）は入れ替えて使うことができます。この状態では、ソースのMongoDBコレクションのスナップショットを取得し、それをClickHouseにロードします。oplogの保持設定は初期ロード時間を考慮する必要があります。また、再同期がトリガーされるか、既存のパイプに新しいテーブルが追加されたときにもパイプは`Snapshot`状態に入ります。

## 実行中 {#running}

初期ロードが完了すると、パイプは`Running`状態に入ります（スナップショット専用のパイプでない限り、`Completed`に遷移します）。ここでは、パイプが`Change-Data Capture`を開始します。この状態では、ソースのMongoDBクラスターからClickHouseへの変更のストリーミングを開始します。CDCの制御に関する情報は、[CDCの制御に関するドキュメント](./sync_control)を参照してください。

## 一時停止 {#paused}

パイプが`Running`状態のときは、一時停止することができます。これによりCDCプロセスが停止し、パイプは`Paused`状態に入ります。この状態では、ソースのMongoDBから新しいデータは取得されませんが、ClickHouse内の既存のデータはそのまま維持されます。この状態からパイプを再開することができます。

## 一時停止中 {#pausing}

:::note
この状態は近日公開予定です。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するように、今すぐサポートを追加することを検討してください。
:::
一時停止ボタンをクリックすると、パイプは`Pausing`状態に入ります。これは、CDCプロセスを停止している間の一時的な状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態に入ります。

## 修正中 {#modifying}

:::note
この状態は近日公開予定です。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するように、今すぐサポートを追加することを検討してください。
:::
現在、この状態はパイプがテーブルを削除している最中であることを示します。

## 再同期 {#resync}

:::note
この状態は近日公開予定です。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するように、今すぐサポートを追加することを検討してください。
:::
この状態はパイプが再同期のフェーズにあり、_resyncテーブルと元のテーブルの原子スワップを実行していることを示します。再同期に関する詳細情報は、[再同期ドキュメント](./resync)をご覧ください。

## 完了 {#completed}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了し、これ以上の作業がないことを示します。

## 失敗 {#failed}

パイプに回復不能なエラーが発生した場合、`Failed`状態に入ります。この状態から回復するには、サポートに連絡するか、パイプを[再同期](./resync)してください。

## 劣化 {#degraded}

:::note
この状態は近日公開予定です。私たちの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するように、今すぐサポートを追加することを検討してください。
:::
