---
sidebar_label: SSL User Certificate Authentication
sidebar_position: 3
slug: /en/guides/sre/ssl-user-auth
---

# Configuring SSL User Certificate for Authentication
import SelfManaged from '@site/docs/en/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

This guide provides simple and minimal settings to configure authentication with SSL user certificates. The tutorial builds on the [Configuring SSL-TLS user guide](../configuring-ssl.md).

:::note
SSL user authentication is supported when using the `https` or native interfaces only.
It is not currently used in gRPC or PostgreSQL/MySQL emulation ports.

ClickHouse nodes need `<verificationMode>strict</verificationMode>` set for secure authentication (although `relaxed` will work for testing purposes).
:::

## 1. Create SSL user certificates

:::note
This example uses self-signed certificates with a self-signed CA. For production environments, create a CSR and submit to your PKI team or certificate provider to obtain a proper certificate.
:::


1. Generate a Certificate Signing Request (CSR) and key. The basic format is the following:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    In this example, we'll use this for the domain and user that will be used in this sample environment:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    The CN is arbitrary and any string can be used as an identifier for the certicate. It is used when creating the user in the following steps.
    :::

2.  Generate and sign the new user certificate that will be used for authentication. The basic format is the following:
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CAcreateserial -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    In this example, we'll use this for the domain and user that will be used in this sample environment:
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CAcreateserial -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. Create a SQL user and grant permissions

:::note
For details on how to enable SQL users and set roles, refer to [Defining SQL Users and Roles](index.md) user guide.
:::

1. Create a SQL user defined to use the certiciate authentication:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. Grant privileges to the new certicate user:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    The user is granted full admin privileges in this exercise for demostration purposes. Refer to the ClickHouse [RBAC documentation](/docs/en/guides/sre/user-management/index.md) for permissions settings.
    :::

    :::note
    We recommend using SQL to define users and roles. However, if you are currently defining users and roles in configuration files, the user will look like:
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


## 3. Testing

1. Copy the user certificate, user key and CA certificate to a remote node.

2. Configure OpenSSL in the ClickHouse [client config](/docs/en/interfaces/cli.md#configuration_files) with certificate and paths.

    ```xml
    <openSSL>
        <certificateFile>my_cert_name.crt</certificateFile>
        <privateKeyFile>my_cert_name.key</privateKeyFile>
        <caConfig>my_ca_cert.crt</caConfig>
    </openSSL>
    ```

3. Run `clickhouse-client`.
    ```
    clickhouse-client --user <my_user> --query 'SHOW TABLES'
    ```
    :::note
    Note that the password passed to clickhouse-client is ignored when a certificate is specified in the config.
    :::


## 4. Testing HTTP

1. Copy the user certificate, user key and CA certificate to a remote node.

2. Use `curl` to test a sample SQL command. The basic format is:
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    For example:
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    The output will be similar to the following:
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    Notice that no password was specified, the certificate is used in lieu of a password and is how ClickHouse will authenticate the user.
    :::


## Summary

This article showed the basics of creating and configuring a user for SSL certificate authentication. This method can be used with `clickhouse-client` or any clients which support the `https` interface and where HTTP headers can be set. The generated certicate and key should be kept private and with limited access since the certificate is used to authenticate and authorize the user for operations on the ClickHouse database. Treat the certificate and key as if they were passwords.
