//import { Mongoose } from 'mongoose';

const mysql=require('mysql');
const express=require('express');
var app=express();
const bodyparser=require('body-parser');
const jwt=require('jsonwebtoken');
const LOGOUT=require('express-passport-logout');
app.use(bodyparser.json());
const accountSid='AC5084d9d3c8af2b586aa4241ebe8bd5b7';
const authToken='ea0ad68f4a89c1b259976b497008d4d5';
const client=require('twilio')(accountSid,authToken);
const MessagingResponse=require('twilio').twiml.MessagingResponse;
const mongoose=require('mongoose');
const twiml = new MessagingResponse();
var moment = require('moment')

app.use(bodyparser.urlencoded({extended:false}))
mongoose.connect('mongodb://gautham:hydrogen01@ds131963.mlab.com:31963/hotelreservationdbv2',
{useMongoClient:true}).then(()=>{console.log('Mongoose db connected to HotelReservationv2');
})

app.listen(8000,()=>console.log('Express server is running at port: 8000'));


let CustomerSchema=new mongoose.Schema({

    phoneNumberFrom:String,
    phoneNumberTo:String,
    customerName:String,
    peopleCount:String,
    checkinTime:String,
    waitingTime:String,
    status:String,
    tableNo:String,
    extension:String,
    queueCount:String
})


let TableSchema=new mongoose.Schema({

entity:String,
tableNo:String,
numberOfSeats:String,
availability:String,
phoneNumber:String
    })
    
    
let Customer=mongoose.model('Customer',CustomerSchema);
let Tables=mongoose.model('Tables',TableSchema);

//This API is can be called by customer or the admin
app.post('/customerRegistration',(req,res)=>{

let from=req.body.From;                 //manual
let to=req.body.To;                    //manual
let name=req.body.name;                //manual
let peopleCount=req.body.peopleCount; //manual
let checkinTime=req.body.checkinTime;  //from algorithm
let waitingTime=req.body.waitingTime;  //from algorithm
let status=req.body.status;    //from algorithm
let tableNo=req.body.tableNo;   //from algorithm
let extension="FALSE";             
let queueCount="NA";

let newCustomer=new Customer();

//CUSTOMER TO TABLE ALGORITHM GOES HERE
var completeAvailibility="False";
Tables.find({entity:'Table',availability:'True'},(err,data)=>{
for(i=0;i<data.length;i++)
{
    if(peopleCount<=data[i].numberOfSeats)
    {   completeAvailibility="True";
        data[i].availability="False";
        data[i].phoneNumber=from;
        data[i].save(()=>{   
                 console.log("Table assigned to phone number: "+from);
        newCustomer.checkinTime=moment().add(0, 'minutes').format('hh:mm A');
        newCustomer.waitingTime="0";
        newCustomer.status="In progress";
        newCustomer.tableNo=data[i].tableNo;
        newCustomer.extension="FALSE";
        newCustomer.phoneNumberFrom=from;
        newCustomer.phoneNumberTo=to;
        newCustomer.customerName=name;
        newCustomer.peopleCount=peopleCount;
        newCustomer.queueCount=queueCount;

        newCustomer.save(()=>{
                console.log("Customer has been assigned table no: "+data[i].tableNo);

               client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:"You have been assigned table no: "+data[i].tableNo 
        })

               })  });
        break;
    }  
}
if(completeAvailibility==="False")
{  //SEND SMS RESPONSE THAT CUSTOMER HAS TO WAIT 
   
    Customer.find({status:'waiting'},(err,data)=>{
        newCustomer.checkinTime=moment().add(parseInt(data.length,10)*30+30, 'minutes').format('hh:mm A');
        newCustomer.waitingTime=parseInt(data.length,10)*30+30;
        newCustomer.status="waiting";
        newCustomer.tableNo="Unassigned";
        newCustomer.extension="FALSE";
        newCustomer.phoneNumberFrom=from;
        newCustomer.phoneNumberTo=to;
        newCustomer.customerName=name;
        newCustomer.peopleCount=peopleCount;
        newCustomer.queueCount= data.length+1;
        newCustomer.save(()=>{
        console.log("Sorry no table available at this time and queue number is: "+newCustomer.queueCount);
       
        client.messages.create({
           to:`${from}`,
                from:`${to}`,
            body:"Sorry no table available at this time and queue number is: "+newCustomer.queueCount+ "and checkin time is "+newCustomer.checkinTime
        })
    
               }) 
    })
}
})
res.end();
})


