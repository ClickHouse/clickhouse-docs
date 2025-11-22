---
description: 'このページでは、ClickHouse サーバーを XML または YAML 構文の設定ファイルでどのように設定できるかを説明します。'
sidebar_label: '設定ファイル'
sidebar_position: 50
slug: /operations/configuration-files
title: '設定ファイル'
doc_type: 'guide'
---

:::note
XML ベースの設定プロファイルおよび設定ファイルは ClickHouse Cloud ではサポートされていません。そのため、ClickHouse Cloud には config.xml ファイルは存在しません。代わりに、設定プロファイルを通じて設定を管理するために SQL コマンドを使用してください。

詳細については、["Configuring Settings"](/manage/settings) を参照してください。
:::

ClickHouse サーバーは、XML または YAML 構文の設定ファイルで設定できます。
ほとんどのインストール形態では、ClickHouse サーバーはデフォルトの設定ファイルとして `/etc/clickhouse-server/config.xml` を使用して実行されますが、サーバー起動時にコマンドラインオプション `--config-file` または `-C` を使用して、設定ファイルの場所を手動で指定することもできます。
追加の設定ファイルは、メインの設定ファイルからの相対パスで `config.d/` ディレクトリ、たとえば `/etc/clickhouse-server/config.d/` ディレクトリに配置できます。
このディレクトリ内のファイルとメインの設定ファイルは、ClickHouse サーバーで設定が適用される前の前処理ステップでマージされます。
設定ファイルはアルファベット順にマージされます。
更新を簡素化しモジュール性を高めるために、デフォルトの `config.xml` ファイルは変更せずに保持し、追加のカスタマイズは `config.d/` に配置することが推奨されるベストプラクティスです。
ClickHouse Keeper の設定は `/etc/clickhouse-keeper/keeper_config.xml` にあります。
同様に、Keeper 用の追加の設定ファイルは `/etc/clickhouse-keeper/keeper_config.d/` に配置する必要があります。

XML と YAML の設定ファイルを混在させることも可能です。たとえば、メインの設定ファイルを `config.xml` とし、追加の設定ファイルとして `config.d/network.xml`、`config.d/timezone.yaml`、`config.d/keeper.yaml` を置くことができます。
1 つの設定ファイル内で XML と YAML を混在させることはサポートされていません。
XML 設定ファイルでは、トップレベルタグとして `<clickhouse>...</clickhouse>` を使用する必要があります。
YAML 設定ファイルでは、`clickhouse:` は省略可能であり、省略された場合はパーサーによって自動的に挿入されます。



## 設定のマージ {#merging}

2つの設定ファイル(通常はメイン設定ファイルと`config.d/`ディレクトリ内の別の設定ファイル)は、以下のようにマージされます:

- ノード(要素へのパス)が両方のファイルに存在し、`replace`または`remove`属性を持たない場合、マージ後の設定ファイルに含まれ、両方のノードの子要素が再帰的にマージされます。
- 2つのノードのいずれかが`replace`属性を含む場合、マージ後の設定ファイルに含まれますが、`replace`属性を持つノードの子要素のみが含まれます。
- 2つのノードのいずれかが`remove`属性を含む場合、そのノードはマージ後の設定ファイルに含まれません(既に存在する場合は削除されます)。

例えば、次の2つの設定ファイルがある場合:

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

マージ後の設定ファイルは次のようになります:

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

### 環境変数とZooKeeperノードによる置換 {#from_env_zk}

要素の値を環境変数の値で置換するには、`from_env`属性を使用します。

例えば、環境変数`$MAX_QUERY_SIZE = 150000`の場合:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

結果の設定は次のようになります:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

`from_zk`(ZooKeeperノード)を使用して同様の置換が可能です:

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

