---
sidebar_label: '设置 IP 过滤器'
slug: /cloud/security/setting-ip-filters
title: '设置 IP 过滤器'
---

import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定哪些源地址被允许连接到您的 ClickHouse 服务来过滤流量。每个服务的列表是可配置的。列表可以在服务部署期间或之后进行配置。如果您在配置期间没有配置 IP 访问列表，或者如果您想对初始列表进行更改，那么您可以通过选择服务然后选择 **Security** 选项卡来进行这些更改。

:::important
如果您跳过为 ClickHouse Cloud 服务创建 IP 访问列表，那么将不允许任何流量访问该服务。
:::

## 准备 {#prepare}
在开始之前，收集应该添加到访问列表中的 IP 地址或范围。考虑到远程工作者、值班地点、VPN 等。IP 访问列表用户界面接受单个地址和 CIDR 记法。

无类域间路由（CIDR）记法允许您指定小于传统 A 类、B 类或 C 类（8、6 或 24）子网掩码大小的 IP 地址范围。如果您需要 CIDR 计算器，[ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供 CIDR 计算器，如果您想了解有关 CIDR 记法的更多信息，请参见 [无类域间路由 (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。

## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

从您的 ClickHouse Cloud 服务列表中选择服务，然后选择 **Settings**。在 **Security** 部分下，您会找到 IP 访问列表。单击文本中显示的超链接：*您可以从 **(任何地方 | x 个特定位置)** 连接到此服务。*

侧边栏将出现供您配置的选项：

- 允许来自任何地方的流量访问该服务
- 允许来自特定位置的访问该服务
- 拒绝对该服务的所有访问

此截屏显示了一个允许来自一系列 IP 地址的访问列表，被描述为“NY 办公室范围”：

<img src={ip_filtering_after_provisioning} alt="ClickHouse Cloud 中的现有访问列表" />

### 可能的操作 {#possible-actions}

1. 要添加额外条目，您可以使用 **+ 添加新 IP**

   此示例添加一个单独的 IP 地址，描述为 `London server`：

<img src={ip_filter_add_single_ip} alt="在 ClickHouse Cloud 中将单个 IP 添加到访问列表" />

2. 删除现有条目

   单击交叉 (x) 可以删除一个条目

3. 编辑现有条目

   直接修改该条目

4. 切换到允许来自 **任何地方** 的访问

   这并不推荐，但允许这样做。我们建议您将基于 ClickHouse 构建的应用程序暴露给公众，并限制对后端 ClickHouse Cloud 服务的访问。

要应用您所做的更改，您必须单击 **Save**。

## 验证 {#verification}

创建过滤器后，请确认在范围内的连接，并确认来自允许范围以外的连接被拒绝。可以使用简单的 `curl` 命令进行验证：
```bash title="尝试被拒绝的外部请求"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
或
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="尝试被允许的内部请求"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 限制 {#limitations}

- 目前，IP 访问列表仅支持 IPv4
