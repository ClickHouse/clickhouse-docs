import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定哪些源地址被允许连接到您的 ClickHouse 服务来过滤流量。每个服务的列表是可配置的。列表可以在服务部署期间进行配置，也可以事后进行配置。如果在配置过程中未配置 IP 访问列表，或者如果您想对初始列表进行更改，则可以通过选择服务，然后选择 **Security** 选项卡来进行更改。

:::important
如果您跳过创建 ClickHouse Cloud 服务的 IP 访问列表，则流量将不被允许访问该服务。
:::

## 准备 {#prepare}
在开始之前，收集应添加到访问列表的 IP 地址或范围。考虑远程工人、待命位置、VPN 等。IP 访问列表用户界面接受单个地址和 CIDR 表示法。

无类域间路由（CIDR）表示法允许您指定比传统 A、B 或 C 类（8、6 或 24）子网掩码更小的 IP 地址范围。[ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供 CIDR 计算器，如果您需要可以使用，并且如果您想了解更多关于 CIDR 表示法的信息，请参见 [无类域间路由（CIDR）](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。

## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

从您的 ClickHouse Cloud 服务列表中选择服务，然后选择 **Settings**。在 **Security** 部分下，您将找到 IP 访问列表。点击文本中显示的超链接：*You can connect to this service from* **(anywhere | x specific locations)**

将出现一个侧边栏，供您配置选项：

- 允许来自任何地方的入站流量到该服务
- 允许来自特定位置的访问到该服务
- 拒绝所有访问该服务

该截图显示了一个允许来自一系列 IP 地址的访问列表，描述为“NY Office range”：

<Image img={ip_filtering_after_provisioning} size="md" alt="在 ClickHouse Cloud 中的现有访问列表" border/>

### 可能的操作 {#possible-actions}

1. 要添加额外条目，您可以使用 **+ Add new IP**

   此示例添加了一个单独的 IP 地址，描述为 `London server`：

<Image img={ip_filter_add_single_ip} size="md" alt="在 ClickHouse Cloud 中向访问列表添加单个 IP" border/>

2. 删除现有条目

   点击交叉 (x) 可以删除一条条目

3. 编辑现有条目

   直接修改条目

4. 切换到允许来自 **Anywhere** 的访问

   这不是推荐的做法，但它是允许的。我们建议您将基于 ClickHouse 构建的应用程序暴露给公众，并限制对后端 ClickHouse Cloud 服务的访问。

要应用您所做的更改，您必须点击 **Save**。

## 验证 {#verification}

创建过滤器后，确认从范围内的连接，并确认来自允许范围外的连接被拒绝。可以使用简单的 `curl` 命令进行验证：
```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
或
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 限制 {#limitations}

- 目前，IP 访问列表仅支持 IPv4
