---
slug: /operations/configuration-files
sidebar_position: 50
sidebar_label: 構成ファイル
title: 構成ファイル
---

:::note
XMLベースの設定プロファイルと構成ファイルは、現在ClickHouse Cloudではサポートされていません。そのため、ClickHouse Cloudではconfig.xmlファイルは見つかりません。代わりに、SQLコマンドを使用して設定をSettings Profilesを通じて管理する必要があります。

詳細については、["設定の構成"](/manage/settings)を参照してください。
:::

ClickHouseサーバーは、XMLまたはYAML構文の構成ファイルで設定できます。ほとんどのインストールタイプでは、ClickHouseサーバーはデフォルトの構成ファイルとして`/etc/clickhouse-server/config.xml`で実行されますが、コマンドラインオプション`--config-file`または`-C`を使用して、サーバーの起動時に手動で構成ファイルの場所を指定することも可能です。追加の構成ファイルは、メイン構成ファイルに対して相対的なディレクトリ`config.d/`に配置できます。たとえば、`/etc/clickhouse-server/config.d/`ディレクトリに配置します。このディレクトリのファイルとメイン構成は、ClickHouseサーバーで構成が適用される前の前処理ステップでマージされます。構成ファイルはアルファベット順にマージされます。更新を簡素化し、モジュール化を改善するために、デフォルトの`config.xml`ファイルを変更せずに保ち、追加のカスタマイズを`config.d/`に配置することが最良の方法です。ClickHouse keeperの構成は、`/etc/clickhouse-keeper/keeper_config.xml`にあります。したがって、追加のファイルは`/etc/clickhouse-keeper/keeper_config.d/`に配置する必要があります。

XMLとYAMLの構成ファイルを混在させることが可能で、たとえばメイン構成ファイル`config.xml`と、追加の構成ファイル`config.d/network.xml`、`config.d/timezone.yaml`、および`config.d/keeper.yaml`を持つことができます。ただし、1つの構成ファイル内でXMLとYAMLを混在させることはサポートされていません。XML構成ファイルは`<clickhouse>...</clickhouse>`を最上位タグとして使用する必要があります。YAML構成ファイルでは、`clickhouse:`はオプションであり、欠落している場合はパーサーが自動的に挿入します。

## 構成のマージ {#merging}

2つの構成ファイル（通常はメイン構成ファイルと`config.d/`からの別の構成ファイル）は、次のようにマージされます。

- ノード（つまり、要素へのパス）が両方のファイルに現れ、属性`replace`または`remove`を持たない場合、それはマージされた構成ファイルに含まれ、両方のノードからの子が再帰的に含まれ、マージされます。
- 両方のノードの1つが属性`replace`を含む場合、マージされた構成ファイルに含まれますが、属性`replace`を持つノードからの子のみが含まれます。
- 両方のノードの1つが属性`remove`を含む場合、そのノードはマージされた構成ファイルに含まれません（既に存在する場合は削除されます）。

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

が生成するマージされた構成ファイル:

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

要素の値を環境変数の値で置き換える必要がある場合は、属性`from_env`を使用できます。

例: `$MAX_QUERY_SIZE = 150000` の場合:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

これは次と等しいです:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

ZooKeeperノードを使用しても同様です:

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

