import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  conversationId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { conversationId }: RequestBody = await req.json();

    if (!conversationId) {
      throw new Error("Missing conversationId");
    }

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.messages || conversation.messages.length === 0) {
      return new Response(
        JSON.stringify({
          summary:
            "This session just started and doesn't have any messages yet.",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const messages = conversation.messages
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .slice(0, 50);

    const conversationText = messages
      .map((msg: any) => {
        const role = msg.sender_type === "user" ? "User" : "Coach";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const summaryPrompt = `You are a helpful assistant that creates brief, insightful summaries of coaching sessions.

Below is a conversation between a user and their coach. Create a concise summary (2-3 sentences) that captures:
1. The main topic or challenge discussed
2. Key insights or progress made
3. Any action items or next steps

Keep it conversational and encouraging. This will be shown to the user when they start their next session.

Conversation:
${conversationText}

Provide only the summary, no preamble or explanation.`;

    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: summaryPrompt,
            },
          ],
        }),
      }
    );

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude API error:", errorText);
      throw new Error("Failed to generate summary");
    }

    const claudeData = await claudeResponse.json();
    const summary =
      claudeData.content?.[0]?.text || "Unable to generate summary";

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-session-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
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
