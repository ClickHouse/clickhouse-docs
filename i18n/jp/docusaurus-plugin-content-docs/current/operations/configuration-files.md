---
description: 'このページでは、ClickHouseサーバーがXMLまたはYAML構文の構成ファイルでどのように構成できるかについて説明します。'
sidebar_label: '設定ファイル'
sidebar_position: 50
slug: '/operations/configuration-files'
title: 'Configuration Files'
---



:::note
現在、XMLベースの設定プロファイルおよび構成ファイルはClickHouse Cloudではサポートされていません。そのため、ClickHouse Cloudではconfig.xmlファイルは見つかりません。代わりに、SQLコマンドを使用して設定を管理する必要があります。

詳細については、["設定の構成"](/manage/settings)を参照してください。
:::

ClickHouseサーバーは、XMLまたはYAML構文の構成ファイルを使用して構成できます。
ほとんどのインストールタイプでは、ClickHouseサーバーはデフォルトの構成ファイルとして`/etc/clickhouse-server/config.xml`を使用しますが、起動時にコマンドラインオプション`--config-file`または`-C`を使用して手動で構成ファイルの場所を指定することも可能です。
追加の構成ファイルは、メインの構成ファイルに対して相対的に`config.d/`ディレクトリ内に配置できます。たとえば、`/etc/clickhouse-server/config.d/`ディレクトリです。
このディレクトリ内のファイルとメイン構成は、ClickHouseサーバーで構成が適用される前の前処理ステップでマージされます。
構成ファイルはアルファベット順にマージされます。
更新を簡素化し、モジュール化を改善するために、デフォルトの`config.xml`ファイルを変更せずに、追加のカスタマイズを`config.d/`に配置することが最良のプラクティスです。
ClickHouse keeperの構成は`/etc/clickhouse-keeper/keeper_config.xml`にあります。
したがって、追加のファイルは`/etc/clickhouse-keeper/keeper_config.d/`に配置する必要があります。

XMLとYAMLの構成ファイルを混在させることが可能で、たとえば、メインの構成ファイル`config.xml`と追加の構成ファイル`config.d/network.xml`、`config.d/timezone.yaml`、および`config.d/keeper.yaml`を持つことができます。
単一の構成ファイル内でXMLとYAMLを混在させることはサポートされていません。
XML構成ファイルは、最上位タグとして`<clickhouse>...</clickhouse>`を使用する必要があります。
YAML構成ファイルでは、`clickhouse:`はオプションであり、欠如している場合、パーサーが自動的に挿入します。

## 構成のマージ {#merging}

2つの構成ファイル（通常、メインの構成ファイルと`config.d/`からの別の構成ファイル）は、以下のようにマージされます。

- もしノード（すなわち、要素へのパス）が両方のファイルに存在し、属性`replace`または`remove`がない場合、それはマージされた構成ファイルに含まれ、両方のノードからの子要素が含まれ、再帰的にマージされます。
- 両方のノードのいずれかに属性`replace`が含まれている場合、マージされた構成ファイルに含まれますが、`replace`属性を持つノードの子要素のみが含まれます。
- 両方のノードのいずれかに属性`remove`が含まれている場合、そのノードはマージされた構成ファイルには含まれません（すでに存在する場合は削除されます）。

例:


```xml
<!-- config.xml -->
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

と

```xml
<!-- config.d/other_config.xml -->
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

マージされた構成ファイルは次のようになります：

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

### 環境変数およびZooKeeperノードによる代入 {#from_env_zk}

要素の値を環境変数の値で置き換える必要があることを指定するには、属性`from_env`を使用できます。

例として、`$MAX_QUERY_SIZE = 150000`の場合：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

これは次のように等しいです：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同様に`from_zk`（ZooKeeperノード）を使用しても可能です：

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

