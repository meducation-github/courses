# Supabase Edge Function Deployment Guide

## Prerequisites

1. Supabase CLI installed
2. OpenAI API key
3. Supabase project set up

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Create the Edge Function

```bash
supabase functions new create-description
```

### 5. Copy the Edge Function Code

Replace the contents of `supabase/functions/create-description/index.ts` with the code from `src/pages/courses/create-description.js`

### 6. Set Environment Variables

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 7. Deploy the Function

```bash
supabase functions deploy create-description
```

### 8. Update the API URL in the React Component

The React component now uses the Supabase client's `functions.invoke()` method, so no manual URL updates are needed.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o access
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for database updates)

## Function Features

- ✅ CORS headers for localhost development
- ✅ Grade-appropriate content generation
- ✅ Context-aware descriptions
- ✅ Markdown formatting
- ✅ Direct database updates
- ✅ Error handling
- ✅ Input validation

## How It Works

1. **Creation Flow**:

   - Item is created in database with empty `main_description`
   - Edge Function generates AI description
   - Database is updated directly with the generated content
   - Frontend reloads data to show updated content

2. **Edit Flow**:
   - Basic form data is saved first
   - If AI regeneration is requested, Edge Function updates the `main_description`
   - Frontend reloads data to show updated content

## Testing the Function

You can test the function using curl:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-description' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "unit",
    "title": "Introduction to Algebra",
    "short_description": "Basic algebraic concepts",
    "grade": "9",
    "item_id": "123",
    "context": {
      "courseTitle": "Mathematics",
      "courseDescription": "Advanced mathematics course"
    }
  }'
```

## Troubleshooting

1. **CORS Issues**: Make sure the function is deployed and the URL is correct
2. **API Key Issues**: Verify your OpenAI API key is set correctly
3. **Function Not Found**: Ensure the function is deployed successfully
4. **Database Update Issues**: Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
5. **Rate Limiting**: OpenAI has rate limits, consider implementing retry logic

## Security Notes

- The function includes CORS headers for development
- Consider restricting CORS origins in production
- API keys are stored securely in Supabase secrets
- Service role key is used for database updates (has full access)
- Input validation is implemented to prevent injection attacks
