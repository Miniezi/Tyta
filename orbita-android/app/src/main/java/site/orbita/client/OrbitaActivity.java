package site.orbita.client;
import android.net.Uri;
import com.google.androidbrowserhelper.trusted.LauncherActivity;
/** No JavaScript bridge or WebView. Browser owns WebRTC and background Web Push. */
public final class OrbitaActivity extends LauncherActivity {
 @Override protected Uri getLaunchingUrl() {
  Uri candidate=getIntent().getData();
  if(candidate!=null && "https".equals(candidate.getScheme()) && "orbita-chat.misamisani112.chatgpt.site".equals(candidate.getHost()) && candidate.getUserInfo()==null && candidate.getPort()==-1) return candidate;
  return Uri.parse("https://orbita-chat.misamisani112.chatgpt.site/");
 }
}
