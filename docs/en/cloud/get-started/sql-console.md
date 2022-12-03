# SQL Console

## Exploring Tables

### Viewing Table List and Schema Info
An overview of tables contained in your ClickHouse instance can be found in the left sidebar area.  Use the database selector at the top of the left bar to view the tables in a specific database

  ![table list and schema](@site/docs/en/cloud/images/sqlconsole/table-list-and-schema.png)







Tables in the list can also be expanded to view columns and types

  ![view columns](@site/docs/en/cloud/images/sqlconsole/view-columns.png)





### Exploring Table Data

Click on a table in the list to open it in a new tab.  In the Table View, data can be easily viewed, selected, and copied.  Note that structure and formatting are preserved when copy-pasting to spreadsheet applications such as Microsoft Excel and Google Sheets. You can flip between pages of table data (paginated in 30-row increments) using the navigation in the footer.


  ![abc](@site/docs/en/cloud/images/sqlconsole/abc.png)


### Inspecting Cell Data
The Cell Inspector tool can be used to view large amounts of data contained within a single cell.  To open it, right click on a cell and select ‘Inspect Cell’.  The contents of the cell inspector can be copied by clicking the copy icon in the top right corner of the inspector contents.


  ![inspecting cell content](@site/docs/en/cloud/images/sqlconsole/inspecting-cell-content.png)


## Filtering and Sorting Tables

### Sorting a table
To sort a table in the SQL console, open a table and select the ‘Sort’ button in the toolbar.  This button will open a menu that will allow you to configure your sort.  You can choose a column by which to sort and configure the ordering of the sort (ascending or descending).  Select ‘Apply’ or press Enter to sort your table


  ![sort descending on column](@site/docs/en/cloud/images/sqlconsole/sort-descending-on-column.png)


The SQL console also allows you to add multiple sorts to a table.  Click the ‘Sort’ button again to add another sort.  Note: sorts are applied in the order that they appear in the sort pane (top to bottom). To remove a sort, simply click the ‘x’ button next to the sort.


### Filtering a table

To filter a table in the SQL console, open a table and select the ‘Filter’ button.  Just like sorting, this button will open a menu that will allow you to configure your filter.  You can choose a column by which to filter and select the necessary criteria.  The SQL console intelligently displays filter options that correspond to the type of data contained in the column.

  ![filter on radio column equal GSM](@site/docs/en/cloud/images/sqlconsole/filter-on-radio-column-equal-gsm.png)

When you’re happy with your filter, you can select ‘Apply’ to filter your data.  You can also add additional filters as shown below.

  ![Add more filters, range greater than 2000](@site/docs/en/cloud/images/sqlconsole/add-more-filters.png)





Similar to sort functionality, click the ‘x’ button next to a filter to remove it.


### Filtering and sorting together

The SQL console allows you to filter and sort a table at the same time.  To do this, add all desired filters and sorts using the steps described above and click the ‘Apply’ button.


  ![Filtering and sorting together](@site/docs/en/cloud/images/sqlconsole/filtering-and-sorting-together.png)


## Creating a query from filters and sorts

The SQL console can convert your sorts and filters directly into queries with one click.  Simply select the ‘Create Query’ button from the toolbar with the sort and filter parameters of your choosing.  After clicking ‘Create query’, a new query tab will open pre-populated with the SQL command corresponding to the data contained in your table view.


  ![Create a query from sorts and filters](@site/docs/en/cloud/images/sqlconsole/create-a-query-from-sorts-and-filters.png)


:::note
Filters and sorts are not mandatory when using the ‘Create Query’ feature.
:::


You can learn more about querying in the SQL console by reading the (link) query documentation.


## Creating and Running a Query

### Creating a Query
There are two ways to create a new query in the SQL console.
* Click the ‘+’ button in the tab bar
* Select the ‘New Query’ button from the left sidebar query list

  ![Creating a query](@site/docs/en/cloud/images/sqlconsole/creating-a-query.png)



### Running a Query
To run a query, type your SQL command(s) into the SQL Editor and click the ‘Run’ button or use the shortcut `cmd / ctrl + enter`.  To write and run multiple commands sequentially, make sure to add a semicolon after each command.


Query Execution Options
By default, clicking the run button will run all commands contained in the SQL Editor.  The SQL console supports two other query execution options:
* Run selected command(s)
* Run command at cursor


To run selected command(s), highlight the desired command or sequence of commands and click the ‘Run’ button (or use the `cmd / ctrl + enter` shortcut).  You can also select ‘Run selected’ from the SQL Editor context menu (opened by right-clicking anywhere within the editor) when a selection is present.


  ![run selected query](@site/docs/en/cloud/images/sqlconsole/run-selected-query.png)


Running the command at the current cursor position can be achieved in a two ways:
* Select ‘At Cursor’ from the extended run options menu (or use the corresponding `cmd / ctrl + shift + enter` keyboard shortcut

  ![run at cursor](@site/docs/en/cloud/images/sqlconsole/run-at-cursor-2.png)



   * Selecting ‘Run at cursor’ from the SQL Editor context menu

  ![run at cursor](@site/docs/en/cloud/images/sqlconsole/run-at-cursor.png)



:::note
The command present at the cursor position will flash yellow on execution.
:::


### Canceling a Query

While a query is running, the ‘Run’ button in the Query Editor toolbar will be replaced with a ‘Cancel’ button.  Simply click this button or press `Esc` to cancel the query.  Note: Any results that have already been returned will persist after cancellation.


  ![Cancel a query](@site/docs/en/cloud/images/sqlconsole/cancel-a-query.png)


### Saving a Query

If not previously named, your query should be called ‘Untitled Query’.  Click on the query name to change it.  Renaming a query will cause the query to be saved.


  ![Give a query a name](@site/docs/en/cloud/images/sqlconsole/give-a-query-a-name.png)

You can also use the save button or `cmd / ctrl + s` keyboard shortcut to save a query.

  ![Save the query](@site/docs/en/cloud/images/sqlconsole/save-the-query.png)



## Advanced Querying Features

### Searching query results

### Adjusting pagination settings

### Exporting query result data

### Using query variables


## Visualizing Query Data

### Creating charts

### Customizing charts

### Query View


## Open Services in the SQL console

### Opening SQL console from Control Plane

### Loading the SQL console Directly

### Using the service switcher
