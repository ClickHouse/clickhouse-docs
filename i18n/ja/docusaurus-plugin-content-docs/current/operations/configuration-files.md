---
slug: /operations/configuration-files
sidebar_position: 50
sidebar_label: 設定ファイル
title: 設定ファイル
---

:::note
現在、XMLベースの設定プロファイルおよび設定ファイルはClickHouse Cloudではサポートされていないため、ClickHouse Cloudではconfig.xmlファイルは存在しません。その代わりに、SQLコマンドを使用して設定プロファイルを通じて設定を管理する必要があります。

詳細については、["設定の構成"](/manage/settings)を参照してください。
:::

ClickHouseサーバーは、XMLまたはYAML構文の設定ファイルで構成できます。
ほとんどのインストールタイプでは、ClickHouseサーバーは、デフォルトの設定ファイルの`/etc/clickhouse-server/config.xml`で実行されますが、サーバーの起動時にコマンドラインオプション `--config-file` または `-C` を使用して設定ファイルの場所を手動で指定することも可能です。
追加の設定ファイルは、メイン設定ファイルに相対的に`config.d/`ディレクトリに配置できます。たとえば、 `/etc/clickhouse-server/config.d/`ディレクトリに配置することができます。
このディレクトリ内のファイルとメイン設定ファイルは、ClickHouseサーバーで設定が適用される前の前処理ステップでマージされます。
設定ファイルはアルファベット順にマージされます。
更新を簡単にし、モジュール化を改善するために、デフォルトの`config.xml`ファイルは変更せずに、追加のカスタマイズを`config.d/`に配置するのがベストプラクティスです。
ClickHouseキーパーの設定は`/etc/clickhouse-keeper/keeper_config.xml`にあります。
したがって、追加のファイルは`/etc/clickhouse-keeper/keeper_config.d/`に配置する必要があります。

XMLとYAMLの設定ファイルを混在させることが可能で、たとえば、メイン設定ファイル`config.xml`と追加の設定ファイル`config.d/network.xml`、`config.d/timezone.yaml`、`config.d/keeper.yaml`を持つことができます。
単一の設定ファイル内でXMLとYAMLを混在させることはサポートされていません。
XML設定ファイルは、トップレベルタグとして`<clickhouse>...</clickhouse>`を使用する必要があります。
YAML設定ファイルでは、`clickhouse:`はオプションですが、存在しない場合は、パーサーが自動的に挿入します。

## 設定のマージ {#merging}

二つの設定ファイル（通常はメイン設定ファイルと`config.d/`の別の設定ファイル）は次のようにマージされます：

- ノード（つまり要素へのパス）が両方のファイルに存在し、属性`replace`や`remove`を持たない場合、それはマージされた設定ファイルに含まれ、両方のノードの子が再帰的に含まれてマージされます。
- 両方のノードのうち一方が属性`replace`を持つ場合、それはマージされた設定ファイルに含まれますが、属性`replace`を持つノードの子だけが含まれます。
- 両方のノードのうち一方が属性`remove`を持つ場合、そのノードはマージされた設定ファイルに含まれません（すでに存在する場合は削除されます）。

例：

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

および

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

生成されたマージされた設定ファイル：

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

### 環境変数およびZooKeeperノードによる置換 {#from_env_zk}

要素の値を環境変数の値で置き換える必要があることを指定するには、属性`from_env`を使用できます。

例：`$MAX_QUERY_SIZE = 150000`の場合：

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

``` xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同様に、`from_zk`（ZooKeeperノード）を使用することも可能です：

``` xml
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

``` xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 {#default-values}

`from_env`または`from_zk`属性を持つ要素は、さらに`replace="1"`属性を持つことができます（後者は`from_env`/`from_zk`の前に表示される必要があります）。
この場合、要素はデフォルト値を定義できます。
要素は、環境変数やZooKeeperノードの値が設定されている場合はその値を取り、設定されていない場合はデフォルト値を取ります。

前の例ですが、`MAX_QUERY_SIZE`が設定されていないと仮定します：

``` xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

結果：

``` xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## ファイル内容での置換 {#substitution-with-file-content}

設定の一部をファイルの内容で置き換えることも可能です。これは二つの方法で行うことができます：

- *値の置換*：要素に属性`incl`がある場合、その値は参照されるファイルの内容に置き換えられます。デフォルトでは、置換のためのファイルへのパスは`/etc/metrika.xml`です。これは、サーバー設定内の[include_from](../operations/server-configuration-parameters/settings.md#include_from)要素で変更できます。置換値はこのファイル内の`/clickhouse/substitution_name`要素で指定されます。`incl`で指定された置換が存在しない場合、ログに記録されます。ClickHouseが不足している置換をログに記録しないようにするには、属性`optional="true"`を指定してください（たとえば[マクロ](../operations/server-configuration-parameters/settings.md#macros)の設定）。

- *要素の置換*：置換で要素全体を置き換えたい場合、要素名として`include`を使用します。要素名`include`は、属性`from_zk = "/path/to/node"`と組み合わせることができます。この場合、要素の値は`/path/to/node`にあるZooKeeperノードの内容に置き換えられます。ZooKeeperノードとしてXMLのサブツリー全体を保存する場合、それはソース要素に完全に挿入されます。

例：

```xml
<clickhouse>
    <!-- `/profiles-in-zookeeper` ZKパスに見つかったXMLサブツリーを`<profiles>`要素に追加します。 -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- `include`要素を`/users-in-zookeeper` ZKパスに見つかったサブツリーで置き換えます。 -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

