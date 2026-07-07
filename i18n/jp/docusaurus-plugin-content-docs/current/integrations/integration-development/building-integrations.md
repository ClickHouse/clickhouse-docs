---
slug: /integrations/integration-development/building-integrations
title: 'ClickHouse 連携の構築'
sidebar_label: '連携の構築'
sidebar_position: 2
description: 'ClickHouse 連携におけるインジェスト、利用、ワイヤプロトコル、クライアントの慣例に関する概要。'
keywords: ['パートナー', '連携', 'インジェスト', '利用', 'ClickPipes', '言語クライアント', 'user-agent']
doc_type: 'guide'
---

# ClickHouse の連携を構築する \{#building-integrations-with-clickhouse\}

このページでは、連携の全体像を把握し、インジェストと利用に関する作業範囲を見積もれるようにします。検証と公開については、[連携のテスト](/integrations/integration-development/testing-your-integration)および[連携のドキュメント化](/integrations/integration-development/documenting-your-integration)に進んでください。

## インジェスト \{#ingestion\}

データをClickHouseに取り込む経路は2つあります。プロダクト側でインジェスト基盤を持つか、外部に委ねるかに応じて選択してください。

### パス A: ClickPipes (マネージド、ClickHouse Cloud のみ) \{#path-a-clickpipes\}

インジェスト用インフラストラクチャを自分で構築・運用したくない場合は、[ClickPipes](/integrations/clickpipes) を利用できます。これは、顧客のデータソースからその顧客の ClickHouse Cloud サービスへデータを取り込むマネージドサービスです。ClickPipes がスケーリング、並列化、再試行、遅延状況のレポートを処理します。

現在サポートされているソースは次のとおりです。

* **ストリーミング:** Apache Kafka (MSK、Confluent Cloud、Redpanda、Azure Event Hubs、WarpStream を含む) 、Amazon Kinesis
* **オブジェクトストレージ:** Amazon S3 (および S3互換ストレージ) 、Google Cloud Storage、Azure Blob Storage
* **CDC:** PostgreSQL、MySQL、MongoDB、BigQuery

### パス B: 公式言語クライアントを使った自前のインジェスト \{#path-b-language-client\}

パイプラインを自分で管理する場合は、[公式言語クライアント](/integrations/language-clients)のいずれかを使用してください。これらは、シリアライゼーション、バッチ処理、TLS、圧縮、接続プーリングを処理します。ランタイムのプリミティブ型を渡せば、クライアントがワイヤ形式を処理します。

* 公式クライアント: Python、Go、Java、JavaScript、Rust、C#、C++
* 両方のワイヤプロトコルに対応: HTTP (すべてのクライアント) およびネイティブ TCP (Go と C++ クライアントのみ)
* 認証: デフォルトでは TLS 上でのユーザー名とパスワード。mTLS と SSL クライアント証明書認証は、主要なすべてのクライアントでサポートされています
* データフォーマットは通常、実装の詳細にすぎません。クライアントは、ランタイム型を ClickHouse Native または RowBinary フォーマットに変換します。すでに Arrow、Parquet、JSONEachRow、または別のフォーマットを生成している場合、ほとんどのクライアントは、事前にシリアライズされたデータ向けの raw-bytes API を提供しています
* スループットを確保するには、**1 万～10 万行**を 1 バッチとし、同期 insert の上限の目安として **1 秒あたりおよそ 1 回の insert** を目指してください。クライアント側でのバッチ処理が現実的でない場合は、[非同期挿入](/optimize/asynchronous-inserts)を使用して、バッチ処理をサーバー側に任せてください

関連項目: [Bulk inserts](/optimize/bulk-inserts)。

## 利用 \{#consumption\}

HTTP とネイティブ TCP はどちらもクエリの送受信に使用できます。ネイティブはバイナリプロトコルで、オーバーヘッドが小さくなります。HTTP はロードバランサーやプロキシを経由して利用できます。どちらも正式にサポートされる主要な選択肢なので、機能差ではなくインフラストラクチャに基づいて選択してください。

* **アプリケーションコード:** インジェストと同様に、同じ[公式言語クライアント](/integrations/language-clients)を使用します
* **BI および SQL ツール:** ClickHouse は公式の [JDBC v2 driver](/integrations/java) (Java) と [ODBC ドライバ](/interfaces/odbc) を提供しています。Tableau、Looker、Power BI、Metabase、Apache Superset、Grafana は、これらのドライバーや、ClickHouse とパートナーが保守する専用コネクタ経由で統合できます
* **結果フォーマット:** 通常、シリアライゼーションはクライアント側で処理します。製品で必要な場合は、Arrow、Parquet、またはその他の列指向フォーマットを通信時に要求できます

### 結果セットのサイズ管理 \{#result-set-sizing\}

分析クエリの多くは小さな結果セット (集計、要約、top-N) を返すため、ネットワークがボトルネックになることはほとんどありません。ClickHouseのテーブルには数十億行を格納できるため、大規模なファクトテーブルに対して無制限に `SELECT *` を実行すると、数TB規模のデータを転送することがあります。**アプリケーション側でリクエストを適切に絞り込んでください:** `LIMIT`、ページネーション、ストリーミング読み取り、明示的なカラムリストを使用します。ユーザー向けの分析機能を構築する場合は、無制限の結果セットを転送の問題ではなく、UXの問題として扱ってください。

ClickHouseは、Array、Tuple、Map、JSON、Nested、LowCardinality などを含む豊富な型システムを備えています。公式クライアントは、これらを各言語で自然に扱える型に対応付けます。製品でClickHouseのデータをエンドユーザーに見せる場合は、型マッピング戦略を早い段階で検討してください。

## 次のステップ \{#next-steps\}

いずれかの進め方を選び、[ClickHouse Cloud trial](https://clickhouse.com/cloud) でプロトタイプを作成したら、[パートナーポータル](https://clickhouse.com/partners)で連携を登録してください。

## User-agent文字列の規約 \{#user-agent-string-convention\}

HTTPクライアントは、連携を識別できる `User-Agent` 文字列を設定してください。ClickHouse はこれをサーバー側で解析し、導入状況の追跡、利用状況テレメトリーの可視化、ロードマップ策定に活用します。

フォーマット:

```text
<app_name>/<app_version> <client_name>/<client_version> (<comment>; <key1>: <value1>; <key2>: <value2>)
```

例:

* `clickhouse-java/0.8.0`
* `my-analytics-app/3.1.2 clickhouse-js/1.2.0 (env: staging; region: us-east-1; lv: node/20.10)`

ルール:

* クライアント名やバージョンに空白を含めない
* コメントを含める場合は、必ず先頭に置く
* 標準メタデータキー: `lv` (言語またはフレームワークのバージョン) 、`os`、`arch`
* TCP およびネイティブプロトコルのクライアントは、`User-Agent` ではなく、プロトコルのフィールド経由でクライアント名とバージョンを送信します

JDBC を使用している場合は、ドライバーが `User-Agent` と関連フィールドをどのように設定するかについて、[クライアント識別](/integrations/language-clients/java/jdbc#client-identification) を参照してください。

## Sandbox とトライアルアクセス \{#sandbox-and-trial-access\}

[ClickHouse Cloud](https://clickhouse.com/cloud) では、開発や連携の検証に利用できる無料トライアルを提供しています。House Mate パートナーの場合は、[パートナーポータル](https://clickhouse.com/partners) から追加の開発用クレジットを申請できます。