---
'sidebar_label': '设置 IP 过滤器'
'slug': '/cloud/security/setting-ip-filters'
'title': '设置 IP 过滤器'
'description': '本页解释如何在 ClickHouse Cloud 中设置 IP 过滤器以控制对 ClickHouse 服务的访问。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定哪些源地址被允许连接来过滤对 ClickHouse 服务或 API 密钥的流量。这些列表可以针对每个服务和每个 API 密钥进行配置。可以在服务或 API 密钥创建时配置列表，或之后进行配置。

:::important
如果您跳过为 ClickHouse Cloud 服务创建 IP 访问列表，则该服务将不允许任何流量。如果 ClickHouse 服务的 IP 访问列表设置为 `Allow from anywhere`，您的服务可能会定期被寻找公共 IP 的网络爬虫和扫描仪从闲置状态移动到活动状态，这可能会导致意外的费用。
:::

## 准备工作 {#prepare}

在开始之前，收集应该添加到访问列表的 IP 地址或范围。考虑到远程工作者、值班地点、VPN 等。IP 访问列表用户界面接受单个地址和 CIDR 表示法。

无类别域间路由 (CIDR) 表示法允许您指定小于传统 A 类、B 类或 C 类 (8、6 或 24) 子网掩码大小的 IP 地址范围。如果您需要， [ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供 CIDR 计算器，如果您想了解有关 CIDR 表示法的更多信息，请参见 [无类别域间路由 (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。

## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

:::note 仅适用于 PrivateLink 之外的连接
IP 访问列表仅适用于来自公共互联网的连接，位于 [PrivateLink](/cloud/security/private-link-overview) 之外。
如果您只想要来自 PrivateLink 的流量，请在 IP 允许列表中设置 `DenyAll`。
:::

<details>
  <summary>ClickHouse 服务的 IP 访问列表</summary>

  当您创建一个 ClickHouse 服务时，IP 允许列表的默认设置是“来自任何地方的允许”。
  
  从您的 ClickHouse Cloud 服务列表中选择服务，然后选择 **设置**。在 **安全性** 部分，您将找到 IP 访问列表。单击添加 IP 按钮。
  
  一个侧边栏将出现，供您配置选项：
  
- 允许来自任何地方的传入流量到该服务
- 允许来自特定位置的访问到该服务
- 拒绝对该服务的所有访问
  
</details>
<details>
  <summary>API 密钥的 IP 访问列表</summary>

  当您创建一个 API 密钥时，IP 允许列表的默认设置是“来自任何地方的允许”。
  
  从 API 密钥列表中，单击 **操作** 列下 API 密钥旁边的三个点，然后选择 **编辑**。在屏幕底部，您将找到 IP 访问列表和配置选项：

- 允许来自任何地方的传入流量到该服务
- 允许来自特定位置的访问到该服务
- 拒绝对该服务的所有访问
  
</details>

此屏幕截图显示了一个访问列表，该列表允许来自一系列 IP 地址的流量，描述为“NY 办公室范围”：
  
<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloud 中的现有访问列表" border/>

### 可执行的操作 {#possible-actions}

1. 添加额外条目，您可以使用 **+ 添加新 IP**

  这个示例添加了一个单独的 IP 地址，并描述为 `伦敦服务器`：

<Image img={ip_filter_add_single_ip} size="md" alt="在 ClickHouse Cloud 中向访问列表添加单个 IP" border/>

2. 删除现有条目

  单击交叉 (x) 可以删除条目。

3. 编辑现有条目

  直接修改该条目。

4. 切换以允许来自 **任何地方** 的访问

  这不推荐，但被允许。我们建议您将构建在 ClickHouse 之上的应用程序公开，并限制对后端 ClickHouse Cloud 服务的访问。

要应用您所做的更改，您必须单击 **保存**。

## 验证 {#verification}

创建过滤器后，请确认可以从范围内连接到服务，并确认来自允许范围外的连接被拒绝。您可以使用简单的 `curl` 命令进行验证：
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

- 当前，IP 访问列表仅支持 IPv4
