package com.geofence.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.JobIntentService;
import android.util.Log;

import com.geofence.services.GeofenceEventJobIntentService;

import static com.geofence.GeofenceModule.TAG;

public class GeofenceEventBroadcastReceiver extends BroadcastReceiver {
  public GeofenceEventBroadcastReceiver() {
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.i(TAG, "Broadcasting geofence event");
    JobIntentService.enqueueWork(context, GeofenceEventJobIntentService.class, 0, intent);
  }
}
