---
description: 'このページでは、ClickHouseサーバーがXMLまたはYAML構文の構成ファイルで設定できる方法を説明します。'
sidebar_label: '構成ファイル'
sidebar_position: 50
slug: /operations/configuration-files
title: '構成ファイル'
---

:::note
XMLベースの設定プロファイルと構成ファイルは、現在ClickHouse Cloudではサポートされていないことに注意してください。したがって、ClickHouse Cloudではconfig.xmlファイルは見つかりません。代わりに、設定プロファイルを通じてSQLコマンドを使用して設定を管理する必要があります。

詳細については、["設定の構成"](/manage/settings)を参照してください。
:::

ClickHouseサーバーは、XMLまたはYAML構文の構成ファイルで設定できます。
ほとんどのインストールタイプでは、ClickHouseサーバーはデフォルトの構成ファイルとして`/etc/clickhouse-server/config.xml`を使用して実行されますが、コマンドラインオプション`--config-file`または`-C`を使用して手動で構成ファイルの場所を指定することも可能です。
追加の構成ファイルは、メインの構成ファイルに対して相対的に`config.d/`ディレクトリに配置できます。たとえば、`/etc/clickhouse-server/config.d/`ディレクトリに配置することができます。
このディレクトリ内のファイルとメイン構成は、ClickHouseサーバーで構成が適用される前に前処理ステップでマージされます。
構成ファイルはアルファベット順でマージされます。
更新を簡素化し、モジュール化を改善するために、デフォルトの`config.xml`ファイルを変更せずに、追加のカスタマイズを`config.d/`に配置することがベストプラクティスです。
ClickHouseケーパーの設定は`/etc/clickhouse-keeper/keeper_config.xml`に存在します。
したがって、追加のファイルは`/etc/clickhouse-keeper/keeper_config.d/`に配置する必要があります。

XMLとYAMLの構成ファイルを混在させることが可能です。たとえば、メイン構成ファイル`config.xml`や追加の構成ファイル`config.d/network.xml`、`config.d/timezone.yaml`、`config.d/keeper.yaml`を持つことができます。
単一の構成ファイル内でXMLとYAMLを混ぜることはサポートされていません。
XML構成ファイルは、`<clickhouse>...</clickhouse>`をトップレベルのタグとして使用する必要があります。
YAML構成ファイルでは、`clickhouse:`はオプションであり、省略した場合はパーサーが自動的に挿入します。

## 構成のマージ {#merging}

2つの構成ファイル（通常はメインの構成ファイルと`config.d/`からの別の構成ファイル）は、次のようにマージされます：

- ノード（すなわち、要素へのパス）が両方のファイルに存在し、属性`replace`または`remove`を持たない場合、それはマージされた構成ファイルに含まれ、両方のノードからの子要素が再帰的に含まれてマージされます。
- どちらか一方のノードに属性`replace`が含まれている場合、それはマージされた構成ファイルに含まれますが、`replace`属性を持つノードからの子要素のみが含まれます。
- どちらか一方のノードに属性`remove`が含まれている場合、そのノードはマージされた構成ファイルに含まれません（すでに存在している場合は削除されます）。

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

そして

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

生成されるマージされた構成ファイル：

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

### 環境変数とZooKeeperノードによる置き換え {#from_env_zk}

要素の値を環境変数の値で置き換える必要がある場合は、属性`from_env`を使用します。

例：`$MAX_QUERY_SIZE = 150000`のとき：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

これは次のように等しいです。

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同じことが`from_zk`（ZooKeeperノード）を使用しても可能です：

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

`from_env`または`from_zk`属性を持つ要素には、属性`replace="1"`を追加で持つことができます（後者は`from_env`/`from_zk`の前に現れなければなりません）。
この場合、要素はデフォルト値を定義することができます。
要素は、設定されていれば環境変数またはZooKeeperノードの値を取得し、そうでなければデフォルト値を取得します。

前の例ですが、`MAX_QUERY_SIZE`が設定されていないと仮定します：

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

## ファイル内容による置き換え {#substitution-with-file-content}

構成の一部をファイル内容で置き換えることも可能です。これは2つの方法で行うことができます：

