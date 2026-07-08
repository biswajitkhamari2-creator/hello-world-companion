package com.biswajit.geniusai;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.io.OutputStream;

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
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the JS interface for downloads
        handler.post(new Runnable() {
            @Override
            public void run() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().addJavascriptInterface(new WebAppInterface(MainActivity.this), "AndroidInterface");
                } else {
                    handler.postDelayed(this, 100);
                }
            }
        });
    }

    @Override
    public void onStart() {
        super.onStart();
        handler.post(hideBadgeRunnable);
    }

    @Override
    public void onStop() {
        super.onStop();
        handler.removeCallbacks(hideBadgeRunnable);
    }

    public static class WebAppInterface {
        private final Context mContext;

        public WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void downloadFile(String base64Data, String fileName, String mimeType) {
            try {
                // If it starts with data: URI header, strip it
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                final byte[] fileBytes = Base64.decode(base64Data, Base64.DEFAULT);
                
                ContentResolver resolver = mContext.getContentResolver();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                
                Uri uri = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues);
                } else {
                    java.io.File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    java.io.File file = new java.io.File(downloadsDir, fileName);
                    uri = Uri.fromFile(file);
                }
                
                if (uri != null) {
                    OutputStream outputStream;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        outputStream = resolver.openOutputStream(uri);
                    } else {
                        outputStream = new java.io.FileOutputStream(new java.io.File(uri.getPath()));
                    }
                    if (outputStream != null) {
                        outputStream.write(fileBytes);
                        outputStream.close();
                        
                        // Show success message on UI thread
                        new Handler(Looper.getMainLooper()).post(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(mContext, "PDF saved to Downloads folder", Toast.LENGTH_LONG).show();
                            }
                        });
                    }
                }
            } catch (final Exception e) {
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(mContext, "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
            }
        }
    }
}