結果として次の設定が得られます:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 {#default-values}

`from_env`または`from_zk`属性を持つ要素には、追加で`replace="1"`属性を指定できます(この属性は`from_env`/`from_zk`の前に記述する必要があります)。
この場合、要素にデフォルト値を定義できます。
環境変数またはZooKeeperノードが設定されている場合、要素はその値を取得し、設定されていない場合はデフォルト値を取得します。

前の例を繰り返しますが、`MAX_QUERY_SIZE`が設定されていない場合を想定します:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

結果として次の設定が得られます:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```


## ファイル内容による置換 {#substitution-with-file-content}

設定の一部をファイルの内容で置き換えることも可能です。これには2つの方法があります:

- _値の置換_: 要素が`incl`属性を持つ場合、その値は参照されたファイルの内容で置き換えられます。デフォルトでは、置換を含むファイルのパスは`/etc/metrika.xml`です。これはサーバー設定の[`include_from`](../operations/server-configuration-parameters/settings.md#include_from)要素で変更できます。置換値はこのファイル内の`/clickhouse/substitution_name`要素で指定されます。`incl`で指定された置換が存在しない場合、ログに記録されます。ClickHouseが欠落している置換をログに記録しないようにするには、`optional="true"`属性を指定します(例:[macros](../operations/server-configuration-parameters/settings.md#macros)の設定)。
- _要素の置換_: 要素全体を置換で置き換えたい場合は、要素名として`include`を使用します。要素名`include`は`from_zk = "/path/to/node"`属性と組み合わせることができます。この場合、要素の値は`/path/to/node`にあるZooKeeperノードの内容で置き換えられます。これはXMLサブツリー全体をZooKeeperノードとして保存する場合にも機能し、ソース要素に完全に挿入されます。

以下にその例を示します:

```xml
<clickhouse>
    <!-- `/profiles-in-zookeeper` ZKパスで見つかったXMLサブツリーを`<profiles>`要素に追加します。 -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- `/users-in-zookeeper` ZKパスで見つかったサブツリーで`include`要素を置き換えます。 -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

置換内容を追加するのではなく既存の設定とマージしたい場合は、`merge="true"`属性を使用できます。例:`<include from_zk="/some_path" merge="true">`。この場合、既存の設定は置換からの内容とマージされ、既存の設定値は置換からの値で置き換えられます。


## 設定の暗号化と非表示 {#encryption}

対称暗号化を使用して、平文のパスワードや秘密鍵などの設定要素を暗号化できます。
これを行うには、まず[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を設定し、次に暗号化する要素に暗号化コーデックの名前を値として持つ`encrypted_by`属性を追加します。

属性`from_zk`、`from_env`、`incl`、または要素`include`とは異なり、前処理されたファイルでは置換(すなわち暗号化された値の復号化)は実行されません。
復号化はサーバープロセスの実行時にのみ行われます。

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

属性[`from_env`](#from_env_zk)と[`from_zk`](#from_env_zk)は`encryption_codecs`にも適用できます:

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

暗号化キーと暗号化された値は、いずれかの設定ファイルで定義できます。

`config.xml`の例:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

`users.xml`の例:

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

値を暗号化するには、(例として)`encrypt_decrypt`プログラムを使用できます:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された設定要素を使用しても、暗号化された要素は前処理された設定ファイルに表示されます。
これがClickHouseのデプロイメントで問題となる場合、2つの代替手段があります:前処理されたファイルのファイル権限を600に設定するか、`hide_in_preprocessed`属性を使用します。

例:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```


## ユーザー設定 {#user-settings}

`config.xml`ファイルでは、ユーザー設定、プロファイル、クォータを含む別の設定ファイルを指定できます。この設定ファイルへの相対パスは`users_config`要素で設定します。デフォルトは`users.xml`です。`users_config`を省略した場合、ユーザー設定、プロファイル、クォータは`config.xml`に直接指定されます。

ユーザー設定は、`config.xml`と`config.d/`と同様に、複数のファイルに分割できます。
ディレクトリ名は、`users_config`設定から`.xml`接尾辞を除いたものに`.d`を連結して定義されます。
`users_config`のデフォルトが`users.xml`であるため、デフォルトでは`users.d`ディレクトリが使用されます。

設定ファイルは、まず設定を考慮して[マージ](#merging)され、その後にインクルードが処理されることに注意してください。


## XML の例 {#example}

例えば、次のように各ユーザーごとに個別の設定ファイルを用意できます:

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


## YAMLの例 {#example-1}

YAMLで記述されたデフォルト設定は以下で確認できます: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouseの設定において、YAMLとXML形式にはいくつかの違いがあります。
YAML形式で設定を記述する際のヒントを以下に示します。

テキスト値を持つXMLタグは、YAMLのキーと値のペアで表現されます

```yaml
key: value
```

対応するXML:

```xml
<key>value</key>
```

ネストされたXMLノードは、YAMLのマップで表現されます:

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

同じXMLタグを複数回作成するには、YAMLのシーケンスを使用します:

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

対応するXML:

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

XML属性を指定するには、`@`プレフィックスを持つ属性キーを使用できます。`@`はYAML標準で予約されているため、二重引用符で囲む必要があることに注意してください:

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

YAMLシーケンスで属性を使用することも可能です:

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

対応するXML:

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

前述の構文では、XML属性を持つXMLテキストノードをYAMLで表現することはできません。この特殊なケースは、`#text`属性キーを使用することで実現できます:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

対応するXML:

```xml
<map_key attr1="value1">value2</map>
```


## 実装の詳細 {#implementation-details}

各設定ファイルに対して、サーバーは起動時に `file-preprocessed.xml` ファイルを生成します。これらのファイルには、完了したすべての置換とオーバーライドが含まれており、情報参照用として提供されます。設定ファイルでZooKeeperの置換が使用されているものの、サーバー起動時にZooKeeperが利用できない場合、サーバーは前処理済みファイルから設定を読み込みます。

サーバーは、設定ファイルの変更、および置換とオーバーライドの実行時に使用されたファイルとZooKeeperノードを追跡し、ユーザーとクラスターの設定を動的に再読み込みします。これにより、サーバーを再起動せずに、クラスター、ユーザー、およびそれらの設定を変更することができます。
