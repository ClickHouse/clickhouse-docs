---
sidebar_label: 'SQL Console'
sidebar_position: 1
title: 'SQL Console'
slug: /integrations/sql-clients/sql-console
description: 'Learn about SQL Console'
doc_type: 'guide'
keywords: ['sql console', 'query interface', 'web ui', 'sql editor', 'cloud console']
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Image from '@theme/IdealImage';
import table_list_and_schema from '@site/static/images/cloud/sqlconsole/table-list-and-schema.png';
import view_columns from '@site/static/images/cloud/sqlconsole/view-columns.png';
import abc from '@site/static/images/cloud/sqlconsole/abc.png';
import inspecting_cell_content from '@site/static/images/cloud/sqlconsole/inspecting-cell-content.png';
import sort_descending_on_column from '@site/static/images/cloud/sqlconsole/sort-descending-on-column.png';
import filter_on_radio_column_equal_gsm from '@site/static/images/cloud/sqlconsole/filter-on-radio-column-equal-gsm.png';
import add_more_filters from '@site/static/images/cloud/sqlconsole/add-more-filters.png';
import filtering_and_sorting_together from '@site/static/images/cloud/sqlconsole/filtering-and-sorting-together.png';
import create_a_query_from_sorts_and_filters from '@site/static/images/cloud/sqlconsole/create-a-query-from-sorts-and-filters.png';
import creating_a_query from '@site/static/images/cloud/sqlconsole/creating-a-query.png';
import run_selected_query from '@site/static/images/cloud/sqlconsole/run-selected-query.png';
import run_at_cursor_2 from '@site/static/images/cloud/sqlconsole/run-at-cursor-2.png';
import run_at_cursor from '@site/static/images/cloud/sqlconsole/run-at-cursor.png';
import cancel_a_query from '@site/static/images/cloud/sqlconsole/cancel-a-query.png';
import sql_console_save_query from '@site/static/images/cloud/sqlconsole/sql-console-save-query.png';
import sql_console_rename from '@site/static/images/cloud/sqlconsole/sql-console-rename.png';
import sql_console_share from '@site/static/images/cloud/sqlconsole/sql-console-share.png';
import sql_console_edit_access from '@site/static/images/cloud/sqlconsole/sql-console-edit-access.png';
import sql_console_add_team from '@site/static/images/cloud/sqlconsole/sql-console-add-team.png';
import sql_console_edit_member from '@site/static/images/cloud/sqlconsole/sql-console-edit-member.png';
import sql_console_access_queries from '@site/static/images/cloud/sqlconsole/sql-console-access-queries.png';
import search_hn from '@site/static/images/cloud/sqlconsole/search-hn.png';
import match_in_body from '@site/static/images/cloud/sqlconsole/match-in-body.png';
import pagination from '@site/static/images/cloud/sqlconsole/pagination.png';
import pagination_nav from '@site/static/images/cloud/sqlconsole/pagination-nav.png';
import download_as_csv from '@site/static/images/cloud/sqlconsole/download-as-csv.png';
import tabular_query_results from '@site/static/images/cloud/sqlconsole/tabular-query-results.png';
import switch_from_query_to_chart from '@site/static/images/cloud/sqlconsole/switch-from-query-to-chart.png';
import trip_total_by_week from '@site/static/images/cloud/sqlconsole/trip-total-by-week.png';
import bar_chart from '@site/static/images/cloud/sqlconsole/bar-chart.png';
import change_from_bar_to_area from '@site/static/images/cloud/sqlconsole/change-from-bar-to-area.png';
import update_query_name from '@site/static/images/cloud/sqlconsole/update-query-name.png';
import update_subtitle_etc from '@site/static/images/cloud/sqlconsole/update-subtitle-etc.png';
import adjust_axis_scale from '@site/static/images/cloud/sqlconsole/adjust-axis-scale.png';
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png'
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png'

# SQL Console

SQL console is the fastest and easiest way to explore and query your databases in ClickHouse Cloud. You can use the SQL console to:

- Connect to your ClickHouse Cloud Services
- View, filter, and sort table data
- Execute queries and visualize result data in just a few clicks
- Share queries with team members and collaborate more effectively.

## Exploring tables {#exploring-tables}

### Viewing table list and schema info {#viewing-table-list-and-schema-info}

An overview of tables contained in your ClickHouse instance can be found in the left sidebar area. Use the database selector at the top of the left bar to view the tables in a specific database

<Image img={table_list_and_schema} size="lg" border alt="Table list and schema view showing database tables in the left sidebar"/>

Tables in the list can also be expanded to view columns and types

<Image img={view_columns} size="lg" border alt="View of expanded table showing column names and data types"/>

### Exploring table data {#exploring-table-data}

