---
'sidebar_label': '设置 IP 过滤器'
'slug': '/cloud/security/setting-ip-filters'
'title': '设置 IP 过滤器'
'description': '本页面说明了如何在 ClickHouse Cloud 中设置 IP 过滤器以控制对 ClickHouse 服务的访问。'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定哪些源地址被允许连接到您的 ClickHouse 服务来过滤流量到您的 ClickHouse 服务。每个服务的列表都是可配置的。列表可以在服务部署期间进行配置，也可以在之后进行配置。如果您在服务引导期间没有配置 IP 访问列表，或者如果您希望对初始列表进行更改，那么您可以通过选择服务，然后选择 **安全** 选项卡来进行这些更改。

:::important
如果您跳过为 ClickHouse Cloud 服务创建 IP 访问列表，则将不允许任何流量访问该服务。
:::

## 准备 {#prepare}
在开始之前，收集应添加到访问列表中的 IP 地址或范围。考虑到远程工作人员、待命位置、VPN 等。IP 访问列表用户界面接受单个地址和 CIDR 表示法。

无类域间路由 (CIDR) 表示法，允许您指定小于传统 A、B 或 C 类（8、6 或 24）子网掩码大小的 IP 地址范围。[ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供 CIDR 计算器，如果您需要，可以使用这些工具，如果您想了解有关 CIDR 表示法的更多信息，请参阅 [无类域间路由 (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。

## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

从您的 ClickHouse Cloud 服务列表中选择服务，然后选择 **设置**。在 **安全** 部分下，您将找到 IP 访问列表。单击文本为 *You can connect to this service from* **(anywhere | x specific locations)** 的超链接

会出现一个侧边栏，您可以配置以下选项：

- 允许来自任何地方的流量访问该服务
- 允许来自特定位置的流量访问该服务
- 拒绝对该服务的所有访问

此截图显示了一个允许来自一系列 IP 地址的访问列表，被描述为“纽约办公室范围”：

<Image img={ip_filtering_after_provisioning} size="md" alt="Existing access list in ClickHouse Cloud" border/>

### 可执行操作 {#possible-actions}

1. 要添加额外的条目，您可以使用 **+ 添加新 IP**

  此示例添加了单个 IP 地址，并描述为 `伦敦服务器`：

<Image img={ip_filter_add_single_ip} size="md" alt="Adding a single IP to the access list in ClickHouse Cloud" border/>

1. 删除现有条目

  点击叉号 (x) 可以删除一个条目

1. 编辑现有条目

  直接修改该条目

1. 切换以允许来自 **任何地方** 的访问

  这并不推荐，但允许这样做。我们建议您将构建在 ClickHouse 之上的应用程序公开，并限制对后端 ClickHouse Cloud 服务的访问。

要应用所做的更改，您必须单击 **保存**。

## 验证 {#verification}

一旦您创建了过滤器，请确认在范围内的连接性，并确认来自允许范围之外的连接被拒绝。可以使用简单的 `curl` 命令进行验证：
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
