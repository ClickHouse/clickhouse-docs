---
sidebar_label: Connection Tips
sidebar_position: 3
slug: /en/integrations/tableau/connection-tips
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: Tableau connection tips when using ClickHouse official connector.
---

# Connection tips
## Initial SQL tab
If the *Set Session ID* checkbox is activated on the Advanced tab (by default), feel free to set session level [settings](https://clickhouse.com/docs/en/operations/settings/settings/) using
```
SET my_setting=value;
``` 
## Advanced tab
In 99% of cases you don't need the Advanced tab, for the remaining 1% you can use the following settings:
- **Custom Connection Parameters**. By default, `socket_timeout` is already specified, this parameter may need to be changed if some extracts are updated for a very long time. The value of this parameter is specified in milliseconds. The rest of the parameters can be found [here](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java), add them in this field separated by commas
- **JDBC Driver custom_http_params**. This field allows you to drop some parameters into the ClickHouse connection string by passing values to the [`custom_http_params` parameter of the driver](https://github.com/ClickHouse/clickhouse-jdbc#configuration). For example, this is how `session_id` is specified when the *Set Session ID* checkbox is activated
- **JDBC Driver typeMappings**. This field allows you to [pass a list of ClickHouse data type mappings to Java data types used by the JDBC driver](https://github.com/ClickHouse/clickhouse-jdbc#configuration). The connector automatically displays large Integers as strings thanks to this parameter, you can change this by passing your mapping set *(I do not know why)* using
    ```
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  Read more about mapping in the corresponding section

- **JDBC Driver URL Parameters**. You can pass the remaining [driver parameters](https://github.com/ClickHouse/clickhouse-jdbc#configuration), for example `jdbcCompliance`, in this field. Be careful, the parameter values must be passed in the URL Encoded format, and in the case of passing `custom_http_params` or `typeMappings` in this field and in the previous fields of the Advanced tab, the values of the preceding two fields on the Advanced tab have a higher priority
- **Set Session ID** checkbox. It is needed to set session-level settings in Initial SQL tab, generates a `session_id` with a timestamp and a pseudo-random number in the format "tableau-jdbc-connector-*{timestamp}*-*{number}*"
## Limited support for UInt64, Int128, (U)Int256 data types
By default, the driver displays fields of types *UInt64, Int128, (U)Int256* as strings, **but it displays, not converts**. This means that when you try to write the next calculated field, you will get an error
```
LEFT([myUInt256], 2) // Error!
```
In order to work with large Integer fields as with strings, it is necessary to explicitly wrap the field in the STR() function
```
LEFT(STR([myUInt256]), 2) // Works well!
```
However, such fields are most often used to find the number of unique values *(IDs as Watch ID, Visit ID in Yandex.Metrika)* or as a *Dimension* to specify the detail of the visualization, it works well.
```
COUNTD([myUInt256]) // Works well too!
```
When using the data preview (View data) of a table with UInt64 fields, an error does not appear now.