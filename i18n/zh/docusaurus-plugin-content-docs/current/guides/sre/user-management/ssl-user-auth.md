---
'sidebar_label': 'SSL 用户证书身份验证'
'sidebar_position': 3
'slug': '/guides/sre/ssl-user-auth'
'title': '配置 SSL 用户证书用于身份验证'
'description': '本指南提供简单和最低限度的设置，以使用 SSL 用户证书配置身份验证。'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 配置 SSL 用户证书进行认证
<SelfManaged />

本指南提供了简单且最小化的设置以配置使用 SSL 用户证书进行认证。该教程基于[配置 SSL-TLS 用户指南](../configuring-ssl.md)。

:::note
在使用 `https`、`native`、`mysql` 和 `postgresql` 接口时支持 SSL 用户认证。

ClickHouse 节点需要设置 `<verificationMode>strict</verificationMode>` 以实现安全认证（尽管 `relaxed` 在测试目的时是可行的）。

如果您使用 AWS NLB 与 MySQL 接口，您需要联系 AWS 支持以启用未 documented 的选项：

> 我希望能够像下面这样配置我们的 NLB 代理协议 v2 `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`。
:::

## 1. 创建 SSL 用户证书 {#1-create-ssl-user-certificates}

:::note
本示例使用自签名证书和自签名 CA。对于生产环境，请创建 CSR 并提交给您的 PKI 团队或证书提供商以获取适当的证书。
:::

1. 生成证书签署请求 (CSR) 和密钥。基本格式如下：
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
```
    在此示例中，我们将为该示例环境中将使用的域和用户使用此内容：
```bash
openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
```
    :::note
    CN 是任意的，任何字符串都可以用作证书的标识符。它将在创建用户的以下步骤中使用。
    :::

2. 生成并签署将用于认证的新用户证书。基本格式如下：
```bash
openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
```
    在此示例中，我们将为该示例环境中将使用的域和用户使用此内容：
```bash
openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
```

## 2. 创建 SQL 用户并授予权限 {#2-create-a-sql-user-and-grant-permissions}

:::note
有关如何启用 SQL 用户和设置角色的详细信息，请参阅[定义 SQL 用户和角色](index.md) 用户指南。
:::

1. 创建一个 SQL 用户，定义为使用证书认证：
```sql
CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
```

2. 授予新证书用户权限：
```sql
GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
```
    :::note
    在本练习中，出于演示目的，用户被授予完全的管理员权限。有关权限设置，请参考 ClickHouse [RBAC 文档](/guides/sre/user-management/index.md)。
    :::

    :::note
    我们建议使用 SQL 定义用户和角色。然而，如果您当前在配置文件中定义用户和角色，则用户将如下所示：
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

2. 在 ClickHouse [客户端配置](/interfaces/cli.md#configuration_files) 中配置 OpenSSL，并设置证书和路径。

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
    请注意，当在配置中指定证书时，传递给 clickhouse-client 的密码会被忽略。
    :::


## 4. 测试 HTTP {#4-testing-http}

1. 将用户证书、用户密钥和 CA 证书复制到远程节点。

2. 使用 `curl` 测试一个示例 SQL 命令。基本格式如下：
```bash
echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
```
    例如：
```bash
echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
```
    输出将类似于以下内容：
```response
INFORMATION_SCHEMA
default
information_schema
system
```
    :::note
    请注意，没有指定密码，证书用于替代密码，并且是 ClickHouse 认证用户的方式。
    :::


## 总结 {#summary}

本文展示了创建和配置 SSL 证书认证用户的基础知识。此方法可以与 `clickhouse-client` 或任何支持 `https` 接口且可以设置 HTTP 头的客户端一起使用。生成的证书和密钥应保持私密并限制访问，因为证书用于认证和授权用户在 ClickHouse 数据库上的操作。将证书和密钥视为密码对待。
