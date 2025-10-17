// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating quiz for prompt:", prompt);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert quiz generator that ALWAYS generates exactly 30 questions for every quiz. Do not generate fewer than 30 questions under any circumstances.

            Return a JSON object with EXACTLY this structure containing exactly 30 questions:
            {
              "title": "Quiz Title",
              "description": "Brief description",
              "questions": [
                {
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"],
                  "correctAnswer": 0,
                  "explanation": "Why this answer is correct"
                },
                {...} // EXACTLY 29 more question objects here for a total of 30
              ]
            }

            CRITICAL: You MUST generate exactly 30 questions. No more, no less. Make them thoughtful, educational, and varied in difficulty.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_quiz",
                description: "Generate a quiz with questions",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: {
                            type: "array",
                            items: { type: "string" },
                          },
                          correctAnswer: { type: "number" },
                          explanation: { type: "string" },
                        },
                        required: [
                          "question",
                          "options",
                          "correctAnswer",
                          "explanation",
                        ],
                      },
                    },
                  },
                  required: ["title", "description", "questions"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_quiz" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI request failed: ${response.status}`);
    }

    let data = await response.json();
    console.log("AI Response received");

    let quizData;
    let retryCount = 0;
    const maxRetries = 3;

    // Parse and validate the quiz data
    do {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error("No quiz data generated");
      }

      try {
        quizData = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        throw new Error("Invalid JSON returned from AI");
      }

      // Check if we have exactly 30 questions
      if (
        !quizData.questions ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length !== 30
      ) {
        if (retryCount < maxRetries) {
          console.log(
            `AI generated ${
              quizData.questions?.length || 0
            } questions instead of 30. Retrying... (${
              retryCount + 1
            }/${maxRetries})`
          );

          // Retry by calling the API again with the same prompt
          const retryResponse = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o", // Try with GPT-4o for potentially better completion rates
                messages: [
                  {
                    role: "system",
                    content: `You are an expert quiz generator that ALWAYS generates exactly 30 questions for every quiz. Do not generate fewer than 30 questions under any circumstances.

                    Return a JSON object with EXACTLY this structure containing exactly 30 questions:
                    {
                      "title": "Quiz Title",
                      "description": "Brief description",
                      "questions": [
                        {
                          "question": "Question text",
                          "options": ["A", "B", "C", "D"],
                          "correctAnswer": 0,
                          "explanation": "Why this answer is correct"
                        },
                        {...} // EXACTLY 29 more question objects here for a total of 30
                      ]
                    }

                    CRITICAL: You MUST generate exactly 30 questions. No more, no less. Make them thoughtful, educational, and varied in difficulty.`,
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                tools: [
                  {
                    type: "function",
                    function: {
                      name: "generate_quiz",
                      description: "Generate a quiz with questions",
                      parameters: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          questions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                question: { type: "string" },
                                options: {
                                  type: "array",
                                  items: { type: "string" },
                                },
                                correctAnswer: { type: "number" },
                                explanation: { type: "string" },
                              },
                              required: [
                                "question",
                                "options",
                                "correctAnswer",
                                "explanation",
                              ],
                            },
                          },
                        },
                        required: ["title", "description", "questions"],
                      },
                    },
                  },
                ],
                tool_choice: {
                  type: "function",
                  function: { name: "generate_quiz" },
                },
                temperature: 0.7, // Add some creativity for better completion
              }),
            }
          );

          if (retryResponse.ok) {
            data = await retryResponse.json();
          } else {
            console.error("Retry failed:", retryResponse.status);
          }

          retryCount++;
        } else {
          // If we've exhausted retries, return the best we got
          console.log(
            `Max retries reached. Returning quiz with ${
              quizData.questions?.length || 0
            } questions.`
          );
          break;
        }
      } else {
        break; // Got exactly 30 questions, success!
      }
    } while (retryCount <= maxRetries);

    return new Response(JSON.stringify({ quiz: quizData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
