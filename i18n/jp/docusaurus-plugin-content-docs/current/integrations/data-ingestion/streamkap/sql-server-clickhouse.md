---
sidebar_label: 'ClickHouse 向け SQL Server CDC'
sidebar_position: 13
keywords: ['clickhouse', 'Streamkap', 'CDC', 'SQL Server', '接続', '連携', 'ETL', 'データ連携', '変更データキャプチャ']
slug: /integrations/data-ingestion/etl-tools/sql-server-clickhouse
description: '高速な分析のために SQL Server から ClickHouse へデータをストリーミングする'
title: '高速な分析のために SQL Server から ClickHouse へデータをストリーミングする'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import image1 from '@site/static/images/integrations/data-ingestion/etl-tools/image1.png';
import image2 from '@site/static/images/integrations/data-ingestion/etl-tools/image2.png';
import image3 from '@site/static/images/integrations/data-ingestion/etl-tools/image3.png';


# 高速分析のための SQL Server から ClickHouse へのデータストリーミング：ステップバイステップガイド \{#streaming-data-from-sql-server-to-clickhouse-for-fast-analytics-step-by-step-guide\}

この記事では、SQL Server から ClickHouse へデータをストリーミングする方法を、チュートリアル形式で詳しく解説します。ClickHouse は、社内向けまたは顧客向けのダッシュボード向けレポーティングで超高速な分析が必要な場合に理想的です。両方のデータベースのセットアップ方法、接続方法、そして最終的に [Streamkap](https://streamkap.com) を使ってデータをストリーミングする手順まで、ステップごとに見ていきます。日々の業務は SQL Server で処理しつつ、分析には ClickHouse のスピードと高度な分析機能を活用したい場合、本記事が最適なガイドとなります。

## なぜ SQL Server から ClickHouse へデータをストリーミングするのか？ \{#why-stream-data-from-sql-server-to-clickhouse\}

ここにたどり着いたということは、すでにその課題を感じているはずです。SQL Server はトランザクション用途としては非常に堅牢ですが、重いリアルタイム分析クエリを実行するようには設計されていません。

そこで力を発揮するのが ClickHouse です。ClickHouse は巨大なデータセットに対しても超高速な集計やレポーティングを行う分析向けデータベースとして設計されています。そのため、トランザクションデータを ClickHouse にプッシュするストリーミング CDC パイプラインを構成すれば、超高速なレポートを実行できるようになり、運用、プロダクトチーム、カスタマーダッシュボードなどに最適です。

代表的なユースケースは次のとおりです:

- 本番アプリケーションを遅くしない内部向けレポーティング
- 高速かつ常に最新の状態を求められるカスタマー向けダッシュボード
- 分析用にユーザーアクティビティログを常に最新に保つイベントストリーミング

## 開始にあたって必要なもの \{#what-youll-need-to-get-started\}

本題に入る前に、あらかじめ次のものを用意しておいてください。

### 前提条件 \{#prerequisites\}

- 稼働中の SQL Server インスタンス  

- このチュートリアルでは AWS RDS for SQL Server を使用しますが、最新の SQL Server インスタンスであればどれでも使用できます。[AWS SQL Server をゼロからセットアップ](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23setting-up-a-new-rds-sql-server-from-scratch)
- ClickHouse インスタンス  

- セルフホスト環境でもクラウド環境でもかまいません。[ClickHouse をゼロからセットアップ](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23creating-a-new-clickhouse-account)
- Streamkap  

- このツールがデータストリーミングパイプラインの中核となります。

### 接続情報 \{#connection-info\}

次の情報を用意しておいてください。

- SQL Server のサーバーアドレス、ポート、ユーザー名、パスワード。Streamkap が SQL Server データベースへアクセスできるよう、専用のユーザーとロールを作成することを推奨します。[設定方法についてはドキュメントを参照してください。](https://www.google.com/url?q=https://docs.streamkap.com/docs/sql-server&sa=D&source=editors&ust=1760992472358213&usg=AOvVaw3jfocCF1VSijgsq1OCpZPj)
- ClickHouse のサーバーアドレス、ポート、ユーザー名、パスワード。ClickHouse の IP アクセスリストによって、どのサービスが ClickHouse データベースに接続できるかが決まります。[こちらの手順に従ってください。](https://www.google.com/url?q=https://docs.streamkap.com/docs/clickhouse&sa=D&source=editors&ust=1760992472359060&usg=AOvVaw3H1XqqwvqAso_TQPNBKEhD)
- ストリーミングするテーブル（まずは 1 つから始めてください）

## SQL Server をデータソースとしてセットアップする \{#setting-up-sql-server-as-a-source\}

それでは始めましょう。

### ステップ 1: Streamkap で SQL Server ソースを作成する \{#step-1-creating-a-sql-server-source-in-streamkap\}

まずはソースの接続を設定します。これにより、Streamkap がどこから変更データを取得すればよいかを把握できるようになります。

手順は次のとおりです:

1. Streamkap を開き、[Sources] セクションに移動します。
2. 新しいソースを作成します。

- わかりやすい名前を付けます（例: sqlserver-demo-source）。

3. SQL Server の接続情報を入力します:

- ホスト（例: your-db-instance.rds.amazonaws.com）
- ポート（SQL Server のデフォルトは 3306）
- ユーザー名とパスワード
- データベース名

<Image img={image3} size="lg" />

#### 裏側で何が起きているか \{#whats-happening-behind-the-scenes\}

<Image img={image1} size="lg" />

これをセットアップすると、Streamkap が SQL Server に接続し、テーブルを自動検出します。このデモでは、すでにデータがストリーミングされている events や transactions などのテーブルを選択します。

## ClickHouse 宛先の作成 \{#creating-a-clickhouse-destination\}

これらすべてのデータの送信先となる ClickHouse 宛先を設定しましょう。

### ステップ 2: Streamkap に ClickHouse 宛先を追加する \{#step-2-add-a-clickhouse-destination-in-streamkap\}

ソースと同様に、ClickHouse の接続情報を使用して宛先を作成します。

#### 手順: \{#steps\}

1. Streamkap の Destinations セクションに移動します。
2. 新しい宛先を追加し、宛先タイプとして ClickHouse を選択します。
3. ClickHouse の情報を入力します:

- ホスト
- ポート（デフォルトは 9000）
- Username と Password
- データベース名

例のスクリーンショット: Streamkap ダッシュボードで新しい ClickHouse 宛先を追加している画面。

### アップサートモードとは何か \{#upsert-mode-what-is-that\}

ここは重要なステップです。ClickHouse の「アップサート」モードを使用します。これは内部的には ClickHouse の ReplacingMergeTree エンジンを利用して動作します。これにより、受信したレコードを効率的にマージし、ClickHouse が「パーツマージ」と呼ぶ仕組みを使って、取り込み後の更新を処理できます。

- これにより、SQL Server 側でデータが変更された場合でも、宛先テーブルが重複データで埋め尽くされるのを防ぐことができます。

### スキーマ変更への対応 \{#handling-schema-evolution\}

ClickHouse と SQL Server では、カラム構成が同じとは限りません。特に、本番稼働中のアプリで開発者が随時カラムを追加しているような場合はなおさらです。

- 良い知らせとして、Streamkap は基本的なスキーマ変更をサポートしています。つまり、SQL Server 側で新しいカラムを追加すると、ClickHouse 側にも自動的に反映されます。

宛先の設定で「schema evolution」を選択するだけです。必要に応じて、後からいつでも調整できます。

## ストリーミングパイプラインの構築 \{#building-the-streaming-pipeline\}

ソースと宛先の設定が完了したら、いよいよデータのストリーミングを始めましょう。

### ステップ3: Streamkap でパイプラインをセットアップする \{#step-3-set-up-the-pipeline-in-streamkap\}

#### パイプラインのセットアップ \{#pipeline-setup\}

1. Streamkap の Pipelines タブを開きます。  

2. 新しいパイプラインを作成します。  

3. SQL Server のソース（sqlserver-demo-source）を選択します。  

4. ClickHouse の宛先（clickhouse-tutorial-destination）を選択します。  

5. ストリーミングしたいテーブルを選択します—ここでは events とします。  

6. Change Data Capture（CDC）の設定を行います。  

- 今回の実行では、新規データのみをストリーミングします（最初はバックフィルを行わず、CDC イベントに集中してかまいません）。

パイプライン設定のスクリーンショット—ソース、宛先、テーブルを選択している様子。

#### バックフィルすべきかどうか \{#should-you-backfill\}

<Image img={image2} size="lg" />

「過去データもバックフィルすべきか？」と疑問に思うかもしれません。

多くの分析ユースケースでは、「今この時点からの変更データのストリーミング」だけを開始すれば十分なことが多いですが、必要になったときにあとから過去データを読み込むこともできます。

特別な要件がない限り、ひとまず「バックフィルしない」を選択してください。

## ストリーミングの実行: 期待できること  \{#streaming-in-action-what-to-expect\}

これでパイプラインのセットアップが完了し、稼働を開始しました。

### ステップ 4: データストリームを監視する \{#step-4-watch-the-data-stream\}

処理の流れは次のとおりです。

* 新しいデータが SQL Server 上のソーステーブルに書き込まれると、Streamkap パイプラインがその変更をキャプチャし、ClickHouse に送信します。
* ClickHouse は（ReplacingMergeTree とパーツのマージ処理のおかげで）これらの行を取り込み、更新をマージします。
* スキーマも追従します — SQL Server にカラムを追加すると、それらは ClickHouse にも反映されます。

ClickHouse と SQL Server の行数がリアルタイムで増加していく様子を示すライブダッシュボードまたはログ。

SQL Server にデータが入るにつれて、ClickHouse の行数が増加していくのを目で確認できます。

```sql
-- Example: Checking rows in ClickHouse 
SELECT COUNT(*) FROM analytics.events; |
```

高負荷時にはある程度の遅延が発生することがありますが、ほとんどのケースではほぼリアルタイムにデータがストリーミングされます。


## 舞台裏：Streamkap は実際に何をしているのか？ \{#under-the-hood-whats-streamkap-actually-doing\}

少しだけ内部の仕組みをご紹介します。

- Streamkap は SQL Server のバイナリログ（レプリケーションでも使われるログ）を監視します。
- テーブルに行が挿入・更新・削除されるとすぐに、Streamkap がそのイベントを検知します。
- そのイベントを ClickHouse が理解できる形式に変換し、すぐに送信して、分析用データベースに即座に変更を反映します。

これは単なる ETL ではなく、リアルタイムストリーミングによる完全な変更データキャプチャ（CDC）です。

## 高度な設定 \{#advanced-options\}

### Upsert モード vs Insert モード \{#upsert-vs-insert-modes\}

すべての行を単純に挿入するだけのモード（Insert モード）と、更新や削除もきちんと反映させるモード（Upsert モード）には、どのような違いがあるのでしょうか？

- Insert モード: 新しい行はすべて追加されます。たとえ更新であっても新しい行として挿入されるため、重複が発生します。
- Upsert モード: 既存の行に対する更新は、すでに存在するデータを上書きします。分析データを常に新鮮かつクリーンに保つのに、はるかに有効です。

### スキーマ変更への対応 \{#handling-schema-changes\}

アプリケーションが変われば、スキーマも変わります。このパイプラインでは次のように動作します。

- 運用テーブルに新しいカラムを追加した場合:  
  Streamkap がそれを検出し、ClickHouse 側にもカラムを追加します。
- カラムを削除した場合:  
  設定によってはマイグレーションが必要になることもありますが、カラムの追加であれば多くの場合スムーズに反映されます。

## 実運用での監視：パイプラインの状態を把握する \{#real-world-monitoring-keeping-tabs-on-the-pipeline\}

### パイプラインの健全性の確認 \{#checking-pipeline-health\}

Streamkap には、次のことを行えるダッシュボードがあります。

- パイプラインの遅延（データはどれくらい新鮮か？）を確認する
- 行数とスループットを監視する
- 異常があればアラートを受け取る

ダッシュボード例: レイテンシーグラフ、行数、ヘルス指標。

### 監視すべき主なメトリクス \{#common-metrics-to-watch\}

- Lag（遅延）: ClickHouse が SQL Server に対してどの程度遅れているか
- Throughput（スループット）: 1 秒あたりの行数
- Error Rate（エラー率）: ほぼゼロであるべき

## 本番稼働: ClickHouse へのクエリ実行 \{#going-live-querying-clickhouse\}

データが ClickHouse に取り込まれたら、さまざまな高速分析ツールを使ってクエリを実行できます。基本的な例を次に示します。

```sql
-- See top 10 active users in the last hour
SELECT user\_id, COUNT(*) AS actionsFROM analytics.eventsWHERE event\_time >= now() - INTERVAL 1 HOURGROUP BY user\_idORDER BY actions DESCLIMIT 10;
```

ClickHouse を Grafana、Superset、Redash などのダッシュボードツールと組み合わせて活用し、本格的なレポーティングを実現しましょう。


## 次のステップと詳細な解説 \{#next-steps-and-deep-dives\}

このウォークスルーは、できることのごく一部を紹介したに過ぎません。基本を押さえたら、次のような内容を検討・実施できます。

- フィルタ済みストリームの設定（特定のテーブル／カラムだけを同期）
- 複数のソースから 1 つの分析用 DB へのストリーミング
- コールドストレージとしての S3／データレイクとの併用
- テーブル変更時のスキーママイグレーションの自動化
- SSL やファイアウォールルールによるパイプラインの保護

より詳細なガイドについては、[Streamkap ブログ](https://streamkap.com/blog)を参照してください。

## FAQ とトラブルシューティング \{#faq-and-troubleshooting\}

Q: これはクラウドデータベースでも動作しますか？  
A: はい、動作します！この例では AWS RDS を使用しました。適切なポートを開放していることを確認してください。

Q: パフォーマンスはどうですか？  
A: ClickHouse は高速です。ボトルネックになるのは、通常ネットワークかソース DB の binlog の速度ですが、ほとんどの場合、遅延は 1 秒未満です。

Q: 削除も扱えますか？  
A: もちろん可能です。upsert モードでは、削除もフラグ付けされ、ClickHouse 側で処理されます。

## まとめ \{#wrapping-up\}

以上で、Streamkap を使って SQL Server のデータを ClickHouse にストリーミングする方法の全体像を説明しました。高速かつ柔軟で、本番データベースに負荷をかけずに最新の分析を必要とするチームに最適です。

試してみたくなりましたか？  
[Sign up ページ](https://app.streamkap.com/account/sign-up)にアクセスして、次のようなトピックの解説を希望する場合はお知らせください：

- Upsert と Insert の違いと、それぞれの詳細
- エンドツーエンドレイテンシー: 最終的な分析結果をどれだけ速く得られるか
- パフォーマンスチューニングとスループット
- このスタック上に構築した実運用ダッシュボードの実例

お読みいただきありがとうございました。快適なストリーミングをお楽しみください。