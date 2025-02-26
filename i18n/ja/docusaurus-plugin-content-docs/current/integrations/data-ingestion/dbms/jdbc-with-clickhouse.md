---
sidebar_label: JDBC
sidebar_position: 2
keywords: [clickhouse, jdbc, connect, integrate]
slug: /integrations/jdbc/jdbc-with-clickhouse
description: ClickHouse JDBCブリッジは、JDBCドライバが利用可能な任意の外部データソースからClickHouseがデータにアクセスできるようにします。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ClickHouseをJDBCを使用して外部データソースに接続する

:::note
JDBCを使用するには、ClickHouse JDBCブリッジが必要です。したがって、ローカルマシンで`clickhouse-local`を使用して、データベースからClickHouse Cloudにデータをストリーミングする必要があります。詳細については、**Migrate**セクションの[**clickhouse-localの使用**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge)のページを訪れてください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBCブリッジ</a>は、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)や、[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)と組み合わせることで、ClickHouseが<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBCドライバ</a>が利用可能な任意の外部データソースからデータにアクセスできるようにします：
<img src={require('./images/jdbc-01.png').default} class="image" alt="ClickHouse JDBC Bridge"/>
これは、外部データソースに対してネイティブビルトインの[統合エンジン](/engines/table-engines/index.md#integration-engines-integration-engines)、テーブル関数、または外部辞書が利用できない場合に便利です。

ClickHouse JDBCブリッジは、読み取りと書き込みの両方で使用できます。また、複数の外部データソースに対して並行して使用することも可能で、たとえば、リアルタイムで複数の外部および内部データソースに対して分散クエリを実行できます。

このレッスンでは、ClickHouseと外部データソースを接続するために、ClickHouse JDBCブリッジを簡単にインストール、設定、および実行する方法を示します。このレッスンではMySQLを外部データソースとして使用します。

さあ始めましょう！

:::note 前提条件
次の条件を満たすマシンにアクセスできること：
1. Unixシェルおよびインターネットに接続できる
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>がインストールされている
3. 現在のバージョンの**Java**（例：<a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされている
4. 現在のバージョンの**MySQL**（例：<a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >= 8）がインストールされて実行中である
5. 現在のバージョンの**ClickHouse**が[インストール](/getting-started/install.md)されて実行中である
:::

## ClickHouse JDBCブリッジをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBCブリッジを使用する最も簡単な方法は、ClickHouseが実行されているのと同じホストにインストールして実行することです：<img src={require('./images/jdbc-02.png').default} class="image" alt="ClickHouse JDBC Bridge locally"/>

まず、ClickHouseが実行されているマシンのUnixシェルに接続し、後にClickHouse JDBCブリッジをインストールするためのローカルフォルダを作成します（フォルダの名前は好きなように付けて、好きな場所に置いてもかまいません）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダに<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">現在のバージョン</a>のClickHouse JDBCブリッジをダウンロードします：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続できるように、名前付きデータソースを作成します：

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

次に、以下の設定を`~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`にコピーして貼り付けます：

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
上記の設定ファイルの中で
- データソースの名前は好きなもので構いません。ここでは`mysql8`を使用しました。
- `jdbcUrl`の値には、`<host>`と`<port>`を実行中のMySQLインスタンスに従って適切な値に置き換えます。例："jdbc:mysql://localhost:3306"
- `<username>`と`<password>`をMySQLの認証情報に置き換える必要があります。パスワードを使用しない場合は、上記の設定ファイルから `"password": "<password>"`の行を削除できます。
- `driverUrls`の値には、MySQL JDBCドライバの<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">現在のバージョン</a>がダウンロードできるURLを指定しました。これで大丈夫で、ClickHouse JDBCブリッジは自動的にそのJDBCドライバを（OS固有のディレクトリに）ダウンロードします。
:::

<br/>

これで、ClickHouse JDBCブリッジを起動できます：
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
ClickHouse JDBCブリッジをフォアグラウンドモードで起動しました。ブリッジを停止するには、上記のUnixシェルウィンドウをフォアグラウンドに持ってきて、`CTRL+C`を押すことができます。
:::


## ClickHouse内部からJDBC接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)のいずれかを使用してMySQLデータにアクセスできます。

次の例を実行する最も簡単な方法は、[`clickhouse-client`](/interfaces/cli.md)か[Play UI](/interfaces/http.md)にコピーして貼り付けることです。

- jdbcテーブル関数：

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
jdbcテーブル関数の最初のパラメータには、上で構成した名前付きデータソースの名前を使用しています。
:::

- JDBCテーブルエンジン：
 ```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```
:::note
jdbcエンジン句の最初のパラメータには、上で構成した名前付きデータソースの名前を使用しています。

ClickHouse JDBCエンジンテーブルのスキーマと接続されているMySQLテーブルのスキーマは一致する必要があります。たとえば、カラムの名前と順序は同じでなければならず、カラムのデータ型は互換性がなければなりません。
:::






## ClickHouse JDBCブリッジを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散型ClickHouseクラスター（複数のClickHouseホストを持つクラスター）では、ClickHouse JDBCブリッジを外部の専用ホストにインストールして実行することが理にかなっています：
<img src={require('./images/jdbc-03.png').default} class="image" alt="ClickHouse JDBC Bridge externally"/>
これにより、各ClickHouseホストがJDBCブリッジにアクセスできます。それ以外の場合、外部データソースにアクセスするために各ClickHouseインスタンスにローカルにJDBCブリッジをインストールする必要があります。

ClickHouse JDBCブリッジを外部にインストールするために、次の手順を実行します：

1. 専用ホストにClickHouse JDBCブリッジをインストール、設定、および実行します。このガイドのセクション1に記載された手順に従います。

2. 各ClickHouseホストに、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー設定</a>に以下の設定ブロックを追加します（選択した設定形式に応じて、XMLまたはYAMLバージョンを使用してください）：

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
   - `JDBC-Bridge-Host`を専用のClickHouse JDBCブリッジホストのホスト名またはIPアドレスに置き換える必要があります
   - デフォルトのClickHouse JDBCブリッジポート`9019`を指定しましたが、JDBCブリッジに異なるポートを使用している場合は、上記の設定を適宜調整してください
:::




[//]: # (## 4. 追加情報)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbcテーブル関数について言及し、それをパラメータとしてスキーマを指定する方がパフォーマンスが向上することを追加)

[//]: # ()
[//]: # (-その場でのクエリvsテーブルクエリ、保存されたクエリ、名前付きクエリについて言及)

[//]: # ()
[//]: # (-挿入について言及)

