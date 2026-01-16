---
description: 'このページでは、ClickHouse サーバーを XML または YAML 構文の設定ファイルで構成する方法を説明します。'
sidebar_label: '設定ファイル'
sidebar_position: 50
slug: /operations/configuration-files
title: '設定ファイル'
doc_type: 'guide'
---

:::note
XML ベースの設定プロファイルおよび設定ファイルは ClickHouse Cloud ではサポートされていません。そのため、ClickHouse Cloud には config.xml ファイルが存在しません。代わりに、設定プロファイルを通じて設定を管理するために SQL コマンドを使用する必要があります。

詳細については、["Configuring Settings"](/manage/settings) を参照してください。
:::

ClickHouse サーバーは、XML または YAML 構文の設定ファイルで構成できます。
ほとんどのインストール形態では、ClickHouse サーバーはデフォルトの設定ファイルとして `/etc/clickhouse-server/config.xml` を使用して動作します。ただし、サーバー起動時にコマンドラインオプション `--config-file` または `-C` を使用して、設定ファイルの場所を手動で指定することもできます。
追加の設定ファイルは、メインの設定ファイルからの相対パスである `config.d/` ディレクトリ、例えば `/etc/clickhouse-server/config.d/` ディレクトリに配置できます。
このディレクトリ内のファイルとメインの設定ファイルは、ClickHouse サーバーに設定が適用される前の前処理段階でマージされます。
設定ファイルはアルファベット順にマージされます。
更新を簡素化しモジュール化を改善するために、デフォルトの `config.xml` ファイルは変更せずに保持し、追加のカスタマイズは `config.d/` に配置することがベストプラクティスです。
ClickHouse Keeper の設定は `/etc/clickhouse-keeper/keeper_config.xml` に格納されています。
同様に、Keeper 用の追加の設定ファイルは `/etc/clickhouse-keeper/keeper_config.d/` に配置する必要があります。

XML と YAML の設定ファイルを混在させることができ、例えばメインの設定ファイルを `config.xml` とし、追加の設定ファイルとして `config.d/network.xml`、`config.d/timezone.yaml`、`config.d/keeper.yaml` を用意することができます。
1 つの設定ファイル内で XML と YAML を混在させることはサポートされていません。
XML 設定ファイルでは、トップレベルのタグとして `<clickhouse>...</clickhouse>` を使用する必要があります。
YAML 設定ファイルでは、`clickhouse:` は省略可能であり、省略された場合はパーサーが自動的に挿入します。

## 設定のマージ \{#merging\}

2 つの設定ファイル（通常はメインの設定ファイルと `config.d/` 内の別の設定ファイル）は、次のようにマージされます。

* あるノード（要素へのパス）が両方のファイルに存在し、かつ `replace` または `remove` 属性を持たない場合、そのノードはマージ後の設定ファイルに含まれ、両方のノード配下の子要素が含まれて再帰的にマージされます。
* 2 つのノードの一方が `replace` 属性を持つ場合、そのノードはマージ後の設定ファイルに含まれますが、子要素は `replace` 属性を持つ側のノードのもののみが含まれます。
* 2 つのノードの一方が `remove` 属性を持つ場合、そのノードはマージ後の設定ファイルには含まれません（すでに存在している場合は削除されます）。

例えば、2 つの設定ファイルが次のような場合を考えます。

```xml title="config.xml"
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
    </config_a>
    <config_b>
        <setting_2>2</setting_2>
    </config_b>
    <config_c>
        <setting_3>3</setting_3>
    </config_c>
</clickhouse>
```

および

```xml title="config.d/other_config.xml"
<clickhouse>
    <config_a>
        <setting_4>4</setting_4>
    </config_a>
    <config_b replace="replace">
        <setting_5>5</setting_5>
    </config_b>
    <config_c remove="remove">
        <setting_6>6</setting_6>
    </config_c>
</clickhouse>
```

マージによって生成される設定ファイルは次のとおりです。

```xml
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
        <setting_4>4</setting_4>
    </config_a>
    <config_b>
        <setting_5>5</setting_5>
    </config_b>
</clickhouse>
```

### 環境変数および ZooKeeper ノードによる置換 \{#from_env_zk\}

