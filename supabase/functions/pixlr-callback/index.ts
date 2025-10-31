import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PixlrCallbackPayload {
  image?: string;
  state?: string;
  title?: string;
  type?: string;
  assetId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const assetId = url.searchParams.get("assetId");
    const userId = url.searchParams.get("userId");

    if (req.method === "GET") {
      const imageUrl = url.searchParams.get("image");
      const state = url.searchParams.get("state");
      const type = url.searchParams.get("type");

      if (state === "cancel") {
        return new Response(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Editing Cancelled</title>
            <style>
              body {
                font-family: sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f5f3ff 0%, #fce7f3 50%, #dbeafe 100%);
              }
              .message {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
            </style>
          </head>
          <body>
            <div class="message">
              <h1>Editing Cancelled</h1>
              <p>You can close this window.</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'pixlr-cancel'
                }, window.location.origin);
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
          </html>
          `,
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/html",
            },
          }
        );
      }

      if (imageUrl && type === "image") {
        return new Response(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Processing Image</title>
            <style>
              body {
                font-family: sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f5f3ff 0%, #fce7f3 50%, #dbeafe 100%);
              }
              .message {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .spinner {
                border: 4px solid #f3f4f6;
                border-top: 4px solid #7c3aed;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="message">
              <h1>Saving Your Edits...</h1>
              <div class="spinner"></div>
              <p>Please wait while we process your image.</p>
            </div>
            <script>
              async function processImage() {
                try {
                  const imageUrl = "${imageUrl}";
                  const assetId = "${assetId || ""}";

                  const response = await fetch(imageUrl);
                  const blob = await response.blob();

                  const reader = new FileReader();
                  reader.onloadend = function() {
                    const base64data = reader.result;

                    if (window.opener) {
                      window.opener.postMessage({
                        type: 'pixlr-callback',
                        imageData: base64data,
                        assetId: assetId
                      }, window.location.origin);

                      setTimeout(() => {
                        window.close();
                      }, 500);
                    } else {
                      document.body.innerHTML = '<div class="message"><h1>Success!</h1><p>You can close this window.</p></div>';
                    }
                  };

                  reader.readAsDataURL(blob);

                } catch (error) {
                  console.error('Error processing image:', error);

                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'pixlr-error',
                      message: 'Failed to process edited image'
                    }, window.location.origin);
                  }

                  document.body.innerHTML = '<div class="message"><h1 style="color: #dc2626;">Error</h1><p>Failed to process the image. Please try again.</p></div>';
                }
              }

              processImage();
            </script>
          </body>
          </html>
          `,
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/html",
            },
          }
        );
      }
    }

    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";

      let payload: PixlrCallbackPayload = {};

      if (contentType.includes("application/json")) {
        payload = await req.json();
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        payload = {
          image: formData.get("image") as string,
          state: formData.get("state") as string,
          title: formData.get("title") as string,
          type: formData.get("type") as string,
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Image received",
          data: {
            assetId,
            userId,
            receivedAt: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid request method",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in pixlr-callback:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});