Click on a table in the list to open it in a new tab. In the Table View, data can be easily viewed, selected, and copied. Note that structure and formatting are preserved when copy-pasting to spreadsheet applications such as Microsoft Excel and Google Sheets. You can flip between pages of table data (paginated in 30-row increments) using the navigation in the footer.

<Image img={abc} size="lg" border alt="Table view showing data that can be selected and copied"/>

### Inspecting cell data {#inspecting-cell-data}

The Cell Inspector tool can be used to view large amounts of data contained within a single cell. To open it, right-click on a cell and select 'Inspect Cell'. The contents of the cell inspector can be copied by clicking the copy icon in the top right corner of the inspector contents.

<Image img={inspecting_cell_content} size="lg" border alt="Cell inspector dialog showing the content of a selected cell"/>

## Filtering and sorting tables {#filtering-and-sorting-tables}

### Sorting a table {#sorting-a-table}

To sort a table in the SQL console, open a table and select the 'Sort' button in the toolbar. This button will open a menu that will allow you to configure your sort. You can choose a column by which to sort and configure the ordering of the sort (ascending or descending). Select 'Apply' or press Enter to sort your table

<Image img={sort_descending_on_column} size="lg" border alt="Sort dialog showing configuration for descending sort on a column"/>

The SQL console also allows you to add multiple sorts to a table. Click the 'Sort' button again to add another sort. Note: sorts are applied in the order that they appear in the sort pane (top to bottom). To remove a sort, simply click the 'x' button next to the sort.

### Filtering a table {#filtering-a-table}

To filter a table in the SQL console, open a table and select the 'Filter' button. Just like sorting, this button will open a menu that will allow you to configure your filter. You can choose a column by which to filter and select the necessary criteria. The SQL console intelligently displays filter options that correspond to the type of data contained in the column.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Filter dialog showing configuration to filter radio column equal to GSM"/>

When you're happy with your filter, you can select 'Apply' to filter your data. You can also add additional filters as shown below.

<Image img={add_more_filters} size="lg" border alt="Dialog showing how to add an additional filter on range greater than 2000"/>

Similar to the sort functionality, click the 'x' button next to a filter to remove it.

### Filtering and sorting together {#filtering-and-sorting-together}

The SQL console allows you to filter and sort a table at the same time. To do this, add all desired filters and sorts using the steps described above and click the 'Apply' button.

<Image img={filtering_and_sorting_together} size="lg" border alt="Interface showing both filtering and sorting applied simultaneously"/>

### Creating a query from filters and sorts {#creating-a-query-from-filters-and-sorts}

The SQL console can convert your sorts and filters directly into queries with one click. Simply select the 'Create Query' button from the toolbar with the sort and filter parameters of your choosing. After clicking 'Create query', a new query tab will open pre-populated with the SQL command corresponding to the data contained in your table view.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Interface showing the Create Query button that generates SQL from filters and sorts"/>

:::note
Filters and sorts are not mandatory when using the 'Create Query' feature.
:::

You can learn more about querying in the SQL console by reading the (link) query documentation.

## Creating and running a query {#creating-and-running-a-query}

### Creating a query {#creating-a-query}

There are two ways to create a new query in the SQL console.

- Click the '+' button in the tab bar
- Select the 'New Query' button from the left sidebar query list

<Image img={creating_a_query} size="lg" border alt="Interface showing how to create a new query using the + button or New Query button"/>

### Running a query {#running-a-query}

To run a query, type your SQL command(s) into the SQL Editor and click the 'Run' button or use the shortcut `cmd / ctrl + enter`. To write and run multiple commands sequentially, make sure to add a semicolon after each command.

Query Execution Options
By default, clicking the run button will run all commands contained in the SQL Editor. The SQL console supports two other query execution options:

- Run selected command(s)
- Run command at the cursor

To run selected command(s), highlight the desired command or sequence of commands and click the 'Run' button (or use the `cmd / ctrl + enter` shortcut). You can also select 'Run selected' from the SQL Editor context menu (opened by right-clicking anywhere within the editor) when a selection is present.

<Image img={run_selected_query} size="lg" border alt="Interface showing how to run a selected portion of SQL query"/>

Running the command at the current cursor position can be achieved in two ways:

