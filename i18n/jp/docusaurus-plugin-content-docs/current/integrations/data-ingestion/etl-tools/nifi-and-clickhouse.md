---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/nifi
description: 'Stream data into ClickHouse using NiFi data pipelines'
title: 'Apache NiFiをClickHouseに接続する'
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

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a>は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフローマネジメントソフトウェアです。ETLデータパイプラインの作成を可能にし、300以上のデータプロセッサが同梱されています。このステップバイステップのチュートリアルでは、Apache NiFiをClickHouseにソースおよびデスティネーションとして接続し、サンプルデータセットをロードする方法を示します。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Apache NiFiをダウンロードして実行する {#2-download-and-run-apache-nifi}

1. 新しいセットアップの場合は、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start`を実行して開始します。

## 3. ClickHouse JDBCドライバーをダウンロードする {#3-download-the-clickhouse-jdbc-driver}

1. GitHubの<a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBCドライバーリリースページ</a>にアクセスし、最新のJDBCリリースバージョンを探します。
2. リリースバージョンで、「すべてのxxアセットを表示」をクリックし、「shaded」または「all」というキーワードを含むJARファイルを探します。例えば、`clickhouse-jdbc-0.5.0-all.jar`。
3. JARファイルをApache NiFiからアクセス可能なフォルダーに置き、絶対パスをメモします。

## 4. `DBCPConnectionPool`コントローラーサービスを追加し、そのプロパティを構成する {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFiでコントローラーサービスを構成するには、「ギア」ボタンをクリックしてNiFiフローページに移動します。

    <Image img={nifi01} size="sm" border alt="NiFi Flow Configuration page with gear button highlighted" />

2. コントローラーサービスタブを選択し、右上の`+`ボタンをクリックして新しいコントローラーサービスを追加します。

    <Image img={nifi02} size="lg" border alt="Controller Services tab with add button highlighted" />

3. `DBCPConnectionPool`を検索し、「追加」ボタンをクリックします。

    <Image img={nifi03} size="lg" border alt="Controller Service selection dialog with DBCPConnectionPool highlighted" />

4. 新たに追加された`DBCPConnectionPool`はデフォルトで無効の状態になります。「ギア」ボタンをクリックして構成を開始します。

    <Image img={nifi04} size="lg" border alt="Controller Services list showing invalid DBCPConnectionPool with gear button highlighted" />

5. 「プロパティ」セクションで、以下の値を入力します。

  | プロパティ                   | 値                                                                  | 備考                                                                        |
  |---------------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------|
  | データベース接続URL         | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 接続URLのHOSTNAMEを適切に置き換えます                                       |
  | データベースドライバのクラス名 | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | データベースドライバの場所   | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBCドライバのJARファイルの絶対パス                              |
  | データベースユーザー         | default                                                            | ClickHouseのユーザー名                                                       |
  | パスワード                  | password                                                 | ClickHouseのパスワード                                                     |

6. 設定セクションで、コントローラーサービスの名前を「ClickHouse JDBC」に変更して参照しやすくします。

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool configuration dialog showing properties filled in" />

7. 「雷」ボタンをクリックして`DBCPConnectionPool`コントローラーサービスをアクティブにし、「有効化」ボタンをクリックします。

    <Image img={nifi06} size="lg" border alt="Controller Services list with lightning button highlighted" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Enable Controller Service confirmation dialog" />

8. コントローラーサービスタブを確認し、コントローラーサービスが有効になっていることを確認します。

    <Image img={nifi08} size="lg" border alt="Controller Services list showing enabled ClickHouse JDBC service" />

## 5. `ExecuteSQL`プロセッサを使用してテーブルから読み取る {#5-read-from-a-table-using-the-executesql-processor}

1. 適切な上流および下流のプロセッサと共に、`ExecuteSQL`プロセッサを追加します。

    <Image img={nifi09} size="md" border alt="NiFi canvas showing ExecuteSQL processor in a workflow" />

2. `ExecuteSQL`プロセッサの「プロパティ」セクションに以下の値を入力します。

    | プロパティ                            | 値                                  | 備考                                                  |
    |-------------------------------------|--------------------------------------|---------------------------------------------------------|
    | データベース接続プールサービス      | ClickHouse JDBC                      | ClickHouse用に構成されたコントローラーサービスを選択  |
    | SQL選択クエリ                       | SELECT * FROM system.metrics         | ここにクエリを入力します                               |

3. `ExecuteSQL`プロセッサを開始します。

    <Image img={nifi10} size="lg" border alt="ExecuteSQL processor configuration with properties filled in" />

4. クエリが正常に処理されたことを確認するために、出力キュー内の`FlowFile`の1つを検査します。

    <Image img={nifi11} size="lg" border alt="List queue dialog showing flowfiles ready for inspection" />

5. 表示を「フォーマット済み」に切り替えて出力`FlowFile`の結果を表示します。

    <Image img={nifi12} size="lg" border alt="FlowFile content viewer showing query results in formatted view" />

## 6. `MergeRecord`および`PutDatabaseRecord`プロセッサを使用してテーブルに書き込む {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 単一の挿入で複数の行を書き込むには、まず、複数のレコードを1つのレコードにマージする必要があります。これは`MergeRecord`プロセッサを使用して行うことができます。

2. `MergeRecord`プロセッサの「プロパティ」セクションに以下の値を入力します。

    | プロパティ                  | 値              | 備考                                                                                                                          |
    |---------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------|
    | レコードリーダー            | `JSONTreeReader`    | 適切なレコードリーダーを選択します                                                                                            |
    | レコードライター            | `JSONReadSetWriter` | 適切なレコードライターを選択します                                                                                            |
    | 最小レコード数              | 1000              | これを高い数に変更して、最小行数が1つのレコードを形成するようにします。デフォルトは1行                                      |
    | 最大レコード数              | 10000             | 「最小レコード数」よりも高い数にこれを変更します。デフォルトは1,000行                                                       |

3. 複数のレコードが1つにマージされていることを確認するために、`MergeRecord`プロセッサの入力と出力を確認します。出力は複数の入力レコードの配列であることに注意してください。

    入力
    <Image img={nifi13} size="sm" border alt="MergeRecord processor input showing single records" />

    出力
    <Image img={nifi14} size="sm" border alt="MergeRecord processor output showing merged array of records" />

4. `PutDatabaseRecord`プロセッサの「プロパティ」セクションに以下の値を入力します。

    | プロパティ                            | 値           | 備考                                                                                                                                   |
    |----------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | レコードリーダー                       | `JSONTreeReader`  | 適切なレコードリーダーを選択します                                                                                                     |
    | データベースタイプ                       | Generic         | デフォルトのままにします                                                                                                                         |
    | ステートメントタイプ                      | INSERT          |                                                                                                                                          |
    | データベース接続プールサービス | ClickHouse JDBC | ClickHouseのコントローラーサービスを選択します                                                                                                 |
    | テーブル名                          | tbl             | ここにテーブル名を入力します                                                                                                               |
    | フィールド名を翻訳                   | false           | フィールド名を挿入する必要があるため「false」に設定します                                                                                    |
    | 最大バッチサイズ                  | 1000            | 挿入あたりの行数の最大値。この値は、`MergeRecord`プロセッサの「最小レコード数」の値よりも低くしてはいけません。                         |

5. 各挿入に複数の行が含まれることを確認するために、テーブルの行数が`MergeRecord`で定義される「最小レコード数」の値以上に増加していることを確認します。

    <Image img={nifi15} size="sm" border alt="Query results showing row count in the destination table" />

6. おめでとうございます - Apache NiFiを使用してClickHouseにデータを正常にロードしました！
