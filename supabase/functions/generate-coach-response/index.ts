import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  replicaId?: string;
  userMessage: string;
  coachPrompt: string;
  conversationId?: string;
  sessionType: 'text' | 'video';
  conversationHistory?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { replicaId, userMessage, coachPrompt, sessionType, conversationHistory = [] }: RequestBody = await req.json();

    if (!userMessage || !sessionType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userMessage and sessionType" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (sessionType === 'text') {
      const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!anthropicApiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured");
      }

      const messages = [
        ...conversationHistory,
        { role: "user", content: userMessage }
      ];

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          system: coachPrompt,
          messages: messages,
        }),
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error("Claude API Error:", errorText);
        throw new Error(`Claude API Error: ${errorText}`);
      }

      const claudeData = await claudeResponse.json();
      const response = claudeData.content[0].text;

      return new Response(
        JSON.stringify({ response }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (sessionType === 'video') {
      const tavusApiKey = Deno.env.get("TAVUS_API_KEY");
      if (!tavusApiKey) {
        throw new Error("TAVUS_API_KEY not configured");
      }

      if (!replicaId) {
        return new Response(
          JSON.stringify({ error: "replicaId is required for video sessions" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const requestBody = {
        replica_id: replicaId,
        conversation_name: `Coaching Session ${Date.now()}`,
        conversational_context: coachPrompt,
        custom_greeting: "Hello! I'm here to help you with your coaching needs. How can I support you today?",
        properties: {
          max_call_duration: 3600,
          participant_left_timeout: 30,
          enable_recording: false,
        },
      };

      console.log("Creating Tavus conversation with:", { replica_id: replicaId });

      const conversationResponse = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": tavusApiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!conversationResponse.ok) {
        const errorText = await conversationResponse.text();
        console.error("Tavus API Error:", {
          status: conversationResponse.status,
          statusText: conversationResponse.statusText,
          error: errorText,
        });
        throw new Error(`Tavus API Error (${conversationResponse.status}): ${errorText}`);
      }

      const conversationData = await conversationResponse.json();

      return new Response(
        JSON.stringify({
          conversationUrl: conversationData.conversation_url,
          conversationId: conversationData.conversation_id,
          message: "Video conversation ready"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid session type" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-coach-response:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