- Select 'At Cursor' from the extended run options menu (or use the corresponding `cmd / ctrl + shift + enter` keyboard shortcut

<Image img={run_at_cursor_2} size="lg" border alt="Run at cursor option in the extended run options menu"/>

- Selecting 'Run at cursor' from the SQL Editor context menu

<Image img={run_at_cursor} size="lg" border alt="Run at cursor option in the SQL Editor context menu"/>

:::note
The command present at the cursor position will flash yellow on execution.
:::

### Canceling a query {#canceling-a-query}

While a query is running, the 'Run' button in the Query Editor toolbar will be replaced with a 'Cancel' button. Simply click this button or press `Esc` to cancel the query. Note: Any results that have already been returned will persist after cancellation.

<Image img={cancel_a_query} size="lg" border alt="Cancel button that appears during query execution"/>

### Saving a query {#saving-a-query}

If not previously named, your query should be called 'Untitled Query'. Click on the query name to change it. Renaming a query will cause the query to be saved.

<Image img={give_a_query_a_name} size="lg" border alt="Interface showing how to rename a query from Untitled Query"/>

You can also use the save button or `cmd / ctrl + s` keyboard shortcut to save a query.

<Image img={save_the_query} size="lg" border alt="Save button in the query editor toolbar"/>

## Using GenAI to manage queries {#using-genai-to-manage-queries}

This feature allows users to write queries as natural language questions and have the query console create SQL queries based on the context of the available tables. GenAI can also help users debug their queries.

For more information on GenAI, checkout the [Announcing GenAI powered query suggestions in ClickHouse Cloud blog post](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Table setup {#table-setup}

Let's import the UK Price Paid example dataset and use that to create some GenAI queries.

1. Open a ClickHouse Cloud service.
1. Create a new query by clicking the _+_ icon.
1. Paste and run the following code:

   ```sql
   CREATE TABLE uk_price_paid
   (
       price UInt32,
       date Date,
       postcode1 LowCardinality(String),
       postcode2 LowCardinality(String),
       type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
       is_new UInt8,
       duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
       addr1 String,
       addr2 String,
       street LowCardinality(String),
       locality LowCardinality(String),
       town LowCardinality(String),
       district LowCardinality(String),
       county LowCardinality(String)
   )
   ENGINE = MergeTree
   ORDER BY (postcode1, postcode2, addr1, addr2);
   ```

   This query should take around 1 second to complete. Once it's done, you should have an empty table called `uk_price_paid.

1. Create a new query and paste the following query:

   ```sql
   INSERT INTO uk_price_paid
   WITH
      splitByChar(' ', postcode) AS p
   SELECT
       toUInt32(price_string) AS price,
       parseDateTimeBestEffortUS(time) AS date,
       p[1] AS postcode1,
       p[2] AS postcode2,
       transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
       b = 'Y' AS is_new,
       transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
       addr1,
       addr2,
       street,
       locality,
       town,
       district,
       county
   FROM url(
       'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
       'CSV',
       'uuid_string String,
       price_string String,
       time String,
       postcode String,
       a String,
       b String,
       c String,
       addr1 String,
       addr2 String,
       street String,
       locality String,
       town String,
       district String,
       county String,
       d String,
       e String'
   ) SETTINGS max_http_get_redirects=10;
   ```

This query grabs the dataset from the `gov.uk` website. This file is ~4GB, so this query will take a few minutes to complete. Once ClickHouse has processed the query, you should have the entire dataset within the `uk_price_paid` table.

#### Query creation {#query-creation}

Let's create a query using natural language.

1. Select the **uk_price_paid** table, and then click **Create Query**.
1. Click **Generate SQL**. You may be asked to accept that your queries are sent to Chat-GPT. You must select **I agree** to continue.
1. You can now use this prompt to enter a natural language query and have ChatGPT convert it into an SQL query. In this example we're going to enter:

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. The console will generate the query we're looking for and display it in a new tab. In our example, GenAI created the following query:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Once you've verified that the query is correct, click **Run** to execute it.

### Debugging {#debugging}

Now, let's test the query debugging capabilities of GenAI.

1. Create a new query by clicking the _+_ icon and paste the following code:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Click **Run**. The query fails since we're trying to get values from `pricee` instead of `price`.
1. Click **Fix Query**.
1. GenAI will attempt to fix the query. In this case, it changed `pricee` to `price`. It also realised that `toYear` is a better function to use in this scenario.
1. Select **Apply** to add the suggested changes to your query and click **Run**.

Keep in mind that GenAI is an experimental feature. Use caution when running GenAI-generated queries against any dataset.

## Advanced querying features {#advanced-querying-features}

### Searching query results {#searching-query-results}

After a query is executed, you can quickly search through the returned result set using the search input in the result pane. This feature assists in previewing the results of an additional `WHERE` clause or simply checking to ensure that specific data is included in the result set. After inputting a value into the search input, the result pane will update and return records containing an entry that matches the inputted value. In this example, we'll look for all instances of `breakfast` in the `hackernews` table for comments that contain `ClickHouse` (case-insensitive):

<Image img={search_hn} size="lg" border alt="Search Hacker News Data"/>

Note: Any field matching the inputted value will be returned. For example, the third record in the above screenshot does not match 'breakfast' in the `by` field, but the `text` field does:

<Image img={match_in_body} size="lg" border alt="Match in body"/>

### Adjusting pagination settings {#adjusting-pagination-settings}

By default, the query result pane will display every result record on a single page. For larger result sets, it may be preferable to paginate results for easier viewing. This can be accomplished using the pagination selector in the bottom right corner of the result pane:

<Image img={pagination} size="lg" border alt="Pagination options"/>

Selecting a page size will immediately apply pagination to the result set and navigation options will appear in the middle of the result pane footer

<Image img={pagination_nav} size="lg" border alt="Pagination navigation"/>

### Exporting query result data {#exporting-query-result-data}

Query result sets can be easily exported to CSV format directly from the SQL console. To do so, open the `•••` menu on the right side of the result pane toolbar and select 'Download as CSV'.

<Image img={download_as_csv} size="lg" border alt="Download as CSV"/>

## Visualizing query data {#visualizing-query-data}

Some data can be more easily interpreted in chart form. You can quickly create visualizations from query result data directly from the SQL console in just a few clicks. As an example, we'll use a query that calculates weekly statistics for NYC taxi trips:

```sql
SELECT
   toStartOfWeek(pickup_datetime) AS week,
   sum(total_amount) AS fare_total,
   sum(trip_distance) AS distance_total,
   count(*) AS trip_total
FROM
   nyc_taxi
GROUP BY
   1
ORDER BY
   1 ASC
```

<Image img={tabular_query_results} size="lg" border alt="Tabular query results"/>

Without visualization, these results are difficult to interpret. Let's turn them into a chart.

### Creating charts {#creating-charts}

To begin building your visualization, select the 'Chart' option from the query result pane toolbar. A chart configuration pane will appear:

<Image img={switch_from_query_to_chart} size="lg" border alt="Switch from query to chart"/>

We'll start by creating a simple bar chart tracking `trip_total` by `week`. To accomplish this, we'll drag the `week` field to the x-axis and the `trip_total` field to the y-axis:

<Image img={trip_total_by_week} size="lg" border alt="Trip total by week"/>

Most chart types support multiple fields on numeric axes. To demonstrate, we'll drag the fare_total field onto the y-axis:

<Image img={bar_chart} size="lg" border alt="Bar chart"/>

### Customizing charts {#customizing-charts}

The SQL console supports ten chart types that can be selected from the chart type selector in the chart configuration pane. For example, we can easily change the previous chart type from Bar to an Area:

<Image img={change_from_bar_to_area} size="lg" border alt="Change from Bar chart to Area"/>

Chart titles match the name of the query supplying the data. Updating the name of the query will cause the Chart title to update as well:

<Image img={update_query_name} size="lg" border alt="Update query name"/>

A number of more advanced chart characteristics can also be adjusted in the 'Advanced' section of the chart configuration pane. To begin, we'll adjust the following settings:

- Subtitle
- Axis titles
- Label orientation for the x-axis

Our chart will be updated accordingly:

<Image img={update_subtitle_etc} size="lg" border alt="Update subtitle etc."/>

In some scenarios, it may be necessary to adjust the axis scales for each field independently. This can also be accomplished in the 'Advanced' section of the chart configuration pane by specifying min and max values for an axis range. As an example, the above chart looks good, but in order to demonstrate the correlation between our `trip_total` and `fare_total` fields, the axis ranges need some adjustment:

<Image img={adjust_axis_scale} size="lg" border alt="Adjust axis scale"/>

## Sharing queries {#sharing-queries}

The SQL console enables you to share queries with your team. When a query is shared, all members of the team can see and edit the query. Shared queries are a great way to collaborate with your team.

To share a query, click the 'Share' button in the query toolbar.

<Image img={sql_console_share} size="lg" border alt="Share button in the query toolbar"/>

A dialog will open, allowing you to share the query with all members of a team. If you have multiple teams, you can select which team to share the query with.

<Image img={sql_console_edit_access} size="lg" border alt="Dialog for editing access to a shared query"/>

<Image img={sql_console_add_team} size="lg" border alt="Interface for adding a team to a shared query"/>

<Image img={sql_console_edit_member} size="lg" border alt="Interface for editing member access to a shared query"/>

In some scenarios, it may be necessary to adjust the axis scales for each field independently. This can also be accomplished in the 'Advanced' section of the chart configuration pane by specifying min and max values for an axis range. As an example, the above chart looks good, but in order to demonstrate the correlation between our `trip_total` and `fare_total` fields, the axis ranges need some adjustment:

<Image img={sql_console_access_queries} size="lg" border alt="Shared with me section in the query list"/>
