# Updates price and stock given in the vendure CSV format

Vendure supports changing values of products in the Admin-UI in a comfortable way.
The price and the stock is given in product variants. Each product has at least one product variant.
You can import new products with a csv file like 'test.csv'.
There is no built-in way for updating by import, so you can only change values manually.
If you have thousands of products and several sale channels, stock can often change outside Vendure.
Also, if you use an automatic repricing, prices can change often.

This script makes it possible to update product variants.

## Usage
```yarn ts-node src/scripts/dbupdate.ts <path to csv-file>```

Updates price and stockOnHand given in the vendure CSV format for existing variants.
If a field (price/stockOnHand ) is empty (only whitespace characters) it is not updated for that variant.
 The sku,price and stockOnHand is needed, all other fields are optional/don't care.

```
example csv-file:
sku,price,stockOnHand
L2201308,199.00 ,12
L2201508,139.00 , 
L2201316,       ,89 
L2201516,2299.00,10
```

## Author
Hans Ophüls

## License
MIT
