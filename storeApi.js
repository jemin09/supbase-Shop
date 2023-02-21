let express=require("express");
let app=express();
app.use(express.json());
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});
let fs=require("fs");
var port=process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app Listening on port ${port}`));

const {Client}=require('pg');
var format = require('pg-format');
const client=new Client({
  user:"postgres",
  password:"Jesmin@12344",
  database:"postgres",
  port:"5432",
  host:"db.bjwyunrwkuwvgcbcillj.supabase.co",
  // host:"localhost",
  ssl:{rejectUnauthorized:false},
});

client.connect(function(res,error){
  console.log(`Connect!!!`);
});
app.get("/shops",function(req,res){
  let sql=`SELECT * FROM shops`;
  console.log("sql=",sql);
  client.query(sql,function(err,result){
    if(err) {
      console.log(err);
      res.status(404).send("Error in fetchig data");
    }
    else{
      res.send(result);
    }
  })  
});
app.get("/products",function(req,res){
  let sql=`SELECT * FROM products`;
  console.log("sql=",sql);
  client.query(sql,function(err,result){
    if(err) {
      console.log(err);
      res.status(404).send("Error in fetchig data");
    }
    else{
      res.send(result);
    }
  })  
});
app.get("/purchases",function(req,res){
  let shopId=req.query.shop;   
  let productid=req.query.product;          
  let sort=req.query.sort;

  console.log("in purchases",shopId,productid,sort)
  let options="";
  let optionsArr=[];

  if(shopId){
    options=options?`${options} AND "shopId"=ANY($1::int[])` : `"shopId"=ANY($1::int[])`;
    let shopArr=[];
    shopArr.push(shopId);
    optionsArr.push(shopArr);
  } 
   
  if(productid){    
    let productArr=productid.split(",");    
    options=options?`${options} AND productid=ANY($2::int[])` : `productid=ANY($1::int[])`;
    optionsArr.push(productArr);
  }
  
  let sortoption="";
  if(sort==="QtyAsc")
    sortoption=`order by  quantity asc`;
  if(sort==="QtyDesc")
    sortoption=`order by  quantity desc`;
  if(sort==="ValueAsc")
    sortoption=`order by  quantity*price asc`;
  if(sort==="ValueDesc")
  sortoption=`order by  quantity*price DESC`;
  
  let sql=`SELECT * FROM purchases ${options?"WHERE":""} ${options} ${sortoption?sortoption:""}`;
  console.log("optionsArr=",optionsArr,"sql=",sql);
  client.query(sql,optionsArr,function(err,result){
    if(err) {
      // console.log(err,"result",result);
      // console.log("optionsArr=",optionsArr);
      res.status(404).send("Error in fetchig data");
    }
    else{
      console.log("result",result);
      console.log("optionsArr=",optionsArr);
      res.send(result);
    }
  }) 
});
app.get("/purchases/products/:prodid",function(req,res){
  let productid=+req.params.prodid;
    console.log("product id=",productid);
    let sql=`SELECT * FROM purchases WHERE productid=$1`;
    client.query(sql,[productid],function(err,result){
      if(err){
        console.log(err);
        res.status(404).send("Error in fetching data")
      }
      else res.send(result);
    })
});
app.get("/purchases/shops/:shopid",function(req,res){
  let shopId=+req.params.shopid;
    console.log("shopId=",shopId);
    let sql=`SELECT * FROM purchases WHERE "shopId"=$1`;
    client.query(sql,[shopId],function(err,result){
      if(err){
        console.log(err);
        res.status(404).send("Error in fetching data")
      }
      else res.send(result);
    });
});
app.get("/products/:prodName",function(req,res){
  let productName=req.params.prodName;
  console.log("name=",productName);
  let sql=`SELECT * FROM products WHERE "productName"=$1`;
  client.query(sql,[productName],function(err,result){
    if(err){
      console.log(err);
      res.status(404).send("Error in fetching data")
    }
    else res.send(result);
  })
});
app.post("/purchases",function(req,res){
  let body=req.body;
      let sql=`INSERT INTO purchases("shopId", productid, quantity, price) 
                VALUES($1,$2,$3,$4)`;
    client.query(sql,[
      body.shopId,body.productid,body.quantity,body.price],
      function(err,result){
      console.log("result=",result);
      if(err){
        console.log(err);
        res.status(404).send("Error in fetching data")
      }
      else res.send(`Post sucess. name of new purchases}`);
    });
});
app.post("/products",function(req,res){
  let body=req.body;
  productName=body.productName;
  let sql1=`SELECT * FROM products WHERE  "productName"=$1`;
  client.query(sql1,[productName],function(err,result){
    if(err){
      console.log(err);
      res.status(404).send("Error in fetching data")
    }
    else if(result.length>0) res.status(404).send(`Name already exists : ${body.productName}`);
    else {
      let sql=`INSERT INTO products("productName",category,description)  VALUES($1,$2,$3)`;
      client.query(sql,[body.productName,body.category,body.description],
        function(err,result){
        console.log("result=",result);
        if(err){
          console.log(err);
          res.status(404).send("Error in fetching data")
        }
        else res.send(`Post sucess. name of new products name is ${body.productName}`);
      })
    }
  })  
});
app.post("/shops",function(req,res){
  let body=req.body;
  name=body.name;
  let sql1=`SELECT * FROM shops WHERE  name=$1`;
  client.query(sql1,[name],function(err,result){
    if(err){
      console.log(err);
      res.status(404).send("Error in fetching data")
    }
    else if(result.length>0) res.status(404).send(`Name already exists : ${body.name}`);
    else {
      let sql=`INSERT INTO shops(name,rent)  VALUES($1,$2)`;
      client.query(sql,[body.name,body.rent],
        function(err,result){
        console.log("result=",result);
        if(err){
          console.log(err);
          res.status(404).send("Error in fetching data")
        }
        else res.send(`Post sucess. name of new Mobile name is ${body.name}`);
      })
    }
  }) 
});
app.put("/products/:prodName",function(req,res){
  let body=req.body;
  let productName=req.params.prodName;
  let sql=`UPDATE products SET category=$1,description=$2 WHERE "productName"=$3`;
  console.log("SQL=",sql);
  let params=[body.category,body.description,productName];
  client.query(sql,params,function(err,result){
    if(err){
      console.log(err);
      res.status(404).send("Error in Updating data");
    }
    else if(result.affectedRows===0){
      console.log("in else if ",result);
      res.status(404).send("No update happened");
    }
    else {
      console.log("in else",result);
      res.send("Update success");
    }
  })
});
app.get("/resetData",function(req,res){
  //if we use delete for reset new id gonna start from the previous id
  // let sql="DELETE FROM mobiletbl ";

   //if we use delete for reset new id gonna start from start id
  let sql=`TRUNCATE  purchases RESTART IDENTITY`;
  client.query(sql,function(err,result){
    if(err){
      console.log(err);
      res.status(404).send("Error in delete data");
    }
    else{
      console.log(`Deletion Success.Deleted ${result.affectedRows} rows`);
      let {datajson}=require("./storeData.js");
      console.log("datajson",datajson);
      let arr=datajson.purchases.map(st=>[
        st.shopId,
        st.productid,
        st.quantity,
        st.price
      ]);
      let sql1=`INSERT INTO purchases ("shopId",productid,quantity,price) VALUES %L`;
      client.query(format(sql1,arr),function(err,result){
        if(err){
          console.log(err);
          res.status(404).send("Error in inserting data");
        }
        else res.send(`Reset Success.Inserted ${result.affectedRows} rows`);
      })
    }
  })
})

app.get("/totalPurchase/product/:id",function(req,res){
  let productid=+req.params.id;
  let sql1=`SELECT productid,"shopId",  SUM("shopId") AS totalPurchase FROM purchases WHERE  productid=$1 GROUP BY productid,"shopId"`;
  client.query(sql1,[productid],function(err,result){    
    if(err){
      console.log(err);
      res.status(404).send("Error in fetching data")
    }
    else res.send(result);
  }) 
});
app.get("/totalPurchase/shop/:id",function(req,res){
  let shopId=+req.params.id;
  let sql1=`SELECT productid,"shopId",  SUM(productid) AS totalPurchase FROM purchases WHERE  "shopId"=$1 GROUP BY productid,"shopId"`;
  client.query(sql1,[shopId],function(err,result){    
    if(err){
      console.log(err);
      res.status(404).send("Error in fetching data")
    }
    else res.send(result);
  }) 
});

