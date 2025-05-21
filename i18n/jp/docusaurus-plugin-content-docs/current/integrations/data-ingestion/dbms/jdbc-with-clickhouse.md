---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBCブリッジを使用することで、ClickHouseはJDBCドライバーが利用可能な任意の外部データソースからデータにアクセスできます'
title: 'ClickHouseをJDBCで外部データソースに接続する'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouseをJDBCで外部データソースに接続する

:::note
JDBCを使用するにはClickHouse JDBCブリッジが必要ですので、ローカルマシン上で `clickhouse-local` を使用してデータベースからClickHouse Cloudにデータをストリームする必要があります。詳細については、ドキュメントの**移行**セクション内の[**clickhouse-localの使用**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge)ページを訪れてください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBCブリッジ</a>は、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)や[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)と組み合わせて、ClickHouseが<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBCドライバー</a>が利用可能な任意の外部データソースからデータにアクセスできるようにします:

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBCブリッジのアーキテクチャ図" background='white'/>
これは、外部データソースに対してネイティブ組み込みの[統合エンジン](/engines/table-engines/integrations)、テーブル関数、または外部辞書が利用できない場合に便利ですが、データソース用のJDBCドライバーが存在する場合に便利です。

ClickHouse JDBCブリッジは読み込みと書き込みの両方に使用できます。また、複数の外部データソースに対して同時に使用することができ、たとえば、複数の外部データソースと内部データソースにまたがってClickHouseで分散クエリをリアルタイムで実行できます。

このレッスンでは、ClickHouseを外部データソースに接続するためにClickHouse JDBCブリッジをインストール、設定、実行する方法の簡単さを示します。このレッスンでは、外部データソースとしてMySQLを使用します。

始めましょう！

:::note 前提条件
以下のものにアクセスできるマシンが必要です:
1. UNIXシェルとインターネットアクセス
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>がインストールされていること
3. 現在のバージョンの**Java**（例：<a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされていること
4. 現在のバージョンの**MySQL**（例：<a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >= 8）がインストールされており、実行中であること
5. 現在のバージョンの**ClickHouse**が[インストール](/getting-started/install/install.mdx)されており、実行中であること
:::

## ClickHouse JDBCブリッジをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBCブリッジを使用する最も簡単な方法は、ClickHouseが実行されているのと同じホストにインストールして実行することです:<Image img={Jdbc02} size="lg" alt="ClickHouse JDBCブリッジのローカルデプロイメント図" background='white'/>

ClickHouseが実行されているマシンのUNIXシェルに接続し、ClickHouse JDBCブリッジを後でインストールするためのローカルフォルダーを作成します（フォルダー名はお好みで指定し、任意の場所に配置できます）:
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">現在のバージョン</a>のClickHouse JDBCブリッジをそのフォルダーにダウンロードします:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続できるように、名前付きデータソースを作成します:

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

以下の設定を `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` にコピー＆ペーストできます:

 ```json
 {
   "mysql8": {
   "driverUrls": [
     "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
   ],
   "jdbcUrl": "jdbc:mysql://<host>:<port>",
   "username": "<username>",
   "password": "<password>"
   }
 }
 ```

:::note
上記の設定ファイルについて
- データソース名は `mysql8` としましたが、任意の名前を使用しても構いません。
- `jdbcUrl`の値では、実行中のMySQLインスタンスに応じて `<host>` および `<port>` を適切な値に置き換える必要があります。例えば、`"jdbc:mysql://localhost:3306"` のようにします。
- `<username>` と `<password>` をあなたのMySQL資格情報に置き換える必要があります。パスワードを使用しない場合は、上記の設定ファイルの `"password": "<password>"` 行を削除できます。
- `driverUrls`の値では、MySQL JDBCドライバーの<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">現在のバージョン</a>をダウンロードできるURLを指定しました。これだけで、ClickHouse JDBCブリッジが自動的にそのJDBCドライバーをダウンロードします（OS固有のディレクトリに）。
:::

<br/>

ClickHouse JDBCブリッジを起動する準備が整いました:
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
私たちはClickHouse JDBCブリッジをフォアグラウンドモードで起動しました。ブリッジを停止するには、上記のUNIXシェルウィンドウをフォアグラウンドに戻し、`CTRL+C`を押してください。
:::


## ClickHouseからのJDBC接続の使用 {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)を使用してMySQLデータにアクセスできるようになりました。

以下の例を実行する最も簡単な方法は、それらを[`clickhouse-client`](/interfaces/cli.md)または[Play UI](/interfaces/http.md)にコピー＆ペーストすることです。



- jdbcテーブル関数:

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
jdbcテーブル関数の最初のパラメータとして、上記で設定した名前付きデータソースの名前を使用しています。
:::



- JDBCテーブルエンジン:
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
 jdbcエンジンクlausesの最初のパラメータとして、上記で設定した名前付きデータソースの名前を使用しています。

 ClickHouse JDBCエンジンテーブルのスキーマと接続されたMySQLテーブルのスキーマは整合性が取れている必要があります。例えば、カラム名と順序は同じでなければならず、カラムデータ型は互換性がある必要があります。
:::







## ClickHouse JDBCブリッジを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散ClickHouseクラスター（複数のClickHouseホストを持つクラスター）の場合、ClickHouse JDBCブリッジを独自のホストに外部でインストールおよび実行することが理にかなっています:
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBCブリッジの外部デプロイメント図" background='white'/>
これにより、各ClickHouseホストがJDBCブリッジにアクセスできるという利点があります。そうでなければ、JDBCブリッジは外部データソースにアクセスするために各ClickHouseインスタンスごとにローカルでインストールする必要があります。

ClickHouse JDBCブリッジを外部にインストールするために、次の手順を実行します:


1. このガイドの第1セクションに記載されている手順に従って、専用ホストにClickHouse JDBCブリッジをインストール、設定、実行します。

2. 各ClickHouseホストで、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー構成</a>に次の構成ブロックを追加します（選択した構成形式に応じて、XMLまたはYAMLバージョンを使用します）:

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
    host: JDBC-Bridge-Host
    port: 9019
```

</TabItem>
</Tabs>

:::note
   - `JDBC-Bridge-Host`を専用のClickHouse JDBCブリッジホストのホスト名またはIPアドレスに置き換える必要があります。
   - デフォルトのClickHouse JDBCブリッジポート`9019`を指定しました。異なるポートをJDBCブリッジで使用している場合は、上記の構成を適宜調整する必要があります。
:::


[//]: # (## 4. 追加情報)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbcテーブル関数でスキーマをパラメータとして指定した方がよりパフォーマンスが良いことに言及してください&#40;毎回クエリが2つにならない&#41;)

[//]: # ()
[//]: # (- ad hocクエリとテーブルクエリ、保存されたクエリ、名前付きクエリについて言及してください)

[//]: # ()
[//]: # (- insert into について言及してください)
