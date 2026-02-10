---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', '接続', '統合', 'etl', 'データ統合']
slug: /integrations/nifi
description: 'NiFi データパイプラインを使用して ClickHouse へデータをストリーミングする'
title: 'Apache NiFi を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Apache NiFiをClickHouseに接続する \{#connect-apache-nifi-to-clickhouse\}

<CommunityMaintainedBadge />

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフロー管理ソフトウェアです。ETLデータパイプラインの作成が可能で、300以上のデータプロセッサが同梱されています。このステップバイステップのチュートリアルでは、Apache NiFiをソースと宛先の両方としてClickHouseに接続し、サンプルデータセットをロードする方法を説明します。

<VerticalStepper headerLevel="h2">
  ## 接続情報を収集する \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ## Apache NiFi をダウンロードして実行する \{#2-download-and-run-apache-nifi\}

  新規セットアップの場合は、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start` を実行して起動します

  ## ClickHouse JDBC ドライバをダウンロードする \{#3-download-the-clickhouse-jdbc-driver\}

  1. GitHub 上の <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC ドライバのリリースページ</a> にアクセスし、最新の JDBC リリースバージョンを探します
  2. リリースバージョンで「Show all xx assets」をクリックし、「shaded」または「all」というキーワードを含む JAR ファイル（例: `clickhouse-jdbc-0.5.0-all.jar`）を探します。
  3. JAR ファイルを Apache NiFi からアクセス可能なフォルダに配置し、その絶対パスを記録しておきます

  ## `DBCPConnectionPool` コントローラサービスを追加し、プロパティを設定する \{#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties\}

  1. Apache NiFi でコントローラサービスを設定するには、歯車アイコン（&quot;gear&quot; ボタン）をクリックして NiFi Flow Configuration ページを開きます

     <Image img={nifi01} size="sm" border alt="歯車ボタンが強調表示された NiFi Flow Configuration ページ" />

  2. Controller Services タブを選択し、右上の `+` ボタンをクリックして新しいコントローラサービスを追加します

     <Image img={nifi02} size="lg" border alt="追加ボタンが強調表示された Controller Services タブ" />

  3. `DBCPConnectionPool` を検索し、「Add」ボタンをクリックします

     <Image img={nifi03} size="lg" border alt="DBCPConnectionPool が強調表示された Controller Service 選択ダイアログ" />

  4. 追加したばかりの `DBCPConnectionPool` は、デフォルトでは無効 (Invalid) 状態になっています。歯車アイコン（&quot;gear&quot; ボタン）をクリックして設定を開始します

     <Image img={nifi04} size="lg" border alt="Invalid 状態の DBCPConnectionPool と gear ボタンが強調表示された Controller Services 一覧" />

  5. 「Properties」セクションで、次の値を入力します

  | Property                    | Value                                                              | Remark                              |
  | --------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 接続 URL 中の HOSTNAME を環境に合わせて置き換えます   |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               |                                     |
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC ドライバ JAR ファイルへの絶対パス |
  | Database User               | default                                                            | ClickHouse ユーザー名                    |
  | Password                    | password                                                           | ClickHouse パスワード                    |

  6. Settings セクションで、コントローラサービスの名前を分かりやすくするために「ClickHouse JDBC」に変更します

     <Image img={nifi05} size="lg" border alt="プロパティが入力された DBCPConnectionPool 設定ダイアログ" />

  7. 「lightning」ボタンをクリックし、続いて「Enable」ボタンをクリックして `DBCPConnectionPool` コントローラサービスを有効化します

     <Image img={nifi06} size="lg" border alt="lightning ボタンが強調表示された Controller Services 一覧" />

     <br />

     <Image img={nifi07} size="lg" border alt="Controller Service を有効化する確認ダイアログ" />

  8. Controller Services タブを開き、コントローラサービスが有効化されていることを確認します

     <Image img={nifi08} size="lg" border alt="有効化された ClickHouse JDBC サービスが表示されている Controller Services 一覧" />

  ## `ExecuteSQL` プロセッサを使用してテーブルから読み取る \{#5-read-from-a-table-using-the-executesql-processor\}

  1. 適切なアップストリームおよびダウンストリームのプロセッサと共に `ExecuteSQL` プロセッサを追加します

     <Image img={nifi09} size="md" border alt="ExecuteSQL プロセッサを含むワークフローが表示された NiFi キャンバス" />

  2. `ExecuteSQL` プロセッサの「Properties」セクションで次の値を入力します

     | Property                            | Value                        | Remark                                      |
     | ----------------------------------- | ---------------------------- | ------------------------------------------- |
     | Database Connection Pooling Service | ClickHouse JDBC              | ClickHouse 用に設定した Controller Service を選択します |
     | SQL select query                    | SELECT * FROM system.metrics | ここにクエリを入力します                                |

  3. `ExecuteSQL` プロセッサを起動する

     <Image img={nifi10} size="lg" border alt="プロパティが入力された ExecuteSQL プロセッサ設定ダイアログ" />

  4. クエリが正常に処理されたことを確認するには、出力キュー内の `FlowFile` のいずれかを確認してください

     <Image img={nifi11} size="lg" border alt="検査対象の FlowFile が表示されている List queue ダイアログ" />

  5. 出力された `FlowFile` の結果を確認するには、ビューを「formatted」表示に切り替えます

     <Image img={nifi12} size="lg" border alt="整形表示でクエリ結果を表示している FlowFile コンテンツビューア" />

  ## `MergeRecord` および `PutDatabaseRecord` プロセッサを使用してテーブルに書き込む \{#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor\}

  1. 1 回の insert で複数の行を書き込むには、まず複数のレコードを 1 つのレコードに結合する必要があります。これは `MergeRecord` プロセッサを使用することで実現できます。

  2. `MergeRecord` プロセッサの「Properties」セクションで、次の値を入力します

     | Property                  | Value               | Remark                                                              |
     | ------------------------- | ------------------- | ------------------------------------------------------------------- |
     | Record Reader             | `JSONTreeReader`    | 適切な Record Reader を選択します                                            |
     | Record Writer             | `JSONReadSetWriter` | 適切な Record Writer を選択します                                            |
     | Minimum Number of Records | 1000                | 1 つのレコードを構成するためにマージされる行の最小数を増やすよう、この値をより大きな値に設定します。デフォルトは 1 行です     |
     | Maximum Number of Records | 10000               | &quot;Minimum Number of Records&quot; より大きな値に設定します。デフォルトは 1,000 行です |

  3. 複数のレコードが 1 つにマージされていることを確認するには、`MergeRecord` プロセッサの入力と出力を確認してください。出力は複数の入力レコードから成る配列となる点に注意してください

     入力

     <Image img={nifi13} size="sm" border alt="単一レコードの入力が表示されている MergeRecord プロセッサ" />

     出力

     <Image img={nifi14} size="sm" border alt="マージされたレコード配列を表示している MergeRecord プロセッサの出力" />

  4. `PutDatabaseRecord` プロセッサの「Properties」セクションで、次の値を入力します

     | Property                            | Value            | Remark                                                                                               |
     | ----------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
     | Record Reader                       | `JSONTreeReader` | 適切なレコードリーダーを選択します                                                                                    |
     | Database Type                       | Generic          | デフォルトのままにします                                                                                         |
     | Statement Type                      | INSERT           |                                                                                                      |
     | Database Connection Pooling Service | ClickHouse JDBC  | ClickHouse コントローラサービスを選択します                                                                          |
     | Table Name                          | tbl              | ここにテーブル名を入力します                                                                                       |
     | Translate Field Names               | false            | 挿入されるフィールド名がカラム名と一致するように、&quot;false&quot; に設定します                                                    |
     | Maximum Batch Size                  | 1000             | 1 回の INSERT あたりの最大行数。この値は、`MergeRecord` プロセッサの &quot;Minimum Number of Records&quot; の値より小さくしないでください |

  5. 各挿入に複数の行が含まれていることを確認するには、テーブルの行数が `MergeRecord` で定義されている「Minimum Number of Records」の値以上ずつ増加していることを確認します。

     <Image img={nifi15} size="sm" border alt="宛先テーブルの行数を表示しているクエリ結果" />

  6. おめでとうございます。Apache NiFi を使用して ClickHouse へのデータ取り込みに成功しました！
</VerticalStepper>