- *値の置き換え*: 要素が属性`incl`を持つ場合、その値は参照されたファイルの内容で置き換えられます。デフォルトでは、置き換え用のファイルのパスは`/etc/metrika.xml`です。これはサーバー構成の[include_from](../operations/server-configuration-parameters/settings.md#include_from)要素で変更できます。置き換え値はこのファイルの`/clickhouse/substitution_name`要素で指定されます。`incl`で指定された置き換えが存在しない場合、ログに記録されます。ClickHouseが不足している置き換えをログに記録しないようにするには、属性`optional="true"`を指定します（たとえば、[マクロ](../operations/server-configuration-parameters/settings.md#macros)の設定など）。

- *要素の置き換え*: 置き換えで要素全体を置き換えたい場合は、要素名`include`を使用します。要素名`include`は、属性`from_zk = "/path/to/node"`と組み合わせることができます。この場合、要素の値はZooKeeperノード`/path/to/node`の内容で置き換えられます。完全なXMLサブツリーをZooKeeperノードとして保存する場合、それは元の要素に完全に挿入されます。

例：

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

置き換えたコンテンツを既存の構成に追加するのではなくマージしたい場合、属性`merge="true"`を使用できます。たとえば：`<include from_zk="/some_path" merge="true">`。この場合、既存の構成は置き換えからのコンテンツとマージされ、既存の構成設定は置き換えの値で置き換えられます。

## 構成の暗号化と隠蔽 {#encryption}

対称暗号化を使用して、構成要素を暗号化することができます。たとえば、プレーンテキストのパスワードや秘密鍵などです。
そのためには、まず[暗号化コーデック](../sql-reference/statements/create/table.md#encryption-codecs)を構成し、次に暗号化する要素に暗号化コーデックの名前を値として持つ属性`encrypted_by`を追加します。

属性`from_zk`、`from_env`、`incl`または要素`include`とは対照的に、置き換え（すなわち暗号化された値の復号）は前処理済みファイルでは実行されません。
復号は、サーバープロセスの実行時にのみ発生します。

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

属性[from_env](#from_env_zk)および[from_zk](#from_env_zk)は、```encryption_codecs```にも適用できます：
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

暗号化キーと暗号化された値は、構成ファイルのいずれかで定義できます。

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

暗号化された構成要素があっても、暗号化された要素は前処理された構成ファイルに依然として表示されます。
これがClickHouseデプロイメントにとって問題である場合、2つの代替手段を提案します：前処理されたファイルのファイル権限を600に設定するか、属性`hide_in_preprocessed`を使用します。

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

`config.xml`ファイルにはユーザー設定、プロファイル、およびクォータ用の別の構成を指定できます。この構成への相対パスは`users_config`要素で設定されます。デフォルトでは、`users.xml`です。`users_config`が省略されている場合、ユーザー設定、プロファイル、およびクォータは`config.xml`に直接指定されます。

ユーザー設定は`config.xml`および`config.d/`のように、別のファイルに分割することができます。
ディレクトリ名は、`.xml`の接尾辞を持たない`users_config`設定で定義され、`.d`が連結されます。
デフォルトでは`users.d`ディレクトリが使用され、`users_config`は`users.xml`にデフォルト設定されます。

構成ファイルは、最初に[マージ](#merging)されて設定を考慮し、それからインクルードが処理されることに注意してください。

## XMLの例 {#example}

たとえば、各ユーザーごとに別々の構成ファイルを次のように持つことができます：

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

YAMLで書かれたデフォルトの構成は次のようになります：[config.yaml.example](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

ClickHouse構成に関するYAMLとXML形式の間にはいくつかの違いがあります。YAML形式で構成を書くためのいくつかのヒントを以下に示します。

XMLタグのテキスト値はYAMLのキー・バリュー・ペアで表されます：
```yaml
key: value
```

対応するXML：
```xml
<key>value</key>
```

ネストされたXMLノードはYAMLマップで表されます：
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

XML属性を提供するには、`@`プレフィックスの属性キーを使用できます。注意点として、`@`はYAMLの標準によって予約されているので、ダブルクォートで囲む必要があります：
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

前述の構文は、XML属性を持つXMLテキストノードをYAMLで表現することを許可しません。この特別なケースは、`#text`属性キーを使用することで達成できます：
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

各構成ファイルについて、サーバーは起動時に`file-preprocessed.xml`ファイルも生成します。これらのファイルには、すべての完了した置き換えとオーバーライドが含まれ、情報用に意図されています。構成ファイルでZooKeeperの置き換えが使用されたが、サーバーの起動時にZooKeeperが利用できない場合、サーバーは前処理されたファイルから構成を読み込みます。

サーバーは、構成ファイル、置き換えとオーバーライドを行った際に使用されたファイルおよびZooKeeperノードの変更を追跡し、ユーザーやクラスターの設定を即座にリロードします。これは、サーバーを再起動することなく、クラスター、ユーザー、設定を変更できることを意味します。
