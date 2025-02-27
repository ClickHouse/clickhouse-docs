---
sidebar_label: NiFi
sidebar_position: 12
keywords: [clickhouse, NiFi, 接続, 統合, ETL, データ統合]
slug: /integrations/nifi
description: NiFiデータパイプラインを使用してClickHouseにストリームデータを取り込む
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Apache NiFiをClickHouseに接続する

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a>は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフローマネジメントソフトウェアです。ETLデータパイプラインの作成を可能にし、300以上のデータプロセッサが付属しています。このステップバイステップのチュートリアルでは、Apache NiFiをソースおよび宛先としてClickHouseに接続し、サンプルデータセットをロードする方法を説明します。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Apache NiFiをダウンロードして実行する {#2-download-and-run-apache-nifi}

1. 新規セットアップの場合、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start` を実行して開始します。

## 3. ClickHouse JDBCドライバをダウンロードする {#3-download-the-clickhouse-jdbc-driver}

1. GitHubの<a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBCドライバリリースページ</a>を訪れて、最新のJDBCリリースバージョンを探します。
2. リリースバージョンで「すべてのxxアセットを表示」をクリックし、「shaded」または「all」のキーワードを含むJARファイルを探します。たとえば、`clickhouse-jdbc-0.5.0-all.jar`のようです。
3. JARファイルをApache NiFiがアクセスできるフォルダに配置し、絶対パスをメモします。

## 4. `DBCPConnectionPool`コントローラーサービスを追加し、そのプロパティを設定する {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFiでコントローラーサービスを設定するには、「ギア」ボタンをクリックしてNiFiフロー設定ページに移動します。

    <img src={require('./images/nifi_01.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '50%'}}/>

2. コントローラーサービスタブを選択し、右上の`+`ボタンをクリックして新しいコントローラーサービスを追加します。

    <img src={require('./images/nifi_02.png').default} class="image" alt="Add Controller Service" style={{width: '80%'}}/>

3. `DBCPConnectionPool`を検索して、「追加」ボタンをクリックします。

    <img src={require('./images/nifi_03.png').default} class="image" alt="Search for `DBCPConnectionPool`" style={{width: '80%'}}/>

4. 新しく追加された`DBCPConnectionPool`はデフォルトで無効な状態になります。「ギア」ボタンをクリックして設定を開始します。

    <img src={require('./images/nifi_04.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '80%'}}/>

5. 「プロパティ」セクションに、以下の値を入力します。

  | プロパティ                     | 値                                                              | 備考                                                                      |
  | ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
  | データベース接続URL           | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                 | 接続URL内のHOSTNAMEを適宜置き換えます                                     |
  | データベースドライバクラス名 | com.clickhouse.jdbc.ClickHouseDriver                             |                                                                           |
  | データベースドライバの場所    | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBCドライバJARファイルの絶対パス                              |
  | データベースユーザー           | default                                                          | ClickHouseのユーザー名                                                       |
  | パスワード                    | password                                                         | ClickHouseのパスワード                                                       |

6. 設定セクションで、コントローラーサービスの名前を「ClickHouse JDBC」に変更して、参照しやすくします。

    <img src={require('./images/nifi_05.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '80%'}}/>

7. 「稲妻」ボタンをクリックし、その後「有効にする」ボタンをクリックして`DBCPConnectionPool`コントローラーサービスを有効にします。

    <img src={require('./images/nifi_06.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '80%'}}/>

    <br/>

    <img src={require('./images/nifi_07.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '80%'}}/>

8. コントローラーサービスタブを確認し、コントローラーサービスが有効になっていることを確認します。

    <img src={require('./images/nifi_08.png').default} class="image" alt="NiFi Flow Configuration" style={{width: '80%'}}/>

## 5. `ExecuteSQL`プロセッサを使用してテーブルから読み取る {#5-read-from-a-table-using-the-executesql-processor}

1. ​`​ExecuteSQL`プロセッサを追加し、適切な上流および下流プロセッサを設定します。

    <img src={require('./images/nifi_09.png').default} class="image" alt="​​`ExecuteSQL` processor" style={{width: '50%'}}/>

2. ​`​ExecuteSQL`プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                           | 値                                    | 備考                                                        |
    |-------------------------------------|--------------------------------------|-------------------------------------------------------------|
    | データベース接続プールサービス      | ClickHouse JDBC                      | ClickHouse用に設定したコントローラーサービスを選択する     |
    | SQL選択クエリ                       | SELECT * FROM system.metrics         | ここにクエリを入力します                                     |

3. `​​ExecuteSQL`プロセッサを開始します。

    <img src={require('./images/nifi_10.png').default} class="image" alt="`​​ExecuteSQL` processor" style={{width: '80%'}}/>

4. クエリが正常に処理されたことを確認するために、出力キュー内の`FlowFile`の1つを確認します。

    <img src={require('./images/nifi_11.png').default} class="image" alt="​​`ExecuteSQL` processor" style={{width: '80%'}}/>

5. 結果を表示するために「整形」ビューに切り替えます。

    <img src={require('./images/nifi_12.png').default} class="image" alt="`​​ExecuteSQL` processor" style={{width: '80%'}}/>

## 6. `MergeRecord`と`PutDatabaseRecord`プロセッサを使用してテーブルに書き込む {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 複数の行を単一の挿入で書き込むには、まず複数のレコードを単一のレコードにマージする必要があります。これは、`MergeRecord`プロセッサを使用して行います。

2. `MergeRecord`プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                   | 値                  | 備考                                                                                                                  |
    |-----------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------|
    | レコードリーダー            | `JSONTreeReader`     | 適切なレコードリーダーを選択します                                                                                    |
    | レコードライター            | `JSONReadSetWriter`  | 適切なレコードライターを選択します                                                                                    |
    | 最小レコード数              | 1000                 | 単一のレコードを形成する最小行数がマージされるように、より高い数値に変更します。デフォルトは1行です                |
    | 最大レコード数              | 10000                | 「最小レコード数」よりも高い数値に変更します。デフォルトは1,000行です                                             |

3. 複数のレコードが1つにマージされていることを確認するために、`MergeRecord`プロセッサの入力と出力を確認します。出力が複数の入力レコードの配列であることに注意してください。

    入力
    <img src={require('./images/nifi_13.png').default} class="image" alt="​`​ExecuteSQL` processor" style={{width: '50%'}}/>

    出力
    <img src={require('./images/nifi_14.png').default} class="image" alt="​​`ExecuteSQL` processor" style={{width: '50%'}}/>

4. `PutDatabaseRecord`プロセッサの「プロパティ」セクションに、以下の値を入力します。

    | プロパティ                            | 値               | 備考                                                                                                                     |
    |-------------------------------------|------------------|--------------------------------------------------------------------------------------------------------------------------|
    | レコードリーダー                    | `JSONTreeReader`  | 適切なレコードリーダーを選択します                                                                                     |
    | データベースタイプ                  | Generic           | デフォルトのままにします                                                                                                  |
    | ステートメントタイプ                | INSERT            |                                                                                                                          |
    | データベース接続プールサービス      | ClickHouse JDBC   | ClickHouseのコントローラーサービスを選択します                                                                          |
    | テーブル名                          | tbl               | ここにテーブル名を入力します                                                                                            |
    | フィールド名を翻訳                  | false             | フィールド名が挿入される名前はカラム名と一致させるために"false"に設定します                   |
    | 最大バッチサイズ                    | 1000              | 挿入ごとの最大行数。この値は、`MergeRecord`プロセッサの「最小レコード数」の値以下にしてはいけません。                               |

4. 各挿入に複数の行が含まれていることを確認するために、テーブル内の行数が`MergeRecord`で定義された「最小レコード数」以上増加していることを確認します。

    <img src={require('./images/nifi_15.png').default} class="image" alt="`​​ExecuteSQL` processor" style={{width: '50%'}}/>

5. おめでとうございます - Apache NiFiを使用してClickHouseにデータを正常にロードしました！
