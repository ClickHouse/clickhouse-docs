---
'description': 'このページでは、ClickHouse サーバーを XML または YAML 構文の設定ファイルでどのように構成できるかを説明します。'
'sidebar_label': '設定ファイル'
'sidebar_position': 50
'slug': '/operations/configuration-files'
'title': '設定ファイル'
'doc_type': 'guide'
---

:::note
XMLベースの設定プロファイルおよび構成ファイルは、ClickHouse Cloudではサポートされていません。したがって、ClickHouse Cloudでは config.xml ファイルは見つかりません。代わりに、設定プロファイルを通じて SQL コマンドを使用して設定を管理する必要があります。

詳細については、["設定の構成"](/manage/settings)を参照してください。
:::

ClickHouseサーバーは、XMLまたはYAML構文の構成ファイルを使用して構成できます。
ほとんどのインストールタイプでは、ClickHouseサーバーはデフォルト構成ファイルとして `/etc/clickhouse-server/config.xml` を使用しますが、コマンドラインオプション `--config-file` または `-C` を使用してサーバー起動時に構成ファイルの場所を手動で指定することも可能です。
追加の構成ファイルは、メインの構成ファイルに対して相対的に `config.d/` ディレクトリに配置できます。例えば、 `/etc/clickhouse-server/config.d/` ディレクトリです。
このディレクトリ内のファイルとメインの構成ファイルは、ClickHouseサーバーに構成が適用される前に前処理ステップでマージされます。
構成ファイルはアルファベット順でマージされます。
更新を簡素化し、モジュール性を向上させるために、デフォルトの `config.xml` ファイルは変更せず、追加のカスタマイズを `config.d/` に配置することがベストプラクティスです。
ClickHouse Keeperの構成は `/etc/clickhouse-keeper/keeper_config.xml` にあります。
同様に、Keeperの追加の構成ファイルは `/etc/clickhouse-keeper/keeper_config.d/` に配置する必要があります。

XMLファイルとYAMLファイルを混合することが可能で、例えばメインの構成ファイル `config.xml` と追加の構成ファイル `config.d/network.xml`、`config.d/timezone.yaml`、`config.d/keeper.yaml` を持つことができます。
単一の構成ファイル内でXMLとYAMLを混合することはサポートされていません。
XML構成ファイルは、最上位のタグとして `<clickhouse>...</clickhouse>` を使用する必要があります。
YAML構成ファイルでは、`clickhouse:` はオプションであり、存在しない場合はパーサーが自動的に挿入します。

## 構成のマージ {#merging}

2つの構成ファイル（通常はメインの構成ファイルと `config.d/` からの別の構成ファイル）は、次のようにマージされます：

- ノード（つまり、要素へのパス）が両方のファイルに存在し、属性 `replace` または `remove` を持たない場合、それはマージされた構成ファイルに含まれ、両方のノードの子が含まれ、再帰的にマージされます。
- 2つのノードのうちの1つが `replace` 属性を持っている場合、それはマージされた構成ファイルに含まれますが、属性 `replace` を持つノードの子のみが含まれます。
- 2つのノードのうちの1つが `remove` 属性を持っている場合、そのノードはマージされた構成ファイルには含まれません（すでに存在する場合は削除されます）。

例えば、2つの構成ファイルが与えられた場合：

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

と

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

結果として得られるマージされた構成ファイルは次のようになります：

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

要素の値を環境変数の値に置き換える必要があることを指定するには、属性 `from_env` を使用します。

例えば、環境変数 `$MAX_QUERY_SIZE = 150000` で：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

結果の構成は次のようになります：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同様に、`from_zk`（ZooKeeperノード）を使用することも可能です：

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

次の構成になります：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### デフォルト値 {#default-values}

`from_env` または `from_zk` 属性を持つ要素には、追加で属性 `replace="1"` を持たせることができます（後者は `from_env`/`from_zk` の前に現れる必要があります）。
この場合、要素はデフォルト値を定義できます。
要素は、設定されていれば環境変数またはZooKeeperノードの値を取ります。そうでなければデフォルト値を取ります。

前の例を繰り返しますが、`MAX_QUERY_SIZE` が設定されていない場合を仮定します：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

結果の構成は：

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

構成の一部をファイル内容で置き換えることも可能です。これは次の2つの方法で行うことができます：

