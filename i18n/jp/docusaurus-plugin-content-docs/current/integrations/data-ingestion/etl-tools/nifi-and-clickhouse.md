---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', '接続', '統合', 'ETL', 'データ統合']
slug: /integrations/nifi
description: 'NiFi データパイプラインを使用して ClickHouse へデータをストリーミング配信する'
title: 'Apache NiFi と ClickHouse を接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Apache NiFiをClickHouseに接続する

<CommunityMaintainedBadge />

<a href='https://nifi.apache.org/' target='_blank'>
  Apache NiFi
</a>
は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフロー管理ソフトウェアです。ETLデータパイプラインの作成が可能で、300以上のデータプロセッサが同梱されています。このステップバイステップのチュートリアルでは、Apache NiFiをソースと宛先の両方としてClickHouseに接続し、サンプルデータセットをロードする方法を説明します。

<VerticalStepper headerLevel="h2">


## 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## Apache NiFiのダウンロードと実行 {#2-download-and-run-apache-nifi}

新規セットアップの場合は、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start` を実行して起動します


## ClickHouse JDBCドライバーのダウンロード {#3-download-the-clickhouse-jdbc-driver}

1. GitHubの<a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBCドライバーリリースページ</a>にアクセスし、最新のJDBCリリースバージョンを確認します
2. リリースバージョン内で「Show all xx assets」をクリックし、「shaded」または「all」というキーワードを含むJARファイルを探します（例: `clickhouse-jdbc-0.5.0-all.jar`）
3. JARファイルをApache NiFiからアクセス可能なフォルダに配置し、絶対パスをメモします


## `DBCPConnectionPool` コントローラーサービスの追加とプロパティの設定 {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFi でコントローラーサービスを設定するには、「歯車」ボタンをクリックして NiFi Flow Configuration ページにアクセスします

   <Image
     img={nifi01}
     size='sm'
     border
     alt='歯車ボタンがハイライトされた NiFi Flow Configuration ページ'
   />

2. Controller Services タブを選択し、右上の `+` ボタンをクリックして新しいコントローラーサービスを追加します

   <Image
     img={nifi02}
     size='lg'
     border
     alt='追加ボタンがハイライトされた Controller Services タブ'
   />

3. `DBCPConnectionPool` を検索し、「Add」ボタンをクリックします

   <Image
     img={nifi03}
     size='lg'
     border
     alt='DBCPConnectionPool がハイライトされたコントローラーサービス選択ダイアログ'
   />

4. 新しく追加された `DBCPConnectionPool` はデフォルトで無効な状態になります。「歯車」ボタンをクリックして設定を開始します

   <Image
     img={nifi04}
     size='lg'
     border
     alt='無効な DBCPConnectionPool と歯車ボタンがハイライトされたコントローラーサービスリスト'
   />

5. 「Properties」セクションで、以下の値を入力します

| プロパティ                    | 値                                                              | 備考                                               |
| --------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 接続 URL の HOSTNAME を適切に置き換えてください   |
| Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               |                                                      |
| Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC ドライバー JAR ファイルへの絶対パス |
| Database User               | default                                                            | ClickHouse ユーザー名                                  |
| Password                    | password                                                           | ClickHouse パスワード                                  |

6. Settings セクションで、コントローラーサービスの名前を参照しやすいように「ClickHouse JDBC」に変更します

   <Image
     img={nifi05}
     size='lg'
     border
     alt='プロパティが入力された DBCPConnectionPool 設定ダイアログ'
   />

7. 「稲妻」ボタンをクリックし、次に「Enable」ボタンをクリックして `DBCPConnectionPool` コントローラーサービスを有効化します

   <Image
     img={nifi06}
     size='lg'
     border
     alt='稲妻ボタンがハイライトされたコントローラーサービスリスト'
   />

   <br />

   <Image
     img={nifi07}
     size='lg'
     border
     alt='コントローラーサービス有効化の確認ダイアログ'
   />

8. Controller Services タブを確認し、コントローラーサービスが有効になっていることを確認します

   <Image
     img={nifi08}
     size='lg'
     border
     alt='有効化された ClickHouse JDBC サービスを表示するコントローラーサービスリスト'
   />


## `ExecuteSQL`プロセッサを使用してテーブルから読み取る {#5-read-from-a-table-using-the-executesql-processor}

1. `ExecuteSQL`プロセッサを、適切な上流および下流のプロセッサとともに追加します

   <Image
     img={nifi09}
     size='md'
     border
     alt='ワークフロー内のExecuteSQLプロセッサを示すNiFiキャンバス'
   />

2. `ExecuteSQL`プロセッサの「Properties」セクションで、以下の値を入力します

   | プロパティ                          | 値                            | 備考                                                    |
   | ----------------------------------- | ----------------------------- | ------------------------------------------------------- |
   | Database Connection Pooling Service | ClickHouse JDBC               | ClickHouse用に設定されたController Serviceを選択します |
   | SQL select query                    | SELECT \* FROM system.metrics | ここにクエリを入力します                                   |

3. `ExecuteSQL`プロセッサを起動します

   <Image
     img={nifi10}
     size='lg'
     border
     alt='プロパティが入力されたExecuteSQLプロセッサの設定'
   />

4. クエリが正常に処理されたことを確認するには、出力キュー内の`FlowFile`の1つを検査します

   <Image
     img={nifi11}
     size='lg'
     border
     alt='検査可能なフローファイルを表示するキューリストダイアログ'
   />

5. ビューを「formatted」に切り替えて、出力`FlowFile`の結果を表示します

   <Image
     img={nifi12}
     size='lg'
     border
     alt='フォーマット表示でクエリ結果を示すFlowFileコンテンツビューア'
   />


## `MergeRecord`と`PutDatabaseRecord`プロセッサを使用したテーブルへの書き込み {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 単一のINSERT文で複数行を書き込むには、まず複数のレコードを1つのレコードにマージする必要があります。これは`MergeRecord`プロセッサを使用して実行できます

2. `MergeRecord`プロセッサの「Properties」セクションで、以下の値を入力します

   | Property                  | Value               | Remark                                                                                                                 |
   | ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
   | Record Reader             | `JSONTreeReader`    | 適切なレコードリーダーを選択します                                                                                   |
   | Record Writer             | `JSONReadSetWriter` | 適切なレコードライターを選択します                                                                                   |
   | Minimum Number of Records | 1000                | 単一のレコードを形成するためにマージする最小行数を設定します。この値をより大きな数値に変更してください。デフォルトは1行です |
   | Maximum Number of Records | 10000               | 「Minimum Number of Records」よりも大きな数値に変更します。デフォルトは1,000行です                                 |

3. 複数のレコードが1つにマージされていることを確認するには、`MergeRecord`プロセッサの入力と出力を確認します。出力は複数の入力レコードの配列になっていることに注意してください

   入力

   <Image
     img={nifi13}
     size='sm'
     border
     alt='単一レコードを示すMergeRecordプロセッサの入力'
   />

   出力

   <Image
     img={nifi14}
     size='sm'
     border
     alt='マージされたレコード配列を示すMergeRecordプロセッサの出力'
   />

4. `PutDatabaseRecord`プロセッサの「Properties」セクションで、以下の値を入力します

   | Property                            | Value            | Remark                                                                                                                                     |
   | ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
   | Record Reader                       | `JSONTreeReader` | 適切なレコードリーダーを選択します                                                                                                       |
   | Database Type                       | Generic          | デフォルトのままにします                                                                                                                           |
   | Statement Type                      | INSERT           |                                                                                                                                            |
   | Database Connection Pooling Service | ClickHouse JDBC  | ClickHouseコントローラーサービスを選択します                                                                                                   |
   | Table Name                          | tbl              | ここにテーブル名を入力します                                                                                                                 |
   | Translate Field Names               | false            | 挿入されるフィールド名がカラム名と一致する必要があるため、「false」に設定します                                                                     |
   | Maximum Batch Size                  | 1000             | INSERT文あたりの最大行数。この値は`MergeRecord`プロセッサの「Minimum Number of Records」の値より小さくしないでください |

5. 各INSERT文に複数行が含まれていることを確認するには、テーブルの行数が`MergeRecord`で定義された「Minimum Number of Records」の値以上ずつ増加していることを確認します。

   <Image
     img={nifi15}
     size='sm'
     border
     alt='宛先テーブルの行数を示すクエリ結果'
   />

6. おめでとうございます - Apache NiFiを使用してClickHouseへのデータ読み込みに成功しました！

</VerticalStepper>
