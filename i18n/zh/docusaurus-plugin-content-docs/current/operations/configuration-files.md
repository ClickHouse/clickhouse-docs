---
'description': '此页面解释了如何使用 XML 或 YAML 语法配置 ClickHouse 服务器的配置文件。'
'sidebar_label': '配置文件'
'sidebar_position': 50
'slug': '/operations/configuration-files'
'title': '配置文件'
'doc_type': 'guide'
---

:::note
基于XML的设置文件和配置文件不支持ClickHouse Cloud。因此，在ClickHouse Cloud中，您不会找到config.xml文件。相反，您应该使用SQL命令通过设置文件来管理设置。

有关更多详细信息，请参见["配置设置"](/manage/settings)
:::

ClickHouse服务器可以使用XML或YAML语法的配置文件进行配置。
在大多数安装类型中，ClickHouse服务器默认使用`/etc/clickhouse-server/config.xml`作为配置文件，但也可以在服务器启动时使用命令行选项`--config-file`或`-C`手动指定配置文件的位置。
额外的配置文件可以放置在相对于主配置文件的`config.d/`目录中，例如放在`/etc/clickhouse-server/config.d/`目录中。
该目录中的文件与主配置在配置应用到ClickHouse服务器之前的预处理步骤中合并。
配置文件按字母顺序合并。
为了简化更新并改善模块化，最佳实践是保持默认`config.xml`文件不被修改，并将额外的自定义放入`config.d/`中。
ClickHouse keeper的配置位于`/etc/clickhouse-keeper/keeper_config.xml`。
类似地，Keeper的额外配置文件需要放置在`/etc/clickhouse-keeper/keeper_config.d/`中。

可以混合使用XML和YAML配置文件，例如，您可以有一个主配置文件`config.xml`和额外的配置文件`config.d/network.xml`、`config.d/timezone.yaml`和`config.d/keeper.yaml`。
不支持在单个配置文件中混合XML和YAML。
XML配置文件应使用`<clickhouse>...</clickhouse>`作为顶部标签。
在YAML配置文件中，`clickhouse:`是可选的，如果缺失，解析器会自动插入。

## 合并配置 {#merging}

两个配置文件（通常是主配置文件和`config.d/`中的另一个配置文件）按如下方式合并：

- 如果某个节点（即通往某个元素的路径）在两个文件中都存在且没有属性`replace`或`remove`，则它将包含在合并的配置文件中，并且两个节点的子节点将被递归地包含和合并。
- 如果两个节点中的一个包含`replace`属性，则它将包含在合并的配置文件中，但只包含具有`replace`属性的节点的子节点。
- 如果两个节点中的一个包含`remove`属性，则该节点不会包含在合并的配置文件中（如果已经存在，则将其删除）。

例如，给定两个配置文件：

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

和

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

合并后的配置文件将是：

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

### 通过环境变量和ZooKeeper节点的替换 {#from_env_zk}

要指定元素的值应被环境变量的值替换，可以使用属性`from_env`。

例如，环境变量`$MAX_QUERY_SIZE = 150000`：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

合并后的配置将是：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

使用`from_zk`（ZooKeeper节点）也可以实现相同的效果：

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

