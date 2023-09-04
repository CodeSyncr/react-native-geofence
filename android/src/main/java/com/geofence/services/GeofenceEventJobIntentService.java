package com.geofence.services;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.app.JobIntentService;
import android.util.Log;

import com.geofence.GeofenceModule;
import com.geofence.errors.GeofenceErrorMessages;
import com.geofence.receivers.GeofenceEventBroadcastReceiver;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;
import com.facebook.react.HeadlessJsTaskService;

import java.util.ArrayList;

import static com.geofence.GeofenceModule.TAG;

public class GeofenceEventJobIntentService extends JobIntentService {
  public static final String ON_ENTER = "onEnter";
  public static final String ON_EXIT = "onExit";

  public GeofenceEventJobIntentService() {
    super();
  }

  @Override
  protected void onHandleWork(@NonNull Intent intent) {
    Log.i(TAG, "Handling geofencing event");
    GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

    Log.i(TAG, "Geofence transition: " + geofencingEvent.getGeofenceTransition());
    if (geofencingEvent.hasError()) {
      Log.e(TAG, "Error in handling geofence " + GeofenceErrorMessages.getErrorString(geofencingEvent.getErrorCode()));
      return;
    }
    switch (geofencingEvent.getGeofenceTransition()) {
      case Geofence.GEOFENCE_TRANSITION_ENTER:
        Log.i(TAG, "Enter geofence event detected. Sending event.");
        final ArrayList<String> enteredGeofences = new ArrayList<>();
        for (Geofence geofence : geofencingEvent.getTriggeringGeofences()) {
          enteredGeofences.add(geofence.getRequestId());
        }
        sendEvent(this.getApplicationContext(), ON_ENTER, enteredGeofences);
        break;
      case Geofence.GEOFENCE_TRANSITION_EXIT:
        Log.i(TAG, "Exit geofence event detected. Sending event.");
        final ArrayList<String> exitingGeofences = new ArrayList<>();
        for (Geofence geofence : geofencingEvent.getTriggeringGeofences()) {
          exitingGeofences.add(geofence.getRequestId());
        }
        sendEvent(this.getApplicationContext(), ON_EXIT, exitingGeofences);
        break;
    }
  }

  private void sendEvent(Context context, String event, ArrayList<String> params) {
    final Intent intent = new Intent(GeofenceModule.GEOFENCE_DATA_TO_EMIT);
    intent.putExtra("event", event);
    intent.putExtra("params", params);

    Bundle bundle = new Bundle();
    bundle.putString("event", event);
    bundle.putStringArrayList("ids", intent.getStringArrayListExtra("params"));

    Intent headlessBoundaryIntent = new Intent(context, GeofenceEventJobIntentService.class);
    headlessBoundaryIntent.putExtras(bundle);

    context.startService(headlessBoundaryIntent);
    HeadlessJsTaskService.acquireWakeLockNow(context);
  }
}
