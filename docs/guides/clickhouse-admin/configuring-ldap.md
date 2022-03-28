---
sidebar_label: Configuring LDAP
sidebar_position: 20
---

# Configuring ClickHouse to use LDAP for authentication and role mapping

ClickHouse can be configured to use LDAP to authenticate ClickHouse database users.
This guide provides a simple example of integrating ClickHouse with an LDAP system authenticating to a publicly available directory.

***In the following procedures the ClickHouse CLI is used.***

## 1. Configure LDAP connection settings in ClickHouse
1. Test connection to public ldap server:
```bash
$ ldapsearch -x -b dc=example,dc=com -H ldap://ldap.forumsys.com
```

the reply will be something like this:
```
# extended LDIF
#
# LDAPv3
# base <dc=example,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# example.com
dn: dc=example,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: example.com
dc: example
...
```

2. Edit the `config.xml` file and add the following to configure ldap settings
```xml
    <ldap_servers>
        <test_ldap_server>
           <host>ldap.forumsys.com</host>
           <port>389</port>
           <bind_dn>uid={user_name},dc=example,dc=com</bind_dn>
           <enable_tls>no</enable_tls>
           <tls_require_cert>never</tls_require_cert>
        </test_ldap_server>
    </ldap_servers>
```

_*the `<test_ldap_server>` tags is an arbitrary label to identify a particular ldap server_

These are the basic settings used above:

|Parameter |Description                   |Example              |
|----------|------------------------------|---------------------|
|host      |hostname or IP of LDAP server |ldap.forumsys.com    |
|port      |directory port for LDAP server|389                  |
|bind_dn   |template path to users        |uid={user_name},dc=example,dc=com|
|enable_tls|whether to use secure ldap    |no     |
|tls_require_cert |whether to require certificate for connection|never|

:::note
In this example, since the public server uses 389 and does not use secure port, we disable TLS to allow it to connect for demonstration purposes.
:::

**Below is link to the full configuration parameters available for the server definitions:**

https://clickhouse.com/docs/en/operations/external-authenticators/ldap/#ldap-server-definition

3. Add the `<ldap>` section to `<user_directories>` section to configure the user role mapping

This section defines when a user is authenticated, what role the user will receive. In this basic example, any user authenticating to LDAP will receive the `scientists_role` which will be defined at a later step in ClickHouse.

The section should look similar to this:

```xml
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
        <ldap>
              <server>test_ldap_server</server>
              <roles>
                 <scientists_role />
              </roles>
              <role_mapping>
                 <base_dn>dc=example,dc=com</base_dn>
                 <search_filter>(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))</search_filter>
                 <attribute>cn</attribute>
              </role_mapping>
        </ldap>
    </user_directories>
 ```

These are the basic settings used above:

|Parameter |Description                   |Example              |
|----------|------------------------------|---------------------|
|server    |label defined in the prior ldap_servers section|test_ldap_server|
|roles      |name of the roles defined in ClickHouse the users will be mapped to|scientists_role|
|base_dn   |base path to start search for groups with user        |dc=example,dc=com|
|search_filter|ldap search filter to identify groups to select for mapping users    |(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={bind_dn}))|
|attribute |which attribute name should value be returned from|cn|


**Below is link to the full configuration parameters available for the ldap group and role mapping:**

https://clickhouse.com/docs/en/operations/external-authenticators/ldap/#ldap-external-user-directory

4. Restart ClickHouse server to apply settings.

## 2. Configure ClickHouse database roles and permissions

:::note
The procedures in this section assumes that SQL Access Control and Account Management in ClickHouse has been enabled. To enable see SQL Users and Roles admin guide.
:::

1. Create a role in clickhouse with the same name used in the role mapping section of the `config.xml` file
```sql
CREATE ROLE scientists_role;
```

2. Grant needed privileges to the role:

_*for demonstration purposes, the following grants admin privileges to any user able to authenticate through ldap._

```sql
GRANT ALL ON *.* TO scientists_role;
```

## 3. Test the LDAP configuration

1. Login using the ClickHouse client
```bash
$ clickhouse-client --user einstein --password password
ClickHouse client version 22.2.2.1.
Connecting to localhost:9000 as user einstein.
Connected to ClickHouse server version 22.2.2 revision 54455.

chnode1 :)
```

:::note
Use the `ldapsearch` command in step 1 to view all of the users available in the directory and for all of the users the password is `password`
:::

2.  Test that the user was mapped correctly to the `scientists_role` role and has admin permissions
```sql
chnode1 :) SHOW DATABASES;

SHOW DATABASES

Query id: 93b785ff-1482-4eda-95b0-b2d68b2c5e0f

┌─name───────────────┐
│ INFORMATION_SCHEMA │
│ db1_mysql          │
│ db2                │
│ db3                │
│ db4_mysql          │
│ db5_merge          │
│ default            │
│ information_schema │
│ system             │
└────────────────────┘

9 rows in set. Elapsed: 0.004 sec.
```

## 4. Summary
This article demostrated the basics of configuring ClickHouse to authenticate to an LDAP server and also to map to a role.  There are also options for configuring individual users in ClickHouse but having those users be authenticated by LDAP without configuring automated role mapping. The LDAP module can also be used to connect to Active Directory.