合并后的配置如下：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 默认值 {#default-values}

带有`from_env`或`from_zk`属性的元素可以额外具有属性`replace="1"`（后者必须出现在`from_env`/`from_zk`之前）。
在这种情况下，元素可以定义一个默认值。
如果设置了，元素将采用环境变量或ZooKeeper节点的值，否则将采用默认值。

重复之前的示例，但假设`MAX_QUERY_SIZE`未设定：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

合并后的配置：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## 使用文件内容进行替换 {#substitution-with-file-content}

也可以通过文件内容替换配置的部分。这可以通过两种方式实现：

- *替换值*：如果某个元素具有属性`incl`，则其值将被引用文件的内容替换。默认情况下，替换的文件路径为`/etc/metrika.xml`。可以在服务器配置中的[`include_from`](../operations/server-configuration-parameters/settings.md#include_from)元素中更改此路径。替换值在这个文件的`/clickhouse/substitution_name`元素中指定。如果`incl`中指定的替换不存在，则会记录在日志中。要阻止ClickHouse记录缺失的替换，请指定属性`optional="true"`（例如，设置[宏](../operations/server-configuration-parameters/settings.md#macros)）。
- *替换元素*：如果要用替换替换整个元素，请使用`include`作为元素名称。元素名称`include`可以与属性`from_zk="/path/to/node"`结合使用。在这种情况下，元素的值由`/path/to/node`的ZooKeeper节点的内容替换。如果您将整个XML子树存储为ZooKeeper节点，它将完全插入到源元素中。

下面是此示例的显示：

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

如果您想将替换内容与现有配置合并而不是追加，可以使用属性`merge="true"`。例如：`<include from_zk="/some_path" merge="true">`。在这种情况下，现有配置将与替换中的内容合并，并且现有的配置设置将被替换中的值替代。

## 加密和隐藏配置 {#encryption}

您可以使用对称加密来加密配置元素，例如明文密码或私钥。
为此，首先配置[加密编解码器](../sql-reference/statements/create/table.md#encryption-codecs)，然后为要加密的元素添加属性`encrypted_by`，其值为加密编解码器的名称。

与属性`from_zk`、`from_env`和`incl`或元素`include`不同，在预处理文件中不执行替换（即解密加密值）。
解密仅在服务器进程的运行时发生。

例如：

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

属性[`from_env`](#from_env_zk)和[`from_zk`](#from_env_zk)也可以应用于`encryption_codecs`：

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

加密密钥和加密值可以在任何配置文件中定义。

给出的示例`config.xml`如下：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

给出的示例`users.xml`如下：

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

要加密一个值，您可以使用（示例）程序`encrypt_decrypt`：

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

即使有加密的配置元素，加密的元素仍然会出现在预处理的配置文件中。
如果这对您的ClickHouse部署构成问题，则有两种替代方案：要么将预处理文件的文件权限设置为600，要么使用属性`hide_in_preprocessed`。

例如：

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## 用户设置 {#user-settings}

`config.xml`文件可以指定带有用户设置、配置文件和配额的单独配置。此配置的相对路径在`users_config`元素中设置。默认情况下，设置为`users.xml`。如果省略`users_config`，则用户设置、配置文件和配额直接在`config.xml`中指定。

用户配置可以分成类似于`config.xml`和`config.d/`的单独文件。
目录名称被定义为`users_config`设置，后接`.d`而不是`.xml`后缀。
默认使用目录`users.d`，因为`users_config`默认为`users.xml`。

请注意，配置文件将首先根据设置进行[合并](#merging)，然后再处理包含。

## XML示例 {#example}

例如，您可以为每个用户有一个单独的配置文件，如下所示：

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

## YAML示例 {#example-1}

在这里，您可以看到YAML格式编写的默认配置：[`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

在ClickHouse配置方面，YAML和XML格式之间存在一些差异。
下面提供了以YAML格式编写配置的提示。

具有文本值的XML标签用YAML键值对表示

```yaml
key: value
```

相应的XML：

```xml
<key>value</key>
```

嵌套的XML节点用YAML映射表示：

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

相应的XML：

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

要多次创建相同的XML标签，可以使用YAML序列：

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

相应的XML：

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

要提供XML属性，您可以使用带有`@`前缀的属性键。请注意，`@`是YAML标准保留的，因此必须用双引号括起来：

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

相应的XML：

```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

在YAML序列中也可以使用属性：

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

相应的XML：

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

上述语法不允许以YAML的形式表示具有XML属性的XML文本节点。这种特殊情况可以使用`#text`属性键来实现：

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

相应的XML：

```xml
<map_key attr1="value1">value2</map>
```

## 实现细节 {#implementation-details}

对于每个配置文件，服务器启动时还会生成`file-preprocessed.xml`文件。这些文件包含所有已完成的替换和重写，供信息使用。如果在配置文件中使用了ZooKeeper替换，但在服务器启动时ZooKeeper不可用，则服务器会从预处理文件加载配置。

服务器跟踪配置文件中的更改，以及在执行替换和重写时使用的文件和ZooKeeper节点，并动态重新加载用户和集群的设置。这意味着您可以在不重启服务器的情况下修改集群、用户及其设置。
