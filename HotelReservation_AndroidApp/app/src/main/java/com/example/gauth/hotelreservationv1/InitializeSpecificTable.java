package com.example.gauth.hotelreservationv1;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;

import java.util.HashMap;
import java.util.Map;

public class InitializeSpecificTable extends AppCompatActivity {

    EditText tableNo;
    Button initializeSpecificTableSubmit;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_initialize_specific_table);
    tableNo =(EditText)findViewById(R.id.tableNo);
    initializeSpecificTableSubmit =(Button)findViewById(R.id.initializeSpecificTableSubmit);

    initializeSpecificTableSubmit.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
initializeSpecificTable();
        }
    });
    }

    public void initializeSpecificTable()
    {
        StringRequest stringRequest = new StringRequest(Request.Method.POST,
                Constants.commonUrl+Constants.clearSpecificTable,
                new Response.Listener<String>() {

                    @Override
                    public void onResponse(String response) {
                        try {
                            Toast.makeText(getApplicationContext(),"Table "+tableNo.getText().toString()+" cleared",Toast.LENGTH_SHORT).show();
                        }
                        catch (Exception e) {
                            Toast.makeText(getApplicationContext(),"Response error: "+response,Toast.LENGTH_SHORT).show();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Toast.makeText(getBaseContext(),"Volley error: "+error.toString(),Toast.LENGTH_SHORT).show();
                    }
                })
        {
            @Override
            protected Map<String, String> getParams() throws AuthFailureError {
                Map<String,String> params =new HashMap<>();
                params.put("Body",tableNo.getText().toString());

                return  params;
            }
        };
        HandleApiRequests.getInstance(this).addToRequestQueue(stringRequest);
    }
}
