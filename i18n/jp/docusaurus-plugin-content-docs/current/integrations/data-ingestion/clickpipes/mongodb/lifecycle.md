---
sidebar_label: 'MongoDB ClickPipe のライフサイクル'
description: 'さまざまなパイプのステータスとその意味'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'MongoDB ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# Lifecycle of a MongoDB ClickPipe {#lifecycle}

このドキュメントでは、MongoDB ClickPipeのライフサイクルにおける各フェーズ、取り得るステータス、およびそれらの意味について説明します。


## プロビジョニング {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスでは、サービスのClickPipesを実行するための基盤インフラストラクチャを起動し、パイプの初期メタデータを登録します。サービス内のClickPipesのコンピュートリソースは共有されるため、2つ目のClickPipeは1つ目よりも大幅に高速に作成されます(インフラストラクチャがすでに配置されているため)。


## セットアップ {#setup}

パイプがプロビジョニングされると、`Setup`状態に移行します。この状態で、宛先となるClickHouseテーブルを作成します。


## Snapshot {#snapshot}

セットアップが完了すると、`Snapshot`状態に入ります（CDC専用パイプの場合は`Running`に遷移します）。`Snapshot`、`Initial Snapshot`、`Initial Load`（より一般的）は同義の用語です。この状態では、ソースのMongoDBコレクションのスナップショットを取得し、ClickHouseにロードします。oplogの保持設定は、初期ロード時間を考慮して設定する必要があります。パイプは、再同期がトリガーされた場合、または既存のパイプに新しいテーブルが追加された場合にも、`Snapshot`状態に入ります。


## 実行中 {#running}

初期ロードが完了すると、パイプは`Running`状態に入ります（スナップショット専用パイプの場合は`Completed`に遷移します）。ここでパイプは`Change-Data Capture`を開始します。この状態では、ソースのMongoDBクラスタからClickHouseへの変更がストリーミングされます。CDCの制御については、[CDCの制御に関するドキュメント](./sync_control)を参照してください。


## 一時停止 {#paused}

パイプが`Running`状態になったら、一時停止できます。これによりCDCプロセスが停止し、パイプは`Paused`状態に移行します。この状態では、ソースのMongoDBから新しいデータは取得されませんが、ClickHouse内の既存データはそのまま保持されます。この状態からパイプを再開できます。


## 一時停止 {#pausing}

:::note
この状態は近日公開予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するよう、今のうちにサポートを追加することを検討してください。
:::
Pauseボタンをクリックすると、パイプは`Pausing`状態になります。これはCDCプロセスの停止処理中における一時的な状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態になります。


## Modifying {#modifying}

:::note
この状態は近日公開予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)をご利用の場合は、リリース時に統合が引き続き動作するよう、今すぐサポートを追加することをご検討ください。
:::
現在、この状態はパイプがテーブルの削除処理中であることを示しています。


## 再同期 {#resync}

:::note
この状態は近日公開予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するよう、今のうちにサポートを追加することを検討してください。
:::
この状態は、パイプが再同期フェーズにあり、\_resync テーブルと元のテーブルのアトミックスワップを実行中であることを示します。再同期の詳細については、[再同期ドキュメント](./resync)を参照してください。


## Completed {#completed}

この状態はスナップショット専用パイプに適用され、スナップショットが完了し、実行すべき作業が残っていないことを示します。


## Failed {#failed}

パイプで回復不可能なエラーが発生した場合、`Failed` 状態に移行します。この状態から回復するには、サポートに問い合わせるか、パイプを[再同期](./resync)してください。
