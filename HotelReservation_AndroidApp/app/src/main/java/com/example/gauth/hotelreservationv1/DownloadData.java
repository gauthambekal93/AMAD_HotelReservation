package com.example.gauth.hotelreservationv1;

import android.os.CountDownTimer;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

public class DownloadData extends AppCompatActivity {

    ListView listView;

    ArrayAdapter<String> arrayAdapter;
    ArrayList<String> teamValues;
    Button downloadInProgress;
    Button downloadCompleted;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_download_data);
        listView =(ListView) findViewById(R.id.downloadData);
        teamValues =new ArrayList<>();
        arrayAdapter=new ArrayAdapter<String>(this,android.R.layout.simple_list_item_1,teamValues);
        listView.setAdapter(arrayAdapter);
downloadInProgress =(Button)findViewById(R.id.inProgress);
downloadCompleted=(Button)findViewById(R.id.completed);

downloadInProgress.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        downloadData("In progress");
    }
});

downloadCompleted.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        downloadData("Completed");

    }
});
    }

    public void downloadData(final String status)
    {
        teamValues.clear();
        StringRequest stringRequest = new StringRequest(Request.Method.POST,
                Constants.commonUrl+Constants.downloadUrl, new Response.Listener<String>() {

                    @Override
                    public void onResponse(String response) {
                        try {
                            JSONObject jsnobject = new JSONObject(response);
                            JSONArray jsonArray = jsnobject.getJSONArray("data");
                            for (int i = 0; i < jsonArray.length(); i++) {
                                JSONObject subObject = jsonArray.getJSONObject(i);

                                teamValues.add("Customer Name "+subObject.getString("customerName")+"\n"+
                                                "Checkin Time "+subObject.getString("checkinTime")+"\n"+
                                                  "Waiting Time "+subObject.getString("waitingTime")+"\n"+
                                                   "People Count "+subObject.getString("peopleCount")+"\n"+
                                                     "Phone Number "+subObject.getString("phoneNumberFrom")+"\n"+
                                                  "Allocated Table "+subObject.getString("tableNo"));

                                arrayAdapter.notifyDataSetChanged();
                            }
                        }
                        catch (Exception e) {
                            Toast.makeText(getBaseContext(),"Response error: "+response,Toast.LENGTH_SHORT).show();
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
                params.put("Body",status);
                return  params;
            }
        };
        HandleApiRequests.getInstance(this).addToRequestQueue(stringRequest);
    }
}

