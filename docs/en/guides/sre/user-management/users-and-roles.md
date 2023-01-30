---
sidebar_label: Defining SQL Users and Roles
sidebar_position: 20
slug: /en/guides/sre/users-and-roles
hide_table_of_contents: true
---

import Content from '@site/docs/en/_snippets/_users-and-roles-common.md';

# Defining SQL Users and Roles

:::tip
If you are working in ClickHouse Cloud please see [Cloud users and roles](/docs/en/cloud/manage/users-and-roles.md).
:::

This article shows the basics of defining SQL users and roles and applying those privileges and permissions to databases, tables, rows, and columns.

## Enabling SQL user mode

1.  Enable SQL user mode in the `users.xml` file under the `<default>` user:
    ```xml
    <access_management>1</access_management>
    ```

    :::note
    The `default` user is the only user that gets created with a fresh install and is also the account used for internode communications, by default.

    In production, it is recommended to disable this user once the inter-node communication has been configured with a SQL admin user and inter-node communications have been set with `<secret>`, cluster credentials, and/or internode HTTP and transport protocol credentials since the `default` account is used for internode communication.
    :::

2. Restart the nodes to apply the changes.

3. Start the ClickHouse client:
    ```sql
    clickhouse-client --user default --password <password>
    ```
## Defining users

1. Create a SQL administrator account:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. Grant the new user full administrative rights
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

<Content />
