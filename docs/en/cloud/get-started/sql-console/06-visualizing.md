# Visualizing Query Data

Some data can be more easily interpreted in chart form.  You can quickly create visualizations from query result data directly from the SQL console in just a few clicks.   As an example, we’ll use a query that calculates weekly statistics for NYC taxi trips:

```sql
select
   toStartOfWeek(pickup_datetime) as week,
   sum(total_amount) as fare_total,
   sum(trip_distance) as distance_total,
   count(*) as trip_total
from
   nyc_taxi
group by
   1
order by
   1 asc
```

  ![Tabular query results](@site/docs/en/cloud/images/sqlconsole/tabular-query-results.png)

 Without visualization, these results are difficult to interpret.  Let’s turn them into a chart.

## Creating charts

To begin building your visualization, select the ‘Chart’ option from the query result pane toolbar.  A chart configuration pane will appear:

  ![Switch from query to chart](@site/docs/en/cloud/images/sqlconsole/switch-from-query-to-chart.png)

We’ll start by creating a simple bar chart tracking `trip_total` by `week`.  To accomplish this, we’ll drag the `week` field to the x-axis and the `trip_total` field to the y-axis:

  ![Trip total by week](@site/docs/en/cloud/images/sqlconsole/trip-total-by-week.png)

Most chart types support multiple fields on numeric axes.  To demonstrate, we’ll drag the fare_total field onto the y-axis:

  ![Bar chart](@site/docs/en/cloud/images/sqlconsole/bar-chart.png)

## Customizing charts

The SQL console supports ten chart types that can be selected from the chart type selector in the chart configuration pane.  For example, we can easily change the previous chart type from Bar to an Area:

  ![Change from Bar chart to Area](@site/docs/en/cloud/images/sqlconsole/change-from-bar-to-area.png)



Chart titles match the name of the query supplying the data.  Updating the name of the query will cause the Chart title to update as well:

  ![Update query name](@site/docs/en/cloud/images/sqlconsole/update-query-name.png)

A number of more advanced chart characteristics can also be adjusted in the ‘Advanced’ section of the chart configuration pane.  To begin, we’ll adjust the following settings:
- Subtitle
- Axis titles
- Label orientation for the x-axis

Our chart will be updated accordingly:

  ![Update subtitle etc.](@site/docs/en/cloud/images/sqlconsole/update-subtitle-etc.png)


In some scenarios, it may be necessary to adjust the axis scales for each field independently. This can also be accomplished in the ‘Advanced’ section of the chart configuration pane by specifying min and max values for the an axis range.  As an example, the above chart looks good, but in order to demonstrate the correlation between our `trip_total` and `fare_total` fields, the axis ranges need some adjustment:

  ![Adjust axis scale](@site/docs/en/cloud/images/sqlconsole/adjust-axis-scale.png)
