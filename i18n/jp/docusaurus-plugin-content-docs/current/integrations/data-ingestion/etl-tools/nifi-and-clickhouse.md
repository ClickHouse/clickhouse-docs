---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords:
- 'clickhouse'
- 'NiFi'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
slug: '/integrations/nifi'
description: 'NiFiデータパイプラインを使用してClickHouseにデータをストリーム配信する'
title: 'Connect Apache NiFi to ClickHouse'
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


# Apache NiFiをClickHouseに接続する

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a>は、ソフトウェアシステム間のデータフローを自動化するために設計されたオープンソースのワークフロー管理ソフトウェアです。ETLデータパイプラインの作成が可能で、300以上のデータプロセッサが付属しています。このステップバイステップのチュートリアルでは、Apache NiFiをClickHouseにソース及びデスティネーションとして接続し、サンプルデータセットをロードする方法を示します。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Apache NiFiをダウンロードして実行する {#2-download-and-run-apache-nifi}

1. 新しいセットアップの場合、https://nifi.apache.org/download.html からバイナリをダウンロードし、`./bin/nifi.sh start`を実行して開始します。

## 3. ClickHouse JDBCドライバをダウンロードする {#3-download-the-clickhouse-jdbc-driver}

1. GitHubの<a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBCドライバリリースページ</a>にアクセスし、最新のJDBCリリースバージョンを探します。
2. リリースバージョン内で「すべてのxxアセットを表示」をクリックし、「shaded」または「all」というキーワードを含むJARファイルを探します。例えば、`clickhouse-jdbc-0.5.0-all.jar`のようなファイルです。
3. JARファイルをApache NiFiがアクセスできるフォルダに置き、絶対パスをメモします。

## 4. `DBCPConnectionPool`コントローラサービスを追加し、そのプロパティを設定する {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. Apache NiFiでコントローラサービスを設定するには、「ギア」ボタンをクリックしてNiFiフロー設定ページに移動します。

    <Image img={nifi01} size="sm" border alt="ギアボタンがハイライトされたNiFiフロー設定ページ" />

2. コントローラスサービスタブを選択し、右上の`+`ボタンをクリックして新しいコントローラサービスを追加します。

    <Image img={nifi02} size="lg" border alt="追加ボタンがハイライトされたコントローラスサービスタブ" />

3. `DBCPConnectionPool`を検索し、「追加」ボタンをクリックします。

    <Image img={nifi03} size="lg" border alt="DBCPConnectionPoolがハイライトされたコントローラサービス選択ダイアログ" />

4. 新しく追加された`DBCPConnectionPool`はデフォルトで無効な状態です。「ギア」ボタンをクリックして設定を開始します。

    <Image img={nifi04} size="lg" border alt="無効なDBCPConnectionPoolがハイライトされたコントローラスサービスリスト" />

5. 「プロパティ」セクションで、以下の値を入力します。

  | プロパティ                      | 値                                                              | 備考                                                               |
  | ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
  | データベース接続URL             | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                   | 接続URL内のHOSTNAMEを適宜置き換えてください                       |
  | データベースドライバクラス名   | com.clickhouse.jdbc.ClickHouseDriver                             ||
  | データベースドライバの場所      | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBCドライバJARファイルの絶対パス                       |
  | データベースユーザー             | default                                                          | ClickHouseのユーザー名                                              |
  | パスワード                       | password                                                        | ClickHouseのパスワード                                            |

6. 設定セクションで、コントローラサービスの名前を「ClickHouse JDBC」に変更して簡単に参照できるようにします。

    <Image img={nifi05} size="lg" border alt="プロパティが入力されたDBCPConnectionPool設定ダイアログ" />

7. 「雷」ボタンをクリックし、「有効にする」ボタンをクリックして`DBCPConnectionPool`コントローラサービスを有効にします。

    <Image img={nifi06} size="lg" border alt="雷ボタンがハイライトされたコントローラスサービスリスト" />

    <br/>

    <Image img={nifi07} size="lg" border alt="コントローラサービスの確認ダイアログ" />

8. コントローラスサービスタブを確認し、コントローラサービスが有効になっていることを確認します。

    <Image img={nifi08} size="lg" border alt="有効なClickHouse JDBCサービスを示すコントローラスサービスリスト" />

## 5. `ExecuteSQL`プロセッサを使用してテーブルから読み込む {#5-read-from-a-table-using-the-executesql-processor}

1. 適切なアップストリームおよびダウンストリームプロセッサと共に`ExecuteSQL`プロセッサを追加します。

    <Image img={nifi09} size="md" border alt="ワークフローにおけるExecuteSQLプロセッサを示すNiFiキャンバス" />

2. `ExecuteSQL`プロセッサの「プロパティ」セクションで、以下の値を入力します。

    | プロパティ                          | 値                                  | 備考                                                          |
    |-------------------------------------|--------------------------------------|---------------------------------------------------------------|
    | データベース接続プーリングサービス | ClickHouse JDBC                      | ClickHouseのために設定されたコントローラサービスを選択します |
    | SQL選択クエリ                      | SELECT * FROM system.metrics         | ここにクエリを入力します                                      |

3. `ExecuteSQL`プロセッサを起動します。

    <Image img={nifi10} size="lg" border alt="プロパティが入力されたExecuteSQLプロセッサの設定" />

4. クエリが正常に処理されたことを確認するために、出力キュー内の`FlowFile`の1つを検査します。

    <Image img={nifi11} size="lg" border alt="検査のために準備されたflowfilesを示すリストキューのダイアログ" />

5. 結果を見るためにビューを「フォーマット」に切り替えます。

    <Image img={nifi12} size="lg" border alt="フォーマットされたビューでクエリ結果を示すFlowFileコンテンツビューワー" />

## 6. `MergeRecord`と`PutDatabaseRecord`プロセッサを使用してテーブルに書き込む {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 複数の行を単一の挿入で書き込むために、まず複数のレコードを単一のレコードにマージする必要があります。これは`MergeRecord`プロセッサを使用して行えます。

2. `MergeRecord`プロセッサの「プロパティ」セクションで、以下の値を入力します。

    | プロパティ                   | 値                 | 備考                                                                                                                     |
    |-----------------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------|
    | レコードリーダー            | `JSONTreeReader`     | 適切なレコードリーダーを選択します                                                                                       |
    | レコードライター            | `JSONReadSetWriter`  | 適切なレコードライターを選択します                                                                                       |
    | 最小レコード数              | 1000                | この値を高く変更して、単一のレコードを形成するための最小行数をマージします。デフォルトは1行です                     |
    | 最大レコード数              | 10000               | 「最小レコード数」よりも高い数字に変更します。デフォルトは1,000行です                                                 |

3. 複数のレコードがひとつにマージされていることを確認するために、`MergeRecord`プロセッサの入力と出力を検査します。出力が複数の入力レコードの配列であることに注目してください。

    入力
    <Image img={nifi13} size="sm" border alt="単一レコードを示すMergeRecordプロセッサの入力" />

    出力
    <Image img={nifi14} size="sm" border alt="マージされたレコードの配列を示すMergeRecordプロセッサの出力" />

4. `PutDatabaseRecord`プロセッサの「プロパティ」セクションで、以下の値を入力します。

    | プロパティ                            | 値                | 備考                                                                                                         |
    |---------------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------|
    | レコードリーダー                     | `JSONTreeReader`    | 適切なレコードリーダーを選択します                                                                         |
    | データベースタイプ                   | Generic             | デフォルトのままにします                                                                                    |
    | ステートメントタイプ                 | INSERT              |                                                                                                             |
    | データベース接続プーリングサービス   | ClickHouse JDBC     | ClickHouseコントローラサービスを選択します                                                                 |
    | テーブル名                           | tbl                 | ここにテーブル名を入力します                                                                              |
    | フィールド名の変換                  | false               | フィールド名を挿入する際にカラム名と一致するように「false」に設定します                                                     |
    | 最大バッチサイズ                     | 1000                | 挿入ごとの最大行数。この値は`MergeRecord`プロセッサの「最小レコード数」よりも低く設定しないでください。             |

4. 各挿入が複数の行を含んでいることを確認するために、テーブルの行数が`MergeRecord`で定義された「最小レコード数」に関連して少なくとも増加していることを確認します。

    <Image img={nifi15} size="sm" border alt="宛先テーブルにおける行数を示すクエリ結果" />

5. おめでとうございます - Apache NiFiを使用してClickHouseにデータを正常にロードしました！
