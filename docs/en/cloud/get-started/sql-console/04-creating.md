
# Creating and Running a Query

## Creating a Query
There are two ways to create a new query in the SQL console.
* Click the ‘+’ button in the tab bar
* Select the ‘New Query’ button from the left sidebar query list

  ![Creating a query](@site/docs/en/cloud/images/sqlconsole/creating-a-query.png)



## Running a Query
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


## Canceling a Query

While a query is running, the ‘Run’ button in the Query Editor toolbar will be replaced with a ‘Cancel’ button.  Simply click this button or press `Esc` to cancel the query.  Note: Any results that have already been returned will persist after cancellation.


  ![Cancel a query](@site/docs/en/cloud/images/sqlconsole/cancel-a-query.png)


## Saving a Query

If not previously named, your query should be called ‘Untitled Query’.  Click on the query name to change it.  Renaming a query will cause the query to be saved.


  ![Give a query a name](@site/docs/en/cloud/images/sqlconsole/give-a-query-a-name.png)

You can also use the save button or `cmd / ctrl + s` keyboard shortcut to save a query.

  ![Save the query](@site/docs/en/cloud/images/sqlconsole/save-the-query.png)