これは次のように等しいです：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 {#default-values}

`from_env`または`from_zk`属性を持つ要素は、追加で属性`replace="1"`を持つことができます（後者は`from_env`/`from_zk`より前に現れる必要があります）。
この場合、要素はデフォルト値を定義することができます。
要素は、環境変数またはZooKeeperノードの値を取得しますが、セットされていない場合はデフォルト値を使用します。

前の例では、`MAX_QUERY_SIZE`が設定されていないと仮定します：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

結果：

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

構成の一部をファイルの内容で置き換えることも可能です。これには2つの方法があります：

- *値の代入*: 要素が属性`incl`を持つ場合、その値は参照されたファイルの内容で置き換えられます。デフォルトでは、置換を行うファイルへのパスは`/etc/metrika.xml`です。これはサーバーの設定で[include_from](../operations/server-configuration-parameters/settings.md#include_from)要素で変更することができます。置換の値はこのファイル内の`/clickhouse/substitution_name`要素で指定されます。`incl`で指定された置換が存在しない場合、ログに記録されます。ClickHouseが不足している置換をログに記録しないようにするには、属性`optional="true"`を指定します（たとえば、[マクロ](../operations/server-configuration-parameters/settings.md#macros)の設定など）。

- *要素の代入*: 要素全体を置換で置き換えたい場合は、`include`という要素名を使用します。要素名`include`は、属性`from_zk = "/path/to/node"`と組み合わせることができます。この場合、要素の値は`/path/to/node`にあるZooKeeperノードの内容で置き換えられます。これにより、ZooKeeperノードとしてXMLサブツリー全体を保存している場合、それは元の要素に完全に挿入されます。

例：

```xml
<clickhouse>
    <!-- `/profiles-in-zookeeper` ZKパスに見つかったXMLサブツリーを`<profiles>`要素に追加します。 -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- `<include>`要素を`/users-in-zookeeper` ZKパスに見つかったサブツリーで置き換えます。 -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

置換対象の内容を既存の構成とマージする代わりに追加したい場合は、属性`merge="true"`を使用できます。たとえば：`<include from_zk="/some_path" merge="true">`のように。これにより、既存の構成が置換の内容とマージされ、既存の構成設定は置換からの値に置き換えられます。

## 構成の暗号化と隠蔽 {#encryption}

対称暗号化を使用して構成要素を暗号化できます。たとえば、平文のパスワードや秘密鍵などです。
これを行うには、まず[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を構成し、その後、暗号化する要素に対して、暗号化コーデックの名前を値として持つ属性`encrypted_by`を追加します。

属性`from_zk`、`from_env`および`incl`、または要素`include`とは異なり、前処理されたファイル内では代入（すなわち、暗号化された値の復号）は行われません。
復号は、サーバープロセスの実行時にのみ行われます。

例：

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

属性[from_env](#from_env_zk)および[from_zk](#from_env_zk)は```encryption_codecs```にも適用できます：
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

暗号化キーと暗号化された値は、どちらの構成ファイルにも定義できます。

例`config.xml`：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

例`users.xml`：

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

値を暗号化するには、（例）プログラム`encrypt_decrypt`を使用できます：

例：

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された構成要素でも、暗号化された要素は前処理された構成ファイル内に表示されます。
これがあなたのClickHouseデプロイメントにとって問題である場合、2つの代替案があります。前処理されたファイルのファイル権限を600に設定するか、属性`hide_in_preprocessed`を使用します。

例：

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## ユーザー設定 {#user-settings}

`config.xml`ファイルは、ユーザー設定、プロファイル、およびクォータのための別の構成を指定できます。この構成への相対パスは`users_config`要素で設定されます。デフォルトでは、`users.xml`です。`users_config`が省略されると、ユーザー設定、プロファイル、およびクォータは直接`config.xml`に指定されます。

ユーザー構成は、`config.xml`および`config.d/`と同様に、別々のファイルに分割できます。
ディレクトリ名は、`.xml`の接尾辞を持たず、`.d`が連結された`users_config`設定として定義されます。
ディレクトリ`users.d`がデフォルトで使用され、`users_config`のデフォルトは`users.xml`です。

構成ファイルは、最初に[マージ](#merging)されて設定が考慮され、包含がその後で処理されることに注意してください。

## XML例 {#example}

たとえば、次のように各ユーザーのための別々の構成ファイルを持つことができます：

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

ここでは、YAMLで書かれたデフォルト構成が確認できます：[config.yaml.example](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

YAMLとXML形式のClickHouse構成にはいくつかの違いがあります。YAML形式で構成を書くためのいくつかのヒントを以下に示します。

テキスト値を持つXMLタグは、YAMLのキーと値のペアで表現されます
```yaml
key: value
```

対応するXML：
```xml
<key>value</key>
```

ネストされたXMLノードはYAMLのマップで表現されます：
```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

対応するXML：
```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

同じXMLタグを複数回作成するには、YAMLシーケンスを使用します：
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

XML属性を提供するには、`@`プレフィックスを持つ属性キーを使用できます。`@`はYAML標準で予約されているため、二重引用符で囲む必要があります：
```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

対応するXML：
```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

YAMLシーケンス内でも属性を使用することが可能です：
```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

対応するXML：
```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

前述の構文では、XML属性を持つXMLテキストノードをYAMLで表現することはできません。この特別なケースは、`#text`属性キーを使用することで達成できます：
```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

対応するXML：
```xml
<map_key attr1="value1">value2</map_key>
```

## 実装詳細 {#implementation-details}

各構成ファイルに対して、サーバーは起動時に`file-preprocessed.xml`ファイルも生成します。これらのファイルには、すべての完了した置換とオーバーライドが含まれており、情報提供用に意図されています。構成ファイルでZooKeeper置換が使用されているが、サーバー起動時にZooKeeperが利用できない場合、サーバーはプレ処理されたファイルから構成を読み込みます。

サーバーは、構成ファイルの変更、ならびに置換とオーバーライドを実行する際に使用されたファイルやZooKeeperノードを追跡し、ユーザーやクラスターの設定をオンザフライで再読み込みします。これは、サーバーを再起動せずにクラスター、ユーザー、およびその設定を変更できることを意味します。
