import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, title, short_description, grade, context, item_id } =
      await req.json();

    // Validate required fields
    if (!type || !title || !grade || !item_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: type, title, grade, item_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build context string based on type
    let contextString = `Grade Level: ${grade}\n`;

    if (context) {
      if (type === "unit" && context.courseTitle) {
        contextString += `Course: ${context.courseTitle}\n`;
        if (context.courseDescription) {
          contextString += `Course Description: ${context.courseDescription}\n`;
        }
      } else if (type === "topic" && context.unitTitle) {
        contextString += `Unit: ${context.unitTitle}\n`;
        if (context.unitDescription) {
          contextString += `Unit Description: ${context.unitDescription}\n`;
        }
      } else if (
        type === "subtopic" &&
        context.topicTitle &&
        context.unitTitle
      ) {
        contextString += `Unit: ${context.unitTitle}\n`;
        contextString += `Topic: ${context.topicTitle}\n`;
        if (context.topicDescription) {
          contextString += `Topic Description: ${context.topicDescription}\n`;
        }
      }
    }

    // Build the prompt based on type and grade level
    const gradeLevel = parseInt(grade);
    const isElementary = gradeLevel <= 5;
    const isMiddle = gradeLevel >= 6 && gradeLevel <= 8;
    const isHigh = gradeLevel >= 9;

    let complexityLevel = "";
    if (isElementary) {
      complexityLevel =
        "Use very simple language suitable for elementary students. Use lots of emojis and make it fun and engaging.";
    } else if (isMiddle) {
      complexityLevel =
        "Use clear, accessible language suitable for middle school students. Include some emojis to keep it engaging.";
    } else {
      complexityLevel =
        "Use clear, academic language suitable for high school students. Use emojis sparingly but appropriately.";
    }

    const prompt = `You are an expert educational content creator. Create a comprehensive main description for a ${type} titled "${title}".

Context Information:
${contextString}

Requirements:
1. ${complexityLevel}
2. Write the entire response in Markdown format
3. Start with a simple overview (2-3 sentences)
4. Then provide a detailed explanation based on the context provided
5. Use relevant emojis throughout the content
6. End with a nice summary section
7. Make the content engaging and educational
8. Keep the language appropriate for Grade ${grade} students

${short_description ? `Short Description Provided: ${short_description}` : ""}

Please generate a comprehensive main description in Markdown format:`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "o3-2025-04-16",
        messages: [
          {
            role: "system",
            content:
              "You are an expert educational content creator who writes engaging, grade-appropriate content in Markdown format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate description from OpenAI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const generatedDescription = data.choices[0].message.content;

    // Update the database with the generated description
    let updateError;
    if (type === "unit") {
      const { error } = await supabase
        .from("units")
        .update({ main_description: generatedDescription })
        .eq("id", item_id);
      updateError = error;
    } else if (type === "topic") {
      const { error } = await supabase
        .from("topics")
        .update({ main_description: generatedDescription })
        .eq("id", item_id);
      updateError = error;
    } else if (type === "subtopic") {
      const { error } = await supabase
        .from("subtopics")
        .update({ main_description: generatedDescription })
        .eq("id", item_id);
      updateError = error;
    }

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update database with generated description",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Description generated and updated successfully",
        main_description: generatedDescription,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-description function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
