---
sidebar_label: 'Postgres ClickPipe のライフサイクル'
description: 'さまざまなパイプのステータスとその意味'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---



# Postgres ClickPipeのライフサイクル {#lifecycle}

本ドキュメントでは、Postgres ClickPipeの各フェーズ、取り得るステータス、およびその意味について説明します。


## プロビジョニング {#provisioning}

Create ClickPipeボタンをクリックすると、ClickPipeは`Provisioning`状態で作成されます。プロビジョニングプロセスでは、サービスのClickPipesを実行するための基盤インフラストラクチャを起動し、パイプの初期メタデータを登録します。サービス内のClickPipesのコンピュートリソースは共有されるため、2つ目のClickPipeは1つ目よりもはるかに高速に作成されます――インフラストラクチャがすでに配置されているためです。


## セットアップ {#setup}

パイプがプロビジョニングされると、`Setup`状態に移行します。この状態では、宛先となるClickHouseテーブルを作成します。また、ソーステーブルのテーブル定義の取得と記録もここで行われます。


## スナップショット {#snapshot}

セットアップが完了すると、`Snapshot` 状態に入ります（CDC専用パイプの場合を除き、その場合は `Running` に遷移します）。`Snapshot`、`Initial Snapshot`、`Initial Load`（最も一般的）は互換性のある用語です。この状態では、ソースデータベーステーブルのスナップショットを取得し、ClickHouseにロードします。論理レプリケーションは使用されませんが、レプリケーションスロットはこのステップで作成されるため、初期ロード中のスロット増加を考慮して `max_slot_wal_keep_size` およびストレージパラメータを設定する必要があります。初期ロードの詳細については、[並列初期ロードのドキュメント](./parallel_initial_load)を参照してください。また、再同期がトリガーされた場合や既存のパイプに新しいテーブルが追加された場合にも、パイプは `Snapshot` 状態に入ります。


## 実行中 {#running}

初期ロードが完了すると、パイプは`Running`状態に移行します（スナップショット専用パイプの場合は`Completed`に移行します）。この状態で、パイプは`Change-Data Capture`を開始します。ソースデータベースからClickHouseへの論理レプリケーションが開始されます。CDCの制御方法については、[CDCの制御に関するドキュメント](./sync_control)を参照してください。


## 一時停止 {#paused}

パイプが`Running`状態になったら、一時停止できます。これによりCDCプロセスが停止し、パイプは`Paused`状態に移行します。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse内の既存データはそのまま保持されます。この状態からパイプを再開できます。


## 一時停止中 {#pausing}

:::note
この状態は近日中に提供予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が継続して動作するよう、今のうちにサポートを追加することを検討してください。
:::
一時停止ボタンをクリックすると、パイプは`Pausing`状態になります。これはCDCプロセスの停止処理中を示す遷移状態です。CDCプロセスが完全に停止すると、パイプは`Paused`状態になります。


## Modifying {#modifying}

:::note
この状態は近日中に実装予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)をご利用の場合は、リリース時に統合が継続して動作するよう、今のうちにサポートを追加することをご検討ください。
:::
現在、この状態はパイプがテーブルの削除処理中であることを示しています。


## 再同期 {#resync}

:::note
この状態は近日公開予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)を使用している場合は、リリース時に統合が引き続き機能するよう、今のうちにサポートを追加することを検討してください。
:::
この状態は、パイプが再同期フェーズにあり、\_resyncテーブルと元のテーブルのアトミックスワップを実行中であることを示します。再同期の詳細については、[再同期ドキュメント](./resync)を参照してください。


## Completed {#completed}

この状態はスナップショット専用パイプに適用され、スナップショットが完了し、それ以上の処理が不要であることを示します。


## Failed {#failed}

パイプで回復不可能なエラーが発生した場合、`Failed` 状態になります。この状態から回復するには、サポートに問い合わせるか、パイプを[再同期](./resync)してください。
