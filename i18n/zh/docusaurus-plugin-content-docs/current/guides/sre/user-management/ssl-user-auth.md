---
sidebar_label: 'SSL 用户证书身份验证'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: '配置用于身份验证的 SSL 用户证书'
description: '本指南提供配置基于 SSL 用户证书的身份验证所需的简洁、最小化设置。'
doc_type: 'guide'
keywords: ['ssl', '身份验证', '安全', '证书', '用户管理']
---

# 配置用于身份验证的 SSL 用户证书 {#configuring-ssl-user-certificate-for-authentication}

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

本指南提供了通过 SSL 用户证书配置认证所需的简单且最小化的配置。该教程建立在[配置 SSL-TLS 用户指南](../configuring-ssl.md)的基础之上。

:::note
在使用 `https`、`native`、`mysql` 和 `postgresql` 接口时支持 SSL 用户认证。

为实现安全认证，ClickHouse 节点需要将 `<verificationMode>strict</verificationMode>` 进行严格模式配置（尽管 `relaxed` 可用于测试目的）。

如果你在 MySQL 接口前使用 AWS NLB，则必须联系 AWS 支持启用以下未公开的选项：

> 我希望能够将我们的 NLB proxy protocol v2 配置为如下所示：`proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`。
> :::

## 1. 创建 SSL 用户证书 {#1-create-ssl-user-certificates}

:::note
本示例使用由自签名 CA 签发的自签名证书。对于生产环境，请创建 CSR 并提交给 PKI 团队或证书提供商以获取正式证书。
:::

1. 生成证书签名请求（CSR）和密钥。基本格式如下：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    在此示例中，我们将在本示例环境中为要使用的域和用户生成 CSR：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CN 值是任意的，任何字符串都可以用作证书标识符。后续步骤在创建用户时会用到该值。
    :::

2.  生成并签署将用于身份验证的新用户证书。基本格式如下：
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    在此示例中，我们将在本示例环境中为要使用的域和用户生成证书：
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. 创建 SQL 用户并授予权限 {#2-create-a-sql-user-and-grant-permissions}

:::note
有关如何启用 SQL 用户和设置角色的详细信息，请参阅用户指南：[Defining SQL Users and Roles](index.md)。
:::

1. 创建一个基于证书认证的 SQL 用户：
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. 为新的证书用户授予权限：
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    在本练习中，为演示目的向该用户授予了完全的管理员权限。有关权限设置，请参阅 ClickHouse [RBAC 文档](/guides/sre/user-management/index.md)。
    :::

    :::note
    建议使用 SQL 定义用户和角色。不过，如果当前是通过配置文件定义用户和角色，则用户配置类似于：
    ```xml
    <users>
        <cert_user>
            <ssl_certificates>
                <common_name>chnode1.marsnet.local:cert_user</common_name>
            </ssl_certificates>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <access_management>1</access_management>
            <!-- 其他选项 -->
        </cert_user>
    </users>
    ```
    :::

## 3. 测试 {#3-testing}

1. 将用户证书、用户密钥和 CA 证书复制到某个远程节点。

2. 在 ClickHouse 的 [客户端配置](/interfaces/cli.md#configuration_files) 中使用证书及其路径配置 OpenSSL。

    ```xml
    <openSSL>
        <client>
            <certificateFile>my_cert_name.crt</certificateFile>
            <privateKeyFile>my_cert_name.key</privateKeyFile>
            <caConfig>my_ca_cert.crt</caConfig>
        </client>
    </openSSL>
    ```

3. 运行 `clickhouse-client`。
    ```bash
    clickhouse-client --user <my_user> --query 'SHOW TABLES'
    ```
    :::note
    请注意，当在配置中指定了证书时，传递给 clickhouse-client 的密码会被忽略。
    :::

## 4. 测试 HTTP {#4-testing-http}

1. 将用户证书、用户私钥和 CA 证书复制到一个远程节点上。

2. 使用 `curl` 测试一条示例 SQL 命令。基本格式如下：
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    例如：
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    输出类似如下：
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    请注意，这里没有指定密码。证书用来替代密码，这是 ClickHouse 对用户进行身份验证的方式。
    :::

## 摘要 {#summary}

本文介绍了为 SSL 证书认证创建和配置用户的基本方法。此方法可用于 `clickhouse-client`，或任何支持 `HTTPS` 接口且可以设置 HTTP 头部的客户端。由于生成的证书和密钥用于对用户在 ClickHouse 数据库上的操作进行认证和授权，因此必须妥善保管，并严格限制访问权限。请像对待密码一样对待该证书和密钥。