- *値の置換*: 要素が属性 `incl` を持つ場合、その値は参照されたファイルの内容に置き換えられます。デフォルトで、置換のためのファイルへのパスは `/etc/metrika.xml` です。これは、サーバー構成の [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 要素で変更できます。置換値は、このファイル内の `/clickhouse/substitution_name` 要素で指定されます。`incl` で指定された置換が存在しない場合、それはログに記録されます。ClickHouseが欠けた置換をログに記録しないようにするには、属性 `optional="true"` を指定します（例えば、[マクロ](../operations/server-configuration-parameters/settings.md#macros)のための設定）。
- *要素の置換*: 置換で全体の要素を置き換えたい場合は、要素名として `include` を使用します。要素名 `include` は、属性 `from_zk = "/path/to/node"` と組み合わせることができます。この場合、要素の値は `/path/to/node` のZooKeeperノードの内容に置き換えられます。XMLの全体のサブツリーをZooKeeperノードとして保存している場合、それは元の要素に完全に挿入されます。

この例を以下に示します：

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

既存の構成に置換の内容を追加するのではなく、マージしたい場合は、属性 `merge="true"` を使用できます。例えば：`<include from_zk="/some_path" merge="true">`。この場合、既存の構成は置換からの内容とマージされ、既存の構成設定は置換からの値で置き換えられます。

## 構成の暗号化と非表示 {#encryption}

対称暗号化を使用して構成要素を暗号化できます。例えば、プレーンテキストのパスワードや秘密鍵です。
そのためには、まず[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を構成し、次に暗号化する要素に暗号化コーデックの名前を値として `encrypted_by` 属性を追加します。

`from_zk`、`from_env` および `incl` 属性や要素 `include` とは異なり、事前処理ファイルでは置換（つまり、暗号化された値の復号化）は行われません。
復号化は、サーバープロセスの実行時にのみ行われます。

例えば：

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

属性 [`from_env`](#from_env_zk) と [`from_zk`](#from_env_zk) は、`encryption_codecs` にも適用できます：

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

暗号化キーと暗号化された値は、任意の構成ファイルで定義できます。

`config.xml` の例は次のとおりです：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

`users.xml` の例は次のとおりです：

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

値を暗号化するには、（例の）プログラム `encrypt_decrypt` を使用できます：

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

暗号化された構成要素があっても、暗号化された要素は事前処理された構成ファイルにまだ表示されます。
これがClickHouseのデプロイメントにとって問題である場合、2つの代替手段があります：事前処理ファイルのファイル権限を600に設定するか、属性 `hide_in_preprocessed` を使用します。

例えば：

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## ユーザー設定 {#user-settings}

`config.xml` ファイルは、ユーザー設定、プロファイル、およびクォータのための別の構成を指定できます。この構成への相対パスは `users_config` 要素で設定します。デフォルトでは `users.xml` です。`users_config` が省略された場合、ユーザー設定、プロファイル、およびクォータは `config.xml` に直接指定されます。

ユーザー構成は `config.xml` や `config.d/` のように、別々のファイルに分割することができます。
ディレクトリ名は `.xml` 接尾辞を付けずに `users_config` 設定として定義され、その後に `.d` が続きます。
ディレクトリ `users.d` はデフォルトで使用され、`users_config` は `users.xml` にデフォルト設定されています。

構成ファイルはまず設定を考慮して[マージ](#merging)され、次にインクルードが処理されることに注意してください。

## XMLの例 {#example}

例えば、次のように各ユーザー用の別の構成ファイルを持つことができます：

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

ここに、YAMLで書かれたデフォルト構成を見ることができます：[`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouse構成に関してYAMLとXML形式の違いがあります。
YAML形式での構成を書くためのヒントが以下に示されています。

テキスト値を持つXMLタグは、YAMLのキーと値のペアで表されます。

```yaml
key: value
```

対応するXML：

```xml
<key>value</key>
```

ネストされたXMLノードはYAMLのマップで表されます：

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

同じXMLタグを複数回作成するには、YAMLのシーケンスを使用します：

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

XML属性を提供するには、`@` プレフィックスを持つ属性キーを使用できます。注意すべき点は、`@` はYAML標準で予約されているため、二重引用符で囲む必要があることです：

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

YAMLシーケンス内でも属性を使用することができます：

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

前述の構文では、XML属性を持つXMLテキストノードをYAMLで表現することはできません。この特別なケースは、`#text` 属性キーを使用することで実現できます：

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

各構成ファイルについて、サーバーは起動時に `file-preprocessed.xml` ファイルも生成します。これらのファイルには、すべての完了した置換とオーバーライドが含まれており、情報提供の目的で使用されます。構成ファイルでZooKeeperの置換が使用されているが、サーバー起動時にZooKeeperが利用できない場合、サーバーは事前処理されたファイルから構成を読み込みます。

サーバーは、構成ファイルの変更を追跡し、置換およびオーバーライドの実行時に使用されたZooKeeperノードおよびファイルの変更を追跡し、ユーザーとクラスターの設定をその場で再読み込みします。これにより、サーバーを再起動せずにクラスター、ユーザー、そしてその設定を変更できるようになります。
