// use: 
// yarn ts-node src/scripts/dbupdate.ts <path to csv-file>
//
// Updates price and stockOnHand given in the vendure CSV format for existing variants.
// If a field (price/stockOnHand ) is empty (only whitespace characters) it is not updated for that variant.
// The sku,price and stockOnHand is needed, all other fields are optional/don't care.
//
// example csv-file:
// sku,price,stockOnHand
// L2201308,199.00 ,12
// L2201508,139.00 , 
// L2201316,       ,89 
// L2201516,2299.00,10



import mysql from "mysql2"
import { config } from '../vendure-config';
import {readFile} from "node:fs";
import { parse } from 'csv-parse/sync';
import {argv} from 'node:process';


interface record_type {
    name?:string,
    slug?:string,
    description?:string,
    assets?:string,
    facets?:string,
    optionGroups?:string,
    optionValues?:string,
    sku:string,
    price:number,
    taxCategory?:string,
    stockOnHand:number,
    trackInventory?:string,
    variantAssets?:string,
    variantFacets?:string
}


function work() {
    let filepath : string  =  argv.slice(2)[0];
    console.log(filepath); 
    if (!filepath.length) {
        filepath = './src/upload/testminimal.csv';
    }

    read_csv(filepath);

}

work();


function read_csv(filepath : string) {
    readFile(filepath, function(err, data) {
    if(err) {
        console.log(err);
    } else {
        const content : string = data.toString('utf8');
        console.log("read csv " + content.length + " bytes" );
        process_csv(content)
    }

})}

function process_csv(content:string) {
    const records = parse(content,{
      trim: true,
      relax_column_count: true,
      //delimiter: ',',
      //escape: '"',
      columns: true //first line are column names
    });

//    console.log(JSON.stringify(records))

    console.log("Read lines: " + records.length)
    updateprice(records)
}


function updateprice(records: any )  {
  
    const conn = dbConnect();

    for (let i = 0; i < records.length; ++i) {
        console.log("csv-record: " + i + " " + JSON.stringify(records[i]).substring(0,60) + "...");

        records[i].price = records[i].price * 100;
        console.log(JSON.stringify(`${records[i].sku}, ${records[i].price}, ${records[i].stockOnHand}`));

        let sql = "SELECT id  FROM product_variant where sku = '" + records[i].sku + "';"
        console.log(sql);
        conn.query(sql,[],(err, rows) => {
            if (err) {
                console.error('Error in query:', err);
                return;
            }
            console.log("result " + records[i].sku + " " + JSON.stringify(rows));

            const myrows = JSON.parse(JSON.stringify(rows));

            const conn2 =  dbConnect();
            let setvalueStr : string  = "";

            for(let k=0; k < myrows.length; ++k ) {
                setvalueStr = "";
                let updatePrice : string = " price = " + records[i].price + ",";
                if(isNaN(records[i].price)) {
                    updatePrice = "";
                }
                setvalueStr += updatePrice;
                if (setvalueStr.length) {
                    setvalueStr = " set " + setvalueStr.slice(0, -1); //chop komma
                    let sql = "update product_variant_price " + setvalueStr + " where variantId =" + myrows[k].id + ";";
                    console.log(sql);
                    conn2.query(sql);
                }

                
                setvalueStr = "";
                let updateStock : string = " stockonhand = " + records[i].stockOnHand + ",";
                if(isNaN(records[i].stockOnHand)) {
                    updateStock = "";
                } 
                setvalueStr += updateStock;
                if (setvalueStr.length) {
                    setvalueStr = " set " + setvalueStr.slice(0, -1); //chop comma
                    let sql = "update stock_level " + setvalueStr + " where productVariantId =" + myrows[k].id + ";";
                    console.log(sql);
                    conn2.query(sql);
                }

            }
            conn2.end();
        });
    } conn.end()    
}

function dbConnect() {
    const c:any= config.dbConnectionOptions;
    const conn = mysql.createConnection({
        host: c.host,
        port: c.port,
        user: c.username,
        password: c.password,
        database: c.database
   })
   conn.query("use " + c.database);
   return conn;
}
