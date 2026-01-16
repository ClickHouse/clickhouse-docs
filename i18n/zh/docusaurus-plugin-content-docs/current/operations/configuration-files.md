---
description: '本页说明如何使用 XML 或 YAML 语法的配置文件来配置 ClickHouse 服务器。'
sidebar_label: '配置文件'
sidebar_position: 50
slug: /operations/configuration-files
title: '配置文件'
doc_type: 'guide'
---

:::note
基于 XML 的设置配置集和配置文件在 ClickHouse Cloud 中不受支持。因此，在 ClickHouse Cloud 中不会存在 `config.xml` 文件。相应地，应使用 SQL 命令，通过设置配置集来管理相关设置。

更多详情，参见 ["配置设置"](/manage/settings)
:::

ClickHouse 服务器可以通过 XML 或 YAML 语法的配置文件进行配置。
在大多数安装方式中，ClickHouse 服务器默认使用 `/etc/clickhouse-server/config.xml` 作为配置文件，但也可以在服务器启动时通过命令行选项 `--config-file` 或 `-C` 手动指定配置文件的位置。
可以将其他配置文件放在相对于主配置文件的 `config.d/` 目录中，例如 `/etc/clickhouse-server/config.d/` 目录。
在将配置应用到 ClickHouse 服务器之前，会有一个预处理步骤，将该目录中的文件与主配置文件合并。
配置文件按字母顺序进行合并。
为了简化更新并提高模块化程度，最佳实践是保持默认的 `config.xml` 文件不做修改，并将额外的自定义配置放入 `config.d/`。
ClickHouse Keeper 的配置位于 `/etc/clickhouse-keeper/keeper_config.xml`。
类似地，Keeper 的额外配置文件需要放在 `/etc/clickhouse-keeper/keeper_config.d/` 中。

可以混合使用 XML 和 YAML 配置文件，例如，你可以有一个主配置文件 `config.xml`，以及额外的配置文件 `config.d/network.xml`、`config.d/timezone.yaml` 和 `config.d/keeper.yaml`。
不支持在单个配置文件中混用 XML 和 YAML。
XML 配置文件应使用 `<clickhouse>...</clickhouse>` 作为顶层标签。
在 YAML 配置文件中，`clickhouse:` 是可选的，如果缺失，解析器会自动插入该项。

## 合并配置 \\{#merging\\}

两个配置文件（通常是主配置文件和来自 `config.d/` 的另一个配置文件）按如下规则进行合并：

* 如果某个节点（即指向某个元素的路径）在两个文件中都出现，且没有 `replace` 或 `remove` 属性，则该节点会包含在合并后的配置文件中，并且会将两个节点的所有子节点一并包含并递归合并。
* 如果两个节点中有一个包含 `replace` 属性，则该节点会包含在合并后的配置文件中，但只包含带有 `replace` 属性的那个节点的子节点。
* 如果两个节点中有一个包含 `remove` 属性，则该节点不会包含在合并后的配置文件中（如果该节点已经存在，则会被删除）。

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

合并后的配置文件如下：

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

### 使用环境变量和 ZooKeeper 节点进行替换 \\{#from_env_zk\\}

要指定某个元素的值由环境变量的值替换，可以使用属性 `from_env`。

例如，若设置环境变量 `$MAX_QUERY_SIZE = 150000`：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

生成的配置如下：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

同样可以使用 `from_zk`（ZooKeeper 节点）来实现：

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

最终得到如下配置：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### 默认值 \\{#default-values\\}

带有 `from_env` 或 `from_zk` 属性的元素还可以带有属性 `replace="1"`（该属性必须出现在 `from_env`/`from_zk` 之前）。
在这种情况下，元素可以定义一个默认值。
如果环境变量或 ZooKeeper 节点已设置，元素将取其值，否则将采用默认值。

下面重复前面的示例，不过假设未设置 `MAX_QUERY_SIZE`：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

结果配置如下：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## 使用文件内容进行替换 \\{#substitution-with-file-content\\}

也可以使用文件内容来替换配置中的部分内容。这可以通过两种方式完成：

