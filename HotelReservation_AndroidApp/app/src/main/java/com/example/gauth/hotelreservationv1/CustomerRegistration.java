package com.example.gauth.hotelreservationv1;

import android.os.CountDownTimer;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class CustomerRegistration extends AppCompatActivity {
EditText fromNo;
EditText toNo;
EditText customerName;
EditText peopleCount;
Button customerRegistrationSubmit;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_customer_registration);

        fromNo =(EditText)findViewById(R.id.from);
        toNo =(EditText) findViewById(R.id.to);
        customerName =(EditText)findViewById(R.id.name);
        peopleCount=(EditText)findViewById(R.id.peopleCount);
 customerRegistrationSubmit =(Button) findViewById(R.id.customerRegistrationSubmit);


 customerRegistrationSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                registerCustomer();
            }
        });
    }

    public void registerCustomer()
    {
        StringRequest stringRequest = new StringRequest(Request.Method.POST,
                Constants.commonUrl+Constants.customerRegistrationUrl,
                new Response.Listener<String>() {

                    @Override
                    public void onResponse(String response) {
                        try {
                            Toast.makeText(getApplicationContext(),"Customer "+customerName.getText().toString()+" registered",Toast.LENGTH_SHORT).show();
                        }
                        catch (Exception e) {
                            Toast.makeText(getApplicationContext(),"Response error: "+response.toString(),Toast.LENGTH_SHORT).show();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Toast.makeText(getBaseContext(),"Volley error: "+error,Toast.LENGTH_SHORT).show();
                    }
                })
        {
            @Override
            protected Map<String, String> getParams() throws AuthFailureError {
                Map<String,String> params =new HashMap<>();
                params.put("From",fromNo.getText().toString());
                params.put("To",toNo.getText().toString());
                params.put("name",customerName.getText().toString());
                params.put("peopleCount",peopleCount.getText().toString());

                return  params;
            }
        };
        HandleApiRequests.getInstance(this).addToRequestQueue(stringRequest);
    }
}
