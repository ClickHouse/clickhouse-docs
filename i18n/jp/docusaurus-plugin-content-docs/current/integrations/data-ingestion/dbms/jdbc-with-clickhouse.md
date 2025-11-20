---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge を使用すると、JDBC ドライバーが利用可能な任意の外部データソース上のデータに ClickHouse からアクセスできるようになります'
title: 'JDBC を使用して ClickHouse を外部データソースに接続する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# JDBC を使用して ClickHouse を外部データソースに接続する

:::note
JDBC を使用するには ClickHouse JDBC Bridge が必要なため、データベースから ClickHouse Cloud へデータをストリーミングするには、ローカルマシン上で `clickhouse-local` を使用する必要があります。詳細については、ドキュメントの **Migrate** セクションにある [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) ページを参照してください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> は、[jdbc table function](/sql-reference/table-functions/jdbc.md) または [JDBC table engine](/engines/table-engines/integrations/jdbc.md) と組み合わせることで、<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC driver</a> が利用可能なあらゆる外部データソース上のデータに ClickHouse からアクセスできるようにします：

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge アーキテクチャ図" background='white'/>
これは、対象の外部データソース向けのネイティブな [integration engine](/engines/table-engines/integrations)、table function、外部ディクショナリが用意されていないものの、そのデータソース向けの JDBC driver は存在する、という場合に便利です。

ClickHouse JDBC Bridge は、読み取りと書き込みの両方に利用できます。また、複数の外部データソースに対して並行して利用できるため、たとえば ClickHouse 上で複数の外部および内部データソースにまたがる分散クエリをリアルタイムに実行できます。

このレッスンでは、ClickHouse を外部データソースに接続するために、ClickHouse JDBC Bridge をインストール・設定・実行する方法がいかに簡単かを説明します。ここでは MySQL を外部データソースとして使用します。

それでは始めましょう。

:::note Prerequisites
次の環境を備えたマシンへアクセスできること:
1. Unix シェルとインターネット接続
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a> がインストールされていること
3. 現行バージョンの **Java**（例: <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> Version >= 17）がインストールされていること
4. 現行バージョンの **MySQL**（例: <a href="https://www.mysql.com" target="_blank">MySQL</a> Version >= 8）がインストールされ、稼働していること
5. 現行バージョンの **ClickHouse** が[インストール](/getting-started/install/install.mdx)され、稼働していること
:::



## ClickHouse JDBC Bridgeをローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC Bridgeを使用する最も簡単な方法は、ClickHouseが実行されているのと同じホスト上にインストールして実行することです:<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridgeローカルデプロイメント図" background='white'/>

まず、ClickHouseが実行されているマシンのUnixシェルに接続し、後でClickHouse JDBC Bridgeをインストールするためのローカルフォルダを作成します(フォルダ名や配置場所は自由に設定できます):

```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、ClickHouse JDBC Bridgeの<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">最新バージョン</a>をそのフォルダにダウンロードします:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQLに接続できるようにするため、名前付きデータソースを作成します:

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

以下の設定を`~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`ファイルにコピー&ペーストします:

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

- データソースには任意の名前を使用できます。ここでは`mysql8`を使用しています
- `jdbcUrl`の値では、実行中のMySQLインスタンスに応じて`<host>`と`<port>`を適切な値に置き換える必要があります。例: `"jdbc:mysql://localhost:3306"`
- `<username>`と`<password>`をMySQLの認証情報に置き換える必要があります。パスワードを使用しない場合は、上記の設定ファイルから`"password": "<password>"`の行を削除できます
- `driverUrls`の値には、MySQL JDBCドライバの<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">最新バージョン</a>をダウンロードできるURLを指定しています。これだけで、ClickHouse JDBC BridgeがそのJDBCドライバを自動的にダウンロードします(OS固有のディレクトリに)。
  :::

<br />

これでClickHouse JDBC Bridgeを起動する準備が整いました:

```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
ClickHouse JDBC Bridgeをフォアグラウンドモードで起動しました。Bridgeを停止するには、上記のUnixシェルウィンドウをフォアグラウンドにして`CTRL+C`を押します。
:::


## ClickHouse内からJDBC接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouseは、[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)または[JDBCテーブルエンジン](/engines/table-engines/integrations/jdbc.md)を使用してMySQLデータにアクセスできます。

以下の例を実行する最も簡単な方法は、[`clickhouse-client`](/interfaces/cli.md)または[Play UI](/interfaces/http.md)にコピー&ペーストすることです。

- jdbcテーブル関数:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
jdbcテーブル関数の第1パラメータには、上記で設定した名前付きデータソースの名前を使用しています。
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
jdbcエンジン句の第1パラメータには、上記で設定した名前付きデータソースの名前を使用しています。

ClickHouse JDBCエンジンテーブルのスキーマと接続先のMySQLテーブルのスキーマは一致している必要があります。例えば、列名と順序が同じであり、列のデータ型に互換性がなければなりません。
:::


## ClickHouse JDBC Bridgeを外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散ClickHouseクラスタ(複数のClickHouseホストで構成されるクラスタ)の場合、ClickHouse JDBC Bridgeを専用ホスト上に外部インストールして実行することが推奨されます:

<Image
  img={Jdbc03}
  size='lg'
  alt='ClickHouse JDBC Bridge外部デプロイメント図'
  background='white'
/>
この方法には、各ClickHouseホストがJDBC Bridgeにアクセスできるという利点があります。
そうでない場合、Bridge経由で外部データソースにアクセスする必要がある各ClickHouseインスタンスに対して、JDBC Bridgeをローカルにインストールする必要があります。

ClickHouse JDBC Bridgeを外部にインストールするには、以下の手順を実行します:

1. 本ガイドのセクション1に記載されている手順に従って、専用ホスト上でClickHouse JDBC Bridgeをインストール、設定、実行します。

2. 各ClickHouseホスト上で、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouseサーバー設定</a>に以下の設定ブロックを追加します(選択した設定形式に応じて、XMLまたはYAMLバージョンを使用してください):

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

- `JDBC-Bridge-Host`を専用ClickHouse JDBC Bridgeホストのホスト名またはIPアドレスに置き換える必要があります
- デフォルトのClickHouse JDBC Bridgeポート`9019`を指定していますが、JDBC Bridgeに異なるポートを使用している場合は、上記の設定を適宜調整する必要があります
  :::

[//]: # "## 4. Additional Info"
[//]: #
[//]: # "TODO: "
[//]: # "- mention that for jdbc table function it is more performant (not two queries each time) to also specify the schema as a parameter"
[//]: #
[//]: # "- mention ad hoc query vs table query, saved query, named query"
[//]: #
[//]: # "- mention insert into "