要素の値を環境変数の値で置き換えることを指定するには、属性 `from_env` を使用できます。

たとえば、環境変数 `$MAX_QUERY_SIZE` に `150000` が設定されている場合：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

最終的な設定は次のとおりです：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同様のことは `from_zk`（ZooKeeper ノード）を使用しても行えます。

```xml
<clickhouse>
    <postgresql_port from_zk="/zk_configs/postgresql_port"/>
</clickhouse>
```

```shell
# clickhouse-keeper-client
/ :) touch /zk_configs
/ :) create /zk_configs/postgresql_port "9005"
/ :) get /zk_configs/postgresql_port
9005
```

その結果、設定は次のようになります。

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 \{#default-values\}

`from_env` または `from_zk` 属性を持つ要素には、追加で `replace="1"` 属性を指定できます（この属性は `from_env` / `from_zk` より前に記述する必要があります）。
この場合、その要素でデフォルト値を定義できます。
環境変数または ZooKeeper ノードが設定されていればその値を使用し、設定されていなければデフォルト値を使用します。

前の例を繰り返しますが、ここでは `MAX_QUERY_SIZE` が設定されていないと仮定します：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

すると、設定は次のようになります。

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## ファイル内容による置換 \{#substitution-with-file-content\}

設定の一部をファイルの内容で置き換えることも可能です。これは次の 2 つの方法で行えます。

* *値の置換*: 要素が `incl` 属性を持つ場合、その値は参照先ファイルの内容で置き換えられます。デフォルトでは、置換を定義したファイルへのパスは `/etc/metrika.xml` です。これはサーバー設定内の [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 要素で変更できます。置換値はこのファイル内の `/clickhouse/substitution_name` 要素に指定します。`incl` で指定した置換が存在しない場合、その情報はログに記録されます。欠落した置換について ClickHouse がログ出力しないようにするには、属性 `optional="true"` を指定します（例えば、[macros](../operations/server-configuration-parameters/settings.md#macros) 用の設定など）。
* *要素の置換*: 要素全体を置換で差し替えたい場合は、要素名として `include` を使用します。要素名 `include` は属性 `from_zk = "/path/to/node"` と組み合わせることができます。この場合、要素の値は `/path/to/node` にある ZooKeeper ノードの内容で置き換えられます。これは、XML のサブツリー全体を 1 つの ZooKeeper ノードとして保存している場合にも機能し、そのサブツリーは元の要素に完全に挿入されます。

その例を以下に示します。

```xml
<clickhouse>
    <!-- Appends XML subtree found at `/profiles-in-zookeeper` ZK path to `<profiles>` element. -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- Replaces `include` element with the subtree found at `/users-in-zookeeper` ZK path. -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

既存の設定に追記するのではなく、include で差し込む内容を既存の設定とマージしたい場合は、属性 `merge="true"` を使用できます。たとえば、`<include from_zk="/some_path" merge="true">` のように指定します。この場合、既存の設定は include で読み込まれる内容とマージされ、既存の設定値は読み込まれた側の値で置き換えられます。

## 設定の暗号化と秘匿 \{#encryption\}

共通鍵暗号を使用して、平文のパスワードや秘密鍵などの設定要素を暗号化できます。
そのためには、まず [encryption codec](../sql-reference/statements/create/table.md#encryption-codecs) を設定し、その後、暗号化する要素に対して属性 `encrypted_by` を追加し、その値として暗号化コーデックの名前を指定します。

属性 `from_zk`、`from_env`、`incl` や要素 `include` とは異なり、前処理後のファイルでは値の置換（つまり暗号化された値の復号）は行われません。
復号はサーバープロセスの実行時にのみ行われます。

例:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex>00112233445566778899aabbccddeeff</key_hex>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

属性 [`from_env`](#from_env_zk) および [`from_zk`](#from_env_zk) は、`encryption_codecs` に対しても適用できます。

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_env="CLICKHOUSE_KEY_HEX"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

暗号鍵と暗号化された値は、どちらの設定ファイルでも定義できます。

`config.xml` の例を次に示します：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

`users.xml` の例を次に示します。

```xml
<clickhouse>

    <users>
        <test_user>
            <password encrypted_by="AES_128_GCM_SIV">96280000000D000000000030D4632962295D46C6FA4ABF007CCEC9C1D0E19DA5AF719C1D9A46C446</password>
            <profile>default</profile>
        </test_user>
    </users>

</clickhouse>
```

値を暗号化するには、例として `encrypt_decrypt` プログラムを使用できます。

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された設定要素を使用していても、前処理後の設定ファイルには暗号化された要素がそのまま表示されます。
これが ClickHouse のデプロイメントにとって問題となる場合は、次の 2 つの代替手段があります。前処理後のファイルのファイルパーミッションを 600 に設定するか、属性 `hide_in_preprocessed` を使用します。

例:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## ユーザー設定 \{#user-settings\}

`config.xml` ファイルでは、ユーザー設定、プロファイル、およびクォータを含む別の設定ファイルを指定できます。この設定ファイルへの相対パスは `users_config` 要素で設定します。デフォルトでは `users.xml` が使用されます。`users_config` が省略された場合、ユーザー設定、プロファイル、およびクォータは `config.xml` 内で直接指定されます。

ユーザー設定は、`config.xml` および `config.d/` と同様に、個別のファイルに分割できます。
ディレクトリ名は、`.xml` 接尾辞を除いた `users_config` 設定値に `.d` を連結したものとして定義されます。
`users_config` のデフォルトが `users.xml` であるため、デフォルトでは `users.d` ディレクトリが使用されます。

設定ファイルは、まず設定値を考慮して[マージ](#merging)され、その後に include が処理される点に注意してください。

## XML の例 \{#example\}

例えば、各ユーザーごとにこのように個別の設定ファイルを用意できます：

```bash
$ cat /etc/clickhouse-server/users.d/alice.xml
```

```xml
<clickhouse>
    <users>
      <alice>
          <profile>analytics</profile>
            <networks>
                  <ip>::/0</ip>
            </networks>
          <password_sha256_hex>...</password_sha256_hex>
          <quota>analytics</quota>
      </alice>
    </users>
</clickhouse>
```

## YAML の例 \{#example-1\}

ここでは、YAML で記述されたデフォルト設定を確認できます: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouse の設定においては、YAML 形式と XML 形式ではいくつかの違いがあります。
YAML 形式で設定を書く際のヒントを以下に示します。

テキスト値を持つ XML タグは、YAML のキーと値のペアで表現されます。

```yaml
key: value
```

対応する XML:

```xml
<key>value</key>
```

ネストされた XML ノードは YAML マップとして表現されます。

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

対応するXML:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

同じ XML タグを複数回作成するには、YAML シーケンスを使用します。

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

対応するXML：

```xml
<seq_key>val1</seq_key>
<seq_key>val2</seq_key>
<seq_key>
    <key1>val3</key1>
</seq_key>
<seq_key>
    <map>
        <key2>val4</key2>
        <key3>val5</key3>
    </map>
</seq_key>
```

XML の属性を指定するには、`@` プレフィックス付きの属性キー名を使用できます。`@` は YAML 標準で予約済みなので、必ずダブルクォーテーションで囲む必要があります。

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

対応するXML:

```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

YAML のシーケンス内でも属性を使用できます：

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

対応する XML：

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

前述の構文では、XML 属性を持つ XML テキストノードを YAML として表現することはできません。この特殊なケースには、
`#text` 属性キーを使用します。

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

対応するXML：

```xml
<map_key attr1="value1">value2</map>
```

## 実装の詳細 \{#implementation-details\}

各設定ファイルごとに、サーバーは起動時に `file-preprocessed.xml` ファイルも生成します。これらのファイルには、すべての置換と上書きが反映された結果が含まれており、参照用として利用されることを想定しています。設定ファイル内で ZooKeeper による置換が使われているにもかかわらず、サーバー起動時に ZooKeeper が利用できない場合、サーバーはこの前処理済みファイルから設定を読み込みます。

サーバーは、設定ファイルに加え、置換および上書きを行う際に使用されたファイルや ZooKeeper ノードの変更も追跡し、ユーザーおよびクラスタ用の設定を即時に再読み込みします。これにより、サーバーを再起動することなく、クラスタとユーザーおよびその設定を変更できます。
