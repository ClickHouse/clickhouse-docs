---
sidebar_label: 'SSL 用户证书身份验证'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: '配置用于身份验证的 SSL 用户证书'
description: '本指南提供用于配置基于 SSL 用户证书身份验证的简单且最小化设置。'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---



# 配置 SSL 用户证书用于身份验证

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

本指南提供了一些简单且最小化的设置，用于使用 SSL 用户证书配置身份验证。本教程基于 [Configuring SSL-TLS user guide](../configuring-ssl.md)。

:::note
在使用 `https`、`native`、`mysql` 和 `postgresql` 接口时，支持基于 SSL 的用户身份验证。

为了实现安全的身份验证，需要在 ClickHouse 节点上将 `<verificationMode>strict</verificationMode>` 设为启用（虽然 `relaxed` 可用于测试目的）。

如果在使用 MySQL 接口时配合 AWS NLB，则必须联系 AWS 支持以启用未公开的选项：

> I would like to be able to configure our NLB proxy protocol v2 as below `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
> :::


## 1. 创建 SSL 用户证书 {#1-create-ssl-user-certificates}

:::note
本示例使用自签名 CA 签发的自签名证书。在生产环境中,应创建 CSR 并提交给您的 PKI 团队或证书提供商以获取正式证书。
:::

1. 生成证书签名请求(CSR)和密钥。基本格式如下:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
   ```

   在本示例中,我们将为示例环境中使用的域和用户执行以下命令:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
   ```

   :::note
   CN 可以是任意字符串,用作证书的标识符。在后续步骤中创建用户时会用到它。
   :::

2. 生成并签署用于身份验证的新用户证书。基本格式如下:
   ```bash
   openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
   ```
   在本示例中,我们将为示例环境中使用的域和用户执行以下命令:
   ```bash
   openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
   ```


## 2. 创建 SQL 用户并授予权限 {#2-create-a-sql-user-and-grant-permissions}

:::note
有关如何启用 SQL 用户和设置角色的详细信息,请参阅[定义 SQL 用户和角色](index.md)用户指南。
:::

1. 创建一个使用证书身份验证的 SQL 用户:

   ```sql
   CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
   ```

2. 向新的证书用户授予权限:

   ```sql
   GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
   ```

   :::note
   在本练习中,为演示目的向该用户授予了完整的管理员权限。有关权限设置,请参阅 ClickHouse [RBAC 文档](/guides/sre/user-management/index.md)。
   :::

   :::note
   我们建议使用 SQL 来定义用户和角色。但是,如果您当前在配置文件中定义用户和角色,则用户配置如下所示:

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
           <!-- additional options-->
       </cert_user>
   </users>
   ```

   :::


## 3. 测试 {#3-testing}

1. 将用户证书、用户密钥和 CA 证书复制到远程节点。

2. 在 ClickHouse [客户端配置](/interfaces/cli.md#configuration_files)中配置 OpenSSL 证书和路径。

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
   注意:当配置中指定了证书时,传递给 clickhouse-client 的密码将被忽略。
   :::


## 4. 测试 HTTP {#4-testing-http}

1. 将用户证书、用户密钥和 CA 证书复制到远程节点。

2. 使用 `curl` 测试示例 SQL 命令。基本格式为：
   ```bash
   echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
   ```
   例如：
   ```bash
   echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
   ```
   输出结果类似如下：
   ```response
   INFORMATION_SCHEMA
   default
   information_schema
   system
   ```
   :::note
   请注意，此处未指定密码,证书用于替代密码,ClickHouse 通过证书对用户进行身份验证。
   :::


## 总结 {#summary}

本文介绍了为 SSL 证书身份验证创建和配置用户的基础知识。此方法可与 `clickhouse-client` 或任何支持 `https` 接口且可设置 HTTP 请求头的客户端配合使用。生成的证书和密钥应妥善保管并严格限制访问权限,因为证书用于对 ClickHouse 数据库操作进行用户身份验证和授权。请像对待密码一样妥善保管证书和密钥。
