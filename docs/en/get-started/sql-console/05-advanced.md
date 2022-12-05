# Advanced Querying Features

## Searching query results

After a query is executed, you can quickly search through the returned result set using the search input in the result pane. This feature assists in previewing the results of an additional `WHERE` clause or simply checking to ensure that specific data is included in the result set. After inputting a value into the search input, the result pane will update and return records containing an entry that matches the inputted value. In this example, we’ll look for all instances of `alexey-milovidov` in the `github_events` table for the ClickHouse repo:

  ![Search GitHub data](@site/docs/en/cloud/images/sqlconsole/search-github.png)

Note: Any field matching the inputted value will be returned. For example, the third record in the above screenshot does not match ‘alexey-milovidov’ in the `actor_login` field, but the `body` field does:

  ![Match in body](@site/docs/en/cloud/images/sqlconsole/match-in-body.png)


## Adjusting pagination settings

By default, the query result pane will display every result record on a single page.  For larger result sets, it may be preferable to paginate results for easier viewing.  This can be accomplished using the pagination selector in the bottom right corner of the result pane:
  ![Pagination options](@site/docs/en/cloud/images/sqlconsole/pagination.png)

Selecting a page size will immediately apply pagination to the result set and navigation options will appear in the middle of the result pane footer

  ![Pagination navigation](@site/docs/en/cloud/images/sqlconsole/pagination-nav.png)

## Exporting query result data

Query result sets can be easily exported to CSV format directly from the SQL console.  To do so, open the `•••` menu on the right side of the result pane toolbar and select ‘Download as CSV’.

  ![Download as CSV](@site/docs/en/cloud/images/sqlconsole/download-as-csv.png)
