---
sidebar_label: '设置 IP 过滤器'
slug: /cloud/security/setting-ip-filters
title: '设置 IP 过滤器'
description: '本页介绍如何在 ClickHouse Cloud 中设置 IP 过滤器，以控制对 ClickHouse 服务的访问。'
doc_type: 'guide'
keywords: ['IP 过滤器', 'IP 访问列表']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';


## 设置 IP 过滤器 {#setting-ip-filters}

IP 访问列表通过指定允许连接的源地址来过滤到 ClickHouse 服务或使用 API 密钥的流量。可以为每个服务和每个 API 密钥分别配置这些列表。列表既可以在创建服务或 API 密钥时配置，也可以在之后进行配置。

:::important
如果在创建 ClickHouse Cloud 服务时跳过 IP 访问列表的创建，那么将不允许任何流量访问该服务。如果 ClickHouse 服务的 IP 访问列表设置为 `Allow from anywhere`，互联网爬虫和扫描器在查找公共 IP 时，可能会周期性地将您的服务从空闲状态切换为活动状态，从而产生少量意料之外的费用。
:::



## 准备 {#prepare}

在开始之前，先收集需要添加到访问列表中的 IP 地址或地址段。请将远程办公人员、值班地点、VPN 等访问来源一并考虑在内。IP 访问列表的用户界面同时支持单个地址和 CIDR 表示法。

无类别域间路由（Classless Inter-domain Routing，CIDR）表示法允许你指定比传统 A、B 或 C 类（8、6 或 24）子网掩码长度更小的 IP 地址范围。[ARIN](https://account.arin.net/public/cidrCalculator) 和其他一些组织提供了 CIDR 计算器可供使用，如果你想了解更多关于 CIDR 表示法的信息，请参阅 [Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC。



## 创建或修改 IP 访问列表 {#create-or-modify-an-ip-access-list}

:::note 仅适用于未通过 PrivateLink 的连接
IP 访问列表仅适用于来自公共互联网、即 [PrivateLink](/cloud/security/connectivity/private-networking) 之外的连接。
如果只希望接收来自 PrivateLink 的流量，请在 IP Allow list 中设置 `DenyAll`。
:::

<details>
  <summary>ClickHouse 服务的 IP 访问列表</summary>

  创建 ClickHouse 服务时，IP Allow list 的默认设置为“Allow from nowhere”。
  
  在 ClickHouse Cloud 服务列表中选择该服务，然后选择 **Settings**。在 **Security** 部分可以找到 IP 访问列表。点击 **Add IPs** 按钮。
  
  会打开一个侧边栏，可在其中进行如下配置：
  
- 允许来自任意位置到该服务的入站流量
- 允许来自特定位置到该服务的访问
- 拒绝所有到该服务的访问
  
</details>
<details>
  <summary>API key 的 IP 访问列表</summary>

  创建 API key 时，IP Allow list 的默认设置为“Allow from anywhere”。
  
  在 API key 列表中，点击该 API key 所在行 **Actions** 列中的三个点，然后选择 **Edit**。在页面底部可以看到 IP 访问列表以及可配置的选项：

- 允许来自任意位置到该服务的入站流量
- 允许来自特定位置到该服务的访问
- 拒绝所有到该服务的访问
  
</details>

下图展示了一个访问列表，它允许来自一段 IP 地址范围的流量，描述为 “NY Office range”：
  
<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloud 中现有的访问列表" border/>

### 可执行的操作 {#possible-actions}

1. 要添加一条新条目，可以使用 **+ Add new IP**

  以下示例添加了一个单一 IP 地址，描述为 `London server`：

<Image img={ip_filter_add_single_ip} size="md" alt="在 ClickHouse Cloud 中向访问列表添加单个 IP" border/>

2. 删除现有条目

  点击叉号 (x) 可以删除一个条目

3. 编辑现有条目

  直接修改该条目

4. 切换为允许从 **Anywhere** 访问

  不推荐这样做，但这是允许的。建议将构建在 ClickHouse 之上的应用暴露给公网，并限制对后端 ClickHouse Cloud 服务的访问。

要应用所做的更改，必须点击 **Save**。



## 验证 {#verification}

创建过滤器后，先在允许的范围内确认可以连接到某个服务，再确认来自该范围之外的连接会被拒绝。可以使用一个简单的 `curl` 命令进行验证：

```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
curl: (35) error:02FFF036:system library:func(4095):连接被对端重置
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

- 目前，IP 访问列表仅支持 IPv4 地址
