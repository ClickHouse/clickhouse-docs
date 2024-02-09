--Step 1:
CREATE VIEW london_properties_view
AS
    SELECT
        date,
        price,
        addr1,
        addr2,
        street
    FROM uk_price_paid
    WHERE town = 'LONDON';


--Step 2:
SELECT avg(price)
FROM london_properties_view
WHERE date >= toDate('2022-01-01') AND date <= toDate('2022-12-31');

--Step 3:
SELECT count()
FROM london_properties_view;

--Step 7:
CREATE VIEW properties_by_town_view
AS
    SELECT
        date,
        price,
        addr1,
        addr2,
        street
    FROM uk_price_paid
    WHERE town = {town_filter:String};

--Step 8:
SELECT
    max(price),
    argMax(street, price)
FROM properties_by_town_view(town_filter='LIVERPOOL');