置換された内容を既存の設定に追加するのではなく、マージしたい場合は、属性`merge="true"`を使用できます。たとえば、`<include from_zk="/some_path" merge="true">`のようにします。この場合、既存の設定は置換からの内容とマージされ、既存の設定が置換からの値に置き換えられます。

## 設定の暗号化と隠蔽 {#encryption}

対称暗号化を使用して、設定要素（たとえば、平文のパスワードや秘密鍵）を暗号化できます。
そのためには、最初に[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を設定し、次に暗号化する要素に暗号化コーデックの名前を値として持つ属性`encrypted_by`を追加します。

属性`from_zk`、`from_env`、および`incl`、要素`include`とは異なり、事前処理されたファイル内では置換（すなわち、暗号化された値の復号）は行われません。
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

属性[from_env](#from_env_zk)および[from_zk](#from_env_zk)は、`encryption_codecs`にも適用できます：
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

暗号化キーと暗号化された値は、いずれの設定ファイルにも定義できます。

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

値を暗号化するには、（例）プログラム`encrypt_decrypt`を使用できます。

例：

``` bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

``` text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された設定要素を使用しても、暗号化された要素は依然として事前処理された設定ファイルに表示されます。
これがClickHouseのデプロイに問題である場合、2つの代替手段を提案します。事前処理されたファイルのファイル権限を600に設定するか、属性`hide_in_preprocessed`を使用してください。

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

`config.xml`ファイルは、ユーザー設定、プロファイル、およびクォータのための別の設定を指定できます。この設定への相対パスは、`users_config`要素内で設定されます。デフォルトでは`users.xml`です。`users_config`が省略されると、ユーザー設定、プロファイル、およびクォータは`config.xml`内で直接指定されます。

ユーザー設定は、`config.xml`および`config.d/`のように、別のファイルに分けることができます。
ディレクトリ名は、`.xml`の接尾辞なしで`users_config`設定として定義され、`.d`が付け加えられます。
デフォルトでは、`users.d`ディレクトリが使用され、`users_config`はデフォルトで`users.xml`です。

設定ファイルは最初に[マージ](#merging)され、設定が考慮され、その後にインクルードが処理されることに注意してください。

## XMLの例 {#example}

たとえば、各ユーザーに対して次のように別々の設定ファイルを持つことができます：

``` bash
$ cat /etc/clickhouse-server/users.d/alice.xml
```

``` xml
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

ここでは、YAMLで書かれたデフォルトの設定を見ることができます：[config.yaml.example](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouseの設定に関するYAMLとXMLフォーマットの違いがいくつかあります。YAMLフォーマットで設定を書くためのいくつかのヒントを以下に示します。

XMLタグのテキスト値はYAMLのキーと値のペアで表されます。
``` yaml
key: value
```

対応するXML：
``` xml
<key>value</key>
```

入れ子のXMLノードはYAMLのマップで表されます：
``` yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

対応するXML：
``` xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

同じXMLタグを複数回作成するには、YAMLのシーケンスを使用します：
``` yaml
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

XML属性を提供するには、`@`プレフィックスを使用して属性キーを使用できます。`@`はYAMLの標準で予約されているため、二重引用符で囲む必要があります：
``` yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

対応するXML：
``` xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

YAMLのシーケンスでも属性を使用できます：
``` yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

対応するXML：
``` xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

上述の構文では、XML属性を持つXMLテキストノードをYAMLとして表現できません。この特別なケースは、`#text`属性キーを使用して達成できます：
```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

対応するXML：
```xml
<map_key attr1="value1">value2</map>
```

## 実装の詳細 {#implementation-details}

各設定ファイルについて、サーバーは起動時に`file-preprocessed.xml`ファイルも生成します。これらのファイルには、すべての完成した置換とオーバーライドが含まれており、情報提供用を目的としています。設定ファイルでZooKeeperの置換が使用されているが、サーバーの起動時にZooKeeperが利用できない場合、サーバーは事前処理されたファイルから設定を読み込みます。

サーバーは、設定ファイルの変更や、置換およびオーバーライドに使用されたファイルやZooKeeperノードの変更を追跡し、ユーザーとクラスターの設定を動的に再ロードします。これにより、サーバーを再起動することなく、クラスター、ユーザー、およびその設定を変更できます。
