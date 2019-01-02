package com.example.gauth.hotelreservationv1;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
Button customerRegistration;
Button initializeSpecificTable;
Button initializeTables;
Button downloadData;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
customerRegistration =(Button)findViewById(R.id.customerRegistration);
initializeSpecificTable =(Button)findViewById(R.id.initializeSpecificTable);
initializeTables=(Button)findViewById(R.id.initializeTables);
downloadData =(Button)findViewById(R.id.downloadData);

customerRegistration.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        startActivity(new Intent(getBaseContext(), CustomerRegistration.class));
    }
});

initializeSpecificTable.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        startActivity(new Intent(getBaseContext(), InitializeSpecificTable.class));
    }
});

initializeTables.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        initializeAllTables();
    }
});

downloadData.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        startActivity(new Intent(getBaseContext(), DownloadData.class));
    }
});
    }
    public void initializeAllTables()
    {
        //LOGIC TO CLEAR ALL TABLES GOES HERE...

    }

}
