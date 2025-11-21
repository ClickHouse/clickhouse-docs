---
sidebar_label: 'MySQL ClickPipe のライフサイクル'
description: '各種パイプステータスとその意味'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---



# MySQL ClickPipeのライフサイクル {#lifecycle}

本ドキュメントでは、MySQL ClickPipeの各フェーズ、取り得るステータス、およびそれらの意味について説明します。なお、本内容はMariaDBにも適用されます。


## プロビジョニング {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスでは、サービスのClickPipesを実行するための基盤インフラストラクチャを起動し、パイプの初期メタデータを登録します。サービス内のClickPipes用のコンピュートリソースは共有されるため、2つ目のClickPipeは1つ目よりも大幅に高速に作成されます(インフラストラクチャがすでに配置されているため)。


## セットアップ {#setup}

パイプがプロビジョニングされると、`Setup`状態に移行します。この状態では、宛先となるClickHouseテーブルを作成します。また、ソーステーブルのテーブル定義の取得と記録もここで行われます。


## スナップショット {#snapshot}

セットアップが完了すると、`Snapshot`状態に移行します(CDC専用パイプの場合は`Running`状態に遷移します)。`Snapshot`、`Initial Snapshot`、`Initial Load`(最も一般的)は同義の用語です。この状態では、ソースのMySQLテーブルのスナップショットを取得し、ClickHouseにロードします。バイナリログの保持設定は、初期ロード時間を考慮に入れる必要があります。初期ロードの詳細については、[並列初期ロードのドキュメント](./parallel_initial_load)を参照してください。再同期がトリガーされた場合、または既存のパイプに新しいテーブルが追加された場合にも、パイプは`Snapshot`状態に移行します。


## Running {#running}

初期ロードが完了すると、パイプは`Running`状態に移行します（スナップショットのみのパイプの場合は`Completed`に移行します）。ここでパイプは`Change-Data Capture`を開始します。この状態では、ソースデータベースからバイナリログを読み取り、データをバッチでClickHouseに同期します。CDCの制御については、[CDCの制御に関するドキュメント](./sync_control)を参照してください。


## 一時停止 {#paused}

パイプが`Running`状態になった後、一時停止することができます。これによりCDCプロセスが停止し、パイプは`Paused`状態に移行します。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse内の既存データはそのまま保持されます。この状態からパイプを再開できます。


## 一時停止 {#pausing}

:::note
この状態は近日中に提供予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するよう、今のうちにサポートを追加することを検討してください。
:::
一時停止ボタンをクリックすると、パイプは`Pausing`状態になります。これはCDCプロセスの停止処理中を示す遷移状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態になります。


## 変更中 {#modifying}

:::note
この状態は近日中に提供される予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)をご利用の場合は、リリース時に統合が継続して機能するよう、今のうちにサポートを追加することをご検討ください。
:::
現在、この状態はパイプがテーブルの削除処理中であることを示します。


## 再同期 {#resync}

:::note
この状態は近日公開予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するよう、今のうちにサポートを追加することを検討してください。
:::
この状態は、パイプが再同期フェーズにあり、\_resync テーブルと元のテーブルのアトミックスワップを実行中であることを示します。再同期の詳細については、[再同期ドキュメント](./resync)を参照してください。


## 完了 {#completed}

この状態はスナップショット専用パイプに適用され、スナップショットが完了し、これ以上処理すべき作業がないことを示します。


## Failed {#failed}

パイプで回復不可能なエラーが発生した場合、`Failed` 状態になります。この状態から回復するには、サポートに問い合わせるか、パイプを[再同期](./resync)してください。
