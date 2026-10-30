package site.orbita.client;
import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ScrollView;
public final class StartActivity extends Activity {
 private TextView status;
 @Override public void onCreate(Bundle state){super.onCreate(state);
  if(getPreferences(0).getBoolean("started",false)){open();return;}
  LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);body.setPadding(28,40,28,30);body.setBackgroundColor(Color.rgb(19,25,31));
  body.setOnApplyWindowInsetsListener((v,insets)->{body.setPadding(28,40+insets.getSystemWindowInsetTop(),28,30+insets.getSystemWindowInsetBottom());return insets;});
  ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.addView(body);setContentView(scroll);
  text(body,"Орбита",30);text(body,"Друзья, чаты и голос",20);
  text(body,"Клиент использует поддерживающий TWA браузер, например актуальный Chrome. Войдите в аккаунт и включите push: Настройки → Уведомления → Включить на этом устройстве.",16);
  status=text(body,"",15);
  button(body,"Разрешить уведомления",v->{if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},1);else settings();});
  button(body,"Открыть Орбиту",v->{getPreferences(0).edit().putBoolean("started",true).apply();open();});
  button(body,"Настройки уведомлений Android",v->settings());
  text(body,"Уведомления доставляет браузер через службу push даже при закрытом окне. Принудительная остановка браузера, запрет уведомлений или отсутствие сети могут блокировать доставку. Это тестовая сборка; работу голоса с выключенным экраном нужно проверить на вашем телефоне.",14);
 }
 private TextView text(LinearLayout body,String value,int size){TextView t=new TextView(this);t.setText(value);t.setTextColor(Color.rgb(220,232,224));t.setTextSize(size);t.setPadding(0,8,0,18);body.addView(t);return t;}
 private void button(LinearLayout body,String title,View.OnClickListener click){Button b=new Button(this);b.setText(title);b.setAllCaps(false);b.setOnClickListener(click);body.addView(b,new LinearLayout.LayoutParams(-1,-2));}
 @Override public void onResume(){super.onResume();if(status!=null)status.setText(Build.VERSION.SDK_INT<33||checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED?"Разрешение Android: выдано. Теперь включите push внутри Орбиты.":"Разрешение Android: ещё не выдано.");}
 private void settings(){startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName()));}
 private void open(){startActivity(new Intent(this,OrbitaActivity.class));finish();}
}