* *替换值*：如果某个元素具有 `incl` 属性，其值会被引用文件的内容所替换。默认情况下，包含替换内容的文件路径为 `/etc/metrika.xml`。可以在服务器配置中的 [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) 元素中更改该路径。替换值在此文件中的 `/clickhouse/substitution_name` 元素中指定。如果 `incl` 中指定的替换不存在，会被记录到日志中。要阻止 ClickHouse 记录缺失的替换项，请指定属性 `optional="true"`（例如，用于 [macros](../operations/server-configuration-parameters/settings.md#macros) 的设置）。
* *替换元素*：如果要通过替换来替换整个元素，请使用 `include` 作为元素名。元素名 `include` 可以与属性 `from_zk = "/path/to/node"` 结合使用。在这种情况下，元素值会被 ZooKeeper 中 `/path/to/node` 节点的内容所替代。这同样适用于将整个 XML 子树存储为一个 ZooKeeper 节点的情况，此时该子树会完整插入到源元素中。

下面给出一个示例：

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

如果你希望将替换内容与现有配置合并而不是追加，可以使用属性 `merge="true"`。例如：`<include from_zk="/some_path" merge="true">`。在这种情况下，现有配置会与替换内容合并，且现有配置中的设置会被替换内容中的值覆盖。

## 加密和隐藏配置 \\{#encryption\\}

可以使用对称加密来加密某个配置元素，例如明文密码或私钥。
为此，先配置[加密编解码器（encryption codec）](../sql-reference/statements/create/table.md#encryption-codecs)，然后在要加密的元素上添加属性 `encrypted_by`，其值设为该加密编解码器的名称。

与属性 `from_zk`、`from_env` 和 `incl`，或元素 `include` 不同，在预处理后的文件中不会执行替换（即不会对加密值进行解密）。
解密仅在服务器进程的运行时进行。

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

属性 [`from_env`](#from_env_zk) 和 [`from_zk`](#from_env_zk) 同样可以用于 `encryption_codecs`：

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

可以在任意一个配置文件中定义加密密钥和加密值。

示例 `config.xml` 如下所示：

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

一个示例 `users.xml` 文件如下：

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

要对某个值进行加密，可以使用示例程序 `encrypt_decrypt`：

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

即使使用了加密的配置项，这些加密内容在预处理生成的配置文件中仍然会出现。
如果这会对你的 ClickHouse 部署造成影响，有两种可选方案：要么将预处理文件的权限设置为 600，要么使用属性 `hide_in_preprocessed`。

例如：

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## 用户设置 \\{#user-settings\\}

`config.xml` 文件可以指定一个单独的配置文件，用于定义用户设置、配置概要（profile）和配额（quota）。该配置文件的相对路径通过 `users_config` 元素进行设置，默认值为 `users.xml`。如果省略 `users_config`，则用户设置、配置概要和配额会直接在 `config.xml` 中指定。

用户配置可以像 `config.xml` 和 `config.d/` 一样拆分到单独的文件中。
目录名称为 `users_config` 设置值去掉 `.xml` 后缀后再拼接 `.d`。
默认使用目录 `users.d`，因为 `users_config` 默认是 `users.xml`。

请注意，配置文件会首先根据设置进行[合并](#merging)，然后才会处理 include。

## XML 示例 \\{#example\\}

例如，你可以为每个用户使用单独的配置文件，如下所示：

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

## YAML 示例 \\{#example-1\\}

此处展示了用 YAML 编写的默认配置：[`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example)。

在 ClickHouse 配置方面，YAML 和 XML 格式之间存在一些差异。
下面是使用 YAML 格式编写配置的一些提示。

具有文本值的 XML 标签在 YAML 中表示为一个键值对

```yaml
key: value
```

相应的 XML：

```xml
<key>value</key>
```

嵌套的 XML 节点表示为 YAML 映射：

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

要多次定义同一个 XML 标签，请使用 YAML 序列：

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

要指定一个 XML 属性，可以使用带有 `@` 前缀的属性键。请注意，`@` 是 YAML 标准中的保留符号，因此必须用双引号括起来：

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

相应的 XML：

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

相应的 XML：

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

前述语法无法在 YAML 中表示带有 XML 属性的 XML 文本节点。可以通过使用 `#text` 属性键来处理这种特殊情况：

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

相应的 XML：

```xml
<map_key attr1="value1">value2</map>
```

## 实现细节 \\{#implementation-details\\}

对于每个配置文件，服务器在启动时还会生成 `file-preprocessed.xml` 文件。这些文件包含所有已完成的替换和覆盖，仅供参考使用。如果在配置文件中使用了 ZooKeeper 替换，但在服务器启动时 ZooKeeper 不可用，服务器将从预处理文件中加载配置。

服务器会跟踪配置文件的更改，以及在执行替换和覆盖时所使用的文件和 ZooKeeper 节点，并动态重新加载用户和集群的设置。这意味着你可以在不重启服务器的情况下修改集群、用户及其设置。
