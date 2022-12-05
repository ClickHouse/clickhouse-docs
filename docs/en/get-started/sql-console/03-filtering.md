# Filtering and Sorting Tables

## Sorting a table
To sort a table in the SQL console, open a table and select the ‘Sort’ button in the toolbar.  This button will open a menu that will allow you to configure your sort.  You can choose a column by which to sort and configure the ordering of the sort (ascending or descending).  Select ‘Apply’ or press Enter to sort your table


  ![sort descending on a column](@site/docs/en/cloud/images/sqlconsole/sort-descending-on-column.png)


The SQL console also allows you to add multiple sorts to a table.  Click the ‘Sort’ button again to add another sort.  Note: sorts are applied in the order that they appear in the sort pane (top to bottom). To remove a sort, simply click the ‘x’ button next to the sort.


## Filtering a table

To filter a table in the SQL console, open a table and select the ‘Filter’ button.  Just like sorting, this button will open a menu that will allow you to configure your filter.  You can choose a column by which to filter and select the necessary criteria.  The SQL console intelligently displays filter options that correspond to the type of data contained in the column.

  ![filter on the radio column equal to GSM](@site/docs/en/cloud/images/sqlconsole/filter-on-radio-column-equal-gsm.png)

When you’re happy with your filter, you can select ‘Apply’ to filter your data.  You can also add additional filters as shown below.

  ![Add a filter on range greater than 2000](@site/docs/en/cloud/images/sqlconsole/add-more-filters.png)





Similar to the sort functionality, click the ‘x’ button next to a filter to remove it.


## Filtering and sorting together

The SQL console allows you to filter and sort a table at the same time.  To do this, add all desired filters and sorts using the steps described above and click the ‘Apply’ button.


  ![Filtering and sorting together](@site/docs/en/cloud/images/sqlconsole/filtering-and-sorting-together.png)


## Creating a query from filters and sorts

The SQL console can convert your sorts and filters directly into queries with one click.  Simply select the ‘Create Query’ button from the toolbar with the sort and filter parameters of your choosing.  After clicking ‘Create query’, a new query tab will open pre-populated with the SQL command corresponding to the data contained in your table view.


  ![Create a query from sorts and filters](@site/docs/en/cloud/images/sqlconsole/create-a-query-from-sorts-and-filters.png)


:::note
Filters and sorts are not mandatory when using the ‘Create Query’ feature.
:::


You can learn more about querying in the SQL console by reading the (link) query documentation.
