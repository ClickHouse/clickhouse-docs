---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge により、JDBC ドライバーが利用可能なあらゆる外部データソースのデータに ClickHouse からアクセスできるようになります'
title: 'JDBC で ClickHouse を外部データソースに接続する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';

# JDBC を使用して ClickHouse を外部データソースに接続する {#connecting-clickhouse-to-external-data-sources-with-jdbc}

:::note
JDBC を使用するには ClickHouse JDBC Bridge が必要なため、ローカルマシン上で `clickhouse-local` を使用して、データベースから ClickHouse Cloud へデータをストリーミングする必要があります。詳細については、ドキュメントの **Migrate** セクションにある [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) ページを参照してください。
:::

**概要:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> を [jdbc テーブル関数](/sql-reference/table-functions/jdbc.md) または [JDBC テーブルエンジン](/engines/table-engines/integrations/jdbc.md) と組み合わせて使用することで、<a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC ドライバー</a> が提供されている任意の外部データソース上のデータに ClickHouse からアクセスできるようになります。

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge のアーキテクチャ図" background='white'/>
これは、対象の外部データソース向けのネイティブな組み込み [integration engine](/engines/table-engines/integrations)、テーブル関数、または外部ディクショナリが存在しない場合でも、そのデータソース用の JDBC ドライバーがあれば利用できるため便利です。

ClickHouse JDBC Bridge は、読み取りと書き込みの両方に使用できます。また、複数の外部データソースに対して並行して利用でき、例えば、複数の外部および内部データソースにまたがる分散クエリを ClickHouse 上でリアルタイムに実行できます。

このレッスンでは、ClickHouse を外部データソースに接続するために ClickHouse JDBC Bridge をインストール、設定、実行する手順がいかに簡単かを説明します。このレッスンでは、外部データソースとして MySQL を使用します。

それでは始めましょう。

:::note 前提条件
次の要件を満たすマシンにアクセスできること:
1. Unix シェルとインターネット接続がある
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a> がインストールされている
3. 最新バージョンの **Java**（例: <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> バージョン >= 17）がインストールされている
4. 最新バージョンの **MySQL**（例: <a href="https://www.mysql.com" target="_blank">MySQL</a> バージョン >= 8）がインストールされ、稼働している
5. 最新バージョンの **ClickHouse** が [インストール](/getting-started/install/install.mdx) され、稼働している
:::

## ClickHouse JDBC Bridge をローカルにインストールする {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC Bridge を使用する最も簡単な方法は、ClickHouse が動作しているのと同じホスト上にインストールして実行することです。<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge をローカルにデプロイした構成図" background="white" />

まず、ClickHouse が動作しているマシンの Unix シェルに接続し、後で ClickHouse JDBC Bridge をインストールするためのローカルフォルダを作成します（フォルダ名や場所は自由に決めてかまいません）。

```bash
mkdir ~/clickhouse-jdbc-bridge
```

次に、そのフォルダに ClickHouse JDBC Bridge の<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">最新バージョン</a>をダウンロードします。

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQL に接続できるように、名前付きデータソースを作成します。

```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

これで、以下の設定を `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` ファイルにコピーして貼り付けることができます：

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
上記の設定ファイルでは、

* データソース名は任意の名前を付けることができます。この例では `mysql8` を使用しています
* `jdbcUrl` の値では、稼働中の MySQL インスタンスに合わせて `<host>` と `<port>` を適切な値に置き換える必要があります（例: `"jdbc:mysql://localhost:3306"`）
* `<username>` と `<password>` は、MySQL の認証情報に置き換えてください。パスワードを使用しない場合は、上記の設定ファイルから `"password": "<password>"` の行を削除できます
* `driverUrls` の値には、MySQL JDBC ドライバーの<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">最新バージョン</a>をダウンロードできる URL を指定しています。これだけで、ClickHouse JDBC Bridge がその JDBC ドライバーを自動的に（OS 固有のディレクトリに）ダウンロードします。
  :::

<br />

これで ClickHouse JDBC Bridge を起動する準備が整いました。

```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```

:::note
ClickHouse JDBC Bridge をフォアグラウンドモードで起動しました。Bridge を停止するには、先ほど開いた Unix シェルウィンドウをフォアグラウンドに切り替え、`CTRL+C` を押します。
:::

## ClickHouse 内から JDBC 接続を使用する {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse は、[jdbc テーブル関数](/sql-reference/table-functions/jdbc.md) または [JDBC テーブルエンジン](/engines/table-engines/integrations/jdbc.md) を使用して、MySQL のデータにアクセスできます。

次の例を実行する最も簡単な方法は、それらを [`clickhouse-client`](/interfaces/cli.md) または [Play UI](/interfaces/http.md) にコピー＆ペーストすることです。

* jdbc テーブル関数:

```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```

:::note
`jdbc` テーブル関数の最初のパラメータとして、上で構成した名前付きデータソースの名前を使用します。
:::

* JDBC テーブルエンジン:

```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
 ```

:::note
`jdbc` エンジン句の最初のパラメータには、上で設定した名前付きデータソースの名前を指定しています。

ClickHouse JDBC エンジンテーブルのスキーマと、接続されている MySQL テーブルのスキーマは一致している必要があります。例えば、カラム名とその順序は同一でなければならず、カラムのデータ型も互換性がある必要があります。
:::

## ClickHouse JDBC Bridge を外部にインストールする {#install-the-clickhouse-jdbc-bridge-externally}

分散 ClickHouse クラスター（複数の ClickHouse ホストを持つクラスター）の場合、ClickHouse JDBC Bridge を専用ホスト上にインストールして外部で実行するのが有効です。
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge 外部デプロイメントの構成図" background='white'/>
この構成の利点は、各 ClickHouse ホストから JDBC Bridge にアクセスできる点にあります。そうでない場合は、Bridge 経由で外部データソースにアクセスする必要がある各 ClickHouse インスタンスごとに JDBC Bridge をローカルにインストールする必要があります。

ClickHouse JDBC Bridge を外部にインストールするには、次の手順を実行します。

1. このガイドのセクション 1 で説明している手順に従って、専用ホスト上に ClickHouse JDBC Bridge をインストール、設定、および実行します。

2. 各 ClickHouse ホストで、<a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse サーバーの設定</a> に次の設定ブロックを追加します（選択した設定形式に応じて XML 版または YAML 版のいずれかを使用してください）。

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
- `JDBC-Bridge-Host` は、専用の ClickHouse JDBC Bridge ホストのホスト名または IP アドレスに置き換えてください
- ここでは ClickHouse JDBC Bridge のデフォルトポート `9019` を指定しています。JDBC Bridge に別のポートを使用している場合は、それに応じて上記の設定を調整してください
:::

[//]: # (## 4. 追加情報)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbc テーブル関数について、スキーマをパラメーターとして指定すると &#40;毎回 2 回クエリを投げないため&#41; より高いパフォーマンスになることに触れる)

[//]: # ()
[//]: # (- アドホッククエリ vs テーブルクエリ、保存済みクエリ、名前付きクエリについて触れる)

[//]: # ()
[//]: # (- insert into について触れる)
