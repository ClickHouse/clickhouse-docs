---
sidebar_label: Quick Start
sidebar_position: 1
slug: /en/integrations/grafana
description: Introduction to using ClickHouse with Grafana
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_native.md';

# ClickHouse data source plugin for Grafana

With Grafana you can explore and share all of your data through dashboards.
Grafana requires a plugin to connect to ClickHouse, which is easily installed within their UI.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/bRce9xWiqQM"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 1. Gather your connection details
<ConnectionDetails />

## 2. Making a read-only user

When connecting ClickHouse to a data visualization tool like Grafana, it is recommended to make a read-only user to protect your data from unwanted modifications.

Grafana does not validate that queries are safe. Queries can contain any SQL statement, including `DELETE` and `INSERT`.

To configure a read-only user, follow these steps:
1. Create a `readonly` user profile following the [Creating Users and Roles in ClickHouse](/docs/en/operations/access-rights) guide.
2. Ensure the `readonly` user has enough permission to modify the `max_execution_time` setting required by the underlying [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go).
3. If you're using a public ClickHouse instance, it is not recommended to set `readonly=2` in the `readonly` profile. Instead, leave `readonly=1` and set the constraint type of `max_execution_time` to [changeable_in_readonly](/docs/en/operations/settings/constraints-on-settings) to allow modification of this setting.

## 3.  Install the ClickHouse Plugin for Grafana

Before Grafana can connect to ClickHouse, you need to install the appropriate Grafana plugin. Assuming you are logged in to Grafana, follow these steps:

1. From the **Connections** page in the sidebar, select the **Add new connection** tab.

2. Search for **ClickHouse** and click on the signed plugin by Grafana Labs:

    <img src={require('./images/search.png').default} class="image" alt="Select the ClickHouse plugin on the connections page" />

3. On the next screen, click the **Install** button:

    <img src={require('./images/install.png').default} class="image" alt="Install the ClickHouse plugin" />

## 4. Define a ClickHouse data source

1. Once the installation is complete, click the **Add new data source** button. (You can also add a data source from the **Data sources** tab on the **Connections** page.)

    <img src={require('./images/add_new_ds.png').default} class="image" alt="Create a ClickHouse data source" />

2. Either scroll down and find the **ClickHouse** data source type, or you can search for it in the search bar of the **Add data source** page. Select the **ClickHouse** data source and the following page will appear:

  <img src={require('./images/quick_config.png').default} class="image" alt="Connection configuration page" />

3. Enter your server settings and credentials. The key settings are:

- **Server host address:** the hostname of your ClickHouse service.
- **Server port:** the port for your ClickHouse service. Will be different depending on server configuration and protocol.
- **Protocol** the protocol used to connect to your ClickHouse service.
- **Secure connection** enable if your server requires a secure connection.
- **Username** and **Password**: enter your ClickHouse user credentials. If you have not configured any users, try `default` for the username. It is recommended to [configure a read-only user](#2-making-a-read-only-user).

For more settings, check the [plugin configuration](./config.md) documentation.

4. Click the **Save & test** button to verify that Grafana can connect to your ClickHouse service. If successful, you will see a **Data source is working** message:

    <img src={require('./images/valid_ds.png').default} class="image" alt="Select Save & test" />

## 5. Next Steps

Your data source is now ready to use! Learn more about how to build queries with the [query builder](./query-builder.md).

For more details on configuration, check the [plugin configuration](./config.md) documentation.

If you're looking for more information that is not included in these docs, check the [plugin repository on GitHub](https://github.com/grafana/clickhouse-datasource).

## Upgrading Plugin Versions

Starting with v4, configurations and queries are able to be upgraded as new versions are released.

Configurations and queries from v3 are migrated to v4 as they are opened. While the old configurations and dashboards will load in v4, the migration is not persisted until they are saved again in the new version. If you notice any issues when opening an old configuration/query, discard your changes and [report the issue on GitHub](https://github.com/grafana/clickhouse-datasource/issues).

The plugin cannot downgrade to previous versions if the configuration/query was created with a newer version.

## Related content

- [Plugin Repository on GitHub](https://github.com/grafana/clickhouse-datasource)
- Blog: [Visualizing Data with ClickHouse - Part 1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- Blog: [Visualizing ClickHouse Data with Grafana - Video](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- Blog: [ClickHouse Grafana plugin 4.0 - Leveling up SQL Observability](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- Blog: [Getting Data Into ClickHouse - Part 3 - Using S3](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- Blog: [Building an Observability Solution with ClickHouse - Part 1 - Logs](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Blog: [Building an Observability Solution with ClickHouse - Part 2 - Traces](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- Blog & Webinar: [A Story of Open-source GitHub Activity using ClickHouse + Grafana](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
