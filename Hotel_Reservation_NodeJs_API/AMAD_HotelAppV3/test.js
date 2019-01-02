
function test(){
    var txt=document.getElementById("getPhoneNo").value;   
    ajax: ({
        "type":"POST",
        "url":"http://localhost:7000/",
        data:{
            "mobileNo":txt
        }
    
         });
}