//Customer queries the API
app.post('/smsInteraction',(req,res)=>{

let from=req.body.From;  //From the customer
let to=req.body.To;    //Twilio number
let body=req.body.Body;  //Queries

if(body==='STATUS' || body==='status' || body==='Status')
{ //Send status to the user
   
    Customer.find({phoneNumberFrom:from,$or:[{status: "waiting"},{status:"In progress"}]},(err,data)=>{

        if(data.length !==0)
        {
            if(data[0].status=="waiting")
            {
                            //Send sms response to user's query
                var now=moment().add(0, 'minutes').format('hh:mm A');
                var checkinTimeDb=data[0].checkinTime;
             //   console.log("The sms time is"+now);
               // console.log("The db time is "+checkinTimeDb)
        var value= moment.utc(moment(checkinTimeDb,"hh:mm A").diff(moment(now,"hh:mm A"))).format("HH:mm:ss")
            
         console.log("Your status is: "+data[0].status+" and your waiting time is: "+value);

    client.messages.create({
    to:`${from}`,
    from:`${to}`,
    body:"Your status is: "+data[0].status+" and your waiting time is: "+value
})         
          } 
          if(data[0].status=="In progress")
          {
            client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:"Your status is: "+data[0].status+" and you may checkin."
            }) 
          }    
         }
        else{
            
            console.log('You have not been registered or registration has been cancelled');
 
           client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:'Sorry you have not been registered or registration has been cancelled'
            }) 
        }
    })
}

if(body==='Extend' || body==='EXTEND' || body==='extend')
{
    Customer.find({phoneNumberFrom:from,$or:[{status: "waiting"},{status:"In progress"}],extension:"FALSE"},(err,data)=>{
       
        if(data.length!==0)
        {
            data[0].extension="TRUE";
            var time=moment(data[0].checkinTime,'hh:mm A')
            time.add(10,'m')
            data[0].checkinTime=time.format("hh:mm A")

         data[0].save(()=>{
            console.log("new checkin time is "+time.format("hh:mm A"))
            console.log("Wait time Extension Accepted"); 
          client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:"Wait time Extension Accepted"
            })   
        }); 
             
        }
  else{
 console.log("Wait Time Extension Rejected as you have already requested it once.Please go and checkin"); 

    client.messages.create({
    to:`${from}`,
    from:`${to}`,
    body:"Wait Time Extension Rejected as you may have not registered or already requested for wait time"
    }) 
  }
    })

}
res.end();
})



//TABLE LOGIC BEGINS HERE
//This API is called by Admin
app.post('/initializeTables',(req,res)=>{

  j=3;  //j=2
    Tables.find({entity: req.body.Body},(err,data)=>{
    if(data.length==0){
        for(i=0;i<4;i++)  //i<9
{
    let newTable =new Tables();
    newTable.entity="Table";
    newTable.tableNo=i.toString();
  // if(i==3 || i==6)   {j++;}
    if(i==2){j++;}
  newTable.numberOfSeats=j.toString();
    newTable.availability='True';
    newTable.phoneNumber="";
    newTable.save();
}
console.log('Tables have been initialized');

}
else{
for(i=0;i<4;i++)  //i<9
{
data[i].tableNo=i;
//if(i==3 || i==6)  { j++;}
if(i==2) {j++;}
data[i].numberOfSeats=j.toString();
data[i].availability='True';
data[i].phoneNumber="";
data[i].save();
}
console.log('Tables have been Reinitialized');

}
    })
    res.end();
})



