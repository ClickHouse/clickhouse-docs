---
sidebar_label: '设置 IP 过滤器'
slug: /cloud/security/setting-ip-filters
title: '设置 IP 过滤器'
description: '本页面介绍如何在 ClickHouse Cloud 中设置 IP 过滤器，以控制对 ClickHouse 服务的访问。'
doc_type: 'guide'
keywords: ['IP 过滤器', 'IP 访问列表']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';


## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定允许连接的源地址来过滤访问 ClickHouse 服务或 API 密钥的流量。这些列表可针对每个服务和每个 API 密钥分别配置。列表可以在创建服务或 API 密钥时配置,也可以在创建后配置。

:::important
如果您跳过为 ClickHouse Cloud 服务创建 IP 访问列表,则该服务将不允许任何流量访问。如果将 ClickHouse 服务的 IP 访问列表设置为 `Allow from anywhere`(允许来自任何位置),您的服务可能会被搜索公共 IP 的互联网爬虫和扫描器定期从空闲状态激活为活动状态,这可能会产生少量意外费用。
:::


## 准备工作 {#prepare}

在开始之前,请收集需要添加到访问列表的 IP 地址或地址段。需要考虑远程办公人员、值班地点、VPN 等因素。IP 访问列表用户界面支持单个地址和 CIDR 表示法。

无类别域间路由(CIDR)表示法允许您指定比传统 A 类、B 类或 C 类(8、16 或 24 位)子网掩码更小的 IP 地址范围。如需使用 CIDR 计算器,[ARIN](https://account.arin.net/public/cidrCalculator) 和其他几个组织提供了相关工具。如需了解有关 CIDR 表示法的更多信息,请参阅 [无类别域间路由(CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC 文档。


## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

:::note 仅适用于 PrivateLink 之外的连接
IP 访问列表仅适用于来自公共互联网的连接,不包括 [PrivateLink](/cloud/security/connectivity/private-networking)。
如果您只希望允许来自 PrivateLink 的流量,请在 IP 允许列表中设置 `DenyAll`。
:::

<details>
  <summary>ClickHouse 服务的 IP 访问列表</summary>

创建 ClickHouse 服务时,IP 允许列表的默认设置为"不允许任何来源"。

从 ClickHouse Cloud 服务列表中选择相应服务,然后选择 **Settings**。在 **Security** 部分下,您将找到 IP 访问列表。点击 Add IPs 按钮。

将出现一个侧边栏,提供以下配置选项:

- 允许来自任何位置的传入流量访问该服务
- 允许来自特定位置的访问
- 拒绝所有访问

</details>
<details>
  <summary>API 密钥的 IP 访问列表</summary>

创建 API 密钥时,IP 允许列表的默认设置为"允许任何来源"。

从 API 密钥列表中,点击 **Actions** 列下 API 密钥旁边的三个点,然后选择 **Edit**。在屏幕底部,您将找到 IP 访问列表和以下配置选项:

- 允许来自任何位置的传入流量访问该服务
- 允许来自特定位置的访问
- 拒绝所有访问

</details>

此屏幕截图显示了一个访问列表,该列表允许来自一系列 IP 地址的流量,描述为"NY Office range":

<Image
  img={ip_filtering_after_provisioning}
  size='md'
  alt='ClickHouse Cloud 中的现有访问列表'
  border
/>

### 可执行的操作 {#possible-actions}

1. 要添加额外的条目,您可以使用 **+ Add new IP**

此示例添加了一个单独的 IP 地址,描述为 `London server`:

<Image
  img={ip_filter_add_single_ip}
  size='md'
  alt='在 ClickHouse Cloud 中向访问列表添加单个 IP'
  border
/>

2. 删除现有条目

点击叉号 (x) 可删除条目

3. 编辑现有条目

直接修改条目内容

4. 切换为允许来自 **Anywhere** 的访问

不建议这样做,但这是允许的。我们建议您将构建在 ClickHouse 之上的应用程序公开给公众,并限制对后端 ClickHouse Cloud 服务的访问。

要应用您所做的更改,必须点击 **Save**。


## 验证 {#verification}

创建过滤器后,请确认可以从指定范围内连接到服务,并确认来自允许范围之外的连接会被拒绝。可以使用简单的 `curl` 命令进行验证:

```bash title="来自允许列表外的连接尝试被拒绝"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```

或

```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="来自允许列表内的连接尝试被允许"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
Ok.
```


## 限制 {#limitations}

- 目前，IP 访问列表仅支持 IPv4
