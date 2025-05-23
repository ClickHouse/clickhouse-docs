---
'description': '此页面解释了如何使用 XML 或 YAML 语法配置 ClickHouse 服务器的配置文件。'
'sidebar_label': '配置文件'
'sidebar_position': 50
'slug': '/operations/configuration-files'
'title': '配置文件'
---

:::note
请注意，基于 XML 的设置配置文件和配置文件目前不支持 ClickHouse Cloud。因此，在 ClickHouse Cloud 中，您不会找到 config.xml 文件。相反，您应该使用 SQL 命令通过设置配置文件来管理设置。

有关详细信息，请参见 ["配置设置"](/manage/settings)
:::

ClickHouse 服务器可以使用 XML 或 YAML 语法的配置文件进行配置。
在大多数安装类型中，ClickHouse 服务器以 `/etc/clickhouse-server/config.xml` 作为默认配置文件运行，但也可以在服务器启动时使用命令行选项 `--config-file` 或 `-C` 手动指定配置文件的位置。
附加配置文件可以相对于主配置文件放置在 `config.d/` 目录中，例如放置在 `/etc/clickhouse-server/config.d/` 目录中。
在配置应用于 ClickHouse 服务器之前，该目录中的文件与主配置文件在预处理步骤中合并。
配置文件按照字母顺序合并。
为了简化更新和改善模块化，最佳实践是保持默认的 `config.xml` 文件不变，并将额外的自定义放置在 `config.d/` 中。
ClickHouse keeper 的配置位于 `/etc/clickhouse-keeper/keeper_config.xml`。
因此，附加文件需要放置在 `/etc/clickhouse-keeper/keeper_config.d/` 中。

可以混合使用 XML 和 YAML 配置文件，例如，您可以拥有主配置文件 `config.xml` 和附加配置文件 `config.d/network.xml`、`config.d/timezone.yaml` 和 `config.d/keeper.yaml`。
在单个配置文件中混合 XML 和 YAML 是不支持的。
XML 配置文件应使用 `<clickhouse>...</clickhouse>` 作为顶级标签。
在 YAML 配置文件中，`clickhouse:` 是可选的，如果缺少，解析器会自动插入。

## 合并配置 {#merging}

两个配置文件（通常是主配置文件和来自 `config.d/` 的另一个配置文件）合并的方式如下：

- 如果节点（即通向元素的路径）在两个文件中都出现且没有属性 `replace` 或 `remove`，则它包含在合并的配置文件中，并包含并递归合并两个节点的子节点。
- 如果两个节点中的一个包含属性 `replace`，则它包含在合并的配置文件中，但仅包含具有属性 `replace` 的节点的子节点。
- 如果两个节点中的一个包含属性 `remove`，则该节点不包含在合并的配置文件中（如果已存在，则将其删除）。

示例：

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

和

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

生成合并的配置文件：

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

### 通过环境变量和 ZooKeeper 节点的替换 {#from_env_zk}

要指定元素的值应由环境变量的值替换，可以使用属性 `from_env`。

示例，假设 `$MAX_QUERY_SIZE = 150000`：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

这等于

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

使用 `from_zk`（ZooKeeper 节点）也是可能的：

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

