package site.orbita.client;

import android.app.*;
import android.content.*;
import android.os.*;
import android.widget.RemoteViews;
import android.widget.Toast;
import androidx.browser.customtabs.CustomTabsSession;
import org.json.JSONObject;

/** Notification commands are delivered to the validated TWA port and acknowledged by the page. */
public final class CallPanel extends BroadcastReceiver {
 private static final int ID=7001;
 private static final String CHANNEL="orbita_voice_controls";
 static boolean ready;
 private static Context context;
 private static CustomTabsSession session;
 private static String callId="",pending="";
 private static boolean muted,deaf;
 private static long sequence;
 private static final Handler handler=new Handler(Looper.getMainLooper());
 private static final Runnable timeout=()->{pending="";if(context!=null){Toast.makeText(context,"Нет ответа от звонка. Откройте Орбиту.",Toast.LENGTH_LONG).show();show();}};
 static void connect(Context c,CustomTabsSession s){context=c.getApplicationContext();session=s;ready=false;}
 static void disconnect(){if(context!=null)((NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID);session=null;ready=false;callId="";pending="";handler.removeCallbacksAndMessages(null);}
 static void receive(String text){try{
  if(text.length()>4096)return;JSONObject j=new JSONObject(text);if(!"call-state".equals(j.optString("type")))return;
  ready=true;String id=j.optString("session");if(id.length()>200)return;
  if(!j.optBoolean("active")||id.isEmpty()){if(context!=null)((NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID);callId="";pending="";handler.removeCallbacks(timeout);return;}
  callId=id;muted=j.optBoolean("muted");deaf=j.optBoolean("deaf");
  if(pending.equals(j.optString("ack"))){pending="";handler.removeCallbacks(timeout);}
  show();
 }catch(Exception ignored){}}
 private static PendingIntent action(String name,int code){Intent i=new Intent(context,CallPanel.class).setAction(name).putExtra("session",callId);return PendingIntent.getBroadcast(context,code,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
 private static void show(){if(context==null||callId.isEmpty())return;
  NotificationManager nm=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
  nm.createNotificationChannel(new NotificationChannel(CHANNEL,"Управление голосовым звонком",NotificationManager.IMPORTANCE_LOW));
  RemoteViews view=new RemoteViews(context.getPackageName(),R.layout.call_notification);
  view.setTextViewText(R.id.call_status,pending.isEmpty()?(muted?"Микрофон выкл.":"Микрофон вкл.")+" · "+(deaf?"Звук выкл.":"Звук вкл."):"Применяем…");
  view.setTextViewText(R.id.call_mic,muted?"Вкл. микро":"Мут");view.setTextViewText(R.id.call_sound,deaf?"Вкл. звук":"Без звука");view.setTextViewText(R.id.call_both,muted&&deaf?"Вкл. оба":"Выкл. оба");
  view.setOnClickPendingIntent(R.id.call_mic,action("mic",1));view.setOnClickPendingIntent(R.id.call_sound,action("sound",2));view.setOnClickPendingIntent(R.id.call_both,action("both",3));view.setOnClickPendingIntent(R.id.call_leave,action("leave",4));
  Notification n=new Notification.Builder(context,CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("Орбита · голосовой звонок").setOngoing(true).setOnlyAlertOnce(true).setCategory(Notification.CATEGORY_CALL).setVisibility(Notification.VISIBILITY_PRIVATE).setCustomBigContentView(view).setStyle(new Notification.DecoratedCustomViewStyle()).setContentText((muted?"Микрофон выключен":"Микрофон включён")+" · Разверните для управления").build();
  try{nm.notify(ID,n);}catch(SecurityException ignored){}
 }
 @Override public void onReceive(Context c,Intent intent){
  if(session==null||callId.isEmpty()){((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID);Toast.makeText(c,"Откройте Орбиту для восстановления управления",Toast.LENGTH_LONG).show();return;}
  if(!callId.equals(intent.getStringExtra("session"))||!pending.isEmpty())return;
  String action=intent.getAction();if(!"mic".equals(action)&&!"sound".equals(action)&&!"both".equals(action)&&!"leave".equals(action))return;
  try{JSONObject j=new JSONObject();j.put("type","call-command");j.put("session",callId);pending=Long.toString(++sequence);j.put("id",pending);j.put("action",action);j.put("muted","both".equals(action)?!(muted&&deaf):!muted);j.put("deaf","both".equals(action)?!(muted&&deaf):!deaf);
   int result=session.postMessage(j.toString(),null);if(result<0){pending="";Toast.makeText(c,"Нет связи с Орбитой. Откройте приложение.",Toast.LENGTH_LONG).show();}else handler.postDelayed(timeout,5000);show();
  }catch(Exception e){pending="";show();}
 }
}