//Clear a specific table and complete the customer transaction and add new customer
//This is called by the admin
    app.post('/initializeSpecificTable',(req,res)=>{
    Tables.find({tableNo: req.body.Body},(err,tableData)=>{

    Customer.find ({phoneNumberFrom:tableData[0].phoneNumber,status:"In progress"},(err,data)=>{
    data[0].status="Completed";
    data[0].queueCount="NA";
    data[0].save(()=>{
    console.log("Customer status is now completed for: "+data[0].customerName);
    client.messages.create({
        to:`${data[0].phoneNumberFrom}`,
        from:`${data[0].phoneNumberTo}`,
        body:"Thank you and have a nice day "+data[0].customerName
    })   
});
})
    console.log("Table no "+tableData[0].tableNo+" have been cleared for next customer");

    //THIS IS FOR NORMAL CASE WHEN CUSTOMER HAS ARRIVED
Customer.find({peopleCount:{$lte:tableData[0].numberOfSeats},status:"waiting"},(err,data)=>
{
 
            if(data.length!==0){
            
                data[0].status="In progress";
                data[0].tableNo=req.body.Body;

                data[0].queueCount="NA";
                data[0].save(()=>{
              console.log("The customer assigned to cleared table is "+data[0].customerName) 
  
              //SEND SMS TO CUSTOMER'S REGISTERED NUMBER HERE 
           client.messages.create({
            to:`${data[0].phoneNumberFrom}`,
            from:`${data[0].phoneNumberTo}`,
            body:"Hi "+data[0].customerName+" you have been assigned table no "+tableData[0].tableNo
        }) 

console.log("Hi "+data[0].customerName+" you have been assigned table no "+tableData[0].tableNo)
      
                    //REDUCE QUEUE COUNT FOR REMAINING CUSTOMERS IN QUEUE
            Customer.find({status:"waiting"},(err,data)=>{
                for(i=0;i<data.length;i++)
                  {
                 data[i].queueCount=data[i].queueCount-1;
             //    data[i].waitingTime=(parseInt(data[i].waitingTime,10)-30).toString();
                 data[i].save(()=>{
            console.log("queue count reduced by 1 ")
        
        });
        
                  }
                  })       
                    
                })
        tableData[0].availability="False";
        tableData[0].phoneNumber=data[0].phoneNumberFrom;
        tableData[0].save();
            }
    else{
        tableData[0].availability='True';
        tableData[0].phoneNumber="";
        tableData[0].save(()=>{
            console.log("No customer assigned to table ");

        });
    }
        }).sort({"queueCount": 1 }).limit(1)

    })
    res.end();
    
})


//THIS API IS USED BY ADMIN
app.post('/displayCustomers',(req,res)=>{
let status=req.body.Body;
if(status=="waiting"){
Customer.find({status:"waiting"},(err,data)=>{
    res.json({ data });
    res.end();
})
}
if(status=="In progress"){
    Customer.find({status:"In progress"},(err,data)=>{
        res.json({ data });
        res.end();
    })
}
if(status=="Completed"){
    Customer.find({status:"Completed"},(err,data)=>{
        res.json({ data });
        res.end();
    })
} 
})



//FOR TESTING PURPOSE  ONLY
app.post('/smsTesting',(req,res)=>{
    Customer.find({phoneNumberFrom:req.body.From},(err,data)=>{
        console.log(data[1])
    })
    res.end();
})

app.post('/testFind',(req,res)=>{
    Customer.find({peopleCount:{$lte:req.body.Body}},(err,data)=>{
console.log(data);
    })    
res.end();
})

//finding the minimum of customers
app.post('/testFindMinimum',(req,res)=>{
    Customer.find({waitingTime:"No waiting"},(err,data)=>{
        console.log(data)
    }).sort({ "peopleCount": 1 }).limit(1)
    
    res.end();
})

app.post('/testTime',(req,res)=>{
  
    var now1 = moment().add(0, 'minutes').format('hh:mm A'); //to get current time
    console.log(now1);
    
    var now  = "03:02 PM";
    var then = "02:20 AM";

   //var value= moment.utc(moment(now,"hh:mm A").diff(moment(then,"hh:mm A"))).format("HH:mm:ss")
   var value= moment.utc(moment("10:50 AM","hh:mm A").diff(moment(now1,"hh:mm A"))).format("HH:mm:ss")

   console.log("Difference is "+value)

   var time=moment(now,'hh:mm A')
   time.add(10,'m')
   console.log("new value of time is "+time.format("hh:mm A"))
   res.end();
})