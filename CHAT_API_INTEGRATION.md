# Chat Engine API Integration

This document explains how the chat engine API is integrated with the KAM Approved UI application.

## Overview

The application is now connected to a chat engine API webhook that processes incoming messages and returns responses. The integration is implemented in the AI Costing Chat component.

## API Endpoint

**Endpoint:** `http://65.2.64.18:89/api/webhook/handler`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

## Request Format

```json
{
  "type": "incoming",
  "data": {
    "phone": "626323361",
    "message": "Your message here",
    "wid": "919131299381",
    "attachment": ""
  }
}
```

### Parameters

- `type`: Message type (always "incoming" for user messages)
- `data.phone`: Phone number of the sender
- `data.message`: The actual message text
- `data.wid`: WhatsApp ID
- `data.attachment`: Optional attachment URL (empty string if no attachment)

## Files Created

### 1. `/lib/chat-api.ts`
Main API integration file containing:
- `sendMessage()` - Sends messages to the chat engine
- `sendMessageWithAttachment()` - Sends messages with attachments
- Type definitions for API requests and responses

### 2. `/lib/chat-config.ts`
Configuration file containing:
- API endpoint configuration
- Default values for phone and WID
- Environment variable support
- Helper functions to retrieve configuration

### 3. `.env.example`
Example environment variables file for easy configuration

## Configuration

### Using Default Values

The application uses these default values (configured in `/lib/chat-config.ts`):
- Phone: `626323361`
- WID: `919131299381`
- Endpoint: `http://65.2.64.18:89/api/webhook/handler`

### Using Environment Variables

To customize the configuration:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local`:
   ```env
   NEXT_PUBLIC_CHAT_API_ENDPOINT=http://your-api-endpoint.com/api/webhook/handler
   NEXT_PUBLIC_CHAT_API_PHONE=your-phone-number
   NEXT_PUBLIC_CHAT_API_WID=your-whatsapp-id
   ```

3. Restart the development server to apply changes

## How It Works

1. **User Input**: User types a message in the chat interface
2. **Send Message**: The `handleSendMessage()` function in `/components/ai-costing-chat.tsx` is triggered
3. **API Call**: The message is sent to the webhook using `sendMessage()` from `/lib/chat-api.ts`
4. **Response Handling**:
   - If successful, the API response is displayed as an AI message
   - If failed, an error message is shown to the user
5. **UI Update**: The chat interface updates with the new messages

## Code Example

### Basic Usage

```typescript
import { sendMessage } from '@/lib/chat-api'

// Send a message with default values
const response = await sendMessage('Hello from the chat!')

if (response.success) {
  console.log('Message sent:', response.data)
} else {
  console.error('Error:', response.error)
}
```

### Custom Phone/WID

```typescript
import { sendMessage } from '@/lib/chat-api'

const response = await sendMessage(
  'Hello!',
  'custom-phone-number',
  'custom-wid'
)
```

### With Attachment

```typescript
import { sendMessageWithAttachment } from '@/lib/chat-api'

const response = await sendMessageWithAttachment(
  'Check out this image',
  'https://example.com/image.jpg'
)
```

## Modified Files

### `/components/ai-costing-chat.tsx`
Updated the `handleSendMessage()` function to:
- Call the actual API instead of using mock responses
- Handle API responses and errors
- Display appropriate messages based on API results

Key changes:
- Import `sendMessage` from the chat API utility
- Modified message sending logic to call the real API
- Added error handling for failed API calls
- Display API response or error messages

## Testing

### Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the chat page: `http://localhost:3000/chat/new`

3. Send a test message and verify:
   - Message is sent to the API
   - Response is received and displayed
   - Errors are handled gracefully

### Test with Postman

You can test the API directly using Postman:

**Request:**
```
POST http://65.2.64.18:89/api/webhook/handler
Content-Type: application/json

{
  "type": "incoming",
  "data": {
    "phone": "626323361",
    "message": "Hello from Postman test!",
    "wid": "919131299381",
    "attachment": ""
  }
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Catches fetch failures and connection issues
2. **HTTP Errors**: Handles non-200 status codes
3. **Timeout**: Requests will timeout after 30 seconds (configurable)
4. **User Feedback**: All errors are displayed to the user in the chat interface

## API Response Format

The chat API is expected to return a response in this format:

```json
{
  "message": "AI response text here",
  // ... other fields
}
```

The `message` field from the response is displayed in the chat. If no message field is provided, a default success message is shown.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the API server has CORS enabled for your domain.

### Connection Refused
- Verify the API endpoint is correct
- Check that the API server is running
- Ensure you have network access to the API server

### No Response
- Check the API response format matches expectations
- Verify the API is returning a proper JSON response
- Check browser console for detailed error messages

## Next Steps

Potential enhancements:
1. Add support for file attachments
2. Implement message history persistence
3. Add typing indicators based on API events
4. Support for rich media messages
5. Implement retry logic for failed requests
6. Add message delivery status indicators

## Support

For issues or questions about the chat API integration, please contact the development team or refer to the API documentation.
