---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: '通过 ACME 自动签发 TLS 证书'
sidebar_position: 20
title: '配置 ACME 客户端'
description: '本指南提供简单且精简的配置，用于让 ClickHouse 使用 OpenSSL 证书验证连接。'
keywords: ['ACME 配置', 'TLS 设置', 'OpenSSL 证书', '安全连接', 'SRE 指南', 'Let`s Encrypt']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 通过 ACME 配置自动 TLS 证书签发 {#configuring-automatic-tls-provisioning-via-acme}

<ExperimentalBadge/>

<SelfManaged />

本指南介绍如何将 ClickHouse 配置为使用 [ACME](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) 协议（由 [RFC8555](https://www.rfc-editor.org/rfc/rfc8555) 定义）。
在启用 ACME 支持后，ClickHouse 可以从 [Let's Encrypt](https://letsencrypt.org/) 或 [ZeroSSL](https://zerossl.com/) 等证书提供者自动获取和续订证书。
TLS 加密保护客户端与 ClickHouse 服务器之间传输的数据，防止对敏感查询和结果的窃听。

## 概览 {#overview}

ACME 协议定义了使用 [Let&#39;s Encrypt](https://letsencrypt.org/) 或 [ZeroSSL](https://zerossl.com/) 等服务自动签发和续期证书的流程。简而言之，作为证书申请方的 ClickHouse 需要通过预定义的质询类型来验证域名所有权，以获取证书。

要启用 ACME，请配置 HTTP 与 HTTPS 端口以及 `acme` 块：

```xml
<http_port>80</http_port>
<https_port>443</https_port>

<acme>
    <email>valid_email@example.com</email>
    <terms_of_service_agreed>true</terms_of_service_agreed>
    <domains>
        <domain>example.com</domain>
    </domains>
</acme>
```

HTTP 端口在域名验证期间用于处理 ACME `HTTP-01` 质询请求（关于质询类型的更多信息见[此处](https://letsencrypt.org/docs/challenge-types/)）。验证完成并签发证书后，HTTPS 端口将使用获取到的证书为加密流量提供服务。

HTTP 端口本身不必是服务器上的 80 端口；可以通过 `nftables` 或类似工具进行端口重映射。请查阅 ACME 提供商的文档以了解 `HTTP-01` 质询所接受的端口。

在 `acme` 块中，我们定义用于账户创建的 `email`，并接受 ACME 服务的使用条款。
之后，我们只需要提供一个域名列表即可。


### 当前限制 {#current-limitations}

- 仅支持 `HTTP-01` 挑战类型。
- 仅支持 `RSA 2048` 密钥。
- 不处理速率限制。

## 配置参数 {#configuration-parameters}

`acme` 部分中可用的配置选项：

| 参数                                 | 默认值        | 描述 |
|--------------------------------------|---------------|-------------|
| `zookeeper_path`                     | `/clickhouse/acme`   | 在 ZooKeeper 中用于存储 ACME 账户数据、证书以及 ClickHouse 节点间协调状态的路径。 |
| `directory_url`                     | `https://acme-v02.api.letsencrypt.org/directory` | 用于签发证书的 ACME 目录端点。默认使用 Let’s Encrypt 的生产服务器。 |
| `email`                              |              | 用于创建和管理 ACME 账户的电子邮件地址。ACME 提供商可能会使用该地址发送过期提醒和重要更新。 |
| `terms_of_service_agreed`            | `false`       | 表示是否已接受 ACME 提供商的服务条款。必须设置为 `true` 才能启用 ACME。 |
| `domains`                            |              | 需要签发 TLS 证书的域名列表。每个域通过一个 `<domain>` 条目进行指定。 |
| `refresh_certificates_before`        | `2592000` (一个月，单位为秒)         | ClickHouse 将在证书到期前提前多长时间尝试续订证书。 |
| `refresh_certificates_task_interval` | `3600` (一小时，单位为秒)          | ClickHouse 检查证书是否需要续订的时间间隔。 |

请注意，配置默认使用 Let’s Encrypt 的生产目录。为避免因可能的错误配置而触发请求配额限制，建议先使用 [staging 目录（预发布环境）](https://letsencrypt.org/docs/staging-environment/) 测试证书签发流程。

# 管理 {#administration}

## 初始部署 {#initial-deployment}

在为具有多个副本的集群启用 ACME 客户端时，初始证书签发阶段需要格外注意。

第一个在启用 ACME 的情况下启动的副本会立即尝试创建一个 ACME 订单，并执行 HTTP-01 质询验证。如果此时只有部分副本在对外提供服务，那么质询很可能会失败，因为其他副本无法响应验证请求。

如果可能，建议暂时将流量路由到单个副本（例如，通过调整 DNS 记录），并允许其完成初始证书签发。一旦证书成功签发并存储到 Keeper 中，即可在其余副本上启用 ACME。它们会自动复用已有证书，并参与后续的续期过程。

如果无法将流量路由到单个副本，另一种方法是在启用 ACME 客户端之前，先将现有证书及其私钥手动上传到 Keeper 中。这样可以跳过初始验证步骤，使所有副本在启动时就已具备可用证书。

在初始证书签发或导入完成后，证书续期不需要特殊处理，因为所有副本此时都已运行 ACME 客户端，并通过 Keeper 共享状态。

## Keeper 的数据结构 {#keeper-data-structure}

```text
/clickhouse/acme
└── <acme-directory-host>
    ├── account_private_key          # ACME account private key (PEM)
    ├── challenges                   # Active HTTP-01 challenge state
    └── domains
        └── <domain-name>
            ├── certificate          # Issued TLS certificate (PEM)
            └── private_key          # Domain private key (PEM)
```


## 从其他 ACME 客户端迁移 {#migrating-from-other-acme-clients}

可以将当前正在使用的 TLS 证书和私钥迁移到 Keeper，以简化迁移过程。
目前，服务器端仅支持 `RSA 2048` 密钥。

假设我们正从 `certbot` 迁移，并且使用 `/etc/letsencrypt/live` 目录，可以使用以下命令：

```bash
DOMAIN=example.com
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
ZK_BASE=/clickhouse/acme/acme-v02.api.letsencrypt.org/domains/$DOMAIN

clickhouse keeper-client -q "create '/clickhouse' ''"
clickhouse keeper-client -q "create '/clickhouse/acme' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org/domains' ''"
clickhouse keeper-client -q "create '$ZK_BASE' ''"

clickhouse keeper-client -q "create '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""

clickhouse keeper-client -q "create '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
```