これは次と等しいです:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 {#default-values}

`from_env`または`from_zk`属性を持つ要素は、追加で属性`replace="1"`を持つ場合があります（後者は`from_env`/`from_zk`の前に現れる必要があります）。この場合、要素はデフォルト値を定義できます。要素は、設定されている場合は環境変数またはZooKeeperノードの値を取り、そうでない場合はデフォルト値を使用します。

前述の例ですが、`MAX_QUERY_SIZE`が設定されていない場合:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

結果:

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

構成の一部をファイルの内容で置き換えることも可能です。これには2つの方法があります。

- *値の置換*: 要素が属性`incl`を持つ場合、その値は参照されたファイルの内容に置き換えられます。置換用のファイルへのパスはデフォルトで`/etc/metrika.xml`です。これは、サーバー構成の[include_from](../operations/server-configuration-parameters/settings.md#include_from)要素で変更できます。置換値は、このファイルの`/clickhouse/substitution_name`要素で指定されています。`incl`で指定された置換が存在しない場合、それはログに記録されます。ClickHouseが欠落した置換をログに記録しないようにするには、属性`optional="true"`を指定します（たとえば、[マクロ](../operations/server-configuration-parameters/settings.md#macros)用設定など）。

- *要素の置換*: 要素全体を置換で置き換えたい場合は、要素名として`include`を使用します。要素名`include`は、属性`from_zk = "/path/to/node"`と組み合わせて使用することができます。この場合、要素値は`/path/to/node`のZooKeeperノードの内容に置き換えられます。ZooKeeperノードとしてXMLサブツリー全体を格納することも可能で、その場合はソース要素に完全に挿入されます。

例:

```xml
<clickhouse>
    <!-- `/profiles-in-zookeeper` ZKパスで見つかったXMLサブツリーを`<profiles>`要素に追加します。 -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- `include`要素を`/users-in-zookeeper` ZKパスで見つかったサブツリーで置き換えます。 -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

置換コンテンツを既存の構成とマージするのではなく追加するなら、属性`merge="true"`を使用できます。たとえば: `<include from_zk="/some_path" merge="true">`。この場合、既存の構成が置換からの内容とマージされ、既存の構成設定は置換からの値で置き換えられます。

## 構成の暗号化および隠蔽 {#encryption}

対称暗号を使用して構成要素を暗号化できます。たとえば、平文のパスワードや秘密鍵です。そのためには、最初に[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を構成し、次に暗号化する要素に暗号化コーデックの名前を値として`encrypted_by`属性を追加します。

属性`from_zk`、`from_env`、`incl`、または要素`include`とは異なり、事前処理ファイル内で置換（暗号化された値の復号）は実行されません。復号はサーバープロセスで実行時にのみ行われます。

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

属性[from_env](#from_env_zk)および[from_zk](#from_env_zk)は、```encryption_codecs```でも適用できます:
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

例 `config.xml`:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

例 `users.xml`:

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

値を暗号化するには、（例）プログラム`encrypt_decrypt`を使用できます:

例:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された構成要素があっても、暗号化された要素は事前処理された構成ファイルに依然として表示されます。これがClickHouseのデプロイに問題がある場合は、2つの代替案を提案します。事前処理されたファイルのファイル権限を600に設定するか、属性`hide_in_preprocessed`を使用してください。

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

`config.xml`ファイルは、ユーザー設定、プロファイル、およびクオータのための別の構成を指定できます。この構成への相対パスは`users_config`要素で設定されます。デフォルトでは`users.xml`です。`users_config`が省略されると、ユーザー設定、プロファイル、およびクオータは`config.xml`に直接指定されます。

ユーザー構成は、`config.xml`および`config.d/`と同様に別のファイルに分割できます。ディレクトリ名は、`.xml`の接尾辞なしで`users_config`設定として定義され、`.d`と連結されます。デフォルトではディレクトリ`users.d`が使用され、`users_config`は`users.xml`にデフォルトします。

設定ファイルはまず[マージ](#merging)されて設定を考慮した後、インクルードが処理されることに注意してください。

## XMLの例 {#example}

たとえば、各ユーザーのために別々の構成ファイルを次のように持つことができます:

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

ここでは、YAMLで書かれたデフォルトの構成を示します: [config.yaml.example](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouseの構成に関するYAMLとXMLフォーマットの違いがいくつかあります。ここでは、YAML形式で構成を書くためのいくつかのヒントを示します。

テキスト値を持つXMLタグは、YAMLのキー・バリューペアで表されます。
```yaml
key: value
```

対応するXML:
```xml
<key>value</key>
```

ネストされたXMLノードは、YAMLマップで表されます。
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

同じXMLタグを複数回作成するには、YAMLシーケンスを使用します。
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

XML属性を提供するには、`@`プレフィックスを持つ属性キーを使用できます。なお、`@`はYAML標準によって予約されているため、ダブルクォートで囲む必要があります。
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

YAMLシーケンスでも属性を使用することができます。
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

前述の構文では、XML属性を持つXMLテキストノードをYAMLとして表現することはできません。この特別なケースは、`#text`属性キーを使用することで実現できます。
```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

対応するXML:
```xml
<map_key attr1="value1">value2</map_key>
```

## 実装の詳細 {#implementation-details}

各構成ファイルについて、サーバーは起動時に`file-preprocessed.xml`ファイルも生成します。これらのファイルには、すべての完了した置換とオーバーライドが含まれており、情報用に使用されます。構成ファイルでZooKeeperの置換が使用されているが、サーバーが起動時にZooKeeperが使用できない場合、サーバーは事前処理されたファイルから構成をロードします。

サーバーは、置換やオーバーライドの実行時に使用された構成ファイル、ファイル、ZooKeeperノードに対する変更を追跡し、ユーザーやクラスターの設定を動的に再読み込みします。つまり、サーバーを再起動することなく、クラスター、ユーザー、およびその設定を変更することができます。
