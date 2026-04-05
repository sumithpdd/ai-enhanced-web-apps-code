export async function processIncomingMessages(req) {
  const { messages, data } = await req.json();

  if (!Array.isArray(messages)) {
    throw new Error('Invalid request: `messages` must be an array.');
  }

  if (!data?.imageUrl) return messages;

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    throw new Error('Invalid request: cannot attach an image with no messages.');
  }

  const content = [];

  if (typeof lastMessage.content === 'string') {
    content.push({ type: 'text', text: lastMessage.content });
  } else if (Array.isArray(lastMessage.content)) {
    content.push(...lastMessage.content);
  }

  const image =
    typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http')
      ? new URL(data.imageUrl)
      : data.imageUrl;

  const imagePart = { type: 'image', image };
  if (data.imageMimeType) {
    imagePart.mimeType = data.imageMimeType;
  }
  content.push(imagePart);

  return [
    ...messages.slice(0, -1),
    {
      role: lastMessage.role || 'user',
      content,
    },
  ];
}
