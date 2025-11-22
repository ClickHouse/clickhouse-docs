---
description: '本页说明如何使用 XML 或 YAML 语法的配置文件来配置 ClickHouse 服务器。'
sidebar_label: '配置文件'
sidebar_position: 50
slug: /operations/configuration-files
title: '配置文件'
doc_type: 'guide'
---

:::note
基于 XML 的 settings profile 和配置文件在 ClickHouse Cloud 中不受支持。因此，在 ClickHouse Cloud 中你不会看到 `config.xml` 文件。相应地，你应当使用 SQL 命令，通过 settings profiles 来管理设置。

有关更多详细信息，请参阅 ["配置设置"](/manage/settings)
:::

可以通过使用 XML 或 YAML 语法的配置文件来配置 ClickHouse 服务器。
在大多数安装方式中，ClickHouse 服务器默认使用 `/etc/clickhouse-server/config.xml` 作为配置文件运行，但也可以在服务器启动时通过命令行选项 `--config-file` 或 `-C` 手动指定配置文件的位置。
可以将额外的配置文件放置在相对于主配置文件的 `config.d/` 目录中，例如 `/etc/clickhouse-server/config.d/`。
在将配置应用到 ClickHouse 服务器之前，会在预处理步骤中将该目录中的文件与主配置文件进行合并。
配置文件按字母顺序合并。
为简化更新并提高模块化程度，最佳实践是保持默认的 `config.xml` 文件不做修改，将额外的自定义配置放入 `config.d/` 中。
ClickHouse Keeper 的配置位于 `/etc/clickhouse-keeper/keeper_config.xml`。
类似地，Keeper 的额外配置文件需要放在 `/etc/clickhouse-keeper/keeper_config.d/` 中。

可以混合使用 XML 和 YAML 配置文件，例如，你可以有一个主配置文件 `config.xml`，以及额外的配置文件 `config.d/network.xml`、`config.d/timezone.yaml` 和 `config.d/keeper.yaml`。
在单个配置文件中混合使用 XML 和 YAML 不受支持。
XML 配置文件应使用 `<clickhouse>...</clickhouse>` 作为顶层标签。
在 YAML 配置文件中，`clickhouse:` 是可选的；如果缺失，解析器会自动插入该标签。



## 合并配置 {#merging}

两个配置文件(通常是主配置文件和 `config.d/` 目录下的另一个配置文件)按以下方式合并:

- 如果一个节点(即指向元素的路径)同时出现在两个文件中,且不包含 `replace` 或 `remove` 属性,则该节点会包含在合并后的配置文件中,来自两个节点的子节点都会被包含并递归合并。
- 如果两个节点中的一个包含 `replace` 属性,则该节点会包含在合并后的配置文件中,但只包含带有 `replace` 属性的节点的子节点。
- 如果两个节点中的一个包含 `remove` 属性,则该节点不会包含在合并后的配置文件中(如果已存在,则会被删除)。

例如,给定以下两个配置文件:

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

合并后的配置文件结果为:

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

### 通过环境变量和 ZooKeeper 节点进行替换 {#from_env_zk}

要指定元素的值应该被环境变量的值替换,可以使用 `from_env` 属性。

例如,当环境变量 `$MAX_QUERY_SIZE = 150000` 时:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

生成的配置为:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

使用 `from_zk`(ZooKeeper 节点)也可以实现相同的效果:

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

