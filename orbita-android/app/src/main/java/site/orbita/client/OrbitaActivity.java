package site.orbita.client;

import android.app.*;
import android.content.*;
import android.net.Uri;
import android.os.*;
import android.widget.Toast;
import androidx.browser.customtabs.*;
import androidx.browser.trusted.*;
import com.google.androidbrowserhelper.trusted.SharedPreferencesTokenStore;
import org.json.JSONObject;

/** One validated browser session; no WebView, cookies or microphone access in the host. */
public final class OrbitaActivity extends Activity {
 static final Uri ORIGIN=Uri.parse("https://orbita-chat.misamisani112.chatgpt.site");
 private CustomTabsSession session;
 private boolean bound,validated,navigated,launched,away;
 private final Handler main=new Handler(Looper.getMainLooper());
 private final CustomTabsCallback callback=new CustomTabsCallback(){
  @Override public void onRelationshipValidationResult(int relation,Uri origin,boolean result,Bundle extras){
   if(relation==CustomTabsService.RELATION_USE_AS_ORIGIN&&ORIGIN.equals(origin)){validated=result;channel();}
  }
  @Override public void onNavigationEvent(int event,Bundle extras){
   if(event==NAVIGATION_STARTED){navigated=false;CallPanel.disconnect();}
   if(event==NAVIGATION_FINISHED){navigated=true;channel();}
  }
  @Override public void onMessageChannelReady(Bundle extras){if(validated&&session!=null){CallPanel.connect(OrbitaActivity.this,session);session.postMessage("orbita-call-bridge-v1",null);}}
  @Override public void onPostMessage(String message,Bundle extras){if(validated)main.post(()->CallPanel.receive(message));}
 };
 private void channel(){if(validated&&navigated&&session!=null)session.requestPostMessageChannel(ORIGIN,ORIGIN,new Bundle());}
 private final CustomTabsServiceConnection connection=new CustomTabsServiceConnection(){
  @Override public void onCustomTabsServiceConnected(ComponentName name,CustomTabsClient client){
   client.warmup(0);session=client.newSession(callback);if(session==null){fail();return;}
   session.validateRelationship(CustomTabsService.RELATION_USE_AS_ORIGIN,ORIGIN,null);
   new SharedPreferencesTokenStore(OrbitaActivity.this).store(Token.create(name.getPackageName(),getPackageManager()));
   Uri url=getIntent().getData();if(url==null||!"https".equals(url.getScheme())||!ORIGIN.getHost().equals(url.getHost())||url.getUserInfo()!=null||url.getPort()!=-1)url=Uri.parse(ORIGIN+"/");
   try{launched=true;new TrustedWebActivityIntentBuilder(url).build(session).launchTrustedWebActivity(OrbitaActivity.this);}catch(RuntimeException e){fail();}
  }
  @Override public void onServiceDisconnected(ComponentName name){session=null;CallPanel.disconnect();}
 };
 @Override public void onCreate(Bundle saved){super.onCreate(saved);
  if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)!=android.content.pm.PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS},42);}else launch();
 }
 @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){super.onRequestPermissionsResult(code,permissions,results);if(code==42)launch();}
 private void launch(){String browser=CustomTabsClient.getPackageName(this,null);if(browser==null){fail();return;}bound=CustomTabsClient.bindCustomTabsService(this,browser,connection);if(!bound)fail();}
 private void fail(){Toast.makeText(this,"Не удалось открыть Орбиту. Установите актуальный Chrome.",Toast.LENGTH_LONG).show();finish();}
 @Override protected void onStop(){super.onStop();if(launched)away=true;}
 @Override protected void onResume(){super.onResume();if(away)finish();}
 @Override protected void onDestroy(){CallPanel.disconnect();if(bound)unbindService(connection);main.removeCallbacksAndMessages(null);super.onDestroy();}
}
