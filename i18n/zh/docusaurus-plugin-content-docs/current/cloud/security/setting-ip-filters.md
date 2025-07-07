---
'sidebar_label': '设置 IP 过滤器'
'slug': '/cloud/security/setting-ip-filters'
'title': '设置 IP 过滤器'
'description': '此页面解释了如何在 ClickHouse Cloud 中设置 IP 过滤器，以控制对 ClickHouse 服务的访问。'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定哪些源地址被允许连接到您的 ClickHouse 服务来过滤流量。每个服务的列表都是可配置的。列表可以在服务部署期间或之后进行配置。如果您在配置过程中未设置 IP 访问列表，或如果您想对初始列表进行更改，则可以通过选择服务，然后选择 **Security** 选项卡来进行更改。

:::important
如果您跳过了 ClickHouse Cloud 服务的 IP 访问列表的创建，则该服务将不允许任何流量。
:::

## 准备 {#prepare}
在开始之前，请收集应添加到访问列表中的 IP 地址或范围。请考虑到远程工作者、值班位置、VPN 等。IP 访问列表用户界面接受单个地址和 CIDR 符号表示法。

无类域间路由（CIDR）符号表示法，允许您指定小于传统 A 类、B 类或 C 类（8、6 或 24）子网掩码大小的 IP 地址范围。如果您需要，[ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供 CIDR 计算器。如果您想了解更多有关 CIDR 符号表示法的信息，请参见 [无类域间路由（CIDR）](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。

## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

从您的 ClickHouse Cloud 服务列表中选择服务，然后选择 **Settings**。在 **Security** 部分，您将找到 IP 访问列表。单击超链接，其文本为：*You can connect to this service from* **(anywhere | x specific locations)**

将出现一个侧边栏，供您配置选项：

- 允许来自任何地方到该服务的流量
- 允许从特定位置访问该服务
- 拒绝对该服务的所有访问

此屏幕截图显示了一个访问列表，它允许来自一系列 IP 地址的流量，该范围被描述为“NY Office range”：

<Image img={ip_filtering_after_provisioning} size="md" alt="Existing access list in ClickHouse Cloud" border/>

### 可能的操作 {#possible-actions}

1. 要添加额外条目，您可以使用 **+ Add new IP**

   此示例添加了一个单一的 IP 地址，并带有 `London server` 的描述：

<Image img={ip_filter_add_single_ip} size="md" alt="Adding a single IP to the access list in ClickHouse Cloud" border/>

2. 删除现有条目

   单击叉号 (x) 可以删除一个条目

3. 编辑现有条目

   直接修改条目

4. 切换到允许来自 **Anywhere** 的访问

   这并不推荐，但它是允许的。我们建议您将基于 ClickHouse 构建的应用程序公开，并限制对后端 ClickHouse Cloud 服务的访问。

要应用您所做的更改，您必须单击 **Save**。

## 验证 {#verification}

一旦创建了过滤器，请确认在范围内的连通性，并确认来自允许范围之外的连接被拒绝。可以使用简单的 `curl` 命令来验证：
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