最终生成以下配置：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 默认值 {#default-values}

带有 `from_env` 或 `from_zk` 属性的元素还可以包含 `replace="1"` 属性（该属性必须出现在 `from_env`/`from_zk` 之前）。
在这种情况下,该元素可以定义默认值。
如果环境变量或 ZooKeeper 节点已设置,元素将使用其值,否则使用默认值。

以下重复前面的示例,但假设 `MAX_QUERY_SIZE` 未设置：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

最终生成配置：

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

也可以使用文件内容替换配置的部分内容。可以通过以下两种方式实现:

- _替换值_: 如果元素具有 `incl` 属性,其值将被引用文件的内容替换。默认情况下,包含替换内容的文件路径为 `/etc/metrika.xml`。可以在服务器配置的 [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 元素中更改此路径。替换值在该文件的 `/clickhouse/substitution_name` 元素中指定。如果 `incl` 中指定的替换不存在,将记录到日志中。要防止 ClickHouse 记录缺失的替换,请指定属性 `optional="true"`(例如,[macros](../operations/server-configuration-parameters/settings.md#macros) 的设置)。
- _替换元素_: 如果要用替换内容替换整个元素,请使用 `include` 作为元素名称。元素名称 `include` 可以与属性 `from_zk = "/path/to/node"` 结合使用。在这种情况下,元素值将被 `/path/to/node` 路径下的 ZooKeeper 节点内容替换。当您将整个 XML 子树存储为 ZooKeeper 节点时,该子树将完整插入到源元素中。

以下是一个示例:

```xml
<clickhouse>
    <!-- 将 ZK 路径 `/profiles-in-zookeeper` 中找到的 XML 子树追加到 `<profiles>` 元素。 -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- 用 ZK 路径 `/users-in-zookeeper` 中找到的子树替换 `include` 元素。 -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

如果要将替换内容与现有配置合并而不是追加,可以使用属性 `merge="true"`。例如:`<include from_zk="/some_path" merge="true">`。在这种情况下,现有配置将与替换内容合并,现有配置设置将被替换内容中的值覆盖。


## 加密和隐藏配置 {#encryption}

您可以使用对称加密来加密配置元素,例如明文密码或私钥。
为此,首先配置[加密编解码器](../sql-reference/statements/create/table.md#encryption-codecs),然后在要加密的元素上添加 `encrypted_by` 属性,并将加密编解码器的名称作为该属性的值。

与 `from_zk`、`from_env` 和 `incl` 属性或 `include` 元素不同,预处理文件中不会执行替换操作(即不会解密加密值)。
解密仅在服务器进程运行时进行。

例如:

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

[`from_env`](#from_env_zk) 和 [`from_zk`](#from_env_zk) 属性也可以应用于 `encryption_codecs`:

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

加密密钥和加密值可以在任一配置文件中定义。

`config.xml` 示例如下:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

`users.xml` 示例如下:

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

要加密一个值,可以使用 `encrypt_decrypt` 程序(示例):

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

即使使用了加密配置元素,加密元素仍会出现在预处理后的配置文件中。
如果这对您的 ClickHouse 部署造成问题,有两种替代方案:将预处理文件的权限设置为 600,或使用 `hide_in_preprocessed` 属性。

例如:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```


## 用户设置 {#user-settings}

`config.xml` 文件可以指定一个单独的配置文件,用于存放用户设置、配置文件和配额。该配置文件的相对路径通过 `users_config` 元素设置。默认值为 `users.xml`。如果省略 `users_config`,则用户设置、配置文件和配额将直接在 `config.xml` 中指定。

用户配置可以拆分为多个独立文件,类似于 `config.xml` 和 `config.d/` 的方式。
目录名称的定义方式为:将 `users_config` 设置去掉 `.xml` 后缀,然后拼接 `.d`。
默认使用 `users.d` 目录,因为 `users_config` 的默认值为 `users.xml`。

请注意,配置文件会首先根据设置进行[合并](#merging),之后再处理包含项。


## XML 示例 {#example}

例如,您可以为每个用户创建单独的配置文件,如下所示:

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

您可以在此查看以 YAML 格式编写的默认配置文件:[`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

在 ClickHouse 配置中,YAML 和 XML 格式之间存在一些差异。
下面介绍使用 YAML 格式编写配置的技巧。

带有文本值的 XML 标签在 YAML 中表示为键值对

```yaml
key: value
```

对应的 XML:

```xml
<key>value</key>
```

嵌套的 XML 节点在 YAML 中表示为映射:

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

对应的 XML:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

要多次创建相同的 XML 标签,请使用 YAML 序列:

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

对应的 XML:

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

要提供 XML 属性,可以使用带有 `@` 前缀的属性键。请注意,`@` 是 YAML 标准的保留字符,因此必须用双引号括起来:

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

对应的 XML:

```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

也可以在 YAML 序列中使用属性:

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

对应的 XML:

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

上述语法无法将带有 XML 属性的 XML 文本节点表示为 YAML。这种特殊情况可以通过使用 `#text` 属性键来实现:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

对应的 XML:

```xml
<map_key attr1="value1">value2</map>
```


## 实现细节 {#implementation-details}

对于每个配置文件,服务器在启动时还会生成 `file-preprocessed.xml` 文件。这些文件包含所有已完成的替换和覆盖操作,供信息查看之用。如果配置文件中使用了 ZooKeeper 替换,但服务器启动时 ZooKeeper 不可用,服务器将从预处理文件中加载配置。

服务器会跟踪配置文件的变更,以及执行替换和覆盖操作时所使用的文件和 ZooKeeper 节点,并动态重新加载用户和集群的设置。这意味着您可以在不重启服务器的情况下修改集群、用户及其设置。
