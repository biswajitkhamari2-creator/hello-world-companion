package com.biswajit.geniusai;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable hideBadgeRunnable = new Runnable() {
        @Override
        public void run() {
            if (getBridge() != null) {
                WebView webView = getBridge().getWebView();
                if (webView != null) {
                    // Inject CSS to ensure #lovable-badge is hidden on device WebView
                    String js = "(function() {" +
                                "  var style = document.getElementById('hide-lovable-style');" +
                                "  if (!style) {" +
                                "    style = document.createElement('style');" +
                                "    style.id = 'hide-lovable-style';" +
                                "    style.innerHTML = '#lovable-badge { display: none !important; }';" +
                                "    document.head.appendChild(style);" +
                                "  }" +
                                "  var badge = document.getElementById('lovable-badge');" +
                                "  if (badge) { badge.style.display = 'none'; }" +
                                "})();";
                    webView.evaluateJavascript(js, null);
                }
            }
            handler.postDelayed(this, 300); // Run every 300ms
        }
    };

    @Override
    protected void onStart() {
        super.onStart();
        handler.post(hideBadgeRunnable);
    }

    @Override
    protected void onStop() {
        super.onStop();
        handler.removeCallbacks(hideBadgeRunnable);
    }
}