这等于

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 默认值 {#default-values}

带有 `from_env` 或 `from_zk` 属性的元素可以额外具有属性 `replace="1"`（后者必须出现在 `from_env`/`from_zk` 之前）。
在这种情况下，元素可以定义一个默认值。
如果设置，元素将采用环境变量或 ZooKeeper 节点的值，否则采用默认值。

前面的示例但假设 `MAX_QUERY_SIZE` 未设置：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

结果：

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

还可以通过文件内容替换配置的部分。可以通过两种方式完成：

- *值替换*：如果元素具有属性 `incl`，其值将被引用文件的内容替换。默认情况下，含有替换内容的文件路径为 `/etc/metrika.xml`。可以在服务器配置中的 [include_from](../operations/server-configuration-parameters/settings.md#include_from) 元素中更改。替代值在此文件中的 `/clickhouse/substitution_name` 元素中指定。如果在 `incl` 中指定的替代不存在，将记录在日志中。为了防止 ClickHouse 记录缺失的替代，请指定属性 `optional="true"`（例如，设置 [宏](../operations/server-configuration-parameters/settings.md#macros)）。

- *替换元素*：如果您想用替代替换整个元素，请使用 `include` 作为元素名称。元素名称 `include` 可以与属性 `from_zk = "/path/to/node"` 结合使用。在这种情况下，该元素的值将由 `/path/to/node` 的 ZooKeeper 节点的内容替换。如果您将整个 XML 子树存储为 ZooKeeper 节点，它将完全插入到源元素中。

示例：

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

如果您希望合并替代内容与现有配置，而不是追加，可以使用属性 `merge="true"`，例如：`<include from_zk="/some_path" merge="true">`。在这种情况下，现有配置将与替代内容合并，现有的配置设置将被替代值替换。

## 加密和隐藏配置 {#encryption}

您可以使用对称加密来加密配置元素，例如，明文密码或私钥。
为此，首先配置 [加密编码器](../sql-reference/statements/create/table.md#encryption-codecs)，然后将属性 `encrypted_by` 及其值设置为要加密的元素的加密编码器的名称。

与属性 `from_zk`、`from_env` 和 `incl`，或元素 `include` 不同，预处理文件中不执行替换（即对加密值的解密）。
解密仅在服务器进程运行时发生。

示例：

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

属性 [from_env](#from_env_zk) 和 [from_zk](#from_env_zk) 也可以适用于 ```encryption_codecs```：
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

加密密钥和加密值可以在任意配置文件中定义。

示例 `config.xml`：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

示例 `users.xml`：

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

要加密一个值，您可以使用（示例）程序 `encrypt_decrypt`：

示例：

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

即使是加密的配置元素，已加密的元素仍然出现在预处理的配置文件中。
如果这对您的 ClickHouse 部署造成问题，我们建议两个替代方案：将预处理文件的文件权限设置为 600 或使用属性 `hide_in_preprocessed`。

示例：

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## 用户设置 {#user-settings}

`config.xml` 文件可以指定一个包含用户设置、配置文件和配额的单独配置。到此配置的相对路径在 `users_config` 元素中设置。默认情况下，它是 `users.xml`。如果省略 `users_config`，则用户设置、配置文件和配额直接在 `config.xml` 中指定。

用户配置可以拆分为类似 `config.xml` 和 `config.d/` 的单独文件。
目录名称被定义为 `users_config` 设置，后面不带 `.xml` 后缀并连接 `.d`。
目录 `users.d` 是默认使用的，因为 `users_config` 默认为 `users.xml`。

请注意，配置文件首先 [合并](#merging)，考虑到设置，并在那之后处理包含。

## XML 示例 {#example}

例如，您可以为每个用户拥有单独的配置文件，如下所示：

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

## YAML 示例 {#example-1}

在这里，您可以看到以 YAML 格式编写的默认配置：[config.yaml.example](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

在 YAML 和 XML 格式的 ClickHouse 配置之间存在一些差异。以下是以 YAML 格式编写配置的一些提示。

具有文本值的 XML 标签在 YAML 中表示为键值对：
```yaml
key: value
```

对应的 XML：
```xml
<key>value</key>
```

嵌套的 XML 节点在 YAML 中表示为映射：
```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

对应的 XML：
```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

要多次创建相同的 XML 标签，请使用 YAML 序列：
```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

对应的 XML：
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

要提供 XML 属性，您可以使用带有 `@` 前缀的属性键。请注意，`@` 是 YAML 标准保留的，因此必须用双引号括起来：
```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

对应的 XML：
```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

在 YAML 序列中也可以使用属性：
```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

对应的 XML：
```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

上述语法不允许将带有 XML 属性的 XML 文本节点表示为 YAML。这个特殊情况可以使用 `#text` 属性键实现：
```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

对应的 XML：
```xml
<map_key attr1="value1">value2</map>
```

## 实现细节 {#implementation-details}

对于每个配置文件，服务器在启动时还会生成 `file-preprocessed.xml` 文件。这些文件包含所有已完成的替换和覆盖，供参考使用。如果配置文件中使用了 ZooKeeper 替换，但服务器启动时没有可用的 ZooKeeper，服务器将从预处理文件加载配置。

服务器跟踪配置文件中的更改，以及在执行替换和覆盖时使用的文件和 ZooKeeper 节点，并实时重新加载用户和集群的设置。这意味着您可以修改集群、用户及其设置，而无需重新启动服务器。
